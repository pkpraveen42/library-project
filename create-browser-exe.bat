@echo off
echo Creating Browser-Based .exe File...
echo ===================================

REM Check if nativefier is installed
npm list -g nativefier >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Nativefier (Electron wrapper for web apps)...
    npm install -g nativefier
)

REM Build the application first
echo Building application...
npm run build

REM Start the server first
echo Starting backend server...
start "Backend Server" cmd /c "npm run server"

REM Wait for server to start
echo Waiting for server to start...
timeout /t 5 /nobreak >nul

REM Create browser-based exe
echo Creating browser-based .exe file...
nativefier "http://localhost:3000" ^
    --name "LibraryPurchaseBrowser" ^
    --icon "icon.ico" ^
    --single-instance ^
    --maximize ^
    --internal-urls ".*?localhost.*" ^
    --inject-javascript "electron-focus-fix.js" ^
    --out-dir "browser-exe-output"

echo.
echo Browser-based .exe created in: browser-exe-output folder
echo.
echo This .exe file:
echo - Opens the browser version automatically
echo - Has no field locking issues
echo - Works like a desktop application
echo - Uses the browser version (perfect focus)
echo.
pause
