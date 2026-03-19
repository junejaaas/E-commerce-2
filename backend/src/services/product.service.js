const mongoose = require('mongoose');
const Product = require('../models/product.model');
const Category = require('../models/category.model');
const APIFeatures = require('../utils/apiFeatures');

const createCategory = async (categoryBody) => {
    const category = await Category.create(categoryBody);
    return category;
};

const getCategories = async () => {
    return await Category.find();
}

const calculateDiscount = (body) => {
    // Backward compatibility for 'price'
    if (body.price && !body.originalPrice) {
        body.originalPrice = body.price;
    }

    if (body.originalPrice) {
        if (body.discountPercentage && !body.discountedPrice) {
            body.discountedPrice = Math.round(body.originalPrice * (1 - body.discountPercentage / 100));
        } else if (body.discountedPrice && !body.discountPercentage) {
            body.discountPercentage = Math.round(((body.originalPrice - body.discountedPrice) / body.originalPrice) * 100);
        } else if (body.discountedPrice && body.discountPercentage) {
            // Validate consistency (allowing small rounding difference)
            const expectedPrice = Math.round(body.originalPrice * (1 - body.discountPercentage / 100));
            if (Math.abs(expectedPrice - body.discountedPrice) > 2) {
                // If inconsistent, prioritize percentage to recalculate price
                body.discountedPrice = expectedPrice;
            }
        }
    }
    return body;
};

const createProduct = async (productBody) => {
    const processedBody = calculateDiscount(productBody);
    const product = await Product.create(processedBody);
    return product;
};

const getProducts = async (query) => {
    // Resolve category name/slug to ID if provided as string
    if (query.category && !mongoose.Types.ObjectId.isValid(query.category)) {
        const category = await Category.findOne({
            $or: [
                { name: query.category },
                { slug: query.category.toLowerCase() }
            ]
        });
        
        if (!category) {
            return { products: [], totalPages: 0 };
        }
        query.category = category._id;
    }

    const features = new APIFeatures(Product.find().populate('category'), query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const products = await features.query;
    
    // Get total count for pagination
    const countFeatures = new APIFeatures(Product.find(), query)
        .filter();
    const totalResults = await countFeatures.query.countDocuments();
    
    const limit = query.limit * 1 || 100;
    const totalPages = Math.ceil(totalResults / limit);

    return {
        products,
        pagination: {
            totalResults,
            totalPages,
            page: query.page * 1 || 1,
            limit
        }
    };
};

const getProductById = async (id) => {
    const product = await Product.findById(id).populate('category');
    return product;
};

const updateProductById = async (productId, updateBody) => {
    const product = await Product.findById(productId);
    if (!product) {
        return null;
    }

    // Merge check for discounts
    const mergedData = {
        originalPrice: updateBody.originalPrice || product.originalPrice || updateBody.price,
        discountedPrice: updateBody.discountedPrice !== undefined ? updateBody.discountedPrice : product.discountedPrice,
        discountPercentage: updateBody.discountPercentage !== undefined ? updateBody.discountPercentage : product.discountPercentage
    };

    // Calculate/Sync discount
    if (mergedData.originalPrice) {
        if (updateBody.discountPercentage && !updateBody.discountedPrice) {
            updateBody.discountedPrice = Math.round(mergedData.originalPrice * (1 - updateBody.discountPercentage / 100));
        } else if (updateBody.discountedPrice && !updateBody.discountPercentage) {
            updateBody.discountPercentage = Math.round(((mergedData.originalPrice - updateBody.discountedPrice) / mergedData.originalPrice) * 100);
        } else if (updateBody.originalPrice && !updateBody.discountedPrice && !updateBody.discountPercentage) {
             // Re-sync if only originalPrice changed
             if (mergedData.discountPercentage) {
                 updateBody.discountedPrice = Math.round(updateBody.originalPrice * (1 - mergedData.discountPercentage / 100));
             } else if (mergedData.discountedPrice) {
                 updateBody.discountPercentage = Math.round(((updateBody.originalPrice - mergedData.discountedPrice) / updateBody.originalPrice) * 100);
             }
        }
    }

    Object.assign(product, updateBody);
    await product.save();
    return product;
};

const deleteProductById = async (productId) => {
    const product = await Product.findById(productId);
    if (!product) {
        return null;
    }
    await product.deleteOne();
    return product;
};

module.exports = {
    createCategory,
    getCategories,
    createProduct,
    getProducts,
    getProductById,
    updateProductById,
    deleteProductById,
};
