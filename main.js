const { app, BrowserWindow, ipcMain } = require('electron');

function createWindow () {
  const win = new BrowserWindow({
    width: 500,
    height: 320,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false
    }
  });

  win.setMenu(null);
  win.loadFile('public/index.html');
  // win.webContents.openDevTools();
}

app.allowRendererProcessReuse = true;
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

ipcMain.on('get-fucked', () => {
  app.quit();
});
