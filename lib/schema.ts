import { boolean, integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const wheelEntries = pgTable('wheel_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 30 }).notNull().unique(),
  discount: integer('discount'),
  hasSpun: boolean('has_spun').notNull().default(false),
  discountUsed: boolean('discount_used').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  spunAt: timestamp('spun_at', { withTimezone: true }),
  usedAt: timestamp('used_at', { withTimezone: true }),
})

export type WheelEntryRow = typeof wheelEntries.$inferSelect
