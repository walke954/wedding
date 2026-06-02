// Read a photo's true aspect ratio (width / height) by fetching its Drive
// thumbnail and measuring the rendered pixels. We measure the rendered image
// rather than trusting Drive's imageMediaMetadata because that metadata reports
// the raw sensor dimensions and ignores EXIF rotation — so a phone portrait
// comes back as landscape. The thumbnail has the rotation already applied.

// Dimensions straight from the file's bytes — no dependencies. Handles the
// JPEG and PNG that Drive thumbnails come back as.
export function imageSize(buf) {
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2
    while (i < buf.length) {
      if (buf[i] !== 0xff) {
        i++
        continue
      }
      let marker = buf[i + 1]
      while (marker === 0xff) {
        i++
        marker = buf[i + 1]
      }
      i += 2
      if (marker === 0xd8 || marker === 0xd9) continue
      if (marker >= 0xd0 && marker <= 0xd7) continue
      const segLen = (buf[i] << 8) | buf[i + 1]
      const isSOF =
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf)
      if (isSOF) {
        const height = (buf[i + 3] << 8) | buf[i + 4]
        const width = (buf[i + 5] << 8) | buf[i + 6]
        return { width, height }
      }
      i += segLen
    }
    return null
  }
  if (buf.slice(0, 8).toString('hex') === '89504e470d0a1a0a') {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
  }
  return null
}

export async function measureRatio(id) {
  const url = `https://drive.google.com/thumbnail?id=${id}&sz=w800`
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const size = imageSize(Buffer.from(await res.arrayBuffer()))
  if (!size || !size.height) throw new Error('could not read dimensions')
  return Math.round((size.width / size.height) * 10000) / 10000
}

// Measure many ids concurrently, calling onResult(id, ratioOrNull) for each.
export async function measureAll(ids, onResult, concurrency = 8) {
  const queue = [...ids]
  async function worker() {
    while (queue.length) {
      const id = queue.shift()
      try {
        onResult(id, await measureRatio(id))
      } catch (e) {
        onResult(id, null, e)
      }
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, ids.length) }, worker),
  )
}
