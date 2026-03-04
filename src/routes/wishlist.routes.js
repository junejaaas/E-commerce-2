const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const wishlistController = require('../controllers/wishlist.controller');

const router = express.Router();

router.use(authMiddleware.protect);

router
    .route('/')
    .get(wishlistController.getWishlist)
    .post(wishlistController.addToWishlist);

router
    .route('/:productId')
    .delete(wishlistController.removeFromWishlist);

router.post('/:productId/move', wishlistController.moveToCart);

module.exports = router;
