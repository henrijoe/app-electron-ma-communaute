"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = __importDefault(require("./functions"));
// Couche intermediaire entre les controllers et les fonctions SQL. Ici elle
// se contente de relayer l'appel : elle existe pour rester coherente avec
// le decoupage utilise partout ailleurs dans le projet (controller -> service -> functions).
const ajouterProgrammeEglise = (data) => functions_1.default.ajouterProgrammeEglise(data);
const modifierProgrammeEglise = (data) => functions_1.default.modifierProgrammeEglise(data);
const supprimerProgrammeEglise = (idProgramme, idUtilisateur) => functions_1.default.supprimerProgrammeEglise(idProgramme, idUtilisateur);
const recupProgrammesEgliseByUtilisateur = (idUtilisateur) => functions_1.default.recupProgrammesEgliseByUtilisateur(idUtilisateur);
exports.default = {
    ajouterProgrammeEglise,
    modifierProgrammeEglise,
    supprimerProgrammeEglise,
    recupProgrammesEgliseByUtilisateur,
};
//# sourceMappingURL=services.js.map