const mongoose = require('mongoose');
const Category = require('../models/category.model');
const catchAsync = require('../utils/catchAsync');
const productService = require('../services/product.service');
const AppError = require('../utils/AppError');

const createCategory = catchAsync(async (req, res) => {
    const category = await productService.createCategory(req.body);
    res.status(201).send(category);
});

const getCategories = catchAsync(async (req, res) => {
    const categories = await productService.getCategories();
    res.send(categories);
});

const createProduct = catchAsync(async (req, res) => {
    const product = await productService.createProduct(req.body);
    res.status(201).send(product);
});

const getProducts = catchAsync(async (req, res) => {
    const result = await productService.getProducts(req.query);
    res.status(200).json({
        status: 'success',
        results: result.products.length,
        data: {
            products: result.products
        },
        pagination: result.pagination
    });
});

const getProduct = catchAsync(async (req, res) => {
    const product = await productService.getProductById(req.params.productId);
    if (!product) {
        throw new AppError('Product not found', 404);
    }
    res.status(200).json({
        status: 'success',
        data: {
            product
        }
    });
});

const updateProduct = catchAsync(async (req, res) => {
    const product = await productService.updateProductById(req.params.productId, req.body);
    if (!product) {
        throw new AppError('Product not found', 404);
    }
    res.send(product);
});

const deleteProduct = catchAsync(async (req, res) => {
    const product = await productService.deleteProductById(req.params.productId);
    if (!product) {
        throw new AppError('Product not found', 404);
    }
    res.status(204).send();
});

module.exports = {
    createCategory,
    getCategories,
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
};
