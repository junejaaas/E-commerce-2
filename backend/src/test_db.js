require('dotenv').config();
const mongoose = require('mongoose');

const testDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('MongoDB Connection Successful');
        process.exit(0);
    } catch (error) {
        console.error('MongoDB Connection Failed:', error.message);
        process.exit(1);
    }
};

testDB();
