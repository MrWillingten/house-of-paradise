#!/bin/bash

API_URL="${1:-http://localhost:8080}"

echo "🧪 Testing Travel Booking Microservices API"
echo "API URL: $API_URL"
echo "==========================================="

# Health Check
echo ""
echo "1️⃣ Health Check"
curl -s "$API_URL/health" | jq '.'

# Create Hotel
echo ""
echo "2️⃣ Creating Hotel..."
HOTEL_RESPONSE=$(curl -s -X POST "$API_URL/api/hotels" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Grand Hotel Paris",
    "location": "Paris",
    "pricePerNight": 150,
    "availableRooms": 10,
    "rating": 4.5,
    "amenities": ["WiFi", "Pool", "Restaurant", "Gym"]
  }')
echo "$HOTEL_RESPONSE" | jq '.'
HOTEL_ID=$(echo "$HOTEL_RESPONSE" | jq -r '.data._id')
echo "Hotel ID: $HOTEL_ID"

# Get All Hotels
echo ""
echo "3️⃣ Getting All Hotels..."
curl -s "$API_URL/api/hotels" | jq '.'

# Create Trip
echo ""
echo "4️⃣ Creating Trip..."
TRIP_RESPONSE=$(curl -s -X POST "$API_URL/api/trips" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "Paris",
    "destination": "London",
    "departureTime": "2024-12-20T10:00:00",
    "arrivalTime": "2024-12-20T14:00:00",
    "transportType": "flight",
    "price": 200,
    "availableSeats": 50,
    "carrier": "Air France"
  }')
echo "$TRIP_RESPONSE" | jq '.'
TRIP_ID=$(echo "$TRIP_RESPONSE" | jq -r '.data.id')
echo "Trip ID: $TRIP_ID"

# Get All Trips
echo ""
echo "5️⃣ Getting All Trips..."
curl -s "$API_URL/api/trips" | jq '.'

# Create Hotel Booking
echo ""
echo "6️⃣ Creating Hotel Booking..."
HOTEL_BOOKING=$(curl -s -X POST "$API_URL/api/bookings" \
  -H "Content-Type: application/json" \
  -d "{
    \"hotelId\": \"$HOTEL_ID\",
    \"userId\": \"user123\",
    \"checkIn\": \"2024-12-20\",
    \"checkOut\": \"2024-12-22\",
    \"numberOfRooms\": 1
  }")
echo "$HOTEL_BOOKING" | jq '.'
BOOKING_ID=$(echo "$HOTEL_BOOKING" | jq -r '.data._id')

# Process Payment
echo ""
echo "7️⃣ Processing Payment..."
PAYMENT=$(curl -s -X POST "$API_URL/api/payments" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"user123\",
    \"booking_type\": \"hotel\",
    \"booking_id\": \"$BOOKING_ID\",
    \"amount\": 300,
    \"payment_method\": \"card\"
  }")
echo "$PAYMENT" | jq '.'

# Complete Booking (Combined Operation)
echo ""
echo "8️⃣ Complete Booking with Payment..."
COMPLETE=$(curl -s -X POST "$API_URL/api/complete-booking" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"hotel\",
    \"bookingData\": {
      \"hotelId\": \"$HOTEL_ID\",
      \"userId\": \"user456\",
      \"checkIn\": \"2024-12-25\",
      \"checkOut\": \"2024-12-27\",
      \"numberOfRooms\": 2
    },
    \"paymentData\": {
      \"user_id\": \"user456\",
      \"payment_method\": \"paypal\"
    }
  }")
echo "$COMPLETE" | jq '.'

echo ""
echo "✅ All tests completed!"