const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/delivery.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);
router.use(authorize('delivery', 'admin'));

router.get('/orders', deliveryController.getAvailableOrders);
router.get('/history', deliveryController.getDeliveryHistory);
router.patch('/orders/:orderId/status', deliveryController.updateDeliveryStatus);

module.exports = router;
