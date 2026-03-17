const express = require('express');
const checkoutController = require('../controllers/checkout.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const checkoutValidation = require('../validations/checkout.validation');

const router = express.Router();

router.use(protect); // All checkout routes require authentication

router.get('/', validate(checkoutValidation.getCheckoutSummary), checkoutController.getCheckoutSummary);
router.post('/apply-coupon', validate(checkoutValidation.applyCoupon), checkoutController.applyCoupon);
router.post('/shipping-method', validate(checkoutValidation.selectShippingMethod), checkoutController.selectShippingMethod);

module.exports = router;
