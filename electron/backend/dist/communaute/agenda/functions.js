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
const ajouterAgenda = (data) => {
    const values = [
        data.titreAgenda,
        data.typeAgenda,
        data.dateAgenda,
        data.heureDebutAgenda,
        data.heureFinAgenda,
        data.lieuAgenda,
        data.descriptionAgenda,
        data.couleurAgenda,
        data.statutAgenda,
        data.idUtilisateur,
    ];
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `INSERT INTO agenda(titreAgenda,typeAgenda,dateAgenda,heureDebutAgenda,heureFinAgenda,lieuAgenda,descriptionAgenda,couleurAgenda,statutAgenda,idUtilisateur) VALUES (?,?,?,?,?,?,?,?,?,?)`;
            const agendaData = yield (0, db_1._executeSql)(sql, values);
            resolve(agendaData.insertId);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupAgendaId = (id) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sql = `SELECT * FROM agenda WHERE idAgenda = ? ;`;
        const agenda = yield (0, db_1._selectSql)(sql, [id]);
        resolve(agenda);
    }
    catch (error) {
        reject(error);
    }
}));
const recupAgendaByIdUtilsateur = (idUtilisateur) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sql = `SELECT * FROM agenda WHERE idUtilisateur = ? ORDER BY dateAgenda ASC, heureDebutAgenda ASC;`;
        const agenda = yield (0, db_1._selectSql)(sql, [idUtilisateur]);
        resolve(agenda);
    }
    catch (error) {
        reject(error);
    }
}));
const supprimerAgenda = (idAgenda) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sql = `DELETE FROM agenda WHERE idAgenda = ?`;
        yield (0, db_1._executeSql)(sql, [idAgenda]);
        resolve(true);
    }
    catch (error) {
        reject(error);
    }
}));
const modifierAgenda = (data) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sql = `UPDATE agenda SET titreAgenda=?,typeAgenda=?,dateAgenda=?,heureDebutAgenda=?,heureFinAgenda=?,lieuAgenda=?,descriptionAgenda=?,couleurAgenda=?,statutAgenda=?,idUtilisateur=? WHERE idAgenda=?`;
        yield (0, db_1._executeSql)(sql, [
            data.titreAgenda,
            data.typeAgenda,
            data.dateAgenda,
            data.heureDebutAgenda,
            data.heureFinAgenda,
            data.lieuAgenda,
            data.descriptionAgenda,
            data.couleurAgenda,
            data.statutAgenda,
            data.idUtilisateur,
            data.idAgenda,
        ]);
        resolve(true);
    }
    catch (error) {
        reject(error);
    }
}));
exports.default = {
    ajouterAgenda,
    recupAgendaId,
    recupAgendaByIdUtilsateur,
    supprimerAgenda,
    modifierAgenda,
};
//# sourceMappingURL=functions.js.map