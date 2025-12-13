const axios = require('axios');

/**
 * Real-time Trip Synchronization Service
 *
 * This service simulates realistic price and availability updates
 * Always calculates from basePrice to maintain consistency
 */

class TripSyncService {
  constructor() {
    this.tripServiceUrl = 'http://localhost:3002/api/trips';
    this.syncInterval = 30000; // Sync every 30 seconds
    this.basePrices = {}; // Store base prices in memory
  }

  /**
   * Initialize base prices from current trip prices
   */
  async initializeBasePrices() {
    try {
      const response = await axios.get(this.tripServiceUrl);
      const trips = response.data.data;

      trips.forEach(trip => {
        // Store original price as base price if not already stored
        if (!this.basePrices[trip.id]) {
          // Reset to reasonable base prices if they're already inflated
          const basePrice = this.getReasonableBasePrice(trip);
          this.basePrices[trip.id] = basePrice;
        }
      });

      console.log(`✅ Initialized base prices for ${Object.keys(this.basePrices).length} trips`);
    } catch (error) {
      console.error('❌ Failed to initialize base prices:', error.message);
    }
  }

  /**
   * Get reasonable base price for a trip (reset inflated prices)
   */
  getReasonableBasePrice(trip) {
    // If price is unreasonably high, reset to reasonable values
    // Based on transport type and distance

    if (trip.transportType === 'train') {
      // Train base prices: $40-120
      const trainPrices = {
        'London, UK': 120,    // Eurostar
        'Tokyo, Japan': 130,   // Shinkansen
        'Seoul, South Korea': 55, // KTX
        'Berlin, Germany': 90, // ICE
        'Madrid, Spain': 85,   // AVE
        'Rome, Italy': 70,     // Frecciarossa
        'Amsterdam, Netherlands': 45, // Thalys
        'Istanbul, Turkey': 35, // TCDD
        'Stockholm, Sweden': 80, // SJ
        'Athens, Greece': 50    // Hellenic Train
      };

      for (const city in trainPrices) {
        if (trip.origin.includes(city)) {
          return trainPrices[city];
        }
      }
      return 80; // Default train price
    } else {
      // Flight base prices: $100-600
      const flightPrices = {
        'New York, USA': 350,              // Domestic long-haul
        'Dubai, UAE': 280,                 // International medium
        'Sydney, Australia': 150,          // Domestic short
        'Toronto, Canada': 320,            // Domestic long-haul
        'São Paulo, Brazil': 110,          // Domestic short
        'Singapore': 95,                   // Regional short
        'Cairo, Egypt': 120,               // Domestic short
        'Bangkok, Thailand': 75,           // Domestic short
        'Johannesburg, South Africa': 140, // Domestic medium
        'Buenos Aires, Argentina': 180     // Domestic medium
      };

      for (const city in flightPrices) {
        if (trip.origin.includes(city)) {
          return flightPrices[city];
        }
      }
      return 200; // Default flight price
    }
  }

  /**
   * Calculate dynamic price based on various factors
   * ALWAYS calculates from basePrice to prevent price escalation
   */
  calculateDynamicPrice(basePrice, trip) {
    const now = new Date();
    const departure = new Date(trip.departureTime);
    const daysUntilDeparture = Math.ceil((departure - now) / (1000 * 60 * 60 * 24));

    let priceMultiplier = 1.0;

    // ========================================
    // ADVANCE BOOKING PRICING (Realistic)
    // ========================================
    // Last minute (1-3 days): +20-30%
    if (daysUntilDeparture <= 3 && daysUntilDeparture >= 0) {
      priceMultiplier += 0.25; // +25% last minute
    }
    // Short notice (4-7 days): +10-15%
    else if (daysUntilDeparture <= 7) {
      priceMultiplier += 0.12; // +12% short notice
    }
    // Early bird (30+ days): -5-10%
    else if (daysUntilDeparture >= 30) {
      priceMultiplier -= 0.08; // -8% early bird discount
    }

    // ========================================
    // OCCUPANCY-BASED PRICING (Demand)
    // ========================================
    const maxSeats = trip.transportType === 'train' ? 500 : 200;
    const occupancyRate = 1 - (trip.availableSeats / maxSeats);

    if (occupancyRate > 0.9) {
      priceMultiplier += 0.30; // +30% when >90% full
    } else if (occupancyRate > 0.75) {
      priceMultiplier += 0.20; // +20% when >75% full
    } else if (occupancyRate > 0.50) {
      priceMultiplier += 0.10; // +10% when >50% full
    } else if (occupancyRate < 0.25) {
      priceMultiplier -= 0.12; // -12% when <25% full (need to fill seats)
    }

    // ========================================
    // TIME OF DAY PRICING
    // ========================================
    const departureHour = departure.getHours();

    // Peak hours (6-9 AM, 5-8 PM): +8-12%
    if ((departureHour >= 6 && departureHour <= 9) || (departureHour >= 17 && departureHour <= 20)) {
      priceMultiplier += 0.10; // +10% peak hours
    }
    // Red-eye/off-peak (midnight-5 AM, 10 PM-midnight): -8-12%
    else if (departureHour >= 22 || departureHour <= 5) {
      priceMultiplier -= 0.10; // -10% off-peak
    }

    // ========================================
    // DAY OF WEEK PRICING
    // ========================================
    const dayOfWeek = departure.getDay();

    // Weekend (Friday-Sunday): +8-12%
    if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) {
      priceMultiplier += 0.10; // +10% weekend travel
    }

    // ========================================
    // RANDOM MARKET FLUCTUATION (Small)
    // ========================================
    // Realistic ±3-5% random variation
    const randomFluctuation = (Math.random() - 0.5) * 0.08; // ±4% max
    priceMultiplier += randomFluctuation;

    // Calculate new price from BASE price (not current price!)
    const newPrice = Math.round(basePrice * priceMultiplier);

    // Ensure price stays within reasonable bounds (60% to 180% of base)
    const minPrice = Math.round(basePrice * 0.60);
    const maxPrice = Math.round(basePrice * 1.80);

    return Math.max(minPrice, Math.min(newPrice, maxPrice));
  }

  /**
   * Simulate seat bookings and cancellations (more conservative)
   */
  simulateSeatActivity(currentSeats, maxSeats) {
    // More realistic booking rates (0-2 seats for flights, 0-3 for trains)
    const isTrain = maxSeats > 300;
    const maxBookings = isTrain ? 3 : 2;
    const bookings = Math.floor(Math.random() * (maxBookings + 1));

    // Cancellations (15% chance for 1-2 seats)
    const cancellations = Math.random() < 0.15 ? Math.floor(Math.random() * 2) + 1 : 0;

    const newSeats = currentSeats - bookings + cancellations;

    // Ensure seats stay within bounds
    return Math.max(0, Math.min(newSeats, maxSeats));
  }

  /**
   * Update a single trip's price and availability
   */
  async updateTrip(trip) {
    try {
      // Get base price for this trip
      const basePrice = this.basePrices[trip.id];
      if (!basePrice) {
        console.error(`❌ No base price for trip ${trip.id}`);
        return false;
      }

      const oldPrice = trip.price;
      const oldSeats = trip.availableSeats;

      // Calculate new price from BASE price
      const newPrice = this.calculateDynamicPrice(basePrice, trip);

      // Simulate seat activity
      const maxSeats = trip.transportType === 'train' ? 500 : 200;
      const newSeats = this.simulateSeatActivity(oldSeats, maxSeats);

      // Only update if there's a meaningful change
      if (Math.abs(newPrice - oldPrice) > 1 || newSeats !== oldSeats) {
        const updateData = {
          price: newPrice,
          availableSeats: newSeats
        };

        await axios.put(`${this.tripServiceUrl}/${trip.id}`, updateData);

        // Log the change
        const priceChange = newPrice - oldPrice;
        const priceIcon = priceChange > 0 ? '📈' : priceChange < 0 ? '📉' : '➡️';
        const pricePercent = oldPrice > 0 ? ((priceChange / oldPrice) * 100).toFixed(1) : 0;

        console.log(
          `${priceIcon} ${trip.origin.substring(0, 20).padEnd(20)} → ${trip.destination.substring(0, 20).padEnd(20)} | ` +
          `$${Math.round(oldPrice)} → $${newPrice} (${pricePercent > 0 ? '+' : ''}${pricePercent}%) | ` +
          `Seats: ${oldSeats} → ${newSeats}`
        );

        return true;
      }

      return false;
    } catch (error) {
      console.error(`❌ Failed to update trip ${trip.id}:`, error.message);
      return false;
    }
  }

  /**
   * Sync all trips
   */
  async syncAllTrips() {
    try {
      // Fetch all trips
      const response = await axios.get(this.tripServiceUrl);
      const trips = response.data.data;

      if (!trips || trips.length === 0) {
        console.log('⚠️  No trips found to sync');
        return;
      }

      console.log(`\n🔄 Syncing ${trips.length} trips...`);

      // Update each trip
      const updatePromises = trips.map(trip => this.updateTrip(trip));
      const results = await Promise.all(updatePromises);

      // Count successful updates
      const updatedCount = results.filter(r => r === true).length;

      console.log(`✅ Sync complete: ${updatedCount}/${trips.length} trips updated`);
    } catch (error) {
      console.error('❌ Sync error:', error.message);
    }
  }

  /**
   * Start the sync service
   */
  async start() {
    console.log('✈️  Trip Real-Time Sync Service Started (REALISTIC PRICING)');
    console.log(`📊 Syncing every ${this.syncInterval / 1000} seconds`);
    console.log(`💰 Price range: 60% - 180% of base price`);
    console.log(`📈 Typical fluctuation: ±5-10% per sync`);
    console.log('─'.repeat(80));

    // Initialize base prices first
    await this.initializeBasePrices();

    // Initial sync
    await this.syncAllTrips();

    // Schedule periodic syncs
    setInterval(() => {
      this.syncAllTrips();
    }, this.syncInterval);
  }
}

// Start the service
const syncService = new TripSyncService();
syncService.start();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Trip sync service stopped');
  process.exit(0);
});
