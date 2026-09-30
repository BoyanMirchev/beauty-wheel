import type { Discount } from './wheel-config'

/** The only entry fields the public wheel page ever receives. */
export type PublicEntry = {
  id: string
  firstName: string
  hasSpun: boolean
  discount: Discount | null
}

export type AdminEntry = {
  id: string
  firstName: string
  lastName: string
  phone: string
  discount: Discount | null
  hasSpun: boolean
  discountUsed: boolean
  createdAt: string
  spunAt: string | null
  usedAt: string | null
}
