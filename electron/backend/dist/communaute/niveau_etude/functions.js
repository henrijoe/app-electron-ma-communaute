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
exports.obtenirIdNiveauEtude = void 0;
const db_1 = require("../../db");
// 
const ajouterNiveauEtude = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `INSERT INTO niveau_etude(libelleNiveauEtude) VALUES (?)`;
            const niveauEtude = yield (0, db_1._executeSql)(sql, [data.libelleNiveauEtude]);
            resolve(niveauEtude.insertId);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const obtenirIdNiveauEtude = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM niveau_etude ORDER BY idNiveauEtude ASC;`;
            const niveau = yield (0, db_1._selectSql)(sql, []);
            resolve(niveau);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.obtenirIdNiveauEtude = obtenirIdNiveauEtude;
const obtenirIdNiveauEtudeById = (id) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM niveau_etude WHERE idNiveauEtude = ?;`;
            const niveau = yield (0, db_1._selectSql)(sql, [id]);
            resolve(niveau);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerNiveau = (idNiveauEtude) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM niveau_etude WHERE idNiveauEtude = ?`;
        (0, db_1._executeSql)(sql, [idNiveauEtude])
            .then(() => {
            resolve(true);
        })
            .catch((error) => {
            reject(error);
        });
    });
};
const modifierNiveau = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `UPDATE niveau_etude SET libelleNiveauEtude=? WHERE idNiveauEtude=?`;
            yield (0, db_1._executeSql)(sql, [
                data.libelleNiveauEtude,
                data.idNiveauEtude,
            ]);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    ajouterNiveauEtude,
    obtenirIdNiveauEtude: exports.obtenirIdNiveauEtude,
    supprimerNiveau,
    modifierNiveau,
    obtenirIdNiveauEtudeById
};
//# sourceMappingURL=functions.js.map