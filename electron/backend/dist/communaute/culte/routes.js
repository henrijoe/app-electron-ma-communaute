"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = __importDefault(require("./controllers"));
const culteRouter = express_1.default.Router();
culteRouter.post("/insererculte", /* validator.ajouterCulteValidator(), */ controllers_1.default.ajouterCulte);
culteRouter.get("/listeculte", controllers_1.default.recupCulte);
culteRouter.post("/supprimerculte", controllers_1.default.supprimerCulte);
culteRouter.post("/modifierculte", /* validator.ajouterCulteValidator(), */ controllers_1.default.modifierCulte);
culteRouter.get("/recupcultebyutilisateur/:idUtilisateur", controllers_1.default.recupCulteByIdUtilsateur);
exports.default = culteRouter;
//# sourceMappingURL=routes.js.map