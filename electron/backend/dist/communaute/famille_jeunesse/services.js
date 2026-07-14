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
const ajouterFamilleJeunesse = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const idFamilleJeunesse = yield functions_1.default.ajouterFamilleJeunesse(Object.assign({}, data));
            const famille = yield functions_1.default.recupFamilleJeunesseId(idFamilleJeunesse);
            resolve(famille);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupFamilleJeunesse = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const familles = yield functions_1.default.recupFamilleJeunesse();
            resolve(familles);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupFamilleJeunesseByIdUtilisateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const familles = yield functions_1.default.recupFamilleJeunesseByIdUtilisateur(Number(idUtilisateur));
            resolve(familles);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerFamilleJeunesse = (idFamilleJeunesse, idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield functions_1.default.supprimerFamilleJeunesse(idFamilleJeunesse, idUtilisateur);
            resolve({ idFamilleJeunesse });
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierFamilleJeunesse = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield functions_1.default.modifierFamilleJeunesse(data);
            resolve(data);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    ajouterFamilleJeunesse,
    modifierFamilleJeunesse,
    recupFamilleJeunesse,
    recupFamilleJeunesseByIdUtilisateur,
    supprimerFamilleJeunesse,
};
//# sourceMappingURL=services.js.map