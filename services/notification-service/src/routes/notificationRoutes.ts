import express, { Router } from 'express';
import * as ctrl from '../controllers/notificationController';
import { authenticate } from '../middleware/authenticate';

const router: Router = express.Router();

router.use(authenticate);

router.get('/', ctrl.list);
router.get('/unread-count', ctrl.unreadCount);
router.post('/mark-read', ctrl.markRead);
router.get('/:id', ctrl.getById);
router.put('/:id/snooze', ctrl.snooze);
router.delete('/:id', ctrl.dismiss);

export default router;
