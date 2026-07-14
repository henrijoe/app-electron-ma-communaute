"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = __importDefault(require("./controllers"));
const familleJeunesseRouter = express_1.default.Router();
familleJeunesseRouter.post("/insererfamillejeunesse", controllers_1.default.ajouterFamilleJeunesse);
familleJeunesseRouter.get("/listefamillejeunesse", controllers_1.default.recupFamilleJeunesse);
familleJeunesseRouter.get("/recupfamillejeunessebyutilisateur/:idUtilisateur", controllers_1.default.recupFamilleJeunesseByIdUtilisateur);
familleJeunesseRouter.post("/modifierfamillejeunesse", controllers_1.default.modifierFamilleJeunesse);
familleJeunesseRouter.post("/supprimerfamillejeunesse", controllers_1.default.supprimerFamilleJeunesse);
exports.default = familleJeunesseRouter;
//# sourceMappingURL=routes.js.map