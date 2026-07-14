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
const normalizeCelluleData = (data) => ({
    idCellule: Number(data.idCellule || 0),
    idUtilisateur: Number(data.idUtilisateur || 0),
    nomCellule: String(data.nomCellule || "").trim(),
    lieuCellule: String(data.lieuCellule || "").trim(),
    nombreMembreCellule: String(data.nombreMembreCellule || "0"),
    responsableCellule: String(data.responsableCellule || ""),
    responsableVisiteCellule: String(data.responsableVisiteCellule || ""),
});
const getNextCelluleId = () => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield (0, db_1._selectSql)(`SELECT COALESCE(MAX(idCellule), 0) + 1 AS nextId FROM cellule`, []);
    return Number((result === null || result === void 0 ? void 0 : result.nextId) || 1);
});
const ajouterCellule = (data) => {
    const cellule = normalizeCelluleData(data);
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!cellule.nomCellule || !cellule.lieuCellule) {
                return reject(new Error("Le nom et le lieu de la cellule sont requis."));
            }
            // On limite la verification de doublon a l'utilisateur connecte.
            const sqlCheck = `SELECT COUNT(*) as count FROM cellule WHERE idUtilisateur = ? AND nomCellule = ?`;
            const [result] = yield (0, db_1._selectSql)(sqlCheck, [cellule.idUtilisateur, cellule.nomCellule]);
            if (result.count > 0) {
                return reject(new Error("Cette cellule existe deja."));
            }
            const nextCelluleId = cellule.idCellule || (yield getNextCelluleId());
            const values = [
                nextCelluleId,
                cellule.nomCellule,
                cellule.lieuCellule,
                cellule.nombreMembreCellule,
                cellule.responsableCellule,
                cellule.responsableVisiteCellule,
                cellule.idUtilisateur,
            ];
            const sql = `INSERT INTO cellule(idCellule,nomCellule,lieuCellule,nombreMembreCellule,responsableCellule,responsableVisiteCellule,idUtilisateur) VALUES (?,?,?,?,?,?,?)`;
            yield (0, db_1._executeSql)(sql, values);
            resolve(nextCelluleId);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupCellule = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM cellule ORDER BY idCellule ASC ;`;
            const cellule = yield (0, db_1._selectSql)(sql, []);
            resolve(cellule);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupCelluleId = (id) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM cellule WHERE idCellule = ? ;`;
            const cellule = yield (0, db_1._selectSql)(sql, [id]);
            resolve(cellule);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupCelluleByIdUtilsateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM cellule WHERE idUtilisateur= ?;`;
            const cellule = yield (0, db_1._selectSql)(sql, [idUtilisateur]);
            if (!cellule.length) {
                return reject({ name: "Erreur_cellule", message: "Aucune cellule trouvee" });
            }
            resolve(cellule);
        }
        catch (error) {
            reject(error);
        }
    }));
};
// Quand l'ID utilisateur est fourni, on empeche la suppression hors perimetre.
const supprimerCellule = (idCellule, idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const hasUserScope = typeof idUtilisateur === "number";
            const sql = hasUserScope
                ? `DELETE FROM cellule WHERE idCellule = ? AND idUtilisateur = ?`
                : `DELETE FROM cellule WHERE idCellule = ?`;
            const params = hasUserScope ? [idCellule, idUtilisateur] : [idCellule];
            yield (0, db_1._executeSql)(sql, params);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierCellule = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const cellule = normalizeCelluleData(data);
            if (!cellule.idCellule) {
                return reject(new Error("Identifiant de cellule introuvable."));
            }
            if (!cellule.nomCellule || !cellule.lieuCellule) {
                return reject(new Error("Le nom et le lieu de la cellule sont requis."));
            }
            const hasUserScope = Boolean(cellule.idUtilisateur);
            const sql = hasUserScope
                ? `UPDATE cellule SET nomCellule=?,lieuCellule=?,nombreMembreCellule=?,responsableCellule=?,responsableVisiteCellule=?,idUtilisateur=? WHERE idCellule=? AND idUtilisateur=?`
                : `UPDATE cellule SET nomCellule=?,lieuCellule=?,nombreMembreCellule=?,responsableCellule=?,responsableVisiteCellule=?,idUtilisateur=? WHERE idCellule=?`;
            const params = hasUserScope
                ? [
                    cellule.nomCellule,
                    cellule.lieuCellule,
                    cellule.nombreMembreCellule,
                    cellule.responsableCellule,
                    cellule.responsableVisiteCellule,
                    cellule.idUtilisateur,
                    cellule.idCellule,
                    cellule.idUtilisateur,
                ]
                : [
                    cellule.nomCellule,
                    cellule.lieuCellule,
                    cellule.nombreMembreCellule,
                    cellule.responsableCellule,
                    cellule.responsableVisiteCellule,
                    cellule.idUtilisateur,
                    cellule.idCellule,
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
    recupCellule,
    ajouterCellule,
    supprimerCellule,
    modifierCellule,
    recupCelluleId,
    recupCelluleByIdUtilsateur,
};
//# sourceMappingURL=functions.js.map