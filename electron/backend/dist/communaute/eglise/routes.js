"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = __importDefault(require("./controllers"));
const validator_1 = __importDefault(require("./validator"));
const egliseRouter = express_1.default.Router();
egliseRouter.post("/inserereglise", validator_1.default.ajouterEgliseValidator(), controllers_1.default.ajouterEglise);
egliseRouter.get("/listeeglise", controllers_1.default.recupEglise);
egliseRouter.post("/supprimereglise/:id", controllers_1.default.supprimerEglise);
egliseRouter.post("/modifiereglise/:id", controllers_1.default.modifierEglise);
exports.default = egliseRouter;
//# sourceMappingURL=routes.js.map