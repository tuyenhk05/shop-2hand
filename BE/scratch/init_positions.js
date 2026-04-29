const mongoose = require('mongoose');
const Product = require('../src/models/products.model');
require('dotenv').config();

async function init() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const products = await Product.find({ position: { $exists: false } }).sort({ createdAt: 1 });
        console.log(`Found ${products.length} products without position`);

        let currentMax = await Product.findOne({ position: { $exists: true } }).sort({ position: -1 });
        let nextPos = (currentMax && currentMax.position) ? currentMax.position + 1 : 1;

        for (const prod of products) {
            prod.position = nextPos++;
            await prod.save();
            console.log(`- Set position ${prod.position} for ${prod.title}`);
        }

        console.log('Finished initializing positions');
        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
}

init();
