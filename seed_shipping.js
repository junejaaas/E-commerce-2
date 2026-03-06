const mongoose = require('mongoose');
const ShippingMethod = require('./src/models/shippingMethod.model');
const dotenv = require('dotenv');
dotenv.config();

const seedShippingMethods = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const methods = [
            {
                name: 'Standard Shipping',
                description: '3-5 business days',
                cost: 50,
                estimatedDelivery: '3-5 days',
                isActive: true
            },
            {
                name: 'Express Delivery',
                description: '1-2 business days',
                cost: 150,
                estimatedDelivery: '1-2 days',
                isActive: true
            },
            {
                name: 'Overnight Shipping',
                description: 'Next business day',
                cost: 300,
                estimatedDelivery: '24 hours',
                isActive: true
            }
        ];

        // Clear existing just in case
        await ShippingMethod.deleteMany({});

        const created = await ShippingMethod.insertMany(methods);
        console.log(`✅ Seeded ${created.length} shipping methods`);
        created.forEach(m => {
            console.log(`- ${m.name} (ID: ${m._id}) - Cost: ${m.cost}`);
        });

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
    }
};

seedShippingMethods();
