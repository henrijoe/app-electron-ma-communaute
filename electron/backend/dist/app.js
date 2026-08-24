"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const constants_1 = require("./helpers/constants");
const routes_1 = __importDefault(require("./communaute/routes"));
const mysqlDB_1 = __importDefault(require("./db/mysqlDB"));
const sqliteDB_1 = __importDefault(require("./db/sqliteDB"));
const qrcode = require('qrcode-terminal');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const app = (0, express_1.default)();
const DEFAULT_PORT = 49300;
const getConfiguredPort = () => {
    const rawPort = process.env.PORT;
    if (!rawPort) {
        return DEFAULT_PORT;
    }
    const parsedPort = Number(rawPort);
    if (!Number.isInteger(parsedPort) || parsedPort <= 0 || parsedPort > 65535) {
        console.warn(`[Server] PORT invalide "${rawPort}". Utilisation du port ${DEFAULT_PORT}.`);
        return DEFAULT_PORT;
    }
    return parsedPort;
};
const PORT = getConfiguredPort();
const IP = require("ip").address();
const compression = require("compression");
const cors = require("cors");
const bodyParser = require("body-parser");
// creation du serveur
const httpServer = require("http").createServer(app);
/**
 * -------------------------
 * chemin du dossier contenant les clients
 */
const htmlPath = path.join(__dirname, '..', 'views');
const sqliteRootDir = sqliteDB_1.default.getSqliteDirectory();
const memberPhotosDir = path.join(sqliteRootDir, 'photo-membre');
const galerieMediaDir = path.join(sqliteRootDir, 'galerie-evenements');
const churchLogosDir = path.join(sqliteRootDir, 'logo-eglise');
// =================================== MIDDLEWARES =========================================================
app.use(express_1.default.urlencoded({ limit: '100mb', extended: true, }));
app.use(express_1.default.json({ limit: '100mb' }));
app.use(cors({ credentials: true, optionsSuccessStatus: 200, origin: true }));
app.use(compression());
app.use(bodyParser.json());
app.use('/photos', express_1.default.static(memberPhotosDir));
app.use('/galerie-media', express_1.default.static(galerieMediaDir));
app.use('/church-logos', express_1.default.static(churchLogosDir));
// ===================================Socket.io configuration =======================================
const options = {
    transports: ["websocket"],
    pingTimeout: 2500,
    pingInterval: 5000,
    cors: {
        origin: ["*"],
        methods: ["GET", "POST"],
    },
};
const io = require("socket.io")(httpServer, options);
const ioMiddleware = (req, res, next) => {
    req.io = io;
    next();
};
app.use(ioMiddleware);
const cnxInfos = { ip: IP, port: PORT };
require("./socket/socketIO").initializeSocket(io, cnxInfos)
    .then(() => {
    console.info(`socket.io successfully initialized`);
})
    .catch((error) => { console.log("tunnel error", error); console.error(`app.ts:42 ~ initializeSocket ~ error:", ${error}`); });
// ============================================== FIN ==================================    
//public routes 
app.get("/test", function (_, res) {
    const msg = `Connecté au serveur ${constants_1.SERVER_NAME} avec succès!`;
    console.log(msg);
    res.status(201).send({
        status: 1,
        data: {
            message: msg,
        },
    });
});
app.use("/communaute", routes_1.default);
app.get("/db-test", (req, res) => {
    if (sqliteDB_1.default.isSqliteMode()) {
        sqliteDB_1.default.selectSqlite("SELECT 1 AS status")
            .then(() => {
            res.json({ status: "SQLite connecté" });
        })
            .catch((error) => {
            res.status(500).json({
                status: "ERREUR",
                error: error.message,
            });
        });
        return;
    }
    mysqlDB_1.default.query("SELECT 1", (err) => {
        if (err) {
            return res.status(500).json({
                status: "ERREUR",
                error: err.message,
            });
        }
        res.json({ status: "MySQL connecté" });
    });
});
// Middleware personnalisÃƒÆ’Ã‚Â© qui dÃƒÆ’Ã‚Â©finit un cookie
const setAppCookie = (req, res, next) => {
    const serverUrl = `${req.protocol}://${req.get('host')}`;
    res.cookie("serverUrl", `${serverUrl}`, { encode: (v) => v } //sinon la valeur sera urlEncoded
    );
    next();
};
app.use(setAppCookie); // utilise le middleware personnalisé qui est  déjà ‚définit le cookie
app.use('/', express_1.default.static(htmlPath));
app.get("/*", function (req, res) {
    res.sendFile(`${htmlPath}/index.html`);
});
// //Lancement du server
const welcomeMsg = `
============================
${constants_1.SERVER_NAME}
Port: ${PORT}
Ip: ${IP}
Url: "http://localhost:${PORT}"
Start: ${new Date().toLocaleString("fr-FR")}
============================
`;
const SQLITE_BACKUP_CHECK_INTERVAL_MS = 60 * 60 * 1000;
let sqliteBackupCheckTimer = null;
const runDailySqliteBackup = (logSkipped = false) => __awaiter(void 0, void 0, void 0, function* () {
    const backupResult = yield sqliteDB_1.default.ensureDailySqliteBackup();
    if (backupResult.created) {
        console.log(`[DB] Sauvegarde SQLite creee: ${backupResult.filePath}`);
        console.log(`[DB] Bases sauvegardees: ${backupResult.databaseCount}`);
    }
    else if (logSkipped) {
        const reason = backupResult.reason === "already-exists"
            ? "déjà presente pour aujourd'hui"
            : "aucune base SQLite à sauvegarder";
        console.log(`[DB] Sauvegarde SQLite: ${reason}`);
    }
    if (backupResult.deletedBackups > 0) {
        console.log(`[DB] Anciennes sauvegardes supprimees: ${backupResult.deletedBackups}`);
    }
});
const startSqliteBackupScheduler = () => {
    if (sqliteBackupCheckTimer) {
        return;
    }
    sqliteBackupCheckTimer = setInterval(() => {
        runDailySqliteBackup().catch((error) => {
            console.error("[DB] Erreur lors de la sauvegarde SQLite automatique:", error);
        });
    }, SQLITE_BACKUP_CHECK_INTERVAL_MS);
};
/**
 * Affiche le moteur de base de donnees actif et prepare SQLite si besoin.
 */
const logDatabaseStartup = () => __awaiter(void 0, void 0, void 0, function* () {
    const databaseMode = sqliteDB_1.default.getDatabaseMode();
    if (databaseMode === "sqlite") {
        const activeDatabasePath = yield sqliteDB_1.default.ensureDefaultSqliteDatabase();
        const updatedDatabases = yield sqliteDB_1.default.ensureAllSqliteDatabasesSchemasUpdated();
        console.log(`[DB] Mode actif: sqlite`);
        console.log(`[DB] Dossier SQLite: ${sqliteDB_1.default.getSqliteDirectory()}`);
        console.log(`[DB] Base SQLite active: ${activeDatabasePath}`);
        console.log(`[DB] Bases SQLite verifiées: ${updatedDatabases.length}`);
        yield runDailySqliteBackup(true);
        startSqliteBackupScheduler();
        return;
    }
    console.log(`[DB] Mode actif: mysql`);
    console.log(`[DB] Cible MySQL: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
});
// httpServer.listen(PORT, () => {
//   console.log(welcomeMsg);
// });
const qrValue = {
    wifi: `http://${IP}:${PORT}`,
    tunnel: "non configure",
};
httpServer.once("error", (error) => {
    if (error.code === "EADDRINUSE") {
        console.error(`[Server] Le port ${PORT} est deja utilise.`);
        console.error(`[Server] Arrete l'autre instance Node ou lance ce serveur avec un autre port.`);
        console.error(`[Server] Exemple PowerShell: $env:PORT=49301; npm run dev`);
        process.exit(1);
    }
    console.error("[Server] Erreur lors du demarrage du serveur:", error);
    process.exit(1);
});
// Ajouter recemment pour voir les logs
httpServer.listen(PORT, () => {
    try {
        console.log(welcomeMsg);
        qrcode.generate(JSON.stringify(qrValue));
        logDatabaseStartup().catch((error) => {
            console.error("[DB] Erreur lors de l'initialisation de la base:", error);
        });
    }
    catch (err) {
        console.error('Erreur lors du démarrage du serveur:', err);
    }
});
//# sourceMappingURL=app.js.map