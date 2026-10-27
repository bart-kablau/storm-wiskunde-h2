'use strict';
/* =========================================================================
   WISKUNDE: bouwstenen oppervlakte (canoniek: tools/speelles-engine/wiskunde/vis-opp.js)
   Het Atelier (§2.5-2.6): oppervlakte = hoeveel stof je nodig hebt. Knippen en schuiven.
   Vereist engine.js en wiskunde/teken.js (WK). Zit in een IIFE: alleen VIS.* en WK.opp worden gezet.
   Elke bouwsteen: VIS.naam = (podium, p, api) => opruim?  Werkt als 'toon' én als bewijs- of
   baasvraag ({visual, p}): api.fout() bij elke fout (als die er is), api.klaar(bericht) als hij af is.
   Wortel: .wk-vis, krijgt data-af="1" als hij af is, en root._los(fout) doet de rest van de
   handelingen (fout = true: eerst één foute handeling) voor test/speler.js (P.wk).
   Alle getoonde oppervlaktes worden met WK.G.opp uitgerekend, nooit overgenomen uit p.
   Knoppen heten .wk-keus (nooit .optie: dat is de mc van de engine).

   Gedeeld (optioneel bij elke bouwsteen): een slotvraag na de handeling
     p.vraag (tekst) + p.opties [{t, goed} | {t, fout, mis}] + p.w (uitleg bij goed)  -> kiezen
     p.typ {vraag?, waarde, eenheid ('cm²'), eenheden? (['cm','cm²','mm²','m²']), fouten? [{waarde, eenheid?, fout, mis}], w}
           -> zelf typen + eenheid kiezen. Goed getal met cm of mm = W21.
     p.na: eigen eindtekst (anders een tekst met de uitgerekende formule).
     Stoffen: 'roze' (stippen), 'paars' (bloemetjes), 'mint' (streepjes), 'geel' (ruitjes), 'denim', 'koraal'.

     knipschuif   knippen en schuiven in een rooster; Storm sleept het losse stuk (handvat) op zijn plek.
                  p.modus 'parallellogram' {a, h, schuif}: driehoek langs de hoogte afknippen, naar rechts
                          schuiven: een rechthoek a × h.
                          'driehoek' {a, h, top (x van de top)}: een kopie draait 180° en past ertegen:
                          een parallellogram a × h, dus de driehoek is de helft.
                          'trapezium' {a (onder), b (boven), h, schuif (x van de linker bovenhoek)}:
                          kopie draait 180°: parallellogram met zijde a + b.
                          'ruit' {d1, d2}: de twee onderste driehoekjes schuiven omhoog: rechthoek d1 × ½d2.
                  p.stof, p.stof2 (kleur van het losse stuk). Live: hoeveel hokjes stof (blijft gelijk).
     schuifproef  p.vorm 'driehoek' | 'parallellogram', p.a (zijde), p.h (hoogte), p.top (start-x van de top
                  of van de linker bovenhoek), p.min / p.max (bereik), p.bereik (zoveel moet ze schuiven,
                  standaard 4), p.buiten (true: ook voorbij de zijde schuiven, de hoogte valt dan buiten).
                  Live: schuine zijde (verandert), hoogte en oppervlakte (blijven gelijk). Weerlegt W13/W17.
     maatkiezer   p.figuur 'driehoek' | 'parallellogram' | 'trapezium' | 'ruit'; p.pts [{x, y, l}] (hoekpunten);
                  p.maten [{id, a, b, t (label), soort 'zijde'|'schuin'|'hoogte'|'diag', kant (1/-1: kant van
                  het label), haak? [o, p1, p2] (rechtehoekteken), verleng? [p, q] (gestippeld verlengde),
                  fout?, mis?}]; p.goed [[ids], ...] (goede combinaties: zijde + bijbehorende hoogte, of twee
                  evenwijdige zijden + hoogte, of twee diagonalen); p.rooster (hokjes tellen), p.tel (na de
                  goede keuze de getelde lengtes tonen), p.kies (eigen opdrachttekst), p.foutPaar / p.misPaar.
                  Daarna p.opties of p.typ.
     splitser     samengestelde figuur in een rooster. p.pts (veelhoek), p.eenheid ('cm²'), p.maten [[a, b, t, kant]],
                  p.splits {lijnen: [[a, b]], stukken: [{pts, som ('2 × 3'), stof?}], fout?: [{a, b, fout, mis}]},
                  p.aanvul {rechthoek: pts, som ('5 × 3'), gaten: [{pts, som ('½ × 3 × 1')}]},
                  p.route 'splitsen' | 'aanvullen' (anders kiest Storm), p.beide (daarna ook de andere route).
                  Splitsen: tik de knipnaden, de stukken lichten op en tellen op. Aanvullen: tik de gaten in de
                  omhullende rechthoek, die gaan eraf. Beide routes geven hetzelfde antwoord (W20, W22).
   ========================================================================= */
(() => {
  const K = WK.K, G = WK.G;
  const pauze = ms => wacht(minderBeweging() ? Math.min(ms, 120) : ms);
  const foutje = (api, mis) => { if (api.fout) api.fout(); if (mis) api.spot(mis); };
  const klik = el => el && el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  const af = (root, api, bericht) => { if (root.dataset.af === '1') return; root.dataset.af = '1'; api.klaar(bericht); };
  const zeg = (el, soort, html) => { el.className = 'wk-uitleg' + (soort ? ' ' + soort : ''); el.innerHTML = html; };
  const schud = el => { el.classList.remove('wk-schud'); void el.offsetWidth; el.classList.add('wk-schud'); };
  const gem = pts => ({ x: pts.reduce((s, q) => s + q.x, 0) / pts.length, y: pts.reduce((s, q) => s + q.y, 0) / pts.length });
  const r2 = x => Math.round(x * 100) / 100;
  const getal = x => String(r2(x)).replace('.', ',');
  const opp = pts => r2(G.opp(pts));
  const Pt = (x, y) => ({ x, y });
  /* omhullend kader; marge m in wereld-eenheden (standaard ruim genoeg voor labels naast de figuur) */
  const kader = (pts, m) => { const xs = pts.map(q => q.x), ys = pts.map(q => q.y), span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)); m = m ?? (.4 + .13 * span); return kader0(pts, m); };
  const kader0 = (pts, m) => ({ x0: Math.min(...pts.map(q => q.x)) - m, x1: Math.max(...pts.map(q => q.x)) + m, y0: Math.min(...pts.map(q => q.y)) - m, y1: Math.max(...pts.map(q => q.y)) + m });

  /* ---------- stof: patronen (16 x 16), met glans voor licht en schaduw ---------- */
  const STOF = {
    roze: ['#F472B6', '#FCE7F3', 'stip'], paars: ['#A78BFA', '#F5F3FF', 'bloem'], mint: ['#34D399', '#ECFDF5', 'streep'],
    geel: ['#F59E0B', '#FEF3C7', 'ruit'], denim: ['#3B82F6', '#DBEAFE', 'naad'], koraal: ['#FB7185', '#FFF1F2', 'streep'],
  };
  function patroon(id, [kl, k2, m]) {
    let inh = `<rect width="16" height="16" fill="${kl}"/>`;
    if (m === 'stip') inh += `<circle cx="4" cy="4" r="2.3" fill="${k2}"/><circle cx="12" cy="12" r="2.3" fill="${k2}"/><circle cx="3.3" cy="3.2" r=".8" fill="#fff"/><circle cx="11.3" cy="11.2" r=".8" fill="#fff"/>`;
    else if (m === 'streep') inh += `<path d="M-4 4 L4 -4 M0 16 L16 0 M12 20 L20 12" stroke="${k2}" stroke-width="3.2" opacity=".85"/>`;
    else if (m === 'bloem') inh += [[4, 4], [12, 12]].map(([x, y]) => `<circle cx="${x - 1.7}" cy="${y}" r="1.5" fill="${k2}"/><circle cx="${x + 1.7}" cy="${y}" r="1.5" fill="${k2}"/><circle cx="${x}" cy="${y - 1.7}" r="1.5" fill="${k2}"/><circle cx="${x}" cy="${y + 1.7}" r="1.5" fill="${k2}"/><circle cx="${x}" cy="${y}" r="1.1" fill="#FDE047"/>`).join('');
    else if (m === 'ruit') inh += `<path d="M0 4 H16 M0 12 H16 M4 0 V16 M12 0 V16" stroke="${k2}" stroke-width="3" opacity=".6"/>`;
    else inh += `<path d="M-2 6 L6 -2 M-2 14 L14 -2 M6 18 L18 6 M14 18 L18 14" stroke="${WK.donker(kl, .25)}" stroke-width="1.3" opacity=".55"/><path d="M0 8 H16" stroke="${k2}" stroke-width=".9" stroke-dasharray="2 2" opacity=".8"/>`;
    return `<pattern id="${id}" width="16" height="16" patternUnits="userSpaceOnUse">${inh}</pattern>`;
  }
  /* tekenvlak dat het podium vult (± 330 eenheden breed), met de stofpatronen erin */
  function papier(b, { rooster = true, maxS = 46, breed = 330, hoog = 290, titel = 'tekening met stof' } = {}) {
    let { x0, x1, y0, y1 } = b;
    if (rooster) { x0 = Math.floor(x0); x1 = Math.ceil(x1); y0 = Math.floor(y0); y1 = Math.ceil(y1); }
    const s = Math.min(maxS, breed / (x1 - x0), hoog / (y1 - y0));
    const V = WK.vlak({ xmin: x0, xmax: x1, ymin: y0, ymax: y1, s, rooster, titel });
    const pre = WK.uid('st');
    V.voeg('achter', `<defs>${Object.keys(STOF).map(n => patroon(pre + n, STOF[n])).join('')}<linearGradient id="${pre}glans" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient></defs>`);
    V.stof = n => `url(#${pre}${STOF[n] ? n : 'roze'})`; V.glans = `url(#${pre}glans)`;
    return V;
  }
  const pad = (V, pts) => 'M' + pts.map(q => V.X(q.x).toFixed(1) + ' ' + V.Y(q.y).toFixed(1)).join(' L') + ' Z';
  /* een lap stof: patroon + glans + stiksel + rand (drie tonen en een naad) */
  function lap(V, pts, naam = 'roze', { naad = true, op = 1 } = {}) {
    const d = pad(V, pts), kl = (STOF[naam] || STOF.roze)[0];
    let m = `<g class="wk-lap" opacity="${op}" filter="url(#wk-schaduw)"><path d="${d}" fill="${V.stof(naam)}"/><path d="${d}" fill="${V.glans}"/>`;
    if (naad) {
      const c = gem(pts), k = 6 / V.s;
      const bin = pts.map(q => { const v = G.min(q, c), l = Math.hypot(v.x, v.y) || 1; return G.plus(c, G.maal(v, Math.max(0, 1 - 1.5 * k / l))); });
      m += `<path d="${pad(V, bin)}" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="5 4" opacity=".85"/>`;
    }
    return m + `<path d="${d}" fill="none" stroke="${WK.donker(kl, .42)}" stroke-width="2.4" stroke-linejoin="round"/></g>`;
  }
  /* label naast lijnstuk ab, px schermeenheden ernaast; kant 1 = rechts van a→b op het scherm */
  function label(V, a, b, t, { kant = 1, kleur = K.inkt, px = 15, fs = 15 } = {}) {
    const [x1, y1] = V.P(a), [x2, y2] = V.P(b), L = Math.hypot(x2 - x1, y2 - y1) || 1;
    const x = (x1 + x2) / 2 - (y2 - y1) / L * kant * px, y = (y1 + y2) / 2 + (x2 - x1) / L * kant * px;
    return `<text x="${x.toFixed(1)}" y="${(y + fs * .36).toFixed(1)}" font-size="${fs}" font-weight="800" text-anchor="middle" fill="${kleur}" paint-order="stroke" stroke="${K.papier}" stroke-width="5">${t}</text>`;
  }
  const tekstOp = (V, q, t, { fs = 15, kleur = K.inkt } = {}) => `<text x="${V.X(q.x).toFixed(1)}" y="${(V.Y(q.y) + fs * .36).toFixed(1)}" font-size="${fs}" font-weight="800" text-anchor="middle" fill="${kleur}" paint-order="stroke" stroke="#fff" stroke-width="5">${t}</text>`;
  const schaar = (x, y, k = '#6B7280') => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" aria-hidden="true"><path d="M-7 -9 L5 5 M7 -9 L-5 5" stroke="${k}" stroke-width="2.6" stroke-linecap="round"/><circle cx="-6.5" cy="8.5" r="4" fill="#fff" stroke="#EC4899" stroke-width="2.4"/><circle cx="6.5" cy="8.5" r="4" fill="#fff" stroke="#EC4899" stroke-width="2.4"/><circle r="1.4" fill="#374151"/></g>`;
  const rechteHoekPx = (V, o, a, b) => V.rechteHoek(o, a, b, { maat: 11 / V.s });
  WK.opp = { STOF, papier, lap, label, getal, kader, tekstOp, rechteHoekPx };

  /* ---------- slotvraag: kiezen ---------- */
  function kiesVraag(root, q, api, klaar) {
    const fb = h('div', { class: 'wk-uitleg', 'aria-live': 'polite' }), lijst = h('div', { class: 'wk-keuzes' });
    let opgelost = false;
    (q.vast ? q.opties : shuffle(q.opties)).forEach(o => {
      const b = h('button', { class: 'wk-keus', type: 'button', html: o.t }); b._goed = !!o.goed;
      b.addEventListener('click', () => {
        if (opgelost || b.disabled) return;
        if (o.goed) { opgelost = true; b.classList.add('goed'); lijst.querySelectorAll('button').forEach(x => { x.disabled = true; }); zeg(fb, 'goed', '<b>Ja!</b> ' + (q.w || '')); klaar(); }
        else { b.classList.add('fout'); b.disabled = true; zeg(fb, 'fout', '<b>Bijna.</b> ' + (o.fout || 'Kijk nog eens goed.')); foutje(api, o.mis); }
      });
      lijst.append(b);
    });
    const box = h('div', { class: 'wk-opp-slot' }, h('div', { class: 'wk-vraag', html: q.vraag || 'Hoeveel stof is dat?' }), lijst, fb);
    root.append(box);
    return {
      los: async fout => {
        const kn = [...lijst.querySelectorAll('button')].filter(b => !b.disabled);
        if (fout) { const f = kn.find(b => !b._goed); if (f) { klik(f); await pauze(60); } }
        klik(kn.find(b => b._goed));
      },
    };
  }
  /* ---------- slotvraag: zelf typen met eenheid ---------- */
  function typVraag(root, t, api, klaar) {
    const ehs = t.eenheden || [...new Set(['cm', 'cm²', 'mm²', 'm²', t.eenheid])];
    const fb = h('div', { class: 'wk-uitleg', 'aria-live': 'polite' });
    const inp = h('input', { class: 'wk-typ-in', type: 'text', inputmode: 'decimal', autocomplete: 'off', 'aria-label': 'jouw antwoord (getal)', placeholder: 'getal' });
    let gekozen = null, opgelost = false;
    const ehKnop = {};
    const ehBox = h('div', { class: 'wk-keuzes wk-eh', role: 'group', 'aria-label': 'eenheid' }, ehs.map(e => {
      const b = h('button', { class: 'wk-keus', type: 'button' }, e);
      b.addEventListener('click', () => { if (opgelost) return; gekozen = e; ehBox.querySelectorAll('button').forEach(x => x.classList.toggle('kies', x === b)); });
      ehKnop[e] = b; return b;
    }));
    const check = h('button', { class: 'wk-keus wk-check', type: 'button' }, 'Controleer');
    const kijk = () => {
      if (opgelost) return;
      const v = parseFloat(String(inp.value).replace(/\s/g, '').replace(',', '.'));
      if (isNaN(v)) { zeg(fb, '', 'Typ eerst een getal.'); return; }
      if (!gekozen) { zeg(fb, '', 'Kies ook de eenheid.'); return; }
      const goedGetal = Math.abs(v - t.waarde) < .006;
      if (goedGetal && gekozen === t.eenheid) {
        opgelost = true; inp.disabled = true; ehBox.querySelectorAll('button').forEach(x => { x.disabled = true; }); check.disabled = true;
        zeg(fb, 'goed', `<b>Ja! ${getal(t.waarde)} ${t.eenheid}.</b> ` + (t.w || '')); klaar(); return;
      }
      let f = (t.fouten || []).find(x => Math.abs(x.waarde - v) < .006 && (!x.eenheid || x.eenheid === gekozen));
      if (!f && goedGetal) f = /²/.test(gekozen)
        ? { fout: `Het getal klopt, maar de maten zijn in ${t.eenheid.replace('²', '')}, dus het antwoord is in <b>${t.eenheid}</b>.` }
        : { fout: `Het getal klopt, maar ${gekozen} is een lengte. Oppervlakte is hoeveel <b>vierkantjes</b> stof: ${getal(t.waarde)} <b>${t.eenheid}</b>.`, mis: 'W21' };
      if (!f) f = { fout: t.anders || 'Dat klopt nog niet. Welke zijde en welke hoogte horen bij elkaar? Reken het rustig uit.' };
      foutje(api, f.mis); zeg(fb, 'fout', '<b>Bijna.</b> ' + f.fout); schud(inp);
    };
    check.addEventListener('click', kijk);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') kijk(); });
    root.append(h('div', { class: 'wk-opp-slot' }, h('div', { class: 'wk-vraag', html: t.vraag || 'Reken uit hoeveel stof het is.' }), h('div', { class: 'wk-typ' }, inp, check), ehBox, fb));
    const kies = e => klik(ehKnop[e]);
    return {
      los: async fout => {
        if (fout) {
          const f = (t.fouten || [])[0];
          inp.value = getal(f ? f.waarde : t.waarde); kies(f ? (f.eenheid || t.eenheid) : ehs.find(e => e !== t.eenheid)); klik(check); await pauze(60);
        }
        inp.value = getal(t.waarde); kies(t.eenheid); klik(check);
      },
    };
  }
  /* slotvraag (als die er is), daarna af */
  function slot(root, p, api, bericht) {
    const klaar = () => af(root, api, p.na || bericht);
    if (p.typ) return typVraag(root, p.typ, api, klaar);
    if (p.opties) return kiesVraag(root, { vraag: p.vraag, opties: p.opties, w: p.w, vast: p.vast }, api, klaar);
    klaar(); return null;
  }

  /* ===================================================================== KNIPSCHUIF */
  VIS.knipschuif = (pod, p, api) => {
    const modus = p.modus || 'parallellogram', st0 = p.stof || 'roze', st1 = p.stof2 || 'paars';
    const root = h('div', { class: 'wk-vis wk-opp wk-knipschuif' });
    let vast = [], stukken = [], naden = [], maten = [], doel = [], b, eind, start, extra = null;
    const draai = (pts, M) => pts.map(q => G.min(G.maal(M, 2), q));
    if (modus === 'parallellogram') {
      const a = p.a ?? 6, hh = p.h ?? 3, s = p.schuif ?? 2;
      const A = Pt(0, 0), B = Pt(a, 0), C = Pt(a + s, hh), D = Pt(s, hh), F = Pt(s, 0);
      vast = [[F, B, C, D]];
      const t = [A, F, D], g0 = gem(t);
      stukken = [{ pts: t, stof: st1 === 'paars' && !p.stof2 ? st0 : st1, c0: g0, c1: G.plus(g0, Pt(a, 0)), rot: 0 }];
      naden = [[D, F]]; doel = [F, Pt(a + s, 0), C, D];
      maten = [[A, B, 'zijde ' + a, 1], [D, F, 'hoogte ' + hh, 1]];
      b = { x0: -.6, x1: a + s + .6, y0: -1.1, y1: hh + .7 };
      start = 'Knip langs de <b>hoogte</b> en sleep het driehoekje naar de andere kant.';
      eind = `Een rechthoek van <b>${a} bij ${hh}</b> = ${getal(a * hh)} hokjes. Het is dezelfde stof, dus het parallellogram is ook <b>zijde × hoogte = ${a} × ${hh} = ${getal(a * hh)}</b>.`;
    } else if (modus === 'driehoek' || modus === 'trapezium') {
      const tr = modus === 'trapezium';
      const a = p.a ?? 6, hh = p.h ?? (tr ? 3 : 4), bb = tr ? (p.b ?? 3) : 0, s = tr ? (p.schuif ?? 1) : (p.top ?? 2);
      const A = Pt(0, 0), B = Pt(a, 0), C = tr ? Pt(s + bb, hh) : Pt(s, hh), D = Pt(s, hh);
      const fig = tr ? [A, B, C, D] : [A, B, C], M = G.midden(B, C), g0 = gem(fig);
      vast = [fig];
      const dy = -(hh + 1);
      stukken = [{ pts: fig, stof: st1, c0: G.plus(g0, Pt(0, dy)), c1: G.min(G.maal(M, 2), g0), rot: 180, g: g0 }];
      doel = draai(fig, M);
      const rechts = Math.max(a, (tr ? a + bb + s : a + s));
      maten = tr ? [[A, B, 'a = ' + a, 1], [D, C, 'b = ' + bb, -1]] : [[A, B, 'zijde ' + a, 1]];
      b = { x0: Math.min(0, s) - .6, x1: rechts + .6, y0: dy - .6, y1: hh + .7 };
      const ar = opp(fig), dubbel = r2(2 * ar);
      start = tr ? 'Hier is een <b>tweede, gelijk trapezium</b>. Sleep het omhoog: het draait om en past er precies tegenaan.' : 'Hier is een <b>tweede, gelijke driehoek</b>. Sleep hem omhoog: hij draait om en past er precies tegenaan.';
      eind = tr
        ? `Samen een parallellogram met zijde <b>${a} + ${bb} = ${a + bb}</b> en hoogte ${hh}: ${getal(dubbel)} hokjes. Eén trapezium is de helft: <b>½ × (${a} + ${bb}) × ${hh} = ${getal(ar)}</b>.`
        : `Samen een parallellogram van ${a} × ${hh} = ${getal(dubbel)} hokjes. Eén driehoek is precies de helft: <b>½ × ${a} × ${hh} = ${getal(ar)}</b>.`;
      const voet = Pt(s, 0), top = tr ? D : C;
      extra = V => V.stuk(top, voet, { kleur: K.hoogtelijn, dik: 2.4, stip: true }) + rechteHoekPx(V, voet, top, Pt(s + 1, 0)) + label(V, top, voet, 'hoogte ' + hh, { kant: 1, kleur: WK.donker(K.hoogtelijn, .25) });
    } else { /* ruit */
      const d1 = p.d1 ?? 6, d2 = p.d2 ?? 4;
      const O = Pt(d1 / 2, d2 / 2), L = Pt(0, d2 / 2), R = Pt(d1, d2 / 2), T = Pt(d1 / 2, d2), Bt = Pt(d1 / 2, 0);
      vast = [[L, R, T]];
      const br = [O, R, Bt], bl = [L, O, Bt];
      stukken = [{ pts: br, stof: st1, c0: gem(br), c1: G.plus(gem(br), Pt(-d1 / 2, d2 / 2)), rot: 0 }, { pts: bl, stof: st1, c0: gem(bl), c1: G.plus(gem(bl), Pt(d1 / 2, d2 / 2)), rot: 0 }];
      naden = [[L, R], [O, Bt]]; doel = [L, R, Pt(d1, d2), Pt(0, d2)];
      maten = [[L, O, 'd₁ = ' + d1, -1], [O, T, 'd₂ = ' + d2, 1]];
      b = { x0: -.6, x1: d1 + .6, y0: -.7, y1: d2 + .7 };
      start = 'Knip de ruit langs de diagonalen en sleep de <b>twee onderste driehoekjes</b> naar boven.';
      eind = `Een rechthoek van ${d1} bij ½ × ${d2} = ${getal(d2 / 2)}: ${getal(d1 * d2 / 2)} hokjes. Dus ruit = <b>½ × d₁ × d₂ = ½ × ${d1} × ${d2} = ${getal(d1 * d2 / 2)}</b>.`;
    }
    const V = papier(b, { hoog: 300 });
    const totaal = r2(vast.reduce((s, f) => s + opp(f), 0) + (modus === 'parallellogram' || modus === 'ruit' ? stukken.reduce((s, x) => s + opp(x.pts), 0) : 0));
    /* vaste stof, doel-omtrek, naden en maten */
    V.zet('figuur', vast.map(f => lap(V, f, st0)).join(''));
    const stukG = stukken.map(x => { const g = sv('g', { class: 'wk-stuk' }); g.innerHTML = lap(V, x.pts, x.stof); V.laag.figuur.append(g); return g; });
    const doelG = sv('g', { class: 'wk-doel' }); doelG.innerHTML = V.veelhoek(doel, { kleur: K.inkt, dik: 2, stip: true, op: .55 }); V.laag.gebied.append(doelG);
    const pijlen = sv('g', { class: 'wk-pijlen' });
    pijlen.innerHTML = stukken.map(x => V.stuk(x.c0, x.c1, { kleur: K.punt, dik: 2, stip: true, pijl: true })).join('');
    V.laag.meet.append(pijlen);
    const nadenG = sv('g', { class: 'wk-naden' });
    nadenG.innerHTML = naden.map(([a, c]) => V.stuk(a, c, { kleur: '#DB2777', dik: 2.4, stip: true }) + schaar(V.X(a.x) + 14, V.Y(a.y) + 4)).join('');
    V.laag.meet.append(nadenG);
    V.voeg('meet', maten.map(([a, c, t, k]) => label(V, a, c, t, { kant: k })).join('') + (extra ? extra(V) : ''));
    const meet = h('div', { class: 'wk-meet' });
    const zetMeet = klaar => {
      meet.innerHTML = '';
      if (modus === 'driehoek' || modus === 'trapezium') {
        meet.append(h('span', {}, `één ${modus}: ${getal(totaal)} hokjes`));
        if (klaar) meet.append(h('span', { class: 'ok' }, `samen: ${getal(2 * totaal)} hokjes`));
      } else meet.append(h('span', { class: klaar ? 'ok' : '' }, `stof: ${getal(totaal)} hokjes`));
    };
    zetMeet(false);
    const fb = h('div', { class: 'wk-uitleg', 'aria-live': 'polite', html: start });
    root.append(V.svg, meet, fb);
    pod.append(root);
    /* het slepen */
    const pose = (x, t) => {
      const g0 = x.g || x.c0, c = G.plus(x.c0, G.maal(G.min(x.c1, x.c0), t)), base = x.g ? x.g : x.c0;
      const tx = (c.x - base.x) * V.s, ty = -(c.y - base.y) * V.s;
      stukG[stukken.indexOf(x)].setAttribute('transform', `translate(${tx.toFixed(1)} ${ty.toFixed(1)}) rotate(${(-x.rot * t).toFixed(1)} ${V.X(g0.x).toFixed(1)} ${V.Y(g0.y).toFixed(1)})`);
    };
    let klaarFase = false, vraag = null;
    const nogNiet = () => stukken.filter(x => !x.af);
    const handvatten = stukken.map(x => {
      pose(x, 0);
      const hv = V.handvat(x.c0, { kleur: K.punt }); hv.classList.add('wenk'); hv.setAttribute('aria-label', 'sleep het stuk stof');
      const v = G.min(x.c1, x.c0), vv = v.x * v.x + v.y * v.y;
      const tVan = q => Math.max(0, Math.min(1, ((q.x - x.c0.x) * v.x + (q.y - x.c0.y) * v.y) / vv));
      V.sleep(hv, {
        beperk: q => G.plus(x.c0, G.maal(v, tVan(q))),
        beweeg: q => { if (x.af) return; hv.classList.remove('wenk'); pose(x, tVan(q)); },
        los: q => {
          if (x.af) return;
          if (tVan(q) >= .85) {
            x.af = true; pose(x, 1); hv.remove();
            stukG[stukken.indexOf(x)].classList.add('past');
            if (!nogNiet().length) klaar();
            else zeg(fb, '', 'Past precies! Nog één.');
          }
        },
      });
      return hv;
    });
    function klaar() {
      if (klaarFase) return; klaarFase = true;
      pijlen.remove(); doelG.remove(); nadenG.remove(); zetMeet(true);
      zeg(fb, 'goed', eind);
      vraag = slot(root, p, api, eind);
    }
    root._los = async fout => {
      for (const [i, x] of stukken.entries()) {
        if (x.af) continue;
        if (fout && i === 0) { handvatten[i]._naar(G.plus(x.c0, G.maal(G.min(x.c1, x.c0), .4))); await pauze(80); }
        handvatten[i]._naar(x.c1); await pauze(80);
      }
      if (vraag && root.dataset.af !== '1') await vraag.los(fout);
    };
  };

  /* ===================================================================== SCHUIFPROEF */
  VIS.schuifproef = (pod, p, api) => {
    const drie = (p.vorm || 'driehoek') === 'driehoek', a = p.a ?? 6, hh = p.h ?? 3;
    const lo = p.min ?? -3, hi = p.max ?? (drie ? a + 3 : a), nodig = p.bereik ?? 4;
    let x = p.top ?? (drie ? Math.round(a / 2) : 1);
    const root = h('div', { class: 'wk-vis wk-opp wk-schuifproef' });
    const V = papier({ x0: Math.min(lo, 0) - 1.8, x1: Math.max(drie ? hi : hi + a, a) + 1.8, y0: -1.3, y1: hh + 1 }, { hoog: 230 });
    const A = Pt(0, 0), B = Pt(a, 0), stof = p.stof || 'mint';
    const meet = h('div', { class: 'wk-meet' });
    const fb = h('div', { class: 'wk-uitleg', 'aria-live': 'polite', html: p.start || 'Sleep de <b>top</b> heen en weer. Kijk naar de schuine zijde én naar de stof.' });
    root.append(V.svg, meet, fb); pod.append(root);
    let vmin = x, vmax = x, buiten = false, klaarFase = false, vraag = null, eerste = null;
    const teken = () => {
      const T = Pt(x, hh), pts = drie ? [A, B, T] : [A, B, Pt(x + a, hh), T], voet = Pt(x, 0);
      let m = lap(V, pts, stof);
      V.zet('figuur', m);
      let mt = '';
      if (x < 0) mt += V.stuk(voet, A, { kleur: K.zacht, dik: 2, stip: true });
      if (x > a) mt += V.stuk(B, voet, { kleur: K.zacht, dik: 2, stip: true });
      mt += V.stuk(T, voet, { kleur: K.hoogtelijn, dik: 2.6, stip: true }) + rechteHoekPx(V, voet, T, x <= 0 ? Pt(x + 1, 0) : Pt(x - 1, 0));
      mt += V.stuk(A, T, { kleur: '#DC2626', dik: 3.2 });
      mt += label(V, A, B, 'zijde ' + a, { kant: 1 }) + label(V, T, voet, 'hoogte ' + hh, { kant: x >= 0 ? -1 : 1, kleur: WK.donker(K.hoogtelijn, .25) });
      mt += label(V, A, T, getal(G.rond(G.d(A, T), 1)), { kant: x >= 0 ? -1 : 1, kleur: '#B91C1C', px: 18 });
      V.zet('meet', mt);
      const ar = opp(pts);
      meet.innerHTML = '';
      meet.append(h('span', {}, 'schuine zijde: ' + getal(G.rond(G.d(A, T), 1))), h('span', {}, 'hoogte: ' + hh), h('span', { class: 'ok' }, 'stof: ' + getal(ar) + ' hokjes'));
      return ar;
    };
    const ar0 = teken();
    const hv = V.handvat(Pt(x, hh), { kleur: K.punt, label: drie ? 'top' : '' }); hv.classList.add('wenk');
    const klaar = () => {
      if (klaarFase) return; klaarFase = true; hv.classList.remove('wenk');
      const tekst = p.na || `De schuine zijde was ${getal(G.rond(G.d(A, Pt(vmin, hh)), 1))} en ${getal(G.rond(G.d(A, Pt(vmax, hh)), 1))}, maar de stof bleef <b>${getal(ar0)} hokjes</b>. Alleen de zijde en de <b>hoogte</b> tellen. De schuine zijde doet er niet toe.`;
      zeg(fb, 'goed', tekst);
      vraag = slot(root, { ...p, na: p.na || tekst }, api, tekst);
    };
    V.sleep(hv, {
      snap: .5,
      beperk: q => Pt(Math.max(lo, Math.min(hi, Math.round(q.x * 2) / 2)), hh),
      beweeg: q => {
        x = q.x; hv.classList.remove('wenk'); teken();
        vmin = Math.min(vmin, x); vmax = Math.max(vmax, x);
        if (x < -.4 || x > a + .4) buiten = true;
        if (eerste === null) eerste = x;
        if (!klaarFase) {
          if (vmax - vmin >= nodig && (!p.buiten || buiten)) klaar();
          else if (p.buiten && vmax - vmin >= nodig) zeg(fb, '', 'Schuif de top nu eens <b>voorbij</b> het eind van de zijde. Waar komt de hoogte dan?');
          else if (vmax - vmin >= 1.5) zeg(fb, '', 'Kijk: de schuine zijde verandert. En de stof? Schuif nog verder.');
        }
      },
    });
    root._los = async fout => {
      if (!klaarFase) {
        if (fout) { hv._naar(Pt(x + .5 <= hi ? x + .5 : x - .5, hh)); await pauze(60); }
        hv._naar(Pt(lo, hh)); await pauze(60); hv._naar(Pt(hi, hh)); await pauze(60);
      }
      if (vraag && root.dataset.af !== '1') await vraag.los(fout);
    };
  };

  /* ===================================================================== MAATKIEZER */
  const KIES = {
    driehoek: 'Tik een <b>zijde</b> en de <b>hoogte die erbij hoort</b>.', parallellogram: 'Tik een <b>zijde</b> en de <b>hoogte die erbij hoort</b>.',
    trapezium: 'Tik de <b>twee evenwijdige zijden</b> en de <b>hoogte</b>.', ruit: 'Tik de <b>twee diagonalen</b>.',
  };
  VIS.maatkiezer = (pod, p, api) => {
    const fig = p.figuur || 'driehoek', pts = p.pts, maten = p.maten, k = p.goed[0].length;
    const M = Object.fromEntries(maten.map(m => [m.id, m]));
    const root = h('div', { class: 'wk-vis wk-opp wk-maatkiezer' });
    const alle = [...pts, ...maten.flatMap(m => [m.a, m.b, ...(m.verleng || [])])];
    const V = papier(kader(alle, p.marge), { rooster: !!p.rooster, hoog: p.hoog || 280, maxS: p.rooster ? 40 : 70 });
    V.zet('figuur', lap(V, pts, p.stof || 'roze', { op: .55, naad: false }));
    /* hoekpuntletters */
    const c = gem(pts);
    V.voeg('figuur', pts.filter(q => q.l).map(q => { const u = G.eenheid(G.min(q, c)); return tekstOp(V, G.plus(q, G.maal(u, 15 / V.s)), q.l, { fs: 16 }); }).join(''));
    V.voeg('gebied', maten.filter(m => m.verleng).map(m => V.stuk(m.verleng[0], m.verleng[1], { kleur: K.zacht, dik: 2, stip: true })).join(''));
    V.voeg('meet', maten.filter(m => m.haak).map(m => rechteHoekPx(V, ...m.haak)).join(''));
    const kleur = m => m.soort === 'hoogte' ? K.hoogtelijn : m.soort === 'diag' ? K.bissectrice : K.inkt;
    const el = {};
    maten.forEach(m => {
      const [x1, y1] = V.P(m.a), [x2, y2] = V.P(m.b), d = `M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`;
      const lijn = sv('g', { class: 'wk-mk-maat wk-mk-' + m.soort, 'data-id': m.id });
      lijn.innerHTML = `<path d="${d}" stroke="transparent" stroke-width="40" stroke-linecap="round"/><path class="wk-mk-lijn" d="${d}" stroke="${kleur(m)}" stroke-width="3.2" stroke-linecap="round"${m.soort === 'hoogte' ? ' stroke-dasharray="7 5"' : ''}/>`;
      V.laag.meet.append(lijn);
      /* label als tikbare pil (raakvlak minstens 48 x 46) */
      const L = Math.hypot(x2 - x1, y2 - y1) || 1, kant = m.kant ?? 1, px = 22;
      const lx = m.lp ? V.X(m.lp.x) : (x1 + x2) / 2 - (y2 - y1) / L * kant * px, ly = m.lp ? V.Y(m.lp.y) : (y1 + y2) / 2 + (x2 - x1) / L * kant * px;
      const w = Math.max(48, m.t.length * 8.6 + 20);
      const pil = sv('g', { class: 'wk-mk-pil', tabindex: '0', role: 'button', 'aria-label': 'maat ' + m.t, 'data-id': m.id, transform: `translate(${lx.toFixed(1)} ${ly.toFixed(1)})` });
      pil.innerHTML = `<rect x="${-w / 2 - 4}" y="-24" width="${w + 8}" height="48" fill="transparent"/><rect class="pil" x="${-w / 2}" y="-15" width="${w}" height="30" rx="15" stroke="${kleur(m)}"/><text y="5.5" font-size="15" font-weight="800" text-anchor="middle">${m.t}</text>`;
      V.laag.top.append(pil);
      el[m.id] = [lijn, pil];
      [lijn, pil].forEach(e => { e.addEventListener('click', () => tik(m.id)); e.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); tik(m.id); } }); });
    });
    const keuze = new Set();
    const meet = h('div', { class: 'wk-meet' });
    const fb = h('div', { class: 'wk-uitleg', 'aria-live': 'polite', html: p.kies || KIES[fig] });
    root.append(V.svg, meet, fb); pod.append(root);
    let gevonden = false, vraag = null;
    const markeer = () => maten.forEach(m => el[m.id].forEach(e => e.classList.toggle('kies', keuze.has(m.id))));
    const zelfde = (a, b) => a.length === b.size && a.every(id => b.has(id));
    const defaultMis = { driehoek: 'W13', parallellogram: 'W17', trapezium: 'W19', ruit: null };
    function tik(id) {
      if (gevonden) return;
      if (keuze.has(id)) keuze.delete(id); else keuze.add(id);
      markeer();
      if (keuze.size < k) { meet.innerHTML = ''; meet.append(...[...keuze].map(i => h('span', {}, M[i].t))); return; }
      const goed = p.goed.find(s => zelfde(s, keuze));
      if (goed) {
        gevonden = true;
        maten.forEach(m => el[m.id].forEach(e => { e.classList.remove('kies'); e.classList.add(keuze.has(m.id) ? 'goed' : 'weg'); }));
        meet.innerHTML = '';
        goed.forEach(i => { const m = M[i]; meet.append(h('span', { class: 'ok' }, p.tel ? `${m.t} = ${getal(G.d(m.a, m.b))}` : m.t)); });
        zeg(fb, 'goed', p.wKies || (fig === 'ruit' ? 'Ja: de twee diagonalen.' : fig === 'trapezium' ? 'Ja: de twee evenwijdige zijden en de hoogte daartussen.' : 'Ja: die staan <b>loodrecht</b> op elkaar.'));
        vraag = slot(root, p, api, p.na || 'Goed gekozen.');
        return;
      }
      /* fout: zeg waarom */
      const gekozen = [...keuze].map(i => M[i]);
      const inGoed = new Set(p.goed.flat());
      const raar = gekozen.find(m => m.fout) || gekozen.find(m => m.soort === 'schuin' || !inGoed.has(m.id));
      let tekst, mis;
      if (raar && (raar.fout || raar.soort === 'schuin' || !inGoed.has(raar.id))) {
        tekst = raar.fout || (fig === 'ruit' ? `<b>${raar.t}</b> is een zijde, geen diagonaal. Een diagonaal gaat van hoekpunt naar overstaand hoekpunt.`
          : fig === 'trapezium' ? `<b>${raar.t}</b> is een schuine zijde. Je hebt de twee <b>evenwijdige</b> zijden nodig en de hoogte ertussen.`
          : `<b>${raar.t}</b> staat schuin, niet loodrecht. Schuif je de top opzij, dan wordt die schuine zijde langer, maar de stof blijft even groot. Zoek het hoekje van 90°.`);
        mis = raar.mis !== undefined ? raar.mis : defaultMis[fig];
      } else {
        tekst = p.foutPaar || (fig === 'trapezium' ? 'Je hebt de twee evenwijdige zijden en de hoogte nodig.' : 'Die horen niet bij elkaar. De bijbehorende hoogte staat <b>loodrecht</b> op die zijde: zoek het hoekje van 90° bij die zijde.');
        mis = p.misPaar !== undefined ? p.misPaar : (fig === 'driehoek' || fig === 'parallellogram' ? 'W15' : null);
      }
      foutje(api, mis); zeg(fb, 'fout', '<b>Bijna.</b> ' + tekst);
      gekozen.forEach(m => el[m.id][1].classList.add('mis'));
      setTimeout(() => gekozen.forEach(m => el[m.id][1].classList.remove('mis')), 900);
      keuze.clear(); markeer(); meet.innerHTML = '';
    }
    root._los = async fout => {
      if (!gevonden) {
        const g = p.goed[0];
        if (fout) {
          const kand = [...maten.filter(m => m.soort === 'schuin'), ...maten.filter(m => m.soort !== 'schuin')].map(m => [...g.slice(0, -1), m.id])
            .find(c => new Set(c).size === k && !p.goed.some(s => zelfde(s, new Set(c))));
          if (kand) { kand.forEach(id => tik(id)); await pauze(60); }
        }
        keuze.clear(); markeer(); g.forEach(id => tik(id)); await pauze(60);
      }
      if (vraag && root.dataset.af !== '1') await vraag.los(fout);
    };
  };

  /* ===================================================================== SPLITSER */
  VIS.splitser = (pod, p, api) => {
    const pts = p.pts, eh = p.eenheid || 'cm²', totaal = opp(pts);
    const root = h('div', { class: 'wk-vis wk-opp wk-splitser' });
    const alle = [...pts, ...(p.aanvul ? p.aanvul.rechthoek : [])];
    const V = papier(kader(alle, p.marge), { rooster: p.rooster !== false, hoog: p.hoog || 260 });
    const keuzebalk = h('div', { class: 'wk-keuzes wk-route' });
    const som = h('div', { class: 'wk-meet' });
    const fb = h('div', { class: 'wk-uitleg', 'aria-live': 'polite' });
    root.append(keuzebalk, V.svg, som, fb); pod.append(root);
    const gedaan = {}, uitkomst = {};
    let route = null, vraag = null, foutGedaan = false;
    const basis = () => {
      V.zet('figuur', lap(V, pts, p.stof || 'roze', { naad: false }));
      V.zet('meet', (p.maten || []).map(([a, c, t, k]) => label(V, a, c, t, { kant: k ?? 1 })).join(''));
      V.zet('top', ''); V.zet('gebied', ''); som.innerHTML = '';
    };
    const badge = (q, soort, aria) => {
      const g = sv('g', { class: 'wk-badge wk-badge-' + soort, tabindex: '0', role: 'button', 'aria-label': aria, transform: `translate(${V.X(q.x).toFixed(1)} ${V.Y(q.y).toFixed(1)})` });
      g.innerHTML = `<circle r="25" fill="transparent"/><circle class="ring" r="20" fill="none" stroke="${K.punt}" stroke-width="3"/><circle r="15" fill="#fff" stroke="${K.punt}" stroke-width="2"/>` +
        (soort === 'knip' ? `<g transform="scale(.8)">${schaar(0, -1, '#4B5563')}</g>` : `<path d="M-7 0 H7 M0 -7 V7" stroke="${K.punt}" stroke-width="3.4" stroke-linecap="round"/>`);
      g.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); klik(g); } });
      V.laag.top.append(g); return g;
    };
    const stofNamen = ['mint', 'geel', 'paars', 'denim', 'koraal'];
    /* ---- splitsen ---- */
    function splitsen() {
      route = 'splitsen'; basis();
      zeg(fb, '', 'Tik de <b>knipnaden</b> (de schaartjes). Dan valt de figuur uiteen in stukken die je kunt uitrekenen.');
      const lijnen = [...p.splits.lijnen.map(([a, c]) => ({ a, c, goed: true })), ...(p.splits.fout || []).map(f => ({ ...f, c: f.b, goed: false }))];
      let over = p.splits.lijnen.length;
      lijnen.forEach(l => {
        const lg = sv('g'); lg.innerHTML = V.stuk(l.a, l.c, { kleur: '#fff', dik: 5 }) + V.stuk(l.a, l.c, { kleur: '#6B7280', dik: 2.6, stip: true }); V.laag.meet.append(lg);
        const bd = badge(G.midden(l.a, l.c), 'knip', 'knip hier'); bd._goed = l.goed;
        bd.addEventListener('click', () => {
          if (bd._klaar) return;
          if (l.goed) {
            bd._klaar = true; bd.remove(); lg.innerHTML = V.stuk(l.a, l.c, { kleur: '#DB2777', dik: 3, stip: true });
            if (--over === 0) stukken();
          } else { bd._klaar = true; bd.remove(); lg.remove(); foutje(api, l.mis); zeg(fb, 'fout', '<b>Bijna.</b> ' + (l.fout || 'Met deze knip krijg je geen stukken die je makkelijk uitrekent.')); }
        });
      });
    }
    function stukken() {
      const st = p.splits.stukken;
      V.zet('figuur', st.map((s, i) => lap(V, s.pts, s.stof || stofNamen[i % stofNamen.length], { naad: s.naad !== false })).join(''));
      V.zet('gebied', '');
      V.voeg('top', st.map(s => tekstOp(V, s.lp || gem(s.pts), `${s.som} = ${getal(opp(s.pts))}`, { fs: 14 })).join(''));
      const delen = st.map(s => opp(s.pts)), uit = r2(delen.reduce((a, c) => a + c, 0));
      if (Math.abs(uit - totaal) > .01) console.warn('splitser: stukken samen', uit, 'maar figuur', totaal);
      som.innerHTML = ''; som.append(h('span', { class: 'ok' }, delen.map(getal).join(' + ') + ' = ' + getal(uit) + ' ' + eh));
      klaarRoute('splitsen', uit, `Splitsen: ${delen.map(getal).join(' + ')} = <b>${getal(uit)} ${eh}</b>.`);
    }
    /* ---- aanvullen ---- */
    function aanvullen() {
      route = 'aanvullen'; basis();
      const av = p.aanvul, rh = opp(av.rechthoek);
      V.voeg('gebied', V.veelhoek(av.rechthoek, { kleur: K.inkt, dik: 2.2, stip: true, op: .7 }));
      zeg(fb, '', `Maak er een rechthoek van: ${av.som} = ${getal(rh)}. Tik dan elk <b>gat</b> (de plusjes): die stukjes stof moet je er weer <b>af</b> halen.`);
      let over = av.gaten.length; const af_ = [];
      av.gaten.forEach(gt => {
        const gg = sv('g'); gg.innerHTML = V.veelhoek(gt.pts, { kleur: K.punt, dik: 2, stip: true, vul: 'rgba(234,88,12,.08)' }); V.laag.gebied.append(gg);
        const bd = badge(gt.lp || gem(gt.pts), 'plus', 'vul dit gat'); bd._goed = true;
        bd.addEventListener('click', () => {
          if (bd._klaar) return; bd._klaar = true; bd.remove();
          gg.innerHTML = lap(V, gt.pts, 'denim', { op: .5, naad: false }) + tekstOp(V, gt.lp || gem(gt.pts), '−' + getal(opp(gt.pts)), { fs: 14, kleur: '#1E3A8A' });
          af_.push(opp(gt.pts));
          if (--over === 0) {
            const uit = r2(rh - af_.reduce((a, c) => a + c, 0));
            if (Math.abs(uit - totaal) > .01) console.warn('splitser: aanvullen geeft', uit, 'maar figuur', totaal);
            V.voeg('top', tekstOp(V, gem(pts), `${av.som} = ${getal(rh)}`, { fs: 14 }));
            som.innerHTML = ''; som.append(h('span', { class: 'ok' }, getal(rh) + af_.map(x => ' − ' + getal(x)).join('') + ' = ' + getal(uit) + ' ' + eh));
            klaarRoute('aanvullen', uit, `Aanvullen: ${getal(rh)}${af_.map(x => ' − ' + getal(x)).join('')} = <b>${getal(uit)} ${eh}</b>.`);
          }
        });
      });
    }
    function klaarRoute(r, uit, tekst) {
      gedaan[r] = true; uitkomst[r] = tekst;
      const ander = r === 'splitsen' ? 'aanvullen' : 'splitsen';
      keuzebalk.innerHTML = '';
      if (p.beide && !gedaan[ander] && (ander === 'splitsen' ? p.splits : p.aanvul)) {
        zeg(fb, 'goed', tekst + ' Probeer nu de andere route. Komt er hetzelfde uit?');
        const kn = h('button', { class: 'wk-keus wk-ander', type: 'button' }, ander === 'splitsen' ? 'Nu splitsen' : 'Nu aanvullen');
        kn.addEventListener('click', () => { keuzebalk.innerHTML = ''; ander === 'splitsen' ? splitsen() : aanvullen(); });
        keuzebalk.append(kn); return;
      }
      const eind = (gedaan.splitsen && gedaan.aanvullen ? uitkomst.splitsen + ' ' + uitkomst.aanvullen + ' Allebei hetzelfde: de stof verandert niet door hoe je rekent.' : tekst);
      zeg(fb, 'goed', eind);
      vraag = slot(root, p, api, eind);
    }
    /* ---- start: route kiezen ---- */
    basis();
    if (p.route) (p.route === 'splitsen' ? splitsen : aanvullen)();
    else {
      zeg(fb, '', p.start || 'Hoe reken je deze stof uit? Kies een route: <b>splitsen</b> in stukken, of <b>aanvullen</b> tot een rechthoek en er stukjes af halen.');
      const r1 = h('button', { class: 'wk-keus', type: 'button' }, 'Splitsen'), r2_ = h('button', { class: 'wk-keus', type: 'button' }, 'Aanvullen');
      r1.addEventListener('click', () => { keuzebalk.innerHTML = ''; splitsen(); });
      r2_.addEventListener('click', () => { keuzebalk.innerHTML = ''; aanvullen(); });
      if (!p.splits) r1.disabled = true;
      if (!p.aanvul) r2_.disabled = true;
      keuzebalk.append(r1, r2_);
    }
    root._los = async fout => {
      for (let n = 0; n < 6 && !vraag && root.dataset.af !== '1'; n++) {
        const kn = [...keuzebalk.querySelectorAll('button')].find(b => !b.disabled);
        if (kn) { klik(kn); await pauze(60); continue; }
        const bds = [...V.laag.top.querySelectorAll('.wk-badge')];
        if (fout && !foutGedaan) { const f = bds.find(b => !b._goed); if (f) { foutGedaan = true; klik(f); await pauze(60); } }
        for (const b of [...V.laag.top.querySelectorAll('.wk-badge')]) if (b._goed) { klik(b); await pauze(40); }
        await pauze(40);
      }
      if (vraag && root.dataset.af !== '1') await vraag.los(fout && !foutGedaan ? (foutGedaan = true) : false);
    };
  };
})();
