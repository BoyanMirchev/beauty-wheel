import 'server-only'
import { randomInt } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import { db } from './db'
import { type WheelEntryRow, wheelEntries } from './schema'
import type { PublicEntry } from './types'
import { type Discount, pickPrize } from './wheel-config'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value)
}

function toPublicEntry(row: WheelEntryRow): PublicEntry {
  return {
    id: row.id,
    firstName: row.firstName,
    hasSpun: row.hasSpun,
    discount: row.discount as Discount | null,
  }
}

const RANDOM_RESOLUTION = 1_000_000

/** Cryptographically random weighted draw (60% / 30% / 10%). */
export function drawPrize(): Discount {
  return pickPrize(() => randomInt(0, RANDOM_RESOLUTION) / RANDOM_RESOLUTION)
}

export async function registerEntry(input: { firstName: string; lastName: string; phone: string }) {
  const [created] = await db
    .insert(wheelEntries)
    .values(input)
    .onConflictDoNothing({ target: wheelEntries.phone })
    .returning()
  if (created) return { entry: toPublicEntry(created), existing: false }

  const [existing] = await db.select().from(wheelEntries).where(eq(wheelEntries.phone, input.phone)).limit(1)
  return { entry: toPublicEntry(existing), existing: true }
}

export async function getPublicEntry(id: string): Promise<PublicEntry | null> {
  const [row] = await db.select().from(wheelEntries).where(eq(wheelEntries.id, id)).limit(1)
  return row ? toPublicEntry(row) : null
}

export type SpinResult =
  | { status: 'won'; entry: PublicEntry }
  | { status: 'already_spun'; entry: PublicEntry }
  | { status: 'not_found' }

export async function spinWheel(entryId: string): Promise<SpinResult> {
  const prize = drawPrize()
  // The `has_spun = false` guard makes this a single atomic check-and-set,
  // so concurrent requests from multiple tabs can never produce two prizes.
  const [updated] = await db
    .update(wheelEntries)
    .set({ discount: prize, hasSpun: true, spunAt: new Date() })
    .where(and(eq(wheelEntries.id, entryId), eq(wheelEntries.hasSpun, false)))
    .returning()
  if (updated) return { status: 'won', entry: toPublicEntry(updated) }

  const existing = await getPublicEntry(entryId)
  return existing ? { status: 'already_spun', entry: existing } : { status: 'not_found' }
}
