const axios = require('axios');

const API_URL = 'http://localhost:5000/api/v1';

const testAddress = async () => {
    try {
        console.log('--- Starting Address Verification ---');

        // 1. Register User (Using a new user to ensure clean state)
        const userData = {
            name: 'Address Tester',
            email: `address_${Date.now()}@test.com`,
            password: 'Password@123',
            confirmPassword: 'Password@123',
            role: 'user'
        };
        const registerRes = await axios.post(`${API_URL}/auth/register`, userData);
        const { token } = registerRes.data.tokens.access;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log('✅ User Registration Successful');

        // 2. Create First Address (Should be Default)
        const addr1Data = {
            fullName: 'John Doe',
            phoneNumber: '1234567890',
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'USA'
        };
        const addr1Res = await axios.post(`${API_URL}/addresses`, addr1Data, config);
        const addr1Id = addr1Res.data._id;

        if (addr1Res.data.isDefault === true) {
            console.log('✅ First Address Auto-Default Successful');
        } else {
            console.error('❌ First Address Auto-Default Failed');
        }

        // 3. Create Second Address (Not Default)
        const addr2Data = { ...addr1Data, street: '456 Side St', isDefault: false };
        const addr2Res = await axios.post(`${API_URL}/addresses`, addr2Data, config);
        const addr2Id = addr2Res.data._id;

        if (addr2Res.data.isDefault === false) {
            console.log('✅ Second Address Creation Successful');
        } else {
            console.error('❌ Second Address Creation Failed');
        }

        // 4. Update Second Address to be Default
        const updateRes = await axios.patch(`${API_URL}/addresses/${addr2Id}`, { isDefault: true }, config);
        if (updateRes.data.isDefault === true) {
            console.log('✅ Set Default Address Successful');
        } else {
            console.error('❌ Set Default Address Failed');
        }

        // 5. Verify First Address is NO LONGER Default
        const verifyAddr1 = await axios.get(`${API_URL}/addresses/${addr1Id}`, config);
        if (verifyAddr1.data.isDefault === false) {
            console.log('✅ Default Override Logic Successful');
        } else {
            console.error('❌ Default Override Logic Failed (Old address is still default)');
        }

        // 6. Delete Address
        await axios.delete(`${API_URL}/addresses/${addr2Id}`, config);
        console.log('✅ Delete Address Successful');

        // 7. List Addresses
        const listRes = await axios.get(`${API_URL}/addresses`, config);
        if (listRes.data.length === 1 && listRes.data[0]._id === addr1Id) {
            console.log('✅ List Addresses Successful');
        } else {
            console.error('❌ List Addresses Failed');
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

testAddress();
