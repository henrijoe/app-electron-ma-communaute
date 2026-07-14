"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = __importDefault(require("./services"));
const ajouterMaladie = (req, res) => {
    const data = req.body;
    services_1.default
        .ajouterMaladie(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => {
        var _a;
        if ((_a = error === null || error === void 0 ? void 0 : error.message) === null || _a === void 0 ? void 0 : _a.includes('Ce cas de maladie existe deja.')) {
            res.status(400).send({ status: 0, error: error.message });
        }
        else {
            res.status(400).send({ status: 0, error });
        }
    });
};
const recupMaladie = (req, res) => {
    services_1.default
        .recupMaladie()
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
const supprimerMaladie = (req, res) => {
    const { idMaladie } = req.body;
    services_1.default
        .supprimerMaladie(idMaladie)
        .then((result) => {
        if (result) {
            res.status(200).send({ status: 1, data: result });
        }
        else {
            res.status(400).send({ status: 0, errors: 'Maladie non trouvee' });
        }
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
const modifierMaladie = (req, res) => {
    const data = req.body;
    services_1.default
        .modifierMaladie(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
const recupMaladieByIdUtilsateur = (req, res) => {
    const { idUtilisateur } = req.params;
    services_1.default
        .recupMaladieByIdUtilsateur(idUtilisateur)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
exports.default = {
    ajouterMaladie,
    recupMaladie,
    supprimerMaladie,
    modifierMaladie,
    recupMaladieByIdUtilsateur,
};
//# sourceMappingURL=controllers.js.map