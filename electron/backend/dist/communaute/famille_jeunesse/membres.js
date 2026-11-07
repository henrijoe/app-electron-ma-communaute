"use strict";
// Membres d'une famille de jeunesse.
//
// Une famille ne portait qu'un nombre de membres saisi à la main. Le lien
// membre ↔ famille permet d'imprimer la feuille de la famille avec, pour chacun,
// ses contacts, son domicile, son baptême, son niveau d'étude et sa fonction —
// lus sur sa fiche de membre, jamais ressaisis.
//
// Un membre n'appartient qu'à une famille : l'ajouter à une famille le retire de
// celle où il était.
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
exports.enregistrerMembresFamille = exports.recupMembresFamilles = void 0;
const express_1 = __importDefault(require("express"));
const db_1 = require("../../db");
const functions_1 = require("../functions");
const recupMembresFamilles = (idUtilisateur) => __awaiter(void 0, void 0, void 0, function* () {
    const lignes = yield (0, db_1._selectSql)(`SELECT lien.idFamilleJeunesse, lien.idMembre,
            membre.nomMembre, membre.prenomMembre, membre.contactMembre,
            membre.residenceMembre, membre.baptemeEauMembre, membre.fonctionMembre,
            niveau.libelleNiveauEtude
       FROM famille_jeunesse_membre lien
       JOIN membre ON membre.idMembre = lien.idMembre
       LEFT JOIN niveau_etude niveau ON niveau.idNiveauEtude = membre.idNiveauEtude
      WHERE lien.idUtilisateur = ?
      ORDER BY membre.nomMembre ASC, membre.prenomMembre ASC`, [idUtilisateur]);
    return Array.isArray(lignes) ? lignes : [];
});
exports.recupMembresFamilles = recupMembresFamilles;
const enregistrerMembresFamille = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const idFamille = Number(data === null || data === void 0 ? void 0 : data.idFamilleJeunesse);
    const idUtilisateur = Number(data === null || data === void 0 ? void 0 : data.idUtilisateur);
    if (!idFamille || !idUtilisateur) {
        throw new Error("Famille ou église introuvable.");
    }
    const membres = Array.from(new Set((Array.isArray(data === null || data === void 0 ? void 0 : data.membres) ? data.membres : []).map(Number).filter((id) => id > 0)));
    // La liste envoyée remplace celle de la famille.
    yield (0, db_1._executeSql)("DELETE FROM famille_jeunesse_membre WHERE idFamilleJeunesse = ? AND idUtilisateur = ?", [idFamille, idUtilisateur]);
    for (const idMembre of membres) {
        // Un membre ne reste que dans une famille.
        yield (0, db_1._executeSql)("DELETE FROM famille_jeunesse_membre WHERE idMembre = ? AND idUtilisateur = ?", [idMembre, idUtilisateur]);
        yield (0, db_1._executeSql)("INSERT INTO famille_jeunesse_membre (idFamilleJeunesse, idMembre, idUtilisateur) VALUES (?,?,?)", [idFamille, idMembre, idUtilisateur]);
    }
    return true;
});
exports.enregistrerMembresFamille = enregistrerMembresFamille;
const membresFamilleRouter = express_1.default.Router();
membresFamilleRouter.get("/recupmembresfamillejeunessebyutilisateur/:idUtilisateur", (req, res) => (0, exports.recupMembresFamilles)(Number(req.params.idUtilisateur))
    .then((result) => res.status(200).send({ status: 1, data: result }))
    .catch((error) => res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) })));
membresFamilleRouter.post("/enregistrermembresfamillejeunesse", (req, res) => (0, exports.enregistrerMembresFamille)(req.body)
    .then((result) => {
    var _a, _b;
    (_a = req.io) === null || _a === void 0 ? void 0 : _a.emit("modifierFamilleJeunesse", { idUtilisateur: (_b = req.body) === null || _b === void 0 ? void 0 : _b.idUtilisateur });
    res.status(200).send({ status: 1, data: result });
})
    .catch((error) => res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) })));
exports.default = membresFamilleRouter;
//# sourceMappingURL=membres.js.map