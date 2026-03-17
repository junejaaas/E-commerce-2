const axios = require('axios');

const API_URL = 'http://localhost:5000/api/v1';

const testReviews = async () => {
    try {
        console.log('--- Starting Reviews Module Verification ---');

        // 1. Setup: Register 2 Users and Admin
        const user1Data = { name: 'Reviewer 1', email: `rev1_${Date.now()}@test.com`, password: 'Password@123', confirmPassword: 'Password@123', role: 'user' };
        const user2Data = { name: 'Reviewer 2', email: `rev2_${Date.now()}@test.com`, password: 'Password@123', confirmPassword: 'Password@123', role: 'user' };

        // Helper to register & login
        const getAuth = async (data) => {
            await axios.post(`${API_URL}/auth/register`, data);
            const res = await axios.post(`${API_URL}/auth/login`, { email: data.email, password: data.password });
            return { headers: { Authorization: `Bearer ${res.data.tokens.access.token}` } };
        };

        const config1 = await getAuth(user1Data);
        const config2 = await getAuth(user2Data);

        // 2. Setup: Get a Product (or create if needed, but we rely on existing)
        let product;
        try {
            const prods = await axios.get(`${API_URL}/products`);
            if (prods.data.length > 0) product = prods.data[0];
        } catch (e) { }

        if (!product) { console.error('❌ No product found'); return; }
        console.log(`✅ Using Product: ${product.name}`);

        // 3. User 1 Adds Review (Rating 4)
        const rev1 = await axios.post(`${API_URL}/products/${product.id}/reviews`, { review: 'Good product!', rating: 4 }, config1);
        if (rev1.data.rating === 4) {
            console.log('✅ Review 1 Created (Rating 4)');
        } else {
            console.error('❌ Review 1 Failed');
        }

        // 4. Verify Product Stats (Avg: 4, Qty: 1)
        const check1 = await axios.get(`${API_URL}/products/${product.id}`);
        // Note: Check product model field names. We used `ratingsAverage` and `ratingsQuantity` in calc
        if (check1.data.ratingsQuantity === 1 && check1.data.ratingsAverage === 4) {
            console.log('✅ Product Stats Verified (Avg: 4)');
        } else {
            console.error(`❌ Stats Failed. Avg: ${check1.data.ratingsAverage}, Qty: ${check1.data.ratingsQuantity}`);
        }

        // 5. User 2 Adds Review (Rating 5)
        const rev2 = await axios.post(`${API_URL}/products/${product.id}/reviews`, { review: 'Excellent!', rating: 5 }, config2);
        console.log('✅ Review 2 Created (Rating 5)');

        // 6. Verify Product Stats (Avg: 4.5, Qty: 2)
        const check2 = await axios.get(`${API_URL}/products/${product.id}`);
        if (check2.data.ratingsQuantity === 2 && check2.data.ratingsAverage === 4.5) {
            console.log('✅ Product Stats Verified (Avg: 4.5)');
        } else {
            console.error(`❌ Stats Failed. Avg: ${check2.data.ratingsAverage}, Qty: ${check2.data.ratingsQuantity}`);
        }

        // 7. Duplicate Review Check (User 1 tries again)
        try {
            await axios.post(`${API_URL}/products/${product.id}/reviews`, { review: 'Again!', rating: 1 }, config1);
            console.error('❌ Duplicate Check Failed (Should error)');
        } catch (e) {
            if (e.response && e.response.status === 400) {
                console.log('✅ Duplicate Prevention Verified');
            } else {
                console.error('❌ Duplicate Check Failed with unexpected error');
            }
        }

        // 8. Delete Review (User 1 deletes their review)
        await axios.delete(`${API_URL}/products/${product.id}/reviews/${rev1.data.id}`, config1);
        console.log('✅ Review 1 Deleted');

        // 9. Verify Product Stats (Back to Avg: 5, Qty: 1) -> Since User 2 gave 5
        const check3 = await axios.get(`${API_URL}/products/${product.id}`);
        if (check3.data.ratingsQuantity === 1 && check3.data.ratingsAverage === 5) {
            console.log('✅ Product Stats Recalculated (Avg: 5)');
        } else {
            console.error(`❌ Stats Recalc Failed. Avg: ${check3.data.ratingsAverage}, Qty: ${check3.data.ratingsQuantity}`);
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

testReviews();
