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
// Ajoute une eglise pour un utilisateur donne.
const ajouterEglise = (data) => {
    const values = [data.nomEglise, data.idComptabilite, data.idUtilisateur];
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `INSERT INTO eglise(nomEglise,idComptabilite,idUtilisateur) VALUES (?,?,?)`;
            const egliseData = yield (0, db_1._executeSql)(sql, values);
            resolve(egliseData.insertId);
        }
        catch (error) {
            reject(error);
        }
    }));
};
/**
 * Recupere toutes les eglises.
 */
const recupEglise = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM eglise ORDER BY idEglise ASC ;`;
            const eglise = yield (0, db_1._selectSql)(sql, []);
            resolve(eglise);
        }
        catch (error) {
            reject(error);
        }
    }));
};
/**
 * Recupere une eglise par son identifiant.
 */
const recupEgliseById = (id) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM eglise WHERE idEglise = ? ;`;
            const eglise = yield (0, db_1._selectSql)(sql, [id]);
            resolve(eglise);
        }
        catch (error) {
            reject(error);
        }
    }));
};
/**
 * Recupere l'eglise rattachee a un utilisateur.
 */
const recupEgliseByUtilisateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM eglise WHERE idUtilisateur = ? ORDER BY idEglise ASC ;`;
            const eglise = yield (0, db_1._selectSql)(sql, [idUtilisateur]);
            resolve(eglise);
        }
        catch (error) {
            reject(error);
        }
    }));
};
// Supprime l'eglise. Quand idUtilisateur est fourni, on verrouille la suppression.
const supprimerEglise = (idEglise, idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const hasUserScope = typeof idUtilisateur === "number";
            const sql = hasUserScope
                ? `DELETE FROM eglise WHERE idEglise = ? AND idUtilisateur = ?`
                : `DELETE FROM eglise WHERE idEglise = ?`;
            const params = hasUserScope ? [idEglise, idUtilisateur] : [idEglise];
            yield (0, db_1._executeSql)(sql, params);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
// Modifie l'eglise de l'utilisateur cible sans toucher aux autres eglises.
const modifierEglise = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const hasUserScope = typeof data.idUtilisateur === "number";
            const sql = hasUserScope
                ? `UPDATE eglise SET nomEglise=?,idComptabilite=? WHERE idEglise=? AND idUtilisateur=?`
                : `UPDATE eglise SET nomEglise=?,idComptabilite=? WHERE idEglise=?`;
            const params = hasUserScope
                ? [data.nomEglise, data.idComptabilite, data.idEglise, data.idUtilisateur]
                : [data.nomEglise, data.idComptabilite, data.idEglise];
            yield (0, db_1._executeSql)(sql, params);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    recupEglise,
    ajouterEglise,
    supprimerEglise,
    modifierEglise,
    recupEgliseById,
    recupEgliseByUtilisateur,
};
//# sourceMappingURL=functions.js.map