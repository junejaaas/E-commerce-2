const Wishlist = require('../models/wishlist.model');
const cartService = require('./cart.service');
const AppError = require('../utils/AppError');

const getWishlist = async (userId) => {
    let wishlist = await Wishlist.findOne({ user: userId }).populate('products', 'name price images stock');
    if (!wishlist) {
        wishlist = await Wishlist.create({ user: userId, products: [] });
    }
    return wishlist;
};

const addToWishlist = async (userId, productId) => {
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
        wishlist = await Wishlist.create({ user: userId, products: [] });
    }

    // Add to set to prevent duplicates
    if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
        await wishlist.save();
    }

    return wishlist;
};

const removeFromWishlist = async (userId, productId) => {
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
        throw new AppError('Wishlist not found', 404);
    }

    wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
    await wishlist.save();
    return wishlist;
};

const moveToCart = async (userId, productId) => {
    // 1. Add to Cart
    await cartService.addToCart(userId, productId, 1);

    // 2. Remove from Wishlist
    await removeFromWishlist(userId, productId);

    return await cartService.getCart(userId);
};

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    moveToCart
};
