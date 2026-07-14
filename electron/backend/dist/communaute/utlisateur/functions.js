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
exports.modifierLogin = void 0;
const db_1 = require("../../db");
const sqliteDB_1 = __importDefault(require("../../db/sqliteDB"));
const bcrypt = require('bcrypt');
const UTILISATEUR_OPTIONAL_TEXT_FIELDS = [
    'logoEglise',
    'nomEgliseCourt',
    'lieuEglise',
    'telephoneSecretariatEglise',
    'pasteurPrincipal',
    'pasteurSecondaire',
    'pasteurTroisieme',
    'telephonePasteurPrincipal',
    'telephonePasteurSecondaire',
    'telephonePasteurTroisieme',
    'capaciteAccueilEglise',
    'nombreCultesDimanche',
    'emailEglise',
    'boitePostaleEglise',
    'dateCreationEglise',
    'nombrePasteursEglise',
    'nombreAnciensEglise',
    'nombreDiacresEglise',
    'modeVersetDashboard',
    'versetDashboardReference',
    'versetDashboardTexte',
    'roleUtilisateur',
    'permissionsUtilisateur',
    'resetPasswordCode',
    'resetPasswordExpiresAt',
];
const UTILISATEUR_OPTIONAL_NUMBER_FIELDS = ['idUtilisateurParent', 'actifUtilisateur'];
const MYSQL_UTILISATEUR_TEXT_COLUMNS = {
    logoEglise: 'TEXT NULL',
    nomEgliseCourt: 'VARCHAR(255) NULL',
    lieuEglise: 'VARCHAR(255) NULL',
    telephoneSecretariatEglise: 'VARCHAR(30) NULL',
    pasteurPrincipal: 'VARCHAR(255) NULL',
    pasteurSecondaire: 'VARCHAR(255) NULL',
    pasteurTroisieme: 'VARCHAR(255) NULL',
    telephonePasteurPrincipal: 'VARCHAR(30) NULL',
    telephonePasteurSecondaire: 'VARCHAR(30) NULL',
    telephonePasteurTroisieme: 'VARCHAR(30) NULL',
    capaciteAccueilEglise: 'VARCHAR(50) NULL',
    nombreCultesDimanche: 'VARCHAR(50) NULL',
    emailEglise: 'VARCHAR(255) NULL',
    boitePostaleEglise: 'VARCHAR(255) NULL',
    dateCreationEglise: 'VARCHAR(50) NULL',
    nombrePasteursEglise: 'VARCHAR(50) NULL',
    nombreAnciensEglise: 'VARCHAR(50) NULL',
    nombreDiacresEglise: 'VARCHAR(50) NULL',
    modeVersetDashboard: "VARCHAR(30) NOT NULL DEFAULT 'daily'",
    versetDashboardReference: 'VARCHAR(255) NULL',
    versetDashboardTexte: 'TEXT NULL',
    roleUtilisateur: "VARCHAR(30) NOT NULL DEFAULT 'admin'",
    permissionsUtilisateur: 'TEXT NULL',
    resetPasswordCode: 'VARCHAR(20) NULL',
    resetPasswordExpiresAt: 'VARCHAR(50) NULL',
};
const MYSQL_UTILISATEUR_NUMBER_COLUMNS = {
    idUtilisateurParent: 'INT NULL',
    actifUtilisateur: 'INT NOT NULL DEFAULT 1',
};
const SQLITE_UTILISATEUR_TEXT_COLUMNS = {
    logoEglise: 'TEXT',
    nomEgliseCourt: 'TEXT',
    lieuEglise: 'TEXT',
    telephoneSecretariatEglise: 'TEXT',
    pasteurPrincipal: 'TEXT',
    pasteurSecondaire: 'TEXT',
    pasteurTroisieme: 'TEXT',
    telephonePasteurPrincipal: 'TEXT',
    telephonePasteurSecondaire: 'TEXT',
    telephonePasteurTroisieme: 'TEXT',
    capaciteAccueilEglise: 'TEXT',
    nombreCultesDimanche: 'TEXT',
    emailEglise: 'TEXT',
    boitePostaleEglise: 'TEXT',
    dateCreationEglise: 'TEXT',
    nombrePasteursEglise: 'TEXT',
    nombreAnciensEglise: 'TEXT',
    nombreDiacresEglise: 'TEXT',
    modeVersetDashboard: "TEXT DEFAULT 'daily'",
    versetDashboardReference: 'TEXT',
    versetDashboardTexte: 'TEXT',
    roleUtilisateur: "TEXT DEFAULT 'admin'",
    permissionsUtilisateur: 'TEXT',
    resetPasswordCode: 'TEXT',
    resetPasswordExpiresAt: 'TEXT',
};
const SQLITE_UTILISATEUR_NUMBER_COLUMNS = {
    idUtilisateurParent: 'INTEGER',
    actifUtilisateur: 'INTEGER DEFAULT 1',
};
const ALL_MODULE_PERMISSIONS = JSON.stringify([
    'dashboard',
    'user',
    'culte',
    'departement',
    'cellule',
    'groupe',
    'social',
    'galerie',
    'agenda',
    'comptabilite',
    'settings',
]);
const normalizeUtilisateurData = (data) => ({
    idUtilisateur: Number(data.idUtilisateur || 0),
    idUtilisateurParent: data.idUtilisateurParent ? Number(data.idUtilisateurParent) : null,
    roleUtilisateur: data.roleUtilisateur === 'gestionnaire' || data.roleUtilisateur === 'lecteur'
        ? data.roleUtilisateur
        : 'admin',
    permissionsUtilisateur: data.permissionsUtilisateur || ALL_MODULE_PERMISSIONS,
    actifUtilisateur: Number(data.actifUtilisateur || 1),
    logoUtilisateur: data.logoUtilisateur || '',
    logoEglise: data.logoEglise || '',
    nomTemple: data.nomTemple || '',
    nomEgliseCourt: data.nomEgliseCourt || '',
    lieuEglise: data.lieuEglise || '',
    nomUtilisateur: data.nomUtilisateur || '',
    prenomUtilisateur: data.prenomUtilisateur || '',
    telephoneUtilisateur: data.telephoneUtilisateur || '',
    telephoneSecretariatEglise: data.telephoneSecretariatEglise || '',
    pasteurPrincipal: data.pasteurPrincipal || '',
    pasteurSecondaire: data.pasteurSecondaire || '',
    pasteurTroisieme: data.pasteurTroisieme || '',
    telephonePasteurPrincipal: data.telephonePasteurPrincipal || '',
    telephonePasteurSecondaire: data.telephonePasteurSecondaire || '',
    telephonePasteurTroisieme: data.telephonePasteurTroisieme || '',
    capaciteAccueilEglise: data.capaciteAccueilEglise || '',
    nombreCultesDimanche: data.nombreCultesDimanche || '',
    emailEglise: data.emailEglise || '',
    boitePostaleEglise: data.boitePostaleEglise || '',
    dateCreationEglise: data.dateCreationEglise || '',
    nombrePasteursEglise: data.nombrePasteursEglise || '',
    nombreAnciensEglise: data.nombreAnciensEglise || '',
    nombreDiacresEglise: data.nombreDiacresEglise || '',
    modeVersetDashboard: data.modeVersetDashboard === 'disabled' || data.modeVersetDashboard === 'custom'
        ? data.modeVersetDashboard
        : 'daily',
    versetDashboardReference: data.versetDashboardReference || '',
    versetDashboardTexte: data.versetDashboardTexte || '',
    password: data.password || '',
    confirmPassword: data.confirmPassword || '',
    email: data.email || '',
});
const ensureUtilisateurColumns = () => __awaiter(void 0, void 0, void 0, function* () {
    if (sqliteDB_1.default.isSqliteMode()) {
        for (const columnName of UTILISATEUR_OPTIONAL_TEXT_FIELDS) {
            try {
                yield (0, db_1._executeSql)(`ALTER TABLE utilisateur ADD COLUMN ${columnName} ${SQLITE_UTILISATEUR_TEXT_COLUMNS[columnName]}`, []);
            }
            catch (error) {
                const message = String((error === null || error === void 0 ? void 0 : error.message) || error || '').toLowerCase();
                if (message.includes('duplicate column') || message.includes('already exists') || message.includes('duplicate column name')) {
                    continue;
                }
                throw error;
            }
        }
        for (const columnName of UTILISATEUR_OPTIONAL_NUMBER_FIELDS) {
            try {
                yield (0, db_1._executeSql)(`ALTER TABLE utilisateur ADD COLUMN ${columnName} ${SQLITE_UTILISATEUR_NUMBER_COLUMNS[columnName]}`, []);
            }
            catch (error) {
                const message = String((error === null || error === void 0 ? void 0 : error.message) || error || '').toLowerCase();
                if (message.includes('duplicate column') || message.includes('already exists') || message.includes('duplicate column name')) {
                    continue;
                }
                throw error;
            }
        }
        return;
    }
    const columns = yield (0, db_1._selectSql)('SHOW COLUMNS FROM utilisateur', []);
    const existingColumns = new Set((Array.isArray(columns) ? columns : []).map((item) => item.Field));
    for (const columnName of UTILISATEUR_OPTIONAL_TEXT_FIELDS) {
        if (!existingColumns.has(columnName)) {
            yield (0, db_1._executeSql)(`ALTER TABLE utilisateur ADD COLUMN ${columnName} ${MYSQL_UTILISATEUR_TEXT_COLUMNS[columnName]}`, []);
        }
    }
    for (const columnName of UTILISATEUR_OPTIONAL_NUMBER_FIELDS) {
        if (!existingColumns.has(columnName)) {
            yield (0, db_1._executeSql)(`ALTER TABLE utilisateur ADD COLUMN ${columnName} ${MYSQL_UTILISATEUR_NUMBER_COLUMNS[columnName]}`, []);
        }
    }
});
const ajouterUtilisateur = (rawData) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        const data = normalizeUtilisateurData(rawData);
        const hashedconfirmPassword = yield bcrypt.hash(data.confirmPassword, 20);
        try {
            yield ensureUtilisateurColumns();
            const sql = `INSERT INTO utilisateur(
        logoUtilisateur,
        logoEglise,
        nomTemple,
        nomEgliseCourt,
        lieuEglise,
        nomUtilisateur,
        prenomUtilisateur,
        telephoneUtilisateur,
        telephoneSecretariatEglise,
        pasteurPrincipal,
        pasteurSecondaire,
        pasteurTroisieme,
        telephonePasteurPrincipal,
        telephonePasteurSecondaire,
        telephonePasteurTroisieme,
        capaciteAccueilEglise,
        nombreCultesDimanche,
        emailEglise,
        boitePostaleEglise,
        dateCreationEglise,
        nombrePasteursEglise,
        nombreAnciensEglise,
        nombreDiacresEglise,
        modeVersetDashboard,
        versetDashboardReference,
        versetDashboardTexte,
        roleUtilisateur,
        permissionsUtilisateur,
        idUtilisateurParent,
        actifUtilisateur,
        password,
        confirmPassword,
        email
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
            const values = [
                data.logoUtilisateur,
                data.logoEglise,
                data.nomTemple,
                data.nomEgliseCourt,
                data.lieuEglise,
                data.nomUtilisateur,
                data.prenomUtilisateur,
                data.telephoneUtilisateur,
                data.telephoneSecretariatEglise,
                data.pasteurPrincipal,
                data.pasteurSecondaire,
                data.pasteurTroisieme,
                data.telephonePasteurPrincipal,
                data.telephonePasteurSecondaire,
                data.telephonePasteurTroisieme,
                data.capaciteAccueilEglise,
                data.nombreCultesDimanche,
                data.emailEglise,
                data.boitePostaleEglise,
                data.dateCreationEglise,
                data.nombrePasteursEglise,
                data.nombreAnciensEglise,
                data.nombreDiacresEglise,
                data.modeVersetDashboard,
                data.versetDashboardReference,
                data.versetDashboardTexte,
                data.roleUtilisateur,
                data.permissionsUtilisateur,
                data.idUtilisateurParent,
                data.actifUtilisateur,
                data.password,
                hashedconfirmPassword,
                data.email,
            ];
            const utilisateur = yield (0, db_1._executeSql)(sql, values);
            resolve(utilisateur.insertId);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupUtilisateur = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield ensureUtilisateurColumns();
            const sql = `SELECT * FROM utilisateur ORDER BY idUtilisateur ASC;`;
            const utilisateur = yield (0, db_1._selectSql)(sql, []);
            resolve(utilisateur);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupUtilisateurByParentId = (idUtilisateurParent) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield ensureUtilisateurColumns();
            const sql = `SELECT * FROM utilisateur WHERE idUtilisateurParent = ? ORDER BY idUtilisateur ASC;`;
            const utilisateur = yield (0, db_1._selectSql)(sql, [idUtilisateurParent]);
            resolve(utilisateur);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const countSecondaryUsersByParentId = (idUtilisateurParent) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    yield ensureUtilisateurColumns();
    const sql = `SELECT COUNT(*) AS total FROM utilisateur WHERE idUtilisateurParent = ?;`;
    const rows = yield (0, db_1._selectSql)(sql, [idUtilisateurParent]);
    return Number(((_a = rows === null || rows === void 0 ? void 0 : rows[0]) === null || _a === void 0 ? void 0 : _a.total) || 0);
});
const recupUtilisateurById = (id) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield ensureUtilisateurColumns();
            const sql = `SELECT * FROM utilisateur WHERE idUtilisateur = ?;`;
            const utilisateur = yield (0, db_1._selectSql)(sql, [id]);
            resolve(utilisateur);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupUtilisateurForPasswordReset = (nomUtilisateur, email) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield ensureUtilisateurColumns();
            const sql = `
        SELECT * FROM utilisateur
        WHERE LOWER(TRIM(nomUtilisateur)) = LOWER(TRIM(?))
          AND LOWER(TRIM(email)) = LOWER(TRIM(?))
          AND COALESCE(actifUtilisateur, 1) = 1
        LIMIT 1;
      `;
            const utilisateur = yield (0, db_1._selectSql)(sql, [nomUtilisateur, email]);
            resolve(utilisateur);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerUtilisateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM utilisateur WHERE idUtilisateur = ?`;
        (0, db_1._executeSql)(sql, [idUtilisateur])
            .then(() => resolve(true))
            .catch((error) => reject(error));
    });
};
const modifierUtilisateur = (rawData) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const data = normalizeUtilisateurData(rawData);
            yield ensureUtilisateurColumns();
            const sql = `UPDATE utilisateur SET
        logoUtilisateur=?,
        logoEglise=?,
        nomTemple=?,
        nomEgliseCourt=?,
        lieuEglise=?,
        nomUtilisateur=?,
        prenomUtilisateur=?,
        telephoneUtilisateur=?,
        telephoneSecretariatEglise=?,
        pasteurPrincipal=?,
        pasteurSecondaire=?,
        pasteurTroisieme=?,
        telephonePasteurPrincipal=?,
        telephonePasteurSecondaire=?,
        telephonePasteurTroisieme=?,
        capaciteAccueilEglise=?,
        nombreCultesDimanche=?,
        emailEglise=?,
        boitePostaleEglise=?,
        dateCreationEglise=?,
        nombrePasteursEglise=?,
        nombreAnciensEglise=?,
        nombreDiacresEglise=?,
        modeVersetDashboard=?,
        versetDashboardReference=?,
        versetDashboardTexte=?,
        roleUtilisateur=?,
        permissionsUtilisateur=?,
        idUtilisateurParent=?,
        actifUtilisateur=?,
        password=?,
        confirmPassword=?,
        email=?
        WHERE idUtilisateur=?`;
            yield (0, db_1._executeSql)(sql, [
                data.logoUtilisateur,
                data.logoEglise,
                data.nomTemple,
                data.nomEgliseCourt,
                data.lieuEglise,
                data.nomUtilisateur,
                data.prenomUtilisateur,
                data.telephoneUtilisateur,
                data.telephoneSecretariatEglise,
                data.pasteurPrincipal,
                data.pasteurSecondaire,
                data.pasteurTroisieme,
                data.telephonePasteurPrincipal,
                data.telephonePasteurSecondaire,
                data.telephonePasteurTroisieme,
                data.capaciteAccueilEglise,
                data.nombreCultesDimanche,
                data.emailEglise,
                data.boitePostaleEglise,
                data.dateCreationEglise,
                data.nombrePasteursEglise,
                data.nombreAnciensEglise,
                data.nombreDiacresEglise,
                data.modeVersetDashboard,
                data.versetDashboardReference,
                data.versetDashboardTexte,
                data.roleUtilisateur,
                data.permissionsUtilisateur,
                data.idUtilisateurParent,
                data.actifUtilisateur,
                data.password,
                data.confirmPassword,
                data.email,
                data.idUtilisateur,
            ]);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const login = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield ensureUtilisateurColumns();
            const { nomUtilisateur, password } = data;
            const sql = `SELECT * FROM utilisateur WHERE nomUtilisateur=? AND password=? AND COALESCE(actifUtilisateur, 1) = 1`;
            const utilisateur = yield (0, db_1._selectSql)(sql, [nomUtilisateur, password]);
            if (!utilisateur || utilisateur.length === 0) {
                throw new Error('Nom Utilisateur ou Mot de passe incorrect !.');
            }
            if (utilisateur.length !== 1) {
                reject({ message: 'identifiant incorrect' });
            }
            else {
                resolve(utilisateur[0]);
            }
        }
        catch (err) {
            console.log('err:', err);
            reject(err);
        }
    }));
};
const modifierLogin = (idUtilisateur, password, confirmPassword) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `UPDATE utilisateur SET password=?, confirmPassword=? WHERE idUtilisateur=?`;
            yield (0, db_1._executeSql)(sql, [password, confirmPassword, idUtilisateur]);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.modifierLogin = modifierLogin;
const enregistrerResetPasswordCode = (idUtilisateur, resetPasswordCode, resetPasswordExpiresAt) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield ensureUtilisateurColumns();
            const sql = `UPDATE utilisateur SET resetPasswordCode=?, resetPasswordExpiresAt=? WHERE idUtilisateur=?`;
            yield (0, db_1._executeSql)(sql, [resetPasswordCode, resetPasswordExpiresAt, idUtilisateur]);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const reinitialiserMotDePasseAvecCode = (idUtilisateur, password, confirmPassword) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield ensureUtilisateurColumns();
            const sql = `
        UPDATE utilisateur
        SET password=?,
            confirmPassword=?,
            resetPasswordCode=NULL,
            resetPasswordExpiresAt=NULL
        WHERE idUtilisateur=?
      `;
            yield (0, db_1._executeSql)(sql, [password, confirmPassword, idUtilisateur]);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    ajouterUtilisateur,
    recupUtilisateur,
    recupUtilisateurByParentId,
    countSecondaryUsersByParentId,
    supprimerUtilisateur,
    modifierUtilisateur,
    recupUtilisateurById,
    recupUtilisateurForPasswordReset,
    login,
    modifierLogin: exports.modifierLogin,
    enregistrerResetPasswordCode,
    reinitialiserMotDePasseAvecCode,
};
//# sourceMappingURL=functions.js.map