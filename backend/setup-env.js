const fs = require('fs');
const path = require('path');

const envExamplePath = path.join(__dirname, '.env.example');
const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from .env.example');
  } else {
    // Create default .env file
    const defaultEnv = `PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-learning-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
`;
    fs.writeFileSync(envPath, defaultEnv);
    console.log('✅ Created default .env file');
  }
  console.log('📝 Please review and update the .env file with your configuration.');
} else {
  console.log('ℹ️  .env file already exists.');
}

