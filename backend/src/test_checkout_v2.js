const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Coupon = require('./models/coupon.model');
const ShippingMethod = require('./models/shippingMethod.model');
const User = require('./models/user.model');
const Product = require('./models/product.model');
const Cart = require('./models/cart.model');
const Address = require('./models/address.model');
const checkoutService = require('./services/checkout.service');

dotenv.config();

const testCheckout = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Setup Test Data
        const user = await User.findOne({ email: 'test@example.com' }) || await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            role: 'user'
        });

        const product = await Product.findOne({ name: 'Test Product' }) || await Product.create({
            name: 'Test Product',
            description: 'Test Description',
            price: 100,
            stock: 10,
            category: new mongoose.Types.ObjectId()
        });

        const address = await Address.findOne({ user: user._id }) || await Address.create({
            user: user._id,
            fullName: 'Test User',
            phoneNumber: '1234567890',
            street: 'Test Street',
            city: 'Test City',
            state: 'Test State',
            postalCode: '123456',
            country: 'Test Country'
        });

        let cart = await Cart.findOne({ user: user._id });
        if (!cart) {
            cart = await Cart.create({
                user: user._id,
                items: [{
                    product: product._id,
                    quantity: 2,
                    price: product.price,
                    totalProductPrice: product.price * 2
                }],
                totalPrice: product.price * 2
            });
        }

        const coupon = await Coupon.findOne({ code: 'TEST50' }) || await Coupon.create({
            code: 'TEST50',
            discountType: 'flat',
            discountAmount: 50,
            minOrderAmount: 100,
            expiryDate: new Date(Date.now() + 86400000),
            isActive: true
        });

        const shipping = await ShippingMethod.findOne({ name: 'Standard' }) || await ShippingMethod.create({
            name: 'Standard',
            description: '3-5 days',
            cost: 40,
            estimatedDelivery: '3-5 days',
            isActive: true
        });

        console.log('Test data setup complete');

        // 2. Test getCheckoutSummary
        console.log('\n--- Testing Checkout Summary ---');
        const summary = await checkoutService.getCheckoutSummary(
            user._id,
            address._id,
            'TEST50',
            shipping._id
        );

        console.log('Summary Result:', JSON.stringify(summary, null, 2));

        // 3. Assertions (Basic manual check in log)
        const expectedSubtotal = product.price * 2; // 200
        const expectedDiscount = 50;
        const expectedTax = Math.round((expectedSubtotal - expectedDiscount) * 0.05); // 150 * 0.05 = 7.5 -> 8 (round)
        const expectedShipping = 40;
        const expectedTotal = expectedSubtotal - expectedDiscount + expectedTax + expectedShipping; // 200 - 50 + 8 + 40 = 198

        console.log('\n--- Expectations ---');
        console.log(`Subtotal: ${summary.subtotal} (Expected: ${expectedSubtotal})`);
        console.log(`Discount: ${summary.discount} (Expected: ${expectedDiscount})`);
        console.log(`Tax: ${summary.tax} (Expected: ${expectedTax})`);
        console.log(`Shipping: ${summary.shipping} (Expected: ${expectedShipping})`);
        console.log(`Total: ${summary.total} (Expected: ${expectedTotal})`);

        if (summary.total === expectedTotal) {
            console.log('\nSUCCESS: Checkout calculations are correct!');
        } else {
            console.log('\nFAILURE: Checkout calculations mismatch!');
        }

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await mongoose.connection.close();
    }
};

testCheckout();
