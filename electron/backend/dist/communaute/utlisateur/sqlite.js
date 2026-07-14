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
exports.createCommunauteDatabase = void 0;
const sqliteDB_1 = __importDefault(require("../../db/sqliteDB"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Cree ou reutilise une base SQLite locale pour une communaute puis la rend active.
 */
const createCommunauteDatabase = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const communityName = payload.nomEglise || payload.nomTemple || `communaute-${payload.idUtilisateur}`;
    const tempDatabasePath = sqliteDB_1.default.buildSqliteDatabasePath(communityName, 0);
    const databasePath = payload.idUtilisateur > 0
        ? sqliteDB_1.default.buildSqliteDatabasePath(communityName, payload.idUtilisateur)
        : tempDatabasePath;
    const activeDatabasePath = yield sqliteDB_1.default.getActiveSqliteDatabasePath();
    const defaultDatabasePath = sqliteDB_1.default.getDefaultSqliteDatabasePath();
    if (fs_1.default.existsSync(databasePath)) {
        yield sqliteDB_1.default.setActiveSqliteDatabasePath(databasePath);
    }
    else if (payload.idUtilisateur > 0 && fs_1.default.existsSync(tempDatabasePath)) {
        yield fs_1.default.promises.rename(tempDatabasePath, databasePath);
        yield sqliteDB_1.default.setActiveSqliteDatabasePath(databasePath);
    }
    else if (payload.idUtilisateur > 0
        && fs_1.default.existsSync(activeDatabasePath)
        && path_1.default.resolve(activeDatabasePath) === path_1.default.resolve(defaultDatabasePath)) {
        yield fs_1.default.promises.rename(activeDatabasePath, databasePath);
        yield sqliteDB_1.default.setActiveSqliteDatabasePath(databasePath);
    }
    else {
        yield sqliteDB_1.default.initializeSqliteDatabase(databasePath);
    }
    return {
        filePath: databasePath,
        fileName: path_1.default.basename(databasePath),
    };
});
exports.createCommunauteDatabase = createCommunauteDatabase;
exports.default = {
    createCommunauteDatabase: exports.createCommunauteDatabase,
};
//# sourceMappingURL=sqlite.js.map