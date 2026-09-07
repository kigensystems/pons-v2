import assert from 'node:assert/strict'
import test from 'node:test'
import {
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  Matrix3,
  Mesh,
  PerspectiveCamera,
  Vector3,
} from 'three'
import { fitCameraToPoints, getScreenFrame } from '../src/sceneFraming.ts'

function curvedScreen() {
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const columns = 12
  const rows = 10
  for (let row = 0; row <= rows; row++) {
    for (let column = 0; column <= columns; column++) {
      const x = column / columns * 2 - 1
      const y = 1 - row / rows * 2
      positions.push(x * 0.7, y * 0.525, 0.22 * (1 - x * x) * (1 - y * y))
      uvs.push(column / columns, row / rows)
      if (row < rows && column < columns) {
        const a = row * (columns + 1) + column
        const b = a + columns + 1
        indices.push(a, b, a + 1, a + 1, b, b + 1)
      }
    }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  return new Mesh(geometry)
}

function expectDirection(actual: Vector3, expected: Vector3) {
  assert.ok(actual.dot(expected.clone().normalize()) > 1 - 1e-9,
    `${actual.toArray()} must align with ${expected.toArray()}`)
}

function assertFit(mesh: Mesh, aspect: number, fill = 0.8) {
  const frame = getScreenFrame(mesh)
  const fit = fitCameraToPoints(frame.points, frame.center, frame.normal, frame.up, 37, aspect, fill)
  const camera = new PerspectiveCamera(37, aspect, 0.000001, 10000)
  camera.position.copy(fit.position)
  camera.up.copy(fit.up)
  camera.lookAt(fit.target)
  camera.updateMatrixWorld()
  expectDirection(camera.position.clone().sub(frame.center).normalize(), frame.normal)
  expectDirection(camera.getWorldDirection(new Vector3()), frame.normal.clone().negate())
  assert.ok(fit.target.distanceTo(frame.center) < 1e-12)

  let extent = 0
  for (const point of frame.points) {
    const projected = point.clone().project(camera)
    extent = Math.max(extent, Math.abs(projected.x), Math.abs(projected.y))
    assert.ok(Math.abs(projected.x) <= fill + 1e-9, `horizontal clip: ${projected.x}`)
    assert.ok(Math.abs(projected.y) <= fill + 1e-9, `vertical clip: ${projected.y}`)
    assert.ok(projected.z > -1 && projected.z < 1, `depth clip: ${projected.z}`)
  }
  assert.ok(extent > fill * 0.99, 'Fit should use the available view, not retreat unnecessarily.')
  return { frame, fit }
}

test('screen frame follows actual curved vertices, UV up, and transformed hierarchy', () => {
  const mesh = curvedScreen()
  const parent = new Group()
  parent.position.set(2.3, -1.4, 4.8)
  parent.rotation.set(0.23, -0.54, 0.32)
  parent.scale.set(1.8, 0.7, 1.25)
  mesh.rotation.set(-0.17, 0.38, -0.21)
  mesh.position.set(-0.4, 0.9, 0.7)
  mesh.scale.set(0.8, 1.3, 0.9)
  parent.add(mesh)
  const frame = getScreenFrame(mesh)
  const expectedNormal = new Vector3(0, 0, 1).applyNormalMatrix(new Matrix3().getNormalMatrix(mesh.matrixWorld))
  const expectedUp = new Vector3(0, 1, 0).transformDirection(mesh.matrixWorld)
  expectedUp.addScaledVector(expectedNormal, -expectedUp.dot(expectedNormal)).normalize()
  expectDirection(frame.normal, expectedNormal)
  expectDirection(frame.up, expectedUp)
  assert.ok(Math.abs(frame.normal.dot(frame.up)) < 1e-12)

  const attribute = mesh.geometry.getAttribute('position')
  assert.equal(frame.points.length, attribute.count)
  for (let index = 0; index < attribute.count; index++) {
    const expected = new Vector3().fromBufferAttribute(attribute, index).applyMatrix4(mesh.matrixWorld)
    assert.ok(frame.points.some(point => point.distanceTo(expected) < 1e-12))
  }
  assertFit(mesh, 16 / 9)
  assertFit(mesh, 9 / 16)
})

test('camera refits after orientation changes and landscape/portrait resizing', () => {
  const mesh = curvedScreen()
  for (const rotation of [[0, 0, 0], [0.7, 1.1, -0.4], [-0.9, -1.8, 2.6]]) {
    mesh.rotation.set(rotation[0], rotation[1], rotation[2])
    mesh.position.set(-3.2, 1.7, -4.3)
    mesh.scale.set(1.4, 0.85, 2)
    const landscape = assertFit(mesh, 16 / 9)
    const portrait = assertFit(mesh, 9 / 16)
    assert.ok(portrait.fit.position.distanceTo(portrait.frame.center) > landscape.fit.position.distanceTo(landscape.frame.center))
    assertFit(mesh, 1, 0.65)
  }
})

test('camera fit includes closer curved vertices instead of only planar bounds', () => {
  const points = [new Vector3(-1, -1, 0), new Vector3(1, 1, 0), new Vector3(0.95, 0, 2)]
  const center = new Vector3()
  const fit = fitCameraToPoints(points, center, new Vector3(0, 0, 1), new Vector3(0, 1, 0), 90, 1, 0.8)
  assert.ok(fit.position.z > 2 + 0.95 / 0.8)
  assert.ok(fit.position.z < 2 + 0.95 / 0.8 + 0.001)
  assert.deepEqual(center.toArray(), [0, 0, 0])
})

test('non-indexed geometry and mirrored transforms retain the front-facing frame', () => {
  const mesh = curvedScreen()
  mesh.geometry = mesh.geometry.toNonIndexed()
  mesh.scale.set(-1.7, 0.6, 1.3)
  mesh.rotation.set(0.5, -0.8, 0.4)
  const frame = getScreenFrame(mesh)
  const expected = new Vector3(0, 0, 1).applyNormalMatrix(new Matrix3().getNormalMatrix(mesh.matrixWorld))
  expectDirection(frame.normal, expected)
  assertFit(mesh, 0.5)
})

test('missing or unusable UVs fail descriptively instead of guessing orientation', () => {
  const mesh = curvedScreen()
  mesh.geometry.deleteAttribute('uv')
  assert.throws(() => getScreenFrame(mesh), /matching position and UV attributes/)
  mesh.geometry.setAttribute('uv', new Float32BufferAttribute(new Float32Array(mesh.geometry.getAttribute('position').count * 2), 2))
  assert.throws(() => getScreenFrame(mesh), /UVs do not define a usable image-up direction/)
})

test('camera fitting rejects invalid viewport and frame parameters', () => {
  const frame = getScreenFrame(curvedScreen())
  const fit = (aspect: number, fov = 37, fill = 0.8) => fitCameraToPoints(frame.points, frame.center, frame.normal, frame.up, fov, aspect, fill)
  for (const aspect of [0, -1, NaN, Infinity]) assert.throws(() => fit(aspect), /aspect must be positive/)
  for (const fov of [0, 180, NaN]) assert.throws(() => fit(1, fov), /field of view/)
  for (const fill of [0, 1.1, NaN]) assert.throws(() => fit(1, 37, fill), /fill must/)
  assert.throws(() => fitCameraToPoints(frame.points, frame.center, frame.normal, frame.normal, 37, 1), /must not be parallel/)
})
