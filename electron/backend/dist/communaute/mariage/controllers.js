"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = __importDefault(require("./services"));
const ajouterMariage = (req, res) => {
    const data = req.body;
    console.log("🚀 ~ ajouterMariage ~ data:", data);
    const io = req.io;
    services_1.default
        .ajouterMariage(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => {
        if (error.message.includes('Ce mariage existe déjà.')) {
            res.status(400).send({ status: 0, error: error.message });
        }
        else {
            res.status(400).send({ status: 0, error });
        }
    });
};
/**
 * Récupérer une mariage
 * @returns
 */
const recupMariage = (req, res) => {
    services_1.default
        .recupMariage()
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
const supprimerMariage = (req, res) => {
    const { idMariage } = req.body;
    services_1.default
        .supprimerMariage(idMariage)
        .then((result) => {
        if (result) {
            res.status(200).send({ status: 1, data: result });
        }
        else {
            res.status(400).send({ status: 0, errors: 'Mariage non trouvé' });
        }
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
const modifierMariage = (req, res) => {
    const data = req.body;
    services_1.default
        .modifierMariage(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
const recupMariageByIdUtilsateur = (req, res) => {
    const { idUtilisateur } = req === null || req === void 0 ? void 0 : req.params;
    services_1.default
        .recupMariageByIdUtilsateur(idUtilisateur)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
exports.default = {
    recupMariage,
    ajouterMariage,
    supprimerMariage,
    modifierMariage,
    recupMariageByIdUtilsateur
};
//# sourceMappingURL=controllers.js.map