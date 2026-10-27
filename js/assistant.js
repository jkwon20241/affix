/* Ask Affix, assistant style: a glowing screen edge, an animated orb built from the brand's
   strip and dot, a compact bar at the bottom, short replies and result cards. Text only, no voice.
   Questions go to Claude through the artifact's `sample` capability when the viewer allows it,
   and fall back to the site index below. Nothing in the UI mentions AI. */
(function () {
  const page = document.body.dataset.page;
  const PAGES = {
    home: { file: 'index.html', name: 'Home', summary: 'Affix is a vitamin brand with no pills. A thin Stick strip melts on your tongue every morning, and once a week a press-on Stamp goes on your upper arm or thigh. The app keeps track of both.',
      sections: [
        ['intro', 'Intro', 'The idea in one line: vitamins you stick and stamp.', 'start hero overview idea'],
        ['formats', 'Two formats', 'Stick is a strip that dissolves on the tongue in about 10 seconds, every day. Stamp is a press-on applicator for the arm or thigh, once a week, leaving a mark that fades in a day.', 'stick stamp strip tongue arm thigh formats difference applicator mark'],
        ['how', 'How it works', 'Four steps: refills arrive, stick a strip, stamp a site, track it in the app.', 'steps how works routine refill box process'],
        ['sites', 'Body sites', 'The Stamp rotates through four sites: left arm, right arm, left thigh, right thigh.', 'sites body rotation arm thigh where week map'],
        ['range', 'Range', 'Six doses, each with its own color: Citrus C, Zinc Zn and Calm Mg as strips; Spark B12, Sun D3 and Iron Fe as Stamps.', 'range doses vitamins colors codes citrus zinc calm spark sun iron b12 d3']] },
    range: { file: 'range.html', name: 'Range', summary: 'All six doses, with filters for Stick and Stamp, and a builder where you pick one of each to see your October and what arrives in the box.',
      sections: [
        ['six', 'Six doses', 'Three Stick strips (Citrus C, Zinc Zn, Calm Mg) and three Stamp cartridges (Spark B12, Sun D3, Iron Fe). Filter by format and add any dose to your month.', 'doses range filter stick stamp citrus zinc calm spark sun iron flavor colors codes'],
        ['build', 'Build your month', 'Pick one Stick and one Stamp. The calendar shows a strip every day and a Stamp on Saturdays, plus what comes in the box.', 'build month calendar october choose pick save box refill cartridges order buy price']] },
    app: { file: 'app.html', name: 'Application', summary: 'The Affix app: take today’s Stick, press and hold to Stamp this week’s site, check the month and change your doses.',
      sections: [
        ['try', 'Application', 'A phone with Today, Sites, Month and Me. Take the Stick, hold to Stamp, tap days in Month, change doses in Me.', 'app phone prototype try today sites month me stamp hold take reminders interactive'],
        ['features', 'What it does', 'Picks the site, logs both doses and ships refills on time.', 'features app does reminders log refills site']] },
    about: { file: 'about.html', name: 'About', summary: 'Why Affix swaps pills for a tongue strip and a press-on Stamp, how the strip-and-dot identity works, the brand in photographs, and credits.',
      sections: [
        ['idea', 'The idea', 'What if vitamins worked like stickers and shots? With the numbers: 10 seconds, 1 press a week, 4 sites, 0 pills.', 'idea why reason story pills'],
        ['system', 'The system', 'Two shapes do the work: the strip for Stick, the dot for Stamp, the i that joins them, and patterns that spell copy in Morse.', 'system identity logo brand design strip dot morse pattern wordmark symbol'],
        ['world', 'Out in the world', 'Photographs of packs, boxes, the Stamp applicator, the app, tape, posters, billboards and signs.', 'photos mockups packaging box pack posters billboard world images gallery album merch tape'],
        ['credits', 'Credits', 'Brand identity, packaging, app and website by Jennie Kwon.', 'credits designer who made jennie kwon']] }
  };
  const ORDER = ['home', 'range', 'app', 'about'];
  const INDEX = []; ORDER.forEach(k => PAGES[k].sections.forEach(([id, title, text, kw]) => INDEX.push({ page: k, id, title, text, kw })));
  const byId = id => INDEX.find(s => s.id === id);
  const here = PAGES[page] || PAGES.home;
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SUGGEST = { home: ['Stick or Stamp?', 'Where are the photos?'], range: ['Which doses are Stamps?', 'How do I save my month?'], app: ['How do I stamp?', 'What does the app do?'], about: ['Who designed Affix?', 'How much is a box?'] }[page] || [];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };

  let sample = null, claudeOn = false, ctl = null, tour = null, opener = null;

  /* ---------- markup ---------- */
  const bar = document.querySelector('#topbar .bar');
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'askbtn'; btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'sir'); btn.setAttribute('aria-keyshortcuts', '/');
  btn.innerHTML = '<span class="askbtn-mk" aria-hidden="true"><i></i><b></b></span>Ask';
  if (bar) bar.insertBefore(btn, bar.querySelector('.monthbtn')); else document.body.append(btn);

  const orb = `<span class="orb" aria-hidden="true"><b class="o1"></b><b class="o2"></b><i></i><b class="o3"></b><b class="o4"></b></span>`;
  const glow = document.createElement('div'); glow.className = 'sir-glow'; glow.hidden = true; glow.setAttribute('aria-hidden', 'true');
  const dim = document.createElement('div'); dim.className = 'sir-dim'; dim.hidden = true;
  const sir = document.createElement('div');
  sir.className = 'sir'; sir.id = 'sir'; sir.setAttribute('role', 'dialog'); sir.setAttribute('aria-modal', 'true'); sir.setAttribute('aria-label', 'Ask Affix'); sir.hidden = true;
  sir.innerHTML = `
    <div class="sir-out" id="sir-out" aria-live="polite"></div>
    <div class="sir-sugg" id="sir-sugg">
      <button type="button" data-a="summary">What’s on this page?</button>
      <button type="button" data-a="tour">Walk me through it</button>
      ${SUGGEST.map(s => `<button type="button" data-q="${esc(s)}">${esc(s)}</button>`).join('')}
    </div>
    <form class="sir-bar" id="sir-form">
      ${orb}
      <label class="vh" for="sir-in">Ask Affix</label>
      <input id="sir-in" type="text" autocomplete="off" maxlength="300" placeholder="Ask Affix">
      <button type="submit" class="sir-ic sir-send" aria-label="Ask"><svg viewBox="0 0 24 24"><path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    </form>`;
  document.body.append(glow, dim, sir);
  const tbar = document.createElement('div'); tbar.className = 'ask-tour'; tbar.hidden = true; tbar.setAttribute('role', 'region'); tbar.setAttribute('aria-label', 'Page tour');
  document.body.append(tbar);
  const input = sir.querySelector('#sir-in'), out = sir.querySelector('#sir-out');
  const setState = s => { sir.dataset.state = s; glow.dataset.state = s; };

  /* ---------- open / close ---------- */
  function open() { opener = document.activeElement; [glow, dim, sir].forEach(e => e.hidden = false); btn.setAttribute('aria-expanded', 'true'); setState('idle'); setTimeout(() => input.focus(), 30); }
  function close(focus = true) { if (ctl) ctl.abort(); [glow, dim, sir].forEach(e => e.hidden = true); btn.setAttribute('aria-expanded', 'false'); if (focus && opener && opener.focus) opener.focus(); }
  btn.addEventListener('click', () => sir.hidden ? open() : close());
  dim.addEventListener('click', () => close());
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (!sir.hidden) close(); else if (tour) endTour(); }
    if (e.key === '/' && sir.hidden && !/input|textarea|select/i.test(document.activeElement.tagName) && !document.activeElement.isContentEditable) { e.preventDefault(); open(); }
    if (e.key === 'Tab' && !sir.hidden) { const f = [...sir.querySelectorAll('button, input')].filter(x => !x.disabled && x.offsetParent); if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); } }
  });

  /* ---------- results ---------- */
  const card = s => `<button type="button" class="sir-card" data-go="${s.id}"><span class="label">${esc(PAGES[s.page].name)}</span><b>${esc(s.title)}</b><span>${esc(s.text)}</span></button>`;
  function show(a) {
    sir.querySelector('#sir-sugg').hidden = true;
    const lines = String(a.text).split('\n').map(l => l.trim()).filter(Boolean);
    const head = lines.shift() || '';
    const rest = lines.length ? (lines.every(l => /^[-•*]\s+/.test(l)) ? `<ul>${lines.map(l => `<li>${esc(l.replace(/^[-•*]\s+/, ''))}</li>`).join('')}</ul>` : lines.map(l => `<p>${esc(l.replace(/^[-•*]\s+/, ''))}</p>`).join('')) : '';
    const cards = (a.go || []).map(byId).filter(Boolean);
    out.innerHTML = `${a.q ? `<p class="sir-heard">“${esc(a.q)}”</p>` : ''}<p class="sir-say">${esc(head)}</p>${rest}${a.tour ? '<button type="button" class="sir-chip" data-a="tour">Start the tour</button>' : ''}${cards.length ? `<div class="sir-cards">${cards.map(card).join('')}</div>` : ''}<button type="button" class="sir-chip ghost" data-a="again">Ask something else</button>`;
    if (!reduce()) out.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'ease-out' });
  }
  sir.addEventListener('click', e => {
    const g = e.target.closest('[data-go]'); if (g) { close(false); go(g.dataset.go); return; }
    const a = e.target.closest('[data-a]')?.dataset.a; const q = e.target.closest('[data-q]')?.dataset.q;
    if (a === 'tour') { close(false); startTour(); }
    else if (a === 'summary') { input.value = 'What’s on this page?'; submit('summary'); }
    else if (a === 'again') { out.innerHTML = ''; sir.querySelector('#sir-sugg').hidden = false; setState('idle'); input.focus(); }
    else if (q) { input.value = q; submit(); }
  });

  /* ---------- locate ---------- */
  function flash(el) { el.classList.remove('ask-mark'); void el.offsetWidth; el.classList.add('ask-mark'); setTimeout(() => el.classList.remove('ask-mark'), 2600); }
  function go(id) { const s = byId(id); if (!s) return;
    if (s.page === page) { const el = document.getElementById(id); if (el) { el.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'start' }); flash(el); el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); } }
    else location.href = PAGES[s.page].file + '#' + id; }
  if (location.hash.length > 1) { const el = document.getElementById(location.hash.slice(1)); if (el && el.classList.contains('band')) setTimeout(() => { el.scrollIntoView({ block: 'start' }); flash(el); }, 250); }

  /* ---------- tour: a slim bar docked at the bottom ---------- */
  function startTour() { tour = { i: 0 }; tbar.hidden = false; document.documentElement.classList.add('touring'); renderTour(); tbar.querySelector('[data-t="next"], a')?.focus({ preventScroll: true }); }
  function renderTour() {
    const secs = here.sections, s = secs[tour.i], last = tour.i === secs.length - 1;
    const np = PAGES[ORDER[(ORDER.indexOf(page) + 1) % ORDER.length]];
    tbar.innerHTML = `<div class="ask-tour-in"><span class="ask-count" aria-hidden="true">${secs.map((_, i) => `<i class="${i === tour.i ? 'on' : i < tour.i ? 'done' : ''}"></i>`).join('')}</span>
      <div class="ask-tour-txt"><span class="label">${tour.i + 1} of ${secs.length} · ${esc(here.name)}</span><b>${esc(s[1])}</b><span>${esc(s[2])}</span></div>
      <div class="ask-tour-btns"><button type="button" class="btn btn-line" data-t="back"${tour.i ? '' : ' disabled'}>Back</button>${last ? `<a class="btn btn-ink" href="${np.file}#${np.sections[0][0]}">${esc(np.name)} →</a>` : '<button type="button" class="btn btn-ink" data-t="next">Next</button>'}<button type="button" class="ask-end" data-t="end">End</button></div></div>`;
    document.querySelectorAll('.ask-on').forEach(x => x.classList.remove('ask-on'));
    const el = document.getElementById(s[0]); if (el) { el.classList.add('ask-on'); el.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'start' }); }
  }
  tbar.addEventListener('click', e => { const t = e.target.closest('[data-t]')?.dataset.t; if (!t) return;
    if (t === 'next') { tour.i++; renderTour(); tbar.querySelector('[data-t="next"], a.btn')?.focus({ preventScroll: true }); } else if (t === 'back') { tour.i = Math.max(0, tour.i - 1); renderTour(); } else endTour(); });
  function endTour() { tour = null; tbar.hidden = true; tbar.innerHTML = ''; document.documentElement.classList.remove('touring'); document.querySelectorAll('.ask-on').forEach(x => x.classList.remove('ask-on')); btn.focus({ preventScroll: true }); }

  /* ---------- answers ---------- */
  const STOP = new Set('a an the is are do does i you me my to of in on for and or with what where how can see show find which who about this that it its page site please tell there any some'.split(' '));
  const SYN = { packaging: 'box pack', package: 'box pack', photo: 'photos', picture: 'photos', images: 'photos', buy: 'build month', order: 'build month', price: 'build month', cost: 'build month', real: 'credept credits', designer: 'credits', designed: 'credits', made: 'credits', logo: 'system wordmark symbol', shot: 'stamp arm', shots: 'stamp arm', tongue: 'stick strip', vitamin: 'doses range', vitamins: 'doses range', schedule: 'sites rotation', calendar: 'build month calendar' };
  function words(q) { let w = q.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(x => x && !STOP.has(x)); w = w.concat(...w.map(x => (SYN[x] || '').split(' ').filter(Boolean))); return [...new Set(w)]; }
  function search(q) { const w = words(q); if (!w.length) return [];
    return INDEX.map(s => { const hay = (s.title + ' ' + s.text + ' ' + s.kw).toLowerCase(); let sc = 0; w.forEach(x => { if (x.length > 1 && hay.includes(x)) sc += s.kw.split(' ').includes(x) ? 3 : 1; }); if (s.page === page) sc += 0.5; return { s, sc }; })
      .filter(r => r.sc >= 1).sort((a, b) => b.sc - a.sc).slice(0, 3).map(r => r.s); }
  function localAnswer(q, kind) {
    if (kind === 'summary' || /summar|overview|what('|’)?s on this page|tl;?dr/i.test(q)) return { text: `Here’s the ${here.name === 'Home' ? 'home' : here.name.replace(/^The /, '')} page. ${here.summary}`, go: here.sections.map(s => s[0]).slice(0, 3), tour: true };
    if (/real|health|medical|safe|doctor/i.test(q)) return { text: 'Affix doesn’t give medical advice. Talk to your doctor or pharmacist before starting any supplement, especially if you take medication.', go: ['six'] };
    if (/which.*stamps?|stamp doses/i.test(q)) return { text: 'The Stamps are Spark B12 and Sun D3, once a week, and Iron Fe, once a month.', go: ['six', 'range'] };
    if (/which.*(sticks?|strips?)|strip doses|stick doses/i.test(q)) return { text: 'The Stick strips are Citrus C and Zinc Zn for mornings, and Calm Mg for evenings.', go: ['six', 'range'] };
    if (/save.*month|build.*month|my month/i.test(q)) return { text: 'Pick one Stick and one Stamp in Build your month, then press Save my month. It shows up in the top bar.', go: ['build'] };
    if (/how (do|can) i stamp|how.*stamp work/i.test(q)) return { text: 'In the app, tap Stamp now, then press and hold the button until it clicks. The mark shows up on this week\u2019s site.', go: ['try'] };
    if (/what does the app do|app do/i.test(q)) return { text: 'The app picks the site for each Stamp, logs your strips and Stamps, and ships refills on time.', go: ['features', 'try'] };
    if (/how much|price|cost|box/i.test(q)) return { text: 'A month is a Stick pack at $24 plus your Stamp: $28 for Spark or Sun, $12 for Iron. The applicator is free with your first box, and shipping is free.', go: ['build'] };
    if (/who (designed|made|created)|designer/i.test(q)) return { text: 'Affix’s brand, packaging, app and website were designed by Jennie Kwon.', go: ['credits'] };
    if (/stick or stamp|difference/i.test(q)) return { text: 'Stick is a strip that melts on your tongue every morning. Stamp is a press on your arm or thigh once a week.', go: ['formats'] };
    if (/^(hi|hello|hey)\b/i.test(q) && q.length < 14) return { text: 'Hi. Ask me where something is, or say “walk me through it” for a tour.', go: [] };
    const hits = search(q);
    if (!hits.length) return { text: 'I couldn’t find that here. Try asking about packaging, the doses, the app or the photos.', go: [] };
    const name = s => s.page === page ? s.title : `${s.title} on ${PAGES[s.page].name}`;
    return { text: `I found it in ${name(hits[0])}.`, go: hits.map(h => h.id) };
  }
  const RULES = () => `You are Ask Affix, the guide on the website of Affix, a vitamin brand (brand and website designed by Jennie Kwon). Never give medical or dosing advice and never claim health benefits; if asked, suggest a doctor or pharmacist. Prices: Stick packs $24/month, Spark and Sun $28/month, Iron $12/month, applicator free with the first box, free shipping.
Talk like a friendly assistant: one or two short sentences, at most 40 words, no lists, no emoji, no greetings unless greeted, never mention being an AI or a model. Use only the site content below.
Reply with only a JSON object: {"answer": string, "go": [up to 3 section ids from the index, most relevant first], "tour": boolean}. Set "tour" true when the visitor wants to be guided or shown around.

SITE INDEX (id | page | section: what's there)
${INDEX.map(s => `${s.id} | ${PAGES[s.page].name} | ${s.title}: ${s.text}`).join('\n')}

VISITOR IS ON: ${here.name}
PAGE TEXT (excerpt):
${(document.querySelector('main')?.innerText || '').replace(/\s+\n/g, '\n').slice(0, 5000)}`;
  const OFF = new Set(['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed']);

  async function submit(kind) {
    if (ctl) { ctl.abort(); return; }
    const q = input.value.trim(); if (!q) return;
    if (/walk me|tour|show me around|guide me/i.test(q)) { input.value = ''; close(false); startTour(); return; }
    input.value = ''; setState('think');
    out.innerHTML = `<p class="sir-heard">“${esc(q)}”</p>`; sir.querySelector('#sir-sugg').hidden = true;
    let a;
    if (claudeOn && sample) {
      ctl = new AbortController();
      try { const r = await sample.json([{ role: 'user', content: RULES() }, { role: 'user', content: kind === 'summary' ? 'Tell me what is on this page.' : q }], { modelTier: 'quick', signal: ctl.signal });
        if (!r || typeof r.answer !== 'string' || !r.answer.trim()) throw { code: 'empty_completion' };
        a = { q, text: r.answer.trim(), go: (Array.isArray(r.go) ? r.go : []).map(String).filter(byId).slice(0, 3), tour: r.tour === true };
      } catch (err) { if (err && err.code === 'cancelled') { a = null; setState('idle'); } else { if (OFF.has(err && err.code)) claudeOn = false; a = { q, ...localAnswer(q, kind) }; } }
      finally { ctl = null; }
    } else { await new Promise(r => setTimeout(r, reduce() ? 0 : 450)); a = { q, ...localAnswer(q, kind) }; }
    if (!a || sir.hidden) return;
    show(a); setState('idle');
  }
  sir.querySelector('#sir-form').addEventListener('submit', e => { e.preventDefault(); submit(); });

  if (window.claude && typeof window.claude.use === 'function') window.claude.use('sample').then(s => { if (s) { sample = s; claudeOn = true; } }).catch(() => {});
})();
