require('dotenv').config();
const User = require('../models/user');

const createAdmin = async () => {
  try {
    const AdminUser = await User.findOne({ username: 'admin' });

    if (!AdminUser) {
      await User.create({
        username: 'admin',
        email: 'admin@swiftship.com',
        password: 'admin123',
        role: 'admin',
      });
      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

module.exports = createAdmin;
