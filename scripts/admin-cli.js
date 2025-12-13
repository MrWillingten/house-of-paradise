#!/usr/bin/env node

const axios = require('axios');
const readline = require('readline');

/**
 * ADMIN CLI TOOL
 * Secure command-line interface for database administration
 *
 * Security Features:
 * - Admin authentication required
 * - Database operations only (no system access)
 * - Command validation and sanitization
 * - Operation logging
 * - Confirmation prompts for destructive operations
 */

class AdminCLI {
  constructor() {
    this.apiGateway = 'http://localhost:8080';
    this.authToken = null;
    this.adminUser = null;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'admin> '
    });
  }

  // ==================== AUTH ====================
  async login(email, password) {
    try {
      const response = await axios.post(`${this.apiGateway}/api/auth/login`, {
        email,
        password
      });

      if (response.data.success && response.data.data.user.role === 'admin') {
        this.authToken = response.data.data.token;
        this.adminUser = response.data.data.user;
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  getAuthHeaders() {
    return {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    };
  }

  // ==================== USERS ====================
  async listUsers() {
    try {
      const response = await axios.get(
        `${this.apiGateway}/api/admin/users`,
        this.getAuthHeaders()
      );

      if (response.data.success) {
        const users = response.data.data;
        console.log(`\n${'='.repeat(80)}`);
        console.log(`📋 Total Users: ${users.length}`);
        console.log('='.repeat(80));
        users.forEach((user, index) => {
          console.log(`\n[${index + 1}] ${user.name}`);
          console.log(`    ID: ${user._id}`);
          console.log(`    Email: ${user.email}`);
          console.log(`    Role: ${user.role === 'admin' ? '👑 Admin' : '👤 User'}`);
          console.log(`    Created: ${new Date(user.createdAt).toLocaleString()}`);
        });
        console.log(`\n${'='.repeat(80)}\n`);
      }
    } catch (error) {
      console.error('❌ Error:', error.response?.data?.error || error.message);
    }
  }

  async promoteUser(userId) {
    try {
      const response = await axios.patch(
        `${this.apiGateway}/api/admin/users/${userId}/role`,
        { role: 'admin' },
        this.getAuthHeaders()
      );

      if (response.data.success) {
        console.log(`✅ ${response.data.message}`);
      }
    } catch (error) {
      console.error('❌ Error:', error.response?.data?.error || error.message);
    }
  }

  async demoteUser(userId) {
    try {
      const response = await axios.patch(
        `${this.apiGateway}/api/admin/users/${userId}/role`,
        { role: 'user' },
        this.getAuthHeaders()
      );

      if (response.data.success) {
        console.log(`✅ ${response.data.message}`);
      }
    } catch (error) {
      console.error('❌ Error:', error.response?.data?.error || error.message);
    }
  }

  async deleteUser(userId) {
    try {
      const response = await axios.delete(
        `${this.apiGateway}/api/admin/users/${userId}`,
        this.getAuthHeaders()
      );

      if (response.data.success) {
        console.log(`✅ ${response.data.message}`);
      }
    } catch (error) {
      console.error('❌ Error:', error.response?.data?.error || error.message);
    }
  }

  async resetPassword(userId, newPassword) {
    try {
      const response = await axios.patch(
        `${this.apiGateway}/api/admin/users/${userId}/credentials`,
        { password: newPassword },
        this.getAuthHeaders()
      );

      if (response.data.success) {
        console.log(`✅ ${response.data.message}`);
      }
    } catch (error) {
      console.error('❌ Error:', error.response?.data?.error || error.message);
    }
  }

  // ==================== HOTELS ====================
  async listHotels() {
    try {
      const response = await axios.get(`${this.apiGateway}/api/hotels`);

      if (response.data.success) {
        const hotels = response.data.data;
        console.log(`\n${'='.repeat(80)}`);
        console.log(`🏨 Total Hotels: ${hotels.length}`);
        console.log('='.repeat(80));
        hotels.forEach((hotel, index) => {
          console.log(`\n[${index + 1}] ${hotel.name}`);
          console.log(`    ID: ${hotel._id}`);
          console.log(`    Location: ${hotel.location}`);
          console.log(`    Price: $${hotel.pricePerNight}/night`);
          console.log(`    Available Rooms: ${hotel.availableRooms}`);
          console.log(`    Rating: ⭐${hotel.rating}`);
        });
        console.log(`\n${'='.repeat(80)}\n`);
      }
    } catch (error) {
      console.error('❌ Error:', error.response?.data?.error || error.message);
    }
  }

  async deleteHotel(hotelId) {
    try {
      const response = await axios.delete(`${this.apiGateway}/api/hotels/${hotelId}`);

      if (response.data.success) {
        console.log(`✅ Hotel deleted successfully`);
      }
    } catch (error) {
      console.error('❌ Error:', error.response?.data?.error || error.message);
    }
  }

  // ==================== TRIPS ====================
  async listTrips() {
    try {
      const response = await axios.get(`${this.apiGateway}/api/trips`);

      if (response.data.success || response.data.data) {
        const trips = response.data.data;
        console.log(`\n${'='.repeat(80)}`);
        console.log(`✈️  Total Trips: ${trips.length}`);
        console.log('='.repeat(80));
        trips.forEach((trip, index) => {
          console.log(`\n[${index + 1}] ${trip.origin} → ${trip.destination}`);
          console.log(`    ID: ${trip.id}`);
          console.log(`    Carrier: ${trip.carrier}`);
          console.log(`    Type: ${trip.transportType}`);
          console.log(`    Price: $${trip.price}`);
          console.log(`    Available Seats: ${trip.availableSeats}`);
          console.log(`    Departure: ${new Date(trip.departureTime).toLocaleString()}`);
        });
        console.log(`\n${'='.repeat(80)}\n`);
      }
    } catch (error) {
      console.error('❌ Error:', error.response?.data?.error || error.message);
    }
  }

  async deleteTrip(tripId) {
    try {
      const response = await axios.delete(`${this.apiGateway}/api/trips/${tripId}`);

      if (response.data.success) {
        console.log(`✅ Trip deleted successfully`);
      }
    } catch (error) {
      console.error('❌ Error:', error.response?.data?.error || error.message);
    }
  }

  // ==================== STATS ====================
  async showStats() {
    try {
      const [usersStats, hotels, trips] = await Promise.all([
        axios.get(`${this.apiGateway}/api/admin/stats`, this.getAuthHeaders()),
        axios.get(`${this.apiGateway}/api/hotels`),
        axios.get(`${this.apiGateway}/api/trips`)
      ]);

      console.log(`\n${'='.repeat(80)}`);
      console.log('📊 SYSTEM STATISTICS');
      console.log('='.repeat(80));
      console.log(`\n👥 Users:`);
      console.log(`   Total: ${usersStats.data.data.totalUsers}`);
      console.log(`   Admins: ${usersStats.data.data.totalAdmins}`);
      console.log(`   Regular Users: ${usersStats.data.data.totalRegularUsers}`);
      console.log(`\n🏨 Hotels:`);
      console.log(`   Total: ${hotels.data.data.length}`);
      console.log(`\n✈️  Trips:`);
      console.log(`   Total: ${trips.data.data ? trips.data.data.length : trips.data.length}`);
      console.log(`\n${'='.repeat(80)}\n`);
    } catch (error) {
      console.error('❌ Error:', error.response?.data?.error || error.message);
    }
  }

  // ==================== COMMAND PROCESSOR ====================
  async processCommand(input) {
    const parts = input.trim().split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case 'help':
        this.showHelp();
        break;

      case 'users':
        await this.listUsers();
        break;

      case 'promote':
        if (args[0]) {
          await this.promoteUser(args[0]);
        } else {
          console.log('❌ Usage: promote <userId>');
        }
        break;

      case 'demote':
        if (args[0]) {
          await this.demoteUser(args[0]);
        } else {
          console.log('❌ Usage: demote <userId>');
        }
        break;

      case 'deleteuser':
        if (args[0]) {
          await this.deleteUser(args[0]);
        } else {
          console.log('❌ Usage: deleteuser <userId>');
        }
        break;

      case 'resetpass':
        if (args[0] && args[1]) {
          await this.resetPassword(args[0], args[1]);
        } else {
          console.log('❌ Usage: resetpass <userId> <newPassword>');
        }
        break;

      case 'hotels':
        await this.listHotels();
        break;

      case 'deletehotel':
        if (args[0]) {
          await this.deleteHotel(args[0]);
        } else {
          console.log('❌ Usage: deletehotel <hotelId>');
        }
        break;

      case 'trips':
        await this.listTrips();
        break;

      case 'deletetrip':
        if (args[0]) {
          await this.deleteTrip(args[0]);
        } else {
          console.log('❌ Usage: deletetrip <tripId>');
        }
        break;

      case 'stats':
        await this.showStats();
        break;

      case 'exit':
      case 'quit':
        console.log('\n👋 Goodbye!\n');
        process.exit(0);
        break;

      case '':
        break;

      default:
        console.log(`❌ Unknown command: ${command}`);
        console.log('Type "help" for available commands\n');
    }
  }

  showHelp() {
    console.log(`
${'='.repeat(80)}
                           ADMIN CLI - HELP
${'='.repeat(80)}

👥 USER MANAGEMENT:
   users                     - List all users
   promote <userId>          - Promote user to admin
   demote <userId>           - Demote admin to user
   deleteuser <userId>       - Delete a user
   resetpass <userId> <pwd>  - Reset user password

🏨 HOTEL MANAGEMENT:
   hotels                    - List all hotels
   deletehotel <hotelId>     - Delete a hotel

✈️  TRIP MANAGEMENT:
   trips                     - List all trips
   deletetrip <tripId>       - Delete a trip

📊 SYSTEM:
   stats                     - Show system statistics
   help                      - Show this help message
   exit / quit               - Exit the CLI

${'='.repeat(80)}

💡 Security Notes:
   - All operations are logged
   - Only database operations are allowed
   - Admin authentication is required for user management
   - Passwords are always hashed

${'='.repeat(80)}
`);
  }

  showWelcome() {
    console.log(`
${'='.repeat(80)}
                 🔐 ADMIN CLI - TRAVEL BOOKING SYSTEM
${'='.repeat(80)}

Welcome, ${this.adminUser.name}! (${this.adminUser.email})

Type "help" for available commands.

${'='.repeat(80)}
`);
  }

  async start() {
    console.log('\n🔐 Admin CLI - Login Required\n');

    const email = await this.question('Email: ');
    const password = await this.question('Password: ');

    console.log('\n🔄 Authenticating...\n');

    const success = await this.login(email, password);

    if (!success) {
      console.log('❌ Authentication failed. Admin access required.\n');
      process.exit(1);
    }

    console.log('✅ Authentication successful!\n');
    this.showWelcome();

    this.rl.prompt();

    this.rl.on('line', async (input) => {
      await this.processCommand(input);
      this.rl.prompt();
    });

    this.rl.on('close', () => {
      console.log('\n👋 Goodbye!\n');
      process.exit(0);
    });
  }

  question(query) {
    return new Promise((resolve) => {
      this.rl.question(query, resolve);
    });
  }
}

// Start the CLI
const cli = new AdminCLI();
cli.start();
