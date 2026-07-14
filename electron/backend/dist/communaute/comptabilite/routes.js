"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = __importDefault(require("./controllers"));
const validator_1 = __importDefault(require("./validator"));
const comptabiliteRouter = express_1.default.Router();
comptabiliteRouter.post('/inserercomptabilite', validator_1.default.ajouterComptabiliteValidator(), controllers_1.default.ajouterComptablilite);
comptabiliteRouter.get('/listecomptabilite', controllers_1.default.recupComptabilite);
comptabiliteRouter.get('/listecomptabilite/:idUtilisateur', controllers_1.default.recupComptabilite);
comptabiliteRouter.get('/listecomptabilitesupprimee/:idUtilisateur', controllers_1.default.recupComptabiliteSupprimee);
comptabiliteRouter.post('/supprimercomptabilite/:id', controllers_1.default.supprimerComptabilite);
comptabiliteRouter.post('/restaurercomptabilite/:id', controllers_1.default.restaurerComptabilite);
comptabiliteRouter.post('/supprimercomptabilitedefinitivement/:id', controllers_1.default.supprimerComptabiliteDefinitivement);
comptabiliteRouter.post('/modifiercomptabilite/:id', controllers_1.default.modifierComptabilite);
exports.default = comptabiliteRouter;
//# sourceMappingURL=routes.js.map