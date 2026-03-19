const catchAsync = require('../utils/catchAsync');
const couponService = require('../services/coupon.service');

const getCoupons = catchAsync(async (req, res) => {
    const coupons = await couponService.getCoupons();
    res.status(200).json({
        status: 'success',
        results: coupons.length,
        data: {
            coupons
        }
    });
});

const getCoupon = catchAsync(async (req, res) => {
    const coupon = await couponService.getCouponById(req.params.couponId);
    res.status(200).json({
        status: 'success',
        data: {
            coupon
        }
    });
});

const createCoupon = catchAsync(async (req, res) => {
    const coupon = await couponService.createCoupon(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            coupon
        }
    });
});

const updateCoupon = catchAsync(async (req, res) => {
    const coupon = await couponService.updateCouponById(req.params.couponId, req.body);
    res.status(200).json({
        status: 'success',
        data: {
            coupon
        }
    });
});

const deleteCoupon = catchAsync(async (req, res) => {
    await couponService.deleteCouponById(req.params.couponId);
    res.status(204).json({
        status: 'success',
        data: null
    });
});

module.exports = {
    getCoupons,
    getCoupon,
    createCoupon,
    updateCoupon,
    deleteCoupon
};
