"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = __importDefault(require("./controllers"));
const galerieRouter = express_1.default.Router();
galerieRouter.post("/inserergalerie", controllers_1.default.ajouterGalerie);
galerieRouter.get("/recupgaleriebyutilisateur/:idUtilisateur", controllers_1.default.recupGaleriesByUtilisateur);
galerieRouter.post("/modifiergalerie", controllers_1.default.modifierGalerie);
galerieRouter.post("/supprimergalerie", controllers_1.default.supprimerGalerie);
galerieRouter.get("/recupimagesgalerie/:idGalerie", controllers_1.default.recupImagesGalerie);
galerieRouter.post("/ajouterimagesgalerie", controllers_1.default.ajouterImagesGalerie);
galerieRouter.post("/modifierimagegalerie", controllers_1.default.modifierImageGalerie);
galerieRouter.post("/definircouverturegalerie", controllers_1.default.definirCouvertureGalerie);
galerieRouter.post("/supprimerimagegalerie", controllers_1.default.supprimerImageGalerie);
galerieRouter.get("/telechargergalerie/:idGalerie", controllers_1.default.telechargerGalerie);
exports.default = galerieRouter;
//# sourceMappingURL=routes.js.map