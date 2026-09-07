// Inspect the generated GLB without executing Blender or relying on a browser.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const path = fileURLToPath(new URL('../../frontend/public/models/macintosh-512k.glb', import.meta.url));
const data = readFileSync(path);
if (data.readUInt32LE(0) !== 0x46546c67 || data.readUInt32LE(4) !== 2) throw new Error('Expected GLB 2.0');
const jsonLength = data.readUInt32LE(12);
const gltf = JSON.parse(data.toString('utf8', 20, 20 + jsonLength));
const binary = data.subarray(28 + jsonLength);
const images = gltf.images.map((image) => {
  const view = gltf.bufferViews[image.bufferView];
  const bytes = binary.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength);
  let width, height;
  if (image.mimeType === 'image/png') {
    width = bytes.readUInt32BE(16);
    height = bytes.readUInt32BE(20);
  } else if (image.mimeType === 'image/jpeg') {
    let offset = 2;
    while (offset < bytes.length) {
      const marker = bytes.readUInt16BE(offset);
      const length = bytes.readUInt16BE(offset + 2);
      if ([0xffc0, 0xffc1, 0xffc2].includes(marker)) {
        height = bytes.readUInt16BE(offset + 5);
        width = bytes.readUInt16BE(offset + 7);
        break;
      }
      offset += length + 2;
    }
  }
  if (!width || !height || width > 2048 || height > 2048) throw new Error('Unexpected image dimensions');
  return { name: image.name, mimeType: image.mimeType, width, height, bytes: view.byteLength };
});
const meshInfo = gltf.meshes.map((mesh) => ({ name: mesh.name, primitives: mesh.primitives.length,
  triangles: mesh.primitives.reduce((sum, p) => sum + gltf.accessors[p.indices].count / 3, 0) }));
const screenNode = gltf.nodes.find((node) => node.name === 'Screen');
if (!screenNode) throw new Error('No named Screen node');
const screenPrimitive = gltf.meshes[screenNode.mesh].primitives[0];
const uvAccessor = gltf.accessors[screenPrimitive.attributes.TEXCOORD_0];
const uvView = gltf.bufferViews[uvAccessor.bufferView];
if (uvAccessor.componentType !== 5126 || uvAccessor.type !== 'VEC2') throw new Error('Unexpected Screen UV format');
const uvs = Array.from({ length: uvAccessor.count }, (_, index) => {
  const offset = (uvView.byteOffset || 0) + (uvAccessor.byteOffset || 0) + index * (uvView.byteStride || 8);
  return [binary.readFloatLE(offset), binary.readFloatLE(offset + 4)];
});
const uvBounds = [0, 1].map((axis) => [Math.min(...uvs.map((uv) => uv[axis])), Math.max(...uvs.map((uv) => uv[axis]))]);
if (uvBounds.some(([low, high]) => Math.abs(low) > 0.0001 || Math.abs(high - 1) > 0.0001)) throw new Error('Screen UVs are not normalized');
const result = { bytes: data.length, nodes: gltf.nodes.map((n) => n.name), meshes: meshInfo,
  totalTriangles: meshInfo.reduce((sum, m) => sum + m.triangles, 0),
  modelDrawCalls: meshInfo.reduce((sum, m) => sum + m.primitives, 0), images,
  materials: gltf.materials, screenUvBounds: uvBounds,
  extensionsUsed: gltf.extensionsUsed ?? [], extensionsRequired: gltf.extensionsRequired ?? [] };
console.log(JSON.stringify(result, null, 2));
