import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'supersecretrefreshkey';

const generateTokens = (userId: number) => {
    const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });

        const { accessToken, refreshToken } = generateTokens(user.id);

        res.status(201).json({
            accessToken,
            refreshToken,
            user: { id: user.id, email: user.email, name: user.name }
        });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const { accessToken, refreshToken } = generateTokens(user.id);

        res.status(200).json({
            accessToken,
            refreshToken,
            user: { id: user.id, email: user.email, name: user.name }
        });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh Token is required' });
    }

    try {
        const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as { userId: number };
        const user = await prisma.user.findUnique({ where: { id: payload.userId } });

        if (!user) {
            return res.status(403).json({ message: 'User not found' });
        }

        const newTokens = generateTokens(user.id);

        res.status(200).json({
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken
        });
    } catch (error) {
        return res.status(403).json({ message: 'Invalid Refresh Token' });
    }
};
