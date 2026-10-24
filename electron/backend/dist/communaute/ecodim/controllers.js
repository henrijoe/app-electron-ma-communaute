"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("../functions");
const functions_2 = __importDefault(require("./functions"));
// Les écritures préviennent les autres postes connectés, comme les autres modules.
const diffuser = (req, evenement, charge) => {
    var _a;
    (_a = req.io) === null || _a === void 0 ? void 0 : _a.emit(evenement, charge);
};
const repondre = (res, promesse) => promesse
    .then((result) => res.status(200).send({ status: 1, data: result }))
    .catch((error) => res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) }));
// ----------------------------------------------------------------- classes
const recupClassesByUtilisateur = (req, res) => repondre(res, functions_2.default.recupClasses(Number(req.params.idUtilisateur)));
const ajouterClasse = (req, res) => {
    const data = req.body;
    return functions_2.default
        .ajouterClasse(data)
        .then((result) => {
        diffuser(req, "ajouterClasseEcodim", { idUtilisateur: data === null || data === void 0 ? void 0 : data.idUtilisateur, data: result });
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) }));
};
const modifierClasse = (req, res) => {
    const data = req.body;
    return functions_2.default
        .modifierClasse(data)
        .then((result) => {
        diffuser(req, "modifierClasseEcodim", { idUtilisateur: data === null || data === void 0 ? void 0 : data.idUtilisateur, data: result });
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) }));
};
const supprimerClasse = (req, res) => {
    const { idClasseEcodim, idUtilisateur } = req.body;
    return functions_2.default
        .supprimerClasse(Number(idClasseEcodim), Number(idUtilisateur))
        .then((result) => {
        diffuser(req, "supprimerClasseEcodim", { idUtilisateur, idClasseEcodim });
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) }));
};
// --------------------------------------------------------------- moniteurs
const recupMoniteursByUtilisateur = (req, res) => repondre(res, functions_2.default.recupMoniteurs(Number(req.params.idUtilisateur)));
const ajouterMoniteur = (req, res) => {
    const data = req.body;
    return functions_2.default
        .ajouterMoniteur(data)
        .then((result) => {
        diffuser(req, "ajouterMoniteurEcodim", { idUtilisateur: data === null || data === void 0 ? void 0 : data.idUtilisateur, data: result });
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) }));
};
const modifierMoniteur = (req, res) => {
    const data = req.body;
    return functions_2.default
        .modifierMoniteur(data)
        .then((result) => {
        diffuser(req, "modifierMoniteurEcodim", { idUtilisateur: data === null || data === void 0 ? void 0 : data.idUtilisateur, data: result });
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) }));
};
const supprimerMoniteur = (req, res) => {
    const { idMoniteur, idUtilisateur } = req.body;
    return functions_2.default
        .supprimerMoniteur(Number(idMoniteur), Number(idUtilisateur))
        .then((result) => {
        diffuser(req, "supprimerMoniteurEcodim", { idUtilisateur, idMoniteur });
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) }));
};
// ----------------------------------------------------------------- enfants
const recupEnfantsByUtilisateur = (req, res) => repondre(res, functions_2.default.recupEnfants(Number(req.params.idUtilisateur)));
const ajouterEnfant = (req, res) => {
    const data = req.body;
    return functions_2.default
        .ajouterEnfant(data)
        .then((result) => {
        diffuser(req, "ajouterEnfantEcodim", { idUtilisateur: data === null || data === void 0 ? void 0 : data.idUtilisateur, data: result });
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) }));
};
const modifierEnfant = (req, res) => {
    const data = req.body;
    return functions_2.default
        .modifierEnfant(data)
        .then((result) => {
        diffuser(req, "modifierEnfantEcodim", { idUtilisateur: data === null || data === void 0 ? void 0 : data.idUtilisateur, data: result });
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) }));
};
const supprimerEnfant = (req, res) => {
    const { idEnfantEcodim, idUtilisateur } = req.body;
    return functions_2.default
        .supprimerEnfant(Number(idEnfantEcodim), Number(idUtilisateur))
        .then((result) => {
        diffuser(req, "supprimerEnfantEcodim", { idUtilisateur, idEnfantEcodim });
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) }));
};
// --------------------------------------------------------------- activités
const recupActivitesByUtilisateur = (req, res) => repondre(res, functions_2.default.recupActivites(Number(req.params.idUtilisateur)));
const ajouterActivite = (req, res) => {
    const data = req.body;
    return functions_2.default
        .ajouterActivite(data)
        .then((result) => {
        diffuser(req, "ajouterActiviteEcodim", { idUtilisateur: data === null || data === void 0 ? void 0 : data.idUtilisateur, data: result });
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) }));
};
const modifierActivite = (req, res) => {
    const data = req.body;
    return functions_2.default
        .modifierActivite(data)
        .then((result) => {
        diffuser(req, "modifierActiviteEcodim", { idUtilisateur: data === null || data === void 0 ? void 0 : data.idUtilisateur, data: result });
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) }));
};
const supprimerActivite = (req, res) => {
    const { idActiviteEcodim, idUtilisateur } = req.body;
    return functions_2.default
        .supprimerActivite(Number(idActiviteEcodim), Number(idUtilisateur))
        .then((result) => {
        diffuser(req, "supprimerActiviteEcodim", { idUtilisateur, idActiviteEcodim });
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) }));
};
// ------------------------------------------------------------------ médias
const enregistrerPhotoEnfant = (req, res) => {
    const data = req.body;
    return functions_2.default
        .enregistrerPhotoEnfant({
        idEnfantEcodim: Number(data === null || data === void 0 ? void 0 : data.idEnfantEcodim),
        idUtilisateur: Number(data === null || data === void 0 ? void 0 : data.idUtilisateur),
        photo: String((data === null || data === void 0 ? void 0 : data.photo) || ""),
    })
        .then((fichier) => {
        diffuser(req, "modifierEnfantEcodim", { idUtilisateur: data === null || data === void 0 ? void 0 : data.idUtilisateur });
        res.status(200).send({ status: 1, data: { photoEnfant: fichier } });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) }));
};
const recupImagesActivite = (req, res) => repondre(res, functions_2.default.recupImagesActivite(Number(req.params.idActiviteEcodim), Number(req.query.idUtilisateur)));
const ajouterImageActivite = (req, res) => {
    const data = req.body;
    return functions_2.default
        .ajouterImageActivite({
        idActiviteEcodim: Number(data === null || data === void 0 ? void 0 : data.idActiviteEcodim),
        idUtilisateur: Number(data === null || data === void 0 ? void 0 : data.idUtilisateur),
        image: String((data === null || data === void 0 ? void 0 : data.image) || ""),
        legende: data === null || data === void 0 ? void 0 : data.legende,
    })
        .then((fichier) => {
        diffuser(req, "ajouterImageActiviteEcodim", { idUtilisateur: data === null || data === void 0 ? void 0 : data.idUtilisateur });
        res.status(200).send({ status: 1, data: { fichierImage: fichier } });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) }));
};
const supprimerImageActivite = (req, res) => {
    const { idImageActivite, idUtilisateur } = req.body;
    return functions_2.default
        .supprimerImageActivite(Number(idImageActivite), Number(idUtilisateur))
        .then((result) => {
        diffuser(req, "supprimerImageActiviteEcodim", { idUtilisateur });
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) }));
};
// ------------------------------------------------------------------ cultes
const recupCultesByUtilisateur = (req, res) => repondre(res, functions_2.default.recupCultes(Number(req.params.idUtilisateur)));
const ajouterCulte = (req, res) => {
    const data = req.body;
    return functions_2.default
        .ajouterCulte(data)
        .then((result) => {
        diffuser(req, "ajouterCulteEcodim", { idUtilisateur: data === null || data === void 0 ? void 0 : data.idUtilisateur, data: result });
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) }));
};
const modifierCulte = (req, res) => {
    const data = req.body;
    return functions_2.default
        .modifierCulte(data)
        .then((result) => {
        diffuser(req, "modifierCulteEcodim", { idUtilisateur: data === null || data === void 0 ? void 0 : data.idUtilisateur, data: result });
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) }));
};
const supprimerCulte = (req, res) => {
    const { idCulteEcodim, idUtilisateur } = req.body;
    return functions_2.default
        .supprimerCulte(Number(idCulteEcodim), Number(idUtilisateur))
        .then((result) => {
        diffuser(req, "supprimerCulteEcodim", { idUtilisateur, idCulteEcodim });
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) }));
};
// ------------------------------------------------------------- évaluations
const recupEvaluationsByUtilisateur = (req, res) => repondre(res, functions_2.default.recupEvaluations(Number(req.params.idUtilisateur)));
const ajouterEvaluation = (req, res) => {
    const data = req.body;
    return functions_2.default
        .ajouterEvaluation(data)
        .then((result) => {
        diffuser(req, "ajouterEvaluationEcodim", { idUtilisateur: data === null || data === void 0 ? void 0 : data.idUtilisateur, data: result });
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) }));
};
const modifierEvaluation = (req, res) => {
    const data = req.body;
    return functions_2.default
        .modifierEvaluation(data)
        .then((result) => {
        diffuser(req, "modifierEvaluationEcodim", { idUtilisateur: data === null || data === void 0 ? void 0 : data.idUtilisateur, data: result });
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) }));
};
const supprimerEvaluation = (req, res) => {
    const { idEvaluation, idUtilisateur } = req.body;
    return functions_2.default
        .supprimerEvaluation(Number(idEvaluation), Number(idUtilisateur))
        .then((result) => {
        diffuser(req, "supprimerEvaluationEcodim", { idUtilisateur, idEvaluation });
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) }));
};
const recupNotesByUtilisateur = (req, res) => repondre(res, functions_2.default.recupNotes(Number(req.params.idUtilisateur)));
const enregistrerNotes = (req, res) => {
    const data = req.body;
    return functions_2.default
        .enregistrerNotes({ idUtilisateur: Number(data === null || data === void 0 ? void 0 : data.idUtilisateur), notes: data === null || data === void 0 ? void 0 : data.notes })
        .then((result) => {
        diffuser(req, "enregistrerNotesEcodim", { idUtilisateur: data === null || data === void 0 ? void 0 : data.idUtilisateur });
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) }));
};
exports.default = {
    recupClassesByUtilisateur,
    ajouterClasse,
    modifierClasse,
    supprimerClasse,
    recupMoniteursByUtilisateur,
    ajouterMoniteur,
    modifierMoniteur,
    supprimerMoniteur,
    recupEnfantsByUtilisateur,
    ajouterEnfant,
    modifierEnfant,
    supprimerEnfant,
    recupActivitesByUtilisateur,
    ajouterActivite,
    modifierActivite,
    supprimerActivite,
    enregistrerPhotoEnfant,
    recupImagesActivite,
    ajouterImageActivite,
    supprimerImageActivite,
    recupCultesByUtilisateur,
    ajouterCulte,
    modifierCulte,
    supprimerCulte,
    recupEvaluationsByUtilisateur,
    ajouterEvaluation,
    modifierEvaluation,
    supprimerEvaluation,
    recupNotesByUtilisateur,
    enregistrerNotes,
};
//# sourceMappingURL=controllers.js.map