@echo off
echo ========================================
echo Library Purchase Management - Portable Maker
echo ========================================
echo.

echo Choose option:
echo 1. Create portable folder (for other systems)
echo 2. Create browser .exe file
echo 3. Start browser version now
echo.
set /p choice="Enter choice (1-3): "

if "%choice%"=="1" goto PORTABLE
if "%choice%"=="2" goto BROWSER_EXE
if "%choice%"=="3" goto START_NOW
goto END

:PORTABLE
echo.
echo Creating portable folder...
if not exist "LibraryApp-Portable" mkdir "LibraryApp-Portable"

echo Copying files...
xcopy "dist\library-purchase-app\*" "LibraryApp-Portable\app\" /E /I /Y >nul 2>&1
xcopy "server.js" "LibraryApp-Portable\" /Y >nul
xcopy "package.json" "LibraryApp-Portable\" /Y >nul
xcopy "run-simple-browser.bat" "LibraryApp-Portable\" /Y >nul
xcopy "node_modules" "LibraryApp-Portable\" /E /I /Q >nul

echo.
echo Portable folder created: LibraryApp-Portable
echo.
echo TO USE ON ANOTHER SYSTEM:
echo 1. Copy LibraryApp-Portable folder to new computer
echo 2. Double-click: run-simple-browser.bat
echo 3. Browser will open automatically at localhost:4200
echo.
goto END

:BROWSER_EXE
echo.
echo Installing Nativefier...
npm install -g nativefier

echo Building application...
npm run build

echo Starting server...
start cmd /c "npm run server"
timeout /t 5 /nobreak >nul

echo Creating browser .exe...
nativefier "http://localhost:3000" --name "LibraryApp" --icon "icon.ico" --single-instance --outdir "browser-exe"

echo.
echo Browser .exe created in: browser-exe folder
goto END

:START_NOW
echo.
echo Starting browser version...
start cmd /c "npm run server"
timeout /t 3 /nobreak >nul
start http://localhost:3000
echo Application running at http://localhost:3000
pause

:END
echo.
echo Done!
