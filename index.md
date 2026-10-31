---
layout: home
title: المقالات
---

{% assign articles = site.data.articles | sort: "date" | reverse %}

{% if articles == nil or articles.size == 0 %}
<p class="empty">لا توجد مقالات بعد. ستظهر المقالات هنا عندما تضاف من البوتات.</p>
{% else %}
<div class="articles">
{% for article in articles %}
<article class="card">
  <div class="meta">
    <span class="date">{{ article.date | date: "%Y-%m-%d" }}</span>
    <span class="source">{{ article.source }}</span>
  </div>
  <h2>{% if article.url %}<a href="{{ article.url }}" target="_blank" rel="noopener">{{ article.title }}</a>{% else %}{{ article.title }}{% endif %}</h2>
  {% if article.summary %}<p class="summary">{{ article.summary }}</p>{% endif %}
  {% if article.content %}<div class="content">{{ article.content | markdownify }}</div>{% endif %}
  {% if article.tags %}
  <div class="tags">{% for tag in article.tags %}<span class="tag">{{ tag }}</span>{% endfor %}</div>
  {% endif %}
</article>
{% endfor %}
</div>
{% endif %}
