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
exports.getServerNetworkInfo = exports.restoreSqliteBackup = exports.generateDesktopUnlockCodes = exports.exportPendingDesktopUnlockCodes = exports.unlockDesktopLicenseWithCode = exports.rebindDesktopLicenseMachine = exports.unlockDesktopLicense = exports.ensureDesktopLicenseInitialized = exports.getDesktopLicenseStatus = exports.isFixedDesktopSuperAdminCredentials = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const os_1 = __importDefault(require("os"));
const child_process_1 = require("child_process");
const ip_1 = require("ip");
const sqliteDB_1 = __importDefault(require("../../db/sqliteDB"));
const sqliteSecurity_1 = require("../../db/sqliteSecurity");
const DEFAULT_DESKTOP_TRIAL_DAYS = Number(process.env.DESKTOP_TRIAL_DAYS || 15);
const DEFAULT_DESKTOP_SUPERADMINS = (process.env.DESKTOP_SUPERADMINS || sqliteSecurity_1.DESKTOP_SUPERADMIN_USERNAME)
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
const DESKTOP_UNLOCK_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const DESKTOP_UNLOCK_CODE_PLANS = [
    { label: "Forfait 30 jours", durationDays: 30, quantity: 10 },
    { label: "Forfait 60 jours", durationDays: 60, quantity: 5 },
    { label: "Forfait 6 mois", durationDays: 180, quantity: 5 },
    { label: "Forfait 1 an", durationDays: 365, quantity: 5 },
];
const DESKTOP_LICENSE_FILE = path_1.default.join(sqliteDB_1.default.getSqliteDirectory(), ".desktop-license.secure");
// const DESKTOP_LICENSE_ALGORITHM = "aes-256-cbc";
// const DESKTOP_LICENSE_KEY = crypto.scryptSync(SQLITE_REFERENCE_PASSWORD, "ma-communaute-desktop", 32);
// const toUint8Array = (value: Buffer): Uint8Array => Uint8Array.from(value);
const DESKTOP_LICENSE_ALGORITHM = "aes-256-cbc";
const DESKTOP_LICENSE_KEY = crypto_1.default.scryptSync(sqliteSecurity_1.SQLITE_REFERENCE_PASSWORD, "ma-communaute-desktop", 32);
const toUint8Array = (value) => Uint8Array.from(value);
// Retourne la date ISO correspondant a maintenant + N jours.
const buildExpirationDate = (days) => {
    // On part toujours de la date courante au moment de l'appel.
    const result = new Date();
    // On impose au minimum 1 jour pour eviter une expiration immediate par erreur.
    result.setDate(result.getDate() + Math.max(1, days));
    // On retourne une date ISO pour faciliter le stockage et les comparaisons.
    return result.toISOString();
};
// Ajoute un forfait a l'expiration existante si elle est encore active, sinon repart d'aujourd'hui.
const buildExtendedExpirationDate = (currentExpiresAt, days) => {
    const currentExpirationTime = new Date(currentExpiresAt).getTime();
    const baseDate = currentExpiresAt && !Number.isNaN(currentExpirationTime) && currentExpirationTime > Date.now()
        ? new Date(currentExpirationTime)
        : new Date();
    baseDate.setDate(baseDate.getDate() + Math.max(1, days));
    return baseDate.toISOString();
};
const getWindowsMachineGuid = () => {
    var _a;
    if (process.platform !== "win32") {
        return "";
    }
    try {
        const output = (0, child_process_1.execFileSync)("reg", ["query", "HKLM\\SOFTWARE\\Microsoft\\Cryptography", "/v", "MachineGuid"], { encoding: "utf8", windowsHide: true });
        const match = output.match(/MachineGuid\s+REG_SZ\s+([^\r\n]+)/i);
        return ((_a = match === null || match === void 0 ? void 0 : match[1]) === null || _a === void 0 ? void 0 : _a.trim()) || "";
    }
    catch (_error) {
        return "";
    }
};
const getCurrentMachineFingerprint = () => {
    var _a, _b, _c;
    const hostname = os_1.default.hostname() || process.env.COMPUTERNAME || "poste-inconnu";
    const machineGuid = getWindowsMachineGuid();
    const fallbackCpu = ((_b = (_a = os_1.default.cpus()) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.model) || process.env.PROCESSOR_IDENTIFIER || "";
    const rawFingerprint = machineGuid
        ? `win32:${machineGuid}`
        : [
            hostname,
            os_1.default.platform(),
            os_1.default.arch(),
            fallbackCpu,
            String(((_c = os_1.default.cpus()) === null || _c === void 0 ? void 0 : _c.length) || ""),
        ].join("|");
    return {
        fingerprintHash: crypto_1.default
            .createHmac("sha256", sqliteSecurity_1.SQLITE_REFERENCE_PASSWORD)
            .update(rawFingerprint)
            .digest("hex"),
        description: `${hostname} (${os_1.default.platform()} ${os_1.default.arch()})`,
    };
};
const buildCurrentMachineBinding = () => {
    const currentMachine = getCurrentMachineFingerprint();
    return {
        fingerprintHash: currentMachine.fingerprintHash,
        description: currentMachine.description,
        boundAt: new Date().toISOString(),
    };
};
const normalizeMachineBinding = (value) => {
    if (!(value === null || value === void 0 ? void 0 : value.fingerprintHash)) {
        return null;
    }
    return {
        fingerprintHash: String(value.fingerprintHash),
        description: String(value.description || "Poste inconnu"),
        boundAt: String(value.boundAt || new Date().toISOString()),
    };
};
const getMachineBindingStatus = (config) => {
    const currentMachine = getCurrentMachineFingerprint();
    return {
        isCurrentMachine: config.machineBinding.fingerprintHash === currentMachine.fingerprintHash,
        description: config.machineBinding.description,
        currentDescription: currentMachine.description,
        boundAt: config.machineBinding.boundAt || null,
    };
};
// Normalise un nom utilisateur pour les comparaisons de securite.
const normalizeUsername = (value) => 
// On vide les espaces et on passe en minuscule pour comparer toujours le meme format.
(value || "").trim().toLowerCase();
// Normalise un code saisi par un client avant comparaison.
const normalizeUnlockCode = (value) => (value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
// Hash irreversible d'un code de deblocage local.
const hashUnlockCode = (code) => crypto_1.default
    .createHmac("sha256", sqliteSecurity_1.SQLITE_REFERENCE_PASSWORD)
    .update(normalizeUnlockCode(code))
    .digest("hex");
const SIGNED_UNLOCK_CODE_DURATIONS = new Set([30, 60, 180, 365]);
const SIGNED_UNLOCK_CODE_SIGNATURE_LENGTH = 16;
const buildSignedUnlockPayload = (durationDays, nonce) => `${durationDays}:${nonce}`;
const signUnlockCodePayload = (durationDays, nonce) => crypto_1.default
    .createHmac("sha256", sqliteSecurity_1.SQLITE_REFERENCE_PASSWORD)
    .update(buildSignedUnlockPayload(durationDays, nonce))
    .digest("hex")
    .slice(0, SIGNED_UNLOCK_CODE_SIGNATURE_LENGTH)
    .toUpperCase();
const validateSignedUnlockCode = (code) => {
    const match = normalizeUnlockCode(code).match(/^MCS(30|60|180|365)([A-Z0-9]{8})([A-F0-9]{16})$/);
    if (!match) {
        return null;
    }
    const durationDays = Number(match[1]);
    const nonce = match[2];
    const signature = match[3];
    if (!SIGNED_UNLOCK_CODE_DURATIONS.has(durationDays)) {
        return null;
    }
    const expectedSignature = signUnlockCodePayload(durationDays, nonce);
    if (signature !== expectedSignature) {
        return null;
    }
    return {
        durationDays,
        nonce,
        signature,
        codeHash: hashUnlockCode(code),
    };
};
// Genere un segment lisible sans caracteres ambigus.
const generateUnlockCodeSegment = (length = 4) => {
    let segment = "";
    for (let index = 0; index < length; index += 1) {
        segment += DESKTOP_UNLOCK_CODE_ALPHABET[crypto_1.default.randomInt(DESKTOP_UNLOCK_CODE_ALPHABET.length)];
    }
    return segment;
};
// Genere un code imprimable pour le client.
const generateUnlockCodeValue = () => `MC-${generateUnlockCodeSegment()}-${generateUnlockCodeSegment()}-${generateUnlockCodeSegment()}-${generateUnlockCodeSegment()}`;
// Construit le pack complet de codes de deblocage offline.
const buildDesktopUnlockCodePack = () => {
    const usedHashes = new Set();
    const records = [];
    const plainCodes = [];
    DESKTOP_UNLOCK_CODE_PLANS.forEach((plan) => {
        for (let index = 0; index < plan.quantity; index += 1) {
            let code = generateUnlockCodeValue();
            let codeHash = hashUnlockCode(code);
            while (usedHashes.has(codeHash)) {
                code = generateUnlockCodeValue();
                codeHash = hashUnlockCode(code);
            }
            usedHashes.add(codeHash);
            const createdAt = new Date().toISOString();
            const id = crypto_1.default.randomBytes(12).toString("hex");
            records.push({
                id,
                codeHash,
                label: plan.label,
                durationDays: plan.durationDays,
                createdAt,
                usedAt: null,
                usedBy: null,
            });
            plainCodes.push({
                id,
                code,
                label: plan.label,
                durationDays: plan.durationDays,
                createdAt,
            });
        }
    });
    return { records, plainCodes };
};
// Nettoie les codes stockes lors d'une migration depuis une ancienne licence.
const normalizeUnlockCodeRecords = (codes) => {
    if (!Array.isArray(codes)) {
        return [];
    }
    return codes
        .map((code) => ({
        id: String((code === null || code === void 0 ? void 0 : code.id) || crypto_1.default.randomBytes(12).toString("hex")),
        codeHash: String((code === null || code === void 0 ? void 0 : code.codeHash) || ""),
        label: String((code === null || code === void 0 ? void 0 : code.label) || "Forfait"),
        durationDays: Number((code === null || code === void 0 ? void 0 : code.durationDays) || 30),
        createdAt: String((code === null || code === void 0 ? void 0 : code.createdAt) || new Date().toISOString()),
        usedAt: (code === null || code === void 0 ? void 0 : code.usedAt) ? String(code.usedAt) : null,
        usedBy: (code === null || code === void 0 ? void 0 : code.usedBy) ? String(code.usedBy) : null,
    }))
        .filter((code) => code.codeHash && code.durationDays > 0);
};
// Nettoie les codes en clair en attente d'export unique.
const normalizePendingPlainUnlockCodes = (codes) => {
    if (!Array.isArray(codes)) {
        return [];
    }
    return codes
        .map((code) => ({
        id: String((code === null || code === void 0 ? void 0 : code.id) || ""),
        code: String((code === null || code === void 0 ? void 0 : code.code) || ""),
        label: String((code === null || code === void 0 ? void 0 : code.label) || "Forfait"),
        durationDays: Number((code === null || code === void 0 ? void 0 : code.durationDays) || 30),
        createdAt: String((code === null || code === void 0 ? void 0 : code.createdAt) || new Date().toISOString()),
    }))
        .filter((code) => code.id && normalizeUnlockCode(code.code) && code.durationDays > 0);
};
// Resume l'etat du stock de codes pour l'administration.
const getUnlockCodeStats = (config) => {
    const total = config.unlockCodes.length;
    const used = config.unlockCodes.filter((code) => Boolean(code.usedAt)).length;
    return {
        total,
        used,
        available: Math.max(0, total - used),
        pendingExport: config.pendingPlainUnlockCodes.length,
    };
};
// Chiffre la configuration de licence avant de l'ecrire localement.
const encryptDesktopLicenseConfig = (config) => {
    // Chaque ecriture genere un IV aleatoire pour eviter un chiffrement trop previsible.
    const iv = crypto_1.default.randomBytes(16);
    // On cree le moteur de chiffrement avec l'algorithme choisi et la cle derivee du secret local.
    const cipher = crypto_1.default.createCipheriv(DESKTOP_LICENSE_ALGORITHM, toUint8Array(DESKTOP_LICENSE_KEY), toUint8Array(iv));
    // On serialise la configuration pour pouvoir la chiffrer comme un simple texte JSON.
    const serializedConfig = JSON.stringify(config);
    // On concatene les morceaux chiffres pour produire un seul bloc binaire complet.
    const encryptedContent = Buffer.concat([
        cipher.update(serializedConfig, "utf8"),
        cipher.final(),
    ]);
    // On stocke l'IV et le contenu chiffre en hex afin de les ecrire facilement dans un fichier texte.
    return JSON.stringify({
        iv: iv.toString("hex"),
        content: encryptedContent.toString("hex"),
    });
};
// Dechiffre le fichier local de licence pour retrouver les donnees internes.
const decryptDesktopLicenseConfig = (rawContent) => {
    // On lit d'abord l'enveloppe JSON qui contient l'IV et le contenu chiffre.
    const parsedContent = JSON.parse(rawContent);
    // On recree le moteur de dechiffrement avec le meme algorithme, la meme cle et l'IV stocke.
    const decipher = crypto_1.default.createDecipheriv(DESKTOP_LICENSE_ALGORITHM, toUint8Array(DESKTOP_LICENSE_KEY), toUint8Array(Buffer.from(parsedContent.iv, "hex")));
    // On dechiffre le contenu puis on le retransforme en texte JSON lisible.
    const decryptedContent = Buffer.concat([
        decipher.update(toUint8Array(Buffer.from(parsedContent.content, "hex"))),
        decipher.final(),
    ]).toString("utf8");
    // On retourne enfin la configuration metier telle qu'elle avait ete stockee.
    return JSON.parse(decryptedContent);
};
// Verifie si les identifiants recus correspondent au createur de l'application fixe du desktop.
const isFixedDesktopSuperAdminCredentials = (nomUtilisateur, password) => {
    // On compare le nom normalise au createur de l'application configure en dur dans le projet.
    const isMatchingUsername = normalizeUsername(nomUtilisateur) === normalizeUsername(sqliteSecurity_1.DESKTOP_SUPERADMIN_USERNAME);
    // Le mot de passe est compare tel quel car il sert ici de cle d'acces speciale.
    const isMatchingPassword = (password || "") === sqliteSecurity_1.DESKTOP_SUPERADMIN_PASSWORD;
    // Les deux informations doivent correspondre pour reconnaitre le createur de l'application fixe.
    return isMatchingUsername && isMatchingPassword;
};
exports.isFixedDesktopSuperAdminCredentials = isFixedDesktopSuperAdminCredentials;
// Cree la configuration de licence minimale si aucun fichier n'existe encore.
const buildDefaultDesktopLicense = (seedSuperAdminUsername) => {
    const unlockCodePack = buildDesktopUnlockCodePack();
    const now = new Date().toISOString();
    return {
        // La date de creation sert de point de depart historique pour la licence locale.
        createdAt: now,
        // L'expiration est automatiquement calculee sur la duree standard du desktop.
        expiresAt: buildExpirationDate(DEFAULT_DESKTOP_TRIAL_DAYS),
        // Par defaut, on ne bloque pas manuellement une licence nouvellement creee.
        manuallyBlocked: false,
        // Ce message sera reutilise si un blocage manuel est active plus tard.
        blockMessage: "Acces desktop temporairement bloque. Veuillez contacter le createur de l'application pour renouveler l'application.",
        // Si un nom est fourni au premier lancement, on l'utilise comme createur de l'application initial de la licence.
        superAdminUsers: seedSuperAdminUsername
            ? [normalizeUsername(seedSuperAdminUsername)]
            : DEFAULT_DESKTOP_SUPERADMINS,
        // Aucun debloquage n'a encore eu lieu a la creation de la licence.
        lastUnlockedAt: null,
        lastUnlockedBy: null,
        // Les codes en clair ne sont gardes que jusqu'au premier export reserve au superadmin fixe.
        unlockCodes: unlockCodePack.records,
        pendingPlainUnlockCodes: unlockCodePack.plainCodes,
        usedSignedUnlockCodes: [],
        lastUnlockCodesGeneratedAt: now,
        lastUnlockCodesExportedAt: null,
        machineBinding: buildCurrentMachineBinding(),
    };
};
// S'assure que le dossier SQLite existe pour stocker aussi la licence locale.
const ensureDesktopLicenseDirectory = () => __awaiter(void 0, void 0, void 0, function* () {
    // On cree le dossier si besoin afin que l'ecriture du fichier de licence ne puisse pas echouer.
    yield fs_1.default.promises.mkdir(sqliteDB_1.default.getSqliteDirectory(), { recursive: true });
});
// Lit la configuration locale de licence desktop en la creant au besoin.
const readDesktopLicenseConfig = (seedSuperAdminUsername) => __awaiter(void 0, void 0, void 0, function* () {
    // Avant toute lecture, on s'assure que le dossier de stockage existe bien.
    yield ensureDesktopLicenseDirectory();
    if (!fs_1.default.existsSync(DESKTOP_LICENSE_FILE)) {
        // Si aucun fichier n'existe, on cree une licence par defaut immediate.
        const defaultConfig = buildDefaultDesktopLicense(seedSuperAdminUsername);
        // On ecrit aussitot cette licence sous forme chiffree pour initialiser le desktop local.
        yield fs_1.default.promises.writeFile(DESKTOP_LICENSE_FILE, encryptDesktopLicenseConfig(defaultConfig), "utf-8");
        return defaultConfig;
    }
    // Si le fichier existe deja, on lit son contenu chiffre depuis le disque.
    const rawContent = yield fs_1.default.promises.readFile(DESKTOP_LICENSE_FILE, "utf-8");
    // On dechiffre ensuite ce contenu pour retrouver la configuration courante.
    const parsedContent = decryptDesktopLicenseConfig(rawContent);
    // On garde une base par defaut pour completer les proprietes manquantes si besoin.
    const defaultConfig = buildDefaultDesktopLicense(seedSuperAdminUsername);
    const storedUnlockCodes = normalizeUnlockCodeRecords(parsedContent.unlockCodes);
    const hasStoredUnlockCodes = storedUnlockCodes.length > 0;
    const unlockCodePack = hasStoredUnlockCodes
        ? { records: storedUnlockCodes, plainCodes: normalizePendingPlainUnlockCodes(parsedContent.pendingPlainUnlockCodes) }
        : buildDesktopUnlockCodePack();
    const storedMachineBinding = normalizeMachineBinding(parsedContent.machineBinding);
    const config = Object.assign(Object.assign(Object.assign({}, defaultConfig), parsedContent), { 
        // Enfin, on normalise toujours la liste des createur de l'applications pour garder des comparaisons fiables.
        superAdminUsers: Array.isArray(parsedContent.superAdminUsers)
            ? parsedContent.superAdminUsers.map((item) => normalizeUsername(item)).filter(Boolean)
            : defaultConfig.superAdminUsers, unlockCodes: unlockCodePack.records, pendingPlainUnlockCodes: unlockCodePack.plainCodes, lastUnlockCodesGeneratedAt: parsedContent.lastUnlockCodesGeneratedAt
            ? String(parsedContent.lastUnlockCodesGeneratedAt)
            : defaultConfig.lastUnlockCodesGeneratedAt, lastUnlockCodesExportedAt: parsedContent.lastUnlockCodesExportedAt
            ? String(parsedContent.lastUnlockCodesExportedAt)
            : null, usedSignedUnlockCodes: Array.isArray(parsedContent.usedSignedUnlockCodes)
            ? parsedContent.usedSignedUnlockCodes.map((item) => String(item)).filter(Boolean)
            : [], machineBinding: storedMachineBinding || buildCurrentMachineBinding() });
    if (!hasStoredUnlockCodes || !storedMachineBinding) {
        yield writeDesktopLicenseConfig(config);
    }
    return config;
});
// Ecrit la configuration de licence desktop apres modification.
const writeDesktopLicenseConfig = (config) => __awaiter(void 0, void 0, void 0, function* () {
    // On recree le dossier si necessaire avant toute ecriture sur disque.
    yield ensureDesktopLicenseDirectory();
    // On ecrit toujours la version chiffree, jamais la configuration brute.
    yield fs_1.default.promises.writeFile(DESKTOP_LICENSE_FILE, encryptDesktopLicenseConfig(config), "utf-8");
});
// Indique si le nom utilisateur fourni fait partie des createur de l'applications autorises.
const isSuperAdminUser = (nomUtilisateur, config) => {
    // On verifie d'abord la liste des createur de l'applications enregistres dans la licence locale.
    const isListedInLicense = config.superAdminUsers.includes(normalizeUsername(nomUtilisateur));
    // On garde aussi un acces de secours par le createur de l'application fixe du projet.
    const isFixedSuperAdmin = normalizeUsername(nomUtilisateur) === normalizeUsername(sqliteSecurity_1.DESKTOP_SUPERADMIN_USERNAME);
    // Si l'une des deux conditions est vraie, l'utilisateur est traite comme createur de l'application.
    return isListedInLicense || isFixedSuperAdmin;
};
// Calcule le nombre de jours restants avant blocage automatique.
const computeDaysRemaining = (expiresAt) => {
    // On convertit la date d'expiration en timestamp pour la comparer facilement a maintenant.
    const expirationDate = new Date(expiresAt).getTime();
    const now = Date.now();
    const difference = expirationDate - now;
    if (difference <= 0) {
        // Si la date est passee, on retourne 0 jour restant.
        return 0;
    }
    // Sinon, on arrondit au dessus pour afficher un nombre de jours restant plus parlant.
    return Math.ceil(difference / (1000 * 60 * 60 * 24));
};
// Retourne l'etat calcule de la licence desktop pour un utilisateur donne.
const getDesktopLicenseStatus = (nomUtilisateur) => __awaiter(void 0, void 0, void 0, function* () {
    // On charge d'abord la licence actuellement stockee localement.
    const config = yield readDesktopLicenseConfig(nomUtilisateur);
    // On determine si cet utilisateur a un droit createur de l'application.
    const isSuperAdmin = isSuperAdminUser(nomUtilisateur, config);
    // On verifie si la date de fin a deja ete depassee.
    const isExpired = new Date(config.expiresAt).getTime() <= Date.now();
    const machineBindingStatus = getMachineBindingStatus(config);
    const isMachineMismatch = !machineBindingStatus.isCurrentMachine;
    // On combine le blocage manuel et l'expiration pour produire l'etat brut de blocage.
    const rawBlocked = config.manuallyBlocked || isExpired || isMachineMismatch;
    return {
        // Un createur de l'application reste autorise a entrer meme si la licence est techniquement bloquee.
        isBlocked: rawBlocked && !isSuperAdmin,
        isSuperAdmin,
        expiresAt: config.expiresAt,
        manuallyBlocked: config.manuallyBlocked,
        // Si la licence a expire, on renvoie un message explicite prioritaire sur le message manuel.
        blockMessage: isMachineMismatch
            ? "Cette licence desktop est liee a un autre ordinateur. Contacte le developpeur pour rattacher la licence a ce poste."
            : isExpired
                ? "La licence desktop a expire. Seul le createur de l'application peut renouveler l'acces."
                : config.blockMessage,
        // On calcule les jours restants pour l'affichage dans le front.
        daysRemaining: computeDaysRemaining(config.expiresAt),
        unlockCodeStats: getUnlockCodeStats(config),
        machineBinding: machineBindingStatus,
        // On expose aussi la reference de securite locale pour information d'administration.
        sqliteReferencePassword: sqliteSecurity_1.SQLITE_REFERENCE_PASSWORD,
        sqliteSecurityNote: sqliteSecurity_1.SQLITE_SECURITY_NOTE,
    };
});
exports.getDesktopLicenseStatus = getDesktopLicenseStatus;
// Initialise explicitement la licence locale si elle n'existe pas encore.
const ensureDesktopLicenseInitialized = (seedSuperAdminUsername) => __awaiter(void 0, void 0, void 0, function* () {
    // Cette fonction reutilise simplement la lecture, qui sait deja creer la licence si besoin.
    return readDesktopLicenseConfig(seedSuperAdminUsername);
});
exports.ensureDesktopLicenseInitialized = ensureDesktopLicenseInitialized;
// Renouvelle l'acces desktop local apres verification du createur de l'application.
const unlockDesktopLicense = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // On lit la licence actuelle avant toute modification.
    const config = yield readDesktopLicenseConfig(payload.nomUtilisateur);
    if (!(0, exports.isFixedDesktopSuperAdminCredentials)(payload.nomUtilisateur, payload.password)) {
        // Le renouvellement manuel n'est autorise qu'au superadmin fixe du projet.
        throw new Error("Seul le superadmin fixe peut debloquer l'application desktop.");
    }
    const nextConfig = Object.assign(Object.assign({}, config), { 
        // Le debloquage retire explicitement le blocage manuel.
        manuallyBlocked: false, 
        // On recalcule une nouvelle date d'expiration a partir du nombre de jours demande.
        expiresAt: buildExpirationDate(payload.extendDays || DEFAULT_DESKTOP_TRIAL_DAYS), 
        // On trace la date et l'auteur du dernier debloquage pour le suivi administratif.
        lastUnlockedAt: new Date().toISOString(), lastUnlockedBy: payload.nomUtilisateur });
    // On reecrit la licence mise a jour dans le fichier chiffre local.
    yield writeDesktopLicenseConfig(nextConfig);
    // On retourne ensuite le nouvel etat complet attendu par le front.
    return (0, exports.getDesktopLicenseStatus)(payload.nomUtilisateur);
});
exports.unlockDesktopLicense = unlockDesktopLicense;
// Rattache explicitement une licence au poste courant apres verification superadmin.
const rebindDesktopLicenseMachine = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const config = yield readDesktopLicenseConfig(payload.nomUtilisateur);
    if (!(0, exports.isFixedDesktopSuperAdminCredentials)(payload.nomUtilisateur, payload.password)) {
        throw new Error("Seul le superadmin fixe peut rattacher la licence a ce poste.");
    }
    yield writeDesktopLicenseConfig(Object.assign(Object.assign({}, config), { machineBinding: buildCurrentMachineBinding() }));
    return (0, exports.getDesktopLicenseStatus)(payload.nomUtilisateur);
});
exports.rebindDesktopLicenseMachine = rebindDesktopLicenseMachine;
// Debloque l'application avec un code offline fourni au client.
const unlockDesktopLicenseWithCode = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const normalizedCode = normalizeUnlockCode(payload.code);
    if (!normalizedCode) {
        throw new Error("Le code de deblocage est requis.");
    }
    const config = yield readDesktopLicenseConfig(payload.nomUtilisateur);
    const machineBindingStatus = getMachineBindingStatus(config);
    if (!machineBindingStatus.isCurrentMachine) {
        throw new Error("Ce code ne peut pas debloquer cette copie: la licence est liee a un autre ordinateur.");
    }
    const codeHash = hashUnlockCode(normalizedCode);
    const matchingCode = config.unlockCodes.find((unlockCode) => unlockCode.codeHash === codeHash);
    if (!matchingCode || matchingCode.usedAt) {
        const signedCode = validateSignedUnlockCode(normalizedCode);
        const usedSignedUnlockCodes = Array.isArray(config.usedSignedUnlockCodes) ? config.usedSignedUnlockCodes : [];
        if (!signedCode || usedSignedUnlockCodes.includes(signedCode.codeHash)) {
            throw new Error("Code de deblocage invalide ou deja utilise.");
        }
        const now = new Date().toISOString();
        const nextConfig = Object.assign(Object.assign({}, config), { manuallyBlocked: false, expiresAt: buildExtendedExpirationDate(config.expiresAt, signedCode.durationDays), lastUnlockedAt: now, lastUnlockedBy: payload.nomUtilisateur || "code-client", usedSignedUnlockCodes: [...usedSignedUnlockCodes, signedCode.codeHash] });
        yield writeDesktopLicenseConfig(nextConfig);
        return (0, exports.getDesktopLicenseStatus)(payload.nomUtilisateur);
    }
    const now = new Date().toISOString();
    const nextConfig = Object.assign(Object.assign({}, config), { manuallyBlocked: false, expiresAt: buildExtendedExpirationDate(config.expiresAt, matchingCode.durationDays), lastUnlockedAt: now, lastUnlockedBy: payload.nomUtilisateur || "code-client", unlockCodes: config.unlockCodes.map((unlockCode) => unlockCode.id === matchingCode.id
            ? Object.assign(Object.assign({}, unlockCode), { usedAt: now, usedBy: payload.nomUtilisateur || "code-client" }) : unlockCode), pendingPlainUnlockCodes: config.pendingPlainUnlockCodes.filter((plainCode) => plainCode.id !== matchingCode.id) });
    yield writeDesktopLicenseConfig(nextConfig);
    return (0, exports.getDesktopLicenseStatus)(payload.nomUtilisateur);
});
exports.unlockDesktopLicenseWithCode = unlockDesktopLicenseWithCode;
// Exporte une seule fois le pack initial genere avec la licence locale.
const exportPendingDesktopUnlockCodes = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const config = yield readDesktopLicenseConfig(payload.nomUtilisateur);
    if (!(0, exports.isFixedDesktopSuperAdminCredentials)(payload.nomUtilisateur, payload.password)) {
        throw new Error("Seul le superadmin fixe peut exporter les codes de deblocage.");
    }
    const pendingCodes = normalizePendingPlainUnlockCodes(config.pendingPlainUnlockCodes);
    if (pendingCodes.length === 0) {
        throw new Error("Le pack initial a deja ete exporte. Genere un nouveau pack si necessaire.");
    }
    const exportedAt = new Date().toISOString();
    const nextConfig = Object.assign(Object.assign({}, config), { pendingPlainUnlockCodes: [], lastUnlockCodesExportedAt: exportedAt });
    yield writeDesktopLicenseConfig(nextConfig);
    return {
        codes: pendingCodes,
        stats: getUnlockCodeStats(nextConfig),
        exportedAt,
    };
});
exports.exportPendingDesktopUnlockCodes = exportPendingDesktopUnlockCodes;
// Genere un nouveau pack et remplace tous les codes non utilises.
const generateDesktopUnlockCodes = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const config = yield readDesktopLicenseConfig(payload.nomUtilisateur);
    if (!(0, exports.isFixedDesktopSuperAdminCredentials)(payload.nomUtilisateur, payload.password)) {
        throw new Error("Seul le superadmin fixe peut generer les codes de deblocage.");
    }
    const now = new Date().toISOString();
    const usedCodes = config.unlockCodes.filter((unlockCode) => Boolean(unlockCode.usedAt));
    const unlockCodePack = buildDesktopUnlockCodePack();
    const nextConfig = Object.assign(Object.assign({}, config), { unlockCodes: [...usedCodes, ...unlockCodePack.records], pendingPlainUnlockCodes: [], lastUnlockCodesGeneratedAt: now, lastUnlockCodesExportedAt: now });
    yield writeDesktopLicenseConfig(nextConfig);
    return {
        codes: unlockCodePack.plainCodes,
        stats: getUnlockCodeStats(nextConfig),
        exportedAt: now,
    };
});
exports.generateDesktopUnlockCodes = generateDesktopUnlockCodes;
// Restaure une sauvegarde SQLite locale apres verification du superadmin fixe.
const restoreSqliteBackup = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(0, exports.isFixedDesktopSuperAdminCredentials)(payload.nomUtilisateur, payload.password)) {
        throw new Error("Seul le superadmin fixe peut restaurer une sauvegarde SQLite.");
    }
    if (!payload.backupFilePath || !fs_1.default.existsSync(payload.backupFilePath)) {
        throw new Error("Veuillez fournir un fichier de sauvegarde .zip valide.");
    }
    return sqliteDB_1.default.restoreSqliteBackupArchive(payload.backupFilePath);
});
exports.restoreSqliteBackup = restoreSqliteBackup;
// Expose l'IP reseau du serveur pour que le front affiche une URL LAN meme en dev.
const getServerNetworkInfo = () => {
    // On detecte l'IP reseau courante de la machine qui heberge le backend.
    const ipAddress = (0, ip_1.address)();
    // On reutilise le port du serveur actif, ou 49300 si rien n'est force dans l'environnement.
    const port = Number(process.env.PORT || 49300);
    return {
        ipAddress,
        port,
        // On prepare directement l'URL LAN complete attendue par le front et Electron.
        browserUrl: `http://${ipAddress}:${port}`,
    };
};
exports.getServerNetworkInfo = getServerNetworkInfo;
exports.default = {
    ensureDesktopLicenseInitialized: exports.ensureDesktopLicenseInitialized,
    getDesktopLicenseStatus: exports.getDesktopLicenseStatus,
    unlockDesktopLicense: exports.unlockDesktopLicense,
    rebindDesktopLicenseMachine: exports.rebindDesktopLicenseMachine,
    unlockDesktopLicenseWithCode: exports.unlockDesktopLicenseWithCode,
    exportPendingDesktopUnlockCodes: exports.exportPendingDesktopUnlockCodes,
    generateDesktopUnlockCodes: exports.generateDesktopUnlockCodes,
    restoreSqliteBackup: exports.restoreSqliteBackup,
    getServerNetworkInfo: exports.getServerNetworkInfo,
    isFixedDesktopSuperAdminCredentials: exports.isFixedDesktopSuperAdminCredentials,
};
//# sourceMappingURL=services.js.map
