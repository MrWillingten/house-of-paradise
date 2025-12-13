const axios = require('axios');

/**
 * Reset hotel and trip prices to reasonable base values
 */

async function resetPrices() {
  console.log('🔄 Resetting all prices to reasonable base values...\n');

  // Reset hotel prices
  const hotelPrices = {
    'Burj Al Arab Jumeirah': 1500,
    'The Ritz Paris': 1200,
    'Marina Bay Sands': 450,
    'The Plaza Hotel': 800,
    'Atlantis The Palm': 600,
    'Raffles Hotel Singapore': 550,
    'The Savoy': 700,
    'Hotel de Crillon': 950,
    'Four Seasons George V': 1100,
    'The Peninsula Hong Kong': 650,
    'Aman Tokyo': 950,
    'Copacabana Palace': 500,
    'The Oberoi Udaivilas': 750,
    'Claridge\'s': 850,
    'Waldorf Astoria New York': 650,
    'The St. Regis Rome': 700,
    'Park Hyatt Sydney': 550,
    'Fairmont Banff Springs': 400,
    'Emirates Palace': 800,
    'Mandarin Oriental Bangkok': 400
  };

  try {
    const response = await axios.get('http://localhost:3001/api/hotels');
    const hotels = response.data.data;

    for (const hotel of hotels) {
      const basePrice = hotelPrices[hotel.name] || 500;
      await axios.put(`http://localhost:3001/api/hotels/${hotel._id}`, {
        basePrice: basePrice,
        pricePerNight: basePrice,
        availableRooms: Math.min(hotel.availableRooms || 30, 50)
      });
      console.log(`✅ Reset ${hotel.name}: $${basePrice}/night`);
    }

    console.log(`\n✅ Successfully reset ${hotels.length} hotel prices!`);
  } catch (error) {
    console.error('❌ Error resetting hotel prices:', error.message);
  }

  // Reset trip prices
  const tripPrices = {
    'New York, USA': 350,
    'London, UK': 120,
    'Tokyo, Japan': 130,
    'Dubai, UAE': 280,
    'Sydney, Australia': 150,
    'Berlin, Germany': 90,
    'Toronto, Canada': 320,
    'São Paulo, Brazil': 110,
    'Madrid, Spain': 85,
    'Singapore': 95,
    'Rome, Italy': 70,
    'Seoul, South Korea': 55,
    'Cairo, Egypt': 120,
    'Amsterdam, Netherlands': 45,
    'Bangkok, Thailand': 75,
    'Johannesburg, South Africa': 140,
    'Istanbul, Turkey': 35,
    'Buenos Aires, Argentina': 180,
    'Stockholm, Sweden': 80,
    'Athens, Greece': 50
  };

  try {
    const response = await axios.get('http://localhost:3002/api/trips');
    const trips = response.data.data;

    for (const trip of trips) {
      let basePrice = 100; // Default
      for (const city in tripPrices) {
        if (trip.origin.includes(city)) {
          basePrice = tripPrices[city];
          break;
        }
      }

      await axios.put(`http://localhost:3002/api/trips/${trip.id}`, {
        price: basePrice,
        availableSeats: trip.transportType === 'train' ? Math.min(trip.availableSeats || 400, 500) : Math.min(trip.availableSeats || 150, 200)
      });
      console.log(`✅ Reset ${trip.origin} → ${trip.destination}: $${basePrice}`);
    }

    console.log(`\n✅ Successfully reset ${trips.length} trip prices!`);
  } catch (error) {
    console.error('❌ Error resetting trip prices:', error.message);
  }

  console.log('\n🎉 All prices have been reset to realistic base values!');
  console.log('👉 The sync services will now maintain realistic pricing with ±5-10% fluctuations.');
}

resetPrices();
