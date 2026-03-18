const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const authService = require('./src/services/auth.service');
const User = require('./src/models/user.model');

async function test() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const email = 'test@example.com'; // Change to a valid email in your DB if needed
        console.log(`Testing generateResetOTP for ${email}...`);
        
        let user = await User.findOne({ email });
        if (!user) {
            console.log('User not found, creating test user...');
            user = await User.create({
                firstName: 'Test',
                lastName: 'User',
                email: email,
                password: 'password123',
                role: 'user'
            });
            console.log('Test user created.');
        }

        console.log('Calling generateResetOTP...');
        await authService.generateResetOTP(email);
        console.log('Success!');
    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

test();
