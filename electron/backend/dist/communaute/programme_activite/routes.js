"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const functions_1 = require("../functions");
const functions_2 = __importDefault(require("./functions"));
const programmeActiviteRouter = express_1.default.Router();
const diffuser = (req, evenement, charge) => {
    var _a;
    (_a = req.io) === null || _a === void 0 ? void 0 : _a.emit(evenement, charge);
};
const repondre = (res, promesse, apres) => promesse
    .then((result) => {
    apres === null || apres === void 0 ? void 0 : apres(result);
    res.status(200).send({ status: 1, data: result });
})
    .catch((error) => res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) }));
// Lecture bornée à l'église par la convention ".../byutilisateur/:idUtilisateur".
programmeActiviteRouter.get("/recupprogrammeactivitebyutilisateur/:idUtilisateur", (req, res) => repondre(res, functions_2.default.recupProgrammes(Number(req.params.idUtilisateur), String(req.query.section || ""))));
programmeActiviteRouter.post("/insererprogrammeactivite", (req, res) => repondre(res, functions_2.default.ajouterProgramme(req.body), (result) => { var _a; return diffuser(req, "ajouterProgrammeActivite", { idUtilisateur: (_a = req.body) === null || _a === void 0 ? void 0 : _a.idUtilisateur, data: result }); }));
programmeActiviteRouter.post("/modifierprogrammeactivite", (req, res) => repondre(res, functions_2.default.modifierProgramme(req.body), (result) => { var _a; return diffuser(req, "modifierProgrammeActivite", { idUtilisateur: (_a = req.body) === null || _a === void 0 ? void 0 : _a.idUtilisateur, data: result }); }));
programmeActiviteRouter.post("/supprimerprogrammeactivite", (req, res) => {
    const { idProgrammeActivite, idUtilisateur } = req.body || {};
    return repondre(res, functions_2.default.supprimerProgramme(Number(idProgrammeActivite), Number(idUtilisateur)), () => diffuser(req, "supprimerProgrammeActivite", { idUtilisateur, idProgrammeActivite }));
});
exports.default = programmeActiviteRouter;
//# sourceMappingURL=routes.js.map