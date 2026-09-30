'use client'

import { type FormEvent, useId, useState } from 'react'
import { normalizeBulgarianPhone, validateName, validatePhone } from '@/lib/validation'
import { type Lead, submitLead } from '@/lib/wheel-storage'
import { cn } from '@/lib/utils'

type FieldName = 'firstName' | 'lastName' | 'phone'

type LeadFormProps = {
  onSuccess: (lead: Lead) => void
}

export function LeadForm({ onSuccess }: LeadFormProps) {
  const [values, setValues] = useState<Record<FieldName, string>>({ firstName: '', lastName: '', phone: '' })
  const [touched, setTouched] = useState<Record<FieldName, boolean>>({
    firstName: false,
    lastName: false,
    phone: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const errors: Record<FieldName, string | null> = {
    firstName: validateName(values.firstName, 'името'),
    lastName: validateName(values.lastName, 'фамилията'),
    phone: validatePhone(values.phone),
  }
  const isValid = !errors.firstName && !errors.lastName && !errors.phone

  const update = (name: FieldName) => (value: string) => setValues((prev) => ({ ...prev, [name]: value }))
  const markTouched = (name: FieldName) => () => setTouched((prev) => ({ ...prev, [name]: true }))

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched({ firstName: true, lastName: true, phone: true })
    const phone = normalizeBulgarianPhone(values.phone)
    if (!isValid || !phone || submitting) return

    const lead: Lead = { firstName: values.firstName.trim(), lastName: values.lastName.trim(), phone }
    setSubmitting(true)
    setSubmitError(null)
    try {
      await submitLead(lead)
      onSuccess(lead)
    } catch {
      setSubmitError('Нещо се обърка. Моля, опитай отново.')
      setSubmitting(false)
    }
  }

  return (
    <section
      aria-labelledby="lead-title"
      className="w-full max-w-sm rounded-3xl bg-card p-7 shadow-2xl ring-1 ring-champagne/40"
    >
      <div className="mb-6 flex flex-col gap-2 text-center">
        <h1 id="lead-title" className="font-serif text-3xl leading-tight font-medium text-balance text-foreground">
          Отключи своето колело ✨
        </h1>
        <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
          Въведи данните си, за да завъртиш колелото и да спечелиш отстъпка.
        </p>
      </div>

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field
          label="Име"
          autoComplete="given-name"
          value={values.firstName}
          onChange={update('firstName')}
          onBlur={markTouched('firstName')}
          error={touched.firstName ? errors.firstName : null}
        />
        <Field
          label="Фамилия"
          autoComplete="family-name"
          value={values.lastName}
          onChange={update('lastName')}
          onBlur={markTouched('lastName')}
          error={touched.lastName ? errors.lastName : null}
        />
        <Field
          label="Телефонен номер"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0888 123 456"
          value={values.phone}
          onChange={update('phone')}
          onBlur={markTouched('phone')}
          error={touched.phone ? errors.phone : null}
        />

        {submitError && (
          <p role="alert" className="text-sm text-destructive">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={!isValid || submitting}
          className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold tracking-wide text-primary-foreground transition hover:bg-primary/90 focus-visible:ring-4 focus-visible:ring-champagne/50 focus-visible:outline-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
        >
          {submitting ? 'Отключване…' : 'Отключи колелото'}
        </button>
      </form>
    </section>
  )
}

type FieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  error: string | null
  type?: string
  inputMode?: 'tel' | 'text'
  autoComplete?: string
  placeholder?: string
}

function Field({ label, value, onChange, onBlur, error, type = 'text', ...rest }: FieldProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'h-12 rounded-xl border bg-background px-4 text-base text-foreground transition outline-none placeholder:text-muted-foreground/60',
          'focus-visible:border-champagne focus-visible:ring-3 focus-visible:ring-champagne/30',
          error ? 'border-destructive' : 'border-input',
        )}
        {...rest}
      />
      {error && (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
