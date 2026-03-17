const mongoose = require('mongoose');
const Product = require('./product.model');

const reviewSchema = mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review can not be empty!'],
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: [true, 'Rating is required'],
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        product: {
            type: mongoose.Schema.ObjectId,
            ref: 'Product',
            required: [true, 'Review must belong to a product.'],
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user.'],
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Prevent Duplicate Review
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name profilePicture',
    });
    next();
});

reviewSchema.statics.calcAverageRatings = async function (productId) {
    const stats = await this.aggregate([
        {
            $match: { product: productId },
        },
        {
            $group: {
                _id: '$product',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' },
            },
        },
    ]);

    if (stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating,
        });
    } else {
        await Product.findByIdAndUpdate(productId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5, // Default
        });
    }
};

reviewSchema.post('save', function () {
    // this points to current review
    this.constructor.calcAverageRatings(this.product);
});

// findByIdAndUpdate/Delete uses findOneAnd...
// We need to trigger calculation on update/delete
// In Mongoose 6+, distinct hooks are somewhat complex for this.
// Simplified approach: post 'findOneAndDelete'?
// Actually, let's stick to save for now. Delete might need query middleware wrapper.
// The easiest way for delete is to execute the calc in controller or use query middleware.
// Let's implement post query middleware to get the doc.

// NOTE: For simplicity in this stack, we'll call recalc explicitly in Service or use the document middleware on Delete if we load it first.

module.exports = mongoose.model('Review', reviewSchema);
