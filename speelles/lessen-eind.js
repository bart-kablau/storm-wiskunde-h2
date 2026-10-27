'use strict';
/* =========================================================================
   SPEELLES Wiskunde H2: de eindbaas (generale repetitie). Eén grote baas met een gemengde
   pool over alle paragrafen (Vk t/m 2.6), op toetsniveau, door elkaar (de engine schudt).
   Afstand-paragrafen: alleen meerkeuze. Oppervlakte: meerkeuze en bouwstenen uit vis-opp.js.
   Laden na lessen-opp.js (gebruikt OPP._fig en OPP._gen) en vóór lessen.js.
   ========================================================================= */
const EINDBAAS = (() => {
  const g = WK.opp.getal, F = (typeof OPP !== 'undefined' && OPP._fig) || {}, GEN = (typeof OPP !== 'undefined' && OPP._gen) || {};
  const QD = (vraag, goed, fouten, w, klein, beeld) => Q(vraag, goed, fouten.filter(([t], i, a) => t !== goed && a.findIndex(x => x[0] === t) === i), w, klein, beeld);
  const beeld = WK.baas({ vorm: 'wolk', kleur: '#8B5CF6', kleur2: '#4C1D95', ogen: 3, mond: 'open',
    extra: '<g transform="translate(70 70) rotate(-12)"><path d="M0 0 L14 -4 L28 0 L42 -4 V26 L28 30 L14 26 L0 30Z" fill="#F3E3B8" stroke="#B9975B" stroke-width="2"/><path d="M14 -4 V26 M28 0 V30" stroke="#B9975B" stroke-width="1.4"/><circle cx="21" cy="13" r="8" fill="none" stroke="#2563EB" stroke-width="2" transform="scale(1.3 .8) translate(-5 3)"/></g>' });
  const rnd2 = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  /* ---------- Vk en §2.1: cirkels en afstanden ---------- */
  const qStraal = () => { const d = rnd2(3, 12) * 2; return QD(`Een rond kleed heeft een diameter van ${d} dm. Hoe groot is de straal?`, `${d / 2} dm`, [[`${d} dm`, 'Dat is de diameter zelf. De straal is de helft.', 'W1'], [`${d * 2} dm`, 'Andersom: diameter = 2 × straal, dus straal = diameter : 2.', 'W1'], [`${d / 4} dm`, 'Eén keer halveren is genoeg.']], `straal = ${d} : 2 = ${d / 2} dm.`); };
  const qHeli = () => { const v = [120, 160, 180, 200, 240][rnd2(0, 4)], t = [15, 20, 30, 45][rnd2(0, 3)], r = v * t / 60; return QD(`De traumahelikopter vliegt ${v} km per uur en moet binnen ${t} minuten ter plaatse zijn. Hoe groot is de straal van het gebied?`, `${g(r)} km`, [[`${v} km`, `Dat haalt hij in een heel uur. In ${t} minuten maar een deel daarvan.`], [`${g(2 * r)} km`, 'Dat is de diameter van het gebied, niet de straal.', 'W1'], [`${v * t} km`, `${v} × ${t}: minuten eerst omrekenen naar uren (${t} min = ${g(t / 60)} uur).`]], `${v} × ${g(t / 60)} = ${g(r)} km.`); };
  const POOL = [
    qStraal, qHeli,
    QD('Middelpunt M(3, 1). Het punt (5, 0) ligt op de cirkel. Waar ligt het punt (2, 0)?', 'binnen de cirkel', [['op de cirkel', '(2, 0) ligt dichter bij M dan (5, 0): 1 opzij en 1 omlaag, tegen 2 opzij en 1 omlaag.', 'W2'], ['buiten de cirkel', 'Het ligt juist dichter bij M dan de rand.'], ['dat kun je niet weten', 'Wel: vergelijk de afstanden tot M.']], 'Dichter bij M dan de straal = binnen.'),
    QD('Alle punten waarvan de afstand tot A <b>kleiner</b> is dan 3 cm. Wat is dat?', 'het binnengebied, zonder de rand', [['het binnengebied met de rand erbij', 'Op de rand is de afstand precies 3, niet kleiner.', 'W2'], ['de cirkel ⊙(A, 3 cm) zelf', 'De cirkel is "gelijk aan 3".'], ['het buitengebied van de cirkel', 'Buiten is de afstand groter dan 3.']], 'Kleiner dan r: binnengebied, de cirkel hoort er niet bij.'),
    QD('Alle punten op afstand 2 cm van lijn l vormen ...', 'twee lijnen evenwijdig met l', [['één lijn evenwijdig met l', 'Aan elke kant van l ligt er een.', 'W4'], ['een cirkel rond l', 'Rond een punt krijg je een cirkel, bij een lijn niet.'], ['een strook rond l', 'De strook is "kleiner dan 2 cm".']], 'Aan elke kant één lijn op 2 cm.'),
    QD('Hoe meet je de afstand van punt P tot lijn l?', 'loodrecht van P naar l', [['schuin naar een punt van l', 'Schuin is altijd langer. De afstand is de kortste weg: loodrecht.', 'W3'], ['naar het midden van l', 'Een lijn heeft geen midden; de afstand is loodrecht.', 'W3'], ['langs de lijn l', 'Je meet van P naar l, loodrecht.']], 'De afstand is de lengte van de loodrechte lijn naar l.'),
    QD('Alle punten waarvan de afstand tot de x-as gelijk is aan 1. Welke lijnen zijn dat?', 'y = 1 en y = −1', [['alleen y = 1', 'Onder de x-as liggen ook punten op afstand 1.', 'W4'], ['x = 1 en x = −1', 'Dat zijn de punten op afstand 1 van de y-as.'], ['y = 0', 'Dat is de x-as zelf.']], 'Boven en onder de x-as één lijn.'),
    /* §2.2 */
    QD('Alle punten die even ver van A als van B liggen, vormen ...', 'de middelloodlijn van AB', [['alleen het midden van AB', 'Het midden is er maar één van. Er zijn veel meer punten even ver.', 'W5'], ['een lijn door het midden, schuin', 'Die lijn moet ook loodrecht op AB staan.', 'W6'], ['de bissectrice van AB', 'Een bissectrice hoort bij een hoek, niet bij twee punten.', 'W8']], 'Door het midden én loodrecht op AB.'),
    QD('Punten die <b>dichter bij A</b> dan bij B liggen ...', 'liggen aan de kant van A', [['liggen aan de kant van B', 'Andersom: de kant waar A ligt.', 'W7'], ['liggen op de middelloodlijn', 'Op de middelloodlijn zijn ze even ver.'], ['liggen op lijnstuk AB', 'Ook naast AB liggen punten dichter bij A.']], 'Het halfvlak aan de kant van A van de middelloodlijn.'),
    QD('Het middelpunt van de <b>omgeschreven</b> cirkel van een driehoek is het snijpunt van ...', 'de middelloodlijnen', [['de bissectrices', 'Die geven de ingeschreven cirkel.', 'W10'], ['de zwaartelijnen', 'Die geven het zwaartepunt.', 'W11'], ['de hoogtelijnen', 'Die geven het hoogtepunt.', 'W12']], 'Even ver van de drie hoekpunten = middelloodlijnen.'),
    QD('Bij een stomphoekige driehoek ligt het middelpunt van de omgeschreven cirkel ...', 'buiten de driehoek', [['binnen de driehoek', 'Bij een stompe hoek schuift het naar buiten.'], ['op de langste zijde', 'Dat is bij een rechthoekige driehoek.'], ['in het stompe hoekpunt', 'Dan zou de straal 0 zijn.']], 'Stomp: buiten. Rechthoekig: midden van de langste zijde.'),
    /* §2.3 */
    QD('Alle punten binnen ∠C die even ver van beide benen liggen, vormen ...', 'de bissectrice van ∠C', [['de middelloodlijn', 'Die hoort bij twee punten.', 'W6'], ['de zwaartelijn uit C', 'Die gaat naar het midden van de overkant.', 'W8'], ['de hoogtelijn uit C', 'Die staat loodrecht op de overkant.']], 'Even ver van twee benen = bissectrice.'),
    QD('Het middelpunt van de <b>ingeschreven</b> cirkel is het snijpunt van ...', 'de bissectrices', [['de middelloodlijnen', 'Die geven de omgeschreven cirkel.', 'W10'], ['de hoogtelijnen', 'Die geven het hoogtepunt.', 'W12'], ['de zwaartelijnen', 'Die geven het zwaartepunt.']], 'De ingeschreven cirkel raakt de drie zijden.'),
    QD('De straal van de ingeschreven cirkel teken je vanuit M ...', 'loodrecht naar een zijde', [['naar een hoekpunt', 'Dat is de straal van de omgeschreven cirkel.', 'W9'], ['naar het midden van een zijde', 'De cirkel raakt de zijde niet altijd in het midden.'], ['schuin naar een zijde', 'De afstand tot een zijde meet je loodrecht.', 'W3']], 'De cirkel raakt de zijde: loodrecht.'),
    /* §2.4 */
    QD('Een zwaartelijn gaat door een hoekpunt en ...', 'het midden van de overstaande zijde', [['staat loodrecht op de overstaande zijde', 'Dat is de hoogtelijn.', 'W11'], ['deelt de hoek middendoor', 'Dat is de bissectrice.', 'W8'], ['het midden van een aanliggende zijde', 'Het is de overstaande zijde.']], 'Hoekpunt naar het midden van de overkant.'),
    () => { const pts = [[-3, -2, 7, 0, -1, 5], [1, 1, 4, 0, 4, 5], [0, 0, 6, 0, 3, 6], [-2, 1, 5, 3, 0, 5]][rnd2(0, 3)], x = (pts[0] + pts[2] + pts[4]) / 3, y = (pts[1] + pts[3] + pts[5]) / 3, f = v => g(v).replace('-', '−');
      return QD(`△DEF met D(${f(pts[0])}, ${f(pts[1])}), E(${f(pts[2])}, ${f(pts[3])}) en F(${f(pts[4])}, ${f(pts[5])}). Waar ligt het zwaartepunt Z?`, `(${f(x)}, ${f(y)})`, [[`(${f((pts[0] + pts[2] + pts[4]) / 2)}, ${f((pts[1] + pts[3] + pts[5]) / 2)})`, 'Je deelde door 2. Er zijn drie hoekpunten: deel door 3.'], [`(${f(pts[0] + pts[2] + pts[4])}, ${f(pts[1] + pts[3] + pts[5])})`, 'Opgeteld, maar nog niet gedeeld door 3.'], [`(${f((pts[2] + pts[4]) / 2)}, ${f((pts[3] + pts[5]) / 2)})`, 'Dat is het midden van EF, niet het zwaartepunt.', 'W11']], 'Z = het gemiddelde van de drie hoekpunten.'); },
    QD('In een stomphoekige driehoek ligt het hoogtepunt H ...', 'buiten de driehoek', [['binnen de driehoek', 'Bij een stompe hoek liggen twee hoogtelijnen en H buiten.', 'W12'], ['in het stompe hoekpunt', 'Dat is bij een rechthoekige driehoek (in de rechte hoek).'], ['op de langste zijde', 'H ligt buiten.']], 'Verleng de zijden: H ligt buiten.'),
    QD('Waar ligt het hoogtepunt van een rechthoekige driehoek?', 'in het hoekpunt met de rechte hoek', [['buiten de driehoek', 'Dat is bij een stompe driehoek.', 'W12'], ['op het midden van de langste zijde', 'Dat is het middelpunt van de omgeschreven cirkel.', 'W10'], ['precies in het midden', 'De twee rechthoekszijden zijn zelf hoogtelijnen.']], 'Twee hoogtelijnen zijn de rechthoekszijden.'),
    /* §2.5 */
    GEN.gDriehoek, GEN.gTerug, GEN.gStomp,
    F.EFG && VQ('maatkiezer', F.EFG, 'Kies de zijde en de hoogte.'),
    F.STOMP_IV && VQ('maatkiezer', F.STOMP_IV, 'Kijk ook buiten de driehoek.'),
    QD('Een konijnenhok heeft een houten bodem van 110 cm bij 60 cm. Hoeveel m²?', '0,66 m²', [['66 m²', '6600 cm². 1 m² = 10 000 cm².'], ['6,6 m²', 'Deel door 10 000, niet door 1000.'], ['1,7 m²', '110 + 60 is een lengte.', 'W20']], '6600 cm² = 0,66 m².'),
    /* §2.6 */
    GEN.gPar, GEN.gTrap, GEN.gRuit, GEN.gL,
    F.PAR1 && VQ('maatkiezer', F.PAR1, 'Kies een paar.'),
    F.TRAP81 && VQ('maatkiezer', F.TRAP81, 'Kies de drie maten.'),
    F.VIJF88 && VQ('splitser', { ...F.VIJF88, vraag: 'Hoeveel mm² stof?', opties: [{ t: '890 mm²', goed: true }, { t: '950 mm²', fout: 'De rechthoek; het driehoekje moet eraf.', mis: 'W22' }, { t: '1010 mm²', fout: 'Eraf, niet erbij.', mis: 'W22' }, { t: '890 mm', fout: 'Oppervlakte is in mm².', mis: 'W21' }], w: '38 × 25 − ½ × 8 × 15 = 890 mm².' }, 'Kies een route.'),
    QD('Trapezium ABCD: DC = 28 mm, AB = 54 mm, hoogte 24 mm. Oppervlakte?', '984 mm²', [['18 144 mm²', '½ × 28 × 54 × 24: tel de evenwijdige zijden op.', 'W19'], ['1968 mm²', '(28 + 54) × 24 zonder ½.', 'W14'], ['984 mm', 'Oppervlakte is in mm².', 'W21']], '½ × (28 + 54) × 24 = 984 mm².'),
    GEN.gEenheid,
  ].filter(Boolean);

  return [{ id: 'eindbaas', titel: 'Generale repetitie', sub: 'alles door elkaar · toetsniveau', bol: svgStr(WK.badge.trofee()), orgs: ['o-trofee'],
    stappen: [
      uitleg('De generale repetitie! De Kaartvervormer gooit alles door elkaar: cirkels, afstanden, lijnen in de driehoek en stof uit Het Atelier. Precies zoals op de toets. Neem je tijd: er is geen klok. Twijfel je? Meet het na of teken het even.', `${beeld}<div style="margin-top:6px">tien treffers en hij is verslagen</div>`),
      baas('De Kaartvervormer', beeld, 'Alles lijkt op elkaar: straal of diameter, middelloodlijn of bissectrice, schuine zijde of hoogte.', 'De Kaartvervormer husselt het hele hoofdstuk door elkaar. Elke vraag komt uit een andere paragraaf. Fout kost jou niks.', POOL, 10),
    ] }];
})();
LOGBOEK['o-trofee'] = { naam: 'Hoofdstuktrofee', svg: WK.badge.trofee(), sub: 'generale repetitie gehaald', waar: 'Versla De Kaartvervormer' };
