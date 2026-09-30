import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AdminLoginForm } from '@/components/admin/AdminLoginForm'
import { getAdminSession } from '@/lib/admin-session'

export const metadata: Metadata = {
  title: 'Вход | Админ панел',
  robots: { index: false, follow: false },
}

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect('/admin')

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-5 py-12 font-sans">
      <AdminLoginForm />
    </main>
  )
}
