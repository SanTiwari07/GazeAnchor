export const radians = Math.PI / 180
export type Angles = { yaw: number; pitch: number }
export type Limits = { left: number; right: number; down: number; up: number }

export const restricted: Limits = { left: -12, right: 12, down: -8, up: 8 }

export function inside(point: Angles, limits: Limits): boolean {
  return point.yaw >= limits.left && point.yaw <= limits.right &&
    point.pitch >= limits.down && point.pitch <= limits.up
}

export function separation(a: Angles, b: Angles): number {
  return Math.hypot(a.yaw - b.yaw, a.pitch - b.pitch)
}

export function place(points: Angles[], limits: Limits, adaptive: boolean): (Angles | null)[] {
  const result = points.map(point => inside(point, limits) ? point : null)
  if (!adaptive) return result
  const left = limits.left * 0.85
  const right = limits.right * 0.85
  const down = limits.down * 0.85
  const up = limits.up * 0.85
  const candidates: Angles[] = []
  for (let row = 0; row <= 12; row++) {
    for (let col = 0; col <= 12; col++) {
      const point = {
        yaw: col === 12 ? right : left + (right - left) * col / 12,
        pitch: row === 12 ? up : down + (up - down) * row / 12
      }
      if (Math.abs(point.yaw) >= 4.5) candidates.push(point)
    }
  }
  const missing = points.flatMap((source, index) => {
    if (result[index] || !Number.isFinite(source.yaw) || !Number.isFinite(source.pitch)) return []
    const ideal = { yaw: source.yaw, pitch: index === 1 ? 3 : -5 }
    const ranked = candidates
      .filter(candidate => result.every(other => !other || separation(other, candidate) >= 9))
      .map(point => ({ point, error: separation(ideal, point) }))
      .sort((a, b) => a.error - b.error)
    return [{ index, ranked }]
  })

  let best = result.slice()
  let bestCount = 0
  let bestError = Infinity

  function assign(step: number, count: number, error: number): void {
    const upperCount = count + missing.length - step
    if (upperCount < bestCount || (upperCount === bestCount && error >= bestError)) return
    if (step === missing.length) {
      best = result.slice()
      bestCount = count
      bestError = error
      return
    }

    const { index, ranked } = missing[step]
    for (const candidate of ranked) {
      if (result.some(other => other && separation(other, candidate.point) < 9)) continue
      result[index] = candidate.point
      assign(step + 1, count + 1, error + candidate.error)
      result[index] = null
    }
    assign(step + 1, count, error)
  }

  assign(0, 0, 0)
  return best
}

type Direction = Pick<vec3, "x" | "y" | "z">

export function angularDistance(a: Direction, b: Direction): number {
  const cross = Math.hypot(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x)
  const dot = a.x * b.x + a.y * b.y + a.z * b.z
  return cross === 0 && dot === 0 ? Infinity : Math.atan2(cross, dot) / radians
}
