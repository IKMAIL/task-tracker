import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/authenticate';
import * as importController from '../controllers/importController';

const router: Router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/tasks', authenticate, upload.single('file'), importController.importTasks);

export default router;
