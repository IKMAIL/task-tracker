const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/authenticate');
const userController = require('../controllers/userController');

router.get('/',    authenticate, requireAdmin, userController.list);
router.get('/:id', authenticate, userController.get);
router.put('/:id', authenticate, userController.update);

module.exports = router;
