const mongoose = require('mongoose');

const categorySchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a category name'],
            unique: true,
            trim: true,
        },
        slug: {
            type: String,
            lowercase: true,
            unique: true,
        },
        image: {
            type: String,
        },
        description: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Pre-save middleware to generate slug from name
categorySchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().split(' ').join('-');
    }
    next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
