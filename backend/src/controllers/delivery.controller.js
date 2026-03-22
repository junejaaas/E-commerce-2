const Order = require('../models/order.model');
const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const orderService = require('../services/order.service');

/**
 * Get orders available for delivery
 * (Currently returns all 'shipped' or 'confirmed' orders)
 */
const getAvailableOrders = catchAsync(async (req, res) => {
    const orders = await Order.find({
        orderStatus: { $in: ['confirmed', 'shipped', 'processing'] },
        deliveryAgent: req.user._id
    })
    .sort({ createdAt: -1 })
    .populate('user', 'name email');

    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: orders
    });
});

/**
 * Update order status to delivered
 * (This will trigger the auto-payment logic in orderService)
 */
const updateDeliveryStatus = catchAsync(async (req, res) => {
    const { orderId } = req.params;
    const { status, paymentStatus, collectedAmount } = req.body; 

    if (!['picked', 'shipped', 'delivered'].includes(status)) {
        throw new AppError('Invalid status update for delivery personnel', 400);
    }

    // Enforce transition logic (optional but recommended)
    const orderToUpdate = await Order.findById(orderId);
    if (status === 'shipped' && orderToUpdate.orderStatus !== 'picked') {
        throw new AppError('Order must be picked up before it can be marked as Out for Delivery', 400);
    }
    if (status === 'delivered') {
        throw new AppError('Please use the OTP verification endpoint to mark orders as delivered', 400);
    }

    const order = await orderService.updateOrderStatus(orderId, status, paymentStatus, undefined, collectedAmount);

    res.status(200).json({
        status: 'success',
        data: order
    });
});

/**
 * Get delivery history for the current agent
 */
const getDeliveryHistory = catchAsync(async (req, res) => {
    const { range } = req.query; // 'today', 'weekly', 'all'
    let query = { 
        deliveryAgent: req.user._id, 
        orderStatus: 'delivered' 
    };

    if (range === 'today') {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        query.deliveredAt = { $gte: start };
    } else if (range === 'weekly') {
        const start = new Date();
        start.setDate(start.getDate() - 7);
        query.deliveredAt = { $gte: start };
    }

    const orders = await Order.find(query).sort({ deliveredAt: -1 }).populate('user', 'name');
    
    // Calculate stats
    const totalCash = orders.reduce((acc, o) => acc + (o.collectedAmount || 0), 0);
    const pendingSettlement = orders.filter(o => !o.isSettled).reduce((acc, o) => acc + (o.collectedAmount || 0), 0);

    res.status(200).json({
        status: 'success',
        data: {
            orders,
            stats: {
                totalCash,
                pendingSettlement,
                count: orders.length
            }
        }
    });
});

/**
 * Reset password for delivery agents
 */
const resetDeliveryPassword = catchAsync(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
        throw new AppError('Please provide both old and new passwords', 400);
    }
    
    // Get user with password explicitly
    const user = await User.findById(req.user.id).select('+password');
    
    if (!(await user.correctPassword(oldPassword, user.password))) {
        throw new AppError('Incorrect old password', 401);
    }
    
    user.password = newPassword;
    user.mustResetPassword = false;
    await user.save();
    
    res.status(200).json({
        status: 'success',
        message: 'Password successfully updated'
    });
});

module.exports = {
    getAvailableOrders,
    updateDeliveryStatus,
    getDeliveryHistory,
    resetDeliveryPassword
};
