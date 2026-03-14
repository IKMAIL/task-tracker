import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import * as auditController from '../controllers/auditController';

const router: Router = Router();

router.get('/', authenticate, auditController.list);

export default router;
