const axios = require('axios');

const API_URL = 'http://localhost:5000/api/v1';

const testCart = async () => {
    try {
        console.log('--- Starting Cart Module Verification ---');

        // 1. Register User
        const userData = {
            name: 'Cart Tester',
            email: `cart_user_${Date.now()}@test.com`,
            password: 'Password@123',
            confirmPassword: 'Password@123',
            role: 'user'
        };
        const registerRes = await axios.post(`${API_URL}/auth/register`, userData);
        const { token } = registerRes.data.tokens.access;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log('✅ User Registration Successful');

        // 2. Register Admin to create products
        const adminData = {
            name: 'Cart Admin',
            email: `cart_admin_${Date.now()}@test.com`,
            password: 'Password@123',
            confirmPassword: 'Password@123',
            role: 'user' // Logic: Initially user, assuming we don't have open admin reg, but we allowed it via modification or we use existing endpoints if we can. 
            // WAIT, I disabled Admin registration in previous step.
            // I should use the products already created in `test_product.js` OR re-enable Admin registration temporarily OR create products using a seed if I had one.
            // Let's TRY to find existing products first using Public API.
        };

        // 3. Get Products (assuming some exist from previous verification, or we just rely on what is there)
        let products = [];
        try {
            const prodRes = await axios.get(`${API_URL}/products`);
            products = prodRes.data;
        } catch (e) {
            console.log('Info: No existing products found, might need to create one (skipping for now if empty)');
        }

        let productA, productB;

        if (products.length < 2) {
            // If no products, we are stuck unless we register admin and create them. 
            // Let's assume the previous step `test_product.js` left some products in DB.
            // If NOT, I will fail here. But `test_product.js` ran successfully.
            console.error('❌ Not enough products for testing. Please ensure 2 products exist.');
            // Verification might fail if DB was cleared.
            // But for this session, DB persists.
            return;
        } else {
            productA = products[0]; // e.g. iPhone. Stock: 10?
            productB = products[1]; // e.g. Samsung. Stock: 15?
            console.log(`✅ Found Products: ${productA.name} ($${productA.price}), ${productB.name} ($${productB.price})`);
        }

        // 4. Add to Cart (Product A, Qty 1)
        const add1 = await axios.post(`${API_URL}/cart`, { productId: productA.id, quantity: 1 }, config);
        if (add1.data.items.length === 1 && add1.data.totalPrice === productA.price) {
            console.log('✅ Add to Cart (New Item) Successful');
        } else {
            console.error('❌ Add to Cart Failed');
        }

        // 5. Add to Cart (Product A, Qty 2) -> Should update qty to 3
        const add2 = await axios.post(`${API_URL}/cart`, { productId: productA.id, quantity: 2 }, config);
        if (add2.data.items[0].quantity === 3 && add2.data.totalPrice === productA.price * 3) {
            console.log('✅ Add to Cart (Update Qty) Successful');
        } else {
            console.error(`❌ Update Qty Failed. Qty: ${add2.data.items[0].quantity}`);
        }

        // 6. Test Stock Validation (Try adding 1000)
        try {
            await axios.post(`${API_URL}/cart`, { productId: productA.id, quantity: 1000 }, config);
            console.error('❌ Stock Validation Failed (Should have thrown error)');
        } catch (e) {
            if (e.response && e.response.status === 400) {
                console.log('✅ Stock Validation Successful (Error checking passed)');
            } else {
                console.error('❌ Stock Validation Failed with unexpected error', e.message);
            }
        }

        // 7. Update Item (Set Qty to 5)
        const update = await axios.patch(`${API_URL}/cart/${productA.id}`, { quantity: 5 }, config);
        if (update.data.items[0].quantity === 5) {
            console.log('✅ Direct Update Quantity Successful');
        } else {
            console.error('❌ Direct Update Quantity Failed');
        }

        // 8. Add Second Product
        await axios.post(`${API_URL}/cart`, { productId: productB.id, quantity: 1 }, config);
        console.log('✅ Added Second Product Successful');

        // 9. Get Cart
        const getCart = await axios.get(`${API_URL}/cart`, config);
        if (getCart.data.items.length === 2) {
            console.log('✅ Get Cart Successful');
        } else {
            console.error('❌ Get Cart Failed');
        }

        // 10. Remove Item
        const remove = await axios.delete(`${API_URL}/cart/${productA.id}`, config);
        if (remove.data.items.length === 1 && remove.data.items[0].product._id === productB.id) { // Check ID reference depending on population
            console.log('✅ Remove Item Successful');
        } else {
            console.error('❌ Remove Item Failed');
        }

        // 11. Clear Cart
        await axios.delete(`${API_URL}/cart`, config);
        const finalCart = await axios.get(`${API_URL}/cart`, config);
        if (finalCart.data.items.length === 0 && finalCart.data.totalPrice === 0) {
            console.log('✅ Clear Cart Successful');
        } else {
            console.error('❌ Clear Cart Failed');
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

testCart();
