(function () {
  var cards = document.querySelectorAll('.card');

  function highlightTerms(root, explainers) {
    if (!explainers || !explainers.length) return;
    explainers = explainers.slice().sort(function (a, b) {
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
      var lower = text.toLowerCase();
      var matches = [];
      explainers.forEach(function (exp) {
        if (!exp.term || !exp.explanation) return;
        var termLower = exp.term.toLowerCase();
        var idx = 0;
        while ((idx = lower.indexOf(termLower, idx)) !== -1) {
          matches.push({ start: idx, end: idx + exp.term.length, term: text.substr(idx, exp.term.length), explanation: exp.explanation });
          idx += exp.term.length;
        }
      });
      if (!matches.length) return;
      matches.sort(function (a, b) { return a.start - b.start || (b.end - a.end); });
      var filtered = [];
      var currentEnd = -1;
      matches.forEach(function (m) {
        if (m.start >= currentEnd) { filtered.push(m); currentEnd = m.end; }
      });
      if (!filtered.length) return;
      var fragment = document.createDocumentFragment();
      var pos = 0;
      filtered.forEach(function (m) {
        if (m.start > pos) fragment.appendChild(document.createTextNode(text.slice(pos, m.start)));
        var span = document.createElement('span');
        span.className = 'explain';
        span.textContent = m.term;
        span.dataset.explain = m.explanation;
        span.setAttribute('tabindex', '0');
        span.setAttribute('role', 'button');
        fragment.appendChild(span);
        pos = m.end;
      });
      if (pos < text.length) fragment.appendChild(document.createTextNode(text.slice(pos)));
      parent.replaceChild(fragment, node);
    });
  }

  function applyExplainers() {
    cards.forEach(function (card) {
      var script = card.querySelector('.article-explainers');
      if (!script) return;
      var explainers;
      try { explainers = JSON.parse(script.textContent); } catch (e) { return; }
      if (!Array.isArray(explainers)) return;
      card.querySelectorAll('.view').forEach(function (view) { highlightTerms(view, explainers); });
    });
  }
  applyExplainers();

  var tooltip = document.createElement('div');
  tooltip.className = 'explain-tooltip';
  document.body.appendChild(tooltip);

  function showTooltip(el) {
    var text = el.dataset.explain;
    if (!text) return;
    tooltip.textContent = text;
    tooltip.classList.add('show');
    var rect = el.getBoundingClientRect();
    var top = rect.bottom + 8;
    var left = rect.left + (rect.width / 2);
    tooltip.style.top = top + 'px';
    tooltip.style.left = left + 'px';
    tooltip.style.transform = 'translateX(-50%)';
    // Keep in viewport
    var ttRect = tooltip.getBoundingClientRect();
    if (ttRect.left < 8) {
      tooltip.style.left = (8 + ttRect.width / 2) + 'px';
    } else if (ttRect.right > window.innerWidth - 8) {
      tooltip.style.left = (window.innerWidth - 8 - ttRect.width / 2) + 'px';
    }
    if (ttRect.bottom > window.innerHeight - 8) {
      tooltip.style.top = (rect.top - ttRect.height - 8) + 'px';
    }
  }
  function hideTooltip() { tooltip.classList.remove('show'); }

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
      e.preventDefault(); e.stopPropagation();
      if (!tooltip.classList.contains('show')) showTooltip(el); else hideTooltip();
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

  // Copy currently visible view
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.copy-btn');
    if (!btn) return;
    var card = btn.closest('.card');
    var view = card.querySelector('.view:not([hidden])');
    if (!view) view = card.querySelector('.view-full');
    if (!view) return;
    var text = (view.innerText || view.textContent || '').trim();
    if (!text) return;

    function done() {
      var orig = btn.textContent;
      btn.textContent = 'تم النسخ ✓';
      setTimeout(function () { btn.textContent = orig; }, 2000);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text, done); });
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
    try { document.execCommand('copy'); done(); } catch (e) {}
    document.body.removeChild(ta);
  }
})();
