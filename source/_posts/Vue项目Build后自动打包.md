---
title: Vue项目Build后自动打包
date: 2021-12-14 15:39:04
tags:
  - 技术
  - Vue
  - WebPack
---

## 1. 安装依赖

```bash
npm install filemanager-webpack-plugin
```

## 2. vue.config.js 配置

```javascript
const FileManagerPlugin = require('filemanager-webpack-plugin')
...
// isProd 一般为环境判断 如 process.env.NODE_ENV === 'production'
isProd &&
  plugins.push(
    new FileManagerPlugin({
      events: {
        onEnd: {
          // 首先先删除之前的文件
          delete: ['./dist.zip'],
          // 压缩 源->目的地
          archive: [
            {
              source: path.join(__dirname, './dist'),
              destination: path.join(__dirname, './dist.zip')
            }
          ]
        }
      }
    })
  )
...
const vueConfig = {
  ...
  configureWebpack: {
    ...
    plugins,
    ...
  }
  ...
}
```

## 3. filemanager-webpack-plugin 简易教程

> [Github](https://github.com/gregnb/filemanager-webpack-plugin#readme)

### 1. Options

```JavaScript
new FileManagerPlugin({
  events: {
    onStart: {}, //打包前
    onEnd: {}, //打包结束后
  },
  runTasksInSeries: false,
  runOnceInWatchMode: false,
});
```

### 2. Actions

- Copy
  - source[string] - 源(文件/目录/glob)
  - destination[string] - 文件/目录
  - options ['object`] - copy options
    - flat: [Boolean]
    - preserveTimestamps: [Boolean]
    - overwite: [Boolean]
  - globOptions [object] - options to forward to glob options
- Delete
- Move
  - source[string] - a file or a directory or a glob
  - destination[string] - a file or a directory.
- Mkdir
- Archive
  - source[string] - a file or a directory or a glob
  - destination[string] - a file.
  - format[string] - Optional. Defaults to extension in destination filename.
  - options[object] - Refer https://www.archiverjs.com/archiver

### 3. 官方示例

```javascript
// webpack.config.js:

const FileManagerPlugin = require("filemanager-webpack-plugin");

export default {
  // ...rest of the config
  plugins: [
    new FileManagerPlugin({
      events: {
        onEnd: {
          copy: [
            { source: "/path/fromfile.txt", destination: "/path/tofile.txt" },
            { source: "/path/**/*.js", destination: "/path" },
          ],
          move: [
            { source: "/path/from", destination: "/path/to" },
            { source: "/path/fromfile.txt", destination: "/path/tofile.txt" },
          ],
          delete: ["/path/to/file.txt", "/path/to/directory/"],
          mkdir: ["/path/to/directory/", "/another/directory/"],
          archive: [
            { source: "/path/from", destination: "/path/to.zip" },
            { source: "/path/**/*.js", destination: "/path/to.zip" },
            { source: "/path/fromfile.txt", destination: "/path/to.zip" },
            {
              source: "/path/fromfile.txt",
              destination: "/path/to.zip",
              format: "tar",
            },
            {
              source: "/path/fromfile.txt",
              destination: "/path/to.tar.gz",
              format: "tar",
              options: {
                gzip: true,
                gzipOptions: {
                  level: 1,
                },
                globOptions: {
                  // https://github.com/Yqnn/node-readdir-glob#options
                  dot: true,
                },
              },
            },
          ],
        },
      },
    }),
  ],
};
```
