const Coupon = require('../models/coupon.model');
const AppError = require('../utils/AppError');

/**
 * Get all coupons
 * @returns {Promise<Coupon[]>}
 */
const getCoupons = async () => {
    return await Coupon.find().sort({ createdAt: -1 });
};

/**
 * Get coupon by ID
 * @param {string} id
 * @returns {Promise<Coupon>}
 */
const getCouponById = async (id) => {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
        throw new AppError('Coupon not found', 404);
    }
    return coupon;
};

/**
 * Create a new coupon
 * @param {Object} couponBody
 * @returns {Promise<Coupon>}
 */
const createCoupon = async (couponBody) => {
    if (await Coupon.findOne({ code: couponBody.code.toUpperCase() })) {
        throw new AppError('Coupon code already exists', 400);
    }
    return await Coupon.create(couponBody);
};

/**
 * Update coupon by ID
 * @param {string} id
 * @param {Object} updateBody
 * @returns {Promise<Coupon>}
 */
const updateCouponById = async (id, updateBody) => {
    const coupon = await getCouponById(id);
    
    if (updateBody.code && updateBody.code.toUpperCase() !== coupon.code) {
        if (await Coupon.findOne({ code: updateBody.code.toUpperCase() })) {
            throw new AppError('Coupon code already exists', 400);
        }
    }

    Object.assign(coupon, updateBody);
    await coupon.save();
    return coupon;
};

/**
 * Delete coupon by ID
 * @param {string} id
 * @returns {Promise<Coupon>}
 */
const deleteCouponById = async (id) => {
    const coupon = await getCouponById(id);
    await coupon.remove();
    return coupon;
};

module.exports = {
    getCoupons,
    getCouponById,
    createCoupon,
    updateCouponById,
    deleteCouponById,
};
