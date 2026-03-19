const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
let serverProcess = null;

function startBackend() {
  console.log('🚀 Starting backend server...');
  const serverPath = path.join(__dirname, 'server.js');
  
  serverProcess = spawn('node', [serverPath], {
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  serverProcess.on('error', (err) => {
    console.error('❌ Failed to start backend:', err);
  });

  serverProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.log(`⏹️ Backend process exited with code ${code}`);
    }
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
    show: false // Hide window initially
  });

  const isDev = process.env.NODE_ENV === 'development' || process.env.ELECTRON_IS_DEV;
  
  if (isDev) {
    console.log('Development mode: Attempting to load from http://localhost:4200');
    
    // Simple approach: Load directly with error handling
    win.loadURL('http://localhost:4200')
      .then(() => {
        console.log('✅ Successfully loaded Angular app');
        win.show();
        win.webContents.openDevTools();
      })
      .catch(error => {
        console.error('❌ Failed to load Angular app:', error.message);
        console.log('🔧 Trying alternative approaches...');
        
        // Try loading built files as fallback
        const indexPath = path.join(__dirname, 'dist', 'library-purchase-app', 'browser', 'index.html');
        console.log('📁 Trying to load from:', indexPath);
        
        win.loadFile(indexPath)
          .then(() => {
            console.log('✅ Successfully loaded from built files');
            win.show();
          })
          .catch(fileError => {
            console.error('❌ Failed to load built files:', fileError.message);
            console.log('📝 Creating simple error page...');
            
            // Create simple error page
            win.webContents.loadURL('data:text/html,<html><body><h1>Library App Loading Error</h1><p>Please ensure:</p><ul><li>Angular dev server is running (npm run start:frontend)</li><li>Backend server is running (npm run server)</li><li>Try running: npm run electron:dev</li></ul></body></html>');
            win.show();
          });
      });
  } else {
    // Production Mode
    const indexPath = path.join(__dirname, 'dist', 'library-purchase-app', 'browser', 'index.html');
    console.log('Production mode: Loading from', indexPath);
    
    win.loadFile(indexPath)
      .then(() => {
        console.log('✅ Successfully loaded production build');
        win.show();
      })
      .catch(error => {
        console.error('❌ Failed to load production build:', error.message);
        console.log('📁 Attempted path:', indexPath);
        
        // Simple fallback error display for production
        win.webContents.loadURL(`data:text/html,<html><body><h1>App Load Error</h1><p>Path: ${indexPath.replace(/\\/g, '/')}</p><p>Error: ${error.message}</p></body></html>`);
        win.show();
      });
  }
  
  // Monitor loading progress
  win.webContents.on('did-start-loading', () => {
    console.log('🔄 Started loading...');
  });
  
  win.webContents.on('did-stop-loading', () => {
    console.log('⏹️ Stopped loading');
  });
  
  win.webContents.on('dom-ready', () => {
    console.log('🌐 DOM is ready');
  });
}

app.whenReady().then(() => {
  startBackend();
  createWindow();
});

// Kill backend on exit
app.on('will-quit', () => {
  if (serverProcess) {
    console.log('Stopping backend server...');
    serverProcess.kill();
  }
});

// Handle app closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
