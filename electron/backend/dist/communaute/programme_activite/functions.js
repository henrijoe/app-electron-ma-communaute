"use strict";
// Programmes d'activités (jeunesse d'abord) : une feuille par période, avec une
// ligne par rencontre — qui dirige, qui parle, l'activité, les thèmes, le lieu.
//
// Les lignes sont rangées en JSON dans `lignesProgramme` : la feuille se saisit,
// se relit et s'imprime d'un bloc, comme le programme des moniteurs de l'Ecodim.
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
exports.supprimerProgramme = exports.modifierProgramme = exports.ajouterProgramme = exports.recupProgrammes = void 0;
const db_1 = require("../../db");
const texte = (valeur) => String(valeur !== null && valeur !== void 0 ? valeur : "").trim();
const lignesEnTexte = (lignes) => {
    if (lignes === null || lignes === undefined || lignes === "")
        return "[]";
    if (typeof lignes === "string")
        return lignes;
    return JSON.stringify(lignes);
};
const lireLignes = (valeur) => {
    try {
        const lignes = JSON.parse(String(valeur || "[]"));
        return Array.isArray(lignes) ? lignes : [];
    }
    catch (_erreur) {
        return [];
    }
};
// Seule la jeunesse s'en sert pour l'instant ; la colonne permet d'en ouvrir
// d'autres (femmes, hommes...) sans nouvelle table.
const section = (valeur) => texte(valeur) || "jeunesse";
const CHAMPS = [
    { nom: "sectionProgramme", valeur: (d) => section(d.sectionProgramme) },
    { nom: "titreProgramme", valeur: (d) => texte(d.titreProgramme) },
    { nom: "dateDebutProgramme", valeur: (d) => texte(d.dateDebutProgramme) || null },
    { nom: "dateFinProgramme", valeur: (d) => texte(d.dateFinProgramme) || null },
    { nom: "enteteProgramme", valeur: (d) => texte(d.enteteProgramme) },
    { nom: "themeAnnuel", valeur: (d) => texte(d.themeAnnuel) },
    { nom: "passageTheme", valeur: (d) => texte(d.passageTheme) },
    { nom: "afficherOrateurs", valeur: (d) => (d.afficherOrateurs === false || Number(d.afficherOrateurs) === 0 ? 0 : 1) },
    { nom: "lignesProgramme", valeur: (d) => { var _a; return lignesEnTexte((_a = d.lignesProgramme) !== null && _a !== void 0 ? _a : d.lignes); } },
    { nom: "dateModification", valeur: () => new Date().toISOString() },
];
const COLONNES = CHAMPS.map((champ) => champ.nom).join(", ");
const PLACEHOLDERS = CHAMPS.map(() => "?").join(",");
const AFFECTATIONS = CHAMPS.map((champ) => `${champ.nom} = ?`).join(", ");
const valeurs = (data) => CHAMPS.map((champ) => champ.valeur(data));
const verifier = (data) => {
    if (!texte(data === null || data === void 0 ? void 0 : data.titreProgramme)) {
        throw new Error("Donnez un titre au programme.");
    }
};
const recupProgrammes = (idUtilisateur, sectionProgramme) => __awaiter(void 0, void 0, void 0, function* () {
    const lignes = yield (0, db_1._selectSql)(`SELECT * FROM programme_activite
      WHERE idUtilisateur = ? AND sectionProgramme = ?
      ORDER BY dateDebutProgramme DESC, idProgrammeActivite DESC`, [idUtilisateur, section(sectionProgramme)]);
    return (Array.isArray(lignes) ? lignes : []).map((ligne) => (Object.assign(Object.assign({}, ligne), { lignes: lireLignes(ligne.lignesProgramme) })));
});
exports.recupProgrammes = recupProgrammes;
const ajouterProgramme = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    verifier(data);
    const resultat = yield (0, db_1._executeSql)(`INSERT INTO programme_activite (${COLONNES}, idUtilisateur) VALUES (${PLACEHOLDERS},?)`, [...valeurs(data), data.idUtilisateur]);
    return (_b = (_a = resultat === null || resultat === void 0 ? void 0 : resultat.insertId) !== null && _a !== void 0 ? _a : resultat === null || resultat === void 0 ? void 0 : resultat.lastID) !== null && _b !== void 0 ? _b : null;
});
exports.ajouterProgramme = ajouterProgramme;
const modifierProgramme = (data) => __awaiter(void 0, void 0, void 0, function* () {
    verifier(data);
    yield (0, db_1._executeSql)(`UPDATE programme_activite SET ${AFFECTATIONS} WHERE idProgrammeActivite = ? AND idUtilisateur = ?`, [...valeurs(data), data.idProgrammeActivite, data.idUtilisateur]);
    return true;
});
exports.modifierProgramme = modifierProgramme;
const supprimerProgramme = (idProgrammeActivite, idUtilisateur) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_1._executeSql)(`DELETE FROM programme_activite WHERE idProgrammeActivite = ? AND idUtilisateur = ?`, [idProgrammeActivite, idUtilisateur]);
    return true;
});
exports.supprimerProgramme = supprimerProgramme;
exports.default = { recupProgrammes: exports.recupProgrammes, ajouterProgramme: exports.ajouterProgramme, modifierProgramme: exports.modifierProgramme, supprimerProgramme: exports.supprimerProgramme };
//# sourceMappingURL=functions.js.map