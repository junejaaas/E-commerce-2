const catchAsync = require('../utils/catchAsync');
const orderService = require('../services/order.service');
const checkoutService = require('../services/checkout.service');
const PDFDocument = require("pdfkit");
const Order = require("../models/order.model");

// Checkout summary
const getCheckoutSession = catchAsync(async (req, res) => {

    const { addressId } = req.query;

    const summary = await checkoutService.getCheckoutSummary(
        req.user.id,
        addressId
    );

    res.send(summary);

});

// Create order
const createOrder = catchAsync(async (req, res) => {

    const { addressId, paymentMethod } = req.body;

    const io = req.app.get('io');

    const order = await orderService.createOrder(
        req.user.id,
        addressId,
        paymentMethod,
        io
    );

    res.status(201).send(order);

});

// Get user orders
const getOrders = catchAsync(async (req, res) => {

    const orders = await orderService.getOrders(req.user.id);

    res.send(orders);

});

// Admin: get all orders
const getAllOrdersAdmin = catchAsync(async (req, res) => {

    const orders = await orderService.getAllOrdersAdmin();

    res.status(200).json(orders);

});

// User order
const getOrder = catchAsync(async (req, res) => {

    const order = await orderService.getOrderById(
        req.params.orderId,
        req.user.id
    );

    res.send(order);

});

// Admin order details
const getOrderAdmin = catchAsync(async (req, res) => {

    const order = await orderService.getOrderByIdAdmin(
        req.params.orderId
    );

    res.status(200).json(order);

});

// Update order status
const updateOrderStatus = catchAsync(async (req, res) => {

    const { status, paymentStatus, deliveryAgent, collectedAmount, isSettled } = req.body;

    const order = await orderService.updateOrderStatus(
        req.params.orderId,
        status,
        paymentStatus,
        deliveryAgent,
        collectedAmount,
        isSettled
    );

    res.status(200).json(order);

});

// Cancel order
const cancelOrder = catchAsync(async (req, res) => {

    const order = await orderService.cancelOrder(
        req.params.orderId,
        req.user.id
    );

    res.send(order);

});

// Reorder
const reOrder = catchAsync(async (req, res) => {

    const cart = await orderService.reOrder(
        req.params.orderId,
        req.user.id
    );

    res.send(cart);

});

// Download invoice
const downloadInvoice = catchAsync(async (req, res) => {

    const order = await Order.findById(req.params.orderId)
        .populate("items.product");

    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename=invoice-${order._id}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(20).text("Order Invoice");
    doc.moveDown();

    doc.text(`Order ID: ${order._id}`);
    doc.text(`Total Price: ₹${order.totalAmount}`);
    doc.text(`Status: ${order.orderStatus}`);
    doc.text(`Date: ${order.createdAt}`);

    doc.moveDown();
    doc.text("Items:");

    order.items.forEach(item => {

        doc.text(
            `${item.product?.name || "Product"} x${item.quantity} ₹${item.price * item.quantity}`
        );

    });

    doc.moveDown();
    doc.text(`Grand Total: ₹${order.totalAmount}`);

    doc.end();

});

const refundOrder = catchAsync(async (req, res) => {
    const order = await orderService.refundOrder(req.params.orderId);
    res.status(200).json(order);
});

module.exports = {
    getCheckoutSession,
    createOrder,
    getOrders,
    getAllOrdersAdmin,
    getOrder,
    getOrderAdmin,
    updateOrderStatus,
    cancelOrder,
    reOrder,
    downloadInvoice,
    refundOrder
};