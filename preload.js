// preload.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFolderDialog: () => ipcRenderer.invoke('dialog:openDirectory'),
  openFileAndRead: () => ipcRenderer.invoke('dialog:openFileAndRead'),
  
  // --- НАЧАЛО ВСТАВКИ ---
  loadUserData: () => ipcRenderer.invoke('load-user-data'),
  saveUserData: (data) => ipcRenderer.invoke('save-user-data', data),
  // --- КОНЕЦ ВСТАВКИ ---
  // --- ДОБАВЬ ЭТУ СТРОЧКУ ---
  saveUserDataSync: (data) => ipcRenderer.send('save-user-data-sync', data),

  // --- ДОБАВЬТЕ ЭТИ СТРОКИ ---
  setFullScreen: (flag) => ipcRenderer.send('set-fullscreen', flag),
  onFullScreenChange: (callback) => ipcRenderer.on('fullscreen-change', (event, arg) => callback(arg)),
  // --- ДОБАВЬ ЭТУ СТРОКУ ---
  updateMenuLanguage: (lang) => ipcRenderer.send('update-menu-language', lang),

  checkUpdate: () => ipcRenderer.invoke('check-for-update'),
  sendStartDownload: (url) => ipcRenderer.send('start-update-download', url),
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (event, progress) => callback(progress)),

  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
});