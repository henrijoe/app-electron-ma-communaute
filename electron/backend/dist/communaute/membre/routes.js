"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = __importDefault(require("./controllers"));
const membreRouter = express_1.default.Router();
membreRouter.post("/inserermembre", /* validator.ajouterMembreValidator(), */ controllers_1.default.ajouterMembre);
membreRouter.get("/listemembre", controllers_1.default.recupMembre);
membreRouter.post("/supprimermembre", controllers_1.default.supprimerMembre);
membreRouter.post("/modifiermembre", /* validator.modifierMembreValidator(), */ controllers_1.default.modifierMembre);
membreRouter.get("/recupmembrebyutilisateur/:idUtilisateur", controllers_1.default.recupMembreByIdUtilsateur);
exports.default = membreRouter;
//# sourceMappingURL=routes.js.map