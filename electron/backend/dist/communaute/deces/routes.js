"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = __importDefault(require("./controllers"));
const decesRouter = express_1.default.Router();
decesRouter.post("/insererdeces", /* validator.ajouterDecesValidator(), */ controllers_1.default.ajouterDeces);
decesRouter.get("/listedeces", controllers_1.default.recupDeces);
decesRouter.post("/supprimerdeces", controllers_1.default.supprimerDeces);
decesRouter.post("/modifierdeces", /* validator.ajouterDecesValidator(), */ controllers_1.default.modifierDeces);
decesRouter.get("/recupdecesbyutilisateur/:idUtilisateur", controllers_1.default.recupDecesByIdUtilsateur);
exports.default = decesRouter;
//# sourceMappingURL=routes.js.map