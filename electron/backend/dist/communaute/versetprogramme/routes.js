"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = __importDefault(require("./controllers"));
// Routes du module "verset programme" : gestion du calendrier de versets
// bibliques que l'admin programme a l'avance pour le tableau de bord
// (Parametres > Verset du jour > mode "Programme sur plusieurs mois").
const versetProgrammeRouter = express_1.default.Router();
versetProgrammeRouter.post('/ajouterversetprogramme', controllers_1.default.ajouterVersetProgramme);
versetProgrammeRouter.post('/modifierversetprogramme', controllers_1.default.modifierVersetProgramme);
versetProgrammeRouter.post('/supprimerversetprogramme', controllers_1.default.supprimerVersetProgramme);
versetProgrammeRouter.get('/versetsprogramme/:idUtilisateur', controllers_1.default.recupVersetsProgrammeByUtilisateur);
exports.default = versetProgrammeRouter;
//# sourceMappingURL=routes.js.map