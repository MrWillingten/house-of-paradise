/**
 * USER PASSWORD RESET TOOL
 *
 * Directly resets a user's password in the database (for admin use)
 * Usage: node reset-user-password.js <email> <new-password>
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/authdb';

// User Schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  role: String,
  isVerified: Boolean,
  passwordHistory: [String],
  createdAt: Date
});

async function resetPassword(email, newPassword) {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const User = mongoose.model('User', userSchema);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`👤 Found user: ${user.name} (${user.email})`);
    console.log(`   Verified: ${user.isVerified}`);
    console.log(`   Role: ${user.role}\n`);

    // Hash new password
    console.log('🔐 Hashing new password...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    console.log('✅ Password updated successfully!\n');
    console.log('📝 You can now login with:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${newPassword}\n`);

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Get command line arguments
const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.log('Usage: node reset-user-password.js <email> <new-password>\n');
  console.log('Example:');
  console.log('  node reset-user-password.js user@example.com MyNewPass123!\n');
  console.log('Password requirements:');
  console.log('  - At least 8 characters');
  console.log('  - At least one uppercase letter');
  console.log('  - At least one lowercase letter');
  console.log('  - At least one number');
  console.log('  - At least one special character (!@#$%^&*)\n');
  process.exit(1);
}

// Validate password
const hasUppercase = /[A-Z]/.test(newPassword);
const hasLowercase = /[a-z]/.test(newPassword);
const hasNumber = /[0-9]/.test(newPassword);
const hasSpecial = /[!@#$%^&*]/.test(newPassword);

if (newPassword.length < 8 || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
  console.error('❌ Password does not meet requirements!\n');
  console.error('Password must have:');
  console.error(`  ${newPassword.length >= 8 ? '✅' : '❌'} At least 8 characters`);
  console.error(`  ${hasUppercase ? '✅' : '❌'} At least one uppercase letter`);
  console.error(`  ${hasLowercase ? '✅' : '❌'} At least one lowercase letter`);
  console.error(`  ${hasNumber ? '✅' : '❌'} At least one number`);
  console.error(`  ${hasSpecial ? '✅' : '❌'} At least one special character (!@#$%^&*)\n`);
  process.exit(1);
}

console.log('🔄 Resetting password for:', email);
console.log('');

resetPassword(email, newPassword);
