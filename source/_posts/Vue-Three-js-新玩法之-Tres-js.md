---
title: Vue Three.js 新玩法之 TresJs
date: 2024-01-21 17:11:28
toc: false
tags:
 - 3D
 - Vue
 - Vue3
 - Three.js
 - Tres.js
categories: 
    - 技术分享
---
## 效果预览
今天我们将会探索一个名为 [TresJs](https://tresjs.org/) 的工具，它是一个使得在 Vue3 中使用 Three.js 变得更加容易的库。下面，我们将会使用 TresJs 来创建一个如下 iframe 展示的简单的 3D 手机模型展示。
<iframe src="https://demo.xiaob.work/trejs" style="width:100%;height:600px"></iframe>

## 什么是 TresJs？

TreJs是一个声明性的3D场景构建工具，它允许你像使用Vue组件一样构建3D场景。TreJs利用Vite提供的热模块替换(HMR)功能，无论应用程序的大小如何，它都能保持快速的加载速度。此外，TreJs始终保持最新的ThreeJS特性，让你可以随时使用ThreeJS的所有更新功能。通过扩展核心功能，例如使用`cientos`和`postprocessing`等包，或者添加你自己的包，你可以更好地使用ThreeJS的生态系统。总的来说，无论你是在创建3D手机模型展示，还是在进行其他类型的3D项目，TreJs都能为你提供极大的便利。

## 一些基本概念

在 `Three.js` 中，我们需要 4 个核心元素来创建 3D 体验，分别是：Scene、Renderer、Camera 和 Object

### Scene

在Three.js中，Scene（场景）是所有物体和光源的容器，它表示了一个三维的空间环境。你可以将其看作是一个舞台，所有的物体，包括几何体、灯光、摄像机等都在这个舞台上。在创建任何Three.js应用时，我们都需要先创建一个Scene。在这个场景中，我们可以添加或删除物体，调整物体的位置、旋转和缩放等属性，也可以添加各种光源来影响物体的渲染效果。最后，我们会使用一个摄像机来决定从哪个角度查看这个场景，然后将场景渲染到一个二维的屏幕上。

在 `TreJs` 中，`Scene` 由组件 `TresCanvas` 提供。

### Renderer

在 Three.js 中，Renderer 是一个非常重要的组件。它负责将你的场景渲染到屏幕上。你可以把它想象成一个画家，它的任务是把你的 3D 场景画出来。

Three.js 提供了多种 Renderer，包括 WebGLRenderer、WebGL1Renderer、CSS2DRenderer、CSS3DRenderer 等。其中，WebGLRenderer 是最常用的 Renderer，它使用 WebGL 技术来渲染 3D 场景。

在 `TreJs` 中，Renderer 在组件 `TresCanvas` 初始化时会自动创建。

### Camera

在 Three.js 中，摄像机是创建 3D 场景的重要组件。摄像机定义了我们观察 3D 场景的视角和视野。Three.js 提供了多种类型的摄像机，但最常用的是透视摄像机（PerspectiveCamera）和正交摄像机（OrthographicCamera）。

透视摄像机（PerspectiveCamera）模拟了人眼看到的视觉效果，即远处的物体比近处的物体看起来小。它的参数包括视野角度、长宽比以及近裁剪面和远裁剪面。

正交摄像机（OrthographicCamera）则不考虑深度，无论物体离摄像机的距离如何，其大小始终保持一致。这种摄像机常用于创建 2D 效果或者工程图表。

在我们的 Vue.js 3D 手机模型展示中，我们使用了透视摄像机（TresPerspectiveCamera）来创建更为真实的 3D 视觉效果。

在 `TreJs` 中，Camera 由组件 `TresPerspectiveCamera` 提供。

### Object

在 Three.js 中，Object 指的是 添加在场景中被观测的物体。 在实际开发中，分为手敲的 Mesh 和 从外部导入的模型文件。

在 Three.js 中，Mesh 是一个基本的3D物体，它由一个几何体和一个材质组成。几何体是一个定义了物体形状的对象，材质则是定义了物体表面的外观。在一个Mesh中，几何体和材质的结合就形成了一个可以在场景中渲染的3D物体。

而从外部导入的模型文件，由于其格式有非常多种，加载方式各不相同，具体的可以查看 Trejs 或 Three.js 的官方文档。

## 开始使用

我们的目标是在 Vue.js 中创建一个 3D 手机模型展示。首先，我们需要在 Vue.js 组件中设置场景。

在我们的 `Index.vue` 文件中，我们首先导入了必要的 TresJs 组件和函数，包括 `TresLeches`，`TresCanvas` 和 `useControls`。然后，我们在模板中设置了一个 `TresCanvas`，并在其中添加了一些基础的 Three.js 元素，如 `TresPerspectiveCamera`，`OrbitControls`，`TresDirectionalLight` 和 `TresAmbientLight`。

我们还使用了 `useControls` 函数来创建一些控制元素，如背景颜色，方向光颜色，方向光强度和环境光强度。这些控制元素可以让我们在运行时动态调整这些属性。

```html
<template>
	<div class="container-i">
		<TresLeches abs />
		<TresCanvas :clear-color="bgColor.value">
			<TresPerspectiveCamera :position="[2, 0, 3]" :look-at="[0, 0, 0]" />
			<OrbitControls />
			<TresDirectionalLight :color="color.value" :position="[3, 3, 3]"
				:intensity="directionalLightIntensity.value" />
			<TresAmbientLight :intensity="ambientLightIntensity.value" />
			<Suspense>
				<Phone />
			</Suspense>
		</TresCanvas>
	</div>
</template>

```
可见，不同于 Three.js，TresJs 提供了一种更加声明式的方式来创建 3D 场景。通过使用 TresJs，我们可以在 Vue.js 中更加方便地创建 3D 场景，并且可以使用 Vue.js 的响应式数据来动态调整场景中的元素。

## 加载3D模型

接下来，我们需要加载我们的 3D 手机模型。在 `Phone.vue` 文件中，我们使用 `useGLTF` 函数来加载我们的模型。然后，我们获取模型的边界框，并计算出其大小和中心点。最后，我们将模型的位置调整到原点，并根据其大小调整其缩放。

```html
<template>
    <primitive :object="model"></primitive>
</template>
<script setup lang="ts">
import * as THREE from 'three'
import { useGLTF } from '@tresjs/cientos'

const { scene: model } = await useGLTF(new URL('/models/scene.gltf',import.meta.url).href)

const box = new THREE.Box3().setFromObject(model);
const size = box.getSize(new THREE.Vector3()).length();
const center = box.getCenter(new THREE.Vector3());

// 移动模型到原点
model.position.x += (model.position.x - center.x);
model.position.y += (model.position.y - center.y) + 0.5;
model.position.z += (model.position.z - center.z);

// 调整模型大小
const scale = 2 / size;
model.scale.set(scale, scale, scale);
</script>

```

## 结论

Tres.js 提供了一种在 Vue.js 中使用 Three.js 的简洁方式，使得我们可以在 Vue.js 中方便地使用 Three.js 的各种功能。目前此项目在 github 上已经有 1k+ 的 star，期待其官方文档的完善，以及更多的开发者加入到这个项目中，共同推动 Three.js 在 Vue.js 中的发展。