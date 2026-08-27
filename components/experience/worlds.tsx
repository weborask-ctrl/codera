"use client"

/**
 * Art Direction v2 — the three project PAINT WORLDS.
 *
 * Each world is a full-bleed environment, not a card on a canvas
 * (The1: "the color block IS the card"). Three deliberately different
 * families: painted-concrete industrial (Konštrukt), sage clinic at
 * dawn (Vitalis), candlelit material gallery (Forma). `compact` trims
 * secondary layers for the mobile deck.
 */

const MONO = { fontFamily: "var(--font-geist-mono)" }
const SERIF = { fontFamily: "var(--font-fraunces), Georgia, serif" }

/* ------------------------------------------------------------ shared --- */

function WorldMeta({
  index,
  name,
  sector,
  ink,
}: {
  index: string
  name: string
  sector: string
  ink: string
}) {
  return (
    <div
      className="flex items-baseline justify-between px-[clamp(1.1rem,3.2vw,3rem)] pt-20 pb-2 text-[0.6rem] tracking-[0.24em]"
      style={{ color: ink, ...MONO }}
    >
      <span>
        03·{index} {name} — {sector}
      </span>
      <span className="opacity-70">UKÁŽKOVÝ KONCEPT</span>
    </div>
  )
}

/* --------------------------------------------------------- KONŠTRUKT --- */

export function KonstruktWorld({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className="relative flex h-full flex-col overflow-hidden"
      style={{ background: "#d8d7d2", color: "#191a1c" }}
    >
      {/* painted-concrete grain + blueprint grid over the WHOLE world */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 20% 0%, rgba(255,255,255,0.5) 0%, transparent 55%), radial-gradient(90% 70% at 85% 100%, rgba(105,104,99,0.28) 0%, transparent 60%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(25,26,28,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(25,26,28,0.08) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <WorldMeta index="01" name="KONŠTRUKT" sector="STAVEBNÍCTVO" ink="#191a1c" />

      {/* world chrome */}
      <div className="relative z-10 mx-[clamp(1.1rem,3.2vw,3rem)] flex items-center justify-between border-y border-black/25 py-3">
        <span className="text-[1.05rem] font-semibold" style={{ fontStretch: "125%" }}>
          KONŠTRUKT
        </span>
        <div className="hidden gap-7 text-[0.6rem] tracking-[0.22em] text-black/55 md:flex" style={MONO}>
          <span>REALIZÁCIE</span>
          <span>TECHNOLÓGIE</span>
          <span>KARIÉRA</span>
        </div>
        <span className="border-2 border-[#191a1c] px-4 py-1.5 text-[0.62rem] font-semibold tracking-[0.16em]">
          DOPYT
        </span>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1">
        {/* type-wall collides with the mural edge (Laxenaire collision) */}
        <div className="flex min-w-0 flex-1 flex-col justify-center pl-[clamp(1.1rem,3.2vw,3rem)]">
          <p className="mb-3 text-[0.62rem] tracking-[0.3em] text-[#a4520f]" style={MONO}>
            GENERÁLNY DODÁVATEĽ · PRIEMYSELNÉ STAVBY · OD PROJEKCIE PO KOLAUDÁCIU
          </p>
          <p
            className="font-semibold uppercase"
            style={{
              fontSize: compact ? "clamp(2.2rem,9vw,3.4rem)" : "clamp(2.6rem,7.2vw,7.6rem)",
              lineHeight: 0.82,
              letterSpacing: "-0.01em",
              fontStretch: "125%",
            }}
          >
            Postavené
            <br />
            presne.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-5">
            <span className="bg-[#191a1c] px-6 py-3 text-[0.66rem] font-semibold tracking-[0.12em] text-[#d8d7d2]">
              VYŽIADAŤ PONUKU
            </span>
            <span className="text-[0.66rem] tracking-[0.08em] text-black/60 underline underline-offset-4">
              Realizácie →
            </span>
          </div>
          {!compact ? (
            <div className="mt-7 grid max-w-[34rem] grid-cols-3 gap-px border border-black/25 bg-black/25 text-[0.56rem]" style={MONO}>
              {[
                ["27", "DOKONČENÝCH HÁL"],
                ["96 %", "TERMÍNOV DODRŽANÝCH"],
                ["4 200 m²", "NAJVÄČŠIA REALIZÁCIA"],
              ].map(([n, l]) => (
                <div key={l} className="bg-[#d8d7d2] px-3 py-2.5">
                  <p className="text-[1.05rem] font-semibold tracking-normal" style={{ fontStretch: "115%" }}>
                    {n}
                  </p>
                  <p className="mt-0.5 tracking-[0.12em] text-black/55">{l}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* full-height blueprint mural: dot-matrix + axonometry + dims */}
        <div className={`relative border-l-2 border-black/30 ${compact ? "w-[38%]" : "hidden w-[44%] md:block"}`}>
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(rgba(25,26,28,0.35) 1.1px, transparent 1.1px)",
              backgroundSize: "17px 17px",
              maskImage: "radial-gradient(120% 90% at 60% 45%, black 30%, transparent 78%)",
            }}
          />
          <svg viewBox="0 0 460 620" className="absolute inset-0 h-full w-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
            <g stroke="#191a1c" strokeWidth="1.6" fill="none" opacity="0.85">
              <path d="M70 430 L230 340 L390 430 L230 520 Z" />
              <path d="M70 430 L70 285 L230 195 L390 285 L390 430" />
              <path d="M230 340 L230 195" />
              <path d="M70 285 L230 375 L390 285" />
            </g>
            <g stroke="#191a1c" strokeWidth="1" fill="none" opacity="0.5" strokeDasharray="5 6">
              <path d="M110 262 L110 405" />
              <path d="M170 228 L170 372" />
              <path d="M290 228 L290 372" />
              <path d="M350 262 L350 405" />
            </g>
            {/* dimension lines */}
            <g stroke="#191a1c" strokeWidth="1" opacity="0.6">
              <path d="M70 555 L390 555" />
              <path d="M70 548 L70 562" />
              <path d="M390 548 L390 562" />
              <path d="M425 285 L425 430" />
              <path d="M418 285 L432 285" />
              <path d="M418 430 L432 430" />
            </g>
            <g fill="#191a1c" opacity="0.75" fontSize="12.5" fontFamily="var(--font-geist-mono)">
              <text x="188" y="577">64,0 m</text>
              <text x="401" y="364" transform="rotate(90 401 364)">18,4 m</text>
              <text x="70" y="120">HALA A — OCEĽOVÝ SKELET</text>
              <text x="70" y="140">BETÓN C30/37 · S355</text>
            </g>
            <rect x="216" y="188" width="28" height="8" fill="#a4520f" />
            <circle cx="70" cy="430" r="4" fill="#a4520f" />
          </svg>
          {/* steel material band */}
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 h-full w-[14%]"
            style={{
              background: "linear-gradient(180deg,#c2c1bb 0%,#84837d 34%,#b7b6b0 52%,#6e6d68 78%,#a09f99 100%)",
              borderLeft: "2px solid rgba(25,26,28,0.35)",
            }}
          />
        </div>
      </div>

      {/* dense spec strip — industrial systems celebrate tables */}
      {!compact ? (
        <div className="relative z-10 grid grid-cols-2 gap-px border-t-2 border-black/30 bg-black/25 text-[0.58rem] md:grid-cols-4" style={MONO}>
          {[
            ["01 PRIEMYSEL", "haly · výrobné objekty · sklady"],
            ["02 OBČIANSKE", "administratíva · školstvo"],
            ["03 REKONŠTRUKCIE", "zásahy počas prevádzky"],
            ["04 PROJEKCIA", "statika · TZB · koordinácia"],
          ].map(([n, l]) => (
            <div key={n} className="flex flex-col gap-0.5 bg-[#d8d7d2] px-4 py-3">
              <span className="font-semibold tracking-[0.1em] text-[#a4520f]">{n}</span>
              <span className="tracking-[0.04em] text-black/60">{l}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------ VITALIS --- */

export function VitalisWorld({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className="relative flex h-full flex-col overflow-hidden"
      style={{ background: "#e7efe9", color: "#1c3833" }}
    >
      {/* breathing dawn atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 58% at 76% 24%, rgba(255,255,255,0.9) 0%, transparent 60%), radial-gradient(56% 48% at 14% 82%, rgba(29,95,90,0.18) 0%, transparent 62%), radial-gradient(40% 34% at 88% 78%, rgba(148,196,182,0.5) 0%, transparent 65%), radial-gradient(38% 30% at 20% 26%, rgba(148,196,182,0.34) 0%, transparent 68%)",
        }}
      />
      {/* concentric calm rings */}
      <svg aria-hidden="true" className="pointer-events-none absolute -top-[18%] -right-[10%] h-[80%] w-[55%] opacity-[0.5]" viewBox="0 0 400 400">
        {[60, 100, 140, 180].map((r) => (
          <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="#1d5f5a" strokeOpacity="0.16" strokeWidth="1.2" />
        ))}
      </svg>

      <WorldMeta index="02" name="VITALIS" sector="ZDRAVOTNÍCTVO" ink="#1c3833" />

      <div className="relative z-10 mx-[clamp(1.1rem,3.2vw,3rem)] flex items-center justify-between py-3">
        <span className="text-[0.98rem] font-semibold tracking-[0.3em]">VITALIS</span>
        <div className="hidden gap-7 text-[0.62rem] tracking-[0.16em] text-[#1c3833]/60 md:flex">
          <span>Služby</span>
          <span>Náš tím</span>
          <span>Cenník</span>
        </div>
        <span className="rounded-full bg-[#1d5f5a] px-5 py-2 text-[0.62rem] font-medium text-[#f3faf6]">
          Objednať sa
        </span>
      </div>

      {/* quiet status line anchoring the upper-left air */}
      <div
        className="relative z-10 mx-[clamp(1.1rem,3.2vw,3rem)] mt-3 flex items-center gap-2.5 text-[0.56rem] tracking-[0.2em] text-[#1c3833]/55"
        style={MONO}
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#2e7d54]" />
        DNES OTVORENÉ · 7:00 — 18:00 · BEZ ČAKANIA
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 items-center gap-[4%] px-[clamp(1.1rem,3.2vw,3rem)]">
        <div className="max-w-[32em] flex-1">
          <p className="mb-3 text-[0.6rem] tracking-[0.3em] text-[#1d5f5a]" style={MONO}>
            SÚKROMNÁ KLINIKA · BRATISLAVA
          </p>
          <p
            className="font-semibold"
            style={{
              fontSize: compact ? "clamp(1.7rem,6.4vw,2.6rem)" : "clamp(2rem,3.9vw,4rem)",
              lineHeight: 1.02,
              letterSpacing: "-0.028em",
            }}
          >
            Termín do 48 hodín.
            <br />
            Bez čakania v rade.
          </p>
          <p className="mt-4 max-w-[24em] text-[0.72rem] leading-relaxed text-[#1c3833]/70">
            Objednajte sa online, vyberte si čas a príďte presne na svoju
            hodinu. Potvrdenie príde e-mailom aj SMS.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span className="rounded-full bg-[#1d5f5a] px-6 py-2.5 text-[0.66rem] font-medium text-[#f3faf6]">
              Objednať termín
            </span>
            <span className="text-[0.66rem] text-[#1c3833]/60 underline underline-offset-4">
              Preventívne prehliadky
            </span>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {["Zmluvné poisťovne", "Výsledky v mobile", "Parkovanie"].map((t) => (
              <span
                key={t}
                className="rounded-full border border-[#1d5f5a]/30 bg-white/45 px-3.5 py-1.5 text-[0.56rem] tracking-[0.06em] text-[#1c3833]/75"
              >
                ✓ {t}
              </span>
            ))}
          </div>
        </div>

        {/* glass booking panel floating over the atmosphere (Mercury/Superhuman) */}
        {!compact ? (
          <div className="relative hidden w-[38%] md:block">
            <div
              className="relative rounded-[10px] border border-white/70 p-6"
              style={{
                background: "rgba(255,255,255,0.62)",
                backdropFilter: "blur(14px)",
                boxShadow: "0 30px 70px rgba(28,56,51,0.16)",
              }}
            >
              <div className="mb-4 flex gap-2 text-[0.56rem]" style={MONO}>
                {["UT 24. 9.", "ST 25. 9.", "ŠT 26. 9."].map((d, i) => (
                  <span
                    key={d}
                    className={
                      i === 0
                        ? "rounded-full bg-[#1c3833] px-3 py-1.5 text-[#f3faf6]"
                        : "rounded-full border border-[#1c3833]/25 px-3 py-1.5 text-[#1c3833]/60"
                    }
                  >
                    {d}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {["8:30", "9:15", "11:00", "13:45", "14:30", "15:15", "16:00", "16:45"].map((t, i) => (
                  <span
                    key={t}
                    className={
                      i === 1
                        ? "rounded-[7px] bg-[#1d5f5a] px-2 py-2.5 text-center text-[0.6rem] font-medium text-white"
                        : "rounded-[7px] border border-[#1c3833]/18 bg-white/60 px-2 py-2.5 text-center text-[0.6rem] text-[#1c3833]/75"
                    }
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-baseline justify-between border-t border-[#1c3833]/12 pt-3">
                <span className="text-[0.66rem] font-semibold">MUDr. Halásová</span>
                <span className="text-[0.56rem] text-[#1c3833]/55">všeobecná ambulancia</span>
              </div>
            </div>
            {/* overlapping confirmation chip = depth */}
            <div
              className="absolute -bottom-6 -left-8 rounded-[10px] border border-white/70 px-4 py-3 text-[0.6rem]"
              style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(10px)", boxShadow: "0 18px 40px rgba(28,56,51,0.18)" }}
            >
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#2e9e6b] align-middle" />
              Termín potvrdený — utorok 9:15
            </div>
          </div>
        ) : null}
      </div>

      {!compact ? (
        <div className="relative z-10 mx-[clamp(1.1rem,3.2vw,3rem)] mb-0 grid grid-cols-3 border-t border-[#1c3833]/15 py-4 text-[0.6rem] text-[#1c3833]/65">
          {[
            ["Všeobecná ambulancia", "bez čakania na termín"],
            ["Preventívne prehliadky", "komplexne za jednu návštevu"],
            ["Laboratórna diagnostika", "výsledky online do 24 h"],
          ].map(([a, b]) => (
            <div key={a} className="pr-6">
              <p className="font-semibold text-[#1c3833]">{a}</p>
              <p className="mt-0.5">{b}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------- FORMA --- */

export function FormaWorld({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className="relative flex h-full flex-col overflow-hidden"
      style={{ background: "#201a15", color: "#efe6d8" }}
    >
      {/* candlelight (Limón's brasserie glow) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 46% at 30% 12%, rgba(214,158,86,0.28) 0%, transparent 60%), radial-gradient(46% 40% at 82% 88%, rgba(156,59,34,0.22) 0%, transparent 62%), radial-gradient(120% 100% at 50% 50%, transparent 40%, rgba(10,7,5,0.55) 100%)",
        }}
      />

      <WorldMeta index="03" name="FORMA" sector="INTERIÉROVÝ ATELIÉR" ink="#efe6d8" />

      <div className="relative z-10 mx-[clamp(1.1rem,3.2vw,3rem)] flex items-center justify-between border-b border-[#efe6d8]/15 py-3">
        <span className="text-[1.15rem] italic" style={SERIF}>
          Forma
        </span>
        <div className="hidden gap-7 text-[0.58rem] tracking-[0.24em] text-[#efe6d8]/55 md:flex" style={MONO}>
          <span>PROJEKTY</span>
          <span>PRÍSTUP</span>
          <span>KONTAKT</span>
        </div>
        <span className="text-[0.62rem] tracking-[0.12em] text-[#c96f4a] underline underline-offset-4">
          Konzultácia
        </span>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 px-[clamp(1.1rem,3.2vw,3rem)] pt-[4svh]">
        <div className="min-w-0 flex-1">
          <p
            style={{
              ...SERIF,
              fontSize: compact ? "clamp(1.9rem,7vw,2.9rem)" : "clamp(2.3rem,4.6vw,4.8rem)",
              lineHeight: 1.02,
              letterSpacing: "-0.015em",
            }}
          >
            Interiéry, ktoré
            <br />
            vydržia <em className="text-[#c96f4a]">dekádu.</em>
          </p>
          <p className="mt-4 max-w-[25em] text-[0.72rem] leading-relaxed text-[#efe6d8]/65">
            Navrhujeme priestory pre ľudí, ktorí ich budú roky používať —
            nie pre fotografiu do katalógu.
          </p>
          <p className="mt-6 text-[0.6rem] tracking-[0.2em] text-[#c96f4a]" style={MONO}>
            AKO PRACUJEME →
          </p>

          {!compact ? (
            <div className="mt-[5svh] max-w-[24rem]">
              {[
                ["01", "Byt na Palisádach", "2024"],
                ["02", "Ordinácia Ružinov", "2024"],
                ["03", "Penzión Terchová", "2023"],
              ].map(([n, t, y]) => (
                <div key={n} className="flex items-baseline justify-between border-t border-[#efe6d8]/15 py-2.5">
                  <span className="flex items-baseline gap-3">
                    <span className="text-[0.56rem] text-[#c96f4a]" style={MONO}>
                      {n}
                    </span>
                    <span className="text-[0.8rem]">{t}</span>
                  </span>
                  <span className="text-[0.56rem] text-[#efe6d8]/45" style={MONO}>
                    {y}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* material plates — the gallery's art (HEED signage labels) */}
        <div className={`relative ${compact ? "w-[36%]" : "hidden w-[42%] md:block"}`}>
          <div className="absolute inset-x-6 top-2 bottom-[6svh] grid grid-cols-[1.6fr_1fr] grid-rows-[1.3fr_1fr_0.8fr] gap-3">
            <div
              className="relative row-span-2"
              style={{ background: "linear-gradient(160deg,#a8492b 0%,#8c3820 55%,#6f2b18 100%)" }}
            >
              <span className="absolute bottom-2 left-2 text-[0.5rem] tracking-[0.2em] text-[#efe6d8]/80" style={MONO}>
                M01 — PÁLENÁ HLINA
              </span>
            </div>
            <div
              className="relative"
              style={{ background: "linear-gradient(150deg,#c9a35d 0%,#a9843f 100%)" }}
            >
              <span className="absolute bottom-2 left-2 text-[0.5rem] tracking-[0.2em] text-[#201a15]/80" style={MONO}>
                M02 — MOSADZ
              </span>
            </div>
            <div
              className="relative"
              style={{ background: "linear-gradient(165deg,#41503f 0%,#2c382b 100%)" }}
            >
              <span className="absolute bottom-2 left-2 text-[0.5rem] tracking-[0.2em] text-[#efe6d8]/80" style={MONO}>
                M03 — ZELENÁ BRIDLICA
              </span>
            </div>
            <div
              className="relative col-span-2"
              style={{ background: "linear-gradient(170deg,#59504472 0%,#3a332c 100%)", border: "1px solid rgba(239,230,216,0.14)" }}
            >
              <span className="absolute bottom-2 left-2 text-[0.5rem] tracking-[0.2em] text-[#efe6d8]/70" style={MONO}>
                M04 — DUB · DYMOVÝ VOSK
              </span>
            </div>
          </div>
        </div>
      </div>

      {!compact ? (
        <div
          className="relative z-10 flex items-baseline justify-between border-t border-[#efe6d8]/12 px-[clamp(1.1rem,3.2vw,3rem)] py-3.5 text-[0.56rem] tracking-[0.14em] text-[#efe6d8]/55"
          style={MONO}
        >
          <span>ATELIÉR BRATISLAVA</span>
          <span>KONZULTÁCIA V PRIESTORE ZDARMA</span>
        </div>
      ) : null}
    </div>
  )
}
