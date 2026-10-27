/* Affix app prototype: Today, Stamp flow, Sites, Month, Me. It's Saturday, October 10, 2026, 9:41. */
(function () {
  const { B, C, still, store, bump, setDot } = window.Affix;
  const $ = s => document.querySelector(s);
  const gs = window.gsap && !still ? window.gsap : null;
  const TODAY = 10, LEAD = 3, NOW = '9:41';
  const DOW = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dow = d => DOW[(d + LEAD - 1) % 7];
  const isSat = d => (d + LEAD - 1) % 7 === 5;
  const SATS = [3, 10, 17, 24, 31];
  const siteFor = d => (SATS.indexOf(d) % 4) + 1;
  const SITE = B.SITE_NAMES;
  const check = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3 3 7-7" fill="none" stroke="${C.ink}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const saved = store.get() || {};
  const S = { stick: saved.stick || 'citrus', stamp: saved.stamp || 'spark', view: 'today', sub: null, sel: TODAY, rem: { am: true, sat: true }, tasks: {}, log: {} };
  function seed() {
    S.log = {};
    for (let d = 1; d < TODAY; d++) if (d !== 6) S.log[d] = { stick: S.stick, t: ['8:02', '7:48', '8:15', '8:31', '7:55'][d % 5] };
    S.log[3].stamp = { k: S.stamp, site: 1, t: '8:20' };
  }
  seed();
  const st = () => B.D[S.stick], sp = () => B.D[S.stamp];
  const monthly = () => sp().when === 'Monthly';
  const due = d => isSat(d) && (!monthly() || d === SATS[0]);
  const todayLog = () => S.log[TODAY] || {};
  const stampDueToday = () => due(TODAY);
  function nextStamp() { // first due Saturday that isn't logged, from today on
    for (const d of SATS) if (d >= TODAY && due(d) && !(S.log[d] && S.log[d].stamp)) return { d, site: siteFor(d) };
    return null;
  }
  const dateName = d => `${dow(d)}, October ${d}`;
  const disc = d => `<span class="cd" style="background:${d.color};color:${d.fg}">${d.code}</span>`;

  /* ---------- views ---------- */
  function vToday() {
    const L = todayLog(), s = st(), p = sp(), nx = nextStamp();
    const stickRow = `<div class="arow">${disc(s)}<span><b>Stick · ${s.full}</b><small>${L.stick ? 'Taken at ' + L.t : 'One strip on the tongue'}</small></span>${L.stick ? `<span class="donechip" aria-label="Done">${check}</span>` : '<button type="button" class="mini" data-act="take">Take</button>'}</div>`;
    let stampRow;
    if (L.stamp) stampRow = `<div class="arow">${disc(p)}<span><b>Stamp · ${p.full}</b><small>Stamped at ${L.stamp.t} · ${SITE[L.stamp.site - 1].toLowerCase()}</small></span><span class="donechip" aria-label="Done">${check}</span></div>`;
    else if (stampDueToday()) stampRow = `<div class="arow">${disc(p)}<span><b>Stamp · ${p.full}</b><small>Due today · ${SITE[siteFor(TODAY) - 1].toLowerCase()}</small></span><button type="button" class="mini" data-act="gostamp">Stamp now</button></div>`;
    else stampRow = `<div class="arow">${disc(p)}<span><b>Stamp · ${p.full}</b><small>Not due today. Next: November 7</small></span><span></span></div>`;
    let wk = ''; let n = 0; for (let d = 4; d <= 10; d++) { const on = S.log[d] && S.log[d].stick; if (on) n++; wk += `<b style="background:${on ? B.D[S.log[d].stick].color : C.line}" title="Oct ${d}"></b>`; }
    const allDone = L.stick && (L.stamp || !stampDueToday());
    const msg = allDone ? `All done for today. ${nx ? `Next Stamp: ${SITE[nx.site - 1].toLowerCase()}, October ${nx.d}.` : 'Next Stamp: November 7.'}` : (L.stick ? 'One more thing today: your Stamp.' : 'Start with your strip.');
    return `<section class="view" aria-label="Today">
      <span class="k">${dateName(TODAY)}</span><span class="t">Good morning, Sam.</span>
      <div class="card"><h3>Today</h3>${stickRow}${stampRow}</div>
      <p class="note" role="status">${msg}</p>
      <div class="card"><h3>This week</h3><div class="streak" aria-label="${n} of 7 strips this week">${wk}</div><span class="note">${n} of 7 strips since Sunday</span></div>
    </section>`;
  }
  function vStamp() {
    const site = siteFor(TODAY), [x, y] = B.SITES[site - 1], p = sp(), L = todayLog();
    const pos = (r, cls, col) => `<span class="${cls}" style="left:${(x - r) / 3.6}%;top:${(y - r) / 5.2}%;width:${2 * r / 3.6}%;aspect-ratio:1;${col ? 'background:' + col : ''}"></span>`;
    return `<section class="view" aria-label="Stamp">
      <button type="button" class="back" data-act="back">← Today</button>
      <span class="k">Week 2 · site ${site} of 4</span><span class="t">${SITE[site - 1]}</span>
      <div class="stampmap" id="smap">${B.bodyMap({ site, fill: C.mint })}${L.stamp ? pos(20, 'placed', p.color) : pos(26, 'target')}</div>
      <div class="card"><span>${L.stamp ? `Click. Logged at ${L.stamp.t}. The ${p.name.toLowerCase()} mark fades by tomorrow.` : `Click a ${p.full} cartridge in, hold the Stamp on the coral site, then press until it clicks.`}</span>
      ${L.stamp ? '<button type="button" class="btn btn-ink wide" data-act="back">Done</button>' : '<button type="button" class="hold" id="hold" aria-describedby="holdhint"><span class="fill"></span><span>Press and hold to stamp</span></button><span class="note" id="holdhint">Hold with the mouse, a finger, or the space bar.</span>'}</div>
    </section>`;
  }
  function vSites() {
    const nx = nextStamp(), focus = nx ? nx.site : 1;
    const last = s => { let l = 0; for (const d in S.log) if (S.log[d].stamp && S.log[d].stamp.site === s) l = Math.max(l, +d); return l; };
    const nextFor = s => { for (const d of SATS) if (d >= TODAY && due(d) && siteFor(d) === s && !(S.log[d] && S.log[d].stamp)) return d; return 0; };
    const rows = [1, 2, 3, 4].map(s => { const l = last(s), n = nextFor(s);
      return `<li><span class="n${nx && s === nx.site ? ' next' : ''}">${s}</span><span>${SITE[s - 1]}<br><small>${l ? (l === TODAY ? 'Stamped today' : 'Last: October ' + l) : 'Not used yet this month'}</small></span><small>${n ? (n === TODAY ? 'Due today' : 'Oct ' + n) : (monthly() ? 'Nov' : '—')}</small></li>`; }).join('');
    return `<section class="view" aria-label="Sites">
      <span class="k">Stamp sites</span><span class="t">${nx ? (nx.d === TODAY ? 'This week: ' : 'Next: ') + SITE[nx.site - 1].toLowerCase() : 'Next: November 7'}</span>
      <div class="stampmap">${B.bodyMap({ site: nx ? focus : 0, fill: C.mint })}</div>
      <ul class="slist">${rows}</ul>
      <p class="note">Never the same site twice in a row. The coral site is the next one.</p>
    </section>`;
  }
  function vMonth() {
    let g = ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => `<span class="dw">${d}</span>`).join('') + '<span></span>'.repeat(LEAD);
    let logged = 0;
    for (let d = 1; d <= 31; d++) { const L = S.log[d] || {}; if (L.stick && d <= TODAY) logged++;
      const strip = L.stick ? B.D[L.stick].color : (d > TODAY ? '#2A2C33' : '#3A2224');
      const dot = L.stamp ? B.D[L.stamp.k].color : (d > TODAY && due(d) ? '#44464E' : 'transparent');
      g += `<button type="button" class="mday${d > TODAY ? ' future' : ''}${d === TODAY ? ' today' : ''}" data-act="day" data-d="${d}" aria-pressed="${d === S.sel}" aria-label="October ${d}"><b style="background:${strip}"></b><em style="background:${dot}"></em>${d}</button>`; }
    const d = S.sel, L = S.log[d] || {};
    let info = `<b>${dateName(d)}${d === TODAY ? ' · today' : ''}</b>`;
    if (d > TODAY) info += `<span class="ln"><i style="background:${st().color}"></i>Planned: ${st().full} strip</span>` + (due(d) ? `<span class="ln"><i class="dt" style="background:${sp().color}"></i>Planned: ${sp().full} Stamp, ${SITE[siteFor(d) - 1].toLowerCase()}</span>` : '');
    else { info += L.stick ? `<span class="ln"><i style="background:${B.D[L.stick].color}"></i>${B.D[L.stick].full} strip at ${L.t}</span>` : `<span class="ln"><i style="background:#3A2224"></i>${d === TODAY ? 'No strip yet today' : 'No strip logged'}</span>`;
      if (L.stamp) info += `<span class="ln"><i class="dt" style="background:${B.D[L.stamp.k].color}"></i>${B.D[L.stamp.k].full} Stamp at ${L.stamp.t}, ${SITE[L.stamp.site - 1].toLowerCase()}</span>`;
      else if (due(d)) info += `<span class="ln"><i class="dt" style="background:#44464E"></i>Stamp due, ${SITE[siteFor(d) - 1].toLowerCase()}</span>`; }
    return `<section class="view" aria-label="Month">
      <span class="k">October 2026</span><span class="t">${logged} of ${TODAY} days</span>
      <div class="mgrid">${g}</div>
      <div class="dayinfo" role="status">${info}</div>
    </section>`;
  }
  function vMe() {
    const chip = (fmt) => B.DOSES.filter(d => d.format === fmt).map(d => `<button type="button" data-act="dose" data-k="${d.key}" aria-pressed="${S[fmt] === d.key}"><i class="${fmt === 'stamp' ? 'dt' : ''}" style="background:${d.color}"></i>${d.full}</button>`).join('');
    const sw = (k, label) => `<div class="toggle"><span>${label}</span><button type="button" class="switch" role="switch" aria-checked="${S.rem[k]}" data-act="rem" data-k="${k}" aria-label="${label}"></button></div>`;
    const carts = monthly() ? '1 cartridge' : '4 cartridges';
    return `<section class="view" aria-label="Me">
      <span class="k">Me</span><span class="t">Sam Rivera</span>
      <div class="card"><h3>My doses</h3><span class="k">Stick · every morning</span><div class="chips">${chip('stick')}</div><span class="k">Stamp · ${monthly() ? 'monthly' : 'weekly'}</span><div class="chips">${chip('stamp')}</div></div>
      <div class="card"><h3>Reminders</h3>${sw('am', 'Morning strip at 8:00')}${sw('sat', 'Stamp day, Saturdays')}</div>
      <div class="card"><h3>Next box</h3><span>Ships Saturday, October 24: one ${st().full} pack and ${carts} of ${sp().full}.</span></div>
    </section>`;
  }

  /* ---------- render ---------- */
  const screen = $('#screen'), views = $('#views');
  function render() {
    const v = S.sub || S.view;
    views.innerHTML = { today: vToday, stamp: vStamp, sites: vSites, month: vMonth, me: vMe }[v]();
    screen.className = 'screen app-screen v-' + v;
    document.querySelectorAll('.apptabs button').forEach(b => { const on = b.dataset.tab === S.view; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
    if (v === 'stamp' && !todayLog().stamp) wireHold();
    tasks();
  }
  function go(view) { S.view = view; S.sub = null; views.scrollTop = 0; render(); }
  function done(t) { if (!S.tasks[t]) { S.tasks[t] = true; tasks(true); } }
  function tasks(flash) {
    let n = 0; document.querySelectorAll('#tasks li').forEach(li => { const on = !!S.tasks[li.dataset.task]; li.classList.toggle('done', on); if (on) n++; });
    $('#progress').textContent = n === 4 ? 'All four done. That’s the whole routine: a few seconds a day, one press a week.' : n ? `${n} of 4 done.` : '';
  }

  /* ---------- Stick: strip dissolves on the tongue ---------- */
  function takeStick() {
    const s = st(), ov = $('#overlay');
    ov.innerHTML = `<div class="sheet" role="dialog" aria-label="Stick in progress"><svg viewBox="0 0 220 150" aria-hidden="true"><ellipse cx="110" cy="80" rx="96" ry="66" fill="#E58C86"/><ellipse cx="110" cy="74" rx="84" ry="56" fill="${C.tongue}"/><rect id="ostrip" x="40" y="58" width="140" height="34" rx="17" fill="${s.color}" transform="rotate(-8 110 75)"/></svg>
      <div class="count" id="ocount">10</div><span class="note">Seconds left, sped up for this demo</span><span>Let it melt. No water needed.</span></div>`;
    ov.hidden = false;
    const finish = () => { S.log[TODAY] = { ...(S.log[TODAY] || {}), stick: S.stick, t: NOW }; setTimeout(() => { ov.hidden = true; ov.innerHTML = ''; render(); done('stick'); }, still ? 0 : 500); };
    if (!gs) { $('#ocount').textContent = '0'; finish(); return; }
    const o = { n: 10 };
    gs.from('#ostrip', { x: -160, duration: 0.5, ease: 'power3.out' });
    gs.to(o, { n: 0, duration: 2.6, delay: 0.5, ease: 'none', onUpdate: () => { const c = $('#ocount'); if (c) c.textContent = Math.ceil(o.n); } });
    gs.to('#ostrip', { opacity: 0, scaleX: 0.8, scaleY: 0.6, transformOrigin: '50% 50%', duration: 2.4, delay: 0.7, ease: 'power1.in', onComplete: finish });
  }

  /* ---------- Stamp: press and hold ---------- */
  function wireHold() {
    const btn = $('#hold'); if (!btn) return; const fill = btn.querySelector('.fill'); let t0 = 0, raf = 0, active = false;
    const DUR = 1100;
    const tick = now => { const p = Math.min(1, (now - t0) / DUR); fill.style.transform = `scaleX(${p})`; if (p >= 1) { active = false; complete(); } else raf = requestAnimationFrame(tick); };
    const start = e => { if (active) return; if (e) e.preventDefault(); active = true; t0 = performance.now(); btn.querySelector('span:last-child').textContent = 'Keep holding…'; raf = requestAnimationFrame(tick); };
    const cancel = () => { if (!active) return; active = false; cancelAnimationFrame(raf); fill.style.transition = 'transform .25s'; fill.style.transform = 'scaleX(0)'; setTimeout(() => fill.style.transition = '', 260); btn.querySelector('span:last-child').textContent = 'Press and hold to stamp'; };
    btn.addEventListener('pointerdown', e => { btn.setPointerCapture && btn.setPointerCapture(e.pointerId); start(e); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => btn.addEventListener(ev, cancel));
    btn.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) start(e); });
    btn.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') cancel(); });
    btn.addEventListener('contextmenu', e => e.preventDefault());
  }
  function complete() {
    S.log[TODAY] = { ...(S.log[TODAY] || {}), stamp: { k: S.stamp, site: siteFor(TODAY), t: NOW } };
    render(); done('stamp');
    if (gs) { gs.from('#smap .placed', { scale: 0.1, duration: 0.7, ease: 'elastic.out(1,0.45)' }); gs.to('#smap .placed', { opacity: 0.35, duration: 2.2, delay: 1.2, ease: 'sine.inOut' }); }
    const b = document.querySelector('[data-act="back"].btn'); b && b.focus({ preventScroll: true });
  }

  /* ---------- events ---------- */
  screen.addEventListener('click', e => {
    const a = e.target.closest('[data-act]'); if (!a) return; const act = a.dataset.act;
    if (act === 'take') takeStick();
    else if (act === 'gostamp') { S.sub = 'stamp'; views.scrollTop = 0; render(); }
    else if (act === 'back') { S.sub = null; render(); }
    else if (act === 'day') { S.sel = +a.dataset.d; render(); done('month'); }
    else if (act === 'dose') { const d = B.D[a.dataset.k]; S[d.format] = d.key; store.set({ stick: S.stick, stamp: S.stamp }); bump(); render(); done('me'); }
    else if (act === 'rem') { S.rem[a.dataset.k] = !S.rem[a.dataset.k]; render(); }
  });
  document.querySelectorAll('.apptabs button').forEach((b, i, all) => {
    b.addEventListener('click', () => go(b.dataset.tab));
    b.addEventListener('keydown', e => { const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!k) return; const n = all[(i + k + all.length) % all.length]; n.focus(); go(n.dataset.tab); });
  });
  $('#reset').addEventListener('click', () => { seed(); S.view = 'today'; S.sub = null; S.sel = TODAY; S.tasks = {}; $('#overlay').hidden = true; render(); });
  render();

  /* ---------- feature icons ---------- */
  $('#ic-site').innerHTML = `<svg viewBox="0 0 120 48" height="48">${[0, 1, 2, 3].map(i => `<circle cx="${18 + i * 28}" cy="24" r="12" fill="${i === 1 ? C.coral : 'none'}" stroke="${C.ink}" stroke-width="${i === 1 ? 0 : 3}"/>`).join('')}</svg>`;
  $('#ic-log').innerHTML = `<svg viewBox="0 0 120 48" height="48"><rect x="4" y="16" width="70" height="16" rx="8" fill="${st().color}"/><circle cx="96" cy="24" r="14" fill="${sp().color}"/></svg>`;
  $('#ic-refill').innerHTML = `<svg viewBox="0 0 120 48" height="48"><rect x="4" y="6" width="80" height="38" rx="10" fill="${C.mint}"/>${B.put(B.wordmark(), 16, 16, 56, 25)}</svg>`;
})();
