import { getPublicEntry, isUuid } from '@/lib/wheel'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isUuid(id)) return Response.json({ entry: null }, { status: 404 })

  const entry = await getPublicEntry(id)
  return Response.json({ entry }, { status: entry ? 200 : 404, headers: { 'Cache-Control': 'no-store' } })
}
