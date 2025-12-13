const axios = require('axios');

/**
 * Create Admin User Script
 * Creates a default admin account for testing
 */

async function createAdmin() {
  console.log('🔐 Creating admin account...\n');

  try {
    const response = await axios.post('http://localhost:8080/api/auth/register', {
      email: 'admin@travelhub.com',
      password: 'admin123',
      name: 'System Administrator'
    });

    if (response.data.success) {
      // Now update the user to admin role directly in auth service
      const userId = response.data.data.user.id;
      const token = response.data.data.token;

      console.log('✅ User created successfully!');
      console.log(`\n📋 Admin Account Details:`);
      console.log(`   Email: admin@travelhub.com`);
      console.log(`   Password: admin123`);
      console.log(`   User ID: ${userId}`);
      console.log(`\n⚠️  IMPORTANT: Change the password after first login!`);
      console.log(`\n💡 To promote this user to admin, run:`);
      console.log(`   docker exec -it mongodb mongosh authdb --eval "db.users.updateOne({email: 'admin@travelhub.com'}, {\\$set: {role: 'admin'}})" \n`);
    }
  } catch (error) {
    if (error.response?.data?.error === 'User already exists') {
      console.log('⚠️  Admin user already exists!');
      console.log(`\n📋 Use these credentials:`);
      console.log(`   Email: admin@travelhub.com`);
      console.log(`   Password: admin123\n`);
    } else {
      console.error('❌ Error:', error.response?.data?.error || error.message);
    }
  }
}

createAdmin();
