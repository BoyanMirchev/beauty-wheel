import { BOOKING_URL, type Discount } from '@/lib/wheel-config'

type DiscountCardProps = {
  discount: Discount
  eyebrow: string
  intro: string
  headingId?: string
}

export function DiscountCard({ discount, eyebrow, intro, headingId }: DiscountCardProps) {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="flex flex-col items-center gap-1">
        <p id={headingId} className="font-serif text-3xl text-foreground italic">
          {eyebrow}
        </p>
        <p className="text-sm tracking-wide text-muted-foreground">{intro}</p>
      </div>

      <div className="w-full rounded-2xl border border-dashed border-champagne bg-blush/40 px-4 py-6">
        <p className="font-serif text-6xl leading-none font-semibold lining-nums text-foreground">{discount}%</p>
        <p className="mt-2 text-sm font-semibold tracking-[0.35em] text-foreground">ОТСТЪПКА</p>
      </div>

      <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
        Покажи този екран при записване на час, за да използваш отстъпката си.
      </p>

      <a
        href={BOOKING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold tracking-wide text-primary-foreground transition hover:bg-primary/90 focus-visible:ring-4 focus-visible:ring-champagne/50 focus-visible:outline-none active:scale-[0.98]"
      >
        Запази своя час
      </a>

      <p className="text-xs text-muted-foreground">Отстъпката важи за едно посещение.</p>
    </div>
  )
}
