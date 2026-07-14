"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const services_1 = __importDefault(require("./services"));
const ajouterGalerie = (req, res) => {
    services_1.default.ajouterGalerie(req.body)
        .then((result) => res.status(200).send({ status: 1, data: result }))
        .catch((error) => res.status(400).send({ status: 0, error: (error === null || error === void 0 ? void 0 : error.message) || error }));
};
const recupGaleriesByUtilisateur = (req, res) => {
    const { idUtilisateur } = req.params;
    services_1.default.recupGaleriesByUtilisateur(Number(idUtilisateur))
        .then((result) => res.status(200).send({ status: 1, data: result }))
        .catch((error) => res.status(400).send({ status: 0, error: (error === null || error === void 0 ? void 0 : error.message) || error }));
};
const modifierGalerie = (req, res) => {
    services_1.default.modifierGalerie(req.body)
        .then((result) => res.status(200).send({ status: 1, data: result }))
        .catch((error) => res.status(400).send({ status: 0, error: (error === null || error === void 0 ? void 0 : error.message) || error }));
};
const supprimerGalerie = (req, res) => {
    const { idGalerie, idUtilisateur } = req.body;
    services_1.default.supprimerGalerie(Number(idGalerie), idUtilisateur ? Number(idUtilisateur) : undefined)
        .then((result) => res.status(200).send({ status: 1, data: result }))
        .catch((error) => res.status(400).send({ status: 0, error: (error === null || error === void 0 ? void 0 : error.message) || error }));
};
const recupImagesGalerie = (req, res) => {
    const { idGalerie } = req.params;
    services_1.default.recupImagesGalerie(Number(idGalerie))
        .then((result) => res.status(200).send({ status: 1, data: result }))
        .catch((error) => res.status(400).send({ status: 0, error: (error === null || error === void 0 ? void 0 : error.message) || error }));
};
const ajouterImagesGalerie = (req, res) => {
    services_1.default.ajouterImagesGalerie(req.body)
        .then((result) => res.status(200).send({ status: 1, data: result }))
        .catch((error) => res.status(400).send({ status: 0, error: (error === null || error === void 0 ? void 0 : error.message) || error }));
};
const modifierImageGalerie = (req, res) => {
    services_1.default.modifierImageGalerie(req.body)
        .then((result) => res.status(200).send({ status: 1, data: result }))
        .catch((error) => res.status(400).send({ status: 0, error: (error === null || error === void 0 ? void 0 : error.message) || error }));
};
const definirCouvertureGalerie = (req, res) => {
    services_1.default.definirCouvertureGalerie(req.body)
        .then((result) => res.status(200).send({ status: 1, data: result }))
        .catch((error) => res.status(400).send({ status: 0, error: (error === null || error === void 0 ? void 0 : error.message) || error }));
};
const supprimerImageGalerie = (req, res) => {
    const { idGalerieImage, idUtilisateur } = req.body;
    services_1.default.supprimerImageGalerie(Number(idGalerieImage), idUtilisateur ? Number(idUtilisateur) : undefined)
        .then((result) => res.status(200).send({ status: 1, data: result }))
        .catch((error) => res.status(400).send({ status: 0, error: (error === null || error === void 0 ? void 0 : error.message) || error }));
};
const telechargerGalerie = (req, res) => {
    const { idGalerie } = req.params;
    const idUtilisateur = req.query.idUtilisateur ? Number(req.query.idUtilisateur) : undefined;
    services_1.default.buildGalerieZip(Number(idGalerie), idUtilisateur)
        .then(({ filePath, fileName }) => {
        res.download(filePath, fileName, (error) => {
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
            if (error) {
                console.error("Erreur telechargement galerie:", error);
            }
        });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (error === null || error === void 0 ? void 0 : error.message) || error }));
};
exports.default = {
    ajouterGalerie,
    recupGaleriesByUtilisateur,
    modifierGalerie,
    supprimerGalerie,
    recupImagesGalerie,
    ajouterImagesGalerie,
    modifierImageGalerie,
    definirCouvertureGalerie,
    supprimerImageGalerie,
    telechargerGalerie,
};
//# sourceMappingURL=controllers.js.map