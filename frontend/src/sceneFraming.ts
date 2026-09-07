import { Vector3, type Mesh } from 'three'

export type ScreenFrame = {
  center: Vector3
  normal: Vector3
  up: Vector3
  points: Vector3[]
}

const finiteVector = (value: Vector3) => [value.x, value.y, value.z].every(Number.isFinite)

/** Derive the screen's world frame from its surface and exported canvas UVs. */
export function getScreenFrame(mesh: Mesh): ScreenFrame {
  const position = mesh.geometry.getAttribute('position')
  const uv = mesh.geometry.getAttribute('uv')
  if (!position || position.itemSize < 3 || !uv || uv.itemSize < 2 || uv.count !== position.count) {
    throw new Error('Cannot frame the screen: matching position and UV attributes are required.')
  }

  mesh.updateWorldMatrix(true, false)
  const determinant = mesh.matrixWorld.determinant()
  if (!Number.isFinite(determinant) || determinant === 0) {
    throw new Error('Cannot frame the screen: its world transform is singular or invalid.')
  }
  const index = mesh.geometry.index
  const count = index?.count ?? position.count
  if (!count || count % 3 !== 0) {
    throw new Error('Cannot frame the screen: a nonempty triangle surface is required.')
  }

  const pointMap = new Map<number, Vector3>()
  const point = (vertex: number) => {
    if (!Number.isInteger(vertex) || vertex < 0 || vertex >= position.count) {
      throw new Error('Cannot frame the screen: a triangle references an invalid vertex.')
    }
    let result = pointMap.get(vertex)
    if (!result) {
      result = new Vector3().fromBufferAttribute(position, vertex).applyMatrix4(mesh.matrixWorld)
      if (!finiteVector(result) || !Number.isFinite(uv.getX(vertex)) || !Number.isFinite(uv.getY(vertex))) {
        throw new Error('Cannot frame the screen: positions and UVs must be finite.')
      }
      pointMap.set(vertex, result)
    }
    return result
  }

  const center = new Vector3()
  const normal = new Vector3()
  const up = new Vector3()
  const edge1 = new Vector3()
  const edge2 = new Vector3()
  const cross = new Vector3()
  const uvUp = new Vector3()
  let totalArea = 0
  let uvArea = 0

  for (let offset = 0; offset < count; offset += 3) {
    const a = index ? index.getX(offset) : offset
    const b = index ? index.getX(offset + 1) : offset + 1
    const c = index ? index.getX(offset + 2) : offset + 2
    const p0 = point(a)
    const p1 = point(b)
    const p2 = point(c)
    edge1.subVectors(p1, p0)
    edge2.subVectors(p2, p0)
    cross.crossVectors(edge1, edge2)
    const area = cross.length()
    if (!area) continue

    totalArea += area
    center.addScaledVector(p0, area / 3).addScaledVector(p1, area / 3).addScaledVector(p2, area / 3)
    // Three reverses front-face winding for a mirrored world transform.
    normal.addScaledVector(cross, Math.sign(determinant))

    const du1 = uv.getX(b) - uv.getX(a)
    const dv1 = uv.getY(b) - uv.getY(a)
    const du2 = uv.getX(c) - uv.getX(a)
    const dv2 = uv.getY(c) - uv.getY(a)
    const uvDeterminant = du1 * dv2 - du2 * dv1
    if (Math.abs(uvDeterminant) <= Number.EPSILON) continue
    // The GLB exports V=0 at the top; CanvasTexture.flipY is false.
    // -dP/dV gives the actual image-up direction, including rotated geometry.
    uvUp.copy(edge1).multiplyScalar(du2).addScaledVector(edge2, -du1).divideScalar(uvDeterminant)
    // UV-area weighting avoids a scale/shear-dependent roll on a curved face.
    const textureArea = Math.abs(uvDeterminant)
    up.addScaledVector(uvUp, textureArea)
    uvArea += textureArea
  }

  if (!totalArea || !normal.lengthSq()) {
    throw new Error('Cannot frame the screen: its triangles have no coherent surface normal.')
  }
  center.divideScalar(totalArea)
  normal.normalize()
  up.addScaledVector(normal, -up.dot(normal))
  if (!uvArea || !up.lengthSq() || !finiteVector(up)) {
    throw new Error('Cannot frame the screen: its UVs do not define a usable image-up direction.')
  }

  return { center, normal, up: up.normalize(), points: [...pointMap.values()] }
}

/** Fit every world vertex within ±fill in both axes of the perspective view. */
export function fitCameraToPoints(
  points: readonly Vector3[],
  center: Vector3,
  outward: Vector3,
  imageUp: Vector3,
  fovDegrees: number,
  aspect: number,
  fill = 0.8,
) {
  if (!Number.isFinite(aspect) || aspect <= 0 || !Number.isFinite(fovDegrees) || fovDegrees <= 0 || fovDegrees >= 180) {
    throw new Error('Cannot fit the camera: aspect must be positive and vertical field of view must be between 0 and 180 degrees.')
  }
  if (!Number.isFinite(fill) || fill <= 0 || fill > 1) {
    throw new Error('Cannot fit the camera: fill must be greater than zero and at most one.')
  }
  if (!points.length || !finiteVector(center) || !finiteVector(outward) || !finiteVector(imageUp) || !outward.lengthSq()) {
    throw new Error('Cannot fit the camera: finite surface points and a valid screen frame are required.')
  }

  const normal = outward.clone().normalize()
  const up = imageUp.clone().addScaledVector(normal, -imageUp.dot(normal))
  if (up.lengthSq() <= Number.EPSILON) {
    throw new Error('Cannot fit the camera: screen up must not be parallel to its normal.')
  }
  up.normalize()
  const right = new Vector3().crossVectors(up, normal).normalize()
  const verticalSlope = Math.tan(fovDegrees * Math.PI / 360) * fill
  const horizontalSlope = verticalSlope * aspect
  const relative = new Vector3()
  let distance = 0
  let radius = 0

  for (const point of points) {
    if (!finiteVector(point)) throw new Error('Cannot fit the camera: surface points must be finite.')
    relative.subVectors(point, center)
    radius = Math.max(radius, relative.length())
    const depth = relative.dot(normal)
    distance = Math.max(distance,
      depth + Math.abs(relative.dot(right)) / horizontalSlope,
      depth + Math.abs(relative.dot(up)) / verticalSlope,
    )
  }

  // Keep even the closest curved vertex in front of the camera.
  distance += Math.max(radius * 0.0001, 0.00001)
  return { position: center.clone().addScaledVector(normal, distance), target: center.clone(), up }
}
