type Rect = { left: number; top: number; width: number; height: number }
const clamp = (value: number) => Math.max(0, Math.min(1, value))
export const smoothstep = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t) }

// Trace the same glass as ImageTelevision, inset slightly to retain the bezel.
const glass = [[596, 144], [665, 144], [824, 152], [909, 160], [923, 177], [916, 422], [901, 440], [801, 437], [655, 428], [590, 417], [573, 398], [568, 312], [570, 214], [580, 164]]
const glassCurves: [string, ...number[]][] = [
  ['M', 596, 138], ['C', 691, 137, 824, 146, 912, 154], ['Q', 929, 156, 929, 178],
  ['L', 920, 428], ['Q', 919, 445, 901, 446], ['C', 801, 446, 655, 434, 588, 423],
  ['Q', 570, 420, 567, 399], ['C', 557, 311, 562, 213, 574, 161], ['Q', 578, 138, 596, 138], ['Z'],
]

export function screenTransition(progress: number, viewport: { width: number; height: number }, artwork: Rect) {
  const p = clamp(progress)
  // SVG and object-fit:contain use the same 1536 x 1024 registration.
  const fit = Math.min(artwork.width / 1536, artwork.height / 1024)
  const left = artwork.left + (artwork.width - 1536 * fit) / 2
  const top = artwork.top + (artwork.height - 1024 * fit) / 2
  const center = { x: left + 746 * fit, y: top + 292 * fit }
  // The safe inner glass rectangle must cover every viewport corner at the end.
  const target = Math.max(viewport.width / (290 * fit), viewport.height / (235 * fit)) * 1.12
  const scale = Math.pow(Math.max(1, target), smoothstep(p))
  const aim = smoothstep(p / .7)
  const x = (viewport.width / 2 - center.x) * aim + center.x * (1 - scale)
  const y = (viewport.height / 2 - center.y) * aim + center.y * (1 - scale)
  const points = glass.map(([gx, gy]) => [(left + gx * fit) * scale + x, (top + gy * fit) * scale + y])
  const path = glassCurves.map(([command, ...coordinates]) => command + coordinates.map((value, index) => {
    const horizontal = index % 2 === 0
    const center = horizontal ? 746 : 292
    const inset = center + (value - center) * .99
    return ((inset * fit + (horizontal ? left : top)) * scale + (horizontal ? x : y)).toFixed(3)
  }).join(' ')).join(' ')
  return {
    scale, x, y, points,
    transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
    clip: `path('${path}')`,
    reveal: smoothstep((p - .28) / .22),
    copy: 1 - smoothstep(p / .22),
  }
}
