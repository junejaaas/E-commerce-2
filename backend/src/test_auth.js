const axios = require('axios');

const API_URL = 'http://localhost:5000/api/v1/auth';
const HEALTH_URL = 'http://localhost:5000/api/v1/health';

const testAuth = async () => {
    try {
        console.log('--- Starting Auth Verification ---');

        // 0. Check Health
        try {
            await axios.get(HEALTH_URL);
            console.log('✅ Server is healthy');
        } catch (e) {
            console.error('❌ Server is NOT running. Please start it.');
            process.exit(1);
        }

        // 1. Register User
        const userData = {
            name: 'Test Verify',
            email: `testverify_${Date.now()}@example.com`,
            password: 'password123',
            role: 'user'
        };

        console.log(`\n1. Registering user: ${userData.email}`);
        const registerRes = await axios.post(`${API_URL}/register`, userData);

        if (registerRes.status === 201 && registerRes.data.tokens) {
            console.log('✅ Registration Successful');
        } else {
            console.error('❌ Registration Failed', registerRes.data);
        }

        const { access, refresh } = registerRes.data.tokens;

        // 2. Login User
        console.log(`\n2. Logging in user`);
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: userData.email,
            password: userData.password
        });

        if (loginRes.status === 200 && loginRes.data.tokens) {
            console.log('✅ Login Successful');
        } else {
            console.error('❌ Login Failed');
        }

        // 3. Refresh Token
        console.log(`\n3. Refreshing tokens`);
        const refreshRes = await axios.post(`${API_URL}/refresh-tokens`, {
            refreshToken: refresh.token
        });

        if (refreshRes.status === 200 && refreshRes.data.access) {
            console.log('✅ Token Refresh Successful');
        } else {
            console.error('❌ Token Refresh Failed');
        }

        // 4. Logout
        console.log(`\n4. Logging out`);
        const logoutRes = await axios.post(`${API_URL}/logout`, {}, {
            headers: { Authorization: `Bearer ${access.token}` }
        });
        if (logoutRes.status === 204) {
            console.log('✅ Logout Successful');
        } else {
            console.error('❌ Logout Failed');
        }

        console.log('\n--- Verification Complete ---');
    } catch (error) {
        if (error.response) {
            console.error('❌ Request Failed:', error.response.status, error.response.data);
        } else {
            console.error('❌ Error:', error.message);
        }
    }
};

testAuth();
