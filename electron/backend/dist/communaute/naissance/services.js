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
 * Permet d'ajouter une naissance.
 */
const ajouterNaissance = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const idNaissance = yield functions_1.default.ajouterNaissance(Object.assign({}, data));
            const naissance = yield functions_1.default.recupNaissanceId(idNaissance);
            resolve(naissance);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupNaissance = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const naissances = yield functions_1.default.recupNaissance();
            resolve(naissances);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupNaissanceByIdUtilsateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const naissanceByUtilisateur = yield functions_1.default.recupNaissanceByIdUtilsateur(idUtilisateur);
            resolve(naissanceByUtilisateur);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerNaissance = (idNaissance, idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield functions_1.default.supprimerNaissance(idNaissance, idUtilisateur);
            resolve({ idNaissance });
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierNaissance = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield functions_1.default.modifierNaissance(data);
            resolve(data);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    ajouterNaissance,
    recupNaissance,
    supprimerNaissance,
    modifierNaissance,
    recupNaissanceByIdUtilsateur,
};
//# sourceMappingURL=services.js.map