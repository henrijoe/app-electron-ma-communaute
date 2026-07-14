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
const ajouterGroupe = (data) => {
    const values = [
        data.libelleGroupe,
        data.descriptionGroupe || "",
        data.responsableGroupe || "",
        data.idUtilisateur,
    ];
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Le doublon doit etre verifie par utilisateur pour isoler les eglises.
            const sqlCheck = `SELECT COUNT(*) as count FROM groupe WHERE idUtilisateur = ? AND libelleGroupe = ?`;
            const [result] = yield (0, db_1._selectSql)(sqlCheck, [data.idUtilisateur, data.libelleGroupe]);
            if (result.count > 0) {
                return reject(new Error("Ce groupe existe deja."));
            }
            const sql = `INSERT INTO groupe(libelleGroupe,descriptionGroupe,responsableGroupe,idUtilisateur) VALUES (?,?,?,?)`;
            const groupeData = yield (0, db_1._executeSql)(sql, values);
            resolve(groupeData.insertId);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupGroupe = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM groupe ORDER BY idGroupe ASC ;`;
            const groupe = yield (0, db_1._selectSql)(sql, []);
            resolve(groupe);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupGroupeId = (id) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM groupe WHERE idGroupe = ? ;`;
            const groupe = yield (0, db_1._selectSql)(sql, [id]);
            resolve(groupe);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupGroupeByIdUtilsateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM groupe WHERE idUtilisateur= ?;`;
            const groupes = yield (0, db_1._selectSql)(sql, [idUtilisateur]);
            if (groupes.length === 0) {
                return reject({ name: "Erreur_groupe", message: "Aucun groupe trouve" });
            }
            resolve(groupes);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerGroupe = (idGroupe, idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const hasUserScope = typeof idUtilisateur === "number";
            const sql = hasUserScope
                ? `DELETE FROM groupe WHERE idGroupe = ? AND idUtilisateur = ?`
                : `DELETE FROM groupe WHERE idGroupe = ?`;
            const params = hasUserScope ? [idGroupe, idUtilisateur] : [idGroupe];
            yield (0, db_1._executeSql)(sql, params);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierGroupe = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Correction importante: l'ordre des parametres doit suivre l'ordre des placeholders SQL.
            const hasUserScope = typeof data.idUtilisateur === "number";
            const sql = hasUserScope
                ? `UPDATE groupe SET libelleGroupe=?, descriptionGroupe=?, responsableGroupe=?, idUtilisateur=? WHERE idGroupe=? AND idUtilisateur=?`
                : `UPDATE groupe SET libelleGroupe=?, descriptionGroupe=?, responsableGroupe=?, idUtilisateur=? WHERE idGroupe=?`;
            const params = hasUserScope
                ? [
                    data.libelleGroupe,
                    data.descriptionGroupe || "",
                    data.responsableGroupe || "",
                    data.idUtilisateur,
                    data.idGroupe,
                    data.idUtilisateur,
                ]
                : [
                    data.libelleGroupe,
                    data.descriptionGroupe || "",
                    data.responsableGroupe || "",
                    data.idUtilisateur,
                    data.idGroupe,
                ];
            yield (0, db_1._executeSql)(sql, params);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    recupGroupe,
    ajouterGroupe,
    supprimerGroupe,
    modifierGroupe,
    recupGroupeId,
    recupGroupeByIdUtilsateur,
};
//# sourceMappingURL=functions.js.map