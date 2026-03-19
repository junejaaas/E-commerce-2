const express = require('express');
const validate = require('../middlewares/validate.middleware');
const productValidation = require('../validations/product.validation');
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const reviewRoutes = require('./review.routes');

const router = express.Router();

router.post(
    '/upload-images',
    authMiddleware.protect,
    authMiddleware.authorize('admin', 'seller'),
    upload.array('images', 5),
    productController.uploadImages
);

// Mount Review Router
router.use('/:productId/reviews', reviewRoutes);

// Categories (Simplified for now, nested or separate routes can be used)
router.post('/categories', authMiddleware.protect, authMiddleware.authorize('admin'), productController.createCategory);
router.get('/categories', productController.getCategories);

router.patch(
    '/categories/:categoryId',
    authMiddleware.protect,
    authMiddleware.authorize('admin'),
    productController.updateCategory
);

router.delete(
    '/categories/:categoryId',
    authMiddleware.protect,
    authMiddleware.authorize('admin'),
    productController.deleteCategory
);

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
    )
    .delete(
        authMiddleware.protect,
        authMiddleware.authorize('admin', 'seller'),
        productController.deleteProduct
    );

module.exports = router;
