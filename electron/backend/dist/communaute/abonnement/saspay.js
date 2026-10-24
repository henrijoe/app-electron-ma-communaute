"use strict";
// Client SasPay : création d'une page de paiement et vérification des webhooks.
//
// Choix du checkout hébergé plutôt que du "softpay" (push direct) : le client choisit
// lui-même Wave, Orange Money, MTN, Moov ou sa carte sur la page SasPay. Aucun code
// réseau n'est donc écrit en dur — la documentation publique n'en publie qu'un seul
// exemple (mtn_bj), et l'endpoint qui les liste demande déjà une clé.
//
// Documentation : https://docs.saspay.me/
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
exports.signatureWebhookValide = exports.verifierTransaction = exports.statutCheckout = exports.creerSessionCheckout = exports.estEnModeTest = exports.estConfigure = void 0;
const crypto_1 = __importDefault(require("crypto"));
const BASE_URL = (process.env.SASPAY_BASE_URL || "https://api.saspay.me/api/v1").replace(/\/$/, "");
const CLE_API = process.env.SASPAY_API_KEY || "";
const SECRET_WEBHOOK = process.env.SASPAY_WEBHOOK_SECRET || "";
// SasPay tolère 5 minutes d'écart sur l'horodatage des webhooks.
const TOLERANCE_HORODATAGE_SECONDES = 300;
/** L'intégration n'est utilisable qu'une fois la clé secrète renseignée. */
const estConfigure = () => Boolean(CLE_API);
exports.estConfigure = estConfigure;
const estEnModeTest = () => CLE_API.startsWith("sk_test_");
exports.estEnModeTest = estEnModeTest;
/**
 * Les réponses réelles sont enveloppées : { success, data, code } en cas de succès,
 * { success:false, error, code } en cas d'erreur — contrairement aux exemples de la
 * documentation, qui montrent l'objet nu. On déballe ici une fois pour toutes.
 */
const contenu = (corps) => (corps && corps.data !== undefined ? corps.data : corps);
/**
 * Met en forme le détail d'une erreur. SasPay renvoie une correspondance
 * champ -> messages, par exemple { "amount": ["Le montant minimum est de 200 XOF."] }.
 */
const messageErreur = (corps, statutHttp) => {
    const erreur = corps === null || corps === void 0 ? void 0 : corps.error;
    if (typeof erreur === "string") {
        return erreur;
    }
    if (erreur && typeof erreur === "object") {
        const messages = Object.entries(erreur)
            .map(([champ, valeur]) => {
            const texte = Array.isArray(valeur) ? valeur.join(" ") : String(valeur);
            return champ === "detail" ? texte : `${champ} : ${texte}`;
        })
            .join(" ; ");
        if (messages) {
            return messages;
        }
    }
    return (corps === null || corps === void 0 ? void 0 : corps.detail) || (corps === null || corps === void 0 ? void 0 : corps.message) || `HTTP ${statutHttp}`;
};
const exigerConfiguration = () => {
    if (!(0, exports.estConfigure)()) {
        throw new Error("Le paiement en ligne n'est pas configuré sur ce serveur. Renseignez SASPAY_API_KEY.");
    }
};
/**
 * Crée une page de paiement hébergée et retourne son URL.
 * `reference` voyage dans les metadata et nous revient par le webhook : c'est elle
 * qui relie le paiement à l'abonnement de l'église.
 */
const creerSessionCheckout = (params) => __awaiter(void 0, void 0, void 0, function* () {
    exigerConfiguration();
    const reponse = yield fetch(`${BASE_URL}/checkout-sessions/`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${CLE_API}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.assign(Object.assign(Object.assign({ 
            // L'API attend un montant décimal sous forme de chaîne.
            amount: params.montant.toFixed(2), currency: params.devise || "XOF", country: params.pays || "CI", description: params.description, customer_email: params.emailClient, customer_name: params.nomClient }, (params.telephoneClient ? { customer_phone: params.telephoneClient } : {})), (params.urlRetour ? { return_url: params.urlRetour } : {})), { metadata: { reference: params.reference } })),
    });
    const corps = yield reponse.json().catch(() => null);
    if (!reponse.ok) {
        throw new Error(`Création du paiement refusée par SasPay : ${messageErreur(corps, reponse.status)}`);
    }
    const session = contenu(corps);
    return {
        id: String((session === null || session === void 0 ? void 0 : session.id) || ""),
        checkoutUrl: String((session === null || session === void 0 ? void 0 : session.checkout_url) || ""),
        statut: String((session === null || session === void 0 ? void 0 : session.status) || "PENDING"),
        montant: String((session === null || session === void 0 ? void 0 : session.amount) || ""),
        devise: String((session === null || session === void 0 ? void 0 : session.currency) || "XOF"),
    };
});
exports.creerSessionCheckout = creerSessionCheckout;
/**
 * Statut d'une session de paiement.
 *
 * C'est le recours officiel quand aucun webhook n'est configuré — le cas d'un poste
 * local, que SasPay ne peut pas joindre. L'identifiant attendu est celui de la
 * session (son `id`), pas son slug.
 */
const statutCheckout = (idSession) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    exigerConfiguration();
    const reponse = yield fetch(`${BASE_URL}/checkout-sessions/${encodeURIComponent(idSession)}/status/`, { headers: { Authorization: `Bearer ${CLE_API}` } });
    const corps = yield reponse.json().catch(() => null);
    if (!reponse.ok) {
        throw new Error(`Statut de paiement indisponible : ${messageErreur(corps, reponse.status)}`);
    }
    const etat = contenu(corps);
    return {
        statutSession: String((etat === null || etat === void 0 ? void 0 : etat.status) || ""),
        statutTransaction: String((etat === null || etat === void 0 ? void 0 : etat.transaction_status) || ""),
        // Selon le moment, l'identifiant de transaction arrive à plat ou dans l'objet
        // "transaction", nul tant que personne n'a payé.
        transactionId: String((etat === null || etat === void 0 ? void 0 : etat.transaction_id) || ((_a = etat === null || etat === void 0 ? void 0 : etat.transaction) === null || _a === void 0 ? void 0 : _a.id) || ""),
    };
});
exports.statutCheckout = statutCheckout;
/** Consultation du statut d'une transaction, utile en secours si un webhook se perd. */
const verifierTransaction = (identifiant) => __awaiter(void 0, void 0, void 0, function* () {
    exigerConfiguration();
    const reponse = yield fetch(`${BASE_URL}/transactions/${encodeURIComponent(identifiant)}/`, {
        headers: { Authorization: `Bearer ${CLE_API}` },
    });
    if (!reponse.ok) {
        throw new Error(`Statut indisponible pour la transaction ${identifiant}.`);
    }
    return reponse.json();
});
exports.verifierTransaction = verifierTransaction;
/**
 * Vérifie l'authenticité d'un webhook.
 *
 * Signature attendue : HMAC-SHA256(timestamp + "." + corps brut, secret), en
 * minuscules. D'où l'obligation de disposer du corps *brut* : une fois passé par
 * express.json() il est reconstruit, et la signature ne correspond plus.
 */
const signatureWebhookValide = (params) => {
    if (!SECRET_WEBHOOK) {
        return { valide: false, motif: "SASPAY_WEBHOOK_SECRET absent du serveur" };
    }
    if (!params.signature || !params.horodatage) {
        return { valide: false, motif: "signature ou horodatage manquant" };
    }
    const horodatage = Number(params.horodatage);
    if (!Number.isFinite(horodatage)) {
        return { valide: false, motif: "horodatage illisible" };
    }
    const ecart = Math.abs(Math.floor(Date.now() / 1000) - horodatage);
    if (ecart > TOLERANCE_HORODATAGE_SECONDES) {
        // Fenêtre étroite : sans elle, un appel intercepté pourrait être rejoué plus tard.
        return { valide: false, motif: `horodatage hors tolérance (${ecart}s)` };
    }
    const attendue = crypto_1.default
        .createHmac("sha256", SECRET_WEBHOOK)
        .update(`${params.horodatage}.${params.corpsBrut}`)
        .digest("hex");
    const recue = Buffer.from(String(params.signature).toLowerCase(), "utf8");
    const calculee = Buffer.from(attendue, "utf8");
    // Comparaison à temps constant : une comparaison directe laisse fuiter la signature
    // attendue, caractère par caractère, par le temps de réponse.
    if (recue.length !== calculee.length || !crypto_1.default.timingSafeEqual(recue, calculee)) {
        return { valide: false, motif: "signature invalide" };
    }
    return { valide: true };
};
exports.signatureWebhookValide = signatureWebhookValide;
exports.default = {
    estConfigure: exports.estConfigure,
    estEnModeTest: exports.estEnModeTest,
    creerSessionCheckout: exports.creerSessionCheckout,
    statutCheckout: exports.statutCheckout,
    verifierTransaction: exports.verifierTransaction,
    signatureWebhookValide: exports.signatureWebhookValide,
};
//# sourceMappingURL=saspay.js.map