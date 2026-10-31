---
layout: home
title: المقالات
---

# أحدث المقالات التقنية

{% for article in site.data.articles %}
<div class="article">
  <h2>{{ article.title }}</h2>
  <p><small>{{ article.date }} | المصدر: {{ article.source }}</small></p>
  <div>{{ article.content | markdownify }}</div>
</div>
{% endfor %}

{% if site.data.articles == nil or site.data.articles.size == 0 %}
<p>لا توجد مقالات بعد. ستظهر المقالات هنا عندما تضاف من البوتات.</p>
{% endif %}
