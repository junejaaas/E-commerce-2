const catchAsync = require('../utils/catchAsync');
const checkoutService = require('../services/checkout.service');

const getCheckoutSummary = catchAsync(async (req, res) => {
    const { addressId, couponCode, shippingMethodId } = req.query;
    const summary = await checkoutService.getCheckoutSummary(
        req.user._id,
        addressId,
        couponCode,
        shippingMethodId
    );

    res.status(200).json({
        status: 'success',
        data: summary,
    });
});

const applyCoupon = catchAsync(async (req, res) => {
    const { couponCode, subtotal } = req.body;
    const discount = await checkoutService.applyCoupon(req.user._id, couponCode, subtotal);

    res.status(200).json({
        status: 'success',
        data: {
            discount,
        },
    });
});

const selectShippingMethod = catchAsync(async (req, res) => {
    // This is mostly handled by getCheckoutSummary by passing shippingMethodId
    // But we can have a dedicated endpoint if needed to just get the cost
    const { shippingMethodId, subtotal } = req.body;
    const cost = await checkoutService.calculateShipping(shippingMethodId, subtotal);

    res.status(200).json({
        status: 'success',
        data: {
            shippingCost: cost,
        },
    });
});

module.exports = {
    getCheckoutSummary,
    applyCoupon,
    selectShippingMethod,
};
