"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = __importDefault(require("./services"));
const ajouterComptablilite = (req, res) => {
    const data = req.body;
    services_1.default
        .ajouterComptablilite(data)
        .then((result) => {
        const firstRow = Array.isArray(result) ? result[0] : result;
        req.io.emit('ajouterComptabilite', {
            idUtilisateur: Number((firstRow === null || firstRow === void 0 ? void 0 : firstRow.idUtilisateur) || (data === null || data === void 0 ? void 0 : data.idUtilisateur) || 0) || null,
            idComptabilite: Number((firstRow === null || firstRow === void 0 ? void 0 : firstRow.idComptabilite) || 0) || null,
            nomComptabilite: (firstRow === null || firstRow === void 0 ? void 0 : firstRow.nomComptabilite) || (data === null || data === void 0 ? void 0 : data.nomComptabilite) || '',
            data: result,
        });
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (error === null || error === void 0 ? void 0 : error.message) || error }));
};
const recupComptabilite = (req, res) => {
    const idUtilisateur = Number(req.params.idUtilisateur || req.query.idUtilisateur || 0);
    const serviceCall = idUtilisateur > 0
        ? services_1.default.recupComptabiliteByUtilisateur(idUtilisateur)
        : services_1.default.recupComptabilite();
    serviceCall
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (error === null || error === void 0 ? void 0 : error.message) || error }));
};
const recupComptabiliteSupprimee = (req, res) => {
    const idUtilisateur = Number(req.params.idUtilisateur || req.query.idUtilisateur || 0);
    services_1.default
        .recupComptabiliteSupprimeeByUtilisateur(idUtilisateur)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (error === null || error === void 0 ? void 0 : error.message) || error }));
};
const supprimerComptabilite = (req, res) => {
    var _a, _b, _c;
    const idComptabilite = Number(((_a = req.body) === null || _a === void 0 ? void 0 : _a.idComptabilite) || req.params.id);
    const supprimeParUtilisateur = Number(((_b = req.body) === null || _b === void 0 ? void 0 : _b.idUtilisateur) || 0) || null;
    const motifSuppressionComptabilite = ((_c = req.body) === null || _c === void 0 ? void 0 : _c.motifSuppressionComptabilite) || null;
    services_1.default
        .supprimerComptabilite(idComptabilite, supprimeParUtilisateur, motifSuppressionComptabilite)
        .then((result) => {
        req.io.emit('supprimerComptabilite', result);
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (error === null || error === void 0 ? void 0 : error.message) || error }));
};
const restaurerComptabilite = (req, res) => {
    var _a;
    const idComptabilite = Number(((_a = req.body) === null || _a === void 0 ? void 0 : _a.idComptabilite) || req.params.id);
    services_1.default
        .restaurerComptabilite(idComptabilite)
        .then((result) => {
        req.io.emit('restaurerComptabilite', result);
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (error === null || error === void 0 ? void 0 : error.message) || error }));
};
const supprimerComptabiliteDefinitivement = (req, res) => {
    var _a, _b, _c;
    const idComptabilite = Number(((_a = req.body) === null || _a === void 0 ? void 0 : _a.idComptabilite) || req.params.id);
    const nomUtilisateur = ((_b = req.body) === null || _b === void 0 ? void 0 : _b.nomUtilisateur) || ((_c = req.query) === null || _c === void 0 ? void 0 : _c.nomUtilisateur) || '';
    services_1.default
        .supprimerComptabiliteDefinitivement(idComptabilite, nomUtilisateur)
        .then((result) => {
        req.io.emit('supprimerComptabiliteDefinitivement', result);
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (error === null || error === void 0 ? void 0 : error.message) || error }));
};
const modifierComptabilite = (req, res) => {
    var _a;
    const data = Object.assign(Object.assign({}, req.body), { idComptabilite: Number(((_a = req.body) === null || _a === void 0 ? void 0 : _a.idComptabilite) || req.params.id) });
    services_1.default
        .modifierComptabilite(data)
        .then((result) => {
        const firstRow = Array.isArray(result) ? result[0] : result;
        req.io.emit('modifierComptabilite', {
            idUtilisateur: Number((firstRow === null || firstRow === void 0 ? void 0 : firstRow.idUtilisateur) || (data === null || data === void 0 ? void 0 : data.idUtilisateur) || 0) || null,
            idComptabilite: Number((firstRow === null || firstRow === void 0 ? void 0 : firstRow.idComptabilite) || (data === null || data === void 0 ? void 0 : data.idComptabilite) || 0) || null,
            nomComptabilite: (firstRow === null || firstRow === void 0 ? void 0 : firstRow.nomComptabilite) || (data === null || data === void 0 ? void 0 : data.nomComptabilite) || '',
            data: result,
        });
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (error === null || error === void 0 ? void 0 : error.message) || error }));
};
exports.default = {
    ajouterComptablilite,
    recupComptabilite,
    recupComptabiliteSupprimee,
    supprimerComptabilite,
    restaurerComptabilite,
    supprimerComptabiliteDefinitivement,
    modifierComptabilite,
};
//# sourceMappingURL=controllers.js.map