import { markDiscountAsUsed } from '@/lib/admin-entries'
import { getAdminSession, unauthorized } from '@/lib/admin-session'
import { isUuid } from '@/lib/wheel'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return unauthorized()

  const { id } = await params
  if (!isUuid(id)) return Response.json({ error: 'Невалиден запис.' }, { status: 400 })

  const result = await markDiscountAsUsed(id)
  if (result.status === 'not_found') return Response.json({ error: 'Записът не е намерен.' }, { status: 404 })
  if (result.status === 'not_spun') {
    return Response.json({ error: 'Клиентът още не е завъртял колелото.' }, { status: 409 })
  }
  return Response.json({ entry: result.entry })
}
