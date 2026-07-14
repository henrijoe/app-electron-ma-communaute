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
 * Permet d'ajouter une cellule.
 */
const ajouterCellule = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const idCellule = yield functions_1.default.ajouterCellule(Object.assign({}, data));
            const cellule = yield functions_1.default.recupCelluleId(idCellule);
            resolve(cellule);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupCellule = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const cellules = yield functions_1.default.recupCellule();
            resolve(cellules);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupCelluleByIdUtilsateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const celluleByUtilisateur = yield functions_1.default.recupCelluleByIdUtilsateur(idUtilisateur);
            resolve(celluleByUtilisateur);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerCellule = (idCellule, idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield functions_1.default.supprimerCellule(idCellule, idUtilisateur);
            resolve({ idCellule });
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierCellule = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield functions_1.default.modifierCellule(data);
            resolve(data);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    ajouterCellule,
    recupCellule,
    supprimerCellule,
    modifierCellule,
    recupCelluleByIdUtilsateur,
};
//# sourceMappingURL=services.js.map