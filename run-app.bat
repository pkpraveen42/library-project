@echo off
echo Starting Library Purchase App...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Kill any existing Node.js processes to avoid port conflicts
echo Stopping any existing Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

REM Start the application
echo Starting application...
npm run electron

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to start the application
    echo Please check the error messages above
    pause
    exit /b 1
)

echo Application closed successfully.
pause
