const express = require('express');
const validate = require('../middlewares/validate.middleware');
const couponValidation = require('../validations/coupon.validation');
const couponController = require('../controllers/coupon.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router
    .route('/')
    .get(couponController.getCoupons)
    .post(validate(couponValidation.createCoupon), couponController.createCoupon);

router
    .route('/:couponId')
    .get(validate(couponValidation.getCoupon), couponController.getCoupon)
    .patch(validate(couponValidation.updateCoupon), couponController.updateCoupon)
    .delete(validate(couponValidation.deleteCoupon), couponController.deleteCoupon);

module.exports = router;
