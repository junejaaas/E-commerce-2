const mongoose = require('mongoose');

const analyticsSchema = mongoose.Schema(
    {
        pageType: {
            type: String,
            enum: ['home', 'product', 'category', 'checkout', 'search'],
            required: true,
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
        visitorId: {
            type: String,
            required: true,
        },
        referrer: {
            type: String,
            default: 'Direct',
        },
        userAgent: {
            type: String,
        },
        ip: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

// Index for aggregation performance
analyticsSchema.index({ createdAt: 1 });
analyticsSchema.index({ pageType: 1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);

module.exports = Analytics;
