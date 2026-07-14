"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DESKTOP_SUPERADMIN_PASSWORD = exports.DESKTOP_SUPERADMIN_USERNAME = exports.SQLITE_SECURITY_NOTE = exports.SQLITE_REFERENCE_PASSWORD = void 0;
// Mot de passe de reference choisi pour la protection locale SQLite.
// IMPORTANT :
// - Avec le driver `sqlite3` standard utilise actuellement, ce mot de passe
//   ne chiffre PAS nativement le fichier `.db`.
// - Pour une vraie base SQLite protegee par mot de passe, il faudra migrer
//   vers SQLCipher ou une autre solution de chiffrement.
// - On garde cette constante visible dans le code pour ne pas perdre la
//   reference fonctionnelle demandee pour le projet.
exports.SQLITE_REFERENCE_PASSWORD = "com2026!";
// Note lisible a afficher ou a relire plus tard pendant la maintenance.
exports.SQLITE_SECURITY_NOTE = "SQLite standard n'applique pas de vrai mot de passe natif. La reference actuelle est com2026! en attendant une migration vers une base chiffree.";
// Les identifiants superadmin desktop peuvent etre surcharges via le .env du serveur.
exports.DESKTOP_SUPERADMIN_USERNAME = process.env.DESKTOP_SUPERADMIN_USERNAME || "Henri";
exports.DESKTOP_SUPERADMIN_PASSWORD = process.env.DESKTOP_SUPERADMIN_PASSWORD || "dihj060195";
//# sourceMappingURL=sqliteSecurity.js.map