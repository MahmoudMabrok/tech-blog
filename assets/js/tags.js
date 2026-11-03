(function () {
  var state = { cat: 'all', tag: 'all' };
  var cards = document.querySelectorAll('.card');
  var dividers = document.querySelectorAll('.divider');
  var list = document.querySelector('.articles');
  var empty = document.querySelector('.no-results');

  // Apply default view preference
  var DEFAULT_KEY = 'techblog-default-view';
  var defaultView = localStorage.getItem(DEFAULT_KEY) || 'full';

  function applyDefaultView() {
    cards.forEach(function (card) {
      var buttons = card.querySelectorAll('.view-btn');
      var views = card.querySelectorAll('.view');
      if (!buttons.length) return;

      // Reset
      buttons.forEach(function (b) { b.classList.remove('active'); });
      views.forEach(function (v) { v.hidden = true; });

      // Activate preferred
      var preferredBtn = card.querySelector('.view-btn[data-view="' + defaultView + '"]');
      var preferredView = card.querySelector('.view-' + defaultView);
      if (preferredBtn && preferredView) {
        preferredBtn.classList.add('active');
        preferredView.hidden = false;
      } else {
        // fallback to full
        var fullBtn = card.querySelector('.view-btn[data-view="full"]');
        var fullView = card.querySelector('.view-full');
        if (fullBtn) fullBtn.classList.add('active');
        if (fullView) fullView.hidden = false;
      }
    });
  }
  applyDefaultView();

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

  var KEY = 'techblog-read';
  var read = {};
  try { read = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { read = {}; }
  function paintRead() {
    var n = 0;
    cards.forEach(function (c) { var r = !!read[c.dataset.id]; c.classList.toggle('is-read', r); if (r) n++; });
    var st = document.querySelector('.read-stat'), rc = document.querySelector('.read-count');
    if (rc) rc.textContent = n;
    if (st) st.hidden = n === 0;
  }
  function markRead(card) {
    if (!card || !card.dataset.id || read[card.dataset.id]) return;
    read[card.dataset.id] = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(read)); } catch (e) {}
    paintRead();
  }
  paintRead();

  var LIMIT = 500;
  document.querySelectorAll('.view').forEach(function (el) {
    if ((el.textContent || '').trim().length <= LIMIT) return;
    el.classList.add('collapsed');
    var btn = document.createElement('button');
    btn.className = 'more-btn';
    btn.textContent = 'قراءة المزيد ▾';
    btn.hidden = el.hidden;
    el.insertAdjacentElement('afterend', btn);
  });

  var lb = document.getElementById('lightbox');
  var lbImg = lb ? lb.querySelector('img') : null;
  var group = [];
  var gIndex = 0;

  function showSlide() {
    if (!lbImg || !group.length) return;
    lbImg.src = group[gIndex];
    lbImg.alt = 'صورة ' + (gIndex + 1) + ' من ' + group.length;
    var multi = group.length > 1;
    lb.querySelector('.prev').hidden = !multi;
    lb.querySelector('.next').hidden = !multi;
  }
  function openLightbox(items, i) {
    if (!lb) return;
    group = items;
    gIndex = i;
    showSlide();
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    if (!lb) return;
    lb.hidden = true;
    if (lbImg) lbImg.removeAttribute('src');
    document.body.style.overflow = '';
    group = [];
  }
  function stepLightbox(delta) {
    if (!group.length) return;
    gIndex = (gIndex + delta + group.length) % group.length;
    showSlide();
  }

  // --- Explanations / tooltips ---
  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function highlightTerms(root, explanations) {
    if (!explanations || !explanations.length) return;
    explanations = explanations.slice().sort(function (a, b) {
      return ((b.term || '').length - (a.term || '').length);
    });

    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(function (node) {
      var text = node.textContent;
      var parent = node.parentNode;
      if (!text || !parent || parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE' ||
          parent.classList.contains('explain') || parent.closest('pre, code')) return;

      var matches = [];
      explanations.forEach(function (exp) {
        if (!exp.term || !exp.explanation) return;
        var regex = new RegExp(escapeRegExp(exp.term), 'gi');
        var m;
        while ((m = regex.exec(text)) !== null) {
          matches.push({
            start: m.index,
            end: m.index + m[0].length,
            term: m[0],
            explanation: exp.explanation
          });
        }
      });

      if (!matches.length) return;

      matches.sort(function (a, b) { return a.start - b.start || (b.end - a.end); });
      var filtered = [];
      var currentEnd = -1;
      matches.forEach(function (m) {
        if (m.start >= currentEnd) {
          filtered.push(m);
          currentEnd = m.end;
        }
      });

      if (!filtered.length) return;

      var fragment = document.createDocumentFragment();
      var pos = 0;
      filtered.forEach(function (m) {
        if (m.start > pos) {
          fragment.appendChild(document.createTextNode(text.slice(pos, m.start)));
        }
        var span = document.createElement('span');
        span.className = 'explain';
        span.textContent = m.term;
        span.dataset.explain = m.explanation;
        span.setAttribute('tabindex', '0');
        span.setAttribute('role', 'button');
        fragment.appendChild(span);
        pos = m.end;
      });
      if (pos < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(pos)));
      }
      parent.replaceChild(fragment, node);
    });
  }

  function applyExplanations() {
    cards.forEach(function (card) {
      var script = card.querySelector('.article-explanations');
      if (!script) return;
      var explanations;
      try { explanations = JSON.parse(script.textContent); } catch (e) { return; }
      if (!Array.isArray(explanations)) return;
      card.querySelectorAll('.view').forEach(function (view) {
        highlightTerms(view, explanations);
      });
    });
  }
  applyExplanations();

  // Tooltip
  var tooltip = document.createElement('div');
  tooltip.className = 'explain-tooltip';
  tooltip.hidden = true;
  document.body.appendChild(tooltip);

  function showTooltip(el) {
    var text = el.dataset.explain;
    if (!text) return;
    tooltip.textContent = text;
    tooltip.hidden = false;
    var rect = el.getBoundingClientRect();
    var top = rect.bottom + window.scrollY + 8;
    var left = rect.left + window.scrollX + (rect.width / 2);
    tooltip.style.top = top + 'px';
    tooltip.style.left = left + 'px';
    tooltip.style.transform = 'translateX(-50%)';
    var ttRect = tooltip.getBoundingClientRect();
    if (ttRect.left < 8) {
      tooltip.style.left = (8 + ttRect.width / 2) + 'px';
    } else if (ttRect.right > window.innerWidth - 8) {
      tooltip.style.left = (window.innerWidth - 8 - ttRect.width / 2) + 'px';
    }
  }

  function hideTooltip() {
    tooltip.hidden = true;
  }

  document.addEventListener('mouseover', function (e) {
    var el = e.target.closest('.explain');
    if (el) showTooltip(el);
  });
  document.addEventListener('mouseout', function (e) {
    var el = e.target.closest('.explain');
    if (el && !el.contains(e.relatedTarget) && !tooltip.contains(e.relatedTarget)) hideTooltip();
  });
  document.addEventListener('click', function (e) {
    var el = e.target.closest('.explain');
    if (el) {
      e.preventDefault();
      e.stopPropagation();
      if (tooltip.hidden) showTooltip(el);
      else hideTooltip();
      return;
    }
    if (!e.target.closest('.explain-tooltip')) hideTooltip();
  });
  document.addEventListener('focusin', function (e) {
    var el = e.target.closest('.explain');
    if (el) showTooltip(el);
  });
  document.addEventListener('focusout', function (e) {
    var el = e.target.closest('.explain');
    if (el) setTimeout(hideTooltip, 150);
  });

  // Copy content button
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.copy-btn');
    if (!btn) return;
    var card = btn.closest('.card');
    var view = card.querySelector('.view-full');
    if (!view) return;
    var text = (view.innerText || view.textContent || '').trim();
    if (!text) return;

    function done() {
      var orig = btn.textContent;
      btn.textContent = 'تم النسخ ✓';
      setTimeout(function () { btn.textContent = orig; }, 2000);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        fallbackCopy(text, done);
      });
    } else {
      fallbackCopy(text, done);
    }
  });

  function fallbackCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      done();
    } catch (e) {}
    document.body.removeChild(ta);
  }

  document.addEventListener('click', function (e) {
    var shot = e.target.closest('.gallery-item');
    if (shot) {
      e.preventDefault();
      var strip = shot.closest('.card-gallery');
      var buttons = strip.querySelectorAll('.gallery-item');
      var items = Array.prototype.map.call(buttons, function (b) { return b.getAttribute('data-full'); });
      openLightbox(items, Array.prototype.indexOf.call(buttons, shot));
      return;
    }
    if (lb && !lb.hidden) {
      if (e.target.closest('.lightbox-close') || e.target === lb) { closeLightbox(); return; }
      if (e.target.closest('.lightbox-nav.prev')) { stepLightbox(-1); return; }
      if (e.target.closest('.lightbox-nav.next')) { stepLightbox(1); return; }
    }
    var ln = e.target.closest('.card .read-more');
    if (ln) { markRead(ln.closest('.card')); return; }
    var m = e.target.closest('.more-btn');
    if (m) {
      var full = m.previousElementSibling;
      var open = full.classList.toggle('collapsed') === false;
      m.textContent = open ? 'عرض أقل ▴' : 'قراءة المزيد ▾';
      if (open) markRead(m.closest('.card'));
      if (!open) full.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    var v = e.target.closest('.view-btn');
    if (v) {
      var card = v.closest('.card');
      card.querySelectorAll('.view-btn').forEach(function (b) { b.classList.toggle('active', b === v); });
      card.querySelectorAll('.view').forEach(function (el) { el.hidden = !el.classList.contains('view-' + v.dataset.view); });
      card.querySelectorAll('.more-btn').forEach(function (mb) { mb.hidden = mb.previousElementSibling.hidden; });
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

  document.addEventListener('keydown', function (e) {
    if (!lb || lb.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowRight') stepLightbox(-1);
    else if (e.key === 'ArrowLeft') stepLightbox(1);
  });
})();
