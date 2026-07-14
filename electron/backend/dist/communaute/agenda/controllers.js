"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = __importDefault(require("./services"));
const ajouterAgenda = (req, res) => {
    const data = req.body;
    services_1.default
        .ajouterAgenda(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (error === null || error === void 0 ? void 0 : error.message) || error }));
};
const supprimerAgenda = (req, res) => {
    const { idAgenda } = req.body;
    services_1.default
        .supprimerAgenda(idAgenda)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((errors) => res.status(400).send({ status: 0, errors: (errors === null || errors === void 0 ? void 0 : errors.message) || errors }));
};
const modifierAgenda = (req, res) => {
    const data = req.body;
    services_1.default
        .modifierAgenda(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((errors) => res.status(400).send({ status: 0, errors: (errors === null || errors === void 0 ? void 0 : errors.message) || errors }));
};
const recupAgendaByIdUtilsateur = (req, res) => {
    const { idUtilisateur } = req.params;
    services_1.default
        .recupAgendaByIdUtilsateur(idUtilisateur)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (error === null || error === void 0 ? void 0 : error.message) || error }));
};
exports.default = {
    ajouterAgenda,
    supprimerAgenda,
    modifierAgenda,
    recupAgendaByIdUtilsateur,
};
//# sourceMappingURL=controllers.js.map