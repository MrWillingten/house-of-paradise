const axios = require('axios');

/**
 * Create Admin User Script
 * Creates an admin account for production
 */

// Use production API or localhost
const API_URL = process.env.API_URL || 'https://hop-api-gateway.onrender.com';

// Admin credentials - change these!
const ADMIN_EMAIL = 'aminzou54@gmail.com';
const ADMIN_PASSWORD = 'HoP@Paradise2025!Secure';
const ADMIN_NAME = 'Administrator';

async function createAdmin() {
  console.log('🔐 Creating admin account...');
  console.log(`📡 API URL: ${API_URL}\n`);

  try {
    // Step 1: Register the user
    console.log('Step 1: Registering user...');
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      name: ADMIN_NAME
    });

    if (response.data.success) {
      console.log('✅ User registered successfully!');
      console.log(`\n📋 Admin Account Details:`);
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
      console.log(`   Name: ${ADMIN_NAME}`);
      console.log(`\n⚠️  IMPORTANT: You need to:`);
      console.log(`   1. Verify your email (check inbox for verification code)`);
      console.log(`   2. Manually set role to 'admin' in MongoDB Atlas`);
      console.log(`\n💡 To promote to admin in MongoDB Atlas:`);
      console.log(`   Go to MongoDB Atlas → Browse Collections → authdb → users`);
      console.log(`   Find the user with email: ${ADMIN_EMAIL}`);
      console.log(`   Edit the document and change "role": "user" to "role": "admin"`);
    }
  } catch (error) {
    if (error.response?.data?.message?.includes('already exists') ||
        error.response?.data?.error?.includes('already exists')) {
      console.log('⚠️  User already exists!');
      console.log(`\n📋 Use these credentials:`);
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Password: (the one you set when registering)\n`);
      console.log(`\n💡 To promote to admin in MongoDB Atlas:`);
      console.log(`   Go to MongoDB Atlas → Browse Collections → authdb → users`);
      console.log(`   Find the user and change "role": "user" to "role": "admin"`);
    } else {
      console.error('❌ Error:', error.response?.data?.message || error.response?.data?.error || error.message);
    }
  }
}

createAdmin();
