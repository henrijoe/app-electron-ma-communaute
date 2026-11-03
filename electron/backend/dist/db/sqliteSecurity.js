"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifierMotDePasseSuperAdmin = exports.DESKTOP_SUPERADMIN_USERNAME = exports.SQLITE_SECURITY_NOTE = exports.SQLITE_REFERENCE_PASSWORD = void 0;
const crypto_1 = __importDefault(require("crypto"));
// Mot de passe de référence choisi pour la protection locale SQLite.
// IMPORTANT :
// - Avec le driver `sqlite3` standard utilise actuellement, ce mot de passe
//   ne chiffre PAS nativement le fichier `.db`.
// - Pour une vraie base SQLite protegee par mot de passe, il faudra migrer
//   vers SQLCipher ou une autre solution de chiffrement.
// - On garde cette constante visible dans le code pour ne pas perdre la
//   référence fonctionnelle demandee pour le projet.
exports.SQLITE_REFERENCE_PASSWORD = "com2026!";
// Note lisible à afficher ou a relire plus tard pendant la maintenance.
exports.SQLITE_SECURITY_NOTE = "SQLite standard n'applique pas de vrai mot de passe natif. La référence actuelle est com2026! en attendant une migration vers une base chiffrée.";
// Les identifiants superadmin desktop peuvent être surcharges via le .env du serveur.
exports.DESKTOP_SUPERADMIN_USERNAME = process.env.DESKTOP_SUPERADMIN_USERNAME || "Henri";
// Seule l'empreinte du mot de passe est écrite ici : les dépôts sont publics.
// Pour le changer : generateur-licences\Changer-mot-de-passe-superadmin.cmd, puis une nouvelle version.
const DESKTOP_SUPERADMIN_PASSWORD_HASH = "465b71130cffbf3081a46be0700b0821:de2c115f7a95775a2c49344c76365f418bc1f2a3bc6407a3bbe1bb804d349075";
const verifierMotDePasseSuperAdmin = (motDePasse) => {
    // Un serveur peut imposer son propre mot de passe dans son .env.
    const impose = process.env.DESKTOP_SUPERADMIN_PASSWORD;
    if (impose) {
        return motDePasse === impose;
    }
    const [sel, attendue] = DESKTOP_SUPERADMIN_PASSWORD_HASH.split(":");
    const calculee = crypto_1.default.scryptSync(motDePasse, Buffer.from(sel, "hex"), 32);
    return crypto_1.default.timingSafeEqual(calculee, Buffer.from(attendue, "hex"));
};
exports.verifierMotDePasseSuperAdmin = verifierMotDePasseSuperAdmin;
//# sourceMappingURL=sqliteSecurity.js.map