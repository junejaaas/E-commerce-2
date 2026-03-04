const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const orderController = require('../controllers/order.controller');
// Validation middleware could be added here for order creation

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/checkout', orderController.getCheckoutSession);

router
    .route('/')
    .post(orderController.createOrder)
    .get(orderController.getOrders);

router
    .route('/:orderId')
    .get(orderController.getOrder);

router.post('/:orderId/cancel', orderController.cancelOrder);
router.post('/:orderId/reorder', orderController.reOrder);

module.exports = router;
