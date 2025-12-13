-- House of Paradise - Supabase PostgreSQL Setup
-- Run this in Supabase SQL Editor

-- Payment Service Tables
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

-- Create index for faster user queries
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);

-- Trip Service Tables (Spring Boot JPA will auto-create, but here's the structure)
CREATE TABLE IF NOT EXISTS trips (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    destination VARCHAR(255) NOT NULL,
    start_date DATE,
    end_date DATE,
    price DECIMAL(10,2),
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for trip queries
CREATE INDEX IF NOT EXISTS idx_trips_destination ON trips(destination);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);

-- Verify tables were created
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
