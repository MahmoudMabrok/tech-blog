---
layout: home
title: المقالات
---

{% assign articles = site.data.articles | sort: "date" | reverse %}

<section class="hero">
  <h1>{{ site.title }}</h1>
  <p>{{ site.description }}</p>
  <div class="hero-stats">
    <span class="stat">📚 <b>{{ articles.size }}</b> مقالة</span>
    <span class="stat read-stat" hidden>✓ قريت <b class="read-count">0</b> من {{ articles.size }}</span>
  </div>
</section>

{% if articles == nil or articles.size == 0 %}
<p class="empty">لا توجد مقالات بعد. ستظهر المقالات هنا عندما تضاف من البوتات.</p>
{% else %}

{% assign all_tags = "" | split: "" %}
{% assign all_cats = "" | split: "" %}
{% for article in articles %}
  {% if article.category %}{% assign all_cats = all_cats | push: article.category %}{% endif %}
  {% for tag in article.tags %}{% assign all_tags = all_tags | push: tag %}{% endfor %}
{% endfor %}
{% assign all_tags = all_tags | uniq | sort %}
{% assign all_cats = all_cats | uniq | sort %}

<div class="filters">
  <nav class="cat-bar" aria-label="التصنيفات">
    <button class="cat-tab active" data-cat="all">كل التصنيفات <span class="count">{{ articles.size }}</span></button>
    {% for cat in all_cats %}
      {% assign n = articles | where: "category", cat | size %}
      <button class="cat-tab" data-cat="{{ cat }}">{{ cat }} <span class="count">{{ n }}</span></button>
    {% endfor %}
  </nav>
  <nav class="tag-bar" aria-label="الوسوم">
    <button class="tag-chip active" data-tag="all">كل الوسوم</button>
    {% for tag in all_tags %}
      <button class="tag-chip" data-tag="{{ tag }}">#{{ tag }}</button>
    {% endfor %}
  </nav>
</div>

<div class="articles">
{% for article in articles %}
<article class="card" data-id="{{ article.url | default: article.title | escape }}" data-tags="{{ article.tags | join: '|' }}" data-cat="{{ article.category }}">
  <header class="meta">
    {% if article.category %}<button class="category" data-cat="{{ article.category }}">{{ article.category }}</button>{% endif %}
    <span class="source">{{ article.source }}</span>
    <span class="read-badge">✓ اتقرأت</span>
    <span class="dot">•</span>
    <time datetime="{{ article.date }}">{{ article.date | date: "%Y-%m-%d" }}{% if article.date contains "T" %} · {{ article.date | date: "%H:%M" }}{% endif %}</time>
  </header>
  {% assign imgs = article.images %}
  {% if imgs == nil or imgs.size == 0 %}{% if article.image %}{% assign imgs = article.image | split: "|" %}{% endif %}{% endif %}
  {% if imgs and imgs.size > 0 %}
  <figure class="card-cover">
    {% if article.url %}<a href="{{ article.url }}" target="_blank" rel="noopener">{% endif %}<img src="{{ imgs[0] | relative_url }}" alt="{{ article.title | escape }}" loading="lazy" decoding="async">{% if article.url %}</a>{% endif %}
  </figure>
  {% if imgs.size > 1 %}
  <div class="card-gallery" dir="rtl">
    {% for im in imgs offset:1 %}<a href="{{ im | relative_url }}" target="_blank" rel="noopener" title="كبّر الصورة"><img src="{{ im | relative_url }}" alt="{{ article.title | escape }} ({{ forloop.index | plus: 1 }})" loading="lazy" decoding="async"></a>{% endfor %}
  </div>
  {% endif %}
  {% endif %}
  <h2>{% if article.url %}<a href="{{ article.url }}" target="_blank" rel="noopener">{{ article.title }}</a>{% else %}{{ article.title }}{% endif %}</h2>
  {% assign sum_ar = article.summary_ar | default: article.summary %}
  {% assign sum_en = article.summary_en %}
  {% if sum_ar or sum_en %}
  <div class="view-switch" role="tablist">
    <button class="view-btn active" data-view="full">البوست كامل</button>
    {% if sum_ar %}<button class="view-btn" data-view="ar">الملخص العربي</button>{% endif %}
    {% if sum_en %}<button class="view-btn" data-view="en">English Summary</button>{% endif %}
  </div>
  {% endif %}
  <div class="view view-full content">{{ article.content | markdownify }}</div>
  {% if sum_ar %}<div class="view view-ar summary-box" hidden>{{ sum_ar | newline_to_br | markdownify }}</div>{% endif %}
  {% if sum_en %}<div class="view view-en summary-box" dir="ltr" lang="en" hidden>{{ sum_en | newline_to_br | markdownify }}</div>{% endif %}
  <footer class="card-footer">
    {% if article.tags %}
    <div class="tags">{% for tag in article.tags %}<button class="tag" data-tag="{{ tag }}">#{{ tag }}</button>{% endfor %}</div>
    {% endif %}
    {% if article.url %}<a class="read-more" href="{{ article.url }}" target="_blank" rel="noopener">المحتوى الأصلي ↗</a>{% endif %}
  </footer>
</article>
{% unless forloop.last %}<div class="divider" role="separator"><span></span></div>{% endunless %}
{% endfor %}
</div>
<p class="no-results" hidden>مفيش مقالات بالفلتر ده.</p>
{% endif %}

<div class="visitors">
  <span>عدد الزيارات</span>
  <img src="https://hits.sh/mahmoudmabrok.github.io/tech-blog.svg?style=flat-square&label=%F0%9F%91%81&color=4f46e5" alt="عدد الزيارات" loading="lazy">
</div>

<script src="{{ '/assets/js/tags.js' | relative_url }}?v={{ site.time | date: '%s' }}"></script>
