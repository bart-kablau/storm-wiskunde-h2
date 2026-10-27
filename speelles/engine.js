'use strict';
/* =========================================================================
   SPEELLES-ENGINE (canoniek: tools/speelles-engine/engine.js)
   Niet per hoofdstuk bewerken: sync.mjs kopieert dit naar elke speelles.
   Een les = een lijst stappen (data). Stap-types: toon, snap, mc, baas, spel.
   'toon' en 'spel' gebruiken een bouwsteen uit VIS / SPEL.
   'snap' is het hart: "Snap je het?" -> ja (bewijzen) / nee (andere uitleg) /
   nog een keer / waarom. Ja wordt altijd gecontroleerd met een bewijsvraag.
   Het hoofdstuk levert de config via Speelles.start({...}) in lessen.js.
   Contract en velden: tools/speelles-engine/CLAUDE.md
   ========================================================================= */

/* ---------- helpers (globaal, ook voor de bouwsteen-bestanden) ---------- */
const $ = (s, el = document) => el.querySelector(s);
function h(tag, a = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(a || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'style') el.style.cssText = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(9)) { if (c == null || c === false) continue; el.append(c.nodeType ? c : document.createTextNode(String(c))); }
  return el;
}
const NS = 'http://www.w3.org/2000/svg';
function sv(tag, a = {}, ...kids) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(a)) { if (v == null) continue; if (k === 'html') el.innerHTML = v; else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v); else el.setAttribute(k, v); }
  for (const c of kids.flat(9)) { if (c == null) continue; el.append(c.nodeType ? c : document.createTextNode(String(c))); }
  return el;
}
/* svg-string in een element zetten (voor tekeningen uit een bibliotheek) */
function svgEl(markup, viewBox = '0 0 100 100', extra = {}) { return sv('svg', { viewBox, 'aria-hidden': 'true', ...extra, html: markup }); }
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const wacht = ms => new Promise(r => setTimeout(r, ms));
const minderBeweging = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const VIS = {};   /* bouwstenen voor 'toon': VIS.naam = (podium, p, api) => opruim? */
const SPEL = {};  /* minigames voor 'spel': SPEL.naam = (podium, p, api) => opruim? */

/* ---------- toestand ---------- */
let C = {};            /* de config van het hoofdstuk */
const LEEG = () => ({ xp: 0, sterren: {}, album: {}, orgs: {}, log: [], vlag: {} });
let S = LEEG();
const bewaar = () => { try { localStorage.setItem(C.key, JSON.stringify(S)); } catch (e) {} };
function laad() { try { const r = localStorage.getItem(C.key); if (r) S = Object.assign(LEEG(), JSON.parse(r)); } catch (e) {} }
const fmt = s => (C.fmt ? C.fmt(String(s)) : String(s));

/* ---------- niveaus, XP, toasts, confetti, voorlezen ---------- */
function niveau(xp) { let i = 0; C.niveaus.forEach(([g], k) => { if (xp >= g) i = k; }); return i; }
function kopBijwerken() {
  const i = niveau(S.xp), [g, naam] = C.niveaus[i], volgende = C.niveaus[i + 1];
  $('#lvl-naam').textContent = naam;
  $('#xp-n').textContent = S.xp;
  $('#xp-vul').style.width = volgende ? Math.round((S.xp - g) / (volgende[0] - g) * 100) + '%' : '100%';
}
function toast(tekst, ms = 2800) { const el = h('div', { class: 'toast', html: tekst }); $('#toasts').append(el); setTimeout(() => el.remove(), ms); }
function geefXP(n, bij) {
  const oud = niveau(S.xp); S.xp += n; bewaar(); kopBijwerken();
  const r = bij && bij.getBoundingClientRect ? bij.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0 };
  const pop = h('div', { class: 'xp-pop', style: `left:${Math.min(innerWidth - 50, r.left + r.width / 2 - 20)}px;top:${r.top - 10}px` }, '+' + n);
  document.body.append(pop); setTimeout(() => pop.remove(), 1000);
  if (niveau(S.xp) > oud) { confetti(); toast('Nieuw level: <b>' + C.niveaus[niveau(S.xp)][1] + '</b>', 3500); }
}
function confetti() {
  if (minderBeweging()) return;
  const c = $('#confetti'), x = c.getContext('2d'); c.width = innerWidth; c.height = innerHeight;
  const kl = ['#EA580C', '#F4B740', '#5E2750', '#1F9E72', '#F97316'];
  const ps = Array.from({ length: 120 }, () => ({ x: innerWidth / 2, y: innerHeight * .35, vx: (Math.random() - .5) * 14, vy: Math.random() * -12 - 4, r: Math.random() * 6 + 3, k: pick(kl), a: Math.random() * 6 }));
  let f = 0; (function tik() { x.clearRect(0, 0, c.width, c.height); ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += .45; p.a += .2; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.k; x.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); x.restore(); }); if (++f < 110) requestAnimationFrame(tik); else x.clearRect(0, 0, c.width, c.height); })();
}
let stemAan = false;
function spreek(html) {
  if (!stemAan || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    let tekst = String(html).replace(/<sup>(.*?)<\/sup>/g, ' $1 ').replace(/<[^>]+>/g, '').replace(/→/g, ', ');
    if (C.spreekFilter) tekst = C.spreekFilter(tekst);
    const u = new SpeechSynthesisUtterance(tekst); u.lang = 'nl-NL'; u.rate = .95;
    const v = speechSynthesis.getVoices().find(v => (v.lang || '').toLowerCase().startsWith('nl')); if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch (e) {}
}

/* ---------- valkuilen en album ---------- */
function spot(mis) {
  if (!mis || !C.valkuilen[mis]) return;
  const nieuw = !S.album[mis];
  S.album[mis] = { n: (S.album[mis]?.n || 0) + 1, eerst: S.album[mis]?.eerst || Date.now() }; bewaar();
  if (nieuw) toast('Valkuil gespot: <b>' + C.valkuilen[mis][0] + '</b>. Hij zit nu in je valkuilen-album.');
}
function logSnap(les, id, keuze) { S.log.push({ les, id, keuze, t: Date.now() }); if (S.log.length > 800) S.log.shift(); bewaar(); }
function zetVlag(id) { if (!S.vlag[id]) { S.vlag[id] = Date.now(); bewaar(); return true; } return false; }

/* ---------- scherm-opbouw speler ---------- */
let opruimen = null;
const UI = {};
const gidsEl = (cls = 'gids') => h('div', { class: cls, 'aria-hidden': 'true', html: C.gids || '' });
function maakSpeler(les) {
  const scherm = $('#scherm'); scherm.innerHTML = '';
  UI.balk = h('i');
  UI.bubbel = h('div', { class: 'bubbel', 'aria-live': 'polite' });
  UI.podium = h('div', { class: 'podium' });
  UI.acties = h('div', { class: 'acties', id: 'stap-acties' });
  scherm.append(h('section', { class: 'speler' },
    h('div', { class: 'lesbalk' },
      h('button', { class: 'terug', onclick: () => kaartScherm() }, '← Kaart'),
      h('div', { class: 'lesnaam' }, les.titel),
      h('div', { class: 'voortgang' }, UI.balk)),
    h('div', { class: 'coach' }, gidsEl(), UI.bubbel),
    UI.podium, UI.acties));
  scrollTo({ top: 0 });
}
function coach(html) { UI.bubbel.innerHTML = html; UI.bubbel.classList.remove('nieuw'); void UI.bubbel.offsetWidth; UI.bubbel.classList.add('nieuw'); spreek(html); }
function podiumOpruimen() { if (opruimen) { try { opruimen(); } catch (e) {} opruimen = null; } }
function podium() { podiumOpruimen(); UI.podium.innerHTML = ''; UI.podium._visual = null; return UI.podium; }
function acties(...knoppen) { UI.acties.innerHTML = ''; UI.acties.append(...knoppen.filter(Boolean)); }
const knop = (label, fn, cls = '') => h('button', { class: 'knop ' + cls, onclick: fn }, label);

/* ---------- runner ---------- */
let speelId = 0;
async function speel(les) {
  const mijnId = ++speelId;
  maakSpeler(les);
  const ctx = { les, bewijsFout: 0, schijn: 0, baasFouten: 0, id: mijnId };
  await run(les.stappen, ctx, true);
  if (mijnId !== speelId) return;
  eindScherm(les, ctx);
}
async function run(stappen, ctx, hoofd) {
  for (let i = 0; i < stappen.length; i++) {
    if (ctx.id !== speelId) return;
    if (hoofd) UI.balk.style.width = Math.round(i / stappen.length * 100) + '%';
    await STAP[stappen[i].t](stappen[i], ctx, stappen, i);
  }
  if (hoofd) UI.balk.style.width = '100%';
}

const STAP = {
  /* uitleg met (meestal interactieve) bouwsteen; 'wacht' = eerst iets doen */
  toon: (st, ctx) => new Promise(res => {
    coach(st.tekst);
    const pod = podium();
    const verder = knop(st.knop || 'Verder', () => res(), 'pulse');
    const moetWachten = st.wacht ?? !!st.visual;
    verder.disabled = moetWachten;
    acties(verder, moetWachten ? h('div', { class: 'hint' }, st.hint || 'Probeer het eerst even uit.') : null);
    const api = {
      klaar: (bericht) => { if (bericht) coach(bericht); if (verder.disabled) { verder.disabled = false; const hn = UI.acties.querySelector('.hint'); if (hn) hn.remove(); } },
      coach, geefXP, spot, vlag: zetVlag, ctx,
    };
    pod._p = st.p || {}; pod._visual = st.visual || null; pod._modus = 'toon'; /* voor de browsertest */
    if (st.visual) {
      if (!VIS[st.visual]) { pod.append(h('div', { class: 'groot' }, 'Bouwsteen ontbreekt: ' + st.visual)); api.klaar(); return; }
      opruimen = VIS[st.visual](pod, st.p || {}, api) || null;
    } else pod.append(h('div', { class: 'groot', html: st.groot || '' }));
  }),

  /* het snap-moment */
  snap: async (st, ctx, stappen, i) => {
    let k = 0, ronde = 0;
    while (ctx.id === speelId) {
      const keuze = await kiesSnap(st);
      logSnap(ctx.les.id, st.id, keuze);
      if (keuze === 'ja') {
        const vragen = st.bewijs[ronde++ % st.bewijs.length];
        let goed = true;
        for (const q of vragen) { const qq = typeof q === 'function' ? q() : q; const r = await (qq.visual ? STAP.vis : STAP.mc)({ ...qq, bewijs: true }, ctx); if (!r.eersteKeer) goed = false; if (ctx.id !== speelId) return; }
        if (goed) { logSnap(ctx.les.id, st.id, 'bewezen'); geefXP(15, UI.acties); toast('<b>Echt gesnapt.</b> En je hebt het bewezen.'); return; }
        ctx.schijn++; ctx.bewijsFout++; logSnap(ctx.les.id, st.id, 'schijn');
        await STAP.toon({ tekst: 'Je kwam er wel, maar niet in één keer. Precies daarom checken we het even. Ik laat het je op een <b>andere manier</b> zien.', wacht: false, knop: 'Laat zien' }, ctx);
        if (st.anders?.length) await run(st.anders[k++ % st.anders.length], ctx);
      } else if (keuze === 'nee') {
        if (st.anders?.length) await run(st.anders[k++ % st.anders.length], ctx);
      } else if (keuze === 'nog') {
        await run([stappen[i - (st.herhaal || 1)]], ctx);
      } else if (keuze === 'waarom') {
        await run(st.dieper || [], ctx);
      }
    }
  },

  /* meerkeuze, met uitleg per fout antwoord */
  mc: (q, ctx) => new Promise(res => {
    coach(q.coach || (q.bewijs ? 'Top. Laat maar zien dan.' : 'Kies het goede antwoord.'));
    const pod = podium();
    if (q.kop) pod.append(q.kop);
    if (q.beeld) pod.append(h('div', { class: 'vraag-beeld', html: q.beeld }));
    pod.append(h('div', { class: 'vraag', html: (q.klein ? '<small>' + q.klein + '</small>' : '') + fmt(q.vraag) }));
    const fb = h('div', { class: 'feedback', 'aria-live': 'polite' });
    const lijst = h('div', { class: 'opties' });
    let fout = 0, klaar = false;
    (q.vast ? q.opties : shuffle(q.opties)).forEach(o => {
      const b = h('button', { class: 'optie', html: fmt(o.t) }); b._o = o; /* voor de browsertest */
      b.addEventListener('click', () => {
        if (klaar) return;
        if (o.goed) {
          klaar = true; b.classList.add('goed');
          lijst.querySelectorAll('button').forEach(x => x.disabled = true);
          geefXP(fout ? 4 : 10, b);
          fb.className = 'feedback goed'; fb.innerHTML = '<b>' + (fout ? 'Ja, die is het.' : pick(['Goed zo!', 'Precies!', 'Yes!', 'Helemaal goed.'])) + '</b> ' + (q.w || '');
          if (q.auto && !fout) setTimeout(() => res({ eersteKeer: true }), 1300);
          else acties(knop('Verder', () => res({ eersteKeer: fout === 0 }), 'pulse'));
        } else {
          fout++; b.classList.add('fout'); b.disabled = true;
          fb.className = 'feedback fout'; fb.innerHTML = '<b>Bijna.</b> ' + (o.fout || 'Kijk nog eens goed.');
          spot(o.mis);
        }
      });
      lijst.append(b);
    });
    pod.append(lijst, fb);
    acties(h('div', { class: 'hint' }, q.bewijs ? 'Fout mag. Dan weten we wat er nog mist.' : 'Fout mag: je krijgt uitleg.'));
  }),

  /* een bouwsteen als vraag (in een baas of als bewijs bij een snap-moment): { visual, p, vraag?, coach? }.
     De bouwsteen roept api.fout() bij elke fout en api.klaar(bericht?) als hij af is; eersteKeer = geen fout.
     Bouwstenen die dit ondersteunen staan in het kopcommentaar van hun pakket (bv. geschiedenis/vis.js). */
  vis: (q, ctx) => new Promise(res => {
    coach(q.coach || (q.bewijs ? 'Top. Laat maar zien dan.' : 'Laat maar zien.'));
    const pod = podium();
    const kop = q.kop || h('div', { class: 'vis-vraagkop' });
    pod.append(kop);
    if (q.vraag) pod.append(h('div', { class: 'vraag', html: fmt(q.vraag) }));
    const vak = h('div', { class: 'vis-vraag' }); pod.append(vak);
    pod._p = q.p || {}; pod._visual = q.visual; pod._modus = q.bewijs ? 'bewijs' : 'baas';
    let fout = 0, af = false;
    acties(h('div', { class: 'hint' }, 'Fout mag: je krijgt uitleg.'));
    const api = {
      klaar: (bericht) => {
        if (af) return; af = true; if (bericht) coach(bericht);
        geefXP(fout ? 4 : 10, UI.acties);
        if (q.auto && !fout) setTimeout(() => res({ eersteKeer: true }), 1600);
        else acties(knop('Verder', () => res({ eersteKeer: fout === 0 }), 'pulse'));
      },
      fout: () => { fout++; }, coach, geefXP, spot, vlag: zetVlag, ctx, inVraag: true,
    };
    if (!VIS[q.visual]) { vak.append(h('div', { class: 'groot' }, 'Bouwsteen ontbreekt: ' + q.visual)); api.klaar(); return; }
    opruimen = VIS[q.visual](vak, q.p || {}, api) || null;
  }),

  /* baasgevecht: geen levens voor Storm, alleen voor de baas.
     Vragen uit st.pool (lijst, geschud en rondgaand) of uit C.gen[st.gen](). */
  baas: async (st, ctx) => {
    coach(st.tekst);
    podium().append(h('div', { class: 'baasportret' }, h('div', { html: st.beeld || '' }), h('b', {}, st.naam), st.denkfout ? h('small', { html: 'Zijn denkfout: “' + st.denkfout + '”' }) : null));
    await new Promise(r => { acties(knop('Vechten!', r, 'pulse')); });
    if (ctx.id !== speelId) return;
    const max = st.hp || 5; let hp = max, fouten = 0, rij = [], vorige = null;
    const volgende = () => {
      if (st.pool) {
        if (!rij.length) { rij = shuffle(st.pool); if (rij[0] === vorige && rij.length > 1) rij.push(rij.shift()); }
        vorige = rij.shift(); return typeof vorige === 'function' ? vorige() : vorige;
      }
      return C.gen[st.gen]();
    };
    while (hp > 0 && ctx.id === speelId) {
      const kop = h('div', { class: 'baas' }, h('div', { class: 'mon', html: st.beeld || '' }),
        h('div', {}, h('b', {}, st.naam), h('div', { class: 'hp', 'aria-label': hp + ' van ' + max + ' levens' }, Array.from({ length: max }, (_, j) => h('i', { class: j < hp ? '' : 'weg' })))));
      const q = volgende();
      const r = await (q.visual ? STAP.vis : STAP.mc)({ ...q, kop, auto: true, coach: q.coach || pick(['Raak hem!', 'Nog eentje!', 'Kijk goed, dan pak je hem.', 'Rustig aan, je hebt alle tijd.', st.aanmoedig || 'Denk aan het niveau waar je bent.']) }, ctx);
      if (r.eersteKeer) { hp--; const mon = UI.podium.querySelector('.mon'); if (mon) mon.classList.add('raak'); await wacht(250); }
      else fouten++;
    }
    if (ctx.id !== speelId) return;
    ctx.baasFouten = fouten;
    confetti(); geefXP(25, UI.acties);
    await STAP.toon({ tekst: fouten <= 1 ? 'Verslagen, bijna zonder fouten. Sterk!' : 'Verslagen! Elke fout was een les. Zo werkt het.', wacht: false, knop: 'Verder', groot: '<div class="baasportret" style="opacity:.55;filter:grayscale(.6)">' + (st.beeld || '') + '</div>' + st.naam + ' is verslagen' }, ctx);
  },

  /* minigame */
  spel: (st, ctx) => new Promise(res => {
    coach(st.tekst);
    const pod = podium(); acties();
    opruimen = SPEL[st.spel](pod, st.p || {}, { klaar: (uit) => { if (uit) Object.assign(ctx, uit); res(); }, coach, geefXP, spot, vlag: zetVlag }) || null;
  }),
};

function kiesSnap(st) {
  return new Promise(res => {
    coach(st.vraag);
    const kies = k => res(k);
    acties(h('div', { class: 'snapgrid' },
      h('button', { class: 'snapknop ja', onclick: () => kies('ja') }, h('span', { class: 'e', 'aria-hidden': 'true' }, '👍'), h('b', {}, 'Ja, snap ik'), h('small', {}, 'Dan laat je het even zien')),
      h('button', { class: 'snapknop', onclick: () => kies('nee') }, h('span', { class: 'e', 'aria-hidden': 'true' }, '🤔'), h('b', {}, 'Nee, nog niet'), h('small', {}, 'Ik leg het anders uit')),
      h('button', { class: 'snapknop', onclick: () => kies('nog') }, h('span', { class: 'e', 'aria-hidden': 'true' }, '🔁'), h('b', {}, 'Nog een keer'), h('small', {}, 'Zelfde uitleg, rustig')),
      h('button', { class: 'snapknop', onclick: () => kies('waarom') }, h('span', { class: 'e', 'aria-hidden': 'true' }, '🔍'), h('b', {}, 'Waarom eigenlijk?'), h('small', {}, 'Meer diepgang'))));
  });
}

/* =========================================================================
   SCHERMEN
   ========================================================================= */
const sterHTML = n => [1, 2, 3].map(s => `<span class="${s <= n ? 'aan' : ''}">★</span>`).join('');
const alleLessen = () => C.expedities.flatMap(e => e.lessen);
function kaartScherm() {
  speelId++; podiumOpruimen(); try { speechSynthesis.cancel(); } catch (e) {}
  const scherm = $('#scherm'); scherm.innerHTML = '';
  const volgende = alleLessen().find(l => !S.sterren[l.id]);
  const orgTotaal = Object.keys(C.organismen || {}).length, orgHebben = Object.keys(S.orgs).filter(k => C.organismen?.[k]).length;
  scherm.append(...[
    h('div', { class: 'hallo' }, gidsEl(),
      h('div', {}, h('h1', {}, C.hallo.titel), h('p', {}, C.hallo.tekst))),
    h('div', { class: 'uitleg-loop', html: C.loop || '<span>Kijken en <b>zelf doen</b></span><span><b>Snap je het?</b></span><span>Ja → even <b>bewijzen</b></span><span>Nee → <b>andere uitleg</b></span><span>Baas verslaan</span>' }),
    C.kaartBoven ? C.kaartBoven(S) : null,
    C.expedities.map(ex => h('section', { class: 'expeditie', id: 'exp-' + ex.id },
      h('div', { class: 'exp-kop' }, h('div', { class: 'exp-bol', html: ex.bol || '' }),
        h('div', {}, h('h2', {}, ex.titel), h('p', {}, ex.sub)),
        h('div', { class: 'exp-teller' }, ex.lessen.filter(l => S.sterren[l.id]).length + ' / ' + ex.lessen.length)),
      h('div', { class: 'pad' }, ex.lessen.map(l => h('button', { class: 'eiland' + (S.sterren[l.id] ? ' gehaald' : '') + (l === volgende ? ' volgende' : ''), onclick: () => speel(l), 'data-les': l.id },
        h('div', { class: 'bol', html: l.bol || '' }),
        h('div', { class: 'tx' }, h('small', {}, l.sub), h('b', {}, l.titel), h('em', {}, l === volgende ? 'Hier verder' : '')),
        h('div', { class: 'sterren', html: sterHTML(S.sterren[l.id] || 0), 'aria-label': (S.sterren[l.id] || 0) + ' van 3 sterren' })))))),
    h('div', { class: 'tegels' },
      orgTotaal ? h('button', { class: 'tegel-k', onclick: organismeScherm }, h('span', { class: 'e', html: C.albumIcoon || '' }), h('span', {}, h('b', {}, C.albumNaam || 'Organisme-album'), h('small', {}, orgHebben + ' van ' + orgTotaal + ' gevonden'))) : null,
      h('button', { class: 'tegel-k', onclick: albumScherm }, h('span', { class: 'e', 'aria-hidden': 'true' }, '🃏'), h('span', {}, h('b', {}, 'Valkuilen-album'), h('small', {}, Object.keys(S.album).filter(k => C.valkuilen[k]).length + ' van ' + Object.keys(C.valkuilen).length + ' gespot'))),
      (C.inzicht || []).map(iz => { const open = iz.open(S); return h('button', { class: 'tegel-k', onclick: () => inzichtScherm(iz), disabled: !open }, h('span', { class: 'e', html: iz.icoon || '' }), h('span', {}, h('b', {}, iz.titel), h('small', {}, open ? 'Open' : iz.dicht))); }),
      C.terug ? h('a', { class: 'tegel-k', href: C.terug.href }, h('span', { class: 'e', 'aria-hidden': 'true' }, '✏️'), h('span', {}, h('b', {}, C.terug.label), h('small', {}, C.terug.sub || 'Oefenen met alle begrippen'))) : null,
      h('button', { class: 'tegel-k', onclick: ouderScherm }, h('span', { class: 'e', 'aria-hidden': 'true' }, '📊'), h('span', {}, h('b', {}, 'Voor papa'), h('small', {}, 'Waar haakt het af?'))))].flat(9).filter(Boolean));
}
function eindScherm(les, ctx) {
  const n = 1 + (ctx.bewijsFout === 0 ? 1 : 0) + (ctx.baasFouten <= 1 ? 1 : 0);
  S.sterren[les.id] = Math.max(S.sterren[les.id] || 0, n);
  const nieuw = (les.orgs || []).filter(o => C.organismen?.[o] && !S.orgs[o]);
  nieuw.forEach(o => S.orgs[o] = Date.now());
  bewaar(); confetti(); geefXP(20);
  coach(n === 3 ? 'Drie sterren! Je snapte het, je bewees het en je versloeg de baas.' : 'Klaar! Wil je meer sterren? Speel hem nog eens: dan bewijs je het in één keer.');
  const pod = podium();
  pod.append(h('div', { class: 'eind' }, h('div', { class: 'grootster', html: sterHTML(n) }), h('h2', {}, les.titel + ' gehaald'),
    h('div', { class: 'p', style: 'margin:0 auto', html: '★ uitleg doorlopen &nbsp; ★ alles in één keer bewezen &nbsp; ★ baas met hooguit één fout' }),
    nieuw.length ? h('div', {}, h('p', { style: 'margin:14px 0 0;font-weight:800' }, 'Nieuw in je ' + (C.albumNaam || 'album').toLowerCase() + ':'),
      h('div', { class: 'nieuwe-orgs' }, nieuw.map(o => h('div', {}, svgEl(C.organismen[o].svg), h('div', {}, C.organismen[o].naam))))) : null));
  acties(knop('Terug naar de kaart', kaartScherm), knop('Nog een keer', () => speel(les), 'zacht'));
}
function paginaKop(titel, tekst) {
  speelId++; podiumOpruimen(); try { speechSynthesis.cancel(); } catch (e) {}
  const s = $('#scherm'); s.innerHTML = ''; scrollTo({ top: 0 });
  s.append(...[h('button', { class: 'terug', style: 'margin-top:16px', onclick: kaartScherm }, '← Kaart'), h('h2', { class: 'paginakop' }, titel), tekst ? h('p', { class: 'p', html: tekst }) : null].filter(Boolean));
  return s;
}
function albumScherm() {
  const s = paginaKop('Valkuilen-album', 'Elke valkuil die je gespot hebt, ken je nu. Dat is winst, geen fout. Wie de valkuil kent, loopt er op de toets omheen.');
  s.append(h('div', { class: 'albumgrid' }, Object.entries(C.valkuilen).map(([k, [naam, vb]]) => S.album[k]
    ? h('div', { class: 'valk' }, h('b', {}, naam), h('code', {}, vb), h('small', {}, S.album[k].n + '× gezien'))
    : h('div', { class: 'valk dicht' }, h('b', {}, '?'), h('small', {}, 'Nog niet gespot')))));
}
function organismeScherm() {
  const s = paginaKop(C.albumNaam || 'Organisme-album', C.albumTekst || 'Elk gebied dat je haalt, levert nieuwe kaarten op.');
  s.append(h('div', { class: 'albumgrid' }, Object.entries(C.organismen).map(([k, o]) => S.orgs[k]
    ? h('div', { class: 'orgkaart' }, svgEl(o.svg), h('b', {}, o.naam), h('small', { html: o.sub || '' }))
    : h('div', { class: 'orgkaart dicht' }, svgEl(o.svg), h('b', {}, '?'), h('small', {}, o.waar || 'Nog niet gevonden')))));
}
function inzichtScherm(iz) { const s = paginaKop(iz.titel, iz.tekst); iz.bouw(s, S); }
function ouderScherm() {
  const s = paginaKop('Voor papa: waar haakt het af?', 'Per snap-moment: hoe vaak Storm <b>ja</b> zei, hoe vaak ze het daarna in één keer <b>bewees</b>, hoe vaak "ja" toch <b>schijnbegrip</b> bleek, en hoe vaak ze een andere uitleg of meer diepgang vroeg. Schijnbegrip en veel "nee" wijzen aan waar de uitleg beter moet.');
  const per = {};
  S.log.forEach(r => { const k = r.les + ' · ' + r.id; per[k] = per[k] || { ja: 0, bewezen: 0, schijn: 0, nee: 0, nog: 0, waarom: 0 }; per[k][r.keuze] = (per[k][r.keuze] || 0) + 1; });
  const rijen = Object.entries(per);
  const reset = h('button', { class: 'knop zacht', style: 'margin-top:18px;flex:none' }, 'Voortgang wissen');
  reset.addEventListener('click', () => { if (reset.dataset.zeker) { S = LEEG(); bewaar(); kopBijwerken(); kaartScherm(); } else { reset.dataset.zeker = 1; reset.textContent = 'Zeker weten? Tik nog een keer'; } });
  const lessen = alleLessen();
  s.append(
    rijen.length ? h('div', { class: 'tabwrap' }, h('table', { class: 'tab' }, h('tr', {}, ['Moment', 'Ja', 'Bewezen', 'Schijn', 'Nee', 'Nog eens', 'Waarom'].map(x => h('th', {}, x))),
      rijen.map(([k, v]) => h('tr', {}, h('td', {}, k), [v.ja, v.bewezen, v.schijn, v.nee, v.nog, v.waarom].map(x => h('td', { class: 'n' }, x || '·'))))))
      : h('p', { class: 'p' }, 'Nog niets gespeeld. Na de eerste snap-momenten staat hier per moment wat ze koos.'),
    h('h3', { class: 'paginakop', style: 'font-size:1.2rem' }, 'Sterren per les'),
    h('div', { class: 'tabwrap' }, h('table', { class: 'tab' }, lessen.map(l => h('tr', {}, h('td', {}, l.titel), h('td', { class: 'sterren', html: sterHTML(S.sterren[l.id] || 0) }))))),
    h('h3', { class: 'paginakop', style: 'font-size:1.2rem' }, 'Gespotte valkuilen'),
    Object.keys(S.album).length ? h('div', { class: 'tabwrap' }, h('table', { class: 'tab' }, Object.entries(S.album).filter(([k]) => C.valkuilen[k]).sort((a, b) => b[1].n - a[1].n).map(([k, v]) => h('tr', {}, h('td', {}, k + ' · ' + C.valkuilen[k][0]), h('td', { class: 'n' }, v.n + '×')))))
      : h('p', { class: 'p' }, 'Nog geen.'),
    h('p', { class: 'p', html: `XP: <b>${S.xp}</b> · valkuilen gespot: <b>${Object.keys(S.album).length}</b> · voortgang staat alleen in deze browser (sleutel <code>${C.key}</code>).` }),
    reset);
}

/* ---------- start ---------- */
const Speelles = {
  start(config) {
    C = config; laad();
    document.title = C.titel || document.title;
    $('#merk-naam').textContent = C.merk || '';
    $('#merk-ikoon').innerHTML = C.merkIcoon || '';
    $('#naar-kaart').addEventListener('click', kaartScherm);
    $('#stem').addEventListener('click', e => { stemAan = !stemAan; e.currentTarget.setAttribute('aria-pressed', stemAan); e.currentTarget.textContent = stemAan ? '🔊' : '🔈'; if (!stemAan) try { speechSynthesis.cancel(); } catch (x) {} else spreek('Voorlezen staat aan.'); });
    kopBijwerken();
    const les = new URLSearchParams(location.search).get('les');
    const l = les && alleLessen().find(x => x.id === les);
    if (l) speel(l); else kaartScherm();
  },
  speel: id => { const l = alleLessen().find(x => x.id === id); if (l) speel(l); },
  get staat() { return S; },
};
