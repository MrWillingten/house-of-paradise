# Travel Booking Microservices Architecture

A complete microservices-based travel booking application with Hotel Management, Trip Management, and Payment services, orchestrated using Docker and Kubernetes.

## 🏗️ Architecture

```
                    [API Gateway :8080]
                           |
          +----------------+----------------+
          |                |                |
    [Hotel Service]   [Trip Service]   [Payment Service]
     (Node.js :3001)  (Java :3002)    (Python :3003)
          |                |                |
      [MongoDB]        [PostgreSQL]     [PostgreSQL]
```

## 📋 Services

### 1. Hotel Service (Node.js + Express + MongoDB)
- CRUD operations for hotels
- Hotel booking management
- Port: 3001

### 2. Trip Service (Java Spring Boot + PostgreSQL)
- Trip/Journey management
- Trip booking system
- Port: 3002

### 3. Payment Service (Python FastAPI + PostgreSQL)
- Payment processing
- Transaction management
- Port: 3003

### 4. API Gateway (Node.js + Express)
- Unified entry point
- Request routing
- Port: 8080

## 🛠️ Prerequisites

- Docker Desktop (with Kubernetes enabled)
- Node.js 18+
- Java JDK 17+
- Python 3.9+
- Maven 3.6+
- kubectl CLI

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended for Development)

1. **Clone and navigate to project**
```bash
cd travel-booking-microservices
```

2. **Build and run all services**
```bash
docker-compose up --build
```

3. **Access the API Gateway**
```
http://localhost:8080
```

### Option 2: Kubernetes Deployment

1. **Enable Kubernetes in Docker Desktop**
   - Open Docker Desktop > Settings > Kubernetes > Enable Kubernetes

2. **Build Docker images**
```bash
# Build all services
docker build -t hotel-service:latest ./hotel-service
docker build -t trip-service:latest ./trip-service
docker build -t payment-service:latest ./payment-service
docker build -t api-gateway:latest ./api-gateway
```

3. **Deploy to Kubernetes**
```bash
# Apply all manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n travel-booking
kubectl get services -n travel-booking
```

4. **Access the API Gateway**
```
http://localhost:30080
```

## 📊 API Endpoints

### Health Check
```
GET http://localhost:8080/health
```

### Hotel Service
```
GET    /api/hotels              # Get all hotels
GET    /api/hotels/:id          # Get hotel by ID
POST   /api/hotels              # Create hotel
PUT    /api/hotels/:id          # Update hotel
DELETE /api/hotels/:id          # Delete hotel
POST   /api/bookings            # Create hotel booking
GET    /api/bookings/user/:userId  # Get user bookings
```

### Trip Service
```
GET    /api/trips               # Get all trips
GET    /api/trips/:id           # Get trip by ID
POST   /api/trips               # Create trip
PUT    /api/trips/:id           # Update trip
DELETE /api/trips/:id           # Delete trip
POST   /api/bookings            # Create trip booking
GET    /api/bookings/user/:userId  # Get user bookings
```

### Payment Service
```
POST   /api/payments            # Process payment
GET    /api/payments/:id        # Get payment by ID
GET    /api/payments/user/:userId  # Get user payments
GET    /api/payments/transaction/:txId  # Get by transaction ID
PATCH  /api/payments/:id/refund  # Refund payment
```

### Combined Booking (Gateway only)
```
POST   /api/complete-booking    # Complete booking with payment
```

## 🧪 Testing the Application

### 1. Create a Hotel
```bash
curl -X POST http://localhost:8080/api/hotels \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Grand Hotel",
    "location": "Paris",
    "pricePerNight": 150,
    "availableRooms": 10,
    "rating": 4.5,
    "amenities": ["WiFi", "Pool", "Restaurant"]
  }'
```

### 2. Create a Trip
```bash
curl -X POST http://localhost:8080/api/trips \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "Paris",
    "destination": "London",
    "departureTime": "2024-12-15T10:00:00",
    "arrivalTime": "2024-12-15T14:00:00",
    "transportType": "flight",
    "price": 200,
    "availableSeats": 50,
    "carrier": "Air France"
  }'
```

### 3. Complete Booking with Payment
```bash
curl -X POST http://localhost:8080/api/complete-booking \
  -H "Content-Type: application/json" \
  -d '{
    "type": "hotel",
    "bookingData": {
      "hotelId": "HOTEL_ID_HERE",
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
```

## 📁 Project Structure

```
travel-booking-microservices/
├── hotel-service/
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── .env
├── trip-service/
│   ├── src/main/java/com/travel/trip/
│   │   ├── TripApplication.java
│   │   ├── model/
│   │   ├── repository/
│   │   └── controller/
│   ├── pom.xml
│   ├── Dockerfile
│   └── application.properties
├── payment-service/
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── api-gateway/
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
├── k8s/
│   ├── 00-namespace.yaml
│   ├── 01-mongodb.yaml
│   ├── 02-postgres.yaml
│   ├── 03-hotel-service.yaml
│   ├── 04-trip-service.yaml
│   ├── 05-payment-service.yaml
│   └── 06-api-gateway.yaml
├── docker-compose.yml
├── init-db.sql
└── README.md
```

## 🔧 Development

### Running Individual Services Locally

**Hotel Service:**
```bash
cd hotel-service
npm install
npm run dev
```

**Trip Service:**
```bash
cd trip-service
mvn spring-boot:run
```

**Payment Service:**
```bash
cd payment-service
pip install -r requirements.txt
uvicorn main:app --reload --port 3003
```

## 🐛 Troubleshooting

### Docker Compose Issues
```bash
# Stop all containers
docker-compose down

# Remove volumes and rebuild
docker-compose down -v
docker-compose up --build
```

### Kubernetes Issues
```bash
# Check pod logs
kubectl logs -n travel-booking <pod-name>

# Delete and reapply
kubectl delete -f k8s/
kubectl apply -f k8s/

# Check pod status
kubectl describe pod -n travel-booking <pod-name>
```

### Database Connection Issues
Make sure databases are fully initialized before services start. You can check:
```bash
# MongoDB
docker exec -it mongodb mongosh

# PostgreSQL
docker exec -it postgres psql -U postgres
```

## 📝 Features Implemented

✅ Three independent microservices in different tech stacks
✅ Docker containerization for all services
✅ Docker Compose for local orchestration
✅ Kubernetes manifests for production deployment
✅ API Gateway for unified access
✅ Synchronous inter-service communication (REST)
✅ Database per service pattern
✅ Health check endpoints
✅ CORS enabled for frontend integration

## 🚀 Future Enhancements

- Asynchronous communication with RabbitMQ/Kafka
- Service mesh (Istio)
- Monitoring with Prometheus + Grafana
- Centralized logging with ELK stack
- CI/CD pipeline
- Authentication & Authorization
- Rate limiting
- Caching layer (Redis)

## 📄 License

This project is for educational purposes.

## 👥 Contributors

- Your Name - Student

---
**Project Due Date:** December 12, 2024