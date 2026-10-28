(function () {
  const { B, C, still, setDot } = window.Affix;
  const $ = s => document.querySelector(s);
  const gs = window.gsap && !still ? window.gsap : null;

  // Hero wordmark: the letters draw in as one stroke, then the dot drops onto the i.
  $('#wmbig').innerHTML = B.wordmark({ title: '' });
  const svg = $('#wmbig svg'); svg.setAttribute('overflow', 'visible');
  if (gs) {
    const path = svg.querySelector('path'), dot = svg.querySelector('.wm-dot');
    const len = 4200; path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
    gs.timeline()
      .to(path, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' })
      .from(dot, { y: -520, duration: 0.55, ease: 'power2.in' }, '-=0.25')
      .to(dot, { scaleX: 1.25, scaleY: 0.8, transformOrigin: '50% 100%', duration: 0.1, ease: 'power1.out' })
      .to(dot, { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1, 0.45)' });
  }

  // Format art
  $('#art-stick').innerHTML = `<svg viewBox="0 0 400 300" aria-hidden="true"><ellipse cx="200" cy="160" rx="170" ry="128" fill="#E58C86"/><ellipse cx="200" cy="150" rx="150" ry="110" fill="${C.tongue}"/><rect x="2" y="0" width="12" height="300" fill="none"/>
    <g class="strip-g"><rect x="70" y="124" width="260" height="64" rx="32" fill="${B.D.citrus.color}" transform="rotate(-10 200 156)"/><rect x="92" y="134" width="70" height="14" rx="7" fill="#fff" opacity=".4" transform="rotate(-10 200 156)"/></g></svg>`;
  $('#art-stamp').innerHTML = `<svg viewBox="0 0 400 300" aria-hidden="true"><rect x="110" y="-40" width="180" height="380" rx="90" fill="#C68A63"/>
    <circle class="mk-halo" cx="200" cy="210" r="44" fill="${B.D.spark.color}" opacity=".3"/><circle class="mk" cx="200" cy="210" r="30" fill="${B.D.spark.color}"/>
    <g class="app-g">${B.put(B.applicator('spark'), 236, 10, 80, 185, 18)}</g></svg>`;
  if (gs) {
    gs.from('.strip-g', { x: -260, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.6 });
    gs.timeline({ repeat: -1, repeatDelay: 1.2, delay: 0.8 })
      .fromTo('.app-g', { y: -40 }, { y: 0, duration: 0.45, ease: 'power2.in' })
      .fromTo(['.mk', '.mk-halo'], { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.6, ease: 'elastic.out(1,0.5)' })
      .to('.app-g', { y: -40, duration: 0.5, ease: 'power2.out' }, '-=0.3')
      .to(['.mk', '.mk-halo'], { opacity: 0.15, duration: 1.6, ease: 'sine.inOut' }, '+=0.6')
      .set(['.mk'], { opacity: 1 }).set('.mk-halo', { opacity: 0.3 });
  }

  // Steps
  const box = `<svg viewBox="0 0 160 120"><rect x="10" y="20" width="140" height="90" rx="16" fill="${C.mint}"/>${B.put(B.wordmark(), 36, 52, 88, 40)}</svg>`;
  const tongue = `<svg viewBox="0 0 160 120"><ellipse cx="80" cy="64" rx="70" ry="50" fill="${C.tongue}"/><rect x="28" y="50" width="104" height="28" rx="14" fill="${B.D.citrus.color}" transform="rotate(-10 80 64)"/></svg>`;
  const stamp = `<svg viewBox="0 0 160 120"><rect x="44" y="0" width="72" height="140" rx="36" fill="#C68A63"/><circle cx="80" cy="76" r="16" fill="${B.D.spark.color}"/>${B.put(B.applicator('spark'), 92, 0, 36, 84, 16)}</svg>`;
  const phone = `<svg viewBox="0 0 160 120"><rect x="51.25" y="0" width="57.5" height="120" rx="10.2" fill="${C.paper}"/><rect x="71.7" y="3.6" width="16.6" height="4.9" rx="2.45" fill="${C.ink}"/>${B.put(B.bodyMap({ site: 2, numbers: false }), 54, 18, 52, 80)}</svg>`;
  const steps = [[box, 'Refills arrive', 'A small box each month: a Stick pack and four Stamp cartridges.'], [tongue, 'Stick a strip', 'Every morning. Press one strip onto your tongue.'], [stamp, 'Stamp a site', 'Once a week, on the arm or thigh the app picks.'], [phone, 'Track it', 'The app logs both and shows what comes next.']];
  $('#steps').innerHTML = steps.map(([ic, h, p], i) => `<li><div class="ic" aria-hidden="true">${ic}</div><span class="n">Step ${i + 1}</span><h3>${h}</h3><p>${p}</p></li>`).join('');

  // Rotation
  const WK = [['Left arm', 'Week 1'], ['Right arm', 'Week 2'], ['Left thigh', 'Week 3'], ['Right thigh', 'Week 4']];
  let site = 2, auto = null;
  $('#weeks').innerHTML = WK.map(([n, w], i) => `<li><button type="button" data-site="${i + 1}" aria-pressed="${i + 1 === site}"><span class="no">${i + 1}</span><span class="site">${n}</span><span class="when">${w}</span></button></li>`).join('');
  function drawMap(s, animate) {
    $('#map').innerHTML = B.bodyMap({ site: s });
    document.querySelectorAll('#weeks button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.site === s)));
    if (animate && gs) gs.from('#map .site.on', { scale: 0.2, transformOrigin: '50% 50%', duration: 0.7, ease: 'elastic.out(1,0.45)' });
  }
  drawMap(site, false);
  document.querySelectorAll('#weeks button').forEach(b => b.addEventListener('click', () => { clearInterval(auto); site = +b.dataset.site; drawMap(site, true); }));
  if (gs) auto = setInterval(() => { site = site % 4 + 1; drawMap(site, true); }, 2600);

  // Doses
  $('#doses').innerHTML = B.DOSES.map(d => `<a class="dose" href="range.html#${d.key}" data-color="${d.color}">
      <div class="shape" aria-hidden="true">${d.format === 'stick' ? `<span class="s" style="background:${d.color}"></span>` : `<span class="d" style="background:${d.color}"></span>`}</div>
      <div class="code">${d.code}</div>
      <div class="meta"><span class="nm">${d.name}</span><span class="label">${d.format === 'stick' ? 'Stick' : 'Stamp'} · ${d.when}</span></div></a>`).join('');
  document.querySelectorAll('.dose').forEach(el => {
    el.addEventListener('mouseenter', () => setDot(el.dataset.color)); el.addEventListener('focus', () => setDot(el.dataset.color));
    el.addEventListener('mouseleave', () => setDot()); el.addEventListener('blur', () => setDot());
  });
})();
