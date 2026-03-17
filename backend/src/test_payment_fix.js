const axios = require('axios');

const API_URL = 'http://localhost:5000/api/v1';

const verifyPaymentMethods = async () => {
    try {
        console.log('--- Verifying Payment Methods Fix ---');

        // 1. Setup: User, Product, Address
        const userData = {
            name: 'Payment Fix User',
            email: `payment_fix_${Date.now()}@test.com`,
            password: 'Password@123',
            confirmPassword: 'Password@123',
            role: 'user'
        };
        const registerRes = await axios.post(`${API_URL}/auth/register`, userData);
        const { token } = registerRes.data.tokens.access;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Create Category and Product if none exist
        let product;
        let productsRes = await axios.get(`${API_URL}/products`);
        let products = productsRes.data.products || (Array.isArray(productsRes.data) ? productsRes.data : []);
        
        if (products.length === 0) {
            console.log('No products found. Creating a temporary product for testing...');
            // Need admin to create product
            const adminData = {
                name: 'Test Admin',
                email: `admin_${Date.now()}@test.com`,
                password: 'Password@123',
                confirmPassword: 'Password@123',
                role: 'admin'
            };
            const adminRegister = await axios.post(`${API_URL}/auth/register`, adminData);
            const adminToken = adminRegister.data.tokens.access.token;
            const adminConfig = { headers: { Authorization: `Bearer ${adminToken}` } };

            const catRes = await axios.post(`${API_URL}/products/categories`, { name: 'Test Category' }, adminConfig);
            const prodRes = await axios.post(`${API_URL}/products`, {
                name: 'Test Product',
                description: 'Description',
                price: 100,
                stock: 10,
                category: catRes.data._id
            }, adminConfig);
            product = prodRes.data;
        } else {
            product = products[0];
        }
        console.log(`✅ Using Product: ${product.name} (ID: ${product._id || product.id})`);

        // Create Address
        const addrRes = await axios.post(`${API_URL}/addresses`, {
            fullName: 'Test User', 
            phoneNumber: '1234567890', 
            street: 'Street', 
            city: 'City', 
            state: 'State', 
            postalCode: '111111', 
            country: 'Country'
        }, config);
        const addressId = addrRes.data.id;
        console.log('✅ Address created');

        // 2. Test "Cash on Delivery"
        console.log('\nTesting "Cash on Delivery"...');
        await axios.post(`${API_URL}/cart`, { productId: product._id || product.id, quantity: 1 }, config);
        const codRes = await axios.post(`${API_URL}/orders`, { 
            addressId: addressId, 
            paymentMethod: 'Cash on Delivery' 
        }, config);
        console.log(`✅ Success! COD Order ID: ${codRes.data._id}`);

        // 3. Test "Razorpay"
        console.log('\nTesting "Razorpay"...');
        await axios.post(`${API_URL}/cart`, { productId: product._id || product.id, quantity: 1 }, config);
        const rzpRes = await axios.post(`${API_URL}/orders`, { 
            addressId: addressId, 
            paymentMethod: 'Razorpay' 
        }, config);
        console.log(`✅ Success! Razorpay Order ID: ${rzpRes.data._id}`);

        console.log('\n--- All Payment Methods Verified ---');

    } catch (error) {
        if (error.response) {
            console.error('❌ Request Failed:', error.response.status, JSON.stringify(error.response.data));
        } else {
            console.error('❌ Error:', error.message);
        }
    }
};

verifyPaymentMethods();
