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
 * Permet d'ajouter un groupe.
 */
const ajouterGroupe = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const idGroupe = yield functions_1.default.ajouterGroupe(Object.assign({}, data));
            const groupe = yield functions_1.default.recupGroupeId(idGroupe);
            resolve(groupe);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupGroupe = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const groupes = yield functions_1.default.recupGroupe();
            resolve(groupes);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupGroupeByIdUtilsateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const groupeByUtilisateur = yield functions_1.default.recupGroupeByIdUtilsateur(idUtilisateur);
            resolve(groupeByUtilisateur);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerGroupe = (idGroupe, idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield functions_1.default.supprimerGroupe(idGroupe, idUtilisateur);
            resolve({ idGroupe });
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierGroupe = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield functions_1.default.modifierGroupe(data);
            resolve(data);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    ajouterGroupe,
    recupGroupe,
    supprimerGroupe,
    modifierGroupe,
    recupGroupeByIdUtilsateur,
};
//# sourceMappingURL=services.js.map