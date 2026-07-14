"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = __importDefault(require("./services"));
const ajouterResponsabilite = (req, res) => {
    const data = req.body;
    const io = req.io;
    services_1.default
        .ajouterResponsabilite(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
/**
 * Récupérer une departement
 * @returns
 */
const recupResponsabilite = (req, res) => {
    services_1.default
        .recupResponsabilite()
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
const supprimerResponsabilite = (req, res) => {
    const { idResponsabilite } = req.body;
    services_1.default
        .supprimerResponsabilite(idResponsabilite)
        .then((result) => {
        if (result) {
            res.status(200).send({ status: 1, data: result });
        }
        else {
            res.status(400).send({ status: 0, errors: 'Responsabilité non trouvé' });
        }
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
const modifierResponsabilite = (req, res) => {
    const data = req.body;
    services_1.default
        .modifierResponsabilite(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
exports.default = {
    ajouterResponsabilite,
    recupResponsabilite,
    supprimerResponsabilite,
    modifierResponsabilite,
};
//# sourceMappingURL=controllers.js.map