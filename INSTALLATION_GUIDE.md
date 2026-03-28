# Library Purchase App - Installation and Running Guide

## Issue Analysis
The "This app can't run on your PC" error occurs due to:
1. **Port conflicts** (port 3008 already in use)
2. **Missing Node.js runtime** for the packaged executable
3. **Insufficient disk space** during packaging
4. **Windows security restrictions** on executable files

## Solutions

### Option 1: Run from Source (Recommended)
1. Ensure Node.js is installed (download from https://nodejs.org/)
2. Open Command Prompt in the project folder
3. Run: `run-app.bat` (automatically handles port conflicts)

### Option 2: Manual Steps
1. Install Node.js if not already installed
2. Open Command Prompt as Administrator
3. Navigate to project folder: `cd T:\Lib-Proj\library-purchase-app`
4. Kill existing processes: `taskkill /F /IM node.exe`
5. Run application: `npm run electron`

### Option 3: Use Packaged Executable
1. Right-click `LibraryApp.exe` → Properties
2. Click "Unblock" if security warning appears
3. Run as Administrator
4. If port conflict occurs, restart PC and try again

## Troubleshooting

### If app shows "Port 3008 is already in use":
- Close all Node.js processes from Task Manager
- Restart the application
- Or restart your PC

### If app shows blank screen:
- Check console for error messages
- Ensure Excel file path is correctly set
- Verify Excel file exists and is not corrupted

### If app won't start:
- Run as Administrator
- Check Windows Defender/antivirus is not blocking the app
- Ensure all required files are present in the folder

## Required Files
Ensure these files are present in the application folder:
- `LibraryApp.exe` (main executable)
- `icon.ico` (application icon)
- All `.dll` files (Electron dependencies)
- `resources` folder (contains app code and server)

## Excel File Setup
1. Prepare Excel file with these headers:
   - ID
   - S.No  
   - Book Title
   - Author
   - ISBN
   - Purchase Date
   - Price
   - Qty
   - Supply
   - Rack
   - Accession Number
   - Publisher

2. Set the Excel file path in the application
3. Click "Apply Path" to load the data

## Technical Details
- **Backend**: Node.js Express server on port 3008
- **Frontend**: Angular application
- **Database**: Excel file (XLSX format)
- **Runtime**: Electron for desktop packaging

## Support
If issues persist:
1. Check Windows Event Viewer for application errors
2. Run from source code using Option 1
3. Ensure all Windows updates are installed
4. Disable antivirus temporarily to test if it's blocking the app
