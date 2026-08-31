# Step 6 — Content (Phase A: narrative and copy)

The five acts rewritten: what each one says, the single job it does, how it is
staged in the desktop 5D world, and the Slovak copy verbatim. Phase B (offer and
pricing) is blocked on the numbers; everything here is implementable now.

Contract: `process/STEPS.md` Step 6. Art direction: `CODERA_ART_DIRECTION_V2.md`.
Behaviour: `CODERA_STEP5_ARCHITECTURE.md`. Business facts: `lib/site-config.ts`.

---

## 0. Two decisions recorded before the copy

**Desktop is 5D throughout, and the concept previews are staged in 5D too.**
Requested 2026-08-31. Applied as follows:

- The world stages the work. Each concept arrives as a physical object in the
  space — a plane with real depth, its own ground material, its own light —
  and the camera travels between them. That staging is Codera's language.
- The *inside* of each concept stays faithful to its own industry. A law
  practice does not become cinematic because our shell is; that would break the
  first permanent rule of the library (style is derived from the client's
  context, never from a fashionable default) and would make all three worlds
  read as one studio's mood. The 5D is the vitrine; the work behind the glass
  keeps its own grammar.

**"Smooth scrolling" means smooth motion, not a smooth-scroll layer.** Step 4 §5
forbids Lenis, Locomotive and ScrollSmoother by name, and that stands. What the
visitor feels as smoothness comes from the world: native scroll drives section
progress, and the camera, materials and depth interpolate toward it with damping
inside the world only. Input is never intercepted, never delayed, never
re-timed. Target unchanged: input → immediate response → controlled cinematic
motion.

---

## 1. The voice

Derived from the copy that already works on the live site, and binding for
everything written in this step.

- **Second person, plural, direct.** "Vaša firma", "Váš web". Never "klient".
- **The sting sits after an em dash.** One per state at most.
  *"Rozumieme, na čom firma zarába, skôr než navrhneme prvú obrazovku."*
- **Display lines stay under ten words** and never wrap past two lines at any
  width. Slovak is roughly 15 % longer than English; every string is tested at
  its longest declension.
- **Numbers only when true.** 699 €, 72 hodín, 24 hodín, 14 dní — these are
  verified in `lib/site-config.ts`. No counts of projects, clients or years.
- **No superlatives, no agency noise.** Forbidden: "inovatívny", "na kľúč",
  "riešenia na mieru", "unikátny", "kreatívna agentúra", "digitálna
  transformácia", "posúvame hranice".
- **Concepts are labelled honestly** wherever they appear: `Koncept`, never
  presented as client work.
- **Nothing about the business is invented.** No entity, no completed
  commissions, no testimonials — see the trust inventory in §8.

---

## 2. The narrative spine

Five beats, one argument. Each act may only do its own job; anything that
belongs to a later act is cut from the earlier one.

| Act | The visitor's state on arrival | The job | The state on exit |
| --- | --- | --- | --- |
| /01 Identita | Curious, sceptical, three seconds of patience | Name the gap they already feel, and prove the level in one frame | "These people operate above what I have" |
| /02 Premena | Interested, not yet convinced anything changes | Show the change itself, concretely, in one gesture | "That is the difference, and I can see it" |
| /03 Práca | Wondering whether it works for *their* business | Prove range across industries and commercial mechanics | "They can do this for my kind of company" |
| /04 Ponuka | Wanting to know what it costs and what they get | Make scope and price legible, remove the fear of the unknown | "I know what I would be buying" |
| /05 Kontakt | Nearly decided, needs the first step to be small | Make starting trivial and the next 72 hours predictable | Enquiry sent |

---

## 3. /01 Identita — the gap

**Job.** Name the gap between the business and its website, and prove Codera's
level before a single claim is made. The proof is the frame itself.

**5D staging.** Deep graphite ground. Mineral light rakes across the C ribbon as
it draws itself; the mark holds the composition and reacts to the pointer at a
distance. Behind it, one concept sits at depth as a lit object — the visitor
sees real work in the first viewport, not a promise of it. On scroll the camera
begins its move toward the ribbon's opening. The only dark-dominant act.

**Copy.**

> **Eyebrow** · `Webové štúdio · Slovensko`
>
> **Statement**
> Vaša firma je lepšia,
> než ukazuje váš web.
>
> **Support**
> Navrhujeme a staviame firemné weby, ktoré pôsobia tak dôveryhodne,
> ako naozaj pracujete.
>
> **Primary CTA** · `Začať projekt`
> **Secondary** · `Pozrieť prácu`
>
> **Micro-facts** (one line, mono) · `Prvý návrh do 72 hodín` · `Dizajn aj vývoj pod jednou strechou`

The statement stays as it is — it is the strongest line on the site: it accuses
nothing and flatters the reader while naming their problem. The support line is
new; the old one described disciplines ("Stratégia / Dizajn / Vývoj"), which is
about us, in the one place that must be about them. Disciplines move to /04.

**Length budget.** 1.5 viewports. **Static frame:** statement, CTA and the lit
concept must all be legible with motion paused at 40 % progress.

---

## 4. /02 Premena — the change

**Job.** Show what actually changes. One gesture, no widget, no before/after
slider dressed as a toy.

**5D staging.** The camera passes *through* the ribbon's opening and the world
brightens through the pass — dark opens into light. The dated site is a plane at
depth, already visible through the opening before the transition begins; as the
camera arrives, raking light crosses it and the material transforms in place.
Nothing fades to black, nothing slides in from off-screen. The after-state holds
still — this is a stillness tier, the eye needs to rest on the result.

**Copy.**

> **Label** · `02 — Premena`
>
> **Statement**
> Rovnaká firma.
> Úplne iný dojem.
>
> **Support**
> Nemení sa to, čo firma robí. Mení sa to, čo si o nej návštevník
> pomyslí za prvé tri sekundy.
>
> **Caption on the before state** · `Typický web slovenskej firmy z roku 2011`
> **Caption on the after state** · `Ten istý obsah, prestavaný`

The captions are deliberately unglamorous. The scene's credibility depends on
the "before" being recognisable rather than a straw man — the visitor must think
*that is roughly my website*, not *nobody has that*.

**Length budget.** 1.5 viewports. **Static frame:** at the hold, both states
must be readable as pages, not as textures.

---

## 5. /03 Práca — the range

**Job.** Prove Codera can work in a language that is not its own. Three worlds,
three industries, three different commercial mechanics.

**5D staging.** The signature transition of the site. Each concept owns a stage:
the ground material, the light and the colour climate change as the camera
travels from one to the next — pale roasted warmth, institutional stone, bright
studio air. The concept site itself is a plane with real depth and edge, held in
its own climate, not a browser window floating in space. World-to-world movement
is continuous; no act boundary, no separator, no fade.

Each preview is live markup inside its 5D stage, and each keeps its own visual
grammar — that contrast between Codera's staging and the client's own language
*is* the proof.

**Copy.**

> **Label** · `03 — Práca`
>
> **Statement**
> Každá firma hovorí iným jazykom.
> Web to má počuť.
>
> **Per project** — sector · disciplines · one reasoning line · domain · `Koncept`

| Slot | Sector | Reasoning line (the one sentence under the name) | Mechanic |
| --- | --- | --- | --- |
| 01 | Pražiareň kávy | Obal predáva skôr než popis — preto je balenie hrdinom stránky, nie fotka zrniek. | Kúpiť |
| 02 | Advokátska kancelária | Klient hľadá istotu, nie efekt — stránka mu ju dá hustotou a poriadkom. | Dopytovať |
| 03 | Wellness štúdio | Rozvrh na prvej obrazovke — rozhodnutie padne skôr, než návštevník začne hľadať. | Rezervovať |

The reasoning line is the most valuable sentence in the act: it shows a decision,
not a taste. Names for the three concepts are chosen when the worlds are built
(phase C); the retired names Konštrukt, Vitalis and Forma leave with their
sectors.

**Honest labelling.** Every project carries `Koncept` in the stage, in the case
study, in the metadata and in the OG image. The domains stay in the
`*-koncept.sk` form so a screenshot can never be mistaken for a live client.

**Length budget.** 2.5 viewports, the longest act. **Static frame:** at each
project's hold, the sector, the reasoning line and the preview must read
together without motion.

---

## 6. /04 Ponuka — what you get

**Job.** Make scope and price legible. This act is the relief: calm warm paper,
stillness tier, almost no motion. After the spatial travel the visitor needs a
flat surface to think on.

**5D staging.** The world recedes rather than performs — the camera settles, the
ground turns to paper, depth flattens to a shallow relief. Motion is limited to
the type on the width axis and the micro-artifacts beside each service. Stillness
is the design here, not the absence of design.

**Copy — the process spine (stays, it works).**

> **Label** · `04 — Ponuka`
>
> **Statement**
> Pochopíme. Postavíme. Spustíme.
>
> | Step | Line |
> | --- | --- |
> | Stratégia | Najprv pochopíme firmu, jej zákazníka a to, čo má web spraviť. Až potom kreslíme. |
> | Dizajn | Vizuálny systém, ktorý firmu odlíši od konkurencie a dá jej dôveryhodnosť, akú si zaslúži. |
> | Vývoj | Rýchla a responzívna implementácia, postavená na reálnu prevádzku — nie na prezentáciu. |

**The three packages — structure ready, numbers owed (phase B).**

Each package needs exactly four things and nothing more: a name, who it is for
in one line, an entry price, and four to six scope lines. Plus one line of what
it explicitly does *not* include — that single line does more for trust than any
badge, because it proves the price is a real boundary and not bait.

| Package | For whom | From | Not included |
| --- | --- | --- | --- |
| 1 — entry | *owed* | **699 €** (fixed anchor) | *owed* |
| 2 — standard | *owed* | *owed* | *owed* |
| 3 — bespoke | *owed* | *owed* | *owed* |

Rules for phase B: prices ascend and each is a *from* price; the cheapest keeps
the existing 699 € anchor; scope lines are outcomes, not deliverable counts; no
package is called "Premium", "Pro" or "Business"; no third-column highlighting
that pushes the middle option — the audit's ban on scarcity theatre covers
pricing psychology too.

**Length budget.** 1 viewport for the process, 1 for the packages.

---

## 7. /05 Kontakt — the first step

**Job.** Make starting small and the next 72 hours predictable. The argument is
already won or lost; this act only removes friction.

**5D staging.** Balanced resolution — warm paper ground, titanium C, graphite
ink. The ribbon's strands rejoin and the open C closes: the gap the site opened
in /01 is closed here. Premium-bright ending, never a return to gloom.

**Copy — the reasons to believe (stays, all three are true today).**

> | Reason | Line |
> | --- | --- |
> | Obchodné myslenie | Rozumieme, na čom firma zarába, skôr než navrhneme prvú obrazovku. |
> | Výrazný dizajn | Vlastný vizuálny smer pre každú firmu. Nie šablóna prefarbená na mieru. |
> | Technická realizácia | Rýchly, prístupný a udržateľný web. To, čo nevidno, rozhoduje o zvyšku. |

**The commitments** — each one verifiable, each one ours to keep:

> | Commitment | Line |
> | --- | --- |
> | Webové projekty od 699 € | Konečná cena závisí od rozsahu. Povieme ju po konzultácii, nie až v zmluve. |
> | Prvý návrh do 72 hodín | Konkrétny vizuálny smer, nie prezentácia o tom, ako pracujeme. |
> | Odpoveď na dopyt do 24 hodín | Konzultácia je bezplatná a nezáväzná. Nevoláme opakovane. |

**New — what happens after you send the form.** Three lines, because the single
biggest friction for an SMB owner is not price, it is not knowing what they are
starting:

> **Statement**
> Čo bude nasledovať
>
> 1. Do 24 hodín sa ozveme a spýtame sa na to, čo z formulára nevyplynulo.
> 2. Do 72 hodín uvidíte prvý vizuálny návrh vašej stránky.
> 3. Ak vás nezaujme, končíme — nič neplatíte a nič nepodpisujete.

**Length budget.** 1.5 viewports including the form.

---

## 8. The trust inventory

Nothing new is true about the business: no legal entity, no completed
commission, no testimonial. Everything below is what may be claimed today, and
it is enough — provided the site itself is the proof.

| Device | Status | How it is used |
| --- | --- | --- |
| The site itself | True | The primary artefact. Every claim about craft is verifiable by looking at the page it is written on |
| The three concepts | True, if labelled | `Koncept` everywhere, `*-koncept.sk` domains, never implied as client work |
| 72 h first proposal | True | Stated as a commitment, in /01 and /05 |
| 24 h response | True | Stated at the form, where it reduces friction |
| From 699 € | True | Stated openly; the opposite of scarcity theatre |
| Two named people | True | "Štúdio dvoch ľudí" — small is a credibility asset here, not a weakness to hide |
| No invoicing details yet | True | The footer already says so plainly; it reads as honesty, not as a gap |
| Client logos, counts, years, testimonials, awards | **Absent** | None exist. They stay absent until they do |

The footer line stays as written: *"Codera je štúdio dvoch ľudí. Fakturačné
údaje doplníme pri prvej objednávke."* It is the single most disarming sentence
on the site.

---

## 9. Length budget

| Act | Desktop | Mobile |
| --- | --- | --- |
| /01 Identita | 1.5 | 1.0 |
| /02 Premena | 1.5 | 1.5 |
| /03 Práca | 2.5 | 2.0 |
| /04 Ponuka | 2.0 | 1.0 |
| /05 Kontakt | 1.5 | 1.0 |
| **Total** | **9.0** | **6.5** |

Desktop exceeds the ~8 viewport budget by one, entirely because of the packages.
Resolve in phase B by folding the process spine and the packages into one act of
1 viewport with the packages as a single row — or by accepting 9 and recording
the decision here. Do not resolve it by shortening /03, which is the act that
sells.

---

## 10. Deliberately absent

A blog · an "O nás" section with photographs of people who have no photographs ·
a FAQ that answers questions nobody asked · a cookie banner beyond what the law
requires · a newsletter · social proof of any kind · a second CTA concept ·
anything that lengthens the page without adding a beat.

---

## 11. Open

- Phase B: the three package prices and scopes, and the one "not included" line
  each. Owed by Ondrej.
- Confirmation of the three sectors in §5.
- Concept names, chosen with the worlds in phase C.
- The 9-versus-8 viewport decision above.
