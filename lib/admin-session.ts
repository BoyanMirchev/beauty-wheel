import 'server-only'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { isAdminEmail } from './admins'
import { auth } from './auth'

/** Verifies both a valid session AND that the user is on the admin allowlist. */
export async function getAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !isAdminEmail(session.user.email)) return null
  return session
}

export async function requireAdminPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  return session
}

export function unauthorized() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}
