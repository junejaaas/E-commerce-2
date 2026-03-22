const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    image: { type: String },
    totalProductPrice: { type: Number, required: true }
}, { _id: false });

const orderSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [orderItemSchema],
        shippingAddress: {
            type: Object, // Snapshot of address
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ['card', 'upi', 'cod', 'Cash on Delivery', 'Razorpay'],
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
        },
        orderStatus: {
            type: String,
            enum: ['pending', 'processing', 'confirmed', 'picked', 'shipped', 'delivered', 'cancelled', 'returned'],
            default: 'processing',
        },
        totalAmount: { type: Number, required: true },
        collectedAmount: { type: Number },
        deliveredAt: { type: Date },
        isSettled: { type: Boolean, default: false },
        deliveryOTP: { type: String, select: false },
        otpVerified: { type: Boolean, default: false },
        otpAttempts: { type: Number, default: 0 },
        otpGeneratedAt: { type: Date },
        tax: { type: Number, default: 0 },
        shippingFee: { type: Number, default: 0 },
        subTotal: { type: Number, required: true },
        transactionId: { type: String },
        deliveryAgent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Order', orderSchema);
