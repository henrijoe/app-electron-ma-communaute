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
const functions_1 = require("../functions");
const services_1 = __importDefault(require("./services"));
const repondre = (res, action) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200).send({ status: 1, data: yield action() });
    }
    catch (error) {
        res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) });
    }
});
const recupCotisations = (req, res) => repondre(res, () => services_1.default.recupCotisations(Number(req.params.idUtilisateur)));
const ajouterCotisation = (req, res) => repondre(res, () => services_1.default.ajouterCotisation(req.body));
const modifierCotisation = (req, res) => repondre(res, () => services_1.default.modifierCotisation(req.body));
const supprimerCotisation = (req, res) => repondre(res, () => services_1.default.supprimerCotisation(req.body));
exports.default = {
    recupCotisations,
    ajouterCotisation,
    modifierCotisation,
    supprimerCotisation,
};
//# sourceMappingURL=controllers.js.map