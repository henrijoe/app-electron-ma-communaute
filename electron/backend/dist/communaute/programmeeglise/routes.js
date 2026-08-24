"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = __importDefault(require("./controllers"));
// Routes du module "programme eglise" : planification de qui dirige, preche,
// fait les annonces, etc. a chaque culte (Agenda > onglet "Programme église").
const programmeEgliseRouter = express_1.default.Router();
programmeEgliseRouter.post('/ajouterprogrammeeglise', controllers_1.default.ajouterProgrammeEglise);
programmeEgliseRouter.post('/modifierprogrammeeglise', controllers_1.default.modifierProgrammeEglise);
programmeEgliseRouter.post('/supprimerprogrammeeglise', controllers_1.default.supprimerProgrammeEglise);
programmeEgliseRouter.get('/programmeseglise/:idUtilisateur', controllers_1.default.recupProgrammesEgliseByUtilisateur);
exports.default = programmeEgliseRouter;
//# sourceMappingURL=routes.js.map