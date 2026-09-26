import projectSizes from '../public/motion/metal/projects/manifest.json' with {type:'json'};
import { commercial, packages, people, siteConfig, wordpressService } from './site-config.ts';

const esc = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]);
const projects = [
  ['animacie-3d', 'Observatórium', 'Priestor, ktorý vtiahne.', 'Animácie a 3D'],
  ['dizajn', 'Kancelária', 'Dôvera začína detailom.', 'Dizajn a obsah'],
  ['objednavky', 'Pražiareň', 'Od prvého pohľadu k objednávke.', 'E-shop a objednávky'],
  ['rezervacie', 'Štúdio', 'Miesto pre ďalší pohyb.', 'Rezervačný systém'],
  ['wordpress', 'WordPress', 'Váš obsah. Vo vašich rukách.', 'Správa obsahu'],
];
const arrow = '<span aria-hidden="true">↗</span>';

export function render(html) {
  const values = {
    email: esc(siteConfig.email), phone: esc(siteConfig.phone), phoneHref: esc(siteConfig.phoneHref),
    responseHours: commercial.responseHours, proposalHours: commercial.firstProposalHours,
    people: people.map(p => esc(p.name)).join(' &amp; '), year: new Date().getFullYear(),
    wordpress: esc(wordpressService.line), priceFrom: esc(commercial.priceFrom),
    projects: projects.map(([slug,name,_line,category],i) => `<article class="project project-${i+1}"><h3 class="visually-hidden">${name}</h3><div class="project-frame"><a class="project-visual" href="${siteConfig.url}/ukazky/${slug}" target="_blank" rel="noopener noreferrer" aria-label="Otvoriť koncept ${name} v novej karte"><img src="/media/projects/${slug}-1440.webp" srcset="/media/projects/${slug}-1440.webp 1440w, /media/projects/${slug}-2880.webp 2880w" sizes="92vw" width="2880" height="1800" loading="lazy" decoding="async" alt="${name} — celý úvod webu, ${category}"></a></div><div class="project-actions"><button class="text-link project-preview" type="button" hidden data-project="${slug}" data-title="${name}" data-width="${projectSizes[slug].width}" data-height="${projectSizes[slug].height}" data-url="${siteConfig.url}/ukazky/${slug}">Pozrieť celý web <span aria-hidden="true">＋</span></button><a class="text-link" href="${siteConfig.url}/ukazky/${slug}" target="_blank" rel="noopener noreferrer">Otvoriť živú ukážku ${arrow}</a></div></article>`).join(''),
    packages: packages.map(p => `<article class="offer"><h3>${esc(p.name)}</h3><p class="offer-audience">${esc(p.audience)}</p><p class="offer-price"><span>od</span> ${esc(p.priceFrom)}</p><details class="offer-details"><summary>Čo obsahuje <span class="offer-plus" aria-hidden="true">+</span></summary><div class="offer-body"><ul>${p.scope.map(line=>`<li>${esc(line)}</li>`).join('')}</ul><p class="offer-exclusions">Nezahŕňa: ${esc(p.notIncluded)}.</p></div></details><a class="text-link" href="#dopyt">Začať projekt ${arrow}</a></article>`).join(''),
  };
  html=html.replace('</head>', '<link rel="stylesheet" href="/silver/entry.css"><script src="/silver/entry.js"></script></head>');
  return html.replace(/\{\{(\w+)\}\}/g, (match,key) => values[key] ?? match);
}
