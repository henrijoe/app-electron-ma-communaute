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
//   
const ajouterMariage = (data) => {
    const values = [
        data.idFrereMembre || null,
        data.idSoeurMembre || null,
        data.nomFrereMariage,
        data.nomSoeurMariage,
        data.dateMariage,
        data.lieuMariage,
        data.culteMariage,
        data.temoin1Mariage,
        data.temoin2Mariage,
        data.lieuReception,
        data.contactMariage,
        data.idUtilisateur
    ];
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sqlCheck = `SELECT COUNT(*) as count FROM mariage WHERE nomSoeurMariage = ?`;
            const [result] = yield (0, db_1._selectSql)(sqlCheck, [data.nomSoeurMariage]);
            if (result.count > 0) {
                // Si les libellés existent déjà, rejeter avec un message approprié
                return reject(new Error('Ce mariage existe déjà.'));
            }
            const sql = `INSERT INTO mariage(idFrereMembre,idSoeurMembre,nomFrereMariage,nomSoeurMariage,dateMariage,lieuMariage,culteMariage,temoin1Mariage,temoin2Mariage,lieuReception,contactMariage,idUtilisateur) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`;
            const mariageData = yield (0, db_1._executeSql)(sql, [...values]);
            resolve(mariageData.insertId);
        }
        catch (error) {
            reject(error);
        }
    }));
};
/**
 * recupererer toute les mariages
 * @returns
 */
const recupMariage = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM mariage ORDER BY idMariage ASC ;`;
            const mariage = yield (0, db_1._selectSql)(sql, []);
            resolve(mariage);
        }
        catch (error) {
            reject(error);
        }
    }));
};
// Fetcher une seule mariage
const recupMariageId = (id) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM mariage WHERE idMariage =? ;`;
            const mariage = yield (0, db_1._selectSql)(sql, [id]);
            resolve(mariage);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupMariageByIdUtilsateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM mariage WHERE idUtilisateur= ?;`;
            const mariage = yield (0, db_1._selectSql)(sql, [idUtilisateur]);
            if (!mariage.length)
                return reject({ name: "Erreur_mariage", message: "Aucun mariage trouvé" });
            resolve(mariage);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerMariage = (idMariage) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `DELETE FROM mariage WHERE idMariage = ?`;
            yield (0, db_1._executeSql)(sql, [idMariage]);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierMariage = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `UPDATE mariage SET idFrereMembre=?,idSoeurMembre=?,nomFrereMariage=?,nomSoeurMariage=?,dateMariage=?,lieuMariage=?,culteMariage=?,temoin1Mariage=?,temoin2Mariage=?,lieuReception=?,contactMariage=?,idUtilisateur=? WHERE idMariage=?`;
            yield (0, db_1._executeSql)(sql, [
                data.idFrereMembre || null,
                data.idSoeurMembre || null,
                data.nomFrereMariage,
                data.nomSoeurMariage,
                data.dateMariage,
                data.lieuMariage,
                data.culteMariage,
                data.temoin1Mariage,
                data.temoin2Mariage,
                data.lieuReception,
                data.contactMariage,
                data.idUtilisateur,
                data.idMariage,
            ]);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    recupMariage,
    ajouterMariage,
    supprimerMariage,
    modifierMariage,
    recupMariageId,
    recupMariageByIdUtilsateur
};
//# sourceMappingURL=functions.js.map