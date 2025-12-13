const axios = require('axios');

// Comprehensive list of 150+ real-life trips from 50+ countries
// Covering flights, trains, and buses worldwide
const generateTrips = () => {
  const trips = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + 1); // Start from tomorrow

  // Helper function to generate date strings
  const getDateTime = (daysFromNow, hours, minutes) => {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString().slice(0, 19);
  };

  // Major International Flights
  const internationalFlights = [
    // North America
    { origin: "New York, USA", destination: "Los Angeles, USA", carrier: "American Airlines", duration: 6.5, price: 350, seats: 180 },
    { origin: "New York, USA", destination: "Miami, USA", carrier: "Delta Airlines", duration: 3, price: 220, seats: 170 },
    { origin: "Los Angeles, USA", destination: "San Francisco, USA", carrier: "United Airlines", duration: 1.5, price: 150, seats: 140 },
    { origin: "Chicago, USA", destination: "New York, USA", carrier: "Southwest Airlines", duration: 2.5, price: 180, seats: 160 },
    { origin: "Toronto, Canada", destination: "Vancouver, Canada", carrier: "Air Canada", duration: 5, price: 320, seats: 200 },
    { origin: "Mexico City, Mexico", destination: "Cancun, Mexico", carrier: "Volaris", duration: 2, price: 120, seats: 140 },
    { origin: "New York, USA", destination: "Chicago, USA", carrier: "JetBlue", duration: 2.5, price: 190, seats: 150 },
    { origin: "Dallas, USA", destination: "Houston, USA", carrier: "Southwest Airlines", duration: 1, price: 95, seats: 140 },
    { origin: "Seattle, USA", destination: "Portland, USA", carrier: "Alaska Airlines", duration: 1, price: 85, seats: 120 },
    { origin: "Boston, USA", destination: "Washington DC, USA", carrier: "American Airlines", duration: 1.5, price: 140, seats: 150 },

    // Europe
    { origin: "London, UK", destination: "Paris, France", carrier: "British Airways", duration: 1.25, price: 180, seats: 180 },
    { origin: "Paris, France", destination: "Rome, Italy", carrier: "Air France", duration: 2, price: 160, seats: 170 },
    { origin: "Berlin, Germany", destination: "Amsterdam, Netherlands", carrier: "Lufthansa", duration: 1.5, price: 140, seats: 160 },
    { origin: "Madrid, Spain", destination: "Lisbon, Portugal", carrier: "Iberia", duration: 1.25, price: 110, seats: 150 },
    { origin: "Vienna, Austria", destination: "Prague, Czech Republic", carrier: "Austrian Airlines", duration: 1, price: 95, seats: 130 },
    { origin: "Dublin, Ireland", destination: "London, UK", carrier: "Ryanair", duration: 1.25, price: 75, seats: 189 },
    { origin: "Athens, Greece", destination: "Santorini, Greece", carrier: "Aegean Airlines", duration: 0.75, price: 85, seats: 120 },
    { origin: "Stockholm, Sweden", destination: "Oslo, Norway", carrier: "SAS", duration: 1, price: 120, seats: 140 },
    { origin: "Copenhagen, Denmark", destination: "Helsinki, Finland", carrier: "Finnair", duration: 1.75, price: 135, seats: 150 },
    { origin: "Brussels, Belgium", destination: "Zurich, Switzerland", carrier: "Brussels Airlines", duration: 1.25, price: 145, seats: 140 },

    // Asia
    { origin: "Tokyo, Japan", destination: "Seoul, South Korea", carrier: "Japan Airlines", duration: 2.5, price: 280, seats: 250 },
    { origin: "Singapore", destination: "Bangkok, Thailand", carrier: "Singapore Airlines", duration: 2.5, price: 180, seats: 230 },
    { origin: "Dubai, UAE", destination: "Mumbai, India", carrier: "Emirates", duration: 3, price: 280, seats: 300 },
    { origin: "Hong Kong", destination: "Shanghai, China", carrier: "Cathay Pacific", duration: 2.5, price: 220, seats: 260 },
    { origin: "Beijing, China", destination: "Tokyo, Japan", carrier: "Air China", duration: 3.5, price: 350, seats: 280 },
    { origin: "Taipei, Taiwan", destination: "Manila, Philippines", carrier: "Eva Air", duration: 2, price: 150, seats: 200 },
    { origin: "Kuala Lumpur, Malaysia", destination: "Jakarta, Indonesia", carrier: "Malaysia Airlines", duration: 2, price: 130, seats: 180 },
    { origin: "Ho Chi Minh City, Vietnam", destination: "Hanoi, Vietnam", carrier: "Vietnam Airlines", duration: 2, price: 90, seats: 180 },
    { origin: "Delhi, India", destination: "Bangalore, India", carrier: "IndiGo", duration: 2.5, price: 80, seats: 180 },
    { origin: "Doha, Qatar", destination: "Istanbul, Turkey", carrier: "Qatar Airways", duration: 4, price: 320, seats: 250 },

    // Middle East & Africa
    { origin: "Cairo, Egypt", destination: "Dubai, UAE", carrier: "EgyptAir", duration: 3.5, price: 260, seats: 200 },
    { origin: "Johannesburg, South Africa", destination: "Cape Town, South Africa", carrier: "South African Airways", duration: 2, price: 140, seats: 180 },
    { origin: "Nairobi, Kenya", destination: "Dar es Salaam, Tanzania", carrier: "Kenya Airways", duration: 1.25, price: 150, seats: 140 },
    { origin: "Casablanca, Morocco", destination: "Marrakech, Morocco", carrier: "Royal Air Maroc", duration: 0.75, price: 60, seats: 120 },
    { origin: "Tel Aviv, Israel", destination: "Eilat, Israel", carrier: "El Al", duration: 0.75, price: 70, seats: 100 },

    // Australia & Oceania
    { origin: "Sydney, Australia", destination: "Melbourne, Australia", carrier: "Qantas", duration: 1.5, price: 150, seats: 180 },
    { origin: "Auckland, New Zealand", destination: "Wellington, New Zealand", carrier: "Air New Zealand", duration: 1, price: 90, seats: 140 },
    { origin: "Brisbane, Australia", destination: "Gold Coast, Australia", carrier: "Virgin Australia", duration: 0.75, price: 65, seats: 120 },
    { origin: "Perth, Australia", destination: "Sydney, Australia", carrier: "Qantas", duration: 4, price: 280, seats: 200 },

    // South America
    { origin: "São Paulo, Brazil", destination: "Rio de Janeiro, Brazil", carrier: "LATAM Airlines", duration: 1.25, price: 110, seats: 180 },
    { origin: "Buenos Aires, Argentina", destination: "Santiago, Chile", carrier: "Aerolíneas Argentinas", duration: 2, price: 180, seats: 170 },
    { origin: "Lima, Peru", destination: "Cusco, Peru", carrier: "LATAM Peru", duration: 1.25, price: 95, seats: 150 },
    { origin: "Bogota, Colombia", destination: "Cartagena, Colombia", carrier: "Avianca", duration: 1.25, price: 80, seats: 160 },
    { origin: "Quito, Ecuador", destination: "Guayaquil, Ecuador", carrier: "TAME", duration: 0.75, price: 65, seats: 120 },
  ];

  // High-Speed Trains
  const trainRoutes = [
    // Europe
    { origin: "London, UK", destination: "Paris, France", carrier: "Eurostar", duration: 2.25, price: 120, seats: 750 },
    { origin: "Paris, France", destination: "Brussels, Belgium", carrier: "Thalys", duration: 1.5, price: 85, seats: 400 },
    { origin: "Paris, France", destination: "Amsterdam, Netherlands", carrier: "Thalys", duration: 3.25, price: 110, seats: 400 },
    { origin: "Berlin, Germany", destination: "Munich, Germany", carrier: "Deutsche Bahn ICE", duration: 4, price: 90, seats: 460 },
    { origin: "Frankfurt, Germany", destination: "Cologne, Germany", carrier: "Deutsche Bahn ICE", duration: 1, price: 60, seats: 460 },
    { origin: "Milan, Italy", destination: "Rome, Italy", carrier: "Trenitalia Frecciarossa", duration: 3, price: 75, seats: 500 },
    { origin: "Rome, Italy", destination: "Naples, Italy", carrier: "Trenitalia Frecciarossa", duration: 1.25, price: 45, seats: 500 },
    { origin: "Madrid, Spain", destination: "Barcelona, Spain", carrier: "Renfe AVE", duration: 2.5, price: 85, seats: 350 },
    { origin: "Madrid, Spain", destination: "Seville, Spain", carrier: "Renfe AVE", duration: 2.5, price: 75, seats: 350 },
    { origin: "Zurich, Switzerland", destination: "Geneva, Switzerland", carrier: "SBB", duration: 2.75, price: 80, seats: 320 },
    { origin: "Vienna, Austria", destination: "Salzburg, Austria", carrier: "ÖBB Railjet", duration: 2.5, price: 55, seats: 400 },
    { origin: "Stockholm, Sweden", destination: "Gothenburg, Sweden", carrier: "SJ High Speed", duration: 3, price: 80, seats: 300 },

    // Asia
    { origin: "Tokyo, Japan", destination: "Osaka, Japan", carrier: "JR Central Shinkansen", duration: 2.5, price: 130, seats: 1323 },
    { origin: "Tokyo, Japan", destination: "Kyoto, Japan", carrier: "JR Central Shinkansen", duration: 2.25, price: 120, seats: 1323 },
    { origin: "Beijing, China", destination: "Shanghai, China", carrier: "China Railway High-Speed", duration: 4.5, price: 90, seats: 1000 },
    { origin: "Seoul, South Korea", destination: "Busan, South Korea", carrier: "KORAIL KTX", duration: 2.75, price: 55, seats: 935 },
    { origin: "Taipei, Taiwan", destination: "Kaohsiung, Taiwan", carrier: "Taiwan High Speed Rail", duration: 1.5, price: 50, seats: 989 },

    // Other
    { origin: "Istanbul, Turkey", destination: "Ankara, Turkey", carrier: "TCDD High Speed", duration: 4.25, price: 35, seats: 420 },
    { origin: "Moscow, Russia", destination: "St. Petersburg, Russia", carrier: "Sapsan", duration: 4, price: 70, seats: 520 },
    { origin: "Amsterdam, Netherlands", destination: "Brussels, Belgium", carrier: "Thalys", duration: 2, price: 50, seats: 400 },
    { origin: "Athens, Greece", destination: "Thessaloniki, Greece", carrier: "Hellenic Train IC", duration: 4.5, price: 50, seats: 280 },
  ];

  // Bus Routes
  const busRoutes = [
    // Europe
    { origin: "London, UK", destination: "Manchester, UK", carrier: "National Express", duration: 4.5, price: 25, seats: 50 },
    { origin: "Paris, France", destination: "Lyon, France", carrier: "FlixBus", duration: 5, price: 20, seats: 55 },
    { origin: "Berlin, Germany", destination: "Dresden, Germany", carrier: "FlixBus", duration: 2.5, price: 15, seats: 55 },
    { origin: "Barcelona, Spain", destination: "Valencia, Spain", carrier: "ALSA", duration: 4, price: 25, seats: 50 },
    { origin: "Rome, Italy", destination: "Florence, Italy", carrier: "FlixBus", duration: 3, price: 18, seats: 55 },
    { origin: "Prague, Czech Republic", destination: "Vienna, Austria", carrier: "RegioJet", duration: 4, price: 15, seats: 50 },
    { origin: "Warsaw, Poland", destination: "Krakow, Poland", carrier: "PolskiBus", duration: 4.5, price: 12, seats: 50 },
    { origin: "Lisbon, Portugal", destination: "Porto, Portugal", carrier: "Rede Expressos", duration: 3.5, price: 20, seats: 45 },

    // North America
    { origin: "New York, USA", destination: "Boston, USA", carrier: "Greyhound", duration: 4.5, price: 35, seats: 50 },
    { origin: "Los Angeles, USA", destination: "Las Vegas, USA", carrier: "FlixBus", duration: 5, price: 30, seats: 55 },
    { origin: "San Francisco, USA", destination: "Los Angeles, USA", carrier: "Greyhound", duration: 7, price: 40, seats: 50 },
    { origin: "Toronto, Canada", destination: "Montreal, Canada", carrier: "Greyhound Canada", duration: 5.5, price: 45, seats: 50 },
    { origin: "Vancouver, Canada", destination: "Seattle, USA", carrier: "Quick Shuttle", duration: 4, price: 35, seats: 40 },

    // South America
    { origin: "Buenos Aires, Argentina", destination: "Mendoza, Argentina", carrier: "Andesmar", duration: 14, price: 50, seats: 45 },
    { origin: "São Paulo, Brazil", destination: "Curitiba, Brazil", carrier: "Cometa", duration: 6, price: 35, seats: 50 },
    { origin: "Santiago, Chile", destination: "Valparaiso, Chile", carrier: "Pullman Bus", duration: 1.5, price: 10, seats: 45 },
    { origin: "Lima, Peru", destination: "Arequipa, Peru", carrier: "Cruz del Sur", duration: 16, price: 60, seats: 40 },

    // Asia
    { origin: "Bangkok, Thailand", destination: "Pattaya, Thailand", carrier: "Roong Reuang Coach", duration: 2.5, price: 8, seats: 45 },
    { origin: "Kuala Lumpur, Malaysia", destination: "Singapore", carrier: "Transtar", duration: 5, price: 20, seats: 40 },
    { origin: "Ho Chi Minh City, Vietnam", destination: "Phnom Penh, Cambodia", carrier: "Giant Ibis", duration: 6, price: 15, seats: 40 },
    { origin: "Delhi, India", destination: "Jaipur, India", carrier: "RSRTC Volvo", duration: 5, price: 12, seats: 45 },
  ];

  let tripId = 1;

  // Generate multiple departures for each route
  const generateDepartures = (routes, transportType, departuresPerRoute = 3) => {
    routes.forEach((route, routeIndex) => {
      for (let dep = 0; dep < departuresPerRoute; dep++) {
        const dayOffset = Math.floor(routeIndex / 5) + dep * 2; // Spread across different days
        const baseHour = transportType === 'flight' ? [6, 10, 15, 19][dep % 4]
                       : transportType === 'train' ? [7, 11, 16, 20][dep % 4]
                       : [6, 9, 14, 18][dep % 4];

        const departureHour = baseHour + (routeIndex % 3);
        const arrivalHour = departureHour + route.duration;

        const arrivalDay = dayOffset + (arrivalHour >= 24 ? 1 : 0);
        const actualArrivalHour = arrivalHour % 24;

        trips.push({
          id: tripId++,
          origin: route.origin,
          destination: route.destination,
          departureTime: getDateTime(dayOffset, departureHour, (routeIndex * 5) % 60),
          arrivalTime: getDateTime(arrivalDay, Math.floor(actualArrivalHour), Math.round((actualArrivalHour % 1) * 60)),
          transportType: transportType,
          price: route.price + Math.floor(Math.random() * 50) - 25, // Price variation
          availableSeats: Math.floor(route.seats * (0.3 + Math.random() * 0.6)), // 30-90% capacity
          carrier: route.carrier,
        });
      }
    });
  };

  // Generate trips
  generateDepartures(internationalFlights, 'flight', 3);
  generateDepartures(trainRoutes, 'train', 4);
  generateDepartures(busRoutes, 'bus', 3);

  return trips;
};

const realLifeTrips = generateTrips();

async function seedTrips() {
  console.log('🚀 Starting to seed comprehensive trip database...\n');
  console.log(`📊 Total trips to seed: ${realLifeTrips.length}\n`);

  let successCount = 0;
  let failCount = 0;

  // Group trips by type for better logging
  const flights = realLifeTrips.filter(t => t.transportType === 'flight');
  const trains = realLifeTrips.filter(t => t.transportType === 'train');
  const buses = realLifeTrips.filter(t => t.transportType === 'bus');

  console.log(`✈️  Flights: ${flights.length}`);
  console.log(`🚂 Trains: ${trains.length}`);
  console.log(`🚌 Buses: ${buses.length}\n`);

  for (const trip of realLifeTrips) {
    try {
      // Post directly to trip service (bypassing auth)
      const response = await axios.post('http://localhost:3002/api/trips', trip);
      if (response.data.success) {
        const icon = trip.transportType === 'flight' ? '✈️' : trip.transportType === 'train' ? '🚂' : '🚌';
        console.log(`✅ ${icon} ${trip.origin} → ${trip.destination} (${trip.carrier}) - $${trip.price}`);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Failed to add ${trip.origin} → ${trip.destination}:`,
        error.response?.data?.error || error.message);
      failCount++;
    }

    // Add small delay to prevent overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎉 Seeding complete!`);
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ Successfully added: ${successCount} trips`);
  console.log(`❌ Failed: ${failCount} trips`);
  console.log(`\n📊 Database now contains trips across:`);
  console.log(`   • 50+ international routes`);
  console.log(`   • 20+ high-speed train routes`);
  console.log(`   • 20+ bus routes`);
  console.log(`   • 40+ countries worldwide`);
}

// Export for programmatic use
module.exports = { seedTrips, realLifeTrips };

// Run if called directly
if (require.main === module) {
  seedTrips();
}
