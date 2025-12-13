// Cleanup script to remove mock hotel and trip data
const { MongoClient } = require('mongodb');

async function cleanupMockData() {
  console.log('🧹 Starting cleanup of mock data...\n');

  // Hotel database cleanup
  try {
    const hotelClient = new MongoClient('mongodb://localhost:27017');
    await hotelClient.connect();
    console.log('✅ Connected to Hotel MongoDB');

    const hotelDb = hotelClient.db('hoteldb');

    // Count before deletion
    const hotelCount = await hotelDb.collection('hotels').countDocuments();
    const bookingCount = await hotelDb.collection('bookings').countDocuments();
    const priceHistoryCount = await hotelDb.collection('pricehistories').countDocuments();
    const reviewCount = await hotelDb.collection('reviews').countDocuments();

    console.log(`\n📊 Found ${hotelCount} hotels`);
    console.log(`📊 Found ${bookingCount} bookings`);
    console.log(`📊 Found ${priceHistoryCount} price history records`);
    console.log(`📊 Found ${reviewCount} reviews`);

    // Delete all mock data
    const hotelResult = await hotelDb.collection('hotels').deleteMany({});
    const bookingResult = await hotelDb.collection('bookings').deleteMany({});
    const priceHistoryResult = await hotelDb.collection('pricehistories').deleteMany({});
    const reviewResult = await hotelDb.collection('reviews').deleteMany({});

    console.log(`\n✅ Deleted ${hotelResult.deletedCount} hotels`);
    console.log(`✅ Deleted ${bookingResult.deletedCount} bookings`);
    console.log(`✅ Deleted ${priceHistoryResult.deletedCount} price history records`);
    console.log(`✅ Deleted ${reviewResult.deletedCount} reviews`);

    await hotelClient.close();
  } catch (error) {
    console.error('❌ Error cleaning hotel database:', error.message);
  }

  // Trip database cleanup
  try {
    const tripClient = new MongoClient('mongodb://localhost:27017');
    await tripClient.connect();
    console.log('\n✅ Connected to Trip MongoDB');

    const tripDb = tripClient.db('tripdb');

    // Count before deletion
    const tripCount = await tripDb.collection('trips').countDocuments();
    console.log(`\n📊 Found ${tripCount} trips`);

    // Delete all mock data
    const tripResult = await tripDb.collection('trips').deleteMany({});
    console.log(`✅ Deleted ${tripResult.deletedCount} trips`);

    await tripClient.close();
  } catch (error) {
    console.error('❌ Error cleaning trip database:', error.message);
  }

  console.log('\n🎉 Cleanup complete! All mock data has been removed.');
  console.log('📝 Next step: Integrate Booking.com API to populate with real data.\n');
}

cleanupMockData().catch(console.error);
