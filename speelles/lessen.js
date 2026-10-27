'use strict';
/* =========================================================================
   SPEELLES Wiskunde H2: start. Eén wereld per paragraaf (Storm vroeg om per paragraaf),
   plus de eindbaas. Lessen komen uit lessen-afstand.js (AFSTAND) en lessen-opp.js (OPP).
   ========================================================================= */

const A_ = typeof AFSTAND !== 'undefined' ? AFSTAND : {};
const O_ = typeof OPP !== 'undefined' ? OPP : {};
const EIND = typeof EINDBAAS !== 'undefined' ? EINDBAAS : [];
const B_ = (naam) => svgStr(WK.badge[naam]());

const ALLE = () => [A_.vk, A_.l21, A_.l22, A_.l23, A_.l24, O_.l25, O_.l26].flat().filter(Boolean);
function missieStrook(S) {
  const al = ALLE(), n = al.filter(l => S.sterren[l.id]).length;
  const af = id => (({ vk: A_.vk, 21: A_.l21, 22: A_.l22, 23: A_.l23, 24: A_.l24, 25: O_.l25, 26: O_.l26 })[id] || []).length && (({ vk: A_.vk, 21: A_.l21, 22: A_.l22, 23: A_.l23, 24: A_.l24, 25: O_.l25, 26: O_.l26 })[id]).every(l => S.sterren[l.id]);
  const aan = WK.GEBIED.map(g => g.id).filter(af);
  return h('div', {},
    h('div', { class: 'wk-eiland', html: svgStr(WK.kaart({ aan }), '0 0 334 200') }),
    h('div', { class: 'p', style: 'margin:6px 0 4px', html: `Missies gehaald: <b>${n} van ${al.length}</b> · paragrafen klaar: <b>${aan.length} van 7</b>. Eén paragraaf per keer is genoeg.` }));
}

const LIJNEN = [
  ['Middelloodlijn', 'door het <b>midden</b> van een zijde én <b>loodrecht</b>. Even ver van twee punten.', WK.K.middelloodlijn],
  ['Bissectrice', 'deelt een <b>hoek</b> middendoor. Even ver van twee benen.', WK.K.bissectrice],
  ['Zwaartelijn', 'van een <b>hoekpunt</b> naar het <b>midden</b> van de overstaande zijde.', WK.K.zwaartelijn],
  ['Hoogtelijn', 'door een <b>hoekpunt</b>, <b>loodrecht</b> op de overstaande zijde.', WK.K.hoogtelijn],
];
const kaartRij = rijen => h('div', { class: 'inzicht' }, rijen.map(([b, t, k]) => h('div', { class: 'tree' }, h('div', { html: `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" fill="${k}" opacity=".18"/><path d="M20 70 L80 30" stroke="${k}" stroke-width="8" stroke-linecap="round"/></svg>` }), h('div', {}, h('b', {}, b), h('span', { html: t })))));

Speelles.start({
  key: 'storm_wk_h2_speelles_v1',
  titel: 'Wiskunde H2 Speelles',
  merk: 'Wiskunde H2', merkIcoon: WK.merk, gids: WK.gids,
  hallo: { titel: 'Hoi Storm! Otto hier, je copiloot.', tekst: 'Dit hoofdstuk knippen we in stukjes: elke paragraaf is een eigen gebied op het eiland. Eerst vlieg je reddingsmissies in Afstandenland, daarna ontwerp je kleren in Het Atelier. Twijfel je? Meet het na. Fout is geen probleem: dan krijg je uitleg.' },
  loop: '<span>Zelf <b>slepen en meten</b></span><span><b>Snap je het?</b></span><span>Ja → even <b>bewijzen</b></span><span>Nee → <b>andere uitleg</b></span><span>Baas verslaan</span>',
  niveaus: [[0, 'Leerling-piloot'], [90, 'Kaartlezer'], [220, 'Passer-pro'], [380, 'Lijnenkenner'], [560, 'Stofknipper'], [760, 'Oppervlakte-ontwerper'], [1000, 'Gezagvoerder']],
  valkuilen: VALKUILEN,
  organismen: LOGBOEK,
  albumNaam: 'Missielogboek', albumIcoon: WK.badge.helikopter(),
  albumTekst: 'Elke missie levert een badge op voor je logboek.',
  kaartBoven: missieStrook,
  expedities: [
    { id: 'vk', titel: 'Voorkennis · Cirkels', sub: 'middelpunt, straal en diameter', bol: B_('passer'), lessen: A_.vk || [] },
    { id: 'p21', titel: '§2.1 Afstanden', sub: 'tot een punt en tot een lijn', bol: B_('helikopter'), lessen: A_.l21 || [] },
    { id: 'p22', titel: '§2.2 Middelloodlijn', sub: 'even ver van twee punten · omgeschreven cirkel', bol: B_('kaart'), lessen: A_.l22 || [] },
    { id: 'p23', titel: '§2.3 Bissectrice', sub: 'even ver van twee benen · ingeschreven cirkel', bol: B_('cirkel'), lessen: A_.l23 || [] },
    { id: 'p24', titel: '§2.4 Zwaartelijn en hoogtelijn', sub: 'balanceren en loodrecht', bol: B_('balans'), lessen: A_.l24 || [] },
    { id: 'p25', titel: '§2.5 Oppervlakte driehoek', sub: 'Het Atelier: ½ × zijde × hoogte', bol: B_('schaar'), lessen: O_.l25 || [] },
    { id: 'p26', titel: '§2.6 Oppervlakte vierhoek', sub: 'parallellogram, trapezium, samengesteld', bol: B_('stof'), lessen: O_.l26 || [] },
    { id: 'eind', titel: 'Generale repetitie', sub: 'alles door elkaar, op toetsniveau', bol: B_('trofee'), lessen: EIND },
  ],
  inzicht: [
    { id: 'afstanden', titel: 'De afstandenkaart', icoon: WK.badge.kaart(), dicht: 'Haal de lessen van §2.1, §2.2 en §2.3',
      tekst: 'Welke vorm hoort bij welke afstand? Dit is het spiekkader van het boek.',
      open: S => [A_.l21, A_.l22, A_.l23].flat().filter(Boolean).every(l => S.sterren[l.id]),
      bouw: s => s.append(kaartRij([
        ['Op afstand r van punt A', 'de <b>cirkel</b> ⊙(A, r). Kleiner: binnengebied. Groter: buitengebied.', WK.K.cirkel],
        ['Op afstand d van lijn l', '<b>twee lijnen</b> evenwijdig met l. Kleiner: de strook ertussen.', WK.K.lijn],
        ['Even ver van A als van B', 'de <b>middelloodlijn</b> van AB.', WK.K.middelloodlijn],
        ['Even ver van de benen van ∠C', 'de <b>bissectrice</b> van ∠C.', WK.K.bissectrice],
      ])) },
    { id: 'lijnen', titel: 'De lijnenkaart', icoon: WK.badge.lijnen(), dicht: 'Haal de lessen van §2.4',
      tekst: 'Vier lijnen die op elkaar lijken. Vraag jezelf: gaat hij door een hoekpunt? Naar het midden? Loodrecht?',
      open: S => (A_.l24 || []).length > 0 && A_.l24.every(l => S.sterren[l.id]),
      bouw: s => s.append(kaartRij(LIJNEN), h('p', { class: 'p', html: 'Omgeschreven cirkel: snijpunt van de <b>middelloodlijnen</b>, gaat door de hoekpunten. Ingeschreven cirkel: snijpunt van de <b>bissectrices</b>, raakt de zijden.' })) },
    { id: 'formules', titel: 'De formulekaart', icoon: WK.badge.stof(), dicht: 'Haal de lessen van §2.5 en §2.6',
      tekst: 'De hoogte staat altijd loodrecht op de zijde. Vergeet de eenheid niet: cm², mm², m².',
      open: S => [O_.l25, O_.l26].flat().filter(Boolean).every(l => S.sterren[l.id]),
      bouw: s => s.append(h('div', { class: 'tabwrap' }, h('table', { class: 'tab' }, h('tr', {}, ['Figuur', 'Oppervlakte'].map(x => h('th', {}, x))),
        [['Driehoek', '½ × zijde × bijbehorende hoogte'], ['Parallellogram', 'zijde × bijbehorende hoogte'], ['Trapezium', '½ × (som evenwijdige zijden) × hoogte'], ['Ruit', '½ × diagonaal × diagonaal'], ['Samengesteld', 'splitsen (optellen) of aanvullen (aftrekken)']].map(r => h('tr', {}, r.map(x => h('td', {}, x))))))) },
  ],
  terug: { href: '../', label: 'Oefen-app', sub: 'Alle onderwerpen oefenen' },
  spreekFilter: s => s.replace(/⊙/g, 'cirkel').replace(/cm²/g, 'vierkante centimeter').replace(/mm²/g, 'vierkante millimeter').replace(/m²/g, 'vierkante meter').replace(/½/g, 'een half').replace(/∠/g, 'hoek ').replace(/×/g, 'keer'),
});
