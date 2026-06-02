import { useEffect, useRef, useState } from 'react'
import { photos, PHOTO_TAGS, type PhotoEntry, type PhotoTag } from '../../photos'
import styles from './styles.module.css'

// What gets written to photos.json — the editor carries the thumbnail URL too,
// but only the persisted fields are written out.
type EditableItem = Pick<PhotoEntry, 'id' | 'name' | 'ratio' | 'tags' | 'thumb'>

// Sort key: a photo's earliest tag in PHOTO_TAGS order; untagged photos sort
// last. Used only to group the list when the page loads.
function tagRank(tags: PhotoTag[]) {
  const i = PHOTO_TAGS.findIndex(({ tag }) => tags.includes(tag))
  return i === -1 ? PHOTO_TAGS.length : i
}

export function Admin() {
  // Group by tag once, when the page loads. The initializer runs a single time,
  // so changing a photo's tags later never re-sorts the list. Array.sort is
  // stable, so photos sharing a tag keep their existing (manifest) order.
  const [items, setItems] = useState<EditableItem[]>(() =>
    photos
      .map(({ id, name, ratio, tags, thumb }) => ({
        id,
        name,
        ratio,
        tags,
        thumb,
      }))
      .sort((a, b) => tagRank(a.tags) - tagRank(b.tags)),
  )
  const [dirty, setDirty] = useState(false)
  const [copied, setCopied] = useState(false)
  const dragIndex = useRef<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

  // Warn before navigating away with unsaved edits — they only persist once the
  // copied photos.json replaces the file in the repo.
  useEffect(() => {
    if (!dirty) return
    function warn(e: BeforeUnloadEvent) {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  function toggleTag(index: number, tag: PhotoTag) {
    setDirty(true)
    setItems((prev) =>
      prev.map((it, i) =>
        i === index
          ? {
              ...it,
              tags: it.tags.includes(tag)
                ? it.tags.filter((t) => t !== tag)
                : [...it.tags, tag],
            }
          : it,
      ),
    )
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= items.length || from === to) return
    setDirty(true)
    setItems((prev) => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  function handleDrop(index: number) {
    if (dragIndex.current !== null) move(dragIndex.current, index)
    dragIndex.current = null
    setDragOver(null)
  }

  async function copyJson() {
    // Only the persisted fields, in the current order — paste this over
    // src/photos.json in the repo.
    const out = items.map(({ id, name, ratio, tags }) => ({
      id,
      name,
      ratio,
      tags,
    }))
    const json = `${JSON.stringify(out, null, 2)}\n`
    try {
      await navigator.clipboard.writeText(json)
      setDirty(false)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API needs a secure context (https/localhost) and permission.
      window.prompt('Copy failed — copy the JSON manually:', json)
    }
  }

  const tagged = items.filter((it) => it.tags.length > 0).length

  return (
    <main className={styles.editor}>
      <header className={styles.toolbar}>
        <div>
          <strong>{items.length}</strong> photos · <strong>{tagged}</strong> tagged
          {dirty && <span className={styles.dirty}> · unsaved changes</span>}
        </div>
        <button type="button" className={styles.download} onClick={copyJson}>
          {copied ? 'Copied!' : 'Copy photos.json'}
        </button>
      </header>

      <p className={styles.hint}>
        Drag a row (or use ↑/↓) to reorder. Toggle tag chips to categorize. Then
        copy the JSON and paste it over <code>src/photos.json</code> in the repo.
      </p>

      <ol className={styles.list}>
        {items.map((item, index) => (
          <li
            key={item.id}
            className={`${styles.row} ${dragOver === index ? styles.rowOver : ''}`}
            draggable
            onDragStart={() => {
              dragIndex.current = index
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(index)
            }}
            onDragLeave={() => setDragOver((cur) => (cur === index ? null : cur))}
            onDrop={() => handleDrop(index)}
            onDragEnd={() => {
              dragIndex.current = null
              setDragOver(null)
            }}
          >
            <span className={styles.handle} aria-hidden="true">
              ⠿
            </span>
            <span className={styles.position}>{index + 1}</span>
            <img className={styles.thumb} src={item.thumb} alt="" loading="lazy" />
            <div className={styles.meta}>
              <div className={styles.name}>{item.name}</div>
              <div className={styles.tags}>
                {PHOTO_TAGS.map(({ tag, label }) => {
                  const on = item.tags.includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={on ? styles.chipOn : styles.chip}
                      aria-pressed={on}
                      onClick={() => toggleTag(index, tag)}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className={styles.moveButtons}>
              <button
                type="button"
                onClick={() => move(index, index - 1)}
                disabled={index === 0}
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, index + 1)}
                disabled={index === items.length - 1}
                aria-label="Move down"
              >
                ↓
              </button>
            </div>
          </li>
        ))}
      </ol>
    </main>
  )
}
