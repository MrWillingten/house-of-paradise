#!/bin/bash

# Hotel Database Seeding Script
# Quick-start script for seeding the database with 15,000+ hotels

echo "=================================================="
echo "  Hotel Database Seeding Script"
echo "=================================================="
echo ""

# Check if MongoDB is running
echo "Checking MongoDB connection..."

if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.adminCommand('ping')" --quiet 2>/dev/null; then
        echo "✓ MongoDB is running"
    else
        echo "✗ MongoDB is not running or not accessible"
        echo ""
        echo "Please start MongoDB first:"
        echo "  - Local: mongod"
        echo "  - Docker: docker-compose up -d mongodb"
        exit 1
    fi
elif command -v mongo &> /dev/null; then
    if mongo --eval "db.adminCommand('ping')" --quiet 2>/dev/null; then
        echo "✓ MongoDB is running"
    else
        echo "✗ MongoDB is not running or not accessible"
        echo ""
        echo "Please start MongoDB first:"
        echo "  - Local: mongod"
        echo "  - Docker: docker-compose up -d mongodb"
        exit 1
    fi
else
    echo "⚠ MongoDB client not found, skipping connection check"
fi

echo ""
echo "Starting seeding process..."
echo "This will take approximately 2-5 minutes"
echo ""

# Run the seeding script
node seed-real-hotels.js

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "=================================================="
    echo "  ✓ Seeding completed successfully!"
    echo "=================================================="
    echo ""
    echo "Next steps:"
    echo "  1. Start the hotel service: npm start"
    echo "  2. Test API: curl http://localhost:3001/api/hotels"
    echo "  3. View stats: http://localhost:3001/api/hotels?limit=1"
    echo ""
else
    echo ""
    echo "=================================================="
    echo "  ✗ Seeding failed"
    echo "=================================================="
    echo ""
    echo "Check the error messages above for details"
    exit 1
fi
