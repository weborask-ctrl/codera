"use client"

/**
 * WORDPRESS — the editor a visitor can really use (Iterácia 4.0, Ondrej
 * 2026-09-12: "v wordpress podstránke chcem aby si klienti vedeli toho viac
 * vyskúšať").
 *
 * The fictional bakery site is the document; this is its back office. The
 * visitor edits the content (name, headline, text, button, opening hours),
 * the look (accent, typeface, hero photo, hero layout), the sections (menu
 * with editable dishes and prices, gallery, booking, news with real posts,
 * a WooCommerce product with a cart that counts), the language (the whole
 * site turns English, the visitor's own words included — pre-filled by the
 * dictionary in wordpress-translate.ts and editable by hand, the way a
 * multilingual WordPress keeps one content per language) — and sees
 * every change land in the preview at once, on a desktop or a phone. Publish
 * keeps a revision, revisions restore, reset returns the starting site.
 * Clicking a piece of the preview opens the field that edits it. Everything
 * is kept in the browser, so a refresh finds the work where it was left.
 *
 * General facts about WordPress only; nothing invented about the studio.
 */

import { useCallback, useEffect, useId, useState } from "react"
import { BRIC, FR, MONO } from "./shell"
import { translate, translateInfo } from "./wordpress-translate"

export const PAPER = "#F6F1E7"
export const INK = "#1B1A17"
export const BLUE = "#2F5BFF"
export const AMBER = "#E8A23A"
export const IMG = "/demos/wordpress"

export type Lang = "sk" | "en"
export type SectionKey = "menu" | "gallery" | "book" | "news" | "shop"
export type FontKey = "serif" | "grotesk" | "clean"
export type HeroImg = "pekaren" | "kolace" | "pekar"

export interface Dish {
  id: string
  name: string
  price: string
}
export interface Post {
  id: string
  title: string
  text: string
  date: string
}
export interface Site {
  name: string
  headline: string
  sub: string
  cta: string
  hours: string
  accent: string
  font: FontKey
  hero: HeroImg
  layout: "left" | "center"
  lang: Lang
  on: Record<SectionKey, boolean>
  menu: Dish[]
  news: Post[]
  product: { name: string; price: string }
  /** the English the owner wrote by hand, keyed by field, with the Slovak it
   *  was written for — a changed original makes it stale and the automatic
   *  translation takes over again */
  tr: Record<string, Override>
}
export interface Override {
  src: string
  text: string
}
export interface Content {
  name: string
  headline: string
  sub: string
  cta: string
  hours: string
  menu: Dish[]
  news: Post[]
  product: { name: string; price: string }
}
export interface Revision {
  at: string
  site: Site
}

export const ACCENTS: readonly [string, string][] = [
  ["Jantár", AMBER],
  ["Modrá", BLUE],
  ["Lesná", "#2F7A4F"],
  ["Slivka", "#7A3E8C"],
  ["Tehla", "#B5472C"],
]
export const FONTS: Record<FontKey, { label: string; style: React.CSSProperties }> = {
  serif: { label: "Serif", style: { ...FR, fontWeight: 600 } },
  grotesk: { label: "Grotesk", style: { ...BRIC, fontWeight: 800, letterSpacing: "-0.02em" } },
  clean: { label: "Čistý", style: { fontFamily: "var(--font-geist-sans), sans-serif", fontWeight: 600, letterSpacing: "-0.01em" } },
}
export const HEROES: Record<HeroImg, string> = { pekaren: "Pult", kolace: "Koláče", pekar: "Pekár" }

const T: Record<Lang, Record<string, string>> = {
  sk: { menu: "Menu", gallery: "Galéria", book: "Rezervácia", news: "Novinky", shop: "Obchod", onCounter: "Dnes na pulte", fromBakery: "Z pekárne", bookTitle: "Rezervuj stôl", bookText: "Raňajky v sobotu pre štyroch — dve kliknutia.", addToCart: "Do košíka", inCart: "v košíku", newsTitle: "Novinky", hours: "Otvorené dnes", order: "Objednať", emptyMenu: "(menu je prázdne)", noPosts: "(zatiaľ bez článkov)", delivery: "doručenie do 2 dní" },
  en: { menu: "Menu", gallery: "Gallery", book: "Booking", news: "News", shop: "Shop", onCounter: "On the counter today", fromBakery: "From the bakery", bookTitle: "Book a table", bookText: "Saturday breakfast for four — two clicks.", addToCart: "Add to cart", inCart: "in cart", newsTitle: "News", hours: "Open today", order: "Order", emptyMenu: "(the menu is empty)", noPosts: "(no posts yet)", delivery: "delivery in 2 days" },
}

const uid = () => Math.random().toString(36).slice(2, 8)

export const DEFAULT_SITE: Site = {
  name: "Pekáreň Kôrka",
  headline: "Chlieb, ktorý vonia už na ulici.",
  sub: "Kváskové pečivo každé ráno od šiestej. Bez zlepšovadiel, s trpezlivosťou.",
  cta: "Objednať na zajtra",
  hours: "7:00 – 18:00",
  accent: AMBER,
  font: "serif",
  hero: "pekaren",
  layout: "left",
  lang: "sk",
  on: { menu: true, gallery: true, book: true, news: false, shop: false },
  menu: [
    { id: "d1", name: "Kváskový chlieb", price: "3,90 €" },
    { id: "d2", name: "Maslový croissant", price: "2,40 €" },
    { id: "d3", name: "Kardamómová buchta", price: "2,90 €" },
  ],
  news: [{ id: "p1", title: "Od pondelka pečieme aj bezlepkový chlieb", text: "Nová pec, nová múka z Liptova, rovnaký kvások. Príďte ochutnať.", date: "dnes" }],
  product: { name: "Darčeková krabica pečiva", price: "24 €" },
  tr: {},
}

const KEY = "wp-demo-v1"
const FIELDS: (keyof Site)[] = ["name", "headline", "sub", "cta", "hours", "accent", "font", "hero", "layout", "lang"]

/* ------------------------------------------------------------ language --- */

/** the English of one field: what the owner wrote for this very Slovak, or
 *  the automatic translation */
export function english(site: Site, key: string, sk: string): string {
  const o = site.tr[key]
  return o && o.src === sk ? o.text : translate(sk)
}

/** the content in the language the site is set to */
export function localize(site: Site): Content {
  if (site.lang === "sk") {
    return site
  }
  return {
    name: english(site, "name", site.name),
    headline: english(site, "headline", site.headline),
    sub: english(site, "sub", site.sub),
    cta: english(site, "cta", site.cta),
    hours: site.hours,
    menu: site.menu.map((d) => ({ ...d, name: english(site, `menu.${d.id}`, d.name) })),
    news: site.news.map((p) => ({ ...p, title: english(site, `news.${p.id}.title`, p.title), text: english(site, `news.${p.id}.text`, p.text), date: translate(p.date) })),
    product: { ...site.product, name: english(site, "product", site.product.name) },
  }
}

export interface TrRow {
  key: string
  label: string
  sk: string
  en: string
  /** written by hand for this Slovak */
  manual: boolean
  /** words the automatic translation did not know */
  unknown: number
  long: boolean
}

/** every text the owner can translate, side by side */
export function translationRows(site: Site): TrRow[] {
  const rows: TrRow[] = []
  const add = (key: string, label: string, sk: string, long = false) => {
    if (sk.trim() === "") {
      return
    }
    const o = site.tr[key]
    const manual = !!o && o.src === sk
    const auto = translateInfo(sk)
    rows.push({ key, label, sk, en: manual ? o.text : auto.text, manual, unknown: manual ? 0 : auto.unknown, long })
  }
  add("name", "Názov", site.name)
  add("headline", "Nadpis", site.headline)
  add("sub", "Text pod nadpisom", site.sub, true)
  add("cta", "Tlačidlo", site.cta)
  for (const d of site.menu) {
    add(`menu.${d.id}`, "Jedlo", d.name)
  }
  for (const p of site.news) {
    add(`news.${p.id}.title`, "Článok", p.title)
    add(`news.${p.id}.text`, "Text článku", p.text, true)
  }
  if (site.on.shop) {
    add("product", "Produkt", site.product.name)
  }
  return rows
}

/* ------------------------------------------------------------ the state --- */

export function useSiteState() {
  const [site, setSite] = useState<Site>(DEFAULT_SITE)
  const [revisions, setRevisions] = useState<Revision[]>([])
  const [publishedAt, setPublishedAt] = useState<string | null>(null)
  const [cart, setCart] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY)
      if (raw) {
        const p = JSON.parse(raw) as { site?: Site; revisions?: Revision[]; publishedAt?: string | null }
        if (p.site) {
          setSite({ ...DEFAULT_SITE, ...p.site, on: { ...DEFAULT_SITE.on, ...p.site.on } })
        }
        if (Array.isArray(p.revisions)) {
          setRevisions(p.revisions)
        }
        setPublishedAt(p.publishedAt ?? null)
      }
    } catch {
      /* the session still edits */
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) {
      return
    }
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ site, revisions, publishedAt }))
    } catch {
      /* see above */
    }
  }, [site, revisions, publishedAt, loaded])

  const patch = useCallback((p: Partial<Site>) => setSite((s) => ({ ...s, ...p })), [])
  const publish = useCallback(() => {
    const at = new Date().toLocaleTimeString("sk-SK", { hour: "2-digit", minute: "2-digit" })
    setRevisions((r) => [{ at, site }, ...r].slice(0, 8))
    setPublishedAt(at)
  }, [site])
  const restore = useCallback((r: Revision) => setSite(r.site), [])
  const reset = useCallback(() => {
    setSite(DEFAULT_SITE)
    setRevisions([])
    setPublishedAt(null)
    setCart(0)
  }, [])

  /* what the visitor has changed against the starting site — the close
     reflects it back to them */
  const changes: string[] = []
  const labels: Record<string, string> = { name: "názov", headline: "nadpis", sub: "text", cta: "tlačidlo", hours: "otváracie hodiny", accent: "farbu", font: "písmo", hero: "fotku", layout: "rozloženie", lang: "jazyk" }
  for (const k of FIELDS) {
    if (site[k] !== DEFAULT_SITE[k]) {
      changes.push(labels[k])
    }
  }
  if (JSON.stringify(site.menu) !== JSON.stringify(DEFAULT_SITE.menu)) {
    changes.push("menu")
  }
  if (JSON.stringify(site.news) !== JSON.stringify(DEFAULT_SITE.news) || site.on.news !== DEFAULT_SITE.on.news) {
    changes.push("novinky")
  }
  if (site.on.shop !== DEFAULT_SITE.on.shop || JSON.stringify(site.product) !== JSON.stringify(DEFAULT_SITE.product)) {
    changes.push("obchod")
  }
  if (site.on.gallery !== DEFAULT_SITE.on.gallery || site.on.book !== DEFAULT_SITE.on.book || site.on.menu !== DEFAULT_SITE.on.menu) {
    changes.push("sekcie")
  }
  if (Object.keys(site.tr).length > 0) {
    changes.push("preklad")
  }

  return { site, patch, setSite, revisions, publish, restore, reset, publishedAt, cart, setCart, changes, loaded }
}

/* -------------------------------------------------------------- preview --- */

export function Preview({
  site,
  compact = false,
  phone = false,
  cart = 0,
  onCart,
  onEdit,
  hot,
}: {
  site: Site
  compact?: boolean
  phone?: boolean
  cart?: number
  onCart?: () => void
  /** the preview is a way into the editor: click a thing, edit that thing */
  onEdit?: (field: string) => void
  /** the field being edited right now — outlined, for the hero's show */
  hot?: string
}) {
  const t = T[site.lang]
  const c = localize(site)
  const font = FONTS[site.font].style
  const small = compact || phone
  const edit = (field: string) => ({
    "data-field": field,
    ...(hot === field ? { "data-hot": "" } : {}),
    ...(onEdit
      ? {
          role: "button" as const,
          tabIndex: 0,
          title: "Upraviť v editore",
          className: "wp-editable",
          onClick: () => onEdit(field),
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === "Enter") {
              onEdit(field)
            }
          },
        }
      : {}),
  })
  return (
    <div
      className={`wp-site overflow-hidden bg-white text-[#1B1A17] ${phone ? "rounded-[1.6rem]" : "rounded-[1.1rem] border border-[#1B1A17]/10 shadow-[0_40px_90px_-30px_rgba(27,26,23,0.45)]"}`}
      style={{ ["--wp-accent" as string]: site.accent }}
      data-preview={phone ? "phone" : "desktop"}
    >
      {phone ? (
        <div className="flex items-center justify-between bg-[#F6F1E7] px-4 pt-2 pb-1 text-[0.55rem] text-[#1B1A17]/60" style={MONO}>
          <span>9:41</span>
          <span>pekaren-korka.sk</span>
          <span>●●●</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 border-b border-[#1B1A17]/8 bg-[#F6F1E7] px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-[#1B1A17]/20" />
          <span className="h-2 w-2 rounded-full bg-[#1B1A17]/20" />
          <span className="h-2 w-2 rounded-full bg-[#1B1A17]/20" />
          <span className="ml-2 rounded-md bg-white px-2 py-0.5 text-[0.55rem] tracking-[0.08em] text-[#1B1A17]/55" style={MONO}>
            pekaren-korka.sk
          </span>
        </div>
      )}

      <div className={`flex items-center justify-between ${small ? "px-4 py-2.5" : "px-6 py-3.5"}`}>
        <span {...edit("name")} style={{ ...font, fontSize: small ? "0.95rem" : "1.15rem" }}>
          {c.name || " "}
        </span>
        <nav className={`flex items-center ${small ? "gap-2.5 text-[0.6rem]" : "gap-5 text-[0.78rem]"} font-medium text-[#1B1A17]/70`}>
          {site.on.menu ? <span>{t.menu}</span> : null}
          {!phone && site.on.gallery ? <span>{t.gallery}</span> : null}
          {site.on.shop ? <span>{t.shop}</span> : null}
          {site.on.book ? <span className="wp-acc" style={{ color: site.accent, fontWeight: 700 }}>{t.book}</span> : null}
          {site.on.shop ? (
            <span className="relative inline-flex items-center" role="img" aria-label={`${cart} ${t.inCart}`} data-cart={cart}>
              <svg width={small ? 14 : 16} height={small ? 14 : 16} viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 3h2l1.6 7h6.8L14 5H5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                <circle cx="6.5" cy="13" r="1" fill="currentColor" />
                <circle cx="11.5" cy="13" r="1" fill="currentColor" />
              </svg>
              {cart > 0 ? (
                <span className="wp-acc absolute -top-1.5 -right-2 rounded-full px-1 text-[0.5rem] font-bold text-white" style={{ background: site.accent, minWidth: "0.9rem", textAlign: "center" }}>
                  {cart}
                </span>
              ) : null}
            </span>
          ) : null}
        </nav>
      </div>

      <div className={`relative ${phone ? "h-[240px]" : compact ? "h-[150px]" : "h-[260px] md:h-[300px]"} overflow-hidden`}>
        <div className="absolute inset-0 bg-cover bg-center transition-[background-image] duration-300" style={{ backgroundImage: `url(${IMG}/${site.hero}.jpg)` }} />
        <div className="absolute inset-0" style={{ background: site.layout === "center" ? "linear-gradient(180deg, rgba(27,26,23,0.2) 0%, rgba(27,26,23,0.72) 100%)" : "linear-gradient(90deg, rgba(27,26,23,0.72) 0%, rgba(27,26,23,0.15) 70%)" }} />
        <div className={`relative flex h-full flex-col justify-end ${small ? "p-4" : "p-6 md:p-8"} text-white ${site.layout === "center" ? "items-center text-center" : ""}`}>
          <p {...edit("hours")} className={`${small ? "text-[0.5rem]" : "text-[0.6rem]"} tracking-[0.2em] opacity-80`} style={MONO}>
            {t.hours.toUpperCase()} {site.hours}
          </p>
          <h3
            {...edit("headline")}
            className="wp-headline mt-2 max-w-[18ch] text-balance"
            style={{ ...font, fontSize: phone ? "1.5rem" : compact ? "1.25rem" : "clamp(1.5rem,2.6vw,2.2rem)", lineHeight: 1.05 }}
          >
            {c.headline || " "}
          </h3>
          {!compact && c.sub ? (
            <p {...edit("sub")} className={`mt-2 max-w-[34ch] ${phone ? "text-[0.72rem]" : "text-[0.82rem]"} leading-[1.45] opacity-85`}>
              {c.sub}
            </p>
          ) : null}
          <span
            {...edit("cta")}
            className={`wp-acc mt-3 w-fit rounded-full ${small ? "px-3 py-1.5 text-[0.55rem]" : "px-4 py-2 text-[0.7rem]"} font-bold tracking-[0.1em] text-white`}
            style={{ background: site.accent }}
          >
            {(c.cta || " ").toUpperCase()}
          </span>
        </div>
      </div>

      {!compact ? (
        <div className={`grid gap-4 ${phone ? "p-4" : "p-6 md:grid-cols-[1.2fr_1fr]"}`}>
          {site.on.menu ? (
            <div {...edit("menu")}>
              <p className="text-[0.58rem] tracking-[0.2em] text-[#1B1A17]/50" style={MONO}>
                {t.onCounter.toUpperCase()}
              </p>
              <ul className="mt-2 divide-y divide-[#1B1A17]/8 text-[0.85rem]">
                {c.menu.map((d) => (
                  <li key={d.id} className="flex justify-between gap-3 py-1.5">
                    <span>{d.name || "—"}</span>
                    <span className="tnum text-[#1B1A17]/60">{d.price}</span>
                  </li>
                ))}
                {c.menu.length === 0 ? <li className="py-1.5 text-[#1B1A17]/45">{t.emptyMenu}</li> : null}
              </ul>
            </div>
          ) : null}
          {site.on.gallery ? (
            <div>
              <p className="text-[0.58rem] tracking-[0.2em] text-[#1B1A17]/50" style={MONO}>
                {t.fromBakery.toUpperCase()}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["kolace", "pekar"] as HeroImg[]).filter((k) => k !== site.hero).concat(site.hero === "pekaren" ? [] : ["pekaren"]).slice(0, 2).map((k) => (
                  <div key={k} className="aspect-[4/5] rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${IMG}/${k}.jpg)` }} />
                ))}
              </div>
            </div>
          ) : null}
          {site.on.shop ? (
            <div {...edit("product")} className={`flex items-center gap-4 rounded-xl border border-[#1B1A17]/10 p-3 ${phone ? "" : "md:col-span-2"}`}>
              <div className="h-16 w-16 shrink-0 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${IMG}/kolace.jpg)` }} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.9rem] font-bold">{c.product.name || "—"}</p>
                <p className="text-[0.78rem] text-[#1B1A17]/60">
                  {c.product.price} · {t.delivery}
                </p>
              </div>
              <button
                type="button"
                data-add-to-cart
                onClick={(e) => {
                  e.stopPropagation()
                  onCart?.()
                }}
                className="wp-acc shrink-0 rounded-full px-3.5 py-2 text-[0.66rem] font-bold tracking-[0.08em] text-white transition-transform active:scale-95"
                style={{ background: site.accent }}
              >
                {t.addToCart.toUpperCase()}
              </button>
            </div>
          ) : null}
          {site.on.book ? (
            <div className={`wp-acc rounded-xl p-4 text-white ${phone ? "" : "md:col-span-2"}`} style={{ background: site.accent }}>
              <p className="text-[0.95rem] font-bold">{t.bookTitle}</p>
              <p className="mt-1 text-[0.78rem] opacity-85">{t.bookText}</p>
            </div>
          ) : null}
          {site.on.news ? (
            <div {...edit("news")} className={`border-t border-[#1B1A17]/8 pt-3 ${phone ? "" : "md:col-span-2"}`}>
              <p className="text-[0.58rem] tracking-[0.2em] text-[#1B1A17]/50" style={MONO}>
                {t.newsTitle.toUpperCase()}
              </p>
              <ul className="mt-2 space-y-2">
                {c.news.map((p) => (
                  <li key={p.id} className="text-[0.8rem] text-[#1B1A17]/75">
                    <span className="font-bold text-[#1B1A17]">{p.title || "—"}</span>
                    {p.text ? <span> — {p.text}</span> : null}
                    <span className="text-[#1B1A17]/45"> · {p.date}</span>
                  </li>
                ))}
                {c.news.length === 0 ? <li className="text-[0.8rem] text-[#1B1A17]/45">{t.noPosts}</li> : null}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

/* --------------------------------------------------------------- editor --- */

type Tab = "obsah" | "vzhlad" | "sekcie" | "novinky" | "obchod" | "jazyk"
const TABS: [Tab, string][] = [
  ["obsah", "Obsah"],
  ["vzhlad", "Vzhľad"],
  ["sekcie", "Sekcie"],
  ["novinky", "Novinky"],
  ["obchod", "Obchod"],
  ["jazyk", "Jazyk"],
]
const FIELD_TAB: Record<string, Tab> = { name: "obsah", headline: "obsah", sub: "obsah", cta: "obsah", hours: "obsah", menu: "sekcie", news: "novinky", product: "obchod", lang: "jazyk" }

const input = "mt-1.5 w-full rounded-lg border border-[#1B1A17]/15 bg-[#FBF8F2] px-3 py-2.5 text-[0.95rem] outline-none transition-colors focus:border-[#2F5BFF]"
const label = "text-[0.78rem] font-bold"

export function Editor({ state }: { state: ReturnType<typeof useSiteState> }) {
  const { site, patch, revisions, publish, restore, reset, publishedAt, cart, setCart, loaded } = state
  const [tab, setTab] = useState<Tab>("obsah")
  const [device, setDevice] = useState<"desktop" | "phone">("desktop")
  const [flash, setFlash] = useState<string | null>(null)
  const id = useId()

  const jump = (field: string) => {
    const t = FIELD_TAB[field] ?? "obsah"
    setTab(t)
    setFlash(field)
    window.setTimeout(() => {
      const el = document.getElementById(`${id}-${field}`)
      el?.focus()
      el?.scrollIntoView({ block: "nearest", behavior: "smooth" })
    }, 30)
    window.setTimeout(() => setFlash(null), 1400)
  }
  const ring = (f: string) => (flash === f ? { boxShadow: `0 0 0 3px ${site.accent}55`, borderColor: site.accent } : undefined)

  const setDish = (did: string, p: Partial<Dish>) => patch({ menu: site.menu.map((d) => (d.id === did ? { ...d, ...p } : d)) })
  const setEnglish = (key: string, src: string, text: string) => patch({ tr: { ...site.tr, [key]: { src, text } } })
  const dropEnglish = (key: string) => {
    const { [key]: _gone, ...rest } = site.tr
    patch({ tr: rest })
  }
  const rows = tab === "jazyk" ? translationRows(site) : []
  const setPost = (pid: string, p: Partial<Post>) => patch({ news: site.news.map((x) => (x.id === pid ? { ...x, ...p } : x)) })

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[24rem_1fr]" data-editor data-ready={loaded ? "" : undefined}>
      {/* the panel */}
      <div className="wfx flex flex-col rounded-2xl border border-[#1B1A17]/10 bg-white" style={{ ["--fx-delay" as string]: "0.18s" }}>
        <div className="flex items-center justify-between px-5 pt-5">
          <p className="text-[0.58rem] tracking-[0.22em] text-[#1B1A17]/50" style={MONO}>
            EDITOR · ÚVODNÁ STRÁNKA
          </p>
          <span className="text-[0.62rem] text-[#1B1A17]/50" style={MONO}>
            {publishedAt ? `ZVEREJNENÉ ${publishedAt}` : "KONCEPT"}
          </span>
        </div>
        <div className="mt-4 flex gap-1 overflow-x-auto px-5" role="tablist">
          {TABS.map(([k, l]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={tab === k}
              onClick={() => setTab(k)}
              className="shrink-0 rounded-full px-3.5 py-1.5 text-[0.72rem] font-bold tracking-[0.04em] transition-colors"
              style={tab === k ? { background: INK, color: PAPER } : { color: "rgba(27,26,23,0.65)" }}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="space-y-4 px-5 py-5">
          {tab === "obsah" ? (
            [
              ["name", "Názov", 32],
              ["headline", "Nadpis", 48],
              ["sub", "Text pod nadpisom", 120],
              ["cta", "Tlačidlo", 24],
              ["hours", "Otváracie hodiny", 24],
            ] as [keyof Site, string, number][]
          ).map(([k, l, max]) => (
            <div key={k}>
              <label htmlFor={`${id}-${k}`} className={label}>
                {l}
              </label>
              {k === "sub" ? (
                <textarea id={`${id}-${k}`} value={site[k] as string} maxLength={max} rows={3} onChange={(e) => patch({ [k]: e.target.value })} className={input} style={{ ...FR, ...ring(k) }} />
              ) : (
                <input id={`${id}-${k}`} value={site[k] as string} maxLength={max} onChange={(e) => patch({ [k]: e.target.value })} className={input} style={{ ...(k === "headline" || k === "name" ? FR : {}), ...ring(k) }} />
              )}
            </div>
          )) : null}

          {tab === "jazyk" ? (
            <div id={`${id}-lang`} tabIndex={-1} className="space-y-5 outline-none">
              <div>
                <span className={label}>Jazyk stránky</span>
                <div className="mt-1.5 inline-flex overflow-hidden rounded-full border border-[#1B1A17]/20">
                  {(["sk", "en"] as Lang[]).map((l) => (
                    <button key={l} type="button" aria-pressed={site.lang === l} onClick={() => patch({ lang: l })} className="px-4 py-1.5 text-[0.72rem] font-bold tracking-[0.1em]" style={site.lang === l ? { background: INK, color: PAPER } : { color: "rgba(27,26,23,0.7)" }}>
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-[0.7rem] leading-[1.5] text-[#1B1A17]/55">Prepnite na EN a celá stránka je po anglicky — aj vaše vlastné texty. Viacjazyčný WordPress (WPML, Polylang) drží pre každý jazyk vlastný obsah; anglický je predvyplnený automatickým prekladom a tu ho upravíte.</p>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className={label}>Anglické texty</span>
                  {rows.some((r) => r.manual) ? (
                    <button type="button" onClick={() => patch({ tr: {} })} className="text-[0.66rem] font-bold text-[#1B1A17]/55 underline">
                      Vrátiť automatický preklad
                    </button>
                  ) : null}
                </div>
                <ul className="mt-2 space-y-2.5">
                  {rows.map((r) => (
                    <li key={r.key} className="rounded-xl border p-3" style={{ borderColor: r.manual ? site.accent : "rgba(27,26,23,0.12)" }}>
                      <div className="flex items-center justify-between gap-2 text-[0.58rem] tracking-[0.16em]" style={MONO}>
                        <span className="text-[#1B1A17]/50">{r.label.toUpperCase()}</span>
                        <span style={{ color: r.manual ? site.accent : r.unknown > 0 ? "#B5472C" : "rgba(27,26,23,0.45)" }}>{r.manual ? "UPRAVENÉ" : r.unknown > 0 ? "SKONTROLUJTE" : "AUTOMATICKY"}</span>
                      </div>
                      <p className="mt-1.5 text-[0.78rem] leading-[1.4] text-[#1B1A17]/60">{r.sk}</p>
                      {r.long ? (
                        <textarea value={r.en} rows={2} maxLength={200} aria-label={`${r.label} (EN)`} onChange={(e) => setEnglish(r.key, r.sk, e.target.value)} className="mt-1.5 w-full rounded-lg border border-[#1B1A17]/15 bg-[#FBF8F2] px-2.5 py-2 text-[0.85rem] outline-none focus:border-[#2F5BFF]" />
                      ) : (
                        <input value={r.en} maxLength={80} aria-label={`${r.label} (EN)`} onChange={(e) => setEnglish(r.key, r.sk, e.target.value)} className="mt-1.5 w-full rounded-lg border border-[#1B1A17]/15 bg-[#FBF8F2] px-2.5 py-2 text-[0.85rem] outline-none focus:border-[#2F5BFF]" />
                      )}
                      {r.manual ? (
                        <button type="button" onClick={() => dropEnglish(r.key)} className="mt-1.5 text-[0.62rem] text-[#1B1A17]/50 underline">
                          späť na automatický
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[0.68rem] leading-[1.5] text-[#1B1A17]/50">Automatický preklad je slovník tejto ukážky — pozná pekáreň, nie celý jazyk. V ostrom WordPresse ho robí prekladová služba a pred zverejnením ho skontrolujete rovnako ako tu.</p>
              </div>
            </div>
          ) : null}

          {tab === "vzhlad" ? (
            <>
              <div>
                <span className={label}>Farba značky</span>
                <div className="mt-2 flex flex-wrap gap-2.5">
                  {ACCENTS.map(([n, c]) => (
                    <button key={n} type="button" onClick={() => patch({ accent: c })} aria-label={n} aria-pressed={site.accent === c} title={n} className="h-9 w-9 rounded-full border-2 transition-transform hover:scale-105" style={{ background: c, borderColor: site.accent === c ? INK : "transparent" }} />
                  ))}
                  <label className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-dashed border-[#1B1A17]/30" title="Vlastná farba">
                    <input type="color" value={site.accent} onChange={(e) => patch({ accent: e.target.value })} aria-label="Vlastná farba" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                    <span className="flex h-full w-full items-center justify-center text-[0.9rem]" aria-hidden="true">
                      +
                    </span>
                  </label>
                </div>
              </div>
              <div>
                <span className={label}>Písmo</span>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(Object.keys(FONTS) as FontKey[]).map((k) => (
                    <button key={k} type="button" aria-pressed={site.font === k} onClick={() => patch({ font: k })} className="rounded-lg border px-3 py-2.5 text-left transition-colors" style={{ borderColor: site.font === k ? INK : "rgba(27,26,23,0.15)" }}>
                      <span className="block text-[1.05rem] leading-none" style={FONTS[k].style}>
                        Aa
                      </span>
                      <span className="mt-1 block text-[0.66rem] text-[#1B1A17]/60">{FONTS[k].label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className={label}>Úvodná fotka</span>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(Object.keys(HEROES) as HeroImg[]).map((k) => (
                    <button key={k} type="button" aria-pressed={site.hero === k} aria-label={HEROES[k]} onClick={() => patch({ hero: k })} className="overflow-hidden rounded-lg border-2 transition-transform hover:scale-[1.02]" style={{ borderColor: site.hero === k ? INK : "transparent" }}>
                      <span className="block aspect-[4/3] bg-cover bg-center" style={{ backgroundImage: `url(${IMG}/${k}.jpg)` }} />
                      <span className="block py-1 text-[0.62rem] font-bold">{HEROES[k]}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className={label}>Rozloženie úvodu</span>
                <div className="mt-2 inline-flex overflow-hidden rounded-full border border-[#1B1A17]/20">
                  {(["left", "center"] as const).map((k) => (
                    <button key={k} type="button" aria-pressed={site.layout === k} onClick={() => patch({ layout: k })} className="px-4 py-1.5 text-[0.72rem] font-bold tracking-[0.06em]" style={site.layout === k ? { background: INK, color: PAPER } : { color: "rgba(27,26,23,0.7)" }}>
                      {k === "left" ? "Vľavo" : "Na stred"}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : null}

          {tab === "sekcie" ? (
            <>
              <div>
                <span className={label}>Čo je na stránke</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(["menu", "gallery", "book", "news", "shop"] as SectionKey[]).map((k) => (
                    <button key={k} type="button" aria-pressed={site.on[k]} onClick={() => patch({ on: { ...site.on, [k]: !site.on[k] } })} className="rounded-full border px-3.5 py-1.5 text-[0.72rem] font-bold tracking-[0.06em] transition-colors" style={site.on[k] ? { background: INK, color: PAPER, borderColor: INK } : { borderColor: "rgba(27,26,23,0.25)", color: "rgba(27,26,23,0.7)" }}>
                      {T.sk[k]}
                    </button>
                  ))}
                </div>
              </div>
              <div id={`${id}-menu`} tabIndex={-1} className="rounded-xl border p-3 outline-none" style={{ borderColor: flash === "menu" ? site.accent : "rgba(27,26,23,0.12)" }}>
                <div className="flex items-center justify-between">
                  <span className={label}>Menu · položky a ceny</span>
                  <button type="button" onClick={() => patch({ menu: [...site.menu, { id: uid(), name: "", price: "0,00 €" }] })} className="rounded-full px-3 py-1 text-[0.66rem] font-bold text-white" style={{ background: INK }}>
                    + Pridať
                  </button>
                </div>
                <ul className="mt-2 space-y-2">
                  {site.menu.map((d) => (
                    <li key={d.id} className="grid grid-cols-[1fr_5.5rem_auto] items-center gap-2">
                      <input value={d.name} maxLength={32} placeholder="názov" aria-label="Názov jedla" onChange={(e) => setDish(d.id, { name: e.target.value })} className="rounded-lg border border-[#1B1A17]/15 bg-[#FBF8F2] px-2.5 py-2 text-[0.85rem] outline-none focus:border-[#2F5BFF]" />
                      <input value={d.price} maxLength={10} placeholder="cena" aria-label="Cena" onChange={(e) => setDish(d.id, { price: e.target.value })} className="rounded-lg border border-[#1B1A17]/15 bg-[#FBF8F2] px-2.5 py-2 text-right text-[0.85rem] outline-none focus:border-[#2F5BFF]" style={MONO} />
                      <button type="button" aria-label="Odstrániť" onClick={() => patch({ menu: site.menu.filter((x) => x.id !== d.id) })} className="rounded-full px-2 py-1 text-[0.9rem] text-[#1B1A17]/50 hover:text-[#B5472C]">
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}

          {tab === "novinky" ? (
            <div id={`${id}-news`} tabIndex={-1} className="outline-none">
              <div className="flex items-center justify-between">
                <span className={label}>Články</span>
                <button
                  type="button"
                  onClick={() => patch({ on: { ...site.on, news: true }, news: [{ id: uid(), title: "", text: "", date: "dnes" }, ...site.news] })}
                  className="rounded-full px-3 py-1 text-[0.66rem] font-bold text-white"
                  style={{ background: BLUE }}
                >
                  + Nový článok
                </button>
              </div>
              {!site.on.news ? <p className="mt-2 text-[0.72rem] text-[#1B1A17]/55">Sekcia Novinky je vypnutá — nový článok ju zapne.</p> : null}
              <ul className="mt-3 space-y-3">
                {site.news.map((p) => (
                  <li key={p.id} className="rounded-xl border border-[#1B1A17]/12 p-3">
                    <input value={p.title} maxLength={60} placeholder="Nadpis článku" aria-label="Nadpis článku" onChange={(e) => setPost(p.id, { title: e.target.value })} className="w-full rounded-lg border border-[#1B1A17]/15 bg-[#FBF8F2] px-2.5 py-2 text-[0.9rem] font-bold outline-none focus:border-[#2F5BFF]" />
                    <textarea value={p.text} maxLength={160} rows={2} placeholder="Krátky text…" aria-label="Text článku" onChange={(e) => setPost(p.id, { text: e.target.value })} className="mt-2 w-full rounded-lg border border-[#1B1A17]/15 bg-[#FBF8F2] px-2.5 py-2 text-[0.85rem] outline-none focus:border-[#2F5BFF]" />
                    <div className="mt-2 flex items-center justify-between text-[0.66rem] text-[#1B1A17]/50">
                      <span style={MONO}>{p.date.toUpperCase()}</span>
                      <button type="button" onClick={() => patch({ news: site.news.filter((x) => x.id !== p.id) })} className="hover:text-[#B5472C]">
                        Zmazať
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {tab === "obchod" ? (
            <div id={`${id}-product`} tabIndex={-1} className="outline-none">
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-[#1B1A17]/12 px-4 py-3">
                <span>
                  <span className="block text-[0.9rem] font-bold">Predávať online</span>
                  <span className="block text-[0.72rem] text-[#1B1A17]/55">WooCommerce: produkt, košík, platba, doprava</span>
                </span>
                <input type="checkbox" checked={site.on.shop} onChange={(e) => patch({ on: { ...site.on, shop: e.target.checked } })} className="h-5 w-5 accent-[#2F5BFF]" />
              </label>
              {site.on.shop ? (
                <div className="mt-3 space-y-3">
                  <div>
                    <label htmlFor={`${id}-pname`} className={label}>
                      Produkt
                    </label>
                    <input id={`${id}-pname`} value={site.product.name} maxLength={40} onChange={(e) => patch({ product: { ...site.product, name: e.target.value } })} className={input} />
                  </div>
                  <div>
                    <label htmlFor={`${id}-pprice`} className={label}>
                      Cena
                    </label>
                    <input id={`${id}-pprice`} value={site.product.price} maxLength={10} onChange={(e) => patch({ product: { ...site.product, price: e.target.value } })} className={input} style={MONO} />
                  </div>
                  <p className="text-[0.72rem] text-[#1B1A17]/55">
                    V náhľade funguje košík: {cart} {cart === 1 ? "kus" : cart < 5 ? "kusy" : "kusov"}.{" "}
                    {cart > 0 ? (
                      <button type="button" onClick={() => setCart(0)} className="underline">
                        vyprázdniť
                      </button>
                    ) : null}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* publish, revisions, reset */}
        <div className="mt-auto border-t border-[#1B1A17]/10 px-5 py-4">
          <div className="flex gap-2">
            <button type="button" onClick={publish} data-publish className="flex-1 rounded-full px-5 py-3 text-[0.85rem] font-bold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98]" style={{ background: BLUE }}>
              Publikovať
            </button>
            <button type="button" onClick={reset} className="rounded-full border border-[#1B1A17]/25 px-4 py-3 text-[0.78rem] font-bold text-[#1B1A17]/70 transition-colors hover:border-[#1B1A17]">
              Pôvodné
            </button>
          </div>
          <p className="mt-2 min-h-[1.1rem] text-[0.72rem]" style={{ color: publishedAt ? "#2F7A4F" : "rgba(27,26,23,0.5)" }} aria-live="polite">
            {publishedAt ? `✓ Zverejnené o ${publishedAt}. Návštevníci to už vidia.` : "Zmeny sa zobrazujú v náhľade okamžite; publikovanie ich zverejní."}
          </p>
          {revisions.length ? (
            <details className="mt-2" data-revisions>
              <summary className="cursor-pointer text-[0.72rem] font-bold text-[#1B1A17]/70">Revízie ({revisions.length}) — vrátiť staršiu verziu</summary>
              <ul className="mt-2 space-y-1">
                {revisions.map((r, i) => (
                  <li key={`${r.at}-${r.site.headline}-${i.toString()}`} className="flex items-center justify-between gap-3 text-[0.74rem]">
                    <span className="truncate text-[#1B1A17]/70">
                      <span style={MONO}>{r.at}</span> · {r.site.headline}
                    </span>
                    <button type="button" onClick={() => restore(r)} className="shrink-0 underline">
                      Obnoviť
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      </div>

      {/* the live site */}
      <div className="wfx" style={{ ["--fx-delay" as string]: "0.27s" }}>
        <div className="mb-3 flex items-center justify-between">
          <div className="inline-flex overflow-hidden rounded-full border border-[#1B1A17]/20">
            {(["desktop", "phone"] as const).map((d) => (
              <button key={d} type="button" aria-pressed={device === d} onClick={() => setDevice(d)} className="px-4 py-1.5 text-[0.72rem] font-bold tracking-[0.06em]" style={device === d ? { background: INK, color: PAPER } : { color: "rgba(27,26,23,0.7)" }}>
                {d === "desktop" ? "Počítač" : "Telefón"}
              </button>
            ))}
          </div>
          <span className="text-[0.62rem] text-[#1B1A17]/50" style={MONO}>
            KLIKNI NA ČOKOĽVEK V NÁHĽADE
          </span>
        </div>
        {device === "phone" ? (
          <div className="mx-auto w-[22rem] max-w-full rounded-[2.2rem] border-[8px] border-[#1B1A17] bg-[#1B1A17] p-0 shadow-[0_40px_90px_-30px_rgba(27,26,23,0.5)]">
            <Preview site={site} phone cart={cart} onCart={() => setCart((c) => c + 1)} onEdit={jump} />
          </div>
        ) : (
          <Preview site={site} cart={cart} onCart={() => setCart((c) => c + 1)} onEdit={jump} />
        )}
      </div>
    </div>
  )
}
