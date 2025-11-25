import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'; // 用于密码加密 Used for password hashing
import jwt from 'jsonwebtoken'; // 用于生成 JWT 令牌 Used for generating JWT tokens

const prisma = new PrismaClient();
// 从环境变量获取密钥，如果没有则使用默认值（仅用于开发）
// Get secrets from environment variables, fallback to default (dev only)
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'supersecretrefreshkey';

// 生成访问令牌和刷新令牌的辅助函数
// Helper function to generate access and refresh tokens
const generateTokens = (userId: number) => {
    // Access Token: 短期有效 (15分钟)，用于访问受保护资源
    // Access Token: Short-lived (15m), used to access protected resources
    const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });

    // Refresh Token: 长期有效 (7天)，用于获取新的 Access Token
    // Refresh Token: Long-lived (7d), used to get new Access Token
    const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    return { accessToken, refreshToken };
};

// 用户注册控制器
// User registration controller
export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        // 检查用户是否已存在
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        }); // 使用 Prisma 客户端查询数据库中是否存在指定 email 的用户
        if (existingUser) {
            return res.status(400).json({ message: '该邮箱已被注册' });
        }

        // 对密码进行哈希加密，10 是 salt rounds (盐轮数)
        // Hash the password, 10 is the salt rounds
        // Salt rounds 决定了哈希计算的复杂度。数值越高，计算越慢，越难被暴力破解。
        // Salt rounds determines the complexity of the hash calculation. Higher value means slower calculation, harder to brute-force.
        // 10 是一个在安全性和性能之间很好的平衡点 (约 100ms)。
        // 10 is a good balance between security and performance (approx 100ms).
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed Password:', hashedPassword);

        // 在数据库中创建新用户
        // Create new user in database
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });

        // 注册成功后直接生成令牌，让用户自动登录
        // Generate tokens immediately after registration for auto-login
        const { accessToken, refreshToken } = generateTokens(user.id);

        res.status(201).json({
            accessToken,
            refreshToken,
            user: { id: user.id, email: user.email, name: user.name }
        });
    } catch (error) {
        res.status(500).json({ message: '注册失败，请稍后重试', error });
    }
};

// 用户登录控制器
// User login controller
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // 查找用户
        // Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: '邮箱或密码错误' });
        }

        // 验证密码
        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: '邮箱或密码错误' });
        }

        // 生成新的令牌
        // Generate new tokens
        const { accessToken, refreshToken } = generateTokens(user.id);

        res.status(200).json({
            accessToken,
            refreshToken,
            user: { id: user.id, email: user.email, name: user.name }
        });
    } catch (error) {
        res.status(500).json({ message: '登录失败，请稍后重试', error });
    }
};

// 刷新令牌控制器
// Refresh token controller
export const refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: '需要提供刷新令牌' });
    }

    try {
        // 验证 Refresh Token 的有效性
        // Verify validity of Refresh Token
        const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as { userId: number };

        // 确保用户仍然存在
        // Ensure user still exists
        const user = await prisma.user.findUnique({ where: { id: payload.userId } });

        if (!user) {
            return res.status(403).json({ message: '用户不存在' });
        }

        // 生成全新的一对令牌 (包括新的 Refresh Token，实现令牌轮换)
        // Generate a brand new pair of tokens (including new Refresh Token, implementing token rotation)
        const newTokens = generateTokens(user.id);

        res.status(200).json({
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken
        });
    } catch (error) {
        return res.status(403).json({ message: '无效的刷新令牌' });
    }
};
