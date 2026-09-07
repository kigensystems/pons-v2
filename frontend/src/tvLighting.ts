export type TvLighting = { color: [number, number, number]; glow: number; spill: number }

const channelValue = (value: number) => Number.isFinite(value) ? Math.min(255, Math.max(0, value)) / 255 : 0
const linear = (value: number) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4

/** Estimate restrained screen light from a tiny, complete RGBA pixel sample. */
export function deriveTvLighting(pixels: ArrayLike<number>): TvLighting {
  const count = Number.isFinite(pixels.length) ? Math.floor(pixels.length / 4) : 0
  const dark: TvLighting = { color: [196, 210, 218], glow: 0, spill: 0 }
  if (count <= 0) return dark

  let red = 0
  let green = 0
  let blue = 0
  let luminance = 0
  for (let i = 0; i < count * 4; i += 4) {
    const r = channelValue(pixels[i])
    const g = channelValue(pixels[i + 1])
    const b = channelValue(pixels[i + 2])
    const alpha = channelValue(pixels[i + 3])
    red += r * alpha
    green += g * alpha
    blue += b * alpha
    luminance += (0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)) * alpha
  }

  const peak = Math.max(red, green, blue)
  if (peak === 0) return dark
  // Lift the averaged hue toward white so reflected color remains soft.
  const tint = (value: number) => Math.round(64 + 191 * value / peak)
  // A gentle exposure curve keeps ordinary dark CRT footage visibly luminous,
  // while black remains dark and white stays within the same capped output.
  const strength = Math.min(1, Math.max(0, luminance / count)) ** 0.3
  return {
    color: [tint(red), tint(green), tint(blue)],
    glow: 0.75 * strength,
    spill: 0.55 * strength,
  }
}
