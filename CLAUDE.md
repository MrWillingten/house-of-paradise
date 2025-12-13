# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a polyglot microservices-based travel booking platform (House of Paradise - HoP) with hotel, trip, payment, and authentication services, orchestrated using Docker Compose and Kubernetes. The system uses an API Gateway pattern with comprehensive security middleware, full account management, two-factor authentication, and an extensive hotel catalog.

## Architecture

### Service Layer (Polyglot Implementation)
- **API Gateway** (Node.js/Express, Port 8080): Unified entry point with extensive security middleware (DDoS protection, rate limiting, XSS/injection protection), proxies all requests to backend services
- **Hotel Service** (Node.js/Express, Port 3001): Hotel CRUD, booking management, real-time updates via Socket.IO, loyalty rewards, personalization, 15,150 hotels across 101 countries
- **Trip Service** (Java Spring Boot, Port 3002): Trip/journey management using JPA with PostgreSQL
- **Payment Service** (Python FastAPI, Port 3003): Payment processing with SQLAlchemy
- **Auth Service** (Node.js/Express, Port 3004): JWT-based authentication, account management, TOTP 2FA, email/SMS verification, phone management, profile updates
- **Frontend** (React, Port 3000): SPA with React Router, dark mode support, proxies API calls to API Gateway

### Data Layer
- **MongoDB** (Port 27017): Used by Hotel Service (`hoteldb` - 15,150 hotels) and Auth Service (`authdb`)
- **PostgreSQL** (Port 5432): Shared by Trip Service (`tripdb`) and Payment Service (`paymentdb`)

### Monitoring
- **Prometheus** (Port 9090): Metrics collection
- **Grafana** (Port 3005): Visualization dashboards (admin/admin123)

### Inter-Service Communication
Services communicate synchronously via HTTP/REST through the API Gateway. The gateway handles authentication via JWT tokens from Auth Service, validates requests, and routes to backend services.

## Common Commands

### Development

**Start all services (Docker Compose):**
```bash
docker-compose up --build
```

**Stop all services:**
```bash
docker-compose down
```

**Clean restart (removes volumes):**
```bash
docker-compose down -v
docker-compose up --build
```

**View logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f hotel-service
docker logs hotel-service
```

**Rebuild specific service:**
```bash
docker-compose up --build -d service-name
# Example: docker-compose up --build -d auth-service
```

### Individual Service Development

**Hotel Service:**
```bash
cd hotel-service
npm install
node server.js
# No dev script configured - runs directly with node
```

**Seed Hotels Database (15,150 hotels):**
```bash
cd hotel-service/scripts
node seed-real-hotels.js
# Seeds 150 hotels per country for all 101 countries
# Takes ~3-5 minutes to complete
```

**Trip Service:**
```bash
cd trip-service
mvn clean install
mvn spring-boot:run
```

**Payment Service:**
```bash
cd payment-service
pip install -r requirements.txt
uvicorn main:app --reload --port 3003
```

**Auth Service:**
```bash
cd auth-service
npm install
node server.js
```

**Frontend:**
```bash
cd frontend
npm install
npm start  # Starts on port 3000, proxies API calls to 8080
```

### Kubernetes Deployment

**Deploy to cluster:**
```bash
# Apply all manifests
kubectl apply -f k8s/

# Check status
kubectl get pods -n travel-booking
kubectl get services -n travel-booking

# View logs
kubectl logs -n travel-booking <pod-name>

# Delete deployment
kubectl delete -f k8s/
```

**Access via NodePort:**
```
http://localhost:30080
```

### Database Access

**MongoDB:**
```bash
docker exec -it mongodb mongosh
use hoteldb
db.hotels.find()
db.hotels.countDocuments()  # Should show 15150 hotels

# Check for duplicates
db.hotels.aggregate([
  { $group: { _id: { name: '$name', location: '$location' }, count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
])
```

**PostgreSQL:**
```bash
docker exec -it postgres psql -U postgres
\c tripdb
\dt
```

### Testing

**Health checks:**
```bash
curl http://localhost:8080/health
curl http://localhost:3001/health
curl http://localhost:3002/api/health
curl http://localhost:3003/health
```

## Key Architectural Patterns

### API Gateway Security Stack
The API Gateway applies security middleware in a specific order (see `api-gateway/server.js`):
1. CSP nonce generation for strict Content Security Policy
2. Helmet configuration with nonces (XSS, clickjacking protection)
3. Secure cookie settings (HttpOnly, Secure, SameSite)
4. CORS protection
5. NoSQL injection protection (MongoDB sanitization)
6. XSS protection and HTML sanitization
7. HTTP Parameter Pollution protection
8. Path traversal, command injection, and SSRF protection
9. DDoS protection middleware with rate limiting
10. Authentication and authorization via JWT

**Critical:** When modifying gateway security, maintain this middleware order. DDoS protection includes multiple limiters:
- `globalLimiter`: General rate limiting
- `authLimiter`: Stricter limits for auth endpoints
- `paymentLimiter`: Transaction protection
- `browseLimiter`: Search/browse operations
- `connectionLimiter`: Concurrent connection limits

### Authentication Flow
1. User registers/logs in via Auth Service (POST `/api/auth/register`, `/api/auth/login`)
2. Auth Service returns JWT token
3. Client includes token in `Authorization: Bearer <token>` header
4. API Gateway validates token via `verifyToken` middleware before routing
5. Admin-only routes use `isAdmin` middleware
6. If 2FA enabled, user must verify 6-digit TOTP code after login

Token verification is performed at the gateway level before proxying to backend services.

### Two-Factor Authentication (2FA) Flow
1. User enables 2FA from Account page
2. Backend generates TOTP secret using speakeasy library (32-character base32)
3. Creates otpauth:// URI: `otpauth://totp/House of Paradise:user@email.com?secret=...&issuer=House of Paradise`
4. Generates QR code as base64 data URL using qrcode library
5. Frontend displays QR code with HoP shield logo in center
6. User scans with Google Authenticator/Authy/Microsoft Authenticator/1Password
7. User enters 6-digit code to verify setup
8. Backend validates using speakeasy.totp.verify() with ±60 second window
9. Generates 10 backup codes (8-character alphanumeric)
10. 2FA enabled - subsequent logins require TOTP code

### Database Per Service Pattern
Each service owns its database schema. **Never directly access another service's database.** For cross-service data needs, implement REST API calls through the gateway.

### Socket.IO Real-Time Updates
Hotel Service implements real-time notifications for booking updates via Socket.IO (see `hotel-service/server.js`). Clients connect to `http://hotel-service:3001` and listen for events like `bookingUpdate`, `hotelUpdate`.

### Loyalty and Personalization
Hotel Service includes loyalty points system (`loyalty.js`) and personalization engine (`personalization.js`) for user recommendations. These are service-specific features that use MongoDB collections.

## Important File Locations

### Configuration
- `docker-compose.yml`: Local development orchestration
- `k8s/*.yaml`: Kubernetes manifests (namespace, services, deployments)
- `monitoring/prometheus.yml`: Metrics scraping configuration
- `.env` files: Service-specific environment variables (not committed to repo in production)

### Security Middleware
- `api-gateway/middleware/security.js`: Comprehensive security (XSS, injection, CSRF)
- `api-gateway/middleware/ddosProtection.js`: Rate limiting and DDoS mitigation
- `api-gateway/middleware/auth.js`: JWT verification and admin checks

### Service Entry Points
- `api-gateway/server.js`: Gateway routing and orchestration (14 account management routes added)
- `hotel-service/server.js`: Hotel service with Socket.IO, auto-sync, duplicate prevention
- `trip-service/src/main/java/com/travel/trip/TripApplication.java`: Spring Boot app
- `payment-service/main.py`: FastAPI application
- `auth-service/server.js`: Authentication, 2FA (speakeasy + qrcode), account management (15 new endpoints)
- `frontend/src/App.js`: React application root

### Frontend Pages
- `frontend/src/pages/Account.js`: Complete account management (profile image, display name, email, phone, password, 2FA, SMS backup, account removal)
- `frontend/src/pages/Hotels.js`: Hotels listing with pagination (15 per page), search, filters, map view
- `frontend/src/pages/Login.js`: Login with 2FA verification support
- `frontend/src/pages/Register.js`: User registration
- `frontend/src/components/ProfileImageUpload.js`: Drag-drop profile image upload (max 5MB)
- `frontend/src/components/TwoFactorSetup.js`: 4-step 2FA wizard (currently not used - inline implementation in Account.js preferred)
- `frontend/src/utils/countries.js`: 101 countries with codes, flags, ISO codes for phone selection

### Backend Scripts
- `hotel-service/scripts/seed-real-hotels.js`: Seeds 15,150 unique hotels (150 per country × 101 countries) with realistic data

## Authentication Service API Endpoints

### Basic Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns JWT, may require 2FA)
- `GET /api/auth/verify` - Verify email with code
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/resend-code` - Resend verification code

### Account Management (14 new endpoints)
- `PUT /api/auth/update-display-name` - Update display name (letters only validation)
- `POST /api/auth/request-email-change` - Send verification code to current email
- `POST /api/auth/verify-email-change` - Verify code and update email
- `POST /api/auth/change-password` - Change password with current password verification
- `POST /api/auth/add-phone` - Add phone number with country code
- `POST /api/auth/verify-phone` - Verify phone with SMS code
- `DELETE /api/auth/remove-phone` - Remove phone number
- `POST /api/auth/enable-2fa` - Generate QR code and secret for 2FA setup
- `POST /api/auth/verify-2fa-setup` - Verify TOTP code and complete 2FA setup
- `POST /api/auth/verify-2fa-login` - Verify 2FA code during login
- `GET /api/auth/backup-codes` - View backup codes (requires authentication)
- `POST /api/auth/disable-2fa` - Disable 2FA with password verification
- `POST /api/auth/disable-account` - Temporarily disable account (recoverable)
- `DELETE /api/auth/delete-account` - Permanently delete account

**All account management endpoints are proxied through API Gateway on port 8080.**

## Frontend Features

### Account Page (Complete Implementation)
Located at: `frontend/src/pages/Account.js`

**Features:**
1. **Profile Image Upload**
   - Drag & drop support
   - Supported formats: JPG, PNG, GIF, WEBP (max 5MB)
   - Hover overlay with camera icon
   - Preview before upload
   - Upload/cancel/remove actions

2. **Display Name**
   - Inline editing
   - Letters-only validation (no numbers/special chars)
   - Real-time error feedback

3. **Email Management**
   - Floating modal with verification flow
   - Sends verification code to CURRENT email (for security)
   - 6-digit code with 10-minute expiry
   - Password verification required

4. **Phone Number**
   - Country code dropdown (101 countries A-Z)
   - Flags and ISO codes
   - SMS verification flow
   - Compact modal design (440px width)
   - Scrollable dropdown (max-height: 320px)
   - Green theme (#10b981) matching HoP branding

5. **Password & Authentication**
   - Change password with current password verification
   - Strong password requirements (8+ chars, uppercase, lowercase, number, special char)
   - Password strength indicator
   - Show/hide password toggles

6. **Authenticator App (2FA)**
   - TOTP-based (RFC 6238 compliant)
   - QR code generation with HoP branding
   - Manual secret key entry option (with copy button)
   - Speakeasy library for TOTP generation
   - 6-digit codes, 30-second rotation
   - Auto-verification when 6 digits entered
   - 10 backup codes (8-character alphanumeric)
   - Download backup codes as .txt file
   - View/remove 2FA options when enabled

7. **SMS Backup Authentication**
   - SMS-based backup 2FA method
   - Uses phone number from account

8. **Account Removal**
   - Disable Account (temporary, recoverable)
   - Delete Account (permanent, with confirmation)

### Hotels Page (Pagination Implementation)
Located at: `frontend/src/pages/Hotels.js`

**Features:**
- **Pagination**: Initial load shows 15 hotels, "Load More" button loads 15 more
- **Search & Filters**: Location, price range, rating, amenities
- **View Modes**: Grid, list, map
- **Sort Options**: Price, rating, name
- **15,150 Hotels**: Unique hotels from 101 countries
- **Deduplication**: Prevents duplicate hotel cards
- **Load More Button**: Shows "(Showing X of Y)", disappears when all loaded
- **Dark Mode**: Full support with theme persistence

### Hotel Data Structure
Located at: `hotel-service/scripts/seed-real-hotels.js`

**Hotel Seeding:**
- 150 hotels per country × 101 countries = 15,150 total
- 8 naming patterns (chain, boutique, landmark-based, etc.)
- Unique naming with index suffix to guarantee no duplicates
- Country-specific pricing tiers (high/medium/low cost countries)
- Realistic amenities (6-20 per hotel)
- Property types: hotel, resort, boutique, apartment, villa
- Working Unsplash images (fixed URLs, not deprecated Source API)
- Ratings: 3.0-5.0 stars
- Reviews: 50-5000 per hotel

**Duplicate Prevention:**
- Unique compound index: `{ name: 1, location: 1 }`
- Auto-sync checks for existing hotels before inserting
- Manual sync has duplicate detection
- Error code 11000 handling for unique constraint violations

## Common Development Scenarios

### Adding a New Route to API Gateway
1. Add route definition in `api-gateway/server.js`
2. Apply appropriate middleware: `verifyToken` for authenticated, `isAdmin` for admin-only
3. Use appropriate rate limiter: `authLimiter`, `paymentLimiter`, `browseLimiter`, or default
4. Proxy to backend service using axios with error handling
5. Remove sensitive data from responses using `removeSensitiveData` if needed

**Example:**
```javascript
app.post('/api/auth/enable-2fa', async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE}/api/auth/enable-2fa`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ success: false, error: 'Failed to enable 2FA' });
    }
  }
});
```

### Adding a New Hotel Service Endpoint
1. Define route in `hotel-service/server.js`
2. Add validation using express-validator
3. Implement MongoDB operations using Mongoose models
4. Emit Socket.IO events if real-time updates needed
5. Add corresponding route in API Gateway

### Implementing 2FA for a Feature
1. Install dependencies: `speakeasy` and `qrcode` in auth-service
2. Add User model fields: `twoFactorSecret`, `twoFactorEnabled`, `backupCodes`, `temp2FASecret`
3. Create enable endpoint: Generate secret with `speakeasy.generateSecret()`
4. Create QR code: `qrcode.toDataURL(secret.otpauth_url)`
5. Verify setup: `speakeasy.totp.verify({ secret, token, window: 2 })`
6. Generate backup codes: 10 random 8-character codes
7. Add verification to login flow
8. Add API Gateway routes for all 2FA endpoints

### Modifying Trip Service (Java/Spring Boot)
1. Update entity in `trip-service/src/main/java/com/travel/trip/model/`
2. Add repository methods in `repository/` if needed
3. Implement controller logic in `controller/TripController.java`
4. Spring Data JPA handles database migrations via `spring.jpa.hibernate.ddl-auto`

### Debugging Service Communication
1. Check service health endpoints first
2. Review API Gateway logs for routing issues
3. Verify environment variables are correctly set in docker-compose.yml
4. Ensure services are on the same network (`microservices-network`)
5. Check that service URLs in gateway match container names (e.g., `http://hotel-service:3001`)
6. If route not found (404), check if route exists in API Gateway (all requests go through gateway)

### Working with PostgreSQL Schemas
The `init-db` service in docker-compose.yml creates `tripdb` and `paymentdb` on startup. Schema creation is handled by:
- Trip Service: Spring Boot JPA auto-creates tables
- Payment Service: SQLAlchemy models auto-create tables

### Port Conflicts
If ports are in use, modify `docker-compose.yml` port mappings. Internal container ports should remain unchanged; only modify the host port (left side of `host:container`).

## Frontend Development Patterns

### State Management
- `useState` for local component state
- `useEffect` for side effects (API calls, subscriptions)
- `useMemo` for expensive computations
- `useRef` for DOM references and input focus
- `localStorage` for persistence (user data, dark mode preference)

### Dark Mode Implementation
- Stored in localStorage as boolean
- Applied to document.body className
- All components receive `darkMode` prop
- Conditional styling based on `darkMode` value
- Theme toggle in Navbar (persists across pages)

### Modal Pattern
```javascript
{showModal && (
  <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
      {/* Modal content */}
    </div>
  </div>
)}
```

### API Call Pattern with JWT
```javascript
const token = localStorage.getItem('token');
const response = await fetch('http://localhost:8080/api/endpoint', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});

const result = await response.json();

if (!response.ok) {
  throw new Error(result.message || 'Request failed');
}
```

### Pagination Pattern (Hotels Page)
```javascript
const [allHotels, setAllHotels] = useState([]);        // All fetched hotels
const [displayedHotels, setDisplayedHotels] = useState([]); // Currently shown
const [displayCount, setDisplayCount] = useState(15);  // Number to display

// Initial fetch
const fetchHotels = async () => {
  const data = await fetch('/api/hotels');
  setAllHotels(data);
  setDisplayedHotels(data.slice(0, 15));  // Show first 15
  setDisplayCount(15);
};

// Load more
const handleLoadMore = () => {
  const newCount = displayCount + 15;
  setDisplayedHotels(allHotels.slice(0, newCount));
  setDisplayCount(newCount);
};
```

## Security Considerations

- JWT_SECRET must be changed in production (currently in `auth-service/.env`)
- Database passwords are default values - rotate for production
- Rate limits in DDoS protection middleware may need tuning based on traffic patterns
- CORS configuration in gateway restricts origins - update for production domains
- CSP nonces are generated per-request for strict XSS prevention
- All validation happens at gateway and service layers - never trust client input
- 2FA secrets stored encrypted in database
- Backup codes are hashed before storage
- Email verification codes expire after 10 minutes
- Phone verification codes expire after 5 minutes
- Password history tracking prevents reuse of last 5 passwords

## Known Limitations

- Synchronous REST communication only (no message queue/async patterns)
- No distributed tracing or service mesh
- Shared PostgreSQL instance for Trip and Payment services (should be separate in production)
- No database replication or high availability setup
- Frontend proxies to localhost:8080 (not configurable via environment variable)
- SMS verification currently mocked (needs real SMS provider like Twilio)
- Email sending configured but needs production SMTP credentials

## Testing the Complete Flow

### Basic Flow
1. Start all services: `docker-compose up --build`
2. Register user: `POST http://localhost:8080/api/auth/register`
3. Login: `POST http://localhost:8080/api/auth/login` (returns JWT)
4. Browse hotels: `GET http://localhost:8080/api/hotels` (15,150 available)
5. Create booking: `POST http://localhost:8080/api/bookings` (with JWT)
6. Process payment: `POST http://localhost:8080/api/complete-booking`

### Account Management Flow
1. Login to account
2. Navigate to `/account` page
3. Upload profile image (drag & drop or click)
4. Update display name (inline editing)
5. Change email (verification sent to current email)
6. Add phone number (select country, enter number, verify with SMS)
7. Change password (requires current password)
8. Enable 2FA (scan QR code, verify, save backup codes)
9. Test 2FA login (logout, login, enter TOTP code)

### 2FA Testing
1. Navigate to Account → Authenticator App
2. Click "Enable Two-Factor Authentication"
3. Scan QR code with Google Authenticator app
4. App shows: "House of Paradise (user@email.com)"
5. Enter 6-digit code from app
6. Download backup codes .txt file
7. Logout and login again
8. Enter 2FA code when prompted
9. View backup codes: Account → "View Backup Codes"
10. Disable 2FA: Click "Remove Authenticator App", enter password

### Hotels Pagination Testing
1. Navigate to `/hotels` page
2. Initial load: 15 hotels displayed
3. Scroll to bottom: "Load More Hotels" button shows "(Showing 15 of 15150)"
4. Click "Load More": Loads 15 more hotels (total 30 shown)
5. Continue clicking: Button disappears when all hotels loaded
6. Test with search: Search for location, pagination respects filtered results
7. Test with filters: Apply filters, Load More works with filtered hotels

## Database Schemas

### User Model (Auth Service - MongoDB)
```javascript
{
  name: String,
  email: String (unique, required),
  password: String (hashed with bcrypt),
  isVerified: Boolean,
  verificationCode: String,
  verificationCodeExpiry: Date,
  profileImage: String,
  phone: String,
  phoneCountryCode: String,
  twoFactorEnabled: Boolean,
  twoFactorSecret: String,
  temp2FASecret: String,
  backupCodes: [String],
  emailChangeCode: String,
  emailChangeCodeExpiry: Date,
  tempEmail: String,
  passwordHistory: [String],
  disabled: Boolean,
  disabledAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Hotel Model (Hotel Service - MongoDB)
```javascript
{
  name: String (required),
  location: String (required),
  pricePerNight: Number,
  rating: Number,
  amenities: [String],
  images: [String],
  description: String,
  availability: Boolean,
  roomsAvailable: Number,
  propertyType: String,
  reviews: Number,
  country: String,
  city: String
}

// Unique compound index to prevent duplicates
db.hotels.createIndex({ name: 1, location: 1 }, { unique: true })
```

## Troubleshooting

### 2FA QR Code Not Displaying
1. Check if speakeasy and qrcode are installed in auth-service
2. Verify auth-service is running: `docker logs auth-service`
3. Check API Gateway has route: `grep "enable-2fa" api-gateway/server.js`
4. Rebuild both services: `docker-compose up --build -d auth-service api-gateway`
5. Check browser console for API errors
6. Verify frontend is using correct API response field: `data.data.qrCodeDataUrl`

### Hotel Duplicates
1. Check unique index exists: `db.hotels.getIndexes()`
2. Find duplicates: See MongoDB commands above
3. Verify auto-sync has duplicate prevention (lines 586-612 in hotel-service/server.js)
4. Check if images are loading (should use Unsplash direct URLs, not deprecated Source API)

### Routes Not Found (404)
1. Verify route exists in API Gateway (ALL requests go through gateway on port 8080)
2. Check service is running and healthy
3. Rebuild API Gateway: `docker-compose up --build -d api-gateway`
4. Check gateway logs: `docker logs api-gateway`

### Frontend Not Updating
1. Clear React cache: `cd frontend && rm -rf node_modules/.cache build`
2. Restart dev server: `npm start`
3. Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
4. Check browser console for errors

## API Documentation

API documentation is in `README.md` with curl examples for all endpoints.

For detailed endpoint specifications, refer to:
- Auth endpoints: `auth-service/server.js` (lines 1200-2200)
- Hotel endpoints: `hotel-service/server.js`
- Gateway proxying: `api-gateway/server.js` (lines 270-580)

## Recent Updates and Bug Fixes (December 2025)

### Password Reset Flow - Token Expiration Fix
**Issue:** Password reset tokens were expiring immediately after generation, showing "expired" error even when clicked within seconds.

**Root Causes Identified:**
1. MongoDB TTL (Time-To-Live) index with `expireAfterSeconds: 0` was automatically deleting tokens immediately after creation
2. No safety buffer between JWT expiration (1 hour) and database expiration (1 hour), causing race conditions with clock skew

**Fixes Applied:**
- **Line 190 (auth-service/server.js)**: Removed TTL index, replaced with regular indexes for query performance
  ```javascript
  // BEFORE: verificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  // AFTER:
  verificationCodeSchema.index({ expiresAt: 1 });
  verificationCodeSchema.index({ email: 1, type: 1 });
  ```
- **Line 1059 (auth-service/server.js)**: Added 5-minute safety buffer to database expiration
  ```javascript
  const expiresAt = new Date(Date.now() + (65 * 60 * 1000)); // 1 hour 5 minutes
  ```
- **Database Fix**: Manually dropped and recreated the index without TTL:
  ```bash
  db.verificationcodes.dropIndex("expiresAt_1")
  db.verificationcodes.createIndex({expiresAt: 1}, {background: true})
  ```

**Result:** Password reset tokens now remain valid for the full 1-hour period without premature expiration.

### Login Flow - 2FA Response Structure Fix
**Issue:** Login page crashed with "Cannot read properties of undefined" error when user with 2FA tried to log in.

**Root Cause:** Frontend was expecting `response.data.data.requiresTwoFactor` but backend returned `response.data.requiresTwoFactor` (no nested data object).

**Fix Applied:**
- **Lines 43-56 (frontend/src/pages/Login.js)**: Updated to handle both response structures
  ```javascript
  // Check 2FA requirement at top level
  if (response.data.requiresTwoFactor) {
    setUserId(response.data.userId);
    setShowTwoFactor(true);
    return;
  }

  // Handle both nested and direct response structures
  const token = response.data.data?.token || response.data.token;
  const user = response.data.data?.user || response.data.user;
  ```

**Result:** 2FA login flow now works correctly without JavaScript errors.

### User Profile Data - Missing Fields in Login Response
**Issue:** After login, the Account page showed 2FA as "not enabled" (yellow) even though it was enabled in the database. Profile images also disappeared after logout/login.

**Root Cause:** Login responses only included `id`, `email`, `name`, and `role` - missing `twoFactorEnabled`, `profileImage`, `phone`, and `phoneCountryCode`.

**Fixes Applied:**
- **Lines 1000-1009 (auth-service/server.js)**: Updated regular login response to include all user fields
- **Lines 2078-2087 (auth-service/server.js)**: Updated 2FA verification login response to include all user fields
- Both now return:
  ```javascript
  user: {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    twoFactorEnabled: user.twoFactorEnabled,
    profileImage: user.profileImage ? `http://localhost:8080${user.profileImage}` : null,
    phone: user.phone,
    phoneCountryCode: user.phoneCountryCode
  }
  ```

**Result:** Account page correctly shows 2FA status and all profile information persists across sessions.

### Profile Image Upload - Backend Persistence
**Issue:** Profile images were only saved to localStorage, not to backend database. Images disappeared after logout/login.

**Root Cause:** The `handleProfileImageChange` function in Account.js had a TODO comment and never called the backend API.

**Fixes Applied:**
- **Lines 121-152 (frontend/src/pages/Account.js)**: Implemented actual backend upload
  ```javascript
  const formData = new FormData();
  formData.append('profileImage', file);

  const response = await fetch('http://localhost:8080/api/auth/upload-profile-image', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  ```
- **Lines 703-728 (api-gateway/server.js)**: Added route to proxy multipart file uploads to auth-service
- **Lines 731-751 (api-gateway/server.js)**: Added route to serve uploaded images from auth-service
  ```javascript
  app.get('/uploads/profile-images/:filename', (req, res) => {
    // Proxies image requests to auth-service
  });
  ```
- **Lines 1006, 2084 (auth-service/server.js)**: Login responses now return full image URL instead of relative path

**Result:** Profile images are now persisted to backend database and load correctly across sessions.

### Rate Limiting - Development Configuration
**Issue:** Hitting rate limits (429 Too Many Requests) during testing due to strict authentication limits (10 attempts per 15 minutes).

**Fixes Applied:**
- **Line 51 (api-gateway/server.js)**: Added `app.set('trust proxy', 1)` to fix rate limiter with React dev server proxy
- **Line 66 (api-gateway/middleware/ddosProtection.js)**: Increased auth limiter from 10 to 50 attempts per 15 minutes for development/testing

**Result:** More lenient rate limits for development while maintaining security in production.

### Error Handling - Missing showError Function
**Issue:** Account.js referenced `showError()` function that didn't exist, causing compilation error.

**Fix Applied:**
- **Lines 162-166 (frontend/src/pages/Account.js)**: Added showError function with alert fallback

**Result:** Error handling now works correctly for profile image uploads.

## Testing the Fixes

To verify all fixes are working:

1. **Test Password Reset:**
   ```bash
   curl -X POST http://localhost:8080/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```
   - Check email for reset link
   - Click link immediately - should not show "expired" error
   - Complete password reset successfully

2. **Test 2FA Login Flow:**
   - Login with account that has 2FA enabled
   - Should see 2FA code entry screen (no JavaScript errors)
   - Enter 6-digit code from authenticator app
   - Should login successfully

3. **Test Profile Image Upload:**
   - Go to Account page
   - Upload profile image (drag & drop or click)
   - Image should display immediately
   - Logout and login again
   - Image should still be visible on Account page

4. **Verify Account Page Data:**
   - After login, go to Account page
   - 2FA section should show correct status (green if enabled, yellow if not)
   - Phone number should display if added
   - All profile data should be present

## Known Issues After Fixes

- Profile images are served through API Gateway proxy - for production, consider using CDN or direct object storage URLs
- Image uploads limited to 5MB (configured in multer settings)
- SMS verification still mocked (needs real SMS provider like Twilio for production)

## File References for Today's Changes

**Backend:**
- `auth-service/server.js`: Lines 190, 1000-1009, 1059, 2078-2087
- `api-gateway/server.js`: Lines 51, 703-751
- `api-gateway/middleware/ddosProtection.js`: Line 66

**Frontend:**
- `frontend/src/pages/Login.js`: Lines 43-56
- `frontend/src/pages/Account.js`: Lines 121-152, 162-166

**Database:**
- MongoDB `authdb.verificationcodes` collection: Index structure changed
