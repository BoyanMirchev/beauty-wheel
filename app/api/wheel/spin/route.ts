import { isUuid, spinWheel } from '@/lib/wheel'

export async function POST(request: Request) {
  let entryId: unknown
  try {
    ;({ entryId } = await request.json())
  } catch {
    return Response.json({ error: 'Невалидна заявка.' }, { status: 400 })
  }
  if (!isUuid(entryId)) return Response.json({ error: 'Невалидна заявка.' }, { status: 400 })

  try {
    const result = await spinWheel(entryId)
    if (result.status === 'not_found') {
      return Response.json({ error: 'Регистрацията не е намерена.' }, { status: 404 })
    }
    return Response.json(result)
  } catch (error) {
    console.error('[wheel/spin] failed', error)
    return Response.json({ error: 'Нещо се обърка. Моля, опитай отново.' }, { status: 500 })
  }
}
