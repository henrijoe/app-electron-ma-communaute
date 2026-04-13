const path = require("path");
const { spawn } = require("child_process");

const hasBackendFlag = process.argv.includes("--backend");
const hasDevtoolsFlag = process.argv.includes("--devtools");

// On centralise ici le lancement desktop pour eviter d'ecrire des variables d'environnement
// specifiques au shell Windows ou Unix dans les scripts package.json.
const electronCliPath = path.join(__dirname, "..", "node_modules", "electron", "cli.js");

const child = spawn(process.execPath, [electronCliPath, "."], {
  cwd: path.join(__dirname, ".."),
  env: {
    ...process.env,
    ELECTRON_START_BACKEND: hasBackendFlag ? "1" : process.env.ELECTRON_START_BACKEND,
    DESKTOP_OPEN_DEVTOOLS: hasDevtoolsFlag ? "1" : process.env.DESKTOP_OPEN_DEVTOOLS,
  },
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error("[desktop] Impossible de lancer Electron:", error);
  process.exit(1);
});
