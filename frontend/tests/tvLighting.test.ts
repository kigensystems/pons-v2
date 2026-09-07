import assert from 'node:assert/strict'
import test from 'node:test'
import { deriveTvLighting } from '../src/tvLighting.ts'

test('empty, incomplete, transparent, and black samples emit no light', () => {
  for (const pixels of [[], [255, 255, 255], [0, 0, 0, 255], [255, 255, 255, 0]]) {
    const light = deriveTvLighting(pixels)
    assert.equal(light.glow, 0)
    assert.equal(light.spill, 0)
    assert.ok(light.color.every(Number.isFinite))
  }
})

test('bright screen content emits more light while peaks stay bounded', () => {
  const dim = deriveTvLighting([24, 24, 24, 255])
  const mixed = deriveTvLighting([255, 255, 255, 255, 0, 0, 0, 255])
  const bright = deriveTvLighting([255, 255, 255, 255])
  assert.ok(dim.glow > 0 && dim.glow < mixed.glow && mixed.glow < bright.glow)
  assert.ok(dim.spill > 0 && dim.spill < mixed.spill && mixed.spill < bright.spill)
  assert.equal(bright.glow, 0.75)
  assert.equal(bright.spill, 0.55)
  assert.deepEqual(bright.color, [255, 255, 255])
})

test('red and blue footage retain their dominant hue with softened reflected color', () => {
  const red = deriveTvLighting([255, 0, 0, 255])
  const blue = deriveTvLighting([0, 0, 255, 255])
  assert.ok(red.color[0] > red.color[1] && red.color[0] > red.color[2])
  assert.ok(blue.color[2] > blue.color[0] && blue.color[2] > blue.color[1])
  assert.ok(red.color.every(value => value >= 64) && blue.color.every(value => value >= 64))
  assert.ok(red.glow > 0 && blue.glow > 0)
})

test('sample averaging respects alpha and malformed channels remain finite and bounded', () => {
  const opaque = deriveTvLighting([0, 0, 255, 255])
  const translucent = deriveTvLighting([0, 0, 255, 128])
  const transparentRed = deriveTvLighting([0, 0, 255, 255, 255, 0, 0, 0])
  assert.deepEqual(translucent.color, opaque.color)
  assert.deepEqual(transparentRed.color, opaque.color)
  assert.ok(translucent.glow < opaque.glow)
  assert.ok(transparentRed.spill < opaque.spill)
  for (const pixels of [[999, -20, NaN, 255], [Infinity, 200, 30, Infinity], [255, 255, 255, 999]]) {
    const light = deriveTvLighting(pixels)
    assert.ok(light.color.every(value => Number.isFinite(value) && value >= 0 && value <= 255))
    assert.ok(Number.isFinite(light.glow) && light.glow >= 0 && light.glow <= 0.75)
    assert.ok(Number.isFinite(light.spill) && light.spill >= 0 && light.spill <= 0.55)
  }
})
