import { Router } from 'express';
import { register, login, refreshToken } from '../controllers/authController';

// 创建路由器实例
// Create router instance
const router = Router();

// 定义认证相关的路由
// Define authentication-related routes
router.post('/register', register); // 用户注册 User registration
router.post('/login', login); // 用户登录 User login
router.post('/refresh-token', refreshToken); // 刷新令牌 Refresh token

export default router;
