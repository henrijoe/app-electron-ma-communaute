"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = __importDefault(require("./controllers"));
const validator_1 = __importDefault(require("./validator"));
const responsabiliteRouter = express_1.default.Router();
responsabiliteRouter.post("/insererresponsabilite", validator_1.default.ajouterResponsabiliteValidator(), controllers_1.default.ajouterResponsabilite);
responsabiliteRouter.get("/listeresponsabilite", controllers_1.default.recupResponsabilite);
responsabiliteRouter.post("/supprimerresponsabilite", controllers_1.default.supprimerResponsabilite);
responsabiliteRouter.post("/modifierresponsabilite", validator_1.default.modifierResponsabiliteValidator(), controllers_1.default.modifierResponsabilite);
exports.default = responsabiliteRouter;
//# sourceMappingURL=routes.js.map