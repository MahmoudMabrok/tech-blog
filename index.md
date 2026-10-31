---
layout: home
title: المقالات
---

# أحدث المقالات التقنية

{% for article in site.data.articles %}
<div class="article" style="margin-bottom: 2em; padding: 1em; border-bottom: 1px solid #eee;">
  <h2>{{ article.title }}</h2>
  <p><small>{{ article.date }} | المصدر: {{ article.source }}</small></p>
  <div>{{ article.content | markdownify }}</div>
</div>
{% endfor %}

{% if site.data.articles.size == 0 %}
<p>لا توجد مقالات بعد.</p>
{% endif %}
