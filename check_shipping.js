const mongoose = require('mongoose');
const ShippingMethod = require('./src/models/shippingMethod.model');
const dotenv = require('dotenv');
dotenv.config();

const checkShippingMethods = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const methods = await ShippingMethod.find();
        console.log(`Found ${methods.length} shipping methods:`);
        methods.forEach(m => {
            console.log(`- ID: ${m._id}, Name: ${m.name}, Cost: ${m.cost}, Delivery: ${m.estimatedDelivery}`);
        });
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
    }
};

checkShippingMethods();
