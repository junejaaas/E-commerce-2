const AppError = require('../utils/AppError');

const processPayment = async (amount, method) => {
    // Mock Payment Logic
    // In a real app, this would integrate with Stripe/Razorpay

    if (!['card', 'upi', 'cod', 'Cash on Delivery', 'Razorpay'].includes(method)) {
        throw new AppError('Invalid payment method', 400);
    }

    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 500));

    if (method === 'cod' || method === 'Cash on Delivery') {
        return {
            success: true,
            status: 'pending', // COD is paid later
            transactionId: `cod_${Date.now()}`
        };
    }

    // Simulate success for other methods
    return {
        success: true,
        status: 'paid',
        transactionId: `txn_${Date.now()}`
    };
};

module.exports = {
    processPayment
};
