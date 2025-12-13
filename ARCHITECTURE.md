Travel Booking Microservices Architecture
System Architecture
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT / USER                           │
│                    (Browser / Mobile / API Client)              │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTP Requests
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Port 8080/30080)              │
│                         (Node.js + Express)                     │
│                                                                 │
│  Responsibilities:                                              │
│  • Request routing                                              │
│  • Load balancing                                               │
│  • Unified entry point                                          │
│  • Service orchestration                                        │
└───────────┬─────────────────┬─────────────────┬─────────────────┘
            │                 │                 │
            │ Route           │ Route           │ Route
            ▼                 ▼                 ▼
┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
│  HOTEL SERVICE     │ │   TRIP SERVICE     │ │  PAYMENT SERVICE   │
│   (Port 3001)      │ │   (Port 3002)      │ │   (Port 3003)      │
│                    │ │                    │ │                    │
│  Node.js + Express │ │ Java Spring Boot   │ │ Python + FastAPI   │
│                    │ │                    │ │                    │
│  Features:         │ │  Features:         │ │  Features:         │
│  • Hotel CRUD      │ │  • Trip CRUD       │ │  • Payment process │
│  • Hotel booking   │ │  • Trip booking    │ │  • Transaction log │
│  • Availability    │ │  • Search trips    │ │  • Refunds         │
│  • Pricing         │ │  • Seat mgmt       │ │  • History         │
└──────────┬─────────┘ └──────────┬─────────┘ └──────────┬─────────┘
           │                      │                      │
           │                      │                      │
           ▼                      ▼                      ▼
┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
│     MongoDB        │ │   PostgreSQL       │ │   PostgreSQL       │
│   (Port 27017)     │ │   (Port 5432)      │ │   (Port 5432)      │
│                    │ │                    │ │                    │
│  Database: hoteldb │ │  Database: tripdb  │ │ Database: paymentdb│
│                    │ │                    │ │                    │
│  Collections:      │ │  Tables:           │ │  Tables:           │
│  • hotels          │ │  • trips           │ │  • payments        │
│  • bookings        │ │  • trip_bookings   │ │                    │
└────────────────────┘ └────────────────────┘ └────────────────────┘
Communication Flow
1. Simple Query Flow
Client → API Gateway → Service → Database → Service → Gateway → Client
2. Complete Booking Flow (Inter-Service Communication)
Client
  │
  └─► API Gateway (POST /api/complete-booking)
        │
        ├─► Hotel/Trip Service (Create Booking)
        │     │
        │     ├─► Database (Save Booking)
        │     └─► Return Booking Data
        │
        ├─► Payment Service (Process Payment)
        │     │
        │     ├─► Database (Save Transaction)
        │     └─► Return Payment Status
        │
        ├─► Hotel/Trip Service (Update Booking Status)
        │     │
        │     └─► Database (Update Status)
        │
        └─► Client (Return Complete Result)
Technology Stack
┌─────────────────────────────────────────────────────────────┐
│                     ORCHESTRATION LAYER                     │
│                                                             │
│  Kubernetes (Production)        Docker Compose (Dev)        │
│  • Deployments                  • Quick setup               │
│  • Services                     • Local testing             │
│  • Persistent Volumes           • Easy debugging            │
│  • ConfigMaps                   • Volume mounting           │
│  • Auto-scaling                                             │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    CONTAINERIZATION LAYER                   │
│                                                             │
│  Docker Containers                                          │
│  • Isolated environments                                    │
│  • Portable deployments                                     │
│  • Consistent behavior                                      │
│  • Resource limits                                          │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                       │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Node.js    │  │     Java     │  │    Python    │       │
│  │   Express    │  │ Spring Boot  │  │   FastAPI    │       │
│  │   Mongoose   │  │     JPA      │  │  SQLAlchemy  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                         │
│                                                             │
│  ┌──────────────┐           ┌──────────────┐                │
│  │   MongoDB    │           │  PostgreSQL  │                │
│  │  (NoSQL)     │           │    (SQL)     │                │
│  └──────────────┘           └──────────────┘                │
└─────────────────────────────────────────────────────────────┘
Deployment Architecture
Kubernetes Deployment
┌───────────────────────────────────────────────────────────┐
│                     Kubernetes Cluster                    │
│                                                           │
│  Namespace: travel-booking                                │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Ingress / NodePort Service             │  │
│  │                    (Port 30080)                     │  │
│  └────────────────────┬────────────────────────────────┘  │
│                       │                                   │
│  ┌────────────────────┴────────────────────────────────┐  │
│  │            API Gateway Service (ClusterIP)          │  │
│  │                                                     │  │
│  │  Deployment: api-gateway                            │  │
│  │  Replicas: 2                                        │  │
│  │  Pods: [Gateway-1] [Gateway-2]                      │  │
│  └────────┬──────────────┬───────────────┬─────────────┘  │
│           │              │               │                │
│  ┌────────▼──────┐   ┌───▼───────┐   ┌───▼──────────┐     │
│  │ Hotel Service │  │Trip Service│  │Payment Service│     │
│  │               │  │            │  │               │     │
│  │ Deployment    │  │ Deployment │  │ Deployment    │     │
│  │ Replicas: 2   │  │ Replicas: 2│  │ Replicas: 2   │     │
│  │ [H1] [H2]     │  │ [T1] [T2]  │  │ [P1] [P2]     │     │
│  └───────┬───────┘  └─────┬──────┘  └──────┬────────┘     │
│          │                │                 │             │
│  ┌───────▼──────┐  ┌──────▼─────────────────▼────────── ┐ │
│  │   MongoDB    │  │        PostgreSQL                  │ │
│  │   StatefulSet│  │        StatefulSet                 │ │
│  │   PVC: 1Gi   │  │        PVC: 1Gi                    │ │
│  └──────────────┘  └────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
Network Architecture
External Network (Internet)
         │
         ├─ Port 8080 (Docker Compose)
         └─ Port 30080 (Kubernetes NodePort)
         │
         ▼
┌─────────────────────┐
│   API Gateway       │
│   Network Bridge    │
└─────────┬───────────┘
          │
    Internal Network
    (microservices-network / ClusterIP)
          │
    ┌─────┼─────┬─────────────┬─────────────┐
    │     │     │             │             │
    ▼     ▼     ▼             ▼             ▼
  Hotel  Trip Payment      MongoDB      PostgreSQL
  :3001  :3002 :3003        :27017        :5432
Data Flow Examples
1. Create Hotel
POST /api/hotels
  │
  ├─► Gateway receives request
  │
  ├─► Gateway routes to Hotel Service
  │     │
  │     ├─► Validate input
  │     ├─► Save to MongoDB
  │     └─► Return hotel data
  │
  └─► Client receives response
2. Complete Booking with Payment
POST /api/complete-booking
  │
  ├─► Gateway receives {type, bookingData, paymentData}
  │
  ├─► Gateway → Hotel/Trip Service
  │     │
  │     ├─► Check availability
  │     ├─► Calculate price
  │     ├─► Create booking (pending)
  │     └─► Return booking ID
  │
  ├─► Gateway → Payment Service
  │     │
  │     ├─► Process payment
  │     ├─► Generate transaction ID
  │     └─► Return payment status
  │
  ├─► If payment success:
  │   ├─► Gateway → Hotel/Trip Service
  │   │     └─► Update booking (confirmed)
  │   │
  │   └─► Return complete result
  │
  └─► If payment fails:
      └─► Rollback/Cancel booking
Scalability Model
                        Load Balancer
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
         Gateway-1       Gateway-2       Gateway-3
              │               │               │
    ┌─────────┼───────────────┼───────────────┼─────────┐
    │         │               │               │         │
    ▼         ▼               ▼               ▼         ▼
  Hotel-1   Hotel-2        Trip-1          Trip-2    Payment-1
    │         │               │               │         │
    └─────────┴───────────────┴───────────────┴─────────┘
              │                               │
              ▼                               ▼
          MongoDB                        PostgreSQL
        (with replica)                  (with replica)
Security Layers
┌─────────────────────────────────────────────────────────┐
│ Layer 5: Client Authentication (Future)                 │
│ • JWT tokens                                            │
│ • OAuth 2.0                                             │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│ Layer 4: API Gateway                                    │
│ • Rate limiting (Future)                                │
│ • Request validation                                    │
│ • CORS configuration                                    │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│ Layer 3: Service Layer                                  │
│ • Input validation                                      │
│ • Business logic checks                                 │
│ • Error handling                                        │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│ Layer 2: Network Layer                                  │
│ • Internal network isolation                            │
│ • Service-to-service communication                      │
│ • Port restrictions                                     │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│ Layer 1: Database Layer                                 │
│ • Connection encryption (Future)                        │
│ • Access control                                        │
│ • Data persistence                                      │
└─────────────────────────────────────────────────────────┘
Key Design Principles
1. Database per Service
Each microservice owns its database, ensuring:

Data independence
Schema flexibility
Service autonomy
Fault isolation
2. API Gateway Pattern
Centralized entry point providing:

Single URL for clients
Request routing
Load balancing capability
Future: Authentication, rate limiting
3. Containerization
Each service in its own container:

Isolated dependencies
Consistent environments
Easy deployment
Resource management
4. Service Independence
Services can be:

Deployed independently
Scaled independently
Developed in different languages
Maintained by different teams
5. Communication Patterns
Synchronous: REST/HTTP for immediate responses
Future: Asynchronous with message queues
Monitoring Points (Future Enhancement)
┌──────────────────────────────────────────────────────┐
│                    Monitoring Stack                  │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  Prometheus  │─▶│   Grafana    │ │  ELK Stack  │  │
│  │   Metrics    │  │  Dashboards  │  │    Logs     │ │
│  └──────┬───────┘  └──────────────┘  └──────┬──────┘ │
│         │                                   │        │
└─────────┼───────────────────────────────────┼────────┘
          │                                   │
          │         ┌───────────────────┐     │
          └────────▶│   All Services    │◀───┘
                    │   • Metrics       │
                    │   • Logs          │
                    │   • Traces        │
                    └───────────────────┘
This architecture demonstrates:

✅ Microservices pattern
✅ Polyglot programming (3 languages)
✅ Containerization with Docker
✅ Orchestration with Kubernetes
✅ API Gateway pattern
✅ Service communication
✅ Database per service
✅ Scalability design
✅ Production-ready structure
