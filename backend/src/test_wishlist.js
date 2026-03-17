const axios = require('axios');

const API_URL = 'http://localhost:5000/api/v1';

const testWishlist = async () => {
    try {
        console.log('--- Starting Wishlist Module Verification ---');

        // 1. Register User
        const userData = {
            name: 'Wishlist Tester',
            email: `wishlist_user_${Date.now()}@test.com`,
            password: 'Password@123',
            confirmPassword: 'Password@123',
            role: 'user'
        };
        const registerRes = await axios.post(`${API_URL}/auth/register`, userData);
        const { token } = registerRes.data.tokens.access;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log('✅ User Registration Successful');

        // 2. Get Products (assuming existence)
        let products = [];
        try {
            const prodRes = await axios.get(`${API_URL}/products`);
            products = prodRes.data;
        } catch (e) {
            console.log('Info: No existing products found.');
        }

        if (products.length < 1) {
            console.error('❌ Not enough products for testing.');
            return;
        }
        const productA = products[0];
        const productB = products[1] || products[0];

        // 3. Add to Wishlist
        const addRes = await axios.post(`${API_URL}/wishlist`, { productId: productA.id }, config);
        if (addRes.data.products.length === 1 && addRes.data.products.includes(productA.id)) {
            console.log('✅ Add to Wishlist Successful');
        } else {
            console.error('❌ Add to Wishlist Failed');
        }

        // 4. Test Duplicate Prevention
        const addDup = await axios.post(`${API_URL}/wishlist`, { productId: productA.id }, config);
        if (addDup.data.products.length === 1) {
            console.log('✅ Duplicate Prevention Successful');
        } else {
            console.error('❌ Duplicate Prevention Failed (Added duplicate)');
        }

        // 5. Add Second Product
        if (products.length > 1) {
            await axios.post(`${API_URL}/wishlist`, { productId: productB.id }, config);
            console.log('✅ Add Second Product Successful');
        }

        // 6. Get Wishlist (Populated)
        const getRes = await axios.get(`${API_URL}/wishlist`, config);
        if (getRes.data.products[0].name) {
            console.log('✅ Get Wishlist (Populated) Successful');
        } else {
            console.error('❌ Get Wishlist Failed or Not Populated');
        }

        // 7. Remove from Wishlist
        const removeRes = await axios.delete(`${API_URL}/wishlist/${productA.id}`, config);
        if (!removeRes.data.products.some(p => p.toString() === productA.id)) {
            console.log('✅ Remove from Wishlist Successful');
        } else {
            console.error('❌ Remove from Wishlist Failed');
        }

        // 8. Move to Cart (Add productB to cart and remove from wishlist)
        // Ensure productB is in wishlist first (it should be from step 5, or if prods length < 2, step 3 addA, step 7 removed A.. wait)

        let targetId = productB.id;
        if (products.length < 2) {
            // If only 1 product, we removed it in step 7. Let's add it back.
            await axios.post(`${API_URL}/wishlist`, { productId: productA.id }, config);
            targetId = productA.id;
        }

        const moveRes = await axios.post(`${API_URL}/wishlist/${targetId}/move`, {}, config);

        // Check Cart
        const cartRes = await axios.get(`${API_URL}/cart`, config);
        const inCart = cartRes.data.items.some(item => item.product._id === targetId || item.product === targetId);

        // Check Wishlist
        const wishRes = await axios.get(`${API_URL}/wishlist`, config);
        const inWish = wishRes.data.products.some(p => p._id === targetId || p === targetId);

        if (inCart && !inWish) {
            console.log('✅ Move to Cart Successful');
        } else {
            console.error(`❌ Move to Cart Failed. In Cart: ${inCart}, In Wishlist: ${inWish}`);
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

testWishlist();
