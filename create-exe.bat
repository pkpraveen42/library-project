@echo off
echo Creating portable executable...
echo.

REM Create a simple launcher that doesn't require full packaging
echo This launcher will start the app using system electron if available

REM Try to find electron
set ELECTRON_PATH=
if exist "node_modules\electron\dist\electron.exe" (
    set ELECTRON_PATH=node_modules\electron\dist\electron.exe
    echo Found electron in node_modules
)

if not defined ELECTRON_PATH (
    echo Electron not found in node_modules
    echo Please install dependencies: npm install
    pause
    exit /b 1
)

REM Create the launcher
echo Creating LibraryApp.exe launcher...
echo @echo off > LibraryApp.exe
echo title Library Purchase Management >> LibraryApp.exe
echo echo Starting Library Purchase Management... >> LibraryApp.exe
echo echo. >> LibraryApp.exe
echo "%ELECTRON_PATH%" . >> LibraryApp.exe

echo Created LibraryApp.exe launcher
echo.
echo To run the application:
echo 1. Double-click LibraryApp.exe
echo 2. Or run START_LIBRARY_APP.bat
echo.
pause
