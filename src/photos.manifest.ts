// List of public Google Drive image files shown in the gallery.
//
// Regenerate from a public Drive folder with:
//   GOOGLE_API_KEY=... npm run generate:manifest -- <FOLDER_ID>
// or edit by hand. Each `id` is a Drive file ID (the long token in a file's
// share link: https://drive.google.com/file/d/<ID>/view). `name` is the
// filename used for downloads and for sort order.
export type DriveFile = { id: string; name: string }

export const driveFiles: DriveFile[] = [
  // { id: '1AbCdEfGhIjKlMnOpQrStUvWxYz', name: '20260528_111809.jpg' },
]
