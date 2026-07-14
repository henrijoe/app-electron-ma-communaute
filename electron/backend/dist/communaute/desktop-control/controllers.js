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
const fs_1 = __importDefault(require("fs"));
const services_1 = __importDefault(require("./services"));
const functions_1 = require("../functions");
// Retourne l'etat courant de la licence desktop pour l'utilisateur fourni.
const getDesktopLicenseStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const nomUtilisateur = String(req.query.nomUtilisateur || "");
        const result = yield services_1.default.getDesktopLicenseStatus(nomUtilisateur);
        res.status(200).send({ status: 1, data: result });
    }
    catch (error) {
        res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) });
    }
});
// Debloque ou renouvelle l'application desktop a partir d'un compte superadmin.
const unlockDesktopLicense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield services_1.default.unlockDesktopLicense(req.body);
        res.status(200).send({ status: 1, data: result });
    }
    catch (error) {
        res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) });
    }
});
// Rattache la licence locale a l'ordinateur courant.
const rebindDesktopLicenseMachine = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield services_1.default.rebindDesktopLicenseMachine(req.body);
        res.status(200).send({ status: 1, data: result });
    }
    catch (error) {
        res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) });
    }
});
// Debloque l'application desktop avec un code offline a usage unique.
const unlockDesktopLicenseWithCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield services_1.default.unlockDesktopLicenseWithCode(req.body);
        res.status(200).send({ status: 1, data: result });
    }
    catch (error) {
        res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) });
    }
});
// Exporte une seule fois le pack initial de codes genere a la creation de la licence.
const exportPendingDesktopUnlockCodes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield services_1.default.exportPendingDesktopUnlockCodes(req.body);
        res.status(200).send({ status: 1, data: result });
    }
    catch (error) {
        res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) });
    }
});
// Genere un nouveau pack de codes et remplace les codes non utilises.
const generateDesktopUnlockCodes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield services_1.default.generateDesktopUnlockCodes(req.body);
        res.status(200).send({ status: 1, data: result });
    }
    catch (error) {
        res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) });
    }
});
// Restaure une sauvegarde SQLite zip fournie par le superadmin.
const restoreSqliteBackup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uploadedFile = req.file;
    try {
        if (!(uploadedFile === null || uploadedFile === void 0 ? void 0 : uploadedFile.path)) {
            throw new Error("Veuillez selectionner un fichier de sauvegarde .zip.");
        }
        const result = yield services_1.default.restoreSqliteBackup({
            nomUtilisateur: req.body.nomUtilisateur,
            password: req.body.password,
            backupFilePath: uploadedFile.path,
        });
        res.status(200).send({ status: 1, data: result });
    }
    catch (error) {
        res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) });
    }
    finally {
        if (uploadedFile === null || uploadedFile === void 0 ? void 0 : uploadedFile.path) {
            fs_1.default.promises.unlink(uploadedFile.path).catch(() => undefined);
        }
    }
});
// Retourne les informations reseau du serveur pour construire l'URL LAN du navigateur.
const getServerNetworkInfo = (req, res) => {
    try {
        const result = services_1.default.getServerNetworkInfo();
        res.status(200).send({ status: 1, data: result });
    }
    catch (error) {
        res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) });
    }
};
exports.default = {
    getDesktopLicenseStatus,
    unlockDesktopLicense,
    rebindDesktopLicenseMachine,
    unlockDesktopLicenseWithCode,
    exportPendingDesktopUnlockCodes,
    generateDesktopUnlockCodes,
    restoreSqliteBackup,
    getServerNetworkInfo,
};
//# sourceMappingURL=controllers.js.map