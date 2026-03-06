const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema({

    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },

    trackingId: {
        type: String,
        required: true,
        unique: true
    },

    status: {
        type: String,
        enum: [
            "Processing",
            "Shipped",
            "Out for Delivery",
            "Delivered"
        ],
        default: "Processing"
    },

    estimatedDelivery: Date,
    deliveredAt: Date

}, { timestamps: true });

module.exports = mongoose.model("Shipment", shipmentSchema);