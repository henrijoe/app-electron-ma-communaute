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
const ajouterDomaineActivite = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const idDomaineActivite = yield functions_1.default.ajouterDomaineActivite(Object.assign({}, data));
            const domaineActivite = yield functions_1.default.obtenirDomaineActiviteById(idDomaineActivite);
            resolve(domaineActivite);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const obtenirDomaineActivite = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const domaine = yield functions_1.default.obtenirDomaineActivite();
            resolve(domaine);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerDomaineActivite = (idDomaineActivite) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const domaine = yield functions_1.default.obtenirDomaineActivite();
            if (Array.isArray(domaine)) {
                const index = domaine.findIndex((item) => item.idDomaineActivite === idDomaineActivite);
                if (index >= 0) {
                    domaine.splice(index, 1);
                    yield functions_1.default.supprimerDomaineActivite(idDomaineActivite);
                    resolve(true);
                }
                else {
                    return reject('Domaine non trouvé');
                }
            }
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierDomaineActivite = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield functions_1.default.modifierDomaineActivite(data);
            resolve(data);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    ajouterDomaineActivite,
    obtenirDomaineActivite,
    supprimerDomaineActivite,
    modifierDomaineActivite
};
//# sourceMappingURL=services.js.map