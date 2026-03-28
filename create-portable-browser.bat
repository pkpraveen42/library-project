@echo off
echo Creating Portable Browser Package...
echo ===================================

REM Create portable folder
if not exist "LibraryApp-Portable-Browser" mkdir "LibraryApp-Portable-Browser"
if not exist "LibraryApp-Portable-Browser\app" mkdir "LibraryApp-Portable-Browser\app"

echo Copying application files...
xcopy "dist\library-purchase-app\*" "LibraryApp-Portable-Browser\app\" /E /I /Y
xcopy "server.js" "LibraryApp-Portable-Browser\" /Y
xcopy "package.json" "LibraryApp-Portable-Browser\" /Y
xcopy "node_modules" "LibraryApp-Portable-Browser\" /E /I /Y
xcopy "run-simple-browser.bat" "LibraryApp-Portable-Browser\" /Y
xcopy "README-OFFLINE-BROWSER.md" "LibraryApp-Portable-Browser\" /Y

echo Creating portable launcher...
echo @echo off > "LibraryApp-Portable-Browser\START-LibraryApp.bat"
echo echo Starting Library Purchase Management... >> "LibraryApp-Portable-Browser\START-LibraryApp.bat"
echo cd /d "%%~dp0" >> "LibraryApp-Portable-Browser\START-LibraryApp.bat"
echo start "Backend" cmd /c "node server.js" >> "LibraryApp-Portable-Browser\START-LibraryApp.bat"
echo timeout /t 3 /nobreak ^>nul >> "LibraryApp-Portable-Browser\START-LibraryApp.bat"
echo start http://localhost:3000 >> "LibraryApp-Portable-Browser\START-LibraryApp.bat"
echo echo. >> "LibraryApp-Portable-Browser\START-LibraryApp.bat"
echo echo Application is running! >> "LibraryApp-Portable-Browser\START-LibraryApp.bat"
echo echo Keep this window open >> "LibraryApp-Portable-Browser\START-LibraryApp.bat"
echo pause >> "LibraryApp-Portable-Browser\START-LibraryApp.bat"

echo Creating desktop shortcut...
echo [InternetShortcut] > "LibraryApp-Portable-Browser\LibraryApp.url"
echo URL=http://localhost:3000 >> "LibraryApp-Portable-Browser\LibraryApp.url"
echo IconIndex=1 >> "LibraryApp-Portable-Browser\LibraryApp.url"

echo.
echo Portable package created: LibraryApp-Portable-Browser
echo.
echo To use on another system:
echo 1. Copy the entire LibraryApp-Portable-Browser folder
echo 2. Double-click START-LibraryApp.bat on the new system
echo 3. Browser will open automatically
echo.
pause
