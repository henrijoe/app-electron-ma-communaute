const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");
const http = require("http");
const net = require("net");
const os = require("os");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

let autoUpdater = null;
try {
  ({ autoUpdater } = require("electron-updater"));
} catch (error) {
  autoUpdater = null;
}

let backendProcess = null;
const SERVER_ROOT = path.join(__dirname, "..", "..", "server");
const DESKTOP_BACKEND_PORT = Number(process.env.PORT || 49300);
let mainWindowRef = null;

const WINDOWS_SQLITE_DB_DIR = "C:\\base-communaute";

function resolveDesktopSqliteDbDir() {
  if (process.env.SQLITE_DB_DIR) {
    return process.env.SQLITE_DB_DIR;
  }

  if (process.platform === "win32") {
    return WINDOWS_SQLITE_DB_DIR;
  }

  return path.join(app.getPath("userData"), "base-communaute");
}

function formatBackupTimestamp(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    `${pad(date.getHours())}${pad(date.getMinutes())}`,
  ].join("-");
}

function getDesktopBackupInfo() {
  const dataDir = resolveDesktopSqliteDbDir();
  const backupDir = path.join(dataDir, "sauvegardes");
  const entries = fs.existsSync(dataDir) ? fs.readdirSync(dataDir, { withFileTypes: true }) : [];
  const databaseFiles = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".db"))
    .map((entry) => entry.name);

  return {
    success: true,
    dataDir,
    backupDir,
    databaseCount: databaseFiles.length,
    databaseFiles,
    photoFolderExists: fs.existsSync(path.join(dataDir, "photo-membre")),
  };
}

function runPowerShellZip(sourceDir, destinationPath) {
  return new Promise((resolve, reject) => {
    const powershellPath = process.env.SystemRoot
      ? path.join(process.env.SystemRoot, "System32", "WindowsPowerShell", "v1.0", "powershell.exe")
      : "powershell.exe";
    const script = [
      "$source=$args[0];",
      "$dest=$args[1];",
      "Compress-Archive -Path (Join-Path $source '*') -DestinationPath $dest -Force",
    ].join(" ");
    const child = spawn(
      powershellPath,
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script, sourceDir, destinationPath],
      { windowsHide: true }
    );
    let stderr = "";

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr.trim() || `Compression impossible. Code ${code}`));
    });
  });
}

function runPowerShellUnzip(sourcePath, destinationDir) {
  return new Promise((resolve, reject) => {
    const powershellPath = process.env.SystemRoot
      ? path.join(process.env.SystemRoot, "System32", "WindowsPowerShell", "v1.0", "powershell.exe")
      : "powershell.exe";
    const script = [
      "$source=$args[0];",
      "$dest=$args[1];",
      "Expand-Archive -Path $source -DestinationPath $dest -Force",
    ].join(" ");
    const child = spawn(
      powershellPath,
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script, sourcePath, destinationDir],
      { windowsHide: true }
    );
    let stderr = "";

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr.trim() || `Extraction impossible. Code ${code}`));
    });
  });
}

async function createDesktopBackupArchive() {
  const dataDir = resolveDesktopSqliteDbDir();
  if (!fs.existsSync(dataDir)) {
    throw new Error("Le dossier de donnees local est introuvable.");
  }

  const backupDir = path.join(dataDir, "sauvegardes");
  fs.mkdirSync(backupDir, { recursive: true });

  const saveResult = await dialog.showSaveDialog(mainWindowRef || undefined, {
    title: "Sauvegarder la base locale",
    defaultPath: path.join(
      backupDir,
      `ma-communaute-sauvegarde-${formatBackupTimestamp()}.zip`
    ),
    filters: [{ name: "Sauvegarde Ma Communaute", extensions: ["zip"] }],
  });

  if (saveResult.canceled || !saveResult.filePath) {
    return { success: false, canceled: true };
  }

  const stagingDir = path.join(app.getPath("temp"), `ma-communaute-backup-${Date.now()}`);
  fs.mkdirSync(stagingDir, { recursive: true });

  try {
    const entries = fs.readdirSync(dataDir, { withFileTypes: true });
    let copiedEntries = 0;

    entries.forEach((entry) => {
      if (entry.name === "sauvegardes") {
        return;
      }

      const sourcePath = path.join(dataDir, entry.name);
      const destinationPath = path.join(stagingDir, entry.name);

      fs.cpSync(sourcePath, destinationPath, {
        recursive: true,
        force: true,
        errorOnExist: false,
      });
      copiedEntries += 1;
    });

    if (!copiedEntries) {
      throw new Error("Aucune donnee locale a sauvegarder.");
    }

    await runPowerShellZip(stagingDir, saveResult.filePath);

    const stat = fs.statSync(saveResult.filePath);
    return {
      success: true,
      filePath: saveResult.filePath,
      size: stat.size,
      databaseCount: getDesktopBackupInfo().databaseCount,
    };
  } finally {
    fs.rmSync(stagingDir, { recursive: true, force: true });
  }
}

async function restoreDesktopBackupArchive() {
  const dataDir = resolveDesktopSqliteDbDir();
  fs.mkdirSync(dataDir, { recursive: true });

  const openResult = await dialog.showOpenDialog(mainWindowRef || undefined, {
    title: "Restaurer une sauvegarde Ma Communaute",
    filters: [{ name: "Sauvegarde Ma Communaute", extensions: ["zip"] }],
    properties: ["openFile"],
  });

  if (openResult.canceled || !openResult.filePaths?.[0]) {
    return { success: false, canceled: true };
  }

  const backupFilePath = openResult.filePaths[0];
  const extractionDir = path.join(app.getPath("temp"), `ma-communaute-restore-${Date.now()}`);
  const safetyBackupPath = path.join(
    dataDir,
    "sauvegardes",
    `avant-restauration-${formatBackupTimestamp()}.zip`
  );

  fs.mkdirSync(extractionDir, { recursive: true });

  try {
    await runPowerShellUnzip(backupFilePath, extractionDir);

    const extractedEntries = fs.readdirSync(extractionDir, { withFileTypes: true });
    const hasDatabase = extractedEntries.some(
      (entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".db")
    );

    if (!hasDatabase) {
      throw new Error("Cette archive ne contient aucune base de donnees .db restaurable.");
    }

    await createDesktopBackupArchiveForPath(safetyBackupPath);

    const currentEntries = fs.existsSync(dataDir) ? fs.readdirSync(dataDir, { withFileTypes: true }) : [];
    currentEntries.forEach((entry) => {
      if (entry.name === "sauvegardes") {
        return;
      }

      fs.rmSync(path.join(dataDir, entry.name), { recursive: true, force: true });
    });

    extractedEntries.forEach((entry) => {
      fs.cpSync(path.join(extractionDir, entry.name), path.join(dataDir, entry.name), {
        recursive: true,
        force: true,
        errorOnExist: false,
      });
    });

    return {
      success: true,
      filePath: backupFilePath,
      safetyBackupPath,
      databaseCount: getDesktopBackupInfo().databaseCount,
    };
  } finally {
    fs.rmSync(extractionDir, { recursive: true, force: true });
  }
}

async function createDesktopBackupArchiveForPath(destinationPath) {
  const dataDir = resolveDesktopSqliteDbDir();
  const backupDir = path.dirname(destinationPath);
  fs.mkdirSync(backupDir, { recursive: true });

  const stagingDir = path.join(app.getPath("temp"), `ma-communaute-backup-${Date.now()}`);
  fs.mkdirSync(stagingDir, { recursive: true });

  try {
    const entries = fs.existsSync(dataDir) ? fs.readdirSync(dataDir, { withFileTypes: true }) : [];
    let copiedEntries = 0;

    entries.forEach((entry) => {
      if (entry.name === "sauvegardes") {
        return;
      }

      fs.cpSync(path.join(dataDir, entry.name), path.join(stagingDir, entry.name), {
        recursive: true,
        force: true,
        errorOnExist: false,
      });
      copiedEntries += 1;
    });

    if (copiedEntries) {
      await runPowerShellZip(stagingDir, destinationPath);
    }
  } finally {
    fs.rmSync(stagingDir, { recursive: true, force: true });
  }
}

// Determine si l'adresse appartient a un reseau local classique utile pour le LAN client.
function isPrivateIpv4Address(address) {
  return (
    address.startsWith("10.") ||
    address.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(address)
  );
}

// Recupere la meilleure IPv4 de la machine qui lance l'application desktop.
function resolveLocalIpv4Address() {
  const networkInterfaces = os.networkInterfaces();
  const candidateAddresses = [];

  // On inspecte toutes les interfaces reseau exposees par le systeme.
  Object.values(networkInterfaces).forEach((entries) => {
    (entries || []).forEach((entry) => {
      // On ignore les interfaces internes, IPv6 ou incompletes.
      if (!entry || entry.family !== "IPv4" || entry.internal || !entry.address) {
        return;
      }

      candidateAddresses.push(entry.address);
    });
  });

  // On privilegie d'abord une IP privee de reseau local, plus pertinente pour les clients.
  const privateAddress = candidateAddresses.find((address) => isPrivateIpv4Address(address));
  if (privateAddress) {
    return privateAddress;
  }

  // Sinon, on retourne la premiere IPv4 externe disponible.
  return candidateAddresses[0] || null;
}

function escapeHtml(value) {
  // On force une chaine pour pouvoir echapper proprement meme si la valeur est absente.
  return String(value || "")
    // On echappe les caracteres speciaux pour eviter qu'un titre injecte casse le HTML.
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildPrintableDocument(payload) {
  // On recupere les informations minimales du document a imprimer.
  const title = payload?.title || "Apercu impression";
  const headHtml = payload?.headHtml || "";
  const bodyHtml = payload?.bodyHtml || "";

  // On reconstruit une page HTML complete pour obtenir un apercu stable dans Electron.
  return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    ${headHtml}
    <style>
      :root {
        color-scheme: light;
      }

      html, body {
        margin: 0;
        padding: 0;
        background: #eef3f7;
        font-family: "Segoe UI", sans-serif;
      }

      .desktop-print-shell {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }

      .desktop-print-toolbar {
        position: sticky;
        top: 0;
        z-index: 20;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 16px 20px;
        background: rgba(14, 23, 38, 0.92);
        color: white;
        backdrop-filter: blur(10px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
      }

      .desktop-print-title {
        font-size: 18px;
        font-weight: 700;
        letter-spacing: 0.02em;
      }

      .desktop-print-actions {
        display: flex;
        gap: 12px;
      }

      .desktop-print-actions button {
        appearance: none;
        border: none;
        border-radius: 10px;
        padding: 10px 16px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
      }

      .desktop-print-actions .primary {
        background: #114866;
        color: white;
      }

      .desktop-print-actions .secondary {
        background: #f3f4f6;
        color: #111827;
      }

      .desktop-print-page {
        flex: 1;
        padding: 28px;
      }

      .desktop-print-paper {
        width: min(100%, 1120px);
        margin: 0 auto;
        background: white;
        border-radius: 18px;
        box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);
        overflow: hidden;
      }

      @media print {
        body {
          background: white;
        }

        .desktop-print-toolbar {
          display: none !important;
        }

        .desktop-print-page {
          padding: 0;
        }

        .desktop-print-paper {
          width: 100%;
          box-shadow: none;
          border-radius: 0;
          margin: 0;
        }
      }
    </style>
  </head>
  <body>
    <div class="desktop-print-shell">
      <div class="desktop-print-toolbar">
        <div class="desktop-print-title">${escapeHtml(title)}</div>
        <div class="desktop-print-actions">
          <button class="secondary" type="button" onclick="window.desktopPrintControls.savePdf()">Exporter en PDF</button>
          <button class="primary" type="button" onclick="window.desktopPrintControls.print()">Imprimer</button>
          <button class="secondary" type="button" onclick="window.desktopPrintControls.close()">Fermer</button>
        </div>
      </div>
      <div class="desktop-print-page">
        <div class="desktop-print-paper">${bodyHtml}</div>
      </div>
    </div>
  </body>
</html>`;
}

function createPrintPreviewWindow(payload) {
  // Cette fenetre isolee sert uniquement a afficher l'aperçu du document a imprimer.
  const previewWindow = new BrowserWindow({
    width: 1240,
    height: 920,
    minWidth: 960,
    minHeight: 720,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // On charge le HTML genere directement en memoire pour ne pas dependre d'un fichier temporaire.
  const printableHtml = buildPrintableDocument(payload);
  previewWindow.once("ready-to-show", () => previewWindow.show());
  previewWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(printableHtml)}`);

  return previewWindow;
}

async function exportPdfFromPayload(payload) {
  // On reutilise la meme fenetre d'aperçu afin que le rendu PDF corresponde a l'impression.
  const exportWindow = createPrintPreviewWindow(payload);

  try {
    // On attend la fin du chargement complet avant de demander la generation du PDF.
    await new Promise((resolve) => {
      exportWindow.webContents.once("did-finish-load", resolve);
    });

    // On propose un nom de fichier par defaut base sur le titre du document.
    const defaultPath = `${payload?.fileName || payload?.title || "document"}.pdf`;
    const saveResult = await dialog.showSaveDialog(exportWindow, {
      title: "Enregistrer le PDF",
      defaultPath,
      filters: [{ name: "PDF", extensions: ["pdf"] }],
    });

    if (saveResult.canceled || !saveResult.filePath) {
      // Si l'utilisateur annule, on retourne simplement un resultat neutre.
      return { canceled: true };
    }

    // Electron genere le contenu PDF a partir du rendu HTML de la fenetre.
    const pdfBuffer = await exportWindow.webContents.printToPDF({
      printBackground: true,
      preferCSSPageSize: true,
    });

    // On ecrit le PDF sur disque uniquement apres validation du chemin par l'utilisateur.
    fs.writeFileSync(saveResult.filePath, pdfBuffer);
    return { canceled: false, filePath: saveResult.filePath };
  } finally {
    // La fenetre d'export n'est utile que temporairement, on la ferme toujours.
    if (!exportWindow.isDestroyed()) {
      exportWindow.close();
    }
  }
}

// Ecrit une trace simple dans le log desktop pour faciliter le diagnostic client.
function writeDesktopLog(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;

  try {
    if (app.isReady()) {
      const logPath = path.join(app.getPath("userData"), "desktop.log");
      fs.appendFileSync(logPath, line, "utf8");
    }
  } catch (error) {
    console.error("[desktop] Impossible d'ecrire le log:", error);
  }

  console.log(line.trim());
}

const desktopUpdateState = {
  supported: false,
  checking: false,
  available: false,
  downloaded: false,
  currentVersion: app.getVersion(),
  latestVersion: "",
  message: "",
  error: "",
  progress: null,
  lastCheckedAt: "",
};

function getDesktopUpdateStatus() {
  return {
    ...desktopUpdateState,
    currentVersion: app.getVersion(),
  };
}

function publishDesktopUpdateStatus(patch = {}) {
  Object.assign(desktopUpdateState, patch, {
    currentVersion: app.getVersion(),
  });

  const status = getDesktopUpdateStatus();

  if (mainWindowRef && !mainWindowRef.isDestroyed()) {
    mainWindowRef.webContents.send("desktop-update:status", status);
  }

  return status;
}

function configureDesktopAutoUpdater() {
  if (!autoUpdater) {
    publishDesktopUpdateStatus({
      supported: false,
      checking: false,
      message: "Le module de mise a jour automatique n'est pas disponible.",
    });
    return;
  }

  if (!app.isPackaged) {
    publishDesktopUpdateStatus({
      supported: false,
      checking: false,
      message: "La mise a jour automatique sera disponible dans l'executable installe.",
    });
    return;
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  publishDesktopUpdateStatus({
    supported: true,
    message: "Pret a verifier les mises a jour.",
  });

  autoUpdater.on("checking-for-update", () => {
    writeDesktopLog("Recherche d'une mise a jour desktop.");
    publishDesktopUpdateStatus({
      checking: true,
      error: "",
      message: "Recherche d'une mise a jour en cours...",
      lastCheckedAt: new Date().toISOString(),
    });
  });

  autoUpdater.on("update-available", (info) => {
    writeDesktopLog(`Mise a jour disponible: ${info?.version || "version inconnue"}.`);
    publishDesktopUpdateStatus({
      checking: false,
      available: true,
      downloaded: false,
      latestVersion: info?.version || "",
      message: "Une nouvelle version est disponible. Telechargement en cours...",
    });
  });

  autoUpdater.on("update-not-available", (info) => {
    writeDesktopLog("Aucune mise a jour desktop disponible.");
    publishDesktopUpdateStatus({
      checking: false,
      available: false,
      downloaded: false,
      latestVersion: info?.version || app.getVersion(),
      progress: null,
      message: "Cette application est deja a jour.",
      lastCheckedAt: new Date().toISOString(),
    });
  });

  autoUpdater.on("download-progress", (progress) => {
    publishDesktopUpdateStatus({
      progress: {
        percent: Number(progress?.percent || 0),
        transferred: Number(progress?.transferred || 0),
        total: Number(progress?.total || 0),
      },
      message: "Telechargement de la mise a jour en cours...",
    });
  });

  autoUpdater.on("update-downloaded", (info) => {
    writeDesktopLog(`Mise a jour telechargee: ${info?.version || "version inconnue"}.`);
    publishDesktopUpdateStatus({
      checking: false,
      available: true,
      downloaded: true,
      latestVersion: info?.version || "",
      progress: null,
      message: "Mise a jour telechargee. Redemarre pour l'installer.",
    });
  });

  autoUpdater.on("error", (error) => {
    writeDesktopLog(`Erreur mise a jour desktop: ${error?.message || String(error)}`);
    publishDesktopUpdateStatus({
      checking: false,
      error: error?.message || "Impossible de verifier les mises a jour.",
      message: "La verification de mise a jour a echoue.",
    });
  });
}

function checkForDesktopUpdates() {
  if (!autoUpdater || !app.isPackaged) {
    return getDesktopUpdateStatus();
  }

  return autoUpdater.checkForUpdates();
}

// Attend simplement un petit delai entre deux tentatives de verification.
function wait(delayMs) {
  return new Promise((resolve) => {
    // Ce delai sert a laisser au backend le temps de demarrer avant une nouvelle verification.
    setTimeout(resolve, delayMs);
  });
}

// Verifie si un service HTTP repond deja sur le port local du backend desktop.
function pingDesktopBackend() {
  return new Promise((resolve) => {
    // On appelle un endpoint simple pour verifier qu'un vrai backend HTTP repond sur ce port.
    const request = http.request(
      {
        host: "127.0.0.1",
        port: DESKTOP_BACKEND_PORT,
        path: "/test",
        method: "GET",
        timeout: 1500,
      },
      (response) => {
        // On ne lit pas le corps en detail, seule la disponibilite du serveur nous interesse ici.
        response.resume();
        resolve(Boolean(response.statusCode && response.statusCode < 500));
      }
    );

    // Toute erreur reseau signifie que le backend n'est pas disponible.
    request.on("error", () => resolve(false));
    request.on("timeout", () => {
      // En cas de timeout, on coupe proprement la requete puis on signale l'echec.
      request.destroy();
      resolve(false);
    });
    request.end();
  });
}

// Detecte si le port est deja reserve, meme si le service qui l'occupe n'est pas notre backend.
function isDesktopBackendPortBusy() {
  return new Promise((resolve) => {
    // Ici on teste seulement si le port accepte une connexion TCP, sans exiger notre backend.
    const socket = net.createConnection(
      {
        host: "127.0.0.1",
        port: DESKTOP_BACKEND_PORT,
      },
      () => {
        // Si la connexion reussit, cela veut dire qu'un processus occupe deja le port.
        socket.destroy();
        resolve(true);
      }
    );

    // Si la connexion echoue, on considere que le port est libre.
    socket.on("error", () => resolve(false));
  });
}

// Attend que le backend soit reelement joignable avant de laisser le renderer faire ses appels.
async function waitForDesktopBackendReady(maxAttempts = 20, delayMs = 500) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    // A chaque tentative, on verifie si le backend repond enfin a /test.
    if (await pingDesktopBackend()) {
      return true;
    }

    // Si le backend n'est pas encore pret, on attend un peu avant de retester.
    await wait(delayMs);
  }

  // Si toutes les tentatives echouent, on signale que le backend n'est pas pret.
  return false;
}

// Indique si l'application tourne en mode developpement.
function isDevMode() {
  return !app.isPackaged;
}

// Retourne l'URL du front en developpement.
function getDevServerUrl() {
  return process.env.ELECTRON_RENDERER_URL || "http://127.0.0.1:5173";
}

// Retourne le chemin du build web genere par Vite.
function getRendererBuildPath() {
  return path.join(__dirname, "..", "dist", "index.html");
}

// Indique si le backend local doit etre lance automatiquement.
function shouldStartEmbeddedBackend() {
  if (app.isPackaged) {
    return true;
  }

  return process.env.ELECTRON_START_BACKEND === "1";
}

// Retourne le chemin du serveur backend local.
function getServerRootPath() {
  return SERVER_ROOT;
}

// Retourne le script backend compile si disponible.
function getServerDistEntryPath() {
  return path.join(getServerRootPath(), "dist", "app.js");
}

// Retourne le backend prepare pour l'executable desktop.
function getPackagedBackendRootPath() {
  return path.join(process.resourcesPath, "backend");
}

// Cherche un backend local deja compile que l'application desktop pourra lancer.
function resolveBackendEntry() {
  const serverDistEntry = getServerDistEntryPath();
  const packagedBackendRoot = getPackagedBackendRootPath();
  const packagedBackendExe = path.join(packagedBackendRoot, "ma-communaute-server.exe");
  const packagedBackendScript = path.join(packagedBackendRoot, "dist", "app.js");

  // En mode package, on privilegie un executable backend embarque.
  if (app.isPackaged && fs.existsSync(packagedBackendExe)) {
    return {
      command: packagedBackendExe,
      args: [],
      cwd: process.resourcesPath,
    };
  }

  // Si on n'a pas d'executable backend, on reutilise le build JS embarque
  // en demandant au binaire Electron de se comporter comme un runtime Node.
  if (app.isPackaged && fs.existsSync(packagedBackendScript)) {
    return {
      command: process.execPath,
      args: [packagedBackendScript],
      cwd: packagedBackendRoot,
      useElectronAsNode: true,
    };
  }

  // En developpement, on lance le build Node du serveur via la commande Node classique.
  if (fs.existsSync(serverDistEntry)) {
    return {
      command: process.env.DESKTOP_NODE_COMMAND || "node",
      args: [serverDistEntry],
      cwd: getServerRootPath(),
    };
  }

  return null;
}

// Demarre le backend local si on a explicitement demande ce comportement.
async function startEmbeddedBackend() {
  if (!shouldStartEmbeddedBackend()) {
    writeDesktopLog("Backend local desactive pour ce lancement.");
    return { available: false, reused: false, reason: "disabled" };
  }

  // On evite de lancer deux fois le backend local.
  if (backendProcess) {
    // Si on a deja un processus en memoire, on le reutilise tel quel.
    return { available: true, reused: true, reason: "already-started" };
  }

  // Si un backend local repond deja, on le reutilise au lieu de lancer un second processus.
  if (await pingDesktopBackend()) {
    writeDesktopLog("Backend local deja joignable sur le port 49300. Reutilisation de l'instance existante.");
    return { available: true, reused: true, reason: "existing-backend" };
  }

  // Si le port est reserve mais qu'aucun backend ne repond, l'application ne pourra pas fonctionner correctement.
  if (await isDesktopBackendPortBusy()) {
    writeDesktopLog(
      "Le port 49300 est deja occupe par un autre processus et aucun backend valide ne repond."
    );
    return { available: false, reused: false, reason: "port-busy" };
  }

  const backendEntry = resolveBackendEntry();

  // Si aucun backend n'est pret, on journalise simplement l'information.
  if (!backendEntry) {
    writeDesktopLog("Backend local introuvable. Le front desktop continue sans backend embarque.");
    return { available: false, reused: false, reason: "missing-entry" };
  }

  // On transmet l'environnement au backend pour qu'il tourne en SQLite local.
  writeDesktopLog(`Demarrage du backend local: ${backendEntry.command} ${backendEntry.args.join(" ")}`);
  backendProcess = spawn(backendEntry.command, backendEntry.args, {
    cwd: backendEntry.cwd,
    env: {
      ...process.env,
      // On force le mode SQLite local pour le desktop client.
      DB_MODE: process.env.DB_MODE || "sqlite",
      DESKTOP_APP: "1",
      // Cette variable permet au binaire Electron d'executer un script Node emballe.
      ELECTRON_RUN_AS_NODE: backendEntry.useElectronAsNode ? "1" : process.env.ELECTRON_RUN_AS_NODE,
      // Ce dossier centralise les bases SQLite desktop sur la machine cliente.
      SQLITE_DB_DIR: resolveDesktopSqliteDbDir(),
      // Le backend doit etre accessible depuis les autres postes du meme reseau.
      HOST: process.env.HOST || "0.0.0.0",
      BIND_HOST: process.env.BIND_HOST || "0.0.0.0",
    },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });

  if (backendProcess.stdout) {
    backendProcess.stdout.on("data", (data) => {
      writeDesktopLog(`[backend] ${String(data).trim()}`);
    });
  }

  if (backendProcess.stderr) {
    backendProcess.stderr.on("data", (data) => {
      writeDesktopLog(`[backend:error] ${String(data).trim()}`);
    });
  }

  // Si le backend s'arrete, on nettoie simplement la reference locale.
  backendProcess.on("exit", (code) => {
    writeDesktopLog(`Backend local arrete avec le code ${code ?? 0}.`);
    backendProcess = null;
  });

  backendProcess.on("error", (error) => {
    writeDesktopLog(`Echec du lancement du backend local: ${error.message}`);
    backendProcess = null;
  });

  const backendReady = await waitForDesktopBackendReady();

  if (backendReady) {
    writeDesktopLog("Backend local pret et joignable sur http://127.0.0.1:49300.");
    return { available: true, reused: false, reason: "started" };
  }

  writeDesktopLog("Le backend local n'a pas repondu a temps apres son lancement.");
  return { available: false, reused: false, reason: "startup-timeout" };
}

// Cree la fenetre principale du desktop.
function createMainWindow() {
  // Cette fenetre porte toute l'application React du mode desktop.
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1200,
    minHeight: 760,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // On affiche la fenetre seulement quand le rendu principal est pret.
  mainWindow.once("ready-to-show", () => {
    writeDesktopLog("Fenetre principale prete a etre affichee.");
    mainWindow.show();
  });

  mainWindow.webContents.on("did-start-loading", () => {
    writeDesktopLog("Le renderer a commence son chargement.");
  });

  mainWindow.webContents.on("did-stop-loading", () => {
    writeDesktopLog("Le renderer a termine son chargement.");
  });

  mainWindow.webContents.on(
    "did-fail-load",
    (_event, errorCode, errorDescription, validatedURL) => {
      writeDesktopLog(
        `Echec de chargement renderer: code=${errorCode} description=${errorDescription} url=${validatedURL}`
      );
    }
  );

  mainWindow.webContents.on("render-process-gone", (_event, details) => {
    writeDesktopLog(`Renderer interrompu: reason=${details.reason} exitCode=${details.exitCode}`);
  });

  mainWindow.webContents.on("console-message", (_event, level, message, line, sourceId) => {
    writeDesktopLog(`[renderer:${level}] ${message} (${sourceId}:${line})`);
  });

  mainWindow.webContents.on("did-finish-load", async () => {
    writeDesktopLog(`Chargement finalise sur l'URL ${mainWindow.webContents.getURL()}`);
    try {
      const title = await mainWindow.webContents.executeJavaScript("document.title");
      writeDesktopLog(`Titre de la page chargee: ${title}`);
    } catch (error) {
      writeDesktopLog(`Impossible de lire le titre de la page: ${error.message}`);
    }
  });

  // Raccourcis utiles pour deboguer un client installe.
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.key === "F12" || (input.control && input.shift && input.key.toLowerCase() === "i")) {
      mainWindow.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  mainWindowRef = mainWindow;

  // En developpement on charge Vite, en production on charge le build local.
  if (isDevMode()) {
    writeDesktopLog(`Chargement du front desktop sur ${getDevServerUrl()}`);
    mainWindow.loadURL(getDevServerUrl());
    return;
  }

  // En mode package, on charge directement le build Vite embarque dans l'application.
  writeDesktopLog(`Chargement du front desktop sur ${getRendererBuildPath()}`);
  mainWindow.loadFile(getRendererBuildPath());
}

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  // Si une instance existe deja, on quitte pour eviter deux frontends et deux backends concurrents.
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindowRef) {
      // Si l'utilisateur relance l'app, on remet simplement la fenetre deja ouverte au premier plan.
      if (mainWindowRef.isMinimized()) {
        mainWindowRef.restore();
      }
      mainWindowRef.focus();
    }
  });

  app.whenReady().then(async () => {
  writeDesktopLog("Application desktop prete.");
  configureDesktopAutoUpdater();
  const backendState = await startEmbeddedBackend();

  if (backendState.reason === "port-busy") {
    // On affiche un message clair car l'application ne pourra pas utiliser son backend local.
    dialog.showErrorBox(
      "Backend local indisponible",
      "Le port 49300 est deja utilise par un autre processus. Ferme ce processus puis relance l'application desktop."
    );
  }

  createMainWindow();

  if (autoUpdater && app.isPackaged) {
    setTimeout(() => {
      checkForDesktopUpdates().catch((error) => {
        writeDesktopLog(`Verification automatique des mises a jour impossible: ${error.message}`);
      });
    }, 8000);
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
  });
}

ipcMain.handle("desktop-print:open-preview", async (_event, payload) => {
  // Le renderer envoie seulement le payload, Electron cree la fenetre native d'aperçu.
  createPrintPreviewWindow(payload);
  return { ok: true };
});

ipcMain.handle("desktop-print:export-pdf", async (_event, payload) => {
  return exportPdfFromPayload(payload);
});

ipcMain.handle("desktop-print:print-window", async (event) => {
  const currentWindow = BrowserWindow.fromWebContents(event.sender);

  if (!currentWindow) {
    // Sans fenetre source, on ne peut pas lancer l'impression.
    return { ok: false };
  }

  return new Promise((resolve) => {
    currentWindow.webContents.print(
      {
        printBackground: true,
      },
      (success, failureReason) => {
        // On logue uniquement les echecs pour faciliter le support client.
        if (!success && failureReason) {
          writeDesktopLog(`Echec impression: ${failureReason}`);
        }

        resolve({ ok: success, failureReason });
      }
    );
  });
});

ipcMain.handle("desktop-print:save-pdf-window", async (event) => {
  const currentWindow = BrowserWindow.fromWebContents(event.sender);

  if (!currentWindow) {
    // Sans fenetre active, il n'y a rien a exporter.
    return { ok: false };
  }

  const saveResult = await dialog.showSaveDialog(currentWindow, {
    title: "Enregistrer le PDF",
    defaultPath: "document.pdf",
    filters: [{ name: "PDF", extensions: ["pdf"] }],
  });

  if (saveResult.canceled || !saveResult.filePath) {
    // L'utilisateur peut fermer la boite sans erreur, on retourne un statut neutre.
    return { canceled: true };
  }

  const pdfBuffer = await currentWindow.webContents.printToPDF({
    printBackground: true,
    preferCSSPageSize: true,
  });

  fs.writeFileSync(saveResult.filePath, pdfBuffer);
  return { canceled: false, filePath: saveResult.filePath };
});

ipcMain.handle("desktop-print:close-window", async (event) => {
  const currentWindow = BrowserWindow.fromWebContents(event.sender);
  if (currentWindow && !currentWindow.isDestroyed()) {
    // On ferme explicitement la fenetre d'impression quand le renderer le demande.
    currentWindow.close();
  }
  return { ok: true };
});


// Expose au renderer l'adresse IP locale detectee pour construire automatiquement l'URL web.
ipcMain.handle("desktop-network:get-local-address", async () => {
  try {
    const backendReady = await pingDesktopBackend();

    if (!backendReady) {
      return {
        success: false,
        error:
          "Le backend local ne repond pas sur le port 49300. Relance l'application desktop puis verifie le journal desktop si le probleme continue.",
      };
    }

    const ipAddress = resolveLocalIpv4Address();

    // Si aucune IPv4 exploitable n'est trouvee, on le signale clairement au front.
    if (!ipAddress) {
      return {
        success: false,
        error: "Aucune adresse IPv4 locale n'a ete detectee sur cette machine",
      };
    }

    // On construit directement l'URL complete attendue par le front avec le port applicatif.
    return {
      success: true,
      ipAddress,
      url: `http://${ipAddress}:${DESKTOP_BACKEND_PORT}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error?.message || "Impossible de detecter l'adresse IP locale",
    };
  }
});

// Ouvre une URL externe dans le navigateur par defaut du systeme.
ipcMain.handle("desktop-shell:open-external", async (_event, url) => {
  try {
    // Electron delegue l'ouverture au navigateur par defaut du systeme.
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error?.message || "Impossible d'ouvrir l'URL demandee",
    };
  }
});

ipcMain.handle("desktop-backup:get-info", async () => getDesktopBackupInfo());

ipcMain.handle("desktop-backup:create", async () => {
  try {
    return await createDesktopBackupArchive();
  } catch (error) {
    return { success: false, error: error?.message || "Impossible de creer la sauvegarde." };
  }
});

ipcMain.handle("desktop-backup:restore", async () => {
  try {
    return await restoreDesktopBackupArchive();
  } catch (error) {
    return { success: false, error: error?.message || "Impossible de restaurer la sauvegarde." };
  }
});

ipcMain.handle("desktop-backup:open-folder", async () => {
  try {
    const dataDir = resolveDesktopSqliteDbDir();
    fs.mkdirSync(dataDir, { recursive: true });
    const errorMessage = await shell.openPath(dataDir);

    if (errorMessage) {
      return { success: false, error: errorMessage };
    }

    return { success: true, dataDir };
  } catch (error) {
    return { success: false, error: error?.message || "Impossible d'ouvrir le dossier." };
  }
});

ipcMain.handle("desktop-update:get-status", async () => getDesktopUpdateStatus());

ipcMain.handle("desktop-update:check", async () => {
  if (!autoUpdater) {
    return publishDesktopUpdateStatus({
      supported: false,
      checking: false,
      message: "Le module de mise a jour automatique n'est pas disponible.",
    });
  }

  if (!app.isPackaged) {
    return publishDesktopUpdateStatus({
      supported: false,
      checking: false,
      message: "La mise a jour automatique sera disponible dans l'executable installe.",
    });
  }

  try {
    await checkForDesktopUpdates();
  } catch (error) {
    publishDesktopUpdateStatus({
      checking: false,
      error: error?.message || "Impossible de verifier les mises a jour.",
      message: "La verification de mise a jour a echoue.",
    });
  }

  return getDesktopUpdateStatus();
});

ipcMain.handle("desktop-update:install", async () => {
  if (!autoUpdater || !desktopUpdateState.downloaded) {
    return {
      success: false,
      error: "Aucune mise a jour telechargee n'est prete a etre installee.",
    };
  }

  setImmediate(() => {
    autoUpdater.quitAndInstall(false, true);
  });

  return { success: true };
});
process.on("uncaughtException", (error) => {
  writeDesktopLog(`Exception non capturee: ${error.stack || error.message}`);
});

process.on("unhandledRejection", (reason) => {
  writeDesktopLog(`Promesse rejetee sans gestionnaire: ${String(reason)}`);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  // On arrete proprement le backend si le desktop l'avait demarre.
  if (backendProcess) {
    writeDesktopLog("Arret du backend local avant fermeture du desktop.");
    backendProcess.kill();
    backendProcess = null;
  }
});
