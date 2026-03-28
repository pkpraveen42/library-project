@echo off
cd /d %~dp0
echo Simple Browser Launch - Library Purchase Management
echo ===============================================

REM Quick start - just run both servers and open browser
echo Starting servers...
start "Backend Server" cmd /c "npm run server"
timeout /t 2 /nobreak >nul
start "Frontend Server" cmd /c "npm run start:frontend"

echo Waiting for application to start...
timeout /t 5 /nobreak >nul

echo Opening browser...
start http://localhost:4200

echo Application is running in browser!
echo Backend: http://localhost:3000
echo Frontend: http://localhost:4200
echo.
echo Press Ctrl+C in server windows to stop
pause
