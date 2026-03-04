const Joi = require('joi');

const createProduct = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().required().min(0),
        stock: Joi.number().required().min(0),
        category: Joi.string().required(), // ObjectId
        images: Joi.array().items(Joi.string()),
        isFeatured: Joi.boolean(),
    }),
};

const getProducts = {
    query: Joi.object().keys({
        name: Joi.string(),
        price: Joi.string(), // Allowing logic operators like price[gte]
        category: Joi.string(),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
        keyword: Joi.string(),
    }).unknown(true), // Allow other filters
};

const getProduct = {
    params: Joi.object().keys({
        productId: Joi.string().required(), // Validate ObjectId format if possible
    }),
};

module.exports = {
    createProduct,
    getProducts,
    getProduct,
};
