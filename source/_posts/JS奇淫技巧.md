---
title: JS奇淫技巧
date: 2021-02-03 18:00:13
tags:
    - JS
    - JavaScript
    - 技术
categories: 
    - 技术分享
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

## compose嵌套式函数链式调用优化

- 依次执行函数的时候，往往使用以下基本写法

  ```js
  const res = fun3(fun2(fun1('arg')))
  ```

  这种写法一般能满足基本需要。但是如果在嵌套层数更多的情况下，代码就会变得很复杂、难以维护。

- 在Redux内部compose的写法如下

  ```js
  function compose(...funs) {
      return funcs.reduce((a, b) => (...args) => a(b(...args)));
  }
  ```

  ```js
  const newfunc = compose(fun3,fun2,fun1)
  const res = newfunc('arg')
  ```

  

  在此函数中，重点为`reduce` 方法。在使用此方法时，将会依次选用第1个、第2个；第2个、第3个fun，并用后一个函数的执行结果作为前一个的参数，从而实现需要的依次执行效果。

  在本例中，执行的顺序如下：

  1. `fun3(fun2(...args)) -> fun3(fun2(fun1(...args)))`