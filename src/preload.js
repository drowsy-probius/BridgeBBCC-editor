// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  openDialogDirectory: () => ipcRenderer.invoke("api:openDialogDirectory"),
  openDialogFile: () => ipcRenderer.invoke("api:openDialogFile"),
  isValidDirectory: (path) => ipcRenderer.invoke("api:isValidDirectory", path),
  getCorePaths: (path) => ipcRenderer.invoke("api:getCorePaths", path),
  getBufferFromUrl: (path) => ipcRenderer.invoke("api:getBufferFromUrl", path),
  alert: (optionsOrString) => ipcRenderer.invoke("api:alert", optionsOrString),
});

contextBridge.exposeInMainWorld("fs", {
  readdirSync: (path) => ipcRenderer.invoke("fs:readdirSync", path),
  readFileSync: (path, options) => ipcRenderer.invoke("fs:readFileSync", path, options),
  writeFileSync: (path, data, options) => ipcRenderer.invoke("fs:writeFileSync", path, data, options),
  copyFileSync: (src, dest, mode=0) => ipcRenderer.invoke("fs:copyFileSync", src, dest, mode),
  relative: (from, to) => ipcRenderer.invoke("fs:relative", from, to),
  renameSync: (oldPath, newPath) => ipcRenderer.invoke("fs:renameSync", oldPath, newPath),
  rmSync: (path, options) => ipcRenderer.invoke("fs:rmSync", path, options),
});



