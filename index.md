---
layout: home
title: المقالات
---

{% assign articles = site.data.articles | sort: "date" | reverse %}

<section class="hero">
  <h1>{{ site.title }}</h1>
  <p>{{ site.description }}</p>
</section>

{% if articles == nil or articles.size == 0 %}
<p class="empty">لا توجد مقالات بعد. ستظهر المقالات هنا عندما تضاف من البوتات.</p>
{% else %}

{% assign all_tags = "" | split: "" %}
{% for article in articles %}{% for tag in article.tags %}{% assign all_tags = all_tags | push: tag %}{% endfor %}{% endfor %}
{% assign all_tags = all_tags | uniq | sort %}

<nav class="tag-bar" aria-label="الوسوم">
  <button class="tag-chip active" data-tag="all">الكل <span class="count">{{ articles.size }}</span></button>
  {% for tag in all_tags %}
    {% assign n = 0 %}{% for a in articles %}{% if a.tags contains tag %}{% assign n = n | plus: 1 %}{% endif %}{% endfor %}
    <button class="tag-chip" data-tag="{{ tag }}">#{{ tag }} <span class="count">{{ n }}</span></button>
  {% endfor %}
</nav>

<div class="articles">
{% for article in articles %}
<article class="card" data-tags="{{ article.tags | join: '|' }}">
  <header class="meta">
    <span class="source">{{ article.source }}</span>
    <span class="dot">•</span>
    <time datetime="{{ article.date }}">{{ article.date | date: "%Y-%m-%d" }}</time>
  </header>
  <h2>{% if article.url %}<a href="{{ article.url }}" target="_blank" rel="noopener">{{ article.title }}</a>{% else %}{{ article.title }}{% endif %}</h2>
  {% if article.summary %}<p class="summary">{{ article.summary }}</p>{% endif %}
  {% if article.content %}<div class="content">{{ article.content | markdownify }}</div>{% endif %}
  <footer class="card-footer">
    {% if article.tags %}
    <div class="tags">{% for tag in article.tags %}<button class="tag" data-tag="{{ tag }}">#{{ tag }}</button>{% endfor %}</div>
    {% endif %}
    {% if article.url %}<a class="read-more" href="{{ article.url }}" target="_blank" rel="noopener">اقرأ المصدر ←</a>{% endif %}
  </footer>
</article>
{% unless forloop.last %}<div class="divider" role="separator"><span></span></div>{% endunless %}
{% endfor %}
</div>
<p class="no-results" hidden>مفيش مقالات بالوسم ده.</p>
{% endif %}

<script src="{{ '/assets/js/tags.js' | relative_url }}"></script>
