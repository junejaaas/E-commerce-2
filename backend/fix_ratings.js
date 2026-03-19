const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Manually require the model with its dependencies
const productSchema = new mongoose.Schema({
    sold: { type: Number, default: 0 },
    ratingsAverage: { type: Number, default: 0 }
}, { strict: false });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

dotenv.config({ path: path.join(__dirname, '.env') });

const DB = process.env.MONGO_URI;

if (!DB) {
    console.error('MONGO_URI is not defined in .env');
    process.exit(1);
}

mongoose.connect(DB).then(async () => {
    console.log('DB connection successful!');
    // Update products where sold is 0 and ratingsAverage is still 4.5
    const result = await Product.updateMany(
        { $or: [{ sold: 0 }, { sold: { $exists: false } }], ratingsAverage: 4.5 },
        { ratingsAverage: 0 }
    );
    console.log(`${result.modifiedCount} products updated.`);
    process.exit();
}).catch(err => {
    console.error('DB connection failed!', err);
    process.exit(1);
});
