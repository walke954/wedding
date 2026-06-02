// List of public Google Drive image files shown in the gallery.
//
// The data lives in `photos.json` (id, name, tags) so it can be edited in the
// browser via the /#admin page and downloaded as a drop-in replacement. To
// re-pull the file list from Drive (preserving existing tags) run:
//   GOOGLE_API_KEY=... npm run generate:manifest -- <FOLDER_ID>
// Each `id` is a Drive file ID (the long token in a file's share link:
// https://drive.google.com/file/d/<ID>/view). `name` is the filename used for
// downloads and for sort order. `tags` categorizes each photo.
import data from './photos.json'

export type PhotoTag = 'ceremony' | 'celebration' | 'family' | 'friends' | 'food'
// `ratio` is width / height, used to reserve each photo's space before it loads.
export type DriveFile = {
  id: string
  name: string
  ratio: number
  tags: PhotoTag[]
}

export const driveFiles: DriveFile[] = data as DriveFile[]
