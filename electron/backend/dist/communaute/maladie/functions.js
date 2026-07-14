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
const ajouterMaladie = (data) => {
    const values = [
        data.idMembre || null,
        data.nomMembreMaladie,
        data.typeMaladie,
        data.dateMaladie,
        data.lieuHospitalisation,
        data.observationMaladie,
        data.idUtilisateur,
    ];
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sqlCheck = `SELECT COUNT(*) as count FROM maladie WHERE nomMembreMaladie = ? AND dateMaladie = ?`;
            const [result] = yield (0, db_1._selectSql)(sqlCheck, [data.nomMembreMaladie, data.dateMaladie]);
            if ((result === null || result === void 0 ? void 0 : result.count) > 0) {
                return reject(new Error('Ce cas de maladie existe deja.'));
            }
            const sql = `INSERT INTO maladie(idMembre,nomMembreMaladie,typeMaladie,dateMaladie,lieuHospitalisation,observationMaladie,idUtilisateur) VALUES (?,?,?,?,?,?,?)`;
            const maladieData = yield (0, db_1._executeSql)(sql, values);
            resolve(maladieData.insertId);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupMaladie = () => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sql = `SELECT * FROM maladie ORDER BY idMaladie ASC ;`;
        const maladie = yield (0, db_1._selectSql)(sql, []);
        resolve(maladie);
    }
    catch (error) {
        reject(error);
    }
}));
const recupMaladieId = (id) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sql = `SELECT * FROM maladie WHERE idMaladie = ? ;`;
        const maladie = yield (0, db_1._selectSql)(sql, [id]);
        resolve(maladie);
    }
    catch (error) {
        reject(error);
    }
}));
const recupMaladieByIdUtilsateur = (idUtilisateur) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sql = `SELECT * FROM maladie WHERE idUtilisateur = ?;`;
        const maladie = yield (0, db_1._selectSql)(sql, [idUtilisateur]);
        if (!maladie.length)
            return reject({ name: 'Erreur_maladie', message: 'Aucune maladie trouvee' });
        resolve(maladie);
    }
    catch (error) {
        reject(error);
    }
}));
const supprimerMaladie = (idMaladie) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sql = `DELETE FROM maladie WHERE idMaladie = ?`;
        yield (0, db_1._executeSql)(sql, [idMaladie]);
        resolve(true);
    }
    catch (error) {
        reject(error);
    }
}));
const modifierMaladie = (data) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sql = `UPDATE maladie SET idMembre=?,nomMembreMaladie=?,typeMaladie=?,dateMaladie=?,lieuHospitalisation=?,observationMaladie=?,idUtilisateur=? WHERE idMaladie=?`;
        yield (0, db_1._executeSql)(sql, [
            data.idMembre || null,
            data.nomMembreMaladie,
            data.typeMaladie,
            data.dateMaladie,
            data.lieuHospitalisation,
            data.observationMaladie,
            data.idUtilisateur,
            data.idMaladie,
        ]);
        resolve(true);
    }
    catch (error) {
        reject(error);
    }
}));
exports.default = {
    ajouterMaladie,
    recupMaladie,
    recupMaladieId,
    recupMaladieByIdUtilsateur,
    supprimerMaladie,
    modifierMaladie,
};
//# sourceMappingURL=functions.js.map