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
const ajouterCulte = (data) => {
    const values = [
        data.typeCulte,
        data.dateCulte,
        data.dirigeant,
        data.predication,
        data.passageBiblique,
        data.themePredication,
        data.nombreHommeCulte,
        data.nombreFemmeCulte,
        data.offrandeCulte,
        data.ecodim,
        data.filleEcodim,
        data.offrandeEcodim,
        data.resumePredication,
        data.idUtilisateur,
    ];
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Un culte identique ne doit pas bloquer une autre eglise.
            const sqlCheck = `SELECT COUNT(*) as count FROM culte WHERE idUtilisateur = ? AND dateCulte = ?`;
            const [result] = yield (0, db_1._selectSql)(sqlCheck, [data.idUtilisateur, data.dateCulte]);
            if (result.count > 0) {
                return reject(new Error("Ce culte existe deja."));
            }
            const sql = `INSERT INTO culte(typeCulte,dateCulte,dirigeant,predication,passageBiblique,themePredication,nombreHommeCulte,nombreFemmeCulte,offrandeCulte,ecodim,filleEcodim,offrandeEcodim,resumePredication,idUtilisateur) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
            const culteData = yield (0, db_1._executeSql)(sql, values);
            resolve(culteData.insertId);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupCulte = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM culte ORDER BY idCulte ASC ;`;
            const culte = yield (0, db_1._selectSql)(sql, []);
            resolve(culte);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupCulteId = (id) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM culte WHERE idCulte = ? ;`;
            const culte = yield (0, db_1._selectSql)(sql, [id]);
            resolve(culte);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupCulteByIdUtilsateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM culte WHERE idUtilisateur= ?;`;
            const culte = yield (0, db_1._selectSql)(sql, [idUtilisateur]);
            // if (!culte.length) {
            //   return reject({ name: "Erreur_culte", message: "Aucun culte trouve" });
            // }
            resolve(culte);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerCulte = (idCulte, idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `DELETE FROM culte WHERE idCulte = ? AND idUtilisateur = ?`;
            yield (0, db_1._executeSql)(sql, [idCulte, idUtilisateur]);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierCulte = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `UPDATE culte SET typeCulte=?,dateCulte=?,dirigeant=?,predication=?,passageBiblique=?,themePredication=?,nombreHommeCulte=?,nombreFemmeCulte=?,offrandeCulte=?,ecodim=?,filleEcodim=?,offrandeEcodim=?,resumePredication=? WHERE idCulte=? AND idUtilisateur=?`;
            yield (0, db_1._executeSql)(sql, [
                data.typeCulte,
                data.dateCulte,
                data.dirigeant,
                data.predication,
                data.passageBiblique,
                data.themePredication,
                data.nombreHommeCulte,
                data.nombreFemmeCulte,
                data.offrandeCulte,
                data.ecodim,
                data.filleEcodim,
                data.offrandeEcodim,
                data.resumePredication,
                data.idCulte,
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
    recupCulte,
    ajouterCulte,
    supprimerCulte,
    modifierCulte,
    recupCulteId,
    recupCulteByIdUtilsateur,
};
//# sourceMappingURL=functions.js.map