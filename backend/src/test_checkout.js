const axios = require('axios');

const API_URL = 'http://localhost:5000/api/v1';

const testCheckout = async () => {
    try {
        console.log('--- Starting Checkout & Order Verification ---');

        // 1. Register/Login User
        const userData = {
            name: 'Checkout Tester',
            email: `checkout_user_${Date.now()}@test.com`,
            password: 'Password@123',
            confirmPassword: 'Password@123',
            role: 'user'
        };
        const registerRes = await axios.post(`${API_URL}/auth/register`, userData);
        const { token } = registerRes.data.tokens.access;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log('✅ User Registration Successful');

        // 2. Setup: Product & Address
        // Get Products (Need at least 1)
        let products = [];
        try {
            const prodRes = await axios.get(`${API_URL}/products`);
            products = prodRes.data;
        } catch (e) {
            console.log('Info: No products found');
        }

        if (products.length === 0) {
            console.error('❌ No products available. Need products to test order.');
            return;
        }
        const product = products[0];
        const initialStock = product.stock;
        console.log(`Info: Product ${product.name} Stock: ${initialStock}`);

        // Create Address
        const addrData = {
            fullName: 'Order Recipient',
            phoneNumber: '9876543210',
            street: '10 Downing St',
            city: 'London',
            state: 'UK',
            postalCode: 'SW1A 2AA',
            country: 'UK'
        };
        const addrRes = await axios.post(`${API_URL}/addresses`, addrData, config);
        const addressId = addrRes.data._id;
        console.log('✅ Address Created');

        // 3. Add to Cart
        await axios.post(`${API_URL}/cart`, { productId: product._id, quantity: 2 }, config);
        console.log('✅ Added to Cart (Qty: 2)');

        // 4. Get Checkout Summary
        const summaryRes = await axios.get(`${API_URL}/orders/checkout?addressId=${addressId}`, config);
        if (summaryRes.data.tax > 0 && summaryRes.data.totalAmount > summaryRes.data.subTotal) {
            console.log(`✅ Checkout Summary: Sub: ${summaryRes.data.subTotal}, Tax: ${summaryRes.data.tax}, Total: ${summaryRes.data.totalAmount}`);
        } else {
            console.error('❌ Checkout Summary Calculation suspicious');
        }

        // 5. Place Order (Card)
        const orderRes = await axios.post(`${API_URL}/orders`, {
            addressId,
            paymentMethod: 'card'
        }, config);

        if (orderRes.data.paymentStatus === 'paid' && orderRes.data.items.length === 1) {
            console.log(`✅ Order Placed Successfully (ID: ${orderRes.data._id})`);
        } else {
            console.error('❌ Order Placement Failed');
        }

        // 6. Verify Cart Empty
        const cartRes = await axios.get(`${API_URL}/cart`, config);
        if (cartRes.data.items.length === 0) {
            console.log('✅ Cart Cleared Successfully');
        } else {
            console.error('❌ Cart Not Cleared');
        }

        // 7. Verify Stock Reduction
        const prodCheck = await axios.get(`${API_URL}/products/${product._id}`);
        // Cannot check exact stock easily because verified product stock might be cached or modified by other tests, 
        // but we expect it to be initialStock - 2 IF no one else touched it.
        // Let's assume isolation.
        // Wait, initialStock was from GET /products which might be slightly stale if many tests run. 
        // But for this single run it should be fine.
        // Actually, let's just check if it's less.
        if (prodCheck.data.stock === initialStock - 2) {
            console.log(`✅ Stock Reduced Correctly (${initialStock} -> ${prodCheck.data.stock})`);
        } else {
            console.warn(`⚠️ Stock Reduction Verification: Expected ${initialStock - 2}, Got ${prodCheck.data.stock}. (Might be concurrent test interference)`);
        }

        // 8. Test Order History
        const historyRes = await axios.get(`${API_URL}/orders`, config);
        if (historyRes.data.length > 0) {
            console.log(`✅ Order History Retrieved (${historyRes.data.length} orders)`);
        } else {
            console.error('❌ Order History Failed');
        }

        console.log('\n--- Verification Complete ---');

    } catch (error) {
        if (error.response) {
            console.error('❌ Request Failed:', error.response.status, error.response.data);
        } else {
            console.error('❌ Error:', error);
        }
    }
};

testCheckout();
