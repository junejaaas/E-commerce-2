const Joi = require('joi');

const createCoupon = {
    body: Joi.object().keys({
        code: Joi.string().required().uppercase().trim(),
        discountType: Joi.string().required().valid('percentage', 'flat'),
        discountAmount: Joi.number().required().min(0),
        minOrderAmount: Joi.number().min(0).default(0),
        expiryDate: Joi.date().required().greater('now'),
        usageLimit: Joi.number().integer().min(1).allow(null),
        isActive: Joi.boolean().default(true),
    }),
};

const getCoupon = {
    params: Joi.object().keys({
        couponId: Joi.string().required().custom((value, helpers) => {
            if (!value.match(/^[0-9a-fA-F]{24}$/)) {
                return helpers.message('Invalid couponId format');
            }
            return value;
        }),
    }),
};

const updateCoupon = {
    params: Joi.object().keys({
        couponId: Joi.string().required().custom((value, helpers) => {
            if (!value.match(/^[0-9a-fA-F]{24}$/)) {
                return helpers.message('Invalid couponId format');
            }
            return value;
        }),
    }),
    body: Joi.object().keys({
        code: Joi.string().uppercase().trim(),
        discountType: Joi.string().valid('percentage', 'flat'),
        discountAmount: Joi.number().min(0),
        minOrderAmount: Joi.number().min(0),
        expiryDate: Joi.date().greater('now'),
        usageLimit: Joi.number().integer().min(1).allow(null),
        isActive: Joi.boolean(),
    }).min(1),
};

const deleteCoupon = {
    params: Joi.object().keys({
        couponId: Joi.string().required().custom((value, helpers) => {
            if (!value.match(/^[0-9a-fA-F]{24}$/)) {
                return helpers.message('Invalid couponId format');
            }
            return value;
        }),
    }),
};

module.exports = {
    createCoupon,
    getCoupon,
    updateCoupon,
    deleteCoupon,
};
