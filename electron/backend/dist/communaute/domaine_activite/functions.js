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
exports.obtenirDomaineActiviteById = exports.obtenirDomaineActivite = void 0;
const db_1 = require("../../db");
// 
const ajouterDomaineActivite = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `INSERT INTO domaine_activite(libelleDomaineActivite) VALUES (?)`;
            const domaineActivite = yield (0, db_1._executeSql)(sql, [data.libelleDomaineActivite]);
            resolve(domaineActivite.insertId);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const obtenirDomaineActivite = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM domaine_activite ORDER BY idDomaineActivite ASC`;
            const domaine_activite = yield (0, db_1._selectSql)(sql, []);
            resolve(domaine_activite);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.obtenirDomaineActivite = obtenirDomaineActivite;
const obtenirDomaineActiviteById = (id) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM domaine_activite WHERE idDomaineActivite = ?`;
            const domaine_activite = yield (0, db_1._selectSql)(sql, [id]);
            resolve(domaine_activite);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.obtenirDomaineActiviteById = obtenirDomaineActiviteById;
const supprimerDomaineActivite = (idDomaineActivite) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM domaine_activite WHERE idDomaineActivite = ?`;
        (0, db_1._executeSql)(sql, [idDomaineActivite])
            .then(() => {
            resolve(true);
        })
            .catch((error) => {
            reject(error);
        });
    });
};
const modifierDomaineActivite = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `UPDATE domaine_activite SET libelleDomaineActivite=? WHERE idDomaineActivite=?`;
            yield (0, db_1._executeSql)(sql, [
                data.libelleDomaineActivite,
                data.idDomaineActivite,
            ]);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    ajouterDomaineActivite,
    obtenirDomaineActivite: exports.obtenirDomaineActivite,
    supprimerDomaineActivite,
    modifierDomaineActivite,
    obtenirDomaineActiviteById: exports.obtenirDomaineActiviteById
};
//# sourceMappingURL=functions.js.map