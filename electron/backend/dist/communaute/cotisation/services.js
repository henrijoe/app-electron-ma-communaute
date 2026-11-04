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
const functions_1 = __importDefault(require("./functions"));
// Autres cotisations de l'église : Caisse de Noël, solidarité veuves et orphelins...
// Le nom est saisi librement, et chaque ligne dit quel membre a donné combien.
// Les totaux se calculent à l'affichage, pour suivre la recherche et la période.
const MONTANT_MAXIMUM = 1000000000;
const nettoyer = (valeur) => String(valeur !== null && valeur !== void 0 ? valeur : "").trim();
const preparer = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const idUtilisateur = Number(data.idUtilisateur);
    const idMembre = Number(data.idMembre);
    const montantVersement = Number(data.montantVersement);
    const nomCotisation = nettoyer(data.nomCotisation);
    const dateVersement = nettoyer(data.dateVersement);
    if (!nomCotisation) {
        throw new Error("Indiquez le nom de la cotisation.");
    }
    // Le nom vient de la fiche du membre et reste écrit sur la ligne : l'historique
    // garde qui a donné, même si la fiche disparaît un jour.
    const membre = idMembre ? yield functions_1.default.recupMembre(idMembre, idUtilisateur) : null;
    if (!membre) {
        throw new Error("Choisissez le membre qui a donné.");
    }
    if (!Number.isInteger(montantVersement) || montantVersement <= 0 || montantVersement > MONTANT_MAXIMUM) {
        throw new Error("Indiquez un montant valide, en francs, sans virgule.");
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateVersement) || Number.isNaN(new Date(dateVersement).getTime())) {
        throw new Error("Indiquez la date du versement.");
    }
    return {
        nomCotisation,
        idMembre,
        nomMembreVersement: `${membre.nomMembre || ""} ${membre.prenomMembre || ""}`.trim(),
        montantVersement,
        dateVersement,
        observationVersement: nettoyer(data.observationVersement),
        idUtilisateur,
    };
});
const recupCotisations = (idUtilisateur) => functions_1.default.recupCotisations(idUtilisateur);
const ajouterCotisation = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const cotisation = yield preparer(data);
    const idCotisation = yield functions_1.default.ajouterCotisation(cotisation);
    return functions_1.default.recupCotisation(idCotisation, cotisation.idUtilisateur);
});
const modifierCotisation = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const cotisation = yield preparer(data);
    const idCotisation = Number(data.idCotisation);
    if (!(yield functions_1.default.recupCotisation(idCotisation, cotisation.idUtilisateur))) {
        throw new Error("Cette cotisation est introuvable.");
    }
    yield functions_1.default.modifierCotisation(idCotisation, cotisation);
    return functions_1.default.recupCotisation(idCotisation, cotisation.idUtilisateur);
});
const supprimerCotisation = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const idCotisation = Number(data.idCotisation);
    yield functions_1.default.supprimerCotisation(idCotisation, Number(data.idUtilisateur));
    return { idCotisation };
});
exports.default = {
    recupCotisations,
    ajouterCotisation,
    modifierCotisation,
    supprimerCotisation,
};
//# sourceMappingURL=services.js.map