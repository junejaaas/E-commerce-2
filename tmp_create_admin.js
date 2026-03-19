const axios = require('axios');

const API_URL = 'http://localhost:5000/api/v1';

const createAdmin = async () => {
    try {
        const adminData = {
            name: 'Verification Admin',
            email: `admin_verify_${Date.now()}@test.com`,
            password: 'Password@123',
            confirmPassword: 'Password@123',
            role: 'admin'
        };

        const res = await axios.post(`${API_URL}/auth/register`, adminData);
        console.log('ADMIN_CREATED');
        console.log('EMAIL:', adminData.email);
        console.log('PASSWORD:', adminData.password);
    } catch (error) {
        console.error('FAILED_TO_CREATE_ADMIN');
        if (error.response) {
            console.error(error.response.data);
        } else {
            console.error(error.message);
        }
    }
};

createAdmin();
