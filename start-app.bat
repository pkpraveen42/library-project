@echo off
echo Starting Library Purchase App...
echo.

echo Step 1: Starting backend server...
start "Backend Server" cmd /c "npm run server && pause"

echo Step 2: Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo Step 3: Starting Angular frontend with proxy...
echo Backend: http://localhost:3008
echo Frontend: http://localhost:4200
echo.
echo The proxy will handle all API requests automatically!
echo.
npm run start:frontend

pause
