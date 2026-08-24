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
// Ajoute une ligne de programme et previent les autres postes connectes
// (evenement socket.io "programmeEgliseModifie") pour qu'ils rafraichissent
// leur liste sans avoir a recharger la page.
const ajouterProgrammeEglise = (req, res) => {
    services_1.default
        .ajouterProgrammeEglise(req.body)
        .then((result) => {
        req.io.emit('programmeEgliseModifie', result);
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({
        status: 0,
        error,
        message: (error === null || error === void 0 ? void 0 : error.message) || "Erreur lors de l'ajout du programme.",
    }));
};
// Modifie une ligne de programme existante.
const modifierProgrammeEglise = (req, res) => {
    services_1.default
        .modifierProgrammeEglise(req.body)
        .then((result) => {
        req.io.emit('programmeEgliseModifie', result);
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({
        status: 0,
        error,
        message: (error === null || error === void 0 ? void 0 : error.message) || 'Erreur lors de la modification du programme.',
    }));
};
// Retire une ligne du programme.
const supprimerProgrammeEglise = (req, res) => {
    const { idProgramme, idUtilisateur } = req.body;
    services_1.default
        .supprimerProgrammeEglise(idProgramme, idUtilisateur)
        .then((result) => {
        req.io.emit('programmeEgliseModifie', { idUtilisateur });
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
// Renvoie tout le programme d'une eglise, trie par date.
const recupProgrammesEgliseByUtilisateur = (req, res) => {
    const { idUtilisateur } = req.params;
    services_1.default
        .recupProgrammesEgliseByUtilisateur(Number(idUtilisateur))
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
exports.default = {
    ajouterProgrammeEglise,
    modifierProgrammeEglise,
    supprimerProgrammeEglise,
    recupProgrammesEgliseByUtilisateur,
};
//# sourceMappingURL=controllers.js.map