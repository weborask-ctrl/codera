"use client"

/**
 * VLNA — the reservation system behind the schedule (Iterácia 4.0, Ondrej
 * 2026-09-12: "v tých podstránkach vybuduj poriadny rezervačný systém,
 * prepojenie a podobne").
 *
 * The demo used to count a spot down on click. Now it is the whole journey
 * a studio's client takes and everything the studio's back office sees:
 *
 *   1. the booking sheet — seats, contact, reminder; then payment (a card
 *      form with real number checks, or pay at the studio); then the
 *      confirmation with a booking code
 *   2. the connections — an .ics file and a Google Calendar link that really
 *      work, the confirmation e-mail and the reminder SMS as the client will
 *      receive them, cancellation that frees the seat, a waitlist that is
 *      told the moment a seat frees
 *   3. the owner's view — occupancy per lesson, the guest list, a CSV export
 *      that really downloads, and the map of what is connected to what
 *
 * Everything lives in the browser (localStorage), so a refresh keeps the
 * bookings and nothing is sent anywhere. Payment is simulated and says so.
 * The studio, its coaches and its clients are fictional.
 *
 * References: othership — booking-first, the experience and the reservation
 * are one gesture, lime and pink pills; y7 — the b&w energy the sheet sits
 * in. Mobile-first: on a phone the sheet is a bottom sheet.
 */

import { useCallback, useEffect, useId, useMemo, useState } from "react"
import { BRIC, MONO } from "./shell"

export const BLACK = "#0E0F10"
export const PAPER = "#F4F6F2"
export const LIME = "#D8F34E"
export const PINK = "#FF7AB6"

export interface Lesson {
  time: string
  name: string
  coach: string
  spots: number
  /** minutes */
  length: number
}

export interface Booking {
  id: string
  code: string
  dayKey: string
  time: string
  lesson: string
  coach: string
  length: number
  seats: number
  guest: { name: string; email: string; phone: string }
  pay: "card" | "studio"
  first: boolean
  reminder: boolean
  createdAt: number
  /** ISO date of the lesson, resolved from the demo's relative week */
  date: string
}

interface Waiting {
  dayKey: string
  time: string
  email: string
}

interface Store {
  bookings: Booking[]
  waitlist: Waiting[]
}

const KEY = "vlna-rezervacie-v1"
const EMPTY: Store = { bookings: [], waitlist: [] }
export const PRICE = 9
export const FIRST_PRICE = 6

/* the demo week is fixed: its "today" is a Thursday, so the calendar entries
   land on the next Thursday, Friday and Saturday from the real today */
export const DAY_OFFSET: Record<string, number> = { "DNES · ŠTVRTOK": 0, PIATOK: 1, SOBOTA: 2 }

export function lessonDate(dayKey: string, time: string): Date {
  const d = new Date()
  const ahead = (4 - d.getDay() + 7) % 7
  d.setDate(d.getDate() + ahead + (DAY_OFFSET[dayKey] ?? 0))
  const [h, m] = time.split(":").map(Number)
  d.setHours(h, m, 0, 0)
  return d
}

const pad = (n: number) => String(n).padStart(2, "0")
const stamp = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`

export function icsFor(b: Booking): string {
  const start = new Date(b.date)
  const end = new Date(start.getTime() + b.length * 60000)
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Codera demo//Studio//SK",
    "BEGIN:VEVENT",
    `UID:${b.code}@studio.demo`,
    `DTSTAMP:${stamp(new Date(b.createdAt))}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${b.lesson} · Štúdio`,
    `DESCRIPTION:Lektor ${b.coach}. Rezervácia ${b.code}, ${b.seats} ${b.seats === 1 ? "miesto" : "miesta"}. Zrušenie zdarma do 12 h pred lekciou.`,
    "LOCATION:Štúdio (koncept)",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")
}

export function googleCalendarUrl(b: Booking): string {
  const start = new Date(b.date)
  const end = new Date(start.getTime() + b.length * 60000)
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: `${b.lesson} · Štúdio`,
    dates: `${stamp(start)}/${stamp(end)}`,
    details: `Lektor ${b.coach}. Rezervácia ${b.code}.`,
    location: "Štúdio (koncept)",
  })
  return `https://calendar.google.com/calendar/render?${q.toString()}`
}

export function csvFor(bookings: Booking[]): string {
  const rows = [["kód", "dátum", "čas", "lekcia", "lektor", "miesta", "meno", "e-mail", "telefón", "platba"]]
  for (const b of bookings) {
    rows.push([b.code, b.date.slice(0, 10), b.time, b.lesson, b.coach, String(b.seats), b.guest.name, b.guest.email, b.guest.phone, b.pay === "card" ? "karta" : "v štúdiu"])
  }
  return rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(";")).join("\r\n")
}

const code = () => {
  const s = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let out = "ST-"
  for (let i = 0; i < 5; i++) {
    out += s[Math.floor(Math.random() * s.length)]
  }
  return out
}

/* ------------------------------------------------------------ the store --- */

export function useBookingStore(week: Record<string, Lesson[]>) {
  const [store, setStore] = useState<Store>(EMPTY)
  const [loaded, setLoaded] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Store
        if (parsed && Array.isArray(parsed.bookings)) {
          setStore({ bookings: parsed.bookings, waitlist: parsed.waitlist ?? [] })
        }
      }
    } catch {
      /* a browser without storage still books for the session */
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) {
      return
    }
    try {
      window.localStorage.setItem(KEY, JSON.stringify(store))
    } catch {
      /* see above */
    }
  }, [store, loaded])

  const taken = useCallback(
    (dayKey: string, time: string) => store.bookings.filter((b) => b.dayKey === dayKey && b.time === time).reduce((n, b) => n + b.seats, 0),
    [store.bookings]
  )
  const remaining = useCallback(
    (dayKey: string, l: Lesson) => Math.max(0, l.spots - taken(dayKey, l.time)),
    [taken]
  )

  const book = useCallback(
    (input: Omit<Booking, "id" | "code" | "createdAt" | "date">): Booking | null => {
      const day = week[input.dayKey]
      const lesson = day?.find((l) => l.time === input.time)
      if (!lesson || remaining(input.dayKey, lesson) < input.seats) {
        return null
      }
      const b: Booking = {
        ...input,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        code: code(),
        createdAt: Date.now(),
        date: lessonDate(input.dayKey, input.time).toISOString(),
      }
      setStore((s) => ({ ...s, bookings: [...s.bookings, b] }))
      return b
    },
    [week, remaining]
  )

  const cancel = useCallback(
    (id: string) => {
      setStore((s) => {
        const b = s.bookings.find((x) => x.id === id)
        if (!b) {
          return s
        }
        const rest = s.bookings.filter((x) => x.id !== id)
        /* the waitlist is told the moment a seat frees */
        const waiting = s.waitlist.find((w) => w.dayKey === b.dayKey && w.time === b.time)
        if (waiting) {
          setNotice(`Miesto sa uvoľnilo: ${b.lesson} ${b.time}. Čakajúcemu (${waiting.email}) odišiel e-mail s odkazom na rezerváciu.`)
          return { bookings: rest, waitlist: s.waitlist.filter((w) => w !== waiting) }
        }
        return { ...s, bookings: rest }
      })
    },
    []
  )

  const joinWaitlist = useCallback((dayKey: string, time: string, email: string) => {
    setStore((s) => ({ ...s, waitlist: [...s.waitlist.filter((w) => !(w.dayKey === dayKey && w.time === time && w.email === email)), { dayKey, time, email }] }))
  }, [])

  const waitingFor = useCallback((dayKey: string, time: string) => store.waitlist.filter((w) => w.dayKey === dayKey && w.time === time).length, [store.waitlist])

  const reset = useCallback(() => setStore(EMPTY), [])

  return { bookings: store.bookings, waitlist: store.waitlist, remaining, taken, book, cancel, joinWaitlist, waitingFor, notice, clearNotice: () => setNotice(null), reset, loaded }
}

/* ----------------------------------------------------------- card checks --- */

export function luhn(num: string): boolean {
  const digits = num.replace(/\D/g, "")
  if (digits.length < 13 || digits.length > 19) {
    return false
  }
  let sum = 0
  let dbl = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i])
    if (dbl) {
      d *= 2
      if (d > 9) {
        d -= 9
      }
    }
    sum += d
    dbl = !dbl
  }
  return sum % 10 === 0
}
const formatCard = (v: string) => v.replace(/\D/g, "").slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ")
const formatExp = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}
const expOk = (v: string) => {
  const m = /^(\d{2})\/(\d{2})$/.exec(v)
  if (!m) {
    return false
  }
  const mm = Number(m[1])
  const yy = 2000 + Number(m[2])
  if (mm < 1 || mm > 12) {
    return false
  }
  const now = new Date()
  return yy > now.getFullYear() || (yy === now.getFullYear() && mm >= now.getMonth() + 1)
}
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
const phoneOk = (v: string) => v.replace(/[\s()+-]/g, "").length >= 9

/* ----------------------------------------------------------------- bits --- */

const field =
  "mt-1.5 w-full rounded-xl border bg-[#151617] px-3.5 py-3 text-[0.98rem] text-[#F4F6F2] outline-none transition-colors placeholder:text-[#F4F6F2]/35 focus:border-[#D8F34E]"

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="text-[0.78rem] font-bold tracking-[0.02em]">
        {label}
      </label>
      {children}
      {error ? (
        <span className="mt-1 block text-[0.74rem]" style={{ color: PINK }}>
          {error}
        </span>
      ) : null}
    </div>
  )
}

function Pill({ children, tone = "lime", onClick, href, download, type = "button" }: { children: React.ReactNode; tone?: "lime" | "pink" | "paper" | "ghost"; onClick?: () => void; href?: string; download?: string; type?: "button" | "submit" }) {
  const style =
    tone === "lime"
      ? { background: LIME, color: BLACK }
      : tone === "pink"
        ? { background: PINK, color: BLACK }
        : tone === "paper"
          ? { background: PAPER, color: BLACK }
          : { background: "rgba(244,246,242,0.1)", color: PAPER }
  const cls = "inline-flex items-center justify-center rounded-full px-5 py-3 text-[0.85rem] font-bold transition-transform hover:-translate-y-0.5 active:scale-95"
  if (href) {
    return (
      <a href={href} download={download} target={download ? undefined : "_blank"} rel={download ? undefined : "noreferrer"} className={cls} style={style}>
        {children}
      </a>
    )
  }
  return (
    <button type={type} onClick={onClick} className={cls} style={style}>
      {children}
    </button>
  )
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("sk-SK", { weekday: "long", day: "numeric", month: "long" })

/* ------------------------------------------------------------ the sheet --- */

type Step = "details" | "pay" | "done"

export function BookingSheet({
  dayKey,
  lesson,
  left,
  onBook,
  onClose,
}: {
  dayKey: string
  lesson: Lesson
  left: number
  onBook: (input: Omit<Booking, "id" | "code" | "createdAt" | "date">) => Booking | null
  onClose: () => void
}) {
  const [step, setStep] = useState<Step>("details")
  const [seats, setSeats] = useState(1)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [first, setFirst] = useState(false)
  const [reminder, setReminder] = useState(true)
  const [pay, setPay] = useState<"card" | "studio">("card")
  const [card, setCard] = useState("")
  const [exp, setExp] = useState("")
  const [cvc, setCvc] = useState("")
  const [tried, setTried] = useState(false)
  const [paying, setPaying] = useState(false)
  const [done, setDone] = useState<Booking | null>(null)
  const uid = useId()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const unit = first ? FIRST_PRICE : PRICE
  const total = unit * seats
  const errs = {
    name: name.trim().length < 2 ? "Napíšte meno, na ktoré rezervujeme." : "",
    email: emailOk(email) ? "" : "Sem pošleme potvrdenie — potrebujeme platný e-mail.",
    phone: phoneOk(phone) ? "" : "Na toto číslo príde pripomienka.",
  }
  const detailsOk = !errs.name && !errs.email && !errs.phone
  const cardErrs = {
    card: luhn(card) ? "" : "Číslo karty nesedí (skúste 4242 4242 4242 4242).",
    exp: expOk(exp) ? "" : "Platnosť ako MM/RR, v budúcnosti.",
    cvc: /^\d{3,4}$/.test(cvc) ? "" : "3 alebo 4 číslice.",
  }
  const cardOk = !cardErrs.card && !cardErrs.exp && !cardErrs.cvc

  const goPay = () => {
    setTried(true)
    if (detailsOk) {
      setTried(false)
      setStep("pay")
    }
  }
  const finish = () => {
    setTried(true)
    if (pay === "card" && !cardOk) {
      return
    }
    setPaying(true)
    /* a payment provider answers in a beat; the demo does the same */
    window.setTimeout(() => {
      const b = onBook({ dayKey, time: lesson.time, lesson: lesson.name, coach: lesson.coach, length: lesson.length, seats, guest: { name: name.trim(), email: email.trim(), phone: phone.trim() }, pay, first, reminder })
      setPaying(false)
      if (b) {
        setDone(b)
        setStep("done")
      }
    }, 700)
  }

  const when = lessonDate(dayKey, lesson.time)

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby={`${uid}-t`}>
      <button type="button" aria-label="Zavrieť" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
      <div
        className="st-sheet relative flex max-h-[92svh] w-full max-w-[34rem] flex-col overflow-hidden rounded-t-[22px] border border-[#F4F6F2]/15 sm:rounded-[22px]"
        style={{ background: "#0E0F10", color: PAPER }}
      >
        {/* head: what is being booked, always in view */}
        <div className="flex items-start justify-between gap-4 border-b border-[#F4F6F2]/12 px-6 pt-5 pb-4">
          <div>
            <p className="text-[0.6rem] tracking-[0.2em] text-[#F4F6F2]/55" style={MONO}>
              {step === "details" ? "1 / 3 · DETAILY" : step === "pay" ? "2 / 3 · PLATBA" : "3 / 3 · HOTOVO"}
            </p>
            <h3 id={`${uid}-t`} className="mt-1 text-[1.5rem] leading-tight" style={{ ...BRIC, fontWeight: 800 }}>
              {lesson.name}
            </h3>
            <p className="mt-1 text-[0.86rem] text-[#F4F6F2]/70">
              {fmtDate(when.toISOString())} · {lesson.time} · {lesson.length} min · {lesson.coach}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Zavrieť" className="rounded-full p-2 text-[#F4F6F2]/70 transition-colors hover:text-[#F4F6F2]">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          {step === "details" ? (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                goPay()
              }}
              noValidate
            >
              <div className="flex items-center justify-between rounded-xl border border-[#F4F6F2]/12 px-4 py-3">
                <span className="text-[0.9rem] font-bold">Miesta</span>
                <div className="flex items-center gap-3">
                  <button type="button" aria-label="Menej miest" onClick={() => setSeats((s) => Math.max(1, s - 1))} className="h-9 w-9 rounded-full text-[1.2rem] font-bold" style={{ background: "rgba(244,246,242,0.1)" }}>
                    −
                  </button>
                  <span className="w-6 text-center text-[1.1rem] font-bold" style={MONO} aria-live="polite">
                    {seats}
                  </span>
                  <button type="button" aria-label="Viac miest" disabled={seats >= left} onClick={() => setSeats((s) => Math.min(left, s + 1))} className="h-9 w-9 rounded-full text-[1.2rem] font-bold disabled:opacity-35" style={{ background: LIME, color: BLACK }}>
                    +
                  </button>
                </div>
              </div>
              <p className="-mt-2 text-[0.74rem] text-[#F4F6F2]/55">
                Voľných miest na tejto lekcii: {left}. Rezervujete pre {seats === 1 ? "seba" : `${seats} ľudí`}.
              </p>
              <Field id={`${uid}-name`} label="Meno a priezvisko" error={tried ? errs.name : ""}>
                <input id={`${uid}-name`} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} style={{ borderColor: tried && errs.name ? PINK : "rgba(244,246,242,0.18)" }} placeholder="Jana Nováková" />
              </Field>
              <Field id={`${uid}-email`} label="E-mail" error={tried ? errs.email : ""}>
                <input id={`${uid}-email`} value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" inputMode="email" className={field} style={{ borderColor: tried && errs.email ? PINK : "rgba(244,246,242,0.18)" }} placeholder="jana@priklad.sk" />
              </Field>
              <Field id={`${uid}-phone`} label="Telefón" error={tried ? errs.phone : ""}>
                <input id={`${uid}-phone`} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" inputMode="tel" className={field} style={{ borderColor: tried && errs.phone ? PINK : "rgba(244,246,242,0.18)" }} placeholder="+421 900 000 000" />
              </Field>
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-[#F4F6F2]/12 px-4 py-3">
                <span className="text-[0.9rem]">
                  <span className="font-bold">Je to moja prvá lekcia</span>
                  <span className="block text-[0.76rem] text-[#F4F6F2]/60">prvá lekcia za {FIRST_PRICE} € namiesto {PRICE} €</span>
                </span>
                <input type="checkbox" checked={first} onChange={(e) => setFirst(e.target.checked)} className="h-5 w-5 accent-[#D8F34E]" />
              </label>
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-[#F4F6F2]/12 px-4 py-3">
                <span className="text-[0.9rem]">
                  <span className="font-bold">Pripomienka SMS</span>
                  <span className="block text-[0.76rem] text-[#F4F6F2]/60">2 hodiny pred lekciou</span>
                </span>
                <input type="checkbox" checked={reminder} onChange={(e) => setReminder(e.target.checked)} className="h-5 w-5 accent-[#D8F34E]" />
              </label>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[0.9rem] text-[#F4F6F2]/70">
                  Spolu <b className="text-[#F4F6F2]" style={MONO}>{total} €</b>
                </span>
                <Pill type="submit">Pokračovať na platbu →</Pill>
              </div>
            </form>
          ) : null}

          {step === "pay" ? (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                finish()
              }}
              noValidate
            >
              <div className="grid grid-cols-2 gap-2">
                {(["card", "studio"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setPay(k)}
                    aria-pressed={pay === k}
                    className="rounded-xl border px-4 py-3 text-left transition-colors"
                    style={pay === k ? { borderColor: LIME, background: "rgba(216,243,78,0.1)" } : { borderColor: "rgba(244,246,242,0.15)" }}
                  >
                    <span className="block text-[0.9rem] font-bold">{k === "card" ? "Kartou teraz" : "V štúdiu"}</span>
                    <span className="block text-[0.74rem] text-[#F4F6F2]/60">{k === "card" ? "Visa, Mastercard, Apple Pay" : "hotovosť alebo karta na mieste"}</span>
                  </button>
                ))}
              </div>
              {pay === "card" ? (
                <div className="space-y-3 rounded-xl border border-[#F4F6F2]/12 p-4">
                  <Field id={`${uid}-card`} label="Číslo karty" error={tried ? cardErrs.card : ""}>
                    <input id={`${uid}-card`} value={card} onChange={(e) => setCard(formatCard(e.target.value))} inputMode="numeric" autoComplete="cc-number" className={field} style={{ ...MONO, borderColor: tried && cardErrs.card ? PINK : "rgba(244,246,242,0.18)" }} placeholder="4242 4242 4242 4242" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field id={`${uid}-exp`} label="Platnosť" error={tried ? cardErrs.exp : ""}>
                      <input id={`${uid}-exp`} value={exp} onChange={(e) => setExp(formatExp(e.target.value))} inputMode="numeric" autoComplete="cc-exp" className={field} style={{ ...MONO, borderColor: tried && cardErrs.exp ? PINK : "rgba(244,246,242,0.18)" }} placeholder="MM/RR" />
                    </Field>
                    <Field id={`${uid}-cvc`} label="CVC" error={tried ? cardErrs.cvc : ""}>
                      <input id={`${uid}-cvc`} value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" autoComplete="cc-csc" className={field} style={{ ...MONO, borderColor: tried && cardErrs.cvc ? PINK : "rgba(244,246,242,0.18)" }} placeholder="123" />
                    </Field>
                  </div>
                  <p className="text-[0.72rem] text-[#F4F6F2]/55">
                    Platba je v deme simulovaná — nič sa neúčtuje. V ostrej prevádzke tu stojí Stripe alebo GoPay a karta neopustí ich stránku.
                  </p>
                </div>
              ) : (
                <p className="rounded-xl border border-[#F4F6F2]/12 p-4 text-[0.86rem] text-[#F4F6F2]/75">
                  Miesto vám držíme. Zaplatíte na recepcii pred lekciou; ak neprídete a nezrušíte do 12 h, lekcia sa počíta.
                </p>
              )}
              <div className="flex items-center justify-between pt-1">
                <button type="button" onClick={() => setStep("details")} className="text-[0.85rem] text-[#F4F6F2]/70 underline underline-offset-4">
                  ← Späť
                </button>
                <Pill type="submit">
                  {paying ? "Potvrdzujem…" : pay === "card" ? `Zaplatiť ${total} €` : "Rezervovať"}
                </Pill>
              </div>
            </form>
          ) : null}

          {step === "done" && done ? <Confirmation b={done} onClose={onClose} /> : null}
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------- the confirmation --- */

function Confirmation({ b, onClose }: { b: Booking; onClose: () => void }) {
  const ics = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsFor(b))}`
  const when = new Date(b.date)
  const reminderAt = new Date(when.getTime() - 2 * 3600000)
  return (
    <div className="space-y-5" data-booked={b.code}>
      <div className="rounded-2xl p-5" style={{ background: LIME, color: BLACK }}>
        <p className="text-[0.62rem] tracking-[0.2em]" style={MONO}>
          REZERVÁCIA POTVRDENÁ
        </p>
        <p className="mt-1 text-[2rem] leading-none" style={{ ...BRIC, fontWeight: 800 }}>
          {b.code}
        </p>
        <p className="mt-2 text-[0.9rem]">
          {b.lesson}, {fmtDate(b.date)} o {b.time}. {b.seats} {b.seats === 1 ? "miesto" : b.seats < 5 ? "miesta" : "miest"}, {b.pay === "card" ? "zaplatené kartou" : "platba v štúdiu"}.
        </p>
      </div>

      <div>
        <p className="text-[0.62rem] tracking-[0.2em] text-[#F4F6F2]/55" style={MONO}>
          DO KALENDÁRA
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Pill tone="paper" href={ics} download={`studio-${b.code}.ics`}>
            Stiahnuť .ics
          </Pill>
          <Pill tone="ghost" href={googleCalendarUrl(b)}>
            Google Kalendár
          </Pill>
        </div>
      </div>

      {/* what the client receives: the e-mail and the SMS, as they land */}
      <div>
        <p className="text-[0.62rem] tracking-[0.2em] text-[#F4F6F2]/55" style={MONO}>
          ČO PRÁVE DOSTALI
        </p>
        <div className="mt-2 grid gap-3 sm:grid-cols-[1.3fr_1fr]">
          <div className="rounded-xl border border-[#F4F6F2]/12 bg-[#151617] p-4 text-[0.82rem]">
            <p className="text-[0.66rem] text-[#F4F6F2]/55" style={MONO}>
              E-MAIL · {b.guest.email}
            </p>
            <p className="mt-2 font-bold">Potvrdenie: {b.lesson} {b.time}</p>
            <p className="mt-1 text-[#F4F6F2]/75">
              Dobrý deň, {b.guest.name.split(" ")[0]}. Máte miesto na lekcii {b.lesson} s lektorom {b.coach}, {fmtDate(b.date)} o {b.time}. Kód {b.code}. Zrušiť môžete zdarma do 12 h pred lekciou jedným klikom v tomto e-maile.
            </p>
          </div>
          <div className="rounded-xl border border-[#F4F6F2]/12 bg-[#151617] p-4 text-[0.82rem]">
            <p className="text-[0.66rem] text-[#F4F6F2]/55" style={MONO}>
              SMS · {b.guest.phone}
            </p>
            {b.reminder ? (
              <p className="mt-2 text-[#F4F6F2]/75">
                Odíde {reminderAt.toLocaleTimeString("sk-SK", { hour: "2-digit", minute: "2-digit" })}: „Štúdio: dnes o {b.time} {b.lesson} s {b.coach}. Tešíme sa. Zrušenie: odpovedzte NIE.“
              </p>
            ) : (
              <p className="mt-2 text-[#F4F6F2]/55">Pripomienku ste vypli.</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <p className="text-[0.76rem] text-[#F4F6F2]/55">Rezerváciu nájdete nižšie v „Moje rezervácie“, aj po obnovení stránky.</p>
        <Pill onClick={onClose}>Hotovo</Pill>
      </div>
    </div>
  )
}

/* ------------------------------------------------------- my bookings --- */

export function MyBookings({ bookings, onCancel }: { bookings: Booking[]; onCancel: (id: string) => void }) {
  if (bookings.length === 0) {
    return null
  }
  return (
    <div className="mt-8 rounded-[18px] border border-[#F4F6F2]/15 p-6" data-my-bookings>
      <p className="text-[1.05rem] font-bold" style={{ ...BRIC, color: LIME }}>
        Moje rezervácie
      </p>
      <ul className="mt-3 divide-y divide-[#F4F6F2]/12">
        {bookings.map((b) => (
          <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div>
              <p className="text-[1rem] font-bold">
                {b.lesson} <span className="text-[#F4F6F2]/55">· {b.time}</span>
              </p>
              <p className="text-[0.78rem] text-[#F4F6F2]/60">
                {fmtDate(b.date)} · {b.seats} {b.seats === 1 ? "miesto" : "miesta"} · <span style={MONO}>{b.code}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a href={`data:text/calendar;charset=utf-8,${encodeURIComponent(icsFor(b))}`} download={`studio-${b.code}.ics`} className="rounded-full px-4 py-2 text-[0.76rem] font-bold" style={{ background: "rgba(244,246,242,0.1)" }}>
                .ics
              </a>
              <button type="button" onClick={() => onCancel(b.id)} className="rounded-full px-4 py-2 text-[0.76rem] font-bold transition-colors hover:bg-[#FF7AB6] hover:text-[#0E0F10]" style={{ border: "1px solid rgba(244,246,242,0.3)" }}>
                Zrušiť
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[0.74rem] text-[#F4F6F2]/55">Zrušenie do 12 h pred lekciou je zdarma a miesto sa hneď ponúkne čakajúcim.</p>
    </div>
  )
}

/* ---------------------------------------------------------- waitlist --- */

export function WaitlistButton({ dayKey, time, waiting, onJoin }: { dayKey: string; time: string; waiting: number; onJoin: (dayKey: string, time: string, email: string) => void }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [joined, setJoined] = useState(false)
  if (joined) {
    return (
      <span className="text-[0.78rem]" style={{ color: LIME }}>
        Ste na čakačke ✓
      </span>
    )
  }
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="rounded-full px-5 py-3 text-[0.85rem] font-bold transition-colors hover:bg-[#FF7AB6] hover:text-[#0E0F10]" style={{ border: "1px solid rgba(244,246,242,0.3)" }}>
        Čakačka{waiting ? ` · ${waiting}` : ""}
      </button>
    )
  }
  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (emailOk(email)) {
          onJoin(dayKey, time, email.trim())
          setJoined(true)
        }
      }}
    >
      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="váš e-mail" className="w-44 rounded-full border border-[#F4F6F2]/25 bg-[#151617] px-4 py-2.5 text-[0.82rem] outline-none focus:border-[#D8F34E]" />
      <button type="submit" className="rounded-full px-4 py-2.5 text-[0.78rem] font-bold" style={{ background: PINK, color: BLACK }}>
        Dať vedieť
      </button>
    </form>
  )
}

/* ------------------------------------------------------- the owner view --- */

export function OwnerPanel({
  week,
  bookings,
  waitlist,
  remaining,
  onReset,
}: {
  week: Record<string, Lesson[]>
  bookings: Booking[]
  waitlist: Waiting[]
  remaining: (dayKey: string, l: Lesson) => number
  onReset: () => void
}) {
  const [open, setOpen] = useState(false)
  const csv = useMemo(() => `data:text/csv;charset=utf-8,﻿${encodeURIComponent(csvFor(bookings))}`, [bookings])
  const revenue = bookings.reduce((n, b) => n + b.seats * (b.first ? FIRST_PRICE : PRICE), 0)
  const seatsAll = Object.values(week).flat().reduce((n, l) => n + l.spots, 0)
  const seatsTaken = bookings.reduce((n, b) => n + b.seats, 0)
  return (
    <div className="rounded-[18px] border border-[#F4F6F2]/15" data-owner>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left">
        <span>
          <span className="block text-[0.62rem] tracking-[0.2em] text-[#F4F6F2]/55" style={MONO}>
            DRUHÁ STRANA SYSTÉMU
          </span>
          <span className="block text-[1.3rem] font-bold" style={BRIC}>
            Pohľad majiteľa štúdia
          </span>
        </span>
        <span className="rounded-full px-4 py-2 text-[0.78rem] font-bold" style={{ background: open ? "rgba(244,246,242,0.1)" : LIME, color: open ? PAPER : BLACK }}>
          {open ? "Skryť" : "Otvoriť"}
        </span>
      </button>
      {open ? (
        <div className="border-t border-[#F4F6F2]/12 px-6 py-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Obsadenosť týždňa", `${seatsAll ? Math.round((100 * seatsTaken) / seatsAll) : 0} %`, `${seatsTaken} z ${seatsAll} miest`],
              ["Tržby z rezervácií", `${revenue} €`, `${bookings.length} ${bookings.length === 1 ? "rezervácia" : bookings.length < 5 ? "rezervácie" : "rezervácií"}`],
              ["Čakačka", String(waitlist.length), waitlist.length ? "dostanú e-mail pri uvoľnení" : "nikto nečaká"],
            ].map(([t, v, s]) => (
              <div key={t} className="rounded-xl border border-[#F4F6F2]/12 p-4">
                <p className="text-[0.62rem] tracking-[0.16em] text-[#F4F6F2]/55" style={MONO}>
                  {t.toUpperCase()}
                </p>
                <p className="mt-1 text-[1.8rem] leading-none" style={{ ...BRIC, fontWeight: 800, color: LIME }}>
                  {v}
                </p>
                <p className="mt-1 text-[0.74rem] text-[#F4F6F2]/60">{s}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            {Object.entries(week).map(([dayKey, lessons]) => (
              <div key={dayKey}>
                <p className="text-[0.66rem] tracking-[0.16em] text-[#F4F6F2]/55" style={MONO}>
                  {dayKey}
                </p>
                <ul className="mt-1.5 space-y-1.5">
                  {lessons.map((l) => {
                    const left = remaining(dayKey, l)
                    const used = l.spots - left
                    const names = bookings.filter((b) => b.dayKey === dayKey && b.time === l.time).map((b) => `${b.guest.name}${b.seats > 1 ? ` +${b.seats - 1}` : ""}`)
                    return (
                      <li key={l.time} className="grid items-center gap-3 rounded-lg bg-[#151617] px-3 py-2 sm:grid-cols-[4rem_1fr_9rem_1fr]">
                        <span className="text-[0.8rem]" style={{ ...MONO, color: LIME }}>
                          {l.time}
                        </span>
                        <span className="text-[0.9rem] font-bold">
                          {l.name} <span className="font-normal text-[#F4F6F2]/55">· {l.coach}</span>
                        </span>
                        <span className="flex items-center gap-2 text-[0.74rem]" style={MONO}>
                          <span className="h-2 flex-1 overflow-hidden rounded-full bg-[#F4F6F2]/12">
                            <span className="block h-full rounded-full" style={{ width: `${l.spots ? (100 * used) / l.spots : 100}%`, background: left === 0 ? PINK : LIME }} />
                          </span>
                          {used}/{l.spots}
                        </span>
                        <span className="truncate text-[0.76rem] text-[#F4F6F2]/65">{names.length ? names.join(", ") : "—"}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Pill tone="paper" href={csv} download="studio-rezervacie.csv">
              Export CSV
            </Pill>
            <Pill tone="ghost" onClick={onReset}>
              Vynulovať demo
            </Pill>
          </div>

          {/* the connections, honestly: which are real in the demo */}
          <div className="mt-8">
            <p className="text-[0.62rem] tracking-[0.2em] text-[#F4F6F2]/55" style={MONO}>
              ČO JE NA ČO NAPOJENÉ
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {[
                ["Kalendár klienta", ".ics a Google Kalendár — v deme funguje naozaj", true],
                ["Potvrdenie e-mailom", "Resend / Postmark; v deme vidíte znenie", false],
                ["Pripomienka SMS", "Twilio / GoSMS; v deme vidíte znenie", false],
                ["Platby", "Stripe / GoPay; v deme simulované", false],
                ["Čakačka", "e-mail pri uvoľnení miesta — logika v deme funguje", true],
                ["Kalendár štúdia", "Google Workspace / Microsoft 365, obojsmerne", false],
                ["Export a účtovníctvo", "CSV — v deme funguje; napojenie na Superfaktúru", true],
                ["Kapacity naživo", "jedna pravda pre web, recepciu aj lektora", true],
              ].map(([t, d, live]) => (
                <div key={t as string} className="flex items-start gap-3 rounded-lg border border-[#F4F6F2]/12 px-3.5 py-3">
                  <span className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: live ? LIME : PINK }} aria-hidden="true" />
                  <span>
                    <span className="block text-[0.88rem] font-bold">{t}</span>
                    <span className="block text-[0.74rem] text-[#F4F6F2]/60">{d}</span>
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[0.72rem] text-[#F4F6F2]/50">
              Zelené beží v tejto ukážke naozaj, ružové je v ukážke znázornené a v ostrej prevádzke sa napája na uvedené služby.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
