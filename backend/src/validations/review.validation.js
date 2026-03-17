const Joi = require('joi');

const createReview = {
    body: Joi.object().keys({
        review: Joi.string().required(),
        rating: Joi.number().min(1).max(5).required(),
        product: Joi.string() // Optional in body if in params
    })
};

const deleteReview = {
    params: Joi.object().keys({
        id: Joi.string().required(),
        productId: Joi.string()
    }).unknown(true)
};

module.exports = {
    createReview,
    deleteReview
};
