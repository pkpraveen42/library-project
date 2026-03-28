# Library Purchase Management - Offline Browser Solution

## 🌐 Run in Browser (Recommended for Offline Use)

### Option 1: Quick Start (Easiest)
```bash
# Double-click this file:
run-simple-browser.bat
```

### Option 2: Full Setup (Recommended)
```bash
# Double-click this file:
run-offline-browser.bat
```

### Option 3: Manual Commands
```bash
# Open terminal in project folder and run:
npm run dev
```

## 📋 Browser vs .exe Comparison

| Feature | Browser Version | .exe Version |
|---------|----------------|--------------|
| **Field Focus** | ✅ Perfect | ❌ Issues |
| **Text Selection** | ✅ Works | ❌ Problems |
| **Field Locking** | ✅ No locking | ❌ Locks occur |
| **Debugging** | ✅ Easy | ❌ Hard |
| **Updates** | ✅ Instant | ❌ Rebuild needed |
| **Cross-Platform** | ✅ Any OS | ❌ Windows only |

## 🚀 Why Browser Version is Better

### ✅ **No Field Locking Issues**
- Input fields work perfectly
- No modal-like behavior
- Smooth user experience

### ✅ **Perfect Focus Management**
- Book Title field focuses correctly
- Text selection works automatically
- No timing conflicts

### ✅ **Easy Debugging**
- Browser DevTools available
- Console logging visible
- Real-time error tracking

### ✅ **Instant Updates**
- Changes appear immediately
- No need to rebuild .exe
- Hot reload available

## 🌐 Access URLs

Once running, access the application at:
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000

## 🔧 Troubleshooting

### If ports are busy:
```bash
# Kill existing processes
npx kill-port 3000 4200
# Then run again
npm run dev
```

### If dependencies missing:
```bash
npm install
```

### If build fails:
```bash
npm run build
```

## 📱 Mobile Access
The browser version also works on mobile devices connected to the same network!
Use your computer's IP address: http://[YOUR-IP]:4200

## 💾 Data Storage
- Browser version uses the same Excel file backend
- All data is stored in your Excel files
- Works completely offline once servers are running
