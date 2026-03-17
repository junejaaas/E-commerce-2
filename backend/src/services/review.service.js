const Review = require('../models/review.model');
const AppError = require('../utils/AppError');

const createReview = async (userId, productId, body) => {
    // Check if user already reviewed
    const existing = await Review.findOne({ user: userId, product: productId });
    if (existing) {
        throw new AppError('You have already reviewed this product', 400);
    }

    const review = await Review.create({
        ...body,
        user: userId,
        product: productId
    });
    return review;
};

const getReviews = async (productId) => {
    const reviews = await Review.find({ product: productId }).sort('-createdAt');
    return reviews;
};

const deleteReview = async (reviewId, userId, userRole) => {
    const review = await Review.findById(reviewId);
    if (!review) throw new AppError('Review not found', 404);

    // Check permission
    if (userRole !== 'admin' && review.user._id.toString() !== userId) {
        throw new AppError('Not authorized to delete this review', 403);
    }

    const productId = review.product;
    await review.deleteOne();

    // Recalc stats
    await Review.calcAverageRatings(productId);

    return review;
};

module.exports = {
    createReview,
    getReviews,
    deleteReview
};
