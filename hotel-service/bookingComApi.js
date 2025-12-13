/**
 * Booking.com API Integration Service
 *
 * This service integrates with Booking.com via RapidAPI to fetch real hotel data.
 * Get your API key from: https://rapidapi.com/apidojo/api/booking-com
 */

const axios = require('axios');
require('dotenv').config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
const RAPIDAPI_HOST = 'booking-com.p.rapidapi.com';

class BookingComAPI {
  constructor() {
    this.client = axios.create({
      baseURL: 'https://booking-com.p.rapidapi.com/v1',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      },
      timeout: 10000
    });

    // Check if API key is configured
    if (!RAPIDAPI_KEY) {
      console.warn('⚠️  RAPIDAPI_KEY not configured. Using mock data instead.');
      console.warn('   Get your key from: https://rapidapi.com/apidojo/api/booking-com');
    } else {
      console.log('✅ Booking.com API configured');
    }
  }

  /**
   * Search for hotels by location
   * @param {string} location - City name or destination
   * @param {Object} options - Search options (checkIn, checkOut, adults, etc.)
   * @returns {Promise<Array>} Array of hotels
   */
  async searchHotels(location, options = {}) {
    try {
      if (!RAPIDAPI_KEY) {
        return this._getMockHotels(location);
      }

      // First, get the destination ID
      const destinations = await this.client.get('/hotels/locations', {
        params: {
          locale: 'en-us',
          name: location
        }
      });

      if (!destinations.data || destinations.data.length === 0) {
        console.log(`No destination found for: ${location}`);
        return [];
      }

      const destId = destinations.data[0].dest_id;

      // Now search for hotels in that destination
      const response = await this.client.get('/hotels/search', {
        params: {
          dest_id: destId,
          dest_type: 'city',
          locale: 'en-us',
          currency: 'USD',
          adults_number: options.adults || 2,
          checkin_date: options.checkIn || this._getDefaultCheckIn(),
          checkout_date: options.checkOut || this._getDefaultCheckOut(),
          room_number: options.rooms || 1,
          units: 'metric',
          order_by: 'popularity'
        }
      });

      const hotels = response.data.result || [];
      return hotels.map(hotel => this._mapBookingComHotel(hotel));

    } catch (error) {
      console.error('Error fetching from Booking.com API:', error.message);
      // Fallback to mock data if API fails
      return this._getMockHotels(location);
    }
  }

  /**
   * Get hotel details by ID
   * @param {string} hotelId - Booking.com hotel ID
   * @returns {Promise<Object>} Hotel details
   */
  async getHotelDetails(hotelId) {
    try {
      if (!RAPIDAPI_KEY) {
        return this._getMockHotelDetails(hotelId);
      }

      const response = await this.client.get('/hotels/data', {
        params: {
          hotel_id: hotelId,
          locale: 'en-us'
        }
      });

      return this._mapBookingComHotel(response.data);

    } catch (error) {
      console.error('Error fetching hotel details:', error.message);
      return this._getMockHotelDetails(hotelId);
    }
  }

  /**
   * Map Booking.com hotel data to our schema
   */
  _mapBookingComHotel(hotel) {
    return {
      name: hotel.hotel_name || hotel.name,
      location: `${hotel.city || ''}, ${hotel.country_trans || ''}`.trim(),
      description: hotel.review_recommendation || hotel.hotel_name_trans || '',

      // Pricing
      basePrice: hotel.min_total_price || hotel.composite_price_breakdown?.gross_amount_per_night?.value || 150,
      pricePerNight: hotel.min_total_price || hotel.composite_price_breakdown?.gross_amount_per_night?.value || 150,
      discountPercent: 0,

      // Availability
      totalRooms: 20,
      availableRooms: hotel.hotel_has_vb_boost ? 15 : 10,

      // Ratings
      rating: hotel.review_score || hotel.class || 8.0,
      reviewCount: hotel.review_nr || hotel.review_count || 0,

      // Features
      amenities: this._extractAmenities(hotel),
      images: hotel.max_1440_photo_url ? [hotel.max_1440_photo_url] :
              hotel.photos ? hotel.photos.slice(0, 5).map(p => p.url_max_1440) : [],

      // Property details
      propertyType: this._mapPropertyType(hotel.accommodation_type_name),

      // Location
      coordinates: {
        lat: hotel.latitude || 0,
        lng: hotel.longitude || 0
      },
      address: hotel.address || '',
      city: hotel.city || '',
      country: hotel.country_trans || '',

      // External ID for sync
      bookingComId: hotel.hotel_id || hotel.id,

      // Urgency indicators
      isPopular: hotel.is_genius_deal || hotel.hotel_has_vb_boost || false,
      isLimitedAvailability: hotel.is_no_prepayment_block || hotel.is_free_cancellable,

      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  _extractAmenities(hotel) {
    const amenities = [];

    if (hotel.is_free_cancellable) amenities.push('Free Cancellation');
    if (hotel.has_free_parking) amenities.push('Free Parking');
    if (hotel.has_swimming_pool) amenities.push('Swimming Pool');
    if (hotel.has_wifi) amenities.push('Free WiFi');
    if (hotel.is_beach_front) amenities.push('Beach Front');
    if (hotel.is_city_center) amenities.push('City Center');

    // Add some default amenities
    if (amenities.length < 3) {
      amenities.push('Air Conditioning', '24-hour Front Desk', 'Room Service');
    }

    return amenities;
  }

  _mapPropertyType(typeName) {
    if (!typeName) return 'hotel';

    const type = typeName.toLowerCase();
    if (type.includes('apartment')) return 'apartment';
    if (type.includes('villa')) return 'villa';
    if (type.includes('resort')) return 'resort';
    if (type.includes('boutique')) return 'boutique';

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
   * Mock hotel data for when API is not configured
   */
  _getMockHotels(location) {
    console.log(`📝 Using mock data for location: ${location}`);

    const mockHotels = [
      {
        name: 'Grand Paradise Hotel',
        location: `${location}, USA`,
        description: 'Luxurious 5-star hotel with stunning city views',
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
        description: 'Beachfront resort with private beach access',
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
        description: 'Charming boutique hotel in the heart of downtown',
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
module.exports = new BookingComAPI();
