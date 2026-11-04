"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = __importDefault(require("./controllers"));
const cotisationRouter = express_1.default.Router();
// "byutilisateur/" dans l'adresse : c'est ce segment que le contrôle d'accès reconnaît
// pour vérifier que le compte connecté lit bien les données de son église.
cotisationRouter.get("/autrescotisations/byutilisateur/:idUtilisateur", controllers_1.default.recupCotisations);
cotisationRouter.post("/insererautrecotisation", controllers_1.default.ajouterCotisation);
cotisationRouter.post("/modifierautrecotisation", controllers_1.default.modifierCotisation);
cotisationRouter.post("/supprimerautrecotisation", controllers_1.default.supprimerCotisation);
exports.default = cotisationRouter;
//# sourceMappingURL=routes.js.map