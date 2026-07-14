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
const ajouterResponsabilite = (data) => {
    const values = [
        data.idMembre,
        data.idResponsabilite,
        data.idCellule,
        data.idUtilisateur
    ];
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `INSERT INTO responsable_cellule(idMembre,idResponsabilite,idCellule,idUtilisateur) VALUES (?,?,?,?)`;
            const responsabilite = yield (0, db_1._executeSql)(sql, [...values]);
            resolve(responsabilite.insertId);
        }
        catch (error) {
            reject(error);
        }
    }));
};
/**
 * recupererer toute les responsabilites
 * @returns
 */
const recupResponsabilite = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM responsable_cellule ORDER BY idMembre ASC ;`;
            const responsabilite = yield (0, db_1._selectSql)(sql, []);
            resolve(responsabilite);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupResponsabiliteById = (id) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM responsable_cellule WHERE idMembre =? ;`;
            const responsabilite = yield (0, db_1._selectSql)(sql, [id]);
            resolve(responsabilite);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerResponsabilite = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM responsable_cellule WHERE idMembre = ?`;
        (0, db_1._executeSql)(sql, [id])
            .then(() => {
            resolve(true);
        })
            .catch((error) => {
            reject(error);
        });
    });
};
const modifierResponsabilite = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `UPDATE responsable_cellule SET idMembre=?, idResponsabilite=?,idCellule=?,idUtilisateur=? WHERE idMembre=?`;
            yield (0, db_1._executeSql)(sql, [
                data.idMembre,
                data.idResponsabilite,
                data.idCellule,
                data.idUtilisateur
            ]);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    ajouterResponsabilite,
    recupResponsabilite,
    supprimerResponsabilite,
    modifierResponsabilite,
    recupResponsabiliteById
};
//# sourceMappingURL=functions.js.map