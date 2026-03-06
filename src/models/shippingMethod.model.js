const mongoose = require('mongoose');

const shippingMethodSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a shipping method name'],
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Please provide a shipping method description'],
        },
        cost: {
            type: Number,
            required: [true, 'Please provide shipping cost'],
            min: [0, 'Cost cannot be negative'],
        },
        estimatedDelivery: {
            type: String,
            required: [true, 'Please provide estimated delivery time'],
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

const ShippingMethod = mongoose.model('ShippingMethod', shippingMethodSchema);

module.exports = ShippingMethod;
