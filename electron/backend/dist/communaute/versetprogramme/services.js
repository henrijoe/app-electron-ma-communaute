"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = __importDefault(require("./functions"));
// Couche intermediaire entre les controllers et les fonctions SQL. Ici elle
// se contente de relayer l'appel : elle existe pour rester coherente avec
// le decoupage utilise partout ailleurs dans le projet (controller -> service -> functions).
const ajouterVersetProgramme = (data) => functions_1.default.ajouterVersetProgramme(data);
const modifierVersetProgramme = (data) => functions_1.default.modifierVersetProgramme(data);
const supprimerVersetProgramme = (idVersetProgramme, idUtilisateur) => functions_1.default.supprimerVersetProgramme(idVersetProgramme, idUtilisateur);
const recupVersetsProgrammeByUtilisateur = (idUtilisateur) => functions_1.default.recupVersetsProgrammeByUtilisateur(idUtilisateur);
exports.default = {
    ajouterVersetProgramme,
    modifierVersetProgramme,
    supprimerVersetProgramme,
    recupVersetsProgrammeByUtilisateur,
};
//# sourceMappingURL=services.js.map