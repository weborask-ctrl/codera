"use client"

import { useId, useRef, useState } from "react"

import { commercial, siteConfig } from "@/lib/site-config"
import { cn } from "@/lib/utils"

/**
 * Enquiry form.
 *
 * IMPORTANT — there is no server yet. On submit this composes the message and
 * hands it to the visitor's own mail client, then says so plainly. It never
 * claims a message was delivered, because nothing on our side received it.
 *
 * To switch to real server-side delivery, replace `deliver()` below with a
 * Server Action that posts to a transactional mail provider. Nothing else in
 * this component needs to change — the fields, validation and states already
 * match what a backend would need.
 */

/**
 * Bands, not a slider: the lowest starts at the entry price so nobody selects a
 * budget the studio does not sell at, and the bands track what it actually
 * sells — a classic site at 1 000 € and a full 5D one at 1 000–1 500 €
 * (2026-08-31). The old ladder (699–1 000, then bands up to 5 000 € a viac)
 * was wrong at both ends: its floor sat below the entry price and its ceiling
 * described projects that are not on offer.
 */
const BUDGETS = [
  "1 000 – 1 500 €",
  "1 500 – 3 000 €",
  "3 000 € a viac",
  "Zatiaľ neviem",
] as const

type Errors = Partial<Record<"name" | "contact" | "message", string>>

function validate(values: {
  name: string
  contact: string
  message: string
}): Errors {
  const errors: Errors = {}

  if (values.name.trim().length < 2) {
    errors.name = "Uveďte prosím svoje meno."
  }

  const contact = values.contact.trim()
  const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact)
  const looksLikePhone = /^[+()\d\s-]{9,}$/.test(contact)
  if (!looksLikeEmail && !looksLikePhone) {
    errors.contact = "Zadajte e-mail alebo telefónne číslo, aby sme sa vedeli ozvať."
  }

  if (values.message.trim().length < 10) {
    errors.message = "Napíšte prosím aspoň vetu o tom, čo potrebujete."
  }

  return errors
}

function deliver(values: {
  name: string
  company: string
  contact: string
  budget: string
  message: string
}) {
  const body = [
    `Meno: ${values.name}`,
    values.company ? `Firma: ${values.company}` : null,
    `Kontakt: ${values.contact}`,
    values.budget ? `Orientačný rozpočet: ${values.budget}` : null,
    "",
    "Čo potrebujem:",
    values.message,
  ]
    .filter(Boolean)
    .join("\n")

  window.location.href = `mailto:${siteConfig.email}?subject=${encodeURIComponent(
    "Dopyt z webu — nezáväzná konzultácia"
  )}&body=${encodeURIComponent(body)}`
}

const fieldClass =
  "h-12 w-full rounded-[0.625rem] border border-input bg-background px-3.5 text-body text-foreground transition-colors placeholder:text-muted-foreground/70 hover:border-border-strong"

export function EnquiryForm() {
  const baseId = useId()
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const id = (name: string) => `${baseId}-${name}`
  const errorId = (name: string) => `${baseId}-${name}-error`

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const values = {
      name: String(data.get("name") ?? ""),
      company: String(data.get("company") ?? ""),
      contact: String(data.get("contact") ?? ""),
      budget: String(data.get("budget") ?? ""),
      message: String(data.get("message") ?? ""),
    }

    const found = validate(values)
    setErrors(found)

    const firstInvalid = Object.keys(found)[0]
    if (firstInvalid) {
      setSent(false)
      formRef.current
        ?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)
        ?.focus()
      return
    }

    deliver(values)
    setSent(true)
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Meno"
          name="name"
          id={id("name")}
          errorId={errorId("name")}
          error={errors.name}
          required
          autoComplete="name"
        />
        <Field
          label="Firma"
          name="company"
          id={id("company")}
          optionalLabel="nepovinné"
          autoComplete="organization"
        />
      </div>

      <Field
        label="E-mail alebo telefón"
        name="contact"
        id={id("contact")}
        errorId={errorId("contact")}
        error={errors.contact}
        required
        autoComplete="email"
        placeholder="jan@firma.sk alebo 0900 000 000"
      />

      <div className="flex flex-col gap-2">
        <label htmlFor={id("budget")} className="flex items-baseline gap-2">
          <span className="text-small font-medium">Orientačný rozpočet</span>
          <span className="text-caption text-muted-foreground">nepovinné</span>
        </label>
        <select
          id={id("budget")}
          name="budget"
          defaultValue=""
          className={cn(fieldClass, "appearance-none pr-10")}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5 6 6.5 11 1.5' stroke='%2361656c' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 1rem center",
            backgroundSize: "0.75rem",
          }}
        >
          <option value="">Vyberte rozsah</option>
          {BUDGETS.map((budget) => (
            <option key={budget} value={budget}>
              {budget}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={id("message")} className="flex items-baseline gap-2">
          <span className="text-small font-medium">Čo potrebujete?</span>
          <span aria-hidden="true" className="text-caption text-brand">
            povinné
          </span>
        </label>
        <textarea
          id={id("message")}
          name="message"
          rows={4}
          required
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? errorId("message") : undefined}
          placeholder="Napríklad: máme web z roku 2015, pôsobí zastarane a neprináša dopyty."
          className={cn(
            fieldClass,
            "h-auto resize-y py-3 leading-[1.55]",
            errors.message && "border-destructive"
          )}
        />
        {errors.message ? (
          <p id={errorId("message")} className="text-caption text-destructive">
            {errors.message}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        className="mt-1 inline-flex h-12 items-center justify-center rounded-full bg-brand px-6 text-[0.9375rem] font-medium text-brand-foreground transition-colors hover:bg-brand-strong active:translate-y-px"
      >
        Nezáväzne prebrať projekt
      </button>

      {/* Announced to screen readers the moment it appears. */}
      <p role="status" aria-live="polite" className="min-h-0">
        {sent ? (
          <span className="block rounded-[0.625rem] border border-hairline bg-muted px-4 py-3 text-small text-muted-foreground">
            Otvorili sme váš e-mailový klient s vyplnenou správou — stačí ju
            odoslať. Ak sa neotvoril, napíšte nám priamo na{" "}
            <a
              href={`mailto:${siteConfig.email}`}
              className="font-medium text-foreground underline underline-offset-4"
            >
              {siteConfig.email}
            </a>
            .
          </span>
        ) : null}
      </p>

      <p className="text-caption text-muted-foreground">
        Konzultácia je bezplatná a nezáväzná. Ozveme sa do{" "}
        {commercial.responseHours} hodín.
      </p>
    </form>
  )
}

type FieldProps = {
  label: string
  name: string
  id: string
  errorId?: string
  error?: string
  required?: boolean
  optionalLabel?: string
  autoComplete?: string
  placeholder?: string
}

function Field({
  label,
  name,
  id,
  errorId,
  error,
  required,
  optionalLabel,
  autoComplete,
  placeholder,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="flex items-baseline gap-2">
        <span className="text-small font-medium">{label}</span>
        {required ? (
          <span aria-hidden="true" className="text-caption text-brand">
            povinné
          </span>
        ) : null}
        {optionalLabel ? (
          <span className="text-caption text-muted-foreground">
            {optionalLabel}
          </span>
        ) : null}
      </label>
      <input
        id={id}
        name={name}
        type="text"
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error && errorId ? errorId : undefined}
        className={cn(fieldClass, error && "border-destructive")}
      />
      {error && errorId ? (
        <p id={errorId} className="text-caption text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
