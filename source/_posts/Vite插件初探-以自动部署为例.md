---
title: Vite插件初探-以自动部署为例
date: 2022-07-20 11:23:28
tags:
  - 技术
  - Vue3
  - Vite
---

# 背景

之前写过 Vue(Webpack)的自动打包配置，现在由于新项目使用了 Vite+Vue3+TS 的最新技术栈，旧版写法不通用了，这里重新针对 vite 写一下新脚本，并顺便了解一下 vite 脚本的基本写法。

# 了解 Vite 脚本

## 1. 插件配置(使用)

在`vite.config.js`中的 plugins 中，使用数组形式配置。

```js
// vite.config.js
import vitePlugin from "vite-plugin-feature";
import rollupPlugin from "rollup-plugin-feature";

export default defineConfig({
  plugins: [vitePlugin(), rollupPlugin()],
});
```

注意到，这里的插件一般指函数，并通过函数参数的形式传递必要参数。

## 2. 钩子

### 2.1 通用钩子(Rollup)

以下钩子在服务器启动时被调用：
`options`
`buildStart`
以下钩子会在每个传入模块请求时被调用：
`resolveId`
`load`
`transform`
以下钩子在服务器关闭时被调用：
`buildEnd`
`closeBundle`
请注意`moduleParsed`钩子在开发中是 不会 被调用的，因为 Vite 为了性能会避免完整的 AST 解析。

## 3 情景应用

`apply`字段表示此插件在哪种情况被调用。可选值：`serve`,`build`

# 自动部署插件

## 1. 环境变量的配置

用来储存 rsync 同步脚本

```bash
#.env
VITE_RSYNC='/usr/bin/rsync --archive --verbose --compress --delete -e  "ssh -i ~/.ssh/id_rsa" /Users/bryan/workspace/radar-screen/dist/ njcm@192.168.101.206:/home/njcm/AppService/h5/radar-screen/'
```

## 2. 编写插件主体

```typescript
/*
 * @Author: 王欣磊
 * @Date: 2022-07-20 10:03:40
 * @LastEditors: 王欣磊
 * @LastEditTime: 2022-07-20 11:34:58
 * @Description:
 * @FilePath: /radar-screen/src/plugins/runNode.ts
 */
import { exec } from "child_process";
// 脚本和钩子
export default function runNode({
  node,
  when,
}: {
  node?: string;
  when: "buildStart" | "buildEnd";
}) {
  return {
    name: "run-node",
    apply: "build",
    [when]() {
      try {
        node &&
          exec(node, (e, s) => {
            if (!e) {
              console.log("\n✅ 部署成功" + s);
            } else {
              console.error(e);
            }
          });
      } catch (err) {
        console.error(err);
      }
    },
  };
}
```

## 3. 插件使用

```ts
// vite.config.ts
import { defineConfig, loadEnv } from 'vite'
// ...
    plugins: [vue(), { ...runNode({ node: env.VITE_RSYNC, when: 'buildEnd' }), apply: 'build' },],
// ...
```
