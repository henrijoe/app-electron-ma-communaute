const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..");
const serverRoot = path.join(projectRoot, "..", "server");
const backendTargetRoot = path.join(__dirname, "backend");

// Supprime un dossier s'il existe deja pour repartir d'un backend propre.
function cleanDirectory(targetPath) {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  }
}

// Copie un dossier seulement s'il existe pour rester tolerant aux variations du projet.
function copyDirectoryIfExists(sourcePath, destinationPath) {
  if (!fs.existsSync(sourcePath)) {
    return;
  }

  fs.cpSync(sourcePath, destinationPath, { recursive: true });
}

// Copie un fichier seulement s'il existe.
function copyFileIfExists(sourcePath, destinationPath) {
  if (!fs.existsSync(sourcePath)) {
    return;
  }

  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.copyFileSync(sourcePath, destinationPath);
}

// Prepare le backend qui sera embarque dans les ressources Electron.
function prepareBackendBundle() {
  const serverDistPath = path.join(serverRoot, "dist");
  const serverTemplatesPath = path.join(serverRoot, "templates");
  const serverViewsPath = path.join(serverRoot, "views");
  const serverPublicPath = path.join(serverRoot, "public");
  const serverNodeModulesPath = path.join(serverRoot, "node_modules");
  const serverEnvPath = path.join(serverRoot, ".env");
  const serverPackageJsonPath = path.join(serverRoot, "package.json");

  if (!fs.existsSync(serverDistPath)) {
    throw new Error("Le dossier server/dist est introuvable. Lance d'abord le build du serveur.");
  }

  cleanDirectory(backendTargetRoot);
  fs.mkdirSync(backendTargetRoot, { recursive: true });

  // On recopie le build serveur complet pour le lancer depuis l'executable client.
  copyDirectoryIfExists(serverDistPath, path.join(backendTargetRoot, "dist"));

  // On recopie aussi les dependances Node du serveur pour que le backend JS
  // embarque puisse resoudre ses modules apres installation.
  copyDirectoryIfExists(serverNodeModulesPath, path.join(backendTargetRoot, "node_modules"));

  // Les templates SQL sont indispensables pour l'initialisation SQLite locale.
  copyDirectoryIfExists(serverTemplatesPath, path.join(backendTargetRoot, "templates"));

  // Ces dossiers restent utiles si le backend continue d'exposer des vues ou assets.
  copyDirectoryIfExists(serverViewsPath, path.join(backendTargetRoot, "views"));
  copyDirectoryIfExists(serverPublicPath, path.join(backendTargetRoot, "public"));
  copyFileIfExists(serverPackageJsonPath, path.join(backendTargetRoot, "package.json"));

  // On garde aussi une copie du .env si present pour faciliter les reglages desktop.
  copyFileIfExists(serverEnvPath, path.join(backendTargetRoot, ".env"));

  console.log("[desktop] Backend prepare dans", backendTargetRoot);
}

prepareBackendBundle();
