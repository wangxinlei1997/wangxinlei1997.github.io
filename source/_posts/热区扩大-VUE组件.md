---
title: 热区扩大-Vue组件
date: 2021-02-20 15:55:41
tags:
  - 技术
  - Vue
  - 轮子
categories:
  - 轮子
---

## 废话不多说直接上代码

```html
<template>
  <view class="parent">
    <slot></slot>
    <view :class="['expand',area]" @click.stop="emit"></view>
  </view>
</template>

<script>
  export default {
    name: "ExpandClickArea",
    props: {
      area: {
        //small,normal,big,large
        default: "normal",
        type: String,
      },
    },
    methods: {
      emit() {
        this.$emit("expandOnClick");
      },
    },
  };
</script>

<style scoped>
  .parent {
    position: relative;
    overflow-x: visible;
    overflow: visible;
  }
  .expand {
    position: absolute;
  }
  .normal {
    top: -10px;
    right: -10px;
    bottom: -10px;
    left: -10px;
  }
  .small {
    top: -5px;
    right: -5px;
    bottom: -5px;
    left: -5px;
  }
  .big {
    top: -15px;
    right: -15px;
    bottom: -15px;
    left: -15px;
  }
  .large {
    top: -20px;
    right: -20px;
    bottom: -20px;
    left: -20px;
  }
</style>
```
