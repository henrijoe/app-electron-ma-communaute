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
const schema_1 = require("../../db/schema");
const textValue = (value) => String(value || "").trim();
const numberValue = (value) => Number(value || 0) || 0;
const ensureColumn = (alterStatement) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, db_1._executeSql)(alterStatement, []);
    }
    catch (error) {
        // La colonne existe déjà sur les bases déjà mises à jour.
    }
});
const ensureFamilleJeunesseTable = () => __awaiter(void 0, void 0, void 0, function* () {
    // Le schéma n'est plus écrit ici : il vient de db/schema.ts, décrit une seule fois
    // et traduit pour SQLite comme pour MySQL. Il est appliqué au démarrage du serveur ;
    // on le rejoue à l'usage pour les bases ouvertes avant cette étape.
    const dialect = sqliteDB_1.default.isSqliteMode() ? "sqlite" : "mysql";
    const table = schema_1.SHARED_TABLES.find((item) => item.name === "famille_jeunesse");
    if (!table) {
        return;
    }
    yield (0, db_1._executeSql)((0, schema_1.buildCreateTableSql)(table, dialect), []);
    for (const column of table.columns.filter((item) => item.type !== "pk")) {
        yield ensureColumn((0, schema_1.buildAddColumnSql)(table.name, column, dialect));
    }
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