"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = __importDefault(require("./controllers"));
const validator_1 = __importDefault(require("./validator"));
const nouvelleAmeRouter = express_1.default.Router();
nouvelleAmeRouter.post("/inserernouvelleame", validator_1.default.ajouterNouvelleAmeValidator(), controllers_1.default.ajouterNouvelleAme);
nouvelleAmeRouter.get("/listenouvelleame", controllers_1.default.recupNouvelleAme);
nouvelleAmeRouter.post("/supprimernouvelleame/:id", controllers_1.default.supprimerNouvelleAme);
nouvelleAmeRouter.post("/modifiernouvelleame/:id", validator_1.default.modifierNouvelleAmeValidator(), controllers_1.default.modifierNouvelleAme);
exports.default = nouvelleAmeRouter;
//# sourceMappingURL=routes.js.map