import { test } from 'node:test'
import assert from 'node:assert/strict'
import { openDatabase } from '../src/db.ts'
import { createUploads, detectImage, MAX_IMAGE_BYTES, type ImageStore } from '../src/uploads.ts'
import { HttpError } from '../src/http.ts'
import { creator, STRANGER } from './fixtures.ts'

const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(16)])
const jpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0])
const gif = Buffer.concat([Buffer.from('GIF89a'), Buffer.alloc(8)])
const webp = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP'), Buffer.alloc(4)])
const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>')

function memoryStore(): ImageStore & { files: Map<string, Buffer> } {
  const files = new Map<string, Buffer>()
  return { files, async put(id, bytes) { files.set(id, bytes) }, async get(id) { return files.get(id) ?? null } }
}

test('image type is detected from bytes, not from the declared content type', () => {
  assert.equal(detectImage(png)?.mime, 'image/png')
  assert.equal(detectImage(jpg)?.mime, 'image/jpeg')
  assert.equal(detectImage(gif)?.mime, 'image/gif')
  assert.equal(detectImage(webp)?.mime, 'image/webp')
  assert.equal(detectImage(svg), null)
  assert.equal(detectImage(Buffer.alloc(0)), null)
})

test('uploads are content-addressed, size-capped and owned by the uploading wallet', async () => {
  const store = memoryStore()
  const uploads = createUploads(openDatabase(':memory:'), store, 'https://plum.example')
  const first = await uploads.store(creator.address, png)
  const again = await uploads.store(STRANGER, png)
  assert.equal(first.id, again.id)
  assert.match(first.id, /^[a-f0-9]{64}\.png$/)
  assert.equal(first.url, `https://plum.example/api/uploads/${first.id}`)
  assert.equal(uploads.lookup(first.id)?.address, creator.address)
  assert.equal(uploads.ownedBy(first.id, creator.address), true)
  assert.equal(uploads.ownedBy(first.id, STRANGER), true)
  assert.equal(uploads.ownedBy(first.id, STRANGER.toLowerCase() as typeof STRANGER), true)
  assert.equal(uploads.ownedBy(first.id, '0x00000000000000000000000000000000000000Ff'), false)
  assert.equal(store.files.size, 1)
  assert.equal((await uploads.read(first.id))?.contentType, 'image/png')
  assert.equal(uploads.lookup('../../etc/passwd'), null)
  await assert.rejects(uploads.store(creator.address, svg), (e: HttpError) => e.status === 415)
  await assert.rejects(uploads.store(creator.address, Buffer.concat([png, Buffer.alloc(MAX_IMAGE_BYTES)])), (e: HttpError) => e.status === 413)
  await assert.rejects(uploads.store(creator.address, Buffer.alloc(0)), (e: HttpError) => e.status === 400)
})
