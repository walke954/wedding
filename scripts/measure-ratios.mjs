// Maintenance helper: fill in the `ratio` (width / height) of each photo in
// src/photos.json by measuring its Drive thumbnail. The gallery uses the ratio
// to reserve each photo's space before it loads (no layout shift, no empty
// white boxes). generate-drive-manifest.mjs already measures new photos, so you
// normally don't need this — run it to re-measure everything with `--all`.
import { readFile, writeFile } from 'node:fs/promises'
import { measureAll } from './image-ratio.mjs'

const dataUrl = new URL('../src/photos.json', import.meta.url)
const all = process.argv.includes('--all')

const items = JSON.parse(await readFile(dataUrl, 'utf8'))
const byId = new Map(items.map((it) => [it.id, it]))
const todo = items.filter((it) => all || typeof it.ratio !== 'number')
console.log(`Measuring ${todo.length} of ${items.length} photos...`)

let done = 0
let failed = 0
await measureAll(
  todo.map((it) => it.id),
  (id, ratio, err) => {
    if (ratio === null) {
      failed++
      console.warn(`  ${byId.get(id).name}: ${err?.message ?? 'failed'}`)
    } else {
      byId.get(id).ratio = ratio
    }
    if (++done % 10 === 0) console.log(`  ${done}/${todo.length}`)
  },
)

// Reserialize with a stable key order: id, name, ratio, tags.
const out = items.map(({ id, name, ratio, tags }) => ({ id, name, ratio, tags }))
await writeFile(dataUrl, `${JSON.stringify(out, null, 2)}\n`)
console.log(`Done. Updated ${todo.length - failed}, failed ${failed}.`)
