import { Request, Response } from 'express';

interface MulterRequest extends Request {
    file?: any;
}

export const uploadImage = (req: MulterRequest, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.status(200).json({ imageUrl });
};
