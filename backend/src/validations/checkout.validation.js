const Joi = require('joi');

const getCheckoutSummary = {
    query: Joi.object().keys({
        addressId: Joi.string().required().custom((value, helpers) => {
            if (!value.match(/^[0-9a-fA-F]{24}$/)) {
                return helpers.message('Invalid addressId format');
            }
            return value;
        }),
        couponCode: Joi.string().allow('', null),
        shippingMethodId: Joi.string().allow('', null).custom((value, helpers) => {
            if (value && !value.match(/^[0-9a-fA-F]{24}$/)) {
                return helpers.message('Invalid shippingMethodId format');
            }
            return value;
        }),
    }),
};

const applyCoupon = {
    body: Joi.object().keys({
        couponCode: Joi.string().required(),
        subtotal: Joi.number().required().min(0),
    }),
};

const selectShippingMethod = {
    body: Joi.object().keys({
        shippingMethodId: Joi.string().required().custom((value, helpers) => {
            if (!value.match(/^[0-9a-fA-F]{24}$/)) {
                return helpers.message('Invalid shippingMethodId format');
            }
            return value;
        }),
        subtotal: Joi.number().required().min(0),
    }),
};

module.exports = {
    getCheckoutSummary,
    applyCoupon,
    selectShippingMethod,
};
