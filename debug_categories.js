const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Category = require('./src/models/category.model');

async function checkCategories() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const categories = await Category.find();
        let output = 'Categories in DB:\n';
        categories.forEach(cat => {
            output += `- ID: ${cat._id}, Name: "${cat.name}", Slug: "${cat.slug}"\n`;
        });
        
        const fs = require('fs');
        fs.writeFileSync('categories_output.txt', output);
        console.log('Results written to categories_output.txt');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkCategories();
