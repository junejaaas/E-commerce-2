const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a product name'],
            trim: true,
        },
        slug: {
            type: String,
            lowercase: true,
            unique: true,
        },
        description: {
            type: String,
            required: [true, 'Please provide a product description'],
        },
        price: {
            type: Number,
            required: [true, 'Please provide a product price'],
            min: [0, 'Price cannot be negative'],
        },
        stock: {
            type: Number,
            required: [true, 'Please provide product stock status'],
            min: [0, 'Stock cannot be negative'],
            default: 0,
        },
        sold: {
            type: Number,
            default: 0,
        },
        images: [
            {
                type: String,
            },
        ],
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Product must belong to a category'],
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be below 5.0'],
            set: (val) => Math.round(val * 10) / 10, // 4.666666 -> 4.7
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        brand: {
            type: String,
            required: [true, 'Please provide a brand name'],
            trim: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes for performance
productSchema.index({ name: 'text', description: 'text' }); // Text index for search
productSchema.index({ price: 1 });
//productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });

// Pre-save middleware to generate slug
productSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, "").split(' ').join('-');
    }
    next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
