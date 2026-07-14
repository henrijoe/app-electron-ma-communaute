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
const ajouterDepartement = (data) => {
    const values = [
        data.libelleLongDepartement,
        data.libelleCourtDepartement,
        data.sloganDepartement,
        data.responsableDepartement,
        data.idUtilisateur,
    ];
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // La verification de doublon reste locale a l'utilisateur pour ne pas bloquer une autre eglise.
            const sqlCheck = `SELECT COUNT(*) as count FROM departement WHERE idUtilisateur = ? AND (libelleLongDepartement = ? OR libelleCourtDepartement = ?)`;
            const [result] = yield (0, db_1._selectSql)(sqlCheck, [
                data.idUtilisateur,
                data.libelleLongDepartement,
                data.libelleCourtDepartement,
            ]);
            if (result.count > 0) {
                return reject(new Error("Ce departement existe deja."));
            }
            const sqlInsert = `INSERT INTO departement(libelleLongDepartement,libelleCourtDepartement,sloganDepartement,responsableDepartement,idUtilisateur) VALUES (?,?,?,?,?)`;
            const departement = yield (0, db_1._executeSql)(sqlInsert, values);
            resolve(departement.insertId);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupDepartement = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM departement ORDER BY idDepartement ASC ;`;
            const departement = yield (0, db_1._selectSql)(sql, []);
            resolve(departement);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupDepartementById = (id) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM departement WHERE idDepartement = ? ;`;
            const departement = yield (0, db_1._selectSql)(sql, [id]);
            resolve(departement);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupDepartementByIdUtilsateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM departement WHERE idUtilisateur= ?;`;
            const departements = yield (0, db_1._selectSql)(sql, [idUtilisateur]);
            if (!departements.length) {
                return reject({ name: "Erreur_departement", message: "Aucun departement trouve" });
            }
            resolve(departements);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerDepartement = (idDepartement, idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `DELETE FROM departement WHERE idDepartement = ? AND idUtilisateur = ?`;
            yield (0, db_1._executeSql)(sql, [idDepartement, idUtilisateur]);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierDepartement = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `UPDATE departement SET libelleLongDepartement=?,libelleCourtDepartement=?,sloganDepartement=?,responsableDepartement=? WHERE idDepartement=? AND idUtilisateur=?`;
            yield (0, db_1._executeSql)(sql, [
                data.libelleLongDepartement,
                data.libelleCourtDepartement,
                data.sloganDepartement,
                data.responsableDepartement,
                data.idDepartement,
                data.idUtilisateur,
            ]);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    ajouterDepartement,
    recupDepartement,
    supprimerDepartement,
    modifierDepartement,
    recupDepartementById,
    recupDepartementByIdUtilsateur,
};
//# sourceMappingURL=functions.js.map