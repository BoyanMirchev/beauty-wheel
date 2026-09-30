'use client'

import { useEffect, useRef, useState } from 'react'
import {
  type Discount,
  REDUCED_MOTION_SPIN_DURATION_MS,
  SEGMENT_ANGLE,
  SPIN_DURATION_MS,
  computeTargetRotation,
  pickSegmentIndex,
  segmentIndexAtPointer,
  segments,
} from '@/lib/wheel-config'
import { cn } from '@/lib/utils'

const SIZE = 400
const CENTER = SIZE / 2
const RADIUS = 188
const LABEL_RADIUS = 128
const SEGMENT_FILLS = ['var(--blush)', 'var(--nude)', 'var(--background)']

function pointAt(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: CENTER + radius * Math.sin(rad), y: CENTER - radius * Math.cos(rad) }
}

function segmentPath(index: number) {
  const start = pointAt(index * SEGMENT_ANGLE, RADIUS)
  const end = pointAt((index + 1) * SEGMENT_ANGLE, RADIUS)
  return `M${CENTER},${CENTER} L${start.x},${start.y} A${RADIUS},${RADIUS} 0 0 1 ${end.x},${end.y} Z`
}

type FortuneWheelProps = {
  /** Asks the server for the prize; the wheel only animates toward it. */
  requestPrize: () => Promise<Discount>
  onResult: (discount: Discount) => void
  onError: (message: string) => void
  locked?: boolean
}

export function FortuneWheel({ requestPrize, onResult, onError, locked = false }: FortuneWheelProps) {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [duration, setDuration] = useState(SPIN_DURATION_MS)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  const disabled = locked || spinning || requesting

  async function spin() {
    if (disabled) return

    setRequesting(true)
    let prize: Discount
    try {
      prize = await requestPrize()
    } catch (error) {
      setRequesting(false)
      onError(error instanceof Error ? error.message : 'Нещо се обърка. Моля, опитай отново.')
      return
    }
    setRequesting(false)

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const spinDuration = reducedMotion ? REDUCED_MOTION_SPIN_DURATION_MS : SPIN_DURATION_MS
    const target = computeTargetRotation(rotation, pickSegmentIndex(prize), Math.random, reducedMotion ? 1 : undefined)

    setDuration(spinDuration)
    setSpinning(true)
    setRotation(target)

    timeoutRef.current = setTimeout(() => {
      setSpinning(false)
      // Derive the result from the final angle so it always matches what's under the pointer.
      onResult(segments[segmentIndexAtPointer(target)])
    }, spinDuration + 150)
  }

  return (
    <div className="relative w-[min(86vw,340px)] md:w-[400px]">
      <svg
        aria-hidden="true"
        viewBox="0 0 40 32"
        className="absolute top-0 left-1/2 z-20 w-9 -translate-x-1/2 -translate-y-2/5 drop-shadow-md"
      >
        <path d="M20 31 L4 4 Q20 -2 36 4 Z" fill="var(--champagne)" stroke="var(--background)" strokeWidth="2" />
      </svg>

      <button
        type="button"
        onClick={spin}
        disabled={disabled}
        aria-label={spinning ? 'Колелото се върти' : 'Завърти колелото'}
        aria-busy={spinning || requesting}
        className={cn(
          'group relative block aspect-square w-full rounded-full outline-none',
          'transition-transform duration-200 ease-out',
          'focus-visible:ring-4 focus-visible:ring-champagne/60 focus-visible:ring-offset-4 focus-visible:ring-offset-foreground',
          !disabled && 'cursor-pointer active:scale-[0.97] motion-reduce:active:scale-100',
          disabled && 'cursor-default',
        )}
      >
        <span className="absolute inset-0 rounded-full shadow-[0_24px_60px_-12px_rgb(0_0_0/0.6)]" aria-hidden="true" />

        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="relative size-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? `transform ${duration}ms cubic-bezier(0.12, 0.72, 0.1, 1)` : 'none',
          }}
        >
          <circle cx={CENTER} cy={CENTER} r={RADIUS + 8} fill="var(--champagne)" />
          <circle cx={CENTER} cy={CENTER} r={RADIUS + 2} fill="var(--background)" />
          {segments.map((discount, index) => {
            const centerAngle = index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2
            return (
              <g key={index}>
                <path
                  d={segmentPath(index)}
                  fill={SEGMENT_FILLS[index % SEGMENT_FILLS.length]}
                  stroke="var(--champagne)"
                  strokeWidth="1.5"
                />
                <text
                  x={CENTER}
                  y={CENTER - LABEL_RADIUS}
                  transform={`rotate(${centerAngle} ${CENTER} ${CENTER})`}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="var(--foreground)"
                  className="font-serif"
                  style={{ fontSize: 44, fontWeight: 600, fontVariantNumeric: 'lining-nums' }}
                >
                  {discount}%
                </text>
              </g>
            )
          })}
          {segments.map((_, index) => {
            const dot = pointAt(index * SEGMENT_ANGLE, RADIUS + 5)
            return <circle key={`dot-${index}`} cx={dot.x} cy={dot.y} r="3" fill="var(--background)" />
          })}
        </svg>

        <span
          className={cn(
            'absolute top-1/2 left-1/2 flex size-[30%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full',
            'border-4 border-champagne bg-foreground text-xs font-semibold tracking-[0.2em] text-background md:text-sm',
            'shadow-lg transition-transform duration-200',
            !disabled && 'group-hover:scale-105 motion-reduce:group-hover:scale-100',
          )}
        >
          ЗАВЪРТИ
        </span>
      </button>
    </div>
  )
}
