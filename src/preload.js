// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  openDialogDirectory: () => ipcRenderer.invoke("api:openDialogDirectory"),
  openDialogFile: () => ipcRenderer.invoke("api:openDialogFile"),
  isValidDirectory: (path) => ipcRenderer.invoke("api:isValidDirectory", path),
  getCorePaths: (path) => ipcRenderer.invoke("api:getCorePaths", path),
  getBufferFromUrl: (path) => ipcRenderer.invoke("api:getBufferFromUrl", path),
});

contextBridge.exposeInMainWorld("fs", {
  readdirSync: (path) => ipcRenderer.invoke("fs:readdirSync", path),
  readFileSync: (path, options) => ipcRenderer.invoke("fs:readFileSync", path, options),
  writeFileSync: (path, data, options) => ipcRenderer.invoke("fs:writeFileSync", path, data, options),
  relative: (from, to) => ipcRenderer.invoke("fs:relative", from, to),
});



