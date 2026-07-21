const { contextBridge, ipcRenderer } = require("electron");

// Expose seulement des informations non sensibles au renderer.
contextBridge.exposeInMainWorld("desktopApp", {
  platform: process.platform,
  isDesktop: true,
});

// API d'impression utilisee par le renderer principal.
contextBridge.exposeInMainWorld("desktopPrint", {
  openPreview: (payload) => ipcRenderer.invoke("desktop-print:open-preview", payload),
  exportPdf: (payload) => ipcRenderer.invoke("desktop-print:export-pdf", payload),
});

// API reservee a la fenetre d'aper�u imprimee par Electron.
contextBridge.exposeInMainWorld("desktopPrintControls", {
  print: () => ipcRenderer.invoke("desktop-print:print-window"),
  savePdf: () => ipcRenderer.invoke("desktop-print:save-pdf-window"),
  close: () => ipcRenderer.invoke("desktop-print:close-window"),
});

// API simple pour ouvrir une URL dans le navigateur systeme depuis Electron.
contextBridge.exposeInMainWorld("desktopShell", {
  openExternal: (url) => ipcRenderer.invoke("desktop-shell:open-external", url),
});

// API reseau minimale pour permettre au renderer de lire l'adresse IP locale.
contextBridge.exposeInMainWorld("desktopNetwork", {
  getLocalAddress: () => ipcRenderer.invoke("desktop-network:get-local-address"),
});

// API de sauvegarde locale des donnees SQLite et medias client.
contextBridge.exposeInMainWorld("desktopBackup", {
  getInfo: () => ipcRenderer.invoke("desktop-backup:get-info"),
  create: () => ipcRenderer.invoke("desktop-backup:create"),
  restore: () => ipcRenderer.invoke("desktop-backup:restore"),
  openFolder: () => ipcRenderer.invoke("desktop-backup:open-folder"),
});

// API de mise a jour automatique reservee au mode desktop installe.
contextBridge.exposeInMainWorld("desktopUpdater", {
  getStatus: () => ipcRenderer.invoke("desktop-update:get-status"),
  check: () => ipcRenderer.invoke("desktop-update:check"),
  install: () => ipcRenderer.invoke("desktop-update:install"),
  onStatus: (callback) => {
    const listener = (_event, status) => callback(status);
    ipcRenderer.on("desktop-update:status", listener);
    return () => ipcRenderer.removeListener("desktop-update:status", listener);
  },
});
