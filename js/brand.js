/* Affix brand drawing kit (concept v2: Stick + Stamp).
   Every function returns an SVG string. Shared by the website and the mockup artwork. */
(function () {
  const C = {
    paper: '#F6F4EF', paperDeep: '#ECE8DF', white: '#FFFFFF', line: '#E4E1DA',
    ink: '#111316', ink60: '#5C5E66', raised: '#1E2026',
    mint: '#B9F0D7', mintDeep: '#1F6E52', coral: '#FF5A4E', tongue: '#F2A7A0'
  };
  // Stick doses are strips, Stamp doses are dots.
  const DOSES = [
    { key: 'citrus', code: 'C', name: 'Citrus', full: 'Citrus C', color: '#FF9A3C', fg: C.ink, format: 'stick', when: 'Daily' },
    { key: 'zinc', code: 'Zn', name: 'Zinc', full: 'Zinc Zn', color: '#7CD3C1', fg: C.ink, format: 'stick', when: 'Daily' },
    { key: 'calm', code: 'Mg', name: 'Calm', full: 'Calm Mg', color: '#AA9EFF', fg: C.ink, format: 'stick', when: 'Evenings' },
    { key: 'spark', code: 'B12', name: 'Spark', full: 'Spark B12', color: '#FF7DB8', fg: C.ink, format: 'stamp', when: 'Weekly' },
    { key: 'sun', code: 'D3', name: 'Sun', full: 'Sun D3', color: '#FFC83A', fg: C.ink, format: 'stamp', when: 'Weekly' },
    { key: 'iron', code: 'Fe', name: 'Iron', full: 'Iron Fe', color: '#9B3A2C', fg: C.paper, format: 'stamp', when: 'Monthly' }
  ];
  const D = Object.fromEntries(DOSES.map(d => [d.key, d]));

  // Wordmark: one rounded stroke (S = 128 units). Tight box 1760 × 790.
  const WM_W = 1760, WM_H = 790;
  const WM_PATH = 'M64,650a186,186 0 1,0 372,0a186,186 0 1,0 -372,0M436,464L436,836M628,836L628,286A112,112 0 0,1 740,174M916,836L916,286A112,112 0 0,1 1028,174M528,464L1020,464M1212,836L1212,464M1404,836L1696,464M1404,464L1696,836';
  function wordmark({ letters = C.ink, dot = C.coral, title = 'Affix' } = {}) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 110 ${WM_W} ${WM_H}" role="img" aria-label="${title}"><path d="${WM_PATH}" fill="none" stroke="${letters}" stroke-width="128" stroke-linecap="round" stroke-linejoin="round"/><circle class="wm-dot" cx="1212" cy="243.3" r="94.7" fill="${dot}"/></svg>`;
  }
  // Symbol: strip under a dot on a mint tile.
  function symbol({ tile = C.mint, strip = C.ink, dot = C.coral, title = 'Affix' } = {}) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" role="img" aria-label="${title}"><rect width="600" height="600" rx="150" fill="${tile}"/><path d="M300,292L300,482" stroke="${strip}" stroke-width="118" stroke-linecap="round"/><circle class="sy-dot" cx="300" cy="148" r="70" fill="${dot}"/></svg>`;
  }
  // Mark: the bare i (140 × 463).
  function mark({ strip = C.ink, dot = C.coral } = {}) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 463" aria-hidden="true"><rect x="11" y="155" width="118" height="308" rx="59" fill="${strip}"/><circle cx="70" cy="70" r="70" fill="${dot}"/></svg>`;
  }
  // Body map: tongue + four Stamp sites. site = 1..4 (0 = none).
  const SITES = [[51, 192], [309, 192], [140, 368], [220, 368]];
  const SITE_NAMES = ['Left arm', 'Right arm', 'Left thigh', 'Right thigh'];
  function bodyMap({ site = 2, body = C.line, active = C.coral, ring = C.ink, fill = C.white, numbers = true, tongue = C.coral } = {}) {
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 520" role="img" aria-label="Body map, ${site ? 'site ' + site + ': ' + SITE_NAMES[site - 1] : 'four sites'}">`;
    s += `<circle cx="180" cy="55" r="55" fill="${body}"/><rect x="150" y="62" width="60" height="16" rx="8" fill="${tongue}"/>`;
    s += `<rect x="95" y="124" width="170" height="190" rx="44" fill="${body}"/><rect x="20" y="136" width="62" height="200" rx="31" fill="${body}"/><rect x="278" y="136" width="62" height="200" rx="31" fill="${body}"/>`;
    s += `<rect x="102" y="300" width="74" height="215" rx="37" fill="${body}"/><rect x="184" y="300" width="74" height="215" rx="37" fill="${body}"/>`;
    SITES.forEach(([x, y], i) => {
      const on = i + 1 === site;
      s += on ? `<circle class="site site-${i + 1} on" cx="${x}" cy="${y}" r="22" fill="${active}"/>` : `<circle class="site site-${i + 1}" cx="${x}" cy="${y}" r="20.5" fill="${fill}" stroke="${ring}" stroke-width="3"/>`;
      if (numbers) s += `<text x="${x}" y="${y + 6.5}" text-anchor="middle" font-family="Host Grotesk, sans-serif" font-weight="700" font-size="18" fill="${on ? C.ink : ring}">${i + 1}</text>`;
    });
    return s + '</svg>';
  }
  // Stamp applicator (160 × 370): mint body, cartridge window, ink collar, pad.
  function applicator(doseKey = 'spark', { body = C.mint, collar = C.ink } = {}) {
    const c = D[doseKey].color;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 370" aria-hidden="true"><rect x="20" y="0" width="120" height="300" rx="60" fill="${body}"/><rect x="58" y="40" width="44" height="122" rx="22" fill="${c}"/><rect x="64" y="50" width="9" height="60" rx="4.5" fill="#fff" opacity=".45"/><rect x="69" y="196" width="22" height="58" rx="11" fill="${C.ink}"/><circle cx="80" cy="180" r="12" fill="${C.coral}"/><rect x="6" y="284" width="148" height="38" rx="19" fill="${collar}"/><rect x="22" y="328" width="116" height="30" rx="15" fill="${c}"/></svg>`;
  }
  // Stick pack (440 × 640): slim case with today's strip pushed out of the top.
  function pack(doseKey = 'citrus', { body = C.mint } = {}) {
    const d = D[doseKey];
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 640" aria-hidden="true"><rect x="70" y="0" width="300" height="96" rx="48" fill="${d.color}"/><rect x="0" y="52" width="440" height="588" rx="52" fill="${body}"/><rect x="40" y="92" width="360" height="10" rx="5" fill="${C.mintDeep}"/>` +
      put(wordmark({ dot: d.color }), 40, 170, 230, 230 * WM_H / WM_W) +
      `<text x="40" y="372" font-family="Host Grotesk, sans-serif" font-weight="700" font-size="48" letter-spacing="-1" fill="${C.ink}">Stick</text>` +
      `<text x="40" y="410" font-family="Host Grotesk, sans-serif" font-size="19" fill="${C.ink}">${d.full} · 30 strips</text>` +
      `<circle cx="358" cy="558" r="42" fill="${d.color}"/><text x="358" y="569" text-anchor="middle" font-family="Host Grotesk, sans-serif" font-weight="700" font-size="30" fill="${d.fg}">${d.code}</text></svg>`;
  }
  function inner(svg) { return svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '').replace(/^/, ''); }
  // Place any SVG string inside another at x,y,w,h.
  function put(svg, x, y, w, h, rot = 0) {
    const s = svg.replace(/^<svg /, `<svg x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" `);
    return rot ? `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})">${s}</g>` : s;
  }
  const MORSE = { A: '.-', C: '-.-.', G: '--.', I: '..', K: '-.-', M: '--', O: '---', P: '.--.', S: '...', T: '-' };
  // Morse line: strips are dashes, dots are dots. Returns [{type,x,w}] for a unit u.
  function morse(text, u = 40, gap = 0.45) {
    const out = []; let x = 0; const g = u * gap;
    for (const ch of text.toUpperCase()) {
      if (ch === ' ') { x += u * 2; continue; }
      const m = MORSE[ch]; if (!m) continue;
      for (const s of m) { const w = s === '.' ? u : u * 3; out.push({ type: s === '.' ? 'dot' : 'strip', x, w }); x += w + g; }
      x += u * 1.1;
    }
    return { items: out, width: x };
  }
  window.AffixBrand = { C, DOSES, D, WM_W, WM_H, wordmark, symbol, mark, bodyMap, SITES, SITE_NAMES, applicator, pack, put, inner, morse };
})();
