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
//   
// const ajouterQuestion = (data: IQuestions) => {
//     const values = [ 
//         data.question,
//         data.options,
//         data.correctOption,
//         data.niveau,
//         data.idEglise
//     ]
//     return new Promise(async (resolve, reject) => {
//         try {
//             const sql = `INSERT INTO questions(question,options,correctOption,niveau,idEglise) VALUES (?,?,?,?,?)`;
//             const questionData: any = await _executeSql(sql, [...values]);
//             const dataFinally = JSON.stringify(questionData)
//             console.log("🚀 ~ file: functions.ts:18 ~ returnnewPromise ~ dataFinally:", dataFinally)
//             resolve(dataFinally)
//         } catch (error) {
//             reject(error);
//         }
//     });
// };
const ajouterQuestion = (data) => {
    const values = [
        data.question,
        JSON.stringify(data.options),
        data.correctOption,
        data.niveau,
        data.idEglise
    ];
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `INSERT INTO questions(question,options,correctOption,niveau,idEglise) VALUES (?,?,?,?,?)`;
            const questionData = yield (0, db_1._executeSql)(sql, values);
            // Vous pouvez omettre cette partie si vous ne souhaitez pas convertir le résultat en JSON
            const dataFinally = {
                idQuestion: questionData.insertId,
                question: data.question,
                options: data.options,
                correctOption: data.correctOption,
                niveau: data.niveau,
                idEglise: data.idEglise
            };
            resolve(dataFinally);
        }
        catch (error) {
            reject(error);
        }
    }));
};
/**
 * recupererer toute les quetions
 * @returns
 */
const recupQuestion = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM questions ORDER BY idQuestion ASC ;`;
            const questions = yield (0, db_1._selectSql)(sql, []);
            resolve(questions);
        }
        catch (error) {
            reject(error);
        }
    }));
};
// Fetcher une seule questions
const recupQuestionId = (id) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM questions WHERE idQuestion =? ;`;
            const questions = yield (0, db_1._selectSql)(sql, [id]);
            resolve(questions);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerQuestion = (idQuestion) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `DELETE FROM questions WHERE idQuestion = ?`;
            yield (0, db_1._executeSql)(sql, [idQuestion]);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierQuestion = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `UPDATE questions SET question=?, options=?,correctOption=?,niveau=?,idEglise=? WHERE idQuestion=?`;
            yield (0, db_1._executeSql)(sql, [
                data.question,
                data.options,
                data.correctOption,
                data.niveau,
                data.idEglise,
            ]);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    ajouterQuestion,
    recupQuestion,
    supprimerQuestion,
    modifierQuestion,
    recupQuestionId
};
//# sourceMappingURL=functions.js.map