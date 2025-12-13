const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/hoteldb';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ==================== ENHANCED SCHEMAS ====================

// Price History Schema - Track price changes over time
const priceHistorySchema = new mongoose.Schema({
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  date: { type: Date, default: Date.now },
  basePrice: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
  discountPercent: { type: Number, default: 0 },
  demandMultiplier: { type: Number, default: 1.0 }, // 1.0 = normal, 1.5 = high demand
  seasonalRate: { type: Boolean, default: false },
  priceDropAlert: { type: Boolean, default: false },
  changeReason: { type: String }, // 'demand', 'seasonal', 'promotion'
});

const PriceHistory = mongoose.model('PriceHistory', priceHistorySchema);

// Enhanced Hotel Schema with Real-Time Features
const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, default: '' },

  // Pricing
  basePrice: { type: Number, required: true }, // Original price
  pricePerNight: { type: Number, required: true }, // Current dynamic price
  discountPercent: { type: Number, default: 0 },
  originalPrice: { type: Number }, // For showing strikethrough

  // Availability & Real-Time Data
  totalRooms: { type: Number, required: true, default: 20 },
  availableRooms: { type: Number, required: true },
  lastBookedAt: { type: Date },
  currentViewers: { type: Number, default: 0 }, // Real-time viewers
  bookingCount24h: { type: Number, default: 0 }, // Bookings in last 24h

  // Ratings & Reviews
  rating: { type: Number, default: 0, min: 0, max: 10 },
  reviewCount: { type: Number, default: 0 },

  // Urgency Indicators
  isPopular: { type: Boolean, default: false }, // High demand indicator
  isLimitedAvailability: { type: Boolean, default: false },
  availabilityStatus: {
    type: String,
    enum: ['available', 'limited', 'almost_full', 'full'],
    default: 'available'
  },

  // Features
  amenities: [String],
  images: [String],
  propertyType: {
    type: String,
    enum: ['hotel', 'apartment', 'villa', 'resort', 'boutique'],
    default: 'hotel'
  },

  // Location Data
  coordinates: {
    lat: Number,
    lng: Number
  },
  address: String,
  city: String,
  country: String,

  // Pricing Trends
  priceDropLast24h: { type: Number, default: 0 }, // Amount price dropped
  priceTrend: {
    type: String,
    enum: ['up', 'down', 'stable'],
    default: 'stable'
  },

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
hotelSchema.pre('save', function() {
  this.updatedAt = Date.now();

  // Calculate availability status
  const availabilityPercent = (this.availableRooms / this.totalRooms) * 100;
  if (availabilityPercent === 0) {
    this.availabilityStatus = 'full';
    this.isLimitedAvailability = false;
  } else if (availabilityPercent < 10) {
    this.availabilityStatus = 'almost_full';
    this.isLimitedAvailability = true;
  } else if (availabilityPercent < 30) {
    this.availabilityStatus = 'limited';
    this.isLimitedAvailability = true;
  } else {
    this.availabilityStatus = 'available';
    this.isLimitedAvailability = false;
  }

  // Popular indicator (high bookings in 24h)
  this.isPopular = this.bookingCount24h > 5;
});

const Hotel = mongoose.model('Hotel', hotelSchema);

// Enhanced Booking Schema
const bookingSchema = new mongoose.Schema({
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  userId: { type: String, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  numberOfRooms: { type: Number, required: true },
  numberOfNights: { type: Number },

  // Pricing Details
  pricePerNight: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  taxes: { type: Number, default: 0 },
  fees: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },

  // Guest Information
  guestName: String,
  guestEmail: String,
  guestPhone: String,

  // Booking Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  confirmedAt: Date,
  cancelledAt: Date
});

const Booking = mongoose.model('Booking', bookingSchema);

// Review Schema with Category Ratings
const reviewSchema = new mongoose.Schema({
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  userId: { type: String, required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },

  // Overall Rating
  overallRating: { type: Number, required: true, min: 1, max: 10 },

  // Category Ratings (1-10 scale)
  categoryRatings: {
    cleanliness: { type: Number, min: 1, max: 10 },
    comfort: { type: Number, min: 1, max: 10 },
    location: { type: Number, min: 1, max: 10 },
    facilities: { type: Number, min: 1, max: 10 },
    staff: { type: Number, min: 1, max: 10 },
    valueForMoney: { type: Number, min: 1, max: 10 }
  },

  // Review Content
  title: { type: String, required: true, maxlength: 100 },
  reviewText: { type: String, required: true, minlength: 50, maxlength: 2000 },
  pros: [{ type: String, maxlength: 100 }],
  cons: [{ type: String, maxlength: 100 }],

  // Photos
  photos: [{ type: String }], // URLs to uploaded photos

  // Trip Details
  travelType: {
    type: String,
    enum: ['solo', 'couple', 'family', 'business', 'friends'],
    required: true
  },
  roomType: String,
  stayDuration: Number, // nights
  checkInDate: Date,

  // Verification
  verified: { type: Boolean, default: false }, // Must have valid booking

  // Community Feedback
  helpfulCount: { type: Number, default: 0 },
  notHelpfulCount: { type: Number, default: 0 },
  helpfulVotes: [String], // Array of user IDs who voted helpful

  // Management Response
  managementResponse: {
    text: String,
    respondedAt: Date,
    respondedBy: String
  },

  // Moderation
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  flagCount: { type: Number, default: 0 },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update hotel rating when review is saved
reviewSchema.post('save', async function() {
  try {
    const Review = mongoose.model('Review');
    const reviews = await Review.find({
      hotelId: this.hotelId,
      status: 'approved'
    });

    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length;

      await Hotel.findByIdAndUpdate(this.hotelId, {
        rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
        reviewCount: reviews.length
      });
    }
  } catch (error) {
    console.error('Error updating hotel rating:', error);
  }
});

const Review = mongoose.model('Review', reviewSchema);

// ==================== SOCKET.IO REAL-TIME EVENTS ====================

let activeConnections = new Map(); // hotelId -> Set of socket IDs

io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // User viewing a hotel
  socket.on('view-hotel', async (hotelId) => {
    try {
      // Add to active viewers
      if (!activeConnections.has(hotelId)) {
        activeConnections.set(hotelId, new Set());
      }
      activeConnections.get(hotelId).add(socket.id);

      // Update viewer count
      const viewerCount = activeConnections.get(hotelId).size;
      const hotel = await Hotel.findByIdAndUpdate(
        hotelId,
        { currentViewers: viewerCount },
        { new: true }
      );

      // Broadcast updated viewer count to all viewing this hotel
      io.emit('hotel-viewers-update', {
        hotelId,
        viewerCount,
        availableRooms: hotel.availableRooms,
        availabilityStatus: hotel.availabilityStatus
      });

      console.log(`👀 User viewing hotel ${hotelId}, viewers: ${viewerCount}`);
    } catch (error) {
      console.error('Error handling view-hotel:', error);
    }
  });

  // User stopped viewing a hotel
  socket.on('leave-hotel', async (hotelId) => {
    try {
      if (activeConnections.has(hotelId)) {
        activeConnections.get(hotelId).delete(socket.id);
        const viewerCount = activeConnections.get(hotelId).size;

        await Hotel.findByIdAndUpdate(hotelId, { currentViewers: viewerCount });

        io.emit('hotel-viewers-update', { hotelId, viewerCount });
        console.log(`👋 User left hotel ${hotelId}, viewers: ${viewerCount}`);
      }
    } catch (error) {
      console.error('Error handling leave-hotel:', error);
    }
  });

  // Disconnect cleanup
  socket.on('disconnect', async () => {
    console.log('🔌 Client disconnected:', socket.id);

    // Remove from all hotel viewer sets
    for (let [hotelId, viewers] of activeConnections.entries()) {
      if (viewers.has(socket.id)) {
        viewers.delete(socket.id);
        const viewerCount = viewers.size;

        await Hotel.findByIdAndUpdate(hotelId, { currentViewers: viewerCount });
        io.emit('hotel-viewers-update', { hotelId, viewerCount });
      }
    }
  });
});

// ==================== UTILITY FUNCTIONS ====================

// Update price history (called when prices change)
async function recordPriceChange(hotelId, currentPrice, reason) {
  try {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return;

    const discountPercent = Math.round(((hotel.basePrice - currentPrice) / hotel.basePrice) * 100);

    await PriceHistory.create({
      hotelId,
      basePrice: hotel.basePrice,
      currentPrice,
      discountPercent,
      changeReason: reason
    });

    // Check if price dropped in last 24h
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentPrices = await PriceHistory.find({
      hotelId,
      date: { $gte: yesterday }
    }).sort({ date: -1 });

    if (recentPrices.length > 1) {
      const priceDrop = recentPrices[0].currentPrice - currentPrice;
      if (priceDrop > 0) {
        await Hotel.findByIdAndUpdate(hotelId, {
          priceDropLast24h: priceDrop,
          priceTrend: 'down'
        });

        // Notify clients of price drop
        io.emit('price-drop', {
          hotelId,
          oldPrice: recentPrices[0].currentPrice,
          newPrice: currentPrice,
          dropAmount: priceDrop
        });
      }
    }
  } catch (error) {
    console.error('Error recording price change:', error);
  }
}

// Dynamic pricing algorithm (simple version)
async function updateDynamicPricing(hotelId) {
  try {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return;

    let newPrice = hotel.basePrice;
    let demandMultiplier = 1.0;

    // Demand-based pricing
    const occupancyRate = ((hotel.totalRooms - hotel.availableRooms) / hotel.totalRooms) * 100;
    if (occupancyRate > 80) {
      demandMultiplier = 1.3; // 30% increase when almost full
    } else if (occupancyRate > 60) {
      demandMultiplier = 1.15; // 15% increase when busy
    } else if (occupancyRate < 20) {
      demandMultiplier = 0.85; // 15% discount when empty
    }

    // High demand indicator
    if (hotel.bookingCount24h > 5) {
      demandMultiplier *= 1.1; // Additional 10% for high demand
    }

    newPrice = Math.round(hotel.basePrice * demandMultiplier);

    // Calculate discount percentage
    const discountPercent = hotel.basePrice > newPrice
      ? Math.round(((hotel.basePrice - newPrice) / hotel.basePrice) * 100)
      : 0;

    // Update hotel price
    hotel.pricePerNight = newPrice;
    hotel.discountPercent = discountPercent;
    hotel.originalPrice = discountPercent > 0 ? hotel.basePrice : null;
    await hotel.save();

    // Record in history
    await recordPriceChange(hotelId, newPrice, 'dynamic_pricing');

    // Notify clients of price change
    io.emit('price-update', {
      hotelId,
      newPrice,
      discountPercent,
      originalPrice: hotel.originalPrice
    });

  } catch (error) {
    console.error('Error updating dynamic pricing:', error);
  }
}

// Reset booking count every 24 hours
setInterval(async () => {
  try {
    await Hotel.updateMany({}, { bookingCount24h: 0 });
    console.log('✅ Reset 24h booking counts');
  } catch (error) {
    console.error('Error resetting booking counts:', error);
  }
}, 24 * 60 * 60 * 1000); // Every 24 hours

// ==================== REST API ROUTES ====================

// TripAdvisor API Integration
const tripadvisorApi = require('./tripadvisorApi');

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'hotel-service' });
});

// Sync hotels from TripAdvisor
app.post('/api/hotels/sync', async (req, res) => {
  try {
    const { location = 'New York' } = req.body;

    console.log(`🔄 Syncing hotels from TripAdvisor for location: ${location}`);

    // Fetch hotels from TripAdvisor API
    const tripadvisorHotels = await tripadvisorApi.searchHotels(location);

    if (tripadvisorHotels.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No hotels found for this location'
      });
    }

    // Save hotels to database
    const savedHotels = [];
    for (const hotelData of tripadvisorHotels) {
      try {
        // Check if hotel already exists
        const existing = await Hotel.findOne({
          name: hotelData.name,
          location: hotelData.location
        });

        if (existing) {
          console.log(`⏭️  Skipping duplicate: ${hotelData.name} in ${hotelData.location}`);
          continue;
        }

        const hotel = new Hotel(hotelData);
        await hotel.save();

        // Record initial price
        await recordPriceChange(hotel._id, hotel.pricePerNight, 'synced_from_tripadvisor');

        savedHotels.push(hotel);
        console.log(`✅ Added: ${hotelData.name}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⏭️  Duplicate detected by index: ${hotelData.name}`);
        } else {
          console.error(`❌ Error saving hotel: ${error.message}`);
        }
      }
    }

    console.log(`✅ Synced ${savedHotels.length} hotels from TripAdvisor`);

    res.json({
      success: true,
      message: `Synced ${savedHotels.length} hotels from TripAdvisor`,
      data: savedHotels
    });
  } catch (error) {
    console.error('Error syncing hotels:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all hotels with enhanced filtering
app.get('/api/hotels', async (req, res) => {
  try {
    const {
      location,
      minPrice,
      maxPrice,
      minRating,
      amenities,
      propertyType,
      availabilityStatus,
      sortBy = 'rating',
      limit = 50,
      page = 1
    } = req.query;

    let filter = {};

    // Location filter (city or country)
    if (location) {
      filter.$or = [
        { location: new RegExp(location, 'i') },
        { city: new RegExp(location, 'i') },
        { country: new RegExp(location, 'i') }
      ];
    }

    // Price range
    if (minPrice || maxPrice) {
      filter.pricePerNight = {};
      if (minPrice) filter.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerNight.$lte = Number(maxPrice);
    }

    // Rating filter
    if (minRating) filter.rating = { $gte: Number(minRating) };

    // Amenities filter
    if (amenities) {
      const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
      filter.amenities = { $all: amenitiesArray };
    }

    // Property type
    if (propertyType) filter.propertyType = propertyType;

    // Availability status
    if (availabilityStatus) filter.availabilityStatus = availabilityStatus;

    // Sorting
    let sort = {};
    switch (sortBy) {
      case 'price_asc':
        sort = { pricePerNight: 1 };
        break;
      case 'price_desc':
        sort = { pricePerNight: -1 };
        break;
      case 'rating':
        sort = { rating: -1 };
        break;
      case 'popular':
        sort = { bookingCount24h: -1, rating: -1 };
        break;
      case 'discount':
        sort = { discountPercent: -1 };
        break;
      default:
        sort = { rating: -1 };
    }

    // Pagination
    const skip = (page - 1) * limit;

    let hotels = await Hotel.find(filter)
      .sort(sort)
      .limit(Number(limit))
      .skip(skip);

    let total = await Hotel.countDocuments(filter);

    // Auto-sync from TripAdvisor if database is empty
    if (total === 0 && !location) {
      console.log('📊 No hotels in database, auto-syncing from TripAdvisor...');

      try {
        const defaultLocations = ['New York', 'Paris', 'London', 'Tokyo'];
        for (const loc of defaultLocations) {
          const tripadvisorHotels = await tripadvisorApi.searchHotels(loc);

          for (const hotelData of tripadvisorHotels) {
            try {
              // Check if hotel already exists
              const existing = await Hotel.findOne({
                name: hotelData.name,
                location: hotelData.location
              });

              if (existing) {
                console.log(`⏭️  Skipping duplicate: ${hotelData.name} in ${hotelData.location}`);
                continue;
              }

              const hotel = new Hotel(hotelData);
              await hotel.save();
              await recordPriceChange(hotel._id, hotel.pricePerNight, 'auto_synced_from_tripadvisor');
              console.log(`✅ Added: ${hotelData.name}`);
            } catch (error) {
              if (error.code === 11000) {
                // Duplicate key error from unique index
                console.log(`⏭️  Duplicate detected by index: ${hotelData.name}`);
              } else {
                console.error(`❌ Error saving hotel: ${error.message}`);
              }
            }
          }
        }

        // Fetch again after syncing
        hotels = await Hotel.find(filter)
          .sort(sort)
          .limit(Number(limit))
          .skip(skip);

        total = await Hotel.countDocuments(filter);
        console.log(`✅ Auto-synced hotels from TripAdvisor, total: ${total}`);
      } catch (syncError) {
        console.error('Error auto-syncing hotels:', syncError);
      }
    }

    res.json({
      success: true,
      data: hotels,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get hotel by ID with enhanced data
app.get('/api/hotels/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, error: 'Hotel not found' });
    }

    // Get price history for last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const priceHistory = await PriceHistory.find({
      hotelId: req.params.id,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 }).limit(30);

    // Get recent bookings count
    const recentBookings = await Booking.countDocuments({
      hotelId: req.params.id,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    res.json({
      success: true,
      data: {
        ...hotel.toObject(),
        priceHistory,
        recentBookings
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new hotel
app.post('/api/hotels', async (req, res) => {
  try {
    const hotelData = {
      ...req.body,
      totalRooms: req.body.totalRooms || 20,
      availableRooms: req.body.availableRooms || req.body.totalRooms || 20,
      pricePerNight: req.body.pricePerNight || req.body.basePrice
    };

    const hotel = new Hotel(hotelData);
    await hotel.save();

    // Record initial price
    await recordPriceChange(hotel._id, hotel.pricePerNight, 'created');

    res.status(201).json({ success: true, data: hotel });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update hotel
app.put('/api/hotels/:id', async (req, res) => {
  try {
    const oldHotel = await Hotel.findById(req.params.id);
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!hotel) {
      return res.status(404).json({ success: false, error: 'Hotel not found' });
    }

    // If price changed, record it
    if (oldHotel.pricePerNight !== hotel.pricePerNight) {
      await recordPriceChange(hotel._id, hotel.pricePerNight, 'manual_update');
    }

    // Broadcast update to connected clients
    io.emit('hotel-update', { hotelId: hotel._id, data: hotel });

    res.json({ success: true, data: hotel });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete hotel
app.delete('/api/hotels/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, error: 'Hotel not found' });
    }

    // Delete related data
    await PriceHistory.deleteMany({ hotelId: req.params.id });
    await Booking.deleteMany({ hotelId: req.params.id });

    res.json({ success: true, message: 'Hotel deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create booking with real-time updates
app.post('/api/bookings', async (req, res) => {
  try {
    const { hotelId, numberOfRooms, checkIn, checkOut } = req.body;

    // Check hotel availability
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ success: false, error: 'Hotel not found' });
    }

    if (hotel.availableRooms < numberOfRooms) {
      return res.status(400).json({
        success: false,
        error: 'Not enough rooms available',
        availableRooms: hotel.availableRooms
      });
    }

    // Calculate pricing
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const numberOfNights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const subtotal = numberOfNights * hotel.pricePerNight * numberOfRooms;
    const taxes = subtotal * 0.12; // 12% tax
    const fees = 25; // Fixed service fee
    const totalPrice = subtotal + taxes + fees;

    // Create booking
    const booking = new Booking({
      ...req.body,
      numberOfNights,
      pricePerNight: hotel.pricePerNight,
      subtotal,
      taxes,
      fees,
      totalPrice,
      status: 'confirmed'
    });
    await booking.save();

    // Update hotel availability
    hotel.availableRooms -= numberOfRooms;
    hotel.lastBookedAt = new Date();
    hotel.bookingCount24h += 1;
    await hotel.save();

    // Update dynamic pricing based on new availability
    await updateDynamicPricing(hotelId);

    // Broadcast booking update
    io.emit('booking-created', {
      hotelId,
      availableRooms: hotel.availableRooms,
      availabilityStatus: hotel.availabilityStatus,
      lastBookedAt: hotel.lastBookedAt
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get bookings for a user
app.get('/api/bookings/user/:userId', async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId })
      .populate('hotelId')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get booking by ID
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('hotelId');
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update booking status
app.patch('/api/bookings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const oldStatus = booking.status;
    booking.status = status;

    // Handle cancellation - restore rooms
    if (status === 'cancelled' && oldStatus !== 'cancelled') {
      booking.cancelledAt = new Date();

      const hotel = await Hotel.findById(booking.hotelId);
      if (hotel) {
        hotel.availableRooms += booking.numberOfRooms;
        await hotel.save();

        // Update pricing after cancellation
        await updateDynamicPricing(hotel._id);

        // Broadcast availability update
        io.emit('booking-cancelled', {
          hotelId: hotel._id,
          availableRooms: hotel.availableRooms,
          availabilityStatus: hotel.availabilityStatus
        });
      }
    }

    await booking.save();

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get price history for a hotel
app.get('/api/hotels/:id/price-history', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const history = await PriceHistory.find({
      hotelId: req.params.id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Trigger dynamic pricing update (admin endpoint)
app.post('/api/hotels/:id/update-pricing', async (req, res) => {
  try {
    await updateDynamicPricing(req.params.id);
    const hotel = await Hotel.findById(req.params.id);
    res.json({ success: true, data: hotel });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== REVIEW ROUTES ====================

// Get reviews for a hotel
app.get('/api/hotels/:id/reviews', async (req, res) => {
  try {
    const {
      sort = 'recent',
      travelType,
      minRating,
      limit = 20,
      page = 1
    } = req.query;

    let filter = {
      hotelId: req.params.id,
      status: 'approved'
    };

    if (travelType) filter.travelType = travelType;
    if (minRating) filter.overallRating = { $gte: Number(minRating) };

    let sortOptions = {};
    switch (sort) {
      case 'recent':
        sortOptions = { createdAt: -1 };
        break;
      case 'highest':
        sortOptions = { overallRating: -1 };
        break;
      case 'lowest':
        sortOptions = { overallRating: 1 };
        break;
      case 'helpful':
        sortOptions = { helpfulCount: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const reviews = await Review.find(filter)
      .sort(sortOptions)
      .limit(Number(limit))
      .skip(skip);

    const total = await Review.countDocuments(filter);

    // Calculate rating statistics
    const allReviews = await Review.find({ hotelId: req.params.id, status: 'approved' });
    const stats = {
      totalReviews: allReviews.length,
      averageRating: allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.overallRating, 0) / allReviews.length
        : 0,
      ratingDistribution: {
        excellent: allReviews.filter(r => r.overallRating >= 9).length,
        veryGood: allReviews.filter(r => r.overallRating >= 8 && r.overallRating < 9).length,
        good: allReviews.filter(r => r.overallRating >= 7 && r.overallRating < 8).length,
        fair: allReviews.filter(r => r.overallRating >= 6 && r.overallRating < 7).length,
        poor: allReviews.filter(r => r.overallRating < 6).length
      },
      categoryAverages: {
        cleanliness: allReviews.filter(r => r.categoryRatings?.cleanliness).length > 0
          ? allReviews.reduce((sum, r) => sum + (r.categoryRatings?.cleanliness || 0), 0) / allReviews.filter(r => r.categoryRatings?.cleanliness).length
          : 0,
        comfort: allReviews.filter(r => r.categoryRatings?.comfort).length > 0
          ? allReviews.reduce((sum, r) => sum + (r.categoryRatings?.comfort || 0), 0) / allReviews.filter(r => r.categoryRatings?.comfort).length
          : 0,
        location: allReviews.filter(r => r.categoryRatings?.location).length > 0
          ? allReviews.reduce((sum, r) => sum + (r.categoryRatings?.location || 0), 0) / allReviews.filter(r => r.categoryRatings?.location).length
          : 0,
        facilities: allReviews.filter(r => r.categoryRatings?.facilities).length > 0
          ? allReviews.reduce((sum, r) => sum + (r.categoryRatings?.facilities || 0), 0) / allReviews.filter(r => r.categoryRatings?.facilities).length
          : 0,
        staff: allReviews.filter(r => r.categoryRatings?.staff).length > 0
          ? allReviews.reduce((sum, r) => sum + (r.categoryRatings?.staff || 0), 0) / allReviews.filter(r => r.categoryRatings?.staff).length
          : 0,
        valueForMoney: allReviews.filter(r => r.categoryRatings?.valueForMoney).length > 0
          ? allReviews.reduce((sum, r) => sum + (r.categoryRatings?.valueForMoney || 0), 0) / allReviews.filter(r => r.categoryRatings?.valueForMoney).length
          : 0
      }
    };

    res.json({
      success: true,
      data: reviews,
      stats,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create a review
app.post('/api/hotels/:id/reviews', async (req, res) => {
  try {
    const { userId, bookingId } = req.body;

    // Verify user has a valid booking for this hotel
    if (bookingId) {
      const booking = await Booking.findOne({
        _id: bookingId,
        hotelId: req.params.id,
        userId: userId,
        status: 'completed'
      });

      if (!booking) {
        return res.status(403).json({
          success: false,
          error: 'You must have a completed booking to leave a review'
        });
      }

      // Check if user already reviewed this booking
      const existingReview = await Review.findOne({ bookingId });
      if (existingReview) {
        return res.status(400).json({
          success: false,
          error: 'You have already reviewed this booking'
        });
      }
    }

    const review = new Review({
      ...req.body,
      hotelId: req.params.id,
      verified: !!bookingId
    });

    await review.save();

    // Broadcast new review
    io.emit('new-review', {
      hotelId: req.params.id,
      review: review.toObject()
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Vote review as helpful/not helpful
app.post('/api/reviews/:id/vote', async (req, res) => {
  try {
    const { userId, helpful } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    // Check if user already voted
    const alreadyVoted = review.helpfulVotes.includes(userId);
    if (alreadyVoted) {
      return res.status(400).json({ success: false, error: 'You have already voted on this review' });
    }

    // Add vote
    review.helpfulVotes.push(userId);
    if (helpful) {
      review.helpfulCount += 1;
    } else {
      review.notHelpfulCount += 1;
    }

    await review.save();

    res.json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Add management response to review
app.post('/api/reviews/:id/respond', async (req, res) => {
  try {
    const { text, respondedBy } = req.body;

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        managementResponse: {
          text,
          respondedAt: new Date(),
          respondedBy
        }
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    res.json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Flag/Report a review
app.post('/api/reviews/:id/flag', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    review.flagCount += 1;

    // Auto-hide if too many flags
    if (review.flagCount >= 5) {
      review.status = 'pending';
    }

    await review.save();

    res.json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get featured testimonials for homepage
app.get('/api/testimonials/featured', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 4;

    // Get top-rated, verified reviews from different hotels
    const testimonials = await Review.aggregate([
      // Only approved, verified reviews with high ratings
      {
        $match: {
          status: 'approved',
          verified: true,
          overallRating: { $gte: 9 }, // Only excellent reviews
          helpful: { $gte: 5 } // Reviews that people found helpful
        }
      },
      // Join with hotel data
      {
        $lookup: {
          from: 'hotels',
          localField: 'hotelId',
          foreignField: '_id',
          as: 'hotel'
        }
      },
      { $unwind: '$hotel' },
      // Sort by rating and helpful votes
      { $sort: { overallRating: -1, helpful: -1, createdAt: -1 } },
      // Limit results
      { $limit: limit },
      // Project only needed fields
      {
        $project: {
          _id: 1,
          userName: 1,
          userLocation: 1,
          overallRating: 1,
          title: 1,
          reviewText: 1,
          createdAt: 1,
          helpful: 1,
          'hotel.name': 1,
          'hotel.location': 1
        }
      }
    ]);

    res.json({ success: true, data: testimonials });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== PERSONALIZATION ROUTES ====================

const { RecommendationEngine, UserBehavior, PriceAlert } = require('./personalization');

// Track hotel view
app.post('/api/personalization/track-view', async (req, res) => {
  try {
    const { userId, hotelId, timeSpent } = req.body;
    const result = await RecommendationEngine.trackView(userId, hotelId, timeSpent);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Track search
app.post('/api/personalization/track-search', async (req, res) => {
  try {
    const { userId, searchParams } = req.body;
    const result = await RecommendationEngine.trackSearch(userId, searchParams);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get personalized recommendations
app.get('/api/personalization/recommendations/:userId', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const recommendations = await RecommendationEngine.getRecommendations(
      req.params.userId,
      Number(limit)
    );
    res.json({ success: true, data: recommendations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get similar hotels
app.get('/api/hotels/:id/similar', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const similar = await RecommendationEngine.getSimilarHotels(
      req.params.id,
      Number(limit)
    );
    res.json({ success: true, data: similar });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get trending hotels
app.get('/api/personalization/trending', async (req, res) => {
  try {
    const { location, limit = 6 } = req.query;
    const trending = await RecommendationEngine.getTrendingByLocation(
      location,
      Number(limit)
    );
    res.json({ success: true, data: trending });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get recently viewed
app.get('/api/personalization/recently-viewed/:userId', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const recentlyViewed = await RecommendationEngine.getRecentlyViewed(
      req.params.userId,
      Number(limit)
    );
    res.json({ success: true, data: recentlyViewed });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add to wishlist
app.post('/api/personalization/wishlist/add', async (req, res) => {
  try {
    const { userId, hotelId } = req.body;
    const result = await RecommendationEngine.addToWishlist(userId, hotelId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Remove from wishlist
app.delete('/api/personalization/wishlist/remove', async (req, res) => {
  try {
    const { userId, hotelId } = req.body;
    const result = await RecommendationEngine.removeFromWishlist(userId, hotelId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get wishlist
app.get('/api/personalization/wishlist/:userId', async (req, res) => {
  try {
    const wishlist = await RecommendationEngine.getWishlist(req.params.userId);
    res.json({ success: true, data: wishlist });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create price alert
app.post('/api/personalization/price-alert', async (req, res) => {
  try {
    const { userId, hotelId, targetPrice } = req.body;
    const result = await RecommendationEngine.createPriceAlert(userId, hotelId, targetPrice);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user's price alerts
app.get('/api/personalization/price-alerts/:userId', async (req, res) => {
  try {
    const alerts = await PriceAlert.find({
      userId: req.params.userId,
      active: true
    }).populate('hotelId');

    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== LOYALTY PROGRAM ROUTES ====================

const { LoyaltyEngine, LoyaltyProfile, TIERS, ACHIEVEMENTS } = require('./loyalty');

// Get user's loyalty profile
app.get('/api/loyalty/profile/:userId', async (req, res) => {
  try {
    const profile = await LoyaltyEngine.initializeProfile(req.params.userId);
    const tierBenefits = LoyaltyEngine.getTierBenefits(profile.currentTier);

    res.json({
      success: true,
      data: {
        ...profile.toObject(),
        tierBenefits
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get points history
app.get('/api/loyalty/points-history/:userId', async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const profile = await LoyaltyProfile.findOne({ userId: req.params.userId });

    if (!profile) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    const history = profile.pointsHistory
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, Number(limit));

    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Redeem points
app.post('/api/loyalty/redeem', async (req, res) => {
  try {
    const { userId, points, reason } = req.body;
    const result = await LoyaltyEngine.redeemPoints(userId, points, reason);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Award points for booking
app.post('/api/loyalty/award', async (req, res) => {
  try {
    const { userId, bookingAmount, bookingId } = req.body;

    if (!userId || !bookingAmount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId and bookingAmount are required'
      });
    }

    const result = await LoyaltyEngine.awardPointsForBooking(userId, bookingAmount, bookingId);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error awarding loyalty points:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all achievements
app.get('/api/loyalty/achievements', (req, res) => {
  res.json({ success: true, data: ACHIEVEMENTS });
});

// Get user's achievements
app.get('/api/loyalty/achievements/:userId', async (req, res) => {
  try {
    const profile = await LoyaltyProfile.findOne({ userId: req.params.userId });

    if (!profile) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    res.json({
      success: true,
      data: profile.achievements,
      allAchievements: ACHIEVEMENTS
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get tier benefits
app.get('/api/loyalty/tiers', (req, res) => {
  res.json({ success: true, data: TIERS });
});

// Process referral signup
app.post('/api/loyalty/referral/signup', async (req, res) => {
  try {
    const { referralCode, newUserId } = req.body;
    const result = await LoyaltyEngine.processReferral(referralCode, newUserId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get referral stats
app.get('/api/loyalty/referral/:userId', async (req, res) => {
  try {
    const profile = await LoyaltyProfile.findOne({ userId: req.params.userId });

    if (!profile) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    res.json({
      success: true,
      data: {
        referralCode: profile.referralCode,
        stats: profile.referralStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`🏨 Hotel Service running on port ${PORT}`);
  console.log(`🔌 WebSocket server ready for real-time updates`);
  console.log(`🎯 Personalization engine ready`);
  console.log(`🏆 Loyalty program ready`);
});
