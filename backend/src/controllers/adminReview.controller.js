const Review = require('../models/review.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// GET /admin/reviews — all reviews with product + user info
exports.getAllReviews = catchAsync(async (req, res, next) => {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
        filter.status = status;
    }

    const reviews = await Review.find(filter)
        .populate({ path: 'user', select: 'name email profilePicture' })
        .populate({ path: 'product', select: 'name images' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

    const total = await Review.countDocuments(filter);

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        total,
        totalPages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
        data: { reviews },
    });
});

// PATCH /admin/reviews/:id/approve
exports.approveReview = catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.id);
    if (!review) return next(new AppError('Review not found', 404));

    review.status = 'approved';
    await review.save({ validateBeforeSave: false });

    // Recalculate product ratings now that it's approved
    await Review.calcAverageRatings(review.product);

    res.status(200).json({
        status: 'success',
        message: 'Review approved',
        data: { review },
    });
});

// PATCH /admin/reviews/:id/reject
exports.rejectReview = catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.id);
    if (!review) return next(new AppError('Review not found', 404));

    review.status = 'rejected';
    await review.save({ validateBeforeSave: false });

    // Recalculate ratings — rejected review shouldn't count
    await Review.calcAverageRatings(review.product);

    res.status(200).json({
        status: 'success',
        message: 'Review rejected',
        data: { review },
    });
});

// DELETE /admin/reviews/:id
exports.deleteReview = catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.id);
    if (!review) return next(new AppError('Review not found', 404));

    const productId = review.product;
    await review.deleteOne();
    await Review.calcAverageRatings(productId);

    res.status(204).json({ status: 'success', data: null });
});

// PATCH /admin/reviews/:id/highlight
exports.highlightReview = catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.id);
    if (!review) return next(new AppError('Review not found', 404));

    review.isHighlighted = !review.isHighlighted;
    await review.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        message: `Review ${review.isHighlighted ? 'highlighted' : 'unhighlighted'}`,
        data: { review },
    });
});
