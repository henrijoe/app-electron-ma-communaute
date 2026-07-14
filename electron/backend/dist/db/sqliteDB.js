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
exports.findSqliteDatabaseForLogin = exports.buildSqliteDatabasePath = exports.ensureDefaultSqliteDatabase = exports.ensureAllSqliteDatabasesSchemasUpdated = exports.initializeSqliteDatabase = exports.selectSqlite = exports.executeSqlite = exports.getActiveSqliteDatabasePath = exports.setActiveSqliteDatabasePath = exports.restoreSqliteBackupArchive = exports.ensureDailySqliteBackup = exports.getDefaultSqliteDatabasePath = exports.getSqliteDirectory = exports.getDatabaseMode = exports.isSqliteMode = void 0;
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const AdmZip = require("adm-zip");
const WINDOWS_SQLITE_DIR = "C:\\base-communaute";
const SQLITE_BACKUP_DIR_NAME = "sauvegardes";
const SQLITE_BACKUP_RETENTION_COUNT = Number(process.env.SQLITE_BACKUP_RETENTION_COUNT || 30);
const resolveDefaultSqliteDirectory = () => {
    if (process.env.SQLITE_DB_DIR) {
        return process.env.SQLITE_DB_DIR;
    }
    if (process.platform === "win32") {
        return WINDOWS_SQLITE_DIR;
    }
    if (process.platform === "darwin") {
        return path_1.default.join(os_1.default.homedir(), "Library", "Application Support", "Ma Communaute", "base-communaute");
    }
    return path_1.default.join(os_1.default.homedir(), ".ma-communaute", "base-communaute");
};
const DEFAULT_SQLITE_DIR = resolveDefaultSqliteDirectory();
const ACTIVE_DB_FILE = path_1.default.join(DEFAULT_SQLITE_DIR, ".active-db.json");
const DEFAULT_SQLITE_FILE = path_1.default.join(DEFAULT_SQLITE_DIR, "ma-communaute-local.db");
const TEMPLATE_PATH = path_1.default.resolve(__dirname, "../../templates/ma-communaute.sql");
const preparedSqliteDatabases = new Set();
/**
 * Indique si le serveur doit travailler sur SQLite au lieu de MySQL.
 */
const isSqliteMode = () => process.env.DB_MODE === "sqlite";
exports.isSqliteMode = isSqliteMode;
/**
 * Retourne le mode de base de donnees actif pour les logs de demarrage.
 */
const getDatabaseMode = () => ((0, exports.isSqliteMode)() ? "sqlite" : "mysql");
exports.getDatabaseMode = getDatabaseMode;
/**
 * Retourne le dossier de travail des bases SQLite locales.
 */
const getSqliteDirectory = () => DEFAULT_SQLITE_DIR;
exports.getSqliteDirectory = getSqliteDirectory;
/**
 * Retourne le chemin de la base SQLite generique utilisee avant la creation
 * definitive d'une eglise.
 */
const getDefaultSqliteDatabasePath = () => DEFAULT_SQLITE_FILE;
exports.getDefaultSqliteDatabasePath = getDefaultSqliteDatabasePath;
/**
 * Nettoie une valeur pour construire un nom de fichier Windows stable.
 */
const sanitizeFileName = (value) => value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
/**
 * Transforme un type MySQL en type compatible avec SQLite.
 */
const mapMysqlTypeToSqlite = (mysqlType) => {
    const normalizedType = mysqlType.toLowerCase();
    if (normalizedType.includes("int")
        || normalizedType.includes("bit")
        || normalizedType.includes("bool")) {
        return "INTEGER";
    }
    if (normalizedType.includes("decimal")
        || normalizedType.includes("double")
        || normalizedType.includes("float")
        || normalizedType.includes("real")) {
        return "REAL";
    }
    if (normalizedType.includes("blob")) {
        return "BLOB";
    }
    return "TEXT";
};
/**
 * Recupere les cles primaires declarees dans les ALTER TABLE du dump.
 */
const extractPrimaryKeys = (dump) => {
    const primaryKeys = {};
    const regex = /ALTER TABLE\s+`([^`]+)`[\s\S]*?ADD PRIMARY KEY\s+\(([^)]+)\)/g;
    let match = regex.exec(dump);
    while (match) {
        // On memorise les colonnes de cle primaire pour les reinjecter
        // ensuite dans les CREATE TABLE converts vers SQLite.
        primaryKeys[match[1]] = match[2]
            .split(",")
            .map((column) => column.replace(/`/g, "").trim())
            .filter(Boolean);
        match = regex.exec(dump);
    }
    return primaryKeys;
};
/**
 * Recupere les indexes simples a recreer apres les CREATE TABLE.
 */
const extractIndexes = (dump) => {
    const indexes = [];
    const alterBlockRegex = /ALTER TABLE\s+`([^`]+)`([\s\S]*?);/g;
    let blockMatch = alterBlockRegex.exec(dump);
    while (blockMatch) {
        // Chaque bloc ALTER TABLE peut contenir plusieurs indexes a recreer.
        const tableName = blockMatch[1];
        const statements = blockMatch[2];
        const keyRegex = /ADD KEY\s+`([^`]+)`\s+\(([^)]+)\)/g;
        let keyMatch = keyRegex.exec(statements);
        while (keyMatch) {
            indexes.push({
                tableName,
                indexName: keyMatch[1],
                columns: keyMatch[2]
                    .split(",")
                    .map((column) => column.replace(/`/g, "").trim())
                    .filter(Boolean),
            });
            keyMatch = keyRegex.exec(statements);
        }
        blockMatch = alterBlockRegex.exec(dump);
    }
    return indexes;
};
/**
 * Convertit un CREATE TABLE MySQL en CREATE TABLE SQLite.
 */
const convertCreateTableStatement = (createStatement, primaryKeys) => {
    const tableMatch = createStatement.match(/CREATE TABLE\s+`([^`]+)`\s*\(([\s\S]*?)\)\s*ENGINE=/i);
    if (!tableMatch) {
        throw new Error("Impossible de convertir un bloc CREATE TABLE du dump.");
    }
    const tableName = tableMatch[1];
    const body = tableMatch[2];
    const primaryKeyColumns = primaryKeys[tableName] || [];
    const columnDefinitions = body
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.startsWith("`"))
        .map((line) => line.replace(/,$/, ""))
        .map((line) => {
        const columnMatch = line.match(/^`([^`]+)`\s+(.+)$/);
        if (!columnMatch) {
            return null;
        }
        const columnName = columnMatch[1];
        const rawDefinition = columnMatch[2]
            .replace(/CHARACTER SET\s+\w+/gi, "")
            .replace(/COLLATE\s+\w+/gi, "")
            .replace(/\s+/g, " ")
            .trim();
        // On detecte le type de base MySQL pour le ramener vers
        // l'affinite SQLite la plus proche.
        const typeMatch = rawDefinition.match(/^([a-zA-Z]+(?:\(\d+(?:,\d+)?\))?)/);
        const sqliteType = mapMysqlTypeToSqlite(typeMatch ? typeMatch[1] : "text");
        const isSingleIntegerPrimaryKey = primaryKeyColumns.length === 1
            && primaryKeyColumns[0] === columnName
            && sqliteType === "INTEGER";
        if (isSingleIntegerPrimaryKey) {
            // SQLite gere tres bien ce cas via INTEGER PRIMARY KEY AUTOINCREMENT.
            return `"${columnName}" INTEGER PRIMARY KEY AUTOINCREMENT`;
        }
        const constraints = [`"${columnName}"`, sqliteType];
        if (/\bNOT NULL\b/i.test(rawDefinition)) {
            constraints.push("NOT NULL");
        }
        return constraints.join(" ");
    })
        .filter((line) => Boolean(line));
    if (primaryKeyColumns.length > 1) {
        // Pour les cles primaires composites, on ajoute une contrainte de table.
        columnDefinitions.push(`PRIMARY KEY (${primaryKeyColumns.map((column) => `"${column}"`).join(", ")})`);
    }
    return `CREATE TABLE IF NOT EXISTS "${tableName}" (\n  ${columnDefinitions.join(",\n  ")}\n);`;
};
/**
 * Convertit une instruction INSERT MySQL en syntaxe SQLite.
 */
const convertInsertStatement = (statement) => statement
    .replace(/\\'/g, "''")
    .replace(/`/g, '"');
/**
 * Convertit le dump MySQL de reference en instructions SQLite.
 */
const convertMysqlDumpToSqliteStatements = (dump) => {
    const sanitizedDump = dump
        .replace(/\r/g, "")
        .replace(/^--.*$/gm, "")
        .replace(/^SET\s+.*;$/gim, "")
        .replace(/^\/\*![\s\S]*?\*\/;?$/gm, "")
        .trim();
    // Le dump est separe entre schema et donnees afin de pouvoir :
    // 1. initialiser une base vide avec ses seeds
    // 2. mettre a jour une base existante sans reinserer les donnees.
    const primaryKeys = extractPrimaryKeys(sanitizedDump);
    const indexes = extractIndexes(sanitizedDump);
    const createStatements = [...sanitizedDump.matchAll(/CREATE TABLE[\s\S]*?ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;/g)]
        .map((match) => convertCreateTableStatement(match[0], primaryKeys));
    const sqliteNativeCreateStatements = [...sanitizedDump.matchAll(/CREATE TABLE IF NOT EXISTS[\s\S]*?;/gi)]
        .map((match) => match[0].trim());
    const seedStatements = [...sanitizedDump.matchAll(/INSERT INTO[\s\S]*?;/g)]
        .map((match) => convertInsertStatement(match[0]));
    const indexStatements = indexes.map((index) => `CREATE INDEX IF NOT EXISTS "${index.indexName}" ON "${index.tableName}" (${index.columns.map((column) => `"${column}"`).join(", ")});`);
    const sqliteNativeIndexStatements = [...sanitizedDump.matchAll(/CREATE INDEX IF NOT EXISTS[\s\S]*?;/gi)]
        .map((match) => match[0].trim());
    return {
        schemaStatements: [
            "PRAGMA foreign_keys = OFF;",
            ...createStatements,
            ...sqliteNativeCreateStatements,
            ...indexStatements,
            ...sqliteNativeIndexStatements,
            "PRAGMA foreign_keys = ON;",
        ],
        seedStatements,
    };
};
/**
 * Ouvre une connexion SQLite sur le fichier demande.
 */
const openDatabase = (databasePath) => {
    const sqlite = sqlite3_1.default.verbose();
    return new sqlite.Database(databasePath);
};
const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};
const backupSqliteDatabaseFile = (sourceDatabasePath, backupDatabasePath) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const database = openDatabase(sourceDatabasePath);
        let settled = false;
        const closeAndSettle = (error) => {
            if (settled) {
                return;
            }
            settled = true;
            database.close((closeError) => {
                const finalError = error || closeError;
                if (finalError) {
                    reject(finalError);
                    return;
                }
                resolve();
            });
        };
        try {
            const backup = database.backup(backupDatabasePath, (error) => {
                if (error) {
                    closeAndSettle(error);
                }
            });
            backup.step(-1, (stepError) => {
                if (stepError) {
                    closeAndSettle(stepError);
                    return;
                }
                if (typeof backup.finish === "function") {
                    backup.finish((finishError) => closeAndSettle(finishError));
                    return;
                }
                closeAndSettle(null);
            });
        }
        catch (error) {
            closeAndSettle(error);
        }
    });
});
const createSqliteBackupArchive = (databaseFiles, backupFilePath, reason) => __awaiter(void 0, void 0, void 0, function* () {
    const backupDirectory = path_1.default.dirname(backupFilePath);
    const dateKey = formatDateKey(new Date());
    const tempDirectory = path_1.default.join(backupDirectory, `.tmp-${dateKey}-${Date.now()}`);
    yield fs_1.default.promises.mkdir(tempDirectory, { recursive: true });
    try {
        const zip = new AdmZip();
        for (const fileName of databaseFiles) {
            const sourceDatabasePath = path_1.default.join(DEFAULT_SQLITE_DIR, fileName);
            const tempDatabasePath = path_1.default.join(tempDirectory, fileName);
            yield backupSqliteDatabaseFile(sourceDatabasePath, tempDatabasePath);
            zip.addLocalFile(tempDatabasePath, "bases");
        }
        zip.addFile("manifest.json", Buffer.from(JSON.stringify({
            createdAt: new Date().toISOString(),
            reason,
            sqliteDirectory: DEFAULT_SQLITE_DIR,
            databases: databaseFiles,
        }, null, 2), "utf-8"));
        zip.writeZip(backupFilePath);
    }
    finally {
        yield fs_1.default.promises.rm(tempDirectory, { recursive: true, force: true });
    }
});
const cleanupOldSqliteBackups = (backupDirectory) => __awaiter(void 0, void 0, void 0, function* () {
    const retentionCount = Number.isInteger(SQLITE_BACKUP_RETENTION_COUNT)
        && SQLITE_BACKUP_RETENTION_COUNT > 0
        ? SQLITE_BACKUP_RETENTION_COUNT
        : 30;
    const backupFiles = (yield fs_1.default.promises.readdir(backupDirectory))
        .filter((fileName) => /^sauvegarde-sqlite-\d{4}-\d{2}-\d{2}\.zip$/.test(fileName))
        .sort()
        .reverse();
    const filesToDelete = backupFiles.slice(retentionCount);
    for (const fileName of filesToDelete) {
        yield fs_1.default.promises.unlink(path_1.default.join(backupDirectory, fileName));
    }
    return filesToDelete.length;
});
/**
 * Cree une sauvegarde zip quotidienne des bases SQLite locales.
 */
const ensureDailySqliteBackup = () => __awaiter(void 0, void 0, void 0, function* () {
    yield ensureSqliteDirectory();
    const databaseFiles = (yield fs_1.default.promises.readdir(DEFAULT_SQLITE_DIR))
        .filter((fileName) => fileName.endsWith(".db"))
        .sort();
    const backupDirectory = path_1.default.join(DEFAULT_SQLITE_DIR, SQLITE_BACKUP_DIR_NAME);
    yield fs_1.default.promises.mkdir(backupDirectory, { recursive: true });
    const todayKey = formatDateKey(new Date());
    const backupFilePath = path_1.default.join(backupDirectory, `sauvegarde-sqlite-${todayKey}.zip`);
    if (fs_1.default.existsSync(backupFilePath)) {
        const deletedBackups = yield cleanupOldSqliteBackups(backupDirectory);
        return {
            created: false,
            databaseCount: databaseFiles.length,
            filePath: backupFilePath,
            deletedBackups,
            reason: "already-exists",
        };
    }
    if (databaseFiles.length === 0) {
        const deletedBackups = yield cleanupOldSqliteBackups(backupDirectory);
        return {
            created: false,
            databaseCount: 0,
            deletedBackups,
            reason: "no-database",
        };
    }
    yield createSqliteBackupArchive(databaseFiles, backupFilePath, "daily-auto-backup");
    const deletedBackups = yield cleanupOldSqliteBackups(backupDirectory);
    return {
        created: true,
        databaseCount: databaseFiles.length,
        filePath: backupFilePath,
        deletedBackups,
    };
});
exports.ensureDailySqliteBackup = ensureDailySqliteBackup;
const validateSqliteDatabaseFile = (databasePath) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const database = openDatabase(databasePath);
        database.all("PRAGMA integrity_check;", (error, rows) => {
            database.close((closeError) => {
                var _a;
                if (error || closeError) {
                    reject(error || closeError);
                    return;
                }
                const integrityResult = String(((_a = rows === null || rows === void 0 ? void 0 : rows[0]) === null || _a === void 0 ? void 0 : _a.integrity_check) || "").toLowerCase();
                if (integrityResult !== "ok") {
                    reject(new Error(`La base ${path_1.default.basename(databasePath)} est invalide ou corrompue.`));
                    return;
                }
                resolve();
            });
        });
    });
});
const isSafeDatabaseEntryName = (entryName) => {
    const normalizedEntryName = entryName.replace(/\\/g, "/");
    const parts = normalizedEntryName.split("/").filter(Boolean);
    const fileName = parts[parts.length - 1] || "";
    return (parts.length === 2
        && parts[0] === "bases"
        && fileName === path_1.default.basename(fileName)
        && fileName.endsWith(".db")
        && !fileName.startsWith("."));
};
/**
 * Restaure les bases SQLite depuis une archive zip generee par l'application.
 */
const restoreSqliteBackupArchive = (backupZipPath) => __awaiter(void 0, void 0, void 0, function* () {
    yield ensureSqliteDirectory();
    if (!backupZipPath || !fs_1.default.existsSync(backupZipPath)) {
        throw new Error("Le fichier de sauvegarde SQLite est introuvable.");
    }
    const backupDirectory = path_1.default.join(DEFAULT_SQLITE_DIR, SQLITE_BACKUP_DIR_NAME);
    yield fs_1.default.promises.mkdir(backupDirectory, { recursive: true });
    const restoreKey = new Date().toISOString().replace(/[:.]/g, "-");
    const tempDirectory = path_1.default.join(backupDirectory, `.restore-${restoreKey}`);
    yield fs_1.default.promises.mkdir(tempDirectory, { recursive: true });
    try {
        const zip = new AdmZip(backupZipPath);
        const databaseEntries = zip
            .getEntries()
            .filter((entry) => !entry.isDirectory && isSafeDatabaseEntryName(entry.entryName));
        if (databaseEntries.length === 0) {
            throw new Error("Cette sauvegarde ne contient aucune base SQLite restaurable.");
        }
        const restoredFiles = [];
        for (const entry of databaseEntries) {
            const fileName = path_1.default.basename(entry.entryName.replace(/\\/g, "/"));
            const tempDatabasePath = path_1.default.join(tempDirectory, fileName);
            yield fs_1.default.promises.writeFile(tempDatabasePath, entry.getData());
            yield validateSqliteDatabaseFile(tempDatabasePath);
            restoredFiles.push(fileName);
        }
        const currentDatabaseFiles = (yield fs_1.default.promises.readdir(DEFAULT_SQLITE_DIR))
            .filter((fileName) => fileName.endsWith(".db"))
            .sort();
        const safetyBackupPath = currentDatabaseFiles.length > 0
            ? path_1.default.join(backupDirectory, `sauvegarde-avant-restauration-${restoreKey}.zip`)
            : null;
        if (safetyBackupPath) {
            yield createSqliteBackupArchive(currentDatabaseFiles, safetyBackupPath, "before-restore");
        }
        for (const fileName of restoredFiles) {
            const tempDatabasePath = path_1.default.join(tempDirectory, fileName);
            const destinationPath = path_1.default.join(DEFAULT_SQLITE_DIR, fileName);
            const pendingDestinationPath = path_1.default.join(DEFAULT_SQLITE_DIR, `.restoring-${restoreKey}-${fileName}`);
            yield fs_1.default.promises.copyFile(tempDatabasePath, pendingDestinationPath);
            if (fs_1.default.existsSync(destinationPath)) {
                yield fs_1.default.promises.rm(destinationPath, { force: true });
            }
            yield fs_1.default.promises.rename(pendingDestinationPath, destinationPath);
        }
        preparedSqliteDatabases.clear();
        return {
            restored: true,
            databaseCount: restoredFiles.length,
            restoredFiles,
            safetyBackupPath,
        };
    }
    finally {
        yield fs_1.default.promises.rm(tempDirectory, { recursive: true, force: true });
    }
});
exports.restoreSqliteBackupArchive = restoreSqliteBackupArchive;
/**
 * Construit les instructions completes d'initialisation d'une nouvelle base.
 */
const buildFullInitializationStatements = (dump) => {
    const { schemaStatements, seedStatements } = convertMysqlDumpToSqliteStatements(dump);
    return [
        // On ouvre par PRAGMA OFF, puis schema, puis seeds, puis PRAGMA ON.
        ...schemaStatements.slice(0, 1),
        ...schemaStatements.slice(1, -1),
        ...seedStatements,
        ...schemaStatements.slice(-1),
    ];
};
/**
 * Execute une liste d'instructions SQLite dans une transaction.
 */
const executeStatements = (database, statements) => new Promise((resolve, reject) => {
    database.serialize(() => {
        // Une transaction garantit que la base ne reste pas a moitie migree.
        database.exec("BEGIN TRANSACTION;", (beginError) => {
            if (beginError) {
                reject(beginError);
                return;
            }
            let currentIndex = 0;
            const executeNext = () => {
                if (currentIndex >= statements.length) {
                    // Toutes les instructions sont passees, on valide la transaction.
                    database.exec("COMMIT;", (commitError) => {
                        if (commitError) {
                            reject(commitError);
                            return;
                        }
                        resolve();
                    });
                    return;
                }
                const statement = statements[currentIndex];
                currentIndex += 1;
                database.exec(statement, (statementError) => {
                    if (statementError) {
                        // En cas d'erreur sur une instruction, on annule tout le lot.
                        database.exec("ROLLBACK;", () => reject(statementError));
                        return;
                    }
                    executeNext();
                });
            };
            executeNext();
        });
    });
});
const queryDatabase = (database, sql) => new Promise((resolve, reject) => {
    database.all(sql, (error, rows) => {
        if (error) {
            reject(error);
            return;
        }
        resolve(rows || []);
    });
});
const execDatabase = (database, sql) => new Promise((resolve, reject) => {
    database.exec(sql, (error) => {
        if (error) {
            reject(error);
            return;
        }
        resolve();
    });
});
const hasBrokenAutoIncrementPrimaryKey = (database, tableName, primaryKeyName) => __awaiter(void 0, void 0, void 0, function* () {
    const rows = yield queryDatabase(database, `PRAGMA table_info("${tableName}")`);
    if (rows.length === 0) {
        return false;
    }
    const primaryKeyRow = rows.find((row) => row.name === primaryKeyName);
    if (!primaryKeyRow) {
        return true;
    }
    return primaryKeyRow.pk != 1 || primaryKeyRow.type.toUpperCase() != "INTEGER";
});
const ensureColumnExists = (database, tableName, columnName, definition) => __awaiter(void 0, void 0, void 0, function* () {
    const rows = yield queryDatabase(database, `PRAGMA table_info("${tableName}")`);
    if (rows.some((row) => row.name === columnName)) {
        return;
    }
    yield execDatabase(database, `ALTER TABLE "${tableName}" ADD COLUMN "${columnName}" ${definition};`);
});
const ensureMembreAndDecesColumns = (database) => __awaiter(void 0, void 0, void 0, function* () {
    yield ensureColumnExists(database, 'membre', 'estDecede', 'INTEGER DEFAULT 0');
    yield ensureColumnExists(database, 'membre', 'dateDecesMembre', 'TEXT');
    yield ensureColumnExists(database, 'deces', 'idMembre', 'INTEGER');
    yield ensureColumnExists(database, 'maladie', 'idMembre', 'INTEGER');
    yield ensureColumnExists(database, 'mariage', 'idFrereMembre', 'INTEGER');
    yield ensureColumnExists(database, 'mariage', 'idSoeurMembre', 'INTEGER');
    yield execDatabase(database, 'UPDATE "membre" SET "estDecede" = 0 WHERE "estDecede" IS NULL;');
});
const ensureComptabiliteColumns = (database) => __awaiter(void 0, void 0, void 0, function* () {
    yield ensureColumnExists(database, 'comptabilite', 'estSupprimeComptabilite', 'INTEGER DEFAULT 0');
    yield ensureColumnExists(database, 'comptabilite', 'dateSuppressionComptabilite', 'TEXT');
    yield ensureColumnExists(database, 'comptabilite', 'motifSuppressionComptabilite', 'TEXT');
    yield ensureColumnExists(database, 'comptabilite', 'supprimeParUtilisateur', 'INTEGER');
    yield execDatabase(database, 'UPDATE "comptabilite" SET "estSupprimeComptabilite" = 0 WHERE "estSupprimeComptabilite" IS NULL;');
});
const repairBrokenGalerieTables = (database) => __awaiter(void 0, void 0, void 0, function* () {
    const galerieBroken = yield hasBrokenAutoIncrementPrimaryKey(database, "galerie", "idGalerie");
    if (galerieBroken) {
        yield execDatabase(database, `
      DROP TABLE IF EXISTS "__galerie_repair";
      CREATE TABLE "__galerie_repair" (
        "idGalerie" INTEGER PRIMARY KEY AUTOINCREMENT,
        "titreGalerie" TEXT,
        "typeEvenement" TEXT,
        "dateEvenement" TEXT,
        "lieuEvenement" TEXT,
        "descriptionGalerie" TEXT,
        "couvertureGalerie" TEXT,
        "dossierGalerie" TEXT,
        "dateCreation" TEXT DEFAULT CURRENT_TIMESTAMP,
        "idUtilisateur" INTEGER
      );
      INSERT INTO "__galerie_repair" (
        "idGalerie",
        "titreGalerie",
        "typeEvenement",
        "dateEvenement",
        "lieuEvenement",
        "descriptionGalerie",
        "couvertureGalerie",
        "dossierGalerie",
        "dateCreation",
        "idUtilisateur"
      )
      SELECT
        "idGalerie",
        "titreGalerie",
        "typeEvenement",
        "dateEvenement",
        "lieuEvenement",
        "descriptionGalerie",
        "couvertureGalerie",
        "dossierGalerie",
        "dateCreation",
        "idUtilisateur"
      FROM "galerie";
      DROP TABLE "galerie";
      ALTER TABLE "__galerie_repair" RENAME TO "galerie";
      CREATE INDEX IF NOT EXISTS "idx_galerie_utilisateur_sqlite" ON "galerie" ("idUtilisateur");
    `);
    }
    const galerieImageBroken = yield hasBrokenAutoIncrementPrimaryKey(database, "galerie_image", "idGalerieImage");
    if (galerieImageBroken) {
        yield execDatabase(database, `
      DROP TABLE IF EXISTS "__galerie_image_repair";
      CREATE TABLE "__galerie_image_repair" (
        "idGalerieImage" INTEGER PRIMARY KEY AUTOINCREMENT,
        "idGalerie" INTEGER NOT NULL,
        "nomFichier" TEXT,
        "cheminImage" TEXT,
        "tailleImage" INTEGER,
        "typeMime" TEXT,
        "legendeImage" TEXT,
        "dateAjout" TEXT DEFAULT CURRENT_TIMESTAMP,
        "idUtilisateur" INTEGER
      );
      INSERT INTO "__galerie_image_repair" (
        "idGalerieImage",
        "idGalerie",
        "nomFichier",
        "cheminImage",
        "tailleImage",
        "typeMime",
        "legendeImage",
        "dateAjout",
        "idUtilisateur"
      )
      SELECT
        "idGalerieImage",
        "idGalerie",
        "nomFichier",
        "cheminImage",
        "tailleImage",
        "typeMime",
        "legendeImage",
        "dateAjout",
        "idUtilisateur"
      FROM "galerie_image";
      DROP TABLE "galerie_image";
      ALTER TABLE "__galerie_image_repair" RENAME TO "galerie_image";
      CREATE INDEX IF NOT EXISTS "idx_galerie_image_galerie_sqlite" ON "galerie_image" ("idGalerie");
      CREATE INDEX IF NOT EXISTS "idx_galerie_image_utilisateur_sqlite" ON "galerie_image" ("idUtilisateur");
    `);
    }
});
/**
 * Ajoute les tables et indexes manquants sur une base SQLite deja existante.
 */
const ensureSqliteSchemaUpdated = (databasePath) => __awaiter(void 0, void 0, void 0, function* () {
    const dump = yield fs_1.default.promises.readFile(TEMPLATE_PATH, "utf-8");
    const { schemaStatements } = convertMysqlDumpToSqliteStatements(dump);
    const database = openDatabase(databasePath);
    try {
        // Ici on n'execute pas les INSERT du dump : on veut seulement
        // completer les tables et indexes manquants sans dupliquer les donnees.
        yield executeStatements(database, schemaStatements);
        yield ensureMembreAndDecesColumns(database);
        yield ensureComptabiliteColumns(database);
        yield repairBrokenGalerieTables(database);
    }
    finally {
        yield new Promise((resolve, reject) => {
            database.close((closeError) => {
                if (closeError) {
                    reject(closeError);
                    return;
                }
                resolve();
            });
        });
    }
});
/**
 * Cree le dossier de travail SQLite s'il n'existe pas.
 */
const ensureSqliteDirectory = () => __awaiter(void 0, void 0, void 0, function* () {
    yield fs_1.default.promises.mkdir(DEFAULT_SQLITE_DIR, { recursive: true });
});
const readActiveSqliteDatabasePath = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!fs_1.default.existsSync(ACTIVE_DB_FILE)) {
        return null;
    }
    try {
        const metadata = JSON.parse(yield fs_1.default.promises.readFile(ACTIVE_DB_FILE, "utf-8"));
        const databasePath = typeof (metadata === null || metadata === void 0 ? void 0 : metadata.databasePath) === "string" ? metadata.databasePath : "";
        return databasePath && fs_1.default.existsSync(databasePath) ? databasePath : null;
    }
    catch (error) {
        console.error("[DB] Impossible de lire la base SQLite active:", error);
        return null;
    }
});
const isDefaultSqliteDatabasePath = (databasePath) => path_1.default.resolve(databasePath) === path_1.default.resolve(DEFAULT_SQLITE_FILE);
const listSqliteDatabasePaths = () => __awaiter(void 0, void 0, void 0, function* () {
    yield ensureSqliteDirectory();
    return (yield fs_1.default.promises.readdir(DEFAULT_SQLITE_DIR))
        .filter((fileName) => fileName.endsWith(".db"))
        .map((fileName) => path_1.default.join(DEFAULT_SQLITE_DIR, fileName));
});
const getPreferredCommunityDatabasePath = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const databaseFiles = yield listSqliteDatabasePaths();
    const communityDatabases = databaseFiles
        .filter((databasePath) => path_1.default.resolve(databasePath) !== path_1.default.resolve(DEFAULT_SQLITE_FILE))
        .map((databasePath) => {
        const stats = fs_1.default.statSync(databasePath);
        return { databasePath, modifiedAt: stats.mtimeMs };
    })
        .sort((left, right) => right.modifiedAt - left.modifiedAt || left.databasePath.localeCompare(right.databasePath));
    return ((_a = communityDatabases[0]) === null || _a === void 0 ? void 0 : _a.databasePath) || null;
});
/**
 * Sauvegarde le chemin de la base SQLite active pour le mode local.
 */
const setActiveSqliteDatabasePath = (databasePath) => __awaiter(void 0, void 0, void 0, function* () {
    yield ensureSqliteDirectory();
    yield fs_1.default.promises.writeFile(ACTIVE_DB_FILE, JSON.stringify({ databasePath }, null, 2), "utf-8");
});
exports.setActiveSqliteDatabasePath = setActiveSqliteDatabasePath;
/**
 * Retourne le chemin de la base SQLite active si elle est connue.
 */
const getActiveSqliteDatabasePath = () => __awaiter(void 0, void 0, void 0, function* () {
    yield ensureSqliteDirectory();
    if (process.env.SQLITE_DB_PATH) {
        // Priorite maximale a une base forcee explicitement par variable d'environnement.
        return process.env.SQLITE_DB_PATH;
    }
    const memorizedDatabasePath = yield readActiveSqliteDatabasePath();
    if (memorizedDatabasePath && !isDefaultSqliteDatabasePath(memorizedDatabasePath)) {
        // Sinon on relit la derniere base active memorisee par le serveur.
        return memorizedDatabasePath;
    }
    const preferredCommunityDatabasePath = yield getPreferredCommunityDatabasePath();
    if (preferredCommunityDatabasePath) {
        // Si une base d'eglise existe deja, elle doit prendre le dessus sur la base locale generique.
        yield (0, exports.setActiveSqliteDatabasePath)(preferredCommunityDatabasePath);
        return preferredCommunityDatabasePath;
    }
    if (memorizedDatabasePath) {
        return memorizedDatabasePath;
    }
    if (fs_1.default.existsSync(DEFAULT_SQLITE_FILE)) {
        // Si aucune base active n'est memorisee, on retombe sur la base locale par defaut.
        return DEFAULT_SQLITE_FILE;
    }
    const databaseFiles = (yield fs_1.default.promises.readdir(DEFAULT_SQLITE_DIR))
        .filter((fileName) => fileName.endsWith(".db"))
        .sort();
    if (databaseFiles.length > 0) {
        // Dernier filet de securite : prendre la premiere base trouvee dans le dossier.
        return path_1.default.join(DEFAULT_SQLITE_DIR, databaseFiles[0]);
    }
    return DEFAULT_SQLITE_FILE;
});
exports.getActiveSqliteDatabasePath = getActiveSqliteDatabasePath;
/**
 * Execute une instruction sur une base SQLite puis retourne un resultat proche de MySQL.
 */
const ensureSqliteDatabaseReady = (databasePath) => __awaiter(void 0, void 0, void 0, function* () {
    if (preparedSqliteDatabases.has(databasePath)) {
        return;
    }
    yield (0, exports.initializeSqliteDatabase)(databasePath);
    preparedSqliteDatabases.add(databasePath);
});
const executeSqlite = (sql, params = [], databasePath) => __awaiter(void 0, void 0, void 0, function* () {
    const resolvedDatabasePath = databasePath || (yield (0, exports.getActiveSqliteDatabasePath)());
    yield ensureSqliteDirectory();
    yield ensureSqliteDatabaseReady(resolvedDatabasePath);
    yield ensureSqliteDatabaseReady(resolvedDatabasePath);
    return new Promise((resolve, reject) => {
        const database = openDatabase(resolvedDatabasePath);
        database.run(sql, params, function runCallback(error) {
            if (error) {
                database.close(() => reject(error));
                return;
            }
            // On reconstruit un format proche de MySQL pour limiter les
            // changements dans les fonctions existantes du projet.
            const result = {
                insertId: typeof this.lastID === "number" ? this.lastID : 0,
                affectedRows: typeof this.changes === "number" ? this.changes : 0,
            };
            database.close((closeError) => {
                if (closeError) {
                    reject(closeError);
                    return;
                }
                resolve(result);
            });
        });
    });
});
exports.executeSqlite = executeSqlite;
/**
 * Execute une requete SELECT sur la base SQLite active.
 */
const selectSqlite = (sql, params = [], databasePath) => __awaiter(void 0, void 0, void 0, function* () {
    const resolvedDatabasePath = databasePath || (yield (0, exports.getActiveSqliteDatabasePath)());
    yield ensureSqliteDirectory();
    yield ensureSqliteDatabaseReady(resolvedDatabasePath);
    return new Promise((resolve, reject) => {
        const database = openDatabase(resolvedDatabasePath);
        database.all(sql, params, (error, rows) => {
            if (error) {
                database.close(() => reject(error));
                return;
            }
            // Les lectures retournent directement le tableau de lignes attendu
            // par la couche metier existante.
            database.close((closeError) => {
                if (closeError) {
                    reject(closeError);
                    return;
                }
                resolve(rows || []);
            });
        });
    });
});
exports.selectSqlite = selectSqlite;
/**
 * Cree une base SQLite a partir du dump de reference si le fichier n'existe pas.
 */
const initializeSqliteDatabase = (databasePath) => __awaiter(void 0, void 0, void 0, function* () {
    yield ensureSqliteDirectory();
    if (fs_1.default.existsSync(databasePath)) {
        // Si la base existe deja, on la migre au schema courant au lieu de la recreer.
        yield ensureSqliteSchemaUpdated(databasePath);
        yield (0, exports.setActiveSqliteDatabasePath)(databasePath);
        return;
    }
    const dump = yield fs_1.default.promises.readFile(TEMPLATE_PATH, "utf-8");
    const statements = buildFullInitializationStatements(dump);
    const database = openDatabase(databasePath);
    // Ici on initialise une base neuve avec le schema complet et les donnees de reference.
    yield executeStatements(database, statements);
    yield new Promise((resolve, reject) => {
        database.close((closeError) => {
            if (closeError) {
                reject(closeError);
                return;
            }
            resolve();
        });
    });
    yield (0, exports.setActiveSqliteDatabasePath)(databasePath);
});
exports.initializeSqliteDatabase = initializeSqliteDatabase;
/**
 * Met a jour le schema de toutes les bases SQLite deja presentes dans le dossier local.
 */
const ensureAllSqliteDatabasesSchemasUpdated = () => __awaiter(void 0, void 0, void 0, function* () {
    yield ensureSqliteDirectory();
    const databaseFiles = (yield fs_1.default.promises.readdir(DEFAULT_SQLITE_DIR))
        .filter((fileName) => fileName.endsWith(".db"))
        .map((fileName) => path_1.default.join(DEFAULT_SQLITE_DIR, fileName));
    for (const databasePath of databaseFiles) {
        // Chaque base locale deja creee est remise a niveau avec le schema courant.
        yield ensureSqliteSchemaUpdated(databasePath);
    }
    return databaseFiles;
});
exports.ensureAllSqliteDatabasesSchemasUpdated = ensureAllSqliteDatabasesSchemasUpdated;
/**
 * Prepare une base locale par defaut au demarrage en mode SQLite.
 */
const ensureDefaultSqliteDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    yield ensureSqliteDirectory();
    const previousActiveDatabasePath = process.env.SQLITE_DB_PATH || (yield readActiveSqliteDatabasePath());
    if (fs_1.default.existsSync(DEFAULT_SQLITE_FILE)) {
        yield ensureSqliteSchemaUpdated(DEFAULT_SQLITE_FILE);
    }
    else {
        yield (0, exports.initializeSqliteDatabase)(DEFAULT_SQLITE_FILE);
    }
    const preferredCommunityDatabasePath = yield getPreferredCommunityDatabasePath();
    const activeDatabasePath = previousActiveDatabasePath && !isDefaultSqliteDatabasePath(previousActiveDatabasePath)
        ? previousActiveDatabasePath
        : preferredCommunityDatabasePath || previousActiveDatabasePath || DEFAULT_SQLITE_FILE;
    yield (0, exports.setActiveSqliteDatabasePath)(activeDatabasePath);
    return activeDatabasePath;
});
exports.ensureDefaultSqliteDatabase = ensureDefaultSqliteDatabase;
/**
 * Construit un chemin de base SQLite local a partir du nom de la communaute.
 */
const buildSqliteDatabasePath = (communityName, idUtilisateur) => {
    const baseName = sanitizeFileName(communityName || "ma-communaute") || "ma-communaute";
    const fileName = typeof idUtilisateur === "number"
        ? `${baseName}-${idUtilisateur}.db`
        : `${baseName}.db`;
    return path_1.default.join(DEFAULT_SQLITE_DIR, fileName);
};
exports.buildSqliteDatabasePath = buildSqliteDatabasePath;
/**
 * Recherche la base locale qui contient l'utilisateur utilise pour se connecter.
 */
const findSqliteDatabaseForLogin = (nomUtilisateur, password) => __awaiter(void 0, void 0, void 0, function* () {
    yield ensureSqliteDirectory();
    const databaseFiles = (yield fs_1.default.promises.readdir(DEFAULT_SQLITE_DIR))
        .filter((fileName) => fileName.endsWith(".db"))
        .map((fileName) => path_1.default.join(DEFAULT_SQLITE_DIR, fileName));
    for (const databasePath of databaseFiles) {
        try {
            // On parcourt les bases locales une par une pour trouver celle
            // qui contient le compte utilise lors de la connexion.
            const rows = yield (0, exports.selectSqlite)("SELECT idUtilisateur FROM utilisateur WHERE nomUtilisateur = ? AND password = ? LIMIT 1", [nomUtilisateur, password], databasePath);
            if (rows.length > 0) {
                // Des qu'on trouve la bonne base, on la memorise comme base active.
                yield (0, exports.setActiveSqliteDatabasePath)(databasePath);
                return databasePath;
            }
        }
        catch (error) {
            console.error(`Erreur lors de la verification SQLite sur ${databasePath}:`, error);
        }
    }
    return null;
});
exports.findSqliteDatabaseForLogin = findSqliteDatabaseForLogin;
exports.default = {
    isSqliteMode: exports.isSqliteMode,
    executeSqlite: exports.executeSqlite,
    selectSqlite: exports.selectSqlite,
    initializeSqliteDatabase: exports.initializeSqliteDatabase,
    buildSqliteDatabasePath: exports.buildSqliteDatabasePath,
    setActiveSqliteDatabasePath: exports.setActiveSqliteDatabasePath,
    getActiveSqliteDatabasePath: exports.getActiveSqliteDatabasePath,
    findSqliteDatabaseForLogin: exports.findSqliteDatabaseForLogin,
    getDatabaseMode: exports.getDatabaseMode,
    getSqliteDirectory: exports.getSqliteDirectory,
    getDefaultSqliteDatabasePath: exports.getDefaultSqliteDatabasePath,
    ensureDefaultSqliteDatabase: exports.ensureDefaultSqliteDatabase,
    ensureAllSqliteDatabasesSchemasUpdated: exports.ensureAllSqliteDatabasesSchemasUpdated,
    ensureDailySqliteBackup: exports.ensureDailySqliteBackup,
    restoreSqliteBackupArchive: exports.restoreSqliteBackupArchive,
};
//# sourceMappingURL=sqliteDB.js.map