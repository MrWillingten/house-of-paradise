Quick Reference Guide
🚀 Quick Start Commands
Docker Compose (Local Development)
bash
# Start everything
docker-compose up --build

# Start in background
docker-compose up -d

# Stop everything
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart hotel-service
Kubernetes (Production-like)
bash
# Deploy everything
./deploy.sh                    # Mac/Linux
deploy.bat                     # Windows

# Or manually
kubectl apply -f k8s/

# Check status
kubectl get all -n travel-booking
kubectl get pods -n travel-booking

# View logs
kubectl logs -f deployment/hotel-service -n travel-booking

# Clean up
./cleanup.sh
# Or: kubectl delete -f k8s/
📡 API Endpoints (via Gateway)
Base URLs
Docker Compose: http://localhost:8080
Kubernetes: http://localhost:30080
Health Check
bash
GET /health
Hotels
bash
GET    /api/hotels                    # List all hotels
GET    /api/hotels/:id                # Get hotel by ID
POST   /api/hotels                    # Create hotel
PUT    /api/hotels/:id                # Update hotel
DELETE /api/hotels/:id                # Delete hotel
POST   /api/bookings                  # Create hotel booking
GET    /api/bookings/user/:userId     # Get user's hotel bookings
Trips
bash
GET    /api/trips                     # List all trips
GET    /api/trips/:id                 # Get trip by ID
POST   /api/trips                     # Create trip
PUT    /api/trips/:id                 # Update trip
DELETE /api/trips/:id                 # Delete trip
POST   /api/bookings                  # Create trip booking (same endpoint)
GET    /api/bookings/user/:userId     # Get user's trip bookings
Payments
bash
POST   /api/payments                  # Process payment
GET    /api/payments/:id              # Get payment by ID
GET    /api/payments/user/:userId     # Get user's payments
GET    /api/payments/transaction/:txId # Get by transaction ID
PATCH  /api/payments/:id/refund       # Refund payment
Combined Operations
bash
POST   /api/complete-booking          # Complete booking with payment
📝 Sample API Calls
Create Hotel
bash
curl -X POST http://localhost:8080/api/hotels \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Grand Hotel",
    "location": "Paris",
    "pricePerNight": 150,
    "availableRooms": 10,
    "rating": 4.5,
    "amenities": ["WiFi", "Pool"]
  }'
Create Trip
bash
curl -X POST http://localhost:8080/api/trips \
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
  }'
Complete Booking
bash
curl -X POST http://localhost:8080/api/complete-booking \
  -H "Content-Type: application/json" \
  -d '{
    "type": "hotel",
    "bookingData": {
      "hotelId": "HOTEL_ID",
      "userId": "user123",
      "checkIn": "2024-12-20",
      "checkOut": "2024-12-22",
      "numberOfRooms": 1
    },
    "paymentData": {
      "user_id": "user123",
      "payment_method": "card"
    }
  }'
🔍 Debugging Commands
Docker Compose
bash
# View logs for a service
docker-compose logs hotel-service

# Follow logs
docker-compose logs -f trip-service

# Execute command in container
docker-compose exec hotel-service sh

# Restart a service
docker-compose restart payment-service

# Check running containers
docker-compose ps
Kubernetes
bash
# Pod logs
kubectl logs -n travel-booking POD_NAME
kubectl logs -n travel-booking deployment/hotel-service

# Follow logs
kubectl logs -f -n travel-booking deployment/trip-service

# Describe pod (troubleshooting)
kubectl describe pod -n travel-booking POD_NAME

# Execute command in pod
kubectl exec -it -n travel-booking POD_NAME -- sh

# Port forward (access service directly)
kubectl port-forward -n travel-booking deployment/hotel-service 3001:3001

# Restart deployment
kubectl rollout restart deployment/hotel-service -n travel-booking

# Check events
kubectl get events -n travel-booking --sort-by='.lastTimestamp'
Database Access
bash
# MongoDB (Docker Compose)
docker-compose exec mongo mongosh

# MongoDB (Kubernetes)
kubectl exec -it -n travel-booking deployment/mongodb -- mongosh

# PostgreSQL (Docker Compose)
docker-compose exec postgres psql -U postgres

# PostgreSQL (Kubernetes)
kubectl exec -it -n travel-booking deployment/postgres -- psql -U postgres
🛠️ Common Fixes
Port Already in Use
bash
# Find and kill process (Mac/Linux)
lsof -ti:8080 | xargs kill -9

# Windows
netstat -ano | findstr :8080
taskkill /PID [PID] /F
Clear Everything and Restart
bash
# Docker Compose
docker-compose down -v
docker system prune -a
docker-compose up --build

# Kubernetes
kubectl delete namespace travel-booking
./deploy.sh
Rebuild Single Service
bash
# Docker Compose
docker-compose up -d --no-deps --build hotel-service

# Kubernetes
docker build -t hotel-service:latest ./hotel-service
kubectl rollout restart deployment/hotel-service -n travel-booking
Database Connection Issues
bash
# Check if database is running
kubectl get pods -n travel-booking | grep -E 'mongo|postgres'

# Restart database
kubectl delete pod -n travel-booking [DB_POD_NAME]
# It will auto-recreate

# Check database logs
kubectl logs -n travel-booking [DB_POD_NAME]
📊 Service Ports
Service	Docker Compose	Kubernetes	Direct Access
API Gateway	8080	30080	External
Hotel Service	3001	3001	Internal
Trip Service	3002	3002	Internal
Payment Service	3003	3003	Internal
MongoDB	27017	27017	Internal
PostgreSQL	5432	5432	Internal
🎯 Pre-Demo Checklist
Test all services are running
bash
   curl http://localhost:30080/health
Prepare sample data
bash
   ./test-api.sh http://localhost:30080
Have these terminals ready:
Terminal 1: Logs from hotel-service
Terminal 2: Logs from trip-service
Terminal 3: Logs from payment-service
Terminal 4: For running commands
Browser tabs:
Health check endpoint
Kubernetes dashboard (if available)
API documentation
🆘 Emergency Quick Fixes
"Everything is broken!"
bash
# Nuclear option - start fresh
docker-compose down -v
kubectl delete namespace travel-booking
docker system prune -a
# Then redeploy
"Service won't start"
bash
# Check logs
kubectl logs -n travel-booking deployment/[SERVICE_NAME]
# Common issues: wrong env vars, database not ready
"Can't connect to service"
bash
# Verify service is running
kubectl get pods -n travel-booking
# Verify service exists
kubectl get svc -n travel-booking
# Test from another pod
kubectl run test --rm -it --image=busybox -n travel-booking -- wget -O- http://hotel-service:3001/health
📚 File Locations Quick Map
travel-booking-microservices/
├── hotel-service/
│   ├── server.js          ← Main Node.js file
│   ├── Dockerfile         ← Docker config
│   └── package.json       ← Dependencies
├── trip-service/
│   ├── pom.xml           ← Maven config
│   ├── Dockerfile        ← Docker config
│   └── src/main/java/... ← Java code
├── payment-service/
│   ├── main.py           ← Main Python file
│   ├── Dockerfile        ← Docker config
│   └── requirements.txt  ← Dependencies
├── api-gateway/
│   ├── server.js         ← Gateway logic
│   └── Dockerfile        ← Docker config
├── k8s/                  ← All Kubernetes files
├── docker-compose.yml    ← Local dev setup
└── deploy.sh/.bat        ← Deployment scripts
💡 Pro Tips
Always check health endpoint first
Use kubectl describe pod when pods fail
Check logs with -f flag to follow in real-time
Test locally with Docker Compose before Kubernetes
Keep terminal with logs open during demo
Have backup: screenshots of working system
🎓 For Your Presentation
Key Points to Mention:
Three different tech stacks (Node, Java, Python)
Microservices independence (own DB, own port)
Docker containerization (portable, isolated)
Kubernetes orchestration (scalable, resilient)
API Gateway pattern (single entry point)
Service communication (REST/HTTP)
Demo Flow:
Show architecture diagram
Run health check
Create hotel via API
Create trip via API
Complete booking with payment
Show logs of service communication
Show Kubernetes pods
Delete a pod, watch it restart
📞 When You Need Help
Check error message in logs
Google the specific error
Check service health endpoints
Verify environment variables
Ensure databases are running
Check network connectivity
Remember: Most issues are config/env related! 🔧

