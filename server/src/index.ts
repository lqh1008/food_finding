import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';

// 加载环境变量
// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 配置 CORS (Cross-Origin Resource Sharing) 中间件
// Configure CORS middleware to allow requests from specific origins
app.use(cors({
    origin: [
        /^http:\/\/localhost:\d+$/, // 允许本地开发环境的所有端口 Allow all local ports for development
        'https://food-finding-client.vercel.app', // 生产环境前端域名 Production frontend domain
    ],
    credentials: true, // 允许发送 Cookie Allow sending cookies
}));

// 配置 JSON 解析中间件，用于解析请求体中的 JSON 数据
// Configure JSON parsing middleware to parse JSON data in request body
app.use(express.json());

import foodEntryRoutes from './routes/foodEntryRoutes';
import uploadRoutes from './routes/uploadRoutes';
import path from 'path';

// 配置静态文件服务，用于访问上传的图片
// Configure static file serving for accessing uploaded images
// '/uploads' 是访问路径前缀，express.static 指定了实际的文件目录
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 注册路由
// Register routes
app.use('/api/auth', authRoutes); // 认证相关路由 Authentication routes
app.use('/api/entries', foodEntryRoutes); // 食物记录相关路由 Food entry routes
app.use('/api/upload', uploadRoutes); // 文件上传相关路由 File upload routes

// 根路由，用于检查服务器是否运行
// Root route for checking if the server is running
app.get('/', (req, res) => {
    res.send('Food Finding API is running');
});

// 启动服务器
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
