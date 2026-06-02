import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon } from '../../icons'
import type { PhotoEntry } from '../../photos'
import styles from './styles.module.css'

type Props = {
  photos: PhotoEntry[]
  index: number
  onChange: (index: number) => void
  onClose: () => void
}

export function FullscreenViewer({ photos, index, onChange, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const total = photos.length
  const photo = photos[index]

  // Show a spinner while each newly-selected image loads. Reset to loading
  // whenever the index changes; the <img> onLoad/onError handlers clear it.
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setLoading(true)
  }, [index])

  useLayoutEffect(() => {
    ref.current?.requestFullscreen().catch(() => {})
  }, [])

  useEffect(() => {
    function handleFsChange() {
      if (!document.fullscreenElement) onClose()
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [onClose])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') navigate(1)
      else if (e.key === 'ArrowLeft') navigate(-1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

  function navigate(delta: number) {
    onChange((index + delta + total) % total)
  }

  return (
    <div ref={ref} className={styles.viewer}>
      {loading && (
        <div className={styles.spinner} role="status" aria-label="Loading photo">
          <div className={styles.spinnerRing} />
        </div>
      )}
      <img
        key={photo.id}
        src={photo.full}
        alt=""
        className={loading ? styles.imgLoading : ''}
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)}
      />
      <button
        type="button"
        className={`${styles.arrow} ${styles.arrowPrev}`}
        onClick={() => navigate(-1)}
        aria-label="Previous photo"
      >
        <ChevronLeftIcon />
      </button>
      <button
        type="button"
        className={`${styles.arrow} ${styles.arrowNext}`}
        onClick={() => navigate(1)}
        aria-label="Next photo"
      >
        <ChevronRightIcon />
      </button>
      <a
        href={photo.original}
        download={photo.name}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.viewerDownload}
        aria-label="Download photo"
      >
        <DownloadIcon />
      </a>
    </div>
  )
}
