import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/authenticate';
import * as importController from '../controllers/importController';

const router: Router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/teams', authenticate, upload.single('file'), importController.importTeams);
router.post('/members', authenticate, upload.single('file'), importController.importMembers);
router.post('/team-members', authenticate, upload.single('file'), importController.importTeamMembers);

export default router;
