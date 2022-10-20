const { 
  app, 
  BrowserWindow, 
  ipcMain,
  dialog,
} = require('electron');
const { readdirSync, lstatSync, existsSync, readFileSync, writeFileSync } = require('fs');
const { join } = require('path');
const path = require('path');
const axios = require("axios");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// eslint-disable-next-line global-require
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,

      /**
       * 로컬 주소만 가져온다면 돌리면 보안 이슈는 없음.
       */
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  /**
   * api handler 설정
   */
  ipcMain.handle("api:openDialog", () => {
    const pathArray = dialog.showOpenDialogSync({
      properties: ['openDirectory']
    });
    return pathArray[0];
  });

  ipcMain.handle("api:isValidDirectory", (event, path) => {
    try 
    {
      const ls = readdirSync(path);

      if(!ls.includes("lib")) return false;
      if(!ls.includes("images")) return false;

      const libPath = join(path, "lib");
      if(!lstatSync(libPath).isDirectory()) return false;

      const imagesPath = join(path, "images");
      if(!lstatSync(imagesPath).isDirectory()) return false;

      const dccon_listPath = join(libPath, "dccon_list.js");
      const configPath = join(libPath, "config.js");
      if(!existsSync(dccon_listPath)) return false;
      if(!lstatSync(dccon_listPath).isFile()) return false;
      if(!existsSync(configPath)) return false;
      if(!lstatSync(configPath).isFile()) return false;

      const dcconPath = join(imagesPath, "dccon");
      if(!existsSync(dcconPath)) return false;
      if(!lstatSync(dcconPath).isDirectory()) return false;

      return true;
    }
    catch(err)
    {
      console.error(err);
      return false;
    }
  });

  /**
   * what is core paths?
   * 
   * config: /lib/config.js
   * dccon_list: /lib/dccon_list.js
   * dccon: /images/dccon
   */
  ipcMain.handle("api:getCorePaths", (event, path) => {
    return {
      config: join(path, "lib", "config.js"),
      dccon_list: join(path, "lib", "dccon_list.js"),
      dccon: join(path, "images", "dccon"),
    }
  });

  ipcMain.handle("api:getBufferFromUrl", (event, path) => {
    return axios.get(path, {
      responseType: "arraybuffer"
    }).then(res => Buffer.from(res.data, 'binary'));
  });


  ipcMain.handle("fs:readdirSync", (event, path) => {
    const result = readdirSync(path);
    return result;
  });


  ipcMain.handle("fs:readFileSync", (event, path, options) => {
    const data = readFileSync(path, options);
    return data;
  });

  ipcMain.handle("fs:writeFileSync", (event, path, data, options) => {
    writeFileSync(path, data, options);
    return true;
  });

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
