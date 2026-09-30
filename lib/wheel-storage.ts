import type { PublicEntry } from './types'

export type Lead = {
  firstName: string
  lastName: string
  phone: string
}

// Convenience only: remembers which entry this browser registered. The server
// is always asked for the real status, so clearing this never grants a new spin.
const ENTRY_KEY = 'beautyWheelEntryId'

export function readStoredEntryId() {
  try {
    return localStorage.getItem(ENTRY_KEY)
  } catch {
    return null
  }
}

export function storeEntryId(id: string) {
  try {
    localStorage.setItem(ENTRY_KEY, id)
  } catch {}
}

export function clearStoredEntryId() {
  try {
    localStorage.removeItem(ENTRY_KEY)
  } catch {}
}

async function readJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error ?? 'Нещо се обърка. Моля, опитай отново.')
  return data as T
}

export async function fetchEntry(id: string): Promise<PublicEntry | null> {
  const response = await fetch(`/api/wheel/entry/${encodeURIComponent(id)}`, { cache: 'no-store' })
  if (response.status === 404) return null
  const { entry } = await readJson<{ entry: PublicEntry }>(response)
  return entry
}

export async function registerLead(lead: Lead): Promise<PublicEntry> {
  const response = await fetch('/api/wheel/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead),
  })
  const { entry } = await readJson<{ entry: PublicEntry }>(response)
  return entry
}

export async function requestSpin(entryId: string) {
  const response = await fetch('/api/wheel/spin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entryId }),
  })
  return readJson<{ status: 'won' | 'already_spun'; entry: PublicEntry }>(response)
}
