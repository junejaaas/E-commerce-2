const Joi = require('joi');

const createProduct = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        description: Joi.string().required(),
        originalPrice: Joi.number().required().min(0),
        discountedPrice: Joi.number().min(0),
        discountPercentage: Joi.number().min(0).max(100),
        price: Joi.number().min(0), // Support legacy price field
        stock: Joi.number().required().min(0),
        category: Joi.string().required(), // ObjectId
        brand: Joi.string().required(),
        images: Joi.array().items(Joi.string()),
        isFeatured: Joi.boolean(),
        sku: Joi.string(),
        discountPrice: Joi.number().min(0),
        status: Joi.string().valid('active', 'inactive', 'draft'),
        tags: Joi.array().items(Joi.string()),
        variants: Joi.array().items(Joi.string()),
        isFeatured: Joi.boolean(),
        seoTitle: Joi.string().allow('', null),
        seoDescription: Joi.string().allow('', null),
    }),
};

const getProducts = {
    query: Joi.object().keys({
        name: Joi.string(),
        price: Joi.string(), // Allowing logic operators like price[gte]
        category: Joi.string(),
        isFeatured: Joi.boolean(),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
        keyword: Joi.string(),
    }).unknown(true), // Allow other filters
};

const getProduct = {
    params: Joi.object().keys({
        productId: Joi.string().required(),
    }),
};

const updateProduct = {
    params: Joi.object().keys({
        productId: Joi.string().required(),
    }),
    body: Joi.object()
        .keys({
            name: Joi.string(),
            description: Joi.string(),
            originalPrice: Joi.number().min(0),
            discountedPrice: Joi.number().min(0),
            discountPercentage: Joi.number().min(0).max(100),
            price: Joi.number().min(0),
            stock: Joi.number().min(0),
            category: Joi.string(),
            brand: Joi.string(),
            images: Joi.array().items(Joi.string()),
            isFeatured: Joi.boolean(),
            sku: Joi.string(),
            discountPrice: Joi.number().min(0),
            status: Joi.string().valid('active', 'inactive', 'draft'),
            tags: Joi.array().items(Joi.string()),
            variants: Joi.array().items(Joi.string()),
            seoTitle: Joi.string().allow('', null),
            seoDescription: Joi.string().allow('', null),
        })
        .min(1),
};

module.exports = {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
};
