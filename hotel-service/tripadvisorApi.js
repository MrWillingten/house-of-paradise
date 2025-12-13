/**
 * TripAdvisor API Integration Service
 *
 * This service integrates with TripAdvisor via RapidAPI to fetch real hotel data.
 * API: https://rapidapi.com/DataCrawler/api/tripadvisor16
 */

const axios = require('axios');
require('dotenv').config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
const RAPIDAPI_HOST = 'tripadvisor16.p.rapidapi.com';

class TripAdvisorAPI {
  constructor() {
    this.client = axios.create({
      baseURL: 'https://tripadvisor16.p.rapidapi.com/api/v1',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      },
      timeout: 15000
    });

    // Check if API key is configured
    if (!RAPIDAPI_KEY) {
      console.warn('⚠️  RAPIDAPI_KEY not configured. Using mock data instead.');
      console.warn('   Get your key from: https://rapidapi.com/DataCrawler/api/tripadvisor16');
    } else {
      console.log('✅ TripAdvisor API configured');
    }
  }

  /**
   * Search for hotels by location
   * @param {string} location - City name or destination
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Array of hotels
   */
  async searchHotels(location, options = {}) {
    try {
      if (!RAPIDAPI_KEY) {
        return this._getMockHotels(location);
      }

      console.log(`🔍 Searching TripAdvisor for hotels in: ${location}`);

      // Step 1: Search for the location
      const locationResponse = await this.client.get('/hotels/searchLocation', {
        params: {
          query: location
        }
      });

      if (!locationResponse.data || !locationResponse.data.data || locationResponse.data.data.length === 0) {
        console.log(`❌ No location found for: ${location}`);
        return this._getMockHotels(location);
      }

      const locationData = locationResponse.data.data[0];
      const geoId = locationData.geoId;

      console.log(`✅ Found location: ${locationData.localizedName} (geoId: ${geoId})`);

      // Step 2: Search for hotels in that location
      const hotelsResponse = await this.client.get('/hotels/searchHotels', {
        params: {
          geoId: geoId,
          checkIn: options.checkIn || this._getDefaultCheckIn(),
          checkOut: options.checkOut || this._getDefaultCheckOut(),
          pageNumber: 1,
          currencyCode: 'USD'
        }
      });

      if (!hotelsResponse.data || !hotelsResponse.data.data || !hotelsResponse.data.data.data) {
        console.log(`❌ No hotels found for location: ${location}`);
        return this._getMockHotels(location);
      }

      const hotels = hotelsResponse.data.data.data.slice(0, 10); // Get top 10 hotels
      console.log(`✅ Found ${hotels.length} hotels from TripAdvisor`);

      return hotels.map(hotel => this._mapTripAdvisorHotel(hotel, location));

    } catch (error) {
      console.error('❌ Error fetching from TripAdvisor API:', error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', JSON.stringify(error.response.data).substring(0, 200));
      }
      // Fallback to mock data if API fails
      return this._getMockHotels(location);
    }
  }

  /**
   * Get hotel details by ID
   * @param {string} hotelId - TripAdvisor hotel ID
   * @returns {Promise<Object>} Hotel details
   */
  async getHotelDetails(hotelId) {
    try {
      if (!RAPIDAPI_KEY) {
        return this._getMockHotelDetails(hotelId);
      }

      const response = await this.client.get('/hotels/getHotelDetails', {
        params: {
          id: hotelId
        }
      });

      return this._mapTripAdvisorHotel(response.data.data);

    } catch (error) {
      console.error('Error fetching hotel details:', error.message);
      return this._getMockHotelDetails(hotelId);
    }
  }

  /**
   * Map TripAdvisor hotel data to our schema
   */
  _mapTripAdvisorHotel(hotel, locationName = '') {
    // Extract price
    let pricePerNight = 150; // default
    if (hotel.priceForDisplay || hotel.priceDetails) {
      const priceStr = hotel.priceForDisplay || hotel.priceDetails || '';
      const priceMatch = priceStr.match(/\$?(\d+)/);
      if (priceMatch) {
        pricePerNight = parseInt(priceMatch[1]);
      }
    }

    // Extract rating
    const rating = hotel.bubbleRating?.rating || hotel.rating || 4.0;
    const reviewCount = hotel.reviewsCount || hotel.numberReviews || 0;

    // Extract location
    const city = hotel.localizedName || locationName || 'Unknown';
    const country = hotel.localizedAdditionalNames?.longOnlyHierarchyString?.split(',').pop()?.trim() || 'USA';

    return {
      name: hotel.title || hotel.name || 'Hotel',
      location: `${city}, ${country}`,
      description: hotel.primaryInfo || hotel.description || `Beautiful hotel in ${city}`,

      // Pricing
      basePrice: Math.round(pricePerNight * 1.2), // Set base price 20% higher
      pricePerNight: pricePerNight,
      discountPercent: 17,

      // Availability
      totalRooms: 30,
      availableRooms: Math.floor(Math.random() * 15) + 5, // Random 5-20

      // Ratings
      rating: rating,
      reviewCount: reviewCount,

      // Features
      amenities: this._extractAmenities(hotel),
      images: this._extractImages(hotel),

      // Property details
      propertyType: this._determinePropertyType(hotel),

      // Location
      coordinates: {
        lat: parseFloat(hotel.latitude) || 0,
        lng: parseFloat(hotel.longitude) || 0
      },
      address: hotel.location?.address || '',
      city: city,
      country: country,

      // External ID for sync
      tripadvisorId: hotel.id || hotel.hotelId,

      // Urgency indicators
      isPopular: rating >= 4.5 || reviewCount > 1000,
      isLimitedAvailability: Math.random() > 0.5,

      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  _extractAmenities(hotel) {
    const amenities = [];

    // Check for common amenities
    if (hotel.hasFrequentTravellerProgram) amenities.push('Rewards Program');
    if (hotel.hasRestaurant) amenities.push('Restaurant');
    if (hotel.hasBar) amenities.push('Bar');
    if (hotel.hasPool) amenities.push('Swimming Pool');
    if (hotel.hasFreeWifi) amenities.push('Free WiFi');
    if (hotel.hasGym) amenities.push('Fitness Center');
    if (hotel.hasSpa) amenities.push('Spa');
    if (hotel.hasParking) amenities.push('Parking');

    // Add some default amenities if list is empty
    if (amenities.length === 0) {
      amenities.push('Air Conditioning', '24-hour Front Desk', 'Room Service', 'Free WiFi');
    }

    return amenities.slice(0, 6); // Limit to 6 amenities
  }

  _extractImages(hotel) {
    const images = [];

    if (hotel.cardPhotos && hotel.cardPhotos.length > 0) {
      hotel.cardPhotos.forEach(photo => {
        if (photo.sizes?.urlTemplate) {
          const url = photo.sizes.urlTemplate.replace('{width}', '1200').replace('{height}', '800');
          images.push(url);
        }
      });
    }

    if (hotel.heroImage) {
      images.push(hotel.heroImage);
    }

    // Fallback images if none found
    if (images.length === 0) {
      images.push('https://images.unsplash.com/photo-1566073771259-6a8506099945');
    }

    return images.slice(0, 5); // Limit to 5 images
  }

  _determinePropertyType(hotel) {
    const title = (hotel.title || hotel.name || '').toLowerCase();

    if (title.includes('resort')) return 'resort';
    if (title.includes('apartment') || title.includes('suite')) return 'apartment';
    if (title.includes('villa')) return 'villa';
    if (title.includes('boutique')) return 'boutique';

    return 'hotel';
  }

  _getDefaultCheckIn() {
    const date = new Date();
    date.setDate(date.getDate() + 7); // 7 days from now
    return date.toISOString().split('T')[0];
  }

  _getDefaultCheckOut() {
    const date = new Date();
    date.setDate(date.getDate() + 10); // 10 days from now
    return date.toISOString().split('T')[0];
  }

  /**
   * Mock hotel data for when API is not configured or fails
   */
  _getMockHotels(location) {
    console.log(`📝 Using mock data for location: ${location}`);

    const mockHotels = [
      {
        name: 'Grand Paradise Hotel',
        location: `${location}, USA`,
        description: 'Luxurious 5-star hotel with stunning city views and world-class amenities',
        basePrice: 299,
        pricePerNight: 249,
        discountPercent: 17,
        totalRooms: 50,
        availableRooms: 12,
        rating: 9.2,
        reviewCount: 1547,
        amenities: ['Free WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar'],
        images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945'],
        propertyType: 'hotel',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        address: '123 Main Street',
        city: location,
        country: 'USA',
        isPopular: true,
        isLimitedAvailability: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Ocean View Resort',
        location: `${location}, USA`,
        description: 'Beachfront resort with private beach access and breathtaking ocean views',
        basePrice: 449,
        pricePerNight: 379,
        discountPercent: 16,
        totalRooms: 100,
        availableRooms: 25,
        rating: 9.5,
        reviewCount: 2341,
        amenities: ['Beach Access', 'Free WiFi', 'Pool', 'Spa', 'Restaurant'],
        images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'],
        propertyType: 'resort',
        coordinates: { lat: 40.7130, lng: -74.0062 },
        address: '456 Beach Boulevard',
        city: location,
        country: 'USA',
        isPopular: true,
        isLimitedAvailability: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'City Center Boutique',
        location: `${location}, USA`,
        description: 'Charming boutique hotel in the heart of downtown with personalized service',
        basePrice: 189,
        pricePerNight: 159,
        discountPercent: 16,
        totalRooms: 30,
        availableRooms: 8,
        rating: 8.8,
        reviewCount: 892,
        amenities: ['Free WiFi', 'Breakfast', 'City Center', 'Bar'],
        images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'],
        propertyType: 'boutique',
        coordinates: { lat: 40.7125, lng: -74.0065 },
        address: '789 Downtown Ave',
        city: location,
        country: 'USA',
        isPopular: false,
        isLimitedAvailability: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    return mockHotels;
  }

  _getMockHotelDetails(hotelId) {
    return this._getMockHotels('New York')[0];
  }
}

// Export singleton instance
module.exports = new TripAdvisorAPI();
