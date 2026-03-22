import express, { Router } from 'express';
import * as ctrl from '../controllers/subscriptionController';
import { authenticate } from '../middleware/authenticate';

const router: Router = express.Router();

router.use(authenticate);
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.delete('/:taskId', ctrl.remove);

export default router;
