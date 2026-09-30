const TIME_ZONE = 'Europe/Sofia'

const dateFormatter = new Intl.DateTimeFormat('bg-BG', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: TIME_ZONE,
})

const dateTimeFormatter = new Intl.DateTimeFormat('bg-BG', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: TIME_ZONE,
})

export function formatDate(iso: string | null) {
  return iso ? dateFormatter.format(new Date(iso)).replace(/\s?г\.?$/, '') : '—'
}

export function formatDateTime(iso: string | null) {
  return iso ? dateTimeFormatter.format(new Date(iso)).replace(' г.', '') : '—'
}

/** +359888123456 → 0888 123 456 */
export function formatPhone(normalized: string) {
  const local = normalized.startsWith('+359') ? `0${normalized.slice(4)}` : normalized
  return local.length === 10 ? `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}` : local
}

/** Digits that a phone search should match against (both 0888… and 359888… forms). */
export function phoneSearchForms(normalized: string) {
  const national = normalized.replace(/^\+359/, '')
  return [`0${national}`, `359${national}`]
}
