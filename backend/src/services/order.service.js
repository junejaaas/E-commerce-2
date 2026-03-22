const Order = require('../models/order.model');
const Product = require('../models/product.model');
const cartService = require('./cart.service');
const checkoutService = require('./checkout.service');
const paymentService = require('./payment.service');
const AppError = require('../utils/AppError');

const { createNotification } = require('../controllers/notification.controller');

const createOrder = async (userId, addressId, paymentMethod, io) => {

    const summary = await checkoutService.getCheckoutSummary(userId, addressId);

    if (!summary || !summary.items) {
        throw new AppError("Cart is empty or checkout summary invalid", 400);
    }

    const paymentResult = await paymentService.processPayment(summary.total, paymentMethod);

    if (!paymentResult.success) {
        // Trigger: Payment Failure
        await createNotification(io, {
            recipientType: 'admin',
            type: 'PAYMENT_FAILURE',
            title: 'Payment Failed',
            message: `A payment attempt of ${summary.total} for user ${userId} failed.`,
            metadata: { userId, amount: summary.total, method: paymentMethod }
        });
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

    // Trigger: New Order
    await createNotification(io, {
        recipientType: 'admin',
        type: 'NEW_ORDER',
        title: 'New Order Received',
        message: `Order #${order._id} has been placed for $${order.totalAmount}.`,
        metadata: { orderId: order._id, totalAmount: order.totalAmount }
    });

    for (const item of summary.items) {
        const product = await Product.findByIdAndUpdate(item.product._id, {
            $inc: { stock: -item.quantity, sold: item.quantity }
        }, { new: true });

        // Trigger: Low Inventory (threshold <= 10)
        if (product.stock <= 10) {
            await createNotification(io, {
                recipientType: 'admin',
                type: 'LOW_INVENTORY',
                title: 'Low Inventory Alert',
                message: `Product "${product.name}" is low on stock (${product.stock} left).`,
                metadata: { productId: product._id, stock: product.stock, productName: product.name }
            });
        }
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

const updateOrderStatus = async (orderId, status, paymentStatus, deliveryAgent, collectedAmount, isSettled) => {

    const order = await Order.findById(orderId);

    if (!order) {
        throw new AppError("Order not found", 404);
    }

    // Update fields
    if (status) order.orderStatus = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    
    // Handle agent assignment/unassignment
    if (deliveryAgent !== undefined) {
        order.deliveryAgent = deliveryAgent || null;
    }
    
    if (collectedAmount !== undefined) {
        order.collectedAmount = collectedAmount;
    }

    if (isSettled !== undefined) {
        order.isSettled = isSettled;
    }

    // Validation: Cannot be in progress/delivered without an agent
    if (['picked', 'shipped', 'delivered'].includes(order.orderStatus) && !order.deliveryAgent) {
        throw new AppError(`Cannot set status to ${order.orderStatus} without an assigned delivery agent`, 400);
    }

    // Automation: If COD and delivered, mark as paid
    const pMethod = order.paymentMethod?.toLowerCase() || '';
    const isCOD = pMethod.includes('cod') || pMethod.includes('cash');
    
    if (order.orderStatus === 'delivered' && isCOD && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
    }
    
    if (order.orderStatus === 'delivered' && !order.deliveredAt) {
        order.deliveredAt = new Date();
    }

    // Agent earnings tracking
    if (status === 'delivered' && order.deliveryAgent) {
        const User = require('../models/user.model');
        await User.findByIdAndUpdate(order.deliveryAgent, {
            $inc: { totalEarnings: 50, totalDeliveries: 1 } // Placeholder: ₹50 per delivery
        });
    }

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

const refundOrder = async (orderId) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new AppError("Order not found", 404);
    }

    if (order.paymentStatus !== 'paid') {
        throw new AppError('Only paid orders can be refunded', 400);
    }

    // Restore stock
    for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity, sold: -item.quantity }
        });
    }

    order.paymentStatus = 'refunded';
    order.orderStatus = 'cancelled';
    await order.save();

    return order;
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    cancelOrder,
    reOrder,
    getAllOrdersAdmin,
    getOrderByIdAdmin,
    updateOrderStatus,
    refundOrder
};