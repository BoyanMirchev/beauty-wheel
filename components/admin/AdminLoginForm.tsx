'use client'

import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

type Mode = 'sign-in' | 'sign-up'

export function AdminLoginForm() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const emailError = !EMAIL_PATTERN.test(email.trim()) ? 'Моля, въведи валиден имейл.' : null
  const passwordError =
    password.length < MIN_PASSWORD_LENGTH ? `Паролата трябва да е поне ${MIN_PASSWORD_LENGTH} символа.` : null

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (emailError || passwordError || loading) return

    setLoading(true)
    setError(null)
    const normalizedEmail = email.trim().toLowerCase()
    const { error: authError } =
      mode === 'sign-in'
        ? await authClient.signIn.email({ email: normalizedEmail, password })
        : await authClient.signUp.email({ email: normalizedEmail, password, name: normalizedEmail.split('@')[0] })

    if (authError) {
      setError(
        mode === 'sign-in'
          ? 'Грешен имейл или парола.'
          : 'Неуспешна регистрация. Само одобрени администратори могат да създадат акаунт.',
      )
      setLoading(false)
      return
    }
    router.replace('/admin')
    router.refresh()
  }

  const isSignIn = mode === 'sign-in'

  return (
    <section
      aria-labelledby="admin-login-title"
      className="w-full max-w-sm rounded-3xl bg-card p-8 shadow-xl ring-1 ring-champagne/40"
    >
      <div className="mb-7 flex flex-col items-center gap-2 text-center">
        <span className="mb-2 h-px w-10 bg-champagne" aria-hidden="true" />
        <h1 id="admin-login-title" className="font-serif text-4xl font-medium text-foreground">
          Админ панел
        </h1>
        <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
          {isSignIn
            ? 'Влез, за да управляваш активните отстъпки.'
            : 'Създай своя администраторски акаунт с одобрения имейл.'}
        </p>
      </div>

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          error={submitted ? emailError : null}
        />
        <AuthField
          label="Парола"
          type="password"
          autoComplete={isSignIn ? 'current-password' : 'new-password'}
          value={password}
          onChange={setPassword}
          error={submitted ? passwordError : null}
        />

        {error && (
          <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-sm font-semibold tracking-wide text-background transition hover:bg-foreground/90 focus-visible:ring-4 focus-visible:ring-champagne/50 focus-visible:outline-none disabled:opacity-50"
        >
          {loading ? 'Моля, изчакай…' : isSignIn ? 'Вход' : 'Създай акаунт'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(isSignIn ? 'sign-up' : 'sign-in')
          setError(null)
          setSubmitted(false)
        }}
        className="mt-5 w-full text-center text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        {isSignIn ? 'Първо влизане? Създай акаунт' : 'Имаш акаунт? Вход'}
      </button>
    </section>
  )
}

type AuthFieldProps = {
  label: string
  type: string
  autoComplete: string
  value: string
  onChange: (value: string) => void
  error: string | null
}

function AuthField({ label, type, autoComplete, value, onChange, error }: AuthFieldProps) {
  const id = `admin-${type}`
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          'h-12 rounded-xl border bg-background px-4 text-base text-foreground outline-none transition',
          'focus-visible:border-champagne focus-visible:ring-3 focus-visible:ring-champagne/30',
          error ? 'border-destructive' : 'border-input',
        )}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
