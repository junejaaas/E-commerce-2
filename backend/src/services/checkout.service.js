const cartService = require('./cart.service');
const addressService = require('./address.service');
const Coupon = require('../models/coupon.model');
const ShippingMethod = require('../models/shippingMethod.model');
const Product = require('../models/product.model');
const AppError = require('../utils/AppError');

const calculateSubtotal = (cart) => {
    return cart.items.reduce((total, item) => total + item.totalProductPrice, 0);
};

const applyCoupon = async (userId, couponCode, subtotal) => {
    if (!couponCode) return 0;

    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (!coupon) {
        throw new AppError('Invalid or expired coupon code', 400);
    }

    if (!coupon.isValid(subtotal)) {
        throw new AppError('Coupon conditions not met (min order or expired)', 400);
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
        discount = Math.round((subtotal * coupon.discountAmount) / 100);
    } else {
        discount = coupon.discountAmount;
    }

    return Math.min(discount, subtotal); // Discount cannot exceed subtotal
};

const calculateTax = (amount) => {
    // 5% tax logic
    return Math.round(amount * 0.05);
};

const calculateShipping = async (shippingMethodId, subtotal) => {
    if (!shippingMethodId) {
        // Default shipping logic: Free > 500, else 50
        return subtotal > 500 ? 0 : 50;
    }

    const shippingMethod = await ShippingMethod.findById(shippingMethodId);
    if (!shippingMethod || !shippingMethod.isActive) {
        throw new AppError('Invalid shipping method', 400);
    }

    return shippingMethod.cost;
};

const validateStockPromise = async (cartItems) => {
    for (const item of cartItems) {
        const product = await Product.findById(item.product);
        if (!product) {
            throw new AppError(`Product not found: ${item.product}`, 404);
        }
        if (product.stock < item.quantity) {
            throw new AppError(`Insufficient stock for product: ${product.name}. Available: ${product.stock}`, 400);
        }
    }
};

const getCheckoutSummary = async (userId, addressId, couponCode, shippingMethodId) => {
    // 1. Get Cart
    const cart = await cartService.getCart(userId);
    if (!cart || cart.items.length === 0) {
        throw new AppError('Cart is empty', 400);
    }

    // 2. Validate Stock
    await validateStockPromise(cart.items);

    // 3. Validate Address
    if (!addressId) throw new AppError('Address ID is required', 400);
    const address = await addressService.getAddressById(addressId, userId);

    // 4. Calculations
    const subtotal = calculateSubtotal(cart);
    const discount = await applyCoupon(userId, couponCode, subtotal);
    const tax = calculateTax(subtotal - discount);
    const shipping = await calculateShipping(shippingMethodId, subtotal);

    const total = subtotal - discount + tax + shipping;

    return {
        items: cart.items.map(item => ({
            product: item.product,
            quantity: item.quantity,
            price: item.price,
            totalProductPrice: item.totalProductPrice
        })),
        address,
        subtotal,
        discount,
        tax,
        shipping,
        total,
        couponCode: couponCode || null,
        shippingMethodId: shippingMethodId || null
    };
};

module.exports = {
    getCheckoutSummary,
    calculateSubtotal,
    applyCoupon,
    calculateTax,
    calculateShipping
};
