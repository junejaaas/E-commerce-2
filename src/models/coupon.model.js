const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, 'Please provide a coupon code'],
            unique: true,
            uppercase: true,
            trim: true,
        },
        discountType: {
            type: String,
            required: [true, 'Please provide a discount type'],
            enum: ['percentage', 'flat'],
            default: 'flat',
        },
        discountAmount: {
            type: Number,
            required: [true, 'Please provide a discount amount'],
            min: [0, 'Discount amount cannot be negative'],
        },
        minOrderAmount: {
            type: Number,
            default: 0,
            min: [0, 'Minimum order amount cannot be negative'],
        },
        expiryDate: {
            type: Date,
            required: [true, 'Please provide an expiry date'],
        },
        usageLimit: {
            type: Number,
            default: null, // null means unlimited
        },
        usedCount: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Method to check if coupon is valid
couponSchema.methods.isValid = function (orderAmount) {
    const now = new Date();
    if (!this.isActive) return false;
    if (this.expiryDate < now) return false;
    if (this.usageLimit !== null && this.usedCount >= this.usageLimit) return false;
    if (orderAmount < this.minOrderAmount) return false;
    return true;
};

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
