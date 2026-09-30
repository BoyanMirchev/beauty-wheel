'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Discount } from '@/lib/wheel-config'
import { type WheelProgress, readProgress, resetWheelProgress, saveSpinResult } from '@/lib/wheel-storage'
import { DiscountCard } from './DiscountCard'
import { FortuneWheel } from './FortuneWheel'
import { LeadForm } from './LeadForm'
import { WinnerModal } from './WinnerModal'

const FORM_EXIT_MS = 400

export function BeautyWheelExperience() {
  const [progress, setProgress] = useState<WheelProgress | null>(null)
  const [formLeaving, setFormLeaving] = useState(false)
  const [winner, setWinner] = useState<Discount | null>(null)

  useEffect(() => {
    // localStorage only exists on the client, so the initial stage is resolved after mount.
    setProgress(readProgress())
  }, [])

  const handleResult = useCallback((discount: Discount) => {
    saveSpinResult(discount)
    setWinner(discount)
  }, [])

  const closeWinner = useCallback(() => {
    setWinner(null)
    setProgress(readProgress())
  }, [])

  if (!progress) {
    return <div className="aspect-square w-[min(86vw,340px)]" aria-hidden="true" />
  }

  return (
    <>
      {progress.stage === 'form' && (
        <div
          className={
            formLeaving
              ? 'w-full max-w-sm transition duration-400 ease-in -translate-y-4 opacity-0 motion-reduce:translate-y-0'
              : 'flex w-full justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 motion-reduce:animate-none'
          }
        >
          <LeadForm
            onSuccess={(lead) => {
              setFormLeaving(true)
              setTimeout(() => {
                setFormLeaving(false)
                setProgress({ stage: 'wheel', lead })
              }, FORM_EXIT_MS)
            }}
          />
        </div>
      )}

      {progress.stage === 'wheel' && (
        <section
          aria-labelledby="wheel-title"
          className="flex w-full flex-col items-center gap-10 animate-in fade-in slide-in-from-bottom-6 duration-700 motion-reduce:animate-none"
        >
          <header className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-champagne">Имаш късмет днес ✨</p>
            <h1
              id="wheel-title"
              className="font-serif text-4xl leading-[1.05] font-medium text-balance text-background md:text-5xl"
            >
              Завърти колелото и спечели отстъпка
            </h1>
            <p className="max-w-xs text-sm leading-relaxed text-pretty text-background/75">
              Опитай късмета си и вземи своята отстъпка за следващото си посещение.
            </p>
          </header>

          <div className="animate-in fade-in zoom-in-95 duration-1000 delay-200 fill-mode-both motion-reduce:animate-none">
            <FortuneWheel onResult={handleResult} locked={winner !== null} />
          </div>
        </section>
      )}

      {progress.stage === 'played' && (
        <section
          aria-labelledby="played-title"
          className="w-full max-w-sm rounded-3xl bg-card p-7 shadow-2xl ring-1 ring-champagne/40 animate-in fade-in zoom-in-95 duration-500 motion-reduce:animate-none"
        >
          <h1 id="played-title" className="sr-only">
            Твоята отстъпка
          </h1>
          <DiscountCard
            discount={progress.discount}
            eyebrow="Ти вече завъртя колелото ✨"
            intro={progress.lead ? `${progress.lead.firstName}, твоята награда е` : 'Твоята награда е'}
          />
        </section>
      )}

      {winner !== null && <WinnerModal discount={winner} onClose={closeWinner} />}

      {process.env.NODE_ENV === 'development' && (
        <button
          type="button"
          onClick={() => {
            resetWheelProgress()
            setWinner(null)
            setProgress({ stage: 'form' })
          }}
          className="fixed right-3 bottom-3 z-[70] rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground shadow ring-1 ring-border"
        >
          Dev: нулирай
        </button>
      )}
    </>
  )
}
