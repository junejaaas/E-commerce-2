const cartService = require('./cart.service');
const addressService = require('./address.service');
const AppError = require('../utils/AppError');

const getCheckoutSummary = async (userId, addressId) => {
    // 1. Get Cart
    const cart = await cartService.getCart(userId);
    if (!cart || cart.items.length === 0) {
        throw new AppError('Cart is empty', 400);
    }

    // 2. Validate Address
    // If addressId is provided, we check if it exists and belongs to user
    // If not provided, we might look for a default one, but let's insist on addressId for checkout
    if (!addressId) throw new AppError('Address ID is required', 400);

    // This will throw 404 if not found
    const address = await addressService.getAddressById(addressId, userId);

    // 3. Totals
    const subTotal = cart.totalPrice;

    // Tax Logic (Mock: 5% tax)
    const tax = Math.round(subTotal * 0.05);

    // Shipping Logic (Free > 500, else 50)
    const shippingFee = subTotal > 500 ? 0 : 50;

    const totalAmount = subTotal + tax + shippingFee;

    return {
        cart,
        address,
        subTotal,
        tax,
        shippingFee,
        totalAmount
    };
};

module.exports = {
    getCheckoutSummary
};
