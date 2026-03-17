const axios = require('axios');

const API_URL = 'http://localhost:5000/api/v1';

const testProduct = async () => {
    try {
        console.log('--- Starting Product Catalog Verification ---');

        // 1. Admin Registration (or Login if exists, but we'll register clean for test)
        const adminData = {
            name: 'Catalog Admin',
            email: `admin_cat_${Date.now()}@test.com`,
            password: 'Password@123',
            confirmPassword: 'Password@123',
            role: 'admin' // Assuming registration allows role setting for test simplicity or logic handles it
            // Note: If registration restricts role, we might need a workaround or seed.
            // For this project, let's assume register allows it or we trust previous logic.
            // Actually, in many systems, role is restricted. Let's see user.controller/auth.service.
        };

        // Checking if we can set role on register. 
        // If not, we might fail on permission. 
        // Let's assume we can for now based on previous implementation plan or just try.
        // If failed, I'll update the user directly using mongoose if I had access, but here I use API.
        // Let's try registering as admin.
        const registerRes = await axios.post(`${API_URL}/auth/register`, adminData);
        const { token } = registerRes.data.tokens.access;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log('✅ Admin Registration Successful');

        // 2. Create Categories
        const catElectronics = await axios.post(`${API_URL}/products/categories`, { name: 'Electronics' }, config);
        const catBooks = await axios.post(`${API_URL}/products/categories`, { name: 'Books' }, config);
        console.log('✅ Category Creation Successful');

        // 3. Create Products
        const productsData = [
            { name: 'iPhone 15', description: 'Apple smartphone', price: 999, stock: 10, category: catElectronics.data._id },
            { name: 'Samsung Galaxy', description: 'Android smartphone', price: 899, stock: 15, category: catElectronics.data._id },
            { name: 'MacBook Pro', description: 'Apple laptop', price: 1999, stock: 5, category: catElectronics.data._id },
            { name: 'Node.js Guide', description: 'Programming book', price: 29, stock: 100, category: catBooks.data._id },
            { name: 'React Native', description: 'Mobile dev book', price: 35, stock: 50, category: catBooks.data._id },
        ];

        for (const p of productsData) {
            await axios.post(`${API_URL}/products`, p, config);
        }
        console.log(`✅ Created ${productsData.length} products`);

        // 4. Test Listing
        const listRes = await axios.get(`${API_URL}/products`);
        if (listRes.data.length >= 5) console.log('✅ List Products Successful');

        // 5. Test Search
        const searchRes = await axios.get(`${API_URL}/products?keyword=smartphone`);
        if (searchRes.data.length === 2) {
            console.log('✅ Search Successful (found 2 smartphones)');
        } else {
            console.error(`❌ Search Failed. Found ${searchRes.data.length}`);
        }

        // 6. Test Filter (Price < 100)
        const filterRes = await axios.get(`${API_URL}/products?price[lt]=100`);
        if (filterRes.data.every(p => p.price < 100)) {
            console.log('✅ Filter Price Successful');
        } else {
            console.error('❌ Filter Price Failed');
        }

        // 7. Test Sort (Price Desc)
        const sortRes = await axios.get(`${API_URL}/products?sort=-price&limit=3`);
        if (sortRes.data[0].price >= sortRes.data[1].price) {
            console.log('✅ Sorting Successful');
        } else {
            console.error('❌ Sorting Failed');
        }

        // 8. Test Pagination
        const page1 = await axios.get(`${API_URL}/products?limit=2&page=1`);
        const page2 = await axios.get(`${API_URL}/products?limit=2&page=2`);
        if (page1.data.length === 2 && page2.data.length > 0 && page1.data[0]._id !== page2.data[0]._id) {
            console.log('✅ Pagination Successful');
        } else {
            console.error('❌ Pagination Failed');
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

testProduct();
