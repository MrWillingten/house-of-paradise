/**
 * IP-Based Location Detection Service
 *
 * Detects user's country from their IP address for smart trip search
 * Uses ip-api.com (free, no API key needed, 45 requests/min)
 */

const axios = require('axios');

class IPLocationService {
  constructor() {
    // Cache to avoid repeated API calls for same IP
    this.cache = new Map();
    this.cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Get user's location from IP address
   * @param {string} ip - User's IP address
   * @returns {Object} Location data with country, city, countryCode
   */
  async getLocationFromIP(ip) {
    // Skip local/private IPs
    if (this.isPrivateIP(ip)) {
      console.log(`⚠️  Private IP detected (${ip}), using default location`);
      return {
        country: null,
        countryCode: null,
        city: null,
        region: null,
        isPrivate: true
      };
    }

    // Check cache
    if (this.cache.has(ip)) {
      const cached = this.cache.get(ip);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log(`✅ Using cached location for IP: ${ip}`);
        return cached.data;
      }
    }

    try {
      // Call free IP geolocation API (ip-api.com)
      const response = await axios.get(`http://ip-api.com/json/${ip}`, {
        params: {
          fields: 'status,country,countryCode,regionName,city,lat,lon'
        },
        timeout: 3000
      });

      if (response.data.status === 'success') {
        const locationData = {
          country: response.data.country,
          countryCode: response.data.countryCode,
          city: response.data.city,
          region: response.data.regionName,
          lat: response.data.lat,
          lon: response.data.lon,
          isPrivate: false
        };

        // Cache the result
        this.cache.set(ip, {
          data: locationData,
          timestamp: Date.now()
        });

        console.log(`🌍 Detected location for IP ${ip}: ${locationData.country}`);
        return locationData;
      } else {
        console.error(`❌ IP geolocation failed for ${ip}:`, response.data);
        return this.getDefaultLocation();
      }
    } catch (error) {
      console.error(`❌ Error getting location for IP ${ip}:`, error.message);
      return this.getDefaultLocation();
    }
  }

  /**
   * Extract IP from request (handles proxies and forwarded headers)
   */
  getClientIP(req) {
    // Try to get real IP from various headers (in case of proxies)
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      // x-forwarded-for can contain multiple IPs, take the first one
      return forwarded.split(',')[0].trim();
    }

    return (
      req.headers['x-real-ip'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.ip ||
      '0.0.0.0'
    );
  }

  /**
   * Check if IP is private/local
   */
  isPrivateIP(ip) {
    // Remove IPv6 prefix if present
    ip = ip.replace(/^::ffff:/, '');

    // Local IPs
    if (ip === '127.0.0.1' || ip === 'localhost' || ip === '::1') {
      return true;
    }

    // Private IP ranges
    const privateRanges = [
      /^10\./,                     // 10.0.0.0 - 10.255.255.255
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0 - 172.31.255.255
      /^192\.168\./,               // 192.168.0.0 - 192.168.255.255
      /^::1$/,                     // IPv6 localhost
      /^fe80:/,                    // IPv6 link-local
      /^fc00:/,                    // IPv6 unique local
      /^fd00:/                     // IPv6 unique local
    ];

    return privateRanges.some(range => range.test(ip));
  }

  /**
   * Get default location when IP detection fails
   */
  getDefaultLocation() {
    return {
      country: null,
      countryCode: null,
      city: null,
      region: null,
      isPrivate: false,
      isFallback: true
    };
  }

  /**
   * Clear cache (for testing or maintenance)
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️  IP location cache cleared');
  }
}

module.exports = new IPLocationService();
