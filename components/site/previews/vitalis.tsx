/**
 * Concept preview — Vitalis, súkromná klinika.
 *
 * Design direction: light, calm, generous whitespace, one cool accent. The
 * palette is hard-coded because this is a *different* website being shown
 * inside ours; it must not follow Webora's own light/dark theme.
 */

const NAV = ["Služby", "Náš tím", "Cenník", "Kontakt"]

const CARDS = [
  { title: "Všeobecná ambulancia", note: "Bez čakania na termín" },
  { title: "Preventívne prehliadky", note: "Komplexne za jednu návštevu" },
  { title: "Laboratórna diagnostika", note: "Výsledky online do 24 h" },
]

const SLOTS = ["8:30", "9:15", "11:00", "13:45"]

export function VitalisPreview() {
  return (
    <div className="absolute inset-0 flex flex-col bg-white text-[#0F2A2E]">
      <header className="flex items-center justify-between border-b border-[#E4EDEC] px-[4cqw] py-[1.7cqw]">
        <span className="text-[1.5cqw] font-semibold tracking-[0.26em]">
          VITALIS
        </span>
        <nav className="flex items-center gap-[2.2cqw] text-[1.25cqw] text-[#5B6F71]">
          {NAV.map((item) => (
            <span key={item}>{item}</span>
          ))}
          <span className="rounded-full bg-[#0E7C7B] px-[1.8cqw] py-[0.7cqw] text-white">
            Objednať sa
          </span>
        </nav>
      </header>

      <div className="flex flex-1 items-center gap-[4cqw] px-[4cqw] py-[3cqw]">
        <div className="flex-[1.05]">
          <p className="text-[1.1cqw] font-medium tracking-[0.18em] text-[#0E7C7B] uppercase">
            Súkromná klinika
          </p>
          <p className="mt-[1.4cqw] text-[4.6cqw] leading-[1.04] font-semibold tracking-[-0.03em]">
            Termín do 48 hodín.
            <br />
            Bez čakania v rade.
          </p>
          <p className="mt-[1.6cqw] max-w-[26cqw] text-[1.45cqw] leading-[1.55] text-[#5B6F71]">
            Objednajte sa online, vyberte si čas a príďte presne na svoju hodinu.
          </p>
          <div className="mt-[2.4cqw] flex items-center gap-[1.6cqw] text-[1.3cqw]">
            <span className="rounded-full bg-[#0E7C7B] px-[2.2cqw] py-[0.95cqw] font-medium text-white">
              Objednať termín
            </span>
            <span className="font-medium text-[#0E7C7B]">Cenník ›</span>
          </div>
        </div>

        <div className="flex-1 rounded-[1.6cqw] bg-[#F1F8F7] p-[2.2cqw]">
          <div className="flex items-baseline justify-between">
            <span className="text-[1.35cqw] font-semibold">Utorok 24. 9.</span>
            <span className="text-[1.1cqw] text-[#5B6F71]">MUDr. Halásová</span>
          </div>
          <div className="mt-[1.6cqw] grid grid-cols-4 gap-[0.8cqw]">
            {SLOTS.map((slot, index) => (
              <span
                key={slot}
                className={
                  index === 1
                    ? "rounded-[0.7cqw] bg-[#0E7C7B] py-[1cqw] text-center text-[1.2cqw] font-medium text-white"
                    : "rounded-[0.7cqw] bg-white py-[1cqw] text-center text-[1.2cqw] text-[#5B6F71]"
                }
              >
                {slot}
              </span>
            ))}
          </div>
          <div className="mt-[1.6cqw] h-px bg-[#DCEAE9]" />
          <p className="mt-[1.4cqw] text-[1.1cqw] leading-[1.5] text-[#5B6F71]">
            Potvrdenie termínu dostanete e-mailom aj SMS.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 border-t border-[#E4EDEC]">
        {CARDS.map((card) => (
          <div
            key={card.title}
            className="border-r border-[#E4EDEC] px-[3cqw] py-[2cqw] last:border-r-0"
          >
            <p className="text-[1.3cqw] font-semibold">{card.title}</p>
            <p className="mt-[0.5cqw] text-[1.1cqw] text-[#5B6F71]">
              {card.note}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Mobile layout of the same concept — deliberately re-laid out, not shrunk. */
export function VitalisMobilePreview() {
  return (
    <div className="absolute inset-0 flex flex-col bg-white text-[#0F2A2E]">
      <header className="flex items-center justify-between px-[6cqw] pt-[9cqw] pb-[3cqw]">
        <span className="text-[3.6cqw] font-semibold tracking-[0.24em]">
          VITALIS
        </span>
        <span
          aria-hidden="true"
          className="flex flex-col gap-[1cqw] pt-[0.5cqw]"
        >
          <span className="block h-[0.7cqw] w-[5cqw] rounded-full bg-[#0F2A2E]" />
          <span className="block h-[0.7cqw] w-[5cqw] rounded-full bg-[#0F2A2E]" />
        </span>
      </header>

      <div className="px-[6cqw] pt-[4cqw]">
        <p className="text-[2.8cqw] font-medium tracking-[0.16em] text-[#0E7C7B] uppercase">
          Súkromná klinika
        </p>
        <p className="mt-[3cqw] text-[9cqw] leading-[1.05] font-semibold tracking-[-0.03em]">
          Termín do 48 hodín.
        </p>
        <p className="mt-[3cqw] text-[3.6cqw] leading-[1.55] text-[#5B6F71]">
          Objednajte sa online a príďte presne na svoju hodinu.
        </p>
        <span className="mt-[5cqw] block rounded-full bg-[#0E7C7B] py-[3.4cqw] text-center text-[3.6cqw] font-medium text-white">
          Objednať termín
        </span>
      </div>

      <div className="mt-[6cqw] flex-1 rounded-t-[5cqw] bg-[#F1F8F7] px-[6cqw] pt-[5cqw]">
        <span className="text-[3.4cqw] font-semibold">Voľné termíny</span>
        <div className="mt-[3.5cqw] grid grid-cols-2 gap-[2.5cqw]">
          {SLOTS.map((slot, index) => (
            <span
              key={slot}
              className={
                index === 1
                  ? "rounded-[2.5cqw] bg-[#0E7C7B] py-[3cqw] text-center text-[3.4cqw] font-medium text-white"
                  : "rounded-[2.5cqw] bg-white py-[3cqw] text-center text-[3.4cqw] text-[#5B6F71]"
              }
            >
              {slot}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
