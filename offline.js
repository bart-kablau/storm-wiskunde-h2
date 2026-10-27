/* =====================================================================
   offline.js: de kern van de offline-modus, gedeeld door de oefen-apps
   (engine index.html) en de hub. Wordt bij deploy naast index.html gezet
   (tools/oefen-engine/offline.mjs). Geen UI: die zit in de engine en de hub.

   window.StormOffline:
     .kan()              kan deze browser het (caches + service worker, http/https)
     .registreer()       service worker aanmelden: eerst /sw.js (scope "/", de hele
                         site), anders sw.js naast de pagina (alleen deze app)
     .app(scope)         een App voor "/storm-x/" (standaard: de map van deze pagina)
     .scopeVan(url)      "/storm-x/" uit een url
     .mb(bytes)          "12 MB"

   App (alle methodes async, behalve plan):
     lees()              staat {build, media:{pad:hash}, lijst} of null
     haalLijst()         offline.json van internet (null = offline / geen offline-modus)
     plan(remote, st)    {app, media[], nieuw[], bytes}: wat moet er nog binnenkomen
     sync(remote, {alleenApp, voortgang(klaar,totaal,tekst)})  downloaden; geeft {appVernieuwd, oudBuild}
     check()             {appOk, appN, mediaOk, mediaN, fout[]}: ligt alles er en speelt het
     weg(pad)            één film/podcast weggooien
     wisApp()            alleen de app-bestanden weg (voor hard vernieuwen)
     allesWeg()          alles van deze app weg; de voortgang (localStorage) blijft

   Opslag: zie offline/sw.js. Na elke wijziging zetten we in localStorage de vlag
   storm_offline:<scope> = build; de cache-buster van de pagina herlaadt dan niet
   meer zelf maar laat de update-balk het werk doen.
   ===================================================================== */
(function () {
  const mb = b => (b / 1048576).toFixed(b < 10485760 ? 1 : 0) + ' MB';
  const kan = () => ('caches' in window) && ('serviceWorker' in navigator) && /^https?:$/.test(location.protocol);
  const scopeVan = url => { const p = new URL(url, location.href).pathname; const m = /^\/[^/]+\//.exec(p); return m ? m[0] : p.replace(/[^/]*$/, ''); };

  async function registreer() {
    if (!kan()) return null;
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      /* een oudere SW per app gaat voor (specifiekere scope): die ruimen we op */
      for (const r of await navigator.serviceWorker.getRegistrations())
        if (new URL(r.scope).pathname !== '/') await r.unregister();
      return reg;
    } catch (e) {
      try { return await navigator.serviceWorker.register('sw.js'); } catch (e2) { return null; }
    }
  }

  function App(scope) {
    this.scope = scope || scopeVan(location.href);
    this.base = location.origin + this.scope;
    this.meta = this.scope + '|meta';
    this.media = this.scope + '|media';
  }
  App.prototype.appNaam = function (b) { return this.scope + '|app|' + b; };

  App.prototype.lees = async function () {
    try {
      if (!(await caches.has(this.meta))) return null;
      const r = await (await caches.open(this.meta)).match(this.base + '__state');
      return r ? await r.json() : null;
    } catch (e) { return null; }
  };
  App.prototype.schrijf = async function (st) {
    await (await caches.open(this.meta)).put(this.base + '__state',
      new Response(JSON.stringify(st), { headers: { 'Content-Type': 'application/json' } }));
    try {
      if (st && st.build) localStorage.setItem('storm_offline:' + this.scope, st.build);
      else localStorage.removeItem('storm_offline:' + this.scope);
    } catch (e) {}
  };
  App.prototype.haalLijst = async function () {
    try {
      const r = await fetch(this.base + 'offline.json?t=' + Date.now(), { cache: 'no-store' });
      return r.ok ? await r.json() : null;
    } catch (e) { return null; }
  };
  App.prototype.plan = function (R, st) {
    if (!R) return null;
    st = st || {}; const lok = st.media || {};
    const app = st.build !== R.build;
    const media = R.media.filter(m => lok[m.pad] !== m.hash);
    const nieuw = media.filter(m => lok[m.pad]);       // had ze al, maar een oudere versie
    return { app, media, nieuw, bytes: (app ? R.appBytes : 0) + media.reduce((s, m) => s + m.bytes, 0) };
  };

  App.prototype.sync = async function (R, opt) {
    opt = opt || {};
    const vg = opt.voortgang || function () {};
    try { if (navigator.storage && navigator.storage.persist) await navigator.storage.persist(); } catch (e) {}
    const oud = (await this.lees()) || {};
    const st = { build: oud.build || null, media: Object.assign({}, oud.media || {}), lijst: R };
    const p = this.plan(R, oud);
    if (opt.alleenApp) { p.bytes -= p.media.reduce((s, m) => s + m.bytes, 0); p.media = []; }
    let klaar = 0, appVernieuwd = false;
    if (p.app) {
      const c = await caches.open(this.appNaam(R.build));
      const rij = R.app.slice(), self = this;
      const werker = async () => {
        while (rij.length) {
          const f = rij.shift();
          const r = await fetch(self.base + f + '?v=' + R.build + '&dl=1', { cache: 'no-store' });
          if (!r.ok) throw new Error(f + ' gaf ' + r.status);
          const blob = await r.blob();
          await c.put(self.base + f, new Response(blob, { headers: { 'Content-Type': r.headers.get('Content-Type') || 'application/octet-stream' } }));
          klaar += blob.size; vg(klaar, p.bytes, 'App');
        }
      };
      await Promise.all([werker(), werker(), werker(), werker()]);
      st.build = R.build; await this.schrijf(st); appVernieuwd = true;
      for (const k of await caches.keys())
        if (k.indexOf(this.scope + '|app|') === 0 && k !== this.appNaam(R.build)) await caches.delete(k);
    }
    const mc = await caches.open(this.media);
    for (let i = 0; i < p.media.length; i++) {
      const m = p.media[i], naam = (opt.titel ? opt.titel(m.pad) : m.pad);
      const label = (p.media.length > 1 ? (i + 1) + ' van ' + p.media.length + ': ' : '') + naam;
      const r = await fetch(this.base + m.pad + '?h=' + m.hash + '&dl=1', { cache: 'no-store' });
      if (!r.ok) throw new Error(naam + ' gaf ' + r.status);
      const type = r.headers.get('Content-Type') || (/\.mp4$/.test(m.pad) ? 'video/mp4' : 'audio/mp4');
      const lezer = r.body.getReader(), stukken = []; let n = 0;
      for (;;) { const { done, value } = await lezer.read(); if (done) break; stukken.push(value); n += value.length; vg(klaar + n, p.bytes, label); }
      const blob = new Blob(stukken, { type });
      if (blob.size !== m.bytes) throw new Error(naam + ' kwam niet helemaal binnen (' + mb(blob.size) + ' van ' + mb(m.bytes) + ')');
      await mc.put(this.base + m.pad, new Response(blob, { headers: { 'Content-Type': type, 'Content-Length': String(blob.size) } }));
      klaar += m.bytes; st.media[m.pad] = m.hash; await this.schrijf(st);
    }
    /* media die niet meer in de app zitten: opruimen */
    for (const pad of Object.keys(st.media))
      if (!R.media.some(m => m.pad === pad)) { await mc.delete(this.base + pad); delete st.media[pad]; }
    await this.schrijf(st);
    return { appVernieuwd, oudBuild: oud.build || null };
  };

  App.prototype.check = async function (opt) {
    opt = opt || {};
    const st = await this.lees(), L = st && st.lijst, fout = [];
    if (!L || !st.build) return { appOk: 0, appN: 0, mediaOk: 0, mediaN: 0, fout: ['Nog niets offline.'] };
    const ac = await caches.open(this.appNaam(st.build));
    let appOk = 0; for (const f of L.app) { if (await ac.match(this.base + f)) appOk++; else fout.push('App-bestand ontbreekt: ' + f); }
    const mc = await caches.open(this.media);
    const sw = navigator.serviceWorker && navigator.serviceWorker.controller;
    if (!sw) fout.push('De offline-hulp is nog niet actief. Sluit de app helemaal en open hem opnieuw, controleer dan nog eens.');
    let mediaOk = 0;
    for (const m of L.media) {
      const naam = opt.titel ? opt.titel(m.pad) : m.pad;
      if (st.media[m.pad] !== m.hash) { if (!opt.alleenAanwezig || st.media[m.pad]) fout.push(naam + ': niet (of een oude versie) offline'); continue; }
      const r = await mc.match(this.base + m.pad); const sz = r ? (await r.blob()).size : 0;
      if (sz !== m.bytes) { fout.push(naam + ': onvolledig'); continue; }
      if (sw) {
        const ok = await new Promise(res => {
          const v = document.createElement(/\.mp4$/.test(m.pad) ? 'video' : 'audio'); v.muted = true; v.preload = 'metadata';
          const klaar = x => { clearTimeout(t); v.removeAttribute('src'); try { v.load(); } catch (e) {} res(x); };
          const t = setTimeout(() => klaar(false), 10000);
          v.onloadedmetadata = () => klaar(v.duration > 0); v.onerror = () => klaar(false);
          v.src = this.base + m.pad;
        });
        if (!ok) { fout.push(naam + ': speelt niet af'); continue; }
      }
      mediaOk++;
    }
    return { appOk, appN: L.app.length, mediaOk, mediaN: L.media.length, fout };
  };

  App.prototype.weg = async function (pad) {
    const st = await this.lees(); if (!st) return;
    await (await caches.open(this.media)).delete(this.base + pad);
    delete st.media[pad]; await this.schrijf(st);
  };
  App.prototype.wisApp = async function () {
    for (const k of await caches.keys()) if (k.indexOf(this.scope + '|app|') === 0) await caches.delete(k);
    const st = (await this.lees()) || { media: {} }; st.build = null; await this.schrijf(st);
    try { for (const r of await navigator.serviceWorker.getRegistrations()) await r.update(); } catch (e) {}
  };
  App.prototype.allesWeg = async function () {
    for (const k of await caches.keys()) if (k.indexOf(this.scope + '|') === 0) await caches.delete(k);
    try { localStorage.removeItem('storm_offline:' + this.scope); } catch (e) {}
  };

  window.StormOffline = { kan, registreer, scopeVan, mb, app: s => new App(s) };
})();
