import { writeFile } from 'node:fs/promises'
import dotenv from 'dotenv'

dotenv.config()

// Accept either a bare folder ID or a full Drive URL like
// https://drive.google.com/drive/folders/<ID>?... and extract the ID.
function extractFolderId(input) {
  if (!input) return input
  const m = input.match(/\/folders\/([^/?#]+)/)
  return m ? m[1] : input
}

const folderId = extractFolderId(process.argv[2] || process.env.DRIVE_FOLDER_ID)
const apiKey = process.env.GOOGLE_API_KEY

if (!folderId || !apiKey) {
  console.error(
    'Missing input.\n' +
      '  Set GOOGLE_API_KEY and pass the folder ID:\n' +
      '  GOOGLE_API_KEY=... node scripts/generate-drive-manifest.mjs <FOLDER_ID>',
  )
  process.exit(1)
}

const files = []
let pageToken

do {
  const url = new URL('https://www.googleapis.com/drive/v3/files')
  url.searchParams.set(
    'q',
    `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
  )
  url.searchParams.set('key', apiKey)
  url.searchParams.set('fields', 'nextPageToken,files(id,name)')
  url.searchParams.set('pageSize', '1000')
  url.searchParams.set('orderBy', 'name')
  if (pageToken) url.searchParams.set('pageToken', pageToken)

  const res = await fetch(url)
  if (!res.ok) {
    console.error(`Drive API error ${res.status}: ${await res.text()}`)
    process.exit(1)
  }
  const data = await res.json()
  for (const f of data.files ?? []) files.push({ id: f.id, name: f.name })
  pageToken = data.nextPageToken
} while (pageToken)

const header = `// List of public Google Drive image files shown in the gallery.
//
// Regenerate from a public Drive folder with:
//   GOOGLE_API_KEY=... npm run generate:manifest -- <FOLDER_ID>
// or edit by hand. Each \`id\` is a Drive file ID (the long token in a file's
// share link: https://drive.google.com/file/d/<ID>/view). \`name\` is the
// filename used for downloads and for sort order.
export type DriveFile = { id: string; name: string }

export const driveFiles: DriveFile[] = `

const body = JSON.stringify(files, null, 2)

await writeFile(
  new URL('../src/photos.manifest.ts', import.meta.url),
  `${header}${body}\n`,
)

console.log(`Wrote ${files.length} photos to src/photos.manifest.ts`)
