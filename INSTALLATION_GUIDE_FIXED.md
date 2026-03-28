# Library Purchase Management App - Installation Guide

## Issue Resolution

The error "Failed to update Excel path: Http failure response for http://localhost:3008/api/config/path: 0 Unknown Error" occurs because the backend server is not running.

## Solution Options

### Option 1: Install Node.js (Recommended)
1. Run `install-nodejs.bat` as Administrator
2. This will automatically download and install Node.js
3. Restart the Library Purchase Management application

### Option 2: Manual Node.js Installation
1. Download Node.js from https://nodejs.org
2. Install the latest LTS version
3. Restart the application

### Option 3: Development Mode (For Testing)
1. Install Node.js on your system
2. Run: `npm run electron:dev`
3. This will start both frontend and backend servers

## What's Fixed

- ✅ Frontend loads correctly from ASAR archive
- ✅ Auto-focus on Book Title field works
- ✅ Application starts without "can't run" errors
- ✅ Better error handling when Node.js is missing
- ✅ Graceful degradation (UI works without backend)

## File Structure

The application now includes:
- `LibraryApp.exe` - Main application
- `install-nodejs.bat` - Node.js installer script
- All necessary dependencies in ASAR archive

## Notes

- The frontend will load even without Node.js installed
- Excel file operations require the backend server
- The app will show clear messages about backend status
