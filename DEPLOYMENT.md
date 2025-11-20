# 免费部署方案

本文档提供了将您的美食打卡网站免费部署到生产环境的详细步骤。

## 推荐方案架构

- **前端托管**: Vercel (免费)
- **后端托管**: Render (免费)
- **数据库**: Render PostgreSQL (免费) 或 Supabase (免费)
- **图片存储**: Cloudinary (免费 25GB)

---

## 第一步：准备工作

### 1. 创建 GitHub 仓库

```bash
cd /Users/qihang/Desktop/food_finding
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/您的用户名/food_finding.git
git push -u origin main
```

### 2. 注册免费服务账号

- [Vercel](https://vercel.com) - 前端托管
- [Render](https://render.com) - 后端托管 + 数据库
- [Cloudinary](https://cloudinary.com) - 图片存储

---

## 第二步：部署数据库 (Render PostgreSQL)

1. 登录 [Render Dashboard](https://dashboard.render.com/)
2. 点击 **New +** → **PostgreSQL**
3. 配置：
   - **Name**: `food-finding-db`
   - **Database**: `food_finding`
   - **User**: `food_user`
   - **Region**: 选择离您最近的（如 Singapore）
   - **Instance Type**: **Free**
4. 点击 **Create Database**
5. 复制 **Internal Database URL** (格式：`postgresql://...`)

---

## 第三步：配置 Cloudinary（图片存储）

1. 登录 [Cloudinary Console](https://console.cloudinary.com/)
2. 在 Dashboard 找到：
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. 记下这些信息，稍后配置后端时使用

---

## 第四步：部署后端 (Render)

### 1. 准备后端代码

在 `server/package.json` 中添加 `start` 脚本：

```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "start": "ts-node src/index.ts",
    "build": "tsc",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

### 2. 在 Render 创建 Web Service

1. 在 Render Dashboard，点击 **New +** → **Web Service**
2. 连接您的 GitHub 仓库 `food_finding`
3. 配置：
   - **Name**: `food-finding-api`
   - **Region**: 选择与数据库相同的区域
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `pnpm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `pnpm start`
   - **Instance Type**: **Free**

### 3. 添加环境变量

在 Render Service 的 **Environment** 标签页，添加：

```
DATABASE_URL=<您在第二步复制的 Internal Database URL>
JWT_SECRET=your_super_secure_random_string_here_change_this
PORT=3000
NODE_ENV=production
```

4. 点击 **Create Web Service**
5. 等待部署完成，复制服务 URL（如 `https://food-finding-api.onrender.com`）

---

## 第五步：部署前端 (Vercel)

### 1. 更新前端 API 地址

修改前端代码中的 API 地址。创建 `client/.env.production`：

```env
VITE_API_URL=https://food-finding-api.onrender.com
```

然后更新所有 API 调用（如 `Login.tsx`, `Register.tsx`, `Dashboard.tsx` 等），将硬编码的 `http://localhost:3000` 替换为：

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

### 2. 在 Vercel 部署

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **Add New...** → **Project**
3. 选择您的 GitHub 仓库 `food_finding`
4. 配置：
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`
5. 在 **Environment Variables** 添加：
   ```
   VITE_API_URL=https://food-finding-api.onrender.com
   ```
6. 点击 **Deploy**
7. 等待部署完成（约 1-2 分钟）

---

## 第六步：配置 CORS

确保后端允许前端跨域请求。在 `server/src/index.ts` 中：

```typescript
import cors from 'cors';

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-app-name.vercel.app', // 替换为您的 Vercel 域名
  ],
  credentials: true,
}));
```

提交更改后，Render 会自动重新部署。

---

## 第七步：升级图片上传（可选但推荐）

### 当前问题
目前图片存储在后端服务器本地，Render 免费版会定期清理文件系统。

### 解决方案：使用 Cloudinary

#### 1. 安装依赖

```bash
cd server
pnpm add cloudinary multer-storage-cloudinary
```

#### 2. 更新 `server/src/config/multer.ts`

```typescript
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'food-finding',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  } as any,
});

export const upload = multer({ storage });
```

#### 3. 在 Render 添加环境变量

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 监控和维护

### Render 免费版限制
- 活动时间：每月 750 小时
- 15 分钟无活动后会休眠
- 首次访问可能需要 30-60 秒唤醒

### 保持服务活跃（可选）
使用 [UptimeRobot](https://uptimerobot.com/)（免费）每 5 分钟 ping 一次您的后端：
- URL: `https://food-finding-api.onrender.com/`
- 可防止服务休眠

---

## 故障排除

### 后端部署失败
- 检查 Render 日志中的错误
- 确保 `DATABASE_URL` 正确
- 确保 Prisma 迁移成功运行

### 前端无法连接后端
- 检查 CORS 配置
- 确认 `VITE_API_URL` 环境变量正确
- 在浏览器控制台查看网络请求错误

### 数据库连接问题
- 确认使用的是 **Internal Database URL**（不是 External）
- 检查数据库是否已创建

---

## 成本估算

所有服务都在免费额度内，**总成本：$0/月**

| 服务 | 免费额度 | 限制 |
|------|---------|------|
| Vercel | 100GB 带宽 | 商业用途需升级 |
| Render (Web Service) | 750 小时/月 | 15 分钟无活动休眠 |
| Render (PostgreSQL) | 1GB 存储 | 90 天不活动删除 |
| Cloudinary | 25GB 存储, 25GB 带宽 | 足够小型应用 |

---

## 下一步

部署完成后，您可以：
1. 配置自定义域名（Vercel 和 Render 都支持）
2. 设置 SSL 证书（自动提供）
3. 监控应用性能
4. 根据需要升级到付费计划

需要帮助？参考各平台文档：
- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [Cloudinary Docs](https://cloudinary.com/documentation)
