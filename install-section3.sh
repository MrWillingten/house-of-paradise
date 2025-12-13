#!/bin/bash

echo "🚀 Installing Section 3: Real-Time Availability & Pricing"
echo "========================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Install backend dependencies
echo -e "${BLUE}📦 Installing backend dependencies (Socket.IO)...${NC}"
cd hotel-service
npm install socket.io@^4.7.2
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend dependencies installed!${NC}"
else
    echo -e "${YELLOW}⚠️  Please run 'npm install' manually in hotel-service directory${NC}"
fi
cd ..

echo ""

# Install frontend dependencies
echo -e "${BLUE}📦 Installing frontend dependencies (Socket.IO Client)...${NC}"
cd frontend
npm install socket.io-client@^4.7.2
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed!${NC}"
else
    echo -e "${YELLOW}⚠️  Please run 'npm install' manually in frontend directory${NC}"
fi
cd ..

echo ""
echo -e "${GREEN}✅ Installation Complete!${NC}"
echo ""
echo "📚 Next Steps:"
echo "=============="
echo ""
echo "1. Start MongoDB (if not already running)"
echo "   ${BLUE}mongod${NC}"
echo ""
echo "2. Start Hotel Service (in new terminal):"
echo "   ${BLUE}cd hotel-service && npm start${NC}"
echo "   ${YELLOW}(Watch for 'WebSocket server ready' message)${NC}"
echo ""
echo "3. Start Frontend (in another terminal):"
echo "   ${BLUE}cd frontend && npm start${NC}"
echo ""
echo "4. Test Real-Time Features:"
echo "   - Open http://localhost:3000/hotels in 2 browser windows"
echo "   - Watch viewer counts update in real-time!"
echo "   - Make a booking and see availability change instantly"
echo ""
echo -e "${GREEN}🎉 You're all set! Enjoy your real-time booking platform!${NC}"
echo ""
echo "📖 Read SECTION_3_IMPLEMENTATION.md for complete documentation"
echo ""
