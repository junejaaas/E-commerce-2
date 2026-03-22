const Return = require("../models/return.model");
const catchAsync = require("../utils/catchAsync");


// 1️⃣ Initiate Return
const Order = require("../models/order.model");

exports.createReturn = catchAsync(async (req, res) => {

    const { orderId, productId, quantity, reason, type } = req.body;

    // 1️⃣ Get the order
    const order = await Order.findById(orderId);

    if (!order) {
        return res.status(404).json({
            message: "Order not found"
        });
    }

    // 2️⃣ Check if product exists in that order
    const item = order.items.find(
        item => item.product.toString() === productId
    );

    if (!item) {
        return res.status(400).json({
            message: "Product not found in this order"
        });
    }

    // 3️⃣ Validate quantity
    if (quantity > item.quantity) {
        return res.status(400).json({
            message: "Return quantity exceeds ordered quantity"
        });
    }

    // 4️⃣ Create return request
    const newReturn = await Return.create({
        order: orderId,
        product: productId,
        quantity,
        user: req.user.id,
        reason,
        type
    });

    // Trigger: Return Request
    const io = req.app.get('io');
    const { createNotification } = require('./notification.controller');
    await createNotification(io, {
        recipientType: 'admin',
        type: 'RETURN_REQUEST',
        title: 'New Return Request',
        message: `A return request was created for Order #${orderId}. Reason: ${reason}`,
        metadata: { returnId: newReturn._id, orderId, userId: req.user.id }
    });

    res.status(201).json({
        status: "success",
        data: newReturn
    });

});

// 2️⃣ Track Refund Status
exports.getRefundStatus = catchAsync(async (req, res) => {

    const returnRequest = await Return.findById(req.params.id);

    res.status(200).json({
        status: "success",
        refundStatus: returnRequest.refundStatus
    });
});


// 3️⃣ Get User Returns
exports.getUserReturns = catchAsync(async (req, res) => {

    const returns = await Return.find({ user: req.user.id })
        .populate("order")
        .populate("product");

    res.status(200).json({
        status: "success",
        data: returns
    });
});

exports.cancelReturn = catchAsync(async (req, res) => {

    const returnRequest = await Return.findById(req.params.id);

    if (!returnRequest) {
        return res.status(404).json({
            message: "Return request not found"
        });
    }

    // Only allow cancellation if return is not processed
    if (returnRequest.status !== "Requested") {
        return res.status(400).json({
            message: "Return request cannot be cancelled"
        });
    }

    returnRequest.status = "Cancelled";

    await returnRequest.save();

    res.status(200).json({
        status: "success",
        message: "Return request cancelled successfully",
        data: returnRequest
    });

});