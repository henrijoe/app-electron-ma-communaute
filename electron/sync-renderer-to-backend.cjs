const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..");
const rendererDistPath = path.join(projectRoot, "dist");
const backendViewsPath = path.join(__dirname, "backend", "views");

function cleanDirectory(targetPath) {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  }
}

function syncRendererToBackendViews() {
  if (!fs.existsSync(rendererDistPath)) {
    throw new Error("Le dossier dist est introuvable. Lance d'abord le build du front.");
  }

  cleanDirectory(backendViewsPath);
  fs.mkdirSync(backendViewsPath, { recursive: true });
  fs.cpSync(rendererDistPath, backendViewsPath, { recursive: true });

  console.log("[desktop] Front web copie dans", backendViewsPath);
}

syncRendererToBackendViews();
