import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/authenticate';
import * as alertController from '../controllers/alertController';

const router = Router();

router.get('/', authenticate, alertController.list);
router.get('/team/:teamId', authenticate, alertController.getByTeam);
router.get('/:id', authenticate, alertController.get);
router.put('/:id/resolve', authenticate, alertController.resolve);
router.post('/run-detection', authenticate, requireAdmin, alertController.runDetection);

export default router;
