const bcrypt = require('bcryptjs');

async function generateHash() {
    const password = 'admin12345';
    const hash = await bcrypt.hash(password, 12);
    console.log(hash);
}

generateHash();