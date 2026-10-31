(function () {
  var state = { cat: 'all', tag: 'all' };
  var cards = document.querySelectorAll('.card');
  var dividers = document.querySelectorAll('.divider');
  var list = document.querySelector('.articles');
  var empty = document.querySelector('.no-results');

  function render() {
    var shown = 0;
    cards.forEach(function (c) {
      var tags = (c.dataset.tags || '').split('|');
      var ok = (state.cat === 'all' || c.dataset.cat === state.cat) &&
               (state.tag === 'all' || tags.indexOf(state.tag) !== -1);
      c.hidden = !ok;
      if (ok) shown++;
    });
    var filtering = state.cat !== 'all' || state.tag !== 'all';
    dividers.forEach(function (d) { d.hidden = filtering; });
    if (list) list.classList.toggle('filtered', filtering);
    document.querySelectorAll('.cat-tab').forEach(function (b) { b.classList.toggle('active', b.dataset.cat === state.cat); });
    document.querySelectorAll('.tag-chip').forEach(function (b) { b.classList.toggle('active', b.dataset.tag === state.tag); });
    if (empty) empty.hidden = shown !== 0;
    var h = [];
    if (state.cat !== 'all') h.push('cat=' + encodeURIComponent(state.cat));
    if (state.tag !== 'all') h.push('tag=' + encodeURIComponent(state.tag));
    history.replaceState(null, '', h.length ? '#' + h.join('&') : location.pathname);
  }

  var LIMIT = 500;
  document.querySelectorAll('.view-full').forEach(function (el) {
    if ((el.textContent || '').trim().length <= LIMIT) return;
    el.classList.add('collapsed');
    var btn = document.createElement('button');
    btn.className = 'more-btn';
    btn.textContent = 'قراءة المزيد ▾';
    el.insertAdjacentElement('afterend', btn);
  });

  document.addEventListener('click', function (e) {
    var m = e.target.closest('.more-btn');
    if (m) {
      var full = m.previousElementSibling;
      var open = full.classList.toggle('collapsed') === false;
      m.textContent = open ? 'عرض أقل ▴' : 'قراءة المزيد ▾';
      if (!open) full.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    var v = e.target.closest('.view-btn');
    if (v) {
      var card = v.closest('.card');
      card.querySelectorAll('.view-btn').forEach(function (b) { b.classList.toggle('active', b === v); });
      card.querySelectorAll('.view').forEach(function (el) { el.hidden = !el.classList.contains('view-' + v.dataset.view); });
      var mb = card.querySelector('.more-btn'); if (mb) mb.hidden = v.dataset.view !== 'full';
      return;
    }
    var b = e.target.closest('button[data-cat], button[data-tag]');
    if (b) {
      e.preventDefault(); e.stopPropagation();
      if (b.dataset.cat !== undefined) { state.cat = b.dataset.cat; }
      if (b.dataset.tag !== undefined) { state.tag = b.dataset.tag; }
      render();
      var f = document.querySelector('.filters');
      if (f && b.closest('.card')) f.scrollIntoView({ behavior: 'smooth' });
      return;
    }
  });

  var hash = location.hash.slice(1).split('&');
  hash.forEach(function (p) {
    var kv = p.split('=');
    if (kv[0] === 'cat' || kv[0] === 'tag') state[kv[0]] = decodeURIComponent(kv[1] || 'all');
  });
  render();
})();
