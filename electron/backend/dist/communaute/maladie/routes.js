"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = __importDefault(require("./controllers"));
const maladieRouter = express_1.default.Router();
maladieRouter.post("/inserermaladie", controllers_1.default.ajouterMaladie);
maladieRouter.get("/listemaladie", controllers_1.default.recupMaladie);
maladieRouter.post("/supprimermaladie", controllers_1.default.supprimerMaladie);
maladieRouter.post("/modifiermaladie", controllers_1.default.modifierMaladie);
maladieRouter.get("/recupmaladiebyutilisateur/:idUtilisateur", controllers_1.default.recupMaladieByIdUtilsateur);
exports.default = maladieRouter;
//# sourceMappingURL=routes.js.map