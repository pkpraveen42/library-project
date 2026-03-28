@echo off
echo ========================================
echo   Library Purchase App Launcher
echo ========================================
echo.
echo Starting Library Purchase App...
echo.

REM Check if the executable exists
if not exist "LibraryApp-win32-x64\LibraryApp.exe" (
    echo ERROR: LibraryApp.exe not found!
    echo Please ensure the application is properly packaged.
    echo.
    pause
    exit /b 1
)

REM Kill any existing Node.js processes to avoid port conflicts
echo Stopping any existing Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

REM Start the application
echo Launching application...
cd LibraryApp-win32-x64
start LibraryApp.exe

echo.
echo Application started! If you encounter issues:
echo 1. Run as Administrator if needed
echo 2. Check Windows Event Viewer for errors
echo 3. Ensure Excel file path is set correctly
echo 4. See INSTALLATION_GUIDE.md for troubleshooting
echo.
pause
