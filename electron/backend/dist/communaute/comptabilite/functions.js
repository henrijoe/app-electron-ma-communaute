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
const sqliteSecurity_1 = require("../../db/sqliteSecurity");
const db_1 = require("../../db");
const normalizeUsername = (value) => String(value || '').trim().toLowerCase();
const ajouterComptablilite = (data) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sql = `
        INSERT INTO comptabilite (
          nomComptabilite,
          entreeComptabilite,
          sortieComptabilite,
          dateComptabilite,
          observationComptabilite,
          idUtilisateur
        ) VALUES (?,?,?,?,?,?)
      `;
        const result = yield (0, db_1._executeSql)(sql, [
            data.nomComptabilite,
            data.entreeComptabilite,
            data.sortieComptabilite,
            data.dateComptabilite,
            data.observationComptabilite,
            data.idUtilisateur,
        ]);
        resolve(result.insertId);
    }
    catch (error) {
        reject(error);
    }
}));
const baseSelect = `
  SELECT
    comptabilite.*,
    utilisateur.nomUtilisateur AS nomUtilisateurSuppression
  FROM comptabilite
  LEFT JOIN utilisateur ON utilisateur.idUtilisateur = comptabilite.supprimeParUtilisateur
`;
const recupComptabilite = () => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sql = `${baseSelect}
        WHERE COALESCE(comptabilite.estSupprimeComptabilite, 0) <> 1
        ORDER BY comptabilite.dateComptabilite DESC, comptabilite.idComptabilite DESC
      `;
        const comptabilites = yield (0, db_1._selectSql)(sql, []);
        resolve(comptabilites);
    }
    catch (error) {
        reject(error);
    }
}));
const recupComptabiliteByUtilisateur = (idUtilisateur) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sql = `${baseSelect}
        WHERE comptabilite.idUtilisateur = ?
          AND COALESCE(comptabilite.estSupprimeComptabilite, 0) <> 1
        ORDER BY comptabilite.dateComptabilite DESC, comptabilite.idComptabilite DESC
      `;
        const comptabilites = yield (0, db_1._selectSql)(sql, [idUtilisateur]);
        resolve(comptabilites);
    }
    catch (error) {
        reject(error);
    }
}));
const recupComptabiliteSupprimeeByUtilisateur = (idUtilisateur) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sql = `${baseSelect}
        WHERE comptabilite.idUtilisateur = ?
          AND COALESCE(comptabilite.estSupprimeComptabilite, 0) = 1
        ORDER BY COALESCE(comptabilite.dateSuppressionComptabilite, comptabilite.dateComptabilite) DESC, comptabilite.idComptabilite DESC
      `;
        const comptabilites = yield (0, db_1._selectSql)(sql, [idUtilisateur]);
        resolve(comptabilites);
    }
    catch (error) {
        reject(error);
    }
}));
const recupComptabiliteById = (id) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sql = `${baseSelect} WHERE comptabilite.idComptabilite = ?`;
        const comptabilite = yield (0, db_1._selectSql)(sql, [id]);
        resolve(comptabilite);
    }
    catch (error) {
        reject(error);
    }
}));
const supprimerComptabilite = (idComptabilite, supprimeParUtilisateur, motifSuppressionComptabilite) => new Promise((resolve, reject) => {
    const sql = `
      UPDATE comptabilite
      SET
        estSupprimeComptabilite = 1,
        dateSuppressionComptabilite = CURRENT_TIMESTAMP,
        motifSuppressionComptabilite = ?,
        supprimeParUtilisateur = ?
      WHERE idComptabilite = ?
    `;
    (0, db_1._executeSql)(sql, [
        motifSuppressionComptabilite || 'Suppression depuis la liste comptable',
        supprimeParUtilisateur || null,
        idComptabilite,
    ])
        .then(() => resolve(true))
        .catch((error) => reject(error));
});
const restaurerComptabilite = (idComptabilite) => new Promise((resolve, reject) => {
    const sql = `
      UPDATE comptabilite
      SET
        estSupprimeComptabilite = 0,
        dateSuppressionComptabilite = NULL,
        motifSuppressionComptabilite = NULL,
        supprimeParUtilisateur = NULL
      WHERE idComptabilite = ?
    `;
    (0, db_1._executeSql)(sql, [idComptabilite])
        .then(() => resolve(true))
        .catch((error) => reject(error));
});
const supprimerComptabiliteDefinitivement = (idComptabilite, nomUtilisateur) => new Promise((resolve, reject) => {
    if (normalizeUsername(nomUtilisateur) !== normalizeUsername(sqliteSecurity_1.DESKTOP_SUPERADMIN_USERNAME)) {
        reject(new Error('Seul le superadmin peut supprimer definitivement une ecriture comptable.'));
        return;
    }
    const sql = 'DELETE FROM comptabilite WHERE idComptabilite = ?';
    (0, db_1._executeSql)(sql, [idComptabilite])
        .then(() => resolve(true))
        .catch((error) => reject(error));
});
const modifierComptabilite = (data) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sql = `
        UPDATE comptabilite
        SET
          nomComptabilite = ?,
          entreeComptabilite = ?,
          sortieComptabilite = ?,
          dateComptabilite = ?,
          observationComptabilite = ?,
          idUtilisateur = ?
        WHERE idComptabilite = ?
      `;
        yield (0, db_1._executeSql)(sql, [
            data.nomComptabilite,
            data.entreeComptabilite,
            data.sortieComptabilite,
            data.dateComptabilite,
            data.observationComptabilite,
            data.idUtilisateur,
            data.idComptabilite,
        ]);
        resolve(true);
    }
    catch (error) {
        reject(error);
    }
}));
exports.default = {
    ajouterComptablilite,
    recupComptabilite,
    recupComptabiliteByUtilisateur,
    recupComptabiliteSupprimeeByUtilisateur,
    recupComptabiliteById,
    supprimerComptabilite,
    restaurerComptabilite,
    supprimerComptabiliteDefinitivement,
    modifierComptabilite,
};
//# sourceMappingURL=functions.js.map