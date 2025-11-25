import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// 扩展 Request 接口，添加 user 属性
// Extend Request interface to add user property
interface AuthRequest extends Request {
    user?: {
        userId: number; // JWT 解码后的用户 ID
    };
}

// JWT 认证中间件
// JWT authentication middleware
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    // 从请求头获取 Authorization 字段
    // Get Authorization header from request
    const authHeader = req.headers['authorization'];
    // 提取 Bearer token（格式: "Bearer <token>"）
    // Extract Bearer token (format: "Bearer <token>")
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: '需要访问令牌' });
    }

    // 验证 JWT token
    // Verify JWT token
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) {
            // token 无效或已过期
            // Token is invalid or expired
            return res.status(401).json({ message: '令牌无效或已过期' });
        }
        // 将解码后的用户信息附加到 request 对象，供后续中间件和路由使用
        // Attach decoded user info to request object for use by subsequent middleware and routes
        req.user = user;
        next(); // 继续处理请求 Continue to next middleware
    });
};
