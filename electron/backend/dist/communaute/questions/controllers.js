"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = __importDefault(require("./services"));
const ajouterQuestion = (req, res) => {
    const data = req.body;
    console.log("🚀 ~ file: controllers.ts:7 ~ ajouterQuestion ~ data:", data);
    const io = req.io;
    services_1.default
        .ajouterQuestion(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
/**
 * Récupérer une cellule
 * @returns
 */
const recupQuestion = (req, res) => {
    services_1.default
        .recupQuestion()
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
const supprimerQuestion = (req, res) => {
    const { idQuestion } = req.body;
    services_1.default
        .supprimerQuestion(idQuestion)
        .then((result) => {
        if (result) {
            res.status(200).send({ status: 1, data: result });
        }
        else {
            res.status(400).send({ status: 0, errors: 'Question non trouvée' });
        }
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
const modifierQuestion = (req, res) => {
    const data = req.body;
    services_1.default
        .modifierQuestion(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
exports.default = {
    recupQuestion,
    ajouterQuestion,
    supprimerQuestion,
    modifierQuestion,
};
//# sourceMappingURL=controllers.js.map