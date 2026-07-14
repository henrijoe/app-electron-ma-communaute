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
const ajouterGalerie = (data) => __awaiter(void 0, void 0, void 0, function* () { return functions_1.default.ajouterGalerie(data); });
const recupGaleriesByUtilisateur = (idUtilisateur) => __awaiter(void 0, void 0, void 0, function* () { return functions_1.default.recupGaleriesByUtilisateur(idUtilisateur); });
const modifierGalerie = (data) => __awaiter(void 0, void 0, void 0, function* () { return functions_1.default.modifierGalerie(data); });
const supprimerGalerie = (idGalerie, idUtilisateur) => __awaiter(void 0, void 0, void 0, function* () { return functions_1.default.supprimerGalerie(idGalerie, idUtilisateur); });
const recupImagesGalerie = (idGalerie) => __awaiter(void 0, void 0, void 0, function* () { return functions_1.default.recupImagesGalerie(idGalerie); });
const ajouterImagesGalerie = (payload) => __awaiter(void 0, void 0, void 0, function* () { return functions_1.default.ajouterImagesGalerie(payload); });
const modifierImageGalerie = (payload) => __awaiter(void 0, void 0, void 0, function* () { return functions_1.default.modifierImageGalerie(payload); });
const definirCouvertureGalerie = (payload) => __awaiter(void 0, void 0, void 0, function* () { return functions_1.default.definirCouvertureGalerie(payload); });
const supprimerImageGalerie = (idGalerieImage, idUtilisateur) => __awaiter(void 0, void 0, void 0, function* () { return functions_1.default.supprimerImageGalerie(idGalerieImage, idUtilisateur); });
const buildGalerieZip = (idGalerie, idUtilisateur) => __awaiter(void 0, void 0, void 0, function* () { return functions_1.default.buildGalerieZip(idGalerie, idUtilisateur); });
exports.default = {
    ajouterGalerie,
    recupGaleriesByUtilisateur,
    modifierGalerie,
    supprimerGalerie,
    recupImagesGalerie,
    ajouterImagesGalerie,
    modifierImageGalerie,
    definirCouvertureGalerie,
    supprimerImageGalerie,
    buildGalerieZip,
};
//# sourceMappingURL=services.js.map