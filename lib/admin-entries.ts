import 'server-only'
import { and, desc, eq } from 'drizzle-orm'
import { db } from './db'
import { type WheelEntryRow, wheelEntries } from './schema'
import type { AdminEntry } from './types'
import type { Discount } from './wheel-config'

function toAdminEntry(row: WheelEntryRow): AdminEntry {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    phone: row.phone,
    discount: row.discount as Discount | null,
    hasSpun: row.hasSpun,
    discountUsed: row.discountUsed,
    createdAt: row.createdAt.toISOString(),
    spunAt: row.spunAt?.toISOString() ?? null,
    usedAt: row.usedAt?.toISOString() ?? null,
  }
}

export async function listEntries(): Promise<AdminEntry[]> {
  const rows = await db.select().from(wheelEntries).orderBy(desc(wheelEntries.createdAt))
  return rows.map(toAdminEntry)
}

export type MarkUsedResult =
  | { status: 'ok'; entry: AdminEntry }
  | { status: 'not_found' }
  | { status: 'not_spun' }

export async function markDiscountAsUsed(entryId: string): Promise<MarkUsedResult> {
  const [updated] = await db
    .update(wheelEntries)
    .set({ discountUsed: true, usedAt: new Date() })
    .where(
      and(eq(wheelEntries.id, entryId), eq(wheelEntries.hasSpun, true), eq(wheelEntries.discountUsed, false)),
    )
    .returning()
  if (updated) return { status: 'ok', entry: toAdminEntry(updated) }

  const [existing] = await db.select().from(wheelEntries).where(eq(wheelEntries.id, entryId)).limit(1)
  if (!existing) return { status: 'not_found' }
  if (!existing.hasSpun) return { status: 'not_spun' }
  return { status: 'ok', entry: toAdminEntry(existing) }
}
