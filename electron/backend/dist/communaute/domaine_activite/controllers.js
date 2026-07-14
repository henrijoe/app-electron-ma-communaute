"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = __importDefault(require("./services"));
const ajouterDomaineActivite = (req, res) => {
    const data = req.body;
    const io = req.io;
    services_1.default
        .ajouterDomaineActivite(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
const obtenirDomaineActivite = (req, res) => {
    services_1.default
        .obtenirDomaineActivite()
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
const supprimerDomaineActivite = (req, res) => {
    const { idDomaineActivite } = req.body;
    services_1.default
        .supprimerDomaineActivite(idDomaineActivite)
        .then((result) => {
        if (result) {
            res.status(200).send({ status: 1, data: result });
        }
        else {
            res.status(400).send({ status: 0, errors: 'Domaine non trouvé' });
        }
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
const modifierDomaineActivite = (req, res) => {
    const data = req.body;
    services_1.default
        .modifierDomaineActivite(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
exports.default = {
    ajouterDomaineActivite,
    obtenirDomaineActivite,
    supprimerDomaineActivite,
    modifierDomaineActivite
};
//# sourceMappingURL=controllers.js.map