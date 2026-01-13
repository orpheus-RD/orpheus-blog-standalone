# Orpheus Blog - Project TODO

## 代码迁移
- [x] 迁移数据库schema (photos, essays, papers表)
- [x] 迁移后端routers.ts
- [x] 迁移后端db.ts
- [x] 迁移storage.ts文件上传功能
- [x] 迁移前端Photography.tsx (含lightbox修复)
- [x] 迁移前端Academic.tsx (含PDF下载修复)
- [x] 迁移前端Magazine.tsx
- [x] 迁移前端Home.tsx
- [x] 迁移前端Search.tsx
- [x] 迁移后台Admin.tsx
- [x] 迁移后台AdminPhotos.tsx
- [x] 迁移后台AdminEssays.tsx
- [x] 迁移后台AdminPapers.tsx (含PDF上传功能)
- [x] 复制静态资源和图片

## 数据库配置
- [x] 运行数据库迁移 (pnpm db:push)
- [x] 配置种子脚本 seed.ts
- [x] 运行种子脚本初始化数据

## Bug修复验证
- [x] 验证PDF下载功能正常 (按钮已实现，待上传真实PDF后可用)
- [x] 验证内容覆盖问题已解决 (种子数据已初始化)
- [x] 验证摄影模块lightbox交互 (已正常工作)正常

## 文档
- [x] 创建环境变量配置文档 (ENV_CONFIG.md)

## 新发现的Bug
- [x] Magazine模块文章无法打开

## 布局优化需求
- [x] Photography模块：完整展示图片不裁剪，适配不同尺寸比例
- [x] Magazine模块：移除置顶文章特殊布局，统一卡片样式
- [x] 移动端响应式优化

## Photography布局优化
- [x] 首行两张图片顶部对齐，从第二行开始瀑布流自由排列
