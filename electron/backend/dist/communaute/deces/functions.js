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
const setMemberDeceasedStatus = (idMembre, idUtilisateur, isDeceased, dateDeces) => __awaiter(void 0, void 0, void 0, function* () {
    if (!idMembre || !idUtilisateur) {
        return;
    }
    const sql = 'UPDATE membre SET estDecede = ?, dateDecesMembre = ? WHERE idMembre = ? AND idUtilisateur = ?';
    yield (0, db_1._executeSql)(sql, [isDeceased ? 1 : 0, isDeceased ? dateDeces || null : null, idMembre, idUtilisateur]);
});
const getExistingDeces = (idDeces) => __awaiter(void 0, void 0, void 0, function* () {
    const rows = yield (0, db_1._selectSql)('SELECT idDeces, idMembre, idUtilisateur FROM deces WHERE idDeces = ?', [idDeces]);
    return (rows === null || rows === void 0 ? void 0 : rows[0]) || null;
});
const ajouterDeces = (data) => {
    const values = [
        data.idMembre || null,
        data.nomMembreDeces,
        data.dateDeces,
        data.lieuDeces,
        data.causeDeces,
        data.idUtilisateur,
    ];
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const duplicateSql = data.idMembre
                ? 'SELECT COUNT(*) as count FROM deces WHERE idMembre = ? AND idUtilisateur = ?'
                : 'SELECT COUNT(*) as count FROM deces WHERE nomMembreDeces = ? AND idUtilisateur = ?';
            const duplicateParams = data.idMembre
                ? [data.idMembre, data.idUtilisateur]
                : [data.nomMembreDeces, data.idUtilisateur];
            const [result] = yield (0, db_1._selectSql)(duplicateSql, duplicateParams);
            if ((result === null || result === void 0 ? void 0 : result.count) > 0) {
                return reject(new Error('Ce deces est deja enregistre.'));
            }
            const sql = 'INSERT INTO deces(idMembre, nomMembreDeces, dateDeces, lieuDeces, causeDeces, idUtilisateur) VALUES (?,?,?,?,?,?)';
            const decesData = yield (0, db_1._executeSql)(sql, values);
            yield setMemberDeceasedStatus(data.idMembre, data.idUtilisateur, true, data.dateDeces);
            resolve(decesData.insertId);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupDeces = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = 'SELECT * FROM deces ORDER BY idDeces ASC;';
            const deces = yield (0, db_1._selectSql)(sql, []);
            resolve(deces);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupDecesId = (id) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = 'SELECT * FROM deces WHERE idDeces = ?;';
            const deces = yield (0, db_1._selectSql)(sql, [id]);
            resolve(deces);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupDecesByIdUtilsateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = 'SELECT * FROM deces WHERE idUtilisateur = ?;';
            const deces = yield (0, db_1._selectSql)(sql, [idUtilisateur]);
            if (!deces.length)
                return reject({ name: 'Erreur_deces', message: 'Aucun deces trouve' });
            resolve(deces);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerDeces = (idDeces) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const existingDeces = yield getExistingDeces(idDeces);
            yield (0, db_1._executeSql)('DELETE FROM deces WHERE idDeces = ?', [idDeces]);
            if (existingDeces) {
                yield setMemberDeceasedStatus(existingDeces.idMembre, existingDeces.idUtilisateur, false, null);
            }
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierDeces = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const existingDeces = data.idDeces ? yield getExistingDeces(data.idDeces) : null;
            yield (0, db_1._executeSql)('UPDATE deces SET idMembre = ?, nomMembreDeces = ?, dateDeces = ?, lieuDeces = ?, causeDeces = ?, idUtilisateur = ? WHERE idDeces = ?', [
                data.idMembre || null,
                data.nomMembreDeces,
                data.dateDeces,
                data.lieuDeces,
                data.causeDeces,
                data.idUtilisateur,
                data.idDeces,
            ]);
            if (existingDeces && existingDeces.idMembre && existingDeces.idMembre !== data.idMembre) {
                yield setMemberDeceasedStatus(existingDeces.idMembre, existingDeces.idUtilisateur, false, null);
            }
            yield setMemberDeceasedStatus(data.idMembre, data.idUtilisateur, true, data.dateDeces);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    recupDeces,
    ajouterDeces,
    supprimerDeces,
    modifierDeces,
    recupDecesId,
    recupDecesByIdUtilsateur,
};
//# sourceMappingURL=functions.js.map