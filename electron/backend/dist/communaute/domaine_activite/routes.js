"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = __importDefault(require("./controllers"));
const validator_1 = __importDefault(require("./validator"));
const domaineActiviteRouter = express_1.default.Router();
domaineActiviteRouter.post("/ajouterdomaineactivite", validator_1.default.ajouterDomaineActiviteValidator(), controllers_1.default.ajouterDomaineActivite);
domaineActiviteRouter.get("/listedomaineactivite", controllers_1.default.obtenirDomaineActivite);
domaineActiviteRouter.post("/supprimerdomaineactivite/:id", controllers_1.default.supprimerDomaineActivite);
domaineActiviteRouter.post("/modifierdomaineactivite/:id", controllers_1.default.modifierDomaineActivite);
exports.default = domaineActiviteRouter;
//# sourceMappingURL=routes.js.map