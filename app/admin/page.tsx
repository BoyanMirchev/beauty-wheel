import type { Metadata } from 'next'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { listEntries } from '@/lib/admin-entries'
import { requireAdminPage } from '@/lib/admin-session'

export const metadata: Metadata = {
  title: 'Клиенти и отстъпки | Админ панел',
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  const session = await requireAdminPage()
  const entries = await listEntries()

  return <AdminDashboard initialEntries={entries} adminEmail={session.user.email} />
}
