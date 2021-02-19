---
title: CSS奇淫技巧
date: 2021-02-03 18:00:13
tags:
    - CSS
    - 技术
categories: 
    - 技术分享
---

## 前言

在日常实现一些功能的时候，一些复杂的界面/交互需求往往能使用几行 CSS 来实现，再次做相关记录，以便之后检索。

### css 半圆画法（圆边框）

```css
/*右半圆*/
width: 9px;
height: 18px;
border-radius: 0 18px 18px 0;
/*background: #any;*/
border: 1px solid #ff4b33;
border-left: none;
```

### flex 布局下 space-between / space-around 最后一行左对齐

```css
/* 最后一项margin-right:auto */
.item:last-child {
  margin-right: auto;
}
```

### 使用 mask 或 clip-path 的时候同时显示阴影

~~box-shadow 无效~~

1. 在父元素上使用 filter 滤镜：drop-shadow

2. clip 或 mask 在源组件上，而不是在父组件上

3. drop-shadow 和 box-shadow 的区别：
   - box-shadow 为盒子模型下的阴影渲染
   - drop-shadow 会在非透明像素下投下阴影

```html
<span class="tag-wrap">
  <span class="tag"> Tag </span>
</span>
```

```css
.tag-wrap {
  filter: drop-shadow(-1px 6px 3px rgba(50, 50, 0, 0.5));
}
.tag {
  background: #fb8c00;
  color: #222;
  padding: 2rem 3rem 2rem 4rem;
  font: bold 32px system-ui;
  clip-path: polygon(30px 0%, 100% 0%, 100% 100%, 30px 100%, 0 50%);
}
```

### 图片宽高比自适应

父元素使用 padding 来撑开布局，子元素 absolute 定位宽高 100%

- 原理：padding 大小是相对于父元素的 width
