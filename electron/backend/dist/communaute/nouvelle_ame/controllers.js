"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = __importDefault(require("./services"));
const ajouterNouvelleAme = (req, res) => {
    const data = req.body;
    const io = req.io;
    services_1.default
        .ajouterNouvelleAme(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
/**
 * Récupérer un membre
 * @returns
 */
const recupNouvelleAme = (req, res) => {
    services_1.default
        .recupNouvelleAme()
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
const supprimerNouvelleAme = (req, res) => {
    const { idNouvelleAme } = req.body;
    services_1.default
        .supprimerNouvelleAme(idNouvelleAme)
        .then((result) => {
        if (result) {
            res.status(200).send({ status: 1, data: result });
        }
        else {
            res.status(400).send({ status: 0, errors: 'membre non trouvé' });
        }
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
const modifierNouvelleAme = (req, res) => {
    const data = req.body;
    services_1.default
        .modifierNouvelleAme(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
exports.default = {
    recupNouvelleAme,
    ajouterNouvelleAme,
    supprimerNouvelleAme,
    modifierNouvelleAme,
};
//# sourceMappingURL=controllers.js.map