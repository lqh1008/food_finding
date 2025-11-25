import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'; // Prisma ORM 客户端，用于数据库操作

const prisma = new PrismaClient();

// 扩展 Request 接口，添加 user 属性（由认证中间件添加）
// Extend Request to include user property (added by auth middleware)
interface AuthRequest extends Request {
    user?: {
        userId: number; // 当前登录用户的 ID
    };
}

// 创建新的食物记录
// Create a new food entry
export const createEntry = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, imageUrl, rating, location, date } = req.body;
        const userId = req.user?.userId; // 从中间件添加的 user 对象获取用户 ID

        if (!userId) {
            return res.status(401).json({ message: '未授权' });
        }

        // 使用 Prisma 创建新的食物记录
        // Use Prisma to create a new food entry
        const entry = await prisma.foodEntry.create({
            data: {
                title,
                description,
                imageUrl,
                rating: Number(rating), // 确保评分是数字类型
                location,
                date: date ? new Date(date) : new Date(), // 如果没有提供日期则使用当前日期
                userId, // 关联到当前用户
            },
        });

        res.status(201).json(entry);
    } catch (error) {
        res.status(500).json({ message: '创建记录失败', error });
    }
};

// 获取当前用户的所有食物记录
// Get all food entries for the current user
export const getEntries = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: '未授权' });
        }

        // 查询属于当前用户的所有记录，按日期降序排列
        // Query all entries belonging to current user, ordered by date descending
        const entries = await prisma.foodEntry.findMany({
            where: { userId }, // 只返回当前用户的记录
            orderBy: { date: 'desc' }, // 最新的记录排在前面
        });

        res.status(200).json(entries);
    } catch (error) {
        res.status(500).json({ message: '获取记录失败', error });
    }
};

// 获取单个食物记录详情
// Get a single food entry by ID
export const getEntry = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params; // 从 URL 参数获取记录 ID
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: '未授权' });
        }

        // 查询指定 ID 且属于当前用户的记录（防止用户访问别人的记录）
        // Query entry with specified ID belonging to current user (prevent unauthorized access)
        const entry = await prisma.foodEntry.findFirst({
            where: { id: Number(id), userId },
        });

        if (!entry) {
            return res.status(404).json({ message: '记录不存在' });
        }

        res.status(200).json(entry);
    } catch (error) {
        res.status(500).json({ message: '获取记录失败', error });
    }
};

// 更新食物记录
// Update a food entry
export const updateEntry = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, imageUrl, rating, location, date } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: '未授权' });
        }

        // 先检查记录是否存在且属于当前用户
        // First check if entry exists and belongs to current user
        const entry = await prisma.foodEntry.findFirst({
            where: { id: Number(id), userId },
        });

        if (!entry) {
            return res.status(404).json({ message: '记录不存在' });
        }

        // 更新记录
        // Update the entry
        const updatedEntry = await prisma.foodEntry.update({
            where: { id: Number(id) },
            data: {
                title,
                description,
                imageUrl,
                rating: Number(rating),
                location,
                date: date ? new Date(date) : undefined, // 如果提供了新日期则更新
            },
        });

        res.status(200).json(updatedEntry);
    } catch (error) {
        res.status(500).json({ message: '更新记录失败', error });
    }
};

// 删除食物记录
// Delete a food entry
export const deleteEntry = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: '未授权' });
        }

        // 先检查记录是否存在且属于当前用户
        // First check if entry exists and belongs to current user
        const entry = await prisma.foodEntry.findFirst({
            where: { id: Number(id), userId },
        });

        if (!entry) {
            return res.status(404).json({ message: '记录不存在' });
        }

        // 删除记录
        // Delete the entry
        await prisma.foodEntry.delete({
            where: { id: Number(id) },
        });

        res.status(200).json({ message: '删除成功' });
    } catch (error) {
        res.status(500).json({ message: '删除记录失败', error });
    }
};
