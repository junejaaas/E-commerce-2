const express = require('express');
const shippingMethodController = require('../controllers/shippingMethod.controller');

const router = express.Router();

router.get('/', shippingMethodController.getAllShippingMethods);

module.exports = router;
