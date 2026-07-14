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
const ajouterMaladie = (data) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const idMaladie = yield functions_1.default.ajouterMaladie(Object.assign({}, data));
        const maladie = yield functions_1.default.recupMaladieId(idMaladie);
        resolve(maladie);
    }
    catch (error) {
        reject(error);
    }
}));
const recupMaladie = () => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const maladies = yield functions_1.default.recupMaladie();
        resolve(maladies);
    }
    catch (error) {
        reject(error);
    }
}));
const recupMaladieByIdUtilsateur = (idUtilisateur) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const maladieByUtilisateur = yield functions_1.default.recupMaladieByIdUtilsateur(idUtilisateur);
        resolve(maladieByUtilisateur);
    }
    catch (error) {
        reject(error);
    }
}));
const supprimerMaladie = (idMaladie) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield functions_1.default.supprimerMaladie(idMaladie);
        resolve({ idMaladie });
    }
    catch (error) {
        reject(error);
    }
}));
const modifierMaladie = (data) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield functions_1.default.modifierMaladie(data);
        resolve(data);
    }
    catch (error) {
        reject(error);
    }
}));
exports.default = {
    ajouterMaladie,
    recupMaladie,
    recupMaladieByIdUtilsateur,
    supprimerMaladie,
    modifierMaladie,
};
//# sourceMappingURL=services.js.map