const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const AppError = require('../utils/AppError');

const getCart = async (userId) => {
    let cart = await Cart.findOne({ user: userId }).populate('items.product', 'name price images stock');
    if (!cart) {
        // Return empty structure if no cart yet, or create one? 
        // Usually return null or empty representation. Let's create one for simplicity in frontend.
        cart = await Cart.create({ user: userId, items: [] });
    }
    return cart;
};

const addToCart = async (userId, productId, quantity) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new AppError('Product not found', 404);
    }

    // Stock Check
    if (product.stock < quantity) {
        throw new AppError(`Insufficient stock. Only ${product.stock} left.`, 400);
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
        // Item exists, update quantity
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;

        // Check stock for total new quantity
        if (product.stock < newQuantity) {
            throw new AppError(`Insufficient stock for total quantity. Max available: ${product.stock}`, 400);
        }

        cart.items[existingItemIndex].quantity = newQuantity;
        // Update price in case it changed (optional decision, usually we stick to current price)
        cart.items[existingItemIndex].price = product.price;
        cart.items[existingItemIndex].totalProductPrice = newQuantity * product.price;
    } else {
        // New Item
        cart.items.push({
            product: productId,
            quantity,
            price: product.price,
            totalProductPrice: quantity * product.price,
        });
    }

    // Recalculate Total
    cart.totalPrice = cart.items.reduce((acc, item) => acc + item.totalProductPrice, 0);

    await cart.save();
    return cart;
};

const updateItemQuantity = async (userId, productId, quantity) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
        throw new AppError('Cart not found', 404);
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex === -1) {
        throw new AppError('Item not found in cart', 404);
    }

    // Stock check
    const product = await Product.findById(productId);
    if (!product) {
        // Edge case: Product deleted but in cart. Remove it?
        // For now throw error.
        throw new AppError('Product no longer exists', 404);
    }

    if (product.stock < quantity) {
        throw new AppError(`Insufficient stock. Only ${product.stock} available.`, 400);
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = product.price; // Update price check
    cart.items[itemIndex].totalProductPrice = quantity * product.price;

    cart.totalPrice = cart.items.reduce((acc, item) => acc + item.totalProductPrice, 0);

    await cart.save();
    return cart;
};

const removeItem = async (userId, productId) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new AppError('Cart not found', 404);

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    cart.totalPrice = cart.items.reduce((acc, item) => acc + item.totalProductPrice, 0);

    await cart.save();
    return cart;
}

const clearCart = async (userId) => {
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
        cart.items = [];
        cart.totalPrice = 0;
        await cart.save();
    }
    return cart;
}

module.exports = {
    getCart,
    addToCart,
    updateItemQuantity,
    removeItem,
    clearCart
};
