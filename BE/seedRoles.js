const mongoose = require('mongoose');
require('dotenv').config();
const Role = require('./src/models/roles.model');
const User = require('./src/models/users.model');

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Create Roles
        let adminRole = await Role.findOne({ title: 'Quản trị viên' });
        if (!adminRole) {
            adminRole = await Role.create({
                title: 'Quản trị viên',
                description: 'Toàn quyền hệ thống',
                permissions: ['all']
            });
            console.log('Created Admin Role', adminRole._id);
        }

        let userRole = await Role.findOne({ title: 'Khách hàng' });
        if (!userRole) {
            userRole = await Role.create({
                title: 'Khách hàng',
                description: 'Người dùng cơ bản',
                permissions: []
            });
            console.log('Created User Role', userRole._id);
        }

        // Update all users missing role to userRole
        const result1 = await User.updateMany(
            { role: { $exists: false } },
            { $set: { role: userRole._id } }
        );
        console.log('Updated missing roles to User:', result1.modifiedCount);

        // Make the first user an Admin, or a specific user
        const firstUser = await User.findOne({});
        if (firstUser) {
            firstUser.role = adminRole._id;
            await firstUser.save();
            console.log('Made user Admin:', firstUser.email);
        }


    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}
seed();
