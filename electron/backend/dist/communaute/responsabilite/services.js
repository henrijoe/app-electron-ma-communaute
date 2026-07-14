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
Permet d'ajouter un responsabilite
 * @returns
 */
const ajouterResponsabilite = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const idResponsabilite = yield functions_1.default.ajouterResponsabilite(Object.assign({}, data));
            const responsabilite = yield functions_1.default.recupResponsabiliteById(idResponsabilite);
            resolve(responsabilite);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupResponsabilite = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const responsabilites = yield functions_1.default.recupResponsabilite();
            resolve(responsabilites);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerResponsabilite = (idResponsabilite) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const responsabilites = yield functions_1.default.recupResponsabilite();
            if (Array.isArray(responsabilites)) {
                const index = responsabilites.findIndex((item) => item.idResponsabilite === idResponsabilite);
                if (index >= 0) {
                    responsabilites.splice(index, 1);
                    yield functions_1.default.supprimerResponsabilite(idResponsabilite);
                    resolve(true);
                }
                else {
                    return reject('Departement non trouvé');
                }
            }
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierResponsabilite = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield functions_1.default.modifierResponsabilite(data);
            resolve(data);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    ajouterResponsabilite,
    recupResponsabilite,
    supprimerResponsabilite,
    modifierResponsabilite
};
//# sourceMappingURL=services.js.map