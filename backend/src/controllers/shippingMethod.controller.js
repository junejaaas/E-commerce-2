const ShippingMethod = require('../models/shippingMethod.model');
const catchAsync = require('../utils/catchAsync');

const getAllShippingMethods = catchAsync(async (req, res) => {
    const shippingMethods = await ShippingMethod.find({ isActive: true });
    
    res.status(200).json({
        status: 'success',
        results: shippingMethods.length,
        data: shippingMethods,
    });
});

module.exports = {
    getAllShippingMethods,
};
