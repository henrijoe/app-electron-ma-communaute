"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = __importDefault(require("./services"));
const ajouterEglise = (req, res) => {
    const data = req.body;
    const io = req.io;
    services_1.default
        .ajouterEglise(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
/**
 * Récupérer une eglise
 * @returns
 */
const recupEglise = (req, res) => {
    services_1.default
        .recupEglise()
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
const supprimerEglise = (req, res) => {
    const { idEglise } = req.body;
    services_1.default
        .supprimerEglise(idEglise)
        .then((result) => {
        if (result) {
            res.status(200).send({ status: 1, data: result });
        }
        else {
            res.status(400).send({ status: 0, errors: 'Eglise non trouvé' });
        }
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
const modifierEglise = (req, res) => {
    const data = req.body;
    services_1.default
        .modifierEglise(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
exports.default = {
    recupEglise,
    ajouterEglise,
    supprimerEglise,
    modifierEglise,
};
//# sourceMappingURL=controllers.js.map