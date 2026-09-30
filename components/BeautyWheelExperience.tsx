'use client'

import { useCallback, useState } from 'react'
import useSWR from 'swr'
import type { PublicEntry } from '@/lib/types'
import type { Discount } from '@/lib/wheel-config'
import { clearStoredEntryId, fetchEntry, readStoredEntryId, requestSpin, storeEntryId } from '@/lib/wheel-storage'
import { DiscountCard } from './DiscountCard'
import { FortuneWheel } from './FortuneWheel'
import { LeadForm } from './LeadForm'
import { WinnerModal } from './WinnerModal'

const FORM_EXIT_MS = 400

async function loadStoredEntry(): Promise<PublicEntry | null> {
  const id = readStoredEntryId()
  if (!id) return null
  const entry = await fetchEntry(id)
  if (!entry) clearStoredEntryId()
  return entry
}

export function BeautyWheelExperience() {
  const { data: entry, isLoading, mutate } = useSWR('wheel-entry', loadStoredEntry, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })
  const [formLeaving, setFormLeaving] = useState(false)
  const [winner, setWinner] = useState<Discount | null>(null)
  const [spinError, setSpinError] = useState<string | null>(null)

  const requestPrize = useCallback(async () => {
    if (!entry) throw new Error('Регистрацията не е намерена.')
    setSpinError(null)
    const result = await requestSpin(entry.id)
    if (result.status === 'already_spun') {
      await mutate(result.entry, { revalidate: false })
      throw new Error('Ти вече завъртя колелото.')
    }
    return result.entry.discount as Discount
  }, [entry, mutate])

  const handleResult = useCallback((discount: Discount) => setWinner(discount), [])

  const closeWinner = useCallback(() => {
    setWinner(null)
    if (entry && winner) void mutate({ ...entry, hasSpun: true, discount: winner }, { revalidate: false })
  }, [entry, winner, mutate])

  if (isLoading) {
    return <div className="aspect-square w-[min(86vw,340px)]" aria-hidden="true" />
  }

  const stage = !entry ? 'form' : entry.hasSpun && winner === null ? 'played' : 'wheel'

  return (
    <>
      {stage === 'form' && (
        <div
          className={
            formLeaving
              ? 'w-full max-w-sm transition duration-400 ease-in -translate-y-4 opacity-0 motion-reduce:translate-y-0'
              : 'flex w-full justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 motion-reduce:animate-none'
          }
        >
          <LeadForm
            onSuccess={(registered) => {
              storeEntryId(registered.id)
              setFormLeaving(true)
              setTimeout(() => {
                setFormLeaving(false)
                void mutate(registered, { revalidate: false })
              }, FORM_EXIT_MS)
            }}
          />
        </div>
      )}

      {stage === 'wheel' && (
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
            <FortuneWheel
              requestPrize={requestPrize}
              onResult={handleResult}
              onError={setSpinError}
              locked={winner !== null}
            />
          </div>

          {spinError && (
            <p role="alert" className="-mt-4 text-center text-sm text-champagne">
              {spinError}
            </p>
          )}
        </section>
      )}

      {stage === 'played' && entry?.discount != null && (
        <section
          aria-labelledby="played-title"
          className="w-full max-w-sm rounded-3xl bg-card p-7 shadow-2xl ring-1 ring-champagne/40 animate-in fade-in zoom-in-95 duration-500 motion-reduce:animate-none"
        >
          <h1 id="played-title" className="sr-only">
            Твоята отстъпка
          </h1>
          <DiscountCard
            discount={entry.discount}
            eyebrow="Ти вече завъртя колелото ✨"
            intro={`${entry.firstName}, твоята награда е`}
          />
        </section>
      )}

      {winner !== null && <WinnerModal discount={winner} onClose={closeWinner} />}
    </>
  )
}
