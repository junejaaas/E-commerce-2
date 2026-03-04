const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const cartValidation = require('../validations/cart.validation');
const cartController = require('../controllers/cart.controller');

const router = express.Router();

router.use(authMiddleware.protect);

router
    .route('/')
    .get(cartController.getCart)
    .post(validate(cartValidation.addToCart), cartController.addToCart)
    .delete(cartController.clearCart);

router
    .route('/:productId')
    .patch(validate(cartValidation.updateItem), cartController.updateItem)
    .delete(validate(cartValidation.removeItem), cartController.removeItem);

module.exports = router;
