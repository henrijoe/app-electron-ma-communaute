"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = __importDefault(require("./services"));
const ajouterGroupe = (req, res) => {
    const data = req.body;
    services_1.default
        .ajouterGroupe(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
const recupGroupe = (req, res) => {
    services_1.default
        .recupGroupe()
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
const recupGroupeByIdUtilsateur = (req, res) => {
    const { idUtilisateur } = req.params;
    services_1.default
        .recupGroupeByIdUtilsateur(idUtilisateur)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
const supprimerGroupe = (req, res) => {
    const { idGroupe, idUtilisateur } = req.body;
    services_1.default
        .supprimerGroupe(idGroupe, idUtilisateur)
        .then((result) => {
        if (result) {
            res.status(200).send({ status: 1, data: result });
        }
        else {
            res.status(400).send({ status: 0, errors: "Groupe non trouve" });
        }
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
const modifierGroupe = (req, res) => {
    const data = req.body;
    services_1.default
        .modifierGroupe(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
exports.default = {
    ajouterGroupe,
    recupGroupe,
    supprimerGroupe,
    modifierGroupe,
    recupGroupeByIdUtilsateur,
};
//# sourceMappingURL=controllers.js.map