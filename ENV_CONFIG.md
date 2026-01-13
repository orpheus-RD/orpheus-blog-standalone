# Orpheus Blog - 环境变量配置文档

本文档记录了 Orpheus Blog 网站运行所需的所有环境变量配置。这些变量在 Manus 部署环境中会自动注入，如果您需要在其他环境中部署，请按照以下说明进行配置。

## 系统自动注入的环境变量

以下环境变量由 Manus 平台自动配置，无需手动设置：

### 数据库配置

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | MySQL/TiDB 数据库连接字符串 | `mysql://user:password@host:port/database?ssl={"rejectUnauthorized":true}` |

### 认证配置

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `JWT_SECRET` | JWT 会话签名密钥 | 随机生成的安全字符串 |
| `VITE_APP_ID` | Manus OAuth 应用 ID | `app_xxxxx` |
| `OAUTH_SERVER_URL` | Manus OAuth 后端基础 URL | `https://api.manus.im` |
| `VITE_OAUTH_PORTAL_URL` | Manus 登录门户 URL（前端） | `https://portal.manus.im` |

### 所有者信息

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `OWNER_OPEN_ID` | 网站所有者的 OpenID | `user_xxxxx` |
| `OWNER_NAME` | 网站所有者名称 | `Orpheus` |

### 存储服务配置

| 变量名 | 说明 | 用途 |
|--------|------|------|
| `BUILT_IN_FORGE_API_URL` | Manus 内置 API 地址（服务端） | 文件上传、LLM 调用等 |
| `BUILT_IN_FORGE_API_KEY` | Manus 内置 API 密钥（服务端） | Bearer Token 认证 |
| `VITE_FRONTEND_FORGE_API_URL` | Manus 内置 API 地址（前端） | 前端直接访问 API |
| `VITE_FRONTEND_FORGE_API_KEY` | Manus 内置 API 密钥（前端） | 前端 API 认证 |

### 分析服务配置

| 变量名 | 说明 |
|--------|------|
| `VITE_ANALYTICS_ENDPOINT` | 分析服务端点 |
| `VITE_ANALYTICS_WEBSITE_ID` | 网站分析 ID |

### 应用配置

| 变量名 | 说明 | 可自定义 |
|--------|------|----------|
| `VITE_APP_TITLE` | 网站标题 | ✅ 可在设置中修改 |
| `VITE_APP_LOGO` | 网站 Logo URL | ✅ 可在设置中修改 |

## 数据库表结构

项目使用以下数据表：

### users 表
用户认证和权限管理

### photos 表
摄影作品存储，包含：
- 标题、描述、位置
- 图片 URL（存储在 S3）
- 分类、标签
- 发布状态和排序

### essays 表
杂志文章存储，包含：
- 标题、副标题、摘要、正文
- 封面图片 URL
- 分类、标签
- 阅读时间、发布状态

### papers 表
学术论文存储，包含：
- 标题、作者、摘要
- 期刊、年份、卷号、页码
- DOI、PDF URL
- 分类、标签、引用数

### site_settings 表
网站设置存储

## 常用命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 运行数据库迁移
pnpm db:push

# 运行种子脚本初始化数据
pnpm db:seed

# 运行测试
pnpm test

# 类型检查
pnpm check
```

## 文件上传说明

### 图片上传
- 通过后台管理界面 `/admin/photos` 上传
- 图片自动上传到 S3 存储
- 支持 JPG、PNG、WebP 格式

### PDF 上传
- 通过后台管理界面 `/admin/papers` 上传
- PDF 自动上传到 S3 存储
- 上传后自动填充 PDF URL 字段

## 后台管理

访问 `/admin` 进入后台管理界面（需要管理员权限）：

- `/admin/photos` - 摄影作品管理
- `/admin/essays` - 杂志文章管理
- `/admin/papers` - 学术论文管理

## 故障排除

### 数据库连接失败
1. 检查 `DATABASE_URL` 是否正确配置
2. 确保数据库服务器可访问
3. 检查 SSL 配置是否正确

### 文件上传失败
1. 检查 `BUILT_IN_FORGE_API_URL` 和 `BUILT_IN_FORGE_API_KEY` 配置
2. 确保文件大小在限制范围内
3. 检查文件格式是否支持

### 登录失败
1. 检查 OAuth 相关配置是否正确
2. 确保 `JWT_SECRET` 已配置
3. 检查 cookie 设置是否正确

## 更新日志

### 2025-01-13
- 初始部署
- 修复 PDF 下载功能
- 修复摄影模块 lightbox 交互
- 添加数据库种子脚本
- 解决内容覆盖问题
