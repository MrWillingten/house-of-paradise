const axios = require('axios');

/**
 * Real-time Hotel Synchronization Service
 *
 * This service simulates realistic price and availability updates
 * Always calculates from basePrice to maintain consistency
 */

class HotelSyncService {
  constructor() {
    this.hotelServiceUrl = 'http://localhost:3001/api/hotels';
    this.syncInterval = 30000; // Sync every 30 seconds
  }

  /**
   * Calculate dynamic price based on various factors
   * ALWAYS calculates from basePrice to prevent price escalation
   */
  calculateDynamicPrice(basePrice, hotel) {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const dayOfWeek = now.getDay(); // 0-6
    const hour = now.getHours();

    let priceMultiplier = 1.0;

    // ========================================
    // SEASONAL PRICING (Realistic ranges)
    // ========================================
    // Summer (June-August): +10-20%
    if (month >= 5 && month <= 7) {
      priceMultiplier += 0.15; // +15% in summer
    }
    // Winter holidays (December-January): +15-25%
    else if (month === 11 || month === 0) {
      priceMultiplier += 0.20; // +20% during holidays
    }
    // Spring (March-May): +5-10%
    else if (month >= 2 && month <= 4) {
      priceMultiplier += 0.08; // +8% in spring
    }
    // Fall (September-November): -5-10%
    else {
      priceMultiplier -= 0.08; // -8% in fall
    }

    // ========================================
    // DAY OF WEEK PRICING
    // ========================================
    // Weekend premium (Friday, Saturday): +10-15%
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      priceMultiplier += 0.12; // +12% on weekends
    }

    // ========================================
    // OCCUPANCY-BASED PRICING (Demand)
    // ========================================
    const maxCapacity = 50;
    const occupancyRate = 1 - (hotel.availableRooms / maxCapacity);

    if (occupancyRate > 0.9) {
      priceMultiplier += 0.25; // +25% when >90% full
    } else if (occupancyRate > 0.75) {
      priceMultiplier += 0.15; // +15% when >75% full
    } else if (occupancyRate > 0.50) {
      priceMultiplier += 0.08; // +8% when >50% full
    } else if (occupancyRate < 0.30) {
      priceMultiplier -= 0.10; // -10% when <30% full (promotional)
    }

    // ========================================
    // TIME-BASED PRICING (Minor adjustments)
    // ========================================
    // Prime booking hours (lunch & evening): +3-5%
    if ((hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 22)) {
      priceMultiplier += 0.04; // +4% during peak booking
    }

    // Late night deals (midnight-6 AM): -5-8%
    if (hour >= 0 && hour <= 6) {
      priceMultiplier -= 0.06; // -6% late night
    }

    // ========================================
    // RANDOM MARKET FLUCTUATION (Small)
    // ========================================
    // Realistic ±3-5% random variation
    const randomFluctuation = (Math.random() - 0.5) * 0.08; // ±4% max
    priceMultiplier += randomFluctuation;

    // Calculate new price from BASE price (not current price!)
    const newPrice = Math.round(basePrice * priceMultiplier);

    // Ensure price stays within reasonable bounds (70% to 150% of base)
    const minPrice = Math.round(basePrice * 0.70);
    const maxPrice = Math.round(basePrice * 1.50);

    return Math.max(minPrice, Math.min(newPrice, maxPrice));
  }

  /**
   * Simulate room bookings and check-outs (more conservative)
   */
  simulateRoomActivity(currentRooms) {
    // More realistic booking rates (0-2 rooms, not 0-5)
    const bookings = Math.floor(Math.random() * 3); // 0, 1, or 2 rooms

    // Check-outs/cancellations (20% chance for 1-2 rooms)
    const checkouts = Math.random() < 0.20 ? Math.floor(Math.random() * 2) + 1 : 0;

    const newRooms = currentRooms - bookings + checkouts;

    // Ensure rooms stay within realistic bounds (0-50)
    return Math.max(0, Math.min(newRooms, 50));
  }

  /**
   * Update a single hotel's price and availability
   */
  async updateHotel(hotel) {
    try {
      // Use basePrice if available, otherwise use current price as base
      const basePrice = hotel.basePrice || hotel.pricePerNight;
      const oldPrice = hotel.pricePerNight;
      const oldRooms = hotel.availableRooms;

      // Calculate new price from BASE price
      const newPrice = this.calculateDynamicPrice(basePrice, hotel);

      // Simulate room activity
      const newRooms = this.simulateRoomActivity(oldRooms);

      // Only update if there's a meaningful change
      if (newPrice !== oldPrice || newRooms !== oldRooms) {
        const updateData = {
          basePrice: basePrice, // Store base price if not exists
          pricePerNight: newPrice,
          availableRooms: newRooms
        };

        await axios.put(`${this.hotelServiceUrl}/${hotel._id}`, updateData);

        // Log the change
        const priceChange = newPrice - oldPrice;
        const priceIcon = priceChange > 0 ? '📈' : priceChange < 0 ? '📉' : '➡️';
        const pricePercent = oldPrice > 0 ? ((priceChange / oldPrice) * 100).toFixed(1) : 0;

        console.log(
          `${priceIcon} ${hotel.name.substring(0, 25).padEnd(25)} | ` +
          `$${oldPrice} → $${newPrice} (${pricePercent > 0 ? '+' : ''}${pricePercent}%) | ` +
          `Rooms: ${oldRooms} → ${newRooms}`
        );

        return true;
      }

      return false;
    } catch (error) {
      console.error(`❌ Failed to update ${hotel.name}:`, error.message);
      return false;
    }
  }

  /**
   * Sync all hotels
   */
  async syncAllHotels() {
    try {
      // Fetch all hotels
      const response = await axios.get(this.hotelServiceUrl);
      const hotels = response.data.data;

      if (!hotels || hotels.length === 0) {
        console.log('⚠️  No hotels found to sync');
        return;
      }

      console.log(`\n🔄 Syncing ${hotels.length} hotels...`);

      // Update each hotel
      const updatePromises = hotels.map(hotel => this.updateHotel(hotel));
      const results = await Promise.all(updatePromises);

      // Count successful updates
      const updatedCount = results.filter(r => r === true).length;

      console.log(`✅ Sync complete: ${updatedCount}/${hotels.length} hotels updated`);
    } catch (error) {
      console.error('❌ Sync error:', error.message);
    }
  }

  /**
   * Start the sync service
   */
  start() {
    console.log('🏨 Hotel Real-Time Sync Service Started (REALISTIC PRICING)');
    console.log(`📊 Syncing every ${this.syncInterval / 1000} seconds`);
    console.log(`💰 Price range: 70% - 150% of base price`);
    console.log(`📈 Typical fluctuation: ±5-10% per sync`);
    console.log('─'.repeat(80));

    // Initial sync
    this.syncAllHotels();

    // Schedule periodic syncs
    setInterval(() => {
      this.syncAllHotels();
    }, this.syncInterval);
  }
}

// Start the service
const syncService = new HotelSyncService();
syncService.start();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Hotel sync service stopped');
  process.exit(0);
});
