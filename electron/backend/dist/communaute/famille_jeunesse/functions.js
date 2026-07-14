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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../db");
const sqliteDB_1 = __importDefault(require("../../db/sqliteDB"));
const textValue = (value) => String(value || "").trim();
const numberValue = (value) => Number(value || 0) || 0;
const ensureColumn = (columnName, sqliteDefinition, mysqlDefinition) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, db_1._executeSql)(`ALTER TABLE famille_jeunesse ADD COLUMN ${columnName} ${sqliteDB_1.default.isSqliteMode() ? sqliteDefinition : mysqlDefinition}`, []);
    }
    catch (error) {
        // La colonne existe deja sur les bases deja mises a jour.
    }
});
const ensureFamilleJeunesseTable = () => __awaiter(void 0, void 0, void 0, function* () {
    const createTableSql = sqliteDB_1.default.isSqliteMode()
        ? `CREATE TABLE IF NOT EXISTS famille_jeunesse (
      idFamilleJeunesse INTEGER PRIMARY KEY AUTOINCREMENT,
      nomFamilleJeunesse TEXT DEFAULT '',
      sloganFamille TEXT DEFAULT '',
      conseillerFamille TEXT DEFAULT '',
      nomAnimateur TEXT DEFAULT '',
      nomViceAnimateur TEXT DEFAULT '',
      nomSecretaire TEXT DEFAULT '',
      nomSecretaireAdjoint TEXT DEFAULT '',
      nomTresorier TEXT DEFAULT '',
      nomTresorierAdjoint TEXT DEFAULT '',
      nomSecretaireOrganisation1 TEXT DEFAULT '',
      nomSecretaireOrganisation2 TEXT DEFAULT '',
      nomSecretaireOrganisation3 TEXT DEFAULT '',
      nomCommissaireAuCompte TEXT DEFAULT '',
      nomCommissaireAuCompteAdjoint TEXT DEFAULT '',
      nombreMembreTotal INTEGER DEFAULT 0,
      nombreMembreActuel INTEGER DEFAULT 0,
      remarque TEXT DEFAULT '',
      idUtilisateur INTEGER NOT NULL
    )`
        : `CREATE TABLE IF NOT EXISTS famille_jeunesse (
      idFamilleJeunesse INT AUTO_INCREMENT PRIMARY KEY,
      nomFamilleJeunesse VARCHAR(255) DEFAULT '',
      sloganFamille VARCHAR(255) DEFAULT '',
      conseillerFamille VARCHAR(255) DEFAULT '',
      nomAnimateur VARCHAR(255) DEFAULT '',
      nomViceAnimateur VARCHAR(255) DEFAULT '',
      nomSecretaire VARCHAR(255) DEFAULT '',
      nomSecretaireAdjoint VARCHAR(255) DEFAULT '',
      nomTresorier VARCHAR(255) DEFAULT '',
      nomTresorierAdjoint VARCHAR(255) DEFAULT '',
      nomSecretaireOrganisation1 VARCHAR(255) DEFAULT '',
      nomSecretaireOrganisation2 VARCHAR(255) DEFAULT '',
      nomSecretaireOrganisation3 VARCHAR(255) DEFAULT '',
      nomCommissaireAuCompte VARCHAR(255) DEFAULT '',
      nomCommissaireAuCompteAdjoint VARCHAR(255) DEFAULT '',
      nombreMembreTotal INT DEFAULT 0,
      nombreMembreActuel INT DEFAULT 0,
      remarque TEXT,
      idUtilisateur INT NOT NULL
    )`;
    yield (0, db_1._executeSql)(createTableSql, []);
    yield ensureColumn("nomFamilleJeunesse", "TEXT DEFAULT ''", "VARCHAR(255) DEFAULT ''");
    yield ensureColumn("sloganFamille", "TEXT DEFAULT ''", "VARCHAR(255) DEFAULT ''");
    yield ensureColumn("conseillerFamille", "TEXT DEFAULT ''", "VARCHAR(255) DEFAULT ''");
});
const getValues = (data) => [
    textValue(data.nomFamilleJeunesse),
    textValue(data.sloganFamille),
    textValue(data.conseillerFamille),
    textValue(data.nomAnimateur),
    textValue(data.nomViceAnimateur),
    textValue(data.nomSecretaire),
    textValue(data.nomSecretaireAdjoint),
    textValue(data.nomTresorier),
    textValue(data.nomTresorierAdjoint),
    textValue(data.nomSecretaireOrganisation1),
    textValue(data.nomSecretaireOrganisation2),
    textValue(data.nomSecretaireOrganisation3),
    textValue(data.nomCommissaireAuCompte),
    textValue(data.nomCommissaireAuCompteAdjoint),
    numberValue(data.nombreMembreTotal),
    numberValue(data.nombreMembreActuel),
    textValue(data.remarque),
    Number(data.idUtilisateur),
];
const ajouterFamilleJeunesse = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield ensureFamilleJeunesseTable();
            const values = getValues(data);
            const sql = `
        INSERT INTO famille_jeunesse(
          nomFamilleJeunesse,
          sloganFamille,
          conseillerFamille,
          nomAnimateur,
          nomViceAnimateur,
          nomSecretaire,
          nomSecretaireAdjoint,
          nomTresorier,
          nomTresorierAdjoint,
          nomSecretaireOrganisation1,
          nomSecretaireOrganisation2,
          nomSecretaireOrganisation3,
          nomCommissaireAuCompte,
          nomCommissaireAuCompteAdjoint,
          nombreMembreTotal,
          nombreMembreActuel,
          remarque,
          idUtilisateur
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `;
            const inserted = yield (0, db_1._executeSql)(sql, values);
            resolve(inserted.insertId);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupFamilleJeunesse = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield ensureFamilleJeunesseTable();
            const sql = `SELECT * FROM famille_jeunesse ORDER BY idFamilleJeunesse DESC`;
            const familles = yield (0, db_1._selectSql)(sql, []);
            resolve(familles);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupFamilleJeunesseId = (idFamilleJeunesse) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield ensureFamilleJeunesseTable();
            const sql = `SELECT * FROM famille_jeunesse WHERE idFamilleJeunesse = ?`;
            const familles = yield (0, db_1._selectSql)(sql, [idFamilleJeunesse]);
            resolve(familles);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupFamilleJeunesseByIdUtilisateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield ensureFamilleJeunesseTable();
            const sql = `SELECT * FROM famille_jeunesse WHERE idUtilisateur = ? ORDER BY idFamilleJeunesse DESC`;
            const familles = yield (0, db_1._selectSql)(sql, [idUtilisateur]);
            resolve(Array.isArray(familles) ? familles : []);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerFamilleJeunesse = (idFamilleJeunesse, idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield ensureFamilleJeunesseTable();
            const hasUserScope = typeof idUtilisateur === "number";
            const sql = hasUserScope
                ? `DELETE FROM famille_jeunesse WHERE idFamilleJeunesse = ? AND idUtilisateur = ?`
                : `DELETE FROM famille_jeunesse WHERE idFamilleJeunesse = ?`;
            const params = hasUserScope ? [idFamilleJeunesse, idUtilisateur] : [idFamilleJeunesse];
            yield (0, db_1._executeSql)(sql, params);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierFamilleJeunesse = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield ensureFamilleJeunesseTable();
            const hasUserScope = typeof data.idUtilisateur === "number";
            const sql = hasUserScope
                ? `UPDATE famille_jeunesse SET nomFamilleJeunesse=?, sloganFamille=?, conseillerFamille=?, nomAnimateur=?, nomViceAnimateur=?, nomSecretaire=?, nomSecretaireAdjoint=?, nomTresorier=?, nomTresorierAdjoint=?, nomSecretaireOrganisation1=?, nomSecretaireOrganisation2=?, nomSecretaireOrganisation3=?, nomCommissaireAuCompte=?, nomCommissaireAuCompteAdjoint=?, nombreMembreTotal=?, nombreMembreActuel=?, remarque=?, idUtilisateur=? WHERE idFamilleJeunesse=? AND idUtilisateur=?`
                : `UPDATE famille_jeunesse SET nomFamilleJeunesse=?, sloganFamille=?, conseillerFamille=?, nomAnimateur=?, nomViceAnimateur=?, nomSecretaire=?, nomSecretaireAdjoint=?, nomTresorier=?, nomTresorierAdjoint=?, nomSecretaireOrganisation1=?, nomSecretaireOrganisation2=?, nomSecretaireOrganisation3=?, nomCommissaireAuCompte=?, nomCommissaireAuCompteAdjoint=?, nombreMembreTotal=?, nombreMembreActuel=?, remarque=?, idUtilisateur=? WHERE idFamilleJeunesse=?`;
            const params = hasUserScope
                ? [...getValues(data), data.idFamilleJeunesse, data.idUtilisateur]
                : [...getValues(data), data.idFamilleJeunesse];
            yield (0, db_1._executeSql)(sql, params);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    ajouterFamilleJeunesse,
    modifierFamilleJeunesse,
    recupFamilleJeunesse,
    recupFamilleJeunesseByIdUtilisateur,
    recupFamilleJeunesseId,
    supprimerFamilleJeunesse,
};
//# sourceMappingURL=functions.js.map