import { Router } from 'express';
import { upload } from '../config/multer'; // multer 配置实例
import { uploadImage } from '../controllers/uploadController';
import { authenticateToken } from '../middleware/authMiddleware';

// 创建路由器实例
// Create router instance
const router = Router();

// 文件上传路由：先验证身份，然后使用 multer 处理单个图片，最后调用控制器
// File upload route: authenticate first, then use multer to handle single image, finally call controller
router.post('/', authenticateToken, upload.single('image'), uploadImage);

export default router;
