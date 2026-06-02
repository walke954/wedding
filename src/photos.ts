import { driveFiles, type PhotoTag } from './photos.manifest'

export type { PhotoTag }

export type PhotoEntry = {
  id: string
  name: string
  /** Width / height, used to reserve the photo's space before it loads. */
  ratio: number
  /** Categories for filtering, e.g. ceremony, family, friends, food. */
  tags: PhotoTag[]
  /** Resized URL for the grid (fast to load). */
  thumb: string
  /** Larger resized URL for the fullscreen viewer. */
  full: string
  /** Full-resolution original, for downloads. */
  original: string
}

// Categories in the order their sections appear in the gallery, with the
// labels shown in the filter bar and section headers.
export const PHOTO_TAGS: { tag: PhotoTag; label: string }[] = [
  { tag: 'ceremony', label: 'Ceremony' },
  { tag: 'celebration', label: 'Celebration' },
  { tag: 'family', label: 'Family' },
  { tag: 'friends', label: 'Friends' },
  { tag: 'food', label: 'Food' },
]

// Drive's thumbnail endpoint serves a resized image (sz=w<N> caps the width),
// which is what we render. The uc?export=download endpoint serves the original
// bytes, which is what the download buttons point at.
const sized = (id: string, width: number) =>
  `https://drive.google.com/thumbnail?id=${id}&sz=w${width}`

// Order follows the manifest as authored — that hand-ordering is intentional,
// so we don't re-sort here.
export const photos: PhotoEntry[] = driveFiles.map(({ id, name, ratio, tags }) => ({
  id,
  name,
  ratio,
  tags,
  thumb: sized(id, 800),
  full: sized(id, 2000),
  original: `https://drive.google.com/uc?export=download&id=${id}`,
}))
