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
Permet d'ajouter une mariage
 * @returns
 */
const ajouterMariage = (data) => {
    console.log("🚀 ~ ajouterMariage ~ data:", data);
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const idMariage = yield functions_1.default.ajouterMariage(Object.assign({}, data));
            const mariage = yield functions_1.default.recupMariageId(idMariage);
            resolve(mariage);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupMariage = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const mariages = yield functions_1.default.recupMariage();
            resolve(mariages);
        }
        catch (error) {
            reject(error);
        }
    }));
};
// 
const recupMariageByIdUtilsateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const membereByUtilisateur = yield functions_1.default.recupMariageByIdUtilsateur(idUtilisateur);
            resolve(membereByUtilisateur);
        }
        catch (error) {
            console.log("🚀 ~ file: services.ts:830 ~ returnnewPromise ~ error:", error);
            reject(error);
        }
    }));
};
const supprimerMariage = (idMariage) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield functions_1.default.supprimerMariage(idMariage);
            resolve({ idMariage: idMariage });
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierMariage = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield functions_1.default.modifierMariage(data);
            resolve(data);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    ajouterMariage,
    recupMariage,
    supprimerMariage,
    modifierMariage,
    recupMariageByIdUtilsateur
};
//# sourceMappingURL=services.js.map