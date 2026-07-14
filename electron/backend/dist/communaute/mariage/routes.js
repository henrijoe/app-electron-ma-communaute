"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = __importDefault(require("./controllers"));
const mariageRouter = express_1.default.Router();
mariageRouter.post("/inserermariage", /* validator.ajouterMariageValidator(), */ controllers_1.default.ajouterMariage);
mariageRouter.get("/listemariage", controllers_1.default.recupMariage);
mariageRouter.post("/supprimermariage", controllers_1.default.supprimerMariage);
mariageRouter.post("/modifiermariage", /* validator.ajouterMariageValidator(), */ controllers_1.default.modifierMariage);
mariageRouter.get("/recupmariagebyutilisateur/:idUtilisateur", controllers_1.default.recupMariageByIdUtilsateur);
exports.default = mariageRouter;
//# sourceMappingURL=routes.js.map