const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/authenticate');
const alertController = require('../controllers/alertController');

router.get('/',                    authenticate, alertController.list);
router.get('/team/:teamId',        authenticate, alertController.getByTeam);
router.get('/:id',                 authenticate, alertController.get);
router.put('/:id/resolve',         authenticate, alertController.resolve);
router.post('/run-detection',      authenticate, requireAdmin, alertController.runDetection);

module.exports = router;
