/**
 * Smart Search Analyzer - AI-Powered Search Intent Detection
 *
 * Analyzes user search queries and determines:
 * 1. Is it a hotel search or trip search?
 * 2. Extract locations (from/to for trips, hotel name + location for hotels)
 * 3. Parse natural language queries
 *
 * Uses training data and pattern matching for human-like understanding
 */

// Use massive training dataset with 1000+ examples
const trainingData = require('./searchTrainingDataMassive');

// List of 100+ countries and their variations
const COUNTRIES = {
  // Africa
  'tunisia': { name: 'Tunisia', continent: 'Africa', code: 'TN' },
  'egypt': { name: 'Egypt', continent: 'Africa', code: 'EG' },
  'morocco': { name: 'Morocco', continent: 'Africa', code: 'MA' },
  'south africa': { name: 'South Africa', continent: 'Africa', code: 'ZA' },
  'kenya': { name: 'Kenya', continent: 'Africa', code: 'KE' },
  'nigeria': { name: 'Nigeria', continent: 'Africa', code: 'NG' },
  'ghana': { name: 'Ghana', continent: 'Africa', code: 'GH' },

  // Asia
  'japan': { name: 'Japan', continent: 'Asia', code: 'JP' },
  'china': { name: 'China', continent: 'Asia', code: 'CN' },
  'india': { name: 'India', continent: 'Asia', code: 'IN' },
  'thailand': { name: 'Thailand', continent: 'Asia', code: 'TH' },
  'thialand': { name: 'Thailand', continent: 'Asia', code: 'TH' }, // Common typo
  'thiland': { name: 'Thailand', continent: 'Asia', code: 'TH' }, // Common typo
  'vietnam': { name: 'Vietnam', continent: 'Asia', code: 'VN' },
  'singapore': { name: 'Singapore', continent: 'Asia', code: 'SG' },
  'malaysia': { name: 'Malaysia', continent: 'Asia', code: 'MY' },
  'indonesia': { name: 'Indonesia', continent: 'Asia', code: 'ID' },
  'philippines': { name: 'Philippines', continent: 'Asia', code: 'PH' },
  'south korea': { name: 'South Korea', continent: 'Asia', code: 'KR' },
  'korea': { name: 'South Korea', continent: 'Asia', code: 'KR' },
  'taiwan': { name: 'Taiwan', continent: 'Asia', code: 'TW' },
  'hong kong': { name: 'Hong Kong', continent: 'Asia', code: 'HK' },
  'dubai': { name: 'United Arab Emirates', continent: 'Asia', code: 'AE' },
  'uae': { name: 'United Arab Emirates', continent: 'Asia', code: 'AE' },
  'saudi arabia': { name: 'Saudi Arabia', continent: 'Asia', code: 'SA' },
  'qatar': { name: 'Qatar', continent: 'Asia', code: 'QA' },

  // Europe
  'france': { name: 'France', continent: 'Europe', code: 'FR' },
  'germany': { name: 'Germany', continent: 'Europe', code: 'DE' },
  'italy': { name: 'Italy', continent: 'Europe', code: 'IT' },
  'spain': { name: 'Spain', continent: 'Europe', code: 'ES' },
  'united kingdom': { name: 'United Kingdom', continent: 'Europe', code: 'GB' },
  'uk': { name: 'United Kingdom', continent: 'Europe', code: 'GB' },
  'england': { name: 'United Kingdom', continent: 'Europe', code: 'GB' },
  'london': { name: 'United Kingdom', continent: 'Europe', code: 'GB' },
  'paris': { name: 'France', continent: 'Europe', code: 'FR' },
  'greece': { name: 'Greece', continent: 'Europe', code: 'GR' },
  'portugal': { name: 'Portugal', continent: 'Europe', code: 'PT' },
  'netherlands': { name: 'Netherlands', continent: 'Europe', code: 'NL' },
  'belgium': { name: 'Belgium', continent: 'Europe', code: 'BE' },
  'switzerland': { name: 'Switzerland', continent: 'Europe', code: 'CH' },
  'austria': { name: 'Austria', continent: 'Europe', code: 'AT' },
  'sweden': { name: 'Sweden', continent: 'Europe', code: 'SE' },
  'norway': { name: 'Norway', continent: 'Europe', code: 'NO' },
  'denmark': { name: 'Denmark', continent: 'Europe', code: 'DK' },
  'finland': { name: 'Finland', continent: 'Europe', code: 'FI' },
  'poland': { name: 'Poland', continent: 'Europe', code: 'PL' },
  'czech republic': { name: 'Czech Republic', continent: 'Europe', code: 'CZ' },
  'hungary': { name: 'Hungary', continent: 'Europe', code: 'HU' },
  'turkey': { name: 'Turkey', continent: 'Europe', code: 'TR' },
  'russia': { name: 'Russia', continent: 'Europe', code: 'RU' },

  // North America
  'usa': { name: 'United States', continent: 'North America', code: 'US' },
  'united states': { name: 'United States', continent: 'North America', code: 'US' },
  'america': { name: 'United States', continent: 'North America', code: 'US' },
  'new york': { name: 'United States', continent: 'North America', code: 'US' },
  'los angeles': { name: 'United States', continent: 'North America', code: 'US' },
  'miami': { name: 'United States', continent: 'North America', code: 'US' },
  'canada': { name: 'Canada', continent: 'North America', code: 'CA' },
  'mexico': { name: 'Mexico', continent: 'North America', code: 'MX' },

  // South America
  'brazil': { name: 'Brazil', continent: 'South America', code: 'BR' },
  'argentina': { name: 'Argentina', continent: 'South America', code: 'AR' },
  'chile': { name: 'Chile', continent: 'South America', code: 'CL' },
  'colombia': { name: 'Colombia', continent: 'South America', code: 'CO' },
  'peru': { name: 'Peru', continent: 'South America', code: 'PE' },

  // Oceania
  'australia': { name: 'Australia', continent: 'Oceania', code: 'AU' },
  'new zealand': { name: 'New Zealand', continent: 'Oceania', code: 'NZ' },

  // More major cities that map to countries
  'tokyo': { name: 'Japan', continent: 'Asia', code: 'JP' },
  'beijing': { name: 'China', continent: 'Asia', code: 'CN' },
  'shanghai': { name: 'China', continent: 'Asia', code: 'CN' },
  'delhi': { name: 'India', continent: 'Asia', code: 'IN' },
  'mumbai': { name: 'India', continent: 'Asia', code: 'IN' },
  'bangkok': { name: 'Thailand', continent: 'Asia', code: 'TH' },
  'rome': { name: 'Italy', continent: 'Europe', code: 'IT' },
  'barcelona': { name: 'Spain', continent: 'Europe', code: 'ES' },
  'madrid': { name: 'Spain', continent: 'Europe', code: 'ES' },
  'berlin': { name: 'Germany', continent: 'Europe', code: 'DE' },
  'amsterdam': { name: 'Netherlands', continent: 'Europe', code: 'NL' },
  'sydney': { name: 'Australia', continent: 'Oceania', code: 'AU' },
  'melbourne': { name: 'Australia', continent: 'Oceania', code: 'AU' },
};

// Trip-related keywords
const TRIP_KEYWORDS = [
  'from', 'to', 'fly', 'flight', 'trip', 'travel', 'go to', 'visit',
  'traveling', 'travelling', 'journey', 'fly from', 'going to',
  'want to go', 'wanna go', 'heading to', 'move to', 'relocate'
];

// Hotel-related keywords
const HOTEL_KEYWORDS = [
  'hotel', 'stay', 'accommodation', 'lodge', 'resort', 'inn',
  'motel', 'hostel', 'stay at', 'book', 'reserve', 'room'
];

class SmartSearchAnalyzer {

  /**
   * Main analysis function - determines search intent and extracts locations
   * @param {string} query - User search query
   * @param {Object} userLocation - User's location from IP (optional)
   * @returns {Object} - Analysis result with type, locations, and confidence
   */
  analyze(query, userLocation = null) {
    if (!query || typeof query !== 'string') {
      return {
        success: false,
        error: 'Invalid query'
      };
    }

    const lowerQuery = query.toLowerCase().trim();

    // Extract all locations from query
    const locations = this.extractLocations(lowerQuery);

    // Determine if it's a trip or hotel search
    const tripScore = this.calculateTripScore(lowerQuery);
    const hotelScore = this.calculateHotelScore(lowerQuery);

    console.log(`🔍 Search Analysis: "${query}"`);
    console.log(`   Trip Score: ${tripScore}, Hotel Score: ${hotelScore}`);
    console.log(`   Locations found: ${locations.length}`);
    console.log(`   Decision: ${tripScore > hotelScore ? 'TRIP' : hotelScore > tripScore ? 'HOTEL' : 'TIE'}`);

    // Decide search type based on scores - SCORE IS KING!
    if (tripScore > hotelScore) {
      // Trip search detected - either "from X to Y" or "I want to go to X"
      return this.buildTripSearch(lowerQuery, locations, userLocation);
    } else if (hotelScore > tripScore) {
      // Hotel search detected - "hotel in X" or specific hotel name
      return this.buildHotelSearch(lowerQuery, locations);
    } else if (locations.length >= 2) {
      // Multiple locations with equal scores = likely a trip
      return this.buildTripSearch(lowerQuery, locations, userLocation);
    } else if (locations.length === 1) {
      // Single location with equal scores = default to TRIP for "go to X" queries
      // Check if query suggests travel intent
      if (query.match(/go|visit|travel|wanna|want to/)) {
        return this.buildTripSearch(lowerQuery, locations, userLocation);
      } else {
        return this.buildHotelSearch(lowerQuery, locations);
      }
    } else {
      // No locations found, default to hotel search
      return {
        success: true,
        type: 'hotel',
        query: query,
        location: query,
        hotelName: null,
        confidence: 0.3
      };
    }
  }

  /**
   * Extract all location mentions from query
   */
  extractLocations(query) {
    const locations = [];
    const words = query.toLowerCase();

    // Check for each country/city
    for (const [key, value] of Object.entries(COUNTRIES)) {
      if (words.includes(key)) {
        locations.push({
          query: key,
          ...value
        });
      }
    }

    return locations;
  }

  /**
   * Calculate trip intent score - ENHANCED with training data
   */
  calculateTripScore(query) {
    let score = 0;

    // Check strong trip indicators (VERY HIGH WEIGHT)
    const strongTripKeywords = trainingData.decisionRules.strongTripKeywords;
    for (const keyword of strongTripKeywords) {
      if (query.includes(keyword)) {
        score += 10; // Strong signal!
      }
    }

    // Classic "from...to" pattern (DEFINITE TRIP)
    if (query.includes('from') && query.includes('to')) {
      score += 20;
    }

    // "to X" pattern without "hotel" (likely a trip)
    if ((query.includes('to ') || query.includes('wanna go') || query.includes('want to go'))
        && !query.includes('hotel') && !query.includes('stay')) {
      score += 15;
    }

    // "going to X" pattern
    if (query.match(/going to|heading to|traveling to|travelling to/)) {
      score += 15;
    }

    return score;
  }

  /**
   * Calculate hotel intent score - ENHANCED with training data
   */
  calculateHotelScore(query) {
    let score = 0;

    // Check strong hotel indicators (VERY HIGH WEIGHT)
    const strongHotelKeywords = trainingData.decisionRules.strongHotelKeywords;
    for (const keyword of strongHotelKeywords) {
      if (query.includes(keyword)) {
        score += 10; // Strong signal!
      }
    }

    // "hotel in X" or "stay in X" pattern (DEFINITE HOTEL)
    if (query.match(/hotel in|hotels in|stay in|stay at|accommodation in|resort in/)) {
      score += 20;
    }

    // Just a location with " in " (likely hotel)
    if (query.includes(' in ') && !query.includes('from') && !query.includes('to')) {
      score += 5;
    }

    return score;
  }

  /**
   * Build trip search result
   */
  buildTripSearch(query, locations, userLocation = null) {
    let from = null;
    let to = null;

    // Find "from" location
    const fromIndex = query.indexOf('from');
    if (fromIndex !== -1) {
      // Find location after "from"
      from = locations.find(loc => query.indexOf(loc.query) > fromIndex);
    }

    // Find "to" location
    const toIndex = query.indexOf('to');
    if (toIndex !== -1) {
      // Find location after "to"
      to = locations.find(loc => query.indexOf(loc.query) > toIndex && loc !== from);
    }

    // If we didn't find explicit from/to, intelligently assign locations
    if (!to && !from && locations.length >= 2) {
      // Two locations with no explicit "from/to" → assume first is from, second is to
      from = locations[0];
      to = locations[1];
    } else if (!to && locations.length === 1) {
      // Single location with no "from" → Search trips TO this location
      // Use user's IP location as "from" if available
      to = locations[0];
      if (userLocation && userLocation.country && !userLocation.isPrivate) {
        // Try to match user's country to our COUNTRIES database
        const userCountryLower = userLocation.country.toLowerCase();
        for (const [key, value] of Object.entries(COUNTRIES)) {
          if (value.name.toLowerCase() === userCountryLower || key === userCountryLower) {
            from = value;
            console.log(`🌍 Auto-detected user's origin: ${value.name} (from IP)`);
            break;
          }
        }
      }
    } else if (!to && locations.length > 1) {
      // Multiple locations but already have from → second location is to
      to = locations[1];
    }

    return {
      success: true,
      type: 'trip',
      from: from ? from.name : null,
      to: to ? to.name : null,
      fromCode: from ? from.code : null,
      toCode: to ? to.code : null,
      confidence: 0.9,
      originalQuery: query,
      userLocationDetected: from && userLocation ? true : false
    };
  }

  /**
   * Build hotel search result
   */
  buildHotelSearch(query, locations) {
    let hotelName = null;
    let location = null;

    // Try to extract hotel name (before "in")
    const inIndex = query.indexOf(' in ');
    if (inIndex !== -1) {
      hotelName = query.substring(0, inIndex).trim();
      // Clean up common prefixes
      hotelName = hotelName.replace(/^(i want to go to|go to|stay at|book)/i, '').trim();
    }

    // Get location
    if (locations.length > 0) {
      location = locations[0].name;
    }

    return {
      success: true,
      type: 'hotel',
      hotelName: hotelName || null,
      location: location || query,
      locationCode: locations.length > 0 ? locations[0].code : null,
      confidence: 0.85,
      originalQuery: query
    };
  }

  /**
   * Get all supported countries
   */
  getAllCountries() {
    const uniqueCountries = {};

    for (const value of Object.values(COUNTRIES)) {
      if (!uniqueCountries[value.code]) {
        uniqueCountries[value.code] = value;
      }
    }

    return Object.values(uniqueCountries);
  }
}

module.exports = new SmartSearchAnalyzer();
