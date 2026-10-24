"use strict";
// Accès base pour les abonnements. Une ligne par église (idUtilisateur).
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.marquerStatut = exports.activer = exports.creer = exports.transactionDejaTraitee = exports.recupererParReference = exports.recupererParUtilisateur = void 0;
const db_1 = require("../../db");
const recupererParUtilisateur = (idUtilisateur) => __awaiter(void 0, void 0, void 0, function* () {
    const lignes = yield (0, db_1._selectSql)("SELECT * FROM abonnement WHERE idUtilisateur = ? ORDER BY idAbonnement DESC LIMIT 1", [idUtilisateur]);
    return Array.isArray(lignes) && lignes.length ? lignes[0] : null;
});
exports.recupererParUtilisateur = recupererParUtilisateur;
const recupererParReference = (reference) => __awaiter(void 0, void 0, void 0, function* () {
    const lignes = yield (0, db_1._selectSql)("SELECT * FROM abonnement WHERE reference = ? LIMIT 1", [
        reference,
    ]);
    return Array.isArray(lignes) && lignes.length ? lignes[0] : null;
});
exports.recupererParReference = recupererParReference;
/** Vrai si ce paiement a déjà été comptabilisé : le webhook est réémis jusqu'à 5 fois. */
const transactionDejaTraitee = (transactionId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!transactionId) {
        return false;
    }
    const lignes = yield (0, db_1._selectSql)("SELECT idAbonnement FROM abonnement WHERE transactionId = ? LIMIT 1", [transactionId]);
    return Array.isArray(lignes) && lignes.length > 0;
});
exports.transactionDejaTraitee = transactionDejaTraitee;
const creer = (donnees) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_1._executeSql)(`INSERT INTO abonnement (idUtilisateur, plan, statut, montant, devise, reference, sessionId, checkoutUrl, dateModification)
     VALUES (?,?,?,?,?,?,?,?,?)`, [
        donnees.idUtilisateur,
        donnees.plan,
        "en_attente",
        donnees.montant,
        donnees.devise,
        donnees.reference,
        donnees.sessionId,
        donnees.checkoutUrl,
        new Date().toISOString(),
    ]);
});
exports.creer = creer;
const activer = (donnees) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_1._executeSql)(`UPDATE abonnement
        SET statut = 'actif', dateDebut = ?, dateFin = ?, transactionId = ?,
            moyenPaiement = ?, dateModification = ?
      WHERE idAbonnement = ?`, [
        donnees.dateDebut,
        donnees.dateFin,
        donnees.transactionId,
        donnees.moyenPaiement,
        new Date().toISOString(),
        donnees.idAbonnement,
    ]);
});
exports.activer = activer;
const marquerStatut = (idAbonnement, statut) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_1._executeSql)("UPDATE abonnement SET statut = ?, dateModification = ? WHERE idAbonnement = ?", [statut, new Date().toISOString(), idAbonnement]);
});
exports.marquerStatut = marquerStatut;
exports.default = {
    recupererParUtilisateur: exports.recupererParUtilisateur,
    recupererParReference: exports.recupererParReference,
    transactionDejaTraitee: exports.transactionDejaTraitee,
    creer: exports.creer,
    activer: exports.activer,
    marquerStatut: exports.marquerStatut,
};
//# sourceMappingURL=functions.js.map