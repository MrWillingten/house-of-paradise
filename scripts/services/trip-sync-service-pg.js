const axios = require('axios');
const { Client } = require('pg');

/**
 * Real-time Trip Synchronization Service (PostgreSQL Direct)
 *
 * Uses direct PostgreSQL connection to update prices reliably
 * Always calculates from basePrice stored in memory
 */

class TripSyncService {
  constructor() {
    this.tripServiceUrl = 'http://localhost:3002/api/trips';
    this.syncInterval = 30000; // Sync every 30 seconds
    this.basePrices = {}; // Store base prices in memory

    // PostgreSQL connection
    this.pgClient = new Client({
      host: 'localhost',
      port: 5432,
      database: 'tripdb',
      user: 'postgres',
      password: 'postgres'
    });
  }

  async connect() {
    try {
      await this.pgClient.connect();
      console.log('✅ Connected to PostgreSQL');
    } catch (error) {
      console.error('❌ PostgreSQL connection error:', error.message);
    }
  }

  /**
   * Initialize base prices from current trip prices
   */
  async initializeBasePrices() {
    try {
      const response = await axios.get(this.tripServiceUrl);
      const trips = response.data.data;

      trips.forEach(trip => {
        // Store current price as base price (they're now reset to realistic values)
        this.basePrices[trip.id] = trip.price;
      });

      console.log(`✅ Initialized base prices for ${Object.keys(this.basePrices).length} trips`);
    } catch (error) {
      console.error('❌ Failed to initialize base prices:', error.message);
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
    // Last minute (1-3 days): +15-25%
    if (daysUntilDeparture <= 3 && daysUntilDeparture >= 0) {
      priceMultiplier += 0.20; // +20% last minute
    }
    // Short notice (4-7 days): +8-12%
    else if (daysUntilDeparture <= 7) {
      priceMultiplier += 0.10; // +10% short notice
    }
    // Early bird (30+ days): -5-8%
    else if (daysUntilDeparture >= 30) {
      priceMultiplier -= 0.06; // -6% early bird discount
    }

    // ========================================
    // OCCUPANCY-BASED PRICING (Demand)
    // ========================================
    const maxSeats = trip.transportType === 'train' ? 600 : 200;
    const occupancyRate = 1 - (trip.availableSeats / maxSeats);

    if (occupancyRate > 0.85) {
      priceMultiplier += 0.25; // +25% when >85% full
    } else if (occupancyRate > 0.70) {
      priceMultiplier += 0.15; // +15% when >70% full
    } else if (occupancyRate > 0.50) {
      priceMultiplier += 0.08; // +8% when >50% full
    } else if (occupancyRate < 0.30) {
      priceMultiplier -= 0.10; // -10% when <30% full
    }

    // ========================================
    // TIME OF DAY PRICING
    // ========================================
    const departureHour = departure.getHours();

    // Peak hours (6-9 AM, 5-8 PM): +6-10%
    if ((departureHour >= 6 && departureHour <= 9) || (departureHour >= 17 && departureHour <= 20)) {
      priceMultiplier += 0.08; // +8% peak hours
    }
    // Red-eye/off-peak: -6-10%
    else if (departureHour >= 22 || departureHour <= 5) {
      priceMultiplier -= 0.08; // -8% off-peak
    }

    // ========================================
    // DAY OF WEEK PRICING
    // ========================================
    const dayOfWeek = departure.getDay();

    // Weekend (Friday-Sunday): +8-10%
    if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) {
      priceMultiplier += 0.09; // +9% weekend travel
    }

    // ========================================
    // RANDOM MARKET FLUCTUATION (Small)
    // ========================================
    // Realistic ±2-4% random variation
    const randomFluctuation = (Math.random() - 0.5) * 0.06; // ±3% max
    priceMultiplier += randomFluctuation;

    // Calculate new price from BASE price (not current price!)
    const newPrice = Math.round(basePrice * priceMultiplier);

    // Ensure price stays within reasonable bounds (70% to 160% of base)
    const minPrice = Math.round(basePrice * 0.70);
    const maxPrice = Math.round(basePrice * 1.60);

    return Math.max(minPrice, Math.min(newPrice, maxPrice));
  }

  /**
   * Simulate seat bookings and cancellations (conservative)
   */
  simulateSeatActivity(currentSeats, maxSeats) {
    // Realistic booking rates (0-2 seats for flights, 0-3 for trains)
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
      const maxSeats = trip.transportType === 'train' ? 600 : 200;
      const newSeats = this.simulateSeatActivity(oldSeats, maxSeats);

      // Only update if there's a meaningful change
      if (Math.abs(newPrice - oldPrice) > 1 || newSeats !== oldSeats) {
        // Update directly in PostgreSQL
        await this.pgClient.query(
          'UPDATE trips SET price = $1, available_seats = $2 WHERE id = $3',
          [newPrice, newSeats, trip.id]
        );

        // Log the change
        const priceChange = newPrice - oldPrice;
        const priceIcon = priceChange > 0 ? '📈' : priceChange < 0 ? '📉' : '➡️';
        const pricePercent = oldPrice > 0 ? ((priceChange / oldPrice) * 100).toFixed(1) : 0;

        console.log(
          `${priceIcon} ${trip.origin.substring(0, 18).padEnd(18)} → ${trip.destination.substring(0, 18).padEnd(18)} | ` +
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
    console.log('✈️  Trip Real-Time Sync Service Started (REALISTIC PRICING + PostgreSQL)');
    console.log(`📊 Syncing every ${this.syncInterval / 1000} seconds`);
    console.log(`💰 Price range: 70% - 160% of base price`);
    console.log(`📈 Typical fluctuation: ±5-10% per sync`);
    console.log('─'.repeat(80));

    // Connect to PostgreSQL
    await this.connect();

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
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Trip sync service stopped');
  await syncService.pgClient.end();
  process.exit(0);
});
