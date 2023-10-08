---
title: Cesium之Vue环境配置与demo运行（一）
date: 2021-05-07 09:52:30
tags:
    - 技术
    - Vue
    - GIS
categories: 
    - 技术分享
---
## 背景
最近公司有新项目（据说是关于数字孪生），需要用到Cesium来展示3d模型。由于我技术栈是Vue，故在此记录环境配置、安装相关的一些要点。
## Vue项目创建
> 本次Demo尝试使用Vue3来搭建。
1. 通过Vue-CLI ^4.5+ 脚手架来创建V3项目
```bash
# 安装vli(按需)
yarn global add @vue/cli
# OR
npm install -g @vue/cli
# 创建项目
vue create hello-world
```
创建过程中注意选择V3即可，其他配置按自己喜好。
2. 项目创建完成后，在项目下安装sass相关依赖。(按需)
```bash
npm install node-sass
npm install sass-loader
```
由于node-sass的版本和nodejs版本依赖关系比较魔幻，故在安装的时候需要注意和本地的node版本匹配。下放依赖匹配表。
|NodeJS	|Supported node-sass version|	Node Module|
|:-:|:-:|:-:|
|Node 15|5.0+|88|
|Node 14|4.14+|83|
|Node 13|4.13+, <5.0|79|
|Node 12|4.12+|72|
|Node 11|4.10+, <5.0|67|
|Node 10|4.9+|64|
|Node 8|4.5.3+, <5.0|57|
|Node <8|<5.0|<57|
3. 安装cesium
```bash
npm install cesium
```
4. 安装webpack相关依赖
copy-webpack-plugin
css-loader"
html-webpack-plugin
strip-pragma-loader
style-loader
uglifyjs-webpack-plugin
url-loader
webpack
webpack-cli
webpack-dev-server
5. 在项目文件夹下新建vue.config.js
```js
const path = require("path");


const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const resolve = function(dir) {
  return path.join(__dirname, dir);
};
module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "./" : "./",
  outputDir: "dist",
  assetsDir: "static",
  lintOnSave: true, // 是否开启eslint保存检测
  productionSourceMap: false, // 是否在构建生产包时生成sourcdeMap
  chainWebpack: config => {
    config.resolve.alias
      .set("@", resolve("src"))
      .set("@v", resolve("src/views"))
      .set("@c", resolve("src/components"))
      .set("@u", resolve("src/utils"))
      .set("@s", resolve("src/service")); /* 别名配置 */
    config.optimization.runtimeChunk("single");
  },
  devServer: {
    // host: "localhost",
    /* 本地ip地址 */
    //host: "192.168.1.107",
    host: "0.0.0.0", //局域网和本地访问
    port: "8080",
    hot: true,
    /* 自动打开浏览器 */
    open: false,
    overlay: {
      warning: false,
      error: true
    },
    /* 跨域代理 */
  },
  configureWebpack:{
      plugins: [
    // Copy Cesium Assets, Widgets, and Workers to a static directory
    new CopyWebpackPlugin({
        patterns: [
            { from: 'node_modules/cesium/Build/Cesium/Workers', to: 'Workers' },
            { from: 'node_modules/cesium/Build/Cesium/ThirdParty', to: 'ThirdParty' },
            { from: 'node_modules/cesium/Build/Cesium/Assets', to: 'Assets' },
            { from: 'node_modules/cesium/Build/Cesium/Widgets', to: 'Widgets' }
        ],
    }),
    new webpack.DefinePlugin({
        // Define relative base path in cesium for loading assets
        CESIUM_BASE_URL: JSON.stringify('')
    })
]
  }
  ,
};
```
6. 在你的HelloWorld里面写cesium相关逻辑
> 这里我直接贴上我的HelloWorld
> PS: 其中token自己在Cesium官网里面申请就行了
```html
<!--
 * @Author: 王欣磊
 * @Date: 2021-05-06 11:17:20
 * @LastEditors: 王欣磊
 * @LastEditTime: 2021-05-06 15:57:10
 * @Description: 
 * @FilePath: /test3/src/components/HelloWorld.vue
-->
<template>
  <div class="hello">
    <div id="cesiumContainer"></div>
    <h1 @click="clickChoose">{{ message }} {{item.title}}</h1>
    <p>
      For a guide and recipes on how to configure / customize this project,<br>
      check out the
      <a href="https://cli.vuejs.org" target="_blank" rel="noopener">vue-cli documentation</a>.
    </p>
    <h3>Installed CLI Plugins</h3>
    <ul>
      <li><a href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-babel" target="_blank" rel="noopener">babel</a></li>
      <li><a href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint" target="_blank" rel="noopener">eslint</a></li>
    </ul>
    <h3>Essential Links</h3>
    <ul>
      <li><a href="https://vuejs.org" target="_blank" rel="noopener">Core Docs</a></li>
      <li><a href="https://forum.vuejs.org" target="_blank" rel="noopener">Forum</a></li>
      <li><a href="https://chat.vuejs.org" target="_blank" rel="noopener">Community Chat</a></li>
      <li><a href="https://twitter.com/vuejs" target="_blank" rel="noopener">Twitter</a></li>
      <li><a href="https://news.vuejs.org" target="_blank" rel="noopener">News</a></li>
    </ul>
    <h3>Ecosystem</h3>
    <ul>
      <li><a href="https://router.vuejs.org" target="_blank" rel="noopener">vue-router</a></li>
      <li><a href="https://vuex.vuejs.org" target="_blank" rel="noopener">vuex</a></li>
      <li><a href="https://github.com/vuejs/vue-devtools#vue-devtools" target="_blank" rel="noopener">vue-devtools</a></li>
      <li><a href="https://vue-loader.vuejs.org" target="_blank" rel="noopener">vue-loader</a></li>
      <li><a href="https://github.com/vuejs/awesome-vue" target="_blank" rel="noopener">awesome-vue</a></li>
    </ul>
  </div>
</template>

<script>
import * as Cesium from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";
import { onMounted, ref,reactive } from 'vue'
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  setup(){
    const message = ref('choose')
    const item = reactive({title:'name'})
    onMounted(()=>{
        // Your access token can be found at: https://cesium.com/ion/tokens.
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWY5NzY4Yy1mY2YyLTRmYTgtYjAyMy1hMGY3MTllZmVmNDUiLCJpZCI6NTQ4ODMsImlhdCI6MTYyMDI3MzA1NX0.M-B79nr0L9j3L3RmNwmGisLrQz5ux7vRKv7TbP4qxkU';
    // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
    const viewer = new Cesium.Viewer('cesiumContainer', {
      terrainProvider: Cesium.createWorldTerrain()
    });    
    // Add Cesium OSM Buildings, a global 3D buildings layer.
    // eslint-disable-next-line no-unused-vars
    const buildingTileset = viewer.scene.primitives.add(Cesium.createOsmBuildings());   
    // Fly the camera to San Francisco at the given longitude, latitude, and height.
    viewer.camera.flyTo({
      destination : Cesium.Cartesian3.fromDegrees(-122.4175, 37.655, 400),
      orientation : {
        heading : Cesium.Math.toRadians(0.0),
        pitch : Cesium.Math.toRadians(-15.0),
      }
    });
    })
    return { message,item}
  },
  methods:{
    clickChoose(){
      this.message+='0'
      this.item.title+='p'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>

```
7. 运行devServer就完事了
![](cesium-demo.png)