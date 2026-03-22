import express, { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import * as ctrl from '../controllers/ruleController';

const router: Router = express.Router();

router.use(authenticate);

router.get('/',        ctrl.list);
router.post('/',       ctrl.create);
router.put('/:id',     ctrl.update);
router.delete('/:id',  ctrl.remove);

export default router;
