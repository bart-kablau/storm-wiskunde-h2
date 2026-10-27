/* =========================================================================
   content.js: Wiskunde H2 Afstand en oppervlakte (Getal & Ruimte havo 2, blz. 50-97)
   Inhoud volgt 02-verwerkt/brontekst.md en 02-verwerkt/leerplan.md.
   Engine = tools/oefen-engine (canoniek); dit bestand is de vak-inhoud.

   Storm vindt dit hoofdstuk lastig en wil het per paragraaf: negen onderwerpen,
   elk met Brons/Zilver/Goud. Elke vraag heeft w + meer, elke mc heeft per optie
   een fout-uitleg met een tegenvoorbeeld (getallen of beeld).
   Figuren zijn inline SVG, getekend door window.H2.fig (exacte coordinaten).

   Checks: node tools/checks/audit-feedback.mjs <dit bestand>
           node tools/checks/genverify.mjs <app-map>
   ========================================================================= */

/* ---------- figuren: één kleine SVG-tekenaar voor roosters en maatfiguren ----------
   fig({xmin,xmax,ymin,ymax, rooster, assen, maxW, maxH, items:[...]})
   items: {t:"poly", p:[[x,y],..], fill, stroke}
          {t:"seg", a:[x,y], b:[x,y], kleur, dash, dik, label, weg:[x,y]}  (label aan de kant weg van 'weg')
          {t:"lijn", a, b, kleur, dash, label}                             (oneindige lijn, geknipt)
          {t:"cirkel", c:[x,y], r, kleur, fill, dash}
          {t:"punt", p:[x,y], label, kleur, lp:[dx,dy]}
          {t:"haaks", p:[x,y], u:[ux,uy], v:[vx,vy]}                       (rechtehoekteken)
          {t:"tekst", p:[x,y], s, kleur, size}
   Wereld: y omhoog. Alles in één <svg>, zodat het in q.q of opgave past. */
window.H2 = (function () {
  const nl = v => String(Math.round(v * 100) / 100).replace(".", ",");
  const KL = { ink: "#1e293b", blauw: "#2563eb", rood: "#dc2626", groen: "#16a34a", paars: "#7c3aed",
               oranje: "#ea580c", grijs: "#94a3b8", rooster: "#e2e8f0", as: "#64748b" };
  const kleur = k => KL[k] || k || KL.ink;
  function fig(o) {
    const pad = o.pad != null ? o.pad : 22;
    const xmin = o.xmin, xmax = o.xmax, ymin = o.ymin, ymax = o.ymax;
    const s = o.s || Math.min((o.maxW || 300) / (xmax - xmin), (o.maxH || 230) / (ymax - ymin));
    const W = Math.round((xmax - xmin) * s + 2 * pad), H = Math.round((ymax - ymin) * s + 2 * pad);
    const X = x => +(pad + (x - xmin) * s).toFixed(1), Y = y => +(pad + (ymax - y) * s).toFixed(1);
    const txt = (x, y, t, k, size, extra) =>
      '<text x="' + x + '" y="' + y + '" fill="' + kleur(k) + '" font-size="' + (size || 14) +
      '" font-weight="700" font-family="Nunito, Arial, sans-serif" text-anchor="middle" dominant-baseline="central"' +
      ' paint-order="stroke" stroke="#ffffff" stroke-width="3.5" stroke-linejoin="round"' + (extra || "") + '>' + t + '</text>';
    let g = '<rect x="0" y="0" width="' + W + '" height="' + H + '" rx="10" fill="#ffffff" stroke="#e2e8f0"/>';
    if (o.rooster) {
      for (let x = Math.ceil(xmin); x <= xmax + 1e-9; x++)
        g += '<line x1="' + X(x) + '" y1="' + Y(ymin) + '" x2="' + X(x) + '" y2="' + Y(ymax) + '" stroke="' + KL.rooster + '" stroke-width="1"/>';
      for (let y = Math.ceil(ymin); y <= ymax + 1e-9; y++)
        g += '<line x1="' + X(xmin) + '" y1="' + Y(y) + '" x2="' + X(xmax) + '" y2="' + Y(y) + '" stroke="' + KL.rooster + '" stroke-width="1"/>';
    }
    if (o.assen) {
      if (ymin <= 0 && ymax >= 0) {
        g += '<line x1="' + X(xmin) + '" y1="' + Y(0) + '" x2="' + X(xmax) + '" y2="' + Y(0) + '" stroke="' + KL.as + '" stroke-width="1.6"/>';
        g += txt(X(xmax) - 6, Y(0) - 10, "x", KL.as, 12);
      }
      if (xmin <= 0 && xmax >= 0) {
        g += '<line x1="' + X(0) + '" y1="' + Y(ymin) + '" x2="' + X(0) + '" y2="' + Y(ymax) + '" stroke="' + KL.as + '" stroke-width="1.6"/>';
        g += txt(X(0) + 10, Y(ymax) + 6, "y", KL.as, 12);
      }
      const ty = (ymin <= 0 && ymax >= 0) ? 0 : ymin, tx = (xmin <= 0 && xmax >= 0) ? 0 : xmin;
      for (let x = Math.ceil(xmin); x <= xmax; x++)
        if (x !== 0 || !(xmin <= 0 && xmax >= 0)) g += txt(X(x), Y(ty) + 11, String(x).replace("-", "−"), KL.as, 11);
      for (let y = Math.ceil(ymin); y <= ymax; y++)
        if (y !== 0 || !(ymin <= 0 && ymax >= 0)) g += txt(X(tx) - 11, Y(y), String(y).replace("-", "−"), KL.as, 11);
      if (xmin <= 0 && xmax >= 0 && ymin <= 0 && ymax >= 0) g += txt(X(0) - 9, Y(0) + 10, "0", KL.as, 11);
    }
    const midden = [(xmin + xmax) / 2, (ymin + ymax) / 2];
    (o.items || []).forEach(it => {
      const k = kleur(it.kleur), dik = it.dik || 2.2, dash = it.dash ? ' stroke-dasharray="6 5"' : "";
      if (it.t === "poly") {
        g += '<polygon points="' + it.p.map(p => X(p[0]) + "," + Y(p[1])).join(" ") + '" fill="' + (it.fill || "#fde68a") +
             '" fill-opacity="' + (it.op != null ? it.op : 0.55) + '" stroke="' + kleur(it.stroke) + '" stroke-width="' + dik + '" stroke-linejoin="round"/>';
      } else if (it.t === "seg" || it.t === "lijn") {
        let a = it.a, b = it.b;
        if (it.t === "lijn") {   // oneindige lijn: knippen op het kader
          const dx = b[0] - a[0], dy = b[1] - a[1]; let t0 = -1e6, t1 = 1e6;
          const kn = (p, q) => { if (Math.abs(p) < 1e-12) return q >= 0; const r = q / p; if (p < 0) { if (r > t0) t0 = r; } else { if (r < t1) t1 = r; } return true; };
          const ok = kn(-dx, a[0] - xmin) && kn(dx, xmax - a[0]) && kn(-dy, a[1] - ymin) && kn(dy, ymax - a[1]);
          if (!ok || t0 > t1) return;
          b = [a[0] + t1 * dx, a[1] + t1 * dy]; a = [a[0] + t0 * dx, a[1] + t0 * dy];
        }
        g += '<line x1="' + X(a[0]) + '" y1="' + Y(a[1]) + '" x2="' + X(b[0]) + '" y2="' + Y(b[1]) + '" stroke="' + k + '" stroke-width="' + dik + '" stroke-linecap="round"' + dash + '/>';
        if (it.label != null) {
          const mx = (X(a[0]) + X(b[0])) / 2, my = (Y(a[1]) + Y(b[1])) / 2;
          let nx = Y(b[1]) - Y(a[1]), ny = -(X(b[0]) - X(a[0])); const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
          const w = it.weg || midden, wx = X(w[0]) - mx, wy = Y(w[1]) - my;
          if (nx * wx + ny * wy > 0) { nx = -nx; ny = -ny; }
          const off = it.off || 13;
          g += txt(+(mx + nx * off).toFixed(1), +(my + ny * off).toFixed(1), it.label, it.lkleur || k, it.size || 14);
        }
      } else if (it.t === "cirkel") {
        g += '<circle cx="' + X(it.c[0]) + '" cy="' + Y(it.c[1]) + '" r="' + (it.r * s).toFixed(1) + '" fill="' + (it.fill || "none") +
             '" fill-opacity="' + (it.op != null ? it.op : 0.25) + '" stroke="' + k + '" stroke-width="' + dik + '"' + dash + '/>';
      } else if (it.t === "punt") {
        g += '<circle cx="' + X(it.p[0]) + '" cy="' + Y(it.p[1]) + '" r="3.8" fill="' + k + '"/>';
        if (it.label) { const lp = it.lp || [9, -10]; g += txt(+(X(it.p[0]) + lp[0]).toFixed(1), +(Y(it.p[1]) + lp[1]).toFixed(1), it.label, k, 14); }
      } else if (it.t === "haaks") {
        const z = it.z || 10, px = X(it.p[0]), py = Y(it.p[1]);
        const n = v => { const L = Math.hypot(v[0], v[1]) || 1; return [v[0] / L, -v[1] / L]; };
        const u = n(it.u), v = n(it.v);
        g += '<path d="M ' + (px + z * u[0]).toFixed(1) + ' ' + (py + z * u[1]).toFixed(1) + ' L ' + (px + z * u[0] + z * v[0]).toFixed(1) + ' ' +
             (py + z * u[1] + z * v[1]).toFixed(1) + ' L ' + (px + z * v[0]).toFixed(1) + ' ' + (py + z * v[1]).toFixed(1) +
             '" fill="none" stroke="' + kleur(it.kleur || "ink") + '" stroke-width="1.6"/>';
      } else if (it.t === "tekst") {
        g += txt(X(it.p[0]), Y(it.p[1]), it.s, it.kleur, it.size || 14);
      }
    });
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H +
      '" role="img" aria-label="' + (o.label || "figuur") + '" style="display:block;margin:8px auto;max-width:100%;height:auto">' + g + '</svg>';
  }
  return { fig, nl };
})();

window.VAK = {
  id: "wiskunde_h2",
  titel: "Wiskunde met Storm, H2 Afstand en oppervlakte",
  brand: "Wiskunde met Storm",
  badge: "📐",
  mascotEmoji: "🦦",
  spiekTitel: "Wiskunde H2, Afstand en oppervlakte",
  wiskunde: true,
  spraak: { vraagLang: "nl-NL", antwoordLang: "nl-NL" },
  matching: { stripInfinitief: false, accentTolerant: true, lidwoordTolerant: false },
  masteryHits: 2,
  rekenToetsen: [[",", ","], ["·", "·"], ["(", "("], [")", ")"]],
  speelles: "speelles/",
  speellesTekst: "Per paragraaf een eigen missie · speel het eerst, dan snap je het",
  tegels: ["leerstof", "begrippen", "proeftoets", "spiekblad"],
  proefTitel: "Hoofdstuktoets H2",
  tegelProef: { em: "📝", h: "Hoofdstuktoets", p: "Alle paragrafen door elkaar, net als op het proefwerk" },
  films: [
    { id: "afstand-punt", titel: "Het bereik van de helikopter", emoji: "🚁", thema: "Afstanden (Vk t/m 2.4)", sub: "Vk + 2.1 · straal, diameter, binnen en buiten de cirkel" },
    { id: "afstand-lijn", titel: "De kortste weg naar de lijn", emoji: "📏", thema: "Afstanden (Vk t/m 2.4)", sub: "2.1 · loodrecht meten, twee evenwijdige lijnen" },
    { id: "middelloodlijn", titel: "Eerlijk verdelen", emoji: "⚖️", thema: "Afstanden (Vk t/m 2.4)", sub: "2.2 · middelloodlijn en omgeschreven cirkel" },
    { id: "bissectrice", titel: "Midden in de hoek", emoji: "📐", thema: "Afstanden (Vk t/m 2.4)", sub: "2.3 · bissectrice en ingeschreven cirkel" },
    { id: "zwaartelijn-hoogtelijn", titel: "Balanceren en loodrecht", emoji: "🎯", thema: "Afstanden (Vk t/m 2.4)", sub: "2.4 · zwaartelijn, zwaartepunt, hoogtelijn, hoogtepunt" },
    { id: "opp-driehoek", titel: "Knippen en schuiven", emoji: "✂️", thema: "Oppervlakte (2.5 en 2.6)", sub: "2.5 + 2.6 · driehoek, parallellogram, trapezium" }
  ]
};

/* =========================================================================
   LEERSTOF, 9 onderwerpen (per paragraaf) x 3 niveaus (Brons, Zilver, Goud)
   ========================================================================= */
(function () {
const F = window.H2.fig;

/* △ABC met rechte hoek bij A, A(0,0) B(9,0) C(0,4). Uit A drie lijnen naar BC:
   rood = zwaartelijn naar E(4,5; 2) (midden BC), blauw = bissectrice naar D(36/13, 36/13),
   groen = hoogtelijn naar F(144/97, 324/97), loodrecht op BC. Hoeken met AB: 24°, 45°, 66°. */
const DRIE_LIJNEN = F({ xmin: -0.8, xmax: 9.6, ymin: -0.8, ymax: 4.6, maxW: 300, maxH: 200, label: "driehoek met drie lijnen uit A",
  items: [
    { t: "poly", p: [[0, 0], [9, 0], [0, 4]], fill: "#fef3c7", op: 0.7 },
    { t: "seg", a: [0, 0], b: [4.5, 2], kleur: "rood", dik: 2.6 },
    { t: "seg", a: [0, 0], b: [36 / 13, 36 / 13], kleur: "blauw", dik: 2.6 },
    { t: "seg", a: [0, 0], b: [144 / 97, 324 / 97], kleur: "groen", dik: 2.6 },
    { t: "haaks", p: [144 / 97, 324 / 97], u: [9, -4], v: [-4, -9], kleur: "groen" },
    { t: "haaks", p: [0, 0], u: [1, 0], v: [0, 1] },
    { t: "punt", p: [0, 0], label: "A", lp: [-12, 10] }, { t: "punt", p: [9, 0], label: "B", lp: [10, 10] },
    { t: "punt", p: [0, 4], label: "C", lp: [-12, -6] }, { t: "punt", p: [4.5, 2], label: "E", kleur: "rood", lp: [10, -8] }
  ] });

/* Vijfhoek: rechthoek 10 x 6 met rechtsboven een driehoekje (4 bij 3) eraf. Opp = 60 − 6 = 54 cm². */
const ZESHOEK_FIG = F({ xmin: -1.5, xmax: 11.5, ymin: -1.3, ymax: 7.3, maxW: 280, maxH: 190, label: "vijfhoek in een rechthoek van 10 bij 6",
  items: [
    { t: "poly", p: [[0, 0], [10, 0], [10, 3], [6, 6], [0, 6]], fill: "#bbf7d0", op: 0.7 },
    { t: "seg", a: [6, 6], b: [10, 6], kleur: "grijs", dash: true, dik: 1.6 }, { t: "seg", a: [10, 6], b: [10, 3], kleur: "grijs", dash: true, dik: 1.6 },
    { t: "seg", a: [0, 0], b: [10, 0], kleur: "ink", label: "10" }, { t: "seg", a: [0, 0], b: [0, 6], kleur: "ink", label: "6" },
    { t: "seg", a: [10, 0], b: [10, 3], kleur: "ink", label: "3", weg: [5, 3] }, { t: "seg", a: [0, 6], b: [6, 6], kleur: "ink", label: "6" }
  ] });

/* L-vorm: (0,0) (8,0) (8,4) (5,4) (5,6) (0,6). Opp = 8 x 6 − 3 x 2 = 42 cm², omtrek 28 cm. */
const L_FIG = F({ xmin: -1.4, xmax: 9.4, ymin: -1.4, ymax: 7, maxW: 250, maxH: 200, label: "L-vormige figuur",
  items: [
    { t: "poly", p: [[0, 0], [8, 0], [8, 4], [5, 4], [5, 6], [0, 6]], fill: "#fbcfe8", op: 0.75 },
    { t: "seg", a: [0, 0], b: [8, 0], kleur: "ink", label: "8" }, { t: "seg", a: [0, 0], b: [0, 6], kleur: "ink", label: "6" },
    { t: "seg", a: [8, 0], b: [8, 4], kleur: "ink", label: "4", weg: [4, 2] }, { t: "seg", a: [8, 4], b: [5, 4], kleur: "ink", label: "3", weg: [6, 2] },
    { t: "seg", a: [5, 4], b: [5, 6], kleur: "ink", label: "2", weg: [8, 6] }, { t: "seg", a: [5, 6], b: [0, 6], kleur: "ink", label: "5", weg: [2, 3] }
  ] });

window.LEERSTOF = [

/* ---------------------------------------------------------------- Vk */
{
  id: "cirkel", emoji: "⭕", titel: "Vk Cirkel, straal en diameter", video: "afstand-punt",
  kort: "Straal = van het middelpunt naar de rand. Diameter = dwars erdoorheen: 2 × de straal.",
  niveaus: [
    {
      n: 1, naam: "Brons",
      uitleg: [
        "Een cirkel heeft één <b>middelpunt</b>. Elk punt óp de cirkel ligt even ver van dat middelpunt.",
        "De <b>straal</b> loopt van het middelpunt naar de rand. De <b>diameter</b> (ook wel <b>middellijn</b>) loopt van rand tot rand, dwars door het middelpunt.",
        "Een diameter is dus twee stralen achter elkaar: <b>diameter = 2 × straal</b> en <b>straal = diameter : 2</b>.",
        "Denk aan de middencirkel op het voetbalveld: van de middenstip naar de lijn is 9,15 m (de straal), dwars over de hele cirkel is 18,3 m (de diameter). Een cirkel teken je met een <b>passer</b>."
      ],
      regel: "diameter = 2 × straal, straal = diameter : 2",
      voorbeelden: [
        { en: "diameter 6 cm → straal 3 cm", let: "Delen door 2, want de diameter bestaat uit twee stralen." },
        { en: "straal 4,5 cm → diameter 9 cm", let: "Keer 2: 4,5 + 4,5 = 9." }
      ],
      vragen: [
        { t: "vb", opgave: "Een cirkel heeft een diameter van 14 cm. Hoe groot is de straal?",
          stappen: [
            { toon: "diameter = 14 cm", uitleg: "De diameter gaat van rand tot rand, dwars door het middelpunt." },
            { toon: "diameter = 2 × straal", uitleg: "Van de rand naar het midden is één straal, van het midden naar de andere rand nog een." },
            { toon: "straal = 14 : 2 = 7 cm", uitleg: "Dus de helft van de diameter." }
          ],
          waarom: { q: "Waarom deel je hier door 2?",
            o: ["Omdat de diameter uit twee stralen bestaat", "Omdat je de straal altijd door 2 moet delen", "Omdat een cirkel een linker- en een rechterhelft heeft"],
            a: "Omdat de diameter uit twee stralen bestaat" },
          fout: {
            "Omdat je de straal altijd door 2 moet delen": "andersom: je deelt de diameter door 2 om de straal te krijgen. Is de straal 7, dan moet je juist keer 2 doen voor de diameter (14).",
            "Omdat een cirkel een linker- en een rechterhelft heeft": "dat klopt wel, maar het gaat om de lijn. De diameter loopt van rand naar middelpunt (7 cm) en dan nog eens 7 cm naar de andere rand: twee stralen."
          },
          w: "De diameter is twee stralen achter elkaar.",
          meer: "14 : 2 = 7 cm. Controle: 7 + 7 = 14, dus twee stralen samen zijn weer de diameter." },

        { t: "mc", q: "In de cirkel hieronder is M het middelpunt. Welk lijnstuk is een <b>straal</b>?" +
            F({ xmin: -3.6, xmax: 3.6, ymin: -3.6, ymax: 3.6, maxW: 210, maxH: 210, label: "cirkel met middelpunt M",
              items: [
                { t: "cirkel", c: [0, 0], r: 3, kleur: "ink" },
                { t: "seg", a: [-2.4, -1.8], b: [2.4, 1.8], kleur: "blauw" },
                { t: "seg", a: [-2.4, -1.8], b: [-1.8, 2.4], kleur: "groen" },
                { t: "seg", a: [0, 0], b: [-1.8, 2.4], kleur: "rood" },
                { t: "punt", p: [0, 0], label: "M", lp: [10, 10] },
                { t: "punt", p: [-2.4, -1.8], label: "A", lp: [-12, 6] },
                { t: "punt", p: [2.4, 1.8], label: "B", lp: [10, -8] },
                { t: "punt", p: [-1.8, 2.4], label: "C", lp: [-10, -10] }
              ] }),
          o: ["MC", "AB", "AC"], a: "MC",
          fout: {
            "AB": "AB gaat van rand tot rand dwars door M: dat is een diameter. Die is twee keer zo lang als een straal. Is MC 3 cm, dan is AB 6 cm.",
            "AC": "AC loopt van rand naar rand, maar niet door M. Dat is geen straal en ook geen diameter. Een straal begint altijd in het middelpunt."
          },
          w: "Een straal loopt van het middelpunt M naar een punt op de cirkel.",
          meer: "MC begint in M en eindigt op de rand. MA en MB zijn ook stralen; samen vormen ze de diameter AB." },

        { t: "mc", q: "De straal van een cirkel is 5 cm. Hoe lang is de diameter?",
          o: ["10 cm", "5 cm", "2,5 cm", "25 cm"], a: "10 cm",
          fout: {
            "5 cm": "dat is de straal zelf. De diameter is twee stralen achter elkaar: 5 + 5 = 10 cm.",
            "2,5 cm": "je hebt gedeeld door 2, maar dat doe je als de diameter gegeven is. De diameter is juist langer dan de straal: 2 × 5 = 10 cm.",
            "25 cm": "dat is 5 × 5. De diameter is 2 × de straal, niet de straal keer zichzelf: 2 × 5 = 10 cm."
          },
          w: "diameter = 2 × straal = 2 × 5 = 10 cm.",
          meer: "Check met een tekening: van de rand naar M is 5 cm, van M naar de overkant nog 5 cm. Samen 10 cm." },

        { t: "bouw", q: "De middencirkel van een voetbalveld heeft een diameter van 18,3 m. Hoeveel meter is de straal?", a: "9,15",
          w: "straal = diameter : 2 = 18,3 : 2.",
          meer: "18,3 : 2 = 9,15 m. Zo ver moet de tegenpartij weg blijven bij de aftrap, gemeten vanaf de middenstip." }
      ]
    },
    {
      n: 2, naam: "Zilver",
      uitleg: [
        "Ligt een punt <b>binnen</b>, <b>op</b> of <b>buiten</b> een cirkel? Vergelijk de afstand tot het middelpunt met de straal.",
        "Afstand <b>gelijk aan</b> de straal: óp de cirkel. <b>Kleiner</b>: binnen. <b>Groter</b>: buiten.",
        "In een rooster ligt een punt vaak recht naast of recht boven het middelpunt. Dan tel je gewoon de hokjes.",
        "Ligt het punt schuin? Tel dan <b>geen</b> hokjes schuin: een schuine stap over een hokje is langer dan 1 (ongeveer 1,4). Meet met je geodriehoek. Een handige om te onthouden: 3 hokjes opzij en 4 omhoog is precies 5 lang."
      ],
      regel: "afstand = straal → op · kleiner → binnen · groter → buiten",
      voorbeelden: [
        { en: "M(3, 1) en straal 2: het punt (5, 1) ligt óp de cirkel", let: "2 hokjes naar rechts, precies de straal." },
        { en: "M(3, 1) en straal 2: het punt (4, 2) ligt binnen", let: "Schuin 1 opzij en 1 omhoog is ongeveer 1,4. Dat is minder dan 2." }
      ],
      vragen: [
        { t: "mc", q: "Hieronder staat de cirkel met middelpunt M(3, 1) en straal 2. Welke roosterpunten op de x-as liggen <b>binnen</b> de cirkel?" +
            F({ xmin: 0, xmax: 6, ymin: -2, ymax: 4, rooster: true, assen: true, maxW: 240, maxH: 240, label: "cirkel om M(3, 1)",
              items: [ { t: "cirkel", c: [3, 1], r: 2, kleur: "blauw" }, { t: "punt", p: [3, 1], label: "M", kleur: "blauw" } ] }),
          o: ["(2, 0), (3, 0) en (4, 0)", "(1, 0), (2, 0), (3, 0), (4, 0) en (5, 0)", "alleen (3, 0)", "(2, 0) en (4, 0)"],
          a: "(2, 0), (3, 0) en (4, 0)",
          fout: {
            "(1, 0), (2, 0), (3, 0), (4, 0) en (5, 0)": "de cirkel reikt tot x = 1 en x = 5, maar dat is op hoogte 1, waar M ligt. Op de x-as is hij smaller. (1, 0) ligt 2 opzij én 1 omlaag van M: dat is ongeveer 2,2, meer dan 2. Dus buiten.",
            "alleen (3, 0)": "(3, 0) ligt binnen (1 onder M), maar (2, 0) en (4, 0) ook: 1 opzij en 1 omlaag is ongeveer 1,4. Dat is kleiner dan de straal 2.",
            "(2, 0) en (4, 0)": "je vergeet (3, 0). Dat punt ligt recht onder M, op afstand 1. Kleiner dan 2, dus binnen."
          },
          w: "Binnen = afstand tot M kleiner dan 2. Dat geldt voor (2, 0), (3, 0) en (4, 0).",
          meer: "(3, 0): afstand 1. (2, 0) en (4, 0): ongeveer 1,4. (1, 0) en (5, 0): ongeveer 2,2, dus net buiten. Kijk maar in de figuur: de cirkel snijdt de x-as tussen 1 en 2 en tussen 4 en 5." },

        { t: "mc", q: "De cirkel heeft middelpunt M(1, 1) en straal 5. Ligt het punt P(4, 5) binnen, op of buiten de cirkel?" +
            F({ xmin: -4.5, xmax: 6.5, ymin: -4.5, ymax: 6.5, rooster: true, maxW: 250, maxH: 250, label: "M en P in een rooster",
              items: [ { t: "cirkel", c: [1, 1], r: 5, kleur: "blauw" },
                       { t: "seg", a: [1, 1], b: [4, 1], kleur: "grijs", dash: true, label: "3", weg: [4, 5] },
                       { t: "seg", a: [4, 1], b: [4, 5], kleur: "grijs", dash: true, label: "4", weg: [1, 1] },
                       { t: "seg", a: [1, 1], b: [4, 5], kleur: "rood" },
                       { t: "punt", p: [1, 1], label: "M", lp: [-10, 10] }, { t: "punt", p: [4, 5], label: "P", kleur: "rood" } ] }),
          o: ["precies op de cirkel", "binnen de cirkel", "buiten de cirkel"], a: "precies op de cirkel",
          fout: {
            "binnen de cirkel": "P lijkt dichtbij, maar meet MP: 3 opzij en 4 omhoog is samen precies 5 lang, net zo lang als de straal. Dus niet binnen, maar precies op de rand.",
            "buiten de cirkel": "je telde de hokjes langs de omweg: 3 + 4 = 7. Maar de afstand is de rechte lijn van M naar P, en die is 5. Precies de straal, dus óp de cirkel."
          },
          w: "MP = 5 en de straal is 5, dus P ligt op de cirkel.",
          meer: "3 opzij en 4 omhoog geeft een schuine afstand van 5 (meet het maar na met je geodriehoek). Zo'n 3-4-5 komt in dit hoofdstuk vaak terug." },

        { t: "bouw", q: "Een cirkel heeft middelpunt M(3, 2) en gaat door het punt (7, 2). Hoe groot is de straal?", a: "4",
          w: "De straal is de afstand van M naar een punt op de cirkel.",
          meer: "(7, 2) ligt recht rechts van M(3, 2): 7 − 3 = 4 hokjes. Dus straal 4." },

        { t: "mc", q: "De cirkel heeft middelpunt O(0, 0) en straal 3. Welk punt ligt <b>buiten</b> de cirkel?" +
            F({ xmin: -4, xmax: 4, ymin: -4, ymax: 4, rooster: true, assen: true, maxW: 220, maxH: 220, label: "cirkel om O met straal 3",
              items: [ { t: "cirkel", c: [0, 0], r: 3, kleur: "blauw" } ] }),
          o: ["(3, 1)", "(3, 0)", "(0, −2)", "(2, 2)"], a: "(3, 1)",
          fout: {
            "(3, 0)": "precies 3 naar rechts: dat is de straal zelf. Dat punt ligt óp de cirkel, niet buiten.",
            "(0, −2)": "2 naar beneden is minder dan 3. Dat punt ligt binnen.",
            "(2, 2)": "schuin 2 opzij en 2 omhoog lijkt ver, maar is maar ongeveer 2,8. Dat is net minder dan 3, dus binnen. Kijk in de figuur: (2, 2) ligt nog net binnen de cirkel."
          },
          w: "(3, 1) ligt 3 opzij en nog 1 omhoog: verder dan 3, dus buiten.",
          meer: "Van O naar (3, 1) is ongeveer 3,2. Dat is meer dan de straal 3. (3, 0) zou precies op de cirkel liggen; een stapje omhoog brengt je naar buiten." }
      ]
    },
    {
      n: 3, naam: "Goud",
      uitleg: [
        "Nu komt alles samen. Lees eerst goed of er een <b>straal</b> of een <b>diameter</b> staat. Diameter 6 cm betekent straal 3 cm.",
        "Bij twee cirkels kijk je per punt naar <b>beide</b> cirkels: binnen de ene en buiten de andere, of binnen allebei?",
        "Roosterpunten tellen op de x-as: ga vanaf het middelpunt opzij en kijk tot waar je nog echt binnen de cirkel zit. Punten óp de rand tellen niet mee als er <b>binnen</b> staat."
      ],
      regel: "Eerst de straal uit de diameter halen, dan per cirkel: op, binnen of buiten.",
      voorbeelden: [
        { en: "Cirkel om A(4, 0) met diameter 6: straal 3", let: "Op de x-as liggen (2, 0) t/m (6, 0) binnen. (1, 0) en (7, 0) liggen óp de cirkel." }
      ],
      vragen: [
        { t: "mc", q: "Een cirkel heeft middelpunt A(4, 2) en <b>diameter</b> 6 cm. Welk punt ligt óp deze cirkel?",
          o: ["(7, 2)", "(10, 2)", "(5, 3)", "(1, 5)"], a: "(7, 2)",
          fout: {
            "(10, 2)": "dat ligt 6 van A af. Maar 6 was de diameter. De straal is 6 : 2 = 3, dus (10, 2) ligt buiten.",
            "(5, 3)": "1 opzij en 1 omhoog is ongeveer 1,4. Veel minder dan de straal 3, dus binnen.",
            "(1, 5)": "3 opzij en 3 omhoog is geen 3, maar ongeveer 4,2 (schuin is langer). Dus buiten de cirkel."
          },
          w: "Straal = 6 : 2 = 3. (7, 2) ligt precies 3 rechts van A.",
          meer: "Eerst de straal: 3 cm. Dan zoeken: recht opzij of recht omhoog 3 hokjes, zoals (7, 2), (1, 2), (4, 5) of (4, −1)." },

        { t: "bouw", q: "Hoeveel roosterpunten op de x-as liggen <b>binnen</b> de cirkel met middelpunt M(2, 3) en straal 5?" +
            F({ xmin: -4, xmax: 8, ymin: -3, ymax: 8.5, rooster: true, assen: true, maxW: 250, maxH: 250, label: "cirkel om M(2, 3)",
              items: [ { t: "cirkel", c: [2, 3], r: 5, kleur: "blauw" }, { t: "punt", p: [2, 3], label: "M", kleur: "blauw" } ] }),
          a: "7",
          w: "Binnen = afstand tot M kleiner dan 5.",
          meer: "Van M naar (6, 0) is 4 opzij en 3 omlaag: precies 5 (net als 3-4-5). (6, 0) en (−2, 0) liggen dus óp de cirkel en tellen niet mee. Binnen liggen (−1, 0) tot en met (5, 0): dat zijn 7 punten." },

        { t: "mc", q: "Cirkel 1 heeft middelpunt A(0, 0) en straal 3. Cirkel 2 heeft middelpunt B(4, 0) en <b>diameter</b> 4. Welk punt ligt binnen cirkel 2 maar buiten cirkel 1?",
          o: ["(5, 0)", "(2, 0)", "(7, 0)", "(1, 1)"], a: "(5, 0)",
          fout: {
            "(2, 0)": "(2, 0) ligt 2 van A, dus binnen cirkel 1. En van B ook 2: dat is precies de straal van cirkel 2 (4 : 2 = 2), dus óp cirkel 2, niet binnen.",
            "(7, 0)": "van B is dat 3. Maar de straal van cirkel 2 is 4 : 2 = 2, niet 4. Dus (7, 0) ligt buiten cirkel 2.",
            "(1, 1)": "dat punt ligt vlak bij A (ongeveer 1,4), dus binnen cirkel 1. En van B is het ongeveer 3,2: buiten cirkel 2. Precies andersom."
          },
          w: "(5, 0): 5 van A (buiten cirkel 1) en 1 van B (binnen cirkel 2, straal 2).",
          meer: "Let op het woord diameter: cirkel 2 heeft straal 2. Binnen cirkel 2 op de x-as: van x = 2 tot x = 6, randen niet meegeteld. Buiten cirkel 1: verder dan 3 van A. Samen: (4, 0) en (5, 0)." },

        { t: "bouw", q: "Een cirkel heeft diameter 13 cm. Een punt ligt 6,4 cm van het middelpunt. Hoeveel cm moet het punt nog verder van het middelpunt af om precies óp de cirkel te liggen?", a: "0,1",
          w: "Straal = 13 : 2 = 6,5 cm. Het punt ligt nu op 6,4 cm.",
          meer: "6,5 − 6,4 = 0,1 cm. Nu ligt het punt nog net binnen; 0,1 cm verder ligt het op de rand. Wie 13 als straal neemt, komt op 6,6 cm uit en dat klopt niet." }
      ]
    }
  ]
},

/* ---------------------------------------------------------------- 2.1 A */
{
  id: "afstand-punt", emoji: "🚁", titel: "2.1 Afstand tot een punt",
  kort: "⊙(M, r): afstand r = op de cirkel, minder = binnengebied, meer = buitengebied.",
  niveaus: [
    {
      n: 1, naam: "Brons",
      uitleg: [
        "⊙(M, 2 cm) is de korte schrijfwijze voor <b>de cirkel met middelpunt M en straal 2 cm</b>.",
        "<b>Alle punten met afstand 2 cm tot M</b> vormen samen precies die cirkel. Zet maar heel veel punten op 2 cm van M: ze rijen zich tot een cirkel.",
        "Afstand <b>kleiner</b> dan 2 cm: het <b>binnengebied</b>. Afstand <b>groter</b> dan 2 cm: het <b>buitengebied</b>.",
        "Let op de rand: een punt óp de cirkel heeft afstand precies 2 cm. Dat hoort niet bij 'kleiner dan 2 cm' en ook niet bij 'groter dan 2 cm'."
      ],
      regel: "PM = r → op de cirkel · PM < r → binnengebied · PM > r → buitengebied",
      voorbeelden: [
        { en: "⊙(M, 2 cm) en PM = 1,5 cm → P ligt in het binnengebied", let: "1,5 is kleiner dan 2." },
        { en: "De helikopter haalt 80 km. Een ongeluk op 95 km ligt in het buitengebied.", let: "95 is meer dan 80: daar is hij niet binnen een half uur." }
      ],
      vragen: [
        { t: "mc", q: "Voor punt P geldt PM = 4 cm. Waar ligt P ten opzichte van ⊙(M, 4 cm)?",
          o: ["op de cirkel", "in het binnengebied", "in het buitengebied"], a: "op de cirkel",
          fout: {
            "in het binnengebied": "binnen betekent kleiner dan 4 cm, zoals 3,9 cm. Precies 4 cm is de rand zelf.",
            "in het buitengebied": "buiten betekent meer dan 4 cm, zoals 4,1 cm. Precies 4 cm is de cirkel zelf."
          },
          w: "PM is precies gelijk aan de straal, dus P ligt op de cirkel.",
          meer: "⊙(M, 4 cm) bestaat uit álle punten op precies 4 cm van M. P is daar één van." },

        { t: "mc", q: "Je moet alle punten kleuren waarvan de afstand tot M <b>kleiner dan 2 cm</b> is. Hoort de cirkel zelf (de rand) erbij?",
          o: ["Nee, alleen de punten die echt binnen de rand liggen", "Ja, de rand hoort er ook bij", "Alleen de bovenste helft van de rand"], a: "Nee, alleen de punten die echt binnen de rand liggen",
          fout: {
            "Ja, de rand hoort er ook bij": "op de rand is de afstand precies 2 cm. En 2 is niet kleiner dan 2. Een punt op 1,99 cm doet wel mee, een punt op 2 cm niet.",
            "Alleen de bovenste helft van de rand": "een cirkel heeft geen voorkeur voor boven of onder: elk punt op de rand ligt op precies 2 cm. En 2 is niet kleiner dan 2, dus geen enkel randpunt doet mee."
          },
          w: "Kleiner dan 2 cm = het binnengebied, zonder de rand.",
          meer: "De rand is 'gelijk aan 2 cm'. Pas op met deze valkuil: kleiner dan, gelijk aan en groter dan zijn drie verschillende gebieden." },

        { t: "mc", q: "Hieronder zie je ⊙(M, 2). Welk punt ligt in het <b>buitengebied</b>?" +
            F({ xmin: -3, xmax: 3, ymin: -3, ymax: 3, rooster: true, maxW: 210, maxH: 210, label: "cirkel om M met straal 2 en drie punten",
              items: [ { t: "cirkel", c: [0, 0], r: 2, kleur: "blauw" }, { t: "punt", p: [0, 0], label: "M", kleur: "blauw", lp: [10, 10] },
                       { t: "punt", p: [0, 2], label: "P", kleur: "rood", lp: [10, -10] }, { t: "punt", p: [1, 1], label: "Q", kleur: "rood" },
                       { t: "punt", p: [2, 2], label: "R", kleur: "rood" } ] }),
          o: ["R", "P", "Q"], a: "R",
          fout: {
            "P": "P ligt precies 2 boven M: dat is de straal, dus P ligt óp de cirkel. Niet in het buitengebied.",
            "Q": "Q ligt schuin 1 en 1 van M, ongeveer 1,4. Dat is minder dan 2, dus binnen."
          },
          w: "R ligt schuin 2 en 2 van M: ongeveer 2,8. Meer dan 2, dus buiten.",
          meer: "Schuin is langer dan je denkt. R lijkt 'twee hokjes' weg, maar de rechte afstand is ongeveer 2,8." },

        { t: "bouw", q: "Alle punten op 3,5 cm van punt A vormen een cirkel. Hoeveel cm is de diameter van die cirkel?", a: "7",
          w: "De punten op 3,5 cm van A vormen ⊙(A; 3,5 cm). De straal is 3,5 cm.",
          meer: "Diameter = 2 × 3,5 = 7 cm." }
      ]
    },
    {
      n: 2, naam: "Zilver",
      uitleg: [
        "In het boek vliegt een traumahelikopter met 160 km per uur. Hij moet binnen 30 minuten ter plaatse zijn.",
        "In een half uur komt hij 160 : 2 = <b>80 km</b> ver. Dat is de <b>straal</b> van het cirkelvormige gebied dat hij kan bedienen.",
        "Zo werkt het altijd: <b>straal = snelheid × tijd</b>. Reken minuten om naar uren: 30 min = ½ uur, 15 min = ¼ uur, 45 min = ¾ uur, 20 min = ⅓ uur.",
        "Op een kaart gebruik je de <b>schaal</b>. Bij 1 : 4 000 000 is 1 cm op de kaart 4 000 000 cm = 40 km in het echt. Een straal van 80 km teken je dan als 2 cm."
      ],
      regel: "straal = snelheid × tijd · op de kaart: echte afstand : wat 1 cm voorstelt",
      voorbeelden: [
        { en: "120 km/u en 15 minuten → straal 120 × ¼ = 30 km", let: "15 minuten is een kwart uur." },
        { en: "Schaal 1 : 2 000 000 en straal 60 km → 3 cm op de kaart", let: "1 cm = 20 km, dus 60 : 20 = 3." }
      ],
      vragen: [
        { t: "vb", opgave: "Een traumahelikopter vliegt 160 km per uur. Welk gebied kan hij in 30 minuten bereiken?",
          stappen: [
            { toon: "30 minuten = ½ uur", uitleg: "Snelheid staat per uur, dus reken de tijd om naar uren." },
            { toon: "160 × ½ = 80 km", uitleg: "In een half uur komt hij de helft van 160 km ver." },
            { toon: "gebied = ⊙(basis, 80 km), met binnengebied", uitleg: "Alle plekken op hoogstens 80 km van de basis." }
          ],
          waarom: { q: "Waarom is het gebied een cirkel?",
            o: ["Omdat hij in elke richting even ver kan vliegen", "Omdat helikopters altijd rondjes vliegen", "Omdat de kaart rond is"],
            a: "Omdat hij in elke richting even ver kan vliegen" },
          fout: {
            "Omdat helikopters altijd rondjes vliegen": "hij vliegt juist in een rechte lijn naar het ongeluk. Maar dat kan in elke richting, en in elke richting komt hij 80 km ver. Al die eindpunten samen vormen de cirkel.",
            "Omdat de kaart rond is": "de kaart is gewoon rechthoekig. Het gebied is rond omdat elk punt op 80 km van de basis even ver weg ligt, welke kant je ook op gaat."
          },
          w: "Alle punten op 80 km van de basis vormen een cirkel met straal 80 km.",
          meer: "Afstand ≤ 80 km: binnen of op de cirkel. Een ongeluk op 85 km valt erbuiten." },

        { t: "mc", q: "De schaal van een kaart is 1 : 4 000 000. Hoeveel km in het echt is 1 cm op de kaart?",
          o: ["40 km", "4 km", "400 km", "4000 km"], a: "40 km",
          fout: {
            "4 km": "4 km = 400 000 cm. Dat hoort bij schaal 1 : 400 000. Hier staat er een nul meer: 4 000 000 cm = 40 000 m = 40 km.",
            "400 km": "400 km = 40 000 000 cm, een nul te veel. Reken stap voor stap: 4 000 000 cm : 100 = 40 000 m, en : 1000 = 40 km.",
            "4000 km": "dat is bijna de afstand van Nederland naar de Sahara, voor 1 cm op de kaart. Van cm naar km deel je door 100 000: 4 000 000 : 100 000 = 40."
          },
          w: "1 cm op de kaart = 4 000 000 cm = 40 km.",
          meer: "Van cm naar m: : 100. Van m naar km: : 1000. Samen: : 100 000. 4 000 000 : 100 000 = 40." },

        { t: "bouw", q: "Een vuurtoren is tot 30 km ver te zien. Op de kaart is 1 cm gelijk aan 10 km. Hoeveel cm is de straal van de cirkel die je op de kaart tekent?", a: "3",
          w: "30 km : 10 km per cm = 3 cm.",
          meer: "Elke cm op de kaart is 10 km. Voor 30 km heb je dus 3 cm nodig. Teken ⊙(vuurtoren, 3 cm)." },

        { t: "mc", q: "Een helikopter vliegt 180 km per uur. Welk gebied bereikt hij in <b>20 minuten</b>?",
          o: ["⊙(basis, 60 km)", "⊙(basis, 3600 km)", "⊙(basis, 9 km)", "⊙(basis, 120 km)"], a: "⊙(basis, 60 km)",
          fout: {
            "⊙(basis, 3600 km)": "je deed 180 × 20, maar 20 is in minuten en de snelheid per uur. 20 minuten = ⅓ uur: 180 × ⅓ = 60 km.",
            "⊙(basis, 9 km)": "je deed 180 : 20. Maar 20 minuten is ⅓ uur, dus 180 : 3 = 60 km. In 20 minuten komt hij verder dan 9 km.",
            "⊙(basis, 120 km)": "120 is 2 × 60, dat is de diameter van het gebied. Bij ⊙ zet je de straal: 60 km."
          },
          w: "20 minuten = ⅓ uur, dus 180 : 3 = 60 km.",
          meer: "Straal = snelheid × tijd in uren = 180 × ⅓ = 60 km. Het gebied is ⊙(basis, 60 km) met het binnengebied erbij." }
      ]
    },
    {
      n: 3, naam: "Goud",
      uitleg: [
        "Vaak staan er <b>twee voorwaarden</b> in één opgave, zoals: afstand tot A groter dan 3 cm <b>en</b> afstand tot B gelijk aan 2 cm.",
        "Vaste aanpak: (1) wat betekent de eerste voorwaarde, (2) wat betekent de tweede, (3) kleur alleen het stuk dat aan <b>allebei</b> voldoet.",
        "Groter dan 3 cm tot A = buitengebied van ⊙(A, 3 cm). Gelijk aan 2 cm tot B = óp ⊙(B, 2 cm). Samen: het stuk van de cirkel om B dat buiten de cirkel om A ligt.",
        "Twee cirkels die elkaar snijden, hebben twee snijpunten. Die liggen op allebei de cirkels."
      ],
      regel: "Twee voorwaarden: teken beide figuren, kleur alleen wat aan allebei voldoet.",
      voorbeelden: [
        { en: "afstand tot A < 3 én afstand tot B < 2 → de overlap van de twee binnengebieden", let: "Allebei 'kleiner dan': in allebei de schijven tegelijk." }
      ],
      vragen: [
        { t: "mc", q: "Wat kleur je bij: afstand tot A <b>kleiner</b> dan 3 cm én afstand tot B <b>kleiner</b> dan 2 cm?",
          o: ["De overlap van de twee binnengebieden", "Beide binnengebieden helemaal, ook waar ze niet overlappen", "Alleen de twee snijpunten van de twee cirkels", "Het boogje van ⊙(B, 2 cm) dat binnen ⊙(A, 3 cm) valt"],
          a: "De overlap van de twee binnengebieden",
          fout: {
            "Beide binnengebieden helemaal, ook waar ze niet overlappen": "er staat 'en': het punt moet aan allebei voldoen. Een punt op 1 cm van A maar 5 cm van B voldoet niet aan de tweede voorwaarde.",
            "Alleen de twee snijpunten van de twee cirkels": "de snijpunten liggen op precies 3 cm van A en precies 2 cm van B. Er stond 'kleiner dan', dus je zoekt een heel gebied, en de randen doen niet mee.",
            "Het boogje van ⊙(B, 2 cm) dat binnen ⊙(A, 3 cm) valt": "dat boogje hoort bij 'gelijk aan 2 cm tot B'. Hier staat 'kleiner dan 2 cm', dus het binnengebied van B, niet de rand."
          },
          w: "Kleiner dan bij allebei = in allebei de binnengebieden tegelijk.",
          meer: "Stap 1: binnengebied van ⊙(A, 3 cm). Stap 2: binnengebied van ⊙(B, 2 cm). Stap 3: alleen waar die twee over elkaar liggen." },

        { t: "mc", q: "A(−2, 1) en B(2, 0). De cirkels ⊙(A, 3) en ⊙(B, 2) zijn getekend. Welk punt ligt óp ⊙(B, 2) én in het buitengebied van ⊙(A, 3)?" +
            F({ xmin: -5.5, xmax: 4.5, ymin: -2.5, ymax: 4.5, rooster: true, assen: true, maxW: 290, maxH: 230, label: "twee cirkels om A en B",
              items: [ { t: "cirkel", c: [-2, 1], r: 3, kleur: "ink" }, { t: "cirkel", c: [2, 0], r: 2, kleur: "blauw" },
                       { t: "punt", p: [-2, 1], label: "A" }, { t: "punt", p: [2, 0], label: "B", kleur: "blauw", lp: [8, 12] },
                       { t: "punt", p: [4, 0], label: "P", kleur: "rood", lp: [-10, -10] }, { t: "punt", p: [0, 0], label: "Q", kleur: "rood", lp: [-10, 12] },
                       { t: "punt", p: [3, 0], label: "R", kleur: "rood", lp: [0, 13] } ] }),
          o: ["P", "Q", "R"], a: "P",
          fout: {
            "Q": "Q ligt wel op de cirkel om B (2 naar links), maar ook binnen de cirkel om A: QA is ongeveer 2,2, minder dan 3. Dat is precies het boogje dat je níet kleurt.",
            "R": "R ligt binnen ⊙(B, 2): RB = 1. Er staat 'óp de cirkel', dus RB moet precies 2 zijn."
          },
          w: "P ligt 2 rechts van B (op de cirkel) en ver van A (ongeveer 6,1). Allebei goed.",
          meer: "Vaste aanpak: eerst ⊙(B, 2) als lijn, dan wegstrepen wat binnen ⊙(A, 3) valt. Alleen een klein boogje links valt weg; Q ligt op dat boogje." },

        { t: "bouw", q: "Een traumahelikopter vliegt 150 km per uur en moet binnen 24 minuten ter plaatse zijn. Hoeveel km is de straal van zijn gebied?", a: "60",
          w: "24 minuten = 24/60 uur = 0,4 uur.",
          meer: "150 × 0,4 = 60 km. Of: in 6 minuten (een tiende uur) 15 km, dus in 24 minuten 4 × 15 = 60 km." },

        { t: "mc", q: "Een windmolen moet <b>minstens</b> 500 m van boerderij A én minstens 500 m van boerderij B staan. Waar mag hij staan?",
          o: ["Buiten of op allebei de cirkels met straal 500 m", "Binnen allebei de cirkels met straal 500 m", "Binnen de ene en buiten de andere cirkel", "Alleen precies op een van de twee cirkels"],
          a: "Buiten of op allebei de cirkels met straal 500 m",
          fout: {
            "Binnen allebei de cirkels met straal 500 m": "binnen betekent minder dan 500 m van de boerderij. Daar mag hij juist níet staan: dan staat hij te dichtbij.",
            "Binnen de ene en buiten de andere cirkel": "er staat 'en': hij moet bij allebei de boerderijen ver genoeg weg staan. Binnen de cirkel om A staat hij te dicht bij A.",
            "Alleen precies op een van de twee cirkels": "op de cirkel mag (precies 500 m is 'minstens 500 m'), maar verder weg mag ook. Het hele buitengebied van allebei is goed."
          },
          w: "Minstens 500 m = 500 m of meer: op de cirkel of in het buitengebied. Dat moet bij A én bij B.",
          meer: "Teken ⊙(A, 500 m) en ⊙(B, 500 m). Grijs is alles wat buiten allebei ligt. Een windmolen op 450 m van A valt af." }
      ]
    }
  ]
},

/* ---------------------------------------------------------------- 2.1 B */
{
  id: "afstand-lijn", emoji: "📏", titel: "2.1 Afstand tot een lijn",
  kort: "Afstand tot een lijn meet je loodrecht. Alle punten op afstand d van een lijn: twee evenwijdige lijnen.",
  niveaus: [
    {
      n: 1, naam: "Brons",
      uitleg: [
        "Ferry zwemt naar het strand en wil de kortste route. Die route staat <b>loodrecht</b> op de kustlijn: een hoek van 90°.",
        "Daarom: de <b>afstand van punt A tot lijn l</b> is de lengte van het kortste lijnstuk van A naar l, en dat lijnstuk staat loodrecht op l.",
        "Het punt A' waar dat lijnstuk op l uitkomt, heet de <b>loodrechte projectie</b> van A op l. De afstand van A tot l is dus AA'.",
        "Elke schuine route naar de lijn is langer. In een rooster met een horizontale lijn (zoals y = 2) is de afstand gewoon het hoogteverschil. Tot de x-as is dat de y-waarde, zonder minteken."
      ],
      regel: "Afstand punt tot lijn = loodrecht meten: AA', met A' de loodrechte projectie van A.",
      voorbeelden: [
        { en: "A(3, 5) en de lijn y = 1 → afstand 4", let: "Recht naar beneden: van hoogte 5 naar hoogte 1." },
        { en: "B(−2, −3) en de x-as → afstand 3", let: "Een afstand is nooit negatief: 3 hokjes omhoog naar de x-as." }
      ],
      vragen: [
        { t: "mc", q: "Van A zijn drie lijnstukken naar lijn l getekend. Hoe groot is de afstand van A tot l? (maten in cm)" +
            F({ xmin: -6.5, xmax: 3.8, ymin: -0.9, ymax: 4.8, maxW: 280, maxH: 170, label: "punt A boven lijn l met drie lijnstukken",
              items: [ { t: "lijn", a: [-7, 0], b: [4, 0], kleur: "ink" }, { t: "tekst", p: [3.4, 0.4], s: "l" },
                       { t: "seg", a: [0, 4], b: [0, 0], kleur: "rood", label: "4", weg: [-3, 2] },
                       { t: "seg", a: [0, 4], b: [3, 0], kleur: "blauw", label: "5", weg: [0, 0] },
                       { t: "seg", a: [0, 4], b: [-6, 0], kleur: "groen", label: "7,2", weg: [0, 0] },
                       { t: "haaks", p: [0, 0], u: [1, 0], v: [0, 1] },
                       { t: "punt", p: [0, 4], label: "A", lp: [10, -8] }, { t: "punt", p: [0, 0], label: "A'", lp: [-12, 12] } ] }),
          o: ["4 cm", "5 cm", "7,2 cm"], a: "4 cm",
          fout: {
            "5 cm": "dat is een schuine route, en schuin is langer: 5 tegen 4. De afstand is altijd de kortste route, en die staat loodrecht op l.",
            "7,2 cm": "dat is de langste, schuinste route. De afstand meet je juist loodrecht: AA' = 4 cm."
          },
          w: "AA' staat loodrecht op l (zie het hoekje van 90°). Dat is de kortste route: 4 cm.",
          meer: "A' is de loodrechte projectie van A op l. Elke andere route naar l is schuin en dus langer: 5 cm en 7,2 cm." },

        { t: "mc", q: "Wat is de <b>loodrechte projectie</b> van punt A op lijn l?",
          o: ["Het voetpunt A' op l waarbij AA' ⊥ l", "Het punt op l dat het dichtst bij de oorsprong ligt", "Het punt waar een schuine lijn vanuit A de lijn l raakt", "Het midden van lijn l tussen twee getekende punten"],
          a: "Het voetpunt A' op l waarbij AA' ⊥ l",
          fout: {
            "Het punt op l dat het dichtst bij de oorsprong ligt": "de oorsprong heeft er niets mee te maken. Het gaat om het punt van l dat het dichtst bij A ligt.",
            "Het punt waar een schuine lijn vanuit A de lijn l raakt": "een schuine lijn is juist niet de kortste. Bij de projectie staat AA' loodrecht op l (90°).",
            "Het midden van lijn l tussen twee getekende punten": "een lijn heeft geen midden, en het midden heeft niets met A te maken. A' ligt recht 'onder' A, loodrecht op l."
          },
          w: "A' is het punt op l waarvoor AA' loodrecht op l staat.",
          meer: "Je vindt A' door met je geodriehoek vanuit A een loodlijn op l te tekenen. AA' is dan de afstand van A tot l." },

        { t: "bouw", q: "Hoe groot is de afstand van het punt P(−4, −3) tot de x-as?", a: "3",
          w: "Recht omhoog naar de x-as: van hoogte −3 naar hoogte 0.",
          meer: "De afstand is 3. Een afstand is nooit negatief, ook al ligt P onder de x-as. De 4 hoort bij de afstand tot de y-as." },

        { t: "bouw", q: "Hoe groot is de afstand van het punt Q(−5, 2) tot de y-as?", a: "5",
          w: "Recht naar rechts naar de y-as: van x = −5 naar x = 0.",
          meer: "De afstand tot de y-as is de x-waarde zonder minteken: 5. De 2 hoort bij de afstand tot de x-as." }
      ]
    },
    {
      n: 2, naam: "Zilver",
      uitleg: [
        "Alle punten op <b>1 cm</b> van lijn l: dat zijn er niet een paar, maar twee hele lijnen. Eén aan elke kant van l, allebei evenwijdig met l.",
        "Dus: <b>alle punten met afstand d tot l vormen twee lijnen evenwijdig met l</b>, op afstand d aan weerskanten.",
        "Afstand <b>kleiner</b> dan d: de <b>strook</b> tussen die twee lijnen. Afstand <b>groter</b> dan d: alles buiten de strook.",
        "In een rooster: alle punten op afstand 2 van de lijn y = 3 vormen de lijnen y = 1 en y = 5. Tekenen gaat snel met je geodriehoek: de evenwijdige lijnen erop liggen 0,5 cm uit elkaar."
      ],
      regel: "afstand = d → twee evenwijdige lijnen · kleiner dan d → strook ertussen · groter dan d → buiten de strook",
      voorbeelden: [
        { en: "Afstand 1 tot de x-as → de lijnen y = 1 en y = −1", let: "Eén boven en één onder de x-as." },
        { en: "Afstand kleiner dan 2 tot y = 3 → de strook tussen y = 1 en y = 5", let: "De randlijnen zelf horen er niet bij." }
      ],
      vragen: [
        { t: "mc", q: "Alle punten op afstand 3 cm van lijn l vormen samen ...",
          o: ["twee lijnen, evenwijdig met l, aan elke kant één", "één lijn, evenwijdig met l", "een cirkel om lijn l heen", "een strook van 6 cm breed rond l"], a: "twee lijnen, evenwijdig met l, aan elke kant één",
          fout: {
            "één lijn, evenwijdig met l": "je vergeet de andere kant. Ook 3 cm ónder l liggen punten op afstand 3 cm. Dus twee lijnen.",
            "een cirkel om lijn l heen": "een cirkel hoort bij afstand tot een punt. Een lijn is oneindig lang: de punten op 3 cm vormen ook rechte, oneindige lijnen.",
            "een strook van 6 cm breed rond l": "de strook hoort bij 'kleiner dan 3 cm'. Bij 'gelijk aan 3 cm' horen alleen de twee randlijnen."
          },
          w: "Op afstand 3 cm van l: één lijn boven en één lijn onder l, allebei evenwijdig met l.",
          meer: "Vergelijk met een punt: alle punten op 3 cm van een punt vormen een cirkel. Bij een lijn worden het twee evenwijdige lijnen." },

        { t: "velden", q: "Alle punten op afstand 3 van de lijn y = 2 vormen twee lijnen. Welke?" +
            F({ xmin: -1, xmax: 6, ymin: -2, ymax: 6, rooster: true, assen: true, maxW: 220, maxH: 220, label: "de lijn y = 2",
              items: [ { t: "lijn", a: [0, 2], b: [1, 2], kleur: "ink", label: "y = 2", weg: [3, 0] } ] }),
          velden: [ { label: "onderste lijn: y =", a: "-1" }, { label: "bovenste lijn: y =", a: "5" } ],
          w: "3 omhoog en 3 omlaag vanaf y = 2.",
          meer: "2 + 3 = 5 en 2 − 3 = −1. De lijnen y = 5 en y = −1 liggen allebei evenwijdig met y = 2, op afstand 3." },

        { t: "mc", q: "Welk punt ligt op <b>minder dan 2</b> van de x-as?",
          o: ["(3, 1)", "(1, 3)", "(0, 2)", "(−2, −4)"], a: "(3, 1)",
          fout: {
            "(1, 3)": "kijk naar de y-waarde: 3. Dat punt ligt 3 boven de x-as, meer dan 2. Je keek naar de x-waarde.",
            "(0, 2)": "dat punt ligt precies 2 boven de x-as, op de randlijn y = 2. Er staat 'minder dan 2', dus de rand doet niet mee.",
            "(−2, −4)": "dat punt ligt 4 onder de x-as. Minder dan 2 is de strook tussen y = −2 en y = 2."
          },
          w: "(3, 1) ligt 1 boven de x-as. 1 is minder dan 2.",
          meer: "De afstand tot de x-as is de y-waarde zonder minteken. Minder dan 2: de strook tussen de lijnen y = −2 en y = 2." },

        { t: "bouw", q: "Een weg loopt over de x-as. Windmolens moeten minstens 150 m van de weg staan. In het rooster is 1 hokje 50 m. Hoe hoog (y) ligt de bovenste grenslijn?", a: "3",
          w: "150 m : 50 m per hokje = 3 hokjes.",
          meer: "De grenslijnen zijn y = 3 en y = −3. Windmolens mogen op of buiten die lijnen, dus niet in de strook ertussen." }
      ]
    },
    {
      n: 3, naam: "Goud",
      uitleg: [
        "Ook bij lijnen combineer je twee voorwaarden, bijvoorbeeld afstand 1 cm tot l <b>en</b> afstand groter dan 2 cm tot C.",
        "Stap 1: de twee evenwijdige lijnen. Stap 2: de cirkel om C. Stap 3: kleur de delen van de lijnen die buiten de cirkel liggen.",
        "Punten op afstand d van l én op afstand r van C zijn <b>snijpunten</b> van de twee lijnen met de cirkel. Dat kunnen er 0 tot 4 zijn.",
        "Tellen? Kijk per evenwijdige lijn hoe ver hij van C ligt. Kleiner dan r: twee snijpunten. Precies r: de lijn raakt de cirkel, één punt. Groter dan r: geen."
      ],
      regel: "Teken eerst alle figuren, en kleur of tel pas daarna: alleen wat aan allebei voldoet.",
      voorbeelden: [
        { en: "C op lijn l, afstand 1 tot l én afstand 2 tot C → 4 punten", let: "Beide evenwijdige lijnen liggen op 1 van C, en 1 is minder dan 2: elk twee snijpunten." }
      ],
      vragen: [
        { t: "bouw", q: "Hoeveel punten liggen op afstand 2 van de x-as én op afstand 2 van de oorsprong O?", a: "2",
          w: "Afstand 2 tot de x-as: de lijnen y = 2 en y = −2. Afstand 2 tot O: ⊙(O, 2).",
          meer: "De lijn y = 2 ligt precies 2 van O: hij raakt de cirkel alleen in (0, 2). Net zo raakt y = −2 alleen in (0, −2). Samen 2 punten." },

        { t: "bouw", q: "Een schip vaart evenwijdig aan de kust, op 30 km afstand. De kaart heeft schaal 1 : 4 000 000. Op hoeveel cm van de kustlijn teken je de route?", a: "0,75",
          w: "1 cm op de kaart = 4 000 000 cm = 40 km.",
          meer: "30 : 40 = 0,75 cm. De route is een lijn evenwijdig met de kust, op 0,75 cm. (Aan land liggen die punten ook op 30 km, maar daar vaart geen schip.)" },

        { t: "mc", q: "Wat kleur je bij: op <b>minder dan</b> 2 cm van l én op <b>meer dan</b> 3 cm van C?",
          o: ["De strook rond l, buiten ⊙(C, 3 cm)", "Alleen de twee randlijnen van de strook, buiten de cirkel", "De hele strook plus het hele binnengebied van de cirkel", "Het stuk van de strook dat binnen ⊙(C, 3 cm) valt"],
          a: "De strook rond l, buiten ⊙(C, 3 cm)",
          fout: {
            "Alleen de twee randlijnen van de strook, buiten de cirkel": "de randlijnen horen bij 'gelijk aan 2 cm'. Bij 'minder dan 2 cm' kleur je de hele strook ertussen, zonder de randen.",
            "De hele strook plus het hele binnengebied van de cirkel": "er staat 'en', dus een punt moet aan allebei voldoen. En 'meer dan 3 cm van C' is juist buiten de cirkel.",
            "Het stuk van de strook dat binnen ⊙(C, 3 cm) valt": "binnen de cirkel ligt een punt op minder dan 3 cm van C. Er stond 'meer dan 3 cm', dus buiten."
          },
          w: "Minder dan 2 cm van l = de strook. Meer dan 3 cm van C = buiten de cirkel. Allebei tegelijk.",
          meer: "Teken de twee evenwijdige lijnen op 2 cm en de cirkel ⊙(C, 3 cm). Kleur de strook, maar laat het stuk binnen de cirkel wit." },

        { t: "mc", q: "Waarom is de route die loodrecht op de kust staat altijd de kortste?",
          o: ["Schuin is altijd langer: de schuine zijde van een rechthoekige driehoek is de langste", "Omdat je dan het minste tegenstroom van de golven hebt", "Omdat een kustlijn altijd precies recht loopt", "Omdat een hoek van 90° de grootste hoek is die er bestaat"],
          a: "Schuin is altijd langer: de schuine zijde van een rechthoekige driehoek is de langste",
          fout: {
            "Omdat je dan het minste tegenstroom van de golven hebt": "het gaat hier om afstand, niet om stroming. Ook op papier zonder water is de loodrechte route de kortste.",
            "Omdat een kustlijn altijd precies recht loopt": "dat is meestal niet zo, en het is ook niet de reden. Bij elke rechte lijn is de loodrechte route de kortste.",
            "Omdat een hoek van 90° de grootste hoek is die er bestaat": "er bestaan grotere hoeken (120°, 180°). De reden is dat elke andere route de schuine zijde van een rechthoekige driehoek is."
          },
          w: "Elke schuine route vormt met de loodrechte route een rechthoekige driehoek. De schuine zijde daarvan is de langste.",
          meer: "Voorbeeld: loodrecht 4, een stukje opzij 3, dan is de schuine route 5. Hoe verder opzij, hoe langer." }
      ]
    }
  ]
},

/* ---------------------------------------------------------------- 2.2 */
{
  id: "middelloodlijn", emoji: "⚖️", titel: "2.2 Middelloodlijn en omgeschreven cirkel",
  kort: "Middelloodlijn: door het midden én loodrecht. Elk punt erop ligt even ver van A als van B.",
  niveaus: [
    {
      n: 1, naam: "Brons",
      uitleg: [
        "De <b>middelloodlijn</b> van lijnstuk AB gaat door het <b>midden</b> van AB en staat er <b>loodrecht</b> op. Allebei moet kloppen.",
        "Elk punt van de middelloodlijn ligt <b>even ver van A als van B</b>. De middelloodlijn is namelijk een symmetrieas van AB: spiegel je A erin, dan kom je op B.",
        "Omgekeerd: <b>alle punten die even ver van A als van B liggen, vormen de middelloodlijn</b>. Het is dus niet alleen het midden, maar een hele lijn.",
        "Tekenen in drie stappen: (1) teken AB en bepaal het midden, (2) teken de lijn door het midden loodrecht op AB, (3) zet het rechtehoekteken en de streepjes voor gelijke lengte.",
        "Het midden in een rooster vind je door de coördinaten te middelen: het midden van A(1, 2) en B(5, 4) is ((1 + 5) : 2, (2 + 4) : 2) = (3, 3)."
      ],
      regel: "middelloodlijn = door het midden + loodrecht · elk punt erop ligt even ver van A als van B",
      voorbeelden: [
        { en: "A(1, 2) en B(5, 4) → midden (3, 3)", let: "x: (1 + 5) : 2 = 3, y: (2 + 4) : 2 = 3." },
        { en: "P op de middelloodlijn van AB en PA = 5 cm → PB = 5 cm", let: "Even ver, dus ook 5 cm." }
      ],
      vragen: [
        { t: "mc", q: "Welke punten liggen <b>even ver van A als van B</b>?",
          o: ["Alle punten van de middelloodlijn van lijnstuk AB", "Alleen het midden van lijnstuk AB", "Alle punten van het lijnstuk AB zelf", "Alle punten van de cirkel met middellijn AB"],
          a: "Alle punten van de middelloodlijn van lijnstuk AB",
          fout: {
            "Alleen het midden van lijnstuk AB": "het midden is er één van, maar niet de enige. Neem A(−3, 0) en B(3, 0). Het punt P(0, 4) ligt 5 van A én 5 van B, en P is niet het midden.",
            "Alle punten van het lijnstuk AB zelf": "een punt op AB vlak bij A, zeg op 1 cm van A, ligt veel verder van B. Op AB is alleen het midden even ver.",
            "Alle punten van de cirkel met middellijn AB": "op die cirkel ligt ook een punt vlak naast A. Dat ligt dichtbij A en ver van B, dus niet even ver."
          },
          w: "Alle punten die even ver van A als van B liggen, vormen samen de middelloodlijn van AB.",
          meer: "De middelloodlijn is een symmetrieas: elk punt erop zie je in de spiegel even ver van A als van B." },

        { t: "mc", q: "Welke lijn is de middelloodlijn van AB?" +
            F({ xmin: -0.6, xmax: 6.6, ymin: -3, ymax: 3, rooster: true, maxW: 250, maxH: 210, label: "lijnstuk AB met drie lijnen k, m en n",
              items: [
                { t: "seg", a: [0, 0], b: [6, 0], kleur: "ink", dik: 3 },
                { t: "lijn", a: [3, 0], b: [4, 2], kleur: "oranje" },
                { t: "lijn", a: [2, 0], b: [2, 1], kleur: "paars" },
                { t: "lijn", a: [3, 0], b: [3, 1], kleur: "blauw" },
                { t: "tekst", p: [4.85, 2.55], s: "k", kleur: "oranje" }, { t: "tekst", p: [1.6, 2.55], s: "m", kleur: "paars" },
                { t: "tekst", p: [3.35, 2.55], s: "n", kleur: "blauw" },
                { t: "punt", p: [0, 0], label: "A", lp: [-4, 13] }, { t: "punt", p: [6, 0], label: "B", lp: [4, 13] }
              ] }),
          o: ["n", "k", "m"], a: "n",
          fout: {
            "k": "k gaat wel door het midden (3, 0), maar staat schuin op AB. Een punt hoog op k ligt dan dichter bij B dan bij A. Zonder loodrecht is het geen middelloodlijn.",
            "m": "m staat wel loodrecht op AB, maar gaat door x = 2 en niet door het midden x = 3. Vanaf m is A 2 hokjes weg en B 4 hokjes."
          },
          w: "n gaat door het midden van AB (x = 3) én staat er loodrecht op.",
          meer: "Een middelloodlijn moet aan twee eisen voldoen: door het midden en loodrecht. k mist de loodrechte stand, m mist het midden." },

        { t: "velden", q: "Wat is het midden van A(2, 1) en B(8, 5)?",
          velden: [ { label: "x =", a: "5" }, { label: "y =", a: "3" } ],
          w: "Middel de coördinaten: tel op en deel door 2.",
          meer: "x: (2 + 8) : 2 = 5. y: (1 + 5) : 2 = 3. Het midden is (5, 3). Daar gaat de middelloodlijn doorheen." },

        { t: "mc", q: "Punt P ligt op de middelloodlijn van AB. PA = 7 cm. Hoe lang is PB?",
          o: ["7 cm", "14 cm", "3,5 cm", "dat kun je niet weten"], a: "7 cm",
          fout: {
            "14 cm": "je deed 2 × 7, maar P ligt even ver van A als van B. Dus PB is gewoon ook 7 cm.",
            "3,5 cm": "je halveerde 7. Maar halveren hoort bij het midden van AB, niet bij de afstand van P. P ligt even ver van A als van B: 7 cm.",
            "dat kun je niet weten": "dat kun je wel: elk punt van de middelloodlijn ligt even ver van A als van B. Dus PB = PA = 7 cm."
          },
          w: "Op de middelloodlijn: PA = PB.",
          meer: "Dat is precies de eigenschap van de middelloodlijn. Elk punt erop ligt even ver van A als van B." }
      ]
    },
    {
      n: 2, naam: "Zilver",
      uitleg: [
        "De middelloodlijn van AB verdeelt het vlak in twee helften, <b>halfvlakken</b>.",
        "Aan de kant van A liggen alle punten die <b>dichter bij A</b> liggen dan bij B. Aan de kant van B andersom.",
        "Liggen A en B op dezelfde hoogte, zoals A(1, 2) en B(7, 2)? Dan is de middelloodlijn de verticale lijn x = 4. Links daarvan is dichter bij A.",
        "Ziekenhuizen P, Q en R: met de middelloodlijnen van PQ, QR en PR verdeel je de kaart in stukken die het dichtst bij één ziekenhuis liggen."
      ],
      regel: "dichter bij A dan bij B = het halfvlak aan de kant van A van de middelloodlijn",
      voorbeelden: [
        { en: "A(1, 2) en B(7, 2) → middelloodlijn x = 4", let: "Het punt (3, 5) ligt links van x = 4, dus dichter bij A." }
      ],
      vragen: [
        { t: "mc", q: "De middelloodlijn van A(1, 1) en B(5, 1) is getekend. Welk punt ligt <b>dichter bij A</b> dan bij B?" +
            F({ xmin: -0.5, xmax: 6.5, ymin: -2, ymax: 5, rooster: true, assen: true, maxW: 230, maxH: 230, label: "A, B en de middelloodlijn x = 3",
              items: [
                { t: "lijn", a: [3, 0], b: [3, 1], kleur: "blauw" },
                { t: "punt", p: [1, 1], label: "A" }, { t: "punt", p: [5, 1], label: "B" },
                { t: "punt", p: [2, 4], label: "P", kleur: "rood" }, { t: "punt", p: [3, -1], label: "Q", kleur: "rood" },
                { t: "punt", p: [4, 3], label: "R", kleur: "rood" } ] }),
          o: ["P", "Q", "R"], a: "P",
          fout: {
            "Q": "Q ligt óp de middelloodlijn. Dan ligt Q even ver van A als van B (allebei 2 opzij en 2 omlaag), niet dichter bij A.",
            "R": "R ligt rechts van de middelloodlijn, aan de kant van B. RB is ongeveer 2,2 en RA ongeveer 3,6: dichter bij B."
          },
          w: "P ligt links van de middelloodlijn, aan de kant van A.",
          meer: "PA is ongeveer 3,2 en PB ongeveer 4,2. Alles links van x = 3 ligt dichter bij A." },

        { t: "bouw", q: "A(−2, 3) en B(6, 3). De middelloodlijn van AB is een verticale lijn x = ? Vul het getal in.", a: "2",
          w: "De middelloodlijn gaat door het midden: x = (−2 + 6) : 2.",
          meer: "(−2 + 6) : 2 = 2. AB is horizontaal, dus de middelloodlijn is verticaal: x = 2." },

        { t: "mc", q: "Je kleurt alle punten die <b>dichter bij A</b> dan bij B liggen. Wat kleur je?",
          o: ["Het halfvlak aan de kant van A", "Het halfvlak aan de kant van B, want B ligt verder weg", "Alleen het lijnstuk van A tot het midden van AB", "Een cirkel om A met straal AB"],
          a: "Het halfvlak aan de kant van A",
          fout: {
            "Het halfvlak aan de kant van B, want B ligt verder weg": "aan de kant van B liggen de punten juist dichter bij B. Neem een punt vlak naast B: dat ligt dichtbij B en ver van A.",
            "Alleen het lijnstuk van A tot het midden van AB": "ook punten buiten AB liggen dichter bij A, bijvoorbeeld een punt recht boven A. Het is een heel halfvlak.",
            "Een cirkel om A met straal AB": "in die cirkel liggen ook punten vlak naast B, en die zijn dichter bij B. De grens is de middelloodlijn, geen cirkel."
          },
          w: "De middelloodlijn is de grens. Aan de kant van A ligt alles dichter bij A.",
          meer: "Teken de middelloodlijn en kleur de kant waar A ligt. De lijn zelf doet niet mee: daar is het even ver." },

        { t: "mc", q: "Drie ziekenhuizen P, Q en R. Met welke lijnen verdeel je de kaart in 'het dichtst bij P', 'het dichtst bij Q' en 'het dichtst bij R'?",
          o: ["De middelloodlijnen van PQ, QR en PR als grenzen", "De bissectrices van de hoeken van △PQR", "De zwaartelijnen van △PQR", "Cirkels met dezelfde straal om P, Q en R"],
          a: "De middelloodlijnen van PQ, QR en PR als grenzen",
          fout: {
            "De bissectrices van de hoeken van △PQR": "bissectrices gaan over afstand tot lijnen (de benen van een hoek). Hier gaat het om afstand tot punten, en dat is de middelloodlijn.",
            "De zwaartelijnen van △PQR": "een zwaartelijn verdeelt een driehoek in twee even zware stukken. Een punt op de zwaartelijn door P ligt niet even ver van Q als van R.",
            "Cirkels met dezelfde straal om P, Q en R": "dan krijg je overlap: een punt kan binnen twee cirkels liggen. De grens tussen 'dichter bij P' en 'dichter bij Q' is de middelloodlijn van PQ."
          },
          w: "Even ver van twee ziekenhuizen = op hun middelloodlijn. Dat is de grens.",
          meer: "De middelloodlijn van PQ scheidt 'dichter bij P' van 'dichter bij Q'. Doe dat voor alle drie de paren, dan heb je de drie gebieden." }
      ]
    },
    {
      n: 3, naam: "Goud",
      uitleg: [
        "Teken in △ABC de middelloodlijnen van twee zijden. Hun snijpunt M ligt even ver van A, B en C.",
        "Dus de cirkel om M door A gaat ook door B en C: dat is de <b>omgeschreven cirkel</b>. Hij gaat door de drie hoekpunten. Twee middelloodlijnen zijn genoeg: de derde gaat vanzelf ook door M.",
        "Waar ligt M? Scherphoekige driehoek: binnen. Rechthoekige driehoek: precies op het midden van de langste (schuine) zijde. Stomphoekige driehoek: buiten de driehoek.",
        "Niet verwarren: de omgeschreven cirkel gaat door de <b>hoekpunten</b>. De ingeschreven cirkel (2.3) raakt de <b>zijden</b>."
      ],
      regel: "Omgeschreven cirkel: door de drie hoekpunten, middelpunt = snijpunt van de middelloodlijnen.",
      voorbeelden: [
        { en: "△PQR met ∠P = 90°, PQ = 6 cm en PR = 4 cm", let: "M ligt op het midden van QR, de schuine zijde." }
      ],
      vragen: [
        { t: "mc", q: "Het middelpunt van de <b>omgeschreven</b> cirkel van een driehoek is het snijpunt van de ...",
          o: ["middelloodlijnen van de zijden", "bissectrices van de drie hoeken van de driehoek", "zwaartelijnen", "hoogtelijnen"], a: "middelloodlijnen van de zijden",
          fout: {
            "bissectrices van de drie hoeken van de driehoek": "de bissectrices geven het middelpunt van de ingeschreven cirkel, die de zijden raakt. De omgeschreven cirkel gaat door de hoekpunten, en even ver van hoekpunten = middelloodlijn.",
            "zwaartelijnen": "het snijpunt van de zwaartelijnen is het zwaartepunt, het balanspunt. Dat ligt meestal niet even ver van de drie hoekpunten.",
            "hoogtelijnen": "het snijpunt van de hoogtelijnen is het hoogtepunt. Bij een rechthoekige driehoek is dat het hoekpunt met de rechte hoek, en een cirkel daaromheen gaat niet door alle drie de hoekpunten."
          },
          w: "M moet even ver van de drie hoekpunten liggen, dus op de middelloodlijnen.",
          meer: "Op de middelloodlijn van AB: MA = MB. Op die van BC: MB = MC. Samen: MA = MB = MC." },

        { t: "mc", q: "△PQR heeft een <b>stompe</b> hoek bij P. Waar ligt het middelpunt van de omgeschreven cirkel?",
          o: ["buiten de driehoek, voorbij zijde QR", "binnen de driehoek", "precies op zijde QR", "in hoekpunt P"], a: "buiten de driehoek, voorbij zijde QR",
          fout: {
            "binnen de driehoek": "dat geldt alleen voor een scherphoekige driehoek. Bij een stompe hoek snijden de middelloodlijnen elkaar buiten de driehoek, aan de kant van de lange zijde.",
            "precies op zijde QR": "dat gebeurt bij een rechte hoek bij P: dan ligt M op het midden van QR. Wordt de hoek stomp, dan schuift M voorbij QR naar buiten.",
            "in hoekpunt P": "M moet even ver van P, Q en R liggen. In P zelf is de afstand tot P nul en tot Q niet. Dat kan dus niet."
          },
          w: "Bij een stomphoekige driehoek ligt het middelpunt van de omgeschreven cirkel buiten de driehoek.",
          meer: "Scherp: binnen. Recht: op het midden van de schuine zijde. Stomp: buiten, voorbij de langste zijde." },

        { t: "velden", q: "△PQR heeft een rechte hoek bij P. Wat zijn de coördinaten van het middelpunt M van de omgeschreven cirkel?" +
            F({ xmin: -1, xmax: 7, ymin: -1, ymax: 5, rooster: true, assen: true, maxW: 240, maxH: 200, label: "rechthoekige driehoek PQR",
              items: [ { t: "poly", p: [[0, 0], [6, 0], [0, 4]], fill: "#dbeafe" }, { t: "haaks", p: [0, 0], u: [1, 0], v: [0, 1] },
                       { t: "punt", p: [0, 0], label: "P", lp: [-10, 12] }, { t: "punt", p: [6, 0], label: "Q", lp: [8, 12] },
                       { t: "punt", p: [0, 4], label: "R", lp: [-12, -4] } ] }),
          velden: [ { label: "x van M =", a: "3" }, { label: "y van M =", a: "2" } ],
          w: "Bij een rechthoekige driehoek ligt M op het midden van de schuine zijde QR.",
          meer: "Midden van Q(6, 0) en R(0, 4): ((6 + 0) : 2, (0 + 4) : 2) = (3, 2). Controle: M ligt ook op de middelloodlijn van PQ (x = 3) en van PR (y = 2)." },

        { t: "mc", q: "A(−3, 0), B(3, 0) en C(0, 9). Het middelpunt M van de omgeschreven cirkel ligt op de y-as. Welk punt is M?",
          o: ["(0, 4)", "(0, 3)", "(0; 4,5)", "(0, 0)"], a: "(0, 4)",
          fout: {
            "(0, 3)": "dat is het zwaartepunt ((−3 + 3 + 0) : 3, (0 + 0 + 9) : 3). Meet na: van (0, 3) naar A is ongeveer 4,2 en naar C is 6. Niet even ver.",
            "(0; 4,5)": "dat is het midden tussen O en C. Van daar naar C is 4,5, maar naar A ongeveer 5,4. Niet even ver.",
            "(0, 0)": "dat is het midden van AB. Daar is de afstand tot A 3 en tot C 9. Veel te ongelijk."
          },
          w: "Van (0, 4) naar C is 9 − 4 = 5, en naar A is 3 opzij en 4 omlaag: ook 5.",
          meer: "MA = MB = MC = 5. M ligt op de y-as, want dat is de middelloodlijn van AB. De omgeschreven cirkel is ⊙(M, 5)." }
      ]
    }
  ]
},

/* ---------------------------------------------------------------- 2.3 */
{
  id: "bissectrice", emoji: "📐", titel: "2.3 Bissectrice en ingeschreven cirkel",
  kort: "Bissectrice: deelt een hoek middendoor. Elk punt erop ligt even ver van de twee benen.",
  niveaus: [
    {
      n: 1, naam: "Brons",
      uitleg: [
        "Een hoek heeft twee <b>benen</b>: de twee halve lijnen die vanuit het hoekpunt vertrekken.",
        "De <b>bissectrice</b> (ook wel <b>deellijn</b>) is de halve lijn die de hoek <b>precies middendoor</b> deelt: ∠A₁ = ∠A₂.",
        "Is ∠A = 70°, dan maakt de bissectrice twee hoeken van 35°. Meet de hoek, deel door 2 en teken de lijn met je geodriehoek. Geef met boogjes of kruisjes aan dat de twee hoeken gelijk zijn.",
        "Pas op: de bissectrice gaat <b>niet</b> vanzelf naar het midden van de overstaande zijde. Dat doet de zwaartelijn (2.4)."
      ],
      regel: "bissectrice = de hoek precies doormidden: ∠A₁ = ∠A₂ = ∠A : 2",
      voorbeelden: [
        { en: "∠A = 64° → ∠A₁ = ∠A₂ = 32°", let: "Gewoon halveren." },
        { en: "De monding van de Corantijn eerlijk verdelen", let: "De bissectrice van de hoek tussen de twee kusten verdeelt het water eerlijk tussen Guyana en Suriname." }
      ],
      vragen: [
        { t: "vb", opgave: "∠B = 84°. Teken de bissectrice van ∠B.",
          stappen: [
            { toon: "Meet ∠B: 84°", uitleg: "Leg je geodriehoek met het nulpunt op B en lees de hoek af." },
            { toon: "84 : 2 = 42°", uitleg: "De bissectrice deelt de hoek precies doormidden." },
            { toon: "Teken vanuit B een halve lijn op 42° van een been en zet twee gelijke boogjes", uitleg: "Zo laat je zien dat ∠B₁ = ∠B₂." }
          ],
          waarom: { q: "Hoe controleer je dat je bissectrice klopt?",
            o: ["Meet de andere deelhoek: die moet ook 42° zijn", "Kijk of de lijn het midden van de overkant raakt", "Kijk of de lijn loodrecht op een been staat"],
            a: "Meet de andere deelhoek: die moet ook 42° zijn" },
          fout: {
            "Kijk of de lijn het midden van de overkant raakt": "dat is de zwaartelijn. In een driehoek met ∠B = 90° en zijden 9 en 4 gaat de lijn naar het midden onder 24°, de bissectrice onder 45°. Twee verschillende lijnen.",
            "Kijk of de lijn loodrecht op een been staat": "loodrecht is 90°. De bissectrice van 84° maakt 42° met elk been, geen 90°."
          },
          w: "Bissectrice: ∠B₁ = ∠B₂ = 42°.",
          meer: "84 : 2 = 42. Meet je aan allebei de kanten 42°, dan klopt je bissectrice." },

        { t: "mc", q: "In △ABC (rechte hoek bij A) zijn uit A drie lijnen naar BC getekend. E is het midden van BC. Welke lijn is de <b>bissectrice</b> van ∠A?" + DRIE_LIJNEN,
          o: ["de blauwe lijn", "de rode lijn", "de groene lijn"], a: "de blauwe lijn",
          fout: {
            "de rode lijn": "de rode lijn gaat naar E, het midden van BC: dat is de zwaartelijn. Hij deelt ∠A niet doormidden: hij maakt ongeveer 24° met AB en 66° met AC.",
            "de groene lijn": "de groene lijn staat loodrecht op BC (zie het hoekje): dat is de hoogtelijn. Die maakt ongeveer 66° met AB en 24° met AC. Ongelijk, dus geen bissectrice."
          },
          w: "De blauwe lijn deelt de rechte hoek bij A in twee hoeken van 45°.",
          meer: "∠A = 90°, dus de bissectrice maakt 45° met AB en 45° met AC. Ze komt níet in het midden van BC uit: dat doet de rode zwaartelijn." },

        { t: "bouw", q: "∠K = 128°. Hoeveel graden is elk van de twee hoeken die de bissectrice van ∠K maakt?", a: "64",
          w: "De bissectrice deelt de hoek doormidden: 128 : 2.",
          meer: "128 : 2 = 64°. Ook een stompe hoek heeft een bissectrice; de twee deelhoeken zijn dan scherp." },

        { t: "mc", q: "De bissectrice van ∠A verdeelt ∠A in ∠A₁ en ∠A₂. Wat geldt altijd?",
          o: ["∠A₁ = ∠A₂", "∠A₁ + ∠A₂ = 90°", "∠A₁ = 2 × ∠A₂", "∠A₁ = ∠A"], a: "∠A₁ = ∠A₂",
          fout: {
            "∠A₁ + ∠A₂ = 90°": "samen zijn ze ∠A, en dat is lang niet altijd 90°. Bij ∠A = 70° zijn ze samen 70°.",
            "∠A₁ = 2 × ∠A₂": "dan zou de hoek in een stuk van 2 en een stuk van 1 verdeeld zijn. De bissectrice deelt juist eerlijk: twee gelijke stukken.",
            "∠A₁ = ∠A": "∠A₁ is maar de helft van ∠A. Bij ∠A = 70° is ∠A₁ = 35°."
          },
          w: "De bissectrice deelt de hoek middendoor, dus ∠A₁ = ∠A₂.",
          meer: "En samen zijn ze weer ∠A: ∠A₁ + ∠A₂ = ∠A." }
      ]
    },
    {
      n: 2, naam: "Zilver",
      uitleg: [
        "Elk punt van de bissectrice ligt <b>even ver van het ene been als van het andere been</b>.",
        "De afstand tot een been meet je weer <b>loodrecht</b>, net als de afstand tot een lijn in 2.1.",
        "Omgekeerd: <b>alle punten binnen een hoek die even ver van beide benen liggen, vormen de bissectrice</b>.",
        "Het spiekrijtje: op afstand r van een punt → cirkel · op afstand d van een lijn → twee evenwijdige lijnen · even ver van twee punten → middelloodlijn · even ver van de benen van een hoek → bissectrice."
      ],
      regel: "even ver van de benen van ∠A (binnen de hoek) = op de bissectrice van ∠A",
      voorbeelden: [
        { en: "P op de bissectrice van ∠A en de afstand tot het ene been is 3 cm", let: "Dan is de afstand tot het andere been ook 3 cm." }
      ],
      vragen: [
        { t: "mc", q: "Een punt ligt binnen ∠C en <b>even ver van de benen</b> van ∠C. Waar ligt het?",
          o: ["op de bissectrice van ∠C", "op de middelloodlijn tussen de twee benen", "op een cirkel om hoekpunt C", "op de zwaartelijn door C"], a: "op de bissectrice van ∠C",
          fout: {
            "op de middelloodlijn tussen de twee benen": "een middelloodlijn hoort bij twee punten (even ver van A als van B). Benen zijn lijnen; daarbij hoort de bissectrice.",
            "op een cirkel om hoekpunt C": "op zo'n cirkel liggen ook punten vlak bij één been en ver van het andere. Even ver van C is iets anders dan even ver van de benen.",
            "op de zwaartelijn door C": "de zwaartelijn gaat naar het midden van de overkant. Die maakt meestal geen gelijke hoeken met de benen, dus de afstanden zijn niet gelijk."
          },
          w: "Even ver van de benen van een hoek = op de bissectrice.",
          meer: "Uit het spiekrijtje: punt → cirkel, lijn → twee evenwijdige lijnen, twee punten → middelloodlijn, twee benen → bissectrice." },

        { t: "mc", q: "Een driehoekig meer heeft de oevers a, b en c. Club A mag alleen vissen waar het dichter bij oever a dan bij oever b is. Wat is de grens?",
          o: ["de bissectrice van de hoek tussen oever a en oever b", "de middelloodlijn van het stuk tussen a en b", "de hoogtelijn vanuit de hoek tussen a en b", "een cirkel om de hoek tussen a en b"],
          a: "de bissectrice van de hoek tussen oever a en oever b",
          fout: {
            "de middelloodlijn van het stuk tussen a en b": "de middelloodlijn hoort bij afstand tot twee punten. Oevers zijn lijnen; even ver van twee lijnen die een hoek maken = de bissectrice.",
            "de hoogtelijn vanuit de hoek tussen a en b": "de hoogtelijn staat loodrecht op de derde oever. Die verdeelt de hoek tussen a en b meestal niet eerlijk.",
            "een cirkel om de hoek tussen a en b": "op zo'n cirkel liggen punten vlak bij oever a en ook punten vlak bij oever b. Dat is geen eerlijke grens."
          },
          w: "Even ver van oever a als van oever b = de bissectrice van de hoek tussen die oevers.",
          meer: "Aan de kant van a ligt alles dichter bij a. Zo verdelen de drie bissectrices het meer in drie stukken." },

        { t: "bouw", q: "Punt P ligt op de bissectrice van ∠A. De afstand van P tot het ene been is 2,5 cm. Hoeveel cm is de afstand van P tot het andere been?", a: "2,5",
          w: "Elk punt van de bissectrice ligt even ver van beide benen.",
          meer: "Dus ook 2,5 cm. Beide afstanden meet je loodrecht op het been." },

        { t: "mc", q: "De afstand van punt P tot een been van een hoek meet je ...",
          o: ["loodrecht op dat been", "van P naar het hoekpunt", "evenwijdig met het andere been", "langs de bissectrice"], a: "loodrecht op dat been",
          fout: {
            "van P naar het hoekpunt": "het hoekpunt is maar één punt van het been. Een been is een halve lijn: je meet de kortste route ernaartoe, en die staat loodrecht.",
            "evenwijdig met het andere been": "dan meet je schuin naar het been toe, en schuin is langer. De afstand tot een lijn meet je altijd loodrecht.",
            "langs de bissectrice": "langs de bissectrice kom je bij het hoekpunt uit, niet loodrecht op het been. De afstand is de loodrechte route."
          },
          w: "Afstand tot een lijn (ook een been) = loodrecht meten.",
          meer: "Net als bij Ferry en de kust in 2.1: de kortste route staat loodrecht op de lijn." }
      ]
    },
    {
      n: 3, naam: "Goud",
      uitleg: [
        "Teken in △ABC de bissectrices van twee hoeken. Hun snijpunt M ligt even ver van alle drie de zijden.",
        "Dus een cirkel om M raakt alle drie de zijden: de <b>ingeschreven cirkel</b>. Hij ligt helemaal binnen de driehoek.",
        "De straal vind je door vanuit M een lijnstuk <b>loodrecht</b> op een zijde te tekenen. Niet naar een hoekpunt: dat hoort bij de omgeschreven cirkel.",
        "Rekenen met hoeken: de drie hoeken van een driehoek zijn samen 180°. Ken je ∠A en ∠B, dan ken je ∠C en ook de halve hoeken.",
        "Toepassing: het grootste ronde bloemenperk in een driehoekig grasveld, of een platform even ver van drie oevers."
      ],
      regel: "Ingeschreven cirkel: raakt de drie zijden, middelpunt = snijpunt van de bissectrices, straal loodrecht op een zijde.",
      voorbeelden: [
        { en: "∠A = 70° en ∠B = 40° → ∠C = 70°", let: "180 − 70 − 40 = 70. De bissectrice van ∠C maakt hoeken van 35°." }
      ],
      vragen: [
        { t: "mc", q: "Je hebt het middelpunt M van de <b>ingeschreven</b> cirkel gevonden. Hoe vind je de straal?",
          o: ["Loodrecht van M naar een zijde meten, de kortste weg", "Meet de afstand van M naar een hoekpunt", "Neem de helft van de kortste zijde", "Meet van M naar het midden van een zijde"],
          a: "Loodrecht van M naar een zijde meten, de kortste weg",
          fout: {
            "Meet de afstand van M naar een hoekpunt": "dat hoort bij de omgeschreven cirkel, die door de hoekpunten gaat. De ingeschreven cirkel raakt de zijden; met de afstand tot een hoekpunt wordt hij te groot en steekt hij buiten de driehoek.",
            "Neem de helft van de kortste zijde": "dat heeft niets met M te maken. In een driehoek met zijden 3, 4 en 5 is de straal 1, terwijl de helft van de kortste zijde 1,5 is.",
            "Meet van M naar het midden van een zijde": "de cirkel raakt de zijde meestal niet in het midden. Je meet de kortste afstand, en die staat loodrecht op de zijde."
          },
          w: "De straal is de afstand van M tot een zijde, en die meet je loodrecht.",
          meer: "M ligt even ver van de drie zijden. Teken MN loodrecht op een zijde en teken ⊙(M, MN): die raakt alle drie de zijden." },

        { t: "mc", q: "Welke cirkel <b>raakt</b> de drie zijden van een driehoek?",
          o: ["de ingeschreven cirkel", "de omgeschreven cirkel", "de cirkel om het zwaartepunt", "de cirkel met de langste zijde als diameter"], a: "de ingeschreven cirkel",
          fout: {
            "de omgeschreven cirkel": "de omgeschreven cirkel gaat door de hoekpunten en ligt dus om de driehoek heen. Hij raakt de zijden niet, hij snijdt ze in de hoekpunten.",
            "de cirkel om het zwaartepunt": "het zwaartepunt ligt meestal niet even ver van de drie zijden. Een cirkel daaromheen raakt dan hooguit één zijde mooi.",
            "de cirkel met de langste zijde als diameter": "die gaat door twee hoekpunten en steekt buiten de driehoek uit. Die raakt de zijden niet."
          },
          w: "De ingeschreven cirkel ligt binnen de driehoek en raakt alle drie de zijden.",
          meer: "Ingeschreven = bissectrices = raakt de zijden. Omgeschreven = middelloodlijnen = door de hoekpunten." },

        { t: "bouw", q: "In △ABC is ∠A = 80° en ∠B = 60°. M is het middelpunt van de ingeschreven cirkel. Hoeveel graden is ∠AMB?", a: "110",
          w: "M ligt op de bissectrices: ∠MAB = 40° en ∠MBA = 30°.",
          meer: "In △ABM zijn de hoeken samen 180°: ∠AMB = 180 − 40 − 30 = 110°." },

        { t: "velden", q: "In △ABC is ∠A = 50° en ∠B = 74°. Bereken ∠C en de twee hoeken die de bissectrice van ∠C maakt.",
          velden: [ { label: "∠C =", a: "56" }, { label: "elke deelhoek van ∠C =", a: "28" } ],
          w: "De hoeken van een driehoek zijn samen 180°.",
          meer: "∠C = 180 − 50 − 74 = 56°. De bissectrice maakt twee hoeken van 56 : 2 = 28°." }
      ]
    }
  ]
},

/* ---------------------------------------------------------------- 2.4 */
{
  id: "zwaartelijn-hoogtelijn", emoji: "🎯", titel: "2.4 Zwaartelijn en hoogtelijn",
  kort: "Zwaartelijn: hoekpunt → midden van de overkant. Hoogtelijn: door een hoekpunt, loodrecht op de overkant.",
  niveaus: [
    {
      n: 1, naam: "Brons",
      uitleg: [
        "Frits zaagt een driehoekig stuk hout door, van een hoekpunt naar het <b>midden van de overstaande zijde</b>. De twee stukken zijn precies even zwaar. Daarom heet die lijn de <b>zwaartelijn</b>.",
        "Elke driehoek heeft drie zwaartelijnen. Ze gaan door één punt: het <b>zwaartepunt Z</b>. Daar kun je de driehoek op je vinger laten balanceren. Z ligt altijd binnen de driehoek.",
        "Een <b>hoogtelijn</b> gaat door een hoekpunt en staat <b>loodrecht</b> op de overstaande zijde. De drie hoogtelijnen gaan door één punt: het <b>hoogtepunt H</b>.",
        "Het midden van een zijde in een rooster: middel de coördinaten. Het midden van A(2, 1) en C(6, 5) is (4, 3)."
      ],
      regel: "zwaartelijn: naar het midden · hoogtelijn: loodrecht · Z = snijpunt zwaartelijnen · H = snijpunt hoogtelijnen",
      voorbeelden: [
        { en: "Zwaartelijn door B in △ABC", let: "Van B naar het midden van AC." },
        { en: "Hoogtelijn door C in △ABC", let: "Door C, loodrecht op AB." }
      ],
      vragen: [
        { t: "mc", q: "Wat is waar over een <b>zwaartelijn</b> van een driehoek?",
          o: ["Hij loopt van een hoekpunt naar het midden van de overstaande zijde, en staat vaak schuin", "Hij staat altijd loodrecht op de overstaande zijde, net als een hoogte", "Hij deelt de hoek bij het hoekpunt precies middendoor", "Hij gaat loodrecht door het midden van een zijde"],
          a: "Hij loopt van een hoekpunt naar het midden van de overstaande zijde, en staat vaak schuin",
          fout: {
            "Hij staat altijd loodrecht op de overstaande zijde, net als een hoogte": "dat is de hoogtelijn. Een zwaartelijn gaat naar het midden en staat meestal schuin. Alleen in een gelijkbenige driehoek vallen ze samen.",
            "Hij deelt de hoek bij het hoekpunt precies middendoor": "dat is de bissectrice. In een driehoek met een rechte hoek en zijden 9 en 4 maakt de zwaartelijn hoeken van 24° en 66°, niet twee keer 45°.",
            "Hij gaat loodrecht door het midden van een zijde": "dat is de middelloodlijn. Die hoeft niet door een hoekpunt te gaan. Een zwaartelijn begint altijd in een hoekpunt."
          },
          w: "Zwaartelijn = hoekpunt + midden van de overstaande zijde.",
          meer: "Zo zaagt Frits zijn plank in twee even zware stukken." },

        { t: "mc", q: "In △ABC (rechte hoek bij A) zijn uit A drie lijnen naar BC getekend. E is het midden van BC. Welke lijn is de <b>zwaartelijn</b> door A?" + DRIE_LIJNEN,
          o: ["de rode lijn", "de blauwe lijn", "de groene lijn"], a: "de rode lijn",
          fout: {
            "de blauwe lijn": "de blauwe lijn deelt de rechte hoek in twee keer 45°: dat is de bissectrice. Hij komt niet in het midden E van BC uit.",
            "de groene lijn": "de groene lijn staat loodrecht op BC (zie het hoekje): dat is de hoogtelijn. Een zwaartelijn hoeft niet loodrecht te staan."
          },
          w: "De rode lijn gaat van A naar E, het midden van BC.",
          meer: "Zwaartelijn = naar het midden. Bissectrice = hoek halveren. Hoogtelijn = loodrecht. Drie verschillende lijnen uit hetzelfde hoekpunt." },

        { t: "velden", q: "Wat is het midden van zijde AC, met A(−3, −2) en C(5, 4)?",
          velden: [ { label: "x =", a: "1" }, { label: "y =", a: "1" } ],
          w: "Middel de coördinaten.",
          meer: "x: (−3 + 5) : 2 = 1. y: (−2 + 4) : 2 = 1. Het midden is (1, 1); de zwaartelijn door B gaat daarheen." },

        { t: "mc", q: "Waar ligt het <b>zwaartepunt</b> van een driehoek?",
          o: ["altijd binnen de driehoek", "altijd precies op een van de zijden", "bij een stompe driehoek buiten de driehoek", "altijd in een van de hoekpunten"], a: "altijd binnen de driehoek",
          fout: {
            "altijd precies op een van de zijden": "dan zou de driehoek op een rand balanceren en omvallen. Elke zwaartelijn loopt door de driehoek heen, dus hun snijpunt ligt binnen.",
            "bij een stompe driehoek buiten de driehoek": "dat geldt voor het hoogtepunt, niet voor het zwaartepunt. Ook een stompe driehoek kun je op je vinger laten balanceren.",
            "altijd in een van de hoekpunten": "op een hoekpunt balanceer je niet. Bij A(0, 0), B(6, 0), C(3, 9) is Z(3, 3): mooi binnenin."
          },
          w: "Het zwaartepunt is het balanspunt en ligt altijd binnen de driehoek.",
          meer: "Alle drie de zwaartelijnen lopen van een hoekpunt naar een punt op de overkant, dus helemaal binnen de driehoek. Hun snijpunt ook." }
      ]
    },
    {
      n: 2, naam: "Zilver",
      uitleg: [
        "Het zwaartepunt Z kun je in een rooster <b>uitrekenen</b>: het is het <b>gemiddelde</b> van de drie hoekpunten. Tel de x'en op en deel door 3, en net zo met de y'en.",
        "Voorbeeld: A(−3, −2), B(4, −1), C(−1, 6). x: (−3 + 4 − 1) : 3 = 0. y: (−2 − 1 + 6) : 3 = 1. Dus Z(0, 1).",
        "Bij een <b>stomphoekige</b> driehoek vallen twee hoogtelijnen buiten de driehoek. Je <b>verlengt</b> dan de overstaande zijde om loodrecht te kunnen tekenen. Het hoogtepunt H ligt dan ook buiten de driehoek.",
        "Bij een <b>rechthoekige</b> driehoek zijn de twee rechthoekszijden zelf hoogtelijnen. Het hoogtepunt is dan het hoekpunt met de rechte hoek."
      ],
      regel: "Z = gemiddelde van de hoekpunten · stomphoekig: zijde verlengen, H ligt buiten · rechthoekig: H in de rechte hoek",
      voorbeelden: [
        { en: "A(0, 0), B(6, 0), C(3, 9) → Z(3, 3)", let: "x: (0 + 6 + 3) : 3 = 3, y: (0 + 0 + 9) : 3 = 3." }
      ],
      vragen: [
        { t: "velden", q: "Bereken het zwaartepunt Z van △DEF met D(−4, −1), E(8, 2) en F(2, 5).",
          velden: [ { label: "x van Z =", a: "2" }, { label: "y van Z =", a: "2" } ],
          w: "Z is het gemiddelde van de drie hoekpunten.",
          meer: "x: (−4 + 8 + 2) : 3 = 6 : 3 = 2. y: (−1 + 2 + 5) : 3 = 6 : 3 = 2. Z(2, 2)." },

        { t: "mc", q: "△PQR heeft een <b>stompe</b> hoek bij Q. Waar ligt het hoogtepunt H?",
          o: ["buiten de driehoek", "binnen de driehoek", "precies in hoekpunt Q", "op het midden van PR"], a: "buiten de driehoek",
          fout: {
            "binnen de driehoek": "dat geldt voor een scherphoekige driehoek. Bij een stompe hoek vallen twee hoogtelijnen buiten de driehoek, en hun snijpunt H dus ook.",
            "precies in hoekpunt Q": "H ligt in een hoekpunt bij een rechte hoek. Wordt de hoek bij Q stomp, dan schuift H naar buiten.",
            "op het midden van PR": "het midden van een zijde hoort bij de zwaartelijn en de middelloodlijn, niet bij het hoogtepunt."
          },
          w: "Stomphoekige driehoek: H ligt buiten.",
          meer: "Scherp: H binnen. Recht: H in het hoekpunt met de rechte hoek. Stomp: H buiten. Bij het zwaartepunt is het anders: Z ligt altijd binnen." },

        { t: "mc", q: "△PQR heeft een stompe hoek bij Q. Welke zijde verleng je om de hoogtelijn door <b>P</b> te tekenen?",
          o: ["QR", "PQ", "PR"], a: "QR",
          fout: {
            "PQ": "PQ gaat door P zelf. De hoogtelijn door P staat loodrecht op de zijde tegenover P, en dat is QR.",
            "PR": "PR gaat ook door P. De overstaande zijde van P is QR: die zijde verleng je voorbij Q."
          },
          w: "De hoogtelijn door P staat loodrecht op de overstaande zijde QR.",
          meer: "Door de stompe hoek bij Q valt de loodlijn uit P naast QR. Verleng QR voorbij Q, dan kun je loodrecht tekenen." },

        { t: "velden", q: "△KLM heeft hoekpunten K(0, 0), L(6, 0) en M(0, 4). Wat is het hoogtepunt H?",
          velden: [ { label: "x van H =", a: "0" }, { label: "y van H =", a: "0" } ],
          w: "Bij K is een rechte hoek: KL ligt op de x-as en KM op de y-as.",
          meer: "KM staat loodrecht op KL, dus KM is de hoogtelijn door M. KL is de hoogtelijn door L. Ze snijden in K(0, 0): het hoogtepunt is het hoekpunt met de rechte hoek." }
      ]
    },
    {
      n: 3, naam: "Goud",
      uitleg: [
        "Is CD een zwaartelijn en ligt D op AB, dan is D het <b>midden</b> van AB. Ken je A en D, dan vind je B door vanuit D nog eens dezelfde stap te zetten.",
        "Voorbeeld: A(1, 3) en D(5, 2). Van A naar D is 4 naar rechts en 1 omlaag. Nog een keer: B(9, 1).",
        "Ken je het zwaartepunt Z en twee hoekpunten? De drie x'en zijn samen 3 keer de x van Z. Zo reken je het derde hoekpunt terug, en net zo met de y'en.",
        "Hoogtelijn in een rooster: ligt AB horizontaal, dan is de hoogtelijn door C de verticale lijn door C. De zwaartelijn door C gaat juist naar het midden van AB."
      ],
      regel: "D midden van AB: B = D + (D − A) · derde hoekpunt: x_C = 3 · x_Z − x_A − x_B (en net zo voor y)",
      voorbeelden: [
        { en: "A(−2, 3), B(4, 1), Z(2, 3) → C(4, 5)", let: "x: 3 · 2 + 2 − 4 = 4. y: 3 · 3 − 3 − 1 = 5." }
      ],
      vragen: [
        { t: "velden", q: "In △PQR is QS een zwaartelijn, met S op zijde PR. P(−1, −2) en S(2, 1). Wat zijn de coördinaten van R?",
          velden: [ { label: "x van R =", a: "5" }, { label: "y van R =", a: "4" } ],
          w: "S is het midden van PR, dus vanuit S nog een keer dezelfde stap als van P naar S.",
          meer: "Van P(−1, −2) naar S(2, 1): 3 naar rechts en 3 omhoog. Nog een keer vanaf S: R(5, 4). Controle: midden van P en R = ((−1 + 5) : 2, (−2 + 4) : 2) = (2, 1) = S." },

        { t: "velden", q: "Van △ABC zijn A(−1, 4) en B(5, 0) hoekpunten. Het zwaartepunt is Z(2, 3). Bereken C.",
          velden: [ { label: "x van C =", a: "2" }, { label: "y van C =", a: "5" } ],
          w: "De drie x'en samen zijn 3 × 2 = 6, de drie y'en samen 3 × 3 = 9.",
          meer: "x: 6 − (−1) − 5 = 2. y: 9 − 4 − 0 = 5. C(2, 5). Controle: ((−1 + 5 + 2) : 3, (4 + 0 + 5) : 3) = (2, 3) = Z." },

        { t: "velden", q: "△ABC met A(0, 0), B(8, 0) en C(2, 6). Waar snijden de <b>hoogtelijn</b> door C en de <b>zwaartelijn</b> door C de x-as?" +
            F({ xmin: -1, xmax: 9, ymin: -1, ymax: 7, rooster: true, assen: true, maxW: 250, maxH: 220, label: "driehoek ABC in een rooster",
              items: [ { t: "poly", p: [[0, 0], [8, 0], [2, 6]], fill: "#fde68a" },
                       { t: "punt", p: [0, 0], label: "A", lp: [-10, -10] }, { t: "punt", p: [8, 0], label: "B", lp: [8, -10] },
                       { t: "punt", p: [2, 6], label: "C", lp: [10, -6] } ] }),
          velden: [ { label: "hoogtelijn door C: x =", a: "2" }, { label: "zwaartelijn door C: x =", a: "4" } ],
          w: "Hoogtelijn: loodrecht op AB, dus recht naar beneden. Zwaartelijn: naar het midden van AB.",
          meer: "AB ligt op de x-as, dus de hoogtelijn door C gaat recht omlaag naar (2, 0). Het midden van AB is (4, 0): daar komt de zwaartelijn uit. Twee verschillende lijnen!" },

        { t: "mc", q: "In △ABC gaat een lijn door C en staat loodrecht op AB, maar komt <b>niet</b> in het midden van AB uit. Welke lijn is dat?",
          o: ["de hoogtelijn door C", "de zwaartelijn door C", "de middelloodlijn van AB", "de bissectrice van ∠C"], a: "de hoogtelijn door C",
          fout: {
            "de zwaartelijn door C": "een zwaartelijn komt juist wél in het midden van AB uit. En hij hoeft niet loodrecht te staan.",
            "de middelloodlijn van AB": "een middelloodlijn gaat altijd door het midden van AB. Deze lijn doet dat niet, dus het is geen middelloodlijn.",
            "de bissectrice van ∠C": "een bissectrice deelt ∠C doormidden. Daar staat niets over loodrecht op AB."
          },
          w: "Door een hoekpunt én loodrecht op de overstaande zijde = hoogtelijn.",
          meer: "De lijnenkaart: door een hoekpunt? Ja. Naar het midden? Nee. Loodrecht? Ja. Dan is het de hoogtelijn." }
      ]
    }
  ]
},

/* ---------------------------------------------------------------- 2.5 */
{
  id: "opp-driehoek", emoji: "✂️", titel: "2.5 Oppervlakte van een driehoek",
  kort: "opp. driehoek = ½ × zijde × bijbehorende hoogte. Zijde en hoogte staan loodrecht op elkaar.",
  niveaus: [
    {
      n: 1, naam: "Brons",
      uitleg: [
        "Knip een rechthoek van 10 bij 6 cm uit. Teken een driehoek met de onderkant als zijde en de top ergens op de bovenkant. Knip de twee hoekstukken eraf: samen bedekken ze de driehoek precies.",
        "De driehoek is dus de <b>helft</b> van de rechthoek: de rechthoek is 10 × 6 = 60 cm², de driehoek 30 cm².",
        "Daarom: <b>oppervlakte driehoek = ½ × zijde × bijbehorende hoogte</b>.",
        "De <b>hoogte</b> bij een zijde loopt vanaf de overstaande top <b>loodrecht</b> naar die zijde. Zijde en hoogte staan altijd loodrecht op elkaar: zoek het hoekje van 90°. Een schuine zijde is géén hoogte.",
        "Vergeet de eenheid niet: cm × cm = cm². Zijn de maten in mm, dan is het antwoord in mm²."
      ],
      regel: "opp. driehoek = ½ × zijde × bijbehorende hoogte (zijde ⊥ hoogte)",
      voorbeelden: [
        { en: "zijde 8 cm, hoogte 5 cm → ½ × 8 × 5 = 20 cm²", let: "Eerst 8 × 5 = 40, dan de helft." },
        { en: "zijde 2,8 cm, hoogte 2,4 cm → ½ × 2,8 × 2,4 = 3,36 cm²", let: "De rekenmachine mag erbij." }
      ],
      vragen: [
        { t: "vb", opgave: "Bereken de oppervlakte van △ABC. (maten in cm)" +
            F({ xmin: -1, xmax: 11, ymin: -1.3, ymax: 7, maxW: 270, maxH: 180, label: "driehoek ABC in een rechthoek van 10 bij 6",
              items: [ { t: "poly", p: [[0, 0], [10, 0], [10, 6], [0, 6]], fill: "#fecaca", op: 0.45, stroke: "grijs", dik: 1.4 },
                       { t: "poly", p: [[0, 0], [10, 0], [6, 6]], fill: "#bfdbfe", op: 0.9 },
                       { t: "seg", a: [6, 6], b: [6, 0], kleur: "rood", dash: true, label: "6", weg: [9, 3] },
                       { t: "haaks", p: [6, 0], u: [1, 0], v: [0, 1] },
                       { t: "seg", a: [0, 0], b: [10, 0], kleur: "ink", label: "10" },
                       { t: "punt", p: [0, 0], label: "A", lp: [-10, 10] }, { t: "punt", p: [10, 0], label: "B", lp: [10, 10] },
                       { t: "punt", p: [6, 6], label: "C", lp: [0, -12] } ] }),
          stappen: [
            { toon: "rechthoek = 10 × 6 = 60 cm²", uitleg: "De driehoek past precies in deze rechthoek." },
            { toon: "de twee rode hoekstukken samen = de blauwe driehoek", uitleg: "Knip ze eraf en schuif ze over de driehoek: ze passen precies." },
            { toon: "opp. △ABC = ½ × 10 × 6 = 30 cm²", uitleg: "De driehoek is de helft van de rechthoek." }
          ],
          waarom: { q: "Waarom is de driehoek precies de helft van de rechthoek?",
            o: ["De twee hoekstukken samen zijn even groot als de driehoek", "Omdat de top precies in het midden van de bovenkant staat", "Omdat een driehoek drie zijden heeft en een rechthoek vier"],
            a: "De twee hoekstukken samen zijn even groot als de driehoek" },
          fout: {
            "Omdat de top precies in het midden van de bovenkant staat": "kijk goed: C staat niet in het midden (op 6 van de 10). Het werkt overal: de hoogte door C verdeelt de rechthoek in twee rechthoeken, en de driehoek is van elk precies de helft.",
            "Omdat een driehoek drie zijden heeft en een rechthoek vier": "dan zou de driehoek driekwart zijn, en dat is niet zo. Het gaat om knippen: de twee hoekstukken bedekken samen precies de driehoek."
          },
          w: "Driehoek + twee hoekstukken = rechthoek, en de hoekstukken zijn samen even groot als de driehoek.",
          meer: "Daarom staat er ½ in de formule. Zonder ½ reken je de hele rechthoek uit (60 in plaats van 30)." },

        { t: "mc", q: "Een driehoek heeft een zijde van 12 cm en de bijbehorende hoogte is 5 cm. Wat is de oppervlakte?",
          o: ["30 cm²", "60 cm²", "17 cm²", "30 cm"], a: "30 cm²",
          fout: {
            "60 cm²": "je vergat de ½. 12 × 5 = 60 is de rechthoek eromheen; de driehoek is de helft: 30 cm².",
            "17 cm²": "je telde 12 + 5 op. Oppervlakte is vermenigvuldigen: ½ × 12 × 5 = 30 cm².",
            "30 cm": "het getal klopt, maar de eenheid niet. Oppervlakte is in cm² (vierkante centimeters), cm is voor een lengte."
          },
          w: "½ × 12 × 5 = 30 cm².",
          meer: "Eerst 12 × 5 = 60, dan de helft: 30. En de eenheid: cm × cm = cm²." },

        { t: "bouw", q: "Bereken de oppervlakte van △PQR in mm². (maten in mm)" +
            F({ xmin: -4, xmax: 46, ymin: -5, ymax: 19, maxW: 300, maxH: 150, label: "driehoek PQR met hoogte RS",
              items: [ { t: "poly", p: [[0, 0], [42, 0], [12, 16]], fill: "#fde68a" },
                       { t: "seg", a: [0, 0], b: [42, 0], kleur: "ink", label: "42" },
                       { t: "seg", a: [0, 0], b: [12, 16], kleur: "ink", label: "20" }, { t: "seg", a: [42, 0], b: [12, 16], kleur: "ink", label: "34" },
                       { t: "seg", a: [12, 16], b: [12, 0], kleur: "rood", dash: true, label: "16", weg: [30, 8] },
                       { t: "haaks", p: [12, 0], u: [1, 0], v: [0, 1] },
                       { t: "punt", p: [0, 0], label: "P", lp: [-10, 8] }, { t: "punt", p: [42, 0], label: "Q", lp: [10, 8] },
                       { t: "punt", p: [12, 16], label: "R", lp: [0, -12] }, { t: "punt", p: [12, 0], label: "S", lp: [-8, 12] } ] }),
          a: "336",
          w: "Zijde PQ = 42 hoort bij hoogte RS = 16 (die staan loodrecht).",
          meer: "½ × 42 × 16 = 336 mm². De schuine zijden 20 en 34 heb je niet nodig." },

        { t: "mc", q: "Welke berekening geeft de oppervlakte van △ABC? (maten in cm)" +
            F({ xmin: -1.5, xmax: 15.5, ymin: -2, ymax: 13.5, maxW: 230, maxH: 190, label: "driehoek ABC met zijden 13, 14, 15 en hoogte 12",
              items: [ { t: "poly", p: [[0, 0], [14, 0], [5, 12]], fill: "#ddd6fe" },
                       { t: "seg", a: [0, 0], b: [14, 0], kleur: "ink", label: "14" },
                       { t: "seg", a: [0, 0], b: [5, 12], kleur: "ink", label: "13" }, { t: "seg", a: [14, 0], b: [5, 12], kleur: "ink", label: "15" },
                       { t: "seg", a: [5, 12], b: [5, 0], kleur: "rood", dash: true, label: "12", weg: [10, 6] },
                       { t: "haaks", p: [5, 0], u: [1, 0], v: [0, 1] },
                       { t: "punt", p: [0, 0], label: "A", lp: [-10, 8] }, { t: "punt", p: [14, 0], label: "B", lp: [10, 8] },
                       { t: "punt", p: [5, 12], label: "C", lp: [0, -12] } ] }),
          o: ["½ × 14 × 12", "½ × 14 × 13", "14 × 12", "½ × 13 × 15"], a: "½ × 14 × 12",
          fout: {
            "½ × 14 × 13": "13 is de schuine zijde AC, niet de hoogte. Schuif de top C evenwijdig aan AB naar rechts: AC wordt langer, maar de driehoek blijft even hoog en even groot. Dus de schuine zijde kan niet in de formule.",
            "14 × 12": "je vergat de ½. 14 × 12 = 168 is de rechthoek eromheen; de driehoek is de helft: 84.",
            "½ × 13 × 15": "13 en 15 zijn allebei schuine zijden. Ze staan niet loodrecht op elkaar, dus het is geen zijde met bijbehorende hoogte."
          },
          w: "Zijde AB = 14 en de bijbehorende hoogte 12 staan loodrecht op elkaar.",
          meer: "½ × 14 × 12 = 84 cm². Kijk altijd naar het hoekje van 90°: dat wijst je de hoogte aan." }
      ]
    },
    {
      n: 2, naam: "Zilver",
      uitleg: [
        "Bij elke zijde hoort een eigen hoogte. Kies een zijde waarvan je de bijbehorende hoogte kent, en gebruik die twee samen. Niet de zijde van de ene en de hoogte van de andere.",
        "<b>Rechthoekige driehoek</b>: de ene rechthoekszijde is de hoogte bij de andere. Opp = ½ × rechthoekszijde × rechthoekszijde. De schuine zijde heb je niet nodig.",
        "<b>Stomphoekige driehoek</b>: de hoogte kan buiten de driehoek vallen, op het <b>verlengde</b> van de zijde. Dat mag gewoon: opp = ½ × zijde × die hoogte. Tel het verlengde stuk níet bij de zijde.",
        "<b>Rooster</b>: zoek een zijde die horizontaal of verticaal ligt. Die tel je zo af, en de hoogte ook: recht omhoog of opzij naar de top, desnoods buiten de driehoek."
      ],
      regel: "zijde en hoogte moeten bij elkaar horen (loodrecht) · de hoogte mag buiten de driehoek liggen",
      voorbeelden: [
        { en: "Rechthoekszijden 36 en 15 mm → ½ × 36 × 15 = 270 mm²", let: "De schuine zijde (39 mm) doet niet mee." },
        { en: "Rooster: A(0, 0), B(7, 4), C(2, 4). BC = 5 horizontaal, hoogte 4 → 10 cm²", let: "De hoogte loopt van A recht omhoog naar het verlengde van BC." }
      ],
      vragen: [
        { t: "mc", q: "△KLM heeft een rechte hoek bij L. Wat is de oppervlakte? (maten in mm)" +
            F({ xmin: -3, xmax: 23, ymin: -4, ymax: 23.5, maxW: 200, maxH: 200, label: "rechthoekige driehoek KLM",
              items: [ { t: "poly", p: [[0, 0], [20, 0], [0, 21]], fill: "#bbf7d0" },
                       { t: "seg", a: [0, 0], b: [20, 0], kleur: "ink", label: "20" }, { t: "seg", a: [0, 0], b: [0, 21], kleur: "ink", label: "21" },
                       { t: "seg", a: [20, 0], b: [0, 21], kleur: "ink", label: "29" }, { t: "haaks", p: [0, 0], u: [1, 0], v: [0, 1] },
                       { t: "punt", p: [0, 0], label: "L", lp: [-10, 10] }, { t: "punt", p: [20, 0], label: "K", lp: [10, 8] },
                       { t: "punt", p: [0, 21], label: "M", lp: [-12, -4] } ] }),
          o: ["210 mm²", "290 mm²", "420 mm²", "304,5 mm²"], a: "210 mm²",
          fout: {
            "290 mm²": "dat is ½ × 20 × 29. Maar 29 is de schuine zijde, die staat niet loodrecht op KL. De hoogte bij KL is LM = 21.",
            "420 mm²": "dat is 20 × 21 zonder de ½. Dat is de rechthoek eromheen; de driehoek is de helft.",
            "304,5 mm²": "dat is ½ × 21 × 29. De schuine zijde 29 hoort niet in de formule: ze staat niet loodrecht op LM."
          },
          w: "Bij een rechte hoek is de ene rechthoekszijde de hoogte bij de andere: ½ × 20 × 21.",
          meer: "½ × 20 × 21 = 210 mm². De schuine zijde 29 is een afleider: die is het langst, maar telt niet mee." },

        { t: "mc", q: "△KLM is stomphoekig. Het verlengde van KL is gestippeld. Wat is de oppervlakte? (maten in mm)" +
            F({ xmin: -1.5, xmax: 18, ymin: -2.6, ymax: 13.5, maxW: 270, maxH: 200, label: "stomphoekige driehoek KLM met hoogte buiten de driehoek",
              items: [ { t: "poly", p: [[0, 0], [11, 0], [16, 12]], fill: "#fed7aa" },
                       { t: "seg", a: [11, 0], b: [16, 0], kleur: "grijs", dash: true, label: "5", weg: [13, 5] },
                       { t: "seg", a: [0, 0], b: [11, 0], kleur: "ink", label: "11", weg: [6, 5] },
                       { t: "seg", a: [11, 0], b: [16, 12], kleur: "ink", label: "13", weg: [16, 0] },
                       { t: "seg", a: [0, 0], b: [16, 12], kleur: "ink", label: "20" },
                       { t: "seg", a: [16, 12], b: [16, 0], kleur: "rood", dash: true, label: "12", weg: [10, 6] },
                       { t: "haaks", p: [16, 0], u: [-1, 0], v: [0, 1] },
                       { t: "punt", p: [0, 0], label: "K", lp: [-10, 8] }, { t: "punt", p: [11, 0], label: "L", lp: [-4, 13] },
                       { t: "punt", p: [16, 12], label: "M", lp: [0, -12] }, { t: "punt", p: [16, 0], label: "N", lp: [10, 10] } ] }),
          o: ["66 mm²", "96 mm²", "130 mm²", "132 mm²"], a: "66 mm²",
          fout: {
            "96 mm²": "dat is ½ × 16 × 12. Je telde het gestippelde verlengde (5) bij de zijde. De zijde KL is maar 11; het verlengde is alleen nodig om de hoogte te tekenen.",
            "130 mm²": "dat is ½ × 13 × 20: twee schuine zijden. Die staan niet loodrecht op elkaar, dus geen zijde met bijbehorende hoogte.",
            "132 mm²": "dat is 11 × 12 zonder de ½. De driehoek is maar de helft daarvan: 66."
          },
          w: "Zijde KL = 11 met hoogte MN = 12 (buiten de driehoek): ½ × 11 × 12 = 66.",
          meer: "Bij een stomphoekige driehoek valt de hoogte buiten de driehoek, op het verlengde van KL. De zijde blijft 11." },

        { t: "bouw", q: "De roostervierkantjes zijn 1 bij 1 cm. Bereken de oppervlakte van △ABC in cm²." +
            F({ xmin: 0, xmax: 8, ymin: 0, ymax: 4, rooster: true, pad: 16, maxW: 260, maxH: 140, label: "driehoek ABC in een rooster",
              items: [ { t: "poly", p: [[0, 0], [4, 0], [7, 3]], fill: "#fca5a5" },
                       { t: "punt", p: [0, 0], label: "A", lp: [-4, -12] }, { t: "punt", p: [4, 0], label: "B", lp: [0, -12] },
                       { t: "punt", p: [7, 3], label: "C", lp: [10, -6] } ] }),
          a: "6",
          w: "Zijde AB = 4 (horizontaal). De hoogte gaat van C recht omlaag naar het verlengde van AB: 3.",
          meer: "½ × 4 × 3 = 6 cm². De hoogte ligt buiten de driehoek, bij x = 7. Dat mag: de driehoek is een stomphoekige." },

        { t: "mc", q: "In △ABC is AB = 10, BC = 8, CD = 6 de hoogte bij AB en AE = 7,5 de hoogte bij BC. Welke berekening is goed?",
          o: ["½ × AB × CD", "½ × AB × AE", "½ × BC × CD", "½ × AB × BC"], a: "½ × AB × CD",
          fout: {
            "½ × AB × AE": "AE staat loodrecht op BC, niet op AB. Reken maar: ½ × 10 × 7,5 = 37,5, terwijl de echte oppervlakte ½ × 10 × 6 = 30 is.",
            "½ × BC × CD": "CD hoort bij AB, niet bij BC. Dat geeft ½ × 8 × 6 = 24 in plaats van 30.",
            "½ × AB × BC": "dat zijn twee zijden, geen zijde met hoogte. ½ × 10 × 8 = 40, en dat klopt niet (30)."
          },
          w: "Bij zijde AB hoort hoogte CD: ½ × 10 × 6 = 30.",
          meer: "Ook goed was ½ × BC × AE = ½ × 8 × 7,5 = 30. Zelfde uitkomst, want het is dezelfde driehoek. Een zijde en een hoogte die níet bij elkaar horen, geven een ander getal." }
      ]
    },
    {
      n: 3, naam: "Goud",
      uitleg: [
        "Ken je de oppervlakte en de zijde? Dan reken je terug: <b>hoogte = 2 × opp : zijde</b>. Want ½ × zijde × hoogte = opp, dus zijde × hoogte = 2 × opp.",
        "Voorbeeld: AB = 10 cm en opp = 30 cm². Dan is 10 × hoogte = 60, dus hoogte = 6 cm.",
        "Een tweede hoogte vinden: reken eerst de oppervlakte uit met een zijde en hoogte die je kent. Reken daarna terug met de andere zijde.",
        "Context: een driehoekige bandana van 70 cm breed en 35 cm hoog kost ½ × 70 × 35 = 1225 cm² stof."
      ],
      regel: "hoogte = 2 × opp : zijde · zijde = 2 × opp : hoogte",
      voorbeelden: [
        { en: "opp = 240 mm², zijde AC = 30 mm → hoogte bij AC = 2 × 240 : 30 = 16 mm", let: "Eerst verdubbelen, dan delen." }
      ],
      vragen: [
        { t: "vb", opgave: "Van △ABC is AB = 10 cm en de oppervlakte 30 cm². Bereken de hoogte die bij AB hoort.",
          stappen: [
            { toon: "½ × 10 × h = 30", uitleg: "Vul in wat je weet in de formule." },
            { toon: "10 × h = 60", uitleg: "Beide kanten keer 2: de ½ is weg." },
            { toon: "h = 60 : 10 = 6 cm", uitleg: "Delen door de zijde." }
          ],
          waarom: { q: "Waarom doe je eerst keer 2?",
            o: ["Om de ½ uit de formule weg te werken", "Omdat een driehoek twee hoogtes heeft", "Omdat je bij oppervlakte altijd met 2 begint"],
            a: "Om de ½ uit de formule weg te werken" },
          fout: {
            "Omdat een driehoek twee hoogtes heeft": "een driehoek heeft er zelfs drie, bij elke zijde één. Het keer 2 komt van de ½ in de formule: ½ × 10 × h = 30 betekent 10 × h = 60.",
            "Omdat je bij oppervlakte altijd met 2 begint": "bij een parallellogram is er geen ½, en daar doe je dus ook geen keer 2. Hier haal je de ½ weg."
          },
          w: "Keer 2 maakt de ½ ongedaan. Dan delen door de zijde.",
          meer: "Controle: ½ × 10 × 6 = 30. Klopt." },

        { t: "bouw", q: "Een driehoekige sjaal heeft een lange zijde van 90 cm. De oppervlakte is 1800 cm². Hoeveel cm is de hoogte bij die zijde?", a: "40",
          w: "hoogte = 2 × opp : zijde = 3600 : 90.",
          meer: "2 × 1800 = 3600 en 3600 : 90 = 40 cm. Controle: ½ × 90 × 40 = 1800." },

        { t: "velden", q: "In △ABC is BC = 18 mm en de hoogte bij BC is 20 mm. Verder is AC = 24 mm. Bereken de oppervlakte en de hoogte bij AC.",
          velden: [ { label: "oppervlakte (mm²) =", a: "180" }, { label: "hoogte bij AC (mm) =", a: "15" } ],
          w: "Eerst de oppervlakte met BC en zijn hoogte, dan terugrekenen met AC.",
          meer: "opp = ½ × 18 × 20 = 180 mm². Hoogte bij AC: 2 × 180 = 360, en 360 : 24 = 15 mm." },

        { t: "mc", q: "De voorkant van een tentje is een driehoek van 1,2 m breed en 1,5 m hoog. Hoeveel tentdoek is dat?",
          o: ["0,9 m²", "1,8 m²", "2,7 m²", "0,9 m"], a: "0,9 m²",
          fout: {
            "1,8 m²": "je vergat de ½. 1,2 × 1,5 = 1,8 is een rechthoek; de driehoek is de helft: 0,9 m².",
            "2,7 m²": "je telde 1,2 + 1,5 op. Oppervlakte is vermenigvuldigen: ½ × 1,2 × 1,5 = 0,9 m².",
            "0,9 m": "het getal klopt, maar oppervlakte is in m², niet in m."
          },
          w: "½ × 1,2 × 1,5 = 0,9 m².",
          meer: "Eerst 1,2 × 1,5 = 1,8, dan de helft: 0,9. Meters keer meters = m²." }
      ]
    }
  ]
},

/* ---------------------------------------------------------------- 2.6 A + B */
{
  id: "opp-vierhoek", emoji: "▱", titel: "2.6 Parallellogram, trapezium en ruit", video: "opp-driehoek",
  kort: "Parallellogram: zijde × hoogte. Trapezium: ½ × (som evenwijdige zijden) × hoogte. Ruit: ½ × d₁ × d₂.",
  niveaus: [
    {
      n: 1, naam: "Brons",
      uitleg: [
        "Een <b>parallellogram</b> is een vierhoek waarvan de overstaande zijden even lang en evenwijdig zijn. Knip er links een driehoekje af en leg het rechts aan: je krijgt een rechthoek.",
        "Daarom: <b>opp. parallellogram = zijde × bijbehorende hoogte</b>. Geen ½! En niet de schuine zijde: duw je het parallellogram scheever, dan wordt de schuine zijde langer, maar de oppervlakte blijft gelijk.",
        "Een <b>trapezium</b> is een vierhoek met één paar evenwijdige zijden. Leg twee dezelfde trapezia omgekeerd tegen elkaar: samen vormen ze een parallellogram met zijde (a + b).",
        "Daarom: <b>opp. trapezium = ½ × (som van de evenwijdige zijden) × hoogte</b>."
      ],
      regel: "parallellogram: zijde × hoogte · trapezium: ½ × (a + b) × hoogte",
      voorbeelden: [
        { en: "parallellogram met zijde 35 mm en hoogte 20 mm → 700 mm²", let: "De schuine zijde (22,4 mm) doet niet mee." },
        { en: "trapezium met evenwijdige zijden 20 en 40 mm, hoogte 15 mm → ½ × 60 × 15 = 450 mm²", let: "Eerst optellen, dan keer de hoogte, dan de helft." }
      ],
      vragen: [
        { t: "mc", q: "Bereken de oppervlakte van parallellogram ABCD. (maten in mm)" +
            F({ xmin: -3, xmax: 53, ymin: -5, ymax: 24, maxW: 300, maxH: 160, label: "parallellogram ABCD met hoogte DE",
              items: [ { t: "poly", p: [[0, 0], [35, 0], [50, 20], [15, 20]], fill: "#c7d2fe" },
                       { t: "seg", a: [0, 0], b: [35, 0], kleur: "ink", label: "35" }, { t: "seg", a: [0, 0], b: [15, 20], kleur: "ink", label: "25" },
                       { t: "seg", a: [15, 20], b: [15, 0], kleur: "rood", dash: true, label: "20", weg: [30, 10] },
                       { t: "haaks", p: [15, 0], u: [1, 0], v: [0, 1] },
                       { t: "punt", p: [0, 0], label: "A", lp: [-10, 8] }, { t: "punt", p: [35, 0], label: "B", lp: [10, 8] },
                       { t: "punt", p: [50, 20], label: "C", lp: [10, -6] }, { t: "punt", p: [15, 20], label: "D", lp: [-8, -10] },
                       { t: "punt", p: [15, 0], label: "E", lp: [-11, -10] } ] }),
          o: ["700 mm²", "875 mm²", "350 mm²", "120 mm²"], a: "700 mm²",
          fout: {
            "875 mm²": "dat is 35 × 25, met de schuine zijde AD. Dat deed Amir in het boek ook. Duw het parallellogram scheef: AD wordt langer, maar de oppervlakte blijft gelijk. Je hebt de hoogte DE = 20 nodig.",
            "350 mm²": "dat is ½ × 35 × 20. Bij een parallellogram is er geen ½: het is een rechthoek als je het driehoekje verschuift.",
            "120 mm²": "dat is de omtrek: 35 + 25 + 35 + 25 = 120 mm. Oppervlakte is de binnenkant: zijde × hoogte."
          },
          w: "Zijde AB = 35 met hoogte DE = 20: 35 × 20 = 700 mm².",
          meer: "Knip △AED af en leg het rechts tegen BC: je krijgt een rechthoek van 35 bij 20." },

        { t: "vb", opgave: "Trapezium ABCD: AB = 40 mm en DC = 20 mm zijn evenwijdig, de hoogte is 15 mm. Bereken de oppervlakte.",
          stappen: [
            { toon: "som van de evenwijdige zijden = 40 + 20 = 60", uitleg: "Tel de twee evenwijdige zijden op." },
            { toon: "60 × 15 = 900", uitleg: "Dat is het parallellogram van twee trapezia samen." },
            { toon: "½ × 900 = 450 mm²", uitleg: "Eén trapezium is de helft." }
          ],
          waarom: { q: "Waarom staat er ½ in de formule van het trapezium?",
            o: ["Twee trapezia samen vormen een parallellogram", "Omdat een trapezium half zo groot is als een rechthoek", "Omdat je het gemiddelde van de hoogte neemt"],
            a: "Twee trapezia samen vormen een parallellogram" },
          fout: {
            "Omdat een trapezium half zo groot is als een rechthoek": "een trapezium van 40 en 20 met hoogte 15 is 450, en een rechthoek van 40 bij 15 is 600. Geen helft. De ½ komt van de twee trapezia die samen een parallellogram vormen.",
            "Omdat je het gemiddelde van de hoogte neemt": "de hoogte is overal 15. Je neemt het gemiddelde van de evenwijdige zijden: (40 + 20) : 2 = 30, en 30 × 15 = 450."
          },
          w: "Twee trapezia vormen een parallellogram met zijde 40 + 20 = 60. Eén trapezium is de helft.",
          meer: "½ × (40 + 20) × 15 = ½ × 60 × 15 = 450 mm²." },

        { t: "bouw", q: "Bereken de oppervlakte van trapezium PQRS in mm². (maten in mm)" +
            F({ xmin: -3, xmax: 34, ymin: -5, ymax: 20, maxW: 260, maxH: 160, label: "trapezium PQRS met rechte hoeken bij Q en R",
              items: [ { t: "poly", p: [[0, 0], [30, 0], [30, 16], [12, 16]], fill: "#bae6fd" },
                       { t: "seg", a: [0, 0], b: [30, 0], kleur: "ink", label: "30" }, { t: "seg", a: [12, 16], b: [30, 16], kleur: "ink", label: "18" },
                       { t: "seg", a: [30, 0], b: [30, 16], kleur: "ink", label: "16" }, { t: "seg", a: [0, 0], b: [12, 16], kleur: "ink", label: "20" },
                       { t: "haaks", p: [30, 0], u: [-1, 0], v: [0, 1] }, { t: "haaks", p: [30, 16], u: [-1, 0], v: [0, -1] },
                       { t: "punt", p: [0, 0], label: "P", lp: [-10, 8] }, { t: "punt", p: [30, 0], label: "Q", lp: [10, 8] },
                       { t: "punt", p: [30, 16], label: "R", lp: [10, -6] }, { t: "punt", p: [12, 16], label: "S", lp: [-8, -10] } ] }),
          a: "384",
          w: "Evenwijdig zijn PQ = 30 en SR = 18. De hoogte is QR = 16.",
          meer: "½ × (30 + 18) × 16 = ½ × 48 × 16 = 384 mm². De schuine zijde PS = 20 heb je niet nodig." },

        { t: "mc", q: "Een trapezium heeft evenwijdige zijden 28 en 54 mm en hoogte 24 mm. Welke berekening is goed?",
          o: ["½ × (28 + 54) × 24", "½ × 28 × 54 × 24", "(28 + 54) × 24", "½ × 28 × 24 + 54"], a: "½ × (28 + 54) × 24",
          fout: {
            "½ × 28 × 54 × 24": "dan vermenigvuldig je de zijden: 18 144 mm². Dat is groter dan een rechthoek van 54 bij 24 (1296). Onmogelijk, want het trapezium past daarin. De zijden moet je optellen.",
            "(28 + 54) × 24": "je vergat de ½. (28 + 54) × 24 = 1968 zijn twee trapezia samen. Eén is 984.",
            "½ × 28 × 24 + 54": "de 54 kun je niet zomaar optellen bij een oppervlakte: 54 is een lengte. Tel eerst de evenwijdige zijden op, dan × hoogte, dan de helft."
          },
          w: "½ × som evenwijdige zijden × hoogte = ½ × 82 × 24 = 984 mm².",
          meer: "Optellen binnen de haakjes, niet vermenigvuldigen. 28 + 54 = 82, 82 × 24 = 1968, de helft is 984." }
      ]
    },
    {
      n: 2, naam: "Zilver",
      uitleg: [
        "Een <b>ruit</b> heeft vier gelijke zijden. De diagonalen delen elkaar middendoor en staan loodrecht op elkaar.",
        "Diagonaal d₁ verdeelt de ruit in twee driehoeken met zijde d₁ en hoogte ½d₂. Samen: <b>opp. ruit = ½ × d₁ × d₂</b>. Dat is de helft van de rechthoek om de ruit heen.",
        "Bij een parallellogram hoort bij elke zijde een eigen hoogte. Overstaande zijden zijn even lang, dus de hoogte bij BC hoort ook bij AD.",
        "Eenheden: mm × mm = mm², cm × cm = cm², m × m = m². Omrekenen: 1 cm² = 10 × 10 = 100 mm² en 1 m² = 100 × 100 = 10 000 cm²."
      ],
      regel: "ruit: ½ × d₁ × d₂ · 1 cm² = 100 mm² · 1 m² = 10 000 cm²",
      voorbeelden: [
        { en: "ruit met diagonalen 18 cm en 10 cm → ½ × 18 × 10 = 90 cm²", let: "De helft van de rechthoek van 18 bij 10." },
        { en: "2500 cm² = 0,25 m²", let: "Delen door 10 000." }
      ],
      vragen: [
        { t: "mc", q: "Ruit PQRS heeft diagonalen PR = 24 cm en QS = 8 cm. Wat is de oppervlakte?",
          o: ["96 cm²", "192 cm²", "32 cm²", "48 cm²"], a: "96 cm²",
          fout: {
            "192 cm²": "dat is 24 × 8 zonder de ½. Dat is de rechthoek om de ruit heen; de ruit vult precies de helft.",
            "32 cm²": "je telde 24 + 8 op. Oppervlakte is vermenigvuldigen: ½ × 24 × 8 = 96 cm².",
            "48 cm²": "je halveerde twee keer: ½ × 12 × 8. De formule halveert maar één keer: ½ × 24 × 8 = 96."
          },
          w: "½ × d₁ × d₂ = ½ × 24 × 8 = 96 cm².",
          meer: "Diagonaal PR verdeelt de ruit in twee driehoeken met zijde 24 en hoogte 4: 2 × ½ × 24 × 4 = 96." },

        { t: "mc", q: "Een parallellogram heeft zijde 12 cm en bijbehorende hoogte 7 cm. Welk antwoord is <b>helemaal</b> goed?",
          o: ["84 cm²", "84 cm", "84", "42 cm²"], a: "84 cm²",
          fout: {
            "84 cm": "het getal klopt, maar cm is een lengte. Oppervlakte is cm × cm = cm².",
            "84": "zonder eenheid weet niemand of het 84 cm², 84 mm² of 84 m² is. Op een toets kost dat een punt.",
            "42 cm²": "je deed ½ × 12 × 7. Bij een parallellogram is er geen ½: 12 × 7 = 84."
          },
          w: "12 × 7 = 84, en cm × cm = cm².",
          meer: "Getal én eenheid: 84 cm². Zet de eenheid er altijd achter." },

        { t: "bouw", q: "Een tafelkleed heeft een oppervlakte van 2500 cm². Hoeveel m² is dat?", a: "0,25",
          w: "1 m² = 100 cm × 100 cm = 10 000 cm².",
          meer: "2500 : 10 000 = 0,25 m². Een veelgemaakte fout is delen door 100 (dan krijg je 25 m², zo groot als een kamer)." },

        { t: "mc", q: "Bereken de oppervlakte van parallellogram ABCD. Van AB is de lengte niet gegeven. (maten in mm)" +
            F({ xmin: -3, xmax: 46, ymin: -5, ymax: 27.5, maxW: 290, maxH: 190, label: "parallellogram ABCD met twee hoogtes",
              items: [ { t: "poly", p: [[0, 0], [32.5, 0], [42.5, 24], [10, 24]], fill: "#fde68a" },
                       { t: "seg", a: [0, 0], b: [10, 24], kleur: "ink", label: "26" },
                       { t: "seg", a: [10, 24], b: [10, 0], kleur: "rood", dash: true, label: "24", weg: [0, 12] },
                       { t: "haaks", p: [10, 0], u: [1, 0], v: [0, 1] },
                       { t: "seg", a: [10, 24], b: [32.5 + 67.5 / 13, 162 / 13], kleur: "blauw", dash: true, label: "30", weg: [32, 26] },
                       { t: "haaks", p: [32.5 + 67.5 / 13, 162 / 13], u: [-10, -24], v: [-24, 10], kleur: "blauw" },
                       { t: "punt", p: [0, 0], label: "A", lp: [-10, 8] }, { t: "punt", p: [32.5, 0], label: "B", lp: [10, 8] },
                       { t: "punt", p: [42.5, 24], label: "C", lp: [10, -6] }, { t: "punt", p: [10, 24], label: "D", lp: [-8, -10] },
                       { t: "punt", p: [10, 0], label: "E", lp: [0, 13] }, { t: "punt", p: [32.5 + 67.5 / 13, 162 / 13], label: "F", kleur: "blauw", lp: [12, 2] } ] }),
          o: ["26 × 30 = 780 mm²", "26 × 24 = 624 mm²", "½ × 26 × 30 = 390 mm²", "24 × 30 = 720 mm²"], a: "26 × 30 = 780 mm²",
          fout: {
            "26 × 24 = 624 mm²": "24 is de hoogte bij AB (DE staat loodrecht op AB), niet bij AD. Bij zijde AD (en BC, die even lang is) hoort hoogte DF = 30.",
            "½ × 26 × 30 = 390 mm²": "bij een parallellogram is er geen ½. Dat zou maar de driehoek ABD zijn.",
            "24 × 30 = 720 mm²": "dat zijn twee hoogtes, geen zijde. 24 en 30 staan niet eens loodrecht op elkaar."
          },
          w: "BC = AD = 26 en de hoogte bij BC is DF = 30. 26 × 30 = 780 mm².",
          meer: "AB weet je niet, dus gebruik je de zijde die je wél weet (AD = BC = 26) met zijn eigen hoogte (30). Controle: AB = 780 : 24 = 32,5 mm." }
      ]
    },
    {
      n: 3, naam: "Goud",
      uitleg: [
        "Terugrekenen werkt net als bij de driehoek: vul in wat je weet en reken het ontbrekende stuk uit.",
        "Trapezium: AB = 10, CD = 6 en opp = 68. Dan ½ × 16 × h = 68, dus 8 × h = 68 en h = 8,5.",
        "Ruit: opp = 120 cm² en d₁ = 20 cm. Dan ½ × 20 × d₂ = 120, dus 10 × d₂ = 120 en d₂ = 12 cm.",
        "Parallellogram met twee hoogtes: reken de oppervlakte uit met het paar dat je kent, en deel door de andere zijde."
      ],
      regel: "Vul de formule in met wat je weet en los op wat ontbreekt.",
      voorbeelden: [
        { en: "parallellogram: SR = 4 en hoogte bij SR 2,4 → opp 9,6. PS = 3 → hoogte bij PS = 9,6 : 3 = 3,2", let: "Zelfde oppervlakte, andere zijde." }
      ],
      vragen: [
        { t: "stap", opgave: "Een trapezium heeft evenwijdige zijden van 12 cm en 8 cm. De oppervlakte is 90 cm². Bereken de hoogte.",
          stappen: [
            { prompt: "Hoeveel is de som van de evenwijdige zijden?", a: "20", hints: ["Tel de twee evenwijdige zijden op.", "12 + 8 = 20"] },
            { prompt: "Hoeveel is ½ × die som?", a: "10", hints: ["De helft van 20.", "½ × 20 = 10, dus 10 × h = 90"] },
            { prompt: "Hoe groot is de hoogte (cm)?", a: "9", hints: ["10 × h = 90", "h = 90 : 10 = 9"] }
          ],
          w: "½ × (12 + 8) × h = 90, dus 10 × h = 90.",
          meer: "h = 90 : 10 = 9 cm. Controle: ½ × 20 × 9 = 90." },

        { t: "bouw", q: "Van trapezium PQRS is PS evenwijdig met QR. QR = 9 cm, de hoogte is 6 cm en de oppervlakte 42 cm². Hoeveel cm is PS?", a: "5",
          w: "½ × (9 + PS) × 6 = 42, dus (9 + PS) × 3 = 42.",
          meer: "9 + PS = 42 : 3 = 14, dus PS = 5 cm. Controle: ½ × (9 + 5) × 6 = 42." },

        { t: "bouw", q: "Een ruitvormige vlieger heeft een diagonaal van 60 cm en een oppervlakte van 1500 cm². Hoeveel cm is de andere diagonaal?", a: "50",
          w: "½ × 60 × d = 1500, dus 30 × d = 1500.",
          meer: "d = 1500 : 30 = 50 cm. Controle: ½ × 60 × 50 = 1500." },

        { t: "mc", q: "Een raam heeft de vorm van een trapezium: onder 1,2 m, boven 0,8 m en de hoogte is 1,5 m. Glas kost € 40 per m². Wat kost het glas?",
          o: ["€ 60", "€ 120", "€ 28,80", "€ 140"], a: "€ 60",
          fout: {
            "€ 120": "je vergat de ½: (1,2 + 0,8) × 1,5 = 3 m² is twee ramen. Eén raam is 1,5 m², en 1,5 × 40 = € 60.",
            "€ 28,80": "je vermenigvuldigde de zijden: ½ × 1,2 × 0,8 × 1,5 = 0,72 m². Bij een trapezium tel je de evenwijdige zijden op: ½ × (1,2 + 0,8) × 1,5 = 1,5 m².",
            "€ 140": "je telde 1,2 + 0,8 + 1,5 = 3,5 op en deed dat keer 40. Dat is geen oppervlakte. Eerst de oppervlakte: 1,5 m²."
          },
          w: "opp = ½ × (1,2 + 0,8) × 1,5 = 1,5 m², en 1,5 × € 40 = € 60.",
          meer: "Eerst de oppervlakte, dan pas de prijs. ½ × 2 × 1,5 = 1,5 m²." }
      ]
    }
  ]
},

/* ---------------------------------------------------------------- 2.6 C */
{
  id: "opp-samengesteld", emoji: "🏠", titel: "2.6 Samengestelde figuren", video: "opp-driehoek",
  kort: "Splitsen in rechthoeken en driehoeken (optellen) of aanvullen tot een rechthoek (aftrekken).",
  niveaus: [
    {
      n: 1, naam: "Brons",
      uitleg: [
        "Veel figuren zijn gemaakt van rechthoeken en driehoeken. Een huisje is een rechthoek met een driehoekig dak erop.",
        "<b>Splitsen</b>: knip de figuur in stukken waarvan je de oppervlakte kent. Reken elk stuk uit en tel op.",
        "Tel geen stuk dubbel: het dak begint pas waar de rechthoek ophoudt.",
        "Oppervlakte is iets anders dan omtrek. De omtrek is de rand (in cm), de oppervlakte de binnenkant (in cm²)."
      ],
      regel: "splitsen: opp. figuur = opp. stuk I + opp. stuk II + ...",
      voorbeelden: [
        { en: "Huisje: rechthoek 4 × 1 en dak met zijde 4 en hoogte 1 → 4 + 2 = 6 cm²", let: "Het dak is ½ × 4 × 1 = 2." }
      ],
      vragen: [
        { t: "stap", opgave: "Bereken de oppervlakte van het huisje. (maten in mm)" +
            F({ xmin: -4, xmax: 34, ymin: -4.5, ymax: 28, maxW: 230, maxH: 200, label: "huisje: rechthoek met driehoekig dak",
              items: [ { t: "poly", p: [[0, 0], [30, 0], [30, 16], [12, 25], [0, 16]], fill: "#fecdd3" },
                       { t: "seg", a: [0, 16], b: [30, 16], kleur: "grijs", dash: true, dik: 1.4 },
                       { t: "seg", a: [0, 0], b: [30, 0], kleur: "ink", label: "30" }, { t: "seg", a: [0, 0], b: [0, 16], kleur: "ink", label: "16" },
                       { t: "seg", a: [12, 25], b: [12, 16], kleur: "rood", dash: true, label: "9", weg: [20, 22] },
                       { t: "haaks", p: [12, 16], u: [1, 0], v: [0, 1] } ] }),
          stappen: [
            { prompt: "Oppervlakte van de rechthoek (mm²)?", a: "480", hints: ["De rechthoek is 30 breed en 16 hoog.", "30 × 16 = 480"] },
            { prompt: "Oppervlakte van het dak (mm²)?", a: "135", hints: ["Het dak is een driehoek met zijde 30 en hoogte 9.", "½ × 30 × 9 = 135"] },
            { prompt: "Oppervlakte van het hele huisje (mm²)?", a: "615", hints: ["Tel de twee stukken op.", "480 + 135 = 615"] }
          ],
          w: "Splitsen: rechthoek + driehoek.",
          meer: "30 × 16 = 480 en ½ × 30 × 9 = 135. Samen 615 mm². Het dak heeft dezelfde zijde (30) als de rechthoek." },

        { t: "mc", q: "Storm wil weten hoeveel stof ze nodig heeft voor een vlag. Wat moet ze uitrekenen?",
          o: ["de oppervlakte (in cm²)", "de omtrek (in cm)", "alle zijden bij elkaar opgeteld (in cm²)", "alleen de langste zijde (in cm)"], a: "de oppervlakte (in cm²)",
          fout: {
            "de omtrek (in cm)": "de omtrek is de rand. Die heb je nodig voor een zoom of een lint eromheen, niet voor de stof zelf.",
            "alle zijden bij elkaar opgeteld (in cm²)": "zijden optellen geeft de omtrek, en die is in cm. Een vlag van 3 bij 2 heeft omtrek 10 cm maar oppervlakte 6 cm².",
            "alleen de langste zijde (in cm)": "met één zijde weet je niet hoe groot de lap is. Een vlag van 100 bij 10 en een van 100 bij 60 hebben dezelfde langste zijde."
          },
          w: "Stof gaat over de binnenkant, en dat is oppervlakte.",
          meer: "Oppervlakte in cm² (of m²), omtrek in cm (of m). Twee verschillende dingen." },

        { t: "mc", q: "Wat is de oppervlakte van deze L-vorm? (maten in cm)" + L_FIG,
          o: ["42 cm²", "62 cm²", "48 cm²", "28 cm²"], a: "42 cm²",
          fout: {
            "62 cm²": "je rekende 8 × 4 + 5 × 6 = 32 + 30. Maar dan tel je het stuk linksonder (5 bij 4) twee keer. Splits zo dat de stukken niet overlappen: 8 × 4 + 5 × 2 = 42.",
            "48 cm²": "dat is 8 × 6, de hele rechthoek. Maar rechtsboven ontbreekt een stuk van 3 bij 2 = 6. Dus 48 − 6 = 42.",
            "28 cm²": "dat is de omtrek: 8 + 4 + 3 + 2 + 5 + 6 = 28 cm. De oppervlakte is de binnenkant."
          },
          w: "Splitsen: onderste strook 8 × 4 = 32 en bovenste stuk 5 × 2 = 10. Samen 42 cm².",
          meer: "Of aanvullen: 8 × 6 = 48, min het ontbrekende hoekje 3 × 2 = 6, is 42 cm². Allebei goed." },

        { t: "bouw", q: "Een figuur bestaat uit een vierkant van 5 bij 5 cm met daarop een driehoek met zijde 5 cm en hoogte 3 cm. Hoeveel cm² is de figuur?", a: "32,5",
          w: "Splitsen: vierkant + driehoek.",
          meer: "5 × 5 = 25 en ½ × 5 × 3 = 7,5. Samen 32,5 cm²." }
      ]
    },
    {
      n: 2, naam: "Zilver",
      uitleg: [
        "Soms is <b>aanvullen</b> handiger: maak er een grote rechthoek van en trek af wat er te veel is.",
        "De zeshoek uit het boek: rechthoek 5 × 3 = 15, min een driehoekje ½ × 3 × 1 = 1,5. Samen 13,5 cm². Splitsen geeft hetzelfde: 6 + 1,5 + 6 = 13,5.",
        "Allebei mag, het antwoord is gelijk. Kies wat het minste rekenwerk geeft.",
        "Ontbrekende maten haal je uit de andere maten: is de hele breedte 8 en het bovenste stuk 5, dan is het stukje ernaast 3."
      ],
      regel: "aanvullen: opp. figuur = opp. grote rechthoek − opp. wat eraf moet",
      voorbeelden: [
        { en: "L-vorm 8 × 6 met een hoekje van 3 × 2 eruit → 48 − 6 = 42 cm²", let: "Splitsen: 8 × 4 + 5 × 2 = 32 + 10 = 42." }
      ],
      vragen: [
        { t: "velden", q: "Bereken de oppervlakte van de vijfhoek door aan te vullen tot een rechthoek." + ZESHOEK_FIG,
          velden: [ { label: "grote rechthoek (cm²) =", a: "60" }, { label: "driehoekje dat eraf moet (cm²) =", a: "6" }, { label: "vijfhoek (cm²) =", a: "54" } ],
          w: "Rechthoek 10 × 6, min het driehoekje rechtsboven.",
          meer: "Het driehoekje is 10 − 6 = 4 breed en 6 − 3 = 3 hoog: ½ × 4 × 3 = 6. Dus 60 − 6 = 54 cm²." },

        { t: "mc", q: "Welke berekening geeft de oppervlakte van deze vijfhoek? (maten in cm)" + ZESHOEK_FIG,
          o: ["10 × 6 − ½ × 4 × 3", "10 × 6 − 4 × 3", "10 × 6 + ½ × 4 × 3", "6 × 6 + ½ × 4 × 3"], a: "10 × 6 − ½ × 4 × 3",
          fout: {
            "10 × 6 − 4 × 3": "het stuk dat eraf moet is een driehoek, geen rechthoek. Zonder ½ haal je er 12 af in plaats van 6, en kom je op 48 in plaats van 54.",
            "10 × 6 + ½ × 4 × 3": "het driehoekje zit niet in de vijfhoek, het hoort bij de rechthoek eromheen. Dus aftrekken, niet optellen.",
            "6 × 6 + ½ × 4 × 3": "links klopt (6 × 6 = 36), maar het rechterstuk is geen driehoek van 4 bij 3. Het is een trapezium: ½ × (6 + 3) × 4 = 18. Samen 54, niet 42."
          },
          w: "Aanvullen: grote rechthoek 10 × 6 = 60, min het driehoekje ½ × 4 × 3 = 6.",
          meer: "60 − 6 = 54 cm². Splitsen kan ook: 6 × 6 + ½ × (6 + 3) × 4 = 36 + 18 = 54." },

        { t: "mc", q: "Iemand berekent de oppervlakte van deze L-vorm als 8 × 4 + 5 × 6. Wat gaat er mis?" + L_FIG,
          o: ["Het stuk van 5 bij 4 is dubbel geteld", "De ½ is vergeten", "De eenheid is vergeten", "Er gaat niets mis"], a: "Het stuk van 5 bij 4 is dubbel geteld",
          fout: {
            "De ½ is vergeten": "er zitten hier alleen rechthoeken in, dus geen ½ nodig. Het probleem is dat de twee stukken over elkaar heen liggen.",
            "De eenheid is vergeten": "dat kan ook nog misgaan, maar het getal klopt niet eens: 8 × 4 + 5 × 6 = 62, terwijl de figuur 42 is.",
            "Er gaat niets mis": "reken na: 8 × 4 + 5 × 6 = 62. Maar de hele rechthoek 8 × 6 is maar 48, en daar ontbreekt nog een hoekje. 62 kan dus niet."
          },
          w: "De strook 8 × 4 en de strook 5 × 6 overlappen in een stuk van 5 bij 4 = 20.",
          meer: "62 − 20 = 42 cm². Splits zo dat stukken elkaar niet raken: 8 × 4 + 5 × 2 = 42." },

        { t: "bouw", q: "Een vloer is een rechthoek van 6 m bij 4 m, met aan de buitenkant een rechthoekige nis van 2 m bij 1,5 m. Hoeveel m² vloer is er?", a: "27",
          w: "Splitsen: grote rechthoek + nis.",
          meer: "6 × 4 = 24 en 2 × 1,5 = 3. Samen 27 m²." }
      ]
    },
    {
      n: 3, naam: "Goud",
      uitleg: [
        "Bij contextsommen werk je in stappen: (1) de oppervlakte van elk vlak, (2) alles optellen, (3) pas dan de vraag beantwoorden (verf, stof, geld).",
        "Verf: per m² is een hoeveelheid nodig. Liters = m² × liter per m². Blikken koop je heel: altijd <b>naar boven</b> afronden.",
        "Let op de eenheden: 1000 ml = 1 liter, en 10 000 cm² = 1 m².",
        "Een vlieger heeft een symmetrieas: twee gelijke driehoeken. Een ruit is een speciale vlieger: ½ × d₁ × d₂."
      ],
      regel: "Contextsom: eerst alle oppervlaktes, dan optellen, dan pas de vraag. Blikken: naar boven afronden.",
      voorbeelden: [
        { en: "43,2 liter verf nodig, blikken van 5 liter → 9 blikken", let: "8 blikken is 40 liter: te weinig. Dus 9." }
      ],
      vragen: [
        { t: "stap", opgave: "Een gevel is een rechthoek van 8 m breed en 3 m hoog, met daarop een driehoek met zijde 8 m en hoogte 2 m. Per m² is 0,25 liter verf nodig. Verf zit in blikken van 2,5 liter.",
          stappen: [
            { prompt: "Oppervlakte van de rechthoek (m²)?", a: "24", hints: ["8 × 3", "24 m²"] },
            { prompt: "Oppervlakte van de driehoek (m²)?", a: "8", hints: ["½ × 8 × 2", "8 m²"] },
            { prompt: "Hoeveel liter verf is nodig?", a: "8", hints: ["De hele gevel is 24 + 8 = 32 m².", "32 × 0,25 = 8 liter"] },
            { prompt: "Hoeveel blikken moet je kopen?", a: "4", hints: ["8 : 2,5 = 3,2 blikken.", "Een deel van een blik kun je niet kopen: naar boven afronden."] }
          ],
          w: "Eerst de oppervlakte (32 m²), dan de liters (8), dan de blikken (naar boven afronden).",
          meer: "8 : 2,5 = 3,2. Met 3 blikken heb je 7,5 liter, te weinig. Dus 4 blikken." },

        { t: "bouw", q: "Een tentje heeft een grondzeil van 2 m bij 1,4 m en twee driehoekige kopse kanten, elk met zijde 1,4 m en hoogte 1,2 m. Hoeveel m² zijn het grondzeil en de twee kopse kanten samen?", a: "4,48",
          w: "Grondzeil + 2 driehoeken.",
          meer: "Grondzeil 2 × 1,4 = 2,8 m². Eén kopse kant ½ × 1,4 × 1,2 = 0,84 m², twee dus 1,68 m². Samen 4,48 m²." },

        { t: "mc", q: "Een vijfhoek past precies in een rechthoek van 6 bij 3 cm. Linksboven en rechtsboven zijn twee driehoekjes weggeknipt: één van ½ × 2 × 1 en één van ½ × 4 × 1. Wat is de oppervlakte van de vijfhoek?",
          o: ["15 cm²", "21 cm²", "12 cm²", "18 cm²"], a: "15 cm²",
          fout: {
            "21 cm²": "je telde de driehoekjes erbij op. Ze zijn juist weggeknipt, dus aftrekken: 18 − 1 − 2 = 15.",
            "12 cm²": "je vergat de ½ bij de driehoekjes: 18 − 2 − 4 = 12. De driehoekjes zijn ½ × 2 × 1 = 1 en ½ × 4 × 1 = 2.",
            "18 cm²": "dat is de hele rechthoek. De twee driehoekjes zijn er nog niet af."
          },
          w: "Aanvullen: 6 × 3 = 18, min 1 en min 2.",
          meer: "18 − 1 − 2 = 15 cm². Zo werkt het 'stukje toevoegen' uit het boek." },

        { t: "bouw", q: "Een bakje van karton heeft een vierkante bodem van 8 bij 8 cm en vier gelijke zijkanten in de vorm van een trapezium: onder 8 cm, boven 12 cm, hoogte 15 cm. Hoeveel cm² karton is het bakje?", a: "664",
          w: "Bodem + 4 trapezia.",
          meer: "Bodem 8 × 8 = 64. Eén zijkant ½ × (8 + 12) × 15 = 150, vier dus 600. Samen 664 cm²." }
      ]
    }
  ]
}

];
})();

/* =========================================================================
   OVERZICHT, de lijnenkaart (vier lijnen en twee cirkels: verwarbare categorieën)
   ========================================================================= */
window.OVERZICHT = {
  titel: "De lijnenkaart",
  tegelTekst: "Zwaartelijn, hoogtelijn, bissectrice of middelloodlijn? Zie in één kaart welke lijn het is",
  intro: "Vier lijnen en twee cirkels lijken op elkaar en worden vaak verwisseld. Je herkent ze aan " +
         "drie vragen: <b>gaat de lijn door een hoekpunt?</b> <b>Gaat hij naar het midden?</b> " +
         "<b>Staat hij loodrecht?</b> Deze kaart loopt ze één voor één langs.",
  kaart: [
    { id: "hoekpunt", label: "DOOR EEN HOEKPUNT", kop: true, kleur: "brand", kinderen: [
      { id: "zwaartelijn", label: "ZWAARTELIJN", regel: "naar het MIDDEN van de overkant" },
      { id: "hoogtelijn", label: "HOOGTELIJN", regel: "LOODRECHT op de overkant" },
      { id: "bissectrice", label: "BISSECTRICE", regel: "deelt de HOEK doormidden" }
    ]},
    { id: "geenhoek", label: "NIET PER SE DOOR EEN HOEKPUNT", kop: true, kleur: "plum", kinderen: [
      { id: "middelloodlijn", label: "MIDDELLOODLIJN", regel: "door het MIDDEN én LOODRECHT" }
    ]},
    { id: "cirkels", label: "DE TWEE CIRKELS", kop: true, kleur: "brand", kinderen: [
      { id: "omgeschreven", label: "OMGESCHREVEN", regel: "middelloodlijnen · door de hoekpunten" },
      { id: "ingeschreven", label: "INGESCHREVEN", regel: "bissectrices · raakt de zijden" }
    ]}
  ],
  stappen: [
    { kop: "Vraag 1: gaat de lijn door een hoekpunt?", pad: ["hoekpunt", "geenhoek"],
      uitleg: [
        "Drie van de vier lijnen beginnen altijd in een <b>hoekpunt</b> van de driehoek: de zwaartelijn, de hoogtelijn en de bissectrice.",
        "De <b>middelloodlijn</b> hoort bij een lijnstuk, niet bij een hoekpunt. Hij gaat door het midden van een zijde en hoeft niet door een hoekpunt.",
        "Kijk dus eerst: waar begint de lijn?"
      ],
      vb: [{ en: "Lijn door C → zwaartelijn, hoogtelijn of bissectrice", let: "Lijn door het midden van AB die niet door C gaat → middelloodlijn." }] },

    { kop: "Zwaartelijn: naar het midden", pad: ["hoekpunt", "zwaartelijn"],
      uitleg: [
        "De zwaartelijn gaat van een hoekpunt naar het <b>midden van de overstaande zijde</b>. Twee gelijke stukken: de streepjes op de zijde.",
        "Hij hoeft niet loodrecht te staan. De drie zwaartelijnen snijden in het <b>zwaartepunt Z</b>, het balanspunt, en dat ligt altijd binnen."
      ],
      vb: [{ en: "A(0, 0), B(8, 0), C(2, 6): zwaartelijn door C gaat naar (4, 0)", let: "Het midden van AB." }],
      check: { q: "Een lijn gaat van C naar het midden van AB. Welke lijn is dat?", o: ["zwaartelijn", "hoogtelijn", "bissectrice"], a: "zwaartelijn",
        goed: "Precies: hoekpunt plus midden = zwaartelijn.",
        fout: { "hoogtelijn": "een hoogtelijn staat loodrecht op AB. Bij C(2, 6) gaat die naar (2, 0), niet naar het midden (4, 0).",
                "bissectrice": "een bissectrice deelt ∠C doormidden. Die komt meestal niet in het midden van AB uit." } } },

    { kop: "Hoogtelijn: loodrecht", pad: ["hoekpunt", "hoogtelijn"],
      uitleg: [
        "De hoogtelijn gaat door een hoekpunt en staat <b>loodrecht</b> op de overstaande zijde. Let op het rechtehoekteken.",
        "Bij een stomphoekige driehoek moet je de zijde verlengen. Het <b>hoogtepunt H</b> ligt dan buiten de driehoek."
      ],
      vb: [{ en: "A(0, 0), B(8, 0), C(2, 6): hoogtelijn door C gaat naar (2, 0)", let: "Recht naar beneden, loodrecht op AB." }],
      check: { q: "Welk punt ligt bij een stomphoekige driehoek buiten de driehoek?", o: ["het hoogtepunt", "het zwaartepunt", "het middelpunt van de ingeschreven cirkel"], a: "het hoogtepunt",
        goed: "Ja: twee hoogtelijnen vallen buiten, en hun snijpunt H dus ook.",
        fout: { "het zwaartepunt": "het zwaartepunt ligt altijd binnen: daar balanceert de driehoek.",
                "het middelpunt van de ingeschreven cirkel": "de ingeschreven cirkel ligt altijd helemaal binnen de driehoek, zijn middelpunt dus ook." } } },

    { kop: "Bissectrice: hoek doormidden", pad: ["hoekpunt", "bissectrice"],
      uitleg: [
        "De bissectrice deelt de <b>hoek</b> in twee gelijke hoeken. Je zet twee gelijke boogjes of kruisjes.",
        "Elk punt erop ligt even ver van de twee benen. Ze gaat niet vanzelf naar het midden van de overkant."
      ],
      vb: [{ en: "∠A = 90° → de bissectrice maakt twee hoeken van 45°", let: "In △ABC met A(0, 0), B(9, 0), C(0, 4) gaat de zwaartelijn uit A onder 24°, de bissectrice onder 45°." }],
      check: { q: "Een lijn uit A maakt hoeken van 30° en 30° met de benen van ∠A. Welke lijn is dat?", o: ["bissectrice", "zwaartelijn", "hoogtelijn"], a: "bissectrice",
        goed: "Goed: gelijke hoeken = bissectrice.",
        fout: { "zwaartelijn": "een zwaartelijn gaat naar het midden van de overkant; de hoeken zijn dan meestal ongelijk.",
                "hoogtelijn": "een hoogtelijn staat loodrecht op de overkant; ook die deelt de hoek meestal niet eerlijk." } } },

    { kop: "Middelloodlijn: midden én loodrecht", pad: ["geenhoek", "middelloodlijn"],
      uitleg: [
        "De middelloodlijn van AB gaat door het <b>midden</b> van AB én staat er <b>loodrecht</b> op. Allebei.",
        "Elk punt erop ligt even ver van A als van B. Hij hoeft niet door een hoekpunt van de driehoek te gaan."
      ],
      vb: [{ en: "A(1, 2) en B(7, 2) → middelloodlijn x = 4", let: "Door het midden (4, 2), loodrecht op de horizontale AB." }],
      check: { q: "Een lijn door het midden van AB staat loodrecht op AB en gaat niet door C. Welke lijn is dat?", o: ["middelloodlijn van AB", "zwaartelijn door C", "hoogtelijn door C"], a: "middelloodlijn van AB",
        goed: "Klopt: midden plus loodrecht, zonder hoekpunt.",
        fout: { "zwaartelijn door C": "een zwaartelijn door C gaat door C. Deze lijn niet.",
                "hoogtelijn door C": "een hoogtelijn door C gaat door C. Deze lijn niet." } } },

    { kop: "De twee cirkels", pad: ["cirkels", "omgeschreven", "ingeschreven"],
      uitleg: [
        "<b>Omgeschreven cirkel</b>: gaat door de drie <b>hoekpunten</b>. Middelpunt = snijpunt van de <b>middelloodlijnen</b> (even ver van de hoekpunten).",
        "<b>Ingeschreven cirkel</b>: raakt de drie <b>zijden</b>. Middelpunt = snijpunt van de <b>bissectrices</b> (even ver van de zijden). De straal meet je loodrecht op een zijde."
      ],
      vb: [{ en: "Om de driehoek heen = omgeschreven, erin = ingeschreven", let: "Punten → middelloodlijn. Zijden → bissectrice." }],
      check: { q: "Het middelpunt van de cirkel die de drie zijden raakt, is het snijpunt van de ...", o: ["bissectrices", "middelloodlijnen", "zwaartelijnen"], a: "bissectrices",
        goed: "Ja: even ver van de zijden = bissectrices = ingeschreven cirkel.",
        fout: { "middelloodlijnen": "middelloodlijnen geven het middelpunt van de omgeschreven cirkel, die door de hoekpunten gaat.",
                "zwaartelijnen": "het snijpunt van de zwaartelijnen is het zwaartepunt; dat ligt meestal niet even ver van de drie zijden." } },
      samenvatting: [
        "Door een hoekpunt + naar het midden → <b>zwaartelijn</b>",
        "Door een hoekpunt + loodrecht → <b>hoogtelijn</b>",
        "Door een hoekpunt + hoek doormidden → <b>bissectrice</b>",
        "Door het midden + loodrecht → <b>middelloodlijn</b>",
        "Door de hoekpunten → omgeschreven (middelloodlijnen) · raakt de zijden → ingeschreven (bissectrices)"
      ] }
  ]
};

/* =========================================================================
   MIXVRAGEN, interleaved: welke lijn, welke figuur, welke formule?
   ========================================================================= */
window.MIXVRAGEN = [
  { t: "mc", q: "Een lijn gaat door hoekpunt A en staat loodrecht op BC. Welke lijn is dat?",
    o: ["de hoogtelijn die door hoekpunt A gaat", "de zwaartelijn door A", "de bissectrice van ∠A", "de middelloodlijn van BC"], a: "de hoogtelijn die door hoekpunt A gaat",
    fout: { "de zwaartelijn door A": "een zwaartelijn gaat naar het midden van BC en hoeft niet loodrecht te staan.",
            "de bissectrice van ∠A": "een bissectrice deelt ∠A doormidden; over loodrecht op BC zegt die niets.",
            "de middelloodlijn van BC": "een middelloodlijn gaat door het midden van BC, en meestal niet door A." },
    w: "Hoekpunt + loodrecht op de overkant = hoogtelijn.", meer: "Op de lijnenkaart: door een hoekpunt, loodrecht, niet per se naar het midden." },

  { t: "mc", q: "Een lijn gaat door C en door het midden van AB. Welke lijn is dat?",
    o: ["de zwaartelijn die door hoekpunt C gaat", "de hoogtelijn door C", "de middelloodlijn van AB", "de bissectrice van ∠C"], a: "de zwaartelijn die door hoekpunt C gaat",
    fout: { "de hoogtelijn door C": "een hoogtelijn staat loodrecht op AB. Bij A(0, 0), B(8, 0), C(2, 6) gaat die naar (2, 0), de zwaartelijn naar (4, 0).",
            "de middelloodlijn van AB": "die gaat door het midden én staat loodrecht op AB. Hij gaat alleen door C als de driehoek gelijkbenig is.",
            "de bissectrice van ∠C": "die deelt ∠C doormidden en komt meestal níet in het midden van AB uit." },
    w: "Hoekpunt + midden van de overkant = zwaartelijn.", meer: "Zo zaagt Frits zijn plank in twee even zware stukken." },

  { t: "mc", q: "Alle punten die <b>even ver van P als van Q</b> liggen, vormen ...",
    o: ["de middelloodlijn van PQ", "een cirkel om het midden van PQ", "de bissectrice van ∠PQ", "twee lijnen evenwijdig met PQ"], a: "de middelloodlijn van PQ",
    fout: { "een cirkel om het midden van PQ": "op die cirkel ligt ook een punt vlak naast P, dichtbij P en ver van Q.",
            "de bissectrice van ∠PQ": "PQ is een lijnstuk, geen hoek. Een bissectrice hoort bij twee benen van een hoek.",
            "twee lijnen evenwijdig met PQ": "die horen bij 'op afstand d van een lijn'. Hier gaat het om twee punten." },
    w: "Even ver van twee punten = middelloodlijn.", meer: "Het spiekrijtje: punt → cirkel, lijn → twee evenwijdige lijnen, twee punten → middelloodlijn, twee benen → bissectrice." },

  { t: "mc", q: "Alle punten op <b>2 cm van lijn l</b> vormen ...",
    o: ["twee lijnen evenwijdig met l", "één lijn evenwijdig met l", "een cirkel met straal 2 cm", "de middelloodlijn van l"], a: "twee lijnen evenwijdig met l",
    fout: { "één lijn evenwijdig met l": "aan de andere kant van l liggen ook punten op 2 cm. Dus twee lijnen.",
            "een cirkel met straal 2 cm": "een cirkel hoort bij de afstand tot een punt, niet tot een lijn.",
            "de middelloodlijn van l": "een lijn heeft geen middelloodlijn; die hoort bij een lijnstuk tussen twee punten." },
    w: "Afstand tot een lijn: twee evenwijdige lijnen, één aan elke kant.", meer: "Kleiner dan 2 cm is de strook ertussen." },

  { t: "mc", q: "De cirkel die door de drie <b>hoekpunten</b> van een driehoek gaat, heet ...",
    o: ["de omgeschreven cirkel", "de ingeschreven cirkel", "de zwaartecirkel", "het binnengebied"], a: "de omgeschreven cirkel",
    fout: { "de ingeschreven cirkel": "die raakt de zijden en ligt binnen de driehoek; door de hoekpunten gaat hij niet.",
            "de zwaartecirkel": "dat woord bestaat niet in dit hoofdstuk. Er is wel een zwaartepunt.",
            "het binnengebied": "het binnengebied is geen cirkel maar het stuk binnen een cirkel." },
    w: "Door de hoekpunten = omgeschreven.", meer: "Middelpunt = snijpunt van de middelloodlijnen." },

  { t: "mc", q: "Op welk punt kun je een driehoekig tafelblad op één poot laten balanceren?",
    o: ["het zwaartepunt", "het hoogtepunt", "het midden van de langste zijde", "het middelpunt van de omgeschreven cirkel"], a: "het zwaartepunt",
    fout: { "het hoogtepunt": "bij een stomphoekige driehoek ligt het hoogtepunt buiten het blad. Daar kan geen poot staan.",
            "het midden van de langste zijde": "dat ligt op de rand; het blad valt dan om.",
            "het middelpunt van de omgeschreven cirkel": "dat ligt bij een stompe driehoek buiten het blad. Het balanspunt is het zwaartepunt." },
    w: "Het zwaartepunt is het balanspunt.", meer: "Het ligt altijd binnen de driehoek, en in een rooster is het het gemiddelde van de hoekpunten." },

  { t: "mc", q: "Welke formule hoort bij een <b>parallellogram</b>?",
    o: ["zijde × bijbehorende hoogte, zonder ½", "½ × zijde × bijbehorende hoogte", "½ × (som evenwijdige zijden) × hoogte", "½ × d₁ × d₂"], a: "zijde × bijbehorende hoogte, zonder ½",
    fout: { "½ × zijde × bijbehorende hoogte": "dat is de driehoek. Een parallellogram is twee van zulke driehoeken, dus geen ½.",
            "½ × (som evenwijdige zijden) × hoogte": "dat is het trapezium. (Het werkt bij een parallellogram toevallig ook: ½ × (b + b) × h = b × h.)",
            "½ × d₁ × d₂": "dat is de ruit, met de diagonalen." },
    w: "Parallellogram = zijde × hoogte (verschuif het driehoekje: een rechthoek).", meer: "Zonder ½ en zonder schuine zijde." },

  { t: "mc", q: "Welke formule hoort bij een <b>trapezium</b>?",
    o: ["½ × (som evenwijdige zijden) × hoogte", "½ × zijde × bijbehorende hoogte", "zijde × bijbehorende hoogte", "½ × d₁ × d₂"], a: "½ × (som evenwijdige zijden) × hoogte",
    fout: { "½ × zijde × bijbehorende hoogte": "dat is de driehoek. Een trapezium heeft twee evenwijdige zijden die je allebei nodig hebt.",
            "zijde × bijbehorende hoogte": "dat is het parallellogram. Bij een trapezium met zijden 20 en 40 en hoogte 15 is het antwoord 450, niet 40 × 15 = 600.",
            "½ × d₁ × d₂": "dat is de ruit." },
    w: "Twee trapezia vormen een parallellogram met zijde a + b, één trapezium is de helft.", meer: "½ × (a + b) × h." }
];

/* =========================================================================
   BEGRIPPEN (uit brontekst, definities in eigen woorden)
   ========================================================================= */
window.BEGRIPPEN = {
  "Afstanden": {
    emoji: "📏",
    titel: "Afstanden en lijnen (Vk t/m 2.4)",
    items: [
      ["het punt in het midden van een cirkel; elk punt op de cirkel ligt even ver ervan", "middelpunt"],
      ["lijnstuk van het middelpunt naar een punt op de cirkel", "straal"],
      ["lijnstuk van rand tot rand door het middelpunt; 2 × de straal (ook: middellijn)", "diameter"],
      ["het gereedschap waarmee je een cirkel tekent", "passer"],
      ["korte schrijfwijze voor de cirkel met middelpunt M en straal 2 cm", "⊙(M, 2 cm)"],
      ["alle punten waarvan de afstand tot het middelpunt kleiner is dan de straal", "binnengebied"],
      ["alle punten waarvan de afstand tot het middelpunt groter is dan de straal", "buitengebied"],
      ["het punt A' op lijn l waarvoor AA' loodrecht op l staat", "loodrechte projectie"],
      ["lijnen die overal even ver van elkaar liggen (je tekent pijltjes)", "evenwijdig"],
      ["lijn door het midden van een lijnstuk die er loodrecht op staat", "middelloodlijn"],
      ["cirkel door de drie hoekpunten van een driehoek", "omgeschreven cirkel"],
      ["de halve lijn die een hoek middendoor deelt (ook: deellijn)", "bissectrice"],
      ["de twee halve lijnen die samen een hoek vormen", "benen"],
      ["cirkel binnen een driehoek die de drie zijden raakt", "ingeschreven cirkel"],
      ["lijn door een hoekpunt en het midden van de overstaande zijde", "zwaartelijn"],
      ["snijpunt van de drie zwaartelijnen; het balanspunt", "zwaartepunt"],
      ["lijn door een hoekpunt, loodrecht op de overstaande zijde", "hoogtelijn"],
      ["snijpunt van de drie hoogtelijnen", "hoogtepunt"]
    ]
  },
  "Oppervlakte": {
    emoji: "✂️",
    titel: "Oppervlakte (2.5 en 2.6)",
    items: [
      ["driehoek met drie scherpe hoeken", "scherphoekige driehoek"],
      ["driehoek met één stompe hoek; twee hoogtelijnen vallen erbuiten", "stomphoekige driehoek"],
      ["stuk van de hoogtelijn tussen een hoekpunt en (het verlengde van) de overstaande zijde", "hoogte"],
      ["vierhoek waarvan de overstaande zijden even lang en evenwijdig zijn", "parallellogram"],
      ["vierhoek met één paar evenwijdige zijden", "trapezium"],
      ["vierhoek met vier gelijke zijden; de diagonalen delen elkaar middendoor en staan loodrecht", "ruit"],
      ["vierhoek met een symmetrieas door twee hoekpunten", "vlieger"],
      ["½ × zijde × bijbehorende hoogte", "oppervlakte driehoek"],
      ["zijde × bijbehorende hoogte", "oppervlakte parallellogram"],
      ["½ × som van de evenwijdige zijden × hoogte", "oppervlakte trapezium"],
      ["½ × diagonaal × diagonaal", "oppervlakte ruit"]
    ]
  }
};

window.OPSTAP = {};
window.PROEFTOETS = [];

window.AANMOEDIGING = {
  goed: ["Top!", "Goed bezig, Storm!", "Yes, raak!", "Knap hoor!", "Precies goed!", "Missie geslaagd! 🚁", "Scherp gemeten!"],
  bijna: ["Bijna!", "Net niet, geeft niks.", "Dat hoort erbij, kijk even mee.", "Bijna goed!", "Je zit er dichtbij."],
  levelup: ["Level omhoog! 🚀", "Je gaat naar een hoger niveau!", "Knap, door naar het volgende! ✨"],
  leveldown: ["We pakken het even rustiger aan.", "Even een stapje terug, dan zit het straks vast.", "Geen probleem, we bouwen het opnieuw op."],
  stapelklaar: ["Stapel klaar! 🎉", "Lekker gedaan, Storm! 🌟", "Helemaal af! 💪"]
};

/* =========================================================================
   GENERATORS, parametrische vraag-sjablonen per onderwerp x niveau.
   Elke functie levert een VERS vraagobject met andere getallen. Reken-types
   (stap/bouw/velden) worden numeriek nagekeken door math.js equiv().
   Elk object heeft w + meer; elke mc heeft per foute optie een fout-uitleg
   met een tegenvoorbeeld. Geeft een sjabloon toevallig dubbele opties, dan
   levert hij null en pakt de engine een ander.
   Verifieer met: node tools/checks/genverify.mjs <app-map>
   ========================================================================= */
(function () {
  const F = window.H2.fig;
  const ri = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  /* getal → NL-notatie, tot 4 decimalen, minteken als − (voor in tekst) */
  const n = v => { const r = Math.round(v * 10000) / 10000; return String(r).replace(".", ",").replace("-", "−"); };
  /* getal → antwoord-notatie voor equiv (gewoon minteken) */
  const a = v => { const r = Math.round(v * 10000) / 10000; return String(r).replace(".", ","); };
  const isInt = v => Math.abs(v - Math.round(v)) < 1e-9;
  const pt = (x, y) => "(" + n(x) + ((isInt(x) && isInt(y)) ? ", " : "; ") + n(y) + ")";
  const nb = v => (v < 0 ? "(" + n(v) + ")" : n(v));   /* negatief getal ná een + of − tussen haakjes */
  const ong = v => n(Math.round(v * 10) / 10);   // "ongeveer" met 1 decimaal
  const afst = (dx, dy) => Math.hypot(dx, dy);
  /* mc-bouwer: dubbele opties → null (engine probeert een ander sjabloon) */
  function mc(q, goed, fouten, w, meer) {
    const o = [goed].concat(Object.keys(fouten));
    if (new Set(o).size !== o.length) return null;
    return { t: "mc", q, o, a: goed, fout: fouten, w, meer };
  }
  /* kader rond punten, met marge, voor maatfiguren */
  function kader(pts, m) {
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    const mg = (m || 0.13) * span;
    return { xmin: Math.min(...xs) - mg, xmax: Math.max(...xs) + mg, ymin: Math.min(...ys) - mg, ymax: Math.max(...ys) + mg };
  }
  const zw = (pts) => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];

  /* Pythagoras-tripels (gehele maten) en per hoogte de bijbehorende stukken */
  const TRIP = [[3,4,5],[6,8,10],[5,12,13],[9,12,15],[8,15,17],[12,16,20],[7,24,25],[15,20,25],[10,24,26],[20,21,29],
                [18,24,30],[16,30,34],[21,28,35],[12,35,37],[15,36,39],[24,32,40],[9,40,41],[27,36,45],[30,40,50]];
  const PER_H = {};
  TRIP.forEach(([p, q, s]) => { (PER_H[q] = PER_H[q] || []).push([p, s]); (PER_H[p] = PER_H[p] || []).push([q, s]); });
  const H_TWEE = Object.keys(PER_H).map(Number).filter(h => PER_H[h].length >= 2 && h <= 36);

  const G = {};

  /* ================================================================ Vk cirkel */
  G.cirkel_n1 = [
    () => { const r = pick([ri(2, 15), ri(2, 12) + 0.5]), d = 2 * r;
      const ctx = pick([["Een cirkel heeft een diameter van", "cm"], ["Een rond tafelkleed heeft een middellijn van", "cm"],
                        ["Een pizza heeft een diameter van", "cm"], ["Een rond zwembadje heeft een diameter van", "dm"]]);
      return { t: "bouw", q: `${ctx[0]} ${n(d)} ${ctx[1]}. Hoe groot is de straal (in ${ctx[1]})?`, a: a(r),
        w: "straal = diameter : 2.", meer: `${n(d)} : 2 = ${n(r)} ${ctx[1]}. De diameter bestaat uit twee stralen.` }; },
    () => { const r = pick([ri(2, 12), ri(1, 9) + 0.5]), d = 2 * r;
      const ctx = pick(["Een cirkel heeft een straal van", "Een ronde spiegel heeft een straal van", "Een hoepel heeft een straal van"]);
      return { t: "bouw", q: `${ctx} ${n(r)} cm. Hoe lang is de diameter (in cm)?`, a: a(d),
        w: "diameter = 2 × straal.", meer: `2 × ${n(r)} = ${n(d)} cm. Van de rand naar het midden en dan nog eens naar de overkant.` }; },
    () => { const r = ri(3, 12);
      return mc(`De straal van een cirkel is ${r} cm. Hoe lang is de diameter?`, `${2 * r} cm`, {
          [`${r} cm`]: `dat is de straal zelf. De diameter is twee stralen: ${r} + ${r} = ${2 * r} cm.`,
          [`${n(r / 2)} cm`]: `je deelde door 2, maar dat doe je als de diameter gegeven is. De diameter is juist langer: 2 × ${r} = ${2 * r} cm.`,
          [`${r * r} cm`]: `dat is ${r} × ${r}. De diameter is 2 × de straal, niet de straal keer zichzelf.`
        }, `diameter = 2 × ${r} = ${2 * r} cm.`, `Check: van de rand naar M is ${r} cm, van M naar de overkant nog ${r} cm.`); }
  ];

  G.cirkel_n2 = [
    () => { /* binnen / op / buiten in een rooster */
      const mx = ri(-1, 2), my = ri(-1, 2);
      const soort = pick(["as", "as", "tripel", "schuin"]);
      let dx, dy;
      if (soort === "as") { const k = ri(1, 5); [dx, dy] = pick([[k, 0], [-k, 0], [0, k], [0, -k]]); }
      else if (soort === "tripel") { [dx, dy] = pick([[3, 4], [4, 3]]); dx *= pick([1, -1]); dy *= pick([1, -1]); }
      else { [dx, dy] = pick([[1, 1], [2, 2], [1, 2], [2, 1], [3, 3], [2, 3], [3, 2]]); dx *= pick([1, -1]); dy *= pick([1, -1]); }
      const d = afst(dx, dy), heel = isInt(d);
      let r;
      const doel = heel ? pick(["op", "binnen", "buiten"]) : pick(["binnen", "buiten"]);
      if (doel === "op") r = d; else if (doel === "binnen") r = Math.floor(d) + 1; else r = Math.max(1, Math.ceil(d) - 1);
      if (r > 6 || r < 1) return null;
      const st = d === r ? "precies op de cirkel" : d < r ? "binnen de cirkel" : "buiten de cirkel";
      const px = mx + dx, py = my + dy, rng = r + 1;
      const fig = F({ xmin: mx - rng, xmax: mx + rng, ymin: my - rng, ymax: my + rng, rooster: true, maxW: 230, maxH: 230, label: "cirkel om M en punt P",
        items: [ { t: "cirkel", c: [mx, my], r: r, kleur: "blauw" }, { t: "punt", p: [mx, my], label: "M", kleur: "blauw" }, { t: "punt", p: [px, py], label: "P", kleur: "rood" } ] });
      const op_neer = dy > 0 ? "omhoog" : "omlaag";
      let uitleg;
      if (dx === 0 || dy === 0) uitleg = `MP is recht ${dx === 0 ? op_neer : (dx > 0 ? "naar rechts" : "naar links")}: ${d} hokjes`;
      else if (heel) uitleg = `MP is schuin ${Math.abs(dx)} opzij en ${Math.abs(dy)} ${op_neer}: precies ${d} (zoals 3-4-5)`;
      else uitleg = `MP is schuin ${Math.abs(dx)} opzij en ${Math.abs(dy)} ${op_neer}: ongeveer ${ong(d)}`;
      const vgl = d === r ? `precies de straal ${r}` : d < r ? `kleiner dan de straal ${r}` : `groter dan de straal ${r}`;
      const f = {};
      ["precies op de cirkel", "binnen de cirkel", "buiten de cirkel"].filter(x => x !== st).forEach(x => {
        f[x] = `${uitleg}, en dat is ${vgl}. ` + (x === "precies op de cirkel" ? `Op de cirkel zou MP precies ${r} moeten zijn.`
             : x === "binnen de cirkel" ? `Binnen betekent MP kleiner dan ${r}.` : (dx && dy && !heel ? "Tel geen hokjes langs de omweg: de rechte lijn is korter." : `Buiten betekent MP groter dan ${r}.`));
      });
      return mc(`De cirkel heeft middelpunt M${pt(mx, my)} en straal ${r}. Ligt P${pt(px, py)} binnen, op of buiten de cirkel?` + fig, st, f,
        `${uitleg}, ${vgl}. Dus ${st}.`, "Vergelijk altijd de afstand MP met de straal. Schuin meet je recht, niet langs de hokjes."); },
    () => { const mx = ri(-3, 4), my = ri(-3, 4), k = ri(2, 7), hor = Math.random() < 0.5, s = pick([1, -1]);
      const p = hor ? [mx + s * k, my] : [mx, my + s * k];
      return { t: "bouw", q: `Een cirkel heeft middelpunt M${pt(mx, my)} en gaat door het punt ${pt(p[0], p[1])}. Hoe groot is de straal?`, a: String(k),
        w: "De straal is de afstand van M tot een punt op de cirkel.",
        meer: `Het punt ligt recht ${hor ? (s > 0 ? "rechts" : "links") : (s > 0 ? "boven" : "onder")} M: ${k} hokjes. Straal ${k}.` }; },
    () => { /* welk punt ligt ook op de cirkel? */
      const mx = ri(-2, 3), my = ri(-2, 3), r = ri(2, 5);
      const goed = pick([[mx - r, my], [mx, my + r], [mx, my - r]]);
      const schuin = [mx + r, my + r], binnen = [mx + 1, my + 1], ver = [mx + 2 * r, my];
      return mc(`De cirkel met middelpunt M${pt(mx, my)} gaat door het punt ${pt(mx + r, my)}. Welk punt ligt <b>ook</b> op deze cirkel?`, pt(goed[0], goed[1]), {
          [pt(schuin[0], schuin[1])]: `${r} opzij en ${r} omhoog is schuin, en schuin is langer: ongeveer ${ong(r * Math.SQRT2)}. Dat is meer dan de straal ${r}, dus buiten.`,
          [pt(binnen[0], binnen[1])]: `dat punt ligt vlak bij M (ongeveer 1,4). Veel minder dan de straal ${r}, dus binnen.`,
          [pt(ver[0], ver[1])]: `dat punt ligt ${2 * r} rechts van M: de diameter, niet de straal. Dat ligt buiten de cirkel.`
        }, `De straal is ${r}. ${pt(goed[0], goed[1])} ligt recht naast of recht boven/onder M, op afstand ${r}.`,
        `Alle punten op ${r} van M liggen op de cirkel: ${pt(mx + r, my)}, ${pt(mx - r, my)}, ${pt(mx, my + r)} en ${pt(mx, my - r)} bijvoorbeeld.`); }
  ];

  G.cirkel_n3 = [
    () => { /* roosterpunten op de x-as binnen de cirkel */
      const [b, r] = pick([[0, 2], [0, 3], [0, 4], [1, 2], [2, 3], [3, 5], [4, 5], [1, 3], [2, 4]]);
      const by = b * pick([1, -1]), mx = ri(-2, 3), dia = Math.random() < 0.5;
      let tel = 0; const op = [];
      for (let t = -r; t <= r; t++) { const d2 = t * t + by * by; if (d2 < r * r) tel++; else if (d2 === r * r) op.push(mx + t); }
      const fig = F({ xmin: mx - r - 1, xmax: mx + r + 1, ymin: Math.min(-1, by - r - 0.5), ymax: Math.max(1, by + r + 0.5), rooster: true, assen: true, maxW: 250, maxH: 230, label: "cirkel en de x-as",
        items: [ { t: "cirkel", c: [mx, by], r: r, kleur: "blauw" }, { t: "punt", p: [mx, by], label: "M", kleur: "blauw" } ] });
      return { t: "bouw", q: `Hoeveel roosterpunten op de x-as liggen <b>binnen</b> de cirkel met middelpunt M${pt(mx, by)} en ${dia ? "diameter " + 2 * r : "straal " + r}?` + fig, a: String(tel),
        w: (dia ? `Diameter ${2 * r}, dus straal ${r}. ` : "") + "Binnen = afstand tot M kleiner dan de straal.",
        meer: `Binnen liggen ${tel} roosterpunten op de x-as.` + (op.length ? ` De punten ${op.map(x => pt(x, 0)).join(" en ")} liggen precies óp de cirkel en tellen niet mee.` : " Geen enkel roosterpunt ligt precies op de rand.") }; },
    () => { /* diameter gegeven: welk punt ligt op de cirkel */
      const mx = ri(-2, 4), my = ri(-2, 3), r = pick([2, 3, 4]), d = 2 * r;
      const goed = pick([[mx + r, my], [mx, my - r]]);
      return mc(`Een cirkel heeft middelpunt A${pt(mx, my)} en <b>diameter</b> ${d}. Welk punt ligt óp de cirkel?`, pt(goed[0], goed[1]), {
          [pt(mx + d, my)]: `dat ligt ${d} van A. Maar ${d} is de diameter; de straal is ${d} : 2 = ${r}. Dit punt ligt buiten.`,
          [pt(mx + 1, my + 1)]: `1 opzij en 1 omhoog is ongeveer 1,4: veel minder dan de straal ${r}. Binnen dus.`,
          [pt(mx - r, my + r)]: `${r} opzij en ${r} omhoog is schuin ongeveer ${ong(r * Math.SQRT2)}, meer dan de straal ${r}. Buiten dus.`
        }, `Straal = ${d} : 2 = ${r}. ${pt(goed[0], goed[1])} ligt precies ${r} van A, recht opzij of recht omlaag.`,
        "Eerst de straal uit de diameter halen. Dan recht opzij, omhoog of omlaag tellen."); }
  ];

  /* ================================================================ 2.1 afstand tot een punt */
  G["afstand-punt_n1"] = [
    () => { const r = pick([2, 2.5, 3, 3.5, 4, 4.5, 5, 6]), soort = pick(["op", "binnen", "buiten"]);
      const d = soort === "op" ? r : soort === "binnen" ? r - pick([0.5, 1, 0.1]) : r + pick([0.5, 1, 0.1]);
      if (d <= 0) return null;
      const st = soort === "op" ? "precies op de cirkel" : soort === "binnen" ? "in het binnengebied" : "in het buitengebied";
      const f = {};
      ["precies op de cirkel", "in het binnengebied", "in het buitengebied"].filter(x => x !== st).forEach(x => {
        f[x] = `PM = ${n(d)} cm en de straal is ${n(r)} cm. ` + (x === "precies op de cirkel" ? `Op de cirkel moet PM precies ${n(r)} cm zijn; ${n(d)} is ${d < r ? "kleiner" : "groter"}.`
             : x === "in het binnengebied" ? `Binnen betekent kleiner dan ${n(r)}, zoals ${n(r - 0.5)}. ${n(d)} is dat niet.` : `Buiten betekent groter dan ${n(r)}, zoals ${n(r + 0.5)}. ${n(d)} is dat niet.`);
      });
      return mc(`Voor punt P geldt PM = ${n(d)} cm. Waar ligt P ten opzichte van ⊙(M${r % 1 ? ";" : ","} ${n(r)} cm)?`, st, f,
        `PM = ${n(d)} en r = ${n(r)}: ${d === r ? "gelijk" : d < r ? "kleiner" : "groter"}, dus ${st}.`, "Gelijk aan de straal = op de cirkel, kleiner = binnen, groter = buiten."); },
    () => { const ctx = pick([
        { wie: "Een traumahelikopter haalt in een half uur", eenh: "km", r: pick([60, 70, 80, 90]) },
        { wie: "De wifi van de bibliotheek reikt", eenh: "m", r: pick([20, 25, 30, 40]) },
        { wie: "Een sirene is te horen tot", eenh: "m", r: pick([400, 500, 800]) } ]);
      const soort = pick(["binnen", "buiten", "op"]), stap = ctx.r / 10;
      const d = soort === "op" ? ctx.r : soort === "binnen" ? ctx.r - stap * ri(1, 3) : ctx.r + stap * ri(1, 3);
      const goed = soort === "binnen" ? "Ja, het ligt in het binnengebied" : soort === "op" ? "Precies, het ligt op de rand" : "Nee, het ligt in het buitengebied";
      const f = {};
      ["Ja, het ligt in het binnengebied", "Precies, het ligt op de rand", "Nee, het ligt in het buitengebied"].filter(x => x !== goed).forEach(x => {
        f[x] = `${n(d)} ${ctx.eenh} vergeleken met de straal ${ctx.r} ${ctx.eenh}: ${d === ctx.r ? "precies gelijk, dus op de rand" : d < ctx.r ? "minder, dus binnen" : "meer, dus buiten"}.`;
      });
      return mc(`${ctx.wie} ${ctx.r} ${ctx.eenh} ver. Iets ligt op ${n(d)} ${ctx.eenh} afstand. Valt dat binnen het bereik?`, goed, f,
        `Het bereik is ⊙(start, ${ctx.r} ${ctx.eenh}). ${n(d)} ${ctx.eenh} is ${d === ctx.r ? "gelijk aan" : d < ctx.r ? "minder dan" : "meer dan"} de straal.`,
        "Afstand vergelijken met de straal: dat is de hele truc."); }
  ];

  const VT = []; [60, 72, 90, 120, 144, 150, 160, 180, 200, 210, 240].forEach(v => [5, 10, 12, 15, 20, 24, 30, 36, 40, 45].forEach(t => { if ((v * t) % 60 === 0) VT.push([v, t]); }));
  const SCHAAL = [[500000, 5], [1000000, 10], [2000000, 20], [2500000, 25], [4000000, 40], [5000000, 50]];
  const groot = x => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  G["afstand-punt_n2"] = [
    () => { const [v, t] = pick(VT), r = v * t / 60;
      return { t: "bouw", q: `${pick(["Een traumahelikopter", "Een politiehelikopter", "Een reddingsdrone"])} vliegt ${v} km per uur en moet binnen ${t} minuten ter plaatse zijn. Hoeveel km is de straal van het gebied dat hij bereikt?`, a: String(r),
        w: "straal = snelheid × tijd (in uren).", meer: `${t} minuten = ${t}/60 uur. ${v} × ${t} : 60 = ${r} km.` }; },
    () => { const [N, k] = pick(SCHAAL), c = pick([0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4]), D = k * c;
      return { t: "bouw", q: `De schaal van een kaart is 1 : ${groot(N)}. Een vuurtoren is tot ${n(D)} km ver te zien. Hoeveel cm is de straal van de cirkel die je op de kaart tekent?`, a: a(c),
        w: `1 cm op de kaart = ${groot(N)} cm = ${k} km.`, meer: `${n(D)} : ${k} = ${n(c)} cm.` }; },
    () => { const [N, k] = pick(SCHAAL), c = pick([1, 1.5, 2, 2.5, 3, 4, 5]), D = k * c;
      return { t: "bouw", q: `Op een kaart met schaal 1 : ${groot(N)} heeft een cirkel een straal van ${n(c)} cm. Hoeveel km is dat in het echt?`, a: a(D),
        w: `1 cm = ${groot(N)} cm = ${k} km.`, meer: `${n(c)} × ${k} = ${n(D)} km. Van cm naar km deel je door 100 000.` }; }
  ];

  G["afstand-punt_n3"] = [
    () => { /* twee voorwaarden */
      const A = pick([2, 3, 4]), B = pick([1, 2, 3]);
      const tA = pick(["<", ">", "="]), tB = pick(["<", ">", "="]);
      const woord = { "<": "kleiner dan", ">": "groter dan", "=": "gelijk aan" };
      const waarde = (lim) => pick([lim - 1, lim, lim + 1, lim + 0.5, lim - 0.5].filter(x => x > 0));
      const pa = waarde(A), pb = waarde(B);
      const ok = (d, lim, t) => t === "<" ? d < lim : t === ">" ? d > lim : d === lim;
      const okA = ok(pa, A, tA), okB = ok(pb, B, tB);
      const goed = okA && okB ? "Ja, aan allebei" : okA ? "Alleen aan de eerste" : okB ? "Alleen aan de tweede" : "Aan geen van beide";
      const uitl = `Eerste: ${n(pa)} ${okA ? "is" : "is niet"} ${woord[tA]} ${A}. Tweede: ${n(pb)} ${okB ? "is" : "is niet"} ${woord[tB]} ${B}.`;
      const f = {};
      ["Ja, aan allebei", "Alleen aan de eerste", "Alleen aan de tweede", "Aan geen van beide"].filter(x => x !== goed).forEach(x => { f[x] = uitl + " Kijk per voorwaarde apart, en let op het verschil tussen 'kleiner dan' en 'gelijk aan'."; });
      return mc(`Punt P ligt op ${n(pa)} cm van A en op ${n(pb)} cm van B. De voorwaarden zijn: (1) afstand tot A ${woord[tA]} ${A} cm, (2) afstand tot B ${woord[tB]} ${B} cm. Aan welke voldoet P?`,
        goed, f, uitl, "Kleur bij twee voorwaarden alleen wat aan allebei voldoet. Een punt op precies de straal is niet 'kleiner dan' en niet 'groter dan'."); },
    () => { const [v, t] = pick(VT), R = v * t / 60, soort = pick(["ja", "nee", "net"]);
      const D = soort === "ja" ? R - pick([5, 10, 2]) : soort === "nee" ? R + pick([5, 10, 2]) : R;
      if (D <= 0) return null;
      const goed = soort === "ja" ? `Ja, want ${D} km is minder dan ${R} km` : soort === "nee" ? `Nee, want ${D} km is meer dan ${R} km` : `Net wel, ${D} km is precies ${R} km`;
      const opties = [`Ja, want ${D} km is minder dan ${R} km`, `Nee, want ${D} km is meer dan ${R} km`, `Net wel, ${D} km is precies ${R} km`, `Ja, want ${v} × ${t} is ruim genoeg`];
      const f = {};
      opties.filter(x => x !== goed).forEach(x => {
        f[x] = x.startsWith("Ja, want " + v) ? `${v} × ${t} = ${v * t} rekent met minuten. Reken in uren: ${t} min = ${t}/60 uur, dus de straal is ${R} km.`
             : `De straal is ${v} × ${t} : 60 = ${R} km en het ongeluk is op ${D} km. ${D === R ? "Precies gelijk: op de rand, net op tijd." : D < R ? "Minder, dus binnen het gebied." : "Meer, dus buiten het gebied."}`;
      });
      if (f[goed]) return null;
      return mc(`Een helikopter vliegt ${v} km per uur. Een ongeluk is hemelsbreed ${D} km van de basis. Is hij er binnen ${t} minuten?`, goed, f,
        `Straal = ${v} × ${t} : 60 = ${R} km. Vergelijk met ${D} km.`, "Eerst de straal uitrekenen (snelheid × tijd in uren), dan vergelijken."); },
    () => { const [v, t] = pick(VT.filter(x => [12, 24, 36, 40, 45].includes(x[1]))), r = v * t / 60;
      return { t: "bouw", q: `Een helikopter vliegt ${v} km per uur. Welke straal (in km) heeft het gebied dat hij in ${t} minuten bereikt?`, a: String(r),
        w: `${t} minuten = ${n(t / 60)} uur.`, meer: `${v} × ${n(t / 60)} = ${r} km.` }; }
  ];

  /* ================================================================ 2.1 afstand tot een lijn */
  G["afstand-lijn_n1"] = [
    () => { const la = ri(-2, 3), px = ri(0, 6), d = ri(1, 5), s = pick([1, -1]), py = la + s * d;
      const fig = F({ xmin: -1, xmax: 7, ymin: Math.min(la, py) - 1, ymax: Math.max(la, py) + 1, rooster: true, assen: true, maxW: 240, maxH: 220, label: "punt P en een horizontale lijn",
        items: [ { t: "lijn", a: [0, la], b: [1, la], kleur: "blauw", label: "y = " + n(la), weg: [px, py] }, { t: "punt", p: [px, py], label: "P", kleur: "rood" } ] });
      return { t: "bouw", q: `Hoe groot is de afstand van P${pt(px, py)} tot de lijn y = ${n(la)}?` + fig, a: String(d),
        w: "Loodrecht naar de lijn: recht omhoog of omlaag.", meer: `Van hoogte ${n(py)} naar hoogte ${n(la)} is ${d}. Een schuine route naar de lijn is langer.` }; },
    () => { const la = ri(-2, 3), py = ri(-2, 4), d = ri(1, 5), s = pick([1, -1]), px = la + s * d;
      return { t: "bouw", q: `Hoe groot is de afstand van het punt ${pt(px, py)} tot de lijn x = ${n(la)}?`, a: String(d),
        w: "De lijn x = " + n(la) + " is verticaal. Loodrecht erop = recht opzij.", meer: `Van x = ${n(px)} naar x = ${n(la)} is ${d}. De y-waarde ${n(py)} doet hier niet mee.` }; },
    () => { const x = ri(-6, 6), y = ri(-6, 6); if (!x || !y || Math.abs(x) === Math.abs(y)) return null;
      const as = pick(["x-as", "y-as"]), d = as === "x-as" ? Math.abs(y) : Math.abs(x);
      return { t: "bouw", q: `Hoe groot is de afstand van het punt ${pt(x, y)} tot de ${as}?`, a: String(d),
        w: as === "x-as" ? "Afstand tot de x-as = de y-waarde zonder minteken." : "Afstand tot de y-as = de x-waarde zonder minteken.",
        meer: `Het antwoord is ${d}. Het andere getal (${n(as === "x-as" ? Math.abs(x) : Math.abs(y))}) hoort bij de afstand tot de ${as === "x-as" ? "y-as" : "x-as"}.` }; }
  ];

  G["afstand-lijn_n2"] = [
    () => { const la = ri(-3, 4), d = ri(1, 4), hor = Math.random() < 0.6;
      return hor
        ? { t: "velden", q: `Alle punten op afstand ${d} van de lijn y = ${n(la)} vormen twee lijnen. Welke?`,
            velden: [{ label: "onderste lijn: y =", a: a(la - d) }, { label: "bovenste lijn: y =", a: a(la + d) }],
            w: `${d} omhoog en ${d} omlaag vanaf y = ${n(la)}.`, meer: `${n(la)} − ${d} = ${n(la - d)} en ${n(la)} + ${d} = ${n(la + d)}. Twee lijnen, allebei evenwijdig met y = ${n(la)}.` }
        : { t: "velden", q: `Alle punten op afstand ${d} van de lijn x = ${n(la)} vormen twee lijnen. Welke?`,
            velden: [{ label: "linker lijn: x =", a: a(la - d) }, { label: "rechter lijn: x =", a: a(la + d) }],
            w: `${d} naar links en ${d} naar rechts vanaf x = ${n(la)}.`, meer: `${n(la)} − ${d} = ${n(la - d)} en ${n(la)} + ${d} = ${n(la + d)}. Twee verticale lijnen.` }; },
    () => { const la = ri(-2, 3), d = ri(1, 3), soort = pick(["in", "op", "uit"]);
      const e = soort === "in" ? ri(0, d - 1) : soort === "op" ? d : d + ri(1, 2), py = la + pick([1, -1]) * e, px = ri(-3, 5);
      const goed = soort === "in" ? "ja, in de strook" : soort === "op" ? "nee, precies op een randlijn" : "nee, buiten de strook";
      const f = {};
      ["ja, in de strook", "nee, precies op een randlijn", "nee, buiten de strook"].filter(x => x !== goed).forEach(x => {
        f[x] = `De afstand van ${pt(px, py)} tot y = ${n(la)} is ${e}. ` + (e < d ? `Dat is minder dan ${d}: in de strook.` : e === d ? `Dat is precies ${d}: op een randlijn, en die hoort niet bij 'minder dan'.` : `Dat is meer dan ${d}: buiten de strook.`);
      });
      return mc(`Ligt het punt ${pt(px, py)} op <b>minder dan ${d}</b> van de lijn y = ${n(la)}?`, goed, f,
        `De afstand is ${e} (hoogteverschil). De strook loopt van y = ${n(la - d)} tot y = ${n(la + d)}.`, "Minder dan d: de strook tussen de twee evenwijdige lijnen, zonder de randen."); }
  ];

  G["afstand-lijn_n3"] = [
    () => { /* aantal punten op afstand d van l én op afstand r van C */
      const la = 0, d = ri(1, 3), r = ri(1, 4), cy = ri(-3, 3), cx = ri(-2, 3);
      const e1 = Math.abs(cy - (la + d)), e2 = Math.abs(cy - (la - d));
      const tel = e => e < r ? 2 : e === r ? 1 : 0, tot = tel(e1) + tel(e2);
      const besch = (e, y) => `y = ${n(y)} ligt ${e} van C: ${e < r ? "2 snijpunten" : e === r ? "raakt, 1 punt" : "geen snijpunt"}`;
      return { t: "bouw", q: `Hoeveel punten liggen op afstand ${d} van de x-as én op afstand ${r} van C${pt(cx, cy)}?`, a: String(tot),
        w: `Afstand ${d} tot de x-as: de lijnen y = ${d} en y = −${d}. Afstand ${r} tot C: ⊙(C, ${r}).`,
        meer: `${besch(e1, la + d)}. ${besch(e2, la - d)}. Samen ${tot}.` }; },
    () => { const [N, k] = pick(SCHAAL), c = pick([0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]), D = k * c;
      if (!isInt(D)) return null;
      return { t: "bouw", q: `Een schip vaart evenwijdig aan de kust, op ${D} km afstand. De kaart heeft schaal 1 : ${groot(N)}. Op hoeveel cm van de kustlijn teken je de route?`, a: a(c),
        w: `1 cm = ${k} km.`, meer: `${D} : ${k} = ${n(c)} cm. De route is een lijn evenwijdig met de kust.` }; }
  ];

  /* ================================================================ 2.2 middelloodlijn */
  G.middelloodlijn_n1 = [
    () => { const x1 = ri(-4, 4), y1 = ri(-4, 4), x2 = ri(-4, 6), y2 = ri(-4, 6); if (x1 === x2 && y1 === y2) return null;
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      return { t: "velden", q: `Wat is het midden van A${pt(x1, y1)} en B${pt(x2, y2)}?`,
        velden: [{ label: "x =", a: a(mx) }, { label: "y =", a: a(my) }],
        w: "Tel de x'en op en deel door 2, en net zo met de y'en.", meer: `x: (${n(x1)} + ${nb(x2)}) : 2 = ${n(mx)}. y: (${n(y1)} + ${nb(y2)}) : 2 = ${n(my)}. Het midden is ${pt(mx, my)}.` }; },
    () => { const d = pick([3, 4, 5, 6, 7, 2.5, 4.5]);
      return mc(`Punt P ligt op de middelloodlijn van AB. PA = ${n(d)} cm. Hoe lang is PB?`, `${n(d)} cm`, {
          [`${n(2 * d)} cm`]: `je deed 2 × ${n(d)}. Maar P ligt even ver van A als van B: PB = ${n(d)} cm.`,
          [`${n(d / 2)} cm`]: `halveren hoort bij het midden van AB, niet bij de afstand van P. PB = PA = ${n(d)} cm.`,
          ["dat kun je niet weten"]: `dat kun je wel: elk punt van de middelloodlijn ligt even ver van A als van B. PB = ${n(d)} cm.`
        }, "Op de middelloodlijn: PA = PB.", `Dus PB = ${n(d)} cm.`); }
  ];

  G.middelloodlijn_n2 = [
    () => { const y0 = ri(0, 2), xa = ri(0, 2), xb = xa + 2 * ri(2, 3), m = (xa + xb) / 2, soort = pick(["A", "B", "even"]);
      const px = soort === "even" ? m : soort === "A" ? m - ri(1, 2) : m + ri(1, 2), py = y0 + pick([-2, -1, 2, 3]);
      const dA = afst(px - xa, py - y0), dB = afst(px - xb, py - y0);
      const goed = soort === "A" ? "dichter bij A" : soort === "B" ? "dichter bij B" : "even ver van A als van B";
      const fig = F({ xmin: xa - 1, xmax: xb + 1, ymin: Math.min(y0, py) - 1, ymax: Math.max(y0, py) + 1, rooster: true, maxW: 240, maxH: 220, label: "A, B, de middelloodlijn en P",
        items: [ { t: "lijn", a: [m, 0], b: [m, 1], kleur: "blauw" }, { t: "punt", p: [xa, y0], label: "A" }, { t: "punt", p: [xb, y0], label: "B" }, { t: "punt", p: [px, py], label: "P", kleur: "rood" } ] });
      const feit = `PA is ${isInt(dA) ? n(dA) : "ongeveer " + ong(dA)} en PB is ${isInt(dB) ? n(dB) : "ongeveer " + ong(dB)}.`;
      const f = {};
      ["dichter bij A", "dichter bij B", "even ver van A als van B"].filter(x => x !== goed).forEach(x => {
        f[x] = feit + (soort === "even" ? " P ligt óp de middelloodlijn, dus even ver." : ` P ligt aan de kant van ${soort} van de middelloodlijn x = ${n(m)}.`);
      });
      return mc(`A${pt(xa, y0)} en B${pt(xb, y0)} met hun middelloodlijn (blauw). Ligt P${pt(px, py)} dichter bij A, dichter bij B of even ver?` + fig, goed, f,
        `De middelloodlijn is x = ${n(m)}. ${feit}`, "Aan de kant van A van de middelloodlijn ligt alles dichter bij A."); },
    () => { const hor = Math.random() < 0.6, p1 = ri(-4, 3), p2 = p1 + ri(2, 9), c = ri(-3, 4), m = (p1 + p2) / 2;
      return hor
        ? { t: "bouw", q: `A${pt(p1, c)} en B${pt(p2, c)}. De middelloodlijn van AB is een verticale lijn x = ? Vul het getal in.`, a: a(m),
            w: "De middelloodlijn gaat door het midden van AB.", meer: `(${n(p1)} + ${nb(p2)}) : 2 = ${n(m)}. AB is horizontaal, dus de middelloodlijn is verticaal: x = ${n(m)}.` }
        : { t: "bouw", q: `A${pt(c, p1)} en B${pt(c, p2)}. De middelloodlijn van AB is een horizontale lijn y = ? Vul het getal in.`, a: a(m),
            w: "De middelloodlijn gaat door het midden van AB.", meer: `(${n(p1)} + ${nb(p2)}) : 2 = ${n(m)}. AB is verticaal, dus de middelloodlijn is horizontaal: y = ${n(m)}.` }; }
  ];

  G.middelloodlijn_n3 = [
    () => { /* rechthoekige driehoek: M op het midden van de schuine zijde */
      const px = ri(-3, 1), py = ri(-3, 1), p = ri(1, 3) * pick([1, -1]), q = ri(1, 3) * pick([1, -1]);
      const P = [px, py], Q = [px + 2 * p, py], R = [px, py + 2 * q], M = [px + p, py + q];
      const all = [P, Q, R], k = kader(all, 0.2);
      const fig = F({ xmin: Math.floor(k.xmin), xmax: Math.ceil(k.xmax), ymin: Math.floor(k.ymin), ymax: Math.ceil(k.ymax), rooster: true, assen: true, maxW: 240, maxH: 220, label: "rechthoekige driehoek",
        items: [ { t: "poly", p: all, fill: "#dbeafe" }, { t: "haaks", p: P, u: [Math.sign(p), 0], v: [0, Math.sign(q)] },
                 { t: "punt", p: P, label: "P" }, { t: "punt", p: Q, label: "Q" }, { t: "punt", p: R, label: "R" } ] });
      return { t: "velden", q: `△PQR heeft een rechte hoek bij P${pt(P[0], P[1])}, met Q${pt(Q[0], Q[1])} en R${pt(R[0], R[1])}. Wat is het middelpunt M van de omgeschreven cirkel?` + fig,
        velden: [{ label: "x van M =", a: a(M[0]) }, { label: "y van M =", a: a(M[1]) }],
        w: "Bij een rechthoekige driehoek ligt M op het midden van de schuine zijde QR.",
        meer: `Midden van Q en R: ((${n(Q[0])} + ${nb(R[0])}) : 2, (${n(Q[1])} + ${nb(R[1])}) : 2) = ${pt(M[0], M[1])}. M ligt ook op de middelloodlijnen van PQ en PR.` }; },
    () => { /* gelijkbenige driehoek: M op de y-as */
      const [s, c] = pick([[3, 9], [4, 8], [2, 4], [5, 5], [3, 1], [4, 2], [6, 4], [6, 8], [2, 1]]);
      const h = ri(-2, 2), k = ri(-2, 1), m = k + (c * c - s * s) / (2 * c);
      const A = [h - s, k], B = [h + s, k], C = [h, k + c];
      const kand = [[h, k], [h, k + c / 2], [h, m + 1], [h, m - 1]].filter(p => Math.abs(p[1] - m) > 1e-9);
      const uniek = []; kand.forEach(p => { if (!uniek.some(u => Math.abs(u[1] - p[1]) < 1e-9)) uniek.push(p); });
      const fouten = {};
      uniek.slice(0, 3).forEach(p => { const dA = afst(s, p[1] - k), dC = Math.abs(C[1] - p[1]);
        fouten[pt(p[0], p[1])] = `meet na: van ${pt(p[0], p[1])} naar A is ${isInt(dA) ? n(dA) : "ongeveer " + ong(dA)} en naar C is ${n(dC)}. Niet even ver, dus geen middelpunt van de omgeschreven cirkel.`; });
      const R = c - (m - k);
      const ligging = m < k - 1e-9 ? "M ligt onder AB, dus buiten de driehoek: ∠C is stomp." : Math.abs(m - k) < 1e-9 ? "M ligt precies op AB: ∠C is recht." : "M ligt binnen de driehoek.";
      return mc(`A${pt(A[0], A[1])}, B${pt(B[0], B[1])} en C${pt(C[0], C[1])}. Het middelpunt M van de omgeschreven cirkel ligt op de lijn x = ${n(h)}. Welk punt is M?`, pt(h, m), fouten,
        `Van ${pt(h, m)} naar C is ${n(R)} en naar A ook ${n(R)}: even ver.`, `MA = MB = MC = ${n(R)}. ${ligging}`); }
  ];

  /* ================================================================ 2.3 bissectrice */
  G.bissectrice_n1 = [
    () => { const x = 2 * ri(10, 85), L = pick(["A", "B", "C", "K", "P"]);
      return { t: "bouw", q: `∠${L} = ${x}°. Hoeveel graden is elk van de twee hoeken die de bissectrice van ∠${L} maakt?`, a: String(x / 2),
        w: "De bissectrice deelt de hoek precies doormidden.", meer: `${x} : 2 = ${x / 2}°. Samen weer ${x}°.` }; },
    () => { const x = 2 * ri(15, 80); if (x === 90 || x === 60) return null;
      return mc(`∠A = ${x}°. De bissectrice verdeelt ∠A in ∠A₁ en ∠A₂. Hoe groot is ∠A₁?`, `${x / 2}°`, {
          [`${x}°`]: `dat is de hele hoek. ∠A₁ is maar de helft: ${x} : 2 = ${x / 2}°.`,
          [`${180 - x}°`]: `dat is 180 − ${x}, de hoek ernaast. De bissectrice halveert ∠A zelf: ${x / 2}°.`,
          ["45°"]: `45° hoort alleen bij een rechte hoek van 90°. Hier is ∠A = ${x}°, dus ∠A₁ = ${x / 2}°.`
        }, `${x} : 2 = ${x / 2}°.`, "De bissectrice maakt twee gelijke hoeken: ∠A₁ = ∠A₂."); }
  ];

  G.bissectrice_n2 = [
    () => { const d = pick([1.5, 2, 2.5, 3, 3.5, 4, 4.5, 1.2, 2.8]);
      return { t: "bouw", q: `Punt P ligt op de bissectrice van ∠B. De afstand van P tot het ene been is ${n(d)} cm. Hoeveel cm is de afstand van P tot het andere been?`, a: a(d),
        w: "Elk punt van de bissectrice ligt even ver van beide benen.", meer: `Dus ook ${n(d)} cm, loodrecht gemeten.` }; },
    () => { const A = ri(25, 95), B = ri(25, 95), C = 180 - A - B; if (C < 20 || C % 2) return null;
      return { t: "velden", q: `In △ABC is ∠A = ${A}° en ∠B = ${B}°. Bereken ∠C en de hoeken die de bissectrice van ∠C maakt.`,
        velden: [{ label: "∠C =", a: String(C) }, { label: "elke deelhoek van ∠C =", a: String(C / 2) }],
        w: "De hoeken van een driehoek zijn samen 180°.", meer: `∠C = 180 − ${A} − ${B} = ${C}°. Half: ${C / 2}°.` }; }
  ];

  G.bissectrice_n3 = [
    () => { const A = 2 * ri(15, 50), B = 2 * ri(15, 50), C = 180 - A - B; if (C < 20) return null;
      const welk = pick(["AMB", "BMC", "AMC"]);
      const [h1, h2, n1, n2] = welk === "AMB" ? [A / 2, B / 2, "MAB", "MBA"] : welk === "BMC" ? [B / 2, C / 2, "MBC", "MCB"] : [A / 2, C / 2, "MAC", "MCA"];
      const ant = 180 - h1 - h2;
      return { t: "bouw", q: `In △ABC is ∠A = ${A}° en ∠B = ${B}°. M is het middelpunt van de ingeschreven cirkel. Hoeveel graden is ∠${welk}?`, a: String(ant),
        w: "M ligt op de bissectrices, dus de hoeken bij de hoekpunten worden gehalveerd." + (welk !== "AMB" ? ` ∠C = 180 − ${A} − ${B} = ${C}°.` : ""),
        meer: `∠${n1} = ${h1}° en ∠${n2} = ${h2}°. In die kleine driehoek: ∠${welk} = 180 − ${h1} − ${h2} = ${ant}°.` }; },
    () => { const r = pick([1, 1.5, 2, 2.5, 3]);
      return mc(`M is het middelpunt van de ingeschreven cirkel van △ABC. De afstand van M tot zijde AB is ${n(r)} cm. Hoe groot is de afstand van M tot zijde AC?`, `${n(r)} cm`, {
          [`${n(2 * r)} cm`]: `${n(2 * r)} is de diameter. M ligt even ver van alle drie de zijden: ${n(r)} cm.`,
          [`${n(r / 2)} cm`]: `M ligt op alle drie de bissectrices, dus even ver van elke zijde: ${n(r)} cm, niet de helft.`,
          ["dat hangt van de driehoek af"]: `nee: M is het snijpunt van de bissectrices en ligt daarom even ver van alle drie de zijden. Dat is de straal ${n(r)} cm.`
        }, "M ligt even ver van de drie zijden: dat is de straal van de ingeschreven cirkel.", "Daarom raakt de ingeschreven cirkel alle drie de zijden."); }
  ];

  /* ================================================================ 2.4 zwaartelijn en hoogtelijn */
  G["zwaartelijn-hoogtelijn_n1"] = [
    () => { const x1 = ri(-5, 3), y1 = ri(-4, 3), x2 = x1 + 2 * ri(-3, 4), y2 = y1 + 2 * ri(-3, 4); if (x1 === x2 && y1 === y2) return null;
      const L = pick([["A", "C", "B"], ["B", "C", "A"], ["K", "M", "L"], ["P", "R", "Q"]]);
      return { t: "velden", q: `De zwaartelijn door ${L[2]} gaat naar het midden van zijde ${L[0]}${L[1]}, met ${L[0]}${pt(x1, y1)} en ${L[1]}${pt(x2, y2)}. Welk punt is dat midden?`,
        velden: [{ label: "x =", a: a((x1 + x2) / 2) }, { label: "y =", a: a((y1 + y2) / 2) }],
        w: "Middel de coördinaten.", meer: `x: (${n(x1)} + ${nb(x2)}) : 2 = ${n((x1 + x2) / 2)}. y: (${n(y1)} + ${nb(y2)}) : 2 = ${n((y1 + y2) / 2)}.` }; },
    () => { const L = pick(["A", "B", "C"]), rest = ["A", "B", "C"].filter(x => x !== L).join("");
      const soort = pick(["zw", "ho", "bi", "ml"]);
      const tekst = { zw: `gaat door ${L} en door het midden van ${rest}`, ho: `gaat door ${L} en staat loodrecht op ${rest}`,
                      bi: `gaat door ${L} en deelt ∠${L} in twee gelijke hoeken`, ml: `gaat door het midden van ${rest}, staat er loodrecht op en gaat niet door ${L}` }[soort];
      const naam = { zw: `de zwaartelijn door ${L}`, ho: `de hoogtelijn door ${L}`, bi: `de bissectrice van ∠${L}`, ml: `de middelloodlijn van ${rest}` };
      const uitleg = { zw: "zwaartelijn = hoekpunt + midden van de overkant", ho: "hoogtelijn = hoekpunt + loodrecht op de overkant",
                       bi: "bissectrice = de hoek in twee gelijke stukken", ml: "middelloodlijn = midden + loodrecht, hoeft niet door een hoekpunt" };
      const f = {}; Object.keys(naam).filter(k => k !== soort).forEach(k => { f[naam[k]] = `${uitleg[k]}. Deze lijn ${tekst}: dat past bij ${naam[soort]}.`; });
      return mc(`Een lijn in △ABC ${tekst}. Welke lijn is dat?`, naam[soort], f, `${uitleg[soort]}.`, "Gebruik de lijnenkaart: door een hoekpunt? naar het midden? loodrecht?"); }
  ];

  G["zwaartelijn-hoogtelijn_n2"] = [
    () => { const x1 = ri(-5, 5), y1 = ri(-4, 4), x2 = ri(-5, 7), y2 = ri(-4, 6);
      let x3 = ri(-5, 7), y3 = ri(-4, 7);
      x3 += (3 - ((x1 + x2 + x3) % 3 + 3) % 3) % 3; y3 += (3 - ((y1 + y2 + y3) % 3 + 3) % 3) % 3;
      if (Math.abs((x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1)) < 6) return null;
      const zx = (x1 + x2 + x3) / 3, zy = (y1 + y2 + y3) / 3;
      return { t: "velden", q: `Bereken het zwaartepunt Z van △ABC met A${pt(x1, y1)}, B${pt(x2, y2)} en C${pt(x3, y3)}.`,
        velden: [{ label: "x van Z =", a: a(zx) }, { label: "y van Z =", a: a(zy) }],
        w: "Z is het gemiddelde van de drie hoekpunten.",
        meer: `x: (${n(x1)} + ${nb(x2)} + ${nb(x3)}) : 3 = ${n(x1 + x2 + x3)} : 3 = ${n(zx)}. y: (${n(y1)} + ${nb(y2)} + ${nb(y3)}) : 3 = ${n(y1 + y2 + y3)} : 3 = ${n(zy)}.` }; },
    () => { const kx = ri(-3, 2), ky = ri(-3, 2), p = ri(2, 6) * pick([1, -1]), q = ri(2, 5) * pick([1, -1]);
      return { t: "velden", q: `△KLM heeft hoekpunten K${pt(kx, ky)}, L${pt(kx + p, ky)} en M${pt(kx, ky + q)}. Wat is het hoogtepunt H?`,
        velden: [{ label: "x van H =", a: a(kx) }, { label: "y van H =", a: a(ky) }],
        w: "KL is horizontaal en KM verticaal: bij K is een rechte hoek.",
        meer: `KM is de hoogtelijn door M en KL die door L. Ze snijden in K${pt(kx, ky)}: bij een rechthoekige driehoek is het hoogtepunt het hoekpunt met de rechte hoek.` }; }
  ];

  G["zwaartelijn-hoogtelijn_n3"] = [
    () => { const ax = ri(-4, 3), ay = ri(-4, 3), dx = ri(-4, 5), dy = ri(-4, 5); if (ax === dx && ay === dy) return null;
      const bx = 2 * dx - ax, by = 2 * dy - ay;
      return { t: "velden", q: `In △ABC is CD een zwaartelijn met D op zijde AB. A${pt(ax, ay)} en D${pt(dx, dy)}. Wat zijn de coördinaten van B?`,
        velden: [{ label: "x van B =", a: a(bx) }, { label: "y van B =", a: a(by) }],
        w: "D is het midden van AB: vanuit D nog eens dezelfde stap als van A naar D.",
        meer: `Van A naar D: ${n(dx - ax)} in x en ${n(dy - ay)} in y. Nog een keer vanaf D: B${pt(bx, by)}. Controle: midden van A en B = ${pt((ax + bx) / 2, (ay + by) / 2)} = D.` }; },
    () => { const ax = ri(-4, 2), ay = ri(-3, 4), bx = ri(2, 7), by = ri(-3, 2), zx = ri(0, 3), zy = ri(0, 3);
      const cx = 3 * zx - ax - bx, cy = 3 * zy - ay - by;
      if (Math.abs((bx - ax) * (cy - ay) - (cx - ax) * (by - ay)) < 6 || Math.abs(cx) > 9 || Math.abs(cy) > 9) return null;
      return { t: "velden", q: `Van △ABC zijn A${pt(ax, ay)} en B${pt(bx, by)} hoekpunten. Het zwaartepunt is Z${pt(zx, zy)}. Bereken C.`,
        velden: [{ label: "x van C =", a: a(cx) }, { label: "y van C =", a: a(cy) }],
        w: `De drie x'en samen zijn 3 × ${n(zx)} = ${n(3 * zx)}, de drie y'en samen 3 × ${n(zy)} = ${n(3 * zy)}.`,
        meer: `x: ${n(3 * zx)} − ${nb(ax)} − ${nb(bx)} = ${n(cx)}. y: ${n(3 * zy)} − ${nb(ay)} − ${nb(by)} = ${n(cy)}. C${pt(cx, cy)}. Controle: het gemiddelde is weer Z.` }; },
    () => { const xa = ri(-2, 1), xb = xa + 2 * ri(3, 5), y0 = ri(-1, 1), xc = ri(xa - 2, xb + 2), yc = y0 + ri(3, 6), m = (xa + xb) / 2;
      if (xc === m) return null;
      const fig = F({ xmin: Math.min(xa, xc) - 1, xmax: Math.max(xb, xc) + 1, ymin: y0 - 1, ymax: yc + 1, rooster: true, assen: true, maxW: 260, maxH: 220, label: "driehoek ABC",
        items: [ { t: "poly", p: [[xa, y0], [xb, y0], [xc, yc]], fill: "#fde68a" }, { t: "punt", p: [xa, y0], label: "A", lp: [-10, -10] },
                 { t: "punt", p: [xb, y0], label: "B", lp: [8, -10] }, { t: "punt", p: [xc, yc], label: "C", lp: [10, -6] } ] });
      return { t: "velden", q: `△ABC met A${pt(xa, y0)}, B${pt(xb, y0)} en C${pt(xc, yc)}. AB is horizontaal. Bij welke x komen de <b>hoogtelijn</b> door C en de <b>zwaartelijn</b> door C op lijn AB uit?` + fig,
        velden: [{ label: "hoogtelijn door C: x =", a: a(xc) }, { label: "zwaartelijn door C: x =", a: a(m) }],
        w: "Hoogtelijn: loodrecht op AB, dus recht omlaag. Zwaartelijn: naar het midden van AB.",
        meer: `Recht onder C ligt x = ${n(xc)}${xc < xa || xc > xb ? " (buiten AB: de hoogte valt op het verlengde, de driehoek is stomphoekig)" : ""}. Het midden van AB is x = (${n(xa)} + ${nb(xb)}) : 2 = ${n(m)}.` }; }
  ];

  /* ================================================================ 2.5 oppervlakte driehoek */
  function scherpeDriehoek() {
    const h = pick(H_TWEE), lst = PER_H[h], i = ri(0, lst.length - 1); let j = ri(0, lst.length - 1); if (lst.length > 1 && j === i && Math.random() < 0.8) j = (i + 1) % lst.length;
    const [p, s1] = lst[i], [q, s2] = lst[j];
    if (p + q > 80 || p + q < 8) return null;
    return { h, p, q, s1, s2, z: p + q };
  }
  function stompeDriehoek() {
    const h = pick(H_TWEE), lst = PER_H[h].slice().sort((u, v) => u[0] - v[0]);
    if (lst.length < 2) return null;
    const i = ri(0, lst.length - 2), j = ri(i + 1, lst.length - 1);
    const [p, s1] = lst[i], [q, s2] = lst[j], z = q - p;
    if (z < 4 || q > 70) return null;
    return { h, p, q, s1, s2, z };
  }
  function figDriehoek(d, eenh, stomp, spiegel) {
    const X = x => spiegel ? (stomp ? d.q : d.z) - x : x;
    const P = [X(0), 0], Q = [X(d.z), 0], R = stomp ? [X(d.q), d.h] : [X(d.p), d.h], S = [R[0], 0];
    const items = [ { t: "poly", p: [P, Q, R], fill: stomp ? "#fed7aa" : "#fde68a" } ];
    if (stomp) items.push({ t: "seg", a: Q, b: S, kleur: "grijs", dash: true });
    items.push({ t: "seg", a: P, b: Q, kleur: "ink", label: String(d.z), weg: [R[0], d.h] },
      { t: "seg", a: P, b: R, kleur: "ink", label: String(stomp ? d.s2 : d.s1) }, { t: "seg", a: Q, b: R, kleur: "ink", label: String(stomp ? d.s1 : d.s2), weg: stomp ? P : [P[0], d.h / 2] },
      { t: "seg", a: R, b: S, kleur: "rood", dash: true, label: String(d.h), weg: stomp ? P : P },
      { t: "haaks", p: S, u: [(stomp ? (P[0] > S[0] ? 1 : -1) : 1), 0], v: [0, 1] },
      { t: "punt", p: P, label: "A", lp: [P[0] < Q[0] ? -10 : 10, 10] }, { t: "punt", p: Q, label: "B", lp: [P[0] < Q[0] ? (stomp ? -4 : 10) : (stomp ? 4 : -10), stomp ? 13 : 10] },
      { t: "punt", p: R, label: "C", lp: [0, -12] });
    const k = kader([P, Q, R, S], 0.14);
    return F(Object.assign(k, { maxW: 290, maxH: 190, items, label: "driehoek met maten in " + eenh }));
  }

  G["opp-driehoek_n1"] = [
    () => { const d = scherpeDriehoek(); if (!d) return null; const e = pick(["mm", "cm"]);
      return { t: "bouw", q: `Bereken de oppervlakte van △ABC in ${e}². (maten in ${e})` + figDriehoek(d, e, false, Math.random() < 0.5), a: a(d.z * d.h / 2),
        w: `Zijde AB = ${d.z} hoort bij hoogte ${d.h} (loodrecht).`, meer: `½ × ${d.z} × ${d.h} = ${n(d.z * d.h / 2)} ${e}². De schuine zijden ${d.s1} en ${d.s2} heb je niet nodig.` }; },
    () => { const ctx = pick([["Een driehoekige bandana", "cm", [50, 60, 70, 80], [25, 30, 35, 40]], ["Een driehoekig vlaggetje", "cm", [12, 14, 16, 20], [15, 18, 20, 25]],
                              ["Een driehoekig zeil", "m", [2, 2.4, 3, 3.5], [3, 3.5, 4, 4.5]], ["Een driehoekig bord", "dm", [6, 8, 9, 10], [5, 7, 8, 11]]]);
      const z = pick(ctx[2]), h = pick(ctx[3]), A = z * h / 2;
      return { t: "bouw", q: `${ctx[0]} heeft een zijde van ${n(z)} ${ctx[1]} en de hoogte bij die zijde is ${n(h)} ${ctx[1]}. Hoeveel ${ctx[1]}² is de oppervlakte?`, a: a(A),
        w: "opp. driehoek = ½ × zijde × bijbehorende hoogte.", meer: `½ × ${n(z)} × ${n(h)} = ${n(A)} ${ctx[1]}².` }; },
    () => { const z = ri(4, 16), h = ri(3, 12); if ((z * h) % 2 || z === h) return null; const A = z * h / 2, e = pick(["cm", "m", "mm"]);
      return mc(`Een driehoek heeft een zijde van ${z} ${e} en de bijbehorende hoogte is ${h} ${e}. Wat is de oppervlakte?`, `${n(A)} ${e}²`, {
          [`${z * h} ${e}²`]: `je vergat de ½. ${z} × ${h} = ${z * h} is de rechthoek eromheen; de driehoek is de helft.`,
          [`${z + h} ${e}²`]: `je telde ${z} + ${h} op. Oppervlakte is vermenigvuldigen: ½ × ${z} × ${h} = ${n(A)}.`,
          [`${n(A)} ${e}`]: `het getal klopt, maar oppervlakte is in ${e}², niet in ${e}.`
        }, `½ × ${z} × ${h} = ${n(A)} ${e}².`, "Eerst zijde × hoogte, dan de helft, en de eenheid in het kwadraat."); }
  ];

  G["opp-driehoek_n2"] = [
    () => { const [p, q, s] = pick(TRIP.filter(t => t[2] <= 50)), e = pick(["mm", "cm"]), sp = Math.random() < 0.5;
      const L = [0, 0], K = [sp ? -p : p, 0], M = [0, q];
      const fig = F(Object.assign(kader([L, K, M], 0.18), { maxW: 220, maxH: 200, label: "rechthoekige driehoek",
        items: [ { t: "poly", p: [L, K, M], fill: "#bbf7d0" }, { t: "seg", a: L, b: K, kleur: "ink", label: String(p) }, { t: "seg", a: L, b: M, kleur: "ink", label: String(q) },
                 { t: "seg", a: K, b: M, kleur: "ink", label: String(s) }, { t: "haaks", p: L, u: [sp ? -1 : 1, 0], v: [0, 1] },
                 { t: "punt", p: L, label: "L", lp: [sp ? 10 : -10, 10] }, { t: "punt", p: K, label: "K", lp: [sp ? -10 : 10, 10] }, { t: "punt", p: M, label: "M", lp: [sp ? 10 : -12, -4] } ] }));
      return { t: "bouw", q: `△KLM heeft een rechte hoek bij L. Bereken de oppervlakte in ${e}². (maten in ${e})` + fig, a: a(p * q / 2),
        w: "Bij een rechte hoek is de ene rechthoekszijde de hoogte bij de andere.", meer: `½ × ${p} × ${q} = ${n(p * q / 2)} ${e}². De schuine zijde ${s} doet niet mee.` }; },
    () => { const d = stompeDriehoek(); if (!d) return null; const e = pick(["mm", "cm"]);
      return { t: "bouw", q: `△ABC is stomphoekig; het verlengde van AB is gestippeld. Bereken de oppervlakte in ${e}². (maten in ${e})` + figDriehoek(d, e, true, Math.random() < 0.5), a: a(d.z * d.h / 2),
        w: `Zijde AB = ${d.z} met de hoogte ${d.h} buiten de driehoek.`, meer: `½ × ${d.z} × ${d.h} = ${n(d.z * d.h / 2)} ${e}². Het gestippelde verlengde (${d.p}) tel je niet bij de zijde.` }; },
    () => { /* rooster: één zijde horizontaal of verticaal */
      const W = 8, H = 4, b = ri(2, 5), x1 = ri(0, W - b), h = ri(2, H), cx = ri(0, W), boven = Math.random() < 0.5, draai = Math.random() < 0.35;
      let pts = boven ? [[x1, 0], [x1 + b, 0], [cx, h]] : [[x1, H], [x1 + b, H], [cx, H - h]];
      if (draai) pts = pts.map(p => [p[1], p[0]]);
      const fig = F({ xmin: 0, xmax: draai ? H : W, ymin: 0, ymax: draai ? W : H, rooster: true, pad: 16, maxW: draai ? 150 : 260, maxH: draai ? 260 : 140, label: "driehoek in een rooster",
        items: [ { t: "poly", p: pts, fill: "#fca5a5" } ] });
      const buiten = cx < x1 || cx > x1 + b;
      return { t: "bouw", q: "De roostervierkantjes zijn 1 bij 1 cm. Bereken de oppervlakte van de driehoek in cm²." + fig, a: a(b * h / 2),
        w: `Er ligt een zijde van ${b} ${draai ? "verticaal" : "horizontaal"}. De hoogte daarbij is ${h}.`,
        meer: `½ × ${b} × ${h} = ${n(b * h / 2)} cm².` + (buiten ? " De hoogte valt hier buiten de driehoek, op het verlengde van de zijde. Dat mag." : "") }; },
    () => { const d = stompeDriehoek(); if (!d) return null; const A = d.z * d.h / 2;
      return mc(`△ABC is stomphoekig. Welke oppervlakte klopt? (maten in mm)` + figDriehoek(d, "mm", true, Math.random() < 0.5), `${n(A)} mm²`, {
          [`${n((d.z + d.p) * d.h / 2)} mm²`]: `dat is ½ × ${d.z + d.p} × ${d.h}. Je telde het verlengde (${d.p}) bij de zijde. De zijde AB is maar ${d.z}.`,
          [`${n(d.z * d.h)} mm²`]: `dat is ${d.z} × ${d.h} zonder de ½. De driehoek is de helft: ${n(A)}.`,
          [`${n(d.s1 * d.s2 / 2)} mm²`]: `dat is ½ × ${d.s1} × ${d.s2}: twee schuine zijden. Die staan niet loodrecht op elkaar.`
        }, `½ × ${d.z} × ${d.h} = ${n(A)} mm².`, "Bij een stomphoekige driehoek valt de hoogte buiten de driehoek, maar de zijde blijft even lang."); }
  ];

  G["opp-driehoek_n3"] = [
    () => { const z = ri(4, 30), h = ri(3, 25), A = z * h / 2, vraag = pick(["h", "z"]);
      return vraag === "h"
        ? { t: "bouw", q: `Van △ABC is AB = ${z} cm en de oppervlakte is ${n(A)} cm². Hoeveel cm is de hoogte bij AB?`, a: String(h),
            w: "hoogte = 2 × opp : zijde.", meer: `2 × ${n(A)} = ${n(2 * A)} en ${n(2 * A)} : ${z} = ${h} cm. Controle: ½ × ${z} × ${h} = ${n(A)}.` }
        : { t: "bouw", q: `Van △PQR is de hoogte bij PQ ${h} cm en de oppervlakte ${n(A)} cm². Hoeveel cm is PQ?`, a: String(z),
            w: "zijde = 2 × opp : hoogte.", meer: `2 × ${n(A)} = ${n(2 * A)} en ${n(2 * A)} : ${h} = ${z} cm.` }; },
    () => { const z1 = ri(10, 36), h1 = ri(8, 30), dub = z1 * h1;
      const kand = []; for (let z2 = h1 + 1; z2 <= 60; z2++) if (dub % z2 === 0 && z2 !== z1) kand.push(z2);
      if (!kand.length) return null; const z2 = pick(kand), h2 = dub / z2;
      return { t: "velden", q: `In △ABC is BC = ${z1} mm en de hoogte bij BC is ${h1} mm. Verder is AC = ${z2} mm. Bereken de oppervlakte en de hoogte bij AC.`,
        velden: [{ label: "oppervlakte (mm²) =", a: a(dub / 2) }, { label: "hoogte bij AC (mm) =", a: a(h2) }],
        w: "Eerst de oppervlakte met BC en zijn hoogte, dan terugrekenen met AC.",
        meer: `opp = ½ × ${z1} × ${h1} = ${n(dub / 2)} mm². Hoogte bij AC: 2 × ${n(dub / 2)} = ${dub}, en ${dub} : ${z2} = ${n(h2)} mm.` }; },
    () => { const z = pick([20, 24, 30, 40]), h = pick([20, 25, 30, 40, 50]), N = pick([10, 20, 25, 40, 50]), cm2 = N * z * h / 2, m2 = cm2 / 10000;
      return { t: "bouw", q: `Voor een slinger knipt Storm ${N} driehoekige vlaggetjes. Elk vlaggetje heeft een zijde van ${z} cm en een hoogte van ${h} cm. Hoeveel m² stof is dat samen?`, a: a(m2),
        w: "Eerst één vlaggetje, dan keer het aantal, dan cm² naar m² (: 10 000).",
        meer: `Eén vlaggetje: ½ × ${z} × ${h} = ${n(z * h / 2)} cm². Samen ${N} × ${n(z * h / 2)} = ${n(cm2)} cm² = ${n(m2)} m².` }; }
  ];

  /* ================================================================ 2.6 parallellogram, trapezium, ruit */
  function figParallellogram(b, o, h, s, e) {
    const A = [0, 0], B = [b, 0], C = [b + o, h], D = [o, h], E = [o, 0];
    return F(Object.assign(kader([A, B, C, D], 0.12), { maxW: 290, maxH: 170, label: "parallellogram met maten in " + e,
      items: [ { t: "poly", p: [A, B, C, D], fill: "#c7d2fe" }, { t: "seg", a: A, b: B, kleur: "ink", label: String(b) }, { t: "seg", a: A, b: D, kleur: "ink", label: String(s) },
               { t: "seg", a: D, b: E, kleur: "rood", dash: true, label: String(h), weg: A }, { t: "haaks", p: E, u: [1, 0], v: [0, 1] },
               { t: "punt", p: A, label: "A", lp: [-10, 8] }, { t: "punt", p: B, label: "B", lp: [10, 8] }, { t: "punt", p: C, label: "C", lp: [10, -6] }, { t: "punt", p: D, label: "D", lp: [-8, -10] } ] }));
  }
  function parData() {
    const [o, h, s] = pick(TRIP.filter(t => t[2] <= 30).map(t => Math.random() < 0.5 ? t : [t[1], t[0], t[2]]));
    const lo = Math.max(8, o), hi = Math.min(50, 3 * h); if (hi < lo) return parData(); const b = ri(lo, hi); return { o, h, s, b };
  }

  G["opp-vierhoek_n1"] = [
    () => { const d = parData(), e = pick(["mm", "cm"]);
      return { t: "bouw", q: `Bereken de oppervlakte van parallellogram ABCD in ${e}². (maten in ${e})` + figParallellogram(d.b, d.o, d.h, d.s, e), a: String(d.b * d.h),
        w: `Zijde AB = ${d.b} met hoogte ${d.h}. Geen ½ en niet de schuine zijde ${d.s}.`, meer: `${d.b} × ${d.h} = ${d.b * d.h} ${e}². Verschuif het driehoekje links naar rechts: een rechthoek van ${d.b} bij ${d.h}.` }; },
    () => { /* trapezium */
      const h = pick(H_TWEE.filter(x => x <= 24)), [o1, s1] = pick(PER_H[h]), recht = Math.random() < 0.4;
      const [o2, s2] = recht ? [0, h] : pick(PER_H[h]), top = ri(4, 20), bot = top + o1 + o2, e = pick(["mm", "cm"]);
      if (bot > 75) return null;
      const P = [0, 0], Q = [bot, 0], R = [bot - o2, h], S = [o1, h], T = [o1, 0];
      const items = [ { t: "poly", p: [P, Q, R, S], fill: "#bae6fd" }, { t: "seg", a: P, b: Q, kleur: "ink", label: String(bot) }, { t: "seg", a: S, b: R, kleur: "ink", label: String(top) },
                      { t: "seg", a: P, b: S, kleur: "ink", label: String(s1) },
                      { t: "punt", p: P, label: "P", lp: [-10, 8] }, { t: "punt", p: Q, label: "Q", lp: [10, 8] }, { t: "punt", p: R, label: "R", lp: [10, -6] }, { t: "punt", p: S, label: "S", lp: [-8, -10] } ];
      if (recht) items.push({ t: "seg", a: Q, b: R, kleur: "ink", label: String(h) }, { t: "haaks", p: Q, u: [-1, 0], v: [0, 1] });
      else items.push({ t: "seg", a: Q, b: R, kleur: "ink", label: String(s2) }, { t: "seg", a: S, b: T, kleur: "rood", dash: true, label: String(h), weg: P }, { t: "haaks", p: T, u: [1, 0], v: [0, 1] });
      const fig = F(Object.assign(kader([P, Q, R, S], 0.12), { maxW: 280, maxH: 170, label: "trapezium met maten in " + e, items }));
      const A = (bot + top) * h / 2;
      return { t: "bouw", q: `PQ en SR zijn evenwijdig. Bereken de oppervlakte van trapezium PQRS in ${e}². (maten in ${e})` + fig, a: a(A),
        w: `½ × (som van de evenwijdige zijden) × hoogte = ½ × (${bot} + ${top}) × ${h}.`, meer: `${bot} + ${top} = ${bot + top}, × ${h} = ${(bot + top) * h}, de helft is ${n(A)} ${e}². De schuine zijden doen niet mee.` }; },
    () => { const d = parData(), A = d.b * d.h;
      return mc(`Een parallellogram heeft zijde ${d.b} mm, bijbehorende hoogte ${d.h} mm en schuine zijde ${d.s} mm. Wat is de oppervlakte?`, `${A} mm²`, {
          [`${d.b * d.s} mm²`]: `dat is ${d.b} × ${d.s}, met de schuine zijde (de fout van Amir). Duw het parallellogram scheef: de schuine zijde wordt langer, de oppervlakte niet. Gebruik de hoogte ${d.h}.`,
          [`${n(A / 2)} mm²`]: `dat is ½ × ${d.b} × ${d.h}. Bij een parallellogram is er geen ½: het is twee driehoeken.`,
          [`${2 * (d.b + d.s)} mm²`]: `dat is de omtrek: ${d.b} + ${d.s} + ${d.b} + ${d.s}. Oppervlakte is zijde × hoogte.`
        }, `${d.b} × ${d.h} = ${A} mm².`, "Parallellogram: zijde × bijbehorende hoogte, zonder ½ en zonder schuine zijde."); }
  ];

  G["opp-vierhoek_n2"] = [
    () => { const d1 = pick([6, 8, 10, 12, 14, 16, 18, 20, 24, 30]), d2 = pick([4, 5, 6, 8, 9, 10, 12, 15]); if (d1 === d2) return null; const e = pick(["cm", "mm", "dm"]);
      return { t: "bouw", q: `Een ruit heeft diagonalen van ${d1} ${e} en ${d2} ${e}. Hoeveel ${e}² is de oppervlakte?`, a: a(d1 * d2 / 2),
        w: "opp. ruit = ½ × d₁ × d₂.", meer: `½ × ${d1} × ${d2} = ${n(d1 * d2 / 2)} ${e}². De ruit is de helft van de rechthoek van ${d1} bij ${d2} eromheen.` }; },
    () => { const soort = pick(["cm2m2", "mm2cm2", "m2cm2", "cm2mm2"]);
      if (soort === "cm2m2") { const v = pick([2500, 4000, 7500, 12000, 15000, 600, 35000]); return { t: "bouw", q: `Een lap stof is ${groot(v)} cm². Hoeveel m² is dat?`, a: a(v / 10000),
          w: "1 m² = 100 cm × 100 cm = 10 000 cm².", meer: `${groot(v)} : 10 000 = ${n(v / 10000)} m². Delen door 100 is fout: 1 m² is 100 × 100 cm².` }; }
      if (soort === "mm2cm2") { const v = pick([250, 400, 1200, 860, 3500, 75]); return { t: "bouw", q: `Een plaatje is ${groot(v)} mm². Hoeveel cm² is dat?`, a: a(v / 100),
          w: "1 cm² = 10 mm × 10 mm = 100 mm².", meer: `${groot(v)} : 100 = ${n(v / 100)} cm².` }; }
      if (soort === "m2cm2") { const v = pick([0.5, 1.2, 2, 0.25, 3.5]); return { t: "bouw", q: `Een tafelblad is ${n(v)} m². Hoeveel cm² is dat?`, a: a(v * 10000),
          w: "1 m² = 10 000 cm².", meer: `${n(v)} × 10 000 = ${groot(v * 10000)} cm².` }; }
      const v = pick([3, 4.5, 12, 0.8, 25]); return { t: "bouw", q: `Een postzegel is ${n(v)} cm². Hoeveel mm² is dat?`, a: a(v * 100),
        w: "1 cm² = 100 mm².", meer: `${n(v)} × 100 = ${n(v * 100)} mm².` }; },
    () => { const z = ri(6, 25), h = ri(4, 20); if (z === h) return null; const A = z * h, e = pick(["mm", "cm", "m"]);
      return mc(`Een parallellogram heeft zijde ${z} ${e} en bijbehorende hoogte ${h} ${e}. Welk antwoord is <b>helemaal</b> goed?`, `${A} ${e}²`, {
          [`${A} ${e}`]: `het getal klopt, maar ${e} is een lengte. Oppervlakte is ${e} × ${e} = ${e}².`,
          [`${A}`]: `zonder eenheid weet niemand of het ${A} mm², cm² of m² is. Op een toets kost dat een punt.`,
          [`${n(A / 2)} ${e}²`]: `dat is ½ × ${z} × ${h}. Bij een parallellogram is er geen ½.`
        }, `${z} × ${h} = ${A} ${e}².`, "Getal én eenheid in het kwadraat."); },
    () => { const p = ri(8, 40), q = ri(4, 30), h = ri(5, 25); if (p === q || ((p + q) * h) % 2) return null; const A = (p + q) * h / 2;
      return mc(`Een trapezium heeft evenwijdige zijden van ${p} en ${q} cm, en hoogte ${h} cm. Wat is de oppervlakte?`, `${n(A)} cm²`, {
          [`${n((p + q) * h)} cm²`]: `je vergat de ½. (${p} + ${q}) × ${h} = ${(p + q) * h} zijn twee trapezia samen.`,
          [`${n(p * q * h / 2)} cm²`]: `je vermenigvuldigde de zijden: ½ × ${p} × ${q} × ${h}. Dat is groter dan de rechthoek van ${Math.max(p, q)} bij ${h} (${Math.max(p, q) * h}), en dat kan niet. Tel de evenwijdige zijden op.`,
          [`${n(Math.max(p, q) * h)} cm²`]: `dat is ${Math.max(p, q)} × ${h}, een rechthoek met de lange zijde. Het trapezium is kleiner, want de bovenkant is korter.`
        }, `½ × (${p} + ${q}) × ${h} = ${n(A)} cm².`, "Optellen binnen de haakjes, dan keer de hoogte, dan de helft."); }
  ];

  G["opp-vierhoek_n3"] = [
    () => { const p = ri(4, 20), q = ri(3, 16), h = pick([3, 4, 5, 6, 7, 8, 8.5, 9, 10, 12]); if (p === q) return null; const A = (p + q) * h / 2;
      if (!isInt(A * 2)) return null;
      return { t: "bouw", q: `Een trapezium heeft evenwijdige zijden van ${p} cm en ${q} cm. De oppervlakte is ${n(A)} cm². Hoeveel cm is de hoogte?`, a: a(h),
        w: `½ × (${p} + ${q}) × h = ${n(A)}, dus ${n((p + q) / 2)} × h = ${n(A)}.`, meer: `h = ${n(A)} : ${n((p + q) / 2)} = ${n(h)} cm. Controle: ½ × ${p + q} × ${n(h)} = ${n(A)}.` }; },
    () => { const q = ri(4, 16), x = ri(2, 15), h = pick([2, 4, 6, 8, 10]); if (x === q) return null; const A = (q + x) * h / 2;
      return { t: "bouw", q: `Van trapezium PQRS is PS evenwijdig met QR. QR = ${q} cm, de hoogte is ${h} cm en de oppervlakte ${n(A)} cm². Hoeveel cm is PS?`, a: String(x),
        w: `½ × (${q} + PS) × ${h} = ${n(A)}, dus (${q} + PS) × ${h / 2} = ${n(A)}.`, meer: `${q} + PS = ${n(A)} : ${h / 2} = ${q + x}, dus PS = ${x} cm.` }; },
    () => { const d1 = pick([10, 12, 16, 20, 24, 30, 40, 60]), d2 = pick([6, 8, 10, 12, 15, 20, 25, 50]); if (d1 === d2) return null; const A = d1 * d2 / 2;
      return { t: "bouw", q: `Een ruit heeft een diagonaal van ${d1} cm en een oppervlakte van ${n(A)} cm². Hoeveel cm is de andere diagonaal?`, a: String(d2),
        w: `½ × ${d1} × d = ${n(A)}, dus ${d1 / 2} × d = ${n(A)}.`, meer: `d = ${n(A)} : ${d1 / 2} = ${d2} cm. Controle: ½ × ${d1} × ${d2} = ${n(A)}.` }; },
    () => { const z1 = ri(4, 20), h1 = ri(2, 15), dub = z1 * h1;
      const kand = []; for (let z2 = h1 + 1; z2 <= 30; z2++) if (dub % z2 === 0 && z2 !== z1 && dub / z2 <= z1) kand.push(z2);
      if (!kand.length) return null; const z2 = pick(kand), h2 = dub / z2;
      return { t: "velden", q: `Parallellogram PQRS: SR = ${z1} cm en de hoogte bij SR is ${h1} cm. Verder is PS = ${z2} cm. Bereken de oppervlakte en de hoogte bij PS.`,
        velden: [{ label: "oppervlakte (cm²) =", a: String(dub) }, { label: "hoogte bij PS (cm) =", a: a(h2) }],
        w: "Eerst de oppervlakte met SR en zijn hoogte. Dan delen door PS.", meer: `${z1} × ${h1} = ${dub} cm². Hoogte bij PS = ${dub} : ${z2} = ${n(h2)} cm.` }; }
  ];

  /* ================================================================ 2.6 samengestelde figuren */
  G["opp-samengesteld_n1"] = [
    () => { const w = ri(6, 14) * 2, h1 = ri(Math.ceil(w / 3), Math.ceil(w / 3) + 6), h2 = ri(Math.max(3, Math.ceil(w / 5)), Math.ceil(w / 5) + 4), nok = ri(Math.ceil(w / 4), Math.floor(3 * w / 4)), e = pick(["mm", "cm"]);
      const pts = [[0, 0], [w, 0], [w, h1], [nok, h1 + h2], [0, h1]];
      const fig = F(Object.assign(kader(pts, 0.14), { maxW: 220, maxH: 200, label: "huisje",
        items: [ { t: "poly", p: pts, fill: "#fecdd3" }, { t: "seg", a: [0, h1], b: [w, h1], kleur: "grijs", dash: true, dik: 1.4 },
                 { t: "seg", a: [0, 0], b: [w, 0], kleur: "ink", label: String(w) }, { t: "seg", a: [0, 0], b: [0, h1], kleur: "ink", label: String(h1) },
                 { t: "seg", a: [nok, h1 + h2], b: [nok, h1], kleur: "rood", dash: true, label: String(h2), weg: [nok < w / 2 ? 0 : w, h1 + h2] },
                 { t: "haaks", p: [nok, h1], u: [1, 0], v: [0, 1] } ] }));
      const R = w * h1, D = w * h2 / 2;
      return { t: "stap", opgave: `Bereken de oppervlakte van het huisje. (maten in ${e})` + fig,
        stappen: [ { prompt: `Oppervlakte van de rechthoek (${e}²)?`, a: String(R), hints: [`De rechthoek is ${w} breed en ${h1} hoog.`, `${w} × ${h1} = ${R}`] },
                   { prompt: `Oppervlakte van het dak (${e}²)?`, a: a(D), hints: [`Het dak is een driehoek met zijde ${w} en hoogte ${h2}.`, `½ × ${w} × ${h2} = ${n(D)}`] },
                   { prompt: `Oppervlakte van het hele huisje (${e}²)?`, a: a(R + D), hints: ["Tel de twee stukken op.", `${R} + ${nb(D)} = ${n(R + D)}`] } ],
        w: "Splitsen: rechthoek + driehoek.", meer: `${R} + ${nb(D)} = ${n(R + D)} ${e}². Het dak gebruikt dezelfde zijde (${w}) als de rechthoek.` }; },
    () => { const z = ri(3, 10), h = ri(2, 8), vorm = pick(["vierkant", "rechthoek"]), b = vorm === "vierkant" ? z : ri(2, 9);
      const R = z * b, D = z * h / 2;
      return { t: "bouw", q: `Een figuur bestaat uit een ${vorm} van ${z} bij ${b} cm met daarop een driehoek met zijde ${z} cm en hoogte ${h} cm. Hoeveel cm² is de figuur?`, a: a(R + D),
        w: `Splitsen: ${vorm} + driehoek.`, meer: `${z} × ${b} = ${R} en ½ × ${z} × ${h} = ${n(D)}. Samen ${n(R + D)} cm².` }; }
  ];

  function lVorm() {
    const W = ri(6, 10), H = ri(5, 8), cw = ri(2, W - 2), ch = ri(1, H - 2);
    const pts = [[0, 0], [W, 0], [W, H - ch], [W - cw, H - ch], [W - cw, H], [0, H]];
    const fig = F(Object.assign(kader(pts, 0.17), { maxW: 240, maxH: 200, label: "L-vorm",
      items: [ { t: "poly", p: pts, fill: "#fbcfe8", op: 0.75 },
        { t: "seg", a: [0, 0], b: [W, 0], kleur: "ink", label: String(W) }, { t: "seg", a: [0, 0], b: [0, H], kleur: "ink", label: String(H) },
        { t: "seg", a: [W, 0], b: [W, H - ch], kleur: "ink", label: String(H - ch), weg: [0, 0] }, { t: "seg", a: [W, H - ch], b: [W - cw, H - ch], kleur: "ink", label: String(cw), weg: [W / 2, 0] },
        { t: "seg", a: [W - cw, H - ch], b: [W - cw, H], kleur: "ink", label: String(ch), weg: [W, H] }, { t: "seg", a: [W - cw, H], b: [0, H], kleur: "ink", label: String(W - cw), weg: [0, 0] } ] }));
    return { W, H, cw, ch, fig };
  }
  G["opp-samengesteld_n2"] = [
    () => { const L = lVorm(), A = L.W * L.H - L.cw * L.ch;
      return { t: "bouw", q: "Bereken de oppervlakte van deze L-vorm in cm². (maten in cm)" + L.fig, a: String(A),
        w: "Aanvullen tot een rechthoek en het hoekje aftrekken, of splitsen in twee rechthoeken.",
        meer: `Aanvullen: ${L.W} × ${L.H} − ${L.cw} × ${L.ch} = ${L.W * L.H} − ${L.cw * L.ch} = ${A}. Splitsen: ${L.W} × ${L.H - L.ch} + ${L.W - L.cw} × ${L.ch} = ${L.W * (L.H - L.ch)} + ${(L.W - L.cw) * L.ch} = ${A} cm².` }; },
    () => { const W = ri(6, 12), H = ri(4, 8), tw = ri(2, W - 2), th = ri(1, H - 1);
      const pts = [[0, 0], [W, 0], [W, H - th], [W - tw, H], [0, H]];
      const fig = F(Object.assign(kader(pts, 0.15), { maxW: 260, maxH: 190, label: "vijfhoek in een rechthoek",
        items: [ { t: "poly", p: pts, fill: "#bbf7d0", op: 0.7 }, { t: "seg", a: [W - tw, H], b: [W, H], kleur: "grijs", dash: true, dik: 1.4 }, { t: "seg", a: [W, H], b: [W, H - th], kleur: "grijs", dash: true, dik: 1.4 },
                 { t: "seg", a: [0, 0], b: [W, 0], kleur: "ink", label: String(W) }, { t: "seg", a: [0, 0], b: [0, H], kleur: "ink", label: String(H) },
                 { t: "seg", a: [W, 0], b: [W, H - th], kleur: "ink", label: String(H - th), weg: [0, H / 2] }, { t: "seg", a: [0, H], b: [W - tw, H], kleur: "ink", label: String(W - tw), weg: [W / 2, 0] } ] }));
      const R = W * H, D = tw * th / 2;
      return { t: "velden", q: "Bereken de oppervlakte van de vijfhoek door aan te vullen tot een rechthoek. (maten in cm)" + fig,
        velden: [{ label: "grote rechthoek (cm²) =", a: String(R) }, { label: "driehoekje dat eraf moet (cm²) =", a: a(D) }, { label: "vijfhoek (cm²) =", a: a(R - D) }],
        w: `Rechthoek ${W} × ${H}, min het driehoekje rechtsboven.`,
        meer: `Het driehoekje is ${W} − ${W - tw} = ${tw} breed en ${H} − ${H - th} = ${th} hoog: ½ × ${tw} × ${th} = ${n(D)}. Dus ${R} − ${nb(D)} = ${n(R - D)} cm².` }; },
    () => { const L = lVorm(), A = L.W * L.H - L.cw * L.ch, dubbel = L.W * (L.H - L.ch) + (L.W - L.cw) * L.H, omtrek = 2 * (L.W + L.H);
      return mc("Wat is de oppervlakte van deze L-vorm? (maten in cm)" + L.fig, `${A} cm²`, {
          [`${L.W * L.H} cm²`]: `dat is de hele rechthoek ${L.W} × ${L.H}. Rechtsboven ontbreekt nog een hoekje van ${L.cw} × ${L.ch} = ${L.cw * L.ch}.`,
          [`${dubbel} cm²`]: `dat is ${L.W} × ${L.H - L.ch} + ${L.W - L.cw} × ${L.H}. Zo tel je het stuk van ${L.W - L.cw} bij ${L.H - L.ch} twee keer. Splits zonder overlap.`,
          [`${omtrek} cm²`]: `dat is de omtrek (de rand, ${omtrek} cm). Oppervlakte is de binnenkant.`
        }, `${L.W} × ${L.H} − ${L.cw} × ${L.ch} = ${A} cm².`, "Aanvullen of splitsen geeft hetzelfde, als je niets dubbel telt."); }
  ];

  G["opp-samengesteld_n3"] = [
    () => { const W = pick([6, 8, 10, 12]), H = pick([2.5, 3, 4]), h2 = pick([1.5, 2, 3]), p = pick([0.1, 0.2, 0.25, 0.5]), blik = pick([1, 2.5, 5]);
      const R = W * H, D = W * h2 / 2, A = R + D, L = Math.round(A * p * 10000) / 10000, nb = Math.ceil(L / blik - 1e-9);
      if (isInt(L / blik)) return null;
      return { t: "stap", opgave: `Een gevel is een rechthoek van ${W} m breed en ${n(H)} m hoog, met daarop een driehoek met zijde ${W} m en hoogte ${n(h2)} m. Per m² is ${n(p)} liter verf nodig. Verf zit in blikken van ${n(blik)} liter.`,
        stappen: [ { prompt: "Oppervlakte van de hele gevel (m²)?", a: a(A), hints: [`Rechthoek ${W} × ${n(H)} = ${n(R)}.`, `Driehoek ½ × ${W} × ${n(h2)} = ${n(D)}. Samen ${n(A)}.`] },
                   { prompt: "Hoeveel liter verf is nodig?", a: a(L), hints: ["m² × liter per m²", `${n(A)} × ${n(p)} = ${n(L)}`] },
                   { prompt: "Hoeveel blikken moet je kopen?", a: String(nb), hints: [`${n(L)} : ${n(blik)} = ${n(Math.round(L / blik * 100) / 100)}`, "Een stukje blik kun je niet kopen: naar boven afronden."] } ],
        w: "Eerst de oppervlakte, dan de liters, dan de blikken (naar boven afronden).",
        meer: `${n(A)} m² × ${n(p)} = ${n(L)} liter. Met ${nb - 1} blikken heb je ${n((nb - 1) * blik)} liter: te weinig. Dus ${nb} blikken.` }; },
    () => { const l = pick([1.8, 2, 2.2, 2.5]), b = pick([1, 1.2, 1.4, 1.5]), h = pick([0.8, 1, 1.2]);
      const grond = l * b, kop = b * h / 2, tot = grond + 2 * kop;
      return { t: "bouw", q: `Een tentje heeft een grondzeil van ${n(l)} m bij ${n(b)} m en twee driehoekige kopse kanten, elk met zijde ${n(b)} m en hoogte ${n(h)} m. Hoeveel m² zijn het grondzeil en de twee kopse kanten samen?`, a: a(tot),
        w: "Grondzeil (rechthoek) + 2 driehoeken.", meer: `Grondzeil ${n(l)} × ${n(b)} = ${n(grond)} m². Eén kopse kant ½ × ${n(b)} × ${n(h)} = ${n(kop)} m², twee dus ${n(2 * kop)}. Samen ${n(tot)} m².` }; },
    () => { const z = pick([6, 8, 10]), boven = z + pick([2, 4, 6]), h = pick([10, 12, 15, 20]);
      const bodem = z * z, zij = (z + boven) * h / 2, tot = bodem + 4 * zij;
      return { t: "bouw", q: `Een bakje van karton heeft een vierkante bodem van ${z} bij ${z} cm en vier gelijke zijkanten in de vorm van een trapezium: onder ${z} cm, boven ${boven} cm, hoogte ${h} cm. Hoeveel cm² karton is het bakje?`, a: a(tot),
        w: "Bodem + 4 trapezia.", meer: `Bodem ${z} × ${z} = ${bodem}. Eén zijkant ½ × (${z} + ${boven}) × ${h} = ${n(zij)}, vier dus ${n(4 * zij)}. Samen ${n(tot)} cm².` }; }
  ];

  /* Sjablonen die toevallig een ongeschikte trekking doen (null), proberen het zelf opnieuw. */
  const herhaal = fn => () => { for (let i = 0; i < 60; i++) { const q = fn(); if (q) return q; } return null; };
  Object.keys(G).forEach(k => { G[k] = G[k].map(herhaal); });

  window.GENERATORS = G;
})();
