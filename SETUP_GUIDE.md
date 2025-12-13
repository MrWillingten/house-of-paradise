Step-by-Step Setup Guide
📋 Pre-flight Checklist
Before you start, verify all required tools are installed:

bash
# Check Docker
docker --version
# Expected: Docker version 24.x or higher

# Check Node.js
node --version
# Expected: v18.x or higher

# Check Java
java --version
# Expected: openjdk 17 or higher

# Check Python
python --version
# Expected: Python 3.9 or higher

# Check Maven (optional, Docker will handle it)
mvn --version

# Check kubectl
kubectl version --client
If any are missing, install them:

Docker Desktop: https://www.docker.com/products/docker-desktop
Node.js: https://nodejs.org/
Java JDK 17: https://adoptium.net/
Python: https://www.python.org/downloads/
🏗️ Step 1: Project Setup
Create project directory structure
bash
mkdir travel-booking-microservices
cd travel-booking-microservices

# Create service directories
mkdir hotel-service trip-service payment-service api-gateway k8s
Copy all the files from the artifacts to their respective directories
Follow this structure:

travel-booking-microservices/
├── hotel-service/
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── .env
├── trip-service/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
│       └── main/
│           ├── java/com/travel/trip/
│           │   ├── TripApplication.java
│           │   ├── model/
│           │   │   ├── Trip.java
│           │   │   └── TripBooking.java
│           │   ├── repository/
│           │   │   ├── TripRepository.java
│           │   │   └── TripBookingRepository.java
│           │   └── controller/
│           │       └── TripController.java
│           └── resources/
│               └── application.properties
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
├── deploy.sh
├── cleanup.sh
├── test-api.sh
└── README.md
Make scripts executable (Linux/Mac)
bash
chmod +x deploy.sh cleanup.sh test-api.sh
🐳 Step 2: Test with Docker Compose (Quick Test)
This is the fastest way to verify everything works:

bash
# From project root
docker-compose up --build
What to expect:

All services will build and start
You'll see logs from all 4 services
Wait until you see:
✅ MongoDB connected (Hotel Service)
Started TripApplication (Trip Service)
Application startup complete (Payment Service)
🌐 API Gateway running on port 8080
Test the API:

bash
# In a new terminal
curl http://localhost:8080/health
Expected response:

json
{
  "gateway": "ok",
  "hotel": "ok",
  "trip": "ok",
  "payment": "ok"
}
Stop the services:

bash
# Press Ctrl+C in the docker-compose terminal
docker-compose down
☸️ Step 3: Deploy to Kubernetes
3.1 Enable Kubernetes in Docker Desktop
Open Docker Desktop
Go to Settings (⚙️) > Kubernetes
Check "Enable Kubernetes"
Click "Apply & Restart"
Wait for Kubernetes to start (green indicator)
3.2 Verify Kubernetes
bash
kubectl cluster-info
kubectl get nodes
You should see your local node in Ready state.

3.3 Build Docker Images
bash
# Build all images
docker build -t hotel-service:latest ./hotel-service
docker build -t trip-service:latest ./trip-service
docker build -t payment-service:latest ./payment-service
docker build -t api-gateway:latest ./api-gateway

# Verify images
docker images | grep -E 'hotel|trip|payment|gateway'
3.4 Deploy to Kubernetes
Option A: Using the deploy script (Recommended)

bash
./deploy.sh
Option B: Manual deployment

bash
# Create namespace
kubectl apply -f k8s/00-namespace.yaml

# Deploy databases
kubectl apply -f k8s/01-mongodb.yaml
kubectl apply -f k8s/02-postgres.yaml

# Wait for databases
kubectl wait --for=condition=ready pod -l app=mongodb -n travel-booking --timeout=300s
kubectl wait --for=condition=ready pod -l app=postgres -n travel-booking --timeout=300s

# Deploy services
kubectl apply -f k8s/03-hotel-service.yaml
kubectl apply -f k8s/04-trip-service.yaml
kubectl apply -f k8s/05-payment-service.yaml
kubectl apply -f k8s/06-api-gateway.yaml

# Wait for all deployments
kubectl wait --for=condition=available --timeout=300s deployment --all -n travel-booking
3.5 Verify Deployment
bash
# Check all resources
kubectl get all -n travel-booking

# Check pods are running
kubectl get pods -n travel-booking

# Check services
kubectl get svc -n travel-booking
Expected output: All pods should be in Running state.

3.6 Access the API
The API Gateway is exposed via NodePort on port 30080:

bash
# Health check
curl http://localhost:30080/health

# Or open in browser
open http://localhost:30080/health  # Mac
start http://localhost:30080/health # Windows
🧪 Step 4: Test the Application
Option A: Using the test script
bash
# For Docker Compose
./test-api.sh http://localhost:8080

# For Kubernetes
./test-api.sh http://localhost:30080
Option B: Manual testing with curl
See the full API examples in README.md

Option C: Using Postman or Thunder Client
Import these endpoints:

GET http://localhost:30080/health
POST http://localhost:30080/api/hotels (with body)
GET http://localhost:30080/api/hotels
POST http://localhost:30080/api/trips (with body)
POST http://localhost:30080/api/complete-booking (with body)
🔍 Step 5: Monitoring and Debugging
View Logs
bash
# All logs from a deployment
kubectl logs -f deployment/hotel-service -n travel-booking
kubectl logs -f deployment/trip-service -n travel-booking
kubectl logs -f deployment/payment-service -n travel-booking
kubectl logs -f deployment/api-gateway -n travel-booking

# Logs from a specific pod
kubectl logs -n travel-booking <pod-name>

# Logs from all pods
kubectl logs -l app=hotel-service -n travel-booking --all-containers=true
Check Pod Status
bash
# Detailed pod information
kubectl describe pod -n travel-booking <pod-name>

# Get pod events
kubectl get events -n travel-booking --sort-by='.lastTimestamp'
Access Pod Shell
bash
# Hotel service (Node.js)
kubectl exec -it -n travel-booking deployment/hotel-service -- sh

# Check MongoDB
kubectl exec -it -n travel-booking deployment/mongodb -- mongosh

# Check PostgreSQL
kubectl exec -it -n travel-booking deployment/postgres -- psql -U postgres
🧹 Step 6: Cleanup
Stop Kubernetes deployment
bash
# Using script
./cleanup.sh

# Or manually
kubectl delete -f k8s/
kubectl delete namespace travel-booking
Stop Docker Compose
bash
docker-compose down -v  # -v removes volumes too
Remove Docker images
bash
docker rmi hotel-service:latest trip-service:latest payment-service:latest api-gateway:latest
🚨 Common Issues and Solutions
Issue 1: Pods stuck in "Pending" or "ImagePullBackOff"
Solution:

bash
# Check pod details
kubectl describe pod -n travel-booking <pod-name>

# If ImagePullBackOff, make sure images are built:
docker images | grep -E 'hotel|trip|payment|gateway'

# Rebuild if needed
docker build -t hotel-service:latest ./hotel-service
Issue 2: Services can't connect to databases
Solution:

bash
# Check if database pods are running
kubectl get pods -n travel-booking | grep -E 'mongo|postgres'

# Check database logs
kubectl logs -n travel-booking deployment/mongodb
kubectl logs -n travel-booking deployment/postgres

# Delete and recreate
kubectl delete -f k8s/01-mongodb.yaml
kubectl delete -f k8s/02-postgres.yaml
kubectl apply -f k8s/01-mongodb.yaml
kubectl apply -f k8s/02-postgres.yaml
Issue 3: Port already in use (Docker Compose)
Solution:

bash
# Stop all containers
docker-compose down

# Kill process using the port (example for 8080)
# On Mac/Linux:
lsof -ti:8080 | xargs kill -9

# On Windows:
netstat -ano | findstr :8080
taskkill /PID <PID> /F
Issue 4: Java service fails to build
Solution:

bash
# Check Java version
java --version  # Should be 17+

# Build locally first to debug
cd trip-service
mvn clean package

# If Maven is not installed, use Docker:
docker run -it --rm -v "$(pwd)":/app -w /app maven:3.9-eclipse-temurin-17 mvn clean package
Issue 5: MongoDB connection refused
Solution:

bash
# Make sure MongoDB is running
kubectl get pods -n travel-booking | grep mongo

# Check MongoDB service
kubectl get svc -n travel-booking | grep mongo

# Test connection from hotel-service pod
kubectl exec -it -n travel-booking deployment/hotel-service -- sh
# Inside pod:
nc -zv mongo 27017
📝 Next Steps for Your Project
Add more features:
User authentication
Advanced search filters
Booking cancellation
Email notifications
Implement async communication:
Add RabbitMQ or Kafka
Event-driven architecture
Message queues for booking confirmations
Add monitoring:
Prometheus for metrics
Grafana for dashboards
ELK stack for logging
Create a frontend:
React/Vue.js application
Connect to API Gateway
User-friendly booking interface
Write documentation:
Architecture diagrams
API documentation
Deployment guide
Presentation slides
📚 Resources
Docker Documentation
Kubernetes Documentation
Spring Boot Guide
FastAPI Documentation
Express.js Guide
✅ Checklist for Submission
 All three services are implemented in different stacks
 Docker containers work for all services
 Docker Compose configuration is complete
 Kubernetes manifests are working
 API Gateway is functional
 Services can communicate with each other
 Databases are properly configured
 API endpoints are tested
 README documentation is complete
 Code is clean and commented
Good luck with your project! 🚀

