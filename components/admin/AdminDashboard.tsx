'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useDeferredValue, useMemo, useState } from 'react'
import useSWR from 'swr'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { phoneSearchForms } from '@/lib/format'
import type { AdminEntry } from '@/lib/types'
import { cn } from '@/lib/utils'
import { EntriesTable } from './EntriesTable'
import { EntryDetails } from './EntryDetails'
import { StatsCards } from './StatsCards'

const FILTERS = [
  { id: 'all', label: 'Всички' },
  { id: '10', label: '10%' },
  { id: '15', label: '15%' },
  { id: '20', label: '20%' },
  { id: 'unused', label: 'Неизползвани' },
  { id: 'used', label: 'Използвани' },
] as const

type FilterId = (typeof FILTERS)[number]['id']
type SortOrder = 'newest' | 'oldest'

async function fetchEntries(url: string): Promise<AdminEntry[]> {
  const response = await fetch(url, { cache: 'no-store' })
  if (response.status === 401) {
    window.location.href = '/admin/login'
    return []
  }
  if (!response.ok) throw new Error('Неуспешно зареждане.')
  return (await response.json()).entries
}

function matchesFilter(entry: AdminEntry, filter: FilterId) {
  switch (filter) {
    case 'all':
      return true
    case 'used':
      return entry.discountUsed
    case 'unused':
      return entry.hasSpun && !entry.discountUsed
    default:
      return entry.discount === Number(filter)
  }
}

function matchesSearch(entry: AdminEntry, rawQuery: string) {
  const query = rawQuery.trim().toLowerCase()
  if (!query) return true

  const digits = query.replace(/\D/g, '')
  if (digits.length >= 3 && digits.length === query.replace(/[\s+()-]/g, '').length) {
    return phoneSearchForms(entry.phone).some((form) => form.includes(digits))
  }

  const fullName = `${entry.firstName} ${entry.lastName}`.toLowerCase()
  return query.split(/\s+/).every((part) => fullName.includes(part))
}

type AdminDashboardProps = {
  initialEntries: AdminEntry[]
  adminEmail: string
}

export function AdminDashboard({ initialEntries, adminEmail }: AdminDashboardProps) {
  const router = useRouter()
  const { data: entries = initialEntries, mutate } = useSWR('/api/admin/entries', fetchEntries, {
    fallbackData: initialEntries,
    revalidateOnMount: false,
    refreshInterval: 30_000,
  })

  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const [filter, setFilter] = useState<FilterId>('all')
  const [sort, setSort] = useState<SortOrder>('newest')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [marking, setMarking] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const visibleEntries = useMemo(() => {
    const filtered = entries.filter((entry) => matchesFilter(entry, filter) && matchesSearch(entry, deferredQuery))
    return sort === 'newest' ? filtered : [...filtered].reverse()
  }, [entries, filter, deferredQuery, sort])

  const selectedEntry = entries.find((entry) => entry.id === selectedId) ?? null

  async function confirmMarkUsed() {
    if (!confirmId || marking) return
    setMarking(true)
    setActionError(null)
    try {
      const response = await fetch(`/api/admin/entries/${confirmId}/use`, { method: 'POST' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error ?? 'Нещо се обърка.')
      const updated: AdminEntry = data.entry
      await mutate(
        (current) => current?.map((entry) => (entry.id === updated.id ? updated : entry)),
        { revalidate: false },
      )
      setConfirmId(null)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Нещо се обърка.')
    } finally {
      setMarking(false)
    }
  }

  async function signOut() {
    await authClient.signOut()
    router.replace('/admin/login')
    router.refresh()
  }

  return (
    <div className="min-h-dvh bg-background font-sans text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <span className="size-2 rounded-full bg-champagne" aria-hidden="true" />
            <p className="font-serif text-xl font-medium">Beauty Wheel</p>
            <span className="hidden text-xs text-muted-foreground sm:inline">{adminEmail}</span>
          </div>
          <Button variant="outline" size="sm" onClick={signOut}>
            Изход
          </Button>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:gap-8 md:px-8 md:py-10">
        <h1 className="font-serif text-3xl font-medium text-balance md:text-4xl">Клиенти и отстъпки</h1>

        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <label htmlFor="entry-search" className="sr-only">
            Търсене
          </label>
          <input
            id="entry-search"
            type="search"
            inputMode="search"
            autoComplete="off"
            placeholder="Търси по име или телефон..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-14 w-full rounded-2xl border border-input bg-card pr-4 pl-12 text-base shadow-sm outline-none transition focus-visible:border-champagne focus-visible:ring-3 focus-visible:ring-champagne/30"
          />
        </div>

        <StatsCards entries={entries} />

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div role="group" aria-label="Филтър" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
            {FILTERS.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={filter === option.id}
                onClick={() => setFilter(option.id)}
                className={cn(
                  'h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition',
                  filter === option.id
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-card text-foreground hover:border-champagne',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="entry-sort" className="text-sm text-muted-foreground">
              Подреди:
            </label>
            <select
              id="entry-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOrder)}
              className="h-9 rounded-full border border-border bg-card px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-champagne/30"
            >
              <option value="newest">Най-нови първо</option>
              <option value="oldest">Най-стари първо</option>
            </select>
          </div>
        </div>

        <EntriesTable entries={visibleEntries} onSelect={setSelectedId} onMarkUsed={setConfirmId} />
      </main>

      <EntryDetails
        entry={selectedEntry}
        onClose={() => setSelectedId(null)}
        onMarkUsed={(id) => setConfirmId(id)}
      />

      <AlertDialog
        open={confirmId !== null}
        onOpenChange={(open) => {
          if (!open && !marking) {
            setConfirmId(null)
            setActionError(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Потвърждение</AlertDialogTitle>
            <AlertDialogDescription>
              Сигурни ли сте, че искате да маркирате тази отстъпка като използвана?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {actionError && (
            <p role="alert" className="text-sm text-destructive">
              {actionError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={marking}>Отказ</AlertDialogCancel>
            <Button onClick={confirmMarkUsed} disabled={marking}>
              {marking ? 'Запазване…' : 'Да, маркирай'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
