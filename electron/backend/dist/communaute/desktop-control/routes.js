"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const controllers_1 = __importDefault(require("./controllers"));
const multer = require("multer");
const desktopControlRouter = express_1.default.Router();
const sqliteRestoreUploadDirectory = path_1.default.join(os_1.default.tmpdir(), "ma-communaute-sqlite-restore");
const sqliteRestoreMaxFileSizeMb = Number(process.env.SQLITE_RESTORE_MAX_FILE_SIZE_MB || 500);
fs_1.default.mkdirSync(sqliteRestoreUploadDirectory, { recursive: true });
const sqliteRestoreUpload = multer({
    dest: sqliteRestoreUploadDirectory,
    limits: {
        fileSize: Math.max(1, sqliteRestoreMaxFileSizeMb) * 1024 * 1024,
    },
    fileFilter: (_req, file, callback) => {
        const isZip = path_1.default.extname(file.originalname || "").toLowerCase() === ".zip";
        if (!isZip) {
            callback(new Error("Veuillez selectionner une sauvegarde au format .zip."));
            return;
        }
        callback(null, true);
    },
});
const handleSqliteRestoreUpload = (req, res, next) => {
    sqliteRestoreUpload.single("backup")(req, res, (error) => {
        if (error) {
            res.status(400).send({
                status: 0,
                error: {
                    name: "UPLOAD_ERROR",
                    message: error.message || "Impossible de charger le fichier de sauvegarde.",
                },
            });
            return;
        }
        next();
    });
};
desktopControlRouter.get("/desktop-control/status", controllers_1.default.getDesktopLicenseStatus);
desktopControlRouter.post("/desktop-control/unlock", controllers_1.default.unlockDesktopLicense);
desktopControlRouter.post("/desktop-control/rebind-machine", controllers_1.default.rebindDesktopLicenseMachine);
desktopControlRouter.post("/desktop-control/unlock-code", controllers_1.default.unlockDesktopLicenseWithCode);
desktopControlRouter.post("/desktop-control/unlock-codes/export", controllers_1.default.exportPendingDesktopUnlockCodes);
desktopControlRouter.post("/desktop-control/unlock-codes/generate", controllers_1.default.generateDesktopUnlockCodes);
desktopControlRouter.post("/desktop-control/sqlite-backups/restore", handleSqliteRestoreUpload, controllers_1.default.restoreSqliteBackup);
desktopControlRouter.get("/server-info", controllers_1.default.getServerNetworkInfo);
exports.default = desktopControlRouter;
//# sourceMappingURL=routes.js.map