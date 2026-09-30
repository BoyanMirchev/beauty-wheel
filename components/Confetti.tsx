'use client'

import { useEffect, useRef } from 'react'

const PARTICLE_COUNT = 90
const DURATION_MS = 2600
const COLOR_VARS = ['--blush', '--champagne', '--nude', '--background']

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rotation: number
  spin: number
  color: string
}

export function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = window.innerWidth
    const height = window.innerHeight
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    const styles = getComputedStyle(document.documentElement)
    const colors = COLOR_VARS.map((name) => styles.getPropertyValue(name).trim())

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: width / 2 + (Math.random() - 0.5) * 80,
      y: height * 0.4,
      vx: (Math.random() - 0.5) * 9,
      vy: -Math.random() * 10 - 4,
      size: Math.random() * 6 + 4,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))

    const start = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const elapsed = now - start
      ctx.clearRect(0, 0, width, height)
      ctx.globalAlpha = Math.max(0, 1 - elapsed / DURATION_MS)

      for (const p of particles) {
        p.vy += 0.25
        p.vx *= 0.99
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.spin
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        ctx.restore()
      }

      if (elapsed < DURATION_MS) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] size-full" />
}
