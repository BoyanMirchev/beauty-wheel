import type { AdminEntry } from '@/lib/types'

export function StatsCards({ entries }: { entries: AdminEntry[] }) {
  const count = (predicate: (entry: AdminEntry) => boolean) => entries.filter(predicate).length

  const stats = [
    { label: 'Общо участници', value: entries.length },
    { label: '10% отстъпки', value: count((e) => e.discount === 10) },
    { label: '15% отстъпки', value: count((e) => e.discount === 15) },
    { label: '20% отстъпки', value: count((e) => e.discount === 20) },
    { label: 'Използвани', value: count((e) => e.discountUsed) },
    { label: 'Неизползвани', value: count((e) => e.hasSpun && !e.discountUsed) },
  ]

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4">
          <dt className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{stat.label}</dt>
          <dd className="font-serif text-3xl font-medium tabular-nums [font-variant-numeric:lining-nums_tabular-nums]">
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
