// scripts/createFinalAdminWithSpecialPassword.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createFinalAdminWithSpecialPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/schoolapp');
    console.log('📡 Connected to database');

    const User = require('../models/User');

    // Delete any existing admin
    await User.deleteMany({ email: 'gabriel01maina@gmail.com' });
    console.log('🗑️ Cleaned existing admin accounts');

    // Create admin with your desired special password
    const finalPassword = '@@999@G_CAM';
    
    const user = new User({
      email: 'gabriel01maina@gmail.com',
      password: finalPassword, // Let the pre-save hook handle the hashing
      role: 'admin',
      profile: { 
        name: 'System Administrator' 
      },
      isActive: true,
      isVerified: true
    });

    await user.save();
    console.log('✅ Final admin account created!');

    // Verify it works
    const savedUser = await User.findOne({ email: 'gabriel01maina@gmail.com' });
    
    // Test password comparison
    const match = await savedUser.comparePassword(finalPassword);
    console.log('🔐 Password verification:', match ? '✅ SUCCESS' : '❌ FAILED');

    if (match) {
      console.log('\n🎉 FINAL ADMIN ACCOUNT READY!');
      console.log('📧 Email: gabriel01maina@gmail.com');
      console.log('🔑 Password: @@999@G_CAM');
      console.log('👤 Role: admin');
      console.log('\nYou can now login with these credentials!');
    } else {
      console.log('❌ Special characters might be causing issues');
      console.log('The password might have character encoding problems');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createFinalAdminWithSpecialPassword();