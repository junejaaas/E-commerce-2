const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const addressValidation = require('../validations/address.validation');
const addressController = require('../controllers/address.controller');

const router = express.Router();

router.use(authMiddleware.protect);

router
    .route('/')
    .post(validate(addressValidation.createAddress), addressController.createAddress)
    .get(addressController.getAddresses);

router
    .route('/:addressId')
    .get(validate(addressValidation.getAddress), addressController.getAddress)
    .patch(validate(addressValidation.updateAddress), addressController.updateAddress)
    .delete(validate(addressValidation.deleteAddress), addressController.deleteAddress);

module.exports = router;
