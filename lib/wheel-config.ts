export const prizes = [
  { discount: 10, probability: 0.6 },
  { discount: 15, probability: 0.3 },
  { discount: 20, probability: 0.1 },
] as const

export type Discount = (typeof prizes)[number]['discount']

export const segments: Discount[] = [10, 15, 10, 20, 10, 15]

export const SEGMENT_ANGLE = 360 / segments.length
export const SPIN_DURATION_MS = 4200
export const REDUCED_MOTION_SPIN_DURATION_MS = 900
export const EXTRA_FULL_SPINS = 6

export const BOOKING_URL = 'https://studio24.bg/m/p17478'

const mod = (value: number, n: number) => ((value % n) + n) % n

export function pickPrize(random: () => number = Math.random): Discount {
  let roll = random()
  for (const prize of prizes) {
    if (roll < prize.probability) return prize.discount
    roll -= prize.probability
  }
  return prizes[0].discount
}

export function pickSegmentIndex(discount: Discount, random: () => number = Math.random) {
  const matches = segments.flatMap((value, index) => (value === discount ? [index] : []))
  return matches[Math.floor(random() * matches.length)]
}

/**
 * Segment i spans [i * SEGMENT_ANGLE, (i + 1) * SEGMENT_ANGLE] measured clockwise
 * from 12 o'clock in the wheel's own frame. Rotating the wheel clockwise by R moves
 * a point at angle θ to θ + R, so the pointer (at 0°) sits over wheel angle -R.
 */
export function segmentIndexAtPointer(rotation: number) {
  return Math.floor(mod(-rotation, 360) / SEGMENT_ANGLE) % segments.length
}

export function computeTargetRotation(
  currentRotation: number,
  segmentIndex: number,
  random: () => number = Math.random,
  fullSpins = EXTRA_FULL_SPINS,
) {
  const segmentCenter = segmentIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2
  // Land somewhere inside the segment (never near a divider) so it feels natural.
  const offset = (random() * 2 - 1) * SEGMENT_ANGLE * 0.3
  const desiredMod = mod(-(segmentCenter + offset), 360)
  const delta = mod(desiredMod - mod(currentRotation, 360), 360)
  return currentRotation + fullSpins * 360 + delta
}
