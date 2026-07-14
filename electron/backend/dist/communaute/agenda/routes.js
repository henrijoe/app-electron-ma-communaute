"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = __importDefault(require("./controllers"));
const agendaRouter = express_1.default.Router();
agendaRouter.post("/insereragenda", controllers_1.default.ajouterAgenda);
agendaRouter.get("/recupagendabyutilisateur/:idUtilisateur", controllers_1.default.recupAgendaByIdUtilsateur);
agendaRouter.post("/modifieragenda", controllers_1.default.modifierAgenda);
agendaRouter.post("/supprimeragenda", controllers_1.default.supprimerAgenda);
exports.default = agendaRouter;
//# sourceMappingURL=routes.js.map