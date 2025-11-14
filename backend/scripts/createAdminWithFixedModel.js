// scripts/createAdminWithFixedModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createAdminWithFixedModel = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/schoolapp');
    console.log('📡 Connected to database');

    const User = require('../models/User');

    // Delete any existing admin
    await User.deleteMany({ email: 'gabriel01maina@gmail.com' });
    console.log('🗑️ Cleaned existing admin accounts');

    // Create admin with simple password first to test
    const testPassword = 'Admin123!';
    
    const user = new User({
      email: 'gabriel01maina@gmail.com',
      password: testPassword, // Let the pre-save hook hash it
      role: 'admin',
      profile: { 
        name: 'System Administrator' 
      },
      isActive: true,
      isVerified: true
    });

    await user.save();
    console.log('✅ Admin created with password:', testPassword);

    // Verify it works
    const savedUser = await User.findOne({ email: 'gabriel01maina@gmail.com' });
    
    // Test password comparison
    const match = await savedUser.comparePassword(testPassword);
    console.log('🔐 Password verification using comparePassword:', match ? '✅ SUCCESS' : '❌ FAILED');

    // Test direct bcrypt comparison
    const directMatch = await bcrypt.compare(testPassword, savedUser.password);
    console.log('🔐 Direct bcrypt comparison:', directMatch ? '✅ SUCCESS' : '❌ FAILED');

    if (match && directMatch) {
      console.log('\n🎉 ADMIN CREATED SUCCESSFULLY!');
      console.log('📧 Email: gabriel01maina@gmail.com');
      console.log('🔑 Password: Admin123!');
    } else {
      console.log('🚨 Password verification failed with new model');
      console.log('Stored hash:', savedUser.password);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createAdminWithFixedModel();