import { useState } from 'react'
import { DownloadIcon, ExpandIcon } from '../../icons'
import styles from './styles.module.css'

type Props = {
  src: string
  downloadSrc: string
  name: string
  /** Width / height — reserves the box's width so there's no layout shift. */
  ratio: number
  alt?: string
  onFullscreen: () => void
}

export function Photo({
  src,
  downloadSrc,
  name,
  ratio,
  alt = '',
  onFullscreen,
}: Props) {
  const [loaded, setLoaded] = useState(false)

  return (
    <figure
      className={styles.photo}
      // The ratio fixes the box's width at the shared height, so the space is
      // held before the image arrives — no white borders, no reflow on load.
      style={{ aspectRatio: ratio || 1 }}
    >
      <img
        className={`${styles.img} ${loaded ? styles.loaded : ''}`}
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
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
