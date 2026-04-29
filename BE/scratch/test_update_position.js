const mongoose = require('mongoose');
const Product = require('../src/models/products.model');
require('dotenv').config();

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Lấy một sản phẩm bất kỳ để test
        const product = await Product.findOne({ status: { $ne: 'delete' } });
        if (!product) { console.log('No product found'); return; }

        console.log(`\nBefore update: ${product.title}`);
        console.log(`  position = ${product.position} (type: ${typeof product.position})`);

        const newPos = 999;

        // Test bằng findByIdAndUpdate (giống controller dùng)
        const updated = await Product.findByIdAndUpdate(
            product._id,
            { position: newPos },
            { new: true }
        );

        console.log(`\nAfter findByIdAndUpdate:`);
        console.log(`  position = ${updated.position} (type: ${typeof updated.position})`);

        // Re-fetch để xác nhận DB lưu thật sự
        const refetch = await Product.findById(product._id);
        console.log(`\nRe-fetched from DB:`);
        console.log(`  position = ${refetch.position} (type: ${typeof refetch.position})`);

        // Khôi phục
        await Product.findByIdAndUpdate(product._id, { position: product.position });
        console.log(`\nRestored position to ${product.position}`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

test();
