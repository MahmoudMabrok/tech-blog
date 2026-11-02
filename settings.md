---
layout: home
title: الإعدادات
permalink: /settings/
---

<section class="hero">
  <h1>الإعدادات</h1>
  <p>اختار طريقة عرض المقالات الافتراضية</p>
</section>

<div class="settings-card">
  <h2>طريقة العرض الافتراضية</h2>
  <p>الاختيار ده هيطبق على كل المقالات لما تفتح المدونة.</p>

  <div class="settings-options">
    <label class="setting-option">
      <input type="radio" name="defaultView" value="full" checked>
      <span>
        <strong>البوست العربي الكامل</strong>
        <small>يظهر الشرح المطول أولاً (الافتراضي)</small>
      </span>
    </label>
    <label class="setting-option">
      <input type="radio" name="defaultView" value="en">
        <span>
        <strong>English Summary أولاً</strong>
        <small>يظهر الملخص الإنجليزي أولاً</small>
      </span>
    </label>
    <label class="setting-option">
      <input type="radio" name="defaultView" value="ar">
      <span>
        <strong>الملخص العربي أولاً</strong>
        <small>يظهر الملخص المختصر أولاً، وتقدر تكمل للقراءة الكاملة</small>
      </span>
    </label>
  </div>

  <button id="save-settings" class="save-btn">حفظ الإعدادات</button>
  <p id="save-msg" class="save-msg" hidden>اتحفظت ✅</p>
</div>

<p style="margin-top: 2rem;"><a href="/tech-blog/">← رجوع للمقالات</a></p>

<script>
(function() {
  var KEY = 'techblog-default-view';
  var radios = document.querySelectorAll('input[name="defaultView"]');
  var saved = localStorage.getItem(KEY) || 'full';
  radios.forEach(function(r) { r.checked = r.value === saved; });

  document.getElementById('save-settings').addEventListener('click', function() {
    var val = document.querySelector('input[name="defaultView"]:checked').value;
    localStorage.setItem(KEY, val);
    var msg = document.getElementById('save-msg');
    msg.hidden = false;
    setTimeout(function() { msg.hidden = true; }, 2000);
  });
})();
</script>
