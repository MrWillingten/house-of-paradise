/**
 * AI Training Dataset for Smart Search
 *
 * Format: { query, expectedType, expectedResult }
 * This dataset trains the AI to understand human language patterns
 */

module.exports = {
  // ==================== TRIP SEARCHES ====================
  tripPatterns: [
    // From X to Y patterns
    { query: "from Tunisia to Japan", type: "trip", from: "Tunisia", to: "Japan" },
    { query: "I'm from Tunisia and I wanna go to Japan", type: "trip", from: "Tunisia", to: "Japan" },
    { query: "Tunisia to Japan", type: "trip", from: "Tunisia", to: "Japan" },
    { query: "fly from Paris to New York", type: "trip", from: "France", to: "United States" },
    { query: "Paris to New York flight", type: "trip", from: "France", to: "United States" },
    { query: "travel from Morocco to Spain", type: "trip", from: "Morocco", to: "Spain" },
    { query: "going from London to Dubai", type: "trip", from: "United Kingdom", to: "United Arab Emirates" },
    { query: "trip from India to Thailand", type: "trip", from: "India", to: "Thailand" },

    // "I want to go to" patterns (TRIP - single destination)
    { query: "I wanna go to Canada", type: "trip", from: null, to: "Canada" },
    { query: "I want to go to Japan", type: "trip", from: null, to: "Japan" },
    { query: "I want to visit Paris", type: "trip", from: null, to: "France" },
    { query: "I want to travel to Australia", type: "trip", from: null, to: "Australia" },
    { query: "take me to Tokyo", type: "trip", from: null, to: "Japan" },
    { query: "going to Italy", type: "trip", from: null, to: "Italy" },
    { query: "heading to Brazil", type: "trip", from: null, to: "Brazil" },
    { query: "traveling to Mexico", type: "trip", from: null, to: "Mexico" },
    { query: "visit Greece", type: "trip", from: null, to: "Greece" },
    { query: "go to Switzerland", type: "trip", from: null, to: "Switzerland" },
    { query: "fly to Singapore", type: "trip", from: null, to: "Singapore" },
    { query: "trip to Vietnam", type: "trip", from: null, to: "Vietnam" },

    // Flight patterns
    { query: "flights to Dubai", type: "trip", from: null, to: "United Arab Emirates" },
    { query: "plane tickets to London", type: "trip", from: null, to: "United Kingdom" },
    { query: "book flight to Germany", type: "trip", from: null, to: "Germany" },

    // Travel patterns
    { query: "travel to Egypt", type: "trip", from: null, to: "Egypt" },
    { query: "journey to China", type: "trip", from: null, to: "China" },
    { query: "relocate to Netherlands", type: "trip", from: null, to: "Netherlands" },

  ],

  // ==================== HOTEL SEARCHES ====================
  hotelPatterns: [
    // "hotel in" patterns
    { query: "hotel in Paris", type: "hotel", location: "France", hotelName: null },
    { query: "hotels in Tokyo", type: "hotel", location: "Japan", hotelName: null },
    { query: "hotel in New York", type: "hotel", location: "United States", hotelName: null },
    { query: "find hotel in Dubai", type: "hotel", location: "United Arab Emirates", hotelName: null },
    { query: "book hotel in London", type: "hotel", location: "United Kingdom", hotelName: null },

    // "stay in/at" patterns
    { query: "stay in Barcelona", type: "hotel", location: "Spain", hotelName: null },
    { query: "stay at Tokyo", type: "hotel", location: "Japan", hotelName: null },
    { query: "where to stay in Rome", type: "hotel", location: "Italy", hotelName: null },
    { query: "accommodation in Sydney", type: "hotel", location: "Australia", hotelName: null },
    { query: "place to stay in Bangkok", type: "hotel", location: "Thailand", hotelName: null },

    // Specific hotel name patterns
    { query: "Grand Paradise Hotel in Paris", type: "hotel", location: "France", hotelName: "Grand Paradise Hotel" },
    { query: "Hilton in Tokyo", type: "hotel", location: "Japan", hotelName: "Hilton" },
    { query: "Marriott in New York", type: "hotel", location: "United States", hotelName: "Marriott" },
    { query: "I want to go to Grand Palace Hotel in London", type: "hotel", location: "United Kingdom", hotelName: "Grand Palace Hotel" },
    { query: "book Ritz Carlton in Paris", type: "hotel", location: "France", hotelName: "Ritz Carlton" },

    // Just location (defaults to hotel)
    { query: "Paris", type: "hotel", location: "France", hotelName: null },
    { query: "Tokyo", type: "hotel", location: "Japan", hotelName: null },
    { query: "Dubai", type: "hotel", location: "United Arab Emirates", hotelName: null },
    { query: "New York", type: "hotel", location: "United States", hotelName: null },

    // Resort/accommodation patterns
    { query: "resort in Maldives", type: "hotel", location: "Maldives", hotelName: null },
    { query: "beach resort in Thailand", type: "hotel", location: "Thailand", hotelName: null },
    { query: "luxury resort in Bali", type: "hotel", location: "Indonesia", hotelName: null },
  ],

  // ==================== DECISION RULES ====================
  decisionRules: {
    // Strong trip indicators (if found, it's definitely a trip)
    strongTripKeywords: [
      'from', 'fly', 'flight', 'plane', 'ticket',
      'travel to', 'going to', 'visit', 'trip to',
      'wanna go', 'want to go', 'heading to'
    ],

    // Strong hotel indicators (if found, it's definitely a hotel)
    strongHotelKeywords: [
      'hotel', 'stay', 'accommodation', 'resort',
      'lodge', 'inn', 'room', 'book room',
      'hotel in', 'stay in', 'stay at'
    ],

    // Weak indicators (context-dependent)
    weakTripKeywords: ['go', 'visit'],
    weakHotelKeywords: ['in', 'at'],

    // Default behavior
    // - If has "from...to" or "to X" → Trip
    // - If has "in X" or "at X" → Hotel
    // - Single location with no other keywords → Hotel
  }
};
