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
        originalPrice: {
            type: Number,
            required: [true, 'Please provide a product price'],
            min: [0, 'Price cannot be negative'],
        },
        discountedPrice: {
            type: Number,
            min: [0, 'Discounted price cannot be negative'],
        },
        discountPercentage: {
            type: Number,
            min: [0, 'Discount percentage cannot be below 0'],
            max: [100, 'Discount percentage cannot exceed 100'],
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
            default: 0,
            min: [0, 'Rating must be above 0.0'],
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
        sku: {
            type: String,
            unique: true,
            trim: true,
        },
        discountPrice: {
            type: Number,
            default: 0,
            validate: {
                validator: function(val) {
                    // This only works on CREATE, not UPDATE by default in Mongoose
                    return val < this.originalPrice; // Changed from this.price to this.originalPrice to avoid circular logic
                },
                message: 'Discount price ({VALUE}) should be below regular price'
            }
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'draft'],
            default: 'active',
        },
        tags: [String],
        variants: [String],
        seoTitle: {
            type: String,
            trim: true,
        },
        seoDescription: {
            type: String,
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
productSchema.index({ originalPrice: 1 });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });

// Pre-save middleware to generate slug and SKU
// Virtual for price (returns discountedPrice if exists, else originalPrice)
productSchema.virtual('price').get(function () {
    return this.discountedPrice || this.originalPrice;
});

productSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, "").split(' ').join('-');
    }
    
    // Auto-generate SKU if not provided
    if (!this.sku) {
        const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
        const brandPrefix = this.brand ? this.brand.substring(0, 3).toUpperCase() : 'PRD';
        const namePrefix = this.name ? this.name.substring(0, 3).toUpperCase() : 'GEN';
        this.sku = `${brandPrefix}-${namePrefix}-${randomStr}`;
    }
    
    next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;