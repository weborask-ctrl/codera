/**
 * Concept preview — Konštrukt, stavebná spoločnosť.
 *
 * Design direction: dark, structural, precise. Type is the only decoration;
 * one warm accent carries the hierarchy against a near-black field.
 */

const NAV = ["Realizácie", "Služby", "O spoločnosti", "Kariéra"]

const STATS = [
  { value: "Priemysel", note: "Haly a výrobné objekty" },
  { value: "Občianske", note: "Administratíva a školstvo" },
  { value: "Rekonštrukcie", note: "Zásahy do prevádzky" },
]

export function KonstruktPreview() {
  return (
    <div className="absolute inset-0 flex flex-col bg-[#0E1013] text-[#F2F3F4]">
      <header className="flex items-center justify-between px-[4cqw] py-[1.8cqw]">
        <span className="text-[1.5cqw] font-semibold tracking-[0.3em]">
          KONŠTRUKT
        </span>
        <nav className="flex items-center gap-[2.4cqw] text-[1.2cqw] text-[#9BA1A8]">
          {NAV.map((item) => (
            <span key={item}>{item}</span>
          ))}
          <span className="border-b border-[#F0A63C] pb-[0.3cqw] text-[#F0A63C]">
            Dopyt
          </span>
        </nav>
      </header>

      <div className="flex flex-1 gap-[3cqw] px-[4cqw] pt-[3cqw] pb-[2cqw]">
        <div className="flex-[1.25]">
          <p className="text-[1.1cqw] font-medium tracking-[0.22em] text-[#F0A63C] uppercase">
            Generálny dodávateľ stavieb
          </p>
          <p className="mt-[1.6cqw] text-[4.6cqw] leading-[1.02] font-semibold tracking-[-0.035em]">
            Staviame presne.
            <br />
            Odovzdávame načas.
          </p>
          <p className="mt-[1.8cqw] max-w-[30cqw] text-[1.4cqw] leading-[1.55] text-[#9BA1A8]">
            Priemyselné a občianske stavby na kľúč — od prípravy až po
            kolaudáciu.
          </p>
          <div className="mt-[2.4cqw] flex items-center gap-[1.8cqw] text-[1.3cqw]">
            <span className="bg-[#F0A63C] px-[2.2cqw] py-[0.95cqw] font-medium text-[#0E1013]">
              Vyžiadať cenovú ponuku
            </span>
            <span className="text-[#9BA1A8]">Pozrieť realizácie ›</span>
          </div>
        </div>

        {/* Right column carries the "current build" card. Without it the
            composition is empty from the centre out — which reads as an
            unfinished page in the before/after comparison. */}
        <div className="flex flex-1 flex-col justify-end border-l border-white/12 pl-[2.4cqw]">
          <p className="text-[1.05cqw] tracking-[0.2em] text-[#9BA1A8] uppercase">
            Prebiehajúca stavba
          </p>
          <div
            aria-hidden="true"
            className="mt-[1.4cqw] flex h-[9cqw] items-end gap-[0.7cqw]"
          >
            {[38, 62, 48, 84, 56, 72, 44].map((height) => (
              <span
                key={height}
                className="flex-1 bg-white/12"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <p className="mt-[1.6cqw] text-[1.9cqw] leading-[1.15] font-semibold tracking-[-0.025em]">
            Výrobná hala
          </p>
          <p className="mt-[0.5cqw] text-[1.2cqw] text-[#9BA1A8]">
            Žilina · 4 200 m² · odovzdanie 2026
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 border-t border-white/10">
        {STATS.map((stat) => (
          <div
            key={stat.value}
            className="border-r border-white/10 px-[3cqw] py-[2.1cqw] last:border-r-0"
          >
            <p className="text-[1.5cqw] font-semibold tracking-[-0.02em]">
              {stat.value}
            </p>
            <p className="mt-[0.5cqw] text-[1.1cqw] text-[#9BA1A8]">
              {stat.note}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
