"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._selectSql = exports._executeSql = void 0;
const mysqlDB_1 = __importDefault(require("./mysqlDB"));
const sqliteDB_1 = __importDefault(require("./sqliteDB"));
const execCmd = mysqlDB_1.default.query.bind(mysqlDB_1.default);
const _executeSql = (sql, param) => {
    return new Promise((resolve, reject) => {
        try {
            if (sqliteDB_1.default.isSqliteMode()) {
                sqliteDB_1.default.executeSqlite(sql, Array.isArray(param) ? param : [param])
                    .then(resolve)
                    .catch(reject);
                return;
            }
            execCmd(sql, param, function (error, result) {
                if (error)
                    return reject(error);
                resolve(result === undefined ? { affectedRows: this.changes } : result);
            });
        }
        catch (err) {
            reject(err);
        }
    });
};
exports._executeSql = _executeSql;
// pour les requetes select
const _selectSql = (sql, param) => {
    return new Promise((resolve, reject) => {
        try {
            if (sqliteDB_1.default.isSqliteMode()) {
                sqliteDB_1.default.selectSqlite(sql, param)
                    .then(resolve)
                    .catch(reject);
                return;
            }
            execCmd(sql, param, (error, rows) => {
                if (error)
                    return reject(error);
                resolve(rows);
            });
        }
        catch (err) {
            console.error(err);
            reject(err);
        }
    });
};
exports._selectSql = _selectSql;
// export default db;
//# sourceMappingURL=index.js.map