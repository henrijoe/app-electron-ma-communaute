"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = __importDefault(require("./controllers"));
const naissanceRouter = express_1.default.Router();
naissanceRouter.post("/inserernaissance", /* validator.ajouterNaissanceValidator(), */ controllers_1.default.ajouterNaissance);
naissanceRouter.get("/listenaissance", controllers_1.default.recupNaissance);
naissanceRouter.post("/supprimernaissance", controllers_1.default.supprimerNaissance);
naissanceRouter.post("/modifiernaissance", /* validator.ajouterNaissanceValidator(), */ controllers_1.default.modifierNaissance);
naissanceRouter.get("/recupnaissancebyutilisateur/:idUtilisateur", controllers_1.default.recupNaissanceByIdUtilsateur);
exports.default = naissanceRouter;
//# sourceMappingURL=routes.js.map