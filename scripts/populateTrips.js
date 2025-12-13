/**
 * TRIPS DATABASE POPULATION SCRIPT
 * Generates 2000+ trips between all major cities
 */

const mongoose = require('mongoose');

const TRIP_DB_URI = 'mongodb://localhost:27017/tripdb';

// All countries with major cities
const COUNTRIES = {
  'Tunisia': ['Tunis', 'Sousse', 'Sfax', 'Hammamet', 'Djerba'],
  'Egypt': ['Cairo', 'Alexandria', 'Luxor', 'Aswan', 'Sharm El Sheikh'],
  'Morocco': ['Casablanca', 'Marrakech', 'Rabat', 'Fes', 'Tangier'],
  'South Africa': ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth'],
  'Japan': ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Sapporo'],
  'China': ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu'],
  'India': ['Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Chennai'],
  'Thailand': ['Bangkok', 'Phuket', 'Chiang Mai', 'Pattaya', 'Krabi'],
  'Vietnam': ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Nha Trang', 'Hoi An'],
  'Singapore': ['Singapore'],
  'Malaysia': ['Kuala Lumpur', 'Penang', 'Johor Bahru', 'Malacca', 'Kota Kinabalu'],
  'Indonesia': ['Jakarta', 'Bali', 'Surabaya', 'Yogyakarta', 'Lombok'],
  'South Korea': ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Jeju'],
  'UAE': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah'],
  'France': ['Paris', 'Lyon', 'Marseille', 'Nice', 'Bordeaux'],
  'Germany': ['Berlin', 'Munich', 'Frankfurt', 'Hamburg', 'Cologne'],
  'Italy': ['Rome', 'Milan', 'Venice', 'Florence', 'Naples'],
  'Spain': ['Madrid', 'Barcelona', 'Seville', 'Valencia', 'Malaga'],
  'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Liverpool'],
  'Greece': ['Athens', 'Thessaloniki', 'Santorini', 'Mykonos', 'Crete'],
  'Portugal': ['Lisbon', 'Porto', 'Faro', 'Coimbra', 'Funchal'],
  'Netherlands': ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven'],
  'Switzerland': ['Zurich', 'Geneva', 'Basel', 'Bern', 'Lucerne'],
  'United States': ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Las Vegas', 'San Francisco'],
  'Canada': ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'],
  'Mexico': ['Mexico City', 'Cancun', 'Guadalajara', 'Monterrey', 'Playa del Carmen'],
  'Brazil': ['Rio de Janeiro', 'Sao Paulo', 'Brasilia', 'Salvador', 'Fortaleza'],
  'Argentina': ['Buenos Aires', 'Cordoba', 'Rosario', 'Mendoza', 'Bariloche'],
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Gold Coast'],
  'New Zealand': ['Auckland', 'Wellington', 'Christchurch', 'Queenstown', 'Rotorua'],
};

const tripSchema = new mongoose.Schema({
  origin: String,
  destination: String,
  transportType: String,
  price: Number,
  duration: String,
  departureTime: String,
  arrivalTime: String,
  availableSeats: Number,
  totalSeats: Number,
  company: String,
  rating: Number,
  amenities: [String],
  isPopular: Boolean,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const TRANSPORT_TYPES = ['flight', 'train', 'bus', 'ferry'];
const COMPANIES = {
  flight: ['Emirates', 'Qatar Airways', 'Singapore Airlines', 'Lufthansa', 'Air France', 'United', 'Delta', 'British Airways', 'KLM', 'Turkish Airlines'],
  train: ['Eurostar', 'TGV', 'Shinkansen', 'Amtrak', 'SNCF', 'Deutsche Bahn', 'Trenitalia', 'Renfe'],
  bus: ['FlixBus', 'Greyhound', 'Megabus', 'National Express', 'BlaBlaBus', 'Alsa'],
  ferry: ['P&O Ferries', 'DFDS', 'Stena Line', 'Brittany Ferries']
};

const AMENITIES = ['WiFi', 'AC', 'Reclining Seats', 'USB Charging', 'Refreshments', 'Entertainment', 'Luggage Storage', 'Onboard Restroom'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

async function generateTripsForRoute(fromCountry, fromCity, toCountry, toCity, count = 15) {
  const trips = [];

  for (let i = 0; i < count; i++) {
    const transportType = TRANSPORT_TYPES[randomInt(0, 3)];
    const company = COMPANIES[transportType][randomInt(0, COMPANIES[transportType].length - 1)];
    const durationHours = randomInt(1, 24);
    const price = randomInt(50, 1500);
    const totalSeats = randomInt(50, 300);
    const availableSeats = randomInt(10, Math.floor(totalSeats * 0.6));

    const departureHour = randomInt(0, 23);
    const arrivalHour = (departureHour + durationHours) % 24;

    const trip = {
      origin: `${fromCity}, ${fromCountry}`,
      destination: `${toCity}, ${toCountry}`,
      transportType,
      price,
      duration: `${durationHours}h ${randomInt(0, 59)}m`,
      departureTime: `${departureHour.toString().padStart(2, '0')}:${randomInt(0, 59).toString().padStart(2, '0')}`,
      arrivalTime: `${arrivalHour.toString().padStart(2, '0')}:${randomInt(0, 59).toString().padStart(2, '0')}`,
      availableSeats,
      totalSeats,
      company,
      rating: randomFloat(7.0, 9.5, 1),
      amenities: AMENITIES.sort(() => 0.5 - Math.random()).slice(0, randomInt(3, 6)),
      isPopular: Math.random() > 0.8
    };

    trips.push(trip);
  }

  return trips;
}

async function main() {
  try {
    console.log('🚀 POPULATING TRIPS DATABASE...\n');

    const connection = await mongoose.createConnection(TRIP_DB_URI).asPromise();
    console.log('✅ Connected to TripDB\n');

    const Trip = connection.model('Trip', tripSchema);

    let totalTrips = 0;
    const countryKeys = Object.keys(COUNTRIES);

    for (let i = 0; i < countryKeys.length; i++) {
      const fromCountry = countryKeys[i];
      const fromCities = COUNTRIES[fromCountry];

      console.log(`\n✈️  Processing trips from ${fromCountry}...`);

      // Generate trips to 5 other countries
      for (let j = 0; j < 5; j++) {
        const toIndex = (i + j + 1) % countryKeys.length;
        const toCountry = countryKeys[toIndex];
        const toCities = COUNTRIES[toCountry];

        const fromCity = fromCities[0];
        const toCity = toCities[0];

        const tripsToGenerate = randomInt(10, 20);
        const trips = await generateTripsForRoute(fromCountry, fromCity, toCountry, toCity, tripsToGenerate);

        await Trip.insertMany(trips);
        totalTrips += trips.length;
        console.log(`   ✅ Added ${trips.length} trips from ${fromCity} to ${toCity}`);
      }
    }

    console.log(`\n\n` + '='.repeat(60));
    console.log('🎉 TRIPS POPULATION COMPLETE!');
    console.log('='.repeat(60));
    console.log(`\n📊 Total Trips: ${totalTrips}\n`);

    await connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ ERROR:', error);
    process.exit(1);
  }
}

main();
