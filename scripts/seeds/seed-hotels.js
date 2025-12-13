const axios = require('axios');

const famousHotels = [
  {
    name: "Burj Al Arab Jumeirah",
    location: "Dubai, UAE",
    pricePerNight: 1500,
    availableRooms: 15,
    rating: 5.0,
    amenities: ["Private Beach", "Spa", "Pool", "Restaurant", "WiFi", "Gym", "Room Service", "Butler Service"]
  },
  {
    name: "The Ritz Paris",
    location: "Paris, France",
    pricePerNight: 1200,
    availableRooms: 20,
    rating: 4.9,
    amenities: ["Spa", "Restaurant", "Bar", "WiFi", "Gym", "Concierge", "Room Service"]
  },
  {
    name: "Marina Bay Sands",
    location: "Singapore",
    pricePerNight: 450,
    availableRooms: 50,
    rating: 4.8,
    amenities: ["Infinity Pool", "Casino", "Shopping Mall", "Spa", "WiFi", "Restaurant", "Gym"]
  },
  {
    name: "The Plaza Hotel",
    location: "New York, USA",
    pricePerNight: 800,
    availableRooms: 30,
    rating: 4.7,
    amenities: ["Restaurant", "Bar", "Spa", "WiFi", "Concierge", "Room Service", "Gym"]
  },
  {
    name: "Atlantis The Palm",
    location: "Dubai, UAE",
    pricePerNight: 600,
    availableRooms: 40,
    rating: 4.8,
    amenities: ["Waterpark", "Aquarium", "Private Beach", "Pool", "Spa", "Restaurant", "WiFi"]
  },
  {
    name: "Raffles Hotel Singapore",
    location: "Singapore",
    pricePerNight: 550,
    availableRooms: 25,
    rating: 4.9,
    amenities: ["Pool", "Spa", "Restaurant", "Bar", "WiFi", "Gym", "Butler Service"]
  },
  {
    name: "The Savoy",
    location: "London, UK",
    pricePerNight: 700,
    availableRooms: 35,
    rating: 4.8,
    amenities: ["River View", "Restaurant", "Bar", "Spa", "WiFi", "Gym", "Concierge"]
  },
  {
    name: "Hotel de Crillon",
    location: "Paris, France",
    pricePerNight: 950,
    availableRooms: 18,
    rating: 4.9,
    amenities: ["Spa", "Restaurant", "Bar", "WiFi", "Room Service", "Concierge"]
  },
  {
    name: "Four Seasons George V",
    location: "Paris, France",
    pricePerNight: 1100,
    availableRooms: 22,
    rating: 5.0,
    amenities: ["Spa", "Michelin Restaurant", "WiFi", "Gym", "Room Service", "Concierge"]
  },
  {
    name: "The Peninsula Hong Kong",
    location: "Hong Kong",
    pricePerNight: 650,
    availableRooms: 28,
    rating: 4.9,
    amenities: ["Harbor View", "Spa", "Pool", "Restaurant", "WiFi", "Gym", "Helipad"]
  },
  {
    name: "Mandarin Oriental Bangkok",
    location: "Bangkok, Thailand",
    pricePerNight: 400,
    availableRooms: 45,
    rating: 4.8,
    amenities: ["River View", "Spa", "Pool", "Restaurant", "WiFi", "Gym", "Cooking Classes"]
  },
  {
    name: "Aman Tokyo",
    location: "Tokyo, Japan",
    pricePerNight: 950,
    availableRooms: 20,
    rating: 4.9,
    amenities: ["City View", "Spa", "Pool", "Restaurant", "WiFi", "Gym", "Tea Ceremony"]
  },
  {
    name: "Copacabana Palace",
    location: "Rio de Janeiro, Brazil",
    pricePerNight: 500,
    availableRooms: 32,
    rating: 4.7,
    amenities: ["Beach Access", "Pool", "Spa", "Restaurant", "WiFi", "Gym", "Nightclub"]
  },
  {
    name: "The Oberoi Udaivilas",
    location: "Udaipur, India",
    pricePerNight: 750,
    availableRooms: 15,
    rating: 5.0,
    amenities: ["Lake View", "Spa", "Pool", "Restaurant", "WiFi", "Boat Rides", "Cultural Tours"]
  },
  {
    name: "Claridge's",
    location: "London, UK",
    pricePerNight: 850,
    availableRooms: 26,
    rating: 4.8,
    amenities: ["Restaurant", "Bar", "Spa", "WiFi", "Gym", "Afternoon Tea", "Concierge"]
  },
  {
    name: "Waldorf Astoria New York",
    location: "New York, USA",
    pricePerNight: 650,
    availableRooms: 38,
    rating: 4.7,
    amenities: ["Restaurant", "Bar", "Spa", "WiFi", "Gym", "Room Service", "Concierge"]
  },
  {
    name: "The St. Regis Rome",
    location: "Rome, Italy",
    pricePerNight: 700,
    availableRooms: 24,
    rating: 4.9,
    amenities: ["Restaurant", "Bar", "Spa", "WiFi", "Butler Service", "Room Service"]
  },
  {
    name: "Park Hyatt Sydney",
    location: "Sydney, Australia",
    pricePerNight: 550,
    availableRooms: 30,
    rating: 4.8,
    amenities: ["Harbor View", "Opera House View", "Pool", "Spa", "Restaurant", "WiFi", "Gym"]
  },
  {
    name: "Fairmont Banff Springs",
    location: "Banff, Canada",
    pricePerNight: 400,
    availableRooms: 42,
    rating: 4.7,
    amenities: ["Mountain View", "Spa", "Pool", "Golf Course", "Restaurant", "WiFi", "Ski Access"]
  },
  {
    name: "Emirates Palace",
    location: "Abu Dhabi, UAE",
    pricePerNight: 800,
    availableRooms: 35,
    rating: 4.9,
    amenities: ["Private Beach", "Pool", "Spa", "Restaurant", "WiFi", "Marina", "Gold ATM"]
  }
];

async function seedHotels() {
  console.log('🌱 Starting to seed famous hotels...\n');

  let successCount = 0;
  let failCount = 0;

  for (const hotel of famousHotels) {
    try {
      // Bypass API Gateway and add directly to hotel service
      const response = await axios.post('http://localhost:3001/api/hotels', hotel);
      if (response.data.success) {
        console.log(`✅ Added: ${hotel.name} - ${hotel.location}`);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Failed to add ${hotel.name}:`, error.response?.data?.error || error.message);
      failCount++;
    }
  }

  console.log(`\n🎉 Seeding complete!`);
  console.log(`✅ Successfully added: ${successCount} hotels`);
  console.log(`❌ Failed: ${failCount} hotels`);
}

seedHotels();
