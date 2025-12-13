#!/bin/bash
# Complete Setup Script - Run this when network is stable
# This will finish building and start all services with the CORS fix

echo "========================================="
echo " Travel Booking Microservices Setup"
echo " With CORS Fix Applied"
echo "========================================="
echo ""

# Step 1: Build all services
echo "📦 Step 1/4: Building all services..."
docker-compose build --parallel

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Check your network connection and try again."
    exit 1
fi

echo "✅ Build complete!"
echo ""

# Step 2: Start all services
echo "🚀 Step 2/4: Starting all containers..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Failed to start containers."
    exit 1
fi

echo "✅ Containers started!"
echo ""

# Step 3: Wait for services to be healthy
echo "⏳ Step 3/4: Waiting for services to be healthy..."
sleep 30

# Step 4: Verify services
echo "🔍 Step 4/4: Verifying services..."
echo ""

docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "========================================="
echo " Setup Complete!"
echo "========================================="
echo ""
echo "🎯 Next Steps:"
echo ""
echo "1. Test CORS Fix:"
echo "   curl -X POST http://localhost:8082/api/auth/login \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"email\":\"aminzou54@gmail.com\",\"password\":\"NewPass123!\"}'"
echo ""
echo "2. Start Frontend:"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "3. Open Browser:"
echo "   http://localhost:3000"
echo ""
echo "Your login credentials:"
echo "  Email: aminzou54@gmail.com"
echo "  Password: NewPass123!"
echo ""
echo "========================================="
