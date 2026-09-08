// Coin image uploads. Bytes are validated by magic number, not by the declared type, and stored
// content-addressed. The store is an adapter: local disk now, an object store or IPFS pin later.
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { HttpError } from './http.ts'
import { now, type Db } from './db.ts'
import type { Address } from 'viem'

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024

const TYPES = {
  png: { mime: 'image/png', test: (b: Buffer) => b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  jpg: { mime: 'image/jpeg', test: (b: Buffer) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  gif: { mime: 'image/gif', test: (b: Buffer) => b.length > 6 && ['GIF87a', 'GIF89a'].includes(b.subarray(0, 6).toString('latin1')) },
  webp: { mime: 'image/webp', test: (b: Buffer) => b.length > 12 && b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP' },
} as const
export type ImageExtension = keyof typeof TYPES

export function detectImage(bytes: Buffer): { extension: ImageExtension; mime: string } | null {
  for (const [extension, type] of Object.entries(TYPES) as [ImageExtension, (typeof TYPES)[ImageExtension]][]) {
    if (type.test(bytes)) return { extension, mime: type.mime }
  }
  return null
}

export type ImageStore = {
  put(id: string, bytes: Buffer): Promise<void>
  get(id: string): Promise<Buffer | null>
}

export function localImageStore(dir: string): ImageStore {
  return {
    async put(id, bytes) { await mkdir(dir, { recursive: true }); await writeFile(join(dir, id), bytes) },
    async get(id) { try { return await readFile(join(dir, id)) } catch { return null } },
  }
}

export function createUploads(db: Db, store: ImageStore, publicUrl: string) {
  const insert = db.prepare('INSERT OR IGNORE INTO uploads (id, address, content_type, bytes, sha256, created_at) VALUES (?, ?, ?, ?, ?, ?)')
  const insertOwner = db.prepare('INSERT OR IGNORE INTO upload_owners (id, address, created_at) VALUES (?, ?, ?)')
  const select = db.prepare('SELECT id, address, content_type, bytes FROM uploads WHERE id = ?')
  const selectOwner = db.prepare('SELECT 1 FROM upload_owners WHERE id = ? AND lower(address) = lower(?)')
  const urlFor = (id: string) => `${publicUrl}/api/uploads/${id}`

  return {
    urlFor,
    async store(address: Address, bytes: Buffer): Promise<{ id: string; url: string; contentType: string; bytes: number }> {
      if (bytes.length === 0) throw new HttpError(400, 'Empty upload', 'empty')
      if (bytes.length > MAX_IMAGE_BYTES) throw new HttpError(413, 'Image exceeds 2 MB', 'too_large')
      const detected = detectImage(bytes)
      if (!detected) throw new HttpError(415, 'Choose a PNG, JPG, WebP or GIF', 'unsupported_media')
      const digest = createHash('sha256').update(bytes).digest('hex')
      const id = `${digest}.${detected.extension}`
      await store.put(id, bytes)
      const at = now()
      insert.run(id, address, detected.mime, bytes.length, digest, at)
      insertOwner.run(id, address, at)
      return { id, url: urlFor(id), contentType: detected.mime, bytes: bytes.length }
    },
    lookup(id: string): { id: string; address: string; contentType: string; bytes: number } | null {
      if (!/^[a-f0-9]{64}\.(png|jpg|gif|webp)$/.test(id)) return null
      const row = select.get(id) as { id: string; address: string; content_type: string; bytes: number } | undefined
      return row ? { id: row.id, address: row.address, contentType: row.content_type, bytes: row.bytes } : null
    },
    // True when this wallet uploaded these bytes itself; the same image from another wallet is not its upload.
    ownedBy(id: string, address: Address): boolean {
      return Boolean(selectOwner.get(id, address))
    },
    async read(id: string): Promise<{ bytes: Buffer; contentType: string } | null> {
      const meta = this.lookup(id)
      if (!meta) return null
      const bytes = await store.get(id)
      return bytes ? { bytes, contentType: meta.contentType } : null
    },
  }
}
