const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });


  // Geliştirme modunda mı kontrol et
  const isDevelopment = process.env.NODE_ENV.trim() === 'development';


  if (isDevelopment) {
    console.log('Geliştirme modunda çalışıyor...');
    win.loadURL('http://localhost:5173');
  } else {
    console.log('Üretim modunda çalışıyor...');
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});