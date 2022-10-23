const { 
  app, 
  BrowserWindow, 
  ipcMain,
  dialog,
} = require('electron');
const { 
  readdirSync, 
  lstatSync, 
  existsSync, 
  readFileSync, 
  writeFileSync, 
  copyFileSync, 
  renameSync, 
  rmSync 
} = require('fs');
const { 
  join, 
  normalize 
} = require('path');
const path = require('path');
const axios = require("axios");
const { IMAGE_EXTENSIONS } = require("./constants");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// eslint-disable-next-line global-require
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 850,
    height: 725,
    minWidth: 270,
    minHeight: 420,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,

      /**
       * 로컬 주소만 가져온다면 돌리면 보안 이슈는 없음.
       */
      nodeIntegration: true,
      nodeIntegrationInWorker: true,

      /**
       * build할때 설정해야 함.
       */
      devTools: false
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  /**
   * api handler 설정
   */
  ipcMain.handle("api:openDialogDirectory", () => {
    const pathArray = dialog.showOpenDialogSync({
      properties: ['openDirectory']
    });
    return pathArray[0];
  });

  ipcMain.handle("api:openDialogFile", () => {
    const pathArray = dialog.showOpenDialogSync({
      properties: ['openFile'],
      filters: [
        {
          "name": "image",
          "extensions": IMAGE_EXTENSIONS
        }
      ]
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
   * icon_list: /lib/dccon_list.js
   * icon: /images/dccon
   */
  ipcMain.handle("api:getCorePaths", (event, path) => {
    return {
      config: join(path, "lib", "config.js"),
      iconList: join(path, "lib", "dccon_list.js"),
      iconDirectory: join(path, "images", "dccon"),
    }
  });

  ipcMain.handle("api:getBufferFromUrl", (event, path) => {
    return axios.get(encodeURI(decodeURI(path)), {
      responseType: "arraybuffer"
    }).then(res => Buffer.from(res.data, 'binary'));
  });

  ipcMain.handle("api:alert", (event, optionsOrString) => {
    if(typeof(optionsOrString) === "string")
    {
      return dialog.showMessageBox({
        message: optionsOrString,
      });
    }

    return dialog.showMessageBox(optionsOrString);
  });


  


  ipcMain.handle("fs:readdirSync", (event, path) => {
    const result = readdirSync(normalize(path));
    return result;
  });


  ipcMain.handle("fs:readFileSync", (event, path, options) => {
    const data = readFileSync(normalize(path), options);
    return data;
  });

  ipcMain.handle("fs:writeFileSync", (event, path, data, options) => {
    try 
    {
      writeFileSync(normalize(path), data, options);
    }
    catch(err)
    {
      return {
        status: false,
        error: err
      }
    }
    return {
      status: true,
      error: undefined,
    }
  });

  ipcMain.handle("fs:copyFileSync", (event, src, dest, mode) => {
    try
    {
      copyFileSync(normalize(src), normalize(dest), mode);
    }
    catch(err)
    {
      return {
        status: false,
        error: err,
      }
    }
    return {
      status: true,
      error: undefined,
    }
  });

  ipcMain.handle("fs:relative", (event, from, to) => {
    return path.relative(from, to);
  });

  ipcMain.handle("fs:renameSync", (event, oldPath, newPath) => {
    try 
    {
      renameSync(normalize(oldPath), normalize(newPath));
    }
    catch(err)
    {
      return {
        status: false,
        error: err,
      }
    }
    return {
      status: true,
      error: undefined,
    }
  });

  ipcMain.handle("fs:rmSync", (event, path, options) => {
    try
    {
      rmSync(path, options);
    }
    catch(err)
    {
      return {
        status: false,
        error: err,
      }
    }
    return {
      status: true,
      error: undefined,
    }
  })

  // hide menu
  mainWindow.removeMenu();

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
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
