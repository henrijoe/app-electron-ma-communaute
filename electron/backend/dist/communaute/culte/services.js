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
Permet d'ajouter une culte
 * @returns
 */
const ajouterCulte = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const idCulte = yield functions_1.default.ajouterCulte(Object.assign({}, data));
            // console.log("🚀 ~ returnnewPromise ~ idCulte:", idCulte)
            const culte = yield functions_1.default.recupCulteId(idCulte);
            resolve(culte);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupCulte = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const cultes = yield functions_1.default.recupCulte();
            resolve(cultes);
        }
        catch (error) {
            reject(error);
        }
    }));
};
// 
const recupCulteByIdUtilsateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const membereByUtilisateur = yield functions_1.default.recupCulteByIdUtilsateur(idUtilisateur);
            resolve(membereByUtilisateur);
        }
        catch (error) {
            console.log("🚀 ~ file: services.ts:830 ~ returnnewPromise ~ error:", error);
            reject(error);
        }
    }));
};
const supprimerCulte = (idCulte, idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield functions_1.default.supprimerCulte(idCulte, idUtilisateur);
            resolve({ idCulte: idCulte });
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierCulte = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield functions_1.default.modifierCulte(data);
            resolve(data);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    ajouterCulte,
    recupCulte,
    supprimerCulte,
    modifierCulte,
    recupCulteByIdUtilsateur
};
//# sourceMappingURL=services.js.map