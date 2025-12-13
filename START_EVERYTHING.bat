@echo off
echo ========================================
echo   HOUSE OF PARADISE - STARTUP SCRIPT
echo ========================================
echo.

echo [1/3] Starting MongoDB...
docker-compose up -d mongo
timeout /t 15 /nobreak > nul
echo MongoDB started!
echo.

echo [2/3] Starting Hotel Service...
cd hotel-service
start "Hotel Service" cmd /k "npm start"
cd ..
timeout /t 5 /nobreak > nul
echo.

echo [3/3] Starting Frontend...
cd frontend
start "Frontend" cmd /k "npm start"
cd ..
echo.

echo ========================================
echo   ALL SERVICES STARTING!
echo ========================================
echo.
echo Hotel Service: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Wait 30 seconds then open: http://localhost:3000
echo.
echo Press any key to exit this window...
pause > nul
