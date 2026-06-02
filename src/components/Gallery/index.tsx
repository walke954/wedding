import { useState } from 'react'
import { Photo } from '../Photo'
import { FullscreenViewer } from '../FullscreenViewer'
import { photos } from '../../photos'
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

export function Gallery() {
  const [fsIndex, setFsIndex] = useState<number | null>(null)

  return (
    <main className={styles.gallery}>
      <div className={styles.background} aria-hidden="true" />
      <div className={styles.title}>
        <h1 className="neonderthaw-regular">Jonathan & Jasper<br/>Wedding Photos</h1>
        <p className={styles.date}>{formatWeddingDate()}</p>
      </div>
      <div className={styles.content}>
        <div className={styles.photoGrid}>
          {photos.map((photo, i) => (
            <Photo
              key={photo.id}
              src={photo.thumb}
              downloadSrc={photo.original}
              name={photo.name}
              alt=""
              onFullscreen={() => setFsIndex(i)}
            />
          ))}
        </div>
      </div>
      {fsIndex !== null && (
        <FullscreenViewer
          photos={photos}
          index={fsIndex}
          onChange={setFsIndex}
          onClose={() => setFsIndex(null)}
        />
      )}
    </main>
  )
}
