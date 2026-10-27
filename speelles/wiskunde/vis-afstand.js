'use strict';
/* =========================================================================
   WISKUNDE: bouwstenen voor afstanden (canoniek: tools/speelles-engine/wiskunde/vis-afstand.js)
   Familie A, variant meetkunde. Signatuur: het meetlint als wapen (alles wat je ziet, kun je meten).
   Vereist engine.js en wiskunde/teken.js (WK). Zit in een IIFE: geen globale namen behalve VIS.*.
   Elke bouwsteen: VIS.naam = (podium, p, api) => opruim?  (alle inhoud via p)
   - Werkt als 'toon' én als bewijs- of baasvraag ({visual, p}): api.fout() bij elke fout,
     api.klaar() als hij af is. In een vraag (api.inVraag) moet Storm zelf "Hier!" zeggen
     (p.knop, standaard aan in een vraag) in plaats van dat het punt vanzelf vastklikt.
   - Wortel .wk-vis, data-af="1" als hij af is, root._los(fout) doet de resterende handelingen
     (eerst één foute als fout === true) voor test/speler.js (P.wk).
   - Knoppen heten .wk-keus (nooit .optie). Tikdoelen zijn WK-handvatten (raakcirkel 26 = ±50 px).
   Punten mogen {x, y} of [x, y] zijn. Gemeenschappelijk voor alle bouwstenen:
     p.vlak {xmin, xmax, ymin, ymax, assen, s}   (s standaard zo dat de breedte 340 eenheden is)
     p.vraag (tekst boven de tekening), p.schaal (1 hokje = schaal eenheden), p.eenheid ('cm'), p.dec (1)
     p.kies {vraag, opties:[{t, goed} | {t, fout, mis}], w, vast}: een keuzevraag ná de handeling
     p.na (uitleg als hij af is), p.klaar (coachtekst als hij af is), p.mis (valkuil bij een fout),
     p.decor (V => svg-markup): extra tekening (kust, zwembad), in wereldcoördinaten via V.

     afstandprobe  sleep meetpunt P; live afstanden. Na genoeg punten verschijnt de figuur (met viering).
                   p.modus 'cirkel': p.M, p.r, p.n (5), p.naamM ('M'), p.basis (helikopterplatform onder M)
                   p.modus 'lijn': lijn l door p.A en p.B, p.d, p.n (4, minstens 2 aan elke kant: W4), p.naamL ('l')
                   p.modus 'evenver-punten': p.A, p.B, p.n (4); het midden alleen telt niet als genoeg (W5)
                   p.modus 'evenver-benen': hoekpunt p.O, benen door p.A en p.B, p.n (3), p.naamO, p.benen ['been 1','been 2']
                   p.naamP ('P'), p.start, p.tol (0,3: magneet naar de figuur)
     roosterkleur  tik roosterpunten die aan alle voorwaarden voldoen (EN).
                   p.voorwaarden [{tot:'punt', p, naam, rel, r, rTekst?} | {tot:'lijn', a, b, naam, rel, d}
                                  | {tot:'dichter', a, b, naamA, naamB} | {tot:'evenver', a, b, naamA, naamB}], rel '<' '<=' '=' '>=' '>'
                     (elke voorwaarde mag een eigen mis hebben; standaard: op de rand bij < of > = W2, verkeerde kant = W7)
                   p.figuren [{soort:'cirkel', m, r, naam} | {soort:'punt', p, naam} | {soort:'lijn'|'stuk'|'halflijn', a, b, naam}
                              | {soort:'evenwijdig', a, b, d} | {soort:'middelloodlijn', a, b} | {soort:'veelhoek', pts}]
                   p.domein {soort:'lijn', a, b}: alleen roosterpunten op die lijn tellen mee (bv. de x-as)
                   p.genoeg (aantal goede punten dat nodig is, standaard alle), p.kleur, p.assen
     loodrecht     punt p.A en lijn l door p.a en p.b; sleep voetpunt F over l, de lengte loopt mee;
                   de kortste stand klikt vast met rechtehoekteken en wordt A' (W3). p.naam ('A'), p.naamL ('l'), p.start
     cirkelzoeker  driehoek p.A p.B p.C (p.namen), p.modus 'omgeschreven' (MA = MB = MC, daarna de middelloodlijnen)
                   of 'ingeschreven' (drie loodrechte afstanden gelijk, daarna de bissectrices). Werkt ook stomphoekig.
                   In een vraag volgt standaard een keuzevraag over de lijnen (W10), tenzij p.kies === false.
     balans        driehoek op een stokje: sleep steunpunt S, de plaat kantelt tot je Z raakt. Daarna zwaartelijnen
                   tekenen: tik een hoekpunt en het midden van de overstaande zijde (lokkers: voetpunt hoogte = W11,
                   voetpunt bissectrice = W8). p.fase 'beide' | 'balans' | 'lijnen', p.lijnen (2)
     hoogtezoeker  sleep de voet F van de hoogte langs de (verlengde) zijde tot het loodrecht staat.
                   p.hoogtes (lijst hoekpuntnamen, standaard [p.top || derde naam]); bij twee of meer verschijnt H.
                   Stomphoekig: de voet ligt buiten, de zijde wordt gestippeld verlengd (W16, W12).
     lijnkiezer    p.modus 'kies': p.items [{soort, bij}] (bij = hoekpunt, of zijde 'AB' voor een middelloodlijn):
                   een lijn staat er neutraal, Storm kiest de naam. p.modus 'tik': p.items [{zoek, bij, lokkers:[soort]}]:
                   genummerde lijnen, Storm tikt de goede. Meetknoppen (stukken, hoek) zijn altijd vrij.
                   Fout = de drie vragen: door een hoekpunt? naar het midden? loodrecht? (met de echte maten)
   ========================================================================= */
(() => {
  const G = WK.G, K = WK.K, nl = WK.nl;
  const EPS = 1e-6;
  const pt = q => q == null ? q : Array.isArray(q) ? { x: q[0], y: q[1] } : { x: q.x, y: q.y };
  const pauze = ms => new Promise(r => setTimeout(r, minderBeweging() ? Math.min(ms, 40) : ms));
  const schud = el => { if (!el) return; el.classList.remove('wk-schud'); void el.getBoundingClientRect?.(); el.classList.add('wk-schud'); };
  const foutje = (api, mis) => { api.fout?.(); if (mis) api.spot(mis); };
  const graad = x => Math.round(x) + '°';
  const scherp = x => Math.min(x, 180 - x);
  const NEUTRAAL = '#475569';
  const SOORT = {
    middelloodlijn: { naam: 'middelloodlijn', kleur: K.middelloodlijn, kort: 'door het <b>midden</b> van een zijde én <b>loodrecht</b> erop' },
    bissectrice: { naam: 'bissectrice', kleur: K.bissectrice, kort: 'deelt een <b>hoek</b> in twee gelijke hoeken' },
    zwaartelijn: { naam: 'zwaartelijn', kleur: K.zwaartelijn, kort: 'van een <b>hoekpunt</b> naar het <b>midden</b> van de overstaande zijde' },
    hoogtelijn: { naam: 'hoogtelijn', kleur: K.hoogtelijn, kort: 'door een <b>hoekpunt</b>, <b>loodrecht</b> op de overstaande zijde' },
  };
  const VOLGORDE = ['middelloodlijn', 'bissectrice', 'zwaartelijn', 'hoogtelijn'];

  /* ---------- gedeelde opbouw ---------- */
  function opzet(pod, p, soort) {
    const root = h('div', { class: 'wk-vis wk-' + soort });
    const vraag = h('div', { class: 'wk-vraag', html: p.vraag || '' });
    const meet = h('div', { class: 'wk-meet', 'aria-live': 'polite' });
    const uit = h('div', { class: 'wk-uitleg', 'aria-live': 'polite' });
    pod.append(root);
    const sch = p.schaal || 1, eh = p.eenheid ?? 'cm', dec = p.dec ?? 1;
    const L = x => nl(x * sch, dec) + (eh ? '&nbsp;' + eh : '');
    return { root, vraag, meet, uit, L };
  }
  function maakVlak(p, std) {
    const o = Object.assign({}, std, p.vlak || {});
    if (!o.s) o.s = Math.round(340 / (o.xmax - o.xmin) * 10) / 10;
    if (o.assen == null) o.assen = !!p.assen;
    return WK.vlak(o);
  }
  /* standaardvlak om een paar punten heen */
  function vlakOm(pts, marge = 1, extra = {}) {
    const xs = pts.map(q => q.x), ys = pts.map(q => q.y);
    return { xmin: Math.floor(Math.min(...xs) - marge), xmax: Math.ceil(Math.max(...xs) + marge), ymin: Math.floor(Math.min(...ys) - marge - (extra.onder || 0)), ymax: Math.ceil(Math.max(...ys) + marge) };
  }
  const maat = (V, a, b, t, o = {}) => V.maat(a, b, t, Object.assign({ s: 15 }, o, { s: Math.max(15, o.s || 15) }));
  const zeg = (el, soort, html) => { el.className = 'wk-uitleg' + (soort ? ' ' + soort : ''); el.innerHTML = html || ''; };
  function zetMeet(el, items) { el.innerHTML = ''; items.forEach(([t, ok]) => el.append(h('span', { class: ok === true ? 'ok' : ok === false ? 'nee' : '', html: t }))); }
  function af(root, api, msg) { if (root.dataset.af) return; root.dataset.af = '1'; root.classList.add('wk-af'); api.klaar(msg); }
  const groep = (ouder, cls = '') => { const g = sv('g', { class: cls }); ouder.append(g); return g; };
  /* een kleine viering: vonkjes rond een wereldpunt */
  function vier(V, q) {
    if (minderBeweging() || !q) return;
    const [x, y] = V.P(q);
    const g = sv('g', { transform: `translate(${x} ${y})`, class: 'wk-vier', 'aria-hidden': 'true' });
    const kl = ['#F4B740', '#EA580C', '#16A34A', '#2563EB', '#DB2777'];
    g.innerHTML = Array.from({ length: 12 }, (_, i) => { const a = i * 30 * Math.PI / 180, r = i % 2 ? 40 : 54; return `<g style="--dx:${(Math.cos(a) * r).toFixed(1)}px;--dy:${(Math.sin(a) * r).toFixed(1)}px"><path class="wk-vonk" d="M0 -6 L1.6 -1.6 L6 0 L1.6 1.6 L0 6 L-1.6 1.6 L-6 0 L-1.6 -1.6Z" fill="${kl[i % 5]}" style="animation-delay:${(i % 3) * 50}ms"/></g>`; }).join('');
    V.laag.top.append(g); setTimeout(() => g.remove(), 1300);
  }
  /* een keuzevraag binnen de bouwsteen (na de handeling) */
  function kiesBlok(root, kies, api, klaarFn) {
    const box = h('div', { class: 'wk-kies' });
    const rij = h('div', { class: 'wk-keuzes' });
    const fb = h('div', { class: 'wk-uitleg', 'aria-live': 'polite' });
    let klaar = false;
    (kies.vast ? kies.opties : shuffle(kies.opties)).forEach(o => {
      const b = h('button', { class: 'wk-keus', type: 'button', html: o.t }); b._goed = !!o.goed;
      b.addEventListener('click', () => {
        if (klaar || b.disabled) return;
        if (o.goed) { klaar = true; b.classList.add('goed'); rij.querySelectorAll('button').forEach(x => x.disabled = true); zeg(fb, 'goed', '<b>Ja.</b> ' + (kies.w || '')); klaarFn(); }
        else { b.classList.add('fout'); b.disabled = true; zeg(fb, 'fout', '<b>Nee.</b> ' + (o.fout || 'Kijk nog eens naar de tekening.')); foutje(api, o.mis); schud(b); }
      });
      rij.append(b);
    });
    box.append(h('div', { class: 'wk-vraag', html: kies.vraag || '' }), rij, fb);
    root.append(box);
    setTimeout(() => { try { box.scrollIntoView({ block: 'nearest', behavior: minderBeweging() ? 'auto' : 'smooth' }); } catch (e) {} }, 60);
    box._kies = async fout => {
      if (fout) { const f = [...rij.children].find(b => !b._goed && !b.disabled); if (f) { f.click(); await pauze(80); } }
      const g = [...rij.children].find(b => b._goed); if (g && !g.disabled) g.click();
    };
    return box;
  }
  /* knop "Hier!" voor de vraagmodus */
  const hierKnop = (t, fn) => h('button', { class: 'wk-keus wk-hier', type: 'button', onclick: fn }, t);
  /* driehoek met labels die naar buiten wijzen */
  function driehoek(V, pts, nm, { vul = '#FEF3C7', kleur = K.inkt, dik = 2.6, labels = true } = {}) {
    const z = G.zwaartepunt(...pts);
    return V.veelhoek(pts, { vul, kleur, dik }) + (labels ? pts.map((q, i) => {
      const u = G.eenheid(G.min(q, z));
      return V.punt(q, { label: nm[i], kleur: K.inkt, r: 4, lx: u.x * 16 - 5, ly: -u.y * 16 + 5 });
    }).join('') : '');
  }
  /* lijnlabel bij de rand van het vlak */
  function lijnLabel(V, a, b, t, kleur = K.inkt, kant = 1) {
    const [, q1] = V.knip(a, b, true, true); if (!q1) return '';
    const u = G.eenheid(G.min(b, a)), w = G.loodrechtOp(u);
    const q = G.plus(G.plus(q1, G.maal(u, -(.35 + .14 * String(t).length))), G.maal(w, .42 * kant));
    return V.tekst(q, t, { s: 16, kleur, vet: true }).replace('<text ', '<text font-style="italic" ');
  }
  /* tikbaar handvat (geen sleep): klik, Enter of spatie */
  function tikbaar(V, q, opt, fn) {
    const g = V.handvat(q, opt); g.classList.add('wk-tik'); g.setAttribute('aria-label', opt.aria || (opt.label ? 'tik ' + opt.label : 'tik dit punt'));
    g.addEventListener('click', () => fn(g));
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(g); } });
    g._tik = () => fn(g);
    return g;
  }
  const knipOpSegment = (q, a, b, m = 0) => { const f = G.proj(q, a, b), L = G.d(a, b), t = Math.max(m / L, Math.min(1 - m / L, f.t)); return { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y), t }; };

  /* ===================================================================== AFSTANDPROBE */
  VIS.afstandprobe = (pod, p, api) => {
    const modus = p.modus || 'cirkel';
    const { root, vraag, meet, uit, L } = opzet(pod, p, 'probe');
    const V = maakVlak(p, { xmin: -1, xmax: 9, ymin: -1, ymax: 7 });
    const tol = p.tol ?? .3, nP = p.naamP || 'P';
    const binnenVlak = (q, m = .25) => q.x >= V.xmin + m && q.x <= V.xmax - m && q.y >= V.ymin + m && q.y <= V.ymax - m;
    let def;

    if (modus === 'cirkel') {
      const M = pt(p.M || [4, 3]), r = p.r ?? 2, nm = p.naamM || 'M', n = p.n ?? 5;
      const helipad = () => { const [x, y] = V.P(M); return `<circle cx="${x}" cy="${y}" r="17" fill="#FDE68A" stroke="#D97706" stroke-width="2.4"/><circle cx="${x}" cy="${y}" r="12" fill="none" stroke="#fff" stroke-width="1.6" opacity=".9"/><text x="${x}" y="${y + 6}" font-size="17" font-weight="900" text-anchor="middle" fill="#B45309">H</text>`; };
      def = {
        n,
        statisch: () => (p.basis ? helipad() : '') + V.punt(M, { label: nm, kleur: K.inkt, r: p.basis ? 3 : 5, lx: p.basis ? 14 : 8, ly: p.basis ? -14 : -8 }),
        snap: q => { const d = G.d(q, M); if (Math.abs(d - r) < tol && d > .05) return { q: G.plus(M, G.maal(G.eenheid(G.min(q, M)), r)), op: true }; return { q, op: false }; },
        meet: (q, op) => [[`${nP}${nm} = ${L(G.d(q, M))}`, op ? true : null], [`doel: ${L(r)}`, null]],
        live: (q, op) => V.stuk(M, q, { kleur: op ? K.goed : K.probe, dik: 2.2, stip: !op }) + maat(V, M, q, L(G.d(q, M)), { kleur: op ? K.goed : K.probe }),
        nietOp: q => { const d = G.d(q, M); return `${nP}${nm} = ${L(d)}. Je zoekt ${L(r)}: schuif ${d > r ? 'dichter naar' : 'verder van'} ${nm}. Als het getal groen wordt, zit je goed.`; },
        check: (q, gez) => gez.some(g => G.d(g, q) < r * .6) ? `Die ligt vlak naast een punt dat je al hebt. Zoek een plek aan een <b>andere kant</b> van ${nm}.` : null,
        genoeg: gez => gez.length >= n,
        figuur: () => V.cirkel(M, r, { kleur: K.cirkel, dik: 3.2 }) + V.punt(M, { kleur: K.inkt, r: 4 }),
        middel: M,
        afTekst: `Zie je het? Alle punten op ${L(r)} van ${nm} vormen samen een <b>cirkel</b>: ⊙(${nm}, ${L(r)}).`,
        start: () => { let q = G.plus(M, { x: r + 1.4, y: .7 }); if (!binnenVlak(q)) q = G.plus(M, { x: -(r + 1.2), y: -.6 }); if (!binnenVlak(q)) q = G.plus(M, { x: .5, y: .4 }); return q; },
        doelen: () => Array.from({ length: 24 }, (_, i) => G.plus(M, { x: r * Math.cos(.35 + i * Math.PI / 12), y: r * Math.sin(.35 + i * Math.PI / 12) })).filter(q => binnenVlak(q)),
        mis: () => { const q = G.plus(M, { x: (r + 1.1) * Math.cos(.35), y: (r + 1.1) * Math.sin(.35) }); return binnenVlak(q) ? q : G.plus(M, { x: (r * .45) * Math.cos(.35), y: (r * .45) * Math.sin(.35) }); },
      };
    } else if (modus === 'lijn') {
      const A = pt(p.A || [0, 1]), B = pt(p.B || [8, 3]), d = p.d ?? 1, nl_ = p.naamL || 'l', n = p.n ?? 4, cap = n - Math.floor(n / 2);
      const u = G.eenheid(G.min(B, A)), w = G.loodrechtOp(u);
      const kant = q => Math.sign((q.x - A.x) * w.x + (q.y - A.y) * w.y) || 1;
      const [k0, k1] = V.knip(A, B, true, true), mid = G.midden(k0, k1);
      def = {
        n,
        statisch: () => V.lijn(A, B, { kleur: K.inkt, dik: 2.8 }) + lijnLabel(V, A, B, nl_, K.inkt, 1),
        snap: q => { const f = G.proj(q, A, B), dd = G.d(q, f); if (Math.abs(dd - d) < tol && dd > .05) return { q: G.plus({ x: f.x, y: f.y }, G.maal(w, kant(q) * d)), op: true }; return { q, op: false }; },
        meet: (q, op) => [[`afstand tot ${nl_} = ${L(G.dLijn(q, A, B))}`, op ? true : null], [`doel: ${L(d)}`, null]],
        live: (q, op) => { const f = G.proj(q, A, B), fp = { x: f.x, y: f.y }; return G.d(q, fp) < .05 ? '' : V.stuk(q, fp, { kleur: op ? K.goed : K.probe, dik: 2.2, stip: !op }) + V.rechteHoek(fp, q, G.plus(fp, u), { kleur: op ? K.goed : K.probe }) + maat(V, q, fp, L(G.d(q, fp)), { kleur: op ? K.goed : K.probe }); },
        nietOp: q => { const dd = G.dLijn(q, A, B); return `Afstand tot ${nl_} = ${L(dd)} (loodrecht gemeten). Je zoekt ${L(d)}: schuif ${dd > d ? 'dichter naar' : 'verder van'} ${nl_}.`; },
        check: (q, gez) => {
          if (gez.some(g => G.d(g, q) < 1)) return 'Die ligt vlak naast een punt dat je al hebt. Kies een plek verderop.';
          if (gez.filter(g => kant(g) === kant(q)).length >= cap) return `Aan deze kant van ${nl_} heb je er genoeg. Is er aan de <b>andere kant</b> van ${nl_} ook plek op ${L(d)}?`;
          return null;
        },
        gezet: (q, gez) => gez.length === 1 ? 'Raak! Zoek er nog een paar, ook verder langs de lijn.' : null,
        genoeg: gez => gez.length >= n,
        figuur: () => [1, -1].map(s => V.lijn(G.plus(A, G.maal(w, s * d)), G.plus(B, G.maal(w, s * d)), { kleur: K.lijn, dik: 3.2 })).join('') +
          (() => { const f = G.plus(mid, G.maal(u, -1.2)); return [1, -1].map(s => { const g = G.plus(f, G.maal(w, s * d)); return V.stuk(f, g, { kleur: K.lijn, dik: 1.8 }) + V.rechteHoek(f, g, G.plus(f, u), { kleur: K.lijn }) + maat(V, f, g, L(d), { kleur: K.lijn, kant: -1 }); }).join(''); })(),
        middel: mid,
        afTekst: `Twee lijnen! Alle punten op ${L(d)} van ${nl_} vormen <b>twee lijnen evenwijdig met ${nl_}</b>: één aan elke kant.`,
        start: () => { const q = G.plus(G.plus(mid, G.maal(u, 1.5)), G.maal(w, d + 1.3)); return binnenVlak(q) ? q : G.plus(G.plus(mid, G.maal(u, 1.5)), G.maal(w, -(d + 1.3))); },
        doelen: () => [-2.6, -1.3, 0, 1.3, 2.6, -3.4, 3.4].flatMap((t, i) => [1, -1].map(s => G.plus(G.plus(mid, G.maal(u, t + (s < 0 ? .6 : 0))), G.maal(w, s * d)))).filter(q => binnenVlak(q)),
        mis: () => { const q = G.plus(mid, G.maal(w, d + 1.1)); return binnenVlak(q) ? q : G.plus(mid, G.maal(w, -(d + 1.1))); },
      };
    } else if (modus === 'evenver-punten') {
      const A = pt(p.A || [2, 2]), B = pt(p.B || [6, 3]), nA = p.naamA || 'A', nB = p.naamB || 'B', n = p.n ?? 4;
      const Mid = G.midden(A, B), u = G.eenheid(G.loodrechtOp(G.min(B, A)));
      def = {
        n,
        statisch: () => V.stuk(A, B, { kleur: K.zacht, dik: 2 }) + V.punt(A, { label: nA, kleur: K.punt, lx: -16, ly: -8 }) + V.punt(B, { label: nB, kleur: K.puntB }),
        snap: q => { const f = G.proj(q, Mid, G.plus(Mid, u)); if (G.d(q, f) < tol) return { q: { x: f.x, y: f.y }, op: true }; return { q, op: false }; },
        meet: (q, op) => [[`${nP}${nA} = ${L(G.d(q, A))}`, op ? true : null], [`${nP}${nB} = ${L(G.d(q, B))}`, op ? true : null]],
        live: (q, op) => { const k = op ? K.goed : K.probe; return V.stuk(q, A, { kleur: k, dik: 2, stip: !op }) + V.stuk(q, B, { kleur: k, dik: 2, stip: !op }) + (op ? V.streepjes(q, A, 2, { kleur: K.goed }) + V.streepjes(q, B, 2, { kleur: K.goed }) : ''); },
        nietOp: q => `${nP}${nA} = ${L(G.d(q, A))} en ${nP}${nB} = ${L(G.d(q, B))}: niet even ver. Schuif tot de twee getallen gelijk zijn (groen).`,
        check: (q, gez) => gez.some(g => G.d(g, q) < 1) ? 'Die ligt vlak naast een punt dat je al hebt. Zoek verder weg.' : null,
        gezet: (q, gez) => G.d(q, Mid) < .4 ? `Ja, het <b>midden</b> ligt even ver: ${nP}${nA} = ${nP}${nB} = ${L(G.d(q, A))}. Maar is het midden het <b>enige</b> punt? Zoek er een ver boven of onder het midden.` :
          gez.length === 1 ? 'Raak! Er zijn er meer. Zoek ook eens aan de andere kant van het lijnstuk.' : null,
        genoeg: gez => gez.length >= n && gez.filter(g => G.d(g, Mid) >= 1.2).length >= 2,
        nogNiet: gez => gez.length >= n ? 'Bijna: zoek ook een punt <b>ver van het midden</b>. Het midden is niet het enige punt dat even ver ligt.' : null,
        figuur: () => V.lijn(Mid, G.plus(Mid, u), { kleur: K.middelloodlijn, dik: 3.2 }) + V.rechteHoek(Mid, B, G.plus(Mid, u), { kleur: K.middelloodlijn }) + V.streepjes(A, Mid, 1) + V.streepjes(Mid, B, 1),
        middel: Mid,
        afTekst: `Alle punten die even ver van ${nA} als van ${nB} liggen, vormen een <b>lijn</b>: door het midden van ${nA}${nB} en <b>loodrecht</b> erop. Dat is de <b>middelloodlijn</b>.`,
        start: () => { const q = G.plus(G.plus(Mid, G.maal(u, 1.6)), G.maal(G.eenheid(G.min(B, A)), -1.4)); return binnenVlak(q) ? q : G.plus(Mid, G.maal(G.eenheid(G.min(B, A)), -1.2)); },
        doelen: () => [2.2, -2.2, 1.2, -1.2, 3.2, -3.2, 1.7, -1.7, 4, -4].map(k => G.plus(Mid, G.maal(u, k))).filter(q => binnenVlak(q)),
        mis: () => { const q = G.plus(G.plus(Mid, G.maal(u, 1.5)), G.maal(G.eenheid(G.min(B, A)), 1.2)); return binnenVlak(q) ? q : G.plus(Mid, G.maal(G.eenheid(G.min(B, A)), 1)); },
      };
    } else if (modus === 'evenver-benen') {
      const O = pt(p.O || [1, 1]), A = pt(p.A || [8, 1.5]), B = pt(p.B || [4, 6]), nO = p.naamO || 'A', n = p.n ?? 3;
      const bn = p.benen || ['been 1', 'been 2'];
      const ua = G.eenheid(G.min(A, O)), ub = G.eenheid(G.min(B, O)), w = G.eenheid(G.plus(ua, ub));
      const kr = (a, b) => a.x * b.y - a.y * b.x, z = kr(ua, ub);
      const binnen = q => { const v = G.min(q, O); return kr(ua, v) * z > 0 && kr(v, ub) * z > 0; };
      const tot = (q, R) => { const f = G.proj(q, O, R); return f.t < 0 ? { d: G.d(q, O), f: O, op: false } : { d: G.d(q, f), f: { x: f.x, y: f.y }, op: true }; };
      def = {
        n,
        statisch: () => V.halflijn(O, A, { kleur: K.inkt, dik: 2.8 }) + V.halflijn(O, B, { kleur: K.inkt, dik: 2.8 }) + V.punt(O, { label: nO, kleur: K.inkt, lx: -16, ly: 6 }) +
          lijnLabel(V, O, A, bn[0], K.zacht, -1).replace('font-size="16"', 'font-size="14"') + lijnLabel(V, O, B, bn[1], K.zacht, 1).replace('font-size="16"', 'font-size="14"'),
        snap: q => { if (!binnen(q)) return { q, op: false }; const f = G.proj(q, O, G.plus(O, w)); if (f.t > .2 && G.d(q, f) < tol) return { q: { x: f.x, y: f.y }, op: true }; return { q, op: false }; },
        meet: (q, op) => [[`tot ${bn[0]} = ${L(tot(q, A).d)}`, op ? true : null], [`tot ${bn[1]} = ${L(tot(q, B).d)}`, op ? true : null]],
        live: (q, op) => { const k = op ? K.goed : K.probe; return [A, B].map(R => { const t = tot(q, R); return t.d < .05 ? '' : V.stuk(q, t.f, { kleur: k, dik: 2, stip: !op }) + (t.op ? V.rechteHoek(t.f, q, R, { kleur: k }) : ''); }).join(''); },
        nietOp: q => binnen(q) ? `Tot ${bn[0]}: ${L(tot(q, A).d)}, tot ${bn[1]}: ${L(tot(q, B).d)}. Niet even ver: schuif tot de getallen gelijk zijn.` : 'Dit punt ligt niet binnen de hoek. Zoek tussen de twee benen.',
        check: (q, gez) => gez.some(g => G.d(g, q) < 1) ? 'Die ligt vlak naast een punt dat je al hebt. Zoek verder van het hoekpunt of er dichter bij.' : null,
        genoeg: gez => gez.length >= n,
        figuur: () => { const a1 = G.plus(O, ua), b1 = G.plus(O, ub), w1 = G.plus(O, w); return V.halflijn(O, w1, { kleur: K.bissectrice, dik: 3.2 }) + V.boog(a1, O, w1, { n: 1, r: 1 }) + V.boog(w1, O, b1, { n: 1, r: 1.12 }); },
        middel: G.plus(O, G.maal(w, 2.5)),
        afTekst: `Alle punten binnen de hoek die even ver van de twee benen liggen, vormen een <b>halve lijn</b> die de hoek middendoor deelt: de <b>bissectrice</b> van ∠${nO}.`,
        start: () => { const q = G.plus(G.plus(O, G.maal(w, 2.6)), G.maal(G.loodrechtOp(w), 1.3)); return binnen(q) && binnenVlak(q) ? q : G.plus(O, G.maal(w, 1.5)); },
        doelen: () => [1.6, 3, 4.4, 2.3, 3.7, 5.2, 6].map(k => G.plus(O, G.maal(w, k))).filter(q => binnenVlak(q)),
        mis: () => G.plus(G.plus(O, G.maal(w, 2.5)), G.maal(G.loodrechtOp(w), .8)),
      };
    } else throw new Error('afstandprobe: onbekende modus ' + modus);

    const statischG = groep(V.laag.figuur), onthulG = groep(V.laag.figuur), gezetG = groep(V.laag.figuur), liveG = groep(V.laag.meet);
    statischG.innerHTML = (p.decor ? p.decor(V) : '') + def.statisch();
    const teller = h('div', { class: 'wk-teller', 'aria-label': 'punten gezet' }, Array.from({ length: def.n }, () => h('i')));
    const probe = V.handvat(pt(p.start) || def.start(), { kleur: K.probe, label: nP });
    probe.classList.add('wenk');
    let op = false, klaar = false, kiesBox = null;
    const gez = [];
    const teken = q => { liveG.innerHTML = def.live(q, op); zetMeet(meet, def.meet(q, op)); };
    function plant(q) {
      if (klaar) return;
      if (!op) { zeg(uit, '', def.nietOp(q)); return; }
      const reden = def.check(q, gez); if (reden) { zeg(uit, '', reden); return; }
      gez.push({ x: q.x, y: q.y });
      gezetG.insertAdjacentHTML('beforeend', `<g class="wk-plop">${V.punt(q, { kleur: K.punt, r: 5.5 })}</g>`);
      [...teller.children].forEach((el, i) => el.classList.toggle('aan', i < gez.length));
      if (def.genoeg(gez)) { afronden(); return; }
      zeg(uit, 'goed', def.gezet?.(q, gez) || def.nogNiet?.(gez) || `Raak! ${Math.min(gez.length, def.n)} van ${def.n}. Zoek het volgende punt.`);
    }
    function afronden() {
      klaar = true; probe.classList.remove('wenk');
      onthulG.innerHTML = `<g class="wk-onthul">${def.figuur()}</g>`;
      vier(V, def.middel); root.classList.add('wk-feest');
      zeg(uit, 'goed', p.na || def.afTekst);
      if (p.kies) kiesBox = kiesBlok(root, p.kies, api, () => af(root, api, p.klaar));
      else af(root, api, p.klaar);
    }
    V.sleep(probe, {
      beperk: q => { const r = def.snap(q); op = r.op; return r.q; },
      beweeg: q => { probe.classList.remove('wenk'); teken(q); },
      los: q => plant(q),
    });
    root.append(vraag, V.svg, meet, teller, uit);
    teken(probe.p);
    root._los = async fout => {
      if (kiesBox) return kiesBox._kies(fout);
      if (klaar) return;
      if (fout) { probe._naar(def.mis()); await pauze(80); }
      for (const q of def.doelen()) { if (klaar) break; probe._naar(q); await pauze(40); }
    };
  };

  /* ===================================================================== ROOSTERKLEUR */
  const REL = { '<': (a, b) => a < b - EPS, '<=': (a, b) => a <= b + EPS, '=': (a, b) => Math.abs(a - b) <= EPS, '>=': (a, b) => a >= b - EPS, '>': (a, b) => a > b + EPS };
  const RELT = { '<': 'kleiner dan', '<=': 'hooguit', '=': 'precies', '>=': 'minstens', '>': 'groter dan' };
  VIS.roosterkleur = (pod, p, api) => {
    const { root, vraag, meet, uit, L } = opzet(pod, p, 'rooster');
    const V = maakVlak(p, { xmin: -.5, xmax: 6.5, ymin: -.5, ymax: 5.5 });
    const kleur = p.kleur || '#DC2626';
    const vw = (p.voorwaarden || []).map(c0 => {
      const c = Object.assign({}, c0);
      if (c.tot === 'punt') {
        const M = pt(c.p), r = c.r, rT = c.rTekst || L(r);
        c.val = q => G.d(q, M); c.ok = q => REL[c.rel || '<'](c.val(q), r);
        c.kort = q => `${c.naam || 'M'}: ${L(c.val(q))}`;
        c.zin = q => { const v = c.val(q); return `afstand tot ${c.naam || 'M'} is ${L(v)}: ` + (Math.abs(v - r) <= EPS ? `precies de straal, dus <b>óp</b> de cirkel` : v < r ? `kleiner dan ${rT}, dus binnen de cirkel` : `groter dan ${rT}, dus buiten de cirkel`) + ` (moet ${RELT[c.rel || '<']} ${rT})`; };
        c.rand = q => Math.abs(c.val(q) - r) <= EPS;
        c.vorm = () => { const [x, y] = V.P(M), R = r * V.s; const rel = c.rel || '<';
          if (rel === '=') return { kromme: V.cirkel(M, r, { kleur, dik: 5 }) };
          if (rel[0] === '<') return { clip: `<circle cx="${x}" cy="${y}" r="${R}"/>` };
          return { clip: `<path clip-rule="evenodd" d="M0 0 H${V.W} V${V.H} H0Z M${x - R} ${y} a${R} ${R} 0 1 0 ${2 * R} 0 a${R} ${R} 0 1 0 ${-2 * R} 0Z"/>` }; };
      } else if (c.tot === 'lijn') {
        const a = pt(c.a), b = pt(c.b), d = c.d, dT = c.dTekst || L(d);
        c.val = q => G.dLijn(q, a, b); c.ok = q => REL[c.rel || '<'](c.val(q), d);
        c.kort = q => `${c.naam || 'l'}: ${L(c.val(q))}`;
        c.zin = q => { const v = c.val(q); return `afstand tot ${c.naam || 'l'} is ${L(v)}: ` + (Math.abs(v - d) <= EPS ? `precies ${dT}, dus <b>óp</b> een van de evenwijdige lijnen` : v < d ? `kleiner dan ${dT}, dus in de strook` : `groter dan ${dT}, dus buiten de strook`) + ` (moet ${RELT[c.rel || '<']} ${dT})`; };
        c.rand = q => Math.abs(c.val(q) - d) <= EPS;
        c.vorm = () => { const rel = c.rel || '<', u = G.eenheid(G.min(b, a)), w = G.loodrechtOp(u);
          if (rel === '=') return { kromme: [1, -1].map(s => V.lijn(G.plus(a, G.maal(w, s * d)), G.plus(b, G.maal(w, s * d)), { kleur, dik: 5 })).join('') };
          if (rel[0] === '<') return { clip: V.strook(a, b, d) };
          return { clip: [1, -1].map(s => V.halfvlak(G.plus(a, G.maal(w, s * d)), G.plus(b, G.maal(w, s * d)), G.plus(a, G.maal(w, s * (d + 1))))).join('') }; };
      } else if (c.tot === 'dichter' || c.tot === 'evenver') {
        const A = pt(c.a), B = pt(c.b), nA = c.naamA || 'A', nB = c.naamB || 'B', Mid = G.midden(A, B), w = G.loodrechtOp(G.min(B, A));
        c.val = q => G.d(q, A) - G.d(q, B);
        c.ok = q => c.tot === 'dichter' ? c.val(q) < -EPS : Math.abs(c.val(q)) <= EPS;
        c.kort = q => `${nA}: ${L(G.d(q, A))} · ${nB}: ${L(G.d(q, B))}`;
        c.zin = q => { const v = c.val(q); return `tot ${nA} ${L(G.d(q, A))}, tot ${nB} ${L(G.d(q, B))}: ` + (Math.abs(v) <= EPS ? 'even ver' : v < 0 ? `dichter bij ${nA}` : `dichter bij ${nB}`) + (c.tot === 'dichter' ? ` (moet dichter bij ${nA})` : ' (moet even ver)'); };
        c.rand = q => Math.abs(c.val(q)) <= EPS;
        c.vorm = () => c.tot === 'evenver' ? { kromme: V.lijn(Mid, G.plus(Mid, w), { kleur, dik: 5 }) } : { clip: V.halfvlak(Mid, G.plus(Mid, w), A) };
        if (c.tot === 'dichter' && !c.mis) c.misVan = q => c.val(q) > EPS ? 'W7' : null;
      } else throw new Error('roosterkleur: onbekende voorwaarde ' + c.tot);
      return c;
    });
    const voldoet = q => vw.every(c => c.ok(q));
    /* figuren */
    const fig = (p.figuren || []).map(f => {
      const s = f.soort;
      if (s === 'cirkel') return V.cirkel(pt(f.m), f.r, { kleur: f.kleur || K.cirkel, stip: f.stip }) + (f.naam !== '' ? V.punt(pt(f.m), { label: f.naam || '', kleur: K.inkt, r: 4 }) : '');
      if (s === 'punt') return V.punt(pt(f.p), { label: f.naam || '', kleur: f.kleur || K.inkt, r: 4.5, lx: f.lx ?? 8, ly: f.ly ?? -8 });
      if (s === 'lijn') return V.lijn(pt(f.a), pt(f.b), { kleur: f.kleur || K.inkt, dik: 2.4 }) + (f.naam ? lijnLabel(V, pt(f.a), pt(f.b), f.naam, f.kleur || K.inkt, f.kant || 1) : '');
      if (s === 'stuk') return V.stuk(pt(f.a), pt(f.b), { kleur: f.kleur || K.inkt, dik: 2.4 });
      if (s === 'halflijn') return V.halflijn(pt(f.a), pt(f.b), { kleur: f.kleur || K.inkt, dik: 2.4 });
      if (s === 'evenwijdig') { const a = pt(f.a), b = pt(f.b), w = G.loodrechtOp(G.eenheid(G.min(b, a))); return [1, -1].map(k => V.lijn(G.plus(a, G.maal(w, k * f.d)), G.plus(b, G.maal(w, k * f.d)), { kleur: K.lijn, dik: 2.2, stip: f.stip })).join(''); }
      if (s === 'middelloodlijn') { const a = pt(f.a), b = pt(f.b), m = G.midden(a, b); return V.lijn(m, G.plus(m, G.loodrechtOp(G.min(b, a))), { kleur: K.middelloodlijn, dik: 2.4 }); }
      if (s === 'veelhoek') return V.veelhoek(f.pts.map(pt), { vul: f.vul || 'none', kleur: f.kleur || K.inkt });
      return '';
    }).join('');
    /* kandidaten: roosterpunten in het vlak (en op het domein) */
    const dom = p.domein && p.domein.soort === 'lijn' ? [pt(p.domein.a), pt(p.domein.b)] : null;
    const kand = [];
    for (let x = Math.ceil(V.xmin + .2); x <= Math.floor(V.xmax - .2); x++) for (let y = Math.ceil(V.ymin + .2); y <= Math.floor(V.ymax - .2); y++) {
      const q = { x, y }; if (dom && G.dLijn(q, dom[0], dom[1]) > EPS) continue; kand.push(q);
    }
    const sleutel = q => q.x + ',' + q.y;
    const doelen = kand.filter(voldoet);
    const nodig = Math.min(p.genoeg || doelen.length, doelen.length);
    if (!doelen.length) console.warn('roosterkleur: geen enkel punt voldoet', p);
    const kandG = groep(V.laag.rooster), gebiedG = groep(V.laag.gebied), krommeG = groep(V.laag.figuur), figG = groep(V.laag.figuur), goedG = groep(V.laag.punten), flitsG = groep(V.laag.top);
    figG.innerHTML = (p.decor ? p.decor(V) : '') + fig;
    kandG.innerHTML = kand.map(q => { const [x, y] = V.P(q); return `<circle cx="${x}" cy="${y}" r="${kand.length > 60 ? 3 : 4.2}" fill="#fff" stroke="#7FA8CF" stroke-width="1.6"/>`; }).join('');
    const teller = h('div', { class: 'wk-teller', 'aria-label': 'punten gekleurd' }, Array.from({ length: Math.min(nodig, 12) }, () => h('i')));
    const gekleurd = new Set();
    let klaar = false, kiesBox = null;
    const coord = q => p.assen || V.svg.querySelector('.wk-l-rooster text') ? `(${q.x}, ${q.y})` : 'Dit punt';
    function tik(q) {
      if (klaar) return;
      const k = sleutel(q); if (!kand.some(c => sleutel(c) === k) || gekleurd.has(k)) return;
      if (voldoet(q)) {
        gekleurd.add(k);
        goedG.insertAdjacentHTML('beforeend', `<g class="wk-plop">${V.punt(q, { kleur, r: 7 })}</g>`);
        [...teller.children].forEach((el, i) => el.classList.toggle('aan', i < Math.round(gekleurd.size / nodig * teller.children.length)));
        zetMeet(meet, vw.map(c => [c.kort(q), true]));
        if (gekleurd.size >= nodig) afronden();
        else zeg(uit, 'goed', `Ja! ${coord(q)} klopt. Nog ${nodig - gekleurd.size} te gaan.`);
      } else {
        const fout = vw.find(c => !c.ok(q));
        const mis = fout.mis || fout.misVan?.(q) || ((fout.rel || '<') !== '=' && fout.rand?.(q) ? 'W2' : null) || p.mis;
        foutje(api, mis);
        const [x, y] = V.P(q);
        flitsG.insertAdjacentHTML('beforeend', `<g class="wk-flits"><circle cx="${x}" cy="${y}" r="11" fill="#fff" stroke="${K.fout}" stroke-width="2.4"/><path d="M${x - 5} ${y - 5} L${x + 5} ${y + 5} M${x + 5} ${y - 5} L${x - 5} ${y + 5}" stroke="${K.fout}" stroke-width="3" stroke-linecap="round"/></g>`);
        const fl = flitsG.lastElementChild; setTimeout(() => fl && fl.remove(), 1600);
        zetMeet(meet, vw.map(c => [c.kort(q), c.ok(q)]));
        zeg(uit, 'fout', `<b>${coord(q)} hoort er niet bij.</b> Meet maar na:<br>` + vw.map(c => `${c.ok(q) ? '✓' : '✗'} ${c.zin(q)}`).join('<br>'));
        schud(V.svg);
      }
    }
    function afronden() {
      klaar = true;
      const vormen = vw.map(c => c.vorm());
      const clips = vormen.filter(v => v.clip), krommen = vormen.filter(v => v.kromme);
      let inhoud = krommen.length ? krommen.map(v => v.kromme).join('') : `<rect width="${V.W}" height="${V.H}" fill="${kleur}" opacity=".22"/>`;
      let defs = '';
      clips.forEach(v => { const id = WK.uid('clip'); defs += `<clipPath id="${id}">${v.clip}</clipPath>`; inhoud = `<g clip-path="url(#${id})">${inhoud}</g>`; });
      (krommen.length ? krommeG : gebiedG).innerHTML = `<defs>${defs}</defs><g class="wk-onthul">${inhoud}</g>`;
      const zw = doelen.reduce((s, q) => G.plus(s, q), { x: 0, y: 0 });
      vier(V, G.maal(zw, 1 / doelen.length)); root.classList.add('wk-feest');
      zeg(uit, 'goed', p.na || 'Allemaal gevonden! Het gekleurde stuk laat zien waar <b>alle</b> punten liggen die aan de voorwaarden voldoen, ook tussen de roosterpunten.');
      if (p.kies) kiesBox = kiesBlok(root, p.kies, api, () => af(root, api, p.klaar));
      else af(root, api, p.klaar);
    }
    V.svg.addEventListener('click', e => { const w = V.wereld(e); tik({ x: Math.round(w.x), y: Math.round(w.y) }); });
    root.append(vraag, V.svg, meet, teller, uit);
    root._los = async fout => {
      if (kiesBox) return kiesBox._kies(fout);
      if (klaar) return;
      if (fout) { const nee = kand.filter(q => !voldoet(q)); const q = nee.find(q => vw.some(c => !c.ok(q) && c.rand?.(q))) || nee[0]; if (q) { tik(q); await pauze(60); } }
      for (const q of doelen) { if (klaar) break; tik(q); await pauze(30); }
    };
  };

  /* ===================================================================== LOODRECHT */
  VIS.loodrecht = (pod, p, api) => {
    const { root, vraag, meet, uit, L } = opzet(pod, p, 'lood');
    const V = maakVlak(p, { xmin: -1, xmax: 9, ymin: -1, ymax: 6 });
    const A = pt(p.A || [3, 4]), a = pt(p.a || [0, .5]), b = pt(p.b || [8, 1.5]), nA = p.naam || 'A', nl_ = p.naamL || 'l';
    const tol = p.tol ?? .3, knop = p.knop ?? !!api.inVraag;
    const f0 = G.proj(A, a, b), Av = { x: f0.x, y: f0.y }, u = G.eenheid(G.min(b, a));
    const [k0, k1] = V.knip(a, b, true, true);
    const e0 = G.plus(k0, G.maal(u, .35)), e1 = G.plus(k1, G.maal(u, -.35));
    const statischG = groep(V.laag.figuur), liveG = groep(V.laag.meet), vastG = groep(V.laag.figuur);
    statischG.innerHTML = (p.decor ? p.decor(V) : '') + V.lijn(a, b, { kleur: K.inkt, dik: 2.8 }) + lijnLabel(V, a, b, nl_, K.inkt, -1) + V.punt(A, { label: nA, kleur: K.punt });
    let klaar = false, kiesBox = null, lood = false;
    const startQ = pt(p.start) || (() => { let q = G.plus(Av, G.maal(u, 3)); if (G.proj(q, e0, e1).t > 1) q = G.plus(Av, G.maal(u, -3)); return knipOpSegment(q, e0, e1); })();
    const F = V.handvat(startQ, { kleur: K.probe, label: 'F' }); F.classList.add('wenk');
    const hoekF = q => scherp(G.hoek(A, q, G.plus(q, u)));
    function teken(q) {
      const d = G.d(A, q), k = lood ? K.goed : K.probe;
      liveG.innerHTML = V.stuk(A, q, { kleur: k, dik: 3 }) + maat(V, A, q, L(d), { kleur: k, kant: G.proj(A, a, b).t > G.proj(q, a, b).t ? 1 : -1 }) + (lood ? V.rechteHoek(q, A, G.plus(q, u), { kleur: K.goed }) : '');
      zetMeet(meet, [[`${nA}F = ${L(d)}`, lood ? true : null], [`hoek met ${nl_} = ${graad(hoekF(q))}`, lood ? true : null]]);
    }
    function vast() {
      klaar = true; F.remove(); liveG.innerHTML = '';
      vastG.innerHTML = `<g class="wk-onthul">${V.stuk(A, Av, { kleur: K.goed, dik: 3.2 }) + V.rechteHoek(Av, A, G.plus(Av, u), { kleur: K.goed }) + maat(V, A, Av, L(G.d(A, Av)), { kleur: K.goed }) + V.punt(Av, { label: nA + "'", kleur: K.goed, lx: 8, ly: 20 })}</g>`;
      vier(V, Av); root.classList.add('wk-feest');
      zetMeet(meet, [[`${nA}${nA}' = ${L(G.d(A, Av))}`, true], ['hoek = 90°', true]]);
      zeg(uit, 'goed', p.na || `Vast! De kortste weg van ${nA} naar ${nl_} staat <b>loodrecht</b> op ${nl_}. Het voetpunt heet ${nA}' (de loodrechte projectie). De afstand van ${nA} tot ${nl_} is ${nA}${nA}' = ${L(G.d(A, Av))}.`);
      if (hier) hier.remove();
      const kies = p.kies;
      if (kies) kiesBox = kiesBlok(root, kies, api, () => af(root, api, p.klaar)); else af(root, api, p.klaar);
    }
    V.sleep(F, {
      beperk: q => { let f = knipOpSegment(q, e0, e1); if (G.d(f, Av) < tol) f = { x: Av.x, y: Av.y }; lood = G.d(f, Av) < EPS; return { x: f.x, y: f.y }; },
      beweeg: q => { F.classList.remove('wenk'); teken(q); },
      los: q => { if (klaar || knop) return; if (lood) vast(); else zeg(uit, '', `${nA}F = ${L(G.d(A, q))}. Kan het nog korter? Kijk naar de hoek met ${nl_}.`); },
    });
    const hier = knop ? hierKnop('Hier is hij het kortst', () => {
      if (klaar) return;
      if (lood) return vast();
      foutje(api, p.mis ?? 'W3'); schud(hier);
      zeg(uit, 'fout', `<b>Nog niet.</b> ${nA}F = ${L(G.d(A, F.p))} en de hoek met ${nl_} is ${graad(hoekF(F.p))}. Een schuine lijn is altijd langer. Schuif F tot de hoek 90° is: dan wordt ${nA}F korter.`);
    }) : null;
    root.append(...[vraag, V.svg, meet, hier, uit].filter(Boolean));
    teken(F.p);
    root._los = async fout => {
      if (kiesBox) return kiesBox._kies(fout);
      if (klaar) return;
      if (fout) { let q = G.plus(Av, G.maal(u, 1.6)); if (G.proj(q, e0, e1).t > 1) q = G.plus(Av, G.maal(u, -1.6)); F._naar(q); await pauze(60); if (knop) { hier.click(); await pauze(60); } }
      F._naar(Av); await pauze(60); if (knop && !klaar) hier.click();
    };
  };

  /* ===================================================================== CIRKELZOEKER */
  VIS.cirkelzoeker = (pod, p, api) => {
    const modus = p.modus || 'omgeschreven', om = modus === 'omgeschreven';
    const { root, vraag, meet, uit, L } = opzet(pod, p, 'cirkel');
    const pts = [p.A, p.B, p.C].map(pt), nm = p.namen || ['A', 'B', 'C'];
    const doel = om ? G.omcentrum(...pts) : G.incentrum(...pts);
    const R = om ? G.d(doel, pts[0]) : G.inStraal(...pts);
    const V = maakVlak(p, vlakOm([...pts, doel], 1));
    const tol = p.tol ?? .3, knop = p.knop ?? !!api.inVraag;
    const zijden = [[0, 1], [1, 2], [2, 0]].map(([i, j]) => ({ a: pts[i], b: pts[j], naam: nm[i] + nm[j] }));
    const statischG = groep(V.laag.figuur), lijnG = groep(V.laag.figuur), cirkelG = groep(V.laag.figuur), liveG = groep(V.laag.meet);
    statischG.innerHTML = (p.decor ? p.decor(V) : '') + driehoek(V, pts, nm);
    const zw = G.zwaartepunt(...pts);
    let start = pt(p.start) || G.midden(zw, pts[0]);
    if (G.d(start, doel) < 1) start = G.midden(zw, pts[1]);
    if (G.d(start, doel) < 1) start = G.plus(doel, { x: 1.4, y: 1 });
    if (!V.binnen(start)) start = G.plus(zw, { x: -.6, y: .5 });
    const M = V.handvat(start, { kleur: K.probe, label: 'M' }); M.classList.add('wenk');
    let klaar = false, kiesBox = null, raak = false;
    const maten = q => om ? pts.map(X => G.d(q, X)) : zijden.map(z => G.dLijn(q, z.a, z.b));
    function teken(q) {
      const k = raak ? K.goed : K.probe, m = maten(q);
      if (om) {
        liveG.innerHTML = V.cirkel(q, m[0], { kleur: K.cirkel, stip: !raak, dik: 2, op: raak ? 1 : .55 }) + pts.map(X => V.stuk(q, X, { kleur: k, dik: 2, stip: !raak })).join('');
        zetMeet(meet, pts.map((X, i) => [`M${nm[i]} = ${L(m[i])}`, raak ? true : null]));
      } else {
        liveG.innerHTML = V.cirkel(q, Math.min(...m), { kleur: K.cirkel, stip: !raak, dik: 2, op: raak ? 1 : .55 }) + zijden.map(z => { const f = G.proj(q, z.a, z.b), fp = { x: f.x, y: f.y }; return G.d(q, fp) < .05 ? '' : V.stuk(q, fp, { kleur: k, dik: 2, stip: !raak }) + V.rechteHoek(fp, q, z.b, { kleur: k, maat: .28 }) + (f.t < 0 || f.t > 1 ? V.stuk(f.t < 0 ? z.a : z.b, fp, { kleur: K.zacht, dik: 1.6, stip: true }) : ''); }).join('');
        zetMeet(meet, zijden.map((z, i) => [`tot ${z.naam} = ${L(m[i])}`, raak ? true : null]));
      }
    }
    function lijnen() {
      if (om) return zijden.map((z, i) => { const m = G.midden(z.a, z.b), w = G.plus(m, G.loodrechtOp(G.min(z.b, z.a))); return V.lijn(m, w, { kleur: K.middelloodlijn, dik: 2.4 }) + V.rechteHoek(m, z.b, w, { kleur: K.middelloodlijn, maat: .28 }) + V.streepjes(z.a, m, i + 1, { kleur: K.middelloodlijn }) + V.streepjes(m, z.b, i + 1, { kleur: K.middelloodlijn }); }).join('');
      return pts.map((X, i) => { const Y = pts[(i + 1) % 3], Z = pts[(i + 2) % 3], ein = G.snij(X, doel, Y, Z) || doel; return V.stuk(X, ein, { kleur: K.bissectrice, dik: 2.4 }) + V.boog(Y, X, doel, { n: i + 1, r: .55 }) + V.boog(doel, X, Z, { n: i + 1, r: .55 }); }).join('');
    }
    function toonLijnen() {
      lijnG.innerHTML = `<g class="wk-onthul">${lijnen()}</g>`;
      zeg(uit, 'goed', p.na || (om ? `De drie <b>middelloodlijnen</b> gaan allemaal door M. Logisch: wie even ver van ${nm[0]} als van ${nm[1]} ligt, ligt op de middelloodlijn van ${nm[0]}${nm[1]}. Twee middelloodlijnen zijn dus genoeg.` : `De drie <b>bissectrices</b> gaan allemaal door M. Logisch: wie even ver van twee zijden ligt, ligt op de bissectrice van de hoek ertussen. Twee bissectrices zijn dus genoeg.`));
    }
    function vast() {
      klaar = true; M.remove(); raak = true; liveG.innerHTML = '';
      const straal = om ? V.stuk(doel, pts[0], { kleur: K.cirkel, dik: 2.4 }) + maat(V, doel, pts[0], 'r', { kleur: K.cirkel }) :
        (() => { const f = G.proj(doel, zijden[0].a, zijden[0].b), fp = { x: f.x, y: f.y }; return V.stuk(doel, fp, { kleur: K.cirkel, dik: 2.4 }) + V.rechteHoek(fp, doel, zijden[0].b, { kleur: K.cirkel, maat: .28 }) + maat(V, doel, fp, 'r', { kleur: K.cirkel, kant: -1 }); })();
      cirkelG.innerHTML = `<g class="wk-onthul">${V.cirkel(doel, R, { kleur: K.cirkel, dik: 3.2 })}${straal}${V.punt(doel, { label: 'M', kleur: K.probe })}</g>`;
      zetMeet(meet, om ? pts.map((X, i) => [`M${nm[i]} = ${L(R)}`, true]) : zijden.map(z => [`tot ${z.naam} = ${L(R)}`, true]));
      vier(V, doel); root.classList.add('wk-feest');
      const buiten = !G.binnenDriehoek(doel, ...pts);
      zeg(uit, 'goed', om ? `Raak! M ligt even ver van ${nm.join(', ').replace(/, ([^,]*)$/, ' en $1')}. De cirkel gaat door alle drie de hoekpunten: de <b>omgeschreven cirkel</b>.` + (buiten ? ' Kijk: M ligt hier <b>buiten</b> de driehoek. Dat gebeurt bij een stompe hoek.' : '') :
        `Raak! M ligt even ver van alle drie de zijden. De cirkel raakt elke zijde precies: de <b>ingeschreven cirkel</b>. De straal meet je <b>loodrecht</b> naar een zijde.`);
      if (hier) hier.remove();
      const kies = p.kies === false ? null : p.kies || (api.inVraag ? (om ?
        { vraag: 'Welke lijnen gaan allemaal door dit middelpunt?', opties: [{ t: 'de middelloodlijnen van de zijden', goed: true }, { t: 'de bissectrices van de hoeken', fout: 'Bissectrices horen bij de <b>ingeschreven</b> cirkel, die de zijden raakt. Deze cirkel gaat door de hoekpunten: M ligt even ver van twee hoekpunten, en dat is de middelloodlijn.', mis: 'W10' }, { t: 'de zwaartelijnen', fout: 'Een zwaartelijn gaat van een hoekpunt naar het midden van de overkant, maar staat niet loodrecht. Even ver van twee punten = middelloodlijn.' }], w: 'Even ver van twee hoekpunten = op de middelloodlijn van die zijde.' } :
        { vraag: 'Welke lijnen gaan allemaal door dit middelpunt?', opties: [{ t: 'de bissectrices van de hoeken', goed: true }, { t: 'de middelloodlijnen van de zijden', fout: 'Middelloodlijnen horen bij de <b>omgeschreven</b> cirkel, door de hoekpunten. Deze cirkel raakt de zijden: M ligt even ver van twee zijden, en dat is de bissectrice.', mis: 'W10' }, { t: 'de hoogtelijnen', fout: 'Een hoogtelijn staat loodrecht op een zijde, maar deelt de hoek niet middendoor. Even ver van twee zijden = bissectrice.' }], w: 'Even ver van twee zijden = op de bissectrice van de hoek ertussen.' }) : null);
      if (kies) kiesBox = kiesBlok(root, kies, api, () => { toonLijnen(); af(root, api, p.klaar); });
      else { toonLijnen(); af(root, api, p.klaar); }
    }
    V.sleep(M, {
      beperk: q => { raak = G.d(q, doel) < tol; return raak ? { x: doel.x, y: doel.y } : q; },
      beweeg: q => { M.classList.remove('wenk'); teken(q); },
      los: q => { if (klaar || knop) return; if (raak) vast(); else { const m = maten(q); zeg(uit, '', om ? `Nog niet gelijk: ${m.map(L).join(', ')}. Schuif M tot de drie afstanden gelijk zijn.` : `Nog niet gelijk: ${m.map(L).join(', ')}. Schuif M tot de drie loodrechte afstanden gelijk zijn.`); } },
    });
    const hier = knop ? hierKnop('Hier ligt het middelpunt', () => {
      if (klaar) return;
      if (raak) return vast();
      foutje(api, p.mis); schud(hier);
      const m = maten(M.p);
      zeg(uit, 'fout', om ? `<b>Nog niet.</b> M${nm[0]} = ${L(m[0])}, M${nm[1]} = ${L(m[1])} en M${nm[2]} = ${L(m[2])}: niet gelijk. Dan gaat de cirkel niet door alle drie de hoekpunten.` : `<b>Nog niet.</b> De loodrechte afstanden zijn ${L(m[0])}, ${L(m[1])} en ${L(m[2])}: niet gelijk. Dan raakt de cirkel niet alle drie de zijden.`);
    }) : null;
    root.append(...[vraag, V.svg, meet, hier, uit].filter(Boolean));
    teken(M.p);
    root._los = async fout => {
      if (kiesBox) return kiesBox._kies(fout);
      if (klaar) return;
      if (fout) { M._naar(G.plus(doel, { x: .9, y: .7 })); await pauze(60); if (knop) { hier.click(); await pauze(60); } }
      M._naar(doel); await pauze(60); if (knop && !klaar) hier.click();
    };
  };

  /* ===================================================================== BALANS */
  VIS.balans = (pod, p, api) => {
    const { root, vraag, meet, uit, L } = opzet(pod, p, 'balans');
    const pts = [p.A, p.B, p.C].map(pt), nm = p.namen || ['A', 'B', 'C'];
    const fase0 = p.fase || 'beide', nLijnen = p.lijnen ?? 2;
    const Z = G.zwaartepunt(...pts);
    const V = maakVlak(p, vlakOm(pts, 1, { onder: fase0 === 'lijnen' ? 0 : 1.5 }));
    const tol = p.tol ?? .3, knop = p.knop ?? !!api.inVraag;
    const gid = WK.uid('hout');
    const schaduwG = groep(V.laag.gebied), stokG = groep(V.laag.gebied), plaatG = groep(V.laag.figuur), lijnG = groep(V.laag.figuur), liveG = groep(V.laag.meet);
    const plaatM = `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${WK.licht('#E0A85E', .35)}"/><stop offset=".5" stop-color="#E0A85E"/><stop offset="1" stop-color="${WK.donker('#E0A85E', .3)}"/></linearGradient></defs>` +
      V.veelhoek(pts, { vul: `url(#${gid})`, kleur: '#8A5A2B', dik: 2.6 }) +
      [.25, .5, .75].map(t => { const a = G.plus(pts[0], G.maal(G.min(pts[2], pts[0]), t)), b = G.plus(pts[1], G.maal(G.min(pts[2], pts[1]), t)); return V.stuk(a, b, { kleur: '#fff', dik: 1.2 }).replace('<path ', '<path opacity=".25" '); }).join('') +
      pts.map((q, i) => { const u = G.eenheid(G.min(q, Z)); return V.punt(q, { label: nm[i], kleur: K.inkt, r: 4, lx: u.x * 16 - 5, ly: -u.y * 16 + 5 }); }).join('');
    const binnenPlaat = (q, m = .15) => { const s = G.plus(q, G.maal(G.eenheid(G.min(Z, q)), m)); return G.binnenDriehoek(s, ...pts); };
    let S = null, hoek = 0, doelHoek = 0, raf = 0, piv = [0, 0], klaar = false, kiesBox = null, raak = false, balansAf = fase0 === 'lijnen';
    function stok(q) { const [x, y] = V.P(q); return `<path d="M${x} ${y} V${V.H}" stroke="#7A4E2A" stroke-width="10" stroke-linecap="round"/><path d="M${x - 2} ${y + 4} V${V.H}" stroke="#B07A45" stroke-width="3" opacity=".7"/>`; }
    function zetPlaat(q) {
      const off = G.min(Z, q), [sx, sy] = V.P(q);
      doelHoek = raak ? 0 : Math.max(-14, Math.min(14, off.x * 9));
      const sch = raak ? 0 : Math.min(1, Math.hypot(off.x, off.y) / 2);
      schaduwG.innerHTML = `<g transform="translate(${(off.x * 6).toFixed(1)} ${(-off.y * 6 + 5 + sch * 4).toFixed(1)})" opacity="${.14 + sch * .1}">${V.veelhoek(pts, { vul: '#2B1E3A', kleur: 'none', dik: 0 })}</g>`;
      stokG.innerHTML = stok(q);
      piv = [sx, sy];
      if (minderBeweging()) hoek = doelHoek;
      plaatG.setAttribute('transform', `rotate(${hoek.toFixed(2)} ${piv[0]} ${piv[1]})`);
      if (!raf && hoek !== doelHoek) { const stap = () => { hoek += (doelHoek - hoek) * .18; if (Math.abs(doelHoek - hoek) < .05) hoek = doelHoek; plaatG.setAttribute('transform', `rotate(${hoek.toFixed(2)} ${piv[0]} ${piv[1]})`); raf = hoek === doelHoek ? 0 : requestAnimationFrame(stap); }; raf = requestAnimationFrame(stap); }
    }
    plaatG.innerHTML = (p.decor ? p.decor(V) : '') + plaatM;
    function teken(q) {
      zetPlaat(q);
      const off = G.min(Z, q), r = Math.hypot(off.x, off.y);
      liveG.innerHTML = !raak && r > .25 ? (() => { const e = G.plus(q, G.maal(G.eenheid(off), Math.min(1.1, r))); return V.stuk(q, e, { kleur: K.punt, dik: 3, pijl: true }) + V.tekst(G.plus(e, G.maal(G.eenheid(off), .45)), 'zakt', { s: 15, kleur: K.punt }); })() : '';
      zetMeet(meet, [[raak ? "in balans: 0°" : `scheef: ${graad(Math.min(30, r * 10))}`, raak ? true : null]]);
    }
    /* fase 1: balanceren */
    function balansVast() {
      raak = true; balansAf = true; doelHoek = 0; S.remove(); S = null; liveG.innerHTML = '';
      stokG.innerHTML = stok(Z); zetPlaat(Z);
      lijnG.innerHTML = `<g class="wk-onthul">${V.punt(Z, { label: 'Z', kleur: K.zwaartelijn, r: 6, lx: 10, ly: -10 })}</g>`;
      vier(V, Z); root.classList.add('wk-feest');
      zetMeet(meet, [['in balans: 0°', true]]);
      if (hier) hier.remove();
      if (fase0 === 'balans') { zeg(uit, 'goed', p.na || 'Hij balanceert! Dit balanspunt heet het <b>zwaartepunt Z</b>.'); einde(); }
      else { zeg(uit, 'goed', 'Hij balanceert! Dit punt heet het <b>zwaartepunt Z</b>. Hoe vind je het zonder vinger? Teken zwaartelijnen: tik een <b>hoekpunt</b> en dan het <b>midden van de overstaande zijde</b>.'); startLijnen(); }
    }
    let hier = null;
    if (fase0 !== 'lijnen') {
      let st = pt(p.start) || G.plus(Z, { x: 1.1, y: -.5 });
      if (!binnenPlaat(st)) st = G.plus(Z, G.maal(G.min(pts[0], Z), .5));
      S = V.handvat(st, { kleur: K.probe, label: 'S' }); S.classList.add('wenk');
      V.sleep(S, {
        beperk: q => { if (!binnenPlaat(q)) q = S.p || st; raak = G.d(q, Z) < tol; return raak ? { x: Z.x, y: Z.y } : q; },
        beweeg: q => { S.classList.remove('wenk'); teken(q); },
        los: () => { if (balansAf || knop) return; if (raak) balansVast(); else zeg(uit, '', 'Hij kantelt nog naar de kant van de pijl: daar zit meer gewicht. Schuif je vinger die kant op.'); },
      });
      hier = knop ? hierKnop('Hij balanceert hier', () => {
        if (balansAf) return;
        if (raak) return balansVast();
        foutje(api, p.mis); schud(hier);
        zeg(uit, 'fout', `<b>Hij valt eraf!</b> Hij kantelt nog ${graad(Math.min(30, G.d(S.p, Z) * 10))} naar de kant van de pijl. Daar zit meer hout.`);
      }) : null;
      teken(S.p);
    } else { stokG.innerHTML = ''; }
    /* fase 2: zwaartelijnen tekenen */
    let sel = null; const gedaan = new Set(), tikG = [], zijdePunten = [];
    function startLijnen() {
      const naast = (q, l, m) => l.every(o => G.d(o, q) >= m);
      pts.forEach((X, i) => {
        const Y = pts[(i + 1) % 3], W = pts[(i + 2) % 3], mid = G.midden(Y, W), kand = [{ q: mid, soort: 'midden' }];
        const hf = G.proj(X, Y, W); if (hf.t > .12 && hf.t < .88) kand.push({ q: { x: hf.x, y: hf.y }, soort: 'hoogte', mis: 'W11' });
        const lY = G.d(X, Y), lW = G.d(X, W), bf = G.plus(Y, G.maal(G.min(W, Y), lY / (lY + lW))); kand.push({ q: bf, soort: 'bissectrice', mis: 'W8' });
        const houd = [];
        kand.forEach(k => { if (naast(k.q, [...houd.map(o => o.q), Y, W], 1.45) || k.soort === 'midden') houd.push(k); });
        houd.forEach(k => zijdePunten.push({ ...k, zijde: i, Y, W }));
      });
      pts.forEach((X, i) => tikG.push(tikbaar(V, X, { kleur: K.zwaartelijn, aria: 'hoekpunt ' + nm[i] }, () => kiesHoek(i))));
      zijdePunten.forEach(zp => { zp.el = tikbaar(V, zp.q, { kleur: NEUTRAAL, aria: 'punt op zijde ' + nm[(zp.zijde + 1) % 3] + nm[(zp.zijde + 2) % 3] }, () => kiesZijde(zp)); zp.el.classList.add('wk-klein'); tikG.push(zp.el); });
      [...tikG].forEach(g => g.classList.add('wenk'));
    }
    function kiesHoek(i) {
      if (klaar) return;
      if (gedaan.has(i)) { zeg(uit, '', `Vanuit ${nm[i]} heb je er al een. Kies een ander hoekpunt.`); return; }
      sel = i; tikG.forEach(g => g.classList.remove('gekozen')); tikG[i].classList.add('gekozen');
      zeg(uit, '', `Hoekpunt ${nm[i]}. Tik nu het <b>midden</b> van de overstaande zijde ${nm[(i + 1) % 3]}${nm[(i + 2) % 3]}.`);
    }
    function kiesZijde(zp) {
      if (klaar) return;
      if (sel == null) { zeg(uit, '', 'Tik eerst een <b>hoekpunt</b>, dan het midden van de zijde tegenover dat hoekpunt.'); return; }
      const zn = q => nm[(q + 1) % 3] + nm[(q + 2) % 3];
      if (zp.zijde !== sel) { foutje(api, p.mis); schud(zp.el); zeg(uit, 'fout', `Dat punt ligt op zijde ${zn(zp.zijde)}, en daar zit ${nm[sel]} zelf aan. Een zwaartelijn gaat naar de <b>overstaande</b> zijde: ${zn(sel)}.`); return; }
      if (zp.soort !== 'midden') {
        foutje(api, zp.mis); schud(zp.el);
        const a = G.d(zp.Y, zp.q), b = G.d(zp.q, zp.W);
        zeg(uit, 'fout', `Meet maar na: de zijde wordt ${L(a)} en ${L(b)}. Niet gelijk, dus dit is <b>niet het midden</b>.` + (zp.soort === 'hoogte' ? ' Hier staat de lijn loodrecht op de zijde: dat is een hoogtelijn. Een zwaartelijn hoeft niet loodrecht te staan.' : ' Hier komt de lijn uit die de hoek middendoor deelt (bissectrice). Een zwaartelijn deelt de <b>zijde</b> middendoor.'));
        return;
      }
      const X = pts[sel], k = gedaan.size + 1;
      gedaan.add(sel);
      lijnG.insertAdjacentHTML('beforeend', `<g class="wk-onthul">${V.stuk(X, zp.q, { kleur: K.zwaartelijn, dik: 3.2 })}${V.streepjes(zp.Y, zp.q, k, { kleur: K.zwaartelijn })}${V.streepjes(zp.q, zp.W, k, { kleur: K.zwaartelijn })}</g>`);
      zp.el.remove(); tikG[sel].classList.remove('gekozen', 'wenk'); tikG[sel].classList.add('af'); sel = null;
      if (gedaan.size >= nLijnen) {
        klaar = true;
        const rest = [0, 1, 2].filter(i => !gedaan.has(i));
        lijnG.insertAdjacentHTML('beforeend', `<g class="wk-onthul">${rest.map(i => { const Y = pts[(i + 1) % 3], W = pts[(i + 2) % 3]; return V.stuk(pts[i], G.midden(Y, W), { kleur: K.zwaartelijn, dik: 2.4, stip: true }); }).join('')}${fase0 === 'lijnen' ? V.punt(Z, { label: 'Z', kleur: K.zwaartelijn, r: 6, lx: 10, ly: -10 }) : ''}</g>`);
        tikG.forEach(g => g.remove()); vier(V, Z); root.classList.add('wk-feest');
        zeg(uit, 'goed', p.na || (fase0 === 'lijnen' ? 'De zwaartelijnen gaan door één punt: het <b>zwaartepunt Z</b>. Twee zijn genoeg, de derde gaat er vanzelf ook door.' : 'Kijk: de zwaartelijnen gaan precies door het balanspunt Z. Twee zijn genoeg, de derde (gestippeld) gaat er ook door.'));
        einde();
      } else zeg(uit, 'goed', `Een zwaartelijn! Hij deelt de zijde in twee gelijke stukken (de streepjes). Nog ${nLijnen - gedaan.size}: kies een ander hoekpunt.`);
    }
    function einde() {
      klaar = true;
      if (p.kies) kiesBox = kiesBlok(root, p.kies, api, () => af(root, api, p.klaar)); else af(root, api, p.klaar);
    }
    if (fase0 === 'lijnen') { zeg(uit, '', 'Tik een <b>hoekpunt</b> en dan het <b>midden</b> van de overstaande zijde.'); startLijnen(); }
    root.append(...[vraag, V.svg, meet, hier, uit].filter(Boolean));
    root._los = async fout => {
      if (kiesBox) return kiesBox._kies(fout);
      if (root.dataset.af) return;
      let fGedaan = !fout;
      if (!balansAf) {
        if (!fGedaan && knop) { S._naar(G.plus(Z, G.maal(G.eenheid(G.min(pts[0], Z)), 1))); await pauze(60); hier.click(); await pauze(60); fGedaan = true; }
        S._naar(Z); await pauze(60); if (knop && !balansAf) hier.click(); await pauze(60);
      }
      if (klaar) return;
      for (let i = 0; i < 3 && !klaar; i++) {
        if (gedaan.has(i)) continue;
        kiesHoek(i); await pauze(40);
        if (!fGedaan) { const lok = zijdePunten.find(z => z.zijde === i && z.soort !== 'midden') || zijdePunten.find(z => z.zijde !== i); if (lok) { kiesZijde(lok); await pauze(60); } fGedaan = true; }
        kiesZijde(zijdePunten.find(z => z.zijde === i && z.soort === 'midden')); await pauze(60);
      }
    };
    return () => { if (raf) cancelAnimationFrame(raf); };
  };

  /* ===================================================================== HOOGTEZOEKER */
  VIS.hoogtezoeker = (pod, p, api) => {
    const { root, vraag, meet, uit, L } = opzet(pod, p, 'hoogte');
    const pts = [p.A, p.B, p.C].map(pt), nm = p.namen || ['A', 'B', 'C'];
    const lijst = (p.hoogtes || [p.top || nm[2]]).map(n => nm.indexOf(n)).filter(i => i >= 0);
    const voeten = pts.map((X, i) => { const f = G.proj(X, pts[(i + 1) % 3], pts[(i + 2) % 3]); return { x: f.x, y: f.y, t: f.t }; });
    const Hp = G.hoogtepunt(...pts);
    const V = maakVlak(p, vlakOm([...pts, ...lijst.map(i => voeten[i]), ...(lijst.length > 1 && Hp ? [Hp] : [])], 1));
    const tol = p.tol ?? .3, knop = p.knop ?? !!api.inVraag;
    const statischG = groep(V.laag.figuur), lijnG = groep(V.laag.figuur), liveG = groep(V.laag.meet);
    statischG.innerHTML = (p.decor ? p.decor(V) : '') + driehoek(V, pts, nm, { vul: '#E0F2FE' });
    let k = 0, F = null, lood = false, klaar = false, kiesBox = null;
    const huidig = () => { const i = lijst[k]; return { i, T: pts[i], P1: pts[(i + 1) % 3], P2: pts[(i + 2) % 3], voet: voeten[i], zijde: nm[(i + 1) % 3] + nm[(i + 2) % 3] }; };
    const verleng = (c, q) => { const f = G.proj(q, c.P1, c.P2); return f.t < -EPS ? V.stuk(c.P1, q, { kleur: K.inkt, dik: 2, stip: true }) : f.t > 1 + EPS ? V.stuk(c.P2, q, { kleur: K.inkt, dik: 2, stip: true }) : ''; };
    const hoekBij = (c, q) => scherp(G.hoek(c.T, q, G.plus(q, G.min(c.P2, c.P1))));
    function teken(q) {
      const c = huidig(), kl = lood ? K.goed : K.hoogtelijn;
      liveG.innerHTML = verleng(c, q) + V.stuk(c.T, q, { kleur: kl, dik: 3, stip: !lood }) + (lood ? V.rechteHoek(q, c.T, G.d(q, c.P2) > .1 ? c.P2 : c.P1, { kleur: K.goed }) : '');
      zetMeet(meet, [[`hoek bij F = ${graad(hoekBij(c, q))}`, lood ? true : null], [`${nm[c.i]}F = ${L(G.d(c.T, q))}`, lood ? true : null]]);
    }
    function nieuweF() {
      const c = huidig();
      const [k0, k1] = V.knip(c.P1, c.P2, true, true), e0 = G.plus(k0, G.maal(G.eenheid(G.min(k1, k0)), .35)), e1 = G.plus(k1, G.maal(G.eenheid(G.min(k1, k0)), -.35));
      let st = G.plus(c.voet, G.maal(G.eenheid(G.min(c.P2, c.P1)), 2.2));
      const tt = G.proj(st, c.P1, c.P2).t; if (tt > 1 || tt < 0) st = G.plus(c.voet, G.maal(G.eenheid(G.min(c.P2, c.P1)), -2.2));
      if (G.proj(st, c.P1, c.P2).t > 1 || G.proj(st, c.P1, c.P2).t < 0) st = G.midden(c.P1, c.P2);
      F = V.handvat(knipOpSegment(st, e0, e1), { kleur: K.probe, label: 'F' }); F.classList.add('wenk'); lood = false;
      V.sleep(F, {
        beperk: q => { let f = knipOpSegment(q, e0, e1); f = { x: f.x, y: f.y }; lood = G.d(f, c.voet) < tol; return lood ? { x: c.voet.x, y: c.voet.y } : f; },
        beweeg: q => { F.classList.remove('wenk'); teken(q); },
        los: q => { if (klaar || knop) return; if (lood) vast(); else zeg(uit, '', `De hoek bij F is ${graad(hoekBij(c, q))}. Een hoogtelijn staat <b>loodrecht</b> op de zijde: zoek 90°.` + (c.voet.t < 0 || c.voet.t > 1 ? ' Tip: misschien moet je <b>voorbij</b> het hoekpunt schuiven.' : '')); },
      });
      teken(F.p);
    }
    function vast() {
      const c = huidig(), buiten = c.voet.t < -EPS || c.voet.t > 1 + EPS;
      F.remove(); F = null; liveG.innerHTML = '';
      lijnG.insertAdjacentHTML('beforeend', `<g class="wk-onthul">${verleng(c, c.voet)}${V.lijn(c.T, c.voet, { kleur: K.hoogtelijn, dik: 2.6 })}${V.rechteHoek(c.voet, c.T, G.d(c.voet, c.P2) > .1 ? c.P2 : c.P1, { kleur: K.hoogtelijn })}</g>`);
      vier(V, c.voet);
      k++;
      zeg(uit, 'goed', `Loodrecht! Dit is de <b>hoogtelijn door ${nm[c.i]}</b>.` + (buiten ? ` De voet ligt <b>buiten</b> de driehoek: je moest zijde ${c.zijde} <b>verlengen</b> (stippellijn). Dat hoort zo bij een stompe hoek.` : '') +
        (k < lijst.length ? ` Nu de hoogtelijn door <b>${nm[lijst[k]]}</b>: schuif F langs zijde ${nm[(lijst[k] + 1) % 3]}${nm[(lijst[k] + 2) % 3]}.` : ''));
      if (k < lijst.length) { nieuweF(); return; }
      klaar = true; root.classList.add('wk-feest'); if (hier) hier.remove();
      if (lijst.length >= 2 && Hp) {
        const rest = [0, 1, 2].filter(i => !lijst.includes(i));
        const binnen = G.binnenDriehoek(Hp, ...pts);
        lijnG.insertAdjacentHTML('beforeend', `<g class="wk-onthul">${rest.map(i => verleng({ T: pts[i], P1: pts[(i + 1) % 3], P2: pts[(i + 2) % 3] }, voeten[i]) + V.lijn(pts[i], voeten[i], { kleur: K.hoogtelijn, dik: 2, stip: true })).join('')}${V.binnen(Hp) ? V.punt(Hp, { label: 'H', kleur: K.hoogtelijn, r: 6, lx: 10, ly: -10 }) : ''}</g>`);
        vier(V, Hp);
        zeg(uit, 'goed', p.na || (`De hoogtelijnen gaan door één punt: het <b>hoogtepunt H</b>.` + (binnen ? '' : ' H ligt hier <b>buiten</b> de driehoek, want de driehoek heeft een stompe hoek.')));
      } else if (p.na) zeg(uit, 'goed', p.na);
      if (p.kies) kiesBox = kiesBlok(root, p.kies, api, () => af(root, api, p.klaar)); else af(root, api, p.klaar);
    }
    const hier = knop ? hierKnop('Nu staat hij loodrecht', () => {
      if (klaar || !F) return;
      if (lood) return vast();
      const c = huidig(), buiten = c.voet.t < -EPS || c.voet.t > 1 + EPS;
      foutje(api, p.mis ?? (buiten ? 'W16' : null)); schud(hier);
      zeg(uit, 'fout', `<b>Nog niet.</b> De hoek bij F is ${graad(hoekBij(c, F.p))}, niet 90°.` + (buiten ? ' Bij deze driehoek ligt de voet <b>buiten</b> de zijde: verleng hem.' : ''));
    }) : null;
    root.append(...[vraag, V.svg, meet, hier, uit].filter(Boolean));
    nieuweF();
    root._los = async fout => {
      if (kiesBox) return kiesBox._kies(fout);
      let f = fout;
      while (!klaar && F) {
        const c = huidig();
        if (f && knop) { const u = G.eenheid(G.min(c.P2, c.P1)); let q = G.plus(c.voet, G.maal(u, 1.3)); F._naar(q); await pauze(50); hier.click(); await pauze(50); f = false; }
        F._naar({ x: c.voet.x, y: c.voet.y }); await pauze(50); if (knop && F) hier.click(); await pauze(50);
      }
    };
  };

  /* ===================================================================== LIJNKIEZER */
  VIS.lijnkiezer = (pod, p, api) => {
    const { root, vraag, meet, uit, L } = opzet(pod, p, 'lijnen');
    const pts = [p.A, p.B, p.C].map(pt), nm = p.namen || ['A', 'B', 'C'];
    const modus = p.modus || 'kies';
    /* geometrie van een bijzondere lijn */
    function geo(soort, bij) {
      if (soort === 'middelloodlijn') {
        const i = nm.indexOf(bij[0]), j = nm.indexOf(bij[1]), Y = pts[i], W = pts[j], m = G.midden(Y, W), w = G.plus(m, G.loodrechtOp(G.min(W, Y)));
        return { soort, a: m, b: w, oneindig: true, D: m, Y, W, zijde: bij, X: null };
      }
      const i = nm.indexOf(bij), X = pts[i], Y = pts[(i + 1) % 3], W = pts[(i + 2) % 3], zijde = nm[(i + 1) % 3] + nm[(i + 2) % 3];
      let D;
      if (soort === 'zwaartelijn') D = G.midden(Y, W);
      else if (soort === 'bissectrice') { const lY = G.d(X, Y), lW = G.d(X, W); D = G.plus(Y, G.maal(G.min(W, Y), lY / (lY + lW))); }
      else { const f = G.proj(X, Y, W); D = { x: f.x, y: f.y }; }
      return { soort, a: X, b: D, D, Y, W, X, zijde };
    }
    const V = maakVlak(p, vlakOm([...pts, ...(p.items || []).flatMap(it => [it.soort || it.zoek, ...(it.lokkers || [])].map(s => geo(s, it.bij).D))], 1));
    const statischG = groep(V.laag.figuur), lijnG = groep(V.laag.figuur), meetG = groep(V.laag.meet);
    statischG.innerHTML = (p.decor ? p.decor(V) : '') + driehoek(V, pts, nm, { vul: '#F1F5F9' });
    const feiten = g => {
      const doorHoek = g.soort !== 'middelloodlijn' || pts.some(X => G.dLijn(X, g.a, g.b) < .05);
      const a = G.d(g.Y, g.D), b = G.d(g.D, g.W), midden = Math.abs(a - b) < .02;
      const hk = scherp(G.hoek(g.soort === 'middelloodlijn' ? g.b : g.a, g.D, g.W)), lood = Math.abs(hk - 90) < .5;
      return { doorHoek, a, b, midden, hk, lood };
    };
    const verleng = g => { if (g.soort !== 'hoogtelijn') return ''; const f = G.proj(g.D, g.Y, g.W); return f.t < 0 ? V.stuk(g.Y, g.D, { kleur: K.inkt, dik: 2, stip: true }) : f.t > 1 ? V.stuk(g.W, g.D, { kleur: K.inkt, dik: 2, stip: true }) : ''; };
    const teken = (g, kleur, dik = 3) => verleng(g) + (g.oneindig ? V.lijn(g.a, g.b, { kleur, dik }) : V.stuk(g.a, g.D, { kleur, dik }));
    const merk = g => { const k = SOORT[g.soort].kleur;
      if (g.soort === 'middelloodlijn') return V.rechteHoek(g.D, g.W, g.b, { kleur: k, maat: .28 }) + V.streepjes(g.Y, g.D, 1, { kleur: k }) + V.streepjes(g.D, g.W, 1, { kleur: k });
      if (g.soort === 'zwaartelijn') return V.streepjes(g.Y, g.D, 1, { kleur: k }) + V.streepjes(g.D, g.W, 1, { kleur: k });
      if (g.soort === 'hoogtelijn') return V.rechteHoek(g.D, g.X, G.d(g.D, g.W) > .1 ? g.W : g.Y, { kleur: k, maat: .28 });
      return V.boog(g.Y, g.X, g.D, { n: 1, r: .7, kleur: k }) + V.boog(g.D, g.X, g.W, { n: 1, r: .82, kleur: k }); };
    const MIS = (echt, kies) => { const s = new Set([echt, kies]);
      if (s.has('zwaartelijn') && s.has('hoogtelijn')) return 'W11';
      if (s.has('zwaartelijn') && s.has('bissectrice')) return 'W8';
      if (s.has('middelloodlijn') && (s.has('zwaartelijn') || s.has('hoogtelijn'))) return 'W6';
      return null; };
    const jaNee = b => `<b>${b ? 'ja' : 'nee'}</b>`;
    const checklist = g => { const f = feiten(g);
      return `Check de drie vragen voor deze lijn:<br>• door een hoekpunt? ${jaNee(f.doorHoek)}<br>• naar het midden van ${g.zijde}? ${jaNee(f.midden)} (${L(f.a)} en ${L(f.b)})<br>• loodrecht op ${g.zijde}? ${jaNee(f.lood)} (${graad(f.hk)})`; };
    /* meetknoppen: het meetlint als wapen */
    let huidigeG = [];
    const meetStukken = () => { meetG.innerHTML = huidigeG.map(g => maat(V, g.Y, g.D, L(G.d(g.Y, g.D)), { kleur: K.punt, kant: -1 }) + maat(V, g.D, g.W, L(G.d(g.D, g.W)), { kleur: K.punt, kant: -1 })).join(''); };
    const meetHoek = () => { meetG.innerHTML = huidigeG.map(g => { const f = feiten(g); return V.tekst(G.plus(g.D, G.maal(G.eenheid(G.min(g.soort === 'middelloodlijn' ? g.b : g.a, g.D)), .9)), graad(f.hk), { s: 15, kleur: K.punt }); }).join(''); };
    const meetRij = h('div', { class: 'wk-keuzes wk-meetknoppen' },
      h('button', { class: 'wk-keus wk-meetknop', type: 'button', onclick: meetStukken }, '📏 meet de zijde'),
      h('button', { class: 'wk-keus wk-meetknop', type: 'button', onclick: meetHoek }, '📐 meet de hoek'));
    const keuzes = h('div', { class: 'wk-keuzes' });
    const items = p.items || [];
    let k = 0, klaar = false, kiesBox = null, bezig = false;
    function ronde() {
      const it = items[k]; keuzes.innerHTML = ''; meetG.innerHTML = ''; bezig = false;
      if (modus === 'kies') {
        const g = geo(it.soort, it.bij); huidigeG = [g];
        lijnG.innerHTML = `<g class="wk-nieuw">${teken(g, NEUTRAAL)}</g>`;
        vraag.innerHTML = it.vraag || 'Welke lijn is dit? <small>Meet gerust: door een hoekpunt? naar het midden? loodrecht?</small>';
        VOLGORDE.forEach(s => { const b = h('button', { class: 'wk-keus wk-lijnkeus', type: 'button', html: `<i style="background:${SOORT[s].kleur}"></i>${s}` }); b._goed = s === g.soort; b.onclick = () => kies(b, s, g); keuzes.append(b); });
      } else {
        const soorten = shuffle([it.zoek, ...(it.lokkers || [])]), gs = soorten.map(s => geo(s, it.bij)); huidigeG = gs;
        const doel = gs.find(g => g.soort === it.zoek);
        /* nummers aan het eind van elke lijn, uit elkaar geduwd */
        const plek = gs.map(g => { const u = G.eenheid(G.min(g.D, g.a)); return G.plus(g.D, G.maal(u, .55)); });
        for (let r = 0; r < 4; r++) for (let i = 0; i < plek.length; i++) for (let j = i + 1; j < plek.length; j++) {
          if (G.d(plek[i], plek[j]) >= .95) continue;
          let u = G.min(gs[i].D, gs[j].D); u = Math.hypot(u.x, u.y) < 1e-6 ? G.eenheid(G.min(gs[i].W, gs[i].Y)) : G.eenheid(u);
          plek[i] = G.plus(plek[i], G.maal(u, .3)); plek[j] = G.plus(plek[j], G.maal(u, -.3));
        }
        lijnG.innerHTML = `<g class="wk-nieuw">${gs.map(g => teken(g, NEUTRAAL, 2.6)).join('')}${plek.map((q, i) => { const [x, y] = V.P(q); return `<circle cx="${x}" cy="${y}" r="11" fill="#fff" stroke="${NEUTRAAL}" stroke-width="2"/><text x="${x}" y="${y + 5}" font-size="14" font-weight="800" text-anchor="middle" fill="${NEUTRAAL}">${i + 1}</text>`; }).join('')}</g>`;
        vraag.innerHTML = it.vraag || `Welke lijn is de <b>${it.zoek}</b> vanuit ${it.bij}?`;
        gs.forEach((g, i) => { const b = h('button', { class: 'wk-keus', type: 'button' }, 'lijn ' + (i + 1)); b._goed = g === doel; b.onclick = () => kies(b, g.soort, doel, g); keuzes.append(b); });
      }
    }
    function kies(b, soort, echt, gekozenG) {
      if (bezig || b.disabled || klaar) return;
      if (b._goed) {
        bezig = true; b.classList.add('goed'); keuzes.querySelectorAll('button').forEach(x => x.disabled = true);
        lijnG.innerHTML = `<g class="wk-onthul">${teken(echt, SOORT[echt.soort].kleur)}${merk(echt)}</g>`; meetG.innerHTML = '';
        zeg(uit, 'goed', `<b>Ja, de ${echt.soort}:</b> ${SOORT[echt.soort].kort}.`);
        k++;
        if (k >= items.length) { klaar = true; vier(V, echt.D); root.classList.add('wk-feest'); if (p.na) zeg(uit, 'goed', p.na);
          if (p.kies) kiesBox = kiesBlok(root, p.kies, api, () => af(root, api, p.klaar)); else af(root, api, p.klaar); }
        else setTimeout(() => { if (!klaar) ronde(); }, minderBeweging() ? 300 : 1100);
      } else {
        b.classList.add('fout'); b.disabled = true; schud(b);
        const g = gekozenG || echt;
        foutje(api, p.mis ?? MIS(echt.soort, soort));
        zeg(uit, 'fout', modus === 'kies' ? `<b>Geen ${soort}.</b> ${checklist(g)}<br>Een ${soort} gaat ${SOORT[soort].kort}.` : `<b>Lijn ${[...keuzes.children].indexOf(b) + 1} is de ${g.soort}, niet de ${echt.soort}.</b> ${checklist(g)}<br>Een ${echt.soort} gaat ${SOORT[echt.soort].kort}.`);
      }
    }
    root.append(vraag, V.svg, meetRij, keuzes, uit);
    ronde();
    root._los = async fout => {
      if (kiesBox) return kiesBox._kies(fout);
      let f = fout;
      for (let n = 0; n < 12 && !klaar; n++) {
        while (bezig && !klaar) await pauze(80);
        if (klaar) break;
        const bs = [...keuzes.children];
        if (f) { const x = bs.find(b => !b._goed && !b.disabled); if (x) { x.click(); await pauze(40); } f = false; }
        const g = bs.find(b => b._goed); if (g && !g.disabled) g.click();
        await pauze(60);
      }
    };
  };
})();
