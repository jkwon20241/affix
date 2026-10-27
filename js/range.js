(function () {
  const { B, C, store, setDot, bump } = window.Affix;
  const $ = s => document.querySelector(s);
  const NOTE = {
    citrus: 'A citrus-flavored strip for the morning.', zinc: 'A cool mint strip. Same routine, different taste.', calm: 'A berry strip for the evening, before bed.',
    spark: 'Leaves a pink mark. Once a week.', sun: 'Leaves a yellow mark. Once a week.', iron: 'Leaves a rust mark. Once a month.'
  };
  const saved = store.get() || {};
  const state = { stick: saved.stick || 'citrus', stamp: saved.stamp || 'spark' };

  $('#doses').innerHTML = B.DOSES.map(d => `<article class="dose" id="${d.key}" data-format="${d.format}" data-color="${d.color}">
    <div class="shape" aria-hidden="true">${d.format === 'stick' ? `<span class="s" style="background:${d.color}"></span>` : `<span class="d" style="background:${d.color}"></span>`}</div>
    <div class="code">${d.code}</div>
    <div class="meta"><h2 class="nm" style="font-size:22px;letter-spacing:0">${d.name}</h2><span class="label">${d.format === 'stick' ? 'Stick' : 'Stamp'} · ${d.when}</span></div>
    <p>${NOTE[d.key]}</p>
    <button type="button" class="btn btn-line add" data-key="${d.key}" aria-pressed="false">Use in my month</button></article>`).join('');

  function syncCards() { document.querySelectorAll('.add').forEach(b => { const on = state.stick === b.dataset.key || state.stamp === b.dataset.key; b.setAttribute('aria-pressed', on); b.textContent = on ? 'In my month' : 'Use in my month'; }); }
  document.querySelectorAll('.dose').forEach(el => {
    el.addEventListener('mouseenter', () => setDot(el.dataset.color)); el.addEventListener('mouseleave', () => setDot());
    el.addEventListener('focusin', () => setDot(el.dataset.color)); el.addEventListener('focusout', () => setDot());
  });
  document.querySelectorAll('.add').forEach(b => b.addEventListener('click', () => { const d = B.D[b.dataset.key]; state[d.format] = d.key; render(); document.getElementById('o-' + d.key).checked = true; }));

  // Filters
  document.querySelectorAll('.filters button').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.filters button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    document.querySelectorAll('.dose').forEach(el => el.dataset.hidden = String(b.dataset.f !== 'all' && el.dataset.format !== b.dataset.f));
  }));

  // Builder
  const opt = fmt => B.DOSES.filter(d => d.format === fmt).map(d => `<label><input type="radio" name="${fmt}" id="o-${d.key}" value="${d.key}"${state[fmt] === d.key ? ' checked' : ''}><span><i class="${fmt === 'stamp' ? 'dot' : ''}" style="background:${d.color}"></i>${d.full}</span></label>`).join('');
  $('#opt-stick').innerHTML = opt('stick'); $('#opt-stamp').innerHTML = opt('stamp');
  $('#choose').addEventListener('change', e => { if (e.target.name) { state[e.target.name] = e.target.value; render(); $('#status').textContent = ''; } });
  $('#choose').addEventListener('submit', e => { e.preventDefault(); store.set({ ...state }); bump(); $('#status').textContent = `Saved: ${B.D[state.stick].full} and ${B.D[state.stamp].full}.`; });

  function render() {
    const st = B.D[state.stick], sp = B.D[state.stamp]; const monthly = sp.when === 'Monthly';
    let html = ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => `<span class="dow">${d}</span>`).join('');
    const lead = 3; for (let i = 0; i < lead; i++) html += '<span class="day blank" aria-hidden="true"></span>';
    let stamps = 0;
    for (let d = 1; d <= 31; d++) { const sat = (d + lead - 1) % 7 === 5; const has = sat && (!monthly || stamps === 0); if (has) stamps++;
      html += `<span class="day"><b style="background:${st.color}"></b>${has ? `<em style="background:${sp.color}" title="${sp.full}"></em>` : '<em></em>'}${d}</span>`; }
    $('#cal').innerHTML = html; $('#cal').setAttribute('aria-label', `October: 31 ${st.name} strips, ${stamps} ${sp.name} ${stamps === 1 ? 'Stamp' : 'Stamps'}`);
    $('#oct-sum').textContent = `31 strips · ${stamps} ${stamps === 1 ? 'stamp' : 'stamps'}`;
    $('#inbox').innerHTML = `<li><i style="background:${st.color}"></i>One Stick pack · ${st.full} · 31 strips</li>
      <li><i class="dot" style="background:${sp.color}"></i>${stamps} Stamp ${stamps === 1 ? 'cartridge' : 'cartridges'} · ${sp.full}</li>
      <li><i style="background:${C.mint}"></i>The applicator, in your first box only</li>`;
    syncCards();
  }
  render();
  if (location.hash && B.D[location.hash.slice(1)]) { const el = document.getElementById(location.hash.slice(1)); el && el.querySelector('.add').focus({ preventScroll: true }); }
})();
