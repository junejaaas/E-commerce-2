const axios = require('axios');

const API_URL = 'http://localhost:5000/api/v1';

const testOrderMgmt = async () => {
    try {
        console.log('--- Starting Phase 9 Verification (Cancel & Reorder) ---');

        // 1. Setup: User, Product, Address
        const userData = {
            name: 'OrderMgmt User',
            email: `ordermgmt_${Date.now()}@test.com`,
            password: 'Password@123',
            confirmPassword: 'Password@123',
            role: 'user'
        };
        const registerRes = await axios.post(`${API_URL}/auth/register`, userData);
        const { token } = registerRes.data.tokens.access;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Get Product
        let products = (await axios.get(`${API_URL}/products`)).data;
        if (products.length === 0) { console.error('No products'); return; }
        const product = products[0];
        console.log(`✅ Using Product: ${product.name}, Initial Stock: ${product.stock}`);

        // Create Address
        const addrRes = await axios.post(`${API_URL}/addresses`, {
            fullName: 'Test User', phoneNumber: '1234567890', street: 'Street', city: 'City', state: 'State', postalCode: '111111', country: 'Country'
        }, config);

        // 2. Place Order (Qty: 5)
        await axios.post(`${API_URL}/cart`, { productId: product.id, quantity: 5 }, config);
        const orderRes = await axios.post(`${API_URL}/orders`, { addressId: addrRes.data.id, paymentMethod: 'card' }, config);
        const orderId = orderRes.data._id;
        console.log(`✅ Order Placed (Qty: 5). Order ID: ${orderId}`);

        // Verify Stock Deduced
        const prodAfterOrder = (await axios.get(`${API_URL}/products/${product.id}`)).data;
        console.log(`Info: Stock After Order: ${prodAfterOrder.stock}`);

        // 3. Cancel Order
        const cancelRes = await axios.post(`${API_URL}/orders/${orderId}/cancel`, {}, config);
        if (cancelRes.data.orderStatus === 'cancelled') {
            console.log('✅ Order Cancelled Successfully');
        } else {
            console.error('❌ Order Not Cancelled');
        }

        // Verify Stock Restored
        const prodAfterCancel = (await axios.get(`${API_URL}/products/${product.id}`)).data;
        if (prodAfterCancel.stock === prodAfterOrder.stock + 5) {
            console.log(`✅ Stock Restored Correctly (${prodAfterCancel.stock})`);
        } else {
            console.error(`❌ Stock Restoration Failed. Expected ${prodAfterOrder.stock + 5}, Got ${prodAfterCancel.stock}`);
        }

        // 4. Re-Order
        // First clear cart to be sure (Cancellation doesn't auto-fill cart)
        await axios.delete(`${API_URL}/cart`, config);

        const reorderRes = await axios.post(`${API_URL}/orders/${orderId}/reorder`, {}, config);
        if (reorderRes.data.items.length > 0 && reorderRes.data.items[0].product._id === product.id) {
            console.log('✅ Reorder Successful (Cart Populated)');
        } else {
            console.error('❌ Reorder Failed (Cart Empty or Mismatch)');
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

testOrderMgmt();
