---
title: 使用postcss-px-to-viewport进行vw响应式开发
date: 2026-01-26 14:16:38
tags: AI Generated POST
---

# 使用 @pandaxiong1992/postcss-px-to-viewport 进行样式 vw 适配的配置说明

## 背景

在大屏、可视化等前端项目中，常用 `postcss-px-to-viewport` 插件将 px 单位自动转换为 vw 单位，实现响应式布局。但官方插件存在 `include` 配置失效等 bug，导致部分目录下的样式无法精准转换。

## 解决方案

本项目采用社区 fork 版本 `@pandaxiong1992/postcss-px-to-viewport`，该版本修复了官方插件 `include` 选项无效的问题，能更灵活地控制哪些文件/目录需要进行 px 转 vw 的转换。

> ⚠️ 注意：**请勿使用官方的 `postcss-px-to-viewport`，否则 `include` 配置将无法生效，导致样式转换范围异常！**

## 配置示例

在 `vue.config.js` 中：

```js
const PostcssPxToViewport = require('@pandaxiong1992/postcss-px-to-viewport')

// ...
css: {
  loaderOptions: {
    postcss: {
      postcssOptions: {
        plugins: [
          PostcssPxToViewport({
            // 仅转换 yunjing-report-panel 目录下的样式
            include: [/[/\\]yunjing-report-panel[/\\]/],
            viewportWidth: 1920,
            unitPrecision: 5,
            propList: ['*'],
            viewportUnit: 'vw',
            fontViewportUnit: 'vw',
            selectorBlackList: [],
            minPixelValue: 1,
            mediaQuery: false,
            replace: true
          }),
          // 如果需要对其他属性进行不同的转换，可以再添加一个插件实例
          PostcssPxToViewport({
            include: [/[/\\]yunjing-report-panel[/\\]/],
            viewportWidth: 1080,
            unitPrecision: 5,
            unitToConvert: ['ph'],
            propList: ['*'],
            viewportUnit: 'vh',
            fontViewportUnit: 'vh',
            selectorBlackList: [],
            minPixelValue: 1,
            mediaQuery: false,
            replace: true
          })
        ]
      }
    }
  }
}
```

## 关键配置说明

- `@pandaxiong1992/postcss-px-to-viewport`：必须使用该包，**不要用官方原版**。
- `include`：通过正则表达式，仅转换指定目录（如 `/yunjing-report-panel/`）下的样式文件，避免全局污染。
- 其他参数如 `viewportWidth`、`viewportUnit` 等可根据设计稿和需求调整。

## 常见问题

- **Q: 为什么不用官方的 `postcss-px-to-viewport`？**
  - A: 官方包的 `include` 配置无效，无法精准控制转换范围，容易导致全局样式被误转。
- **Q: 如何确认当前用的是社区 fork 版？**
  - A: 检查 `package.json`，应为 `@pandaxiong1992/postcss-px-to-viewport`，不是 `postcss-px-to-viewport`。

## 参考

- [@pandaxiong1992/postcss-px-to-viewport](https://www.npmjs.com/package/@pandaxiong1992/postcss-px-to-viewport)
- [官方 postcss-px-to-viewport](https://github.com/evrone/postcss-px-to-viewport)

---

如需扩展更多目录或自定义转换规则，建议优先查阅社区 fork 版文档。
