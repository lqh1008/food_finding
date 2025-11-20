import { Router } from 'express';
import { upload } from '../config/multer';
import { uploadImage } from '../controllers/uploadController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateToken, upload.single('image'), uploadImage);

export default router;
