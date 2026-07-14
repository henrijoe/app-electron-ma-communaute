"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = __importDefault(require("./controllers"));
const validator_1 = __importDefault(require("./validator"));
const niveauRouter = express_1.default.Router();
niveauRouter.post("/ajouterniveau", validator_1.default.ajouterNiveauEtudeValidator(), controllers_1.default.ajouterNiveauEtude);
niveauRouter.get("/listeniveau", controllers_1.default.obtenirIdNiveauEtude);
niveauRouter.post("/supprimerniveau/:id", controllers_1.default.supprimerNiveau);
niveauRouter.post("/modifierniveau/:id", validator_1.default.ajouterNiveauEtudeValidator(), controllers_1.default.modifierNiveau);
exports.default = niveauRouter;
//# sourceMappingURL=routes.js.map