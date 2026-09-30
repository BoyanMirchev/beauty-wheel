'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { Discount } from '@/lib/wheel-config'
import { Confetti } from './Confetti'
import { DiscountCard } from './DiscountCard'

type WinnerModalProps = {
  discount: Discount
  onClose: () => void
}

export function WinnerModal({ discount, onClose }: WinnerModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <>
      <Confetti />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-5 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="winner-title"
          onClick={(event) => event.stopPropagation()}
          className="relative w-full max-w-sm rounded-3xl bg-card p-7 pt-9 shadow-2xl ring-1 ring-champagne/40 animate-in zoom-in-90 fade-in duration-500 motion-reduce:animate-none"
        >
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Затвори"
            className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-champagne focus-visible:outline-none"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
          <DiscountCard discount={discount} eyebrow="Честито! ✨" intro="Ти спечели" headingId="winner-title" />
        </div>
      </div>
    </>
  )
}
