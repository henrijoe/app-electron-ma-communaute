"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = __importDefault(require("./controllers"));
const validator_1 = __importDefault(require("./validator"));
const groupeRouter = express_1.default.Router();
groupeRouter.post("/inserergroupe", validator_1.default.ajouterGroupeValidator(), controllers_1.default.ajouterGroupe);
groupeRouter.get("/listegroupe", controllers_1.default.recupGroupe);
groupeRouter.post("/supprimergroupe", controllers_1.default.supprimerGroupe);
groupeRouter.post("/modifiergroupe", validator_1.default.modifierGroupeValidator(), controllers_1.default.modifierGroupe);
groupeRouter.get("/recupgroupebyutilisateur/:idUtilisateur", controllers_1.default.recupGroupeByIdUtilsateur);
exports.default = groupeRouter;
//# sourceMappingURL=routes.js.map