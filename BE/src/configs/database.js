const mongoose = require('mongoose');

module.exports.connect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Database connected successfully');
    }
    catch (error) {
        console.error('❌ Error connecting to the database:', error.message);
        process.exit(1);
    }
};