const Order = require('../models/order.model');
const Product = require('../models/product.model');
const cartService = require('./cart.service');
const checkoutService = require('./checkout.service');
const paymentService = require('./payment.service');
const AppError = require('../utils/AppError');

const createOrder = async (userId, addressId, paymentMethod) => {

    const summary = await checkoutService.getCheckoutSummary(userId, addressId);

    if (!summary || !summary.items) {
        throw new AppError("Cart is empty or checkout summary invalid", 400);
    }

    const paymentResult = await paymentService.processPayment(summary.total, paymentMethod);

    if (!paymentResult.success) {
        throw new AppError('Payment failed', 400);
    }

    const orderItems = summary.items.map(item => ({
        product: item.product._id || item.product,
        name: item.product.name || 'Product',
        quantity: item.quantity,
        price: item.price,
        image: (item.product.images && item.product.images[0]) || '',
        totalProductPrice: item.totalProductPrice
    }));

    const order = await Order.create({
        user: userId,
        items: orderItems,
        shippingAddress: summary.address.toObject(),
        paymentMethod,
        paymentStatus: paymentResult.status,
        totalAmount: summary.total,
        subTotal: summary.subtotal,
        tax: summary.tax,
        shippingFee: summary.shipping,
        transactionId: paymentResult.transactionId
    });

    for (const item of summary.items) {
        await Product.findByIdAndUpdate(item.product._id, {
            $inc: { stock: -item.quantity, sold: item.quantity }
        });
    }

    await cartService.clearCart(userId);

    return order;
};

const getOrders = async (userId) => {
    return await Order.find({ user: userId }).sort('-createdAt');
};

const getAllOrdersAdmin = async () => {
    return await Order.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 });
};

const getOrderById = async (orderId, userId) => {

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
        throw new AppError('Order not found', 404);
    }

    return order;
};

const getOrderByIdAdmin = async (orderId) => {

    const order = await Order.findById(orderId)
        .populate("user", "name email")
        .populate("items.product");

    if (!order) {
        throw new AppError("Order not found", 404);
    }

    return order;
};

const updateOrderStatus = async (orderId, status) => {

    const order = await Order.findById(orderId);

    if (!order) {
        throw new AppError("Order not found", 404);
    }

    order.orderStatus = status;

    await order.save();

    return order;
};

const cancelOrder = async (orderId, userId) => {

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
        throw new AppError('Order not found', 404);
    }

    if (order.orderStatus !== 'processing') {
        throw new AppError('Cannot cancel order that is shipped or delivered', 400);
    }

    for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity, sold: -item.quantity }
        });
    }

    order.orderStatus = 'cancelled';

    await order.save();

    return order;
};

const reOrder = async (orderId, userId) => {

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
        throw new AppError('Order not found', 404);
    }

    for (const item of order.items) {

        try {

            const product = await Product.findById(item.product);

            if (product && product.stock >= item.quantity) {
                await cartService.addToCart(userId, item.product, item.quantity);
            }

        } catch (e) { }

    }

    return await cartService.getCart(userId);
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    cancelOrder,
    reOrder,
    getAllOrdersAdmin,
    getOrderByIdAdmin,
    updateOrderStatus
};