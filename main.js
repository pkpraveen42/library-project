const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
let serverProcess = null;

function startBackend() {
  console.log('🚀 Starting backend server...');
  const serverPath = path.join(__dirname, 'server.js');
  
  // Check if server.js exists
  if (!fs.existsSync(serverPath)) {
    console.error('❌ Server file not found at:', serverPath);
    return;
  }
  
  // Try multiple Node.js paths
  const nodePaths = [
    'node',
    path.join(__dirname, '..', 'node.exe'),
    path.join(process.resourcesPath, 'node.exe'),
    'C:\\Program Files\\nodejs\\node.exe',
    'C:\\Program Files (x86)\\nodejs\\node.exe'
  ];
  
  let nodeExecutable = null;
  for (const nodePath of nodePaths) {
    try {
      if (fs.existsSync(nodePath) || nodePath === 'node') {
        nodeExecutable = nodePath;
        console.log('📁 Using Node.js at:', nodePath);
        break;
      }
    } catch (e) {
      // Continue to next path
    }
  }
  
  if (!nodeExecutable) {
    console.error('❌ Node.js executable not found. Backend will not start.');
    console.log('💡 Please install Node.js or include it with the application.');
    return;
  }
  
  // Start the server
  serverProcess = spawn(nodeExecutable, [serverPath], {
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  serverProcess.on('error', (err) => {
    console.error('❌ Failed to start backend:', err);
    if (err.code === 'ENOENT') {
      console.error('❌ Node.js not found in packaged environment.');
      console.log('💡 Note: Excel file operations will not work without backend server.');
      console.log('💡 To enable full functionality, ensure Node.js is installed on the target system.');
    }
  });

  serverProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.log(`⏹️ Backend process exited with code ${code}`);
      if (code === 1) {
        console.log('💡 This might be due to port 3008 being in use. The app will try to continue...');
      }
    }
  });

  // Give server time to start
  setTimeout(() => {
    if (serverProcess && !serverProcess.killed) {
      console.log('✅ Backend server appears to be running');
    } else {
      console.log('⚠️ Backend server is not running, but frontend will continue to load');
    }
  }, 3000);
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
    
    // Check if the path exists, if not try alternative paths
    if (!fs.existsSync(indexPath)) {
      console.log('❌ Path does not exist:', indexPath);
      
      // Try path for ASAR archive (this is the correct one for packaged apps)
      const asarPath = path.join(__dirname, '..', 'app', 'dist', 'library-purchase-app', 'browser', 'index.html');
      console.log('🔄 Trying ASAR path:', asarPath);
      
      if (fs.existsSync(asarPath)) {
        win.loadFile(asarPath)
          .then(() => {
            console.log('✅ Successfully loaded from ASAR path');
            win.show();
          })
          .catch(error => {
            console.error('❌ Failed to load from ASAR path:', error.message);
            showErrorPage(asarPath, error.message);
          });
      } else {
        // Try resources path
        const resourcesPath = path.join(process.resourcesPath, 'app.asar', 'dist', 'library-purchase-app', 'browser', 'index.html');
        console.log('🔄 Trying resources path:', resourcesPath);
        
        if (fs.existsSync(resourcesPath)) {
          win.loadFile(resourcesPath)
            .then(() => {
              console.log('✅ Successfully loaded from resources path');
              win.show();
            })
            .catch(error => {
              console.error('❌ Failed to load from resources path:', error.message);
              showErrorPage(resourcesPath, error.message);
            });
        } else {
          console.error('❌ None of the production paths exist');
          console.log('📁 Available paths checked:');
          console.log('  -', indexPath);
          console.log('  -', asarPath);
          console.log('  -', resourcesPath);
          showErrorPage(indexPath, 'Production build files not found in any expected location');
        }
      }
    } else {
      win.loadFile(indexPath)
        .then(() => {
          console.log('✅ Successfully loaded production build');
          win.show();
        })
        .catch(error => {
          console.error('❌ Failed to load production build:', error.message);
          showErrorPage(indexPath, error.message);
        });
    }
  }
  
  function showErrorPage(attemptedPath, errorMessage) {
    win.webContents.loadURL(`data:text/html,<html><body><h1>Library App - Loading Error</h1><p><strong>Attempted Path:</strong> ${attemptedPath.replace(/\\/g, '/')}</p><p><strong>Error:</strong> ${errorMessage}</p><hr><h3>Troubleshooting:</h3><ul><li>Ensure the app was built correctly</li><li>Check if all files are included in the package</li><li>Try rebuilding: npm run package</li></ul></body></html>`);
    win.show();
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
