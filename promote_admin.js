const mongoose = require('mongoose');
const User = require('./backend/src/models/user.model');
require('dotenv').config({ path: './backend/.env' });

const promoteAdmin = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) throw new Error('MONGO_URI is not defined in .env');
        
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');
        
        const user = await User.findOneAndUpdate(
            { email: 'admin@example.com' },
            { role: 'admin' },
            { new: true }
        );
        
        if (user) {
            console.log('User promoted to admin:', user.email);
        } else {
            console.log('User not found');
        }
    } catch (error) {
        console.error('Error promoting user:', error);
    } finally {
        await mongoose.disconnect();
    }
};

promoteAdmin();
