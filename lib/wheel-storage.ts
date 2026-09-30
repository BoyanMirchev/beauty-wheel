import type { Discount } from './wheel-config'
import { segments } from './wheel-config'

export type Lead = {
  firstName: string
  lastName: string
  phone: string
}

const KEYS = {
  registered: 'beautyWheelRegistered',
  user: 'beautyWheelUser',
  played: 'beautyWheelPlayed',
  discount: 'beautyWheelDiscount',
} as const

export type WheelProgress =
  | { stage: 'form' }
  | { stage: 'wheel'; lead: Lead }
  | { stage: 'played'; lead: Lead | null; discount: Discount }

function readLead(): Lead | null {
  try {
    const raw = localStorage.getItem(KEYS.user)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Lead>
    if (parsed.firstName && parsed.lastName && parsed.phone) return parsed as Lead
  } catch {}
  return null
}

export function readProgress(): WheelProgress {
  const discount = Number(localStorage.getItem(KEYS.discount)) as Discount
  const lead = readLead()

  if (localStorage.getItem(KEYS.played) === 'true' && segments.includes(discount)) {
    return { stage: 'played', lead, discount }
  }
  if (localStorage.getItem(KEYS.registered) === 'true' && lead) {
    return { stage: 'wheel', lead }
  }
  return { stage: 'form' }
}

/**
 * Single entry point for persisting a lead. Swap the body for a
 * `fetch('/api/leads', { method: 'POST', body: JSON.stringify(lead) })`
 * (Neon / Supabase / Route Handler) without touching the UI.
 */
export async function submitLead(lead: Lead): Promise<void> {
  localStorage.setItem(KEYS.user, JSON.stringify(lead))
  localStorage.setItem(KEYS.registered, 'true')
}

export function saveSpinResult(discount: Discount) {
  localStorage.setItem(KEYS.played, 'true')
  localStorage.setItem(KEYS.discount, String(discount))
}

export function resetWheelProgress() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key))
}
