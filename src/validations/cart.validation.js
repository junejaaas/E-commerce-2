const Joi = require('joi');

const addToCart = {
    body: Joi.object().keys({
        productId: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
    }),
};

const updateItem = {
    body: Joi.object().keys({
        quantity: Joi.number().integer().min(1).required(),
    }),
    params: Joi.object().keys({
        productId: Joi.string().required(),
    })
};

const removeItem = {
    params: Joi.object().keys({
        productId: Joi.string().required(),
    })
};

module.exports = {
    addToCart,
    updateItem,
    removeItem
};
