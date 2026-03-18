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

const createProduct = async (productBody) => {
    const product = await Product.create(productBody);
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
