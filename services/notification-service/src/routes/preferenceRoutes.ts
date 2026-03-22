import express, { Router } from 'express';
import * as ctrl from '../controllers/preferenceController';
import { authenticate } from '../middleware/authenticate';

const router: Router = express.Router();

router.use(authenticate);
router.get('/', ctrl.get);
router.put('/', ctrl.update);

export default router;
