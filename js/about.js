(function () {
  const { B, C } = window.Affix;
  const $ = s => document.querySelector(s);
  const m = B.morse('STICK IT', 22);
  const morse = `<svg viewBox="0 0 ${m.width} 22" width="220">${m.items.map(it => it.type === 'dot' ? `<circle cx="${it.x + 11}" cy="11" r="11" fill="${C.coral}"/>` : `<rect x="${it.x}" width="${it.w}" height="22" rx="11" fill="${C.ink}"/>`).join('')}</svg>`;
  const marks = [
    [`<svg viewBox="0 0 200 80" width="200"><rect x="10" y="20" width="180" height="40" rx="20" fill="${C.ink}"/></svg>`, 'The strip', 'Stands for Stick. Every letter of the wordmark is drawn with it.'],
    [`<svg viewBox="0 0 120 120" width="120"><circle cx="60" cy="60" r="50" fill="${C.coral}"/></svg>`, 'The dot', 'Stands for Stamp. It takes the color of the dose inside.'],
    [B.mark(), 'The i', 'A strip under a dot. It becomes the app icon on a mint tile.'],
    [morse, 'The pattern', 'Strips and dots spell lines of copy in Morse. This one reads STICK IT.']
  ];
  $('#marks').innerHTML = marks.map(([ic, h, p]) => `<div class="mk"><div class="ic" aria-hidden="true">${ic}</div><h3>${h}</h3><p>${p}</p></div>`).join('');
  $('#album').innerHTML = (window.AFFIX_BOARDS || []).map(b => `<figure class="${b.length > 1 ? 'pair' : ''}">${b.map(([n, w, h, alt]) => `<img src="img/${n}.jpg" width="${w}" height="${h}" alt="${alt}" loading="lazy" decoding="async">`).join('')}</figure>`).join('');
})();
