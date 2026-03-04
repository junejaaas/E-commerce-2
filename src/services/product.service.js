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
    const features = new APIFeatures(Product.find().populate('category'), query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const products = await features.query;
    return products;
};

const getProductById = async (id) => {
    const product = await Product.findById(id).populate('category');
    return product;
};

module.exports = {
    createCategory,
    getCategories,
    createProduct,
    getProducts,
    getProductById,
};
