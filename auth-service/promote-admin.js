// Script to promote admin@houseofparadise.com to admin role
// Run with: node promote-admin.js

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/authdb';

// User Schema (simplified for this script)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
});

const User = mongoose.model('User', userSchema);

async function promoteAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'admin@houseofparadise.com';

    const user = await User.findOne({ email });

    if (!user) {
      console.log(`User with email ${email} not found`);
      process.exit(1);
    }

    console.log(`Found user: ${user.name} (${user.email}), current role: ${user.role}`);

    if (user.role === 'admin') {
      console.log('User is already an admin!');
      process.exit(0);
    }

    // Update role to admin
    user.role = 'admin';
    await user.save();

    console.log(`Successfully promoted ${user.email} to admin!`);

    // Verify the change
    const updatedUser = await User.findOne({ email });
    console.log(`Verified: ${updatedUser.email} is now ${updatedUser.role}`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

promoteAdmin();
