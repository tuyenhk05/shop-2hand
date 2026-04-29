const mongoose = require('mongoose');
const Product = require('../src/models/products.model');
require('dotenv').config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const products = await Product.find({ status: { $ne: 'delete' } })
            .sort({ position: 1 })
            .select('title position status');

        console.log('\n=== All Products (sorted by position) ===');
        products.forEach(p => {
            console.log(`  [pos=${p.position}] ${p.title} (${p.status})`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

check();
