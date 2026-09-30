'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatDateTime, formatPhone } from '@/lib/format'
import type { AdminEntry } from '@/lib/types'
import { DiscountBadge, StatusLabel } from './EntriesTable'

type EntryDetailsProps = {
  entry: AdminEntry | null
  onClose: () => void
  onMarkUsed: (id: string) => void
}

export function EntryDetails({ entry, onClose, onMarkUsed }: EntryDetailsProps) {
  return (
    <Dialog open={entry !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        {entry && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl font-medium">
                {entry.firstName} {entry.lastName}
              </DialogTitle>
              <DialogDescription>Детайли за участника</DialogDescription>
            </DialogHeader>

            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
              <Row label="Име">{entry.firstName}</Row>
              <Row label="Фамилия">{entry.lastName}</Row>
              <Row label="Телефон">
                <a href={`tel:${entry.phone}`} className="tabular-nums underline-offset-4 hover:underline">
                  {formatPhone(entry.phone)}
                </a>
              </Row>
              <Row label="Отстъпка">
                <DiscountBadge discount={entry.discount} />
              </Row>
              <Row label="Дата на регистрация">{formatDateTime(entry.createdAt)}</Row>
              <Row label="Дата на завъртане">{formatDateTime(entry.spunAt)}</Row>
              <Row label="Статус">
                <StatusLabel entry={entry} />
              </Row>
              <Row label="Дата на използване">{formatDateTime(entry.usedAt)}</Row>
            </dl>

            {entry.hasSpun && !entry.discountUsed && (
              <Button className="mt-2 w-full" onClick={() => onMarkUsed(entry.id)}>
                Маркирай като използвана
              </Button>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{children}</dd>
    </>
  )
}
