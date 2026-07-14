"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = __importDefault(require("./controllers"));
const celluleRouter = express_1.default.Router();
celluleRouter.post("/inserercellule", /* validator.ajouterCelluleValidator(), */ controllers_1.default.ajouterCellule);
celluleRouter.get("/listecellule", controllers_1.default.recupCellule);
celluleRouter.post("/supprimercellule", controllers_1.default.supprimerCellule);
celluleRouter.post("/modifiercellule", /* validator.ajouterCelluleValidator(), */ controllers_1.default.modifierCellule);
celluleRouter.get("/recupcellulebyutilisateur/:idUtilisateur", controllers_1.default.recupCelluleByIdUtilsateur);
exports.default = celluleRouter;
//# sourceMappingURL=routes.js.map