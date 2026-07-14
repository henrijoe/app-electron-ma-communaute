"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = __importDefault(require("./services"));
const ajouterFamilleJeunesse = (req, res) => {
    services_1.default
        .ajouterFamilleJeunesse(req.body)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
const recupFamilleJeunesse = (req, res) => {
    services_1.default
        .recupFamilleJeunesse()
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
const recupFamilleJeunesseByIdUtilisateur = (req, res) => {
    services_1.default
        .recupFamilleJeunesseByIdUtilisateur(req.params.idUtilisateur)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
const supprimerFamilleJeunesse = (req, res) => {
    const { idFamilleJeunesse, idUtilisateur } = req.body;
    services_1.default
        .supprimerFamilleJeunesse(idFamilleJeunesse, idUtilisateur)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
const modifierFamilleJeunesse = (req, res) => {
    services_1.default
        .modifierFamilleJeunesse(req.body)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
exports.default = {
    ajouterFamilleJeunesse,
    modifierFamilleJeunesse,
    recupFamilleJeunesse,
    recupFamilleJeunesseByIdUtilisateur,
    supprimerFamilleJeunesse,
};
//# sourceMappingURL=controllers.js.map