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
const ajouterNaissance = (data) => {
    const values = [
        data.nomCoupleNaissance,
        data.dateNaissance,
        data.lieuNaissance,
        data.nomEnfantNaissance,
        data.datePresentationNaissance,
        data.idUtilisateur,
    ];
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `INSERT INTO naissance(nomCoupleNaissance,dateNaissance,lieuNaissance,nomEnfantNaissance,datePresentationNaissance,idUtilisateur) VALUES (?,?,?,?,?,?)`;
            const naissanceData = yield (0, db_1._executeSql)(sql, values);
            resolve(naissanceData.insertId);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupNaissance = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM naissance ORDER BY idNaissance ASC ;`;
            const naissance = yield (0, db_1._selectSql)(sql, []);
            resolve(naissance);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupNaissanceId = (id) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM naissance WHERE idNaissance = ? ;`;
            const naissance = yield (0, db_1._selectSql)(sql, [id]);
            resolve(naissance);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupNaissanceByIdUtilsateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM naissance WHERE idUtilisateur= ?;`;
            const naissance = yield (0, db_1._selectSql)(sql, [idUtilisateur]);
            if (!naissance.length) {
                return reject({ name: "Erreur_naissance", message: "Aucune naissance trouvee" });
            }
            resolve(naissance);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerNaissance = (idNaissance, idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const hasUserScope = typeof idUtilisateur === "number";
            const sql = hasUserScope
                ? `DELETE FROM naissance WHERE idNaissance = ? AND idUtilisateur = ?`
                : `DELETE FROM naissance WHERE idNaissance = ?`;
            const params = hasUserScope ? [idNaissance, idUtilisateur] : [idNaissance];
            yield (0, db_1._executeSql)(sql, params);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierNaissance = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const hasUserScope = typeof data.idUtilisateur === "number";
            const sql = hasUserScope
                ? `UPDATE naissance SET nomCoupleNaissance=?,dateNaissance=?,lieuNaissance=?,nomEnfantNaissance=?,datePresentationNaissance=?,idUtilisateur=? WHERE idNaissance=? AND idUtilisateur=?`
                : `UPDATE naissance SET nomCoupleNaissance=?,dateNaissance=?,lieuNaissance=?,nomEnfantNaissance=?,datePresentationNaissance=?,idUtilisateur=? WHERE idNaissance=?`;
            const params = hasUserScope
                ? [
                    data.nomCoupleNaissance,
                    data.dateNaissance,
                    data.lieuNaissance,
                    data.nomEnfantNaissance,
                    data.datePresentationNaissance,
                    data.idUtilisateur,
                    data.idNaissance,
                    data.idUtilisateur,
                ]
                : [
                    data.nomCoupleNaissance,
                    data.dateNaissance,
                    data.lieuNaissance,
                    data.nomEnfantNaissance,
                    data.datePresentationNaissance,
                    data.idUtilisateur,
                    data.idNaissance,
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
    recupNaissance,
    ajouterNaissance,
    supprimerNaissance,
    modifierNaissance,
    recupNaissanceId,
    recupNaissanceByIdUtilsateur,
};
//# sourceMappingURL=functions.js.map