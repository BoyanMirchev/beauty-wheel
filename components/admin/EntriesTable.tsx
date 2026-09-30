import { Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate, formatPhone } from '@/lib/format'
import type { AdminEntry } from '@/lib/types'
import { cn } from '@/lib/utils'

type EntriesTableProps = {
  entries: AdminEntry[]
  onSelect: (id: string) => void
  onMarkUsed: (id: string) => void
}

export function EntriesTable({ entries, onSelect, onMarkUsed }: EntriesTableProps) {
  if (entries.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
        Няма намерени участници.
      </p>
    )
  }

  return (
    <>
      <ul className="flex flex-col gap-3 md:hidden">
        {entries.map((entry) => (
          <li key={entry.id} className="rounded-2xl border border-border bg-card p-4">
            <button
              type="button"
              onClick={() => onSelect(entry.id)}
              className="flex w-full items-start justify-between gap-3 text-left"
            >
              <span className="flex flex-col gap-1">
                <span className="font-medium">
                  {entry.firstName} {entry.lastName}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground tabular-nums">
                  <Phone className="size-3.5" aria-hidden="true" />
                  {formatPhone(entry.phone)}
                </span>
                <span className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</span>
              </span>
              <DiscountBadge discount={entry.discount} />
            </button>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
              <StatusLabel entry={entry} />
              <MarkUsedAction entry={entry} onMarkUsed={onMarkUsed} />
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-nude/30 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">Име</th>
              <th scope="col" className="px-5 py-3 font-semibold">Телефон</th>
              <th scope="col" className="px-5 py-3 font-semibold">Отстъпка</th>
              <th scope="col" className="px-5 py-3 font-semibold">Дата</th>
              <th scope="col" className="px-5 py-3 font-semibold">Статус</th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">Действие</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map((entry) => (
              <tr key={entry.id} className="transition-colors hover:bg-blush/15">
                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => onSelect(entry.id)}
                    className="font-medium underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
                  >
                    {entry.firstName} {entry.lastName}
                  </button>
                </td>
                <td className="px-5 py-4 tabular-nums">{formatPhone(entry.phone)}</td>
                <td className="px-5 py-4">
                  <DiscountBadge discount={entry.discount} />
                </td>
                <td className="px-5 py-4 text-muted-foreground tabular-nums">{formatDate(entry.createdAt)}</td>
                <td className="px-5 py-4">
                  <StatusLabel entry={entry} />
                </td>
                <td className="px-5 py-4 text-right">
                  <MarkUsedAction entry={entry} onMarkUsed={onMarkUsed} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function DiscountBadge({ discount }: { discount: number | null }) {
  if (discount == null) return <span className="text-sm text-muted-foreground">—</span>
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center rounded-full px-3 font-serif text-base font-semibold [font-variant-numeric:lining-nums]',
        discount === 20 ? 'bg-champagne/25 text-foreground ring-1 ring-champagne' : discount === 15 ? 'bg-blush/50' : 'bg-nude/60',
      )}
    >
      {discount}%
    </span>
  )
}

export function StatusLabel({ entry }: { entry: AdminEntry }) {
  if (!entry.hasSpun) return <span className="text-sm text-muted-foreground">Не е завъртял</span>
  if (entry.discountUsed) {
    return (
      <span className="flex flex-col">
        <span className="text-sm font-medium text-muted-foreground">Използвана</span>
        {entry.usedAt && <span className="text-xs text-muted-foreground tabular-nums">{formatDate(entry.usedAt)}</span>}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium">
      <span className="size-1.5 rounded-full bg-champagne" aria-hidden="true" />
      Неизползвана
    </span>
  )
}

function MarkUsedAction({ entry, onMarkUsed }: { entry: AdminEntry; onMarkUsed: (id: string) => void }) {
  if (!entry.hasSpun || entry.discountUsed) return null
  return (
    <Button size="sm" onClick={() => onMarkUsed(entry.id)}>
      Маркирай като използвана
    </Button>
  )
}
