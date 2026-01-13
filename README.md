# Orpheus Blog - 独立部署版

[![部署到 Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Forpheus-RD%2Forpheus-blog)
[![部署到 Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

这是 Orpheus Blog 项目的重构版本，旨在移除对 Manus 内部环境的依赖，实现前后端分离架构，并支持在公网平台（Vercel / Render）上独立部署。

---

## 架构概述

重构后的项目采用经典的前后端分离架构：

- **前端 (Client):** 使用 React, Vite, TypeScript 和 Tailwind CSS 构建的单页应用 (SPA)。设计为静态站点，可部署在 Vercel 或任何静态托管平台。
- **后端 (Server):** 使用 Express, tRPC, Drizzle ORM 和 TypeScript 构建的 API 服务器。设计为无状态的容器化应用，可部署在 Render 或其他支持 Docker 的平台。

| 组件 | 技术栈 | 部署目标 | 职责 |
|---|---|---|---|
| **前端** | React, Vite, tRPC Client, Tailwind CSS | Vercel | UI 渲染、用户交互、API 请求 |
| **后端** | Express, tRPC, Drizzle, MySQL | Render | API 逻辑、数据库交互、认证、文件存储 |
| **数据库** | MySQL / TiDB | Render, PlanetScale, etc. | 数据持久化 |
| **文件存储** | AWS S3 / Cloudflare R2 | AWS, Cloudflare | 图片、PDF 等静态资源存储 |

---

## 核心重构内容

1.  **环境配置标准化:**
    - 移除了所有 Manus 隐式配置注入，采用标准的 `.env` 文件管理环境变量。
    - 创建了 `.env.example` 模板，清晰定义了所有必需和可选的配置项。
    - 后端服务启动时会验证关键环境变量，确保配置正确。

2.  **认证系统重构:**
    - 移除了 Manus OAuth 依赖，替换为基于 JWT 的简化认证系统。
    - 管理员通过环境变量 `ADMIN_EMAIL` 和 `ADMIN_PASSWORD` 进行配置和登录。
    - 会话信息存储在安全的 `httpOnly` Cookie 中。

3.  **服务依赖解耦:**
    - **存储服务:** 移除了 Manus 存储代理，直接使用 `aws-sdk` 与 AWS S3 或 S3 兼容服务 (如 Cloudflare R2, MinIO) 对接。
    - **AI 服务 (LLM, 语音):** 移除了 Manus Forge API 代理，替换为直连 OpenAI API。
    - **其他服务 (通知, 地图):** 移除了相关代理，并提供了未来可扩展的占位实现。

4.  **部署适配:**
    - **前端 (Vercel):**
        - 配置 `vercel.json` 以正确处理构建和 API 代理。
        - 前端通过 `VITE_API_BASE_URL` 环境变量连接到后端 API。
    - **后端 (Render):**
        - 创建了优化的多阶段 `Dockerfile`，减小了生产镜像体积。
        - 服务监听由 Render 动态分配的 `PORT` 环境变量。
        - 配置了灵活的 CORS 策略，允许来自 Vercel 前端的跨域请求。
        - 提供了 `render.yaml` 蓝图文件，可用于一键部署。

5.  **本地开发与验证:**
    - 提供了 `docker-compose.yml` 文件，用于在本地一键启动包含数据库 (MySQL)、对象存储 (MinIO) 和后端服务的完整模拟生产环境。
    - 提供了 `scripts/dev-local.sh` 脚本，用于在本地同时启动前后端开发服务器，简化开发流程。

---

## 部署指南

### 步骤 1: 部署后端到 Render

1.  **Fork 本仓库** 到您的 GitHub 账户。
2.  访问 [Render Dashboard](https://dashboard.render.com/) 并点击 "New" > "Blueprint"。
3.  选择您 Fork 的仓库，Render 会自动识别 `render.yaml` 文件。
4.  **配置服务:**
    - Render 会自动创建一个 Web Service (后端) 和一个 Database (MySQL)。
    - 在 Web Service 的 "Environment" 选项卡中，填入以下环境变量：
        - `ADMIN_EMAIL`: 您的管理员邮箱。
        - `ADMIN_PASSWORD`: 设置一个安全的管理员密码。
        - `CORS_ORIGINS`: 您的 Vercel 前端域名 (部署后获得，例如 `https://your-app.vercel.app`)。
        - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`: 您的 S3 或 R2 存储桶凭证。
        - `OPENAI_API_KEY`: (可选) 您的 OpenAI API 密钥。
5.  点击 "Apply" 完成部署。部署完成后，记下后端服务的 URL (例如 `https://your-backend.onrender.com`)。

### 步骤 2: 部署前端到 Vercel

1.  访问 [Vercel Dashboard](https://vercel.com/new) 并选择您 Fork 的仓库。
2.  **配置项目:**
    - Vercel 会自动识别项目为 Vite 应用。
    - 进入项目设置的 "Environment Variables" 页面，添加以下变量：
        - `VITE_API_BASE_URL`: 填入上一步中获得的 Render 后端 URL。
3.  点击 "Deploy" 完成部署。

---

## 本地开发

### 选项 A: 使用 Docker (推荐)

此方法最接近生产环境，包含所有依赖服务。

1.  **安装 Docker** 和 Docker Compose。
2.  **配置环境:**
    - 复制 `.env.example` 为 `.env`。
    - `docker-compose.yml` 已预置了开发环境所需配置，通常无需修改 `.env`。
3.  **启动服务:**
    ```bash
    docker-compose up --build
    ```
4.  **初始化 MinIO 存储桶:**
    - 访问 MinIO 控制台: `http://localhost:9001` (用户: `minioadmin`, 密码: `minioadmin`)。
    - 创建一个名为 `orpheus-blog` 的存储桶，并将其访问策略设置为 `Public`。
5.  **访问应用:**
    - **前端:** `http://localhost:8080` (由 Nginx 提供服务)
    - **后端:** `http://localhost:3000`

### 选项 B: 本地直接运行

此方法更轻量，适合纯前端或后端开发，但需要您在本地单独运行数据库。

1.  **安装 pnpm:**
    ```bash
    npm install -g pnpm
    ```
2.  **安装依赖:**
    ```bash
    pnpm install
    ```
3.  **配置环境:**
    - 复制 `.env.example` 为 `.env`。
    - 填入您的本地数据库连接字符串 (`DATABASE_URL`) 和其他配置。
4.  **启动开发服务器:**
    - **启动后端:**
      ```bash
      pnpm dev
      ```
    - **在另一个终端启动前端:**
      ```bash
      pnpm dev:client
      ```
5.  **访问应用:**
    - **前端:** `http://localhost:5173`
    - **后端:** `http://localhost:3000`

---

## 项目脚本

- `pnpm dev`: 启动后端开发服务器 (使用 `tsx` 热重载)。
- `pnpm dev:client`: 启动前端 Vite 开发服务器。
- `pnpm build`: 构建用于生产的前端和后端代码。
- `pnpm start`: 在生产模式下启动已构建的后端服务器。
- `pnpm db:push`: 根据 Drizzle schema 更新数据库结构。
- `pnpm db:seed`: (可选) 向数据库填充初始种子数据。
- `pnpm check`: 运行 TypeScript 类型检查。
- `pnpm test`: 运行 Vitest 测试。
