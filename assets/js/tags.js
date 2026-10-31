(function () {
  var chips = document.querySelectorAll('.tag-chip');
  var cards = document.querySelectorAll('.card');
  var dividers = document.querySelectorAll('.divider');
  var empty = document.querySelector('.no-results');
  function apply(tag) {
    var shown = 0;
    cards.forEach(function (c) {
      var tags = (c.dataset.tags || '').split('|');
      var ok = tag === 'all' || tags.indexOf(tag) !== -1;
      c.hidden = !ok;
      if (ok) shown++;
    });
    dividers.forEach(function (d) { d.hidden = tag !== 'all'; });
    document.querySelector('.articles').classList.toggle('filtered', tag !== 'all');
    chips.forEach(function (ch) { ch.classList.toggle('active', ch.dataset.tag === tag); });
    if (empty) empty.hidden = shown !== 0;
    if (tag === 'all') history.replaceState(null, '', location.pathname);
    else history.replaceState(null, '', '#tag=' + encodeURIComponent(tag));
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-tag]');
    if (!b || b.tagName !== 'BUTTON') return;
    apply(b.dataset.tag);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  var m = location.hash.match(/tag=([^&]+)/);
  if (m) apply(decodeURIComponent(m[1]));
})();
