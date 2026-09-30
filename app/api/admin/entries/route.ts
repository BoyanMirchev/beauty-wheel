import { listEntries } from '@/lib/admin-entries'
import { getAdminSession, unauthorized } from '@/lib/admin-session'

export async function GET() {
  if (!(await getAdminSession())) return unauthorized()

  const entries = await listEntries()
  return Response.json({ entries }, { headers: { 'Cache-Control': 'no-store' } })
}
