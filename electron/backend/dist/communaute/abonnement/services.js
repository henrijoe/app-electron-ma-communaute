"use strict";
// Logique d'abonnement : souscription à la création d'une église, activation par
// webhook, et état consultable par l'application.
//
// Le mobile money ne permet pas de prélèvement automatique : SasPay n'expose donc
// aucune notion d'abonnement récurrent. Chaque renouvellement est un nouveau paiement,
// déclenché depuis l'application. C'est nous qui portons le cycle de vie.
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
exports.accesBloque = exports.etatAbonnement = exports.verifierEtActiver = exports.traiterEvenement = exports.demarrerSouscription = exports.abonnementRequis = void 0;
const functions_1 = __importDefault(require("./functions"));
const saspay_1 = __importDefault(require("./saspay"));
const PLANS = {
    mensuel: {
        libelle: "Abonnement mensuel",
        jours: 30,
        montant: Number(process.env.ABONNEMENT_PRIX_MENSUEL || 5000),
    },
    annuel: {
        libelle: "Abonnement annuel",
        jours: 365,
        montant: Number(process.env.ABONNEMENT_PRIX_ANNUEL || 50000),
    },
};
// Sur un poste local, l'accès est réglé par la licence desktop : l'abonnement ne
// s'applique qu'au service en ligne.
const abonnementRequis = () => String(process.env.ABONNEMENT_REQUIS || "false").trim().toLowerCase() === "true";
exports.abonnementRequis = abonnementRequis;
const planValide = (plan) => (plan === "annuel" ? "annuel" : "mensuel");
const ajouterJours = (depuis, jours) => {
    const date = new Date(depuis.getTime());
    date.setDate(date.getDate() + jours);
    return date;
};
const joursRestants = (dateFin) => {
    if (!dateFin) {
        return 0;
    }
    const restant = new Date(dateFin).getTime() - Date.now();
    return restant <= 0 ? 0 : Math.ceil(restant / (1000 * 60 * 60 * 24));
};
/**
 * Ouvre une souscription et retourne l'URL de paiement à présenter au client.
 * Appelée juste après la création du compte de l'église.
 */
const demarrerSouscription = (donnees) => __awaiter(void 0, void 0, void 0, function* () {
    const plan = planValide(donnees.plan);
    const definition = PLANS[plan];
    if (!donnees.idUtilisateur) {
        throw new Error("Compte introuvable pour cette souscription.");
    }
    // Référence courte, unique et lisible dans le tableau de bord SasPay.
    const reference = `ABN-${donnees.idUtilisateur}-${Date.now().toString(36).toUpperCase()}`;
    const session = yield saspay_1.default.creerSessionCheckout({
        montant: definition.montant,
        description: `${definition.libelle} - Ma Communauté`,
        reference,
        emailClient: donnees.emailClient,
        nomClient: donnees.nomClient,
        telephoneClient: donnees.telephoneClient,
        urlRetour: donnees.urlRetour || process.env.ABONNEMENT_URL_RETOUR,
    });
    yield functions_1.default.creer({
        idUtilisateur: donnees.idUtilisateur,
        plan,
        montant: definition.montant,
        devise: session.devise,
        reference,
        sessionId: session.id,
        checkoutUrl: session.checkoutUrl,
    });
    return { checkoutUrl: session.checkoutUrl, reference, montant: definition.montant, plan };
});
exports.demarrerSouscription = demarrerSouscription;
/**
 * Crédite une période à partir d'un paiement confirmé.
 *
 * Point de passage unique du webhook et de la vérification au retour : les deux
 * chemins peuvent constater le même paiement, parfois à quelques secondes d'écart.
 * La garde sur transactionId fait qu'un seul des deux crédite réellement.
 */
const activerDepuisPaiement = (donnees) => __awaiter(void 0, void 0, void 0, function* () {
    if (yield functions_1.default.transactionDejaTraitee(donnees.transactionId)) {
        return { traite: false, motif: "paiement déjà comptabilisé" };
    }
    const abonnement = donnees.reference
        ? yield functions_1.default.recupererParReference(donnees.reference)
        : null;
    if (!abonnement) {
        return { traite: false, motif: `aucune souscription pour la référence ${donnees.reference}` };
    }
    const plan = planValide(abonnement.plan);
    // Un renouvellement anticipé prolonge la période en cours au lieu de la remplacer.
    const depart = abonnement.dateFin && new Date(abonnement.dateFin).getTime() > Date.now()
        ? new Date(abonnement.dateFin)
        : new Date();
    yield functions_1.default.activer({
        idAbonnement: abonnement.idAbonnement,
        dateDebut: new Date().toISOString(),
        dateFin: ajouterJours(depart, PLANS[plan].jours).toISOString(),
        transactionId: donnees.transactionId,
        moyenPaiement: donnees.moyenPaiement || "",
    });
    return { traite: true, motif: "abonnement activé" };
});
/**
 * Traite un événement reçu de SasPay. Idempotent : le même paiement peut arriver
 * jusqu'à cinq fois (politique de réessai), il ne doit créditer qu'une période.
 */
const traiterEvenement = (evenement) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { event, data } = evenement;
    if (event !== "transaction.success") {
        // Les autres statuts (échec, annulation) laissent l'abonnement en attente :
        // le client peut relancer un paiement sans qu'on perde la trace de la demande.
        return { traite: false, motif: `événement ignoré (${event})` };
    }
    return activerDepuisPaiement({
        reference: String(((_a = data === null || data === void 0 ? void 0 : data.metadata) === null || _a === void 0 ? void 0 : _a.reference) || ""),
        transactionId: String((data === null || data === void 0 ? void 0 : data.id) || (data === null || data === void 0 ? void 0 : data.reference) || ""),
        moyenPaiement: String(((_b = data === null || data === void 0 ? void 0 : data.network) === null || _b === void 0 ? void 0 : _b.code) || (data === null || data === void 0 ? void 0 : data.network) || ""),
    });
});
exports.traiterEvenement = traiterEvenement;
/**
 * Vérifie auprès de SasPay où en est le paiement d'une souscription, et active
 * l'abonnement s'il est réglé.
 *
 * Deux usages : le test en local, où SasPay ne peut joindre aucun webhook faute
 * d'adresse publique ; et le filet en production, quand une notification se perd
 * (serveur redémarré, coupure réseau). Sans ce recours, un client aurait payé sans
 * être activé.
 */
const verifierEtActiver = (reference) => __awaiter(void 0, void 0, void 0, function* () {
    const abonnement = yield functions_1.default.recupererParReference(reference);
    if (!abonnement) {
        return { traite: false, motif: "souscription introuvable", statut: "absent" };
    }
    if (abonnement.statut === "actif" && joursRestants(abonnement.dateFin) > 0) {
        return { traite: false, motif: "abonnement déjà actif", statut: "actif" };
    }
    if (!abonnement.sessionId) {
        return { traite: false, motif: "aucune session de paiement enregistrée", statut: abonnement.statut };
    }
    const statut = yield saspay_1.default.statutCheckout(abonnement.sessionId);
    const paye = statut.statutTransaction === "SUCCESS" || statut.statutSession === "PAID";
    if (!paye) {
        return {
            traite: false,
            motif: `paiement non confirmé (${statut.statutSession || statut.statutTransaction || "inconnu"})`,
            statut: abonnement.statut,
        };
    }
    const resultat = yield activerDepuisPaiement({
        reference,
        transactionId: statut.transactionId,
    });
    return Object.assign(Object.assign({}, resultat), { statut: resultat.traite ? "actif" : abonnement.statut });
});
exports.verifierEtActiver = verifierEtActiver;
/** État présenté à l'application, et utilisé pour ouvrir ou fermer l'accès. */
const etatAbonnement = (idUtilisateur) => __awaiter(void 0, void 0, void 0, function* () {
    const requis = (0, exports.abonnementRequis)();
    const abonnement = yield functions_1.default.recupererParUtilisateur(idUtilisateur);
    const restants = joursRestants(abonnement === null || abonnement === void 0 ? void 0 : abonnement.dateFin);
    const actif = Boolean(abonnement && abonnement.statut === "actif" && restants > 0);
    let message = "";
    if (requis && !abonnement) {
        message = "Aucun abonnement n'est associé à ce compte. Souscrivez pour activer l'accès.";
    }
    else if (requis && !actif && (abonnement === null || abonnement === void 0 ? void 0 : abonnement.statut) === "en_attente") {
        message = "Votre paiement n'a pas encore été confirmé. Terminez la souscription pour continuer.";
    }
    else if (requis && !actif) {
        message = "Votre abonnement a expiré. Renouvelez-le pour retrouver l'accès.";
    }
    return {
        actif,
        requis,
        statut: (abonnement === null || abonnement === void 0 ? void 0 : abonnement.statut) || "absent",
        plan: (abonnement === null || abonnement === void 0 ? void 0 : abonnement.plan) || "",
        dateFin: (abonnement === null || abonnement === void 0 ? void 0 : abonnement.dateFin) || null,
        joursRestants: restants,
        message,
        checkoutUrl: (abonnement === null || abonnement === void 0 ? void 0 : abonnement.checkoutUrl) || null,
    };
});
exports.etatAbonnement = etatAbonnement;
/** Bloque-t-on la connexion de ce compte ? Faux tant que l'abonnement n'est pas exigé. */
const accesBloque = (idUtilisateur) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(0, exports.abonnementRequis)() || !idUtilisateur) {
        return { bloque: false, message: "" };
    }
    const etat = yield (0, exports.etatAbonnement)(idUtilisateur);
    return { bloque: !etat.actif, message: etat.message };
});
exports.accesBloque = accesBloque;
exports.default = {
    abonnementRequis: exports.abonnementRequis,
    demarrerSouscription: exports.demarrerSouscription,
    traiterEvenement: exports.traiterEvenement,
    verifierEtActiver: exports.verifierEtActiver,
    etatAbonnement: exports.etatAbonnement,
    accesBloque: exports.accesBloque,
    PLANS,
};
//# sourceMappingURL=services.js.map