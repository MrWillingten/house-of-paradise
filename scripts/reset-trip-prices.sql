-- Reset all trip prices to realistic base values based on Booking.com prices

-- Flights (long-haul domestic/international)
UPDATE trips SET price = 350, available_seats = 180 WHERE origin = 'New York, USA'; -- NY to LA
UPDATE trips SET price = 280, available_seats = 200 WHERE origin = 'Dubai, UAE'; -- Dubai to Mumbai
UPDATE trips SET price = 320, available_seats = 190 WHERE origin = 'Toronto, Canada'; -- Toronto to Vancouver
UPDATE trips SET price = 180, available_seats = 150 WHERE origin = 'Buenos Aires, Argentina'; -- Buenos Aires to Mendoza

-- Flights (medium-haul)
UPDATE trips SET price = 150, available_seats = 180 WHERE origin = 'Sydney, Australia'; -- Sydney to Melbourne
UPDATE trips SET price = 140, available_seats = 160 WHERE origin = 'Johannesburg, South Africa'; -- Johannesburg to Cape Town
UPDATE trips SET price = 120, available_seats = 140 WHERE origin = 'Cairo, Egypt'; -- Cairo to Luxor
UPDATE trips SET price = 110, available_seats = 150 WHERE origin = 'São Paulo, Brazil'; -- São Paulo to Rio

-- Flights (short-haul)
UPDATE trips SET price = 95, available_seats = 180 WHERE origin = 'Singapore'; -- Singapore to KL
UPDATE trips SET price = 75, available_seats = 170 WHERE origin = 'Bangkok, Thailand'; -- Bangkok to Chiang Mai

-- High-speed trains (premium)
UPDATE trips SET price = 130, available_seats = 600 WHERE origin = 'Tokyo, Japan'; -- Shinkansen
UPDATE trips SET price = 120, available_seats = 450 WHERE origin = 'London, UK'; -- Eurostar
UPDATE trips SET price = 90, available_seats = 400 WHERE origin = 'Berlin, Germany'; -- ICE
UPDATE trips SET price = 85, available_seats = 350 WHERE origin = 'Madrid, Spain'; -- AVE
UPDATE trips SET price = 80, available_seats = 300 WHERE origin = 'Stockholm, Sweden'; -- SJ

-- Regular trains (moderate)
UPDATE trips SET price = 70, available_seats = 380 WHERE origin = 'Rome, Italy'; -- Frecciarossa
UPDATE trips SET price = 55, available_seats = 500 WHERE origin = 'Seoul, South Korea'; -- KTX
UPDATE trips SET price = 50, available_seats = 250 WHERE origin = 'Athens, Greece'; -- Hellenic Train
UPDATE trips SET price = 45, available_seats = 280 WHERE origin = 'Amsterdam, Netherlands'; -- Thalys
UPDATE trips SET price = 35, available_seats = 320 WHERE origin = 'Istanbul, Turkey'; -- TCDD
