import { readFile, writeFile } from 'node:fs/promises'
import dotenv from 'dotenv'
import { measureAll } from './image-ratio.mjs'

dotenv.config()

const dataUrl = new URL('../src/photos.json', import.meta.url)

// Read the existing photos.json so regenerating preserves the tags and the
// hand-tuned order (set via the /#admin page). Returns the parsed entries, or
// an empty array if the file is missing/unreadable.
async function readExisting() {
  try {
    return JSON.parse(await readFile(dataUrl, 'utf8'))
  } catch {
    return []
  }
}

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

const fetched = new Map() // id -> name, in Drive (name) order
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
  for (const f of data.files ?? []) fetched.set(f.id, f.name)
  pageToken = data.nextPageToken
} while (pageToken)

// Merge with the existing file: keep previously-known photos in their saved
// order (carrying their tags and ratio), drop any no longer in Drive, and
// append newly added photos at the end in Drive (name) order.
const existing = await readExisting()
const files = []
const seen = new Set()
let preserved = 0

for (const e of existing) {
  if (e?.id && fetched.has(e.id)) {
    const tags = Array.isArray(e.tags) ? e.tags : []
    const ratio = typeof e.ratio === 'number' ? e.ratio : null
    files.push({ id: e.id, name: fetched.get(e.id), ratio, tags })
    seen.add(e.id)
    if (tags.length) preserved++
  }
}
let added = 0
for (const [id, name] of fetched) {
  if (seen.has(id)) continue
  files.push({ id, name, ratio: null, tags: [] })
  added++
}

// Measure ratios for any photo missing one (new photos, or older entries that
// never had a ratio). We measure the rendered Drive thumbnail rather than using
// Drive's imageMediaMetadata, which ignores EXIF rotation and reports portrait
// phone photos as landscape. Existing ratios are kept as-is.
const needRatio = files.filter((f) => f.ratio === null)
if (needRatio.length) {
  console.log(`Measuring ratios for ${needRatio.length} photo(s)...`)
  const byId = new Map(files.map((f) => [f.id, f]))
  let failed = 0
  await measureAll(
    needRatio.map((f) => f.id),
    (id, ratio) => {
      if (ratio === null) failed++
      else byId.get(id).ratio = ratio
    },
  )
  if (failed) {
    console.warn(
      `  Could not measure ${failed} photo(s); rerun: node scripts/measure-ratios.mjs`,
    )
  }
}

await writeFile(dataUrl, `${JSON.stringify(files, null, 2)}\n`)

console.log(
  `Wrote ${files.length} photos to src/photos.json ` +
    `(kept tags on ${preserved}, added ${added} new)`,
)
