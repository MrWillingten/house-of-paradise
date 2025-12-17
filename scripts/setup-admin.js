const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Setup Admin Script
 * Clears all users and creates a default admin account
 * NO email verification required, NO password breach check
 */

// MongoDB Atlas connection
const MONGODB_URI = 'mongodb+srv://aminzou54_db_user:GIAKXlmboXdZ31F9@microservicesmongodb.ktah2ws.mongodb.net/authdb?retryWrites=true&w=majority';

// Default admin credentials
const ADMIN_EMAIL = 'admin@houseofparadise.com';
const ADMIN_PASSWORD = 'Admin@HoP2025!';
const ADMIN_NAME = 'Administrator';

// User schema (simplified version matching auth-service)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  isVerified: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

async function setupAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    const User = mongoose.model('User', userSchema);

    // Step 1: Delete all existing users
    console.log('🗑️  Deleting all existing users...');
    const deleteResult = await User.deleteMany({});
    console.log(`   Deleted ${deleteResult.deletedCount} users\n`);

    // Step 2: Hash the password
    console.log('🔐 Creating admin account...');
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    // Step 3: Create admin user (pre-verified, admin role)
    const adminUser = new User({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
      isVerified: true,  // Pre-verified - no email needed
      twoFactorEnabled: false,
      disabled: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await adminUser.save();
    console.log('✅ Admin account created successfully!\n');

    console.log('=====================================================');
    console.log('📋 ADMIN ACCOUNT DETAILS:');
    console.log('=====================================================');
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Role:     admin`);
    console.log(`   Verified: true (no email verification needed)`);
    console.log('=====================================================');
    console.log('\n🎉 You can now login at: https://house-of-paradise.vercel.app/login\n');

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

setupAdmin();
