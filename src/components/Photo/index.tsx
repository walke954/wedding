import { useEffect, useRef, useState } from 'react'
import { DownloadIcon, ExpandIcon } from '../../icons'
import styles from './styles.module.css'

type Props = {
  src: string
  downloadSrc: string
  name: string
  alt?: string
  onFullscreen: () => void
}

export function Photo({ src, downloadSrc, name, alt = '', onFullscreen }: Props) {
  const [landscape, setLandscape] = useState(false)
  const [visible, setVisible] = useState(false)
  const figureRef = useRef<HTMLElement>(null)

  // Fade each photo in as it scrolls into view. Once revealed it stays
  // revealed, so we stop observing after the first intersection.
  useEffect(() => {
    const el = figureRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <figure
      ref={figureRef}
      className={`${styles.photo} ${landscape ? styles.landscape : ''} ${
        visible ? styles.visible : ''
      }`}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={(e) => {
          const img = e.currentTarget
          setLandscape(img.naturalWidth > img.naturalHeight)
        }}
      />
      <div className={styles.photoActions}>
        <button type="button" onClick={onFullscreen} aria-label="View fullscreen">
          <ExpandIcon />
        </button>
        <a
          href={downloadSrc}
          download={name}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Download photo"
        >
          <DownloadIcon />
        </a>
      </div>
    </figure>
  )
}
