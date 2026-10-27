'use strict';
/* =========================================================================
   WISKUNDE: tekenkern (canoniek: tools/speelles-engine/wiskunde/teken.js)
   Familie A, variant meetkunde (eerst gebruikt door wiskunde H2 Afstand en oppervlakte).
   Eén globale WK. Bouwstenen staan in vis-afstand.js en vis-opp.js (elk in een IIFE).

   - WK.G: pure meetkunde op punten {x, y} (wereld-eenheden, y omhoog):
       d, midden, proj (loodrechte projectie op lijn ab), dLijn, dStuk, snij (twee lijnen),
       omcentrum, incentrum, inStraal, zwaartepunt, hoogtepunt, hoek (graden), opp (veelhoek),
       binnenDriehoek, rond(x, n), plus(a,b), min(a,b), maal(a,k), eenheid(a), loodrechtOp(a).
   - WK.vlak({xmin, xmax, ymin, ymax, s, rooster, assen, stap, titel}) -> V
       Een tekenvlak als 'ruitjespapier' (altijd licht, ook in donkere modus: het is papier).
       s = viewBox-eenheden per wereld-eenheid (32 geeft op 390 px ongeveer 1 cm per hokje).
       V.svg (element), V.X(x), V.Y(y), V.wereld(evt) -> {x,y}, V.binnen(p)
       Lagen (g-elementen): V.laag.achter, .gebied, .rooster, .figuur, .meet, .punten, .top
       V.zet(laag, markup) vervangt, V.voeg(laag, markup) voegt toe (laag = naam of element).
       Markup-bouwers (geven een svg-string in wereldcoördinaten):
         punt(p, {label, kleur, r, lx, ly}), stuk(a, b, {kleur, dik, stip, pijl}),
         lijn(a, b, opts) (oneindig, geknipt op het vlak), halflijn(a, b, opts),
         cirkel(m, r, {kleur, vul, dik, stip}), veelhoek(pts, {vul, kleur, dik, stip}),
         rechteHoek(o, a, b, {maat}), boog(a, o, b, {n, kleur}), streepjes(a, b, n),
         maat(a, b, tekst, {kant, kleur}), tekst(p, t, {s, kleur, anker, dx, dy, vet}),
         strook(a, b, d, {vul}) (alle punten op afstand < d van lijn ab), halfvlak(a, b, kantPunt, {vul}).
       V.handvat(p, {kleur, label, vorm}) -> element in laag punten, met .zet(p), .p,
         en een onzichtbare raakcirkel van 26 eenheden (≥ 48 px op telefoonbreedte).
       V.sleep(handvat, {snap, beperk, beweeg, los}) maakt het sleepbaar (pointer events).
         snap: rasterstap in wereld-eenheden (0 = vrij), beperk(p) -> p, beweeg(p), los(p).
   - WK.gids: Otto de otter met pilotenbril (svg 100x100). WK.merk (24x24, wit).
   - WK.baas({vorm, kleur, kleur2, extra, mond, ogen}) -> <svg> 120x120. vormen: blob, driehoek, passer, lat, wolk.
   - WK.badge.<naam>() -> markup 100x100 (album: helikopter, passer, geodriehoek, schaar, stof,
       kaart, balans, cirkel, lijnen, rooster, trofee).
   - WK.kaart({aan, labels}) -> markup 334x200: het eiland met zeven gebieden (Vk, 2.1-2.6).
   - WK.defs(): één keer aanroepen (gedeelde gradients voor badges en kaart).
   Kleuren: punten en figuren in vaste kleuren (WK.K), het papier is altijd licht.
   ========================================================================= */
const WK = (() => {
  /* ---------- kleur ---------- */
  const rgb = c => { const n = parseInt(c.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const hx = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => { const A = rgb(a), B = rgb(b); return hx(A.map((x, i) => x + (B[i] - x) * t)); };
  const donker = (c, t = .3) => mix(c, '#14101A', t);
  const licht = (c, t = .3) => mix(c, '#FFFFFF', t);
  let nr = 0; const uid = p => 'wk' + p + (++nr);
  const lin = (id, c, { x1 = 0, y1 = 0, x2 = 1, y2 = 1, ds = .32, dl = .3 } = {}) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${licht(c, dl)}"/><stop offset=".5" stop-color="${c}"/><stop offset="1" stop-color="${donker(c, ds)}"/></linearGradient>`;
  const rad = (id, c, { cx = .36, cy = .3, r = .8, ds = .28, dl = .32 } = {}) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"><stop offset="0" stop-color="${licht(c, dl)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${donker(c, ds)}"/></radialGradient>`;

  /* vaste kleuren: zelfde betekenis in alle lessen */
  const K = {
    inkt: '#2B1E3A', zacht: '#6B5E78', rooster: '#BFD8EE', roosterDik: '#93BCE0', papier: '#FFFEF8',
    punt: '#EA580C', puntB: '#2563EB', puntC: '#16A34A', probe: '#7C3AED',
    cirkel: '#2563EB', lijn: '#0F766E', goed: '#16A34A', fout: '#DC2626',
    middelloodlijn: '#DB2777', bissectrice: '#7C3AED', zwaartelijn: '#D97706', hoogtelijn: '#0891B2',
    binnen: '#FDE68A', strook: '#BAE6FD', stof: '#F472B6', stof2: '#FBCFE8',
  };

  /* ---------- meetkunde ---------- */
  const plus = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
  const min = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
  const maal = (a, k) => ({ x: a.x * k, y: a.y * k });
  const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const eenheid = a => { const l = Math.hypot(a.x, a.y) || 1; return { x: a.x / l, y: a.y / l }; };
  const loodrechtOp = a => ({ x: -a.y, y: a.x });
  const midden = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const proj = (p, a, b) => { const v = min(b, a), t = ((p.x - a.x) * v.x + (p.y - a.y) * v.y) / (v.x * v.x + v.y * v.y || 1); return { x: a.x + t * v.x, y: a.y + t * v.y, t }; };
  const dLijn = (p, a, b) => d(p, proj(p, a, b));
  const dStuk = (p, a, b) => { const q = proj(p, a, b), t = Math.max(0, Math.min(1, q.t)); return d(p, { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) }); };
  const snij = (a1, a2, b1, b2) => {
    const r = min(a2, a1), s = min(b2, b1), n = r.x * s.y - r.y * s.x;
    if (Math.abs(n) < 1e-9) return null;
    const t = ((b1.x - a1.x) * s.y - (b1.y - a1.y) * s.x) / n;
    return { x: a1.x + t * r.x, y: a1.y + t * r.y };
  };
  const omcentrum = (a, b, c) => { const m1 = midden(a, b), m2 = midden(b, c); return snij(m1, plus(m1, loodrechtOp(min(b, a))), m2, plus(m2, loodrechtOp(min(c, b)))); };
  const incentrum = (a, b, c) => { const la = d(b, c), lb = d(a, c), lc = d(a, b), s = la + lb + lc; return { x: (la * a.x + lb * b.x + lc * c.x) / s, y: (la * a.y + lb * b.y + lc * c.y) / s }; };
  const inStraal = (a, b, c) => dLijn(incentrum(a, b, c), a, b);
  const zwaartepunt = (a, b, c) => ({ x: (a.x + b.x + c.x) / 3, y: (a.y + b.y + c.y) / 3 });
  const hoogtepunt = (a, b, c) => snij(a, plus(a, loodrechtOp(min(c, b))), b, plus(b, loodrechtOp(min(c, a))));
  const hoek = (a, o, b) => { const u = min(a, o), v = min(b, o); return Math.acos(Math.max(-1, Math.min(1, (u.x * v.x + u.y * v.y) / ((Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y)) || 1)))) * 180 / Math.PI; };
  const opp = pts => Math.abs(pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + p.x * q.y - q.x * p.y; }, 0)) / 2;
  const binnenDriehoek = (p, a, b, c) => { const z = (u, v, w) => (v.x - u.x) * (w.y - u.y) - (v.y - u.y) * (w.x - u.x); const s1 = z(a, b, p), s2 = z(b, c, p), s3 = z(c, a, p); return (s1 >= 0 && s2 >= 0 && s3 >= 0) || (s1 <= 0 && s2 <= 0 && s3 <= 0); };
  const rond = (x, n = 1) => { const f = 10 ** n; return Math.round(x * f) / f; };
  const G = { d, midden, proj, dLijn, dStuk, snij, omcentrum, incentrum, inStraal, zwaartepunt, hoogtepunt, hoek, opp, binnenDriehoek, rond, plus, min, maal, eenheid, loodrechtOp };
  /* getal in NL-notatie: 2.5 -> "2,5" */
  const nl = (x, n = 1) => String(rond(x, n)).replace('.', ',');

  /* ---------- het tekenvlak ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, a = {}) => { const el = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) if (v != null) el.setAttribute(k, v); return el; };
  function vlak({ xmin = -1, xmax = 9, ymin = -1, ymax = 7, s = 32, rooster = true, assen = false, stap = 1, titel = '' } = {}) {
    const W = (xmax - xmin) * s, H = (ymax - ymin) * s;
    const X = x => (x - xmin) * s, Y = y => (ymax - y) * s;
    const svg = mk('svg', { viewBox: `0 0 ${W} ${H}`, class: 'wk-svg', role: 'img', 'aria-label': titel || 'tekening' });
    const laag = {};
    ['achter', 'gebied', 'rooster', 'figuur', 'meet', 'punten', 'top'].forEach(n => { laag[n] = mk('g', { class: 'wk-l-' + n }); svg.append(laag[n]); });
    /* papier */
    laag.achter.innerHTML = `<rect width="${W}" height="${H}" rx="14" fill="${K.papier}"/>`;
    if (rooster) {
      let r = '';
      for (let x = Math.ceil(xmin / stap) * stap; x <= xmax + 1e-9; x += stap) r += `<path d="M${X(x)} 0 V${H}" stroke="${Math.abs(x % 5) < 1e-9 ? K.roosterDik : K.rooster}" stroke-width="1"/>`;
      for (let y = Math.ceil(ymin / stap) * stap; y <= ymax + 1e-9; y += stap) r += `<path d="M0 ${Y(y)} H${W}" stroke="${Math.abs(y % 5) < 1e-9 ? K.roosterDik : K.rooster}" stroke-width="1"/>`;
      laag.rooster.innerHTML = r;
    }
    if (assen && xmin < 0 && xmax > 0 && ymin < 0 && ymax > 0) {
      let a = `<path d="M0 ${Y(0)} H${W - 2} M${X(0)} ${H} V2" stroke="${K.inkt}" stroke-width="1.6"/>` +
        `<path d="M${W - 2} ${Y(0)} l-8 -4 v8Z M${X(0)} 2 l-4 8 h8Z" fill="${K.inkt}"/>` +
        `<text x="${W - 12}" y="${Y(0) - 8}" font-size="14" font-style="italic" fill="${K.inkt}">x</text><text x="${X(0) + 8}" y="16" font-size="14" font-style="italic" fill="${K.inkt}">y</text>`;
      for (let x = Math.ceil(xmin); x <= xmax - 1; x++) if (x && x % 2 === 0) a += `<text x="${X(x)}" y="${Y(0) + 15}" font-size="14" text-anchor="middle" fill="${K.zacht}">${x}</text>`;
      for (let y = Math.ceil(ymin); y <= ymax - 1; y++) if (y && y % 2 === 0) a += `<text x="${X(0) - 6}" y="${Y(y) + 4}" font-size="14" text-anchor="end" fill="${K.zacht}">${y}</text>`;
      laag.rooster.innerHTML += a;
    }
    const L = n => typeof n === 'string' ? laag[n] : n;
    const V = {
      svg, laag, s, W, H, X, Y, xmin, xmax, ymin, ymax,
      P: p => [X(p.x), Y(p.y)],
      zet: (n, m) => { L(n).innerHTML = m; }, voeg: (n, m) => { L(n).insertAdjacentHTML('beforeend', m); },
      binnen: p => p.x >= xmin && p.x <= xmax && p.y >= ymin && p.y <= ymax,
      wereld(evt) {
        const pt = svg.createSVGPoint(); pt.x = evt.clientX; pt.y = evt.clientY;
        const m = svg.getScreenCTM(); if (!m) return { x: 0, y: 0 };
        const q = pt.matrixTransform(m.inverse()); return { x: q.x / s + xmin, y: ymax - q.y / s };
      },
      /* ---- markup-bouwers ---- */
      punt(p, { label = '', kleur = K.punt, r = 5, lx = 8, ly = -8, s: fs = 15 } = {}) {
        return `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="${r + 1.5}" fill="#fff"/><circle cx="${X(p.x)}" cy="${Y(p.y)}" r="${r}" fill="${kleur}"/>` +
          (label ? `<text x="${X(p.x) + lx}" y="${Y(p.y) + ly}" font-size="${fs}" font-weight="800" font-style="italic" fill="${donker(kleur, .25)}" paint-order="stroke" stroke="#fff" stroke-width="4">${label}</text>` : '');
      },
      stuk(a, b, { kleur = K.inkt, dik = 2.4, stip = false, pijl = false } = {}) {
        return `<path d="M${X(a.x)} ${Y(a.y)} L${X(b.x)} ${Y(b.y)}" stroke="${kleur}" stroke-width="${dik}" stroke-linecap="round"${stip ? ' stroke-dasharray="6 6"' : ''}/>` +
          (pijl ? (() => { const u = eenheid(min(b, a)), x = X(b.x), y = Y(b.y), ux = u.x, uy = -u.y; return `<path d="M${x} ${y} l${-10 * ux + 5 * uy} ${-10 * uy - 5 * ux} M${x} ${y} l${-10 * ux - 5 * uy} ${-10 * uy + 5 * ux}" stroke="${kleur}" stroke-width="${dik}" stroke-linecap="round"/>`; })() : '');
      },
      /* lijn door a en b, geknipt op het vlak */
      lijn(a, b, opts = {}) { const [p, q] = V.knip(a, b, true, true); return p ? V.stuk(p, q, opts) : ''; },
      halflijn(a, b, opts = {}) { const [p, q] = V.knip(a, b, false, true); return p ? V.stuk(p, q, opts) : ''; },
      knip(a, b, terug, voor) {
        const v = min(b, a); let t0 = terug ? -1e9 : 0, t1 = voor ? 1e9 : 1;
        for (const [c, lo, hi] of [[v.x, xmin - a.x, xmax - a.x], [v.y, ymin - a.y, ymax - a.y]]) {
          if (Math.abs(c) < 1e-12) { if (lo > 0 || hi < 0) return [null, null]; continue; }
          let u = lo / c, w = hi / c; if (u > w) [u, w] = [w, u]; t0 = Math.max(t0, u); t1 = Math.min(t1, w);
        }
        if (t0 > t1) return [null, null];
        return [plus(a, maal(v, t0)), plus(a, maal(v, t1))];
      },
      cirkel(m, r, { kleur = K.cirkel, vul = 'none', dik = 2.4, stip = false, op = 1 } = {}) {
        return `<circle cx="${X(m.x)}" cy="${Y(m.y)}" r="${r * s}" fill="${vul}" stroke="${kleur}" stroke-width="${dik}" opacity="${op}"${stip ? ' stroke-dasharray="7 6"' : ''}/>`;
      },
      veelhoek(pts, { vul = 'none', kleur = K.inkt, dik = 2.4, stip = false, op = 1 } = {}) {
        return `<path d="M${pts.map(p => X(p.x) + ' ' + Y(p.y)).join(' L')} Z" fill="${vul}" stroke="${kleur}" stroke-width="${dik}" stroke-linejoin="round" opacity="${op}"${stip ? ' stroke-dasharray="6 6"' : ''}/>`;
      },
      /* rechtehoekteken in o tussen de richtingen naar a en b (wereldpunten) */
      rechteHoek(o, a, b, { maat = .35, kleur = K.inkt } = {}) {
        const u = maal(eenheid(min(a, o)), maat), v = maal(eenheid(min(b, o)), maat), p1 = plus(o, u), p2 = plus(plus(o, u), v), p3 = plus(o, v);
        return `<path d="M${X(p1.x)} ${Y(p1.y)} L${X(p2.x)} ${Y(p2.y)} L${X(p3.x)} ${Y(p3.y)}" fill="none" stroke="${kleur}" stroke-width="1.8"/>`;
      },
      /* hoekboogje(s) in o van richting a naar richting b */
      boog(a, o, b, { n = 1, kleur = K.bissectrice, r = .6 } = {}) {
        let m = '';
        for (let i = 0; i < n; i++) {
          const rr = (r + i * .14) * s, u = eenheid(min(a, o)), v = eenheid(min(b, o));
          const p = [X(o.x) + u.x * rr, Y(o.y) - u.y * rr], q = [X(o.x) + v.x * rr, Y(o.y) - v.y * rr];
          const kruis = u.x * v.y - u.y * v.x;
          m += `<path d="M${p[0]} ${p[1]} A${rr} ${rr} 0 0 ${kruis > 0 ? 0 : 1} ${q[0]} ${q[1]}" fill="none" stroke="${kleur}" stroke-width="2"/>`;
        }
        return m;
      },
      /* tekens voor gelijke lengte: n streepjes dwars op het midden van ab */
      streepjes(a, b, n = 1, { kleur = K.inkt } = {}) {
        const m = midden(a, b), u = eenheid(min(b, a)), q = loodrechtOp(u); let r = '';
        for (let i = 0; i < n; i++) { const c = plus(m, maal(u, (i - (n - 1) / 2) * .16)); r += V.stuk(plus(c, maal(q, .18)), plus(c, maal(q, -.18)), { kleur, dik: 2 }); }
        return r;
      },
      /* maatlabel naast een lijnstuk */
      maat(a, b, tekst, { kant = 1, kleur = K.inkt, afst = .38, s: fs = 15 } = {}) {
        const m = midden(a, b), q = maal(loodrechtOp(eenheid(min(b, a))), kant * afst), p = plus(m, q);
        return `<text x="${X(p.x)}" y="${Y(p.y) + 5}" font-size="${fs}" font-weight="800" text-anchor="middle" fill="${kleur}" paint-order="stroke" stroke="${K.papier}" stroke-width="5">${tekst}</text>`;
      },
      tekst(p, t, { s: fs = 15, kleur = K.inkt, anker = 'middle', dx = 0, dy = 5, vet = true } = {}) {
        return `<text x="${X(p.x) + dx}" y="${Y(p.y) + dy}" font-size="${fs}"${vet ? ' font-weight="800"' : ''} text-anchor="${anker}" fill="${kleur}" paint-order="stroke" stroke="${K.papier}" stroke-width="5">${t}</text>`;
      },
      /* gebied op afstand < dd van lijn ab (een strook), geknipt op het vlak */
      strook(a, b, dd, { vul = K.strook, op = .7 } = {}) {
        const q = maal(loodrechtOp(eenheid(min(b, a))), dd), groot = 1e3, u = maal(eenheid(min(b, a)), groot);
        const pts = [plus(plus(a, q), maal(u, -1)), plus(plus(a, q), u), plus(min(a, q), u), plus(min(a, q), maal(u, -1))];
        return `<path d="M${pts.map(p => X(p.x) + ' ' + Y(p.y)).join(' L')} Z" fill="${vul}" opacity="${op}"/>`;
      },
      /* halfvlak aan de kant van kantPunt van lijn ab */
      halfvlak(a, b, kantPunt, { vul = K.binnen, op = .6 } = {}) {
        const u = maal(eenheid(min(b, a)), 1e3); let q = maal(loodrechtOp(eenheid(min(b, a))), 1e3);
        const z = (kantPunt.x - a.x) * q.x + (kantPunt.y - a.y) * q.y; if (z < 0) q = maal(q, -1);
        const pts = [min(a, u), plus(a, u), plus(plus(a, u), q), plus(min(a, u), q)];
        return `<path d="M${pts.map(p => X(p.x) + ' ' + Y(p.y)).join(' L')} Z" fill="${vul}" opacity="${op}"/>`;
      },
      /* een sleepbaar of tikbaar punt; raakcirkel r 26 (≥ 48 px) */
      handvat(p, { kleur = K.probe, label = '', vorm = 'rond' } = {}) {
        const g = mk('g', { class: 'wk-handvat', tabindex: '0', role: 'button', 'aria-label': label ? 'punt ' + label : 'sleep het punt' });
        g.innerHTML = `<circle class="wk-raak" r="26" fill="transparent"/><circle class="wk-gloed" r="15" fill="${kleur}" opacity=".18"/>` +
          (vorm === 'kruis' ? `<path d="M-8 -8 L8 8 M8 -8 L-8 8" stroke="${kleur}" stroke-width="4" stroke-linecap="round"/>` : `<circle r="9" fill="#fff"/><circle r="7" fill="${kleur}"/><circle cx="-2.4" cy="-2.6" r="2.2" fill="#fff" opacity=".7"/>`) +
          (label ? `<text x="12" y="-11" font-size="15" font-weight="800" font-style="italic" fill="${donker(kleur, .25)}" paint-order="stroke" stroke="#fff" stroke-width="4">${label}</text>` : '');
        g.zet = q => { g.p = { x: q.x, y: q.y }; g.setAttribute('transform', `translate(${X(q.x)} ${Y(q.y)})`); };
        g.zet(p); laag.punten.append(g); return g;
      },
      sleep(g, { snap = 0, beperk = null, beweeg = null, los = null } = {}) {
        let actief = false;
        const naar = evt => { let q = V.wereld(evt); q.x = Math.max(xmin, Math.min(xmax, q.x)); q.y = Math.max(ymin, Math.min(ymax, q.y)); if (snap) q = { x: Math.round(q.x / snap) * snap, y: Math.round(q.y / snap) * snap }; if (beperk) q = beperk(q); g.zet(q); if (beweeg) beweeg(g.p); };
        g.addEventListener('pointerdown', e => { actief = true; g.classList.add('sleept'); try { g.setPointerCapture(e.pointerId); } catch (x) {} naar(e); e.preventDefault(); });
        g.addEventListener('pointermove', e => { if (actief) naar(e); });
        const stop = () => { if (!actief) return; actief = false; g.classList.remove('sleept'); if (los) los(g.p); };
        g.addEventListener('pointerup', stop); g.addEventListener('pointercancel', stop);
        /* toetsenbord: pijltjes verschuiven een stap */
        g.addEventListener('keydown', e => {
          const st = snap || .25, dir = { ArrowLeft: [-st, 0], ArrowRight: [st, 0], ArrowUp: [0, st], ArrowDown: [0, -st] }[e.key];
          if (!dir) return; e.preventDefault(); let q = { x: g.p.x + dir[0], y: g.p.y + dir[1] }; if (beperk) q = beperk(q); g.zet(q); if (beweeg) beweeg(g.p); if (los) los(g.p);
        });
        /* voor de browsertest en voor bouwstenen: zet het punt alsof er gesleept is */
        g._naar = q => { if (beperk) q = beperk(q); g.zet(q); if (beweeg) beweeg(g.p); if (los) los(g.p); };
        return g;
      },
    };
    return V;
  }

  /* ---------- gedeelde defs (badges, kaart, gids) ---------- */
  let defsKlaar = false;
  function defs() {
    if (defsKlaar || typeof document === 'undefined') return; defsKlaar = true;
    const s = document.createElementNS(NS, 'svg'); s.setAttribute('width', '0'); s.setAttribute('height', '0'); s.setAttribute('aria-hidden', 'true'); s.style.position = 'absolute';
    s.innerHTML = `<defs>${lin('wk-geel', '#FDE047')}${lin('wk-rood', '#DC2626')}${lin('wk-blauw', '#3B82F6')}${lin('wk-groen', '#22C55E')}${lin('wk-paars', '#8B5CF6')}${lin('wk-roze', '#F472B6')}${lin('wk-oranje', '#F97316')}${lin('wk-staal', '#B8C2CC', { ds: .4 })}${lin('wk-hout', '#C98A4B')}${lin('wk-zee', '#38BDF8', { x2: 0, y2: 1, dl: .15, ds: .35 })}${rad('wk-eiland', '#86C96A', { r: .9, dl: .25, ds: .3 })}${rad('wk-zand', '#F3D9A4', { r: .9 })}` +
      `<filter id="wk-schaduw" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="1.5" dy="2.5" stdDeviation="1.6" flood-opacity=".25"/></filter></defs>`;
    document.body.append(s);
  }

  /* ---------- gids: Otto de otter, piloot ---------- */
  const gids = (() => {
    const id = uid('ot');
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><defs>${rad(id + 'v', '#A0703F', { cx: .38, cy: .3, r: .85, dl: .3, ds: .4 })}${rad(id + 'b', '#F2D7B0', { cx: .4, cy: .3, r: .8, dl: .3, ds: .2 })}${lin(id + 'h', '#2F6F4E', { dl: .3, ds: .35 })}${lin(id + 'g', '#9FD7F5', { dl: .5, ds: .2 })}</defs>` +
      `<ellipse cx="50" cy="95" rx="30" ry="3.4" fill="#000" opacity=".16"/>` +
      `<g class="wk-adem">` +
      /* staart en lijf */
      `<path d="M70 84 C86 84 92 74 90 66 C88 74 80 78 68 78Z" fill="url(#${id}v)"/>` +
      `<path d="M26 92 C22 72 30 56 50 56 C70 56 78 72 74 92Z" fill="url(#${id}v)"/>` +
      `<path d="M38 92 C36 76 42 66 50 66 C58 66 64 76 62 92Z" fill="url(#${id}b)"/>` +
      /* pilotenjack-kraag */
      `<path d="M30 66 C38 72 62 72 70 66 L72 74 C62 80 38 80 28 74Z" fill="url(#${id}h)"/><circle cx="50" cy="76" r="2.2" fill="#F4C64E"/>` +
      /* pootjes met een passer */
      `<path d="M30 84 C26 80 26 76 30 74" stroke="#6B4423" stroke-width="7" stroke-linecap="round" fill="none"/>` +
      `<g transform="translate(70 70) rotate(18)"><path d="M0 0 L-5 20 M0 0 L5 20" stroke="url(#wk-staal)" stroke-width="2.4" stroke-linecap="round"/><circle r="2.6" fill="#6B7280"/><path d="M5 20 l1 3" stroke="#374151" stroke-width="2"/></g>` +
      `<path d="M70 84 C74 80 74 76 70 74" stroke="#6B4423" stroke-width="7" stroke-linecap="round" fill="none"/>` +
      /* hoofd */
      `<circle cx="50" cy="38" r="22" fill="url(#${id}v)"/>` +
      `<circle cx="30" cy="22" r="6" fill="url(#${id}v)"/><circle cx="30" cy="22" r="3" fill="#E8B48A"/><circle cx="70" cy="22" r="6" fill="url(#${id}v)"/><circle cx="70" cy="22" r="3" fill="#E8B48A"/>` +
      `<ellipse cx="50" cy="46" rx="14" ry="10" fill="url(#${id}b)"/>` +
      `<ellipse cx="42" cy="24" rx="6" ry="3" fill="#fff" opacity=".25" transform="rotate(-25 42 24)"/>` +
      /* pilotenkap met bril op het voorhoofd */
      `<path d="M28 34 C28 16 72 16 72 34 C66 26 34 26 28 34Z" fill="url(#${id}h)"/>` +
      `<g transform="translate(0 -1)"><rect x="35" y="24" width="12" height="8" rx="4" fill="url(#${id}g)" stroke="#8A5A2B" stroke-width="1.6"/><rect x="53" y="24" width="12" height="8" rx="4" fill="url(#${id}g)" stroke="#8A5A2B" stroke-width="1.6"/><path d="M47 28 H53" stroke="#8A5A2B" stroke-width="1.6"/><path d="M38 26 l3 0" stroke="#fff" stroke-width="1.2" opacity=".8"/></g>` +
      /* ogen met glimlicht en knipper */
      [42, 58].map((x, i) => `<circle cx="${x}" cy="38" r="4.2" fill="#FFFDF8"/><circle cx="${x + .4}" cy="38.4" r="2.8" fill="#3A2412"/><circle cx="${x + .6}" cy="38.6" r="1.5" fill="#0C0806"/><circle cx="${x + 1.5}" cy="37.2" r="1" fill="#fff"/><circle cx="${x - .6}" cy="39.6" r=".45" fill="#fff" opacity=".85"/>` +
        `<g class="wk-knip" style="animation-delay:${-i * .08}s"><circle cx="${x}" cy="38" r="4.6" fill="#8E6236"/></g>`).join('') +
      /* neus, snorharen, mond, blosjes */
      `<ellipse cx="50" cy="44" rx="4" ry="2.8" fill="#2A1A10"/><ellipse cx="48.8" cy="43.2" rx="1.3" ry=".7" fill="#fff" opacity=".6"/>` +
      `<path d="M40 46 L28 44 M40 48 L28 50 M60 46 L72 44 M60 48 L72 50" stroke="#5A3A20" stroke-width=".9" opacity=".8"/>` +
      `<path d="M45 49 C47 52 53 52 55 49" stroke="#2A1A10" stroke-width="1.6" fill="none" stroke-linecap="round"/>` +
      `<ellipse cx="36" cy="45" rx="3.2" ry="2" fill="#F08A8A" opacity=".45"/><ellipse cx="64" cy="45" rx="3.2" ry="2" fill="#F08A8A" opacity=".45"/>` +
      `</g></svg>`;
  })();
  const merk = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="#fff" stroke-width="2"/><circle cx="12" cy="12" r="1.8" fill="#fff"/><path d="M12 12 L18.5 7.5" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`;

  /* ---------- baas: een denkfout als monster (120x120) ---------- */
  function baas({ kleur = '#8E5BC4', kleur2, vorm = 'blob', extra = '', mond = 'grijns', ogen = 2 } = {}) {
    const id = uid('b'); kleur2 = kleur2 || donker(kleur, .45);
    const df = `<defs>${rad(id, kleur, { cx: .36, cy: .3, r: .85, dl: .35, ds: .45 })}</defs>`;
    let lijf, oy = 58, xs = ogen === 1 ? [60] : ogen === 3 ? [44, 60, 76] : [48, 72];
    if (vorm === 'driehoek') { lijf = `<path d="M60 14 C64 14 66 16 68 20 L108 98 C110 104 106 110 100 110 H20 C14 110 10 104 12 98 L52 20 C54 16 56 14 60 14Z" fill="url(#${id})"/>`; oy = 70; xs = ogen === 1 ? [60] : [50, 70]; }
    else if (vorm === 'passer') { lijf = `<path d="M60 18 L28 108 M60 18 L92 108" stroke="url(#${id})" stroke-width="16" stroke-linecap="round"/><circle cx="60" cy="40" r="26" fill="url(#${id})"/><path d="M60 6 V16" stroke="${kleur2}" stroke-width="6" stroke-linecap="round"/>`; oy = 40; }
    else if (vorm === 'lat') { lijf = `<rect x="14" y="30" width="92" height="60" rx="10" fill="url(#${id})"/>` + [24, 34, 44, 54, 64, 74, 84, 94].map((x, i) => `<path d="M${x} 90 V${i % 2 ? 80 : 74}" stroke="${kleur2}" stroke-width="2"/>`).join(''); oy = 56; }
    else if (vorm === 'wolk') { lijf = `<path d="M18 92 C4 90 4 68 20 66 C16 46 36 34 50 42 C56 26 82 24 88 42 C104 40 114 58 104 70 C116 80 106 100 90 96 C80 108 56 108 46 98 C36 104 22 100 18 92Z" fill="url(#${id})"/>`; oy = 64; }
    else lijf = `<path d="M20 100 C10 70 22 26 60 24 C98 26 110 70 100 100 C92 112 28 112 20 100Z" fill="url(#${id})"/>`;
    const oog = x => `<circle cx="${x}" cy="${oy}" r="9" fill="#FFFDF8"/><circle cx="${x + 1}" cy="${oy + 1.5}" r="5" fill="#2A1430"/><circle cx="${x + 2.6}" cy="${oy - 1}" r="1.8" fill="#fff"/>` +
      `<g class="wk-knip"><circle cx="${x}" cy="${oy}" r="9.6" fill="${kleur}"/></g><path d="M${x - 10} ${oy - 12} L${x + 8} ${oy - 8}" stroke="${kleur2}" stroke-width="3" stroke-linecap="round"/>`;
    const my = oy + 22;
    const m = mond === 'open' ? `<ellipse cx="60" cy="${my}" rx="12" ry="8" fill="#3A0F2A"/><path d="M52 ${my - 5} l3 5 l3 -5 M62 ${my - 5} l3 5 l3 -5" fill="#fff"/>` :
      `<path d="M44 ${my - 4} C52 ${my + 6} 68 ${my + 6} 76 ${my - 4}" stroke="#3A0F2A" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M50 ${my - 1} l2 4 l3 -3 M64 ${my} l3 3 l2 -4" stroke="#fff" stroke-width="2" fill="none"/>`;
    return `<svg viewBox="0 0 120 120" aria-hidden="true">${df}<ellipse cx="60" cy="114" rx="40" ry="4" fill="#000" opacity=".16"/><g class="wk-adem">${lijf}${xs.map(oog).join('')}${m}${extra}</g></svg>`;
  }

  /* ---------- badges voor het missielogboek (100x100) ---------- */
  const rondje = (inhoud, k = '#FFF7E6') => `<circle cx="50" cy="50" r="44" fill="${k}" stroke="#E8D3A8" stroke-width="3"/><ellipse cx="38" cy="26" rx="18" ry="8" fill="#fff" opacity=".5"/>${inhoud}`;
  const badge = {
    helikopter: () => rondje(`<g filter="url(#wk-schaduw)"><path d="M20 30 H80" stroke="#374151" stroke-width="3" stroke-linecap="round"/><path d="M50 30 V38" stroke="#374151" stroke-width="3"/><path d="M28 54 C28 40 40 36 54 36 C68 36 74 46 74 54 C74 64 64 68 50 68 C38 68 28 64 28 54Z" fill="url(#wk-geel)"/><path d="M54 40 C64 40 70 46 70 52 H54Z" fill="#9FD7F5" stroke="#1E3A5F" stroke-width="1.5"/><path d="M28 54 H16 L12 48" stroke="url(#wk-geel)" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M40 50 h8 M44 46 v8" stroke="#DC2626" stroke-width="3"/><path d="M36 72 H68 M40 68 V72 M62 68 V72" stroke="#374151" stroke-width="2.4" stroke-linecap="round"/></g>`),
    passer: () => rondje(`<g filter="url(#wk-schaduw)"><circle cx="50" cy="58" r="22" fill="none" stroke="#3B82F6" stroke-width="2" stroke-dasharray="5 4"/><path d="M50 20 L38 72 M50 20 L66 70" stroke="url(#wk-staal)" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="20" r="5" fill="#6B7280"/><path d="M66 70 l2 5" stroke="#2563EB" stroke-width="3"/></g>`),
    geodriehoek: () => rondje(`<g filter="url(#wk-schaduw)"><path d="M16 70 H84 L50 30Z" fill="#BFE6F5" fill-opacity=".85" stroke="#2B7FA8" stroke-width="2"/>` + Array.from({ length: 13 }, (_, i) => `<path d="M${20 + i * 5} 70 V${i % 2 ? 66 : 63}" stroke="#2B7FA8" stroke-width="1"/>`).join('') + `<path d="M50 70 V52" stroke="#2B7FA8" stroke-width="1.4"/><path d="M50 70 h6 v-6 h-6" fill="none" stroke="#DC2626" stroke-width="1.6"/></g>`),
    schaar: () => rondje(`<g filter="url(#wk-schaduw)"><path d="M30 30 L64 62 M70 30 L36 62" stroke="url(#wk-staal)" stroke-width="5" stroke-linecap="round"/><circle cx="30" cy="70" r="9" fill="none" stroke="url(#wk-roze)" stroke-width="5"/><circle cx="70" cy="70" r="9" fill="none" stroke="url(#wk-roze)" stroke-width="5"/><circle cx="50" cy="48" r="2.6" fill="#374151"/></g>`),
    stof: () => rondje(`<g filter="url(#wk-schaduw)"><path d="M20 66 L40 30 H80 L60 66Z" fill="url(#wk-roze)"/>` + [0, 1, 2, 3].map(i => `<path d="M${28 + i * 10} 62 L${44 + i * 10} 34" stroke="#fff" stroke-width="2" opacity=".55"/>`).join('') + `<path d="M40 30 V66" stroke="#9D174D" stroke-width="2" stroke-dasharray="4 3"/><path d="M40 60 h5 v6" fill="none" stroke="#9D174D" stroke-width="1.6"/></g>`),
    kaart: () => rondje(`<g filter="url(#wk-schaduw)"><path d="M18 30 L38 24 L62 30 L82 24 V70 L62 76 L38 70 L18 76Z" fill="#F3E3B8" stroke="#B9975B" stroke-width="2"/><path d="M38 24 V70 M62 30 V76" stroke="#B9975B" stroke-width="1.5"/><circle cx="50" cy="50" r="14" fill="#FDE68A" fill-opacity=".7" stroke="#2563EB" stroke-width="2"/><circle cx="50" cy="50" r="3" fill="#EA580C"/></g>`),
    balans: () => rondje(`<g filter="url(#wk-schaduw)"><path d="M22 46 L80 40 L54 66Z" fill="url(#wk-oranje)"/><circle cx="52" cy="51" r="3" fill="#fff"/><path d="M52 54 V80" stroke="#8A5A2B" stroke-width="6" stroke-linecap="round"/><path d="M40 82 H64" stroke="#8A5A2B" stroke-width="5" stroke-linecap="round"/></g>`),
    cirkel: () => rondje(`<g filter="url(#wk-schaduw)"><path d="M22 72 L78 72 L44 28Z" fill="none" stroke="#2B1E3A" stroke-width="2.4"/><circle cx="48" cy="58" r="13" fill="none" stroke="#7C3AED" stroke-width="2.4"/><circle cx="52" cy="52" r="34" fill="none" stroke="#2563EB" stroke-width="2.4"/></g>`),
    lijnen: () => rondje(`<g filter="url(#wk-schaduw)"><path d="M18 74 L82 74 L40 26Z" fill="#fff" stroke="#2B1E3A" stroke-width="2.4"/><path d="M40 26 L50 74" stroke="#D97706" stroke-width="2.4"/><path d="M40 26 V74" stroke="#0891B2" stroke-width="2.4" stroke-dasharray="5 3"/><path d="M40 74 h5 v-5 h-5" fill="none" stroke="#0891B2" stroke-width="1.5"/></g>`),
    rooster: () => rondje(`<g filter="url(#wk-schaduw)"><rect x="22" y="22" width="56" height="56" rx="4" fill="#fff"/>` + [0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M${22 + i * 8} 22 V78 M22 ${22 + i * 8} H78" stroke="#BFD8EE" stroke-width="1"/>`).join('') + `<path d="M30 70 H70 L46 38Z" fill="#FDE68A" stroke="#2B1E3A" stroke-width="2"/><path d="M46 38 V70" stroke="#0891B2" stroke-width="2" stroke-dasharray="4 3"/></g>`),
    trofee: () => rondje(`<g filter="url(#wk-schaduw)"><path d="M32 24 H68 V40 C68 54 60 60 50 60 C40 60 32 54 32 40Z" fill="url(#wk-geel)"/><path d="M32 30 C20 30 20 46 34 48 M68 30 C80 30 80 46 66 48" stroke="#D4A017" stroke-width="4" fill="none"/><rect x="46" y="60" width="8" height="10" fill="#D4A017"/><rect x="36" y="70" width="28" height="8" rx="2" fill="url(#wk-hout)"/><path d="M44 36 L50 30 L56 36" stroke="#fff" stroke-width="2.4" fill="none" opacity=".7"/></g>`),
  };

  /* ---------- de kaart: een eiland met zeven gebieden (334x200) ---------- */
  const GEBIED = [
    { id: 'vk', x: 52, y: 118, naam: 'Vk', icoon: 'passer' },
    { id: '21', x: 92, y: 68, naam: '2.1', icoon: 'helikopter' },
    { id: '22', x: 150, y: 46, naam: '2.2', icoon: 'kaart' },
    { id: '23', x: 206, y: 64, naam: '2.3', icoon: 'cirkel' },
    { id: '24', x: 172, y: 120, naam: '2.4', icoon: 'balans' },
    { id: '25', x: 236, y: 140, naam: '2.5', icoon: 'schaar' },
    { id: '26', x: 286, y: 96, naam: '2.6', icoon: 'stof' },
  ];
  function kaart({ aan = [], labels = true } = {}) {
    const pad = GEBIED.map(g => [g.x, g.y]);
    return `<rect width="334" height="200" rx="18" fill="url(#wk-zee)"/>` +
      [0, 1, 2, 3, 4, 5].map(i => `<path d="M${20 + i * 52} ${180 - (i % 2) * 8} q8 -5 16 0" stroke="#fff" stroke-width="1.6" fill="none" opacity=".5"/>`).join('') +
      `<path d="M30 120 C20 80 50 40 100 36 C140 18 200 22 240 40 C290 50 318 80 312 118 C306 160 260 178 210 172 C160 186 110 178 76 166 C46 158 34 144 30 120Z" fill="url(#wk-zand)"/>` +
      `<path d="M40 120 C32 86 58 50 102 46 C142 30 198 34 236 50 C282 60 304 86 300 118 C294 152 256 166 210 162 C162 174 112 168 80 156 C54 148 44 138 40 120Z" fill="url(#wk-eiland)"/>` +
      /* bergjes en bomen voor diepte */
      `<path d="M120 70 l14 -20 l14 20Z M138 70 l10 -14 l10 14Z" fill="#6E9F5A"/><path d="M126 56 l8 -6 l5 6Z" fill="#fff" opacity=".7"/>` +
      [[70, 96], [110, 140], [260, 70], [200, 100], [140, 158]].map(([x, y]) => `<ellipse cx="${x}" cy="${y + 8}" rx="7" ry="2" fill="#000" opacity=".15"/><path d="M${x} ${y + 8} V${y + 2}" stroke="#7A4E2A" stroke-width="2"/><circle cx="${x}" cy="${y}" r="6" fill="#4E8F3A"/><circle cx="${x - 2}" cy="${y - 2}" r="3" fill="#7CC05E"/>`).join('') +
      /* het pad tussen de gebieden */
      `<path d="M${pad.map(p => p.join(' ')).join(' L')}" stroke="#FFF7E6" stroke-width="5" stroke-dasharray="2 8" stroke-linecap="round" fill="none"/>` +
      /* de werelden: Afstandenland (Vk-2.4) en Het Atelier (2.5-2.6) */
      (labels ? `<text x="96" y="186" font-size="13" font-weight="800" fill="#1E3A5F" opacity=".75">Afstandenland</text><text x="250" y="186" font-size="13" font-weight="800" fill="#9D174D" opacity=".75">Het Atelier</text>` : '') +
      GEBIED.map(g => { const a = aan.includes(g.id); return `<g transform="translate(${g.x - 20} ${g.y - 20}) scale(.4)" opacity="${a ? 1 : .55}">${badge[g.icoon]()}</g>` +
        `<circle cx="${g.x + 16}" cy="${g.y - 16}" r="9" fill="${a ? '#16A34A' : '#fff'}" stroke="#1E3A5F" stroke-width="1.4"/>` +
        `<text x="${g.x + 16}" y="${g.y - 12}" font-size="${g.naam.length > 2 ? 8 : 9}" font-weight="800" text-anchor="middle" fill="${a ? '#fff' : '#1E3A5F'}">${a ? '✓' : g.naam}</text>`; }).join('');
  }

  return { K, G, nl, vlak, defs, gids, merk, baas, badge, kaart, GEBIED, mix, licht, donker, uid };
})();
