const express = require('express');
const validate = require('../middlewares/validate.middleware');
const productValidation = require('../validations/product.validation');
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const reviewRoutes = require('./review.routes');

const router = express.Router();

// Mount Review Router
router.use('/:productId/reviews', reviewRoutes);

// Categories (Simplified for now, nested or separate routes can be used)
router.post('/categories', authMiddleware.protect, authMiddleware.authorize('admin'), productController.createCategory);
router.get('/categories', productController.getCategories);

// Products
router
    .route('/')
    .post(
        authMiddleware.protect,
        authMiddleware.authorize('admin', 'seller'),
        validate(productValidation.createProduct),
        productController.createProduct
    )
    .get(validate(productValidation.getProducts), productController.getProducts);

router
    .route('/:productId')
    .get(validate(productValidation.getProduct), productController.getProduct)
    .patch(
        authMiddleware.protect,
        authMiddleware.authorize('admin', 'seller'),
        validate(productValidation.updateProduct),
        productController.updateProduct
    );

module.exports = router;
