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
const functions_1 = __importDefault(require("./functions"));
/**
 *
Permet d'ajouter une question
 * @returns
 */
const ajouterQuestion = (data) => {
    console.log("🚀 ~ file: services.ts:10 ~ ajouterQuestion ~ data:", data);
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const idQuestion = yield functions_1.default.ajouterQuestion(Object.assign({}, data));
            // const question = await functions.recupQuestionId(idQuestion)
            resolve(idQuestion);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupQuestion = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const questions = yield functions_1.default.recupQuestion();
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
            yield functions_1.default.supprimerQuestion(idQuestion);
            resolve({ idQuestion: idQuestion });
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierQuestion = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield functions_1.default.modifierQuestion(data);
            resolve(data);
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
};
//# sourceMappingURL=services.js.map