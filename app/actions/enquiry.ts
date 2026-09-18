"use server"

/**
 * The enquiry, delivered server-side (audit 2026-09-14 §5: the form used to
 * end in a mailto: and nothing on the studio's side ever received a lead).
 *
 * Transport: Resend's HTTP API — no SDK, one fetch. It runs when
 * `RESEND_API_KEY` is set in the environment (Vercel → Settings →
 * Environment Variables; the sending domain must be verified in Resend).
 * Without the key the action reports `configured: false` and the form falls
 * back to the visitor's own mail client, saying so plainly — the site never
 * claims a message was delivered when it was not.
 *
 * Protection: a honeypot field no person fills, server-side validation that
 * mirrors the client's, and a per-address rate limit kept in the instance's
 * memory (enough against a naive script; a serverless instance is short-lived
 * anyway). Nothing about the visitor is stored beyond the e-mail that leaves.
 */

import { headers } from "next/headers"
import { siteConfig } from "@/lib/site-config"

export interface EnquiryInput {
  name: string
  company: string
  contact: string
  budget: string
  message: string
  /** the honeypot — must stay empty */
  website: string
}

export type EnquiryResult =
  | { ok: true; id?: string }
  | { ok: false; configured: false }
  | { ok: false; configured: true; error: string }

const RESEND = "https://api.resend.com/emails"
const TO = process.env.ENQUIRY_TO ?? siteConfig.email
const FROM = process.env.ENQUIRY_FROM ?? `Codera web <dopyt@${new URL(siteConfig.url).hostname.replace(/^www\./, "")}>`

/* the same rules the client applies, so a bypassed client changes nothing */
function valid(v: EnquiryInput): string | null {
  if (v.name.trim().length < 2 || v.name.length > 120) {
    return "meno"
  }
  const contact = v.contact.trim()
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact)
  const phone = /^[+()\d\s-]{9,}$/.test(contact)
  if ((!email && !phone) || contact.length > 160) {
    return "kontakt"
  }
  if (v.message.trim().length < 10 || v.message.length > 4000) {
    return "správa"
  }
  if (v.company.length > 160 || v.budget.length > 40) {
    return "polia"
  }
  return null
}

/* per-address window: five messages in ten minutes */
const hits = new Map<string, number[]>()
function limited(key: string): boolean {
  const now = Date.now()
  const list = (hits.get(key) ?? []).filter((t) => now - t < 10 * 60 * 1000)
  list.push(now)
  hits.set(key, list)
  return list.length > 5
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c)

export async function sendEnquiry(input: EnquiryInput): Promise<EnquiryResult> {
  /* a filled honeypot is a bot: say yes and send nothing */
  if (input.website && input.website.trim() !== "") {
    return { ok: true }
  }
  const key = process.env.RESEND_API_KEY
  if (!key) {
    return { ok: false, configured: false }
  }
  const problem = valid(input)
  if (problem) {
    return { ok: false, configured: true, error: `Skontrolujte prosím pole: ${problem}.` }
  }
  const h = await headers()
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown"
  if (limited(ip)) {
    return { ok: false, configured: true, error: "Príliš veľa správ za sebou. Skúste o chvíľu, alebo nám napíšte priamo." }
  }

  const lines = [
    ["Meno", input.name],
    ["Firma", input.company],
    ["Kontakt", input.contact],
    ["Orientačný rozpočet", input.budget],
  ].filter(([, v]) => v && v.trim() !== "")
  const text = [...lines.map(([k, v]) => `${k}: ${v}`), "", "Čo potrebujem:", input.message].join("\n")
  const html = `<div style="font:15px/1.5 -apple-system,Segoe UI,sans-serif;color:#0b1a4a">${lines
    .map(([k, v]) => `<p style="margin:0 0 4px"><b>${esc(k)}:</b> ${esc(v)}</p>`)
    .join("")}<p style="margin:16px 0 4px"><b>Čo potrebujem:</b></p><p style="white-space:pre-wrap;margin:0">${esc(input.message)}</p></div>`
  const replyTo = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.contact.trim()) ? input.contact.trim() : undefined

  try {
    const res = await fetch(RESEND, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        subject: `Dopyt z webu — ${input.name.trim()}`,
        text,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => "")
      console.error("enquiry: resend refused", res.status, detail.slice(0, 200))
      return { ok: false, configured: true, error: "Správu sa nepodarilo odoslať. Napíšte nám prosím priamo." }
    }
    const data = (await res.json().catch(() => ({}))) as { id?: string }
    return { ok: true, id: data.id }
  } catch (e) {
    console.error("enquiry: transport failed", e)
    return { ok: false, configured: true, error: "Správu sa nepodarilo odoslať. Napíšte nám prosím priamo." }
  }
}
