# House of Paradise - Free Deployment Guide

## Your Database Credentials (KEEP PRIVATE!)

### MongoDB Atlas
```
Connection String: mongodb+srv://aminzou54_db_user:GIAKXlmboXdZ31F9@microservicesmongodb.ktah2ws.mongodb.net/
- hoteldb: For hotels, bookings, reviews, loyalty
- authdb: For users, tokens, verification
```

### Supabase PostgreSQL
```
Host: aws-0-eu-central-1.pooler.supabase.com
Port: 6543
Database: postgres
User: postgres.jzgpccyyqtgslkgomljz
Password: Amin-Zou_45
```

---

## STEP 1: Import Your Data to Cloud Databases

### 1.1 Configure MongoDB Atlas Network Access
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Click "Allow Access From Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 1.2 Import Data to MongoDB Atlas

Open your terminal and run:

```bash
# Navigate to your project
cd "C:\Users\son5a\Desktop\Cloud Project Travel Booking Microservices\travel-booking-microservices"

# Make sure Docker is running, then export and import hoteldb
docker exec mongodb mongoexport --db hoteldb --collection hotels --out /data/db/hotels.json
docker exec mongodb mongoexport --db hoteldb --collection bookings --out /data/db/bookings.json
docker exec mongodb mongoexport --db hoteldb --collection loyaltyprofiles --out /data/db/loyaltyprofiles.json

# Export authdb
docker exec mongodb mongoexport --db authdb --collection users --out /data/db/users.json

# Copy files from container
docker cp mongodb:/data/db/hotels.json ./database-backups/
docker cp mongodb:/data/db/bookings.json ./database-backups/
docker cp mongodb:/data/db/loyaltyprofiles.json ./database-backups/
docker cp mongodb:/data/db/users.json ./database-backups/

# Import to Atlas (run each command)
mongoimport --uri "mongodb+srv://aminzou54_db_user:GIAKXlmboXdZ31F9@microservicesmongodb.ktah2ws.mongodb.net/hoteldb" --collection hotels --file ./database-backups/hotels.json
mongoimport --uri "mongodb+srv://aminzou54_db_user:GIAKXlmboXdZ31F9@microservicesmongodb.ktah2ws.mongodb.net/hoteldb" --collection bookings --file ./database-backups/bookings.json
mongoimport --uri "mongodb+srv://aminzou54_db_user:GIAKXlmboXdZ31F9@microservicesmongodb.ktah2ws.mongodb.net/hoteldb" --collection loyaltyprofiles --file ./database-backups/loyaltyprofiles.json
mongoimport --uri "mongodb+srv://aminzou54_db_user:GIAKXlmboXdZ31F9@microservicesmongodb.ktah2ws.mongodb.net/authdb" --collection users --file ./database-backups/users.json
```

**Note:** If you don't have mongoimport installed, download MongoDB Database Tools from:
https://www.mongodb.com/try/download/database-tools

### 1.3 Import PostgreSQL Data to Supabase

1. Go to Supabase Dashboard → SQL Editor
2. Run the following to create the payments table:

```sql
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    booking_type VARCHAR NOT NULL,
    booking_id VARCHAR NOT NULL,
    amount FLOAT NOT NULL,
    payment_method VARCHAR NOT NULL,
    status VARCHAR DEFAULT 'pending',
    transaction_id VARCHAR UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## STEP 2: Push Code to GitHub

```bash
cd "C:\Users\son5a\Desktop\Cloud Project Travel Booking Microservices\travel-booking-microservices"

# Initialize git if not already
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for production deployment"

# Add your GitHub remote (create repo first on github.com)
git remote add origin https://github.com/YOUR_USERNAME/travel-booking-microservices.git

# Push
git push -u origin main
```

---

## STEP 3: Deploy Backend Services to Render.com

### 3.1 Create Render Account
Go to https://render.com and sign up (free)

### 3.2 Deploy Each Service

For each service, go to **Dashboard → New → Web Service → Connect Repository**

#### Service 1: Auth Service
| Setting | Value |
|---------|-------|
| Name | hop-auth-service |
| Root Directory | auth-service |
| Runtime | Node |
| Build Command | npm install |
| Start Command | node server.js |

**Environment Variables:**
```
MONGODB_URI=mongodb+srv://aminzou54_db_user:GIAKXlmboXdZ31F9@microservicesmongodb.ktah2ws.mongodb.net/authdb?retryWrites=true&w=majority
JWT_SECRET=HoP-Travel-Production-JWT-Secret-2024-SuperSecure-64chars-min-change-me
PORT=3004
```

#### Service 2: Hotel Service
| Setting | Value |
|---------|-------|
| Name | hop-hotel-service |
| Root Directory | hotel-service |
| Runtime | Node |
| Build Command | npm install |
| Start Command | node server.js |

**Environment Variables:**
```
MONGO_URI=mongodb+srv://aminzou54_db_user:GIAKXlmboXdZ31F9@microservicesmongodb.ktah2ws.mongodb.net/hoteldb?retryWrites=true&w=majority
PORT=3001
```

#### Service 3: Payment Service
| Setting | Value |
|---------|-------|
| Name | hop-payment-service |
| Root Directory | payment-service |
| Runtime | Python 3 |
| Build Command | pip install -r requirements.txt |
| Start Command | uvicorn main:app --host 0.0.0.0 --port $PORT |

**Environment Variables:**
```
DATABASE_URL=postgresql://postgres.jzgpccyyqtgslkgomljz:Amin-Zou_45@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

#### Service 4: Trip Service
| Setting | Value |
|---------|-------|
| Name | hop-trip-service |
| Root Directory | trip-service |
| Runtime | Docker |
| Dockerfile Path | ./Dockerfile |

**Environment Variables:**
```
SPRING_DATASOURCE_URL=jdbc:postgresql://aws-0-eu-central-1.pooler.supabase.com:6543/postgres
SPRING_DATASOURCE_USERNAME=postgres.jzgpccyyqtgslkgomljz
SPRING_DATASOURCE_PASSWORD=Amin-Zou_45
```

#### Service 5: API Gateway (Deploy LAST)
| Setting | Value |
|---------|-------|
| Name | hop-api-gateway |
| Root Directory | api-gateway |
| Runtime | Node |
| Build Command | npm install |
| Start Command | node server.js |

**Environment Variables (use YOUR actual Render URLs):**
```
PORT=8080
JWT_SECRET=HoP-Travel-Production-JWT-Secret-2024-SuperSecure-64chars-min-change-me
HOTEL_SERVICE_URL=https://hop-hotel-service.onrender.com
TRIP_SERVICE_URL=https://hop-trip-service.onrender.com
PAYMENT_SERVICE_URL=https://hop-payment-service.onrender.com
AUTH_SERVICE_URL=https://hop-auth-service.onrender.com
```

### 3.3 Get Your Service URLs
After deploying, note down each URL:
- Auth: https://hop-auth-service.onrender.com
- Hotel: https://hop-hotel-service.onrender.com
- Payment: https://hop-payment-service.onrender.com
- Trip: https://hop-trip-service.onrender.com
- **API Gateway: https://hop-api-gateway.onrender.com** ← This is your main backend URL

---

## STEP 4: Deploy Frontend to Vercel

### 4.1 Create Vercel Account
Go to https://vercel.com and sign up (free)

### 4.2 Import Project
1. Click "Add New" → "Project"
2. Import your GitHub repository
3. Configure:
   - **Framework Preset:** Create React App
   - **Root Directory:** frontend
   - **Build Command:** npm run build
   - **Output Directory:** build

### 4.3 Add Environment Variable
```
REACT_APP_API_URL=https://hop-api-gateway.onrender.com
```
(Use your actual API Gateway URL from Render)

### 4.4 Deploy
Click "Deploy" and wait for it to finish.

Your frontend URL will be: https://your-project.vercel.app

---

## STEP 5: Update Auth Service URLs

After you have both URLs:
1. Go to Render → hop-auth-service → Environment
2. Add/Update:
```
FRONTEND_URL=https://your-project.vercel.app
API_GATEWAY_URL=https://hop-api-gateway.onrender.com
```
3. Click "Save Changes" (service will redeploy)

---

## STEP 6: Test Your Deployment

1. Open your Vercel frontend URL
2. Try to register a new account
3. Try to login
4. Browse hotels
5. Make a test booking

---

## Troubleshooting

### Services sleeping (cold start)
Free Render services sleep after 15 minutes of inactivity. First request takes 30-50 seconds to wake up.

**Solution:** Use https://cron-job.org to ping your API Gateway every 14 minutes:
- URL: https://hop-api-gateway.onrender.com/health
- Interval: Every 14 minutes

### CORS errors
If you see CORS errors, make sure your API Gateway has the frontend URL in its CORS configuration.

### Database connection errors
1. Check MongoDB Atlas Network Access allows 0.0.0.0/0
2. Check Supabase connection string is correct
3. Verify passwords don't have special characters that need URL encoding

---

## Your Final URLs

After deployment, you'll have:

| Service | URL |
|---------|-----|
| Frontend | https://your-project.vercel.app |
| API Gateway | https://hop-api-gateway.onrender.com |
| Auth Service | https://hop-auth-service.onrender.com |
| Hotel Service | https://hop-hotel-service.onrender.com |
| Payment Service | https://hop-payment-service.onrender.com |
| Trip Service | https://hop-trip-service.onrender.com |

---

## Cost Summary

| Platform | Cost |
|----------|------|
| MongoDB Atlas | FREE (512MB) |
| Supabase | FREE (500MB) |
| Render (5 services) | FREE (with cold starts) |
| Vercel | FREE |
| **TOTAL** | **$0/month** |
