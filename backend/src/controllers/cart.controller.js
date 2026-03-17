const catchAsync = require('../utils/catchAsync');
const cartService = require('../services/cart.service');

const getCart = catchAsync(async (req, res) => {
    const cart = await cartService.getCart(req.user.id);
    res.send(cart);
});

const addToCart = catchAsync(async (req, res) => {
    const cart = await cartService.addToCart(
        req.user.id,
        req.body.productId,
        req.body.quantity
    );
    res.status(201).send(cart);
});

const updateItem = catchAsync(async (req, res) => {
    const cart = await cartService.updateItemQuantity(
        req.user.id,
        req.params.productId,
        req.body.quantity
    );
    res.send(cart);
});

const removeItem = catchAsync(async (req, res) => {
    const cart = await cartService.removeItem(req.user.id, req.params.productId);
    res.send(cart);
});

const clearCart = catchAsync(async (req, res) => {
    await cartService.clearCart(req.user.id);
    res.status(204).send();
});

module.exports = {
    getCart,
    addToCart,
    updateItem,
    removeItem,
    clearCart
};
