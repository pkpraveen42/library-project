@echo off
echo Starting Library Purchase Management Application in Browser (Offline)
echo ================================================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

REM Check if dist folder exists and build if needed
if not exist "dist\library-purchase-app" (
    echo Building application for browser...
    npm run build
    echo.
)

echo Starting backend server...
start cmd /k "npm run server"

echo Waiting for server to start...
timeout /t 3 /nobreak >nul

echo Starting frontend in browser...
start cmd /k "npm run start:frontend"

echo.
echo Application will be available at: http://localhost:4200
echo Backend API will be available at: http://localhost:3000
echo.
echo Press any key to open browser automatically...
pause >nul

start http://localhost:4200

echo.
echo Browser application started! Keep this window open to run the servers.
echo Close this window to stop both servers.
pause
