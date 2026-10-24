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
const functions_1 = require("../functions");
const saspay_1 = __importDefault(require("./saspay"));
const services_1 = __importDefault(require("./services"));
/** Ouvre une souscription et renvoie l'URL de paiement (page hébergée SasPay). */
const souscrire = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { idUtilisateur, plan, emailClient, nomClient, telephoneClient, urlRetour } = req.body;
        const resultat = yield services_1.default.demarrerSouscription({
            idUtilisateur: Number(idUtilisateur),
            plan,
            emailClient,
            nomClient,
            telephoneClient,
            urlRetour,
        });
        res.status(200).send({ status: 1, data: resultat });
    }
    catch (error) {
        res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) });
    }
});
/**
 * Demande à SasPay où en est le paiement, et active si c'est réglé.
 * À appeler au retour du client depuis la page de paiement, ou depuis un bouton
 * « J'ai payé » : c'est ce qui permet de fonctionner sans webhook.
 */
const verifier = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resultat = yield services_1.default.verifierEtActiver(String(req.params.reference || ""));
        res.status(200).send({ status: 1, data: resultat });
    }
    catch (error) {
        res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) });
    }
});
/** État de l'abonnement d'un compte : affiché dans Paramètres et lu à la connexion. */
const etat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const idUtilisateur = Number(req.params.idUtilisateur);
        const auth = req.auth;
        // Le middleware ne reconnaît le périmètre que sur les chemins en "byutilisateur/"
        // ou dans le corps : ici l'identifiant est un simple segment, donc on le vérifie.
        if (auth && !auth.superadmin && idUtilisateur !== auth.scope && idUtilisateur !== auth.idUtilisateur) {
            return res.status(403).send({
                status: 0,
                error: {
                    name: "PERIMETRE_INTERDIT",
                    message: "Vous n'avez pas accès à l'abonnement de ce compte.",
                },
            });
        }
        return res.status(200).send({ status: 1, data: yield services_1.default.etatAbonnement(idUtilisateur) });
    }
    catch (error) {
        return res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) });
    }
});
/**
 * Point d'entrée des notifications SasPay.
 *
 * Le corps arrive ici en Buffer brut (voir le montage dans app.ts) : la signature se
 * calcule sur les octets reçus, pas sur un JSON reconstruit.
 *
 * On répond 200 dès que la signature est valide, même si l'événement ne nous concerne
 * pas : un code d'erreur déclencherait cinq réémissions inutiles.
 */
const webhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const corpsBrut = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : String(req.body || "");
    const verification = saspay_1.default.signatureWebhookValide({
        corpsBrut,
        signature: req.header("X-Webhook-Signature") || undefined,
        horodatage: req.header("X-Webhook-Timestamp") || undefined,
    });
    if (!verification.valide) {
        console.warn(`[abonnement] webhook rejeté : ${verification.motif}`);
        return res.status(401).send({ status: 0, error: { name: "SIGNATURE_INVALIDE" } });
    }
    try {
        const evenement = JSON.parse(corpsBrut);
        const resultat = yield services_1.default.traiterEvenement(evenement);
        console.info(`[abonnement] webhook ${evenement === null || evenement === void 0 ? void 0 : evenement.event} : ${resultat.motif}`);
        return res.status(200).send({ status: 1, data: resultat });
    }
    catch (error) {
        // On trace sans relancer : l'événement est authentique, le rejouer ne réparerait rien.
        console.error(`[abonnement] traitement du webhook impossible : ${(error === null || error === void 0 ? void 0 : error.message) || error}`);
        return res.status(200).send({ status: 1, data: { traite: false, motif: "erreur interne" } });
    }
});
exports.default = { souscrire, verifier, etat, webhook };
//# sourceMappingURL=controllers.js.map