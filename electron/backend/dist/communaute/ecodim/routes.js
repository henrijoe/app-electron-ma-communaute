"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = __importDefault(require("./controllers"));
const ecodimRouter = express_1.default.Router();
// Les lectures suivent la convention ".../byutilisateur/:idUtilisateur" : le
// middleware d'authentification y reconnaît le périmètre et refuse qu'un compte
// lise les données d'une autre église.
// Classes
ecodimRouter.get("/recupclasseecodimbyutilisateur/:idUtilisateur", controllers_1.default.recupClassesByUtilisateur);
ecodimRouter.post("/insererclasseecodim", controllers_1.default.ajouterClasse);
ecodimRouter.post("/modifierclasseecodim", controllers_1.default.modifierClasse);
ecodimRouter.post("/supprimerclasseecodim", controllers_1.default.supprimerClasse);
// Moniteurs
ecodimRouter.get("/recupmoniteurecodimbyutilisateur/:idUtilisateur", controllers_1.default.recupMoniteursByUtilisateur);
ecodimRouter.post("/inserermoniteurecodim", controllers_1.default.ajouterMoniteur);
ecodimRouter.post("/modifiermoniteurecodim", controllers_1.default.modifierMoniteur);
ecodimRouter.post("/supprimermoniteurecodim", controllers_1.default.supprimerMoniteur);
// Enfants
ecodimRouter.get("/recupenfantecodimbyutilisateur/:idUtilisateur", controllers_1.default.recupEnfantsByUtilisateur);
ecodimRouter.post("/insererenfantecodim", controllers_1.default.ajouterEnfant);
ecodimRouter.post("/modifierenfantecodim", controllers_1.default.modifierEnfant);
ecodimRouter.post("/supprimerenfantecodim", controllers_1.default.supprimerEnfant);
// Activités
ecodimRouter.get("/recupactiviteecodimbyutilisateur/:idUtilisateur", controllers_1.default.recupActivitesByUtilisateur);
ecodimRouter.post("/insereractiviteecodim", controllers_1.default.ajouterActivite);
ecodimRouter.post("/modifieractiviteecodim", controllers_1.default.modifierActivite);
ecodimRouter.post("/supprimeractiviteecodim", controllers_1.default.supprimerActivite);
// Médias : photo d'un enfant, images d'une activité.
ecodimRouter.post("/enregistrerphotoenfantecodim", controllers_1.default.enregistrerPhotoEnfant);
ecodimRouter.get("/recupimageactiviteecodim/:idActiviteEcodim", controllers_1.default.recupImagesActivite);
ecodimRouter.post("/insererimageactiviteecodim", controllers_1.default.ajouterImageActivite);
ecodimRouter.post("/supprimerimageactiviteecodim", controllers_1.default.supprimerImageActivite);
// Cultes : le cahier de texte, une ligne par dimanche et par classe.
ecodimRouter.get("/recupculteecodimbyutilisateur/:idUtilisateur", controllers_1.default.recupCultesByUtilisateur);
ecodimRouter.post("/insererculteecodim", controllers_1.default.ajouterCulte);
ecodimRouter.post("/modifierculteecodim", controllers_1.default.modifierCulte);
ecodimRouter.post("/supprimerculteecodim", controllers_1.default.supprimerCulte);
// Évaluations et notes.
ecodimRouter.get("/recupevaluationecodimbyutilisateur/:idUtilisateur", controllers_1.default.recupEvaluationsByUtilisateur);
ecodimRouter.post("/insererevaluationecodim", controllers_1.default.ajouterEvaluation);
ecodimRouter.post("/modifierevaluationecodim", controllers_1.default.modifierEvaluation);
ecodimRouter.post("/supprimerevaluationecodim", controllers_1.default.supprimerEvaluation);
ecodimRouter.get("/recupnoteecodimbyutilisateur/:idUtilisateur", controllers_1.default.recupNotesByUtilisateur);
ecodimRouter.post("/enregistrernoteecodim", controllers_1.default.enregistrerNotes);
exports.default = ecodimRouter;
//# sourceMappingURL=routes.js.map