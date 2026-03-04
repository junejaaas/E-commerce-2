const catchAsync = require('../utils/catchAsync');
const orderService = require('../services/order.service');
const checkoutService = require('../services/checkout.service');

console.log('DEBUG: order.controller.js loading');
console.log('DEBUG: orderService in controller', orderService);

const getCheckoutSession = catchAsync(async (req, res) => {
    const { addressId } = req.query;
    const summary = await checkoutService.getCheckoutSummary(req.user.id, addressId);
    res.send(summary);
});

const createOrder = catchAsync(async (req, res) => {
    console.log('DEBUG: createOrder called');
    console.log('DEBUG: req.body', req.body);
    console.log('DEBUG: req.user', req.user);
    console.log('DEBUG: orderService', orderService);
    const { addressId, paymentMethod } = req.body;
    try {
        const order = await orderService.createOrder(req.user.id, addressId, paymentMethod);
        res.status(201).send(order);
    } catch (err) {
        console.error('DEBUG: createOrder error', err);
        throw err;
    }
});

const getOrders = catchAsync(async (req, res) => {
    const orders = await orderService.getOrders(req.user.id);
    res.send(orders);
});

const getOrder = catchAsync(async (req, res) => {
    const order = await orderService.getOrderById(req.params.orderId, req.user.id);
    res.send(order);
});

const cancelOrder = catchAsync(async (req, res) => {
    const order = await orderService.cancelOrder(req.params.orderId, req.user.id);
    res.send(order);
});

const reOrder = catchAsync(async (req, res) => {
    const cart = await orderService.reOrder(req.params.orderId, req.user.id);
    res.send(cart);
});

module.exports = {
    getCheckoutSession,
    createOrder,
    getOrders,
    getOrder,
    cancelOrder,
    reOrder
};
