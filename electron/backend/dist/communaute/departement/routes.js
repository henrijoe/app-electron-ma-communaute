"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = __importDefault(require("./controllers"));
const departementRouter = express_1.default.Router();
departementRouter.post("/insererdepartement", /* validator.ajouterDepartementValidator(),*/ controllers_1.default.ajouterDepartement);
departementRouter.get("/listedepartement", controllers_1.default.recupDepartement);
departementRouter.post("/supprimerdepartement", controllers_1.default.supprimerDepartement);
departementRouter.post("/modifierdepartement", /* validator.modifierDepartementValidator(), */ controllers_1.default.modifierDepartement);
departementRouter.get("/recupdepartementbyutilisateur/:idUtilisateur", controllers_1.default.recupDepartementByIdUtilsateur);
exports.default = departementRouter;
//# sourceMappingURL=routes.js.map