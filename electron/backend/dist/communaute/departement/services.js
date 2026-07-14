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
const ajouterDepartement = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const idDepartement = yield functions_1.default.ajouterDepartement(Object.assign({}, data));
            const departement = yield functions_1.default.recupDepartementById(idDepartement);
            const departementItem = Array.isArray(departement) ? departement[0] : departement;
            resolve(departementItem);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupDepartement = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // const utilisateur: any = await functions_utilisateur.recupUtilisateurById(idUtilisateur)
            const departements = yield functions_1.default.recupDepartement();
            resolve(departements);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupDepartementByIdUtilsateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const departementByUtilisateur = yield functions_1.default.recupDepartementByIdUtilsateur(idUtilisateur);
            resolve(departementByUtilisateur);
        }
        catch (error) {
            console.log("Erreur service departement :", error);
            reject(error);
        }
    }));
};
const supprimerDepartement = (idDepartement, idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield functions_1.default.supprimerDepartement(idDepartement, idUtilisateur);
            resolve({ idDepartement: idDepartement });
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierDepartement = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield functions_1.default.modifierDepartement(data);
            resolve(data);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    ajouterDepartement,
    recupDepartement,
    supprimerDepartement,
    modifierDepartement,
    recupDepartementByIdUtilsateur
};
//# sourceMappingURL=services.js.map