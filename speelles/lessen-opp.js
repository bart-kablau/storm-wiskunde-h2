'use strict';
/* =========================================================================
   SPEELLES Wiskunde H2: Het Atelier (§2.5 en §2.6). Storm ontwerpt kleren:
   oppervlakte = hoeveel stof je nodig hebt. Knippen en schuiven (knipschuif), de
   schuifproef (schuine zijde verandert, stof niet), de maatkiezer (welke hoogte hoort
   bij welke zijde) en de splitser (splitsen of aanvullen).
   Bron (leidend): ../../02-verwerkt/brontekst.md §2.5-2.6. Ontwerp: leerplan.md.
   Alles in een IIFE: alleen de globale OPP = { l25, l26 } en LOGBOEK-badges 'o-*'.
   Les-ids = onderwerp-ids: opp-driehoek, opp-stomp, opp-parallellogram, opp-trapezium, opp-samengesteld.
   ========================================================================= */
const OPP = (() => {
  const O = WK.opp, K = WK.K, G = WK.G, g = O.getal;
  const Pt = (x, y) => ({ x, y });
  const ob = m => svgStr(m);
  /* meerkeuze zonder dubbele of rare opties */
  const QD = (vraag, goed, fouten, w, klein, beeld) => {
    const gezien = new Set([goed]);
    const f = fouten.filter(([t]) => { if (gezien.has(t) || /NaN|Infinity|^-|^0 /.test(t)) return false; gezien.add(t); return true; });
    return Q(vraag, goed, f, w, klein, beeld);
  };
  const cm2 = (x, e = 'cm²') => g(x) + ' ' + e;

  /* ---------- tekeningen (stof op papier, ± 330 breed) ---------- */
  const stofBeeld = (pts, fn, o = {}) => { const V = O.papier(O.kader(pts, o.marge), { rooster: !!o.rooster, hoog: o.hoog || 220, maxS: o.maxS || 46 }); V.voeg('figuur', fn(V)); return V.svg.outerHTML; };
  const letters = (V, pts) => { const c = { x: pts.reduce((s, q) => s + q.x, 0) / pts.length, y: pts.reduce((s, q) => s + q.y, 0) / pts.length }; return pts.filter(q => q.l).map(q => O.tekstOp(V, G.plus(q, G.maal(G.eenheid(G.min(q, c)), 15 / V.s)), q.l, { fs: 16 })).join(''); };
  const lijn = (V, a, b, k = K.inkt) => V.stuk(a, b, { kleur: k, dik: 2.6 });
  const hoogte = (V, top, voet, naar, t, kant = 1) => V.stuk(top, voet, { kleur: K.hoogtelijn, dik: 2.6, stip: true }) + O.rechteHoekPx(V, voet, top, naar) + (t ? O.label(V, top, voet, t, { kant, kleur: WK.donker(K.hoogtelijn, .3) }) : '');
  const verleng = (V, a, b) => V.stuk(a, b, { kleur: K.zacht, dik: 2, stip: true });
  const L = (V, a, b, t, kant = 1, kleur) => O.label(V, a, b, t, { kant, kleur });

  /* ---------- badges voor het missielogboek (100 x 100) ---------- */
  const rondje = (inhoud, k = '#FFF7E6') => `<circle cx="50" cy="50" r="44" fill="${k}" stroke="#E8D3A8" stroke-width="3"/><ellipse cx="38" cy="26" rx="18" ry="8" fill="#fff" opacity=".5"/>${inhoud}`;
  const BADGE = {
    trapezium: rondje(`<g filter="url(#wk-schaduw)"><path d="M18 66 L46 66 L36 40 L26 40Z" fill="url(#wk-roze)"/><path d="M46 66 L36 40 L64 40 L74 66Z" fill="url(#wk-paars)" opacity=".95"/><path d="M18 66 H74 L64 40 H26Z" fill="none" stroke="#5E2750" stroke-width="2"/><path d="M36 40 L46 66" stroke="#fff" stroke-width="2" stroke-dasharray="4 3"/><path d="M26 40 V66" stroke="#0891B2" stroke-width="1.8" stroke-dasharray="3 2"/><text x="46" y="80" font-size="11" font-weight="800" text-anchor="middle" fill="#5E2750">a + b</text></g>`),
    patroon: rondje(`<g filter="url(#wk-schaduw)"><path d="M24 70 V30 H52 V46 H76 V70Z" fill="url(#wk-geel)"/><path d="M52 46 V70" stroke="#fff" stroke-width="2.4" stroke-dasharray="4 3"/><path d="M24 70 V30 H52 V46 H76 V70Z" fill="none" stroke="#92400E" stroke-width="2"/><circle cx="34" cy="38" r="3" fill="#DC2626"/><path d="M34 38 L42 30" stroke="#9CA3AF" stroke-width="1.6"/><circle cx="66" cy="54" r="3" fill="#2563EB"/><path d="M66 54 L74 46" stroke="#9CA3AF" stroke-width="1.6"/></g>`),
  };
  Object.assign(LOGBOEK, {
    'o-schaar': { naam: 'Gouden schaar', svg: WK.badge.schaar(), sub: 'driehoek = ½ × zijde × hoogte', waar: '§2.5 · Oppervlakte van een driehoek' },
    'o-rooster': { naam: 'Roosterpatroon', svg: WK.badge.rooster(), sub: 'de hoogte mag buiten de driehoek liggen', waar: '§2.5 · Stomphoekig en in het rooster' },
    'o-stof': { naam: 'Stoflap', svg: WK.badge.stof(), sub: 'parallellogram = zijde × hoogte', waar: '§2.6 · Parallellogram' },
    'o-trapezium': { naam: 'Dubbel trapezium', svg: BADGE.trapezium, sub: '½ × (a + b) × h en ruit ½ × d₁ × d₂', waar: '§2.6 · Trapezium en ruit' },
    'o-patroon': { naam: 'Naaipatroon', svg: BADGE.patroon, sub: 'splitsen of aanvullen', waar: '§2.6 · Samengestelde figuren' },
  });

  /* ---------- bazen (een denkfout als monster) ---------- */
  const BAAS = {
    schurk: WK.baas({ vorm: 'driehoek', kleur: '#F97316', kleur2: '#9A3412', extra: '<path d="M12 104 L44 28" stroke="#DC2626" stroke-width="6" stroke-linecap="round"/><text x="16" y="56" font-size="15" font-weight="800" fill="#B91C1C">5?</text>' }),
    binnen: WK.baas({ vorm: 'blob', kleur: '#60A5FA', kleur2: '#1E3A8A', mond: 'open', extra: '<rect x="8" y="14" width="104" height="96" rx="10" fill="none" stroke="#1E3A8A" stroke-width="3" stroke-dasharray="6 5" opacity=".7"/>' }),
    spiegel: WK.baas({ vorm: 'wolk', kleur: '#C084FC', kleur2: '#6B21A8', extra: '<ellipse cx="96" cy="30" rx="14" ry="18" fill="#E0F2FE" stroke="#A16207" stroke-width="4"/><path d="M90 22 l8 -4" stroke="#fff" stroke-width="2.4"/><text x="30" y="20" font-size="12" font-weight="800" fill="#6B21A8">35 × 22,4</text>' }),
    zijden: WK.baas({ vorm: 'lat', kleur: '#FBBF24', kleur2: '#92400E', extra: '<text x="60" y="22" font-size="18" font-weight="800" text-anchor="middle" fill="#92400E">× × ×</text>' }),
    dubbel: WK.baas({ vorm: 'blob', kleur: '#34D399', kleur2: '#065F46', ogen: 3, extra: '<text x="98" y="30" font-size="20" font-weight="800" fill="#065F46">+ +</text>' }),
  };

  /* =====================================================================
     vaste figuren (maten uit het boek, posities nagerekend)
     ===================================================================== */
  /* 62: rechthoekig bij Q (mm) */
  const PQR = (() => { const P = Pt(0, 0), Q_ = Pt(3.6, 0), R = Pt(3.6, 1.5); return {
    figuur: 'driehoek', pts: [{ ...P, l: 'P' }, { ...Q_, l: 'Q' }, { ...R, l: 'R' }],
    maten: [{ id: 'PQ', a: P, b: Q_, t: 'PQ = 36', soort: 'zijde', kant: 1 }, { id: 'QR', a: Q_, b: R, t: 'QR = 15', soort: 'zijde', kant: 1, haak: [Q_, P, R] }, { id: 'PR', a: P, b: R, t: 'PR = 39', soort: 'schuin', kant: -1 }],
    goed: [['PQ', 'QR']], kies: 'Rechthoekige driehoek (maten in mm). Tik een <b>zijde</b> en de <b>hoogte</b> die erbij hoort.',
    typ: { vraag: 'Hoeveel mm² stof is dit?', waarde: 270, eenheid: 'mm²', fouten: [{ waarde: 540, fout: '540 = 36 × 15. Dat is de hele rechthoek. Een driehoek is de helft: ½ × 36 × 15.', mis: 'W14' }, { waarde: 702, fout: '½ × 36 × 39: 39 is de schuine zijde PR, geen hoogte.', mis: 'W13' }, { waarde: 292.5, fout: '½ × 15 × 39: PR = 39 staat niet loodrecht op QR.', mis: 'W13' }], w: '½ × 36 × 15 = 270 mm². In een rechthoekige driehoek is de ene rechthoekszijde de hoogte bij de andere.' } }; })();
  /* 61: △EFG, H op FG (mm) */
  const EFG = (() => { const Gp = Pt(0, 0), H = Pt(.7, 0), F = Pt(2.5, 0), E = Pt(.7, 2.4); return {
    figuur: 'driehoek', pts: [{ ...E, l: 'E' }, { ...F, l: 'F' }, { ...Gp, l: 'G' }],
    maten: [{ id: 'FG', a: Gp, b: F, t: 'FG = 25', soort: 'zijde', kant: 1 }, { id: 'EH', a: E, b: H, t: 'EH = 24', soort: 'hoogte', kant: -1, haak: [H, E, F] },
      { id: 'EF', a: E, b: F, t: 'EF = 30', soort: 'schuin', kant: -1 }, { id: 'EG', a: Gp, b: E, t: 'EG = 25', soort: 'schuin', kant: -1 }],
    goed: [['FG', 'EH']], kies: 'Maten in mm. Tik een <b>zijde</b> en de <b>hoogte</b> die erbij hoort.',
    vraag: 'Hoeveel stof is △EFG?', opties: [{ t: '300 mm²', goed: true }, { t: '375 mm²', fout: '½ × 25 × 30: EF = 30 is schuin, geen hoogte.', mis: 'W13' }, { t: '600 mm²', fout: '25 × 24 is het hele parallellogram. Een driehoek is de helft.', mis: 'W14' }, { t: '300 mm', fout: 'Het getal klopt, maar oppervlakte is in mm².', mis: 'W21' }],
    w: '½ × 25 × 24 = 300 mm². De hoogte 24 staat loodrecht op FG.' }; })();
  /* voorbeeld 2.5A: △DEF (cm), G op EF */
  const DEF = (() => { const D = Pt(0, 0), E = Pt(2.6, 0), F = Pt(1.5231, 2.5846), Gv = G.proj(D, E, F); const Gp = Pt(Gv.x, Gv.y); return {
    figuur: 'driehoek', pts: [{ ...D, l: 'D' }, { ...E, l: 'E' }, { ...F, l: 'F' }],
    maten: [{ id: 'EF', a: E, b: F, t: 'EF = 2,8', soort: 'zijde', kant: 1 }, { id: 'DG', a: D, b: Gp, t: 'DG = 2,4', soort: 'hoogte', kant: -1, haak: [Gp, D, F], lp: Pt(1.15, .95) },
      { id: 'DE', a: D, b: E, t: 'DE = 2,6', soort: 'zijde', kant: 1, fout: 'Bij zijde DE ken je de hoogte niet: die vanuit F is niet getekend. Neem de zijde waar de stippellijn <b>loodrecht</b> op staat.', mis: 'W15' },
      { id: 'DF', a: D, b: F, t: 'DF = 3,0', soort: 'schuin', kant: -1 }],
    goed: [['EF', 'DG']], kies: 'Maten in cm. Van welke zijde ken je de hoogte? Tik die <b>zijde</b> en die <b>hoogte</b>.',
    typ: { vraag: 'Reken uit hoeveel stof △DEF is.', waarde: 3.36, eenheid: 'cm²', fouten: [{ waarde: 6.72, fout: '2,8 × 2,4 = 6,72 is twee driehoeken. Doe er ½ × bij.', mis: 'W14' }, { waarde: 3.12, fout: '½ × 2,6 × 2,4: DG hoort niet bij DE, maar bij EF.', mis: 'W15' }, { waarde: 4.2, fout: '½ × 2,8 × 3,0: DF = 3,0 is schuin.', mis: 'W13' }], w: '½ × 2,8 × 2,4 = 3,36 cm².' } }; })();
  /* L9: △ABC (mm), D op AC */
  const ABC9 = (() => { const A = Pt(0, 0), C = Pt(8.4, 0), D = Pt(2, 0), B = Pt(2, -4.8); return {
    figuur: 'driehoek', pts: [{ ...A, l: 'A' }, { ...B, l: 'B' }, { ...C, l: 'C' }],
    maten: [{ id: 'AC', a: A, b: C, t: 'AC = 84', soort: 'zijde', kant: -1 }, { id: 'BD', a: D, b: B, t: 'BD = 48', soort: 'hoogte', kant: -1, haak: [D, B, C] },
      { id: 'AB', a: A, b: B, t: 'AB = 52', soort: 'schuin', kant: 1 }, { id: 'BC', a: B, b: C, t: 'BC = 80', soort: 'schuin', kant: 1 }],
    goed: [['AC', 'BD']], kies: 'Maten in mm. Tik de <b>zijde</b> en de <b>hoogte</b> die erbij hoort.',
    vraag: 'Hoeveel stof is △ABC?', opties: [{ t: '2016 mm²', goed: true }, { t: '4032 mm²', fout: '84 × 48 zonder de ½: dat zijn twee driehoeken.', mis: 'W14' }, { t: '1248 mm²', fout: '½ × 52 × 48: BD staat niet loodrecht op AB.', mis: 'W15' }, { t: '3360 mm²', fout: '½ × 84 × 80: BC = 80 is schuin.', mis: 'W13' }],
    w: '½ × 84 × 48 = 2016 mm².' }; })();
  /* L9: △KLM, rechte hoek bij M (mm) */
  const KLM9 = (() => { const Kp = Pt(0, 0), M = Pt(3, 0), Lp = Pt(3, -1.6); return {
    figuur: 'driehoek', pts: [{ ...Kp, l: 'K' }, { ...M, l: 'M' }, { ...Lp, l: 'L' }],
    maten: [{ id: 'KM', a: Kp, b: M, t: 'KM = 30', soort: 'zijde', kant: -1 }, { id: 'ML', a: M, b: Lp, t: 'ML = 16', soort: 'zijde', kant: -1, haak: [M, Kp, Lp] }, { id: 'KL', a: Kp, b: Lp, t: 'KL = 34', soort: 'schuin', kant: 1 }],
    goed: [['KM', 'ML']], kies: 'Maten in mm. Tik een <b>zijde</b> en de <b>hoogte</b> die erbij hoort.',
    typ: { vraag: 'Hoeveel mm² stof?', waarde: 240, eenheid: 'mm²', fouten: [{ waarde: 480, fout: '30 × 16 is een rechthoek. Een driehoek is de helft.', mis: 'W14' }, { waarde: 510, fout: '½ × 30 × 34: KL = 34 is schuin.', mis: 'W13' }, { waarde: 272, fout: '½ × 34 × 16: ML staat niet loodrecht op KL.', mis: 'W13' }], w: '½ × 30 × 16 = 240 mm².' } }; })();
  /* voorbeeld 2.5B in het rooster: A(0,0), C(2,4), B(7,4) */
  const STOMP_B = (() => { const A = Pt(0, 0), C = Pt(2, 4), B = Pt(7, 4), H = Pt(0, 4); return {
    figuur: 'driehoek', rooster: true, tel: true, pts: [{ ...A, l: 'A' }, { ...B, l: 'B' }, { ...C, l: 'C' }],
    maten: [{ id: 'BC', a: C, b: B, t: 'BC', soort: 'zijde', kant: -1 }, { id: 'AH', a: A, b: H, t: 'hoogte', soort: 'hoogte', kant: -1, haak: [H, A, C], verleng: [H, C] },
      { id: 'AC', a: A, b: C, t: 'AC', soort: 'schuin', lp: Pt(1.9, 2.4) }, { id: 'AB', a: A, b: B, t: 'AB', soort: 'schuin', kant: 1 }],
    goed: [['BC', 'AH']], kies: 'Hokjes van 1 bij 1 cm. Welke zijde kun je <b>tellen</b>? Tik die zijde en de hoogte die erbij hoort.',
    typ: { vraag: 'Hoeveel cm² is △ABC?', waarde: 10, eenheid: 'cm²', fouten: [{ waarde: 20, fout: '5 × 4 = 20 is het parallellogram. De driehoek is de helft.', mis: 'W14' }, { waarde: 14, fout: '½ × 7 × 4: het stippelstuk hoort niet bij de zijde. BC is 5 hokjes.', mis: 'W16' }], w: '½ × 5 × 4 = 10 cm². De hoogte ligt <b>buiten</b> de driehoek, op het verlengde van BC.' } }; })();
  /* 67 IV in het rooster */
  const STOMP_IV = (() => { const Kp = Pt(0, 5), Lp = Pt(2, 0), M = Pt(8, 0), N = Pt(0, 0); return {
    figuur: 'driehoek', rooster: true, tel: true, pts: [{ ...Kp, l: 'K' }, { ...Lp, l: 'L' }, { ...M, l: 'M' }],
    maten: [{ id: 'LM', a: Lp, b: M, t: 'LM', soort: 'zijde', kant: 1 }, { id: 'KN', a: Kp, b: N, t: 'KN', soort: 'hoogte', kant: 1, haak: [N, Kp, Lp], verleng: [N, Lp] },
      { id: 'KL', a: Kp, b: Lp, t: 'KL', soort: 'schuin', kant: -1, lp: Pt(1.6, 2.7) }, { id: 'KM', a: Kp, b: M, t: 'KM', soort: 'schuin', kant: -1 }],
    goed: [['LM', 'KN']], kies: 'Hokjes van 1 bij 1 cm. Tik de zijde die je kunt tellen en de hoogte die erbij hoort.',
    vraag: 'Hoeveel stof is △KLM?', opties: [{ t: '15 cm²', goed: true }, { t: '30 cm²', fout: '6 × 5 zonder ½: dat is het parallellogram.', mis: 'W14' }, { t: '20 cm²', fout: '½ × 8 × 5: het stippelstuk is het <b>verlengde</b>, geen stof. LM = 6.', mis: 'W16' }, { t: '15 cm', fout: 'Het getal klopt, maar het is cm².', mis: 'W21' }],
    w: '½ × 6 × 5 = 15 cm². De hoogte KN staat buiten de driehoek.' }; })();
  /* 67 V in het rooster: verticale zijde */
  const STOMP_V = (() => { const P_ = Pt(0, 4), Q_ = Pt(7, 3), R = Pt(7, 0), S = Pt(7, 4); return {
    figuur: 'driehoek', rooster: true, tel: true, pts: [{ ...P_, l: 'P' }, { ...Q_, l: 'Q' }, { ...R, l: 'R' }],
    maten: [{ id: 'QR', a: Q_, b: R, t: 'QR', soort: 'zijde', kant: -1 }, { id: 'PS', a: P_, b: S, t: 'PS', soort: 'hoogte', kant: -1, haak: [S, P_, R], verleng: [Q_, S] },
      { id: 'PQ', a: P_, b: Q_, t: 'PQ', soort: 'schuin', lp: Pt(3.2, 2.9) }, { id: 'PR', a: P_, b: R, t: 'PR', soort: 'schuin', kant: 1 }],
    goed: [['QR', 'PS']], kies: 'Hokjes van 1 bij 1 cm. Hier is de zijde die je kunt tellen <b>verticaal</b>. Tik die en zijn hoogte.',
    typ: { vraag: 'Hoeveel cm² is △PQR?', waarde: 10.5, eenheid: 'cm²', fouten: [{ waarde: 21, fout: '3 × 7 zonder ½.', mis: 'W14' }, { waarde: 14, fout: '½ × 4 × 7: QR is 3 hokjes, het stuk erboven is het verlengde.', mis: 'W16' }], w: '½ × 3 × 7 = 10,5 cm².' } }; })();
  /* 67 III in het rooster */
  const STOMP_III = (() => { const Kp = Pt(2, 4), Lp = Pt(5, 4), M = Pt(0, 0), N = Pt(0, 4); return {
    figuur: 'driehoek', rooster: true, tel: true, pts: [{ ...Kp, l: 'K' }, { ...Lp, l: 'L' }, { ...M, l: 'M' }],
    maten: [{ id: 'KL', a: Kp, b: Lp, t: 'KL', soort: 'zijde', kant: -1 }, { id: 'MN', a: M, b: N, t: 'MN', soort: 'hoogte', kant: -1, haak: [N, M, Kp], verleng: [N, Kp] },
      { id: 'KM', a: M, b: Kp, t: 'KM', soort: 'schuin', lp: Pt(1.6, 1.4) }, { id: 'LM', a: M, b: Lp, t: 'LM', soort: 'schuin', kant: 1 }],
    goed: [['KL', 'MN']], kies: 'Tik de zijde die je kunt tellen en de hoogte die erbij hoort.',
    vraag: 'Hoeveel stof?', opties: [{ t: '6 cm²', goed: true }, { t: '12 cm²', fout: '3 × 4 zonder ½.', mis: 'W14' }, { t: '10 cm²', fout: '½ × 5 × 4: het stippelstuk is geen stof. KL = 3.', mis: 'W16' }, { t: '6 cm', fout: 'Oppervlakte is in cm².', mis: 'W21' }],
    w: '½ × 3 × 4 = 6 cm².' }; })();
  /* A69: △ABC met BC verlengd tot D (mm) */
  const A69 = (() => { const D = Pt(0, 0), C = Pt(1.8, 0), B = Pt(3.8, 0), A = Pt(0, 2.4); return {
    figuur: 'driehoek', pts: [{ ...A, l: 'A' }, { ...B, l: 'B' }, { ...C, l: 'C' }],
    maten: [{ id: 'BC', a: C, b: B, t: 'BC = 20', soort: 'zijde', kant: 1 }, { id: 'AD', a: A, b: D, t: 'AD = 24', soort: 'hoogte', haak: [D, A, C], verleng: [D, C], lp: Pt(-.82, 1.25) },
      { id: 'AC', a: A, b: C, t: 'AC = 30', soort: 'schuin', lp: Pt(1.15, .85) }, { id: 'AB', a: A, b: B, t: 'AB = 45', soort: 'schuin', kant: -1 }],
    goed: [['BC', 'AD']], marge: 2, kies: 'Maten in mm. Tik de <b>zijde</b> en de <b>hoogte</b> die erbij hoort. Kijk ook buiten de driehoek.',
    vraag: 'Hoeveel stof is △ABC?', opties: [{ t: '240 mm²', goed: true }, { t: '540 mm²', fout: '½ × 45 × 24: AD staat niet loodrecht op AB.', mis: 'W15' }, { t: '480 mm²', fout: '20 × 24 zonder ½.', mis: 'W14' }, { t: '456 mm²', fout: '½ × 38 × 24: het stippelstuk CD hoort niet bij de driehoek. BC = 20.', mis: 'W16' }],
    w: '½ × 20 × 24 = 240 mm². De hoogte ligt buiten de driehoek.' }; })();
  /* eigen parallellogram, twee zijden met elk hun hoogte (cm) */
  const PAR1 = (() => { const A = Pt(0, 0), B = Pt(15, 0), C = Pt(23, 6), D = Pt(8, 6), E = Pt(8, 0), F = Pt(9.6, 7.2); return {
    figuur: 'parallellogram', pts: [{ ...A, l: 'A' }, { ...B, l: 'B' }, { ...C, l: 'C' }, { ...D, l: 'D' }],
    maten: [{ id: 'AB', a: A, b: B, t: 'AB = 15', soort: 'zijde', kant: 1 }, { id: 'AD', a: A, b: D, t: 'AD = 10', soort: 'zijde', kant: -1 },
      { id: 'DE', a: D, b: E, t: 'DE = 6', soort: 'hoogte', kant: 1, haak: [E, D, B] }, { id: 'BF', a: B, b: F, t: 'BF = 9', soort: 'hoogte', kant: -1, haak: [F, B, A], verleng: [D, F], lp: Pt(13.5, 2) }],
    goed: [['AB', 'DE'], ['AD', 'BF']], kies: 'Maten in cm. Tik een <b>zijde</b> en de <b>hoogte</b> die erbij hoort. Er zijn twee goede paren.',
    vraag: 'Hoeveel stof is ABCD?', opties: [{ t: '90 cm²', goed: true }, { t: '150 cm²', fout: '15 × 10: AD = 10 is schuin ten opzichte van AB. Bij AB hoort hoogte 6.', mis: 'W17' }, { t: '45 cm²', fout: 'Bij een parallellogram geen ½: het is één hele rechthoek als je knipt en schuift.', mis: 'W18' }, { t: '135 cm²', fout: '15 × 9: BF staat loodrecht op AD, niet op AB.', mis: 'W15' }],
    w: '15 × 6 = 90 cm², en ook 10 × 9 = 90 cm². Elke zijde met zijn eigen hoogte.' }; })();
  /* L11: parallellogram KLMN (mm) */
  const KLMN11 = (() => { const Kp = Pt(0, 0), N = Pt(2, 0), O_ = Pt(1.2, 0), M = Pt(1.2, 1.5), Lp = Pt(-.8, 1.5); return {
    figuur: 'parallellogram', pts: [{ ...Kp, l: 'K' }, { ...N, l: 'N' }, { ...M, l: 'M' }, { ...Lp, l: 'L' }],
    maten: [{ id: 'KN', a: Kp, b: N, t: 'KN = 20', soort: 'zijde', kant: 1 }, { id: 'MO', a: M, b: O_, t: 'MO = 15', soort: 'hoogte', kant: 1, haak: [O_, M, N] }, { id: 'NM', a: N, b: M, t: 'NM = 17', soort: 'schuin', kant: 1 }],
    goed: [['KN', 'MO']], kies: 'Maten in mm. Tik de <b>zijde</b> en de <b>hoogte</b> die erbij hoort.',
    typ: { vraag: 'Hoeveel mm² stof is KLMN?', waarde: 300, eenheid: 'mm²', fouten: [{ waarde: 340, fout: '20 × 17: NM = 17 is schuin. Dat is de fout van Amir.', mis: 'W17' }, { waarde: 150, fout: 'Geen ½ bij een parallellogram.', mis: 'W18' }, { waarde: 255, fout: '17 × 15: MO staat loodrecht op KN, niet op NM.', mis: 'W15' }], w: '20 × 15 = 300 mm².' } }; })();
  /* simpel parallellogram in het rooster */
  const PAR_R = (() => { const A = Pt(0, 0), B = Pt(4, 0), C = Pt(6, 3), D = Pt(2, 3), E = Pt(2, 0); return {
    figuur: 'parallellogram', rooster: true, tel: true, pts: [{ ...A, l: 'A' }, { ...B, l: 'B' }, { ...C, l: 'C' }, { ...D, l: 'D' }],
    maten: [{ id: 'AB', a: A, b: B, t: 'AB', soort: 'zijde', kant: 1 }, { id: 'DE', a: D, b: E, t: 'DE', soort: 'hoogte', kant: 1, haak: [E, D, B] }, { id: 'AD', a: A, b: D, t: 'AD', soort: 'schuin', kant: -1 }, { id: 'BC', a: B, b: C, t: 'BC', soort: 'schuin', kant: 1 }],
    goed: [['AB', 'DE']], kies: 'Hokjes van 1 bij 1 cm. Tik de <b>zijde</b> en de <b>hoogte</b>.',
    vraag: 'Hoeveel stof?', opties: [{ t: '12 cm²', goed: true }, { t: '6 cm²', fout: 'Geen ½: knip en schuif, dan is het een rechthoek van 4 bij 3.', mis: 'W18' }, { t: '14 cm', fout: '4 + 3 + 4 + 3 is de omtrek (en die is ook nog fout, want AD is schuin).', mis: 'W20' }, { t: '12 cm', fout: 'Oppervlakte is in cm².', mis: 'W21' }],
    w: '4 × 3 = 12 cm².' }; })();
  /* 81: trapezium PQRS (cm) */
  const TRAP81 = (() => { const P_ = Pt(0, 0), Q_ = Pt(4.3, 0), T = Pt(1.6, 0), U = Pt(1.6, 1.5), S = Pt(.8, 1.5), R = Pt(2.3, 1.5); return {
    figuur: 'trapezium', pts: [{ ...P_, l: 'P' }, { ...Q_, l: 'Q' }, { ...R, l: 'R' }, { ...S, l: 'S' }],
    maten: [{ id: 'PQ', a: P_, b: Q_, t: 'PQ = 43', soort: 'zijde', kant: 1 }, { id: 'SR', a: S, b: R, t: 'SR = 15', soort: 'zijde', kant: -1 }, { id: 'UT', a: U, b: T, t: 'UT = 15', soort: 'hoogte', kant: -1, haak: [T, U, Q_] },
      { id: 'PS', a: P_, b: S, t: 'PS = 17', soort: 'schuin', kant: -1 }, { id: 'QR', a: Q_, b: R, t: 'QR = 25', soort: 'schuin', kant: 1 }],
    goed: [['PQ', 'SR', 'UT']],
    vraag: 'Hoeveel stof is trapezium PQRS? (maten in cm)', opties: [{ t: '435 cm²', goed: true }, { t: '870 cm²', fout: '(43 + 15) × 15 zonder ½: dat zijn twee trapezia samen.', mis: 'W14' }, { t: '493 cm²', fout: '½ × 58 × 17: PS = 17 is schuin, geen hoogte.', mis: 'W13' }, { t: '4837,5 cm²', fout: '½ × 43 × 15 × 15: de zijden niet vermenigvuldigen, maar <b>optellen</b>: 43 + 15 = 58.', mis: 'W19' }],
    w: '½ × (43 + 15) × 15 = ½ × 58 × 15 = 435 cm².' }; })();
  /* ruit met diagonalen 8 en 6, zijden 5 (cm) */
  const RUIT = (() => { const Lp = Pt(0, 3), R = Pt(8, 3), T = Pt(4, 6), B = Pt(4, 0); return {
    figuur: 'ruit', rooster: true, pts: [{ ...Lp, l: 'K' }, { ...B, l: 'L' }, { ...R, l: 'M' }, { ...T, l: 'N' }],
    maten: [{ id: 'KM', a: Lp, b: R, t: 'KM = 8', soort: 'diag', lp: Pt(1.9, 3) }, { id: 'LN', a: B, b: T, t: 'LN = 6', soort: 'diag', lp: Pt(4, 1.3) },
      { id: 'KN', a: Lp, b: T, t: 'KN = 5', soort: 'zijde', kant: -1 }, { id: 'MN', a: T, b: R, t: 'MN = 5', soort: 'zijde', kant: -1 }],
    goed: [['KM', 'LN']],
    vraag: 'Hoeveel stof is ruit KLMN?', opties: [{ t: '24 cm²', goed: true }, { t: '48 cm²', fout: '8 × 6 is de rechthoek om de ruit heen. De ruit is de helft.', mis: 'W14' }, { t: '25 cm²', fout: '5 × 5: een ruit is geen vierkant. De zijden staan schuin.', mis: 'W13' }, { t: '20 cm', fout: '5 + 5 + 5 + 5 is de omtrek.', mis: 'W20' }],
    w: '½ × 8 × 6 = 24 cm².' }; })();

  /* samengestelde figuren */
  const HUISJE = (() => { const A = Pt(0, 0), B = Pt(4, 0), C = Pt(4, 1), D = Pt(2.5, 2), E = Pt(0, 1); return {
    pts: [A, B, C, D, E], eenheid: 'cm²', rooster: true,
    maten: [[A, B, '4', 1], [B, C, '1', 1], [E, A, '1', 1]],
    splits: { lijnen: [[E, C]], stukken: [{ pts: [A, B, C, E], som: '4 × 1', stof: 'mint' }, { pts: [E, C, D], som: '½ × 4 × 1', stof: 'geel', lp: Pt(2.3, 1.3) }] },
    aanvul: { rechthoek: [A, B, Pt(4, 2), Pt(0, 2)], som: '4 × 2', gaten: [{ pts: [E, D, Pt(0, 2)], lp: Pt(.85, 1.68) }, { pts: [D, C, Pt(4, 2)], lp: Pt(3.5, 1.68) }] } }; })();
  const ZESHOEK = (() => { const A = Pt(0, 0), B = Pt(5, 0), C = Pt(5, 3), D = Pt(2, 2), E = Pt(2, 3), F = Pt(0, 3); return {
    pts: [A, B, C, D, E, F], eenheid: 'cm²', rooster: true,
    maten: [[A, B, '5', 1], [F, A, '3', 1], [F, E, '2', -1], [E, D, '1', -1]],
    splits: { lijnen: [[D, Pt(2, 0)], [D, Pt(5, 2)]], stukken: [{ pts: [A, Pt(2, 0), E, F], som: '2 × 3' }, { pts: [Pt(2, 0), B, Pt(5, 2), D], som: '3 × 2' }, { pts: [D, Pt(5, 2), C], som: '½ × 3 × 1', lp: Pt(4.1, 2.35) }] },
    aanvul: { rechthoek: [A, B, C, F], som: '5 × 3', gaten: [{ pts: [E, C, D], lp: Pt(2.9, 2.65) }] } }; })();
  const VIJF88 = (() => { const A = Pt(0, 0), B = Pt(30, 0), C = Pt(38, 15), D = Pt(38, 25), E = Pt(0, 25); return {
    pts: [A, B, C, D, E], eenheid: 'mm²', rooster: false,
    maten: [[A, B, '30', 1], [E, A, '25', 1], [E, D, '38', -1], [D, C, '10', -1]],
    splits: { lijnen: [[B, Pt(30, 25)]], stukken: [{ pts: [A, B, Pt(30, 25), E], som: '30 × 25' }, { pts: [B, C, D, Pt(30, 25)], som: '½ × (25 + 10) × 8', lp: Pt(34, 17) }] },
    aanvul: { rechthoek: [A, Pt(38, 0), D, E], som: '38 × 25', gaten: [{ pts: [B, Pt(38, 0), C], lp: Pt(35.6, 4.5) }] } }; })();
  const ZES13 = (() => { const A = Pt(0, 0), B = Pt(18, 0), C = Pt(18, 25), D = Pt(0, 25), E = Pt(5, 7), F = Pt(0, 7); return {
    pts: [A, B, C, D, E, F], eenheid: 'mm²', rooster: false,
    maten: [[A, B, '18', 1], [B, C, '25', 1], [F, E, '5', 1], [A, F, '7', -1]],
    splits: { lijnen: [[E, Pt(18, 7)]], stukken: [{ pts: [A, B, Pt(18, 7), F], som: '18 × 7' }, { pts: [E, Pt(18, 7), C, D], som: '½ × (13 + 18) × 18', lp: Pt(10.5, 15) }] },
    aanvul: { rechthoek: [A, B, C, D], som: '18 × 25', gaten: [{ pts: [D, E, F], lp: Pt(1.7, 12) }] } }; })();

  /* =====================================================================
     generatoren (steeds nieuwe getallen)
     ===================================================================== */
  const TRIPELS = [[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [12, 5, 13], [9, 12, 15], [12, 9, 15]];
  /* driehoek met zijde z, hoogte h en schuine zijde s (tripel) */
  function gDriehoek() {
    const [f, hh, s] = pick(TRIPELS), z = f + rnd(2, 8);
    const A = Pt(0, 0), B = Pt(z, 0), C = Pt(f, hh), D = Pt(f, 0);
    const beeld = stofBeeld([A, B, C], V => O.lap(V, [A, B, C], pick(['roze', 'mint', 'paars', 'geel'])) + hoogte(V, C, D, B, 'CD = ' + hh, f > z / 2 ? 1 : -1) + L(V, A, B, 'AB = ' + z) + L(V, A, C, 'AC = ' + s, -1) + letters(V, [{ ...A, l: 'A' }, { ...B, l: 'B' }, { ...C, l: 'C' }]));
    const goed = z * hh / 2;
    return QD('Hoeveel stof zit in △ABC? (maten in cm)', cm2(goed), [
      [cm2(z * s / 2), `${s} is de schuine zijde AC, geen hoogte. De hoogte is de stippellijn CD = ${hh}: ½ × ${z} × ${hh} = ${g(goed)}.`, 'W13'],
      [cm2(z * hh), `${z} × ${hh} = ${g(z * hh)} is het hele parallellogram. Een driehoek is de helft: ${g(goed)}.`, 'W14'],
      [g(goed) + ' cm', 'Het getal klopt, maar oppervlakte meet je in cm² (vierkantjes).', 'W21'],
    ], `½ × ${z} × ${hh} = ${g(goed)} cm².`, '', beeld);
  }
  function gTerug() {
    const z = pick([4, 5, 6, 8, 10, 12]), hh = rnd(3, 9), A = z * hh / 2;
    return QD(`Van △ABC is zijde AB = ${z} cm en de oppervlakte ${g(A)} cm². Hoe lang is de hoogte bij AB?`, hh + ' cm', [
      [g(A / z) + ' cm', `${g(A)} : ${z} vergeet de ½. Check: ½ × ${z} × ${g(A / z)} = ${g(A / 2)}, niet ${g(A)}. Hoogte = 2 × opp : zijde.`, 'W14'],
      [g(A - z) + ' cm', `Aftrekken werkt niet. Check: ½ × ${z} × ${hh} = ${g(A)}. Dus 2 × ${g(A)} : ${z} = ${hh}.`],
      [g(2 * A * z) + ' cm', `Vermenigvuldigen maakt het juist groter. Het is 2 × ${g(A)} <b>gedeeld door</b> ${z}.`],
    ], `hoogte = 2 × ${g(A)} : ${z} = ${hh} cm. Check: ½ × ${z} × ${hh} = ${g(A)}.`);
  }
  function gRecht() {
    const [a, b, c] = pick(TRIPELS), k = pick([1, 2, 3]), x = a * k, y = b * k, s = c * k;
    const P_ = Pt(0, 0), Q_ = Pt(x, 0), R = Pt(x, y);
    const beeld = stofBeeld([P_, Q_, R], V => O.lap(V, [P_, Q_, R], 'koraal') + O.rechteHoekPx(V, Q_, P_, R) + L(V, P_, Q_, String(x)) + L(V, Q_, R, String(y)) + L(V, P_, R, String(s), -1));
    return QD(`Een rechthoekige lap (maten in cm). Hoeveel stof?`, cm2(x * y / 2), [
      [cm2(x * s / 2), `${s} is de schuine zijde. De hoogte bij ${x} is de andere rechthoekszijde: ${y}.`, 'W13'],
      [cm2(x * y), `${x} × ${y} is de hele rechthoek. De driehoek is de helft.`, 'W14'],
      [cm2(x + y + s, 'cm'), `${x} + ${y} + ${s} is de omtrek: hoeveel band je om de rand naait.`, 'W20'],
    ], `½ × ${x} × ${y} = ${g(x * y / 2)} cm².`, '', beeld);
  }
  function gHalf() {
    const z = pick([6, 8, 10, 12, 14]), hh = pick([3, 5, 7, 9]);
    return QD(`Twee gelijke driehoekige lappen passen samen precies op een parallellogram van ${z} bij ${hh} cm (hoogte ${hh}). Hoeveel stof is één driehoek?`, cm2(z * hh / 2), [
      [cm2(z * hh), `${z} × ${hh} is het parallellogram, dus twee driehoeken.`, 'W14'],
      [cm2(z * hh / 4), 'Dat is een kwart. Twee driehoeken = één parallellogram, dus één driehoek is de <b>helft</b>.'],
      [cm2(z + hh, 'cm'), 'Optellen geeft geen oppervlakte.', 'W20'],
    ], `½ × ${z} × ${hh} = ${g(z * hh / 2)} cm².`);
  }
  /* stompe driehoek in het rooster: zijde b, top e hokjes voorbij het eind, hoogte h */
  function gStomp() {
    const b = rnd(2, 6), e = rnd(1, 3), hh = rnd(2, 5);
    const A = Pt(0, 0), B = Pt(b, 0), C = Pt(b + e, hh), D = Pt(b + e, 0);
    const V = WK.vlak({ xmin: -1, xmax: b + e + 1, ymin: -1, ymax: hh + 1, s: Math.min(40, 330 / (b + e + 2)) });
    V.voeg('figuur', V.veelhoek([A, B, C], { vul: '#FBCFE8', kleur: '#9D174D' }) + verleng(V, B, D) + hoogte(V, C, D, B, '') + letters(V, [{ ...A, l: 'A' }, { ...B, l: 'B' }, { ...C, l: 'C' }]));
    const goed = b * hh / 2;
    return QD('Hokjes van 1 bij 1 cm. Hoeveel stof is △ABC?', cm2(goed), [
      [cm2((b + e) * hh / 2), `½ × ${b + e} × ${hh}: het stippelstuk is het <b>verlengde</b>, geen stof. AB = ${b}.`, 'W16'],
      [cm2(b * hh), `${b} × ${hh} zonder ½.`, 'W14'],
      ['kan niet, de hoogte ligt erbuiten', `Mag wel! De hoogte staat loodrecht op het <b>verlengde</b> van AB. ½ × ${b} × ${hh} = ${g(goed)}.`, 'W16'],
    ], `½ × ${b} × ${hh} = ${g(goed)} cm². De hoogte ligt buiten de driehoek.`, '', V.svg.outerHTML);
  }
  function gStompTekst() {
    const [f, hh, s] = pick(TRIPELS), b = rnd(2, 9) * 2, c = G.rond(Math.hypot(b + f, hh), 1);
    return QD(`In △KLM is ∠L stomp. KL = ${b} mm. De hoogte vanuit M staat loodrecht op het verlengde van KL en is ${hh} mm. LM = ${s} mm en KM = ${g(c)} mm. Oppervlakte?`, cm2(b * hh / 2, 'mm²'), [
      [cm2(b * s / 2, 'mm²'), `½ × ${b} × ${s}: LM = ${s} is schuin, geen hoogte.`, 'W13'],
      [cm2(b * hh, 'mm²'), 'De ½ ontbreekt.', 'W14'],
      [cm2(r2(c * hh / 2), 'mm²'), `½ × ${g(c)} × ${hh}: de hoogte staat niet loodrecht op KM, maar op (het verlengde van) KL.`, 'W15'],
    ], `½ × ${b} × ${hh} = ${g(b * hh / 2)} mm².`);
  }
  const r2 = x => Math.round(x * 100) / 100;
  function gTerugStomp() {
    const z = pick([10, 12, 15, 20, 24, 30]), hh = pick([8, 12, 16, 18, 24]), A = z * hh / 2;
    return QD(`De oppervlakte van stompe △ABC is ${g(A)} mm². Zijde AC = ${z} mm. Hoe lang is de hoogte bij AC?`, hh + ' mm', [
      [g(A / z) + ' mm', `${g(A)} : ${z} vergeet de ½. Hoogte = 2 × ${g(A)} : ${z} = ${hh}.`, 'W14'],
      [g(A * 2) + ' mm', `2 × ${g(A)} moet je nog <b>delen door</b> de zijde ${z}.`],
      ['niet te doen, die ligt buiten', 'Kan wel: ook een hoogte buiten de driehoek reken je zo terug.', 'W16'],
    ], `hoogte = 2 × ${g(A)} : ${z} = ${hh} mm.`);
  }
  /* parallellogram met zijde z, hoogte h, schuine zijde s */
  function gPar() {
    const [f, hh, s] = pick(TRIPELS), z = f + rnd(2, 8);
    const A = Pt(0, 0), B = Pt(z, 0), C = Pt(z + f, hh), D = Pt(f, hh), E = Pt(f, 0);
    const beeld = stofBeeld([A, B, C, D], V => O.lap(V, [A, B, C, D], pick(['roze', 'mint', 'paars', 'denim'])) + hoogte(V, D, E, B, 'DE = ' + hh, -1) + L(V, A, B, 'AB = ' + z) + L(V, A, D, 'AD = ' + s, -1) + letters(V, [{ ...A, l: 'A' }, { ...B, l: 'B' }, { ...C, l: 'C' }, { ...D, l: 'D' }]));
    return QD('Hoeveel stof is parallellogram ABCD? (maten in cm)', cm2(z * hh), [
      [cm2(z * s), `${z} × ${s}: AD = ${s} is de schuine zijde. Dat is de fout van Amir.`, 'W17'],
      [cm2(z * hh / 2), 'Geen ½: knip het driehoekje af en schuif het, dan heb je een hele rechthoek.', 'W18'],
      [cm2(2 * z + 2 * s, 'cm'), 'Dat is de omtrek, niet de stof.', 'W20'],
    ], `${z} × ${hh} = ${g(z * hh)} cm².`, '', beeld);
  }
  function gParTerug() {
    const z = pick([5, 6, 8, 10, 12, 15]), hh = rnd(3, 9), A = z * hh;
    return QD(`Een parallellogram heeft oppervlakte ${A} cm² en zijde ${z} cm. Hoe lang is de hoogte bij die zijde?`, hh + ' cm', [
      [g(2 * A / z) + ' cm', `2 × ${A} : ${z} is terugrekenen bij een <b>driehoek</b>. Bij een parallellogram is het gewoon ${A} : ${z}.`, 'W18'],
      [g(A - z) + ' cm', 'Aftrekken klopt niet. Check: zijde × hoogte = oppervlakte.'],
      [g(A * z) + ' cm', 'Delen, niet vermenigvuldigen.'],
    ], `${A} : ${z} = ${hh} cm. Check: ${z} × ${hh} = ${A}.`);
  }
  function gParCoord() {
    const x0 = -rnd(1, 3), b = rnd(3, 6), s = rnd(1, 3), y0 = -rnd(1, 2), hh = rnd(2, 4);
    const A = Pt(x0, y0), B = Pt(x0 + b, y0), C = Pt(x0 + b + s, y0 + hh), D = Pt(x0 + s, y0 + hh);
    const fmt = q => `(${q.x}, ${q.y})`.replace(/-/g, '−');
    const V = WK.vlak({ xmin: x0 - 1, xmax: Math.max(x0 + b + s + 1, 2), ymin: y0 - 1, ymax: Math.max(y0 + hh + 1, 2), s: 30, assen: true });
    V.voeg('figuur', V.veelhoek([A, B, C, D], { vul: '#DDD6FE', kleur: '#5B21B6' }) + letters(V, [{ ...A, l: 'A' }, { ...B, l: 'B' }, { ...C, l: 'C' }, { ...D, l: 'D' }]));
    return QD(`A${fmt(A)}, B${fmt(B)}, C${fmt(C)} en D${fmt(D)}. Hoeveel cm² is parallellogram ABCD?`, cm2(b * hh), [
      [cm2(b * hh / 2), 'Geen ½ bij een parallellogram.', 'W18'],
      [cm2(r2(b * Math.hypot(s, hh))), `Dat is AB × AD, en AD is schuin. Tel de hoogte: ${hh} hokjes.`, 'W17'],
      [cm2(b + hh, 'cm'), 'Optellen geeft geen oppervlakte.', 'W20'],
    ], `AB = ${b} en de hoogte = ${hh}: ${b} × ${hh} = ${b * hh} cm².`, '', V.svg.outerHTML);
  }
  /* trapezium onder a, boven b, hoogte h */
  function gTrap() {
    const hh = pick([3, 4, 5, 6, 8, 10]), a = rnd(6, 14), b = rnd(2, a - 2), s = rnd(1, a - b);
    const A = Pt(0, 0), B = Pt(a, 0), C = Pt(s + b, hh), D = Pt(s, hh), E = Pt(s, 0);
    const beeld = stofBeeld([A, B, C, D], V => O.lap(V, [A, B, C, D], pick(['geel', 'mint', 'paars', 'koraal'])) + hoogte(V, D, E, B, String(hh), -1) + L(V, A, B, String(a)) + L(V, D, C, String(b), -1));
    const goed = (a + b) * hh / 2;
    return QD('Hoeveel stof is dit trapezium? (maten in cm)', cm2(goed), [
      [cm2(a * b * hh / 2), `½ × ${a} × ${b} × ${hh}: zijden niet vermenigvuldigen. Eerst <b>optellen</b>: ${a} + ${b} = ${a + b}.`, 'W19'],
      [cm2((a + b) * hh), `(${a} + ${b}) × ${hh} zonder ½: dat zijn twee trapezia.`, 'W14'],
      [cm2(a * hh), `${a} × ${hh} telt alleen de onderkant. Het trapezium is boven smaller.`],
    ], `½ × (${a} + ${b}) × ${hh} = ½ × ${a + b} × ${hh} = ${g(goed)} cm².`, '', beeld);
  }
  function gTrapTerug() {
    const a = rnd(6, 14), b = rnd(2, a - 1), hh = pick([2, 4, 5, 6, 8]), A = (a + b) * hh / 2;
    return QD(`Trapezium ABCD: AB = ${a} cm, CD = ${b} cm (evenwijdig), oppervlakte ${g(A)} cm². Hoe groot is de hoogte?`, hh + ' cm', [
      [g(A / (a + b)) + ' cm', `${g(A)} : ${a + b} vergeet de ½. Check: ½ × ${a + b} × ${g(A / (a + b))} = ${g(A / 2)}.`, 'W14'],
      [g(r2(2 * A / (a * b))) + ' cm', `Niet ${a} × ${b}: de evenwijdige zijden tel je <b>op</b>.`, 'W19'],
      [g(r2(A / a)) + ' cm', `Alleen AB gebruiken klopt niet: je hebt ½ × (${a} + ${b}) nodig.`],
    ], `½ × ${a + b} × h = ${g(A)}, dus h = 2 × ${g(A)} : ${a + b} = ${hh} cm.`);
  }
  function gRuit() {
    const d1 = pick([6, 8, 10, 12, 14, 18, 24]), d2 = pick([4, 6, 8, 10, 12]);
    return QD(`Een ruit-patroon voor een kussen heeft diagonalen van ${d1} cm en ${d2} cm. Hoeveel stof?`, cm2(d1 * d2 / 2), [
      [cm2(d1 * d2), `${d1} × ${d2} is de rechthoek om de ruit. De ruit is de helft.`, 'W14'],
      [cm2(d1 + d2, 'cm'), 'Optellen geeft geen oppervlakte.', 'W20'],
      [cm2(d1 * d2 / 4), `Dat is een kwart: ½ × ${d1} × ${d2}, niet ¼.`],
    ], `½ × ${d1} × ${d2} = ${g(d1 * d2 / 2)} cm².`);
  }
  function gRuitTerug() {
    const d1 = pick([8, 10, 12, 16, 20]), d2 = pick([4, 6, 9, 12, 15]), A = d1 * d2 / 2;
    return QD(`Ruit ABCD: diagonaal AC = ${d1} cm en de oppervlakte is ${g(A)} cm². Hoe lang is BD?`, d2 + ' cm', [
      [g(A / d1) + ' cm', `${g(A)} : ${d1} vergeet de ½. BD = 2 × ${g(A)} : ${d1}.`, 'W14'],
      [g(A - d1) + ' cm', 'Aftrekken werkt niet.'],
      [g(A * 2) + ' cm', `2 × ${g(A)} moet je nog delen door ${d1}.`],
    ], `BD = 2 × ${g(A)} : ${d1} = ${d2} cm.`);
  }
  /* L-vorm in het rooster: rechthoek w × hh met een hoek eruit (c × d) */
  function gL() {
    const w = rnd(4, 7), hh = rnd(3, 5), c = rnd(1, w - 2), d = rnd(1, hh - 1);
    const pts = [Pt(0, 0), Pt(w, 0), Pt(w, hh - d), Pt(w - c, hh - d), Pt(w - c, hh), Pt(0, hh)];
    const V = WK.vlak({ xmin: -1, xmax: w + 1, ymin: -1, ymax: hh + 1, s: Math.min(40, 330 / (w + 2)) });
    V.voeg('figuur', V.veelhoek(pts, { vul: '#FDE68A', kleur: '#92400E' }));
    const goed = w * hh - c * d, omtrek = 2 * w + 2 * hh;
    return QD('Een tasje van stof (hokjes van 1 bij 1 cm). Hoeveel stof?', cm2(goed), [
      [cm2(w * hh), `${w} × ${hh} is de hele rechthoek. Het hoekje van ${c} × ${d} moet er nog <b>af</b>.`, 'W22'],
      [cm2(w * hh + c * d), 'Het hoekje hoort er niet bij: eraf halen, niet erbij.', 'W22'],
      [cm2(omtrek, 'cm'), 'Dat is de omtrek: alle randen opgeteld.', 'W20'],
    ], `${w} × ${hh} − ${c} × ${d} = ${goed} cm².`, '', V.svg.outerHTML);
  }
  function gHuis() {
    const w = pick([4, 6, 8, 10]), hh = rnd(2, 5), t = rnd(1, 3);
    const top = Pt(w / 2, hh + t), pts = [Pt(0, 0), Pt(w, 0), Pt(w, hh), top, Pt(0, hh)];
    const beeld = stofBeeld(pts, V => O.lap(V, pts, 'denim', { naad: false }) + V.stuk(Pt(0, hh), Pt(w, hh), { kleur: '#fff', dik: 2, stip: true }) + L(V, Pt(0, 0), Pt(w, 0), String(w)) + L(V, Pt(w, 0), Pt(w, hh), String(hh)) + hoogte(V, top, Pt(w / 2, hh), Pt(w, hh), String(t), -1));
    const goed = w * hh + w * t / 2;
    return QD('Een etui in de vorm van een huisje (maten in cm). Hoeveel stof?', cm2(goed), [
      [cm2(w * (hh + t)), `${w} × ${hh + t} is de rechthoek om het hele huisje. De twee hoekjes naast het dak moeten eraf.`, 'W22'],
      [cm2(w * hh + w * t), `Het dak is een driehoek: ½ × ${w} × ${t}, niet ${w} × ${t}.`, 'W14'],
      [g(goed) + ' cm', 'Het getal klopt, maar oppervlakte is in cm².', 'W21'],
    ], `${w} × ${hh} + ½ × ${w} × ${t} = ${g(goed)} cm².`, '', beeld);
  }
  function gOmtrek() {
    const a = rnd(3, 9), b = rnd(2, 7);
    return pick([
      () => QD(`Storm naait een lint om de rand van een lap van ${a} bij ${b} dm. Hoeveel lint?`, (2 * a + 2 * b) + ' dm', [
        [a * b + ' dm²', 'Dat is de stof zelf. Een lint om de rand is de <b>omtrek</b>: alle randen opgeteld.', 'W20'],
        [(a + b) + ' dm', `${a} + ${b} is maar de helft van de rand. Er zijn vier randen.`],
        [(2 * a + 2 * b) + ' dm²', 'Het getal klopt, maar een lint is een lengte: dm, geen dm².', 'W21']], `${a} + ${b} + ${a} + ${b} = ${2 * a + 2 * b} dm.`),
      () => QD(`Een lap stof van ${a} bij ${b} dm. Hoeveel stof is dat?`, a * b + ' dm²', [
        [(2 * a + 2 * b) + ' dm', 'Dat is de omtrek: de rand. Stof = oppervlakte.', 'W20'],
        [a * b + ' dm', 'Het getal klopt, maar stof meet je in dm².', 'W21'],
        [(a + b) + ' dm²', 'Optellen geeft geen oppervlakte. Vermenigvuldig.', 'W20']], `${a} × ${b} = ${a * b} dm².`),
    ])();
  }
  function gEenheid() {
    return pick([
      () => QD('Alle maten van een figuur zijn in mm. In welke eenheid is de oppervlakte?', 'mm²', [['mm', 'mm is een lengte. Oppervlakte is vierkantjes: mm².', 'W21'], ['cm²', 'Je hebt niet omgerekend, dus blijft het mm².'], ['mm³', 'mm³ is inhoud (blokjes).']], 'Lengte in mm → oppervlakte in mm².'),
      () => QD('Hoeveel cm² is 1 dm²?', '100 cm²', [['10 cm²', 'Een dm² is een vierkant van 10 bij 10 cm: 10 × 10 = 100.'], ['1000 cm²', '1000 hoort bij inhoud (dm³ en cm³).'], ['1 cm²', 'Een dm² is veel groter dan een cm².']], '10 × 10 = 100 cm².'),
      () => QD('Hoeveel cm² is 1 m²?', '10 000 cm²', [['100 cm²', '1 m = 100 cm, dus 1 m² = 100 × 100 = 10 000 cm².'], ['1000 cm²', '100 × 100 = 10 000, niet 1000.'], ['10 cm²', 'Veel te weinig.']], '100 × 100 = 10 000 cm².'),
    ])();
  }

  /* ---------- vaste tekeningen voor uitleg en vragen ---------- */
  const IMG = {
    /* O60: rechthoek 10 bij 6 met driehoek */
    o60: () => { const A = Pt(0, 0), B = Pt(10, 0), D = Pt(10, 6), E = Pt(0, 6), C = Pt(6, 6); return stofBeeld([A, B, D, E], V => O.lap(V, [A, B, C], 'roze') + O.lap(V, [A, C, E], 'koraal', { op: .55 }) + O.lap(V, [B, D, C], 'koraal', { op: .55 }) + L(V, A, B, '10') + L(V, A, E, '6', -1) + L(V, E, C, '6', -1) + L(V, C, D, '4', -1) + letters(V, [{ ...A, l: 'A' }, { ...B, l: 'B' }, { ...C, l: 'C' }, { ...D, l: 'D' }, { ...E, l: 'E' }]), { rooster: true, maxS: 30 }); },
    /* de regel: driehoek met hoogte */
    regel: () => { const A = Pt(0, 0), B = Pt(6, 0), C = Pt(2, 4), D = Pt(2, 0); return stofBeeld([A, B, C], V => O.lap(V, [A, B, C], 'roze') + hoogte(V, C, D, B, 'hoogte', 1) + L(V, A, B, 'zijde'), { maxS: 40 }); },
    /* de drie hoogtes van △PQR */
    drieHoogtes: () => { const P_ = Pt(0, 0), Q_ = Pt(6, 0), R = Pt(2, 4); const S = Pt(2, 0), T = G.proj(P_, Q_, R), U = G.proj(Q_, P_, R);
      return stofBeeld([P_, Q_, R], V => O.lap(V, [P_, Q_, R], 'paars', { op: .5 }) + V.stuk(R, S, { kleur: '#0891B2', dik: 2.4, stip: true }) + V.stuk(P_, Pt(T.x, T.y), { kleur: '#DB2777', dik: 2.4, stip: true }) + V.stuk(Q_, Pt(U.x, U.y), { kleur: '#16A34A', dik: 2.4, stip: true }) + letters(V, [{ ...P_, l: 'P' }, { ...Q_, l: 'Q' }, { ...R, l: 'R' }]) + O.tekstOp(V, Pt(S.x, -.45), 'S', { fs: 14 }) + O.tekstOp(V, G.plus(T, Pt(.35, .2)), 'T', { fs: 14 }) + O.tekstOp(V, G.plus(U, Pt(-.4, .15)), 'U', { fs: 14 }), { maxS: 40 }); },
    /* O66: gebouw met driehoekige gevel (m) */
    gebouw: () => { const P_ = Pt(0, 0), Q_ = Pt(3.3, 0), S = Pt(4.2, 0), R = Pt(4.2, 4.0); return stofBeeld([P_, Q_, S, R], V => O.lap(V, [P_, Q_, R], 'geel') + verleng(V, Q_, S) + V.stuk(R, S, { kleur: K.inkt, dik: 2.2, stip: true }) + O.rechteHoekPx(V, S, R, Q_) + L(V, P_, Q_, '33') + L(V, Q_, S, '9') + L(V, P_, R, '58', -1) + L(V, Q_, R, '41', -1) + L(V, R, S, '40', -1) + letters(V, [{ ...P_, l: 'P' }, { ...Q_, l: 'Q' }, { ...R, l: 'R' }, { ...S, l: 'S' }]), { maxS: 40 }); },
    /* L10: △PQR met hoogte RS buiten (mm) */
    l10: () => { const S = Pt(0, 0), P_ = Pt(4.2, 0), Q_ = Pt(9, 0), R = Pt(0, 4.8); return stofBeeld([S, Q_, R], V => O.lap(V, [P_, Q_, R], 'mint') + verleng(V, S, P_) + V.stuk(R, S, { kleur: K.hoogtelijn, dik: 2.4, stip: true }) + O.rechteHoekPx(V, S, R, P_) + L(V, P_, Q_, '48') + L(V, S, P_, '42') + L(V, R, S, '48') + L(V, R, Q_, '102', -1) + letters(V, [{ ...P_, l: 'P' }, { ...Q_, l: 'Q' }, { ...R, l: 'R' }, { ...S, l: 'S' }]), { maxS: 40 }); },
    /* stomp: de hoogte valt buiten */
    stompRegel: () => { const A = Pt(0, 0), B = Pt(3, 0), C = Pt(5, 3), D = Pt(5, 0); return stofBeeld([A, B, C, D], V => O.lap(V, [A, B, C], 'mint') + verleng(V, B, D) + hoogte(V, C, D, B, 'hoogte', -1) + L(V, A, B, 'zijde') + letters(V, [{ ...A, l: 'A' }, { ...B, l: 'B' }, { ...C, l: 'C' }]), { maxS: 40 }); },
    /* parallellogram tegenover rechthoek (haak) */
    tweeLappen: () => { const r = [Pt(0, 0), Pt(5, 0), Pt(5, 3), Pt(0, 3)], q = [Pt(6.5, 0), Pt(11.5, 0), Pt(13.5, 3), Pt(8.5, 3)];
      return stofBeeld([...r, ...q], V => O.lap(V, r, 'denim') + O.lap(V, q, 'roze') + L(V, r[0], r[1], '5') + L(V, r[1], r[2], '3') + L(V, q[0], q[1], '5') + V.stuk(q[3], Pt(8.5, 0), { kleur: K.hoogtelijn, dik: 2.2, stip: true }) + O.tekstOp(V, Pt(9.4, 1.5), '3', { fs: 15, kleur: WK.donker(K.hoogtelijn, .3) }), { rooster: true, maxS: 30, marge: .7 }); },
    /* hoogte op vele plaatsen */
    vaakHoogte: () => { const A = Pt(0, 0), B = Pt(5, 0), C = Pt(7, 3), D = Pt(2, 3);
      return stofBeeld([A, B, C, D], V => O.lap(V, [A, B, C, D], 'roze', { op: .7 }) + [2, 3, 4, 5].map(x => V.stuk(Pt(x, 3), Pt(x, 0), { kleur: '#DC2626', dik: 2.2, stip: true })).join('') + verleng(V, B, Pt(7, 0)) + V.stuk(C, Pt(7, 0), { kleur: '#DC2626', dik: 2.2, stip: true }) + L(V, A, B, 'zijde') + O.tekstOp(V, Pt(3.5, 3.55), 'alle rode lijnen zijn de hoogte', { fs: 13 }), { maxS: 40 }); },
    /* ruit in een rechthoek */
    ruitRecht: () => { const r = [Pt(0, 0), Pt(6, 0), Pt(6, 4), Pt(0, 4)], q = [Pt(3, 0), Pt(6, 2), Pt(3, 4), Pt(0, 2)];
      return stofBeeld(r, V => V.veelhoek(r, { kleur: K.inkt, dik: 2, stip: true }) + O.lap(V, q, 'paars') + V.stuk(q[3], q[1], { kleur: '#7C3AED', dik: 2 }) + V.stuk(q[0], q[2], { kleur: '#7C3AED', dik: 2 }) + L(V, r[0], r[1], 'd₁') + L(V, r[1], r[2], 'd₂'), { rooster: true, maxS: 40 }); },
    huisje: () => stofBeeld(HUISJE.pts, V => O.lap(V, HUISJE.pts, 'denim') + L(V, Pt(0, 0), Pt(4, 0), '4') + L(V, Pt(4, 0), Pt(4, 1), '1') + V.stuk(Pt(2.5, 2), Pt(2.5, 1), { kleur: K.hoogtelijn, dik: 2, stip: true }) + O.tekstOp(V, Pt(2.85, 1.45), '1', { fs: 14 }), { rooster: true, maxS: 46 }),
    /* konijnenhok: driehoekig prisma (cm) */
    hok: () => `<svg viewBox="0 0 320 190" role="img" aria-label="konijnenhok"><rect width="320" height="190" rx="14" fill="#FFFEF8"/><ellipse cx="170" cy="168" rx="140" ry="9" fill="#000" opacity=".1"/>` +
      `<path d="M40 150 L240 150 L290 110 L90 110Z" fill="#C98A4B" stroke="#7A4E2A" stroke-width="2"/>` +
      `<path d="M40 150 L90 110 L65 60Z" fill="#CFFAFE" fill-opacity=".7" stroke="#0E7490" stroke-width="2"/><path d="M240 150 L290 110 L265 60Z" fill="#CFFAFE" fill-opacity=".85" stroke="#0E7490" stroke-width="2"/>` +
      `<path d="M65 60 L265 60 L290 110 L90 110Z" fill="#E0F2FE" fill-opacity=".55" stroke="#0E7490" stroke-width="2"/><path d="M65 60 L265 60 L240 150 L40 150Z" fill="#E0F2FE" fill-opacity=".4" stroke="#0E7490" stroke-width="2"/>` +
      Array.from({ length: 9 }, (_, i) => `<path d="M${85 + i * 20} 60 L${60 + i * 20} 150" stroke="#0E7490" stroke-width="1" opacity=".5"/>`).join('') +
      `<path d="M265 60 V130" stroke="#0891B2" stroke-width="2" stroke-dasharray="5 4"/>` +
      `<text x="140" y="170" font-size="14" font-weight="800" text-anchor="middle" fill="#2B1E3A">110 cm</text><text x="282" y="150" font-size="14" font-weight="800" fill="#2B1E3A">60</text><text x="272" y="100" font-size="14" font-weight="800" fill="#0E7490">40</text><text x="30" y="100" font-size="14" font-weight="800" fill="#2B1E3A">50</text></svg>`,
  };

  /* =====================================================================
     §2.5 LES 1: oppervlakte van een driehoek
     ===================================================================== */
  const lesDriehoek = { id: 'opp-driehoek', titel: 'Oppervlakte van een driehoek', sub: '§2.5 · ½ × zijde × hoogte', bol: ob(WK.badge.schaar()), orgs: ['o-schaar'],
    stappen: [
      { ...QD('Welkom in Het Atelier! Mama knipt uit een lap van 10 bij 6 (60 hokjes) de roze driehoek voor een sjaal. Hoeveel hokjes stof zit in de driehoek? Gok maar.', '30', [
        ['60', '60 is de hele lap. De twee lichte hoekstukken gaan er nog af.', 'W14'],
        ['24', '6 × 4 = 24 is maar een stukje. Leg de twee lichte hoekstukken eens óp de driehoek: ze passen precies.'],
        ['32', '10 + 6 + 6 + 10 = 32 is de rand van de lap. Stof tel je in hokjes.', 'W20']],
        'De twee lichte hoekstukken passen samen precies op de driehoek. De driehoek is dus de <b>helft</b> van 60.', 'Even proberen: fout mag.', IMG.o60()), coach: 'Hoi Storm! Welkom in Het Atelier. Hier is oppervlakte gewoon: hoeveel stof heb je nodig?' },
      toon('Nu doe jij het. Hier is een <b>tweede, precies even grote</b> driehoek. Sleep hem omhoog: hij draait om. Wat krijg je samen?', 'knipschuif', { modus: 'driehoek', a: 6, h: 4, top: 2 }, { hint: 'Sleep het oranje rondje helemaal omhoog.' }),
      uitleg('Twee gelijke driehoeken vormen samen een <b>parallellogram</b>. Dat is zijde × hoogte. Eén driehoek is de helft. Let op: de zijde en de hoogte staan <b>loodrecht</b> op elkaar.', `${IMG.regel()}<div style="margin-top:8px">opp. driehoek = <b>½ × zijde × bijbehorende hoogte</b></div>`),
      snap('d-half', 'Snap je waarom er <b>½</b> in de formule staat?',
        [[QD('Een driehoekige lap heeft zijde 8 cm en de hoogte erbij is 5 cm. Hoeveel stof?', '20 cm²', [['40 cm²', '8 × 5 = 40 is het hele parallellogram. De driehoek is de helft: 20.', 'W14'], ['13 cm²', '8 + 5 is optellen. Oppervlakte: ½ × 8 × 5.', 'W20'], ['20 cm', 'Het getal klopt, maar stof meet je in cm².', 'W21']], '½ × 8 × 5 = 20 cm².'),
          VQ('knipschuif', { modus: 'driehoek', a: 4, h: 3, top: 3, stof2: 'mint', vraag: 'Hoeveel hokjes stof is één driehoek?', opties: [{ t: '6', goed: true }, { t: '12', fout: '12 is het parallellogram, dus twee driehoeken. Eén is de helft.', mis: 'W14' }, { t: '7', fout: '4 + 3 = 7 is optellen. ½ × 4 × 3 = 6.', mis: 'W20' }, { t: '3', fout: 'Dat is een kwart. Twee driehoeken samen zijn 12, dus één is 6.' }], w: '½ × 4 × 3 = 6.' }, 'Laat zien: sleep, en zeg dan hoeveel stof.')],
         [VQ('maatkiezer', PQR, 'Laat zien welke maten je nodig hebt.'),
          QD('Waarom staat er ½ in de formule van de driehoek?', 'Twee gelijke driehoeken maken samen een parallellogram', [
            ['Omdat een driehoek drie zijden heeft en geen vier', 'Het aantal zijden is niet de reden. Leg twee gelijke driehoeken tegen elkaar: samen zijde × hoogte.'],
            ['Omdat de hoogte maar half zo lang is als de zijde', 'De hoogte kan elke lengte hebben. De ½ komt doordat twee driehoeken samen één parallellogram zijn.'],
            ['Omdat je de schuine zijde moet halveren', 'De schuine zijde doet niet mee.', 'W13']], 'Twee driehoeken = één parallellogram (zijde × hoogte). Eén driehoek is de helft.')]],
        [[uitleg('Andere manier: kijk naar de lap van mama. Teken een <b>rechthoek</b> om de driehoek. De lichte hoekstukken links en rechts passen samen precies op de roze driehoek. Dus driehoek = de helft van de rechthoek: ½ × 10 × 6 = 30.', IMG.o60())],
         [toon('Nog een manier, met een <b>rechthoekige</b> driehoek. Sleep de tweede driehoek omhoog. Wat krijg je nu?', 'knipschuif', { modus: 'driehoek', a: 5, h: 3, top: 5, stof2: 'geel' }, { hint: 'Sleep het rondje omhoog.' }),
          uitleg('Twee rechthoekige driehoeken vormen samen een <b>rechthoek</b> van 5 bij 3 = 15. Eén driehoek is de helft: ½ × 5 × 3 = 7,5.', 'driehoek = ½ × zijde × hoogte')]],
        [uitleg('Waarom werkt dit bij <b>elke</b> driehoek, ook een heel scheve? Draai een kopie om het midden van een zijde: hij past altijd precies, en samen vormen ze een parallellogram. En een parallellogram knip en schuif je tot een rechthoek met dezelfde zijde en hoogte. Dus: driehoek = ½ × zijde × hoogte, altijd.', 'driehoek → parallellogram → rechthoek')]),
      toon('Nu een vreemd experiment. Sleep de <b>top</b> van de driehoek heen en weer. Kijk naar de schuine zijde en naar de stof.', 'schuifproef', { vorm: 'driehoek', a: 6, h: 3, top: 3, min: -2, max: 8 }, { hint: 'Sleep de top ver naar links en ver naar rechts.' }),
      snap('d-hoogte', 'Snap je welke <b>hoogte</b> bij een zijde hoort?',
        [[VQ('maatkiezer', EFG, 'Laat zien welke maten je kiest.'),
          QD('Van △ABC is zijde AB = 10 cm en de oppervlakte 30 cm². Hoe lang is de hoogte bij AB?', '6 cm', [['3 cm', '30 : 10 vergeet de ½. Check: ½ × 10 × 3 = 15, niet 30. Hoogte = 2 × opp : zijde.', 'W14'], ['20 cm', '30 − 10: aftrekken werkt niet. Check: ½ × 10 × 6 = 30.'], ['300 cm', '30 × 10 maakt hem juist groter. Het is 2 × 30 <b>gedeeld door</b> 10.']], 'hoogte = 2 × 30 : 10 = 6 cm.')],
         [VQ('maatkiezer', DEF, 'Kies de maten en reken het uit.'),
          QD('△ABC heeft oppervlakte 240 mm² en zijde AC = 30 mm. Hoe lang is de hoogte bij AC?', '16 mm', [['8 mm', '240 : 30 vergeet de ½: ½ × 30 × 8 = 120.', 'W14'], ['210 mm', '240 − 30: aftrekken werkt niet.'], ['480 mm', '2 × 240 moet je nog delen door 30.']], 'hoogte = 2 × 240 : 30 = 16 mm.')]],
        [[toon('Andere manier: probeer het zelf met een andere driehoek. Schuif de top en kijk welke maat <b>gelijk blijft</b>.', 'schuifproef', { vorm: 'driehoek', a: 5, h: 4, top: 1, min: -2, max: 7, stof: 'paars' }, { hint: 'Sleep de top heen en weer.' })],
         [uitleg('Nog een manier: leg je <b>geodriehoek</b> met de rechte hoek op de zijde. De hoogte loopt langs de andere rand naar de top. Elke zijde heeft zo zijn eigen hoogte: bij PQ hoort RS, bij QR hoort PT en bij PR hoort QU.', `${IMG.drieHoogtes()}<div style="margin-top:6px">½ × PQ × RS = ½ × QR × PT = ½ × PR × QU</div>`)]],
        [uitleg('Waarom moet het loodrecht? De hoogte is de <b>afstand</b> van de top tot de zijde, en een afstand meet je altijd loodrecht (net als in §2.1). Schuin meten geeft een langere lijn, maar niet meer stof. Elke zijde heeft zijn eigen hoogte, en alle drie geven ze dezelfde oppervlakte. Daarom kun je ook terugrekenen: <b>hoogte = 2 × opp : zijde</b>.', 'de hoogte is de afstand tot de zijde')]),
      QD('Storm ontwerpt een driehoekige bandana voor de training bij Blauw Geel: zijde 60 cm, hoogte erbij 30 cm. Hoeveel stof?', '900 cm²', [['1800 cm²', '60 × 30 zonder ½.', 'W14'], ['90 cm²', '60 + 30 is optellen.', 'W20'], ['900 cm', 'Stof meet je in cm².', 'W21']], '½ × 60 × 30 = 900 cm².'),
      QD('Voor een feestje knipt Storm 10 vlaggetjes: driehoeken met zijde 20 cm en hoogte 25 cm. Hoeveel stof voor alle 10?', '2500 cm²', [['5000 cm²', 'Je vergat de ½ bij elk vlaggetje: ½ × 20 × 25 = 250.', 'W14'], ['250 cm²', 'Dat is één vlaggetje. Er zijn er 10.'], ['450 cm²', '(20 + 25) × 10 is optellen.', 'W20']], '½ × 20 × 25 = 250 per vlaggetje, × 10 = 2500 cm².'),
      baas('De Schuine Schurk', BAAS.schurk, 'De schuine zijde is ook een hoogte, en die ½ mag weg.', 'De Schuine Schurk meet alles schuin en gooit de ½ weg. Versla hem met de goede zijde en de goede hoogte. Fout kost jou niks.', [
        gDriehoek, gDriehoek, gTerug, gRecht, gHalf,
        VQ('maatkiezer', ABC9, 'Kies de goede maten.'),
        VQ('maatkiezer', KLM9, 'Kies en reken.'),
        QD('Je rekent met zijde PQ van △PQR. Welke hoogte hoort erbij?', 'RS', [['PT', 'PT staat loodrecht op QR, niet op PQ.', 'W15'], ['QU', 'QU staat loodrecht op PR.', 'W15'], ['PR', 'PR is een zijde, en die staat schuin op PQ.', 'W13']], 'RS staat loodrecht op PQ.', '', IMG.drieHoogtes()),
        QD('Welke formule is goed?', '½ × zijde × bijbehorende hoogte', [['zijde × bijbehorende hoogte', 'Dat is het parallellogram. Een driehoek is de helft.', 'W14'], ['½ × zijde × schuine zijde', 'De schuine zijde staat niet loodrecht op de zijde.', 'W13'], ['½ × zijde × elke hoogte', 'De hoogte moet bij die zijde horen: loodrecht erop.', 'W15']], 'Zijde en bijbehorende hoogte staan loodrecht op elkaar.'),
      ]),
    ] };

  /* =====================================================================
     §2.5 LES 2: stomphoekig en in het rooster
     ===================================================================== */
  const lesStomp = { id: 'opp-stomp', titel: 'Stomphoekig en in het rooster', sub: '§2.5 · hoogte buiten de driehoek', bol: ob(WK.badge.rooster()), orgs: ['o-rooster'],
    stappen: [
      { ...QD('Een gebouw met een driehoekige zijgevel (maten in m). Welke lijn is de <b>hoogte</b> bij zijde PQ?', 'RS', [['QR', 'QR = 41 is schuin: hij staat niet loodrecht op PQ.', 'W13'], ['PR', 'PR = 58 is ook schuin.', 'W13'], ['geen, want hij ligt buiten', 'Een hoogte mag buiten de driehoek liggen, op het verlengde van PQ.', 'W16']], 'RS staat loodrecht op het <b>verlengde</b> van PQ. Opp. = ½ × 33 × 40 = 660 m².', 'Even proberen.', IMG.gebouw()), coach: 'Vandaag stompe driehoeken. Die zijn een beetje scheef, maar de regel blijft dezelfde.' },
      toon('Sleep de top nu <b>voorbij</b> het eind van de zijde. Waar komt de hoogte dan?', 'schuifproef', { vorm: 'driehoek', a: 4, h: 3, top: 2, min: -3, max: 7, buiten: true, stof: 'geel' }, { hint: 'Sleep de top ver voorbij het rechter eind van de zijde.' }),
      uitleg('Bij een <b>stompe</b> driehoek kan de hoogte buiten de driehoek vallen. Hij staat dan loodrecht op het <b>verlengde</b> van de zijde. De regel blijft: ½ × zijde × hoogte. Het stippelstuk tel je niet mee bij de zijde.', IMG.stompRegel()),
      snap('s-buiten', 'Snap je dat de hoogte <b>buiten</b> de driehoek kan liggen?',
        [[VQ('maatkiezer', STOMP_B, 'Laat zien in het rooster.'),
          QD('△PQR: PQ = 48 mm, RS = 48 mm staat loodrecht op het verlengde van QP, en RQ = 102 mm. Oppervlakte?', '1152 mm²', [['2448 mm²', '½ × 102 × 48: RS staat niet loodrecht op RQ, maar op (het verlengde van) PQ.', 'W15'], ['2304 mm²', '48 × 48 zonder ½.', 'W14'], ['2160 mm²', '½ × 90 × 48: SP = 42 is het verlengde, geen stof.', 'W16']], '½ × 48 × 48 = 1152 mm².', '', IMG.l10())],
         [VQ('maatkiezer', A69, 'Kies de maten, ook buiten de driehoek.'),
          VQ('maatkiezer', STOMP_III, 'Nog eentje in het rooster.')]],
        [[uitleg('Andere manier: denk aan het <b>gebouw</b>. Hoe hoog het dak is, meet je recht naar beneden, tot de grond. Valt dat punt naast het gebouw? Dan verleng je de grondlijn even. Zo werkt het ook bij de driehoek.', IMG.gebouw())],
         [toon('Nog een manier: schuif zelf. Kijk hoe de hoogte gelijk blijft, ook als hij naar buiten schuift.', 'schuifproef', { vorm: 'driehoek', a: 3, h: 4, top: 1.5, min: -3, max: 6, buiten: true, stof: 'roze' }, { hint: 'Sleep de top voorbij het eind van de zijde.' })]],
        [uitleg('Waarom buiten? De hoogte is de <b>afstand</b> van de top tot de lijn waar de zijde op ligt. Bij een stompe hoek komt die loodlijn op het verlengde terecht. Twee van de drie hoogtes liggen dan buiten de driehoek, net als de hoogtelijnen in §2.4. Alleen de hoogte bij de <b>langste</b> zijde ligt binnen.', 'hoogte = afstand tot de lijn van de zijde')]),
      toon('Nu in een <b>rooster</b>. Tik de zijde en de hoogte, en reken uit.', 'maatkiezer', STOMP_IV, { hint: 'Kies eerst de zijde en de hoogte.' }),
      snap('s-rooster', 'Snap je hoe je in een <b>rooster</b> de zijde en de hoogte kiest?',
        [[VQ('maatkiezer', STOMP_V, 'Laat zien.'),
          QD('P(2, 1), Q(2, 3) en R(−1, 4). Hoeveel cm² is △PQR?', '3 cm²', [['6 cm²', '2 × 3 zonder ½.', 'W14'], ['4,5 cm²', 'PQ loopt van y = 1 naar y = 3: dat is 2, niet 3.'], ['4 cm²', 'De hoogte is de afstand van R tot de lijn x = 2: van x = −1 naar x = 2 is 3.', 'W16']], 'PQ = 2 (verticaal) en de hoogte vanuit R is 3: ½ × 2 × 3 = 3 cm².')],
         [QD('Rooster 1 bij 1 cm: driehoek met hoekpunten (5, 3), (7, 3) en (8, 0). Oppervlakte?', '3 cm²', [['6 cm²', '2 × 3 zonder ½.', 'W14'], ['4,5 cm²', '½ × 3 × 3: de zijde van (5, 3) naar (7, 3) is 2.', 'W16'], ['3 cm', 'Oppervlakte is in cm².', 'W21']], 'zijde 2 (horizontaal), hoogte 3 (buiten): ½ × 2 × 3 = 3 cm².'),
          gTerugStomp]],
        [[uitleg('Andere manier: zoek een zijde die <b>precies over een roosterlijn</b> loopt (horizontaal of verticaal). Die kun je tellen. De hoogte erbij loopt dan ook over een roosterlijn: ook te tellen. Schuine zijden laat je liggen.', 'horizontale zijde → verticale hoogte')],
         [toon('Nog een manier: doe er zelf nog een.', 'maatkiezer', { ...STOMP_III, opties: null, vraag: null }, { hint: 'Tik de zijde en de hoogte.' })]],
        [uitleg('Waarom horizontaal of verticaal? Een schuine lijn loopt dwars door de hokjes: die kun je niet tellen. Bij een horizontale zijde staat de hoogte verticaal, dus die tel je ook. En het mooiste: het maakt niet uit welke zijde je kiest, de oppervlakte is altijd hetzelfde. Kies dus de makkelijkste.', 'kies de zijde die je kunt tellen')]),
      QD('Een konijnenhok: de houten bodem is 110 cm bij 60 cm. Hoeveel m² is de bodem?', '0,66 m²', [['66 m²', '110 × 60 = 6600 cm². 1 m² = 100 × 100 = 10 000 cm², dus 6600 cm² = 0,66 m².'], ['6,6 m²', 'Deel 6600 door 10 000, niet door 1000.'], ['1,7 m²', '110 + 60 = 170 cm is de halve omtrek, geen oppervlakte.', 'W20']], '110 × 60 = 6600 cm² = 0,66 m².', '', IMG.hok()),
      QD('De rest van het hok is gaas: twee schuine rechthoeken van 110 × 50 cm en twee driehoeken (zijde 60, hoogte 40). Hoeveel m² gaas?', '1,34 m²', [['1,58 m²', 'De driehoeken zijn ½ × 60 × 40 = 1200, niet 60 × 40.', 'W14'], ['1,1 m²', 'Je vergat de twee driehoekjes voor en achter.'], ['2 m²', 'De bodem is van hout, die telt niet mee bij het gaas.', 'W22']], '2 × 110 × 50 + 2 × ½ × 60 × 40 = 11 000 + 2400 = 13 400 cm² = 1,34 m².', '', IMG.hok()),
      baas('De Binnenblijver', BAAS.binnen, 'De hoogte moet ín de driehoek liggen. Ligt hij buiten? Dan neem ik maar een schuine zijde.', 'De Binnenblijver durft niet buiten de driehoek te kijken. Laat zien dat de hoogte gewoon op het verlengde mag. Fout kost jou niks.', [
        gStomp, gStomp, gStompTekst, gTerugStomp,
        VQ('maatkiezer', STOMP_IV, 'Kies de zijde en de hoogte.'),
        VQ('maatkiezer', A69, 'Kijk ook buiten de driehoek.'),
        VQ('maatkiezer', STOMP_V, 'Verticale zijde dit keer.'),
        QD('In een stomphoekige driehoek ...', 'liggen twee hoogtes buiten de driehoek', [['liggen alle hoogtes binnen', 'Bij een stompe hoek vallen er twee buiten, op het verlengde van een zijde.', 'W16'], ['is er geen hoogte te tekenen', 'Wel: verleng de zijde.', 'W16'], ['is de hoogte een van de zijden', 'Dat is bij een rechthoekige driehoek.']], 'Alleen de hoogte bij de langste zijde ligt binnen.'),
      ]),
    ] };

  /* =====================================================================
     §2.6 LES 3: parallellogram
     ===================================================================== */
  const lesPar = { id: 'opp-parallellogram', titel: 'Parallellogram', sub: '§2.6 · zijde × hoogte', bol: ob(WK.badge.stof()), orgs: ['o-stof'],
    stappen: [
      { ...QD('Mama heeft twee lappen. Welke heeft de meeste stof?', 'ze zijn even groot', [['de roze, want die is schever', 'Scheef maakt de lap niet groter. Knip het puntje eraf en leg het aan de andere kant.', 'W17'], ['de blauwe, want die is recht', 'Recht of scheef maakt niet uit: zelfde zijde, zelfde hoogte.'], ['dat kun je niet weten', 'Wel! Ze hebben allebei zijde 5 en hoogte 3.']], 'Allebei 5 bij 3. Dat gaan we nu bewijzen met de schaar.', 'Even gokken.', IMG.tweeLappen()), coach: 'Welkom in §2.6. Eerst het parallellogram: een scheve rechthoek.' },
      toon('Knip langs de <b>hoogte</b> een driehoekje af en sleep het naar de andere kant.', 'knipschuif', { modus: 'parallellogram', a: 5, h: 3, schuif: 2, stof: 'roze' }, { hint: 'Sleep het oranje rondje naar rechts.' }),
      uitleg('Een parallellogram kun je altijd knippen en schuiven tot een rechthoek met dezelfde zijde en hoogte. Dus: <b>zijde × hoogte</b>. Geen ½! En de schuine zijde doet niet mee. De hoogte kun je op heel veel plekken tekenen: allemaal even lang.', `${IMG.vaakHoogte()}<div style="margin-top:6px">opp. parallellogram = <b>zijde × bijbehorende hoogte</b></div>`),
      snap('p-formule', 'Snap je waarom een parallellogram <b>zijde × hoogte</b> is?',
        [[VQ('knipschuif', { modus: 'parallellogram', a: 6, h: 3, schuif: 4, stof: 'mint', vraag: 'De schuine zijde is hier 5. Hoeveel hokjes stof?', opties: [{ t: '18', goed: true }, { t: '30', fout: '6 × 5: 5 is de schuine zijde. Na het schuiven is het een rechthoek van 6 bij 3.', mis: 'W17' }, { t: '9', fout: 'Geen ½: het is één hele rechthoek.', mis: 'W18' }, { t: '28', fout: '6 + 5 + 6 + 5 = 22 is de omtrek; stof tel je in hokjes.', mis: 'W20' }], w: '6 × 3 = 18 hokjes.' }, 'Knip, schuif en tel.'),
          QD('Parallellogram ABCD: AB = 35 mm, de hoogte DE = 20 mm, de schuine zijde AD = 22,4 mm. Oppervlakte?', '700 mm²', [['784 mm²', '35 × 22,4: AD is schuin. Dit is precies de fout van Amir.', 'W17'], ['350 mm²', 'Geen ½ bij een parallellogram.', 'W18'], ['700 mm', 'Oppervlakte is in mm².', 'W21']], '35 × 20 = 700 mm².')],
         [QD('Amir rekent: opp. ABCD = 35 × 22,4 = 784 mm². Wat doet hij fout?', 'Hij gebruikt de schuine zijde als hoogte', [['Hij vergeet de ½ ervoor', 'Bij een parallellogram hoort geen ½.', 'W18'], ['Hij moet de zijden optellen', 'Optellen geeft de omtrek.', 'W20'], ['Niets, zo reken je het uit', '22,4 staat schuin: niet loodrecht op AB.', 'W17']], 'Zijde en hoogte moeten loodrecht op elkaar staan.'),
          gParCoord]],
        [[uitleg('Andere manier: knip het parallellogram langs een <b>diagonaal</b>. Je krijgt twee precies gelijke driehoeken. Elke driehoek is ½ × zijde × hoogte, dus samen 2 × ½ × zijde × hoogte = <b>zijde × hoogte</b>.', 'twee driehoeken = één parallellogram')],
         [toon('Nog een manier: schuif zelf. Wat gebeurt er met de stof als het parallellogram schever wordt?', 'schuifproef', { vorm: 'parallellogram', a: 4, h: 3, top: 1, min: -2, max: 4, stof: 'denim' }, { hint: 'Sleep de bovenkant heen en weer.' })]],
        [uitleg('Waarom geen ½? Bij de driehoek had je twee driehoeken nodig voor één parallellogram. Hier heb je het parallellogram al helemaal. En er is niet maar één hoogte: elke lijn loodrecht tussen de twee evenwijdige zijden is de hoogte, en ze zijn allemaal even lang. Neem je de andere zijde (AD), dan hoort daar een andere hoogte bij. Beide paren geven dezelfde stof.', IMG.vaakHoogte())]),
      toon('Nu de <b>schuifproef</b>. Sleep de bovenkant opzij. De schuine zijde verandert. En de stof?', 'schuifproef', { vorm: 'parallellogram', a: 5, h: 3, top: 0, min: -3, max: 4, stof: 'roze' }, { hint: 'Sleep de bovenkant heen en weer.' }),
      snap('p-hoogte', 'Snap je welke <b>hoogte</b> bij welke <b>zijde</b> hoort?',
        [[VQ('maatkiezer', PAR1, 'Kies een paar.'),
          QD('Parallellogram ABCD: AD = 28 mm, de hoogte bij AD is 49 mm, de hoogte bij AB is 25 mm. AB is niet gegeven. Oppervlakte?', '1372 mm²', [['700 mm²', '28 × 25: de hoogte 25 hoort bij AB, niet bij AD.', 'W15'], ['686 mm²', 'Geen ½ bij een parallellogram.', 'W18'], ['1225 mm²', '25 × 49: twee hoogtes vermenigvuldigen zegt niks.', 'W15']], 'Je kent AD én zijn hoogte: 28 × 49 = 1372 mm².')],
         [VQ('maatkiezer', KLMN11, 'Kies en reken.'),
          QD('Parallellogram PQRS: PQ = 4 cm en de hoogte bij PQ is 2,4 cm. PS = 3 cm. Hoe lang is de hoogte ST bij QR (QR = PS)?', '3,2 cm', [['1,6 cm', 'Geen ½: opp = 4 × 2,4 = 9,6, en 9,6 : 3 = 3,2.', 'W18'], ['6,4 cm', '2 × 9,6 : 3 is terugrekenen bij een driehoek.', 'W18'], ['2,4 cm', 'Andere zijde, andere hoogte.', 'W15']], 'opp = 4 × 2,4 = 9,6 cm², dus ST = 9,6 : 3 = 3,2 cm.')]],
        [[uitleg('Andere manier: de hoogte is de <b>afstand tussen twee evenwijdige zijden</b>. Bij AB hoort de afstand tot DC. Bij AD hoort de afstand tot BC. Zoek steeds het hoekje van 90° bij de zijde die je kiest.', IMG.vaakHoogte())],
         [toon('Nog een manier: tik het paar in het rooster.', 'maatkiezer', { ...PAR_R, opties: null, vraag: null }, { hint: 'Tik de zijde en de hoogte.' })]],
        [uitleg('Waarom twee paren? Een parallellogram heeft twee soorten zijden: de lange (AB en DC) en de korte (AD en BC). Elk paar heeft zijn eigen afstand. Lange zijde × korte hoogte = korte zijde × lange hoogte: het is dezelfde lap. Daarom kun je terugrekenen: ken je de oppervlakte, dan is <b>hoogte = opp : zijde</b> (zonder 2 ×).', 'AB × hoogte bij AB = AD × hoogte bij AD')]),
      QD('Storm naait een sjaal in de vorm van een parallellogram: lange zijde 120 cm, hoogte 25 cm, schuine kant 30 cm. Hoeveel stof?', '3000 cm²', [['3600 cm²', '120 × 30: 30 is de schuine kant.', 'W17'], ['1500 cm²', 'Geen ½ bij een parallellogram.', 'W18'], ['3000 cm', 'Stof meet je in cm².', 'W21']], '120 × 25 = 3000 cm².'),
      baas('Amirs Spiegel', BAAS.spiegel, 'Ik neem gewoon de schuine zijde. En een halfje erbij kan nooit kwaad.', 'Amirs Spiegel laat je de fout van Amir steeds opnieuw zien. Laat zien dat jij het goed doet. Fout kost jou niks.', [
        gPar, gPar, gParTerug, gParCoord,
        VQ('maatkiezer', PAR1, 'Kies een paar.'),
        VQ('maatkiezer', KLMN11, 'Kies en reken.'),
        VQ('knipschuif', { modus: 'parallellogram', a: 4, h: 4, schuif: 3, stof: 'geel', vraag: 'De schuine zijde is 5. Hoeveel hokjes stof?', opties: [{ t: '16', goed: true }, { t: '20', fout: '4 × 5: 5 is schuin.', mis: 'W17' }, { t: '8', fout: 'Geen ½.', mis: 'W18' }, { t: '18', fout: '4 + 5 + 4 + 5 is de omtrek.', mis: 'W20' }], w: '4 × 4 = 16.' }, 'Knip, schuif en tel.'),
        QD('Hoeveel hoogtes kun je tekenen bij zijde AB van een parallellogram?', 'heel veel, allemaal even lang', [['maar één, vanuit D', 'Elke loodrechte lijn tussen AB en DC is de hoogte.'], ['twee: vanuit C en vanuit D', 'Er passen er nog veel meer tussen.'], ['geen, want D ligt schuin boven A', 'De hoogte hoeft niet bij een hoekpunt te beginnen.', 'W17']], 'Zoals de rode lijnen: overal even lang.'),
      ]),
    ] };

  /* =====================================================================
     §2.6 LES 4: trapezium en ruit
     ===================================================================== */
  const lesTrap = { id: 'opp-trapezium', titel: 'Trapezium en ruit', sub: '§2.6 · ½ × (a + b) × h en ½ × d₁ × d₂', bol: ob(BADGE.trapezium), orgs: ['o-trapezium'],
    stappen: [
      { ...QD('Een <b>trapezium</b> is een vierhoek met één paar evenwijdige zijden. Je legt twee gelijke trapezium-lappen (onder 6, boven 3) omgekeerd tegen elkaar. Wat krijg je?', 'een parallellogram, zijde 9', [['een rechthoek, 6 bij 3', 'De schuine kanten blijven schuin, en de onderkant wordt 6 + 3.'], ['een trapezium, 2× zo hoog', 'Je legt ze naast elkaar, niet op elkaar.'], ['een driehoek, zijde 9', 'Er blijven vier hoeken over.']], 'Onder 6 + boven 3 = 9: een parallellogram met zijde 9.', 'Even gokken.'), coach: 'Nu het trapezium: een rok of tasje met een smalle en een brede kant.' },
      toon('Sleep het tweede trapezium omhoog. Het draait om en past ertegen.', 'knipschuif', { modus: 'trapezium', a: 6, b: 3, h: 3, schuif: 1, stof2: 'geel' }, { hint: 'Sleep het oranje rondje omhoog.' }),
      uitleg('Twee trapezia = een parallellogram met zijde <b>a + b</b> (de twee evenwijdige zijden opgeteld) en dezelfde hoogte. Eén trapezium is de helft. <b>Optellen</b>, niet vermenigvuldigen!', 'opp. trapezium = <b>½ × (a + b) × hoogte</b><small>a en b zijn de evenwijdige zijden</small>'),
      snap('t-formule', 'Snap je de formule <b>½ × (a + b) × h</b>?',
        [[VQ('maatkiezer', TRAP81, 'Kies de drie maten.'),
          QD('Trapezium ABCD: AB = 40 mm, DC = 20 mm (evenwijdig), hoogte 15 mm. Oppervlakte?', '450 mm²', [['6000 mm²', '½ × 20 × 40 × 15: zijden niet vermenigvuldigen. Eerst 20 + 40 = 60.', 'W19'], ['900 mm²', '(20 + 40) × 15 zonder ½: twee trapezia.', 'W14'], ['300 mm²', '20 × 15 telt alleen de korte zijde.']], '½ × (20 + 40) × 15 = ½ × 60 × 15 = 450 mm².')],
         [QD('Trapezium ABCD: AB = 10 cm, CD = 6 cm, opp. = 68 cm². Hoe groot is de hoogte?', '8,5 cm', [['4,25 cm', '68 : 16 vergeet de ½. Check: ½ × 16 × 4,25 = 34.', 'W14'], ['6,8 cm', '68 : 10 gebruikt alleen AB.'], ['1,1 cm', 'Niet 10 × 6: tel ze <b>op</b>.', 'W19']], '½ × 16 × h = 68, dus h = 2 × 68 : 16 = 8,5 cm.'),
          VQ('knipschuif', { modus: 'trapezium', a: 5, b: 1, h: 4, schuif: 2, stof2: 'mint', vraag: 'Hoeveel hokjes is één trapezium?', opties: [{ t: '12', goed: true }, { t: '24', fout: '(5 + 1) × 4 is het parallellogram: twee trapezia.', mis: 'W14' }, { t: '10', fout: '½ × 5 × 4 telt de bovenkant niet mee.' }, { t: '20', fout: '5 × 4: de bovenkant is maar 1 breed.', mis: 'W19' }], w: '½ × (5 + 1) × 4 = 12.' }, 'Laat zien.')]],
        [[uitleg('Andere manier: de <b>gemiddelde breedte</b>. Onder is de lap 6 breed, boven 3. Gemiddeld is hij (6 + 3) : 2 = 4,5 breed. Keer de hoogte 3: 4,5 × 3 = 13,5. Dat is precies ½ × (6 + 3) × 3.', 'gemiddelde breedte × hoogte')],
         [toon('Nog een manier: doe het zelf nog eens, met een ander trapezium.', 'knipschuif', { modus: 'trapezium', a: 5, b: 3, h: 2, schuif: 1, stof: 'mint', stof2: 'koraal' }, { hint: 'Sleep het rondje omhoog.' })]],
        [uitleg('Klopt de formule ook in het <b>extreme geval</b>? Maak de bovenzijde 0: dan is het een driehoek, en ½ × (a + 0) × h = ½ × a × h. Klopt! Maak boven even lang als onder: dan is het een parallellogram, en ½ × (a + a) × h = a × h. Klopt ook! Eén formule die alle drie de figuren vangt.', 'b = 0 → driehoek · b = a → parallellogram')]),
      toon('Nu de <b>ruit</b>. Knip langs de diagonalen en sleep de twee onderste driehoekjes naar boven.', 'knipschuif', { modus: 'ruit', d1: 6, d2: 4, stof: 'paars', stof2: 'roze' }, { hint: 'Sleep allebei de oranje rondjes omhoog.' }),
      snap('r-ruit', 'Snap je de ruit: <b>½ × d₁ × d₂</b>?',
        [[QD('Ruit ABCD: diagonaal AC = 18 cm en BD = 10 cm. Hoeveel stof?', '90 cm²', [['180 cm²', '18 × 10 is de rechthoek om de ruit. De ruit is de helft.', 'W14'], ['28 cm²', '18 + 10 is optellen.', 'W20'], ['90 cm', 'Stof meet je in cm².', 'W21']], '½ × 18 × 10 = 90 cm².'),
          VQ('maatkiezer', RUIT, 'Kies de maten.')],
         [QD('Ruit ABCD: diagonaal AC = 20 cm en opp. = 120 cm². Hoe lang is BD?', '12 cm', [['6 cm', '120 : 20 vergeet de ½: ½ × 20 × 6 = 60.', 'W14'], ['100 cm', '120 − 20: aftrekken werkt niet.'], ['24 cm', 'Dat is 2 × 12: één keer ×2 is genoeg.']], 'BD = 2 × 120 : 20 = 12 cm.'),
          QD('Ruit PQRS: diagonaal PR = 24 cm en QS = 8 cm. Oppervlakte?', '96 cm²', [['192 cm²', '24 × 8 zonder ½.', 'W14'], ['32 cm²', '24 + 8 is optellen.', 'W20'], ['48 cm²', 'Dat is een kwart.']], '½ × 24 × 8 = 96 cm².')]],
        [[uitleg('Andere manier: teken een rechthoek om de ruit heen, d₁ bij d₂. De vier hoekjes buiten de ruit zijn precies even groot als de vier stukjes binnen de ruit. De ruit is dus de <b>helft</b> van de rechthoek.', `${IMG.ruitRecht()}<div style="margin-top:6px">ruit = ½ × d₁ × d₂</div>`)],
         [toon('Nog een manier: knip en schuif een langere ruit.', 'knipschuif', { modus: 'ruit', d1: 8, d2: 4, stof: 'mint', stof2: 'geel' }, { hint: 'Sleep allebei de rondjes omhoog.' })]],
        [uitleg('Waarom werkt dit? De diagonalen van een ruit delen elkaar middendoor en staan <b>loodrecht</b>. Diagonaal d₁ knipt de ruit in twee driehoeken met zijde d₁ en hoogte ½d₂: samen 2 × ½ × d₁ × ½d₂ = ½ × d₁ × d₂. Een vlieger heeft ook loodrechte diagonalen, dus daar werkt het ook. Vlieger KLMN uit het boek: 2 × ½ × 13 × 30 = 390 mm².', 'loodrechte diagonalen → ½ × d₁ × d₂')]),
      QD('Een popcornbak: elke zijkant is een trapezium met boven 14 cm, onder 10 cm en hoogte 22 cm. Hoeveel karton is één zijkant?', '264 cm²', [['1540 cm²', '½ × 14 × 10 × 22: tel 14 en 10 <b>op</b>.', 'W19'], ['528 cm²', '(14 + 10) × 22 zonder ½.', 'W14'], ['308 cm²', '14 × 22 neemt alleen de bovenkant.']], '½ × (14 + 10) × 22 = 264 cm².'),
      QD('De bak heeft vier van die zijkanten en een vierkante bodem van 10 bij 10 cm. Hoeveel karton in totaal?', '1156 cm²', [['1056 cm²', 'Je vergat de bodem: + 100.', 'W22'], ['364 cm²', 'Er zijn vier zijkanten: 4 × 264.'], ['1160 cm²', 'De bodem is 10 × 10 = 100, niet 104.']], '4 × 264 + 100 = 1156 cm² (= 11,56 dm²).'),
      baas('De Zijdenvermenigvuldiger', BAAS.zijden, 'Bij een trapezium vermenigvuldig ik gewoon alle zijden met elkaar.', 'De Zijdenvermenigvuldiger maakt van elke som een vermenigvuldiging. Laat zien dat je eerst optelt. Fout kost jou niks.', [
        gTrap, gTrap, gTrapTerug, gRuit, gRuitTerug,
        VQ('maatkiezer', TRAP81, 'Kies de drie maten.'),
        VQ('maatkiezer', RUIT, 'Kies de diagonalen.'),
        QD('Trapezium PQRS: PS en QR zijn evenwijdig, QR = 8 cm, de hoogte is 4 cm en de oppervlakte 22 cm². Hoe lang is PS?', '3 cm', [['11 cm', '22 : 2 = 11 is nog niet PS. ½ × (8 + PS) × 4 = 22, dus 8 + PS = 11.'], ['5,5 cm', '22 : 4 = 5,5 vergeet de ½ en de 8.', 'W14'], ['0,7 cm', 'Niet 8 × PS: tel ze op.', 'W19']], '½ × (8 + PS) × 4 = 22 → 8 + PS = 11 → PS = 3 cm.'),
        QD('Een trapezium met een bovenzijde van 0 is eigenlijk ...', 'een driehoek', [['een parallellogram', 'Dat krijg je als boven even lang is als onder.'], ['een rechthoek', 'Dan zouden de zijkanten loodrecht staan en boven even lang zijn.'], ['een ruit', 'Een ruit heeft vier gelijke zijden.']], '½ × (a + 0) × h = ½ × a × h: de driehoek.'),
      ]),
    ] };

  /* =====================================================================
     §2.6 LES 5: samengestelde figuren
     ===================================================================== */
  const lesSamen = { id: 'opp-samengesteld', titel: 'Samengestelde figuren', sub: '§2.6 · splitsen of aanvullen', bol: ob(BADGE.patroon), orgs: ['o-patroon'],
    stappen: [
      { ...QD('Storm ontwerpt een etui in de vorm van een <b>huisje</b> (hokjes van 1 bij 1 cm). Hoeveel stof?', '6 cm²', [['8 cm²', '4 × 2 is de rechthoek om het hele huisje. De hoekjes naast het dak moeten eraf.', 'W22'], ['10,5 cm²', 'Dat is ongeveer de omtrek: alle randen opgeteld.', 'W20'], ['5 cm²', 'Het dak is meer dan 1 hokje: ½ × 4 × 1 = 2.']], 'rechthoek 4 × 1 = 4, dak ½ × 4 × 1 = 2: samen 6 cm².', 'Even proberen.', IMG.huisje()), coach: 'De laatste les van Het Atelier: patronen die uit meer stukken bestaan.' },
      toon('Kies een route en reken het huisje uit. Daarna doe je de andere route ook.', 'splitser', { ...HUISJE, beide: true }, { hint: 'Kies een route en tik de schaartjes of plusjes.' }),
      uitleg('Twee routes, één antwoord. <b>Splitsen</b>: knip de figuur in rechthoeken en driehoeken en tel ze <b>op</b>. <b>Aanvullen</b>: maak er een rechthoek van en haal de extra stukjes er <b>af</b>. Pas op dat je niets dubbel telt.', 'splitsen: + &nbsp;·&nbsp; aanvullen: −'),
      snap('s-routes', 'Snap je <b>splitsen</b> en <b>aanvullen</b>?',
        [[VQ('splitser', { ...ZESHOEK, route: 'aanvullen', vraag: 'Hoeveel stof is de zeshoek?', opties: [{ t: '13,5 cm²', goed: true }, { t: '15 cm²', fout: 'Dat is de rechthoek. Het driehoekje moet er nog af.', mis: 'W22' }, { t: '16,5 cm²', fout: 'Het driehoekje haal je eraf, je telt het er niet bij.', mis: 'W22' }, { t: '13,5 cm', fout: 'Oppervlakte is in cm².', mis: 'W21' }], w: '5 × 3 − ½ × 3 × 1 = 13,5 cm².' }, 'Vul aan en reken.'),
          QD('Vijfhoek ABCDE (mm): AB = 30, AE = 25, ED = 38, DC = 10, rechte hoeken bij A, E en D. Aanvullen geeft een rechthoek 38 × 25 min een driehoekje 8 × 15. Oppervlakte?', '890 mm²', [['950 mm²', 'Dat is de rechthoek. Het driehoekje moet eraf.', 'W22'], ['1010 mm²', 'Het driehoekje haal je eraf, niet erbij.', 'W22'], ['830 mm²', 'Het driehoekje is ½ × 8 × 15 = 60, niet 120.', 'W14']], '38 × 25 − ½ × 8 × 15 = 950 − 60 = 890 mm².')],
         [VQ('splitser', { ...ZES13, vraag: 'Hoeveel mm² stof?', opties: [{ t: '405 mm²', goed: true }, { t: '450 mm²', fout: 'Dat is de rechthoek 18 × 25. Het driehoekje moet eraf.', mis: 'W22' }, { t: '495 mm²', fout: 'Eraf, niet erbij.', mis: 'W22' }, { t: '360 mm²', fout: 'Het driehoekje is ½ × 18 × 5 = 45, niet 90.', mis: 'W14' }], w: '18 × 25 − ½ × 18 × 5 = 405 mm².' }, 'Kies een route.'),
          QD('Vijfhoek ABCDE (mm): trapezium ABDE met evenwijdige zijden 20 en 24 en hoogte 18, plus driehoek BCD met zijde 18 en hoogte 16. Oppervlakte?', '540 mm²', [['396 mm²', 'Dat is alleen het trapezium. De driehoek komt erbij.', 'W22'], ['684 mm²', 'De driehoek is ½ × 18 × 16 = 144, niet 288.', 'W14'], ['936 mm²', 'Het trapezium is ½ × (20 + 24) × 18 = 396, niet 792.', 'W14']], '½ × (20 + 24) × 18 + ½ × 18 × 16 = 396 + 144 = 540 mm².')]],
        [[uitleg('Andere manier: zie het als een <b>legpuzzel</b>. Bij splitsen leg je de figuur uit losse stukjes die je kent. Bij aanvullen leg je er een stukje bij tot je een rechthoek hebt, en daarna haal je dat stukje weer weg. Elk stukje stof tel je precies één keer.', IMG.huisje())],
         [toon('Nog een manier: splits deze zeshoek zelf.', 'splitser', { ...ZESHOEK, route: 'splitsen' }, { hint: 'Tik de schaartjes.' })]],
        [uitleg('Waarom geven beide routes hetzelfde? De stof verandert niet doordat jij anders rekent. Splitsen = alle stukken optellen. Aanvullen = de grote rechthoek min wat er te veel is. Kies de route met de <b>minste</b> en <b>makkelijkste</b> stukken. Vaak is aanvullen sneller als er een hoekje uit de figuur mist.', 'zelfde stof, andere som')]),
      snap('s-eenheid', 'Snap je het verschil tussen <b>omtrek</b> en <b>oppervlakte</b>, en de eenheden?',
        [[QD('Een lap van 5 cm bij 3 cm. Wat is de oppervlakte?', '15 cm²', [['16 cm', '5 + 3 + 5 + 3 = 16 is de omtrek: de rand.', 'W20'], ['15 cm', 'Het getal klopt, maar oppervlakte is cm².', 'W21'], ['8 cm²', '5 + 3 is optellen.', 'W20']], '5 × 3 = 15 cm².'),
          QD('Storm naait een band om de rand van een kussen van 40 bij 40 cm. Wat reken je uit?', 'de omtrek: 160 cm', [['de oppervlakte: 1600 cm²', 'Een band om de rand is een lengte. Dat is de omtrek.', 'W20'], ['de omtrek: 1600 cm', '40 + 40 + 40 + 40 = 160.'], ['de oppervlakte: 160 cm²', 'Een band is een lengte, geen stof-oppervlak.', 'W21']], '4 × 40 = 160 cm band.')],
         [gEenheid, gOmtrek]],
        [[uitleg('Andere manier: <b>omtrek</b> is het lint rond je kussen (een lengte: cm). <b>Oppervlakte</b> is de stof van het kussen (vierkantjes: cm²). Een lint meet je met een meetlint, stof tel je in hokjes.', 'omtrek = rand (cm) · oppervlakte = stof (cm²)')],
         [uitleg('Nog een manier: een cm² is een vierkantje van 1 bij 1 cm. Een lap van 5 bij 3 cm bevat 3 rijen van 5 vierkantjes: 15 cm². De rand is 5 + 3 + 5 + 3 = 16 cm. Twee verschillende vragen, twee verschillende eenheden.', '5 × 3 = 15 cm² · 5 + 3 + 5 + 3 = 16 cm')]],
        [uitleg('Waarom het kwadraatje? Oppervlakte is lengte × lengte, dus cm × cm = cm². Daarom is 1 m² = 100 cm × 100 cm = <b>10 000 cm²</b> en 1 dm² = 10 × 10 = 100 cm². Bij het konijnenhok: 6600 cm² = 0,66 m².', 'cm × cm = cm²')]),
      QD('Storm verft een muur van haar kamer: een rechthoek van 4 m bij 2,5 m met daarboven een schuin stuk (driehoek, zijde 4 m, hoogte 1 m). Hoeveel m²?', '12 m²', [['14 m²', 'Het schuine stuk is ½ × 4 × 1 = 2, niet 4.', 'W14'], ['10 m²', 'Je vergat het driehoekige stuk erboven.', 'W22'], ['13 m', 'Dat is een lengte. Verf gaat over m².', 'W21']], '4 × 2,5 + ½ × 4 × 1 = 10 + 2 = 12 m².'),
      QD('Met 1 liter verf doe je 8 m². Hoeveel blikken van 1 liter heeft Storm nodig voor 12 m²?', '2 blikken', [['1 blik', '12 : 8 = 1,5. Met één blik kom je tekort, dus afronden naar boven.'], ['1,5 blik', 'Je koopt hele blikken: naar boven afronden.'], ['96 blikken', '12 × 8: delen, niet vermenigvuldigen.']], '12 : 8 = 1,5, dus 2 blikken.'),
      baas('De Dubbelteller', BAAS.dubbel, 'Ik tel gewoon alles op: alle zijden, alle stukken, ook wat er al in zat.', 'De Dubbelteller telt stukken dubbel en verwart rand met stof. Laat zien dat jij elk stukje precies één keer telt. Fout kost jou niks.', [
        gL, gL, gHuis, gHuis, gOmtrek, gEenheid,
        VQ('splitser', { ...ZES13, vraag: 'Hoeveel mm² stof?', opties: [{ t: '405 mm²', goed: true }, { t: '450 mm²', fout: 'De rechthoek; het driehoekje moet eraf.', mis: 'W22' }, { t: '495 mm²', fout: 'Eraf, niet erbij.', mis: 'W22' }, { t: '405 mm', fout: 'Oppervlakte is in mm².', mis: 'W21' }], w: '450 − 45 = 405 mm².' }, 'Kies een route.'),
        VQ('splitser', { ...VIJF88, vraag: 'Hoeveel mm² stof?', opties: [{ t: '890 mm²', goed: true }, { t: '950 mm²', fout: 'De rechthoek; het driehoekje moet eraf.', mis: 'W22' }, { t: '1010 mm²', fout: 'Eraf, niet erbij.', mis: 'W22' }, { t: '890 mm', fout: 'Oppervlakte is in mm².', mis: 'W21' }], w: '950 − 60 = 890 mm².' }, 'Kies een route.'),
      ]),
    ] };

  return { l25: [lesDriehoek, lesStomp], l26: [lesPar, lesTrap, lesSamen], _fig: { PQR, EFG, DEF, ABC9, KLM9, STOMP_B, STOMP_IV, STOMP_V, A69, PAR1, KLMN11, TRAP81, RUIT, HUISJE, ZESHOEK, VIJF88, ZES13 }, _gen: { gDriehoek, gTerug, gStomp, gPar, gParCoord, gTrap, gRuit, gL, gHuis, gEenheid, gOmtrek } };
})();
