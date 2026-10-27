'use strict';
/* =========================================================================
   BIOLOGIE: tekenbibliotheek (canoniek: tools/speelles-engine/biologie/teken.js)
   Alles zelf getekend in SVG (geen AI-beeld, geen emoji als hoofdillustratie).
   - DEFS: gedeelde gradients/filters, één keer in de pagina gezet (bioDefs()).
   - ORG.<naam>(opties) -> svg-markup in een vak van 100 x 100.
   - SCENE.<naam>() -> svg-markup in een vak van 320 x 200 (voor zoomlift e.d.).
   - monster({...}) -> svg-markup in 120 x 120 (bazen).
   Gebruik: svgEl(ORG.konijn()) of sv('g', {html: ORG.vos(), transform: ...}).
   ========================================================================= */

function bioDefs() {
  if (document.getElementById('bio-defs')) return;
  const g = (id, a, b, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" style="stop-color:${a}"/><stop offset="1" style="stop-color:${b}"/></linearGradient>`;
  const r = (id, a, b) => `<radialGradient id="${id}" cx=".38" cy=".32" r=".75"><stop offset="0" style="stop-color:${a}"/><stop offset="1" style="stop-color:${b}"/></radialGradient>`;
  const defs = [
    g('g-gras', '#B5E36A', '#3F8F2A'), g('g-blad', '#9AD86A', '#3E9B3A'), g('g-dood', '#D9A35A', '#8A5A2B'),
    r('g-bruin', '#D9A37A', '#8A5A3C'), r('g-wit', '#FFFFFF', '#DCD3CC'), r('g-vos', '#FBAE5C', '#C9551F'),
    r('g-grijs', '#C9C4C8', '#6F6A72'), g('g-baars', '#D8E07A', '#7E9A3A'), g('g-snoek', '#A9C774', '#41672E'),
    r('g-alg', '#9BEA9E', '#2E9E5B'), r('g-vlo', '#EAF7FF', '#8CC6E8'), g('g-worm', '#F7B2B8', '#C9677A'),
    r('g-pad', '#F2715A', '#A92E22'), g('g-steel', '#FFF7EA', '#E2C7A5'), r('g-bact', '#C8EC8A', '#6FA83A'),
    r('g-hond', '#E8BC86', '#A9733F'), r('g-teek', '#8A5240', '#3A1E14'), r('g-cel', '#FFF1E2', '#F6C7A2'),
    r('g-kern', '#D7B4EA', '#8E5BB0'), r('g-zon', '#FFF1A8', '#F4B740'), g('g-water', '#7CC8EE', '#2F7FB8'),
    g('g-lucht', 'var(--scene-lucht1)', 'var(--scene-lucht2)'), g('g-grond', '#A9D46E', '#5E9B3A'),
    g('g-bodem', '#A0703F', '#5E3B1E'), r('g-roodborst', '#FF9A5A', '#D9532A'), r('g-veer', '#B98A5E', '#6E4A2E'),
    r('g-wolf', '#B9B3B8', '#5F5960'), r('g-zwaan', '#FFFFFF', '#D8DEE6'), r('g-kip', '#E9A15A', '#A85A26'),
    g('g-schors', '#9A6B43', '#5A3A20'), r('g-kruin', '#8FD067', '#2F7A2E'), r('g-korst', '#D3E2A6', '#8AA35A'),
    r('g-bij', '#FFD54A', '#E0A400'), r('g-huid', '#F6C9A6', '#D99A72'), r('g-aarde', '#7FD0F0', '#2C7DB8'),
    g('g-dna-a', '#F49A6A', '#E0602A'), g('g-plastic', '#CFEFFF', '#7BBFE0'), r('g-schild', '#9CC46A', '#4F7A30'),
    r('g-muis', '#B8AFA8', '#77695F'), r('g-rups', '#B6E35A', '#5E9E22'), r('g-roof', '#C49064', '#6A4428'),
    r('g-glans', 'rgba(255,255,255,.85)', 'rgba(255,255,255,0)'), r('g-tumor', '#F59AA8', '#C04A64'),
    r('g-stuif', '#FFE27A', '#E3A81E'),
  ].join('');
  const filt = `<filter id="f-schaduw" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#3D1B33" flood-opacity=".22"/></filter>`;
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  el.setAttribute('id', 'bio-defs'); el.setAttribute('width', '0'); el.setAttribute('height', '0'); el.setAttribute('aria-hidden', 'true');
  el.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  el.innerHTML = '<defs>' + defs + filt + '</defs>';
  document.body.prepend(el);
}

const schaduw = (cx = 50, cy = 91, rx = 30) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="4.5" fill="#000" opacity=".13"/>`;
const oog = (x, y, r = 2.6, kleur = '#2B1726') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${kleur}"/><circle cx="${x + r * .3}" cy="${y - r * .35}" r="${r * .38}" fill="#fff"/>`;

const ORG = {
  konijn: ({ albino = false } = {}) => {
    const f = albino ? 'url(#g-wit)' : 'url(#g-bruin)', oogk = albino ? '#D9405A' : '#2B1726', oor = albino ? '#F7C6CC' : '#F2B8B0';
    return schaduw(50, 91, 32) + `<g filter="url(#f-schaduw)">
    <path d="M58 32 C53 12 59 5 64 7 C68 10 66 23 63 35Z" fill="${f}"/>
    <path d="M22 84 C15 66 24 48 44 46 C60 44 73 56 73 70 C73 82 65 89 50 89 L30 89 C25 89 23 88 22 84Z" fill="${f}"/>
    <circle cx="22" cy="73" r="7.5" fill="#F7F1EA"/>
    <ellipse cx="70" cy="47" rx="15.5" ry="13" fill="${f}"/>
    <path d="M64 37 C60 14 66 6 71 8 C76 11 74 27 69 39Z" fill="${f}"/><path d="M66 34 C64 18 67 12 70 13 C72 15 71 26 68 35Z" fill="${oor}"/>
    <path d="M57 80 C57 86 62 90 70 90 C75 90 75 85 70 84 L63 79Z" fill="${f}"/>
    <path d="M38 58 C47 52 59 54 64 62" stroke="#fff" stroke-opacity=".4" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${oog(74, 44, 2.7, oogk)}<circle cx="85" cy="49" r="2" fill="#E58A8A"/>
    <path d="M84 53 L92 51 M84 54 L91 57" stroke="#7A5A48" stroke-width=".8" opacity=".6"/></g>`;
  },
  vos: () => schaduw(52, 90, 36) + `<g filter="url(#f-schaduw)">
    <path d="M30 62 C14 66 2 56 6 42 C9 34 18 38 22 46 C25 52 30 56 34 58Z" fill="url(#g-vos)"/>
    <path d="M6 42 C4 48 6 54 11 57 C10 50 11 46 14 42 C11 40 8 40 6 42Z" fill="#FFF7EE"/>
    <path d="M29 58 C31 45 50 43 64 47 C73 50 75 60 71 66 C65 73 41 73 33 69Z" fill="url(#g-vos)"/>
    <path d="M36 67 L33 87 L39 87 L43 69Z M61 67 L63 87 L69 87 L68 64Z" fill="#3A2216"/>
    <path d="M64 50 C65 39 76 35 84 39 L95 46 C93 50 87 53 80 55 C73 59 66 58 64 50Z" fill="url(#g-vos)"/>
    <path d="M69 41 L71 27 L78 38Z M76 38 L82 27 L85 40Z" fill="#B9481A"/><path d="M71 38 L72 31 L76 37Z" fill="#3A2216" opacity=".5"/>
    <path d="M79 51 C84 53 90 50 95 46 C90 48 84 48 79 51Z" fill="#FFF7EE"/>
    <path d="M64 52 C62 60 64 65 68 67 C70 60 70 54 66 50Z" fill="#FFF7EE" opacity=".95"/>
    ${oog(80, 44, 2.3)}<circle cx="95" cy="46" r="1.9" fill="#2B1726"/></g>`,
  gras: () => schaduw(50, 91, 26) + `<g fill="url(#g-gras)" filter="url(#f-schaduw)">
    <path d="M50 89 C46 70 40 50 28 34 C42 48 50 66 55 89Z"/><path d="M52 89 C54 64 59 44 72 25 C63 46 59 66 59 89Z"/>
    <path d="M45 89 C39 75 27 65 13 60 C29 62 42 72 50 89Z"/><path d="M57 89 C63 75 75 67 88 65 C75 71 65 79 61 89Z"/>
    <path d="M49 89 C49 66 49 43 47 15 C54 40 56 66 54 89Z"/></g>
    <circle cx="72" cy="25" r="4" fill="#F4B740"/><circle cx="72" cy="25" r="1.6" fill="#C9551F"/>`,
  alg: () => `<circle cx="50" cy="50" r="44" fill="url(#g-water)" opacity=".18"/>` +
    [[38, 40, 15], [62, 36, 12], [56, 62, 16], [32, 64, 11], [70, 58, 9]].map(([x, y, r]) =>
      `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#g-alg)" stroke="#1E7A45" stroke-width="1.6"/><circle cx="${x - r * .3}" cy="${y - r * .2}" r="${r * .22}" fill="#1E7A45" opacity=".55"/><circle cx="${x + r * .25}" cy="${y + r * .25}" r="${r * .18}" fill="#1E7A45" opacity=".45"/><ellipse cx="${x - r * .35}" cy="${y - r * .45}" rx="${r * .35}" ry="${r * .18}" fill="#fff" opacity=".55"/>`).join(''),
  watervlo: () => `<g filter="url(#f-schaduw)">
    <path d="M34 30 C50 18 73 28 75 50 C77 70 63 86 45 82 C37 80 39 74 43 72 C31 66 26 44 34 30Z" fill="url(#g-vlo)" stroke="#4D8DB5" stroke-width="2"/>
    <path d="M73 64 L90 78" stroke="#4D8DB5" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M36 40 C25 40 15 33 9 22 M24 36 C20 45 14 49 7 51 M15 30 L10 33 M18 42 L13 46" stroke="#4D8DB5" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M45 44 C55 46 61 56 59 71" stroke="#6FAE4A" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <circle cx="60" cy="40" r="4" fill="#F49A6A" opacity=".8"/><circle cx="64" cy="62" r="3" fill="#B7E07A"/><circle cx="68" cy="56" r="3" fill="#B7E07A"/>
    ${oog(40, 35, 5)}<ellipse cx="50" cy="30" rx="10" ry="4" fill="#fff" opacity=".6"/></g>`,
  baars: () => `<g filter="url(#f-schaduw)">
    <path d="M14 50 L2 35 L5 50 L2 65Z" fill="#E07A3A"/>
    <path d="M33 34 L37 19 L43 31 L48 17 L53 30 L58 19 L63 34Z" fill="#8FA640" stroke="#56702A" stroke-width="1.2"/>
    <path d="M10 50 C22 30 56 26 76 37 C85 42 91 48 93 50 C91 54 85 58 76 63 C56 74 22 70 10 50Z" fill="url(#g-baars)"/>
    <path d="M36 33 C34 46 34 56 36 67 M48 30 C46 46 46 58 48 69 M60 32 C58 46 58 56 60 67" stroke="#3E5A22" stroke-width="5.5" opacity=".5" fill="none" stroke-linecap="round"/>
    <path d="M50 66 L45 81 L59 68Z M28 64 L26 74 L36 66Z" fill="#E07A3A"/>
    <path d="M72 40 C68 48 68 56 72 62" stroke="#56702A" stroke-width="1.5" fill="none" opacity=".7"/>
    <path d="M24 56 C44 64 64 62 80 56" stroke="#fff" stroke-opacity=".45" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="81" cy="46" r="4.5" fill="#FFF8D8"/>${oog(82, 46, 2.6)}</g>`,
  snoek: () => `<g filter="url(#f-schaduw)">
    <path d="M12 52 L2 40 L5 52 L2 64Z" fill="#5E7A30"/>
    <path d="M22 46 L27 35 L35 45Z M24 58 L28 67 L35 59Z" fill="#5E7A30"/>
    <path d="M8 52 C20 40 60 38 84 44 L97 48 L85 52 C60 62 20 63 8 52Z" fill="url(#g-snoek)"/>
    ${[[30, 48], [42, 46], [54, 47], [36, 54], [48, 55], [62, 52], [24, 51]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3.4" ry="1.8" fill="#EEF0A8" opacity=".75"/>`).join('')}
    <path d="M85 50 L97 48" stroke="#2B3A1A" stroke-width="1.5"/>
    <path d="M18 56 C40 60 64 58 82 52" stroke="#fff" stroke-opacity=".35" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    ${oog(84, 45, 2.4)}</g>`,
  regenworm: () => `<path d="M2 84 H98" stroke="#8A5A2B" stroke-width="2" opacity=".35"/>` +
    `<path d="M12 72 C24 50 40 82 56 62 C70 46 80 56 90 44" stroke="url(#g-worm)" stroke-width="13" fill="none" stroke-linecap="round" filter="url(#f-schaduw)"/>` +
    `<path d="M12 72 C24 50 40 82 56 62 C70 46 80 56 90 44" stroke="#A84A5E" stroke-width="13" fill="none" stroke-dasharray="1.2 4.5" opacity=".35"/>` +
    `<path d="M58 60 C62 54 66 52 70 50" stroke="#E07A8A" stroke-width="15" fill="none" stroke-linecap="round" opacity=".8"/>` +
    `<path d="M14 66 C24 52 36 70 52 58" stroke="#fff" stroke-opacity=".45" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
  pissebed: () => schaduw(50, 80, 30) + `<g filter="url(#f-schaduw)"><ellipse cx="50" cy="58" rx="34" ry="20" fill="url(#g-grijs)"/>` +
    [30, 38, 46, 54, 62, 70].map(x => `<path d="M${x} 40 C${x - 3} 52 ${x - 3} 64 ${x} 76" stroke="#55505A" stroke-width="1.6" fill="none"/>`).join('') +
    `<path d="M84 52 C92 46 96 40 98 34 M84 58 C92 58 97 60 99 64" stroke="#55505A" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="44" cy="48" rx="18" ry="5" fill="#fff" opacity=".35"/></g>`,
  paddenstoel: () => `<path d="M10 92 C24 86 30 94 44 88 M56 88 C70 94 76 86 90 92" stroke="#E9DCC6" stroke-width="1.5" fill="none" opacity=".9"/>` + schaduw(50, 90, 26) +
    `<g filter="url(#f-schaduw)"><path d="M42 58 C40 72 38 84 35 89 L65 89 C62 84 60 72 58 58Z" fill="url(#g-steel)"/>
    <path d="M10 60 C10 26 90 26 90 60 C70 67 30 67 10 60Z" fill="url(#g-pad)"/>
    <path d="M18 61 C40 68 60 68 82 61" stroke="#F3D7C2" stroke-width="3" fill="none"/>
    <circle cx="34" cy="42" r="5" fill="#FFF4EA"/><circle cx="56" cy="36" r="6" fill="#FFF4EA"/><circle cx="72" cy="48" r="4" fill="#FFF4EA"/><circle cx="24" cy="54" r="3" fill="#FFF4EA"/>
    <ellipse cx="38" cy="34" rx="12" ry="4" fill="#fff" opacity=".35" transform="rotate(-18 38 34)"/></g>`,
  bacterie: () => [[-18, 22, 26], [24, 52, 40], [-50, 30, 64]].map(([rot, x, y]) =>
    `<g transform="rotate(${rot} ${x + 20} ${y + 9})" filter="url(#f-schaduw)"><rect x="${x}" y="${y}" width="40" height="18" rx="9" fill="url(#g-bact)" stroke="#4E8A2A" stroke-width="1.6"/><path d="M${x + 40} ${y + 9} C${x + 46} ${y + 3} ${x + 50} ${y + 15} ${x + 56} ${y + 9} C${x + 60} ${y + 5} ${x + 63} ${y + 11} ${x + 67} ${y + 8}" stroke="#4E8A2A" stroke-width="1.6" fill="none"/><ellipse cx="${x + 14}" cy="${y + 6}" rx="8" ry="2.5" fill="#fff" opacity=".5"/></g>`).join(''),
  boom: () => schaduw(50, 92, 28) + `<g filter="url(#f-schaduw)"><path d="M44 92 C46 76 45 64 42 54 L58 54 C55 64 54 76 56 92Z" fill="url(#g-schors)"/>
    <path d="M50 62 L38 50 M51 66 L62 54" stroke="#5A3A20" stroke-width="4" stroke-linecap="round"/>
    <circle cx="50" cy="34" r="24" fill="url(#g-kruin)"/><circle cx="30" cy="46" r="16" fill="url(#g-kruin)"/><circle cx="70" cy="46" r="16" fill="url(#g-kruin)"/><circle cx="50" cy="50" r="15" fill="url(#g-kruin)"/>
    <ellipse cx="42" cy="22" rx="10" ry="5" fill="#fff" opacity=".25"/></g>`,
  doodblad: () => schaduw(50, 86, 26) + `<g filter="url(#f-schaduw)" transform="rotate(-24 50 50)"><path d="M50 10 C76 26 80 62 50 88 C20 62 24 26 50 10Z" fill="url(#g-dood)"/>
    <path d="M50 14 V86 M50 34 L36 26 M50 46 L34 40 M50 58 L36 54 M50 34 L64 26 M50 46 L66 40 M50 58 L64 54" stroke="#6E4520" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <circle cx="62" cy="64" r="5" fill="#6E4520" opacity=".35"/><circle cx="40" cy="30" r="3" fill="#6E4520" opacity=".3"/></g>`,
  korstmos: () => `<path d="M8 80 C10 56 28 44 52 46 C76 48 92 60 92 80 C70 88 30 88 8 80Z" fill="url(#g-grijs)" filter="url(#f-schaduw)"/>` +
    [[30, 58, 13], [52, 54, 15], [72, 62, 11], [42, 70, 9], [62, 72, 8]].map(([x, y, r]) => `<path d="M${x - r} ${y} C${x - r} ${y - r} ${x + r} ${y - r} ${x + r} ${y} C${x + r * .6} ${y + r * .3} ${x - r * .6} ${y + r * .3} ${x - r} ${y}Z" fill="url(#g-korst)" stroke="#7A904A" stroke-width="1.2"/>`).join('') +
    `<circle cx="34" cy="54" r="2" fill="#2E9E5B"/><circle cx="56" cy="50" r="2" fill="#2E9E5B"/><circle cx="70" cy="58" r="1.8" fill="#2E9E5B"/>`,
  bij: () => `<g filter="url(#f-schaduw)"><ellipse cx="40" cy="34" rx="14" ry="20" fill="#E8F6FF" opacity=".8" stroke="#9CC7E0" transform="rotate(-25 40 34)"/><ellipse cx="60" cy="32" rx="12" ry="18" fill="#E8F6FF" opacity=".8" stroke="#9CC7E0" transform="rotate(20 60 32)"/>
    <ellipse cx="52" cy="58" rx="28" ry="19" fill="url(#g-bij)"/>
    <path d="M40 41 C36 50 36 66 40 75 M54 39 C50 50 50 66 54 77 M67 44 C64 52 64 64 67 72" stroke="#2B1726" stroke-width="6" fill="none"/>
    <circle cx="80" cy="54" r="11" fill="#2B1726"/>${oog(84, 51, 2.4, '#000')}<path d="M86 44 C90 36 94 34 97 34 M82 44 C84 36 86 32 90 30" stroke="#2B1726" stroke-width="1.6" fill="none"/>
    <path d="M24 58 L14 60" stroke="#2B1726" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="46" cy="48" rx="12" ry="4" fill="#fff" opacity=".4"/></g>`,
  bloem: () => schaduw(50, 92, 18) + `<path d="M50 92 C50 76 52 64 50 52" stroke="#3E8F2A" stroke-width="4" fill="none"/><path d="M50 78 C40 70 32 72 28 76 C36 80 44 80 50 78Z" fill="url(#g-blad)"/>` +
    [0, 60, 120, 180, 240, 300].map(a => `<ellipse cx="50" cy="22" rx="10" ry="16" fill="#F7A6C8" stroke="#D96A9A" stroke-width="1.2" transform="rotate(${a} 50 38)"/>`).join('') +
    `<circle cx="50" cy="38" r="10" fill="url(#g-zon)"/><circle cx="47" cy="35" r="2" fill="#C9551F" opacity=".5"/><circle cx="53" cy="40" r="1.6" fill="#C9551F" opacity=".5"/>`,
  hond: () => schaduw(50, 91, 34) + `<g filter="url(#f-schaduw)"><path d="M14 52 C8 44 10 36 16 34" stroke="#A9733F" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M18 50 C20 40 54 38 66 44 C72 48 72 60 66 64 C52 70 26 68 18 60Z" fill="url(#g-hond)"/>
    <path d="M24 62 L22 88 L29 88 L32 64Z M58 64 L60 88 L67 88 L66 60Z M40 66 L39 86 M50 66 L51 86" stroke="none" fill="#A9733F"/>
    <path d="M62 44 C62 30 76 24 86 30 C94 34 96 42 92 46 C86 50 70 52 62 44Z" fill="url(#g-hond)"/>
    <path d="M72 28 C66 30 64 42 68 48 C72 44 74 36 72 28Z" fill="#7A4A22"/>
    ${oog(82, 36, 2.4)}<ellipse cx="95" cy="42" rx="3" ry="2.4" fill="#2B1726"/><path d="M86 46 C88 49 92 49 94 47" stroke="#2B1726" stroke-width="1.2" fill="none"/>
    <path d="M26 48 C40 44 54 44 62 48" stroke="#fff" stroke-opacity=".35" stroke-width="3" fill="none" stroke-linecap="round"/></g>`,
  teek: () => `<g filter="url(#f-schaduw)">` + [[-1, 0], [1, 0]].map(([s]) => [36, 46, 56, 66].map((y, i) => `<path d="M50 ${y - 4} C${50 + s * 24} ${y - 10 + i * 2} ${50 + s * 34} ${y + i * 3} ${50 + s * 40} ${y + 8 + i * 4}" stroke="#3A1E14" stroke-width="2.6" fill="none" stroke-linecap="round"/>`).join('')).join('') +
    `<ellipse cx="50" cy="56" rx="22" ry="28" fill="url(#g-teek)"/><ellipse cx="50" cy="38" rx="14" ry="11" fill="#2A140D"/><path d="M46 26 L50 16 L54 26Z" fill="#2A140D"/>
    <ellipse cx="44" cy="52" rx="8" ry="14" fill="#fff" opacity=".18"/></g>`,
  luis: () => `<g filter="url(#f-schaduw)">` + [-1, 1].map(s => [44, 54, 64].map(y => `<path d="M50 ${y} C${50 + s * 16} ${y - 6} ${50 + s * 24} ${y} ${50 + s * 28} ${y + 8}" stroke="#7A6450" stroke-width="2.4" fill="none" stroke-linecap="round"/>`).join('')).join('') +
    `<ellipse cx="50" cy="62" rx="15" ry="24" fill="#D8C4A6" stroke="#9A8064" stroke-width="1.5"/><ellipse cx="50" cy="34" rx="9" ry="8" fill="#C9B08E"/>${oog(46, 32, 1.6)}${oog(54, 32, 1.6)}
    <path d="M44 28 L38 20 M56 28 L62 20" stroke="#7A6450" stroke-width="1.8"/><path d="M42 56 H58 M41 64 H59 M43 72 H57" stroke="#9A8064" stroke-width="1.4"/></g>`,
  lintworm: () => `<path d="M10 20 C40 10 70 30 60 50 C50 70 20 60 30 80 C36 90 60 92 86 84" stroke="#F1E6C8" stroke-width="10" fill="none" stroke-linecap="round" filter="url(#f-schaduw)"/><path d="M10 20 C40 10 70 30 60 50 C50 70 20 60 30 80 C36 90 60 92 86 84" stroke="#C9B48A" stroke-width="10" fill="none" stroke-dasharray="1.5 5"/><circle cx="10" cy="20" r="4" fill="#C9B48A"/>`,
  wolf: () => schaduw(52, 91, 36) + `<g filter="url(#f-schaduw)"><path d="M28 56 C16 62 6 58 6 50 C10 52 18 52 26 50Z" fill="url(#g-wolf)"/>
    <path d="M26 56 C28 42 52 40 66 45 C75 48 77 60 72 66 C66 73 40 73 32 69Z" fill="url(#g-wolf)"/>
    <path d="M34 67 L31 89 L37 89 L41 69Z M62 67 L64 89 L70 89 L69 64Z" fill="#4F4950"/>
    <path d="M64 48 C64 36 76 32 84 36 L96 44 C94 48 88 52 80 54 C72 58 64 56 64 48Z" fill="url(#g-wolf)"/>
    <path d="M69 39 L71 25 L78 36Z M76 36 L82 25 L85 38Z" fill="#5F5960"/>
    <path d="M78 50 C84 52 90 50 96 44 C90 47 84 47 78 50Z" fill="#EDEAEC"/>${oog(80, 42, 2.3, '#C98A1A')}<circle cx="96" cy="44" r="2" fill="#2B1726"/>
    <path d="M30 50 C42 46 56 46 64 50" stroke="#fff" stroke-opacity=".35" stroke-width="3" fill="none"/></g>`,
  roodborst: () => schaduw(50, 90, 22) + `<g filter="url(#f-schaduw)"><path d="M20 60 L6 70 L10 58Z" fill="#6E4A2E"/>
    <ellipse cx="46" cy="58" rx="28" ry="24" fill="url(#g-veer)"/><path d="M50 38 C66 38 74 50 72 62 C68 76 52 80 44 74 C50 62 50 50 50 38Z" fill="url(#g-roodborst)"/>
    <circle cx="62" cy="36" r="15" fill="url(#g-veer)"/><path d="M62 42 C70 40 74 46 72 52 C66 52 62 48 62 42Z" fill="url(#g-roodborst)"/>
    ${oog(66, 33, 2.4)}<path d="M76 34 L86 36 L76 39Z" fill="#3A2216"/><path d="M40 82 L38 90 M50 82 L50 90" stroke="#6E4A2E" stroke-width="2"/>
    <path d="M28 52 C34 60 44 62 52 58" stroke="#4E321E" stroke-width="2" fill="none" opacity=".5"/></g>`,
  kip: () => schaduw(50, 91, 26) + `<g filter="url(#f-schaduw)"><path d="M22 50 C14 40 18 30 26 34 C24 26 32 24 34 32 C36 38 32 46 28 52Z" fill="#7A3A16"/>
    <ellipse cx="46" cy="60" rx="26" ry="22" fill="url(#g-kip)"/><circle cx="66" cy="38" r="12" fill="url(#g-kip)"/>
    <path d="M60 28 C60 22 64 22 66 26 C67 20 72 20 72 27 C75 24 78 26 75 30Z" fill="#E0323A"/><path d="M72 44 C74 50 70 52 68 48Z" fill="#E0323A"/>
    <path d="M76 38 L84 40 L76 43Z" fill="#F4B740"/>${oog(69, 36, 2)}<path d="M40 82 L38 90 M52 82 L52 90" stroke="#E0A030" stroke-width="2.4"/>
    <path d="M30 58 C40 66 52 66 60 60" stroke="#7A3A16" stroke-width="2" fill="none" opacity=".55"/></g>`,
  zwaan: () => `<path d="M8 84 C30 80 70 80 92 84" stroke="url(#g-water)" stroke-width="5" fill="none" opacity=".6"/><g filter="url(#f-schaduw)">
    <path d="M20 70 C18 56 34 50 52 54 C66 56 76 62 76 72 C60 80 32 80 20 70Z" fill="url(#g-zwaan)"/>
    <path d="M30 60 C40 52 54 54 62 62 C52 60 40 60 30 60Z" fill="#E6EAF0"/>
    <path d="M70 66 C66 52 64 36 70 26 C74 20 82 22 82 28 C78 30 74 40 76 64Z" fill="url(#g-zwaan)"/>
    <path d="M80 24 L92 30 L82 32Z" fill="#F07A2A"/><path d="M80 24 C82 26 82 30 82 32" stroke="#2B1726" stroke-width="2"/>${oog(78, 26, 1.6)}</g>`,
  mens: () => schaduw(50, 93, 22) + `<g filter="url(#f-schaduw)"><path d="M34 54 C36 46 64 46 66 54 L70 78 L30 78Z" fill="#EA580C"/>
    <path d="M38 78 L38 92 L46 92 L47 78 M53 78 L54 92 L62 92 L62 78" fill="#3D1B33"/>
    <path d="M34 56 L22 72 L27 75 L38 62 M66 56 L78 72 L73 75 L62 62" fill="url(#g-huid)"/>
    <circle cx="23" cy="74" r="5" fill="#F4B740"/><circle cx="77" cy="74" r="5" fill="#F4B740"/>
    <circle cx="50" cy="32" r="14" fill="url(#g-huid)"/>
    <path d="M36 30 C36 16 64 14 64 30 C60 24 50 22 40 26 Z" fill="#6E3A1E"/><path d="M62 24 C72 26 74 40 68 46 C68 38 66 30 62 28Z" fill="#6E3A1E"/>
    ${oog(45, 33, 1.8)}${oog(55, 33, 1.8)}<path d="M46 39 C48 41 52 41 54 39" stroke="#9A4A3A" stroke-width="1.4" fill="none"/>
    <path d="M44 62 H56" stroke="#fff" stroke-width="2" opacity=".6"/><text x="50" y="72" text-anchor="middle" font-size="9" fill="#fff">1</text></g>`,
  muis: () => schaduw(48, 88, 24) + `<g filter="url(#f-schaduw)"><path d="M22 76 C12 80 6 74 10 66" stroke="#B88A8A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M22 78 C18 62 30 52 48 54 C64 56 72 66 70 76 C66 84 30 86 22 78Z" fill="url(#g-muis)"/>
    <path d="M62 60 C64 50 76 48 84 56 L92 64 C88 68 80 70 72 70 C66 70 62 66 62 60Z" fill="url(#g-muis)"/>
    <circle cx="66" cy="50" r="8" fill="url(#g-muis)"/><circle cx="66" cy="50" r="5" fill="#F2B8B0"/>${oog(78, 60, 2)}<circle cx="92" cy="64" r="1.8" fill="#E58A8A"/></g>`,
  rups: () => `<path d="M8 80 H92" stroke="#3E8F2A" stroke-width="3" opacity=".4"/>` + [16, 28, 40, 52, 64].map((x, i) => `<circle cx="${x}" cy="${68 - (i === 2 ? 10 : i === 1 || i === 3 ? 5 : 0)}" r="9" fill="url(#g-rups)" stroke="#4E8A1A" stroke-width="1.2" filter="url(#f-schaduw)"/>`).join('') +
    `<circle cx="78" cy="62" r="11" fill="url(#g-rups)" stroke="#4E8A1A" stroke-width="1.2"/>${oog(82, 59, 2)}<path d="M78 51 L76 44 M84 52 L87 45" stroke="#4E8A1A" stroke-width="1.6"/>`,
  roofvogel: () => schaduw(50, 92, 22) + `<g filter="url(#f-schaduw)"><path d="M10 40 C24 30 40 36 48 48 L36 58 C28 50 18 46 10 40Z M90 40 C76 30 60 36 52 48 L64 58 C72 50 82 46 90 40Z" fill="url(#g-roof)"/>
    <path d="M10 40 C16 44 22 46 30 48 M90 40 C84 44 78 46 70 48" stroke="#4A2E1A" stroke-width="1.5" fill="none"/>
    <ellipse cx="50" cy="60" rx="16" ry="22" fill="url(#g-roof)"/><path d="M42 60 C46 66 54 66 58 60 M42 68 C46 74 54 74 58 68" stroke="#F3E2C8" stroke-width="2" fill="none"/>
    <circle cx="50" cy="38" r="11" fill="url(#g-roof)"/>${oog(46, 36, 2, '#C98A1A')}${oog(54, 36, 2, '#C98A1A')}<path d="M48 42 L50 49 L52 42Z" fill="#F4B740"/>
    <path d="M44 82 L42 90 M56 82 L58 90" stroke="#E0A030" stroke-width="2.4"/></g>`,
  plasticfles: () => schaduw(50, 92, 16) + `<g filter="url(#f-schaduw)" transform="rotate(14 50 55)"><rect x="42" y="10" width="16" height="10" rx="2" fill="#2F7FB8"/>
    <path d="M40 22 H60 C60 30 66 32 66 42 V84 C66 90 34 90 34 84 V42 C34 32 40 30 40 22Z" fill="url(#g-plastic)" stroke="#5AA0C8" stroke-width="1.5"/>
    <rect x="34" y="50" width="32" height="14" fill="#EA580C" opacity=".85"/><path d="M40 40 V80" stroke="#fff" stroke-width="3" opacity=".6" stroke-linecap="round"/></g>`,
  schildpad: () => `<g filter="url(#f-schaduw)"><ellipse cx="22" cy="66" rx="10" ry="6" fill="#7FB04A" transform="rotate(30 22 66)"/><ellipse cx="74" cy="70" rx="10" ry="6" fill="#7FB04A" transform="rotate(-30 74 70)"/>
    <ellipse cx="26" cy="40" rx="11" ry="6" fill="#7FB04A" transform="rotate(-30 26 40)"/><ellipse cx="72" cy="38" rx="11" ry="6" fill="#7FB04A" transform="rotate(30 72 38)"/>
    <ellipse cx="50" cy="54" rx="28" ry="24" fill="url(#g-schild)"/><path d="M50 32 L62 44 L58 62 L42 62 L38 44Z" fill="none" stroke="#3E5A22" stroke-width="2"/>
    <path d="M38 44 L26 44 M62 44 L74 44 M42 62 L34 72 M58 62 L66 72 M50 32 V30" stroke="#3E5A22" stroke-width="2"/>
    <circle cx="50" cy="24" r="9" fill="#8FC05A"/>${oog(46, 22, 1.7)}${oog(54, 22, 1.7)}</g>`,
  zon: () => `<g>` + Array.from({ length: 12 }, (_, i) => `<path d="M50 50 L${50 + 44 * Math.cos(i * Math.PI / 6 - .1)} ${50 + 44 * Math.sin(i * Math.PI / 6 - .1)} L${50 + 44 * Math.cos(i * Math.PI / 6 + .1)} ${50 + 44 * Math.sin(i * Math.PI / 6 + .1)}Z" fill="#F4B740" opacity=".8"/>`).join('') + `<circle cx="50" cy="50" r="26" fill="url(#g-zon)"/><ellipse cx="42" cy="40" rx="9" ry="5" fill="#fff" opacity=".5"/></g>`,
  wolk: ({ regen = true } = {}) => `<g filter="url(#f-schaduw)"><path d="M20 56 C10 56 10 40 22 40 C22 26 42 22 48 34 C54 22 76 26 74 42 C88 40 90 58 78 58Z" fill="#F3F7FB" stroke="#B8C8D8" stroke-width="1.5"/></g>` +
    (regen ? [30, 44, 58, 70].map((x, i) => `<path d="M${x} ${66 + (i % 2) * 6} l-3 9" stroke="#2F7FB8" stroke-width="3" stroke-linecap="round"/>`).join('') : ''),
  steen: () => schaduw(50, 84, 30) + `<path d="M18 82 C12 66 24 50 44 50 C64 46 84 56 84 72 C84 84 60 86 18 82Z" fill="url(#g-grijs)" filter="url(#f-schaduw)"/><ellipse cx="40" cy="60" rx="12" ry="4" fill="#fff" opacity=".35"/>`,
  thermometer: () => `<rect x="42" y="10" width="16" height="64" rx="8" fill="#fff" stroke="#9A8A94" stroke-width="2"/><rect x="47" y="34" width="6" height="44" fill="#E0323A"/><circle cx="50" cy="80" r="12" fill="#E0323A" stroke="#9A8A94" stroke-width="2"/>` + [20, 30, 40, 50, 60].map(y => `<path d="M58 ${y} h6" stroke="#9A8A94" stroke-width="1.5"/>`).join(''),
  druppel: () => `<path d="M50 10 C62 32 76 46 76 64 C76 80 64 90 50 90 C36 90 24 80 24 64 C24 46 38 32 50 10Z" fill="url(#g-water)" filter="url(#f-schaduw)"/><ellipse cx="40" cy="60" rx="5" ry="10" fill="#fff" opacity=".55"/>`,
  wind: () => `<path d="M10 36 H62 C74 36 74 20 62 20 C56 20 54 26 56 30 M10 52 H78 C90 52 90 70 78 70 C72 70 70 64 72 60 M10 68 H44" stroke="#7FA6C2" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  bodem: () => `<rect x="6" y="40" width="88" height="50" rx="10" fill="url(#g-bodem)"/><path d="M6 46 C30 40 70 50 94 44 V40 H6Z" fill="url(#g-grond)"/>` + [[20, 60], [40, 74], [64, 58], [80, 76], [30, 82], [56, 84]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="3" fill="#C99A62" opacity=".6"/>`).join(''),
  co2: () => `<circle cx="50" cy="50" r="13" fill="#3D3A40"/><circle cx="24" cy="50" r="11" fill="#E0323A"/><circle cx="76" cy="50" r="11" fill="#E0323A"/><path d="M35 50 H37 M63 50 H65" stroke="#888" stroke-width="5"/>` +
    `<text x="50" y="86" text-anchor="middle" font-size="16" style="fill:var(--ink)">CO₂</text><ellipse cx="46" cy="45" rx="4" ry="2.5" fill="#fff" opacity=".4"/>`,
  glucose: () => `<path d="M50 14 L80 31 V65 L50 82 L20 65 V31Z" fill="#FFF2C2" stroke="#E0A400" stroke-width="3"/><text x="50" y="56" text-anchor="middle" font-size="15" fill="#8A5A00">suiker</text>`,
  mineralen: () => `<rect x="6" y="54" width="88" height="36" rx="10" fill="url(#g-bodem)"/>` + [[20, 66, '#7FD0F0'], [36, 76, '#F4B740'], [52, 64, '#9BEA9E'], [68, 78, '#F7A6C8'], [82, 66, '#C9A0DC']].map(([x, y, k]) => `<path d="M${x} ${y - 6} L${x + 5} ${y} L${x} ${y + 6} L${x - 5} ${y}Z" fill="${k}" stroke="#fff" stroke-width="1"/>`).join('') +
    `<path d="M50 54 C50 40 50 30 50 20 M50 34 C42 28 36 28 32 30 C38 36 44 36 50 34Z M50 26 C58 20 64 20 68 22 C62 28 56 28 50 26Z" stroke="#3E8F2A" stroke-width="3" fill="#7FC85A"/>`,
  /* ---------- cellen en moleculen (thema erfelijkheid) ---------- */
  cel: ({ kern = true } = {}) => `<path d="M50 8 C76 6 94 28 92 52 C90 78 70 94 46 92 C22 90 6 72 8 48 C10 24 26 10 50 8Z" fill="url(#g-cel)" stroke="#D98A5A" stroke-width="2.5" filter="url(#f-schaduw)"/>` +
    [[26, 34], [70, 30], [74, 70], [30, 70], [56, 80]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="3" fill="#F2A77A" opacity=".55" transform="rotate(${x} ${x} ${y})"/>`).join('') +
    (kern ? `<circle cx="50" cy="50" r="18" fill="url(#g-kern)" stroke="#7A4A9A" stroke-width="1.6"/><path d="M40 46 C46 40 52 56 60 48 M42 56 C48 50 54 60 58 54" stroke="#4E2A6A" stroke-width="1.3" fill="none" opacity=".7"/>` : '') +
    `<ellipse cx="34" cy="22" rx="14" ry="5" fill="#fff" opacity=".5" transform="rotate(-20 34 22)"/>`,
  zaadcel: () => `<path d="M60 50 C72 44 80 58 88 50 C94 44 96 52 98 48" stroke="#9A86A8" stroke-width="2.5" fill="none" stroke-linecap="round"/>` +
    `<ellipse cx="40" cy="50" rx="22" ry="15" fill="url(#g-cel)" stroke="#D98A5A" stroke-width="2" filter="url(#f-schaduw)"/><ellipse cx="38" cy="50" rx="13" ry="9" fill="url(#g-kern)"/><path d="M58 46 L66 48 L66 52 L58 54Z" fill="#E8B48A"/>`,
  eicel: () => `<circle cx="50" cy="50" r="42" fill="none" stroke="#F7C9A2" stroke-width="6" stroke-dasharray="3 5"/><circle cx="50" cy="50" r="34" fill="url(#g-cel)" stroke="#D98A5A" stroke-width="2.5" filter="url(#f-schaduw)"/><circle cx="54" cy="48" r="12" fill="url(#g-kern)"/><ellipse cx="38" cy="32" rx="10" ry="4" fill="#fff" opacity=".55"/>`,
  stuifmeel: () => `<circle cx="50" cy="50" r="28" fill="url(#g-stuif)" stroke="#C98A10" stroke-width="2" filter="url(#f-schaduw)"/>` + Array.from({ length: 16 }, (_, i) => { const a = i * Math.PI / 8; return `<path d="M${50 + 27 * Math.cos(a)} ${50 + 27 * Math.sin(a)} L${50 + 38 * Math.cos(a)} ${50 + 38 * Math.sin(a)}" stroke="#E3A81E" stroke-width="3.5" stroke-linecap="round"/>`; }).join('') + `<circle cx="50" cy="50" r="10" fill="url(#g-kern)" opacity=".8"/><ellipse cx="40" cy="38" rx="8" ry="4" fill="#fff" opacity=".5"/>`,
  chromosoom: ({ kleur = '#8E5BB0', band = '#4E2A6A' } = {}) => `<g filter="url(#f-schaduw)"><path d="M36 10 C30 10 30 18 32 30 C34 40 44 46 44 50 C44 54 34 60 32 70 C30 82 30 90 36 90 C42 90 46 76 50 58 C54 76 58 90 64 90 C70 90 70 82 68 70 C66 60 56 54 56 50 C56 46 66 40 68 30 C70 18 70 10 64 10 C58 10 54 24 50 42 C46 24 42 10 36 10Z" fill="${kleur}"/>` +
    `<path d="M33 22 H44 M33 30 H45 M35 72 H45 M33 80 H44 M56 22 H67 M55 30 H67 M55 72 H65 M56 80 H67" stroke="${band}" stroke-width="3" opacity=".6"/><ellipse cx="38" cy="22" rx="3" ry="8" fill="#fff" opacity=".35"/></g>`,
  dna: () => { let s = ''; for (let i = 0; i < 9; i++) { const y = 10 + i * 10, x1 = 50 + 26 * Math.sin(i * .7), x2 = 50 - 26 * Math.sin(i * .7); s += `<path d="M${x1} ${y} H${x2}" stroke="${['#E0602A', '#2F7FB8', '#1F9E72', '#C9A010'][i % 4]}" stroke-width="4"/>`; }
    let a = 'M', b = 'M'; for (let i = 0; i <= 80; i++) { const y = 10 + i, t = i / 10 * .7; a += `${50 + 26 * Math.sin(t)} ${y} `; b += `${50 - 26 * Math.sin(t)} ${y} `; if (i === 0) { a += 'L'; b += 'L'; } }
    return s + `<path d="${a}" stroke="#5E2750" stroke-width="4" fill="none"/><path d="${b}" stroke="#8E5BB0" stroke-width="4" fill="none"/>`; },
  remgen: () => `<rect x="8" y="38" width="84" height="24" rx="12" fill="url(#g-kern)"/><rect x="40" y="38" width="20" height="24" fill="#F4B740"/><path d="M44 30 H56 M50 30 V38" stroke="#5E2750" stroke-width="3"/>` +
    `<circle cx="50" cy="80" r="12" fill="#E0323A"/><rect x="42" y="77" width="16" height="6" rx="2" fill="#fff"/>`,
  huidcel: () => ORG.cel(),
};

/* ---------- monsters (bazen): één tekenfunctie met kenmerken ---------- */
let monsterNr = 0;
function monster({ lijf = 'blob', kleur = '#8E5BB0', kleur2 = '#4E2A6A', ogen = 2, hoorns = false, vleugels = false, extra = '' } = {}) {
  const id = 'gm' + (++monsterNr);
  const grad = `<defs><radialGradient id="${id}" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="${kleur}"/><stop offset="1" stop-color="${kleur2}"/></radialGradient></defs>`;
  const f = `url(#${id})`;
  let body = '';
  if (lijf === 'draak') body = `<path d="M14 92 C6 80 12 70 22 74 C18 62 24 54 30 62 C34 52 42 52 44 60" fill="${f}"/>` +
    `<path d="M30 104 C20 80 30 46 60 42 C90 40 102 70 94 96 C88 112 40 114 30 104Z" fill="${f}"/>` +
    `<path d="M42 48 L46 36 L52 46 L58 33 L64 45 L72 34 L76 48" fill="${kleur2}"/>` +
    `<path d="M64 46 C64 26 84 16 100 24 C112 30 114 44 106 52 C96 60 72 60 64 46Z" fill="${f}"/>` +
    `<path d="M104 40 C110 44 114 46 118 44" stroke="${kleur2}" stroke-width="2" fill="none"/>` +
    `<path d="M112 36 C116 30 116 24 112 20 M114 46 C120 44 122 38 120 34" stroke="#C9C4C8" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>` +
    `<path d="M44 74 C56 66 74 68 84 76 C74 86 54 86 44 74Z" fill="#FFE2B8" opacity=".7"/>`;
  else if (lijf === 'spook') body = `<path d="M24 110 C24 60 36 22 60 22 C84 22 96 60 96 110 L86 102 L76 112 L66 102 L56 112 L46 102 L36 112Z" fill="${f}" opacity=".95"/>`;
  else if (lijf === 'cel') body = `<path d="M60 14 C88 12 108 34 106 62 C104 92 82 108 56 106 C28 104 12 84 14 58 C16 30 34 16 60 14Z" fill="${f}" stroke="${kleur2}" stroke-width="3"/>` +
    [[30, 40], [86, 34], [92, 80], [32, 86]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="3.5" fill="#fff" opacity=".3" transform="rotate(${x} ${x} ${y})"/>`).join('');
  else if (lijf === 'plant') body = `<path d="M40 112 C34 104 30 108 26 116 M60 112 C60 104 60 104 60 118 M80 112 C86 104 90 108 94 116" stroke="#6E4520" stroke-width="4" fill="none" stroke-linecap="round"/>` +
    `<path d="M60 40 C40 20 18 26 14 40 C30 38 44 44 60 48Z M60 40 C80 20 102 26 106 40 C90 38 76 44 60 48Z" fill="#5E9E22"/>` +
    `<path d="M28 112 C20 80 30 46 60 44 C90 46 100 80 92 112Z" fill="${f}"/>` +
    `<path d="M40 92 C50 100 70 100 80 92 L76 104 C66 108 54 108 44 104Z" fill="#5E3B1E"/><circle cx="52" cy="102" r="2" fill="#A0703F"/><circle cx="66" cy="104" r="2.4" fill="#A0703F"/>`;
  else if (lijf === 'kever') body = [-1, 1].map(s => [56, 74, 92].map(y => `<path d="M${60 + s * 22} ${y} L${60 + s * 44} ${y - 10} L${60 + s * 52} ${y + 4}" stroke="${kleur2}" stroke-width="4" fill="none" stroke-linecap="round"/>`).join('')).join('') +
    `<ellipse cx="60" cy="78" rx="32" ry="34" fill="${f}"/><path d="M60 46 V112" stroke="${kleur2}" stroke-width="3"/><circle cx="60" cy="40" r="20" fill="${f}"/>` +
    `<path d="M50 24 C44 12 36 8 30 10 M70 24 C76 12 84 8 90 10" stroke="${kleur2}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  else body = `<path d="M18 104 C10 70 26 30 60 28 C94 30 110 70 102 104 C96 116 24 116 18 104Z" fill="${f}"/>`;
  const oy = { draak: 34, spook: 52, cel: 50, plant: 66, kever: 38, blob: 58 }[lijf] || 58;
  const ox = lijf === 'draak' ? 90 : 60;
  const xs = ogen === 1 ? [ox] : ogen === 3 ? [ox - 16, ox, ox + 16] : [ox - 11, ox + 11];
  const ogenSvg = xs.map((x, i) => `<circle cx="${x}" cy="${oy - (ogen === 3 && i === 1 ? 6 : 0)}" r="${ogen === 1 ? 11 : 7.5}" fill="#fff" stroke="${kleur2}" stroke-width="1.5"/><circle cx="${x + 2}" cy="${oy + 1 - (ogen === 3 && i === 1 ? 6 : 0)}" r="${ogen === 1 ? 5.5 : 3.6}" fill="#2B1726"/><circle cx="${x + 3.2}" cy="${oy - 1 - (ogen === 3 && i === 1 ? 6 : 0)}" r="1.4" fill="#fff"/>`).join('');
  const wenk = `<path d="M${ox - 16} ${oy - 12} L${ox - 5} ${oy - 8} M${ox + 16} ${oy - 12} L${ox + 5} ${oy - 8}" stroke="${kleur2}" stroke-width="3" stroke-linecap="round"/>`;
  const mond = lijf === 'draak' ? '' : lijf === 'plant' ? '' : `<path d="M${ox - 14} ${oy + 20} C${ox - 6} ${oy + 28} ${ox + 6} ${oy + 28} ${ox + 14} ${oy + 20}" stroke="${kleur2}" stroke-width="3" fill="#fff"/><path d="M${ox - 8} ${oy + 22} l3 5 l3 -5 M${ox + 2} ${oy + 22} l3 5 l3 -5" fill="#fff" stroke="${kleur2}" stroke-width="1"/>`;
  const horn = hoorns ? `<path d="M${ox - 18} ${oy - 18} C${ox - 26} ${oy - 34} ${ox - 22} ${oy - 40} ${ox - 14} ${oy - 42} C${ox - 16} ${oy - 32} ${ox - 12} ${oy - 24} ${ox - 8} ${oy - 20}Z M${ox + 18} ${oy - 18} C${ox + 26} ${oy - 34} ${ox + 22} ${oy - 40} ${ox + 14} ${oy - 42} C${ox + 16} ${oy - 32} ${ox + 12} ${oy - 24} ${ox + 8} ${oy - 20}Z" fill="#F3E2C8" stroke="${kleur2}" stroke-width="1.5"/>` : '';
  const vl = vleugels ? `<path d="M40 60 C20 30 4 34 2 46 C10 46 14 52 12 60 C20 58 24 64 22 72 C30 68 36 70 40 76Z" fill="${kleur2}" opacity=".85"/>` : '';
  const glans = `<ellipse cx="${lijf === 'draak' ? 52 : 44}" cy="${lijf === 'draak' ? 58 : 44}" rx="12" ry="6" fill="#fff" opacity=".28" transform="rotate(-25 44 44)"/>`;
  return `<svg viewBox="0 0 120 120" aria-hidden="true">${grad}<ellipse cx="60" cy="114" rx="40" ry="5" fill="#000" opacity=".14"/>${vl}${body}${horn}${glans}${ogenSvg}${wenk}${mond}${extra}</svg>`;
}

/* ---------- scènes (320 x 200) ---------- */
const plaats = (svg, x, y, s = 1, extra = '') => `<g transform="translate(${x} ${y}) scale(${s})" ${extra}>${svg}</g>`;
const landschap = (inhoud, { zon = true } = {}) => `<rect width="320" height="200" rx="16" fill="url(#g-lucht)"/>` +
  (zon ? plaats(ORG.zon(), 262, 8, .5) : '') +
  `<path d="M0 140 C60 128 120 146 180 136 C230 128 280 134 320 130 V200 H0Z" fill="url(#g-grond)"/>` + inhoud;
const SCENE = {
  individu: () => landschap(plaats(ORG.gras(), 40, 120, .6) + plaats(ORG.konijn(), 110, 84, 1.1)),
  populatie: () => landschap([[30, 120, .55], [90, 110, .6], [150, 124, .5], [200, 104, .65], [250, 126, .5], [120, 140, .55], [60, 146, .5]].map(([x, y, s]) => plaats(ORG.konijn(), x, y, s)).join('')),
  levensgemeenschap: () => landschap(plaats(ORG.boom(), 228, 50, 1) + plaats(ORG.gras(), 10, 120, .6) + plaats(ORG.gras(), 170, 132, .5) +
    [[40, 128, .5], [110, 134, .45], [150, 112, .5]].map(([x, y, s]) => plaats(ORG.konijn(), x, y, s)).join('') +
    plaats(ORG.vos(), 70, 92, .6) + plaats(ORG.roodborst(), 246, 46, .35) + plaats(ORG.paddenstoel(), 200, 150, .4)),
  ecosysteem: () => landschap(plaats(ORG.boom(), 228, 50, 1) + plaats(ORG.gras(), 10, 120, .6) +
    [[40, 128, .5], [150, 112, .5]].map(([x, y, s]) => plaats(ORG.konijn(), x, y, s)).join('') + plaats(ORG.vos(), 70, 92, .6) +
    plaats(ORG.wolk(), 120, 6, .7) + `<path d="M0 176 C80 170 160 182 320 172 V200 H0Z" fill="url(#g-bodem)" opacity=".8"/>` + plaats(ORG.thermometer(), 14, 20, .5) + plaats(ORG.wind(), 60, 26, .45)),
  biosfeer: () => `<rect width="320" height="200" rx="16" fill="#1B1530"/>` + Array.from({ length: 30 }, (_, i) => `<circle cx="${(i * 97) % 320}" cy="${(i * 53) % 200}" r="${i % 3 ? .8 : 1.4}" fill="#fff" opacity=".7"/>`).join('') +
    `<circle cx="160" cy="100" r="82" fill="#7FD0F0" opacity=".25"/><circle cx="160" cy="100" r="74" fill="url(#g-aarde)"/>` +
    `<path d="M110 60 C126 46 150 52 156 66 C162 80 140 86 130 100 C122 110 104 104 102 88 C100 76 104 66 110 60Z M176 48 C196 44 220 60 216 80 C212 96 196 92 188 104 C180 116 196 132 184 140 C170 148 158 130 164 114 C170 98 160 86 166 70 C168 58 170 52 176 48Z M126 132 C138 126 152 134 148 146 C144 156 128 154 124 146 C122 140 122 136 126 132Z" fill="#6FBF4A"/>` +
    `<ellipse cx="130" cy="64" rx="26" ry="10" fill="#fff" opacity=".25"/><text x="160" y="194" text-anchor="middle" font-size="12" fill="#CDEBFA">dun laagje rond de aarde waar leven is</text>`,
  /* jojo naar binnen */
  organisme: () => `<rect width="320" height="200" rx="16" fill="url(#g-lucht)"/><path d="M0 160 H320 V200 H0Z" fill="url(#g-grond)"/>` + plaats(ORG.mens(), 104, 20, 1.75) +
    `<circle cx="196" cy="98" r="16" fill="none" stroke="#EA580C" stroke-width="3" stroke-dasharray="5 4"/>`,
  orgaan: () => `<rect width="320" height="200" rx="16" fill="#FBE6DA"/><path d="M0 0 H320 V54 C260 62 200 48 140 58 C80 66 40 52 0 58Z" fill="#E9B08A"/>` +
    Array.from({ length: 18 }, (_, i) => { const x = 10 + (i % 9) * 35, y = 70 + Math.floor(i / 9) * 56; return `<path d="M${x} ${y} h30 v46 h-30Z" fill="url(#g-huid)" stroke="#C97A52" stroke-width="1.5" rx="6"/><circle cx="${x + 15}" cy="${y + 22}" r="7" fill="url(#g-kern)"/>`; }).join('') +
    `<text x="160" y="36" text-anchor="middle" font-size="15" fill="#7A3A1E">huid: een orgaan van cellen</text>`,
  cel: () => `<rect width="320" height="200" rx="16" fill="#FFF6EE"/>` + plaats(ORG.cel(), 70, 10, 1.8),
  celkern: () => `<rect width="320" height="200" rx="16" fill="#F6ECFA"/><circle cx="160" cy="100" r="88" fill="url(#g-kern)" stroke="#7A4A9A" stroke-width="3"/>` +
    ['#E0602A', '#2F7FB8', '#1F9E72', '#C9A010', '#D96A9A', '#5E2750'].map((k, i) => `<path d="M${100 + i * 12} ${50 + (i % 3) * 20} C${160 + i * 8} ${20 + i * 10} ${230 - i * 6} ${80 + i * 8} ${160 + i * 4} ${110 + i * 6} C${110 + i * 6} ${140 - i * 3} ${150 + i * 10} ${170 - i * 4} ${210 - i * 8} ${150 - i * 6}" stroke="${k}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".9"/>`).join('') +
    `<text x="160" y="194" text-anchor="middle" font-size="12" fill="#4E2A6A">lange dunne draden: de chromosomen</text>`,
  chromosoom: () => `<rect width="320" height="200" rx="16" fill="#F6ECFA"/>` + plaats(ORG.chromosoom(), 110, 4, 1.8) +
    `<rect x="150" y="50" width="20" height="16" rx="3" fill="none" stroke="#EA580C" stroke-width="3"/><path d="M170 58 H230" stroke="#EA580C" stroke-width="2" stroke-dasharray="4 3"/><text x="234" y="62" font-size="13" fill="#EA580C">een gen</text>` +
    `<text x="60" y="100" text-anchor="middle" font-size="12" fill="#4E2A6A">opgerolde</text><text x="60" y="115" text-anchor="middle" font-size="12" fill="#4E2A6A">draad DNA</text>`,
  gen: () => { let s = `<rect width="320" height="200" rx="16" fill="#FFF3E6"/><rect x="20" y="64" width="280" height="72" rx="36" fill="url(#g-kern)" opacity=".35"/>`;
    for (let i = 0; i < 12; i++) { const x = 34 + i * 22; s += `<rect x="${x}" y="78" width="16" height="44" rx="5" fill="${['#E0602A', '#2F7FB8', '#1F9E72', '#C9A010'][i % 4]}" opacity="${i > 2 && i < 9 ? 1 : .35}"/>`; }
    return s + `<path d="M96 64 V50 H288 V64" stroke="#EA580C" stroke-width="3" fill="none"/><text x="192" y="42" text-anchor="middle" font-size="14" fill="#EA580C">gen: info voor één eigenschap</text><text x="160" y="162" text-anchor="middle" font-size="13" style="fill:var(--ink-soft)">een stukje van het chromosoom</text>`; },
  basen: () => { let s = `<rect width="320" height="200" rx="16" fill="#FFF8EC"/>`; const P = { A: 'T', T: 'A', C: 'G', G: 'C' }, K = { A: '#E0602A', T: '#2F7FB8', C: '#1F9E72', G: '#C9A010' };
    'ATGCCAGT'.split('').forEach((b, i) => { const x = 28 + i * 36; s += `<rect x="${x}" y="40" width="28" height="50" rx="7" fill="${K[b]}"/><text x="${x + 14}" y="72" text-anchor="middle" font-size="18" fill="#fff">${b}</text><rect x="${x}" y="110" width="28" height="50" rx="7" fill="${K[P[b]]}"/><text x="${x + 14}" y="142" text-anchor="middle" font-size="18" fill="#fff">${P[b]}</text><path d="M${x + 14} 90 V110" stroke="#9A8A94" stroke-width="3" stroke-dasharray="3 2"/>`; });
    return s + `<path d="M20 36 H304 M20 164 H304" stroke="#5E2750" stroke-width="5" stroke-linecap="round"/><text x="160" y="188" text-anchor="middle" font-size="13" style="fill:var(--ink-soft)">A past bij T, C past bij G</text>`; },
};

/* scène-kaart voor gedrag en symbiose (100 x 100 per vakje) */
const duo = (a, b) => plaats(a, 0, 6, .58) + plaats(b, 44, 34, .58);
