@echo off
echo Installing Node.js for Library Purchase Management App...
echo.

REM Check if Node.js is already installed
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Node.js is already installed
    node --version
    echo.
    pause
    exit /b 0
)

echo Downloading Node.js installer...
powershell -Command "& {Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi' -OutFile 'node-installer.msi'}"

if not exist node-installer.msi (
    echo Failed to download Node.js installer
    pause
    exit /b 1
)

echo Installing Node.js...
msiexec /i node-installer.msi /quiet /norestart

echo Verifying installation...
timeout /t 5 /nobreak >nul
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Node.js installed successfully!
    node --version
) else (
    echo Node.js installation may have failed. Please install manually from https://nodejs.org
)

echo Cleaning up...
if exist node-installer.msi del node-installer.msi

echo.
echo Installation complete. You can now run the Library Purchase Management app.
pause
