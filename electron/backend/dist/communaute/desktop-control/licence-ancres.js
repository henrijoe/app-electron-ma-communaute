"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ecrireAncre = exports.lireAncre = void 0;
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
// Copies de l'état de licence rangées hors du dossier de données : dans le registre
// de l'utilisateur et dans ProgramData. Effacer le fichier de licence, ou remettre une
// ancienne copie, ne redonne donc ni un essai neuf ni des jours déjà consommés.
//
// Ce n'est pas une protection absolue : le code est public, et une personne qui efface
// aussi ces copies repart de zéro. Le but est d'arrêter le contournement facile.
const CLE_REGISTRE = "HKCU\\Software\\MaCommunaute\\Licence";
// Une copie par dossier de données : une démo ou un essai ne touche pas la vraie licence.
const nomAncre = (dossier) => crypto_1.default.createHash("sha256").update(path_1.default.resolve(dossier).toLowerCase()).digest("hex").slice(0, 24);
const fichierAncre = (dossier) => path_1.default.join(process.env.ProgramData || os_1.default.homedir(), "MaCommunaute", `${nomAncre(dossier)}.dat`);
const lireRegistre = (dossier) => {
    var _a;
    if (process.platform !== "win32") {
        return "";
    }
    try {
        const sortie = (0, child_process_1.execFileSync)("reg", ["query", CLE_REGISTRE, "/v", nomAncre(dossier)], {
            encoding: "utf8",
            windowsHide: true,
            stdio: ["ignore", "pipe", "ignore"],
        });
        return ((_a = sortie.match(/REG_SZ\s+(\S+)/i)) === null || _a === void 0 ? void 0 : _a[1]) || "";
    }
    catch (_erreur) {
        return "";
    }
};
const lireFichier = (dossier) => {
    try {
        return fs_1.default.readFileSync(fichierAncre(dossier), "utf8").trim();
    }
    catch (_erreur) {
        return "";
    }
};
/** Retourne la copie la plus récente, ou null si aucune n'est lisible. */
const lireAncre = (dossier, dechiffrer) => {
    const copies = [lireRegistre(dossier), lireFichier(dossier)].flatMap((brut) => {
        if (!brut) {
            return [];
        }
        try {
            return [dechiffrer(Buffer.from(brut, "base64").toString("utf8"))];
        }
        catch (_erreur) {
            return [];
        }
    });
    return copies.reduce((meilleure, copie) => !meilleure || Number(copie.revision || 0) > Number(meilleure.revision || 0) ? copie : meilleure, null);
};
exports.lireAncre = lireAncre;
/**
 * Écrit les deux copies. Un échec reste silencieux : selon le compte Windows, ProgramData
 * peut être en lecture seule, et l'autre copie suffit. Il ne doit pas empêcher l'activation.
 */
const ecrireAncre = (dossier, chiffre) => {
    const contenu = Buffer.from(chiffre, "utf8").toString("base64");
    if (process.platform === "win32") {
        try {
            (0, child_process_1.execFileSync)("reg", ["add", CLE_REGISTRE, "/v", nomAncre(dossier), "/t", "REG_SZ", "/d", contenu, "/f"], {
                windowsHide: true,
                stdio: "ignore",
            });
        }
        catch (_erreur) {
            // L'autre copie prend le relais.
        }
    }
    try {
        fs_1.default.mkdirSync(path_1.default.dirname(fichierAncre(dossier)), { recursive: true });
        fs_1.default.writeFileSync(fichierAncre(dossier), contenu, "utf8");
    }
    catch (_erreur) {
        // L'autre copie prend le relais.
    }
};
exports.ecrireAncre = ecrireAncre;
//# sourceMappingURL=licence-ancres.js.map