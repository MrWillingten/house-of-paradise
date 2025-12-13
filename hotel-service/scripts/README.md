# Hotel Service - Database Seeding Scripts

This directory contains scripts for populating the hotel database with realistic data.

## seed-real-hotels.js

Comprehensive hotel seeding script that generates 15,000+ unique, realistic hotels across all 101 countries.

### Features

- **15,150 Total Hotels**: 150 hotels per country × 101 countries
- **Real Country Data**: Uses all 101 countries from the countries.js utility
- **Unique Hotel Names**: 8 different naming patterns for variety
  - Chain hotels (Hilton, Marriott, Hyatt, etc.)
  - Boutique hotels
  - Landmark-based names
  - Premium/luxury hotels
  - Country-specific naming

- **Realistic Pricing**: Based on country economy tier
  - High-cost countries ($200-$800): USA, UK, Switzerland, Norway, Japan, Singapore, UAE, etc.
  - Medium-cost countries ($80-$300): Most European countries, Australia, Canada, South Korea
  - Low-cost countries ($30-$150): Southeast Asia, Eastern Europe, South America, Africa

- **Varied Property Types**: Hotel, Resort, Apartment, Villa, Boutique
- **Rich Amenities**: 6-20 amenities per hotel
- **Unique Images**: Unsplash API with 15+ hotel-specific categories
- **Realistic Ratings**: 3.0-5.0 stars with review counts
- **Room Inventory**: 20-500 rooms per hotel
- **Geographic Coordinates**: Realistic lat/lng for each country

### Database Schema

Hotels are created with the following fields:
- `name`: Unique hotel name
- `location`: "City, Country"
- `description`: Auto-generated description
- `basePrice`: Original price
- `pricePerNight`: Current price (with discount applied)
- `discountPercent`: 0-35% discount
- `totalRooms`: 20-500 rooms
- `availableRooms`: 0-100 currently available
- `rating`: 3.0-5.0 stars
- `reviewCount`: 0-2000 reviews
- `images`: Array of 3 Unsplash images
- `amenities`: Array of amenities
- `propertyType`: hotel, resort, apartment, villa, boutique
- `city`: City name
- `country`: Country name
- `coordinates`: { lat, lng }
- `bookingCount24h`: Bookings in last 24 hours
- `currentViewers`: Real-time viewers
- `isPopular`: Boolean flag
- `priceTrend`: up/down/stable

### Usage

#### Option 1: Local MongoDB
```bash
cd hotel-service/scripts
node seed-real-hotels.js
```

#### Option 2: Docker MongoDB
```bash
# Start MongoDB container first
docker-compose up -d mongodb

# Run seeding script
cd hotel-service/scripts
MONGO_URI="mongodb://localhost:27017/hoteldb" node seed-real-hotels.js
```

#### Option 3: Remote MongoDB
```bash
cd hotel-service/scripts
MONGO_URI="mongodb://your-remote-host:27017/hoteldb" node seed-real-hotels.js
```

### Expected Output

```
======================================================================
  HOTEL DATABASE SEEDING - 101 COUNTRIES
======================================================================
Target: 150 hotels per country
Total Expected: 15150 hotels

Connecting to MongoDB...
Connected to MongoDB successfully!

Clearing existing hotels...
Deleted 0 existing hotels

Starting hotel generation...

[1/101] 🇦🇫 Afghanistan (1.0% complete)
  Economy Tier: LOW | Price Range: $30-150
  ✓ Added 150 hotels | Total: 150

[2/101] 🇦🇱 Albania (2.0% complete)
  Economy Tier: LOW | Price Range: $30-150
  ✓ Added 150 hotels | Total: 300

...

[101/101] 🇿🇼 Zimbabwe (100.0% complete)
  Economy Tier: LOW | Price Range: $30-150
  ✓ Added 150 hotels | Total: 15150

======================================================================
  SEEDING COMPLETED SUCCESSFULLY!
======================================================================
Total Hotels Created: 15150
Countries Covered: 101
Average per Country: 150

Database Statistics:
Total Hotels: 15150
Unique Countries: 101
Avg Price: $145
Avg Rating: 4.0/5.0

Top 10 Countries by Hotel Count:
  1. Afghanistan: 150 hotels
  2. Albania: 150 hotels
  3. Algeria: 150 hotels
  ...
```

### Execution Time

- **Local MongoDB**: ~2-3 minutes
- **Docker MongoDB**: ~3-5 minutes
- **Remote MongoDB**: Varies based on connection speed

### Performance Optimizations

- **Batch Inserts**: Hotels are inserted in batches of 100 for optimal performance
- **Unordered Inserts**: Uses `{ ordered: false }` to continue on duplicate key errors
- **Index-friendly**: Generated data works well with MongoDB indexes

### Customization

You can modify the following constants in the script:

```javascript
// Number of hotels per country (default: 150)
const HOTELS_PER_COUNTRY = 150;

// Batch size for inserts (default: 100)
const batchSize = 100;

// MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hoteldb';
```

### Country-Specific Examples

#### United States (High-cost)
- Hilton Manhattan Downtown
- The New York Grand Hotel
- Times Square Royal Suites
- Los Angeles Premium Hotel 5
- Price range: $200-$800

#### Japan (High-cost)
- Marriott Tokyo Shibuya
- Sakura Garden Hotel Tokyo
- Mount Fuji View Resort
- Ginza Imperial Palace
- Price range: $200-$800

#### France (Medium-cost)
- InterContinental Paris Champs-Elysees
- The Paris Boutique
- Eiffel Tower Grand Hotel
- Seine Riverside Suites
- Price range: $80-$300

#### Thailand (Low-cost)
- Best Western Bangkok Sukhumvit
- Phuket Beach Resort
- Patong Beach Hotel
- Chiang Mai Old City Inn
- Price range: $30-$150

### Verification

After seeding, verify the data:

```bash
# Connect to MongoDB
mongo localhost:27017/hoteldb

# Check total count
db.hotels.count()
# Expected: 15150

# Check country distribution
db.hotels.aggregate([
  { $group: { _id: "$country", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])

# Check price ranges
db.hotels.aggregate([
  { $group: {
    _id: "$country",
    avgPrice: { $avg: "$pricePerNight" },
    minPrice: { $min: "$pricePerNight" },
    maxPrice: { $max: "$pricePerNight" }
  }}
])

# Sample hotels
db.hotels.find().limit(10).pretty()
```

### Troubleshooting

#### Connection Errors
```bash
# Check if MongoDB is running
docker ps | grep mongo

# Check MongoDB logs
docker logs mongodb

# Test connection
mongosh mongodb://localhost:27017/hoteldb
```

#### Memory Issues
If you encounter memory issues, reduce `HOTELS_PER_COUNTRY` or `batchSize`:

```javascript
const HOTELS_PER_COUNTRY = 100; // Reduced from 150
const batchSize = 50; // Reduced from 100
```

#### Duplicate Key Errors
The script handles duplicate key errors gracefully with `{ ordered: false }`. If you see warnings, they can be safely ignored.

### Integration with Hotel Service

After seeding, the hotel service will have access to all 15,150 hotels:

```bash
# Start hotel service
cd hotel-service
npm start

# Test API
curl http://localhost:3001/api/hotels?limit=10

# Search by country
curl "http://localhost:3001/api/hotels?location=Japan&limit=20"

# Filter by price
curl "http://localhost:3001/api/hotels?minPrice=100&maxPrice=300"

# Sort by rating
curl "http://localhost:3001/api/hotels?sortBy=rating&limit=50"
```

### Notes

- All hotel names are unique within their country
- Images use Unsplash Source API with unique signatures
- Coordinates are approximate for each country
- Prices include realistic discounts (0-35%)
- Reviews and ratings are randomly generated
- Property types are distributed realistically
- Amenities vary by property type and rating

### Future Enhancements

Potential improvements for future versions:
- Real address generation using geocoding APIs
- Integration with real hotel APIs (Booking.com, Expedia)
- More granular city-level data for all countries
- Seasonal pricing variations
- Real hotel chain distributions by country
- Historical occupancy data
- Multi-language support for descriptions
