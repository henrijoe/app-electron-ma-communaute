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
const path = require('path');
const fs = require("fs");
const obtenirIdNiveauEtude = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const niveau = yield functions_1.default.obtenirIdNiveauEtude();
            resolve(niveau);
        }
        catch (error) {
            reject(error);
        }
    }));
};
/**
 *
Permet d'ajouter un niveau
 * @returns
 */
const ajouterNiveauEtude = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const idNiveau = yield functions_1.default.ajouterNiveauEtude(Object.assign({}, data));
            const niveau = yield functions_1.default.obtenirIdNiveauEtudeById(idNiveau);
            resolve(niveau);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerNiveau = (idNiveauEtude) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const niveaux = yield functions_1.default.obtenirIdNiveauEtude();
            if (Array.isArray(niveaux)) {
                const index = niveaux.findIndex((item) => item.idNiveauEtude === idNiveauEtude);
                if (index >= 0) {
                    niveaux.splice(index, 1);
                    yield functions_1.default.supprimerNiveau(idNiveauEtude);
                    resolve(true);
                }
                else {
                    return reject('niveau non trouvé');
                }
            }
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierNiveau = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield functions_1.default.modifierNiveau(data);
            resolve(data);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    obtenirIdNiveauEtude,
    ajouterNiveauEtude,
    supprimerNiveau,
    modifierNiveau
};
//# sourceMappingURL=services.js.map