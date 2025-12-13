const mongoose = require('mongoose');
const path = require('path');

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hoteldb';

// Import countries data (CommonJS conversion)
const countries = [
  { name: "Afghanistan", code: "+93", iso: "AF", flag: "🇦🇫" },
  { name: "Albania", code: "+355", iso: "AL", flag: "🇦🇱" },
  { name: "Algeria", code: "+213", iso: "DZ", flag: "🇩🇿" },
  { name: "Argentina", code: "+54", iso: "AR", flag: "🇦🇷" },
  { name: "Australia", code: "+61", iso: "AU", flag: "🇦🇺" },
  { name: "Austria", code: "+43", iso: "AT", flag: "🇦🇹" },
  { name: "Bahrain", code: "+973", iso: "BH", flag: "🇧🇭" },
  { name: "Bangladesh", code: "+880", iso: "BD", flag: "🇧🇩" },
  { name: "Belgium", code: "+32", iso: "BE", flag: "🇧🇪" },
  { name: "Brazil", code: "+55", iso: "BR", flag: "🇧🇷" },
  { name: "Bulgaria", code: "+359", iso: "BG", flag: "🇧🇬" },
  { name: "Canada", code: "+1", iso: "CA", flag: "🇨🇦" },
  { name: "Chile", code: "+56", iso: "CL", flag: "🇨🇱" },
  { name: "China", code: "+86", iso: "CN", flag: "🇨🇳" },
  { name: "Colombia", code: "+57", iso: "CO", flag: "🇨🇴" },
  { name: "Costa Rica", code: "+506", iso: "CR", flag: "🇨🇷" },
  { name: "Croatia", code: "+385", iso: "HR", flag: "🇭🇷" },
  { name: "Cuba", code: "+53", iso: "CU", flag: "🇨🇺" },
  { name: "Cyprus", code: "+357", iso: "CY", flag: "🇨🇾" },
  { name: "Czech Republic", code: "+420", iso: "CZ", flag: "🇨🇿" },
  { name: "Denmark", code: "+45", iso: "DK", flag: "🇩🇰" },
  { name: "Dominican Republic", code: "+1-809", iso: "DO", flag: "🇩🇴" },
  { name: "Ecuador", code: "+593", iso: "EC", flag: "🇪🇨" },
  { name: "Egypt", code: "+20", iso: "EG", flag: "🇪🇬" },
  { name: "Estonia", code: "+372", iso: "EE", flag: "🇪🇪" },
  { name: "Ethiopia", code: "+251", iso: "ET", flag: "🇪🇹" },
  { name: "Finland", code: "+358", iso: "FI", flag: "🇫🇮" },
  { name: "France", code: "+33", iso: "FR", flag: "🇫🇷" },
  { name: "Germany", code: "+49", iso: "DE", flag: "🇩🇪" },
  { name: "Ghana", code: "+233", iso: "GH", flag: "🇬🇭" },
  { name: "Greece", code: "+30", iso: "GR", flag: "🇬🇷" },
  { name: "Hong Kong", code: "+852", iso: "HK", flag: "🇭🇰" },
  { name: "Hungary", code: "+36", iso: "HU", flag: "🇭🇺" },
  { name: "Iceland", code: "+354", iso: "IS", flag: "🇮🇸" },
  { name: "India", code: "+91", iso: "IN", flag: "🇮🇳" },
  { name: "Indonesia", code: "+62", iso: "ID", flag: "🇮🇩" },
  { name: "Iran", code: "+98", iso: "IR", flag: "🇮🇷" },
  { name: "Iraq", code: "+964", iso: "IQ", flag: "🇮🇶" },
  { name: "Ireland", code: "+353", iso: "IE", flag: "🇮🇪" },
  { name: "Israel", code: "+972", iso: "IL", flag: "🇮🇱" },
  { name: "Italy", code: "+39", iso: "IT", flag: "🇮🇹" },
  { name: "Jamaica", code: "+1-876", iso: "JM", flag: "🇯🇲" },
  { name: "Japan", code: "+81", iso: "JP", flag: "🇯🇵" },
  { name: "Jordan", code: "+962", iso: "JO", flag: "🇯🇴" },
  { name: "Kazakhstan", code: "+7", iso: "KZ", flag: "🇰🇿" },
  { name: "Kenya", code: "+254", iso: "KE", flag: "🇰🇪" },
  { name: "Kuwait", code: "+965", iso: "KW", flag: "🇰🇼" },
  { name: "Latvia", code: "+371", iso: "LV", flag: "🇱🇻" },
  { name: "Lebanon", code: "+961", iso: "LB", flag: "🇱🇧" },
  { name: "Libya", code: "+218", iso: "LY", flag: "🇱🇾" },
  { name: "Lithuania", code: "+370", iso: "LT", flag: "🇱🇹" },
  { name: "Luxembourg", code: "+352", iso: "LU", flag: "🇱🇺" },
  { name: "Malaysia", code: "+60", iso: "MY", flag: "🇲🇾" },
  { name: "Maldives", code: "+960", iso: "MV", flag: "🇲🇻" },
  { name: "Malta", code: "+356", iso: "MT", flag: "🇲🇹" },
  { name: "Mexico", code: "+52", iso: "MX", flag: "🇲🇽" },
  { name: "Monaco", code: "+377", iso: "MC", flag: "🇲🇨" },
  { name: "Morocco", code: "+212", iso: "MA", flag: "🇲🇦" },
  { name: "Nepal", code: "+977", iso: "NP", flag: "🇳🇵" },
  { name: "Netherlands", code: "+31", iso: "NL", flag: "🇳🇱" },
  { name: "New Zealand", code: "+64", iso: "NZ", flag: "🇳🇿" },
  { name: "Nigeria", code: "+234", iso: "NG", flag: "🇳🇬" },
  { name: "Norway", code: "+47", iso: "NO", flag: "🇳🇴" },
  { name: "Oman", code: "+968", iso: "OM", flag: "🇴🇲" },
  { name: "Pakistan", code: "+92", iso: "PK", flag: "🇵🇰" },
  { name: "Palestine", code: "+970", iso: "PS", flag: "🇵🇸" },
  { name: "Panama", code: "+507", iso: "PA", flag: "🇵🇦" },
  { name: "Peru", code: "+51", iso: "PE", flag: "🇵🇪" },
  { name: "Philippines", code: "+63", iso: "PH", flag: "🇵🇭" },
  { name: "Poland", code: "+48", iso: "PL", flag: "🇵🇱" },
  { name: "Portugal", code: "+351", iso: "PT", flag: "🇵🇹" },
  { name: "Qatar", code: "+974", iso: "QA", flag: "🇶🇦" },
  { name: "Romania", code: "+40", iso: "RO", flag: "🇷🇴" },
  { name: "Russia", code: "+7", iso: "RU", flag: "🇷🇺" },
  { name: "Saudi Arabia", code: "+966", iso: "SA", flag: "🇸🇦" },
  { name: "Serbia", code: "+381", iso: "RS", flag: "🇷🇸" },
  { name: "Singapore", code: "+65", iso: "SG", flag: "🇸🇬" },
  { name: "Slovakia", code: "+421", iso: "SK", flag: "🇸🇰" },
  { name: "Slovenia", code: "+386", iso: "SI", flag: "🇸🇮" },
  { name: "South Africa", code: "+27", iso: "ZA", flag: "🇿🇦" },
  { name: "South Korea", code: "+82", iso: "KR", flag: "🇰🇷" },
  { name: "Spain", code: "+34", iso: "ES", flag: "🇪🇸" },
  { name: "Sri Lanka", code: "+94", iso: "LK", flag: "🇱🇰" },
  { name: "Sweden", code: "+46", iso: "SE", flag: "🇸🇪" },
  { name: "Switzerland", code: "+41", iso: "CH", flag: "🇨🇭" },
  { name: "Syria", code: "+963", iso: "SY", flag: "🇸🇾" },
  { name: "Taiwan", code: "+886", iso: "TW", flag: "🇹🇼" },
  { name: "Tanzania", code: "+255", iso: "TZ", flag: "🇹🇿" },
  { name: "Thailand", code: "+66", iso: "TH", flag: "🇹🇭" },
  { name: "Tunisia", code: "+216", iso: "TN", flag: "🇹🇳" },
  { name: "Turkey", code: "+90", iso: "TR", flag: "🇹🇷" },
  { name: "Uganda", code: "+256", iso: "UG", flag: "🇺🇬" },
  { name: "Ukraine", code: "+380", iso: "UA", flag: "🇺🇦" },
  { name: "United Arab Emirates", code: "+971", iso: "AE", flag: "🇦🇪" },
  { name: "United Kingdom", code: "+44", iso: "GB", flag: "🇬🇧" },
  { name: "United States", code: "+1", iso: "US", flag: "🇺🇸" },
  { name: "Uruguay", code: "+598", iso: "UY", flag: "🇺🇾" },
  { name: "Venezuela", code: "+58", iso: "VE", flag: "🇻🇪" },
  { name: "Vietnam", code: "+84", iso: "VN", flag: "🇻🇳" },
  { name: "Yemen", code: "+967", iso: "YE", flag: "🇾🇪" },
  { name: "Zimbabwe", code: "+263", iso: "ZW", flag: "🇿🇼" }
];

// Hotel Schema Definition
const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, default: '' },
  basePrice: { type: Number, required: true },
  pricePerNight: { type: Number, required: true },
  discountPercent: { type: Number, default: 0 },
  originalPrice: { type: Number },
  totalRooms: { type: Number, required: true, default: 20 },
  availableRooms: { type: Number, required: true },
  lastBookedAt: { type: Date },
  currentViewers: { type: Number, default: 0 },
  bookingCount24h: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 10 },
  reviewCount: { type: Number, default: 0 },
  isPopular: { type: Boolean, default: false },
  isLimitedAvailability: { type: Boolean, default: false },
  availabilityStatus: {
    type: String,
    enum: ['available', 'limited', 'almost_full', 'full'],
    default: 'available'
  },
  amenities: [String],
  images: [String],
  propertyType: {
    type: String,
    enum: ['hotel', 'apartment', 'villa', 'resort', 'boutique'],
    default: 'hotel'
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  address: String,
  city: String,
  country: String,
  priceDropLast24h: { type: Number, default: 0 },
  priceTrend: {
    type: String,
    enum: ['up', 'down', 'stable'],
    default: 'stable'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Hotel = mongoose.model('Hotel', hotelSchema);

// Configuration
const HOTELS_PER_COUNTRY = 150; // Target 150 hotels per country = 15,150 total hotels

// Hotel naming components
const hotelChains = [
  'Hilton', 'Marriott', 'Hyatt', 'Radisson', 'InterContinental',
  'Best Western', 'Holiday Inn', 'Sheraton', 'Westin', 'Renaissance',
  'Crowne Plaza', 'DoubleTree', 'Four Points', 'Fairfield Inn', 'Courtyard',
  'Ramada', 'Days Inn', 'La Quinta', 'Comfort Inn', 'Quality Inn',
  'Hampton Inn', 'Embassy Suites', 'Homewood Suites', 'Residence Inn', 'SpringHill Suites'
];

const hotelTypes = [
  'Hotel', 'Resort', 'Inn', 'Suites', 'Lodge', 'Palace', 'Boutique', 'Grand',
  'Royal', 'Imperial', 'Plaza', 'Tower', 'Gardens', 'Beach Resort', 'Mountain Resort',
  'City Hotel', 'Business Hotel', 'Luxury Hotel', 'Budget Inn', 'Hostel'
];

const landmarks = [
  'Downtown', 'Airport', 'Beach', 'City Center', 'Harbor', 'Mountain View',
  'Riverside', 'Garden', 'Waterfront', 'Park View', 'Skyline', 'Marina',
  'Historic District', 'Business District', 'Financial District', 'Old Town',
  'New Town', 'Central', 'North', 'South', 'East', 'West', 'Bay',
  'Lakeside', 'Seaside', 'Highland', 'Valley', 'Plaza', 'Square'
];

const adjectives = [
  'Premium', 'Luxury', 'Deluxe', 'Executive', 'Elite', 'Signature', 'Select',
  'Comfort', 'Royal', 'Imperial', 'Golden', 'Silver', 'Diamond', 'Pearl',
  'Grand', 'Majestic', 'Elegant', 'Modern', 'Classic', 'Contemporary',
  'Boutique', 'Exclusive', 'Premier', 'Superior', 'Ultimate', 'Perfect'
];

const imageCategories = [
  'hotel-lobby', 'hotel-room', 'luxury-hotel', 'resort', 'hotel-pool',
  'boutique-hotel', 'hotel-exterior', 'hotel-suite', 'beach-resort', 'city-hotel',
  'hotel-breakfast', 'hotel-spa', 'hotel-gym', 'hotel-restaurant', 'hotel-bar'
];

// Country-specific city and landmark data
const countryData = {
  'United States': {
    cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami', 'San Francisco', 'Las Vegas', 'Boston', 'Seattle', 'Washington DC'],
    landmarks: ['Manhattan', 'Brooklyn', 'Hollywood', 'Beverly Hills', 'Times Square', 'Central Park', 'The Strip', 'Golden Gate', 'Space Needle'],
    economyTier: 'high'
  },
  'United Kingdom': {
    cities: ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Glasgow', 'Liverpool', 'Oxford', 'Cambridge', 'Brighton', 'Bristol'],
    landmarks: ['Westminster', 'Piccadilly', 'Kensington', 'Camden', 'Covent Garden', 'Soho', 'Mayfair', 'Chelsea', 'Thames'],
    economyTier: 'high'
  },
  'Japan': {
    cities: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Sapporo', 'Fukuoka', 'Kobe', 'Nagoya', 'Hiroshima', 'Nara'],
    landmarks: ['Shibuya', 'Shinjuku', 'Ginza', 'Roppongi', 'Asakusa', 'Mount Fuji View', 'Sakura', 'Imperial', 'Cherry Blossom'],
    economyTier: 'high'
  },
  'France': {
    cities: ['Paris', 'Marseille', 'Lyon', 'Nice', 'Bordeaux', 'Cannes', 'Toulouse', 'Strasbourg', 'Lille', 'Nantes'],
    landmarks: ['Champs-Elysees', 'Eiffel Tower', 'Louvre', 'Montmartre', 'Latin Quarter', 'Saint-Germain', 'Marais', 'Bastille', 'Seine'],
    economyTier: 'medium'
  },
  'Germany': {
    cities: ['Berlin', 'Munich', 'Frankfurt', 'Hamburg', 'Cologne', 'Stuttgart', 'Dusseldorf', 'Dortmund', 'Dresden', 'Leipzig'],
    landmarks: ['Brandenburg Gate', 'Alexanderplatz', 'Marienplatz', 'Rhine', 'Bavarian', 'Black Forest', 'Cathedral', 'Old Town'],
    economyTier: 'medium'
  },
  'Italy': {
    cities: ['Rome', 'Milan', 'Venice', 'Florence', 'Naples', 'Turin', 'Bologna', 'Verona', 'Genoa', 'Palermo'],
    landmarks: ['Colosseum', 'Piazza', 'Duomo', 'Trevi', 'Vatican', 'Canal Grande', 'Ponte Vecchio', 'Trastevere', 'Spanish Steps'],
    economyTier: 'medium'
  },
  'Spain': {
    cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Bilbao', 'Malaga', 'Granada', 'Ibiza', 'Marbella', 'Toledo'],
    landmarks: ['Sagrada Familia', 'Plaza Mayor', 'Ramblas', 'Gothic Quarter', 'Alhambra', 'Costa del Sol', 'Puerta del Sol'],
    economyTier: 'medium'
  },
  'China': {
    cities: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Hangzhou', 'Xian', 'Suzhou', 'Nanjing', 'Qingdao'],
    landmarks: ['Forbidden City', 'Great Wall View', 'Bund', 'Pearl Tower', 'Terracotta', 'Panda', 'Temple', 'Dynasty', 'Imperial'],
    economyTier: 'medium'
  },
  'Australia': {
    cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Newcastle', 'Cairns', 'Hobart'],
    landmarks: ['Harbour', 'Opera House', 'Darling Harbour', 'Bondi', 'Circular Quay', 'Surfers Paradise', 'Great Barrier Reef'],
    economyTier: 'medium'
  },
  'Canada': {
    cities: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton', 'Quebec City', 'Winnipeg', 'Victoria', 'Halifax'],
    landmarks: ['CN Tower', 'Stanley Park', 'Niagara Falls', 'Old Montreal', 'Parliament Hill', 'Rocky Mountains', 'Harbourfront'],
    economyTier: 'medium'
  },
  'Switzerland': {
    cities: ['Zurich', 'Geneva', 'Basel', 'Bern', 'Lausanne', 'Lucerne', 'Interlaken', 'Zermatt', 'St. Moritz', 'Lugano'],
    landmarks: ['Alps View', 'Lake Geneva', 'Matterhorn', 'Rhine Falls', 'Jungfrau', 'Chapel Bridge', 'Lakeside', 'Mountain'],
    economyTier: 'high'
  },
  'Norway': {
    cities: ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Tromso', 'Kristiansand', 'Alesund', 'Drammen', 'Lillehammer'],
    landmarks: ['Fjord View', 'Northern Lights', 'Harbor', 'Viking', 'Opera House', 'Holmenkollen', 'Bryggen', 'Aurora'],
    economyTier: 'high'
  },
  'Singapore': {
    cities: ['Singapore', 'Marina Bay', 'Sentosa', 'Orchard', 'Chinatown', 'Little India', 'Clarke Quay', 'Bugis', 'Jurong'],
    landmarks: ['Marina Bay Sands', 'Raffles', 'Merlion', 'Gardens by the Bay', 'Orchard Road', 'Sentosa Island', 'Clarke Quay'],
    economyTier: 'high'
  },
  'United Arab Emirates': {
    cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Al Ain'],
    landmarks: ['Burj Khalifa', 'Palm Jumeirah', 'Marina', 'Downtown', 'Creek', 'Sheikh Zayed', 'Corniche', 'Desert View'],
    economyTier: 'high'
  },
  'Thailand': {
    cities: ['Bangkok', 'Phuket', 'Chiang Mai', 'Pattaya', 'Krabi', 'Koh Samui', 'Ayutthaya', 'Hua Hin', 'Chiang Rai'],
    landmarks: ['Sukhumvit', 'Patong Beach', 'Kata Beach', 'Old City', 'Night Bazaar', 'Riverside', 'Grand Palace', 'Temple View'],
    economyTier: 'low'
  },
  'Vietnam': {
    cities: ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Nha Trang', 'Hoi An', 'Halong Bay', 'Hue', 'Can Tho', 'Dalat'],
    landmarks: ['District 1', 'Old Quarter', 'French Quarter', 'Beach Front', 'Ancient Town', 'Imperial City', 'Mekong', 'Bay View'],
    economyTier: 'low'
  },
  'Indonesia': {
    cities: ['Jakarta', 'Bali', 'Surabaya', 'Bandung', 'Yogyakarta', 'Lombok', 'Ubud', 'Seminyak', 'Denpasar'],
    landmarks: ['Kuta Beach', 'Seminyak Beach', 'Ubud Rice Terrace', 'Borobudur', 'Tanah Lot', 'Uluwatu', 'Nusa Dua', 'Sanur'],
    economyTier: 'low'
  },
  'India': {
    cities: ['Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Goa'],
    landmarks: ['Gateway of India', 'Connaught Place', 'Marine Drive', 'Taj View', 'Pink City', 'Palace', 'Fort', 'Beach'],
    economyTier: 'low'
  },
  'Mexico': {
    cities: ['Mexico City', 'Cancun', 'Guadalajara', 'Monterrey', 'Playa del Carmen', 'Puerto Vallarta', 'Tulum', 'Cabo', 'Oaxaca'],
    landmarks: ['Zona Rosa', 'Hotel Zone', 'Playa', 'Marina', 'Centro', 'Malecon', 'Riviera Maya', 'Beach Front', 'Old Town'],
    economyTier: 'low'
  },
  'Brazil': {
    cities: ['Rio de Janeiro', 'Sao Paulo', 'Brasilia', 'Salvador', 'Fortaleza', 'Recife', 'Curitiba', 'Manaus', 'Belo Horizonte'],
    landmarks: ['Copacabana', 'Ipanema', 'Leblon', 'Sugarloaf', 'Christ View', 'Paulista', 'Barra', 'Lapa', 'Santa Teresa'],
    economyTier: 'low'
  },
  'Egypt': {
    cities: ['Cairo', 'Alexandria', 'Giza', 'Luxor', 'Aswan', 'Sharm El Sheikh', 'Hurghada', 'Port Said', 'Dahab'],
    landmarks: ['Pyramids View', 'Nile View', 'Sphinx', 'Corniche', 'Red Sea', 'Valley of Kings', 'Desert Oasis', 'Temple View'],
    economyTier: 'low'
  },
  'Turkey': {
    cities: ['Istanbul', 'Ankara', 'Izmir', 'Antalya', 'Bodrum', 'Cappadocia', 'Bursa', 'Marmaris', 'Kusadasi'],
    landmarks: ['Bosphorus', 'Sultanahmet', 'Taksim', 'Old City', 'Blue Mosque', 'Grand Bazaar', 'Aegean Coast', 'Mediterranean'],
    economyTier: 'low'
  },
  'Greece': {
    cities: ['Athens', 'Thessaloniki', 'Santorini', 'Mykonos', 'Crete', 'Rhodes', 'Corfu', 'Delphi', 'Meteora'],
    landmarks: ['Acropolis View', 'Plaka', 'Syntagma', 'Caldera', 'Oia', 'Fira', 'Parthenon', 'Aegean Sea', 'White Cliffs'],
    economyTier: 'medium'
  },
  'Portugal': {
    cities: ['Lisbon', 'Porto', 'Algarve', 'Faro', 'Coimbra', 'Braga', 'Funchal', 'Sintra', 'Cascais'],
    landmarks: ['Alfama', 'Belem', 'Ribeira', 'Douro', 'Golden Beach', 'Ponta da Piedade', 'Castle View', 'Ocean View'],
    economyTier: 'medium'
  },
  'Netherlands': {
    cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Groningen', 'Maastricht', 'Haarlem', 'Delft'],
    landmarks: ['Canal Ring', 'Dam Square', 'Jordaan', 'Museum Quarter', 'Red Light District', 'Waterfront', 'Old Harbor'],
    economyTier: 'medium'
  },
  'Sweden': {
    cities: ['Stockholm', 'Gothenburg', 'Malmo', 'Uppsala', 'Vasteras', 'Orebro', 'Linkoping', 'Helsingborg', 'Kiruna'],
    landmarks: ['Gamla Stan', 'Djurgarden', 'Archipelago', 'Waterfront', 'Old Town', 'Harbor', 'Northern Lights', 'Ice Hotel'],
    economyTier: 'high'
  },
  'Denmark': {
    cities: ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg', 'Esbjerg', 'Roskilde', 'Helsingor', 'Kolding', 'Horsens'],
    landmarks: ['Nyhavn', 'Tivoli', 'Stroget', 'Little Mermaid', 'Christiansborg', 'Harbor', 'Castle View', 'Waterfront'],
    economyTier: 'high'
  },
  'South Korea': {
    cities: ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Jeju', 'Gyeongju', 'Jeonju'],
    landmarks: ['Gangnam', 'Myeongdong', 'Hongdae', 'Itaewon', 'Haeundae', 'Namsan', 'Han River', 'Palace View', 'K-Pop'],
    economyTier: 'medium'
  },
  'Hong Kong': {
    cities: ['Hong Kong', 'Kowloon', 'Tsim Sha Tsui', 'Central', 'Causeway Bay', 'Wan Chai', 'Mong Kok', 'Stanley'],
    landmarks: ['Victoria Peak', 'Harbour View', 'Nathan Road', 'Temple Street', 'Victoria Harbour', 'Ocean View', 'Skyline'],
    economyTier: 'high'
  }
};

// Generate default data for countries not in countryData
function getCountryInfo(countryName) {
  if (countryData[countryName]) {
    return countryData[countryName];
  }

  // Generate default data
  const baseCityName = countryName.split(' ')[0];
  return {
    cities: [
      `${baseCityName} City`,
      `${baseCityName} Capital`,
      `New ${baseCityName}`,
      `${baseCityName} Central`,
      `${baseCityName} North`,
      `${baseCityName} South`,
      `${baseCityName} Bay`,
      `${baseCityName} Beach`,
      `${baseCityName} Heights`,
      `${baseCityName} Valley`
    ],
    landmarks: ['Downtown', 'City Center', 'Old Town', 'New Town', 'Waterfront', 'Beach', 'Mountain View', 'Park', 'Square'],
    economyTier: determineEconomyTier(countryName)
  };
}

function determineEconomyTier(countryName) {
  const highCostCountries = [
    'United States', 'United Kingdom', 'Switzerland', 'Norway', 'Japan',
    'Singapore', 'United Arab Emirates', 'Sweden', 'Denmark', 'Iceland',
    'Luxembourg', 'Monaco', 'Hong Kong', 'Australia', 'Canada', 'Israel',
    'Ireland', 'Austria', 'Netherlands', 'Belgium', 'Finland', 'New Zealand'
  ];

  const mediumCostCountries = [
    'France', 'Germany', 'Italy', 'Spain', 'Portugal', 'Greece', 'Czech Republic',
    'Poland', 'Hungary', 'Croatia', 'Slovenia', 'Estonia', 'Lithuania', 'Latvia',
    'Slovakia', 'Malta', 'Cyprus', 'South Korea', 'Taiwan', 'Qatar', 'Bahrain',
    'Kuwait', 'Oman', 'Saudi Arabia', 'Russia', 'China', 'Malaysia', 'Chile',
    'Argentina', 'Uruguay', 'Costa Rica', 'Panama', 'Bulgaria', 'Romania', 'Serbia'
  ];

  if (highCostCountries.includes(countryName)) return 'high';
  if (mediumCostCountries.includes(countryName)) return 'medium';
  return 'low';
}

// Get price range based on economy tier
function getPriceRange(economyTier) {
  switch (economyTier) {
    case 'high':
      return { min: 200, max: 800 };
    case 'medium':
      return { min: 80, max: 300 };
    case 'low':
      return { min: 30, max: 150 };
    default:
      return { min: 50, max: 200 };
  }
}

// Generate unique hotel name
function generateHotelName(country, cityName, index, countryInfo) {
  const namePattern = index % 8;
  const localLandmarks = countryInfo.landmarks;
  let baseName;

  switch (namePattern) {
    case 0: // Chain hotel
      baseName = `${hotelChains[index % hotelChains.length]} ${cityName} ${landmarks[index % landmarks.length]}`;
      break;

    case 1: // Boutique
      baseName = `The ${cityName} ${hotelTypes[index % hotelTypes.length]}`;
      break;

    case 2: // Landmark-based
      baseName = `${localLandmarks[index % localLandmarks.length]} ${hotelTypes[(index + 3) % hotelTypes.length]} ${cityName}`;
      break;

    case 3: // Adjective + Type
      baseName = `${adjectives[index % adjectives.length]} ${cityName} ${hotelTypes[(index + 5) % hotelTypes.length]}`;
      break;

    case 4: // City + Adjective
      baseName = `${cityName} ${adjectives[(index + 2) % adjectives.length]} Hotel`;
      break;

    case 5: // Chain + Landmark
      baseName = `${hotelChains[(index + 7) % hotelChains.length]} ${localLandmarks[(index + 2) % localLandmarks.length]}`;
      break;

    case 6: // Type + City + Landmark
      baseName = `${hotelTypes[(index + 4) % hotelTypes.length]} ${cityName} ${localLandmarks[(index + 5) % localLandmarks.length]}`;
      break;

    case 7: // Numbered premium
      baseName = `${cityName} ${adjectives[(index + 8) % adjectives.length]} ${hotelTypes[(index + 6) % hotelTypes.length]}`;
      break;

    default:
      baseName = `${cityName} Hotel`;
  }

  // Add unique index to guarantee no duplicates
  return `${baseName} #${index + 1}`;
}

// Generate description based on hotel type and location
function generateDescription(hotelName, cityName, countryName, propertyType) {
  const descriptions = [
    `Experience comfort and luxury in the heart of ${cityName}. ${hotelName} offers modern accommodations with exceptional service.`,
    `Discover ${cityName}'s finest hospitality at ${hotelName}. Perfectly located for both business and leisure travelers.`,
    `Welcome to ${hotelName}, your home away from home in ${cityName}, ${countryName}. Enjoy world-class amenities and stunning views.`,
    `${hotelName} provides an unforgettable stay in ${cityName}. Featuring elegant rooms and premium facilities.`,
    `Located in the vibrant heart of ${cityName}, ${hotelName} offers the perfect blend of comfort and convenience.`,
    `Immerse yourself in luxury at ${hotelName}. Experience the best of ${cityName} with our exceptional service.`,
    `${hotelName} welcomes you to ${cityName} with warm hospitality and modern elegance. Your perfect ${countryName} getaway.`,
    `Enjoy your stay at ${hotelName} in ${cityName}. Contemporary design meets traditional hospitality in this remarkable ${propertyType}.`
  ];

  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

// Generate amenities
function generateAmenities(index, propertyType) {
  const allAmenities = [
    'Free WiFi', 'Swimming Pool', 'Spa & Wellness', 'Fitness Center', 'Restaurant',
    'Bar/Lounge', 'Room Service', 'Air Conditioning', '24-hour Front Desk',
    'Free Parking', 'Airport Shuttle', 'Pet Friendly', 'Business Center',
    'Meeting Rooms', 'Concierge Service', 'Laundry Service', 'Dry Cleaning',
    'Baggage Storage', 'Currency Exchange', 'Tour Desk', 'Elevator',
    'Safe Deposit Box', 'Non-smoking Rooms', 'Family Rooms', 'Wheelchair Accessible',
    'Electric Vehicle Charging', 'Rooftop Terrace', 'Garden', 'Library'
  ];

  // Luxury properties get more amenities
  const amenityCount = propertyType === 'resort' || propertyType === 'boutique'
    ? 12 + (index % 8)
    : 6 + (index % 8);

  const amenities = [];
  const indices = new Set();

  // Always include WiFi
  amenities.push('Free WiFi');

  while (amenities.length < amenityCount) {
    const idx = Math.floor(Math.random() * allAmenities.length);
    if (!indices.has(idx) && !amenities.includes(allAmenities[idx])) {
      indices.add(idx);
      amenities.push(allAmenities[idx]);
    }
  }

  return amenities;
}

// Generate property type
function getPropertyType(index) {
  const types = ['hotel', 'hotel', 'hotel', 'resort', 'apartment', 'boutique', 'villa'];
  return types[index % types.length];
}

// Generate realistic coordinates for country
function generateCoordinates(countryName, index) {
  // Approximate coordinates for major countries
  const countryCoordinates = {
    'United States': { lat: 37.0902 + (Math.random() - 0.5) * 20, lng: -95.7129 + (Math.random() - 0.5) * 40 },
    'United Kingdom': { lat: 51.5074 + (Math.random() - 0.5) * 5, lng: -0.1278 + (Math.random() - 0.5) * 5 },
    'Japan': { lat: 35.6762 + (Math.random() - 0.5) * 10, lng: 139.6503 + (Math.random() - 0.5) * 10 },
    'France': { lat: 48.8566 + (Math.random() - 0.5) * 5, lng: 2.3522 + (Math.random() - 0.5) * 5 },
    'Germany': { lat: 52.5200 + (Math.random() - 0.5) * 5, lng: 13.4050 + (Math.random() - 0.5) * 5 },
    'Italy': { lat: 41.9028 + (Math.random() - 0.5) * 8, lng: 12.4964 + (Math.random() - 0.5) * 8 },
    'Spain': { lat: 40.4168 + (Math.random() - 0.5) * 6, lng: -3.7038 + (Math.random() - 0.5) * 6 },
    'China': { lat: 39.9042 + (Math.random() - 0.5) * 20, lng: 116.4074 + (Math.random() - 0.5) * 30 },
    'Australia': { lat: -33.8688 + (Math.random() - 0.5) * 20, lng: 151.2093 + (Math.random() - 0.5) * 30 },
    'Canada': { lat: 43.6532 + (Math.random() - 0.5) * 20, lng: -79.3832 + (Math.random() - 0.5) * 40 },
    'Brazil': { lat: -22.9068 + (Math.random() - 0.5) * 20, lng: -43.1729 + (Math.random() - 0.5) * 30 },
    'India': { lat: 20.5937 + (Math.random() - 0.5) * 20, lng: 78.9629 + (Math.random() - 0.5) * 20 },
    'Mexico': { lat: 19.4326 + (Math.random() - 0.5) * 15, lng: -99.1332 + (Math.random() - 0.5) * 15 },
    'Thailand': { lat: 13.7563 + (Math.random() - 0.5) * 10, lng: 100.5018 + (Math.random() - 0.5) * 10 },
    'Egypt': { lat: 30.0444 + (Math.random() - 0.5) * 8, lng: 31.2357 + (Math.random() - 0.5) * 8 },
  };

  if (countryCoordinates[countryName]) {
    return countryCoordinates[countryName];
  }

  // Default random coordinates
  return {
    lat: -90 + Math.random() * 180,
    lng: -180 + Math.random() * 360
  };
}

// Generate hotels for a specific country
async function generateHotelsForCountry(country, startIndex) {
  const hotels = [];
  const countryInfo = getCountryInfo(country.name);
  const priceRange = getPriceRange(countryInfo.economyTier);

  console.log(`  Economy Tier: ${countryInfo.economyTier.toUpperCase()} | Price Range: $${priceRange.min}-${priceRange.max}`);

  for (let i = 0; i < HOTELS_PER_COUNTRY; i++) {
    const hotelIndex = startIndex + i;
    const cityName = countryInfo.cities[i % countryInfo.cities.length];
    const propertyType = getPropertyType(i);

    // Generate pricing
    const baseRange = priceRange.max - priceRange.min;
    const basePrice = priceRange.min + Math.random() * baseRange;
    const discount = Math.floor(Math.random() * 35); // 0-35% discount
    const pricePerNight = Math.round(basePrice * (1 - discount / 100));

    // Generate hotel name
    const hotelName = generateHotelName(country, cityName, i, countryInfo);

    // Generate hotel object
    const hotel = {
      name: hotelName,
      location: `${cityName}, ${country.name}`,
      description: generateDescription(hotelName, cityName, country.name, propertyType),
      basePrice: Math.round(basePrice),
      pricePerNight: pricePerNight,
      discountPercent: discount,
      originalPrice: discount > 0 ? Math.round(basePrice) : null,
      totalRooms: 20 + Math.floor(Math.random() * 480), // 20-500 rooms
      availableRooms: Math.floor(Math.random() * 100), // 0-100 available
      rating: parseFloat((3.0 + Math.random() * 2).toFixed(1)), // 3.0-5.0
      reviewCount: Math.floor(Math.random() * 2000), // 0-2000 reviews
      images: [
        `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop&q=80`,
        `https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop&q=80`,
        `https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop&q=80`
      ],
      amenities: generateAmenities(i, propertyType),
      propertyType: propertyType,
      city: cityName,
      country: country.name,
      coordinates: generateCoordinates(country.name, i),
      bookingCount24h: Math.floor(Math.random() * 10),
      currentViewers: Math.floor(Math.random() * 20),
      isPopular: Math.random() > 0.85, // 15% are popular
      priceTrend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)]
    };

    hotels.push(hotel);
  }

  return hotels;
}

// Main seeding function
async function seedDatabase() {
  try {
    console.log('='.repeat(70));
    console.log('  HOTEL DATABASE SEEDING - 101 COUNTRIES');
    console.log('='.repeat(70));
    console.log(`Target: ${HOTELS_PER_COUNTRY} hotels per country`);
    console.log(`Total Expected: ${countries.length * HOTELS_PER_COUNTRY} hotels\n`);

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully!\n');

    // Clear existing hotels
    console.log('Clearing existing hotels...');
    const deleteResult = await Hotel.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing hotels\n`);

    console.log('Starting hotel generation...\n');

    let totalHotels = 0;
    let hotelIndex = 0;
    const batchSize = 100; // Insert in batches for better performance

    for (let i = 0; i < countries.length; i++) {
      const country = countries[i];
      const progress = ((i + 1) / countries.length * 100).toFixed(1);

      console.log(`[${i + 1}/${countries.length}] ${country.flag} ${country.name} (${progress}% complete)`);

      // Generate hotels for this country
      const hotels = await generateHotelsForCountry(country, hotelIndex);

      // Insert in batches
      for (let j = 0; j < hotels.length; j += batchSize) {
        const batch = hotels.slice(j, j + batchSize);
        await Hotel.insertMany(batch, { ordered: false });
      }

      totalHotels += hotels.length;
      hotelIndex += HOTELS_PER_COUNTRY;

      console.log(`  ✓ Added ${hotels.length} hotels | Total: ${totalHotels}\n`);
    }

    console.log('='.repeat(70));
    console.log('  SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(70));
    console.log(`Total Hotels Created: ${totalHotels}`);
    console.log(`Countries Covered: ${countries.length}`);
    console.log(`Average per Country: ${Math.round(totalHotels / countries.length)}`);

    // Database statistics
    const stats = await Hotel.aggregate([
      {
        $group: {
          _id: '$country',
          count: { $sum: 1 },
          avgPrice: { $avg: '$pricePerNight' },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('\nDatabase Statistics:');
    console.log(`Total Hotels: ${totalHotels}`);
    console.log(`Unique Countries: ${stats.length}`);
    console.log(`Avg Price: $${Math.round(stats.reduce((sum, s) => sum + s.avgPrice, 0) / stats.length)}`);
    console.log(`Avg Rating: ${(stats.reduce((sum, s) => sum + s.avgRating, 0) / stats.length).toFixed(1)}/5.0`);

    console.log('\nTop 10 Countries by Hotel Count:');
    stats.slice(0, 10).forEach((stat, idx) => {
      console.log(`  ${idx + 1}. ${stat._id}: ${stat.count} hotels`);
    });

    console.log('\n' + '='.repeat(70));

  } catch (error) {
    console.error('\nERROR during seeding:');
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    console.log('Seeding script completed.\n');
  }
}

// Run the seeding script
seedDatabase();
