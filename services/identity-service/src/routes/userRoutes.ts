import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/authenticate';
import * as userController from '../controllers/userController';

const router: Router = Router();

router.get('/', authenticate, requireAdmin, userController.list);
router.get('/:id', authenticate, userController.get);
router.put('/:id', authenticate, userController.update);

export default router;
