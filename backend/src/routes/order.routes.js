const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const orderController = require('../controllers/order.controller');

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/checkout', orderController.getCheckoutSession);

// DELIVERY & ADMIN
router.post('/verify-delivery-otp', authMiddleware.authorize('delivery', 'admin'), orderController.verifyDeliveryOTP);

// ADMIN
router.get("/admin", authMiddleware.authorize('admin'), orderController.getAllOrdersAdmin);
router.get("/admin/:orderId", authMiddleware.authorize('admin'), orderController.getOrderAdmin);
router.patch("/admin/:orderId", authMiddleware.authorize('admin'), orderController.updateOrderStatus);
router.patch("/admin/:orderId/refund", authMiddleware.authorize('admin'), orderController.refundOrder);

// USER
router
    .route('/')
    .post(orderController.createOrder)
    .get(orderController.getOrders);

router
    .route('/:orderId')
    .get(orderController.getOrder);

router.post('/:orderId/cancel', orderController.cancelOrder);
router.post('/:orderId/reorder', orderController.reOrder);

router.get("/:orderId/invoice", orderController.downloadInvoice);

module.exports = router;