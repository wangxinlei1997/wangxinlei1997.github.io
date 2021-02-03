---
title: CSS 奇淫技巧
date: 2021-02-03 18:00:13
tags:
---

## 前言

本文中记录了 js 的一些技巧/新特性

## 选择/反选对象中的元素

```js
function pick(obj, keys) {
  return keys
    .map((k) => (k in obj ? { [k]: obj[k] } : {}))
    .reduce((res, o) => Object.assign(res, o), {});
}

const row = {
  "accounts.id": 1,
  "client.name": "John Doe",
  "bank.code": "MDAKW213",
};

const table = [
  row,
  { "accounts.id": 3, "client.name": "Steve Doe", "bank.code": "STV12JB" },
];

pick(row, ["client.name"]); // 取到了 client name

table.map((row) => pick(row, ["client.name"])); // 取到了一系列 client name

function reject(obj, keys) {
  return Object.keys(obj)
    .filter((k) => !keys.includes(k))
    .map((k) => ({ [k]: obj[k] }))
    .reduce((res, o) => Object.assign(res, o), {});
}

// 或者, 利用 pick
function reject(obj, keys) {
  const vkeys = Object.keys(obj).filter((k) => !keys.includes(k));
  return pick(obj, vkeys);
}

reject({ a: 2, b: 3, c: 4 }, ["a", "b"]); // => {c: 4}
```

## 只执行一次的函数（闭包法）

```js
function once(fn) {
  let called = false;
  return function () {
    if (!called) {
      called = true;
      fn.apply(this, arguments);
    }
  };
}
```

## 相同参数的函数缓存结果

```js
function cached(fn) {
  const cache = Object.create(null);
  return function cachedFn(str) {
    if (!cache[str]) {
      let result = fn(str);
      cache[str] = result;
    }
    return cache[str];
  };
}
```
