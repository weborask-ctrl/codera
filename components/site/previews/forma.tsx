/**
 * Concept preview — Forma, interiérové štúdio.
 *
 * Design direction: editorial. A serif display face, warm paper ground, wide
 * margins and hairline rules instead of cards. Third distinct direction, so
 * the three concepts together read as range rather than one recycled template.
 */

const PROJECTS = [
  { index: "01", name: "Byt na Palisádach", year: "2024" },
  { index: "02", name: "Ordinácia Ružinov", year: "2024" },
  { index: "03", name: "Penzión Terchová", year: "2023" },
]

export function FormaPreview() {
  return (
    <div className="absolute inset-0 flex flex-col bg-[#F4F0EA] text-[#24211C]">
      <header className="flex items-center justify-between px-[4.5cqw] py-[2cqw]">
        <span className="font-serif text-[2cqw] tracking-[-0.02em] italic">
          Forma
        </span>
        <nav className="flex gap-[2.4cqw] text-[1.15cqw] tracking-[0.1em] text-[#6B6156] uppercase">
          <span>Projekty</span>
          <span>Prístup</span>
          <span>Kontakt</span>
        </nav>
      </header>

      <div className="flex flex-1 gap-[4.5cqw] px-[4.5cqw] pt-[2cqw]">
        <div className="flex-[1.15]">
          <p className="font-serif text-[5cqw] leading-[1.06] tracking-[-0.02em]">
            Interiéry, ktoré
            <br />
            vydržia dekádu.
          </p>
          <p className="mt-[2cqw] max-w-[26cqw] text-[1.4cqw] leading-[1.6] text-[#6B6156]">
            Navrhujeme priestory pre ľudí, ktorí ich budú roky používať —
            nie pre fotografiu do katalógu.
          </p>
          <p className="mt-[2.4cqw] text-[1.3cqw] font-medium text-[#8F4630]">
            Ako pracujeme ›
          </p>
        </div>

        <div className="flex-1">
          <p className="text-[1.05cqw] tracking-[0.16em] text-[#6B6156] uppercase">
            Vybrané realizácie
          </p>
          <ul className="mt-[1.4cqw]">
            {PROJECTS.map((project) => (
              <li
                key={project.index}
                className="flex items-baseline gap-[1.4cqw] border-t border-[#D9D1C4] py-[1.5cqw]"
              >
                <span className="font-serif text-[1.2cqw] text-[#8F4630]">
                  {project.index}
                </span>
                <span className="flex-1 text-[1.45cqw]">{project.name}</span>
                <span className="text-[1.1cqw] text-[#6B6156]">
                  {project.year}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-3 border-t border-[#D9D1C4] px-[4.5cqw] pt-[1.8cqw] pb-[1.4cqw]">
        {[
          { title: "Bytové interiéry", note: "Návrh aj realizácia" },
          { title: "Ordinácie a kliniky", note: "Priestory pre pacientov" },
          { title: "Hotely a penzióny", note: "Od izby po recepciu" },
        ].map((item) => (
          <div key={item.title} className="pr-[2cqw]">
            <p className="font-serif text-[1.5cqw] tracking-[-0.015em]">
              {item.title}
            </p>
            <p className="mt-[0.4cqw] text-[1.1cqw] text-[#6B6156]">
              {item.note}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-[#D9D1C4] px-[4.5cqw] py-[1.2cqw] text-[1.05cqw] text-[#6B6156]">
        <span>Ateliér Bratislava</span>
        <span>Konzultácia v priestore zdarma</span>
      </div>
    </div>
  )
}
