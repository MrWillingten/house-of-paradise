const axios = require('axios');

async function testAdminAPI() {
  console.log('🧪 Testing Admin API Endpoints\n');
  console.log('='.repeat(80));

  try {
    // 1. Login as admin
    console.log('\n1️⃣  Testing Admin Login...');
    const loginResponse = await axios.post('http://localhost:8080/api/auth/login', {
      email: 'admin@travelhub.com',
      password: 'admin123'
    });

    const token = loginResponse.data.data.token;
    const adminUser = loginResponse.data.data.user;
    console.log(`✅ Login successful! Welcome ${adminUser.name} (${adminUser.role})`);

    const authHeaders = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    // 2. Get all users
    console.log('\n2️⃣  Testing Get All Users...');
    const usersResponse = await axios.get('http://localhost:8080/api/admin/users', authHeaders);
    console.log(`✅ Retrieved ${usersResponse.data.data.length} user(s)`);
    usersResponse.data.data.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) [${user.role}]`);
    });

    // 3. Get stats
    console.log('\n3️⃣  Testing System Statistics...');
    const statsResponse = await axios.get('http://localhost:8080/api/admin/stats', authHeaders);
    console.log(`✅ System Stats:`);
    console.log(`   Total Users: ${statsResponse.data.data.totalUsers}`);
    console.log(`   Admins: ${statsResponse.data.data.totalAdmins}`);
    console.log(`   Regular Users: ${statsResponse.data.data.totalRegularUsers}`);

    // 4. Test hotel access
    console.log('\n4️⃣  Testing Hotel Database Access...');
    const hotelsResponse = await axios.get('http://localhost:8080/api/hotels');
    console.log(`✅ Can access hotels: ${hotelsResponse.data.data.length} hotels found`);

    // 5. Test trip access
    console.log('\n5️⃣  Testing Trip Database Access...');
    const tripsResponse = await axios.get('http://localhost:8080/api/trips');
    const trips = tripsResponse.data.data || [];
    console.log(`✅ Can access trips: ${trips.length} trips found`);

    console.log('\n' + '='.repeat(80));
    console.log('🎉 All Tests Passed! Admin system is fully operational.\n');

  } catch (error) {
    console.error('\n❌ Test Failed:', error.response?.data?.error || error.message);
    console.error('\nFull error:', error.response?.data || error.message);
  }
}

testAdminAPI();
