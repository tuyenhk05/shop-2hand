const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('../src/models/category.model');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const categories = await Category.find({});
        console.log('Categories:', JSON.stringify(categories, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
