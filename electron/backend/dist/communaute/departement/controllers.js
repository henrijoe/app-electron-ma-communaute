"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = __importDefault(require("./services"));
const ajouterDepartement = (req, res) => {
    const data = req.body;
    services_1.default
        .ajouterDepartement(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => {
        var _a;
        if ((_a = error === null || error === void 0 ? void 0 : error.message) === null || _a === void 0 ? void 0 : _a.includes('Ce département existe déjà.')) {
            res.status(400).send({ status: 0, error: error.message });
        }
        else {
            res.status(400).send({ status: 0, error });
        }
    });
};
/**
 * RÃ©cupÃ©rer une departement
 * @returns
 */
const recupDepartement = (req, res) => {
    services_1.default
        .recupDepartement()
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
const recupDepartementByIdUtilsateur = (req, res) => {
    const { idUtilisateur } = req === null || req === void 0 ? void 0 : req.params;
    services_1.default
        .recupDepartementByIdUtilsateur(idUtilisateur)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
const supprimerDepartement = (req, res) => {
    const { idDepartement, idUtilisateur } = req.body;
    if (!idUtilisateur) {
        return res.status(400).send({ status: 0, error: 'idUtilisateur requis' });
    }
    services_1.default
        .supprimerDepartement(idDepartement, idUtilisateur)
        .then((result) => {
        if (result) {
            res.status(200).send({ status: 1, data: result });
        }
        else {
            res.status(400).send({ status: 0, error: 'Departement non trouve' });
        }
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
const modifierDepartement = (req, res) => {
    const data = req.body;
    // console.log("modifierDepartement data:", data)
    services_1.default
        .modifierDepartement(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
exports.default = {
    ajouterDepartement,
    recupDepartement,
    supprimerDepartement,
    modifierDepartement,
    recupDepartementByIdUtilsateur
};
//# sourceMappingURL=controllers.js.map