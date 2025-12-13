const mongoose = require('mongoose');

// ==================== PERSONALIZATION SCHEMAS ====================

// User Behavior Tracking Schema
const userBehaviorSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },

  // Search History
  searchHistory: [{
    destination: String,
    checkIn: Date,
    checkOut: Date,
    guests: Number,
    priceRange: { min: Number, max: Number },
    timestamp: { type: Date, default: Date.now }
  }],

  // Viewed Hotels
  viewedHotels: [{
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
    viewCount: { type: Number, default: 1 },
    lastViewed: { type: Date, default: Date.now },
    timeSpent: Number // seconds
  }],

  // Wishlist
  wishlist: [{
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
    addedAt: { type: Date, default: Date.now },
    priceWhenAdded: Number,
    notifyOnPriceDrop: { type: Boolean, default: true }
  }],

  // Preferences (learned from behavior)
  preferences: {
    favoriteDestinations: [String],
    preferredPriceRange: { min: Number, max: Number },
    preferredAmenities: [String],
    preferredPropertyTypes: [String],
    travelType: String, // solo, couple, family, business, friends
    notificationSettings: {
      priceDrops: { type: Boolean, default: true },
      newDeals: { type: Boolean, default: true },
      recommendations: { type: Boolean, default: true }
    }
  },

  // Interaction Stats
  stats: {
    totalSearches: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
    averageBookingValue: { type: Number, default: 0 },
    lastActiveAt: { type: Date, default: Date.now }
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Price Alert Schema
const priceAlertSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  targetPrice: Number, // Alert when price drops below this
  currentPrice: Number,
  active: { type: Boolean, default: true },
  triggered: { type: Boolean, default: false },
  triggeredAt: Date,
  createdAt: { type: Date, default: Date.now }
});

const UserBehavior = mongoose.model('UserBehavior', userBehaviorSchema);
const PriceAlert = mongoose.model('PriceAlert', priceAlertSchema);

// ==================== RECOMMENDATION ENGINE ====================

class RecommendationEngine {
  // Track hotel view
  static async trackView(userId, hotelId, timeSpent = 0) {
    try {
      let userBehavior = await UserBehavior.findOne({ userId });

      if (!userBehavior) {
        userBehavior = new UserBehavior({ userId });
      }

      // Update or add viewed hotel
      const existingView = userBehavior.viewedHotels.find(
        v => v.hotelId.toString() === hotelId
      );

      if (existingView) {
        existingView.viewCount += 1;
        existingView.lastViewed = new Date();
        existingView.timeSpent = (existingView.timeSpent || 0) + timeSpent;
      } else {
        userBehavior.viewedHotels.push({
          hotelId,
          viewCount: 1,
          timeSpent
        });
      }

      // Update stats
      userBehavior.stats.totalViews += 1;
      userBehavior.stats.lastActiveAt = new Date();
      userBehavior.updatedAt = new Date();

      await userBehavior.save();
      return userBehavior;
    } catch (error) {
      console.error('Error tracking view:', error);
      throw error;
    }
  }

  // Track search
  static async trackSearch(userId, searchParams) {
    try {
      let userBehavior = await UserBehavior.findOne({ userId });

      if (!userBehavior) {
        userBehavior = new UserBehavior({ userId });
      }

      userBehavior.searchHistory.push(searchParams);

      // Keep only last 50 searches
      if (userBehavior.searchHistory.length > 50) {
        userBehavior.searchHistory = userBehavior.searchHistory.slice(-50);
      }

      // Update preferences based on searches
      if (searchParams.destination) {
        if (!userBehavior.preferences.favoriteDestinations) {
          userBehavior.preferences.favoriteDestinations = [];
        }
        if (!userBehavior.preferences.favoriteDestinations.includes(searchParams.destination)) {
          userBehavior.preferences.favoriteDestinations.push(searchParams.destination);
        }
      }

      userBehavior.stats.totalSearches += 1;
      userBehavior.stats.lastActiveAt = new Date();
      userBehavior.updatedAt = new Date();

      await userBehavior.save();
      return userBehavior;
    } catch (error) {
      console.error('Error tracking search:', error);
      throw error;
    }
  }

  // Get personalized recommendations
  static async getRecommendations(userId, limit = 6) {
    try {
      const Hotel = mongoose.model('Hotel');
      const userBehavior = await UserBehavior.findOne({ userId })
        .populate('viewedHotels.hotelId')
        .populate('wishlist.hotelId');

      if (!userBehavior || userBehavior.viewedHotels.length === 0) {
        // New user - return popular hotels
        return await Hotel.find({ isPopular: true })
          .sort({ rating: -1, bookingCount24h: -1 })
          .limit(limit);
      }

      // Get viewed hotel IDs
      const viewedHotelIds = userBehavior.viewedHotels
        .map(v => v.hotelId?._id || v.hotelId)
        .filter(Boolean);

      // Get wishlist IDs
      const wishlistIds = userBehavior.wishlist
        .map(w => w.hotelId?._id || w.hotelId)
        .filter(Boolean);

      // Exclude already viewed and wishlisted
      const excludeIds = [...viewedHotelIds, ...wishlistIds];

      // Get most viewed hotel to analyze preferences
      const mostViewed = userBehavior.viewedHotels
        .sort((a, b) => b.viewCount - a.viewCount)[0];

      if (!mostViewed || !mostViewed.hotelId) {
        return await Hotel.find({ isPopular: true })
          .sort({ rating: -1 })
          .limit(limit);
      }

      const referenceHotel = await Hotel.findById(mostViewed.hotelId);
      if (!referenceHotel) {
        return await Hotel.find({ isPopular: true })
          .sort({ rating: -1 })
          .limit(limit);
      }

      // Build recommendation query
      const recommendationQuery = {
        _id: { $nin: excludeIds }
      };

      // Similar price range (±30%)
      const priceLower = referenceHotel.pricePerNight * 0.7;
      const priceUpper = referenceHotel.pricePerNight * 1.3;
      recommendationQuery.pricePerNight = { $gte: priceLower, $lte: priceUpper };

      // Same property type preference
      if (referenceHotel.propertyType) {
        recommendationQuery.propertyType = referenceHotel.propertyType;
      }

      // Similar amenities
      if (referenceHotel.amenities && referenceHotel.amenities.length > 0) {
        recommendationQuery.amenities = { $in: referenceHotel.amenities };
      }

      // Good ratings only
      recommendationQuery.rating = { $gte: 7 };

      // Get recommendations
      const recommendations = await Hotel.find(recommendationQuery)
        .sort({ rating: -1, discountPercent: -1 })
        .limit(limit);

      // If not enough, add popular hotels
      if (recommendations.length < limit) {
        const additional = await Hotel.find({
          _id: { $nin: [...excludeIds, ...recommendations.map(r => r._id)] },
          rating: { $gte: 7 }
        })
        .sort({ isPopular: -1, rating: -1 })
        .limit(limit - recommendations.length);

        return [...recommendations, ...additional];
      }

      return recommendations;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }

  // Get similar hotels
  static async getSimilarHotels(hotelId, limit = 6) {
    try {
      const Hotel = mongoose.model('Hotel');
      const hotel = await Hotel.findById(hotelId);

      if (!hotel) return [];

      const query = {
        _id: { $ne: hotelId },
        // Same city or location
        $or: [
          { city: hotel.city },
          { location: new RegExp(hotel.location, 'i') }
        ],
        // Similar price range (±40%)
        pricePerNight: {
          $gte: hotel.pricePerNight * 0.6,
          $lte: hotel.pricePerNight * 1.4
        },
        // Good ratings
        rating: { $gte: 7 }
      };

      const similar = await Hotel.find(query)
        .sort({ rating: -1, discountPercent: -1 })
        .limit(limit);

      return similar;
    } catch (error) {
      console.error('Error getting similar hotels:', error);
      throw error;
    }
  }

  // Get trending hotels by location
  static async getTrendingByLocation(location, limit = 6) {
    try {
      const Hotel = mongoose.model('Hotel');

      const hotels = await Hotel.find({
        $or: [
          { city: new RegExp(location, 'i') },
          { location: new RegExp(location, 'i') },
          { country: new RegExp(location, 'i') }
        ],
        rating: { $gte: 7 }
      })
      .sort({ bookingCount24h: -1, isPopular: -1, rating: -1 })
      .limit(limit);

      return hotels;
    } catch (error) {
      console.error('Error getting trending hotels:', error);
      throw error;
    }
  }

  // Add to wishlist
  static async addToWishlist(userId, hotelId) {
    try {
      const Hotel = mongoose.model('Hotel');
      let userBehavior = await UserBehavior.findOne({ userId });

      if (!userBehavior) {
        userBehavior = new UserBehavior({ userId });
      }

      // Check if already in wishlist
      const exists = userBehavior.wishlist.some(
        w => w.hotelId.toString() === hotelId
      );

      if (exists) {
        return { success: false, message: 'Already in wishlist' };
      }

      // Get hotel price
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        return { success: false, message: 'Hotel not found' };
      }

      userBehavior.wishlist.push({
        hotelId,
        priceWhenAdded: hotel.pricePerNight,
        notifyOnPriceDrop: true
      });

      userBehavior.updatedAt = new Date();
      await userBehavior.save();

      return { success: true, data: userBehavior.wishlist };
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  }

  // Remove from wishlist
  static async removeFromWishlist(userId, hotelId) {
    try {
      const userBehavior = await UserBehavior.findOne({ userId });

      if (!userBehavior) {
        return { success: false, message: 'User behavior not found' };
      }

      userBehavior.wishlist = userBehavior.wishlist.filter(
        w => w.hotelId.toString() !== hotelId
      );

      userBehavior.updatedAt = new Date();
      await userBehavior.save();

      return { success: true, data: userBehavior.wishlist };
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  }

  // Create price alert
  static async createPriceAlert(userId, hotelId, targetPrice) {
    try {
      const Hotel = mongoose.model('Hotel');
      const hotel = await Hotel.findById(hotelId);

      if (!hotel) {
        return { success: false, message: 'Hotel not found' };
      }

      // Check if alert already exists
      let alert = await PriceAlert.findOne({
        userId,
        hotelId,
        active: true
      });

      if (alert) {
        // Update existing alert
        alert.targetPrice = targetPrice;
        alert.currentPrice = hotel.pricePerNight;
        alert.updatedAt = new Date();
      } else {
        // Create new alert
        alert = new PriceAlert({
          userId,
          hotelId,
          targetPrice,
          currentPrice: hotel.pricePerNight
        });
      }

      await alert.save();
      return { success: true, data: alert };
    } catch (error) {
      console.error('Error creating price alert:', error);
      throw error;
    }
  }

  // Check and trigger price alerts
  static async checkPriceAlerts(hotelId, newPrice) {
    try {
      const alerts = await PriceAlert.find({
        hotelId,
        active: true,
        triggered: false,
        targetPrice: { $gte: newPrice }
      });

      for (const alert of alerts) {
        alert.triggered = true;
        alert.triggeredAt = new Date();
        alert.active = false;
        await alert.save();

        // TODO: Send notification to user
        console.log(`🔔 Price alert triggered for user ${alert.userId}! Price dropped to $${newPrice}`);
      }

      return alerts;
    } catch (error) {
      console.error('Error checking price alerts:', error);
      throw error;
    }
  }

  // Get recently viewed hotels
  static async getRecentlyViewed(userId, limit = 10) {
    try {
      const userBehavior = await UserBehavior.findOne({ userId })
        .populate('viewedHotels.hotelId');

      if (!userBehavior || userBehavior.viewedHotels.length === 0) {
        return [];
      }

      // Sort by last viewed, filter out null hotels
      const recentlyViewed = userBehavior.viewedHotels
        .filter(v => v.hotelId)
        .sort((a, b) => new Date(b.lastViewed) - new Date(a.lastViewed))
        .slice(0, limit)
        .map(v => v.hotelId);

      return recentlyViewed;
    } catch (error) {
      console.error('Error getting recently viewed:', error);
      throw error;
    }
  }

  // Get wishlist
  static async getWishlist(userId) {
    try {
      const userBehavior = await UserBehavior.findOne({ userId })
        .populate('wishlist.hotelId');

      if (!userBehavior) {
        return [];
      }

      // Filter out null hotels and return with metadata
      return userBehavior.wishlist
        .filter(w => w.hotelId)
        .map(w => ({
          hotel: w.hotelId,
          addedAt: w.addedAt,
          priceWhenAdded: w.priceWhenAdded,
          currentPrice: w.hotelId.pricePerNight,
          priceDrop: w.priceWhenAdded > w.hotelId.pricePerNight
            ? w.priceWhenAdded - w.hotelId.pricePerNight
            : 0
        }));
    } catch (error) {
      console.error('Error getting wishlist:', error);
      throw error;
    }
  }

  // Update user preferences based on booking
  static async updatePreferencesFromBooking(userId, hotelId) {
    try {
      const Hotel = mongoose.model('Hotel');
      let userBehavior = await UserBehavior.findOne({ userId });

      if (!userBehavior) {
        userBehavior = new UserBehavior({ userId });
      }

      const hotel = await Hotel.findById(hotelId);
      if (!hotel) return;

      // Update preferences
      if (!userBehavior.preferences.preferredAmenities) {
        userBehavior.preferences.preferredAmenities = [];
      }
      if (!userBehavior.preferences.preferredPropertyTypes) {
        userBehavior.preferences.preferredPropertyTypes = [];
      }

      // Add amenities to preferences
      if (hotel.amenities) {
        hotel.amenities.forEach(amenity => {
          if (!userBehavior.preferences.preferredAmenities.includes(amenity)) {
            userBehavior.preferences.preferredAmenities.push(amenity);
          }
        });
      }

      // Add property type
      if (hotel.propertyType && !userBehavior.preferences.preferredPropertyTypes.includes(hotel.propertyType)) {
        userBehavior.preferences.preferredPropertyTypes.push(hotel.propertyType);
      }

      // Update price range
      const currentMin = userBehavior.preferences.preferredPriceRange?.min || 999999;
      const currentMax = userBehavior.preferences.preferredPriceRange?.max || 0;

      userBehavior.preferences.preferredPriceRange = {
        min: Math.min(currentMin, hotel.pricePerNight),
        max: Math.max(currentMax, hotel.pricePerNight)
      };

      // Update stats
      userBehavior.stats.totalBookings += 1;

      const avgBookingValue = userBehavior.stats.averageBookingValue || 0;
      userBehavior.stats.averageBookingValue =
        (avgBookingValue * (userBehavior.stats.totalBookings - 1) + hotel.pricePerNight) /
        userBehavior.stats.totalBookings;

      userBehavior.updatedAt = new Date();
      await userBehavior.save();

      return userBehavior;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }
}

module.exports = {
  UserBehavior,
  PriceAlert,
  RecommendationEngine
};
