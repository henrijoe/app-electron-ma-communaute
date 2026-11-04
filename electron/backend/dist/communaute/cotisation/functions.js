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
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../db");
const recupCotisations = (idUtilisateur) => (0, db_1._selectSql)(`SELECT * FROM autre_cotisation WHERE idUtilisateur = ?
     ORDER BY dateVersement DESC, idCotisation DESC;`, [idUtilisateur]);
const recupCotisation = (idCotisation, idUtilisateur) => __awaiter(void 0, void 0, void 0, function* () {
    const lignes = yield (0, db_1._selectSql)(`SELECT * FROM autre_cotisation WHERE idCotisation = ? AND idUtilisateur = ?;`, [idCotisation, idUtilisateur]);
    return (lignes === null || lignes === void 0 ? void 0 : lignes[0]) || null;
});
// Un compte secondaire enregistre aussi des membres : ils appartiennent à la même église.
const recupMembre = (idMembre, idUtilisateur) => __awaiter(void 0, void 0, void 0, function* () {
    const lignes = yield (0, db_1._selectSql)(`SELECT idMembre, nomMembre, prenomMembre FROM membre
     WHERE idMembre = ?
       AND (idUtilisateur = ?
            OR idUtilisateur IN (SELECT idUtilisateur FROM utilisateur WHERE idUtilisateurParent = ?));`, [idMembre, idUtilisateur, idUtilisateur]);
    return (lignes === null || lignes === void 0 ? void 0 : lignes[0]) || null;
});
const ajouterCotisation = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const resultat = yield (0, db_1._executeSql)(`INSERT INTO autre_cotisation
       (nomCotisation, idMembre, nomMembreVersement, montantVersement, dateVersement, observationVersement, idUtilisateur)
     VALUES (?, ?, ?, ?, ?, ?, ?);`, [
        data.nomCotisation,
        data.idMembre,
        data.nomMembreVersement,
        data.montantVersement,
        data.dateVersement,
        data.observationVersement,
        data.idUtilisateur,
    ]);
    return Number(resultat.insertId);
});
const modifierCotisation = (idCotisation, data) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_1._executeSql)(`UPDATE autre_cotisation
     SET nomCotisation = ?, idMembre = ?, nomMembreVersement = ?, montantVersement = ?,
         dateVersement = ?, observationVersement = ?
     WHERE idCotisation = ? AND idUtilisateur = ?;`, [
        data.nomCotisation,
        data.idMembre,
        data.nomMembreVersement,
        data.montantVersement,
        data.dateVersement,
        data.observationVersement,
        idCotisation,
        data.idUtilisateur,
    ]);
});
const supprimerCotisation = (idCotisation, idUtilisateur) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_1._executeSql)(`DELETE FROM autre_cotisation WHERE idCotisation = ? AND idUtilisateur = ?;`, [
        idCotisation,
        idUtilisateur,
    ]);
});
exports.default = {
    recupCotisations,
    recupCotisation,
    recupMembre,
    ajouterCotisation,
    modifierCotisation,
    supprimerCotisation,
};
//# sourceMappingURL=functions.js.map