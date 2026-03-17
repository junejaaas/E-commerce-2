const catchAsync = require('../utils/catchAsync');
const reviewService = require('../services/review.service');

const createReview = catchAsync(async (req, res) => {
    // Nested route support: /products/:productId/reviews
    if (!req.body.product) req.body.product = req.params.productId;

    const review = await reviewService.createReview(req.user.id, req.params.productId, req.body);
    res.status(201).send(review);
});

const getReviews = catchAsync(async (req, res) => {
    const reviews = await reviewService.getReviews(req.params.productId);
    res.send(reviews);
});

const deleteReview = catchAsync(async (req, res) => {
    await reviewService.deleteReview(req.params.id, req.user.id, req.user.role);
    res.status(204).send();
});

module.exports = {
    createReview,
    getReviews,
    deleteReview
};
