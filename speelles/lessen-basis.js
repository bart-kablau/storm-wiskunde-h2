'use strict';
/* =========================================================================
   SPEELLES Wiskunde H2 Afstand en oppervlakte (havo 2, Getal & Ruimte blz. 50-97)
   Gedeelde basis: helpers en valkuilen. Laadvolgorde in index.html:
   lessen-basis.js -> lessen-afstand.js (Vk, 2.1-2.4) -> lessen-opp.js (2.5, 2.6) -> lessen.js (start).
   Bron (leidend): ../../02-verwerkt/brontekst.md. Ontwerp: ../../02-verwerkt/leerplan.md.
   Familie A, variant meetkunde. Signatuur: het meetlint als wapen (elke bewering kun je meten).
   Wereld: Storm is piloot van de traumahelikopter (Afstandenland) en ontwerpt kleren in Het Atelier.
   Gids: Otto de otter (WK.gids). Les-id = onderwerp-id in de oefen-app.
   ========================================================================= */

WK.defs(); bioDefs();

/* ---------- helpers ---------- */
/* meerkeuze: Q(vraag, goed, [[fout, uitleg, valkuil?]], waarom, klein?, beeld?) */
const Q = (vraag, goed, fouten, w, klein, beeld) => ({ t: 'mc', vraag, klein, beeld, w, opties: [{ t: goed, goed: true }, ...fouten.map(([t, fout, mis]) => ({ t, fout, mis }))] });
const toon = (tekst, visual, p, extra = {}) => ({ t: 'toon', tekst, visual, p, ...extra });
const uitleg = (tekst, groot) => ({ t: 'toon', tekst, groot, wacht: false });
/* een bouwsteen als bewijs- of baasvraag */
const VQ = (visual, p, coach, vraag) => ({ visual, p, coach, vraag });
const snap = (id, vraag, bewijs, anders, dieper, herhaal = 1) => ({ t: 'snap', id, vraag, bewijs, anders, dieper, herhaal });
const baas = (naam, beeld, denkfout, tekst, pool, hp = 5) => ({ t: 'baas', naam, beeld, hp, denkfout, tekst, pool });
const svgStr = (inhoud, vb = '0 0 100 100') => inhoud.startsWith('<svg') ? inhoud : `<svg viewBox="${vb}" aria-hidden="true">${inhoud}</svg>`;
/* een vaste (niet interactieve) tekening als vraagbeeld: teken(V => markup, vlak-opties) -> svg-string */
const teken = (fn, o = {}) => { const V = WK.vlak(o); V.voeg('figuur', fn(V)); return V.svg.outerHTML; };
const n = WK.nl;  /* 2.5 -> "2,5" */
const P = (x, y) => ({ x, y });

/* ---------- valkuilen (leerplan, W-nummers; ook gebruikt in de oefen-app) ---------- */
const VALKUILEN = {
  W1: ['Straal = diameter', 'diameter 6 cm, dus straal 6 cm'],
  W2: ['Rand hoort bij het binnengebied', 'afstand kleiner dan 2: ook de punten óp de cirkel'],
  W3: ['Schuin meten naar een lijn', 'afstand tot de lijn = naar een willekeurig punt van de lijn'],
  W4: ['Maar één evenwijdige lijn', 'op 1 cm van l ligt één lijn'],
  W5: ['Even ver = alleen het midden', 'even ver van A en B: alleen het midden van AB'],
  W6: ['Middelloodlijn zonder loodrecht', 'een lijn door het midden is genoeg'],
  W7: ['Dichter bij A, verkeerde kant', 'dichter bij A ligt aan de kant van B'],
  W8: ['Bissectrice naar het midden', 'de bissectrice gaat naar het midden van de overkant'],
  W9: ['Ingeschreven straal naar een hoekpunt', 'straal van M naar een hoekpunt bij de ingeschreven cirkel'],
  W10: ['Omgeschreven en ingeschreven verwisseld', 'omgeschreven cirkel: snijpunt van de bissectrices'],
  W11: ['Zwaartelijn loodrecht', 'een zwaartelijn staat loodrecht op de zijde'],
  W12: ['Hoogtepunt altijd binnen', 'H ligt altijd in de driehoek'],
  W13: ['Schuine zijde als hoogte', 'opp. = ½ × 8 × 5, met 5 de schuine zijde'],
  W14: ['De ½ vergeten', 'opp. driehoek = zijde × hoogte'],
  W15: ['Hoogte hoort niet bij de zijde', 'zijde AB × de hoogte vanuit A'],
  W16: ['Stomphoekig: hoogte binnen zoeken', 'de hoogte moet in de driehoek liggen'],
  W17: ['Parallellogram × schuine zijde', '35 × 22,4 (de fout van Amir)'],
  W18: ['Halveren bij het parallellogram', 'opp. parallellogram = ½ × zijde × hoogte'],
  W19: ['Trapezium: zijden vermenigvuldigen', '½ × 28 × 54 × 24'],
  W20: ['Omtrek en oppervlakte verwisseld', 'oppervlakte = alle zijden optellen'],
  W21: ['cm in plaats van cm²', 'opp. = 24 cm'],
  W22: ['Samengesteld: dubbel tellen', 'rechthoek + een driehoek die er al in zat'],
};

/* ---------- missielogboek (album): één badge per les; lessen geven ze vrij met orgs: [id] ---------- */
const LOGBOEK = {};  /* gevuld door lessen-afstand.js en lessen-opp.js: LOGBOEK[id] = {naam, svg, sub, waar} */
