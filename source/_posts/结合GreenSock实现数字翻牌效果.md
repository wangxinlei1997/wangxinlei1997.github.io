---
title: 结合GreenSock实现数字翻牌效果
date: 2023-03-23 17:59:29
tags:
  - 前端
  - GreenSock
  - 动效
  - Gsap
  - Vue
categories:
  - 技术分享
---

# 引言
> &emsp;&emsp;好久没更新博客了，最近得空把githubPage挂到了cloudflare的CDN上~~（别问我为什么，问就是他免费且我穷）~~。顺便写一篇文章，测试测试速度。

&emsp;&emsp;最近在做一个项目，需要实现一个数字翻牌的效果。于是就想到使用 GreenSock 这个库。GreenSock 是一个强大的动画库，可以实现很多复杂的动画效果，而且它的 API 也非常丰富，所以就用它来实现了这个数字翻牌的效果。

# 实现效果

![数字翻牌效果](https://i.328888.xyz/2023/03/24/i44YgA.gif)

# 思路解析

## 设计思路

1. 视图结构
&emsp;&emsp;可以看见，我们希望实现的效果是中间状态(如从 0->9)的多层翻牌效果。为了便于理解，我这里先使用只有一个中间过程的情况来进行分析。<br>
<div style="display:flex;flex-direction:row;align-items:center;justify-content:space-around">
<img src="/images/numberFlip/front.png" style="height:300px" alt="正面"/>
<img src="/images/numberFlip/back.png" style="height:300px" alt="反面"/>
</div>

&emsp;&emsp;上面两张图分别展示了从`0`翻动至`1`的结束状态过程。可以看到，从`0`翻至`1`，其视图主要分为 2 个主要部分，即`底部`和`顶部`（可以想象一下翻书的 3d 模型）。

&emsp;&emsp;`底部`的上半部分为`1`的上半部分，下半部分则为`0`的下半部分。

&emsp;&emsp;`顶部`则可以想象为一个具有正反面的 50%高度卡片，并互相叠在一起。设中间的断口为旋转轴，则中间部分(`顶部`)的正反面分别是`0`的上半部分和`1`的下半部分。

2. 动画思路
   &emsp;&emsp;想象一下翻牌的过程，可以知道`底部`是不需要做动画的。需要做动画的只有中间的`顶部`部分，即`顶部`的正反面在翻牌过程中需要做动画。从初始的`0`翻至`1`的过程中，`顶部`的正反面需要做同步动画，即从上部以中间空隙为 X 轴，向下翻转 180 度。
3. 多张中间层动画思路
   &emsp;&emsp;如果有多张中间层，那么就需要在每张中间层上都做动画。由于需要展现错开翻牌的效果，所以每张中间层的动画需要错开一定的时间。
   &emsp;&emsp;另外，由于多张中间层的存在，所以需要考虑到层级的问题。
   > - 在动画执行到一半（翻转到 90 度）以前：数字小的层级高于数字大的层级。
   > - 在动画执行到一半以后：数字大的层级高于数字小的层级。

## 实现过程

1. 数据结构
   | 属性 | 类型 | 说明 |
   | :--- | :--- | :--- |
   | value | Number | 需要展示的数字（组件入参） |
   | processValue | Array | 需要展示的数字的每一位过程数字（组件内部计算值） |
   | uniqueId | String | 组件唯一标识（组件内部计算值） |
2. 视图结构
   主要设计思路和层级已经在注释中给出。

```html
<!-- 最外层容器，用于给出uniqId来防止gsap动画冲突 -->
<div class="container-nf" :class="[uniqueId]">
  <!-- 底部的上半部分 -->
  <div class="flip-item flip-item__base flip-item__base--top">
    <span> {{ processValue.slice(-1)[0] }} </span>
  </div>
  <!-- 底部的下半部分 -->
  <div class="flip-item flip-item__base flip-item__base--bottom">
    <span> {{ processValue.slice(0, 1)[0] }} </span>
  </div>
  <!-- 中间的过程部分 -->
  <template v-for="(i, index) in processValue.slice(0, -1)">
    <!-- 中间的过程部分的正面 -->
    <div
      :key="`${index + 1}-front-${i}`"
      :id="`over-${index + 1}-front`"
      class="flip-item flip-item__over flip-item__over--front"
      :style="{ zIndex: 15 - index }"
    >
      <span> {{ i }} </span>
    </div>
    <!-- 中间的过程部分的反面 -->
    <div
      :key="`${index + 1}-back-${i}`"
      :id="`over-${index + 1}-back`"
      class="flip-item flip-item__over flip-item__over--back"
      :style="{ zIndex: 15 - index }"
    >
      <span> {{ processValue[index + 1] }} </span>
    </div>
  </template>
</div>
```

注意，下面的 css 中，可根据个人习惯来实现，不一定是上面我给出的写法。其中比较重要点有：
[transform-origin](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform-origin)的设置，这个属性决定了元素翻转的轴心。
[backface-visibility](https://developer.mozilla.org/zh-CN/docs/Web/CSS/backface-visibility)的设置，这个属性决定了元素翻转后的背面是否可见。

```scss
.container-nf {
  position: relative;

  perspective: 400px;
}

.flip-item {
  font-family: Bebas;
  font-size: 40px;

  // 对文字的溢出做隐藏
  overflow-y: hidden;

  width: 100%;
  // 留出中间的空隙
  height: calc(100% / 2 - 0.5px);

  color: #409eff;
  background-color: #d3d3d3;

  // 上半部分的背景和字体颜色
  &__base--top,
  &__over--front {
    border-radius: 3px 3px 0 0;
    background-color: #fafafa;
    // 控制字体便宜，使其垂直居中
    span {
      position: relative;
      top: 14px;
    }
  }

  // 下半部分的背景和字体颜色
  &__base--bottom,
  &__over--back {
    border-radius: 0 0 3px 3px;
    background-color: #fff;

    span {
      position: relative;
      bottom: 2.4px;
    }
  }

  // 底部
  &__base {
    position: absolute;

    // 底部上半部分
    &--top {
      line-height: 100%;

      top: 0;

      box-shadow: 0 0 2px 0 rgba(102, 102, 102, 0.25);
    }

    // 底部下半部分
    &--bottom {
      // 行高为0就直接在卡片里显示文字的下半不分了
      line-height: 0;

      bottom: 0;

      box-shadow: 0 2px 2px 0 rgba(102, 102, 102, 0.25);
    }
  }

  // 顶部
  &__over {
    position: absolute;
    z-index: 2;

    // 重要！背面不可见
    backface-visibility: hidden;

    //顶部正面
    &--front {
      line-height: 100%;

      top: 0;

      transform: rotateX(0deg);
      // 使其以中间空隙处为轴翻转
      transform-origin: 50% calc(100% + 0.5px);
    }

    &--back {
      line-height: 0;

      bottom: 0;
      // 给出初始翻转角度，让它被藏在正面的背后
      transform: rotateX(180deg);
      // 使其以中间空隙处为轴翻转
      transform-origin: 50% -0.5px;
    }
  }
}
```

3. 逻辑部分

- 工具函数-计算中间值

```js
/**
 * @description 计算中间值
 * @param {Number} start 开始值
 * @param {Number} end 结束值
 * @return {Array} 中间值
 * @example
 * getProcessValues(1, 5); // [1, 2, 3, 4, 5]
 * @example
 * getProcessValues(0, 0); // [0]
 * @example
 * getProcessValues(9, 1); // [9, 0, 1]
 */
function getProcessValues(start, end) {
  const result = [];
  if (start <= end) {
    for (let i = start; i <= end; i++) {
      result.push(i);
    }
  } else {
    for (let i = start; i <= end + 10; i++) {
      result.push(i % 10);
    }
  }
  return result;
}
```

- 主要逻辑

```js
  watch: {
    value(val, oldVal) {
      this.$nextTick(() => {
        this.processValue = getProcessValues(oldVal, val)
        this.$nextTick(() => {
          // 遍历所有过程值
          this.processValue.slice(0, -1).forEach((value, index) => {
            // 获取当前索引的正面和背面元素
            const front = document.querySelector(`.${this.uniqueId} #over-${index + 1}-front`)
            const back = document.querySelector(`.${this.uniqueId} #over-${index + 1}-back`)
            // 设置初始位置和层级，其中数字越小的层级越大（在顶部）（默认值的变化从小到大）
            gsap.set(front, {
              rotationX: 0,
              zIndex: 15 - index,
              filter: 'drop-shadow(0px 0px 0px rgba(102, 102, 102, 0.25))'
            })
            gsap.set(back, {
              rotationX: 180,
              zIndex: 15 - index,
              filter: 'drop-shadow(0px 0px 0px rgba(102, 102, 102, 0.25))'
            })
            // 正面动画
            gsap.to(front, {
              // 根据索引设置动画延迟，实现逐个翻转的效果
              delay: 0.1 * index,
              keyframes: [
                // 关键帧，分为两段，第一段是从0度旋转到-90度，第二段是从-90度旋转到-180度，由于翻到下面就不需要阴影和透明度，所以这里采用关键帧的方式
                { duration: 0.5, ease: 'power3.in', rotationX: -90, opacity: 0.9, filter: 'drop-shadow(0px 0px 2px rgba(102, 102, 102, 0.25))' },
                { duration: 0.5, ease: 'power3.out', rotationX: -180, opacity: 1 }
              ],
              onUpdate: () => {
                const rotationX = gsap.getProperty(front, 'rotationX')
                // 当旋转角度达到-90度时，将当前元素的层级设置为当前索引+2（越大的数字层级越大）
                if (rotationX <= -90) {
                  gsap.set(front, {
                    zIndex: index + 2,
                  })
                }
              }
            })
            // 背面动画
            gsap.to(back, {
              delay: 0.1 * index,
              keyframes: [
                { duration: 0.5, ease: 'power3.in', rotationX: 90, opacity: 0.9, filter: 'drop-shadow(0px 0px 0px rgba(102, 102, 102, 0.25))' },
                { duration: 0.5, ease: 'power3.out', rotationX: 0, opacity: 1 }
              ],
              onUpdate: () => {
                const rotationX = gsap.getProperty(back, 'rotationX')
                // 同上（由于dom结构，背面就是默认在正面的后面一层的，不需要单独设置特殊值来控制了）
                if (rotationX >= 90) {
                  gsap.set(back, {
                    zIndex: index + 2
                  })
                }
              }
            })
          })
        })
      })
    }
  }

```

# 尾声

1. 其实网上有很多类似的文章和工具类库，但是我没有找到使用 GreenSock 的方案，所以就自己写了一个，希望能帮到大家。
2. 字体大小、位置等可能需要根据实际情况做调整。
3. GreenSock真的很好用，API也很丰富，推荐大家使用。