import { normalizeBulgarianPhone, validateName } from '@/lib/validation'
import { registerEntry } from '@/lib/wheel'

const MAX_NAME_LENGTH = 100

function badRequest(error: string) {
  return Response.json({ error }, { status: 400 })
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return badRequest('Невалидна заявка.')
  }

  const { firstName, lastName, phone } = body ?? {}
  if (typeof firstName !== 'string' || typeof lastName !== 'string' || typeof phone !== 'string') {
    return badRequest('Моля, попълни всички полета.')
  }

  const nameError = validateName(firstName, 'името') ?? validateName(lastName, 'фамилията')
  if (nameError) return badRequest(nameError)
  if (firstName.trim().length > MAX_NAME_LENGTH || lastName.trim().length > MAX_NAME_LENGTH) {
    return badRequest('Името е твърде дълго.')
  }

  const normalizedPhone = normalizeBulgarianPhone(phone)
  if (!normalizedPhone) return badRequest('Моля, въведи валиден телефонен номер.')

  try {
    const result = await registerEntry({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: normalizedPhone,
    })
    return Response.json(result)
  } catch (error) {
    console.error('[wheel/register] failed', error)
    return Response.json({ error: 'Нещо се обърка. Моля, опитай отново.' }, { status: 500 })
  }
}
