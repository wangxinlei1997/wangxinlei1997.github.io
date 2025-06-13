---
layout: cookie
title: 过多设置Cookies导致单点登录跳出
date: 2025-06-13 14:21:38
tags:
  - 技术
  - 服务器
  - 运维
---
# 引
公司项目最近遇到一个登录问题：在加载带有 3D TileLayers 倾斜摄影模型的页面时，刷新页面会导致应用退出登录。

# 问题排查思路

## 1. 是否是某个业务接口导致的退出？

排查过程中发现一个业务接口报错 500，但 500 错误不应导致鉴权状态丢失。

## 2. 从"刷新后丢失鉴权状态"入手

由于退出登录现象只在页面刷新后出现，因此从 Cookies 方向开始排查。

项目使用 Keycloak 进行认证，在页面刷新时会初始化客户端实例，并使用 Cookies 中的信息进行 [OAuth2](https://auth0.com/resources/ebooks/oauth-openid-connect-professional-guide) 协议鉴权。怀疑是 Cookies 中的鉴权信息丢失或过期。

## 3. 排查 Cookies

发现某个接口返回了 Set-Cookies 响应头，设置了 JSESSIONID cookie。

![](2a9eff7b88036129ef42aed0af6dc6a8.png)

起初怀疑是重新设置 JSESSIONID 导致原有值被覆盖。但考虑到其 Path 属性，登录时 `path=/` 不会被携带，因此排除此可能。

进一步分析发现，这个 Set-Cookie 本身就不合理。因为单点登录应该在全局使用同一个鉴权状态，这个设置可能是由项目的等保需求引入的。

继续排查所有请求，包括静态资源请求，发现大量静态资源响应都带有 Set-Cookie 头，持续向前端写入 cookies！

![](image.png)

![](image1.png)

查询资料后发现，Chrome 等主流浏览器都对 Cookie 有严格限制。这种持续写入 Cookie 的行为显然存在问题。

![](iShot_2025-06-13_15.00.42.png)

以下是各浏览器的 Cookie 限制：

| **浏览器** | **单个 Cookie 大小限制** | **每域名 Cookie 数量限制** |
| --- | --- | --- |
| Google Chrome | 4096 bytes | 180 个 |
| Mozilla Firefox | 4097 bytes | 150 个 |
| Apple Safari | 4096 bytes | 50 个 |
| Microsoft Edge | 4096 bytes | 50 个 |

# 问题原因

最终确认是由于项目等保要求，在 nginx 上配置了全局 Cookie 设置，导致 Cookie 数量达到浏览器上限，覆盖了原有的鉴权 Cookie。

```bash
# 由于我接触不到服务器，这里猜一下大概率是这些配置
proxy_cookie_path / "/; Path=/; Secure; HttpOnly";
add_header Set-Cookie 'mycookie=xxxx;Path=/;SameSite=None; Secure';
```

# 问题解决

联系服务器管理员注释掉 nginx 中的 set-cookie 相关配置后，问题得到解决。