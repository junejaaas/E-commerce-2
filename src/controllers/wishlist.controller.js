const catchAsync = require('../utils/catchAsync');
const wishlistService = require('../services/wishlist.service');

const getWishlist = catchAsync(async (req, res) => {
    const wishlist = await wishlistService.getWishlist(req.user.id);
    res.send(wishlist);
});

const addToWishlist = catchAsync(async (req, res) => {
    const wishlist = await wishlistService.addToWishlist(req.user.id, req.body.productId);
    res.status(201).send(wishlist);
});

const removeFromWishlist = catchAsync(async (req, res) => {
    const wishlist = await wishlistService.removeFromWishlist(req.user.id, req.params.productId);
    res.send(wishlist);
});

const moveToCart = catchAsync(async (req, res) => {
    const cart = await wishlistService.moveToCart(req.user.id, req.params.productId);
    res.status(200).send(cart);
});

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    moveToCart
};
