import Image from 'next/image'
import { BeautyWheelExperience } from '@/components/BeautyWheelExperience'

export default function Page() {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-foreground">
      <Image
        src="/images/lash-brushes.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-right"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-foreground/75 via-foreground/55 to-foreground/85"
      />

      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center px-5 pt-10 pb-8">
        <p className="font-serif text-sm tracking-[0.35em] text-champagne uppercase">Lash &amp; Brow</p>

        <div className="flex w-full flex-1 flex-col items-center justify-center py-8">
          <BeautyWheelExperience />
        </div>

        <footer className="text-center text-xs leading-relaxed text-background/60">
          Удължаване на мигли · Лифтинг на мигли · Ламиниране на вежди
        </footer>
      </div>
    </main>
  )
}
