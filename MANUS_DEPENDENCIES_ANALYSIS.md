# Orpheus Blog - Manus 依赖点分析报告

## 概述

本报告详细列出了 orpheus-blog 项目中所有对 Manus 平台的依赖点，并提供相应的重构方案。

---

## 1. NPM 依赖层面

### 1.1 Manus 专有插件

| 文件 | 依赖 | 说明 | 重构方案 |
|------|------|------|----------|
| `package.json` | `vite-plugin-manus-runtime` | Manus 运行时注入插件 | **移除** |
| `vite.config.ts` | `vitePluginManusRuntime()` | Vite 插件调用 | **移除** |

---

## 2. 后端 Manus 依赖点

### 2.1 OAuth 认证系统 (`server/_core/sdk.ts`)

**依赖点：**
- `OAUTH_SERVER_URL` - Manus OAuth 服务器地址
- `VITE_APP_ID` - Manus 应用 ID
- OAuth 端点：
  - `/webdev.v1.WebDevAuthPublicService/ExchangeToken`
  - `/webdev.v1.WebDevAuthPublicService/GetUserInfo`
  - `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`

**重构方案：** 替换为标准 OAuth 2.0 / JWT 认证系统

### 2.2 LLM 服务 (`server/_core/llm.ts`)

**依赖点：**
- `BUILT_IN_FORGE_API_URL` → `forge.manus.im` 作为默认值
- `BUILT_IN_FORGE_API_KEY` - Manus Forge API 密钥

**重构方案：** 替换为标准 OpenAI API 兼容接口

### 2.3 存储服务 (`server/storage.ts`)

**依赖点：**
- `BUILT_IN_FORGE_API_URL` - Manus 存储代理
- `BUILT_IN_FORGE_API_KEY` - 认证密钥
- 端点：`v1/storage/upload`, `v1/storage/downloadUrl`

**重构方案：** 替换为标准 AWS S3 SDK 直连

### 2.4 图片生成服务 (`server/_core/imageGeneration.ts`)

**依赖点：**
- `BUILT_IN_FORGE_API_URL`
- 端点：`images.v1.ImageService/GenerateImage`

**重构方案：** 替换为 OpenAI DALL-E API 或其他图片生成服务

### 2.5 语音转文字服务 (`server/_core/voiceTranscription.ts`)

**依赖点：**
- `BUILT_IN_FORGE_API_URL`
- 端点：`v1/audio/transcriptions` (Whisper API)

**重构方案：** 替换为 OpenAI Whisper API 直连

### 2.6 数据 API 服务 (`server/_core/dataApi.ts`)

**依赖点：**
- `BUILT_IN_FORGE_API_URL`
- 端点：`webdevtoken.v1.WebDevService/CallApi`

**重构方案：** 根据实际使用场景替换为具体第三方 API

### 2.7 通知服务 (`server/_core/notification.ts`)

**依赖点：**
- `BUILT_IN_FORGE_API_URL`
- 端点：`webdevtoken.v1.WebDevService/SendNotification`

**重构方案：** 替换为 Email 服务（如 SendGrid、Resend）或 Webhook

### 2.8 地图服务 (`server/_core/map.ts`)

**依赖点：**
- `BUILT_IN_FORGE_API_URL`
- 端点：`v1/maps/proxy/*` (Google Maps 代理)

**重构方案：** 替换为 Google Maps API 直连

### 2.9 环境变量配置 (`server/_core/env.ts`)

**Manus 特有变量：**
```typescript
appId: process.env.VITE_APP_ID
oAuthServerUrl: process.env.OAUTH_SERVER_URL
ownerOpenId: process.env.OWNER_OPEN_ID
forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL
forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY
```

---

## 3. 前端 Manus 依赖点

### 3.1 OAuth 登录 (`client/src/const.ts`)

**依赖点：**
- `VITE_OAUTH_PORTAL_URL` - Manus 登录门户
- `VITE_APP_ID` - 应用 ID
- 登录 URL 构建逻辑指向 Manus OAuth

**重构方案：** 替换为自定义登录页面或第三方 OAuth 提供商

### 3.2 Vite 配置 (`vite.config.ts`)

**依赖点：**
- `vite-plugin-manus-runtime` 插件
- `allowedHosts` 包含 Manus 域名

**重构方案：** 移除 Manus 插件，更新允许的域名列表

### 3.3 tRPC 客户端 (`client/src/main.tsx`)

**依赖点：**
- API URL 硬编码为 `/api/trpc`（相对路径）

**重构方案：** 改为可配置的 API Base URL

---

## 4. 配置文件依赖

### 4.1 当前环境变量（需要替换）

| 变量名 | Manus 用途 | 公网替换方案 |
|--------|-----------|-------------|
| `DATABASE_URL` | TiDB 连接 | 任意 MySQL 兼容数据库 |
| `JWT_SECRET` | 会话签名 | 保留，自行生成 |
| `VITE_APP_ID` | Manus OAuth | 移除或替换 |
| `OAUTH_SERVER_URL` | Manus OAuth 后端 | 替换为自建或第三方 |
| `VITE_OAUTH_PORTAL_URL` | Manus 登录门户 | 替换为自建登录页 |
| `OWNER_OPEN_ID` | 管理员标识 | 替换为 Admin Email |
| `BUILT_IN_FORGE_API_URL` | Manus API 代理 | 替换为各服务直连 |
| `BUILT_IN_FORGE_API_KEY` | Manus API 密钥 | 替换为各服务 API Key |

---

## 5. 架构重构方向

### 5.1 认证系统重构

**方案 A：简化 JWT 认证（推荐）**
- 移除 Manus OAuth，使用邮箱/密码登录
- 服务端签发 JWT，客户端存储在 Cookie
- 管理员通过 `ADMIN_EMAIL` 环境变量配置

**方案 B：第三方 OAuth**
- 集成 Google/GitHub OAuth
- 使用 NextAuth.js 或 Lucia Auth

### 5.2 存储服务重构

- 直接使用 AWS S3 SDK
- 配置 `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`
- 或使用 Cloudflare R2（S3 兼容）

### 5.3 AI 服务重构

- LLM：直连 OpenAI API (`OPENAI_API_KEY`)
- 图片生成：OpenAI DALL-E 或 Replicate
- 语音转文字：OpenAI Whisper API

---

## 6. 重构优先级

| 优先级 | 模块 | 原因 |
|--------|------|------|
| P0 | 认证系统 | 核心功能，阻塞其他功能 |
| P0 | 环境配置 | 所有模块依赖 |
| P1 | 存储服务 | 图片/PDF 上传必需 |
| P2 | LLM 服务 | AI 功能可选 |
| P3 | 其他服务 | 按需启用 |

---

## 7. 文件变更清单

### 需要修改的文件

1. `package.json` - 移除 `vite-plugin-manus-runtime`
2. `vite.config.ts` - 移除 Manus 插件
3. `server/_core/env.ts` - 重构环境变量
4. `server/_core/sdk.ts` - 重写认证逻辑
5. `server/_core/oauth.ts` - 重写 OAuth 回调
6. `server/storage.ts` - 替换为 S3 直连
7. `server/_core/llm.ts` - 替换为 OpenAI 直连
8. `client/src/const.ts` - 更新登录 URL 逻辑
9. `client/src/main.tsx` - 配置 API Base URL

### 需要新增的文件

1. `.env.example` - 环境变量模板
2. `Dockerfile` - 后端容器化
3. `vercel.json` - Vercel 部署配置
4. `render.yaml` - Render 部署配置（可选）

### 可以删除的文件

1. `server/_core/types/manusTypes.ts` - Manus 类型定义
2. `server/_core/dataApi.ts` - 如不使用
3. `server/_core/notification.ts` - 如不使用
4. `server/_core/map.ts` - 如不使用
