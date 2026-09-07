import assert from 'node:assert/strict'
import test from 'node:test'
import { screenTransition } from '../src/screenTransition.ts'

function inside(point: number[], polygon: number[][]) {
  let result = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [x, y] = polygon[i], [px, py] = polygon[j]
    if ((y > point[1]) !== (py > point[1]) && point[0] < (px - x) * (point[1] - y) / (py - y) + x) result = !result
  }
  return result
}

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
  test(`screen fills the viewport without stretching at ${viewport.width} x ${viewport.height}`, () => {
    const artwork = { left: viewport.width * .285, top: viewport.height * .12, width: viewport.width * .72, height: viewport.height * .78 }
    const start = screenTransition(0, viewport, artwork)
    assert.equal(start.scale, 1)
    assert.equal(start.x, 0)
    assert.equal(start.y, 0)
    assert.equal(start.reveal, 0)
    const end = screenTransition(1, viewport, artwork)
    for (const corner of [[0, 0], [viewport.width, 0], [0, viewport.height], [viewport.width, viewport.height]]) assert.ok(inside(corner, end.points))
    assert.equal(end.reveal, 1)
    assert.equal(end.copy, 0)
    let previous = 1
    for (let step = 0; step <= 100; step++) {
      const frame = screenTransition(step / 100, viewport, artwork)
      assert.ok(frame.scale >= previous)
      assert.ok([frame.x, frame.y, frame.scale, ...frame.points.flat()].every(Number.isFinite))
      previous = frame.scale
    }
    assert.deepEqual(screenTransition(-1, viewport, artwork), start)
    assert.deepEqual(screenTransition(2, viewport, artwork), end)
  })
}
