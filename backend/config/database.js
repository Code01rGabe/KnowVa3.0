const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-learning-app';
    
    if (!process.env.MONGODB_URI) {
      console.warn('Warning: MONGODB_URI not set in environment variables. Using default: mongodb://localhost:27017/smart-learning-app');
    }

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.error('Please make sure MongoDB is running and the connection string is correct.');
    process.exit(1);
  }
};

module.exports = connectDB;

