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
Permet d'ajouter une deces
 * @returns
 */
const ajouterDeces = (data) => {
    console.log("🚀 ~ ajouterDeces ~ data:", data);
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const idDeces = yield functions_1.default.ajouterDeces(Object.assign({}, data));
            const deces = yield functions_1.default.recupDecesId(idDeces);
            resolve(deces);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupDeces = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const decess = yield functions_1.default.recupDeces();
            resolve(decess);
        }
        catch (error) {
            reject(error);
        }
    }));
};
// 
const recupDecesByIdUtilsateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const membereByUtilisateur = yield functions_1.default.recupDecesByIdUtilsateur(idUtilisateur);
            resolve(membereByUtilisateur);
        }
        catch (error) {
            console.log("🚀 ~ file: services.ts:830 ~ returnnewPromise ~ error:", error);
            reject(error);
        }
    }));
};
const supprimerDeces = (idDeces) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const deletedDeces = yield functions_1.default.recupDecesId(idDeces);
            yield functions_1.default.supprimerDeces(idDeces);
            resolve({
                idDeces,
                idMembre: ((_a = deletedDeces === null || deletedDeces === void 0 ? void 0 : deletedDeces[0]) === null || _a === void 0 ? void 0 : _a.idMembre) || null,
                idUtilisateur: ((_b = deletedDeces === null || deletedDeces === void 0 ? void 0 : deletedDeces[0]) === null || _b === void 0 ? void 0 : _b.idUtilisateur) || null,
                nomMembreDeces: ((_c = deletedDeces === null || deletedDeces === void 0 ? void 0 : deletedDeces[0]) === null || _c === void 0 ? void 0 : _c.nomMembreDeces) || '',
            });
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierDeces = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield functions_1.default.modifierDeces(data);
            resolve(data);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    ajouterDeces,
    recupDeces,
    supprimerDeces,
    modifierDeces,
    recupDecesByIdUtilsateur
};
//# sourceMappingURL=services.js.map