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
 * Permet d'ajouter une eglise.
 */
const ajouterEglise = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const idEglise = yield functions_1.default.ajouterEglise(Object.assign({}, data));
            const eglise = yield functions_1.default.recupEgliseById(idEglise);
            resolve(eglise);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupEglise = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const eglises = yield functions_1.default.recupEglise();
            resolve(eglises);
        }
        catch (error) {
            reject(error);
        }
    }));
};
// Renvoie l'eglise de l'utilisateur connecte.
const recupEgliseByUtilisateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const eglise = yield functions_1.default.recupEgliseByUtilisateur(idUtilisateur);
            resolve(eglise);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerEglise = (idEglise, idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield functions_1.default.supprimerEglise(idEglise, idUtilisateur);
            resolve({ idEglise });
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierEglise = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield functions_1.default.modifierEglise(data);
            resolve(data);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    ajouterEglise,
    recupEglise,
    recupEgliseByUtilisateur,
    supprimerEglise,
    modifierEglise,
};
//# sourceMappingURL=services.js.map