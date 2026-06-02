import { driveFiles } from './photos.manifest'

export type PhotoEntry = {
  id: string
  name: string
  /** Resized URL for the grid (fast to load). */
  thumb: string
  /** Larger resized URL for the fullscreen viewer. */
  full: string
  /** Full-resolution original, for downloads. */
  original: string
}

// Drive's thumbnail endpoint serves a resized image (sz=w<N> caps the width),
// which is what we render. The uc?export=download endpoint serves the original
// bytes, which is what the download buttons point at.
const sized = (id: string, width: number) =>
  `https://drive.google.com/thumbnail?id=${id}&sz=w${width}`

export const photos: PhotoEntry[] = driveFiles
  .map(({ id, name }) => ({
    id,
    name,
    thumb: sized(id, 1200),
    full: sized(id, 2000),
    original: `https://drive.google.com/uc?export=download&id=${id}`,
  }))
  .sort((a, b) => a.name.localeCompare(b.name))
