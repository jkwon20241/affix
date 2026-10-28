/* Shared page shell: top bar, footer, living dot, "my month" count. */
(function () {
  const B = window.AffixBrand, C = B.C;
  const still = /[?&]still/.test(location.search) || matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still) document.documentElement.classList.add('still'), document.body.classList.add('still');
  const page = document.body.dataset.page;
  const NAV = [['index.html', 'Home', 'home'], ['range.html', 'Range', 'range'], ['app.html', 'Application', 'app'], ['about.html', 'About', 'about']];

  const store = {
    get() { try { return JSON.parse(localStorage.getItem('affix-month') || 'null'); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem('affix-month', JSON.stringify(v)); } catch (e) {} }
  };
  function monthCount() { const m = store.get(); return m ? (m.stick ? 1 : 0) + (m.stamp ? 1 : 0) : 0; }

  const top = document.getElementById('topbar');
  if (top) {
    top.innerHTML = `<div class="bar">
      <a class="brand" href="index.html" aria-label="Affix home"><span class="sy">${B.symbol({ title: '' })}</span><span class="wm">${B.wordmark({ title: '' })}</span></a>
      <nav class="mainnav" aria-label="Main">${NAV.map(([h, l, k]) => `<a href="${h}"${k === page ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</nav>
      <a class="monthbtn" href="range.html#build"><span class="lbl">My month</span><span class="count" aria-label="items">${monthCount()}</span></a>
    </div>`;
  }
  const foot = document.getElementById('foot');
  if (foot) {
    const m = B.morse('STICK IT STAMP IT GO STICK IT STAMP IT GO ', 40);
    let s = ''; const cols = ['#FF9A3C', '#7CD3C1', '#AA9EFF', C.mint];
    for (let rep = 0; rep < 2; rep++) m.items.forEach((it, i) => { const x = it.x + rep * m.width;
      s += it.type === 'dot' ? `<circle cx="${x + 20}" cy="20" r="20" fill="${C.coral}"/>` : `<rect x="${x}" y="0" width="${it.w}" height="40" rx="20" fill="${cols[i % cols.length]}"/>`; });
    foot.innerHTML = `<div class="foot">
      <div class="morse" aria-hidden="true"><svg viewBox="0 0 ${m.width * 2} 40" width="${m.width * 2}" height="40">${s}</svg></div>
      <div class="foot-row">
        <span class="wm">${B.wordmark({ letters: C.paper, title: 'Affix' })}</span>
        <nav aria-label="Footer">${NAV.map(([h, l]) => `<a href="${h}">${l}</a>`).join('')}</nav>
      </div>${page === 'about' ? `<p class="foot-credit">Designed by Jennie Kwon · <a href="https://www.jennienhynkwon.work/" target="_blank" rel="noopener">jennienhynkwon.work ↗</a></p>` : ''}</div>`;
  }

  // Next page, so every page ends with a clear way on.
  const NEXT = { home: ['range.html', 'Range', 'Six doses, two ways, and a builder for your month.'], range: ['app.html', 'Application', 'Stick, stamp and track it, all from your phone.'], app: ['about.html', 'About', 'The idea, the identity system and the brand out in the world.'], about: ['index.html', 'Back to the start', 'Vitamins you stick and stamp.'] }[page];
  if (foot && NEXT) { const a = document.createElement('a'); a.className = 'band nextpage'; a.href = NEXT[0];
    a.innerHTML = `<span><span class="label">Next</span><b>${NEXT[1]}</b><p>${NEXT[2]}</p></span><span class="arrow" aria-hidden="true">→</span>`; foot.before(a); }
  // A hairline under the top bar once the page scrolls.
  if (top) { const onScroll = () => top.classList.toggle('scrolled', scrollY > 8); addEventListener('scroll', onScroll, { passive: true }); onScroll(); }

  // Living dot: the logo dot and the nav marker take a dose color.
  function setDot(color) {
    document.documentElement.style.setProperty('--dot', color || C.coral);
    document.querySelectorAll('.wm-dot').forEach(d => d.setAttribute('fill', color || C.coral));
  }
  function bump() { const b = document.querySelector('.monthbtn'); if (!b) return; b.querySelector('.count').textContent = monthCount(); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }

  window.Affix = { B, C, still, store, setDot, bump, monthCount };
})();
