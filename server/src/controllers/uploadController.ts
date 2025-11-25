import { Request, Response } from 'express';

// 扩展 Request 接口以包含 multer 添加的 file 属性
// Extend Request interface to include file property added by multer
interface MulterRequest extends Request {
    file?: any; // multer 中间件会在这里添加上传的文件信息
}

// 处理图片上传
// Handle image upload
export const uploadImage = (req: MulterRequest, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ message: '未上传文件' });
    }
    // 构建完整的图片 URL，客户端可以用这个 URL 访问上传的图片
    // Build complete image URL that clients can use to access the uploaded image
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.status(200).json({ imageUrl });
};
