import { coderaCare, commercial, legal, siteConfig, terms } from "./site-config"

/**
 * The two legal pages: Ochrana osobných údajov and Obchodné podmienky.
 *
 * They are rendered as plain documents in the homepage's type system (see
 * `experiments/metal/legal.css`), with no scripts. Every business fact comes
 * from `lib/site-config.ts`; while the operator's trade-licence data is
 * missing, the gap is printed as a visible placeholder rather than guessed.
 *
 * Not legal advice: these texts were drafted from the audit of 2026-10-21 and
 * should be read by a lawyer before the studio advertises.
 */

const esc = (value: string) =>
  value.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch] ?? ch)

/** A fact from site-config, or a visible placeholder naming what is missing. */
const fact = (value: string, missing: string) =>
  value.trim() ? esc(value) : `<mark class="placeholder">doplní sa: ${esc(missing)}</mark>`

const op = legal.operator
const operatorName = fact(op.name, "obchodné meno")
const operatorBlock = `<p class="operator">${operatorName}<br>Miesto podnikania: ${fact(op.address, "adresa")}<br>IČO: ${fact(op.ico, "IČO")}<br>${fact(op.registry, "údaj o zápise v živnostenskom registri")}<br>E-mail: <a href="mailto:${siteConfig.email}">${siteConfig.email}</a> · Telefón: <a href="tel:${siteConfig.phoneHref}">${siteConfig.phone}</a></p>`
const vatLine =
  op.vatPayer === null
    ? `<mark class="placeholder">doplní sa: platiteľ / neplatiteľ DPH</mark>`
    : op.vatPayer
      ? "Ceny sú uvedené bez DPH, ktorá sa pripočíta v zákonnej výške."
      : "Nie sme platitelia DPH, uvedené ceny sú konečné."
const effective = fact(legal.effectiveFrom, "dátum účinnosti")

export const privacyPage = {
  slug: "ochrana-osobnych-udajov",
  title: "Ochrana osobných údajov",
  description: "Ako Codera spracúva osobné údaje z kontaktného formulára, e-mailu a telefónu.",
  body: `
<p class="lead">Údaje, ktoré nám pošlete, použijeme len na to, aby sme vám odpovedali a pripravili ponuku, prípadne zrealizovali objednaný web. Nepredávame ich a nepoužívame na reklamu.</p>

<h2>1. Kto je prevádzkovateľ</h2>
${operatorBlock}
<p>Zodpovednú osobu sme neurčili, pretože nám to zákon neukladá. So všetkými otázkami sa obráťte na <a href="mailto:${siteConfig.email}">${siteConfig.email}</a>.</p>

<h2>2. Aké údaje spracúvame a prečo</h2>
<table>
<thead><tr><th>Účel</th><th>Údaje</th><th>Právny základ</th><th>Ako dlho</th></tr></thead>
<tbody>
<tr><td data-label="Účel">Odpoveď na dopyt z formulára, e-mailu alebo telefónu a príprava ponuky</td><td data-label="Údaje">meno, e-mail, telefón, obsah správy</td><td data-label="Právny základ">opatrenia pred uzavretím zmluvy na vašu žiadosť (čl. 6 ods. 1 písm. b) GDPR)</td><td data-label="Ako dlho">12 mesiacov od poslednej komunikácie, ak nevznikne objednávka</td></tr>
<tr><td data-label="Účel">Realizácia objednaného webu a komunikácia počas spolupráce</td><td data-label="Údaje">kontaktné a fakturačné údaje, podklady, ktoré nám odovzdáte</td><td data-label="Právny základ">plnenie zmluvy (čl. 6 ods. 1 písm. b) GDPR)</td><td data-label="Ako dlho">počas trvania zmluvy a 4 roky po jej skončení (premlčacia lehota)</td></tr>
<tr><td data-label="Účel">Vystavenie a archivácia faktúr</td><td data-label="Údaje">fakturačné údaje</td><td data-label="Právny základ">zákonná povinnosť (čl. 6 ods. 1 písm. c) GDPR, zákon o účtovníctve)</td><td data-label="Ako dlho">10 rokov</td></tr>
<tr><td data-label="Účel">Bezpečnosť a prevádzka webu</td><td data-label="Údaje">IP adresa, čas a technické údaje požiadavky v serverových záznamoch</td><td data-label="Právny základ">oprávnený záujem na bezpečnosti (čl. 6 ods. 1 písm. f) GDPR)</td><td data-label="Ako dlho">podľa nastavenia poskytovateľa hostingu, spravidla niekoľko dní</td></tr>
</tbody>
</table>
<p>Poskytnutie údajov je dobrovoľné. Bez kontaktu vám však nevieme odpovedať. Automatizované rozhodovanie ani profilovanie nepoužívame.</p>

<h2>3. Komu údaje odovzdávame</h2>
<p>Údaje spracúvajú len poskytovatelia, bez ktorých web a e-mail nefungujú, a to na základe zmlúv podľa čl. 28 GDPR:</p>
<ul>
<li><strong>Vercel Inc.</strong> (USA) – hosting webu a serverové záznamy,</li>
<li><strong>WebSupport s.r.o.</strong> (Slovensko) – e-mailová schránka ${siteConfig.email},</li>
<li><strong>Resend</strong> (Plus Five Five, Inc., USA) – doručenie správy z kontaktného formulára na náš e-mail,</li>
<li>účtovník alebo účtovný softvér na spracovanie faktúr.</li>
</ul>
<p>Pri poskytovateľoch z USA sa prenos opiera o rámec ochrany údajov EÚ – USA (EU–US Data Privacy Framework) alebo o štandardné zmluvné doložky schválené Európskou komisiou. Údaje odovzdáme aj orgánom verejnej moci, ak nám to ukladá zákon.</p>

<h2>4. Vaše práva</h2>
<p>Máte právo požadovať prístup k svojim údajom, ich opravu, vymazanie, obmedzenie spracúvania a prenesenie. Proti spracúvaniu na základe oprávneného záujmu môžete namietať. Stačí napísať na <a href="mailto:${siteConfig.email}">${siteConfig.email}</a>, odpovieme najneskôr do jedného mesiaca.</p>
<p>Ak sa domnievate, že s údajmi zaobchádzame v rozpore so zákonom, môžete podať návrh na <a href="https://dataprotection.gov.sk" rel="noopener noreferrer">Úrad na ochranu osobných údajov Slovenskej republiky</a>, Hraničná 12, 820 07 Bratislava.</p>

<h2>5. Ukážky na webe</h2>
<p>Ukážkové koncepty (napríklad rezervácie alebo editor WordPressu) ukladajú to, čo do nich zadáte, len vo vašom prehliadači. Nám sa tieto údaje neodosielajú.</p>

<h2>6. Zmeny</h2>
<p>Tento dokument aktualizujeme, keď sa zmení spôsob spracúvania. Platí od ${effective}.</p>
`,
}

export const termsPage = {
  slug: "obchodne-podmienky",
  title: "Obchodné podmienky",
  description: "Ako prebieha spolupráca s Coderou: objednávka, platby, revízie, autorské práva, hosting a Codera Care.",
  body: `
<p class="lead">Tieto podmienky upravujú tvorbu webov a súvisiace služby, ktoré poskytujeme. Konkrétny rozsah, cenu a termín vždy potvrdzuje cenová ponuka. Ak sa ponuka a tieto podmienky líšia, platí ponuka.</p>

<h2>1. Kto sme</h2>
${operatorBlock}
<p>Ďalej len „Codera“. Objednávateľ je podnikateľ alebo spotrebiteľ, ktorý si u nás objedná službu (ďalej len „klient“).</p>

<h2>2. Priebeh spolupráce</h2>
<ol>
<li><strong>Konzultácia.</strong> Bezplatne a nezáväzne sa porozprávame o vašej firme, zákazníkoch a cieli webu. Ozveme sa do ${commercial.responseHours} hodín od dopytu.</li>
<li><strong>Návrh a ponuka.</strong> Prvý návrh pripravíme do ${commercial.firstProposalHours} hodín od konzultácie a dodania základných podkladov. K nemu dostanete cenovú ponuku s rozsahom a termínom.</li>
<li><strong>Objednávka.</strong> Zmluva vzniká potvrdením ponuky e-mailom alebo podpisom a úhradou zálohy.</li>
<li><strong>Realizácia.</strong> Web navrhneme a vytvoríme podľa odsúhlaseného návrhu. Priebežne vám posielame náhľad na testovacej adrese.</li>
<li><strong>Schválenie.</strong> Hotový web vám odovzdáme na kontrolu. Pripomienky zapracujeme v rozsahu podľa časti 4.</li>
<li><strong>Spustenie a odovzdanie.</strong> Po úhrade doplatku web spustíme na vašej doméne, odovzdáme prístupy a krátko vás zaškolíme.</li>
</ol>
<p>Bežný firemný web býva hotový spravidla do ${commercial.typicalDeliveryDays} dní ${commercial.deliveryQualifier}. Pri väčších projektoch termín uvedieme v ponuke.</p>

<h2>3. Cena a platobné podmienky</h2>
<ul>
<li>Cena je uvedená v cenovej ponuke. ${vatLine}</li>
<li><strong>Záloha ${terms.depositPercent} %</strong> z ceny sa platí pred začatím realizácie. Prácu začneme po jej pripísaní na účet.</li>
<li><strong>Doplatok ${terms.finalPercent} %</strong> sa platí po dokončení a schválení webu, pred jeho spustením na ostrej doméne.</li>
<li>Faktúry sú splatné do ${terms.invoiceDueDays} dní od vystavenia.</li>
<li>Ak sa klient k odovzdanému návrhu alebo hotovému webu nevyjadrí do ${terms.tacitApprovalDays} dní, považuje sa za schválený a vzniká nárok na doplatok.</li>
<li>Ak klient spoluprácu ukončí po začatí realizácie, záloha sa nevracia. Ak už odvedená práca presahuje zálohu, vyúčtujeme ju podľa skutočného rozsahu sadzbou ${terms.hourlyRate} za hodinu.</li>
<li>Pri omeškaní s úhradou si môžeme účtovať úrok z omeškania podľa platných predpisov a pozastaviť spustenie webu alebo služby Codera Care.</li>
</ul>

<h2>4. Úpravy a revízie</h2>
<ul>
<li>V cene sú <strong>${terms.designRevisionRounds} kolá pripomienok k návrhu</strong> a <strong>${terms.buildRevisionRounds} kolo pripomienok k hotovému webu</strong>. Kolo znamená jeden súhrnný zoznam pripomienok, ktorý zapracujeme naraz.</li>
<li>Úprava je zmena v rámci odsúhlaseného rozsahu, napríklad textu, farby, poradia sekcií alebo obrázka.</li>
<li>Nová požiadavka je všetko, čo rozsah rozširuje: nová podstránka, sekcia, funkcia, jazyk alebo zmena už schváleného dizajnu. Naceníme ju vopred.</li>
<li>Ďalšie kolá a práce nad rámec účtujeme sadzbou <strong>${terms.hourlyRate} za hodinu</strong>, vždy až po vašom súhlase s odhadom.</li>
</ul>

<h2>5. Podklady od klienta</h2>
<ul>
<li>Texty, fotografie, logo a ďalšie materiály dodáva klient, ak sa v ponuke nedohodne inak.</li>
<li>Klient zodpovedá za to, že má k dodaným materiálom práva a že ich zverejnenie neporušuje práva tretích osôb.</li>
<li>Ak sa podklady alebo spätná väzba oneskoria, primerane sa posúva aj termín dokončenia.</li>
</ul>

<h2>6. Autorské práva</h2>
<ul>
<li>Po úplnom zaplatení ceny získava klient výhradnú, časovo a územne neobmedzenú licenciu na použitie webu a jeho dizajnu na účel, na ktorý bol vytvorený. Licencia zahŕňa aj právo web upravovať alebo dať upraviť iným dodávateľom.</li>
<li>Do úplného zaplatenia patria všetky práva k dielu Codere.</li>
<li>Súčasti tretích strán (písma, knižnice, pluginy, fotobanky) sa riadia licenciami ich autorov.</li>
<li>Hotový web môžeme uviesť medzi referenciami s menom klienta, ak klient písomne nežiada inak.</li>
</ul>

<h2>7. Záruka a opravy</h2>
<p>Chyby, ktoré vzniknú našou prácou a nahlásite ich do ${terms.warrantyDays} dní od spustenia, opravíme bezplatne. Záruka sa nevzťahuje na zásahy klienta alebo tretích osôb, zmeny prehliadačov po spustení ani výpadky externých služieb.</p>

<h2>8. Čo je v cene webu a čo sa platí mesačne</h2>
<p><strong>Jednorazová cena webu</strong> zahŕňa návrh, vývoj, prispôsobenie pre mobil, tablet a počítač, základné SEO, testovanie a spustenie. Nezahŕňa doménu, hosting mimo služby ${coderaCare.name}, platené externé služby a licencie, ak nie sú výslovne uvedené v ponuke.</p>
<p>Doménu registrujeme vždy na meno klienta, prípadne si ju klient registruje sám.</p>
<p><strong>${coderaCare.name}</strong> stojí ${coderaCare.price} ${coderaCare.interval} a zahŕňa:</p>
<ul>
${coderaCare.scope.map((item) => `<li>${esc(item)}</li>`).join("\n")}
</ul>
<p>${esc(coderaCare.scopeNote)} ${esc(coderaCare.trial)} ${esc(coderaCare.trialStart)} Po skončení bezplatného mesiaca sa služba platí mesačne vopred, ak ju klient pred jeho koncom nezruší.</p>
<p>${esc(coderaCare.hosting)}</p>
<p>Službu môže klient aj Codera vypovedať e-mailom kedykoľvek, s účinnosťou ku koncu kalendárneho mesiaca. Po skončení vám do ${terms.handoverDays} dní bezplatne odovzdáme súbory webu, aby ste ho mohli prevádzkovať inde.</p>

<h2>9. Spracúvanie osobných údajov v mene klienta</h2>
<p>Ak pre klienta web prevádzkujeme (najmä v rámci ${coderaCare.name}) a cez web prichádzajú osobné údaje jeho zákazníkov, napríklad z formulára alebo rezervácie, je klient prevádzkovateľom a Codera sprostredkovateľom. Táto časť je zmluvou podľa čl. 28 GDPR:</p>
<ul>
<li><strong>Predmet a trvanie:</strong> hosting a technická správa webu klienta počas trvania služby.</li>
<li><strong>Údaje a osoby:</strong> kontaktné údaje a obsah správ, ktoré zákazníci klienta zadajú na jeho webe.</li>
<li>Údaje spracúvame len na pokyn klienta a len na prevádzku webu. Osoby, ktoré k nim majú prístup, sú viazané mlčanlivosťou.</li>
<li>Prijímame primerané technické a organizačné opatrenia: šifrované spojenie (HTTPS), obmedzený prístup a zálohy.</li>
<li>Klient súhlasí s ďalšími sprostredkovateľmi uvedenými v našich <a href="/${privacyPage.slug}">zásadách ochrany osobných údajov</a> (najmä Vercel, Resend, WebSupport). O zmene ho vopred informujeme a klient môže namietať.</li>
<li>Klientovi pomôžeme pri vybavovaní žiadostí dotknutých osôb a porušenie ochrany údajov mu oznámime bez zbytočného odkladu.</li>
<li>Po skončení služby údaje podľa voľby klienta vrátime alebo vymažeme a klientovi poskytneme informácie potrebné na preukázanie týchto povinností.</li>
</ul>

<h2>10. Zodpovednosť</h2>
<p>Za škodu zodpovedáme len vtedy, ak sme ju spôsobili porušením svojich povinností, a v prípade podnikateľov najviac do výšky ceny konkrétnej objednávky. Nezodpovedáme za výpadky a zmeny externých služieb (hosting, platobné brány, mapy a podobne), ani za obsah, ktorý na web dodá alebo doplní klient.</p>

<h2>11. Spotrebitelia</h2>
<p>Ak je klient spotrebiteľ a zmluvu uzatvoril na diaľku (e-mailom alebo cez web), môže od nej odstúpiť bez udania dôvodu do 14 dní od jej uzavretia, napríklad e-mailom na <a href="mailto:${siteConfig.email}">${siteConfig.email}</a>. Ak výslovne požiada, aby sme s prácou začali pred uplynutím tejto lehoty, a potom odstúpi, uhradí cenu za doposiaľ poskytnuté plnenie. Po úplnom poskytnutí služby so súhlasom spotrebiteľa právo na odstúpenie zaniká.</p>
<p>Reklamácie vybavujeme e-mailom do 30 dní. Spotrebiteľ sa môže obrátiť aj na subjekt alternatívneho riešenia sporov, napríklad na <a href="https://www.soi.sk" rel="noopener noreferrer">Slovenskú obchodnú inšpekciu</a>, ktorá je zároveň orgánom dozoru.</p>

<h2>12. Záverečné ustanovenia</h2>
<p>Vzťahy s podnikateľmi sa riadia Obchodným zákonníkom, vzťahy so spotrebiteľmi Občianskym zákonníkom a predpismi na ochranu spotrebiteľa. Podmienky môžeme meniť, pre už potvrdené objednávky však platí znenie zo dňa ich potvrdenia. Tieto podmienky platia od ${effective}.</p>
`,
}

export function renderLegalPage(page: { slug: string; title: string; description: string; body: string }): string {
  const url = `${siteConfig.url}/${page.slug}`
  const other = page.slug === privacyPage.slug ? termsPage : privacyPage
  return `<!doctype html>
<html lang="sk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#151513">
<title>${esc(page.title)} — ${esc(siteConfig.name)}</title>
<meta name="description" content="${esc(page.description)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${url}">
<link rel="icon" href="/brand/codera-mark-mono.svg" type="image/svg+xml">
<link rel="preload" href="/silver/fonts/montserrat-700.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/silver/legal.css">
</head>
<body>
<a class="skip-link" href="#obsah">Preskočiť na obsah</a>
<header class="legal-header"><a class="brand" href="/" aria-label="Codera — úvod"><img src="/brand/codera-mark-mono.svg" width="30" height="30" alt=""><span>codera</span></a><a class="back" href="/">Späť na úvod <span aria-hidden="true">↗</span></a></header>
<main id="obsah" class="legal">
<h1>${esc(page.title)}</h1>
${page.body}
</main>
<footer class="legal-footer"><span>© ${new Date().getFullYear()} ${esc(siteConfig.name)}</span><a href="/${other.slug}">${esc(other.title)}</a><a href="/#dopyt">Kontakt</a></footer>
</body>
</html>`
}
