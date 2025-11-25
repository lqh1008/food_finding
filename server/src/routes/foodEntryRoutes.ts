import { Router } from 'express';
import {
    createEntry,
    getEntries,
    getEntry,
    updateEntry,
    deleteEntry,
} from '../controllers/foodEntryController';
import { authenticateToken } from '../middleware/authMiddleware';

// 创建路由器实例
// Create router instance
const router = Router();

// 使用认证中间件保护所有路由，确保只有登录用户才能访问
// Use authentication middleware to protect all routes, ensuring only logged-in users can access
router.use(authenticateToken);

// 定义食物记录的 CRUD 路由
// Define CRUD routes for food entries
router.post('/', createEntry); // 创建新记录 Create new entry
router.get('/', getEntries); // 获取所有记录 Get all entries
router.get('/:id', getEntry); // 获取单个记录 Get single entry
router.put('/:id', updateEntry); // 更新记录 Update entry
router.delete('/:id', deleteEntry); // 删除记录 Delete entry

export default router;
