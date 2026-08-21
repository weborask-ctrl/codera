/**
 * The "before" state used in the transformation section — the same fictional
 * company as the Konštrukt concept, as its site would have looked around 2011.
 *
 * Deliberately dated, not a parody: fixed-width column, beveled gradients,
 * a sidebar of underlined links, cramped justified body copy and a hit
 * counter. It is a demonstration of a pattern, not a real company's website.
 */

const MENU = [
  "Úvodná stránka",
  "O našej spoločnosti",
  "Ponuka služieb",
  "Fotogaléria",
  "Referencie",
  "Kontaktné údaje",
]

const serif = { fontFamily: "'Times New Roman', Times, serif" } as const
const sans = { fontFamily: "Arial, Helvetica, sans-serif" } as const

export function LegacyPreview() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#8E9BAA]">
      {/* Fixed 800px-era content column floating on a flat page background. */}
      <div className="mx-auto flex h-full w-[86%] flex-col border-x border-[#5C6B7D] bg-white">
        <div
          className="flex items-end justify-between border-b-[0.35cqw] border-[#2B4A7A] bg-[linear-gradient(180deg,#4A7EBB_0%,#2B4A7A_100%)] px-[2.5cqw] pt-[2cqw] pb-[1.2cqw]"
          style={serif}
        >
          <div>
            <p className="text-[3cqw] leading-none font-bold text-white [text-shadow:0.15cqw_0.15cqw_0_#1B2F4E]">
              KONŠTRUKT s.r.o.
            </p>
            <p className="mt-[0.6cqw] text-[1.25cqw] text-[#C8DAF0] italic">
              stavebná spoločnosť — kvalitne a spoľahlivo
            </p>
          </div>
          <p className="text-[1.1cqw] text-[#C8DAF0]" style={sans}>
            Tel.: 041 / 123 45 67
          </p>
        </div>

        <div
          className="flex gap-[1.2cqw] border-b border-[#AAB6C4] bg-[#E6EAF0] px-[2.5cqw] py-[0.9cqw] text-[1.15cqw]"
          style={sans}
        >
          {["Úvod", "Služby", "Galéria", "Referencie", "Kontakt"].map(
            (item, index) => (
              <span key={item} className="flex items-center gap-[1.2cqw]">
                <span className="text-[#0000CC] underline">{item}</span>
                {index < 4 ? <span className="text-[#8A93A0]">|</span> : null}
              </span>
            )
          )}
        </div>

        <div className="flex flex-1 gap-[2cqw] px-[2.5cqw] py-[1.5cqw]">
          <div className="w-[26%] shrink-0">
            <div
              className="border border-[#AAB6C4] bg-[#F2F4F7] px-[1.2cqw] py-[0.7cqw] text-[1.2cqw] font-bold text-[#2B4A7A]"
              style={serif}
            >
              MENU
            </div>
            <ul
              className="mt-[0.9cqw] space-y-[0.7cqw] text-[1.1cqw]"
              style={sans}
            >
              {MENU.map((item) => (
                <li key={item} className="flex gap-[0.6cqw]">
                  <span className="text-[#2B4A7A]">»</span>
                  <span className="text-[#0000CC] underline">{item}</span>
                </li>
              ))}
            </ul>
            <div
              className="mt-[1.4cqw] border border-[#C9A227] bg-[#FFF6C8] px-[1cqw] py-[0.8cqw] text-center text-[1.05cqw] font-bold text-[#8A6A00]"
              style={sans}
            >
              NOVINKA! Nová hala Žilina
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="text-center text-[2.1cqw] font-bold text-[#2B4A7A] underline"
              style={serif}
            >
              Vitajte na našej internetovej stránke!
            </p>
            <p
              className="mt-[1.2cqw] text-justify text-[1.1cqw] leading-[1.35] text-[#333]"
              style={sans}
            >
              Naša spoločnosť pôsobí na slovenskom trhu už niekoľko rokov a
              zaoberá sa realizáciou stavebných prác pre súkromný aj verejný
              sektor. Ponúkame široké spektrum služieb v oblasti stavebníctva.
              Našim cieľom je maximálna spokojnosť zákazníka a kvalitne
              odvedená práca za prijateľné ceny.
            </p>
            <p
              className="mt-[0.9cqw] text-justify text-[1.1cqw] leading-[1.35] text-[#333]"
              style={sans}
            >
              V prípade záujmu o naše služby nás neváhajte kontaktovať na nižšie
              uvedených kontaktných údajoch. Radi Vám vypracujeme nezáväznú
              cenovú ponuku.
            </p>

            <div
              className="mt-[1.4cqw] border border-[#AAB6C4] text-[1.05cqw]"
              style={sans}
            >
              <div className="border-b border-[#AAB6C4] bg-[#E6EAF0] px-[1cqw] py-[0.5cqw] font-bold text-[#2B4A7A]">
                Kontaktné údaje
              </div>
              <div className="grid grid-cols-2">
                <span className="border-r border-[#DDE2E9] px-[1cqw] py-[0.5cqw] text-[#333]">
                  E-mail:
                </span>
                <span className="px-[1cqw] py-[0.5cqw] text-[#0000CC] underline">
                  info@konstrukt.sk
                </span>
                <span className="border-t border-r border-[#DDE2E9] px-[1cqw] py-[0.5cqw] text-[#333]">
                  Mobil:
                </span>
                <span className="border-t border-[#DDE2E9] px-[1cqw] py-[0.5cqw] text-[#333]">
                  0905 123 456
                </span>
              </div>
            </div>

            <p
              className="mt-[1.4cqw] text-[1.5cqw] font-bold text-[#2B4A7A]"
              style={serif}
            >
              Naše služby
            </p>
            <div
              className="mt-[0.7cqw] grid grid-cols-2 gap-x-[1.5cqw] gap-y-[0.45cqw] text-[1.05cqw] text-[#333]"
              style={sans}
            >
              {[
                "Výstavba priemyselných hál",
                "Občianske stavby",
                "Rekonštrukcie objektov",
                "Zemné a výkopové práce",
                "Zateplenie budov",
                "Inžinierska činnosť",
              ].map((item) => (
                <span key={item} className="flex gap-[0.5cqw]">
                  <span className="text-[#2B4A7A]">•</span>
                  <span>{item}</span>
                </span>
              ))}
            </div>

            <p
              className="mt-[1.4cqw] text-[1.5cqw] font-bold text-[#2B4A7A]"
              style={serif}
            >
              Z našej fotogalérie
            </p>
            <div className="mt-[0.7cqw] flex gap-[0.9cqw]">
              {["a", "b", "c", "d"].map((key) => (
                <span
                  key={key}
                  className="h-[5.5cqw] flex-1 border border-[#AAB6C4] bg-[linear-gradient(160deg,#D7DDE6_0%,#B9C3D0_100%)] p-[0.3cqw]"
                />
              ))}
            </div>
          </div>
        </div>

        <div
          className="border-t border-[#AAB6C4] bg-[#E6EAF0] px-[2.5cqw] py-[0.8cqw] text-center text-[0.95cqw] text-[#5C6B7D]"
          style={sans}
        >
          © 2011 KONŠTRUKT s.r.o. — Všetky práva vyhradené | Optimalizované pre
          rozlíšenie 1024×768 | Počet návštev: 12 480
        </div>
      </div>
    </div>
  )
}
