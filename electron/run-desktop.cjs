const path = require("path");
const { spawn } = require("child_process");
const http = require("http");

const hasBackendFlag = process.argv.includes("--backend");
const hasDevtoolsFlag = process.argv.includes("--devtools");
const hasRendererFlag = process.argv.includes("--renderer");

// On centralise ici le lancement desktop pour eviter d'ecrire des variables d'environnement
// specifiques au shell Windows ou Unix dans les scripts package.json.
const electronCliPath = path.join(__dirname, "..", "node_modules", "electron", "cli.js");
const viteCliPath = path.join(__dirname, "..", "node_modules", "vite", "bin", "vite.js");
const projectRoot = path.join(__dirname, "..");
const rendererUrl = process.env.ELECTRON_RENDERER_URL || "http://127.0.0.1:5173";

let rendererProcess = null;
let electronProcess = null;

function waitForUrl(url, timeoutMs = 30000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const request = http.get(url, (response) => {
        response.resume();
        resolve();
      });

      request.on("error", () => {
        if (Date.now() - startedAt >= timeoutMs) {
          reject(new Error(`Le serveur renderer ne repond pas sur ${url}`));
          return;
        }

        setTimeout(attempt, 400);
      });

      request.setTimeout(1000, () => {
        request.destroy();
      });
    };

    attempt();
  });
}

function stopRenderer() {
  if (rendererProcess && !rendererProcess.killed) {
    rendererProcess.kill();
  }
}

function startElectron() {
  electronProcess = spawn(process.execPath, [electronCliPath, "."], {
    cwd: projectRoot,
    env: {
      ...process.env,
      ELECTRON_RENDERER_URL: rendererUrl,
      ELECTRON_START_BACKEND: hasBackendFlag ? "1" : process.env.ELECTRON_START_BACKEND,
      DESKTOP_OPEN_DEVTOOLS: hasDevtoolsFlag ? "1" : process.env.DESKTOP_OPEN_DEVTOOLS,
    },
    stdio: "inherit",
  });

  electronProcess.on("exit", (code) => {
    stopRenderer();
    process.exit(code ?? 0);
  });

  electronProcess.on("error", (error) => {
    console.error("[desktop] Impossible de lancer Electron:", error);
    stopRenderer();
    process.exit(1);
  });
}

async function main() {
  if (hasRendererFlag) {
    rendererProcess = spawn(process.execPath, [viteCliPath, "--host", "127.0.0.1", "--port", "5173", "--strictPort"], {
      cwd: projectRoot,
      env: process.env,
      stdio: "inherit",
      windowsHide: true,
    });

    rendererProcess.on("error", (error) => {
      console.error("[desktop] Impossible de lancer Vite:", error);
      process.exit(1);
    });

    try {
      await waitForUrl(rendererUrl);
    } catch (error) {
      console.error("[desktop]", error.message);
      stopRenderer();
      process.exit(1);
    }
  }

  startElectron();
}

process.on("SIGINT", () => {
  stopRenderer();
  process.exit(0);
});

process.on("SIGTERM", () => {
  stopRenderer();
  process.exit(0);
});

main();
