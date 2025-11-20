const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createFinalAdminWithSpecialPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-learning-app');
    console.log('📡 Connected to database');

    const User = require('../models/User');


    await User.deleteMany({ email: 'testadmin@knowva.app' });
    console.log('🗑️ Cleaned existing admin accounts');

    const finalPassword = 'admin123';
    
    const user = new User({
      email: 'testadmin@knowva.app',
      password: finalPassword, 
      role: 'admin',
      profile: { 
        name: 'System Administrator' 
      },
      isActive: true,
      isVerified: true
    });

    await user.save();
    console.log('Final admin account created!');

    const savedUser = await User.findOne({ email: 'testadmin@knowva.app' });
    
    const match = await savedUser.comparePassword(finalPassword);
    console.log('🔐 Password verification:', match ? 'SUCCESS' : 'FAILED');

    if (match) {
      console.log('\n FINAL ADMIN ACCOUNT READY!');
      console.log('Email: testadmin@knowva.app');
      console.log('Password: admin123');
      console.log('Role: admin');
    } else {
      console.log('Special characters might be causing issues');
      console.log('The password might have character encoding problems');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createFinalAdminWithSpecialPassword();