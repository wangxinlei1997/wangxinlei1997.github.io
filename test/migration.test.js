'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const frontMatter = require('hexo-front-matter');
const { stripHTML } = require('hexo-util');
const root = path.join(__dirname, '..');
const output = path.join(root, 'public');
const files = fs.readdirSync(output, { recursive: true }).filter(file => fs.statSync(path.join(output, file)).isFile());
const read = file => fs.readFileSync(path.join(output, file), 'utf8');
const pages = files.filter(file => file.endsWith('.html'));

test('all pre-migration pages and article asset routes remain available', () => {
  for (const file of require('./fixtures/legacy-routes.json')) {
    assert.ok(fs.existsSync(path.join(output, file)), `Missing legacy route: ${file}`);
  }
});

test('local images, scripts and styles resolve on every generated page', () => {
  for (const file of pages) {
    const html = read(file);
    const references = [...html.matchAll(/<(?:img|script|link)\b[^>]*?\b(?:src|href)="([^"]+)"/g)].map(match => match[1]);
    for (const reference of references) {
      const url = new URL(reference.replaceAll('&amp;', '&'), `https://www.xiaob.work/${file}`);
      if (url.origin !== 'https://www.xiaob.work') continue;
      const local = decodeURIComponent(url.pathname).replace(/^\//, '');
      assert.ok(fs.existsSync(path.join(output, local)), `Broken asset in ${file}: ${local}`);
    }
  }
});

test('encrypted body, password and headings never appear in public files or search', () => {
  const sourceDir = path.join(root, 'source/_posts');
  const protectedPosts = fs.readdirSync(sourceDir).filter(file => file.endsWith('.md'))
    .map(file => frontMatter.parse(fs.readFileSync(path.join(sourceDir, file), 'utf8')))
    .filter(post => post.password);
  assert.ok(protectedPosts.length > 0);
  const publicText = files.filter(file => /\.(html|xml|json)$/.test(file)).map(read).join('\n');
  const search = read('content.json') + read('search.xml');
  for (const post of protectedPosts) {
    const probes = post._content.split('\n').map(line => stripHTML(line).replace(/^#+\s*/, '').trim()).filter(line => line.length > 15);
    assert.ok(probes.length > 0);
    for (const probe of probes) assert.equal(publicText.includes(probe), false, 'Encrypted content leaked');
    assert.equal(publicText.includes(String(post.password)), false, 'Password leaked');
    assert.equal(search.includes(post.title), false, 'Protected post is in search index');
  }
  const encryptedPage = pages.find(file => read(file).includes('id="hexo-blog-encrypt"'));
  assert.ok(encryptedPage, 'Encrypted form missing');
  assert.equal(read(encryptedPage).includes('id="toc"'), false, 'Public encrypted TOC');
});

test('blue theme, navigation, search, archive calendar and article features are present', () => {
  const home = read('index.html');
  assert.ok(home.includes('/css/m3e.css') && home.includes('/css/blue.css'));
  assert.ok(home.includes('data-appearance="auto"'));
  for (const route of ['/tags/', '/categories/', '/archives/', '/about/', '/friends/', 'https://xiaob.work/tools']) assert.ok(home.includes(route));
  assert.ok(home.includes('insight.js'));
  assert.ok(read('archives/index.html').includes('calendar-days'));
  assert.ok(read('friends/index.html').includes("King&#39;s Studio") || read('friends/index.html').includes("King's Studio"));
  assert.ok(read('friends/index.html').includes("this.onerror=null;this.src='/lei.png'"));
  const about = read('about/index.html');
  assert.ok(about.includes('mid-data-set') && about.includes('wangxinlei1997.github.io'));
  assert.doesNotMatch(about, /njcm\.tech/);
  assert.match(about, /aria-label="Agent Harneess 开发" value="80" max="100"/);
  assert.match(about, /aria-label="AI 全栈开发" value="90" max="100"/);
  assert.equal((about.match(/class="skill-progress"/g) || []).length, 8);
  assert.ok(pages.some(file => read(file).includes('id="toc"')));
  assert.ok(pages.some(file => read(file).includes('data-share-provider="web_share"')));
  assert.ok(pages.some(file => read(file).includes('class="highlight')));
  const css = read('css/blue.css');
  assert.match(css, /--m3-h:\s*250/);
  assert.match(css, /--m3-tertiary:\s*var\(--m3-primary\)/);
});

test('music, visitor counters and analytics are absent from served pages', () => {
  for (const file of pages) {
    assert.doesNotMatch(read(file), /aplayer|meting|busuanzi|google-analytics\.com|hm\.baidu\.com/i, file);
  }
});

test('legacy post flags and encrypted metadata use safe Icarus equivalents', () => {
  const filters = new Map();
  const fakeHexo = { extend: {
    injector: { register() {} }, tag: { register() {} }, helper: { register() {} },
    filter: { register(name, callback, priority) { filters.set(name, { callback, priority }); } }
  } };
  require('node:vm').runInNewContext(fs.readFileSync(path.join(root, 'scripts/icarus.js'), 'utf8'), { hexo: fakeHexo, require });
  const migrate = filters.get('before_post_render').callback;
  const post = migrate({ layout: 'cookie', top: true, cover: true, coverImg: '/cover.jpg', img: '/thumb.jpg' });
  assert.equal(post.layout, 'post');
  assert.equal(post.sticky, 1);
  assert.equal(post.cover, '/cover.jpg');
  assert.equal(post.thumbnail, '/thumb.jpg');
  const secure = filters.get('after_post_render');
  assert.ok(secure.priority > 1000, 'Must run after the encryption plugin');
  const encrypted = secure.callback({ encrypt: true, origin: 'private fixture', excerpt: 'private fixture', description: 'private fixture' });
  assert.equal(encrypted.origin, '');
  assert.equal(encrypted.toc, false);
  assert.equal(encrypted.indexing, false);
  assert.ok(!JSON.stringify(encrypted).includes('private fixture'));
});
