"use strict";
// Émission et vérification des jetons d'accès (JWT).
//
// Jusqu'ici l'API ne vérifiait rien : l'identité arrivait du client, et n'importe qui
// pouvait appeler /communaute/recupmembrebyutilisateur/3 sans être connecté. Le jeton
// est délivré à la connexion et vérifié par le middleware d'authentification.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lireJetonEntete = exports.verifierJeton = exports.signerJeton = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sqliteSecurity_1 = require("../db/sqliteSecurity");
// En production on impose JWT_SECRET. À défaut, on dérive une valeur stable de la
// référence locale : une installation de poste fonctionne ainsi sans configuration,
// et les jetons survivent à un redémarrage (contrairement à un secret aléatoire).
const SECRET = process.env.JWT_SECRET || `ma-communaute:${sqliteSecurity_1.SQLITE_REFERENCE_PASSWORD}`;
const DUREE = process.env.JWT_EXPIRES_IN || "12h";
const signerJeton = (contenu) => jsonwebtoken_1.default.sign(contenu, SECRET, { expiresIn: DUREE });
exports.signerJeton = signerJeton;
/** Retourne le contenu du jeton, ou null s'il est absent, expiré ou falsifié. */
const verifierJeton = (jeton) => {
    try {
        return jsonwebtoken_1.default.verify(jeton, SECRET);
    }
    catch (_error) {
        return null;
    }
};
exports.verifierJeton = verifierJeton;
/** Extrait le jeton d'un en-tête "Authorization: Bearer <jeton>". */
const lireJetonEntete = (entete) => {
    if (!entete) {
        return "";
    }
    const [type, valeur] = String(entete).split(" ");
    return (type === null || type === void 0 ? void 0 : type.toLowerCase()) === "bearer" && valeur ? valeur.trim() : "";
};
exports.lireJetonEntete = lireJetonEntete;
//# sourceMappingURL=jetons.js.map