"use strict";
// Middleware d'authentification de l'API.
//
// Monté devant le routeur /communaute, il fait deux choses :
//   1. il exige un jeton valide, sauf sur les routes listées comme publiques ;
//   2. il vérifie que le périmètre demandé correspond à celui du jeton, pour qu'un
//      compte ne puisse pas lire les données d'une autre église en changeant le
//      numéro dans l'URL.
Object.defineProperty(exports, "__esModule", { value: true });
exports.authentification = void 0;
const jetons_1 = require("../helpers/jetons");
/**
 * Routes accessibles sans jeton, parce qu'elles servent justement à en obtenir un
 * ou qu'elles sont ouvertes par nature (inscription publique par QR code).
 * Toute route absente de cette liste exige un jeton.
 */
const ROUTES_PUBLIQUES = [
    /^\/login$/,
    /^\/ajouterutilisateur$/,
    /^\/creer-base-sqlite$/,
    /^\/inserereglise$/,
    /^\/demander-reset-password$/,
    /^\/reinitialiser-password$/,
    /^\/demandeinscriptionmembre$/,
    /^\/demandeinscriptionenfant$/,
    /^\/listeutilisateurparent\/\d+$/,
    /^\/desktop-control\/status$/,
    /^\/desktop-control\/unlock-code$/,
    // Notification de paiement : appelée par les serveurs SasPay, qui n'ont pas de
    // jeton applicatif. Son authenticité repose sur la signature HMAC du webhook.
    /^\/abonnement\/webhook$/,
];
const estPublique = (chemin) => ROUTES_PUBLIQUES.some((motif) => motif.test(chemin));
/**
 * Récupère le périmètre demandé par la requête, quand il est explicite :
 * segment d'URL ".../byutilisateur/12", paramètre ?idUtilisateur=12, ou champ
 * idUtilisateur du corps. Retourne null quand la route ne le précise pas.
 */
const perimetreDemande = (req) => {
    var _a, _b, _c;
    const depuisUrl = req.path.match(/(?:byutilisateur|utilisateur|parent)\/(\d+)/i);
    if (depuisUrl) {
        return Number(depuisUrl[1]);
    }
    const brut = ((_b = (_a = req.query) === null || _a === void 0 ? void 0 : _a.idUtilisateur) !== null && _b !== void 0 ? _b : (_c = req.body) === null || _c === void 0 ? void 0 : _c.idUtilisateur);
    const valeur = Number(brut);
    return Number.isFinite(valeur) && String(brut !== null && brut !== void 0 ? brut : "").trim() !== "" ? valeur : null;
};
const authentification = (req, res, next) => {
    if (estPublique(req.path)) {
        return next();
    }
    const jeton = (0, jetons_1.lireJetonEntete)(req.headers.authorization);
    const contenu = jeton ? (0, jetons_1.verifierJeton)(jeton) : null;
    if (!contenu) {
        // 401 : le front le traduit déjà par "Votre session a expiré..." et renvoie
        // l'utilisateur vers l'écran de connexion.
        return res.status(401).send({
            status: 0,
            error: {
                name: "NON_AUTHENTIFIE",
                message: "Votre session a expiré. Reconnectez-vous pour continuer.",
            },
        });
    }
    req.auth = contenu;
    // Le superadmin fixe administre tous les postes : il n'est borné à aucun périmètre.
    if (!contenu.superadmin) {
        const demande = perimetreDemande(req);
        if (demande !== null && demande !== contenu.scope && demande !== contenu.idUtilisateur) {
            return res.status(403).send({
                status: 0,
                error: {
                    name: "PERIMETRE_INTERDIT",
                    message: "Vous n'avez pas accès aux données de ce compte.",
                },
            });
        }
    }
    return next();
};
exports.authentification = authentification;
exports.default = exports.authentification;
//# sourceMappingURL=authentification.js.map