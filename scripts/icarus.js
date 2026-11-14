/* global hexo */
'use strict';

const { escapeHTML, stripHTML } = require('hexo-util');
const moment = require('moment');

hexo.extend.injector.register('head_end', '<link rel="stylesheet" href="/css/blue.css">');
hexo.extend.injector.register('body_end', '<script src="/js/blog.js"></script>');

hexo.extend.filter.register('before_post_render', data => {
  if (data.layout === 'cookie') data.layout = 'post';
  if (data.top && !data.sticky) data.sticky = Number(data.top) || 1;
  if (data.img && !data.thumbnail) data.thumbnail = data.img;
  if (data.cover === true) data.cover = data.coverImg || data.img || null;
  return data;
});

hexo.extend.filter.register('after_post_render', data => {
  if (data.encrypt) {
    // Icarus otherwise builds a public TOC from hexo-blog-encrypt's plaintext origin.
    data.toc = false;
    data.indexing = false;
    data.origin = '';
    data.description = data.excerpt = data.more = '这是一篇加密文章，请输入密码阅读全文。';
  } else if (!data.excerpt && data.layout === 'post') {
    data.excerpt = `<p>${escapeHTML(stripHTML(data.content).trim().slice(0, 180))}…</p>`;
  }
  return data;
}, 2000);

hexo.extend.tag.register('blog_friends', () => {
  const friends = hexo.locals.get('data').friends || [];
  return '<div class="friend-list">' + friends.map(friend =>
    `<div class="friend"><img src="${escapeHTML(friend.avatar)}" alt="${escapeHTML(friend.name)}" loading="lazy" width="64" height="64" onerror="this.onerror=null;this.src='/lei.png'"><div><a href="${escapeHTML(friend.url)}" rel="noopener noreferrer" target="_blank">${escapeHTML(friend.name)}</a><p>${escapeHTML(friend.introduction)}</p></div></div>`
  ).join('') + '</div>';
});

hexo.extend.helper.register('blog_calendar', function () {
  const posts = this.site.posts.toArray();
  const end = moment().tz(this.config.timezone).startOf('day');
  const start = end.clone().subtract(1, 'year').startOf('week');
  const days = new Map();
  for (const post of posts) {
    const key = post.date.format('YYYY-MM-DD');
    if (!days.has(key)) days.set(key, []);
    days.get(key).push(post);
  }
  let cells = '';
  for (const day = start.clone(); day.isSameOrBefore(end); day.add(1, 'day')) {
    const key = day.format('YYYY-MM-DD');
    const entries = days.get(key) || [];
    const label = `${key}：${entries.length} 篇文章`;
    cells += entries.length
      ? `<a href="${this.url_for('archives/' + day.format('YYYY/MM') + '/')}" title="${label}" aria-label="${label}"></a>`
      : `<span title="${label}"></span>`;
  }
  return `<section class="card post-calendar" aria-label="文章日历"><div class="card-content"><h2 class="title is-5">文章日历</h2><p class="calendar-caption">${start.format('YYYY-MM-DD')} — ${end.format('YYYY-MM-DD')} · 蓝色表示有文章发布，点击查看当月归档</p><div class="calendar-scroll"><div class="calendar-days">${cells}</div></div></div></section>`;
});

hexo.extend.filter.register('before_generate', () => {
  // Wrap the packaged archive view through Hexo's view API, without editing the package.
  if (!hexo.theme.getView('archive-original')) {
    hexo.theme.views['archive-original'] = hexo.theme.views.archive;
    delete hexo.theme.views.archive;
    hexo.theme.setView('archive.ejs', '<%- blog_calendar() %><%- partial("archive-original") %>');
  }
});

hexo.extend.filter.register('after_init', () => {
  const insight = hexo.extend.generator.get('insight');
  hexo.extend.generator.register('insight', function (locals) {
    return insight.call(this, {
      ...locals,
      posts: locals.posts.filter(post => !post.encrypt && post.indexing !== false),
      pages: locals.pages.filter(page => !page.encrypt && page.indexing !== false)
    });
  });
});
