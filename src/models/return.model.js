const mongoose = require("mongoose");

const returnSchema = new mongoose.Schema(
{
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },

    quantity: {
        type: Number,
        default: 1
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    reason: {
        type: String,
        required: true
    },

    type: {
        type: String,
        enum: ["Refund", "Replacement"],
        default: "Refund"
    },

    status: {
        type: String,
        enum: ["Requested", "Approved", "Rejected", "Refunded", "Cancelled"],
        default: "Requested"
    },

    refundStatus: {
        type: String,
        enum: ["Pending", "Processing", "Completed"],
        default: "Pending"
    }

},
{ timestamps: true }
);

module.exports = mongoose.model("Return", returnSchema);