const NAME_PATTERN = /^[\p{L}]+(?:[\s-][\p{L}]+)*$/u

export function validateName(value: string, label: 'името' | 'фамилията'): string | null {
  const trimmed = value.trim()
  if (!trimmed) return `Моля, въведи ${label} си.`
  if (!NAME_PATTERN.test(trimmed)) return 'Използвай само букви.'
  if (trimmed.replace(/[\s-]/g, '').length < 2) return 'Минимум 2 букви.'
  return null
}

// National significant number (without leading 0 / +359): mobiles 87/88/89/98/99 + 7 digits,
// or landlines starting 2–7 with 7–8 more digits.
const BG_NATIONAL_NUMBER = /^(?:(?:8[789]|9[89])\d{7}|[2-7]\d{7,8})$/

export function normalizeBulgarianPhone(value: string): string | null {
  const compact = value.replace(/[\s().-]/g, '')
  let national: string | null = null

  if (compact.startsWith('+359')) national = compact.slice(4)
  else if (compact.startsWith('00359')) national = compact.slice(5)
  else if (compact.startsWith('359')) national = compact.slice(3)
  else if (compact.startsWith('0')) national = compact.slice(1)

  if (!national || !BG_NATIONAL_NUMBER.test(national)) return null
  return `+359${national}`
}

export function validatePhone(value: string): string | null {
  if (!value.trim()) return 'Моля, въведи телефонен номер.'
  return normalizeBulgarianPhone(value) ? null : 'Моля, въведи валиден телефонен номер.'
}
