const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..");
const rendererDistPath = path.join(projectRoot, "dist");
const backendViewsPath = path.join(__dirname, "backend", "views");
// En développement, le backend tourne depuis ../server et sert son propre
// dossier "views" (voir app.ts : path.join(__dirname, '..', 'views')). Ce
// dossier-là n'était jamais rafraîchi : seul le dossier d'empaquetage l'était.
// Résultat, ce que montrait le port 49300 dans un navigateur — ou sur un
// téléphone du réseau — datait du dernier passage manuel, sans que rien ne le
// signale. Les corrections semblaient alors ne pas s'appliquer « dans le
// navigateur ».
const serverViewsPath = path.join(projectRoot, "..", "server", "views");

function cleanDirectory(targetPath) {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  }
}

// Remplace entièrement le dossier cible. Le vider d'abord est nécessaire : les
// noms de fichiers portent une empreinte, et une simple copie par-dessus
// laisserait s'accumuler les versions précédentes de chaque morceau.
function copierLeFront(destination) {
  cleanDirectory(destination);
  fs.mkdirSync(destination, { recursive: true });
  fs.cpSync(rendererDistPath, destination, { recursive: true });

  console.log("[desktop] Front web copié dans", destination);
}

function syncRendererToBackendViews() {
  if (!fs.existsSync(rendererDistPath)) {
    throw new Error("Le dossier dist est introuvable. Lance d'abord le build du front.");
  }

  copierLeFront(backendViewsPath);

  // Le dépôt du serveur n'est pas toujours là : sur un poste de construction,
  // seul le front est récupéré. On ne copie donc que s'il existe.
  if (fs.existsSync(path.join(projectRoot, "..", "server", "package.json"))) {
    copierLeFront(serverViewsPath);
  } else {
    console.log("[desktop] Dossier ../server absent : copie de développement ignorée.");
  }
}

syncRendererToBackendViews();
