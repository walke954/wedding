import { useMemo, useState } from 'react'
import { Photo } from '../Photo'
import { FullscreenViewer } from '../FullscreenViewer'
import { photos, PHOTO_TAGS, type PhotoEntry, type PhotoTag } from '../../photos'
import styles from './styles.module.css'

// The wedding date, formatted with dot separators. The part order follows the
// viewer's locale — month-first for American viewers (05.28.2026), day-first
// elsewhere (28.05.2026).
function formatWeddingDate() {
  const date = new Date(2026, 4, 28)
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: '2-digit',
    year: 'numeric',
  })
    .formatToParts(date)
    .filter((part) => part.type !== 'literal')
    .map((part) => part.value)
    .join('.')
}

// `null` means "All" — show every category section.
type Filter = PhotoTag | null

export function Gallery() {
  const [fsIndex, setFsIndex] = useState<number | null>(null)
  const [filter, setFilter] = useState<Filter>(null)

  // Build the visible sections for the active filter. Each category section
  // keeps the photos in manifest order; a photo with multiple tags appears in
  // each of its sections. `visible` is the flat, in-display-order list the
  // fullscreen viewer navigates, so a cell's `index` maps straight into it.
  const { sections, visible } = useMemo(() => {
    const visible: PhotoEntry[] = []
    const sections = PHOTO_TAGS.filter(
      ({ tag }) => filter === null || filter === tag,
    )
      .map(({ tag, label }) => {
        const start = visible.length
        for (const photo of photos) {
          if (photo.tags.includes(tag)) visible.push(photo)
        }
        return { tag, label, start, count: visible.length - start }
      })
      .filter((section) => section.count > 0)
    return { sections, visible }
  }, [filter])

  return (
    <main className={styles.gallery}>
      <div className={styles.background} aria-hidden="true" />
      <div className={styles.title}>
        <h1 className="neonderthaw-regular">Jonathan & Jasper<br/>Wedding Photos</h1>
        <p className={styles.date}>{formatWeddingDate()}</p>
      </div>
      <div className={styles.content}>
        <div className={styles.filters} role="group" aria-label="Filter photos">
          <button
            type="button"
            className={filter === null ? styles.filterActive : styles.filter}
            aria-pressed={filter === null}
            onClick={() => setFilter(null)}
          >
            All
          </button>
          {PHOTO_TAGS.map(({ tag, label }) => (
            <button
              key={tag}
              type="button"
              className={filter === tag ? styles.filterActive : styles.filter}
              aria-pressed={filter === tag}
              onClick={() => setFilter(tag)}
            >
              {label}
            </button>
          ))}
        </div>

        {sections.length === 0 ? (
          <p className={styles.empty}>No photos in this category yet.</p>
        ) : (
          sections.map((section) => (
            <section key={section.tag} className={styles.section}>
              <h2 className={styles.sectionHeading}>{section.label}</h2>
              <div className={styles.photoGrid}>
                {visible
                  .slice(section.start, section.start + section.count)
                  .map((photo, i) => {
                    const index = section.start + i
                    return (
                      <Photo
                        key={`${photo.id}-${index}`}
                        src={photo.thumb}
                        downloadSrc={photo.original}
                        name={photo.name}
                        ratio={photo.ratio}
                        alt=""
                        onFullscreen={() => setFsIndex(index)}
                      />
                    )
                  })}
              </div>
            </section>
          ))
        )}
      </div>
      {fsIndex !== null && (
        <FullscreenViewer
          photos={visible}
          index={fsIndex}
          onChange={setFsIndex}
          onClose={() => setFsIndex(null)}
        />
      )}
    </main>
  )
}
