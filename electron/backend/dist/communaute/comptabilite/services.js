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
const ajouterComptablilite = (data) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comptabiliteId = yield functions_1.default.ajouterComptablilite(Object.assign({}, data));
        const comptabilite = yield functions_1.default.recupComptabiliteById(comptabiliteId);
        resolve(comptabilite);
    }
    catch (error) {
        reject(error);
    }
}));
const recupComptabilite = () => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comptabilites = yield functions_1.default.recupComptabilite();
        resolve(comptabilites);
    }
    catch (error) {
        reject(error);
    }
}));
const recupComptabiliteByUtilisateur = (idUtilisateur) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comptabilites = yield functions_1.default.recupComptabiliteByUtilisateur(idUtilisateur);
        resolve(comptabilites);
    }
    catch (error) {
        reject(error);
    }
}));
const recupComptabiliteSupprimeeByUtilisateur = (idUtilisateur) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comptabilites = yield functions_1.default.recupComptabiliteSupprimeeByUtilisateur(idUtilisateur);
        resolve(comptabilites);
    }
    catch (error) {
        reject(error);
    }
}));
const supprimerComptabilite = (idComptabilite, supprimeParUtilisateur, motifSuppressionComptabilite) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comptabilite = yield functions_1.default.recupComptabiliteById(idComptabilite);
        const firstRow = Array.isArray(comptabilite) ? comptabilite[0] : comptabilite;
        yield functions_1.default.supprimerComptabilite(idComptabilite, supprimeParUtilisateur, motifSuppressionComptabilite);
        resolve({
            idComptabilite,
            idUtilisateur: Number((firstRow === null || firstRow === void 0 ? void 0 : firstRow.idUtilisateur) || 0) || null,
            nomComptabilite: (firstRow === null || firstRow === void 0 ? void 0 : firstRow.nomComptabilite) || '',
            supprimeParUtilisateur: supprimeParUtilisateur || null,
            motifSuppressionComptabilite: motifSuppressionComptabilite || 'Suppression depuis la liste comptable',
        });
    }
    catch (error) {
        reject(error);
    }
}));
const restaurerComptabilite = (idComptabilite) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield functions_1.default.restaurerComptabilite(idComptabilite);
        const comptabilite = yield functions_1.default.recupComptabiliteById(idComptabilite);
        const firstRow = Array.isArray(comptabilite) ? comptabilite[0] : comptabilite;
        resolve({
            idComptabilite,
            idUtilisateur: Number((firstRow === null || firstRow === void 0 ? void 0 : firstRow.idUtilisateur) || 0) || null,
            nomComptabilite: (firstRow === null || firstRow === void 0 ? void 0 : firstRow.nomComptabilite) || '',
            data: comptabilite,
        });
    }
    catch (error) {
        reject(error);
    }
}));
const supprimerComptabiliteDefinitivement = (idComptabilite, nomUtilisateur) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comptabilite = yield functions_1.default.recupComptabiliteById(idComptabilite);
        const firstRow = Array.isArray(comptabilite) ? comptabilite[0] : comptabilite;
        yield functions_1.default.supprimerComptabiliteDefinitivement(idComptabilite, nomUtilisateur);
        resolve({
            idComptabilite,
            idUtilisateur: Number((firstRow === null || firstRow === void 0 ? void 0 : firstRow.idUtilisateur) || 0) || null,
            nomComptabilite: (firstRow === null || firstRow === void 0 ? void 0 : firstRow.nomComptabilite) || '',
        });
    }
    catch (error) {
        reject(error);
    }
}));
const modifierComptabilite = (data) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield functions_1.default.modifierComptabilite(data);
        const comptabilite = yield functions_1.default.recupComptabiliteById(data.idComptabilite);
        resolve(comptabilite);
    }
    catch (error) {
        reject(error);
    }
}));
exports.default = {
    ajouterComptablilite,
    recupComptabilite,
    recupComptabiliteByUtilisateur,
    recupComptabiliteSupprimeeByUtilisateur,
    supprimerComptabilite,
    restaurerComptabilite,
    supprimerComptabiliteDefinitivement,
    modifierComptabilite,
};
//# sourceMappingURL=services.js.map