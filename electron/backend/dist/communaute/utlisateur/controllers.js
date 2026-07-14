"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = __importDefault(require("./services"));
const functions_1 = require("../functions");
const ajouterUtilisateur = (req, res) => {
    const data = req.body;
    services_1.default
        .ajouterUtilisateur(data)
        .then((result) => {
        req.io.emit('ajouterUtilisateur', result);
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
const creerBaseSqlite = (req, res) => {
    const data = req.body;
    services_1.default
        .creerBaseSqlite(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
const recupUtilisateur = (req, res) => {
    services_1.default
        .recupUtilisateur()
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
const recupUtilisateurByParentId = (req, res) => {
    services_1.default
        .recupUtilisateurByParentId(Number(req.params.idUtilisateurParent || 0))
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
const supprimerUtilisateur = (req, res) => {
    const { idUtilisateur } = req.body;
    services_1.default
        .supprimerUtilisateur(idUtilisateur)
        .then((result) => {
        if (result) {
            req.io.emit('supprimerUtilisateur', result);
            res.status(200).send({ status: 1, data: result });
        }
        else {
            res.status(400).send({ status: 0, errors: 'Utilisateur non trouve' });
        }
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
const modifierUtilisateur = (req, res) => {
    const data = req.body;
    services_1.default
        .modifierUtilisateur(data)
        .then((result) => {
        const synchronizedResult = Object.assign(Object.assign({}, result), { __syncAt: Date.now() });
        req.io.emit('modifierUtilisateur', synchronizedResult);
        res.status(200).send({ status: 1, data: synchronizedResult });
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
const demanderResetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield services_1.default.requestPasswordReset(req.body);
        res.status(200).send({ status: 1, data: result });
    }
    catch (error) {
        console.error(error);
        res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) });
    }
});
const reinitialiserPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield services_1.default.resetPassword(req.body);
        res.status(200).send({ status: 1, data: result });
    }
    catch (error) {
        console.error(error);
        res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) });
    }
});
const connexionUtilisateur = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nomUtilisateur, motDePasse } = req.body;
        const utilisateur = yield services_1.default.connexionUtilisateur(nomUtilisateur, motDePasse);
        res.status(200).send({ status: 1, data: utilisateur });
    }
    catch (error) {
        console.error(error);
        res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) });
    }
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const result = yield services_1.default.login(data);
        res.status(200).send({ status: 1, data: result });
    }
    catch (error) {
        console.error(error);
        res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) });
    }
});
exports.default = {
    ajouterUtilisateur,
    creerBaseSqlite,
    recupUtilisateur,
    recupUtilisateurByParentId,
    supprimerUtilisateur,
    modifierUtilisateur,
    demanderResetPassword,
    reinitialiserPassword,
    connexionUtilisateur,
    login,
};
//# sourceMappingURL=controllers.js.map