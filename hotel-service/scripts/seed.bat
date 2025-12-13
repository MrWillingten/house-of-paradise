@echo off
REM Hotel Database Seeding Script for Windows
REM Quick-start script for seeding the database with 15,000+ hotels

echo ==================================================
echo   Hotel Database Seeding Script
echo ==================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo Node.js: Found
echo.

REM Check if MongoDB is running
echo Checking MongoDB connection...
where mongosh >nul 2>nul
if %errorlevel% equ 0 (
    mongosh --eval "db.adminCommand('ping')" --quiet >nul 2>nul
    if %errorlevel% equ 0 (
        echo MongoDB: Running
    ) else (
        echo MongoDB: Not accessible
        echo.
        echo Please start MongoDB first:
        echo   - Local: mongod
        echo   - Docker: docker-compose up -d mongodb
        pause
        exit /b 1
    )
) else (
    echo MongoDB client not found, skipping connection check
)

echo.
echo Starting seeding process...
echo This will take approximately 2-5 minutes
echo.
echo Please wait...
echo.

REM Run the seeding script
node seed-real-hotels.js

if %errorlevel% equ 0 (
    echo.
    echo ==================================================
    echo   SUCCESS: Seeding completed!
    echo ==================================================
    echo.
    echo Next steps:
    echo   1. Start the hotel service: npm start
    echo   2. Test API: curl http://localhost:3001/api/hotels
    echo   3. View in browser: http://localhost:3001/api/hotels?limit=10
    echo.
) else (
    echo.
    echo ==================================================
    echo   ERROR: Seeding failed
    echo ==================================================
    echo.
    echo Check the error messages above for details
    echo.
)

pause
