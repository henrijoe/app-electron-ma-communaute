"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = __importDefault(require("./services"));
const ajouterCellule = (req, res) => {
    const data = req.body;
    services_1.default
        .ajouterCellule(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => {
        var _a;
        if ((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes("Cette cellule existe deja.")) {
            res.status(400).send({ status: 0, error: error.message });
        }
        else {
            res.status(400).send({ status: 0, error });
        }
    });
};
const recupCellule = (req, res) => {
    services_1.default
        .recupCellule()
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
const supprimerCellule = (req, res) => {
    const { idCellule, idUtilisateur } = req.body;
    services_1.default
        .supprimerCellule(idCellule, idUtilisateur)
        .then((result) => {
        if (result) {
            res.status(200).send({ status: 1, data: result });
        }
        else {
            res.status(400).send({ status: 0, errors: "Cellule non trouvee" });
        }
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
const modifierCellule = (req, res) => {
    const data = req.body;
    services_1.default
        .modifierCellule(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
const recupCelluleByIdUtilsateur = (req, res) => {
    const { idUtilisateur } = req.params;
    services_1.default
        .recupCelluleByIdUtilsateur(idUtilisateur)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
exports.default = {
    recupCellule,
    ajouterCellule,
    supprimerCellule,
    modifierCellule,
    recupCelluleByIdUtilsateur,
};
//# sourceMappingURL=controllers.js.map