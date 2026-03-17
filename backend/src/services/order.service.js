const Order = require('../models/order.model');
const Product = require('../models/product.model');
const cartService = require('./cart.service');
const checkoutService = require('./checkout.service');
const paymentService = require('./payment.service');
const AppError = require('../utils/AppError');

console.log('DEBUG: order.service.js loading');
console.log('DEBUG: checkoutService in order.service', checkoutService);

const createOrder = async (userId, addressId, paymentMethod) => {
    // 1. Get Summary (Validates cart & address, calcs totals)
    const summary = await checkoutService.getCheckoutSummary(userId, addressId);

    if (!summary || !summary.items) {
        throw new AppError("Cart is empty or checkout summary invalid", 400);
    }

    // 2. Process Payment
    // In real world, we might do this on client side (Stripe) or server side (COD/API)
    const paymentResult = await paymentService.processPayment(summary.total, paymentMethod);

    if (!paymentResult.success) {
        throw new AppError('Payment failed', 400);
    }

    // 3. Create Order
    // Snapshot items

    const orderItems = summary.items.map(item => ({
        product: item.product._id || item.product,
        name: item.product.name || 'Product', // Fallback if populate failed or manual item
        quantity: item.quantity,
        price: item.price,
        image: (item.product.images && item.product.images[0]) || '',
        totalProductPrice: item.totalProductPrice
    }));

    const order = await Order.create({
        user: userId,
        items: orderItems,
        shippingAddress: summary.address.toObject(), // Snapshot
        paymentMethod,
        paymentStatus: paymentResult.status,
        totalAmount: summary.total,
        subTotal: summary.subtotal,
        tax: summary.tax,
        shippingFee: summary.shipping,
        transactionId: paymentResult.transactionId
    });

    // 4. Update Inventory
    for (const item of summary.items) {
        // We assume product exists (checked in cart add), but good to be safe
        // Bulk write is better for performance, doing loop for simplicity now
        await Product.findByIdAndUpdate(item.product._id, {
            $inc: { stock: -item.quantity, sold: item.quantity }
        });
    }

    // 5. Clear Cart
    await cartService.clearCart(userId);

    return order;
};

const getOrders = async (userId) => {
    return await Order.find({ user: userId }).sort('-createdAt');
};

const getOrderById = async (orderId, userId) => {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) throw new AppError('Order not found', 404);
    return order;
};

const cancelOrder = async (orderId, userId) => {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) throw new AppError('Order not found', 404);

    if (order.orderStatus !== 'processing') {
        throw new AppError('Cannot cancel order that is shipped or delivered', 400);
    }

    // Restore Stock
    // We iterate items and add back to inventory
    // Ideally this should be a transaction
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
    if (!order) throw new AppError('Order not found', 404);

    // Add items to cart
    for (const item of order.items) {
        // We catch error in case product no longer exists or out of stock, 
        // but for re-order UX usually we try to add what we can.
        // For simplicity, we try to add.
        try {
            // Check if product exists first to avoid error spam
            const product = await Product.findById(item.product);
            if (product && product.stock >= item.quantity) {
                await cartService.addToCart(userId, item.product, item.quantity);
            }
        } catch (e) {
            // Context: Skip item if fail
        }
    }

    return await cartService.getCart(userId);
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    cancelOrder,
    reOrder
};
