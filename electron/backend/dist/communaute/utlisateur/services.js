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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.modifierMotDePasse = void 0;
const db_1 = require("../../db");
const sqliteDB_1 = __importDefault(require("../../db/sqliteDB"));
const sqliteSecurity_1 = require("../../db/sqliteSecurity");
const functions_1 = require("../functions");
const services_1 = __importDefault(require("../desktop-control/services"));
const functions_2 = __importDefault(require("./functions"));
const sqlite_1 = __importDefault(require("./sqlite"));
const smtpMailer_1 = require("../../utils/smtpMailer");
const bcrypt = require('bcrypt');
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
const PASSWORD_RESET_GENERIC_MESSAGE = 'Si ce compte existe, un code de reinitialisation a ete envoye par email.';
const PASSWORD_RESET_EXPIRATION_MINUTES = 15;
const normalizeUtilisateurData = (data) => ({
    idUtilisateur: Number(data.idUtilisateur || 0),
    idUtilisateurParent: data.idUtilisateurParent ? Number(data.idUtilisateurParent) : null,
    roleUtilisateur: data.roleUtilisateur === 'gestionnaire' || data.roleUtilisateur === 'lecteur'
        ? data.roleUtilisateur
        : 'admin',
    permissionsUtilisateur: data.permissionsUtilisateur || ALL_MODULE_PERMISSIONS,
    actifUtilisateur: Number(data.actifUtilisateur || 1),
    validerInscriptionMembre: Number(data.validerInscriptionMembre) === 0 ? 0 : 1,
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
const sanitizeUtilisateurData = (data) => {
    if (Array.isArray(data)) {
        return data.map((item) => sanitizeUtilisateurData(item));
    }
    if (!data || typeof data !== 'object') {
        return data;
    }
    const _a = data, { password, confirmPassword } = _a, safeData = __rest(_a, ["password", "confirmPassword"]);
    return safeData;
};
const generatePasswordResetCode = () => String(Math.floor(100000 + Math.random() * 900000));
const normalizeResetField = (value) => String(value || '').trim();
const requestPasswordReset = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const nomUtilisateur = normalizeResetField(data.nomUtilisateur);
            const email = normalizeResetField(data.email).toLowerCase();
            if (!nomUtilisateur || !email) {
                reject(new Error("Le nom utilisateur et l'email sont requis."));
                return;
            }
            const utilisateurRows = yield functions_2.default.recupUtilisateurForPasswordReset(nomUtilisateur, email);
            const utilisateur = Array.isArray(utilisateurRows) ? utilisateurRows[0] : null;
            if (!utilisateur) {
                resolve({ message: PASSWORD_RESET_GENERIC_MESSAGE });
                return;
            }
            if (!(0, smtpMailer_1.isSmtpConfigured)()) {
                reject(new Error('Le service email de reinitialisation n est pas configure. Renseignez SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD et SMTP_FROM.'));
                return;
            }
            const resetPasswordCode = generatePasswordResetCode();
            const resetPasswordExpiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRATION_MINUTES * 60 * 1000).toISOString();
            yield functions_2.default.enregistrerResetPasswordCode(Number(utilisateur.idUtilisateur), resetPasswordCode, resetPasswordExpiresAt);
            yield (0, smtpMailer_1.sendSmtpMail)({
                to: email,
                subject: 'Code de reinitialisation du mot de passe',
                text: [
                    `Bonjour ${utilisateur.prenomUtilisateur || utilisateur.nomUtilisateur || ''},`,
                    '',
                    `Votre code de reinitialisation est : ${resetPasswordCode}`,
                    `Ce code expire dans ${PASSWORD_RESET_EXPIRATION_MINUTES} minutes.`,
                    '',
                    "Si vous n'etes pas a l'origine de cette demande, ignorez simplement ce message.",
                ].join('\n'),
            });
            resolve({ message: PASSWORD_RESET_GENERIC_MESSAGE });
        }
        catch (error) {
            reject(error);
        }
    }));
};
const resetPassword = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const nomUtilisateur = normalizeResetField(data.nomUtilisateur);
            const email = normalizeResetField(data.email).toLowerCase();
            const code = normalizeResetField(data.code);
            const password = String(data.password || '');
            const confirmPassword = String(data.confirmPassword || '');
            if (!nomUtilisateur || !email || !code || !password || !confirmPassword) {
                reject(new Error('Tous les champs sont requis pour reinitialiser le mot de passe.'));
                return;
            }
            if (password !== confirmPassword) {
                reject(new Error('Les mots de passe ne correspondent pas.'));
                return;
            }
            const utilisateurRows = yield functions_2.default.recupUtilisateurForPasswordReset(nomUtilisateur, email);
            const utilisateur = Array.isArray(utilisateurRows) ? utilisateurRows[0] : null;
            if (!utilisateur) {
                reject(new Error('Code de reinitialisation invalide ou expire.'));
                return;
            }
            const storedCode = normalizeResetField(utilisateur.resetPasswordCode);
            const expiresAt = normalizeResetField(utilisateur.resetPasswordExpiresAt);
            if (!storedCode || storedCode !== code || !expiresAt || new Date(expiresAt).getTime() < Date.now()) {
                reject(new Error('Code de reinitialisation invalide ou expire.'));
                return;
            }
            const hashedConfirmPassword = yield bcrypt.hash(confirmPassword, 20);
            yield functions_2.default.reinitialiserMotDePasseAvecCode(Number(utilisateur.idUtilisateur), password, hashedConfirmPassword);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const ajouterUtilisateur = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const normalizedData = normalizeUtilisateurData(data);
            const isSecondaryUser = Number(normalizedData.idUtilisateurParent || 0) > 0;
            if (isSecondaryUser) {
                const secondaryCount = yield functions_2.default.countSecondaryUsersByParentId(Number(normalizedData.idUtilisateurParent));
                if (secondaryCount >= 5) {
                    reject(new Error('Le nombre maximal de 5 utilisateurs secondaires a deja ete atteint.'));
                    return;
                }
            }
            else {
                yield services_1.default.ensureDesktopLicenseInitialized(normalizedData.nomUtilisateur);
                if (sqliteDB_1.default.isSqliteMode()) {
                    const communityDisplayName = normalizedData.nomEgliseCourt || normalizedData.nomTemple;
                    yield sqlite_1.default.createCommunauteDatabase({
                        idUtilisateur: 0,
                        nomTemple: communityDisplayName,
                        nomEglise: normalizedData.nomTemple,
                        dossierBase: process.env.SQLITE_DB_DIR,
                    });
                }
            }
            const idUtilisateur = yield functions_2.default.ajouterUtilisateur(normalizedData);
            if (!isSecondaryUser && sqliteDB_1.default.isSqliteMode()) {
                const communityDisplayName = normalizedData.nomEgliseCourt || normalizedData.nomTemple;
                yield sqlite_1.default.createCommunauteDatabase({
                    idUtilisateur: Number(idUtilisateur),
                    nomTemple: communityDisplayName,
                    nomEglise: normalizedData.nomTemple,
                    dossierBase: process.env.SQLITE_DB_DIR,
                });
            }
            const utilisateur = yield functions_2.default.recupUtilisateurById(idUtilisateur);
            resolve(sanitizeUtilisateurData(utilisateur));
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupUtilisateur = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const utilisateur = yield functions_2.default.recupUtilisateur();
            resolve(sanitizeUtilisateurData(utilisateur));
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupUtilisateurByParentId = (idUtilisateurParent) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const utilisateur = yield functions_2.default.recupUtilisateurByParentId(idUtilisateurParent);
            resolve(sanitizeUtilisateurData(utilisateur));
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerUtilisateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const utilisateur = yield functions_2.default.recupUtilisateur();
            if (Array.isArray(utilisateur)) {
                const index = utilisateur.findIndex((item) => item.idUtilisateur === idUtilisateur);
                if (index >= 0) {
                    utilisateur.splice(index, 1);
                    yield functions_2.default.supprimerUtilisateur(idUtilisateur);
                    resolve(true);
                }
                else {
                    reject('utilisateur non trouve');
                }
            }
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierUtilisateur = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const existingUtilisateur = data.idUtilisateur
                ? yield functions_2.default.recupUtilisateurById(Number(data.idUtilisateur))
                : [];
            const existingData = Array.isArray(existingUtilisateur) ? existingUtilisateur[0] : null;
            const hasNewPassword = String(data.password || '').trim().length > 0;
            const normalizedData = normalizeUtilisateurData(Object.assign(Object.assign({}, data), { password: hasNewPassword ? data.password : (existingData === null || existingData === void 0 ? void 0 : existingData.password) || '', confirmPassword: hasNewPassword
                    ? data.confirmPassword || data.password
                    : (existingData === null || existingData === void 0 ? void 0 : existingData.confirmPassword) || (existingData === null || existingData === void 0 ? void 0 : existingData.password) || '' }));
            let logoEgliseFileName = normalizedData.logoEglise;
            if (normalizedData.logoEglise && normalizedData.logoEglise.startsWith('data:image/')) {
                const base64Data = normalizedData.logoEglise.replace(/^data:image\/\w+;base64,/, '');
                logoEgliseFileName = `eglise_${normalizedData.idUtilisateurParent || normalizedData.idUtilisateur}.jpg`;
                const filePath = (0, functions_1.getChurchLogoPath)(logoEgliseFileName);
                yield (0, functions_1.saveFileToBase64)(filePath, base64Data);
            }
            yield functions_2.default.modifierUtilisateur(Object.assign(Object.assign({}, normalizedData), { logoEglise: logoEgliseFileName }));
            const utilisateur = yield functions_2.default.recupUtilisateurById(normalizedData.idUtilisateur);
            if (Array.isArray(utilisateur) && utilisateur.length > 0) {
                resolve(sanitizeUtilisateurData(utilisateur[0]));
                return;
            }
            resolve(sanitizeUtilisateurData(Object.assign(Object.assign({}, normalizedData), { logoEglise: logoEgliseFileName })));
        }
        catch (error) {
            reject(error);
        }
    }));
};
const connexionUtilisateur = (nomUtilisateur, motDePasse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const utilisateur = yield (0, db_1._selectSql)(`SELECT * FROM utilisateur WHERE nomUtilisateur = ?`, [nomUtilisateur]);
        if (!utilisateur || utilisateur.length === 0) {
            throw new Error('Utilisateur non trouve');
        }
        const isValidPassword = yield bcrypt.compare(motDePasse, utilisateur[0].password);
        if (!isValidPassword) {
            return utilisateur[0];
        }
        throw new Error('Mot de passe incorrect');
    }
    catch (error) {
        throw new Error(`Erreur lors de la connexion de l'utilisateur : ${error.message}`);
    }
});
const login = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (services_1.default.isFixedDesktopSuperAdminCredentials(data.nomUtilisateur, data.password)) {
                const superAdminUser = {
                    idUtilisateur: 0,
                    idUtilisateurParent: null,
                    roleUtilisateur: 'admin',
                    permissionsUtilisateur: ALL_MODULE_PERMISSIONS,
                    actifUtilisateur: 1,
                    logoUtilisateur: '',
                    logoEglise: '',
                    nomTemple: 'Super Administration Desktop',
                    nomEgliseCourt: 'Super Admin',
                    lieuEglise: '',
                    nomUtilisateur: sqliteSecurity_1.DESKTOP_SUPERADMIN_USERNAME,
                    prenomUtilisateur: 'Superadmin',
                    telephoneUtilisateur: '',
                    telephoneSecretariatEglise: '',
                    pasteurPrincipal: '',
                    pasteurSecondaire: '',
                    pasteurTroisieme: '',
                    telephonePasteurPrincipal: '',
                    telephonePasteurSecondaire: '',
                    telephonePasteurTroisieme: '',
                    capaciteAccueilEglise: '',
                    nombreCultesDimanche: '',
                    emailEglise: '',
                    boitePostaleEglise: '',
                    dateCreationEglise: '',
                    nombrePasteursEglise: '',
                    nombreAnciensEglise: '',
                    nombreDiacresEglise: '',
                    modeVersetDashboard: 'disabled',
                    versetDashboardReference: '',
                    versetDashboardTexte: '',
                    email: '',
                };
                resolve(superAdminUser);
                return;
            }
            const desktopLicenseStatus = yield services_1.default.getDesktopLicenseStatus(data.nomUtilisateur);
            if (desktopLicenseStatus.isBlocked) {
                reject(new Error(desktopLicenseStatus.blockMessage));
                return;
            }
            if (sqliteDB_1.default.isSqliteMode()) {
                const databasePath = yield sqliteDB_1.default.findSqliteDatabaseForLogin(data.nomUtilisateur, data.password);
                if (!databasePath) {
                    reject(new Error('Nom Utilisateur ou Mot de passe incorrect !.'));
                    return;
                }
            }
            const utilisateur = yield functions_2.default.login(data);
            const safeUtilisateur = sanitizeUtilisateurData(Object.assign(Object.assign({}, normalizeUtilisateurData(utilisateur)), { idUtilisateur: Number((utilisateur === null || utilisateur === void 0 ? void 0 : utilisateur.idUtilisateur) || 0), idUtilisateurParent: (utilisateur === null || utilisateur === void 0 ? void 0 : utilisateur.idUtilisateurParent) ? Number(utilisateur.idUtilisateurParent) : null }));
            resolve(safeUtilisateur);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const creerBaseSqlite = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield sqlite_1.default.createCommunauteDatabase(data);
            resolve(result);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierMotDePasse = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const utilisateur = yield functions_2.default.recupUtilisateurById(data.idUtilisateur);
            if (!utilisateur) {
                reject({ message: "Une erreur s'est produite" });
                return;
            }
            const res = yield functions_2.default.modifierLogin(data.idUtilisateur, data.nomUtilisateur, data.confirmPassword);
            if (res) {
                const resultat = yield functions_2.default.recupUtilisateurById(data.idUtilisateur);
                resolve(normalizeUtilisateurData(resultat[0]));
            }
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.modifierMotDePasse = modifierMotDePasse;
exports.default = {
    ajouterUtilisateur,
    recupUtilisateur,
    recupUtilisateurByParentId,
    supprimerUtilisateur,
    modifierUtilisateur,
    requestPasswordReset,
    resetPassword,
    connexionUtilisateur,
    login,
    modifierMotDePasse: exports.modifierMotDePasse,
    creerBaseSqlite,
};
//# sourceMappingURL=services.js.map