const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..");
const serverRoot = path.join(projectRoot, "..", "server");
const backendTargetRoot = path.join(__dirname, "backend");

// Dependances de developpement du serveur : elles n'ont aucun role une fois le
// backend compile, et "extraResources" les exclut deja du programme installe.
// Les recopier ici serait donc du temps de disque pur perdu -- et ce n'est pas
// marginal : "nw" (le moteur NW.js, un Chromium complet) pese a lui seul
// 597 Mo sur les 772 Mo du dossier. C'est ce qui rendait la preparation du
// paquet si lente.
//
// La liste reprend celle de "build.extraResources" dans package.json. Si l'une
// bouge, l'autre doit suivre.
const DEPENDANCES_INUTILES = new Set([
  ".cache",
  "@types",
  "nodemon",
  "ts-node",
  "typescript",
  "nw",
  "nwjs-builder-phoenix",
]);

// Trace de la copie precedente : tant que les dependances du serveur n'ont pas
// bouge, la recopier a l'identique ne sert a rien.
const empreintePath = path.join(__dirname, "backend-node-modules.empreinte.json");

// Supprime un dossier s'il existe déjà pour repartir d'un backend propre.
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

// Date de derniere modification, ou null si le fichier n'existe pas.
function dateDeModification(cheminFichier) {
  try {
    return fs.statSync(cheminFichier).mtimeMs;
  } catch (_erreur) {
    return null;
  }
}

// Ce qui decrit l'etat des dependances du serveur. Le verrou change des qu'un
// paquet est ajoute, retire ou mis a jour ; le package.json couvre le cas d'une
// modification faite a la main.
function empreinteDesDependances() {
  return JSON.stringify({
    packageJson: dateDeModification(path.join(serverRoot, "package.json")),
    verrou: dateDeModification(path.join(serverRoot, "package-lock.json")),
    yarn: dateDeModification(path.join(serverRoot, "yarn.lock")),
  });
}

function empreintePrecedente() {
  try {
    return fs.readFileSync(empreintePath, "utf8");
  } catch (_erreur) {
    return null;
  }
}

// Recopie les dependances du serveur en laissant de cote celles qui ne servent
// qu'au developpement.
function copierDependances(source, destination) {
  fs.mkdirSync(destination, { recursive: true });

  const entrees = fs.readdirSync(source, { withFileTypes: true });
  let ignorees = 0;

  entrees.forEach((entree) => {
    if (DEPENDANCES_INUTILES.has(entree.name)) {
      ignorees += 1;
      return;
    }

    fs.cpSync(path.join(source, entree.name), path.join(destination, entree.name), {
      recursive: true,
    });
  });

  console.log(`[desktop] ${ignorees} dépendances de développement ignorées à la copie.`);
}

// Vide le dossier du backend, en gardant éventuellement les dépendances déjà
// copiées : c'est le seul morceau coûteux, et il change rarement.
function viderLeBackend({ garderLesDependances }) {
  if (!fs.existsSync(backendTargetRoot)) {
    fs.mkdirSync(backendTargetRoot, { recursive: true });
    return;
  }

  fs.readdirSync(backendTargetRoot).forEach((nom) => {
    if (garderLesDependances && nom === "node_modules") {
      return;
    }

    cleanDirectory(path.join(backendTargetRoot, nom));
  });
}

// Prépare le backend qui sera embarque dans les ressources Electron.
function prepareBackendBundle() {
  const serverDistPath = path.join(serverRoot, "dist");
  const serverTemplatesPath = path.join(serverRoot, "templates");
  const serverViewsPath = path.join(serverRoot, "views");
  const serverPublicPath = path.join(serverRoot, "public");
  const serverNodeModulesPath = path.join(serverRoot, "node_modules");
  const serverEnvPath = path.join(serverRoot, ".env");
  const serverPackageJsonPath = path.join(serverRoot, "package.json");
  const backendNodeModulesPath = path.join(backendTargetRoot, "node_modules");

  if (!fs.existsSync(serverDistPath)) {
    throw new Error("Le dossier server/dist est introuvable. Lance d'abord le build du serveur.");
  }

  const empreinte = empreinteDesDependances();
  const dependancesAJour =
    fs.existsSync(backendNodeModulesPath) && empreintePrecedente() === empreinte;

  viderLeBackend({ garderLesDependances: dependancesAJour });

  // On recopie le build serveur complet pour le lancer depuis l'exécutable client.
  copyDirectoryIfExists(serverDistPath, path.join(backendTargetRoot, "dist"));

  // On recopie aussi les dependances Node du serveur pour que le backend JS
  // embarque puisse resoudre ses modules après installation.
  if (dependancesAJour) {
    console.log("[desktop] Dépendances inchangées : copie évitée.");
  } else if (fs.existsSync(serverNodeModulesPath)) {
    cleanDirectory(backendNodeModulesPath);
    copierDependances(serverNodeModulesPath, backendNodeModulesPath);
    fs.writeFileSync(empreintePath, empreinte, "utf8");
  }

  // Les templates SQL sont indispensables pour l'initialisation SQLite locale.
  copyDirectoryIfExists(serverTemplatesPath, path.join(backendTargetRoot, "templates"));

  // Ces dossiers restent utiles si le backend continue d'exposer des vues ou assets.
  copyDirectoryIfExists(serverViewsPath, path.join(backendTargetRoot, "views"));
  copyDirectoryIfExists(serverPublicPath, path.join(backendTargetRoot, "public"));
  copyFileIfExists(serverPackageJsonPath, path.join(backendTargetRoot, "package.json"));

  // On garde aussi une copie du .env si present pour faciliter les réglages desktop.
  copyFileIfExists(serverEnvPath, path.join(backendTargetRoot, ".env"));

  console.log("[desktop] Backend préparé dans", backendTargetRoot);
}

prepareBackendBundle();
