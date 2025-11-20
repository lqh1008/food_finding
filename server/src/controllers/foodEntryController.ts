import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extend Request to include user property (added by auth middleware)
interface AuthRequest extends Request {
    user?: {
        userId: number;
    };
}

export const createEntry = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, imageUrl, rating, location, date } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const entry = await prisma.foodEntry.create({
            data: {
                title,
                description,
                imageUrl,
                rating: Number(rating),
                location,
                date: date ? new Date(date) : new Date(),
                userId,
            },
        });

        res.status(201).json(entry);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create entry', error });
    }
};

export const getEntries = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const entries = await prisma.foodEntry.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
        });

        res.status(200).json(entries);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch entries', error });
    }
};

export const getEntry = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const entry = await prisma.foodEntry.findFirst({
            where: { id: Number(id), userId },
        });

        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        res.status(200).json(entry);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch entry', error });
    }
};

export const updateEntry = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, imageUrl, rating, location, date } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const entry = await prisma.foodEntry.findFirst({
            where: { id: Number(id), userId },
        });

        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        const updatedEntry = await prisma.foodEntry.update({
            where: { id: Number(id) },
            data: {
                title,
                description,
                imageUrl,
                rating: Number(rating),
                location,
                date: date ? new Date(date) : undefined,
            },
        });

        res.status(200).json(updatedEntry);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update entry', error });
    }
};

export const deleteEntry = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const entry = await prisma.foodEntry.findFirst({
            where: { id: Number(id), userId },
        });

        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        await prisma.foodEntry.delete({
            where: { id: Number(id) },
        });

        res.status(200).json({ message: 'Entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete entry', error });
    }
};
