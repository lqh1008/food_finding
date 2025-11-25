import multer from 'multer'; // 用于处理文件上传的中间件
import path from 'path';
import fs from 'fs';

// 上传目录路径
// Upload directory path
const uploadDir = 'uploads';

// 如果上传目录不存在则创建
// Create upload directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 配置 multer 的存储方式
// Configure multer storage
const storage = multer.diskStorage({
    // 指定文件保存的目录
    // Specify the destination directory for files
    destination: (req: any, file: any, cb: any) => {
        cb(null, uploadDir);
    },
    // 自定义文件名，使用时间戳 + 随机数确保唯一性
    // Customize filename using timestamp + random number to ensure uniqueness
    filename: (req: any, file: any, cb: any) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // 保留原始文件扩展名
    },
});

// 导出配置好的 multer 实例
// Export configured multer instance
export const upload = multer({ storage });
