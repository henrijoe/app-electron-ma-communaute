"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = __importDefault(require("./controllers"));
const responsabiliteCelluleRouter = express_1.default.Router();
responsabiliteCelluleRouter.post("/insererresponsabilitecellule", controllers_1.default.ajouterResponsabilite);
responsabiliteCelluleRouter.get("/listeresponsabilitecellule", controllers_1.default.recupResponsabilite);
responsabiliteCelluleRouter.post("/supprimerresponsabilitecelluke/:id", controllers_1.default.supprimerResponsabilite);
responsabiliteCelluleRouter.post("/modifierresponsabilitecellule/:id", controllers_1.default.modifierResponsabilite);
exports.default = responsabiliteCelluleRouter;
//# sourceMappingURL=routes.js.map