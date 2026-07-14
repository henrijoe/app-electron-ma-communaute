"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = __importDefault(require("./services"));
/**
 * Récupérer un membre
 * @returns
 */
const obtenirIdNiveauEtude = (req, res) => {
    services_1.default
        .obtenirIdNiveauEtude()
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
const ajouterNiveauEtude = (req, res) => {
    const data = req.body;
    const io = req.io;
    services_1.default
        .ajouterNiveauEtude(data)
        .then((result) => {
        if (result) {
            res.status(200).send({ status: 1, data: result });
        }
        else {
            res.status(400).send({ status: 0, errors: 'Niveau non ajouter' });
        }
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
const supprimerNiveau = (req, res) => {
    const { idNiveauEtude } = req.body;
    services_1.default
        .supprimerNiveau(idNiveauEtude)
        .then((result) => {
        if (result) {
            res.status(200).send({ status: 1, data: result });
        }
        else {
            res.status(400).send({ status: 0, errors: 'Niveau non trouvé' });
        }
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
const modifierNiveau = (req, res) => {
    const data = req.body;
    services_1.default
        .modifierNiveau(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
exports.default = {
    obtenirIdNiveauEtude,
    ajouterNiveauEtude,
    supprimerNiveau,
    modifierNiveau
};
//# sourceMappingURL=controllers.js.map