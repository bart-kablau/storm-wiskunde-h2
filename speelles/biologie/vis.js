'use strict';
/* =========================================================================
   BIOLOGIE: bouwstenen (canoniek: tools/speelles-engine/biologie/vis.js)
   Elke bouwsteen: VIS.naam = (podium, p, api) => opruim?
   api.klaar(bericht?) zet Verder aan; pas ná de handeling die de kern raakt.
   Generiek: alle inhoud komt via p (zie tools/speelles-engine/CLAUDE.md).
   Vereist engine.js en biologie/teken.js.
   ========================================================================= */

/* ---------- gedeelde hulpjes ---------- */
const icoon = (o) => o ? (o.startsWith('<') ? o : (ORG[o] ? ORG[o]() : '')) : '';
const kaartje = (o, label, cls = '') => h('button', { class: 'bkaart ' + cls, type: 'button' }, o ? h('span', { class: 'bk-ic', html: `<svg viewBox="0 0 100 100" aria-hidden="true">${icoon(o)}</svg>` }) : null, h('span', { class: 'bk-t', html: label }));
const feedbackEl = () => h('div', { class: 'feedback', 'aria-live': 'polite' });
const zeg = (fb, soort, html) => { fb.className = 'feedback ' + soort; fb.innerHTML = html; };

/* Slepen met de vinger of muis, met tikken als terugval.
   el: wat je sleept. vind(x,y) -> doel-element of null. opDrop(doel). Tik zonder slepen -> opTik(). */
function sleepbaar(el, { vind, opDrop, opTik }) {
  let start = null, geest = null, gesleept = false;
  el.addEventListener('pointerdown', e => { if (el.disabled) return; start = { x: e.clientX, y: e.clientY }; gesleept = false; el.setPointerCapture?.(e.pointerId); });
  el.addEventListener('pointermove', e => {
    if (!start) return;
    if (!gesleept && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 10) {
      gesleept = true; const r = el.getBoundingClientRect();
      geest = el.cloneNode(true); geest.classList.add('geest'); geest.style.width = r.width + 'px'; document.body.append(geest);
    }
    if (geest) { geest.style.left = (e.clientX - geest.offsetWidth / 2) + 'px'; geest.style.top = (e.clientY - geest.offsetHeight / 2) + 'px'; document.querySelectorAll('.doel-hover').forEach(d => d.classList.remove('doel-hover')); const d = vind(e.clientX, e.clientY); if (d) d.classList.add('doel-hover'); }
  });
  const eind = e => {
    if (!start) return;
    document.querySelectorAll('.doel-hover').forEach(d => d.classList.remove('doel-hover'));
    if (geest) { geest.remove(); geest = null; }
    if (gesleept) { const d = vind(e.clientX, e.clientY); if (d) opDrop(d); }
    start = null;
  };
  el.addEventListener('pointerup', eind); el.addEventListener('pointercancel', () => { if (geest) geest.remove(); geest = null; start = null; });
  el.addEventListener('click', e => { if (gesleept) { gesleept = false; e.preventDefault(); return; } opTik && opTik(); });
}
const onder = (x, y, sel) => { const els = document.elementsFromPoint(x, y); for (const e of els) { const d = e.closest?.(sel); if (d) return d; } return null; };

/* =========================================================================
   ZOOMLIFT: een liftknop door de organisatieniveaus (jojostrategie).
   p.verdiepingen: [{id, naam, def, scene}] van laag naar hoog. p.start: index.
   Klaar als alle verdiepingen bezocht zijn (of p.min).
   ========================================================================= */
VIS.zoomlift = (pod, p, api) => {
  const V = p.verdiepingen, bezocht = new Set();
  let i = p.start ?? 0;
  const beeld = h('div', { class: 'lift-beeld' });
  const naam = h('div', { class: 'lift-naam' });
  const def = h('div', { class: 'lift-def' });
  const knoppen = V.map((v, k) => h('button', { class: 'liftknop', type: 'button', onclick: () => ga(k), 'aria-label': 'Naar ' + v.naam }, h('span', { class: 'lk-n' }, String(k + 1)), h('span', { class: 'lk-t' }, v.naam)));
  const op = h('button', { class: 'liftpijl', type: 'button', 'aria-label': 'Eén niveau omhoog', onclick: () => ga(Math.min(V.length - 1, i + 1)) }, '▲');
  const neer = h('button', { class: 'liftpijl', type: 'button', 'aria-label': 'Eén niveau omlaag', onclick: () => ga(Math.max(0, i - 1)) }, '▼');
  const teller = h('div', { class: 'minis' });
  function ga(k) {
    i = k; bezocht.add(k);
    beeld.innerHTML = `<svg viewBox="0 0 320 200" class="svgvis" role="img" aria-label="${V[k].naam}">${SCENE[V[k].scene] ? SCENE[V[k].scene]() : ''}</svg>`;
    beeld.classList.remove('wissel'); void beeld.offsetWidth; beeld.classList.add('wissel');
    naam.innerHTML = `<b>${V[k].naam}</b>` + (V[k].klein ? ` <small>${V[k].klein}</small>` : '');
    def.innerHTML = V[k].def;
    knoppen.forEach((b, j) => { b.classList.toggle('aan', j === k); b.classList.toggle('gezien', bezocht.has(j)); });
    op.disabled = k === V.length - 1; neer.disabled = k === 0;
    const nodig = p.min ?? V.length;
    teller.textContent = bezocht.size < nodig ? `Bezocht: ${bezocht.size} van ${nodig} verdiepingen` : 'Alle verdiepingen bezocht. Zoom gerust nog op en neer.';
    if (bezocht.size >= nodig) api.klaar(p.na);
  }
  pod.append(h('div', { class: 'vis' },
    h('div', { class: 'lift' }, h('div', { class: 'lift-links' }, beeld, h('div', { class: 'lift-info' }, naam, def)),
      h('div', { class: 'liftschacht' }, op, h('div', { class: 'liftknoppen' }, knoppen.slice().reverse()), neer)),
    teller));
  ga(i);
};

/* =========================================================================
   LAGENFILTER: één scène, lagen aan/uit (levend, levenloos, alles).
   p.lagen: [{id, naam, toon:[laag-ids], uitleg}] ; klaar als alle knoppen geprobeerd.
   De scène is de standaard ecosysteem-scène met twee lagen.
   ========================================================================= */
VIS.lagenfilter = (pod, p, api) => {
  const levend = plaats(ORG.boom(), 228, 50, 1) + plaats(ORG.gras(), 10, 120, .6) + plaats(ORG.gras(), 170, 132, .5) +
    [[40, 128, .5], [150, 112, .5]].map(([x, y, s]) => plaats(ORG.konijn(), x, y, s)).join('') + plaats(ORG.vos(), 70, 92, .6) + plaats(ORG.paddenstoel(), 200, 150, .4) + plaats(ORG.doodblad(), 120, 160, .3);
  const levenloos = plaats(ORG.zon(), 262, 8, .5) + plaats(ORG.wolk(), 120, 6, .7) + plaats(ORG.thermometer(), 14, 20, .5) + plaats(ORG.wind(), 60, 26, .45) + plaats(ORG.steen(), 104, 132, .45) + plaats(ORG.druppel(), 196, 96, .25);
  const svg = h('div', { class: 'lagen-beeld', html: `<svg viewBox="0 0 320 200" class="svgvis" role="img" aria-label="Een stukje bos"><rect width="320" height="200" rx="16" fill="url(#g-lucht)"/><path d="M0 140 C60 128 120 146 180 136 C230 128 280 134 320 130 V200 H0Z" fill="url(#g-grond)"/><path d="M0 178 C80 172 160 184 320 174 V200 H0Z" fill="url(#g-bodem)" opacity=".75"/><g class="laag-levend">${levend}</g><g class="laag-levenloos">${levenloos}</g></svg>` });
  const uitleg = h('div', { class: 'groot' });
  const geprobeerd = new Set();
  const chips = h('div', { class: 'chips' }, p.lagen.map(l => h('button', { class: 'chip', type: 'button', onclick: e => kies(l, e.currentTarget) }, l.naam)));
  function kies(l, b) {
    geprobeerd.add(l.id);
    chips.querySelectorAll('.chip').forEach(c => c.classList.toggle('aan', c === b));
    svg.querySelector('.laag-levend').style.opacity = l.toon.includes('levend') ? 1 : .08;
    svg.querySelector('.laag-levenloos').style.opacity = l.toon.includes('levenloos') ? 1 : .08;
    uitleg.innerHTML = l.uitleg;
    if (geprobeerd.size >= p.lagen.length) api.klaar(p.na);
  }
  pod.append(h('div', { class: 'vis' }, svg, chips, uitleg));
  kies(p.lagen[p.lagen.length - 1], chips.lastChild); geprobeerd.clear();
};

/* =========================================================================
   SORTEER: één kaart tegelijk naar de goede bak (tik of sleep).
   p.bakken: [{id, naam, sub?}] ; p.kaarten: [{t, bak, w, mis?, org?}] ; p.na
   Een fout geeft de uitleg (w) en spot de valkuil; de kaart blijft liggen.
   ========================================================================= */
VIS.sorteer = (pod, p, api) => {
  const stapel = p.vast ? p.kaarten.slice() : shuffle(p.kaarten);
  let k = 0, combo = 0;
  const fb = feedbackEl();
  const comboEl = h('div', { class: 'combo' });
  const teller = h('div', { class: 'minis' });
  const plek = h('div', { class: 'sorteer-kaart' });
  const bakken = h('div', { class: 'bakken', style: `grid-template-columns:repeat(${Math.min(p.bakken.length, 3)},1fr)` },
    p.bakken.map(b => h('button', { class: 'bak', type: 'button', 'data-bak': b.id, onclick: () => leg(b.id) }, h('b', {}, b.naam), b.sub ? h('small', {}, b.sub) : null, h('div', { class: 'bak-in' }))));
  function toon() {
    plek.innerHTML = '';
    teller.textContent = `Kaart ${Math.min(k + 1, stapel.length)} van ${stapel.length}`;
    if (k >= stapel.length) { plek.append(h('div', { class: 'groot' }, 'Alles gesorteerd!')); teller.textContent = ''; api.klaar(p.na); return; }
    const c = stapel[k];
    const el = kaartje(c.org, c.t, 'groot-kaart');
    sleepbaar(el, { vind: (x, y) => onder(x, y, '[data-bak]'), opDrop: d => leg(d.dataset.bak), opTik: () => { el.classList.toggle('aan'); } });
    plek.append(el);
  }
  function leg(bak) {
    const c = stapel[k]; if (!c) return;
    const doel = bakken.querySelector(`[data-bak="${bak}"]`);
    if (bak === c.bak) {
      combo++; comboEl.textContent = combo >= 3 ? 'reeks × ' + combo : '';
      geefXP(Math.min(2 + combo, 6), doel);
      doel.querySelector('.bak-in').append(h('span', { class: 'bak-chip', html: (c.org ? `<svg viewBox="0 0 100 100" aria-hidden="true">${icoon(c.org)}</svg>` : '') + c.t }));
      zeg(fb, 'goed', '<b>Klopt.</b> ' + (c.w || ''));
      k++; toon();
    } else {
      combo = 0; comboEl.textContent = '';
      doel.classList.remove('schud'); void doel.offsetWidth; doel.classList.add('schud');
      zeg(fb, 'fout', '<b>Nog niet.</b> ' + (c.fout || c.w || 'Kijk nog eens naar de definitie.'));
      spot(c.mis);
    }
  }
  pod.append(h('div', { class: 'vis' }, p.vraag ? h('div', { class: 'vraag', style: 'margin:0', html: p.vraag }) : null, teller, plek, bakken, comboEl, fb));
  toon();
};

/* =========================================================================
   KETTING (procesketting): tik (of sleep) de stappen in de goede volgorde.
   p.items: [{id, naam, org?, label?, waarom}] in de JUISTE volgorde.
   p.pijl: tekst bij de pijl ; p.ring: true = kringloop (pijl terug naar 1).
   Fout = uitleg over oorzaak en gevolg (item.waarom), nooit alleen een kruis.
   ========================================================================= */
VIS.ketting = (pod, p, api) => {
  const n = p.items.length; let gelegd = 0;
  const fb = feedbackEl();
  const keten = h('ol', { class: 'keten' + (p.ring ? ' ring' : '') });
  const slots = p.items.map((it, k) => {
    const s = h('li', { class: 'schakel-slot', 'data-slot': k }, h('span', { class: 'slot-nr' }, String(k + 1)), h('span', { class: 'slot-leeg' }, k === 0 ? (p.eerste || 'Wat komt eerst?') : '…'));
    keten.append(s);
    if (k < n - 1) keten.append(h('li', { class: 'pijl-tussen', 'aria-hidden': 'true' }, h('span', {}, '↓ ' + (p.pijl || ''))));
    return s;
  });
  if (p.ring) keten.append(h('li', { class: 'pijl-terug', 'aria-hidden': 'true' }, h('span', {}, '↺ ' + (p.terug || 'en weer terug naar 1'))));
  const lade = h('div', { class: 'lade' });
  shuffle(p.items).forEach(it => {
    const el = kaartje(it.org, it.naam);
    el.dataset.id = it.id;
    sleepbaar(el, { vind: (x, y) => onder(x, y, '[data-slot]'), opDrop: () => probeer(it, el), opTik: () => probeer(it, el) });
    lade.append(el);
  });
  function probeer(it, el) {
    if (el.disabled) return;
    const juist = p.items[gelegd];
    if (it.id === juist.id) {
      const s = slots[gelegd]; s.innerHTML = '';
      s.append(h('span', { class: 'slot-nr' }, String(gelegd + 1)), h('span', { class: 'slot-ic', html: it.org ? `<svg viewBox="0 0 100 100" aria-hidden="true">${icoon(it.org)}</svg>` : '' }), h('span', { class: 'slot-t' }, h('b', { html: it.naam }), it.label ? h('small', { html: it.label }) : null));
      s.classList.add('gevuld'); el.disabled = true; el.classList.add('weg');
      if (gelegd > 0) keten.children[gelegd * 2 - 1].classList.add('aan');
      zeg(fb, 'goed', '<b>Ja.</b> ' + (it.goed || it.waarom || ''));
      geefXP(3, s);
      gelegd++;
      if (gelegd === n) { if (p.ring) keten.querySelector('.pijl-terug').classList.add('aan'); lade.remove(); api.klaar(p.na); }
    } else {
      el.classList.remove('schud'); void el.offsetWidth; el.classList.add('schud');
      zeg(fb, 'fout', `<b>Nog niet.</b> ${it.waarom}` + (gelegd ? '' : ''));
      spot(it.mis || p.mis);
    }
  }
  pod.append(h('div', { class: 'vis' }, keten, h('div', { class: 'hint', style: 'margin-top:4px' }, p.lade || 'Tik de kaart die nu aan de beurt is, of sleep hem naar de lege plek.'), lade, fb));
};

/* =========================================================================
   VOEDSELWEB: tik een soort en zie wat hij eet (groen) en wie hem eet (oranje).
   p.soorten: [{id, org, naam, x, y}] (viewBox 320 x 260) ; p.eten: [[prooi, eter], ...]
   ========================================================================= */
VIS.voedselweb = (pod, p, api) => {
  const W = 320, H = 260, R = 26, gezien = new Set();
  const svg = sv('svg', { viewBox: `0 0 ${W} ${H}`, class: 'svgvis', role: 'img', 'aria-label': 'Voedselweb' });
  svg.innerHTML = `<defs><marker id="pw-pijl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10Z" fill="context-stroke"/></marker></defs><rect width="${W}" height="${H}" rx="16" fill="url(#g-lucht)" opacity=".7"/>`;
  const pos = Object.fromEntries(p.soorten.map(s => [s.id, s]));
  const lijnen = p.eten.map(([a, b]) => {
    const A = pos[a], B = pos[b], dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy);
    const l = sv('line', { x1: A.x + dx / L * R, y1: A.y + dy / L * R, x2: B.x - dx / L * (R + 3), y2: B.y - dy / L * (R + 3), stroke: '#9A8A94', 'stroke-width': 2.2, 'marker-end': 'url(#pw-pijl)', opacity: .55 });
    l.dataset.a = a; l.dataset.b = b; svg.append(l); return l;
  });
  const info = h('div', { class: 'groot', style: 'font-size:1.05rem' }, 'Tik op een soort.');
  p.soorten.forEach(s => {
    const g = sv('g', { class: 'web-knoop', tabindex: 0, role: 'button', 'aria-label': s.naam, transform: `translate(${s.x} ${s.y})` });
    g.innerHTML = `<circle r="${R + 2}" fill="var(--surface)" stroke="var(--line)" stroke-width="2"/><g transform="translate(-${R} -${R}) scale(${R * 2 / 100})">${icoon(s.org)}</g><text y="${R + 15}" text-anchor="middle" font-size="12" style="fill:var(--ink)">${s.naam}</text>`;
    const kies = () => {
      gezien.add(s.id);
      svg.querySelectorAll('.web-knoop').forEach(k => k.classList.toggle('aan', k === g));
      const eet = [], eters = [];
      lijnen.forEach(l => {
        const isEet = l.dataset.b === s.id, isEter = l.dataset.a === s.id;
        l.setAttribute('stroke', isEet ? '#1F9E72' : isEter ? '#EA580C' : '#9A8A94');
        l.setAttribute('opacity', isEet || isEter ? 1 : .15); l.setAttribute('stroke-width', isEet || isEter ? 3.5 : 2);
        if (isEet) eet.push(pos[l.dataset.a].naam); if (isEter) eters.push(pos[l.dataset.b].naam);
      });
      info.innerHTML = `<b>${s.naam}</b><small><span style="color:var(--ok)">eet: ${eet.length ? eet.join(', ') : 'niemand, maakt zelf voedsel (producent)'}</span><br><span style="color:var(--brand)">wordt gegeten door: ${eters.length ? eters.join(', ') : 'niemand hier'}</span></small>`;
      if (gezien.size >= (p.min || 3)) api.klaar(p.na);
    };
    g.addEventListener('click', kies); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); kies(); } });
    svg.append(g);
  });
  pod.append(h('div', { class: 'vis' }, svg, h('div', { class: 'minis' }, 'Pijl = "wordt gegeten door". Hij wijst naar wie eet.'), info));
};

/* =========================================================================
   OPHOPING (accumulatie): eerst voorspellen, dan schakel voor schakel eten.
   p.keten: [{org, naam}] ; p.per: hoeveel van de vorige schakel er één eet.
   Elk bolletje = één eenheid gif die het lichaam niet kwijtraakt.
   ========================================================================= */
VIS.ophoping = (pod, p, api) => {
  const K = p.keten, per = p.per || 10;
  let stap = 0, voorspeld = null;
  const rijen = K.map((s, i) => {
    const meter = h('div', { class: 'gif-meter' }), getal = h('b', { class: 'gif-getal' }, i === 0 ? '1' : '?');
    const r = h('div', { class: 'gif-rij' + (i === 0 ? ' aan' : '') }, h('span', { class: 'bk-ic', html: `<svg viewBox="0 0 100 100" aria-hidden="true">${icoon(s.org)}</svg>` }),
      h('div', { class: 'gif-tx' }, h('span', {}, s.naam, i > 0 ? h('small', {}, ` eet ${per} ${K[i - 1].meer || K[i - 1].naam.toLowerCase()}`) : h('small', {}, ' neemt gif op uit het water')), meter), getal);
    r._meter = meter; r._getal = getal; return r;
  });
  const teken = (r, n) => {
    r._meter.innerHTML = '';
    const honderd = Math.floor(n / 100), rest = n % 100;
    for (let i = 0; i < honderd; i++) r._meter.append(h('i', { class: 'gif-blok', title: '100' }));
    for (let i = 0; i < Math.min(rest, 100); i++) r._meter.append(h('i', { class: 'gif-bol' }));
    r._getal.textContent = n.toLocaleString('nl-NL');
  };
  teken(rijen[0], 1);
  const fb = feedbackEl();
  const eetKnop = h('button', { class: 'knop klein', type: 'button', disabled: true, onclick: eet }, 'Laat de volgende eten');
  const voorspel = h('div', { class: 'voorspel' }, h('div', { class: 'minis' }, 'Eerst voorspellen: wie heeft straks het meeste gif in zijn lijf?'),
    h('div', { class: 'chips' }, K.map((s, i) => h('button', { class: 'chip', type: 'button', onclick: e => { voorspeld = i; voorspel.querySelectorAll('.chip').forEach(c => c.classList.toggle('aan', c === e.currentTarget)); eetKnop.disabled = false; zeg(fb, 'info', 'Vastgezet. Laat ze nu eten en kijk of je gelijk had.'); } }, s.naam))));
  function eet() {
    stap++; const n = per ** stap; const r = rijen[stap];
    r.classList.add('aan'); teken(r, n);
    zeg(fb, 'info', `<b>${K[stap].naam}</b> eet ${per} × ${K[stap - 1].naam.toLowerCase()}. Het gif van al die prooien blijft in zijn lijf: ${per} × ${(per ** (stap - 1)).toLocaleString('nl-NL')} = <b>${n.toLocaleString('nl-NL')}</b>.`);
    if (stap === K.length - 1) {
      eetKnop.remove();
      const goed = voorspeld === K.length - 1;
      zeg(fb, goed ? 'goed' : 'fout', (goed ? '<b>Goed voorspeld!</b> ' : `<b>Je dacht ${K[voorspeld].naam}.</b> `) + `De <b>${K[stap].naam.toLowerCase()}</b> aan het eind van de keten heeft ${n.toLocaleString('nl-NL')} keer zoveel gif als één alg. Hij eet het gif niet "extra", hij raakt het alleen nooit kwijt. Dat heet <b>accumulatie</b>.`);
      if (!goed && p.mis) spot(p.mis);
      api.klaar(p.na);
    }
  }
  pod.append(h('div', { class: 'vis' }, voorspel, h('div', { class: 'gif-lijst' }, rijen), h('div', { class: 'gif-legenda' }, h('span', {}, h('i', { class: 'gif-bol' }), '= 1 eenheid gif'), h('span', {}, h('i', { class: 'gif-blok' }), '= 100')), eetKnop, fb));
};

/* =========================================================================
   BIOMASSA: een dier opdelen in water, botten en energierijke stoffen.
   p.org, p.naam, p.massa (g), p.delen: [{id, naam, pct, energie:bool, kleur}]
   ========================================================================= */
VIS.biomassa = (pod, p, api) => {
  const weg = new Set();
  const balk = h('div', { class: 'massa-balk' });
  const tekst = h('div', { class: 'groot', style: 'font-size:1.1rem' });
  const knoppen = h('div', { class: 'chips' });
  const totaal = p.massa;
  function teken() {
    balk.innerHTML = '';
    p.delen.forEach(d => balk.append(h('div', { class: 'massa-deel' + (weg.has(d.id) ? ' weg' : ''), style: `flex:${d.pct};background:${d.kleur}` }, h('span', {}, d.naam + ' ' + d.pct + '%'))));
    const over = p.delen.filter(d => !weg.has(d.id));
    const g = Math.round(totaal * over.reduce((s, d) => s + d.pct, 0) / 100);
    const alleenEnergie = over.every(d => d.energie);
    tekst.innerHTML = alleenEnergie ? `Over: <b>${g} gram</b> energierijke stoffen. Dat is de <b>biomassa</b>.<small>De massa was ${totaal} gram. Biomassa is altijd lager dan de massa.</small>` : `Massa nu: <b>${g} gram</b><small>Haal weg wat geen energierijke stof is.</small>`;
    if (alleenEnergie) api.klaar(p.na);
  }
  p.delen.filter(d => !d.energie).forEach(d => knoppen.append(h('button', { class: 'chip', type: 'button', onclick: e => { weg.add(d.id); e.currentTarget.disabled = true; e.currentTarget.classList.add('gedaan'); teken(); } }, d.knop || ('Haal ' + d.naam.toLowerCase() + ' weg'))));
  pod.append(h('div', { class: 'vis' }, h('div', { class: 'massa-dier', html: `<svg viewBox="0 0 100 100" aria-hidden="true">${icoon(p.org)}</svg>` }), h('div', { class: 'minis' }, `${p.naam}: ${totaal} gram (voorbeeld)`), balk, knoppen, tekst));
  teken();
};

/* =========================================================================
   POPULATIESIM: vossen en konijnen over 40 jaar, met schuifjes.
   Model: konijnen groeien tot het gras op is (K), vossen eten konijnen,
   vossen sterven zonder voedsel. Evenwicht: konijnen rond 200.
   p.schuif: welke schuifjes ; klaar na p.min keer afspelen met een andere instelling.
   ========================================================================= */
VIS.populatiesim = (pod, p, api) => {
  const P = { a: .5, b: .01, c: .2, d: .4 };
  let st = { R: p.konijnen ?? 80, F: p.vossen ?? 10, K: p.gras ?? 800 }, gespeeld = 0, laatste = '', zonderVos = false, timer = null;
  const sim = (R, F, K, n = 40) => { const uit = []; for (let t = 0; t < n; t++) { uit.push([R, F]); const eat = P.b * R * F; const R2 = Math.max(0, R + P.a * R * (1 - R / K) - eat); const F2 = Math.max(0, F + P.c * eat - P.d * F); R = R2; F = F2; } return uit; };
  const W = 320, H = 108, L = 34;
  const kaart = (titel, kleur, max) => { const s = sv('svg', { viewBox: `0 0 ${W} ${H}`, class: 'svgvis grafiek', role: 'img', 'aria-label': titel }); s._max = max; s._kleur = kleur; s._titel = titel; return s; };
  const gK = kaart('Konijnen', '#A9733F', 900), gV = kaart('Vossen', '#EA580C', 120);
  function tekenGrafiek(s, data, eq, n) {
    const max = s._max, x = t => L + t * (W - L - 8) / 39, y = v => H - 18 - Math.min(v, max) / max * (H - 30);
    let d = ''; data.slice(0, n).forEach((v, t) => d += (t ? 'L' : 'M') + x(t).toFixed(1) + ' ' + y(v).toFixed(1));
    s.innerHTML = `<rect x="${L}" y="6" width="${W - L - 8}" height="${H - 24}" rx="8" style="fill:var(--bg)"/>` +
      [0, .5, 1].map(f => `<text x="${L - 6}" y="${y(max * f) + 4}" text-anchor="end" font-size="10" style="fill:var(--ink-soft)">${Math.round(max * f)}</text>`).join('') +
      (eq != null ? `<path d="M${L} ${y(eq)} H${W - 8}" stroke="${s._kleur}" stroke-dasharray="5 4" stroke-width="1.5" opacity=".6"/><text x="${W - 10}" y="${y(eq) - 4}" text-anchor="end" font-size="10" fill="${s._kleur}">evenwichtswaarde ≈ ${Math.round(eq)}</text>` : '') +
      `<path d="${d}" stroke="${s._kleur}" stroke-width="3" fill="none" stroke-linejoin="round" stroke-linecap="round"/>` +
      `<text x="${L + 6}" y="20" font-size="12" fill="${s._kleur}">${s._titel}: ${Math.round(data[Math.max(0, n - 1)])}</text><text x="${W - 10}" y="${H - 4}" text-anchor="end" font-size="10" style="fill:var(--ink-soft)">jaar ${n}</text>`;
  }
  const uitleg = h('div', { class: 'feedback info' });
  const schuif = (label, sleutel, min, max, stap, fmtW) => {
    const out = h('output', {}, fmtW ? fmtW(st[sleutel]) : st[sleutel]);
    const inp = h('input', { type: 'range', min, max, step: stap, value: st[sleutel], 'aria-label': label });
    inp.addEventListener('input', () => { st[sleutel] = +inp.value; out.textContent = fmtW ? fmtW(st[sleutel]) : st[sleutel]; });
    return h('div', { class: 'schuif' }, h('label', {}, label), inp, out);
  };
  const grasNaam = v => v < 600 ? 'weinig' : v < 760 ? 'normaal' : 'veel';
  const schuiven = h('div', { class: 'vis', style: 'gap:6px' },
    (p.schuif || ['konijnen', 'vossen', 'gras']).map(k => k === 'konijnen' ? schuif('Konijnen bij start', 'R', 30, 250, 10) : k === 'vossen' ? schuif('Vossen bij start', 'F', 4, 40, 1) : schuif('Gras', 'K', 500, 850, 50, grasNaam)));
  const speelKnop = h('button', { class: 'knop klein', type: 'button', onclick: () => speel(false) }, 'Speel 40 jaar af');
  const wegKnop = p.zonderVos === false ? null : h('button', { class: 'knop klein zacht', type: 'button', onclick: () => speel(true) }, 'Wat als alle vossen weg zijn?');
  function speel(geenVos) {
    clearInterval(timer);
    zonderVos = geenVos;
    const data = sim(st.R, geenVos ? 0 : st.F, st.K);
    const R = data.map(x => x[0]), F = data.map(x => x[1]);
    const eqR = geenVos ? null : P.d / (P.c * P.b), eqF = geenVos ? null : P.a * (1 - eqR / st.K) / P.b;
    let n = 1; const stapje = () => { tekenGrafiek(gK, R, eqR, n); tekenGrafiek(gV, F, eqF, n); };
    if (minderBeweging()) { n = 40; stapje(); } else timer = setInterval(() => { n++; stapje(); if (n >= 40) clearInterval(timer); }, 45);
    stapje();
    const sleutel = [st.R, st.F, st.K, geenVos].join('/');
    if (sleutel !== laatste) { gespeeld++; laatste = sleutel; }
    if (geenVos) uitleg.innerHTML = `<b>Zonder vossen</b> groeien de konijnen tot het <b>gras</b> de grens bepaalt (${Math.round(R[39])}). Geen schommeling meer: er is maar één soort die de ander remt, en dat is nu het voedsel.`;
    else uitleg.innerHTML = `Zie je de golven? <b>Veel konijnen</b> → vossen hebben veel voedsel → <b>meer vossen</b> → er worden meer konijnen gegeten → <b>minder konijnen</b> → vossen krijgen honger → <b>minder vossen</b> → konijnen groeien weer. Ze <b>schommelen om een bepaalde waarde</b>: biologisch evenwicht.`;
    if (gespeeld >= (p.min || 2)) api.klaar(p.na);
  }
  pod.append(h('div', { class: 'vis' }, gK, gV, schuiven, h('div', { class: 'vis-knoppen' }, speelKnop, wegKnop), uitleg));
  tekenGrafiek(gK, [st.R], null, 1); tekenGrafiek(gV, [st.F], null, 1);
  uitleg.innerHTML = 'Stel de schuifjes in en druk op <b>Speel 40 jaar af</b>. Probeer daarna een andere instelling.';
  return () => clearInterval(timer);
};

/* =========================================================================
   KOPPEL: één plaatje tegelijk, kies het goede begrip.
   p.items: [{beeld (svg 0 0 200 120), goed, w, fout:{label: uitleg}, mis}] ; p.labels
   ========================================================================= */
VIS.koppel = (pod, p, api) => {
  const rij = p.vast ? p.items.slice() : shuffle(p.items); let k = 0;
  const beeld = h('div', { class: 'koppel-beeld' }), wat = h('div', { class: 'groot', style: 'font-size:1.05rem' }), teller = h('div', { class: 'minis' });
  const fb = feedbackEl();
  const chips = h('div', { class: 'chips' }, p.labels.map(l => h('button', { class: 'chip', type: 'button', onclick: e => kies(l, e.currentTarget) }, l)));
  function toon() {
    if (k >= rij.length) { beeld.innerHTML = ''; wat.innerHTML = 'Alles gekoppeld!'; teller.textContent = ''; chips.remove(); api.klaar(p.na); return; }
    const it = rij[k];
    beeld.innerHTML = `<svg viewBox="0 0 200 120" class="svgvis" role="img" aria-label="${it.alt || ''}">${it.beeld}</svg>`;
    wat.innerHTML = it.tekst || ''; teller.textContent = `Plaatje ${k + 1} van ${rij.length}`;
    chips.querySelectorAll('.chip').forEach(c => { c.disabled = false; c.classList.remove('fout', 'gedaan'); });
  }
  function kies(l, b) {
    const it = rij[k]; if (!it) return;
    if (l === it.goed) { b.classList.add('gedaan'); geefXP(3, b); zeg(fb, 'goed', `<b>${l}.</b> ${it.w}`); k++; setTimeout(toon, minderBeweging() ? 0 : 650); }
    else { b.classList.add('fout'); b.disabled = true; zeg(fb, 'fout', `<b>Niet ${l.toLowerCase()}.</b> ${it.fout?.[l] || 'Lees de definitie nog eens.'}`); spot(it.mis); }
  }
  pod.append(h('div', { class: 'vis' }, teller, beeld, wat, chips, fb));
  toon();
};

/* =========================================================================
   SYMBIOMETER: per duo zelf instellen: voordeel (+), niets (0) of nadeel (−).
   p.duos: [{a, b, orgA, orgB, A:'+', B:'-', w}] ; daarna verschijnt de vorm.
   ========================================================================= */
VIS.symbiometer = (pod, p, api) => {
  const VORM = { '++': 'Mutualisme', '+0': 'Commensalisme', '0+': 'Commensalisme', '+-': 'Parasitisme', '-+': 'Parasitisme' };
  const rij = p.duos.slice(); let k = 0;
  const vak = h('div', { class: 'duo-vak' }), fb = feedbackEl(), teller = h('div', { class: 'minis' });
  const keus = { A: null, B: null };
  const meter = (kant, naam, org) => h('div', { class: 'duo-kant' }, h('div', { class: 'duo-ic', html: `<svg viewBox="0 0 100 100" aria-hidden="true">${icoon(org)}</svg>` }), h('b', {}, naam),
    h('div', { class: 'tri' }, [['+', 'voordeel'], ['0', 'niets'], ['-', 'nadeel']].map(([w, l]) => h('button', { class: 'chip tri-' + (w === '-' ? 'min' : w === '+' ? 'plus' : 'nul'), type: 'button', 'data-k': kant, 'data-w': w, 'aria-label': naam + ': ' + l, onclick: e => { keus[kant] = w; e.currentTarget.parentNode.querySelectorAll('.chip').forEach(c => c.classList.toggle('aan', c === e.currentTarget)); check.disabled = !(keus.A && keus.B); } }, (w === '-' ? '−' : w) + ' ' + l))));
  const check = h('button', { class: 'knop klein', type: 'button', disabled: true, onclick: controleer }, 'Check');
  function toon() {
    vak.innerHTML = ''; keus.A = keus.B = null; check.disabled = true;
    if (k >= rij.length) { const t = w => w === '-' ? '−' : w; vak.append(h('div', { class: 'groot' }, 'Alle duo\'s ingedeeld!'), h('div', { class: 'duo-som' }, rij.map(d => h('div', {}, h('span', { class: 'ds-ic', html: `<svg viewBox="0 0 100 100" aria-hidden="true">${icoon(d.orgA)}</svg><svg viewBox="0 0 100 100" aria-hidden="true">${icoon(d.orgB)}</svg>` }), h('b', {}, d.a + ' + ' + d.b), h('small', {}, t(d.A) + ' ' + t(d.B) + ' · ' + VORM[d.A + d.B]))))); check.remove(); teller.textContent = ''; api.klaar(p.na); return; }
    const d = rij[k]; teller.textContent = `Duo ${k + 1} van ${rij.length}`;
    vak.append(h('div', { class: 'duo-uitleg', html: d.tekst || '' }), h('div', { class: 'duo-kanten' }, meter('A', d.a, d.orgA), meter('B', d.b, d.orgB)));
  }
  function controleer() {
    const d = rij[k];
    if (keus.A === d.A && keus.B === d.B) {
      const vorm = VORM[d.A + d.B]; geefXP(4, check);
      zeg(fb, 'goed', `<b>${d.A === '-' ? '−' : d.A} en ${d.B === '-' ? '−' : d.B}: ${vorm}.</b> ${d.w}`);
      k++; setTimeout(toon, minderBeweging() ? 0 : 900);
    } else {
      const fouteKant = keus.A !== d.A ? 'A' : 'B';
      zeg(fb, 'fout', `<b>Kijk nog eens naar ${fouteKant === 'A' ? d.a : d.b}.</b> ${d.fout?.[fouteKant] || d.w}`);
      spot(d.mis);
    }
  }
  pod.append(h('div', { class: 'vis' }, teller, vak, check, fb));
  toon();
};

/* =========================================================================
   CELDELING: zelf kopiëren en verdelen (gewone celdeling) of de paren verdelen (meiose).
   p.modus: 'deling' | 'meiose' ; p.paren: aantal chromosomenparen (2 of 3).
   Elk paar: één van moeder (licht) en één van vader (donker), zelfde lengte.
   ========================================================================= */
VIS.celdeling = (pod, p, api) => {
  const PK = [['#F49A6A', '#C9551F', 46], ['#7CC8EE', '#2F7FB8', 34], ['#9BEA9E', '#1F9E72', 24]].slice(0, p.paren || 2);
  let fase = 'start';
  const svg = sv('svg', { viewBox: '0 0 320 190', class: 'svgvis', role: 'img', 'aria-label': p.modus === 'meiose' ? 'Meiose' : 'Celdeling' });
  const telling = h('div', { class: 'check' }), fb = feedbackEl();
  const chrom = (x, y, len, kleur, dubbel) => dubbel
    ? `<g transform="translate(${x} ${y})"><rect x="-7" y="${-len / 2}" width="6" height="${len}" rx="3" fill="${kleur}"/><rect x="1" y="${-len / 2}" width="6" height="${len}" rx="3" fill="${kleur}"/><circle cx="0" cy="0" r="3.2" fill="#3D1B33"/></g>`
    : `<rect x="${x - 3}" y="${y - len / 2}" width="6" height="${len}" rx="3" fill="${kleur}"/>`;
  const cel = (cx, cy, r, inhoud, label) => `<g><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#g-cel)" stroke="#D98A5A" stroke-width="2.5" filter="url(#f-schaduw)"/><circle cx="${cx}" cy="${cy}" r="${r * .62}" fill="url(#g-kern)" opacity=".45"/>${inhoud}${label ? `<text x="${cx}" y="${cy + r + 16}" text-anchor="middle" font-size="12" style="fill:var(--ink)">${label}</text>` : ''}</g>`;
  const setje = (cx, cy, kopie, welke = 'alle') => {
    let s = '', i = 0;
    PK.forEach(([m, v, len]) => { [m, v].forEach((k, j) => { if (welke === 'alle' || welke === j) { s += chrom(cx - (PK.length * 2 - 1) * 8 + i * 16, cy, len, k, kopie); i++; } }); });
    return s;
  };
  const N = PK.length * 2;
  function teken() {
    if (fase === 'start') svg.innerHTML = cel(160, 82, 66, setje(160, 82, false), p.modus === 'meiose' ? 'cel in de eierstok of zaadbal' : 'lichaamscel');
    if (fase === 'gekopieerd') svg.innerHTML = cel(160, 82, 66, setje(160, 82, true), 'elk chromosoom is gekopieerd');
    if (fase === 'klaar' && p.modus !== 'meiose') svg.innerHTML = cel(78, 82, 58, setje(78, 82, false), 'dochtercel') + cel(242, 82, 58, setje(242, 82, false), 'dochtercel') + `<path d="M140 82 H180" stroke="#9A8A94" stroke-width="2" stroke-dasharray="4 3"/>`;
    if (fase === 'klaar' && p.modus === 'meiose') svg.innerHTML = cel(78, 82, 52, setjeMeiose(78, 0), 'geslachtscel') + cel(242, 82, 52, setjeMeiose(242, 1), 'geslachtscel');
    if (fase === 'helft') svg.innerHTML = cel(78, 82, 58, setjeMeiose(78, 0), 'dochtercel?') + cel(242, 82, 58, setjeMeiose(242, 1), 'dochtercel?') + `<text x="160" y="182" text-anchor="middle" font-size="12" fill="#DB5A4A">elke cel mist de helft!</text>`;
  }
  /* bij meiose gaat van elk paar één naar links en één naar rechts (welke, mag per paar verschillen) */
  let verdeling = PK.map(() => Math.random() < .5 ? 0 : 1);
  function setjeMeiose(cx, kant) { let s = '', i = 0; PK.forEach(([m, v, len], pi) => { const k = (verdeling[pi] === kant) ? m : v; s += chrom(cx - (PK.length - 1) * 9 + i * 18, 82, len, k, false); i++; }); return s; }
  const kopKnop = h('button', { class: 'knop klein', type: 'button', onclick: () => { if (fase !== 'start') return; fase = 'gekopieerd'; teken(); telling.innerHTML = `Nog steeds één cel, maar elk chromosoom heeft nu een kopie (X-vorm).`; zeg(fb, 'info', 'Mooi. Nu kan elke dochtercel een complete set krijgen.'); kopKnop.disabled = true; } }, 'Kopieer alle chromosomen');
  const trekKnop = h('button', { class: 'knop klein', type: 'button', onclick: trek }, p.modus === 'meiose' ? 'Verdeel de paren' : 'Deel de cel');
  function trek() {
    if (p.modus === 'meiose') {
      fase = 'klaar'; teken(); trekKnop.disabled = true;
      telling.innerHTML = `Begin: <b>${N}</b> chromosomen (${PK.length} paren) → elke geslachtscel: <b>${PK.length}</b>, van elk paar één (enkelvoudig).`;
      zeg(fb, 'goed', `<b>Meiose.</b> De paren zijn <b>verdeeld</b> over twee cellen: elke geslachtscel heeft de <b>helft</b>. Bij een mens: 46 → 23.`);
      api.klaar(p.na); return;
    }
    if (fase === 'start') {
      fase = 'helft'; teken();
      zeg(fb, 'fout', '<b>Oei.</b> Zonder eerst te kopiëren krijgt elke dochtercel maar de <b>helft</b> van de chromosomen. Dan mist er informatie. Daarom: <b>eerst kopiëren</b>, dan delen.');
      spot(p.misHelft);
      setTimeout(() => { fase = 'start'; teken(); telling.innerHTML = 'Probeer het opnieuw: eerst kopiëren.'; }, minderBeweging() ? 400 : 2200);
      return;
    }
    fase = 'klaar'; teken(); trekKnop.disabled = true;
    telling.innerHTML = `Moedercel: <b>${N}</b> chromosomen → elke dochtercel: <b>${N}</b>. <b>Precies dezelfde.</b>`;
    zeg(fb, 'goed', '<b>Celdeling.</b> Uit één lichaamscel zijn <b>twee dezelfde</b> nieuwe cellen gekomen: de <b>dochtercellen</b>. Dat woord heeft niets met meisjes te maken: ook bij een jongen of een man heten ze zo.');
    api.klaar(p.na);
  }
  pod.append(h('div', { class: 'vis' }, svg, telling, h('div', { class: 'vis-knoppen' }, p.modus === 'meiose' ? null : kopKnop, trekKnop), fb));
  teken(); telling.innerHTML = `Deze cel heeft <b>${N}</b> chromosomen: ${PK.length} paren (licht = van moeder, donker = van vader).`;
};

/* =========================================================================
   PAREN: zoek de chromosomenparen (zelfde lengte en kleur), daarna
   lichaamscel ↔ geslachtscel en het geslachtspaar (XX of XY).
   ========================================================================= */
VIS.paren = (pod, p, api) => {
  const PAAR = [['#E0602A', 70, 'A'], ['#2F7FB8', 56, 'B'], ['#1F9E72', 44, 'C'], ['#C9A010', 32, 'D']];
  const geslacht = p.geslacht || 'XY';
  const stukken = [];
  PAAR.forEach(([k, len, id]) => { stukken.push({ id, k, len, van: 'moeder' }, { id, k, len, van: 'vader' }); });
  stukken.push({ id: 'X', k: '#D96A9A', len: 52, van: 'moeder', letter: 'X' }, { id: geslacht === 'XY' ? 'XY' : 'X', k: geslacht === 'XY' ? '#5E2750' : '#D96A9A', len: geslacht === 'XY' ? 22 : 52, van: 'vader', letter: geslacht[1] });
  let gekozen = null, gepaard = 0;
  const totPaar = PAAR.length + 1;
  const veld = h('div', { class: 'chrom-veld' }), rijen = h('div', { class: 'chrom-rijen' }), fb = feedbackEl(), telling = h('div', { class: 'check' });
  const pil = (s) => h('button', { class: 'chrom-pil', type: 'button', 'aria-label': `chromosoom ${s.letter || ''} lengte ${s.len}`, style: `height:${s.len + 14}px`, html: `<svg viewBox="0 0 20 ${s.len + 10}" width="20" height="${s.len + 10}" aria-hidden="true"><rect x="3" y="2" width="14" height="${s.len + 6}" rx="7" fill="${s.k}" stroke="${s.van === 'vader' ? '#3D1B33' : '#fff'}" stroke-width="1.5"/><path d="M3 ${s.len * .3} H17 M3 ${s.len * .6} H17" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>${s.letter ? `<text x="10" y="${s.len / 2 + 10}" text-anchor="middle" font-size="11" fill="#fff">${s.letter}</text>` : ''}</svg>` });
  shuffle(stukken).forEach(s => {
    const b = pil(s); b._s = s;
    b.addEventListener('click', () => {
      if (b.disabled) return;
      if (!gekozen) { gekozen = b; b.classList.add('aan'); return; }
      if (gekozen === b) { b.classList.remove('aan'); gekozen = null; return; }
      const a = gekozen._s, c = s;
      const zelfde = (a.id === c.id) || (['X', 'XY'].includes(a.id) && ['X', 'XY'].includes(c.id) && a.van !== c.van);
      if (zelfde && a.van !== c.van) {
        [gekozen, b].forEach(x => { x.disabled = true; x.classList.remove('aan'); x.classList.add('weg'); });
        const isG = ['X', 'XY'].includes(a.id);
        rijen.append(h('div', { class: 'chrom-paar' + (isG ? ' gesl' : '') }, pil(a.van === 'moeder' ? a : c), pil(a.van === 'moeder' ? c : a), h('small', {}, isG ? (geslacht === 'XY' ? 'XY: jongen' : 'XX: meisje') : 'paar ' + (gepaard + 1))));
        gepaard++; geefXP(2, b);
        zeg(fb, 'goed', isG ? `<b>Het geslachtspaar.</b> ${geslacht === 'XY' ? 'X van moeder, Y van vader: een <b>jongen</b>. Let op: ook een jongen krijgt een chromosoom van zijn moeder (de X).' : 'X van moeder en X van vader: een <b>meisje</b>.'}` : '<b>Een paar.</b> Zelfde lengte, zelfde genen: één van moeder, één van vader.');
        if (gepaard === totPaar) klaarMetParen();
      } else {
        zeg(fb, 'fout', a.van === c.van && a.id === c.id ? '<b>Bijna.</b> Een paar is één van <b>moeder</b> (lichte rand) en één van <b>vader</b> (donkere rand).' : '<b>Geen paar.</b> De twee van een paar zijn even lang en hebben dezelfde genen.');
        gekozen.classList.remove('aan');
      }
      gekozen = null;
    });
    veld.append(b);
  });
  let modus = 'lichaam';
  const wissel = h('div', { class: 'chips', hidden: true }, ['lichaamscel', 'geslachtscel'].map(m => h('button', { class: 'chip', type: 'button', onclick: e => { modus = m; wissel.querySelectorAll('.chip').forEach(c => c.classList.toggle('aan', c === e.currentTarget)); toonModus(); } }, m)));
  const gezienModus = new Set();
  function toonModus() {
    gezienModus.add(modus);
    rijen.querySelectorAll('.chrom-paar').forEach(pr => { const pils = pr.querySelectorAll('.chrom-pil'); pils[1].style.display = modus === 'geslachtscel' ? 'none' : ''; });
    telling.innerHTML = modus === 'geslachtscel' ? `Geslachtscel: van elk paar maar <b>één</b> (enkelvoudig): <b>${totPaar}</b> chromosomen. Dat mag oneven zijn. Bij een mens: <b>23</b>.` : `Lichaamscel: <b>${totPaar} paren</b> = <b>${totPaar * 2}</b> chromosomen, altijd een even aantal. Bij een mens: 23 paren = <b>46</b>.`;
    if (gezienModus.size >= 2) api.klaar(p.na);
  }
  function klaarMetParen() { veld.remove(); wissel.hidden = false; zeg(fb, 'info', 'Alle paren gevonden. Schakel nu tussen <b>lichaamscel</b> en <b>geslachtscel</b>.'); modus = 'lichaamscel'; wissel.firstChild.classList.add('aan'); toonModus(); gezienModus.clear(); gezienModus.add('lichaamscel'); }
  pod.append(h('div', { class: 'vis' }, h('div', { class: 'minis' }, 'Tik twee chromosomen die een paar vormen.'), veld, rijen, wissel, telling, fb));
};

/* =========================================================================
   TELLING: waarom meiose nodig is. Generaties met en zonder halveren.
   ========================================================================= */
VIS.telling = (pod, p, api) => {
  const n = p.n || 46; let gen = 0;
  const kolom = (titel, cls) => h('div', { class: 'tel-kolom ' + cls }, h('b', {}, titel), h('div', { class: 'tel-rijen' }));
  const zonder = kolom('Zonder meiose', 'zonder'), met = kolom('Met meiose', 'met');
  const rij = (el, html) => el.querySelector('.tel-rijen').append(h('div', { class: 'tel-rij', html }));
  const fb = feedbackEl();
  let z = n;
  const volgende = h('button', { class: 'knop klein', type: 'button', onclick: () => {
    gen++;
    rij(zonder, `${z} + ${z} = <b>${z * 2}</b>`); z *= 2;
    rij(met, `${n / 2} + ${n / 2} = <b>${n}</b>`);
    if (gen >= 3) { volgende.remove(); zeg(fb, 'goed', `Zonder meiose verdubbelt het aantal chromosomen <b>elke generatie</b>: na drie generaties al ${z}. Met meiose heeft elke geslachtscel de <b>helft</b> (${n / 2}), dus eicel + zaadcel = weer ${n}.`); api.klaar(p.na); }
  } }, 'Volgende generatie (bevruchting)');
  rij(zonder, `geslachtscel: <b>${n}</b>`); rij(met, `geslachtscel: <b>${n / 2}</b>`);
  pod.append(h('div', { class: 'vis' }, h('div', { class: 'tel-wrap' }, zonder, met), volgende, fb));
};

/* =========================================================================
   BASENRITS: maak de DNA-trap af. A past bij T, C past bij G.
   p.streng: bv. 'ATGCCGTA'
   ========================================================================= */
VIS.basenrits = (pod, p, api) => {
  const PAS = { A: 'T', T: 'A', C: 'G', G: 'C' }, KL = { A: '#E0602A', T: '#2F7FB8', C: '#1F9E72', G: '#C9A010' };
  const s = (p.streng || 'ATGCCGTA').split(''); let i = 0, fout = 0;
  const trap = h('div', { class: 'trap' });
  const tredes = s.map((b, k) => { const onderV = h('span', { class: 'base leeg' }, '?'); const t = h('div', { class: 'trede', style: `--x:${Math.round(Math.sin(k * .8) * 14)}px` }, h('span', { class: 'base', style: `background:${KL[b]}` }, b), h('span', { class: 'sport' }), onderV); t._o = onderV; trap.append(t); return t; });
  const fb = feedbackEl();
  const chips = h('div', { class: 'chips' }, 'ATCG'.split('').map(b => h('button', { class: 'chip base-chip', type: 'button', style: `border-color:${KL[b]}`, onclick: e => kies(b, e.currentTarget) }, b)));
  const markeer = () => tredes.forEach((t, k) => t.classList.toggle('nu', k === i));
  function kies(b, el) {
    if (i >= s.length) return;
    if (PAS[s[i]] === b) {
      const o = tredes[i]._o; o.textContent = b; o.classList.remove('leeg'); o.style.background = KL[b]; tredes[i].classList.add('dicht');
      i++; markeer(); zeg(fb, 'goed', `${s[i - 1]} hoort bij <b>${b}</b>.`);
      if (i === s.length) { trap.classList.add('rits-klaar'); chips.remove(); zeg(fb, 'goed', `<b>Rits dicht!</b> Elk basenpaar is A met T of C met G. Daardoor kun je met één kant altijd de andere kant terugbouwen.`); api.klaar(p.na); }
    } else {
      fout++; el.classList.remove('fout'); void el.offsetWidth; el.classList.add('fout');
      zeg(fb, 'fout', `<b>${s[i]} en ${b} passen niet.</b> A koppelt altijd aan T, en C altijd aan G.`); spot(p.mis);
    }
  }
  pod.append(h('div', { class: 'vis' }, trap, h('div', { class: 'minis' }, 'Kies de base die past bij de oplichtende trede.'), chips, fb));
  markeer();
};

/* =========================================================================
   MUTATIELAB: verander één base in het melanine-gen en kijk wat er gebeurt.
   Daarna: waar zit de mutatie? In één huidcel of in een eicel?
   ========================================================================= */
VIS.mutatielab = (pod, p, api) => {
  const GOED = 'TACGGATTC'.split(''); let code = GOED.slice(), plek = null, gemuteerd = false;
  const KL = { A: '#E0602A', T: '#2F7FB8', C: '#1F9E72', G: '#C9A010' }, VOLG = { A: 'C', C: 'G', G: 'T', T: 'A' };
  const genRij = h('div', { class: 'gen-rij' }), eiwit = h('div', { class: 'eiwit' }), dier = h('div', { class: 'mut-dier' }), fb = feedbackEl();
  const plekChips = h('div', { class: 'chips', hidden: true }, [['huidcel', 'in één huidcel'], ['eicel', 'in een eicel (bevruchting)']].map(([id, l]) => h('button', { class: 'chip', type: 'button', onclick: e => { plek = id; plekChips.querySelectorAll('.chip').forEach(c => c.classList.toggle('aan', c === e.currentTarget)); gezienPlek.add(id); tekenDier(); if (gezienPlek.size >= 2) api.klaar(p.na); } }, l)));
  const gezienPlek = new Set();
  function tekenGen() {
    genRij.innerHTML = '';
    code.forEach((b, k) => genRij.append(h('button', { class: 'gen-base' + (b !== GOED[k] ? ' veranderd' : ''), type: 'button', style: `background:${KL[b]}`, 'aria-label': `base ${k + 1}: ${b}, tik om te veranderen`, onclick: () => { code[k] = VOLG[code[k]]; tekenGen(); tekenEiwit(); } }, b)));
  }
  function tekenEiwit() {
    const ok = code.every((b, k) => b === GOED[k]);
    if (!ok && !gemuteerd) { gemuteerd = true; plekChips.hidden = false; zeg(fb, 'info', '<b>Mutatie!</b> De code is veranderd, dus het eiwit wordt niet goed gemaakt: het past niet meer. Kies nu <b>waar</b> de mutatie zit.'); }
    if (ok && gemuteerd) zeg(fb, 'info', 'De code is weer zoals hij was. Verander er nog eens één.');
    eiwit.innerHTML = `<svg viewBox="0 0 300 80" class="svgvis" role="img" aria-label="eiwit ${ok ? 'goed' : 'fout'} gevouwen">` +
      (ok ? `<path d="M20 50 C40 20 70 20 90 40 C110 60 130 60 150 40 L170 40 L170 60 L190 60 L190 40" stroke="#5E2750" stroke-width="10" fill="none" stroke-linecap="round"/><rect x="200" y="30" width="80" height="40" rx="10" fill="#3D1B33"/><path d="M196 40 H210 V60 H196" fill="#5E2750"/><text x="240" y="55" text-anchor="middle" font-size="12" fill="#fff">melanine ✓</text>`
        : `<path d="M20 50 C40 20 70 70 90 30 C110 10 120 70 150 50 L165 30 L175 66 L190 45" stroke="#9A8A94" stroke-width="10" fill="none" stroke-linecap="round"/><rect x="200" y="30" width="80" height="40" rx="10" fill="#E3DCD6"/><text x="240" y="55" text-anchor="middle" font-size="12" fill="#5A4A55">geen melanine</text>`) +
      `<text x="20" y="76" font-size="11" style="fill:var(--ink-soft)">het eiwit dat de code maakt</text></svg>`;
    tekenDier();
  }
  function tekenDier() {
    const ok = code.every((b, k) => b === GOED[k]);
    if (ok || !plek) { dier.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true">${ORG.konijn()}</svg>`; return; }
    if (plek === 'huidcel') { dier.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true">${ORG.konijn()}<circle cx="44" cy="66" r="2.2" fill="#fff" stroke="#EA580C" stroke-width="1"/><circle cx="44" cy="66" r="9" fill="none" stroke="#EA580C" stroke-width="1.5" stroke-dasharray="3 2"/></svg>`; zeg(fb, 'goed', '<b>In één huidcel:</b> die ene cel maakt geen kleurstof, maar alle cellen eromheen werken prima. Je ziet er niks van, en het wordt ook <b>niet</b> doorgegeven aan jongen. Het allel is wel <b>gemuteerd</b>.'); }
    else { dier.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true">${ORG.konijn({ albino: true })}</svg>`; zeg(fb, 'goed', '<b>In een eicel die bevrucht wordt:</b> dan zit de mutatie in <b>alle</b> cellen van het jong. Geen enkele cel maakt melanine: een <b>albino</b>. Omdat je het in het fenotype ziet, is het een <b>mutant</b>.'); }
  }
  pod.append(h('div', { class: 'vis' }, h('div', { class: 'minis' }, 'Het gen voor melanine (kleurstof). Tik op een base om hem te veranderen.'), genRij, eiwit, h('div', { class: 'mut-onder' }, dier, plekChips), fb));
  tekenGen(); tekenEiwit();
};

/* =========================================================================
   WEEFSEL (tumor): cellen delen alleen als het nodig is. Maak een wondje,
   zet daarna de rem uit (mutatie in het gen voor celdeling).
   ========================================================================= */
VIS.weefsel = (pod, p, api) => {
  const C = 10, R = 6; let cellen = [], tik = null, fase = 'rust', gedaan = new Set();
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) cellen.push({ r, c, staat: 'ok' });
  const svg = sv('svg', { viewBox: '0 0 320 230', class: 'svgvis', role: 'img', 'aria-label': 'Huidweefsel van cellen' });
  const fb = feedbackEl();
  const teken = () => {
    let s = `<rect width="320" height="230" rx="14" fill="#FBE6DA"/><path d="M0 196 C80 186 240 206 320 194 V230 H0Z" fill="#E89AA0" opacity=".55"/><text x="10" y="222" font-size="11" fill="#9A3A4A">bloedvat</text>`;
    cellen.forEach(z => { if (z.staat === 'weg') return; const x = 12 + z.c * 30 + (z.dx || 0), y = 12 + z.r * 30 + (z.dy || 0);
      s += `<rect x="${x}" y="${y}" width="27" height="27" rx="7" opacity="${z.staat === 'verdrongen' ? .35 : 1}" fill="${z.staat === 'tumor' ? 'url(#g-tumor)' : z.staat === 'nieuw' ? '#FFE0C2' : 'url(#g-huid)'}" stroke="${z.staat === 'tumor' ? '#A33A55' : '#C97A52'}" stroke-width="1.3"/><circle cx="${x + 13.5}" cy="${y + 13.5}" r="5" fill="url(#g-kern)"/>`; });
    svg.innerHTML = s;
  };
  const buren = z => cellen.filter(o => o.staat === 'weg' && Math.abs(o.r - z.r) + Math.abs(o.c - z.c) === 1);
  const wond = h('button', { class: 'knop klein', type: 'button', onclick: () => {
    if (fase !== 'rust') return; fase = 'wond'; wond.disabled = true;
    cellen.forEach(z => { if (z.r >= 1 && z.r <= 3 && z.c >= 3 && z.c <= 5) z.staat = 'weg'; }); teken();
    zeg(fb, 'info', 'Een wondje. Kijk wat de cellen eromheen doen.');
    tik = setInterval(() => {
      const gat = cellen.filter(z => z.staat === 'weg' && cellen.some(o => o.staat !== 'weg' && Math.abs(o.r - z.r) + Math.abs(o.c - z.c) === 1));
      if (!gat.length) { clearInterval(tik); fase = 'rust'; cellen.forEach(z => { if (z.staat === 'nieuw') z.staat = 'ok'; }); teken(); gedaan.add('wond'); zeg(fb, 'goed', '<b>Dicht. En dan stoppen ze.</b> Cellen delen alleen <b>als het nodig is</b>. Het gen dat de celdeling regelt, zet daarna de <b>rem</b> erop.'); rem.disabled = false; if (gedaan.size >= 2) api.klaar(p.na); return; }
      gat.slice(0, 2).forEach(z => z.staat = 'nieuw'); teken();
    }, minderBeweging() ? 60 : 380);
  } }, 'Maak een wondje');
  const rem = h('button', { class: 'knop klein zacht', type: 'button', disabled: true, onclick: () => {
    if (fase !== 'rust') return; fase = 'tumor'; rem.disabled = true; wond.disabled = true;
    const start = cellen.find(z => z.r === 2 && z.c === 7); start.staat = 'tumor'; teken();
    zeg(fb, 'info', '<b>Mutatie in het allel voor celdeling.</b> Deze ene cel heeft geen rem meer...');
    /* de tumor groeit doordat díe ene cel blijft delen: 1, 2, 4, 8 ... nieuwe cellen stapelen zich op */
    const x0 = 12 + start.c * 30, y0 = 12 + start.r * 30; let klont = [{ x: x0, y: y0 }], n = 0;
    tik = setInterval(() => {
      n++;
      const bij = klont.map(k => { const h = rnd(0, 359) * Math.PI / 180, d = 11 + rnd(0, 6); return { x: Math.max(4, Math.min(290, k.x + Math.cos(h) * d)), y: Math.max(4, Math.min(190, k.y + Math.sin(h) * d)) }; });
      klont = klont.concat(bij).slice(0, 64);
      cellen.forEach(z => { const x = 12 + z.c * 30, y = 12 + z.r * 30; if (z.staat !== 'tumor' && klont.some(k => Math.abs(k.x - x) < 20 && Math.abs(k.y - y) < 20)) z.staat = 'verdrongen'; });
      teken();
      svg.insertAdjacentHTML('beforeend', klont.map(k => `<rect x="${k.x.toFixed(1)}" y="${k.y.toFixed(1)}" width="26" height="26" rx="8" fill="url(#g-tumor)" stroke="#A33A55" stroke-width="1.2"/><circle cx="${(k.x + 13).toFixed(1)}" cy="${(k.y + 13).toFixed(1)}" r="4.5" fill="url(#g-kern)"/>`).join(''));
      if (n >= 6) { clearInterval(tik); fase = 'klaar'; gedaan.add('tumor');
        zeg(fb, 'goed', `<b>Uit één cel zijn ${klont.length} tumorcellen gekomen.</b> ` + '<b>Een tumor:</b> een cel die zich <b>ongeremd</b> deelt, omdat het gen voor celdeling gemuteerd is (ander woord: <b>gezwel</b>). Verstoort hij de bouw en werking van het weefsel, zoals hier, dan is hij <b>kwaadaardig</b>: dat is <b>kanker</b>. Komen cellen ervan via bloed of lymfe ergens anders terecht, dan heet dat een <b>uitzaaiing</b>.');
        svg.insertAdjacentHTML('beforeend', `<circle cx="210" cy="206" r="6" fill="url(#g-tumor)" stroke="#A33A55"/><path d="M220 120 C226 150 214 180 210 198" stroke="#A33A55" stroke-width="1.5" stroke-dasharray="3 3" fill="none"/><text x="224" y="214" font-size="10" fill="#9A3A4A">uitzaaiing via bloed</text>`);
        if (gedaan.size >= 2) api.klaar(p.na); }
    }, minderBeweging() ? 60 : 420);
  } }, 'Zet de rem uit (mutatie)');
  pod.append(h('div', { class: 'vis' }, svg, h('div', { class: 'vis-knoppen' }, wond, rem), fb));
  teken();
  return () => clearInterval(tik);
};

/* =========================================================================
   RECEPTCAKE: genotype = het recept, omgeving = de oven, fenotype = de cake.
   ========================================================================= */
VIS.receptcake = (pod, p, api) => {
  let recept = 'choco', oven = 'goed'; const combi = new Set();
  const beeld = h('div', { class: 'cake-beeld' }), tekst = h('div', { class: 'groot', style: 'font-size:1.05rem' });
  const KL = { choco: ['#8A4A2A', '#5E2E14'], vanille: ['#F6DFA0', '#D9B060'] };
  function teken() {
    combi.add(recept + oven);
    const [a, b] = KL[recept], hoog = oven === 'kort' ? 26 : 46, zwart = oven === 'lang';
    beeld.innerHTML = `<svg viewBox="0 0 200 120" class="svgvis" role="img" aria-label="cake"><ellipse cx="100" cy="108" rx="80" ry="7" fill="#000" opacity=".12"/><rect x="30" y="98" width="140" height="8" rx="3" fill="#C9C4C8"/>` +
      `<path d="M40 98 V${98 - hoog} C40 ${86 - hoog} 160 ${86 - hoog} 160 ${98 - hoog} V98Z" fill="${zwart ? '#2E1A10' : a}" stroke="${b}" stroke-width="2"/>` +
      (oven === 'kort' ? `<path d="M60 ${98 - hoog} C80 ${104 - hoog} 120 ${92 - hoog} 140 ${100 - hoog}" stroke="#fff" stroke-width="3" opacity=".6" fill="none"/>` : '') +
      (zwart ? `<path d="M80 ${80 - hoog} C76 ${70 - hoog} 84 ${66 - hoog} 80 ${56 - hoog} M110 ${80 - hoog} C106 ${70 - hoog} 114 ${66 - hoog} 110 ${56 - hoog}" stroke="#9A8A94" stroke-width="3" fill="none" opacity=".7"/>` : `<ellipse cx="80" cy="${92 - hoog}" rx="22" ry="4" fill="#fff" opacity=".3"/>`) + `</svg>`;
    tekst.innerHTML = `Recept (genotype): <b>${recept === 'choco' ? 'chocolade' : 'vanille'}</b> · oven (omgeving): <b>${{ kort: 'te kort', goed: 'goed', lang: 'te lang' }[oven]}</b><small>De cake die je ziet = het <b>fenotype</b>. ${oven === 'goed' ? '' : 'Zelfde recept, toch een andere cake: de omgeving deed mee. En het recept zelf is niet veranderd.'}</small>`;
    if (combi.size >= 3) api.klaar(p.na);
  }
  const groep = (titel, opties, zet) => h('div', { class: 'cake-groep' }, h('b', {}, titel), h('div', { class: 'chips' }, opties.map(([w, l]) => h('button', { class: 'chip', type: 'button', onclick: e => { zet(w); e.currentTarget.parentNode.querySelectorAll('.chip').forEach(c => c.classList.toggle('aan', c === e.currentTarget)); teken(); } }, l))));
  const g1 = groep('Recept = genotype', [['choco', 'chocolade'], ['vanille', 'vanille']], w => recept = w);
  const g2 = groep('Oven = omgeving', [['kort', 'te kort'], ['goed', 'goed'], ['lang', 'te lang']], w => oven = w);
  g1.querySelector('.chip').classList.add('aan'); g2.querySelectorAll('.chip')[1].classList.add('aan');
  pod.append(h('div', { class: 'vis' }, beeld, g1, g2, tekst, h('div', { class: 'minis' }, 'Probeer minstens drie combinaties.')));
  teken();
};

/* =========================================================================
   GATENTEKST: de vetgedrukte definitie zelf afmaken (ophalen, niet herlezen).
   p.term ; p.zin met [woord] voor elk gat ; p.extra: afleiders ; p.fout: {woord: uitleg}
   ========================================================================= */
VIS.gatentekst = (pod, p, api) => {
  const delen = p.zin.split(/(\[[^\]]+\])/).filter(Boolean);
  const gaten = [], zin = h('div', { class: 'def-zin' });
  delen.forEach(d => { if (d.startsWith('[')) { const w = d.slice(1, -1); const g = h('span', { class: 'gat', tabindex: 0 }, '      '); g._w = w; gaten.push(g); zin.append(g); } else zin.append(document.createTextNode(d)); });
  let nu = 0; const fb = feedbackEl();
  const woorden = shuffle([...new Set([...gaten.map(g => g._w), ...(p.extra || [])])]);
  const chips = h('div', { class: 'chips' }, woorden.map(w => h('button', { class: 'chip', type: 'button', onclick: e => kies(w, e.currentTarget) }, w)));
  const markeer = () => gaten.forEach((g, k) => g.classList.toggle('nu', k === nu));
  gaten.forEach((g, k) => g.addEventListener('click', () => { if (!g.classList.contains('gevuld')) { nu = k; markeer(); } }));
  function kies(w, el) {
    const g = gaten[nu]; if (!g) return;
    if (w === g._w) {
      g.textContent = w; g.classList.add('gevuld'); geefXP(2, g);
      if (!gaten.some(x => x._w === w && !x.classList.contains('gevuld'))) el.disabled = true;
      nu = gaten.findIndex(x => !x.classList.contains('gevuld')); markeer();
      zeg(fb, 'goed', 'Ja.');
      if (nu === -1) { chips.remove(); zin.classList.add('af'); zeg(fb, 'goed', `<b>Zo staat het in je begrippenlijst.</b> Dit vetgedrukte stuk moet je letterlijk kennen. Zeg hem één keer hardop.`); api.klaar(p.na); }
    } else {
      el.classList.remove('fout'); void el.offsetWidth; el.classList.add('fout');
      zeg(fb, 'fout', `<b>${w} past hier niet.</b> ${p.fout?.[w] || 'Lees de zin tot het eind: wat moet hier precies staan?'}`);
      if (p.mis?.[w]) spot(p.mis[w]);
    }
  }
  pod.append(h('div', { class: 'vis' }, h('div', { class: 'def-term' }, p.term), zin, chips, fb));
  markeer();
};

/* =========================================================================
   VOORSPELPROEF (Voorspel → Bekijk → Verklaar): eerst een voorspelling
   vastzetten, dan de meting tonen, dan de verklaring.
   p.vraag ; p.keuzes: [{t, goed, mis?}] ; p.voor / p.na: [[naam, waarde, org?]] ; p.uitleg
   ========================================================================= */
VIS.voorspelproef = (pod, p, api) => {
  let keuze = null;
  const fb = feedbackEl();
  const tabel = (rij, kop) => h('div', { class: 'proef-kol' }, h('b', {}, kop), rij.map(([n, w, o]) => h('div', { class: 'proef-rij' }, o ? h('span', { class: 'bk-ic', html: `<svg viewBox="0 0 100 100" aria-hidden="true">${icoon(o)}</svg>` }) : null, h('span', {}, n), h('b', {}, w))));
  const meting = h('div', { class: 'proef-wrap' }, tabel(p.voor, p.voorKop || 'Begin'), tabel(p.na.map(([n]) => [n, '?']), p.naKop || 'Later'));
  const toonKnop = h('button', { class: 'knop klein', type: 'button', disabled: true, onclick: () => {
    meting.replaceChild(tabel(p.na, p.naKop || 'Later'), meting.lastChild); toonKnop.remove();
    const k = p.keuzes[keuze];
    zeg(fb, k.goed ? 'goed' : 'fout', (k.goed ? '<b>Goed voorspeld!</b> ' : '<b>Verrassend, hè?</b> ') + p.uitleg);
    if (!k.goed && k.mis) spot(k.mis);
    api.klaar(p.na2);
  } }, 'Bekijk de meting');
  const chips = h('div', { class: 'chips' }, p.keuzes.map((k, i) => h('button', { class: 'chip', type: 'button', onclick: e => { keuze = i; chips.querySelectorAll('.chip').forEach(c => c.classList.toggle('aan', c === e.currentTarget)); toonKnop.disabled = false; } }, k.t)));
  pod.append(h('div', { class: 'vis' }, p.beeld ? h('div', { class: 'proef-beeld', html: p.beeld }) : null, meting, h('div', { class: 'minis', html: p.vraag }), chips, toonKnop, fb));
};
