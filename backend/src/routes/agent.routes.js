const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agent.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/', agentController.getAllAgents);
router.post('/', agentController.createAgent);
router.delete('/:id', agentController.deleteAgent);

module.exports = router;
