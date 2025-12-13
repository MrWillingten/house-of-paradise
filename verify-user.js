const { MongoClient } = require('mongodb');

async function verifyUser() {
  const client = new MongoClient('mongodb://localhost:27017');

  try {
    await client.connect();
    const db = client.db('authdb');

    const result = await db.collection('users').updateOne(
      { email: 'aminzou54@gmail.com' },
      { $set: { isVerified: true } }
    );

    console.log('✅ User verified successfully!');
    console.log('Modified count:', result.modifiedCount);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

verifyUser();
