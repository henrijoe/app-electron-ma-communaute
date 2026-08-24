"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = __importDefault(require("./services"));
// Ce fichier fait le lien entre les routes HTTP (voir routes.ts) et la
// logique metier (services.ts -> functions.ts) : chaque fonction lit la
// requete, appelle le service correspondant, puis renvoie une reponse
// JSON standard { status, data } ou { status: 0, error }.
// Ajoute un verset programme et previent les autres postes connectes
// (evenement socket.io "versetProgrammeModifie") pour qu'ils rafraichissent
// leur liste sans avoir a recharger la page.
const ajouterVersetProgramme = (req, res) => {
    services_1.default
        .ajouterVersetProgramme(req.body)
        .then((result) => {
        req.io.emit('versetProgrammeModifie', result);
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({
        status: 0,
        error,
        message: (error === null || error === void 0 ? void 0 : error.message) || "Erreur lors de l'ajout du verset.",
    }));
};
// Modifie un verset existant (date, reference ou texte).
const modifierVersetProgramme = (req, res) => {
    services_1.default
        .modifierVersetProgramme(req.body)
        .then((result) => {
        req.io.emit('versetProgrammeModifie', result);
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({
        status: 0,
        error,
        message: (error === null || error === void 0 ? void 0 : error.message) || 'Erreur lors de la modification du verset.',
    }));
};
// Retire un verset du programme.
const supprimerVersetProgramme = (req, res) => {
    const { idVersetProgramme, idUtilisateur } = req.body;
    services_1.default
        .supprimerVersetProgramme(idVersetProgramme, idUtilisateur)
        .then((result) => {
        req.io.emit('versetProgrammeModifie', { idUtilisateur });
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
// Renvoie tous les versets programmes d'une eglise, tries par date.
const recupVersetsProgrammeByUtilisateur = (req, res) => {
    const { idUtilisateur } = req.params;
    services_1.default
        .recupVersetsProgrammeByUtilisateur(Number(idUtilisateur))
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
exports.default = {
    ajouterVersetProgramme,
    modifierVersetProgramme,
    supprimerVersetProgramme,
    recupVersetsProgrammeByUtilisateur,
};
//# sourceMappingURL=controllers.js.map