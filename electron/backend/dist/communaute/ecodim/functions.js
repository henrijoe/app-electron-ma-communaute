"use strict";
// Accès base pour l'école du dimanche.
//
// Toutes les lectures sont bornées à idUtilisateur : une église ne voit que ses
// classes, ses moniteurs et ses enfants.
//
// Les listes renvoient volontairement des libellés joints (nom de la classe, nom du
// membre moniteur) plutôt que de simples identifiants : l'interface affiche des noms,
// et la jointure coûte bien moins qu'un aller-retour par ligne.
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
exports.rejeterDemandeEnfant = exports.validerDemandeEnfant = exports.recupDemandesEnfant = exports.ajouterDemandeEnfant = exports.enregistrerAppel = exports.recupPresences = exports.enregistrerNotes = exports.recupNotes = exports.supprimerEvaluation = exports.modifierEvaluation = exports.ajouterEvaluation = exports.recupEvaluations = exports.supprimerCulte = exports.modifierCulte = exports.ajouterCulte = exports.recupCultes = exports.supprimerActivite = exports.modifierActivite = exports.ajouterActivite = exports.recupActivites = exports.supprimerEnfant = exports.modifierEnfant = exports.ajouterEnfant = exports.supprimerImageActivite = exports.ajouterImageActivite = exports.recupImagesActivite = exports.enregistrerPhotoEnfant = exports.recupEnfants = exports.supprimerMoniteur = exports.modifierMoniteur = exports.ajouterMoniteur = exports.recupMoniteurs = exports.recupClassesDuMoniteur = exports.supprimerClasse = exports.modifierClasse = exports.ajouterClasse = exports.recupClasses = exports.supprimerImage = exports.enregistrerImage = exports.dossierMedias = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = require("../../db");
const sqliteDB_1 = __importDefault(require("../../db/sqliteDB"));
// Les images de l'école du dimanche vivent à côté des photos de membres, dans le
// dossier de données — jamais dans la base : une photo en base64 dans une colonne
// alourdit chaque lecture de la liste, même quand on ne l'affiche pas.
const dossierMedias = () => {
    const dossier = path_1.default.join(sqliteDB_1.default.getSqliteDirectory(), "ecodim-medias");
    if (!fs_1.default.existsSync(dossier)) {
        fs_1.default.mkdirSync(dossier, { recursive: true });
    }
    return dossier;
};
exports.dossierMedias = dossierMedias;
/** Écrit une image base64 sur disque et retourne le nom de fichier à stocker. */
const enregistrerImage = (base64, prefixe) => {
    const correspondance = String(base64 || "").match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!correspondance) {
        throw new Error("Image illisible : envoyez un fichier JPG ou PNG.");
    }
    const extension = correspondance[1].toLowerCase() === "jpeg" ? "jpg" : correspondance[1].toLowerCase();
    const nomFichier = `${prefixe}-${Date.now().toString(36)}.${extension}`;
    fs_1.default.writeFileSync(path_1.default.join((0, exports.dossierMedias)(), nomFichier), Buffer.from(correspondance[2], "base64"));
    return nomFichier;
};
exports.enregistrerImage = enregistrerImage;
/** Supprime un fichier image devenu inutile, sans faire échouer l'opération. */
const supprimerImage = (nomFichier) => {
    if (!nomFichier) {
        return;
    }
    try {
        const chemin = path_1.default.join((0, exports.dossierMedias)(), nomFichier);
        if (fs_1.default.existsSync(chemin)) {
            fs_1.default.unlinkSync(chemin);
        }
    }
    catch (_error) {
        // Un fichier déjà absent ne doit pas empêcher la suppression de la ligne.
    }
};
exports.supprimerImage = supprimerImage;
const texte = (valeur) => String(valeur !== null && valeur !== void 0 ? valeur : "").trim();
const nombre = (valeur) => {
    const converti = Number(valeur);
    return Number.isFinite(converti) && texte(valeur) !== "" ? converti : null;
};
/**
 * Rattachements d'un moniteur, repris de l'ancienne colonne si besoin.
 *
 * Avant que la table de liaison n'existe, la classe du moniteur vivait dans
 * `ecodim_moniteur.idClasseEcodim`. Les lignes saisies a cette epoque n'ont
 * aucun rattachement : on les reprend a la premiere lecture, une fois, plutot
 * que de laisser ces moniteurs disparaitre de leur classe.
 */
const reprendreRattachementsAnciens = (idUtilisateur) => __awaiter(void 0, void 0, void 0, function* () {
    const aReprendre = yield (0, db_1._selectSql)(`SELECT moniteur.idMoniteur, moniteur.idClasseEcodim, moniteur.estPrincipal
       FROM ecodim_moniteur moniteur
       LEFT JOIN ecodim_moniteur_classe lien ON lien.idMoniteur = moniteur.idMoniteur
      WHERE moniteur.idUtilisateur = ?
        AND moniteur.idClasseEcodim IS NOT NULL
        AND lien.idMoniteurClasse IS NULL`, [idUtilisateur]);
    for (const ligne of Array.isArray(aReprendre) ? aReprendre : []) {
        yield (0, db_1._executeSql)(`INSERT INTO ecodim_moniteur_classe
         (idMoniteur, idClasseEcodim, estPrincipal, idUtilisateur)
       VALUES (?,?,?,?)`, [ligne.idMoniteur, ligne.idClasseEcodim, ligne.estPrincipal ? 1 : 0, idUtilisateur]);
    }
});
// ----------------------------------------------------------------- classes
/**
 * Classes d'une église, avec leurs effectifs et le nom de leur responsable.
 *
 * Le rattachement passe par `ecodim_moniteur_classe` : un moniteur peut encadrer
 * plusieurs classes, et être responsable de l'une sans l'être de l'autre.
 */
const recupClasses = (idUtilisateur) => __awaiter(void 0, void 0, void 0, function* () {
    yield reprendreRattachementsAnciens(idUtilisateur);
    const classes = yield (0, db_1._selectSql)(`SELECT classe.*,
            (SELECT COUNT(*) FROM ecodim_enfant enfant
              WHERE enfant.idClasseEcodim = classe.idClasseEcodim
                AND COALESCE(enfant.actifEnfant, 1) = 1) AS nombreEnfants,
            (SELECT COUNT(*) FROM ecodim_moniteur_classe lien
               JOIN ecodim_moniteur moniteur ON moniteur.idMoniteur = lien.idMoniteur
              WHERE lien.idClasseEcodim = classe.idClasseEcodim
                AND COALESCE(moniteur.actifMoniteur, 1) = 1) AS nombreMoniteurs,
            (SELECT lien.idMoniteur
               FROM ecodim_moniteur_classe lien
              WHERE lien.idClasseEcodim = classe.idClasseEcodim
                AND lien.estPrincipal = 1
              LIMIT 1) AS idMoniteurResponsable
       FROM ecodim_classe classe
      WHERE classe.idUtilisateur = ?
      ORDER BY classe.ageMin IS NULL, classe.ageMin ASC, classe.libelleClasse ASC`, [idUtilisateur]);
    const responsables = yield (0, db_1._selectSql)(`SELECT lien.idClasseEcodim, membre.nomMembre, membre.prenomMembre
       FROM ecodim_moniteur_classe lien
       JOIN ecodim_moniteur moniteur ON moniteur.idMoniteur = lien.idMoniteur
       LEFT JOIN membre ON membre.idMembre = moniteur.idMembre
      WHERE lien.idUtilisateur = ? AND lien.estPrincipal = 1`, [idUtilisateur]);
    return (Array.isArray(classes) ? classes : []).map((classe) => {
        const responsable = (Array.isArray(responsables) ? responsables : []).find((ligne) => Number(ligne.idClasseEcodim) === Number(classe.idClasseEcodim));
        return Object.assign(Object.assign({}, classe), { nomResponsable: responsable
                ? `${responsable.nomMembre || ''} ${responsable.prenomMembre || ''}`.trim()
                : '' });
    });
});
exports.recupClasses = recupClasses;
const ajouterClasse = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const doublon = yield (0, db_1._selectSql)("SELECT idClasseEcodim FROM ecodim_classe WHERE idUtilisateur = ? AND LOWER(libelleClasse) = LOWER(?)", [data.idUtilisateur, texte(data.libelleClasse)]);
    if (Array.isArray(doublon) && doublon.length) {
        throw new Error("Cette classe existe déjà.");
    }
    const resultat = yield (0, db_1._executeSql)(`INSERT INTO ecodim_classe
       (libelleClasse, trancheAge, ageMin, ageMax, descriptionClasse, actifClasse, idUtilisateur)
     VALUES (?,?,?,?,?,?,?)`, [
        texte(data.libelleClasse),
        texte(data.trancheAge),
        nombre(data.ageMin),
        nombre(data.ageMax),
        texte(data.descriptionClasse),
        data.actifClasse === 0 ? 0 : 1,
        data.idUtilisateur,
    ]);
    return (_b = (_a = resultat === null || resultat === void 0 ? void 0 : resultat.insertId) !== null && _a !== void 0 ? _a : resultat === null || resultat === void 0 ? void 0 : resultat.lastID) !== null && _b !== void 0 ? _b : null;
});
exports.ajouterClasse = ajouterClasse;
const modifierClasse = (data) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_1._executeSql)(`UPDATE ecodim_classe
        SET libelleClasse = ?, trancheAge = ?, ageMin = ?, ageMax = ?,
            descriptionClasse = ?, actifClasse = ?
      WHERE idClasseEcodim = ? AND idUtilisateur = ?`, [
        texte(data.libelleClasse),
        texte(data.trancheAge),
        nombre(data.ageMin),
        nombre(data.ageMax),
        texte(data.descriptionClasse),
        data.actifClasse === 0 ? 0 : 1,
        data.idClasseEcodim,
        data.idUtilisateur,
    ]);
    return true;
});
exports.modifierClasse = modifierClasse;
const supprimerClasse = (idClasseEcodim, idUtilisateur) => __awaiter(void 0, void 0, void 0, function* () {
    const rattaches = yield (0, db_1._selectSql)(`SELECT (SELECT COUNT(*) FROM ecodim_enfant WHERE idClasseEcodim = ?) AS enfants,
            (SELECT COUNT(*) FROM ecodim_moniteur_classe WHERE idClasseEcodim = ?) AS moniteurs`, [idClasseEcodim, idClasseEcodim]);
    const compte = Array.isArray(rattaches) ? rattaches[0] : rattaches;
    // On refuse plutôt que de détacher en silence : des enfants sans classe
    // disparaîtraient des listes sans que personne ne comprenne pourquoi.
    if (Number((compte === null || compte === void 0 ? void 0 : compte.enfants) || 0) > 0 || Number((compte === null || compte === void 0 ? void 0 : compte.moniteurs) || 0) > 0) {
        throw new Error("Cette classe compte encore des enfants ou des moniteurs. Déplacez-les avant de la supprimer.");
    }
    yield (0, db_1._executeSql)("DELETE FROM ecodim_moniteur_classe WHERE idClasseEcodim = ? AND idUtilisateur = ?", [idClasseEcodim, idUtilisateur]);
    yield (0, db_1._executeSql)("DELETE FROM ecodim_classe WHERE idClasseEcodim = ? AND idUtilisateur = ?", [
        idClasseEcodim,
        idUtilisateur,
    ]);
    return true;
});
exports.supprimerClasse = supprimerClasse;
// --------------------------------------------------------------- moniteurs
/** Les classes encadrees par un moniteur, avec le libelle de chacune. */
const recupClassesDuMoniteur = (idMoniteur, idUtilisateur) => (0, db_1._selectSql)(`SELECT lien.idClasseEcodim, lien.estPrincipal, classe.libelleClasse
       FROM ecodim_moniteur_classe lien
       LEFT JOIN ecodim_classe classe ON classe.idClasseEcodim = lien.idClasseEcodim
      WHERE lien.idMoniteur = ? AND lien.idUtilisateur = ?
      ORDER BY lien.estPrincipal DESC, classe.libelleClasse ASC`, [idMoniteur, idUtilisateur]);
exports.recupClassesDuMoniteur = recupClassesDuMoniteur;
const recupMoniteurs = (idUtilisateur) => __awaiter(void 0, void 0, void 0, function* () {
    yield reprendreRattachementsAnciens(idUtilisateur);
    const moniteurs = yield (0, db_1._selectSql)(`SELECT moniteur.*,
            membre.nomMembre, membre.prenomMembre, membre.contactMembre,
            membre.sexeMembre, membre.photoMembre
       FROM ecodim_moniteur moniteur
       LEFT JOIN membre ON membre.idMembre = moniteur.idMembre
      WHERE moniteur.idUtilisateur = ?
      ORDER BY membre.nomMembre ASC`, [idUtilisateur]);
    const liens = yield (0, db_1._selectSql)(`SELECT lien.idMoniteur, lien.idClasseEcodim, lien.estPrincipal, classe.libelleClasse
       FROM ecodim_moniteur_classe lien
       LEFT JOIN ecodim_classe classe ON classe.idClasseEcodim = lien.idClasseEcodim
      WHERE lien.idUtilisateur = ?
      ORDER BY lien.estPrincipal DESC, classe.libelleClasse ASC`, [idUtilisateur]);
    // Les classes sont jointes ici plutot que par une requete par moniteur : une
    // liste de vingt moniteurs ferait sinon vingt allers-retours.
    return (Array.isArray(moniteurs) ? moniteurs : []).map((moniteur) => {
        const classes = (Array.isArray(liens) ? liens : []).filter((lien) => Number(lien.idMoniteur) === Number(moniteur.idMoniteur));
        return Object.assign(Object.assign({}, moniteur), { classes, 
            // Libelles reunis, pour un affichage direct en liste.
            libelleClasse: classes.map((lien) => lien.libelleClasse).filter(Boolean).join(', '), estResponsable: classes.some((lien) => Number(lien.estPrincipal) === 1) ? 1 : 0 });
    });
});
exports.recupMoniteurs = recupMoniteurs;
/** Remplace d'un bloc les rattachements d'un moniteur. */
const enregistrerClassesDuMoniteur = (idMoniteur, idUtilisateur, classes) => __awaiter(void 0, void 0, void 0, function* () {
    if (!Array.isArray(classes)) {
        return;
    }
    yield (0, db_1._executeSql)("DELETE FROM ecodim_moniteur_classe WHERE idMoniteur = ? AND idUtilisateur = ?", [idMoniteur, idUtilisateur]);
    for (const classe of classes) {
        const idClasse = nombre(classe === null || classe === void 0 ? void 0 : classe.idClasseEcodim);
        if (!idClasse)
            continue;
        yield (0, db_1._executeSql)(`INSERT INTO ecodim_moniteur_classe
         (idMoniteur, idClasseEcodim, estPrincipal, idUtilisateur)
       VALUES (?,?,?,?)`, [idMoniteur, idClasse, (classe === null || classe === void 0 ? void 0 : classe.estPrincipal) ? 1 : 0, idUtilisateur]);
    }
});
const ajouterMoniteur = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const doublon = yield (0, db_1._selectSql)("SELECT idMoniteur FROM ecodim_moniteur WHERE idUtilisateur = ? AND idMembre = ?", [data.idUtilisateur, data.idMembre]);
    if (Array.isArray(doublon) && doublon.length) {
        throw new Error("Ce membre est déjà enregistré comme moniteur.");
    }
    const resultat = yield (0, db_1._executeSql)(`INSERT INTO ecodim_moniteur
       (idMembre, idClasseEcodim, estPrincipal, fonctionMoniteur, dateAffectation, actifMoniteur, idUtilisateur)
     VALUES (?,?,?,?,?,?,?)`, [
        data.idMembre,
        nombre(data.idClasseEcodim),
        data.estPrincipal ? 1 : 0,
        texte(data.fonctionMoniteur),
        texte(data.dateAffectation) || null,
        data.actifMoniteur === 0 ? 0 : 1,
        data.idUtilisateur,
    ]);
    const idMoniteur = (_d = (_c = resultat === null || resultat === void 0 ? void 0 : resultat.insertId) !== null && _c !== void 0 ? _c : resultat === null || resultat === void 0 ? void 0 : resultat.lastID) !== null && _d !== void 0 ? _d : null;
    if (idMoniteur) {
        yield enregistrerClassesDuMoniteur(idMoniteur, data.idUtilisateur, data.classes);
    }
    return idMoniteur;
});
exports.ajouterMoniteur = ajouterMoniteur;
const modifierMoniteur = (data) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_1._executeSql)(`UPDATE ecodim_moniteur
        SET idMembre = ?, idClasseEcodim = ?, estPrincipal = ?, fonctionMoniteur = ?,
            dateAffectation = ?, actifMoniteur = ?
      WHERE idMoniteur = ? AND idUtilisateur = ?`, [
        data.idMembre,
        nombre(data.idClasseEcodim),
        data.estPrincipal ? 1 : 0,
        texte(data.fonctionMoniteur),
        texte(data.dateAffectation) || null,
        data.actifMoniteur === 0 ? 0 : 1,
        data.idMoniteur,
        data.idUtilisateur,
    ]);
    yield enregistrerClassesDuMoniteur(Number(data.idMoniteur), data.idUtilisateur, data.classes);
    return true;
});
exports.modifierMoniteur = modifierMoniteur;
const supprimerMoniteur = (idMoniteur, idUtilisateur) => __awaiter(void 0, void 0, void 0, function* () {
    // Les rattachements partent avec lui : sans cela, une classe compterait encore
    // un moniteur qui n'existe plus, et refuserait d'être supprimée.
    yield (0, db_1._executeSql)("DELETE FROM ecodim_moniteur_classe WHERE idMoniteur = ? AND idUtilisateur = ?", [idMoniteur, idUtilisateur]);
    // Retirer un moniteur ne touche pas au membre : il reste dans l'église.
    yield (0, db_1._executeSql)("DELETE FROM ecodim_moniteur WHERE idMoniteur = ? AND idUtilisateur = ?", [
        idMoniteur,
        idUtilisateur,
    ]);
    return true;
});
exports.supprimerMoniteur = supprimerMoniteur;
// ----------------------------------------------------------------- enfants
const recupEnfants = (idUtilisateur) => (0, db_1._selectSql)(`SELECT enfant.*, classe.libelleClasse
       FROM ecodim_enfant enfant
       LEFT JOIN ecodim_classe classe ON classe.idClasseEcodim = enfant.idClasseEcodim
      WHERE enfant.idUtilisateur = ?
      ORDER BY enfant.nomEnfant ASC, enfant.prenomEnfant ASC`, [idUtilisateur]);
exports.recupEnfants = recupEnfants;
/**
 * Les colonnes du dossier enfant, avec la façon d'en extraire la valeur.
 *
 * Les noms de colonnes, les points d'interrogation et les valeurs sont tous dérivés
 * de cette unique liste. Tenus séparément, ils finissent par se décaler d'un cran au
 * premier ajout de champ, et la requête écrit alors chaque donnée dans la colonne
 * voisine sans qu'aucune erreur ne soit levée.
 */
const CHAMPS_ENFANT = [
    { nom: "nomEnfant", valeur: (d) => texte(d.nomEnfant) },
    { nom: "prenomEnfant", valeur: (d) => texte(d.prenomEnfant) },
    { nom: "sexeEnfant", valeur: (d) => texte(d.sexeEnfant) },
    { nom: "dateNaissEnfant", valeur: (d) => texte(d.dateNaissEnfant) || null },
    { nom: "lieuNaissEnfant", valeur: (d) => texte(d.lieuNaissEnfant) },
    { nom: "lieuHabitationEnfant", valeur: (d) => texte(d.lieuHabitationEnfant) },
    { nom: "numeroAppartement", valeur: (d) => texte(d.numeroAppartement) },
    { nom: "contactEnfant", valeur: (d) => texte(d.contactEnfant) },
    { nom: "niveauScolaireEnfant", valeur: (d) => texte(d.niveauScolaireEnfant) },
    { nom: "activiteEnfant", valeur: (d) => texte(d.activiteEnfant) },
    // Parent ou tuteur : ces colonnes existaient déjà et portent le tuteur.
    { nom: "nomParentEnfant", valeur: (d) => texte(d.nomParentEnfant) },
    { nom: "contactParentEnfant", valeur: (d) => texte(d.contactParentEnfant) },
    { nom: "emailParentEnfant", valeur: (d) => texte(d.emailParentEnfant) },
    { nom: "adresseParentEnfant", valeur: (d) => texte(d.adresseParentEnfant) },
    { nom: "religionParents", valeur: (d) => texte(d.religionParents) },
    { nom: "tuteurConverti", valeur: (d) => texte(d.tuteurConverti) },
    { nom: "nomPere", valeur: (d) => texte(d.nomPere) },
    { nom: "prenomPere", valeur: (d) => texte(d.prenomPere) },
    { nom: "lieuHabitationPere", valeur: (d) => texte(d.lieuHabitationPere) },
    { nom: "professionPere", valeur: (d) => texte(d.professionPere) },
    { nom: "contactPere", valeur: (d) => texte(d.contactPere) },
    { nom: "pereConverti", valeur: (d) => texte(d.pereConverti) },
    { nom: "religionPere", valeur: (d) => texte(d.religionPere) },
    { nom: "nomMere", valeur: (d) => texte(d.nomMere) },
    { nom: "prenomMere", valeur: (d) => texte(d.prenomMere) },
    { nom: "lieuHabitationMere", valeur: (d) => texte(d.lieuHabitationMere) },
    { nom: "professionMere", valeur: (d) => texte(d.professionMere) },
    { nom: "contactMere", valeur: (d) => texte(d.contactMere) },
    { nom: "mereConverti", valeur: (d) => texte(d.mereConverti) },
    { nom: "religionMere", valeur: (d) => texte(d.religionMere) },
    { nom: "vitAvec", valeur: (d) => texte(d.vitAvec) },
    // Fiche d'inscription du département enfants.
    { nom: "groupeEcodimEnfant", valeur: (d) => texte(d.groupeEcodimEnfant) },
    { nom: "ecoleEnfant", valeur: (d) => texte(d.ecoleEnfant) },
    { nom: "avecQuiVientEglise", valeur: (d) => texte(d.avecQuiVientEglise) },
    { nom: "responsabiliteTuteurEglise", valeur: (d) => texte(d.responsabiliteTuteurEglise) },
    { nom: "professionTuteur", valeur: (d) => texte(d.professionTuteur) },
    { nom: "dateEntreeEcodim", valeur: (d) => texte(d.dateEntreeEcodim) || null },
    { nom: "niveauEntreeEcodim", valeur: (d) => texte(d.niveauEntreeEcodim) },
    { nom: "niveauActuelEcodim", valeur: (d) => texte(d.niveauActuelEcodim) },
    { nom: "dateBaptemeEsprit", valeur: (d) => texte(d.dateBaptemeEsprit) || null },
    { nom: "lieuBaptemeEsprit", valeur: (d) => texte(d.lieuBaptemeEsprit) },
    { nom: "dateSortieEcodim", valeur: (d) => texte(d.dateSortieEcodim) || null },
    { nom: "motifSortieEcodim", valeur: (d) => texte(d.motifSortieEcodim) },
    { nom: "categorieSortieEcodim", valeur: (d) => texte(d.categorieSortieEcodim) },
    { nom: "situationSociale", valeur: (d) => texte(d.situationSociale) },
    { nom: "precisionSituationSociale", valeur: (d) => texte(d.precisionSituationSociale) },
    { nom: "dateDepart", valeur: (d) => texte(d.dateDepart) || null },
    { nom: "motifDepart", valeur: (d) => texte(d.motifDepart) },
    { nom: "idClasseEcodim", valeur: (d) => nombre(d.idClasseEcodim) },
    { nom: "actifEnfant", valeur: (d) => (d.actifEnfant === 0 ? 0 : 1) },
];
const COLONNES_ENFANT = CHAMPS_ENFANT.map((champ) => champ.nom).join(", ");
const PLACEHOLDERS_ENFANT = CHAMPS_ENFANT.map(() => "?").join(",");
const AFFECTATIONS_ENFANT = CHAMPS_ENFANT.map((champ) => `${champ.nom} = ?`).join(", ");
const valeursEnfant = (data) => CHAMPS_ENFANT.map((champ) => champ.valeur(data));
/**
 * Remplace la photo d'un enfant. L'ancienne est effacée du disque : sans cela, le
 * dossier se remplit de fichiers que plus rien ne référence.
 */
const enregistrerPhotoEnfant = (donnees) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const lignes = yield (0, db_1._selectSql)("SELECT photoEnfant FROM ecodim_enfant WHERE idEnfantEcodim = ? AND idUtilisateur = ?", [donnees.idEnfantEcodim, donnees.idUtilisateur]);
    if (!Array.isArray(lignes) || !lignes.length) {
        throw new Error("Enfant introuvable.");
    }
    const ancienne = (_e = lignes[0]) === null || _e === void 0 ? void 0 : _e.photoEnfant;
    const nomFichier = donnees.photo ? (0, exports.enregistrerImage)(donnees.photo, `enfant-${donnees.idEnfantEcodim}`) : "";
    yield (0, db_1._executeSql)("UPDATE ecodim_enfant SET photoEnfant = ? WHERE idEnfantEcodim = ? AND idUtilisateur = ?", [nomFichier, donnees.idEnfantEcodim, donnees.idUtilisateur]);
    (0, exports.supprimerImage)(ancienne);
    return nomFichier;
});
exports.enregistrerPhotoEnfant = enregistrerPhotoEnfant;
// -------------------------------------------------- images des activités
const recupImagesActivite = (idActiviteEcodim, idUtilisateur) => (0, db_1._selectSql)(`SELECT * FROM ecodim_activite_image
      WHERE idActiviteEcodim = ? AND idUtilisateur = ?
      ORDER BY idImageActivite DESC`, [idActiviteEcodim, idUtilisateur]);
exports.recupImagesActivite = recupImagesActivite;
const ajouterImageActivite = (donnees) => __awaiter(void 0, void 0, void 0, function* () {
    const nomFichier = (0, exports.enregistrerImage)(donnees.image, `activite-${donnees.idActiviteEcodim}`);
    yield (0, db_1._executeSql)(`INSERT INTO ecodim_activite_image (idActiviteEcodim, fichierImage, legendeImage, idUtilisateur)
     VALUES (?,?,?,?)`, [donnees.idActiviteEcodim, nomFichier, texte(donnees.legende), donnees.idUtilisateur]);
    return nomFichier;
});
exports.ajouterImageActivite = ajouterImageActivite;
const supprimerImageActivite = (idImageActivite, idUtilisateur) => __awaiter(void 0, void 0, void 0, function* () {
    const lignes = yield (0, db_1._selectSql)("SELECT fichierImage FROM ecodim_activite_image WHERE idImageActivite = ? AND idUtilisateur = ?", [idImageActivite, idUtilisateur]);
    yield (0, db_1._executeSql)("DELETE FROM ecodim_activite_image WHERE idImageActivite = ? AND idUtilisateur = ?", [idImageActivite, idUtilisateur]);
    (0, exports.supprimerImage)(Array.isArray(lignes) && lignes.length ? lignes[0].fichierImage : null);
    return true;
});
exports.supprimerImageActivite = supprimerImageActivite;
/**
 * Décide du nom de fichier à stocker pour la photo d'un enfant.
 *
 * Le formulaire renvoie soit une image en base64 (nouvelle photo), soit le nom de
 * fichier déjà en base (photo inchangée), soit du vide (photo retirée). Sans cette
 * distinction, rouvrir une fiche et l'enregistrer sans toucher à la photo la
 * réécrirait à chaque fois, et le dossier se remplirait de doublons.
 */
const resoudrePhotoEnfant = (valeurRecue, ancienne, prefixe) => {
    const valeur = texte(valeurRecue);
    if (valeur.startsWith("data:image/")) {
        return { nomFichier: (0, exports.enregistrerImage)(valeur, prefixe), aRemplace: true };
    }
    // Photo inchangée : on garde le fichier existant.
    if (valeur && valeur === texte(ancienne)) {
        return { nomFichier: valeur, aRemplace: false };
    }
    // Vide : la photo a été retirée.
    if (!valeur) {
        return { nomFichier: "", aRemplace: Boolean(texte(ancienne)) };
    }
    return { nomFichier: valeur, aRemplace: false };
};
const ajouterEnfant = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _f, _g;
    const resultat = yield (0, db_1._executeSql)(`INSERT INTO ecodim_enfant (${COLONNES_ENFANT}, idUtilisateur)
     VALUES (${PLACEHOLDERS_ENFANT},?)`, [...valeursEnfant(data), data.idUtilisateur]);
    const idEnfantEcodim = (_g = (_f = resultat === null || resultat === void 0 ? void 0 : resultat.insertId) !== null && _f !== void 0 ? _f : resultat === null || resultat === void 0 ? void 0 : resultat.lastID) !== null && _g !== void 0 ? _g : null;
    // La photo ne peut être nommée qu'une fois l'identifiant connu, comme pour un membre.
    const photoRecue = texte(data.photoEnfant);
    if (idEnfantEcodim && photoRecue.startsWith("data:image/")) {
        const nomFichier = (0, exports.enregistrerImage)(photoRecue, `enfant-${idEnfantEcodim}`);
        yield (0, db_1._executeSql)("UPDATE ecodim_enfant SET photoEnfant = ? WHERE idEnfantEcodim = ? AND idUtilisateur = ?", [nomFichier, idEnfantEcodim, data.idUtilisateur]);
    }
    return idEnfantEcodim;
});
exports.ajouterEnfant = ajouterEnfant;
const modifierEnfant = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _h;
    const lignes = yield (0, db_1._selectSql)("SELECT photoEnfant FROM ecodim_enfant WHERE idEnfantEcodim = ? AND idUtilisateur = ?", [data.idEnfantEcodim, data.idUtilisateur]);
    if (!Array.isArray(lignes) || !lignes.length) {
        throw new Error("Enfant introuvable.");
    }
    const ancienne = (_h = lignes[0]) === null || _h === void 0 ? void 0 : _h.photoEnfant;
    const { nomFichier, aRemplace } = resoudrePhotoEnfant(data.photoEnfant, ancienne, `enfant-${data.idEnfantEcodim}`);
    yield (0, db_1._executeSql)(`UPDATE ecodim_enfant SET ${AFFECTATIONS_ENFANT}
      WHERE idEnfantEcodim = ? AND idUtilisateur = ?`, [...valeursEnfant(data), data.idEnfantEcodim, data.idUtilisateur]);
    yield (0, db_1._executeSql)("UPDATE ecodim_enfant SET photoEnfant = ? WHERE idEnfantEcodim = ? AND idUtilisateur = ?", [nomFichier, data.idEnfantEcodim, data.idUtilisateur]);
    // L'ancien fichier n'est effacé qu'une fois la base à jour : si l'écriture échoue,
    // mieux vaut un fichier orphelin qu'une fiche pointant vers un fichier disparu.
    if (aRemplace) {
        (0, exports.supprimerImage)(ancienne);
    }
    return true;
});
exports.modifierEnfant = modifierEnfant;
const supprimerEnfant = (idEnfantEcodim, idUtilisateur) => __awaiter(void 0, void 0, void 0, function* () {
    const lignes = yield (0, db_1._selectSql)("SELECT photoEnfant FROM ecodim_enfant WHERE idEnfantEcodim = ? AND idUtilisateur = ?", [idEnfantEcodim, idUtilisateur]);
    // Les appels où l'enfant figurait partent avec lui : une présence rattachée à
    // un enfant disparu gonflerait les effectifs sans qu'on puisse l'expliquer.
    yield (0, db_1._executeSql)("DELETE FROM ecodim_presence WHERE idEnfantEcodim = ? AND idUtilisateur = ?", [
        idEnfantEcodim,
        idUtilisateur,
    ]);
    yield (0, db_1._executeSql)("DELETE FROM ecodim_enfant WHERE idEnfantEcodim = ? AND idUtilisateur = ?", [
        idEnfantEcodim,
        idUtilisateur,
    ]);
    (0, exports.supprimerImage)(Array.isArray(lignes) && lignes.length ? lignes[0].photoEnfant : null);
    return true;
});
exports.supprimerEnfant = supprimerEnfant;
// --------------------------------------------------------------- activités
const recupActivites = (idUtilisateur) => (0, db_1._selectSql)(`SELECT activite.*, classe.libelleClasse,
            dirigeant.nomMembre AS nomDirigeant, dirigeant.prenomMembre AS prenomDirigeant,
            enseignant.nomMembre AS nomEnseignant, enseignant.prenomMembre AS prenomEnseignant
       FROM ecodim_activite activite
       LEFT JOIN ecodim_classe classe ON classe.idClasseEcodim = activite.idClasseEcodim
       LEFT JOIN ecodim_moniteur moniteurDirigeant
              ON moniteurDirigeant.idMoniteur = activite.idMoniteurDirigeant
       LEFT JOIN membre dirigeant ON dirigeant.idMembre = moniteurDirigeant.idMembre
       LEFT JOIN ecodim_moniteur moniteurEnseignant
              ON moniteurEnseignant.idMoniteur = activite.idMoniteurEnseignant
       LEFT JOIN membre enseignant ON enseignant.idMembre = moniteurEnseignant.idMembre
      WHERE activite.idUtilisateur = ?
      ORDER BY activite.dateDebutActivite DESC, activite.idActiviteEcodim DESC`, [idUtilisateur]);
exports.recupActivites = recupActivites;
/**
 * Les colonnes d'une activité, avec la façon d'en extraire la valeur.
 *
 * Même raison que pour le dossier enfant et le cahier de texte : les noms de
 * colonnes, les points d'interrogation et les valeurs étaient tenus dans trois
 * listes séparées. Elles se décalent d'un cran au premier champ ajouté, et la
 * requête écrit alors chaque donnée dans la colonne voisine sans qu'aucune
 * erreur ne soit levée.
 */
const CHAMPS_ACTIVITE = [
    { nom: "titreActivite", valeur: (d) => texte(d.titreActivite) },
    { nom: "typeActivite", valeur: (d) => texte(d.typeActivite) },
    { nom: "descriptionActivite", valeur: (d) => texte(d.descriptionActivite) },
    { nom: "lieuActivite", valeur: (d) => texte(d.lieuActivite) },
    { nom: "dateDebutActivite", valeur: (d) => texte(d.dateDebutActivite) || null },
    { nom: "dateFinActivite", valeur: (d) => texte(d.dateFinActivite) || null },
    { nom: "heureDebutActivite", valeur: (d) => texte(d.heureDebutActivite) },
    { nom: "heureFinActivite", valeur: (d) => texte(d.heureFinActivite) },
    { nom: "idClasseEcodim", valeur: (d) => nombre(d.idClasseEcodim) },
    { nom: "idMoniteurDirigeant", valeur: (d) => nombre(d.idMoniteurDirigeant) },
    { nom: "idMoniteurEnseignant", valeur: (d) => nombre(d.idMoniteurEnseignant) },
    { nom: "textesBibliques", valeur: (d) => texte(d.textesBibliques) },
    { nom: "nombreFilles", valeur: (d) => Number(d.nombreFilles) || 0 },
    { nom: "nombreGarcons", valeur: (d) => Number(d.nombreGarcons) || 0 },
    // Les moniteurs présents à l'activité : ils encadrent la sortie ou la veillée,
    // et ne sont pas comptés parmi les enfants.
    { nom: "nombreMoniteurs", valeur: (d) => Number(d.nombreMoniteurs) || 0 },
    { nom: "statutActivite", valeur: (d) => texte(d.statutActivite) || "Planifiee" },
    { nom: "actifActivite", valeur: (d) => (d.actifActivite === 0 ? 0 : 1) },
];
const COLONNES_ACTIVITE = CHAMPS_ACTIVITE.map((champ) => champ.nom).join(", ");
const PLACEHOLDERS_ACTIVITE = CHAMPS_ACTIVITE.map(() => "?").join(",");
const AFFECTATIONS_ACTIVITE = CHAMPS_ACTIVITE.map((champ) => `${champ.nom} = ?`).join(", ");
const valeursActivite = (data) => CHAMPS_ACTIVITE.map((champ) => champ.valeur(data));
const ajouterActivite = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _j, _k;
    const resultat = yield (0, db_1._executeSql)(`INSERT INTO ecodim_activite (${COLONNES_ACTIVITE}, idUtilisateur)
     VALUES (${PLACEHOLDERS_ACTIVITE},?)`, [...valeursActivite(data), data.idUtilisateur]);
    return (_k = (_j = resultat === null || resultat === void 0 ? void 0 : resultat.insertId) !== null && _j !== void 0 ? _j : resultat === null || resultat === void 0 ? void 0 : resultat.lastID) !== null && _k !== void 0 ? _k : null;
});
exports.ajouterActivite = ajouterActivite;
const modifierActivite = (data) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_1._executeSql)(`UPDATE ecodim_activite SET ${AFFECTATIONS_ACTIVITE}
      WHERE idActiviteEcodim = ? AND idUtilisateur = ?`, [...valeursActivite(data), data.idActiviteEcodim, data.idUtilisateur]);
    return true;
});
exports.modifierActivite = modifierActivite;
const supprimerActivite = (idActiviteEcodim, idUtilisateur) => __awaiter(void 0, void 0, void 0, function* () {
    // Les images suivent l'activité : laisser les fichiers derrière remplirait le
    // dossier de photos que plus aucune ligne ne référence.
    const images = yield (0, db_1._selectSql)("SELECT fichierImage FROM ecodim_activite_image WHERE idActiviteEcodim = ? AND idUtilisateur = ?", [idActiviteEcodim, idUtilisateur]);
    yield (0, db_1._executeSql)("DELETE FROM ecodim_activite_image WHERE idActiviteEcodim = ? AND idUtilisateur = ?", [idActiviteEcodim, idUtilisateur]);
    yield (0, db_1._executeSql)("DELETE FROM ecodim_activite WHERE idActiviteEcodim = ? AND idUtilisateur = ?", [idActiviteEcodim, idUtilisateur]);
    (Array.isArray(images) ? images : []).forEach((image) => (0, exports.supprimerImage)(image === null || image === void 0 ? void 0 : image.fichierImage));
    return true;
});
exports.supprimerActivite = supprimerActivite;
// ------------------------------------------------------------------ cultes
/**
 * Les colonnes du cahier de texte, avec la facon d'en extraire la valeur.
 *
 * Comme pour le dossier enfant, les noms de colonnes, les points d'interrogation
 * et les valeurs derivent tous de cette unique liste : tenus separement, ils se
 * decalent d'un cran au premier champ ajoute, et la requete ecrit alors chaque
 * donnee dans la colonne voisine sans qu'aucune erreur ne soit levee.
 */
const CHAMPS_CULTE = [
    { nom: "dateCulte", valeur: (d) => texte(d.dateCulte) },
    { nom: "idClasseEcodim", valeur: (d) => nombre(d.idClasseEcodim) },
    { nom: "idMoniteurDirigeant", valeur: (d) => nombre(d.idMoniteurDirigeant) },
    { nom: "nomDirigeantExterne", valeur: (d) => texte(d.nomDirigeantExterne) },
    { nom: "sujetsPriere", valeur: (d) => texte(d.sujetsPriere) },
    { nom: "chantsCulte", valeur: (d) => texte(d.chantsCulte) },
    { nom: "idMoniteurEnseignant", valeur: (d) => nombre(d.idMoniteurEnseignant) },
    { nom: "nomEnseignantExterne", valeur: (d) => texte(d.nomEnseignantExterne) },
    { nom: "leconDuJour", valeur: (d) => texte(d.leconDuJour) },
    { nom: "passageBiblique", valeur: (d) => texte(d.passageBiblique) },
    { nom: "resumePredication", valeur: (d) => texte(d.resumePredication) },
    { nom: "versetOr", valeur: (d) => texte(d.versetOr) },
    { nom: "montantOffrande", valeur: (d) => Number(d.montantOffrande) || 0 },
    { nom: "nombreFilles", valeur: (d) => Number(d.nombreFilles) || 0 },
    { nom: "nombreGarcons", valeur: (d) => Number(d.nombreGarcons) || 0 },
    { nom: "nomSignatureEnseignant", valeur: (d) => texte(d.nomSignatureEnseignant) },
    { nom: "nomSignatureResponsable", valeur: (d) => texte(d.nomSignatureResponsable) },
    { nom: "nomSignatureDirection", valeur: (d) => texte(d.nomSignatureDirection) },
    { nom: "observationsCulte", valeur: (d) => texte(d.observationsCulte) },
];
const COLONNES_CULTE = CHAMPS_CULTE.map((champ) => champ.nom).join(", ");
const PLACEHOLDERS_CULTE = CHAMPS_CULTE.map(() => "?").join(",");
const AFFECTATIONS_CULTE = CHAMPS_CULTE.map((champ) => `${champ.nom} = ?`).join(", ");
const valeursCulte = (data) => CHAMPS_CULTE.map((champ) => champ.valeur(data));
/**
 * Cultes d'une église, du plus récent au plus ancien : on consulte le cahier de
 * texte pour revoir le dernier dimanche, pas celui de l'année passée.
 *
 * Les noms du dirigeant et de l'enseignant sont joints ici plutôt que recomposés
 * côté client : la liste doit afficher des noms sans un aller-retour par ligne.
 */
const recupCultes = (idUtilisateur) => (0, db_1._selectSql)(`SELECT culte.*,
            classe.libelleClasse,
            dirigeant.nomMembre AS nomDirigeant, dirigeant.prenomMembre AS prenomDirigeant,
            enseignant.nomMembre AS nomEnseignant, enseignant.prenomMembre AS prenomEnseignant
       FROM ecodim_culte culte
       LEFT JOIN ecodim_classe classe ON classe.idClasseEcodim = culte.idClasseEcodim
       LEFT JOIN ecodim_moniteur moniteurDirigeant
              ON moniteurDirigeant.idMoniteur = culte.idMoniteurDirigeant
       LEFT JOIN membre dirigeant ON dirigeant.idMembre = moniteurDirigeant.idMembre
       LEFT JOIN ecodim_moniteur moniteurEnseignant
              ON moniteurEnseignant.idMoniteur = culte.idMoniteurEnseignant
       LEFT JOIN membre enseignant ON enseignant.idMembre = moniteurEnseignant.idMembre
      WHERE culte.idUtilisateur = ?
      ORDER BY culte.dateCulte DESC, culte.idCulteEcodim DESC`, [idUtilisateur]);
exports.recupCultes = recupCultes;
const ajouterCulte = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _l, _m;
    if (!texte(data.dateCulte)) {
        throw new Error("La date du culte est requise.");
    }
    // Un même dimanche ne se tient qu'une fois par classe : deux saisies pour la même
    // date signalent presque toujours une double transcription du cahier.
    const doublon = yield (0, db_1._selectSql)(`SELECT idCulteEcodim FROM ecodim_culte
      WHERE idUtilisateur = ? AND dateCulte = ? AND idClasseEcodim IS ?`, [data.idUtilisateur, texte(data.dateCulte), nombre(data.idClasseEcodim)]);
    if (Array.isArray(doublon) && doublon.length) {
        throw new Error("Un culte est déjà enregistré pour cette classe à cette date.");
    }
    const resultat = yield (0, db_1._executeSql)(`INSERT INTO ecodim_culte (${COLONNES_CULTE}, idUtilisateur)
     VALUES (${PLACEHOLDERS_CULTE},?)`, [...valeursCulte(data), data.idUtilisateur]);
    return (_m = (_l = resultat === null || resultat === void 0 ? void 0 : resultat.insertId) !== null && _l !== void 0 ? _l : resultat === null || resultat === void 0 ? void 0 : resultat.lastID) !== null && _m !== void 0 ? _m : null;
});
exports.ajouterCulte = ajouterCulte;
const modifierCulte = (data) => __awaiter(void 0, void 0, void 0, function* () {
    if (!texte(data.dateCulte)) {
        throw new Error("La date du culte est requise.");
    }
    yield (0, db_1._executeSql)(`UPDATE ecodim_culte SET ${AFFECTATIONS_CULTE}
      WHERE idCulteEcodim = ? AND idUtilisateur = ?`, [...valeursCulte(data), data.idCulteEcodim, data.idUtilisateur]);
    return true;
});
exports.modifierCulte = modifierCulte;
const supprimerCulte = (idCulteEcodim, idUtilisateur) => __awaiter(void 0, void 0, void 0, function* () {
    // L'appel part avec la séance : sans cela, ses lignes resteraient rattachées à
    // un culte disparu et fausseraient les taux d'assiduité sans plus pouvoir être
    // retrouvées depuis l'interface.
    yield (0, db_1._executeSql)("DELETE FROM ecodim_presence WHERE idCulteEcodim = ? AND idUtilisateur = ?", [
        idCulteEcodim,
        idUtilisateur,
    ]);
    yield (0, db_1._executeSql)("DELETE FROM ecodim_culte WHERE idCulteEcodim = ? AND idUtilisateur = ?", [idCulteEcodim, idUtilisateur]);
    return true;
});
exports.supprimerCulte = supprimerCulte;
// ------------------------------------------------------------- évaluations
/**
 * Évaluations d'une église, de la plus récente à la plus ancienne.
 *
 * Chaque évaluation appartient à une classe. Une évaluation régionale ou
 * nationale, passée par toute l'école, se traduit par une évaluation par classe :
 * les notes d'une classe ne se comparent qu'entre elles, et le classement se fait
 * classe par classe.
 */
/**
 * Remet d'aplomb les évaluations créées avant la table de rattachement.
 *
 * Deux héritages à reprendre, une seule fois :
 *
 * 1. une évaluation dont la classe vivait dans `idClasseEcodim` n'a aucun
 *    rattachement : on le crée ;
 * 2. une évaluation commune à toute l'école avait été **dupliquée par classe**,
 *    ce qui donnait autant de colonnes que de classes pour un même devoir. On
 *    refond ces copies en une seule évaluation rattachée à toutes leurs classes.
 *
 * Le regroupement n'opère que sur des copies **identiques** en tout point —
 * intitulé, type, date, coefficient, barème, année. Deux évaluations qui
 * diffèrent sur un seul de ces champs sont deux épreuves distinctes.
 */
const reprendreRattachementsEvaluations = (idUtilisateur) => __awaiter(void 0, void 0, void 0, function* () {
    // --- 1. Les évaluations sans rattachement
    const sansLien = yield (0, db_1._selectSql)(`SELECT evaluation.idEvaluation, evaluation.idClasseEcodim
       FROM ecodim_evaluation evaluation
       LEFT JOIN ecodim_evaluation_classe lien ON lien.idEvaluation = evaluation.idEvaluation
      WHERE evaluation.idUtilisateur = ?
        AND evaluation.idClasseEcodim IS NOT NULL
        AND lien.idEvaluationClasse IS NULL`, [idUtilisateur]);
    for (const ligne of Array.isArray(sansLien) ? sansLien : []) {
        yield (0, db_1._executeSql)(`INSERT INTO ecodim_evaluation_classe (idEvaluation, idClasseEcodim, idUtilisateur)
       VALUES (?,?,?)`, [ligne.idEvaluation, ligne.idClasseEcodim, idUtilisateur]);
    }
    // --- 2. Les copies identiques, à refondre en une seule évaluation
    const toutes = yield (0, db_1._selectSql)(`SELECT idEvaluation, libelleEvaluation, typeEvaluation, dateEvaluation,
            coefficient, noteSur, anneeEcclesiastique
       FROM ecodim_evaluation
      WHERE idUtilisateur = ?
      ORDER BY idEvaluation ASC`, [idUtilisateur]);
    const groupes = new Map();
    (Array.isArray(toutes) ? toutes : []).forEach((evaluation) => {
        const empreinte = [
            evaluation.libelleEvaluation,
            evaluation.typeEvaluation,
            evaluation.dateEvaluation,
            evaluation.coefficient,
            evaluation.noteSur,
            evaluation.anneeEcclesiastique,
        ].join("|");
        groupes.set(empreinte, [...(groupes.get(empreinte) || []), evaluation]);
    });
    for (const groupe of Array.from(groupes.values())) {
        if (groupe.length < 2) {
            continue;
        }
        const [survivante, ...copies] = groupe;
        for (const copie of copies) {
            // Les rattachements et les notes migrent avant la suppression : une note
            // orpheline ne se rattraperait plus.
            yield (0, db_1._executeSql)("UPDATE ecodim_evaluation_classe SET idEvaluation = ? WHERE idEvaluation = ? AND idUtilisateur = ?", [survivante.idEvaluation, copie.idEvaluation, idUtilisateur]);
            yield (0, db_1._executeSql)("UPDATE ecodim_note SET idEvaluation = ? WHERE idEvaluation = ? AND idUtilisateur = ?", [survivante.idEvaluation, copie.idEvaluation, idUtilisateur]);
            yield (0, db_1._executeSql)("DELETE FROM ecodim_evaluation WHERE idEvaluation = ? AND idUtilisateur = ?", [copie.idEvaluation, idUtilisateur]);
        }
    }
});
/** Remplace d'un bloc les classes concernées par une évaluation. */
const enregistrerClassesEvaluation = (idEvaluation, idUtilisateur, classes) => __awaiter(void 0, void 0, void 0, function* () {
    if (!Array.isArray(classes)) {
        return;
    }
    yield (0, db_1._executeSql)("DELETE FROM ecodim_evaluation_classe WHERE idEvaluation = ? AND idUtilisateur = ?", [idEvaluation, idUtilisateur]);
    for (const classe of classes) {
        const idClasse = nombre(classe);
        if (!idClasse)
            continue;
        yield (0, db_1._executeSql)(`INSERT INTO ecodim_evaluation_classe (idEvaluation, idClasseEcodim, idUtilisateur)
       VALUES (?,?,?)`, [idEvaluation, idClasse, idUtilisateur]);
    }
});
const valeursEvaluation = (data) => [
    texte(data.libelleEvaluation),
    texte(data.typeEvaluation) || "Locale",
    texte(data.dateEvaluation) || null,
    Number(data.coefficient) > 0 ? Number(data.coefficient) : 1,
    Number(data.noteSur) > 0 ? Number(data.noteSur) : 20,
    texte(data.anneeEcclesiastique),
];
/** Les classes d'une évaluation doivent exister et être au moins une. */
const classesValides = (data) => {
    const retenues = (Array.isArray(data.classes) ? data.classes : [])
        .map((classe) => nombre(classe))
        .filter((idClasse) => Boolean(idClasse));
    if (!retenues.length) {
        throw new Error("Choisissez au moins une classe pour l'évaluation.");
    }
    return retenues;
};
/**
 * Évaluations d'une église, de la plus récente à la plus ancienne.
 *
 * Une évaluation est **une** épreuve, rattachée à une ou plusieurs classes. Une
 * évaluation régionale passée par toute l'école reste une seule ligne : la
 * dupliquer par classe donnerait autant de colonnes pour un même devoir.
 */
const recupEvaluations = (idUtilisateur) => __awaiter(void 0, void 0, void 0, function* () {
    yield reprendreRattachementsEvaluations(idUtilisateur);
    const evaluations = yield (0, db_1._selectSql)(`SELECT * FROM ecodim_evaluation
      WHERE idUtilisateur = ?
      ORDER BY dateEvaluation DESC, idEvaluation DESC`, [idUtilisateur]);
    const liens = yield (0, db_1._selectSql)(`SELECT lien.idEvaluation, lien.idClasseEcodim, classe.libelleClasse
       FROM ecodim_evaluation_classe lien
       LEFT JOIN ecodim_classe classe ON classe.idClasseEcodim = lien.idClasseEcodim
      WHERE lien.idUtilisateur = ?`, [idUtilisateur]);
    return (Array.isArray(evaluations) ? evaluations : []).map((evaluation) => {
        const sesClasses = (Array.isArray(liens) ? liens : []).filter((lien) => Number(lien.idEvaluation) === Number(evaluation.idEvaluation));
        return Object.assign(Object.assign({}, evaluation), { classes: sesClasses.map((lien) => Number(lien.idClasseEcodim)), libelleClasse: sesClasses
                .map((lien) => lien.libelleClasse)
                .filter(Boolean)
                .join(', ') });
    });
});
exports.recupEvaluations = recupEvaluations;
const ajouterEvaluation = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _o, _p;
    if (!texte(data.libelleEvaluation)) {
        throw new Error("L'intitulé de l'évaluation est requis.");
    }
    const classes = classesValides(data);
    const resultat = yield (0, db_1._executeSql)(`INSERT INTO ecodim_evaluation
       (libelleEvaluation, typeEvaluation, dateEvaluation, coefficient,
        noteSur, anneeEcclesiastique, idUtilisateur)
     VALUES (?,?,?,?,?,?,?)`, [...valeursEvaluation(data), data.idUtilisateur]);
    const idEvaluation = (_p = (_o = resultat === null || resultat === void 0 ? void 0 : resultat.insertId) !== null && _o !== void 0 ? _o : resultat === null || resultat === void 0 ? void 0 : resultat.lastID) !== null && _p !== void 0 ? _p : null;
    if (idEvaluation) {
        yield enregistrerClassesEvaluation(idEvaluation, data.idUtilisateur, classes);
    }
    return idEvaluation;
});
exports.ajouterEvaluation = ajouterEvaluation;
const modifierEvaluation = (data) => __awaiter(void 0, void 0, void 0, function* () {
    if (!texte(data.libelleEvaluation)) {
        throw new Error("L'intitulé de l'évaluation est requis.");
    }
    const classes = classesValides(data);
    yield (0, db_1._executeSql)(`UPDATE ecodim_evaluation
        SET libelleEvaluation = ?, typeEvaluation = ?, dateEvaluation = ?,
            coefficient = ?, noteSur = ?, anneeEcclesiastique = ?
      WHERE idEvaluation = ? AND idUtilisateur = ?`, [...valeursEvaluation(data), data.idEvaluation, data.idUtilisateur]);
    yield enregistrerClassesEvaluation(Number(data.idEvaluation), data.idUtilisateur, classes);
    return true;
});
exports.modifierEvaluation = modifierEvaluation;
const supprimerEvaluation = (idEvaluation, idUtilisateur) => __awaiter(void 0, void 0, void 0, function* () {
    // Les notes et les rattachements suivent l'évaluation : laissés derrière, ils
    // fausseraient les moyennes en pointant vers une évaluation disparue.
    yield (0, db_1._executeSql)("DELETE FROM ecodim_note WHERE idEvaluation = ? AND idUtilisateur = ?", [
        idEvaluation,
        idUtilisateur,
    ]);
    yield (0, db_1._executeSql)("DELETE FROM ecodim_evaluation_classe WHERE idEvaluation = ? AND idUtilisateur = ?", [idEvaluation, idUtilisateur]);
    yield (0, db_1._executeSql)("DELETE FROM ecodim_evaluation WHERE idEvaluation = ? AND idUtilisateur = ?", [idEvaluation, idUtilisateur]);
    return true;
});
exports.supprimerEvaluation = supprimerEvaluation;
/** Toutes les notes de l'église : la grille les répartit ensuite par enfant. */
const recupNotes = (idUtilisateur) => (0, db_1._selectSql)("SELECT * FROM ecodim_note WHERE idUtilisateur = ?", [idUtilisateur]);
exports.recupNotes = recupNotes;
/**
 * Enregistre d'un bloc les notes saisies dans la grille.
 *
 * Une note vide efface la ligne plutôt que d'enregistrer une chaîne vide : une
 * absence de note et un zéro ne sont pas la même chose, et un zéro fantôme
 * ferait chuter la moyenne d'un enfant qui n'a simplement pas composé.
 */
const enregistrerNotes = (donnees) => __awaiter(void 0, void 0, void 0, function* () {
    const notes = Array.isArray(donnees.notes) ? donnees.notes : [];
    let enregistrees = 0;
    for (const note of notes) {
        const idEvaluation = nombre(note === null || note === void 0 ? void 0 : note.idEvaluation);
        const idEnfantEcodim = nombre(note === null || note === void 0 ? void 0 : note.idEnfantEcodim);
        if (!idEvaluation || !idEnfantEcodim) {
            continue;
        }
        const valeur = texte(note === null || note === void 0 ? void 0 : note.valeurNote);
        yield (0, db_1._executeSql)("DELETE FROM ecodim_note WHERE idEvaluation = ? AND idEnfantEcodim = ? AND idUtilisateur = ?", [idEvaluation, idEnfantEcodim, donnees.idUtilisateur]);
        if (valeur !== "") {
            yield (0, db_1._executeSql)(`INSERT INTO ecodim_note (idEvaluation, idEnfantEcodim, valeurNote, idUtilisateur)
         VALUES (?,?,?,?)`, [idEvaluation, idEnfantEcodim, valeur, donnees.idUtilisateur]);
            enregistrees += 1;
        }
    }
    return enregistrees;
});
exports.enregistrerNotes = enregistrerNotes;
// --------------------------------------------------------------- assiduité
/** Statuts d'appel acceptés. Sans accent, comme les autres valeurs à choix. */
const STATUTS_PRESENCE = ["present", "absent", "excuse"];
/**
 * Appel nominatif, toutes séances confondues.
 *
 * La date et la classe viennent du culte, jointes ici : la grille mensuelle et
 * la fiche de suivi en ont besoin à chaque ligne, et les recopier dans la table
 * des présences créerait deux versions de la même information.
 */
const recupPresences = (idUtilisateur) => (0, db_1._selectSql)(`SELECT presence.idPresenceEcodim,
            presence.idCulteEcodim,
            presence.idEnfantEcodim,
            presence.statutPresence,
            presence.motifPresence,
            culte.dateCulte,
            culte.idClasseEcodim
       FROM ecodim_presence presence
       JOIN ecodim_culte culte ON culte.idCulteEcodim = presence.idCulteEcodim
      WHERE presence.idUtilisateur = ?
      ORDER BY culte.dateCulte DESC, presence.idPresenceEcodim`, [idUtilisateur]);
exports.recupPresences = recupPresences;
/**
 * Recompte les filles et les garçons présents d'après l'appel.
 *
 * Ces deux compteurs se tapaient à la main dans le cahier de texte. Dès qu'un
 * appel existe, les laisser diverger n'aurait pas de sens : c'est la même
 * séance comptée deux fois, et c'est le nominatif qui fait foi.
 *
 * Les cultes anciens, sans appel, gardent leurs compteurs saisis : la fonction
 * n'est appelée qu'après un enregistrement d'appel.
 */
const recalculerEffectifsCulte = (idCulteEcodim, idUtilisateur) => __awaiter(void 0, void 0, void 0, function* () {
    const lignes = yield (0, db_1._selectSql)(`SELECT enfant.sexeEnfant AS sexe, COUNT(*) AS total
       FROM ecodim_presence presence
       JOIN ecodim_enfant enfant ON enfant.idEnfantEcodim = presence.idEnfantEcodim
      WHERE presence.idCulteEcodim = ?
        AND presence.idUtilisateur = ?
        AND presence.statutPresence = ?
      GROUP BY enfant.sexeEnfant`, [idCulteEcodim, idUtilisateur, "present"]);
    const parSexe = Array.isArray(lignes) ? lignes : [];
    const compter = (sexe) => { var _a; return Number(((_a = parSexe.find((ligne) => String((ligne === null || ligne === void 0 ? void 0 : ligne.sexe) || "") === sexe)) === null || _a === void 0 ? void 0 : _a.total) || 0); };
    yield (0, db_1._executeSql)(`UPDATE ecodim_culte SET nombreFilles = ?, nombreGarcons = ?
      WHERE idCulteEcodim = ? AND idUtilisateur = ?`, [compter("F"), compter("M"), idCulteEcodim, idUtilisateur]);
});
/**
 * Enregistre l'appel d'une séance d'un bloc.
 *
 * L'appel du culte est remplacé en entier plutôt que modifié ligne à ligne :
 * l'écran envoie toujours la liste complète, et un enfant sorti de la classe
 * entre deux saisies ne doit pas laisser derrière lui une présence orpheline.
 *
 * Un enfant absent de la liste envoyée n'a pas été appelé — ce qui n'est pas la
 * même chose qu'une absence. Aucune ligne n'est créée pour lui, et la fiche de
 * suivi laisse la case vide au lieu d'y porter une croix qui serait fausse.
 */
const enregistrerAppel = (donnees) => __awaiter(void 0, void 0, void 0, function* () {
    const idCulteEcodim = nombre(donnees.idCulteEcodim);
    if (!idCulteEcodim) {
        throw new Error("La séance de l'appel est requise.");
    }
    // Le culte doit appartenir à l'église qui enregistre : sans ce contrôle, un
    // identifiant deviné suffirait à écrire dans le cahier d'une autre église.
    const culte = yield (0, db_1._selectSql)("SELECT idCulteEcodim FROM ecodim_culte WHERE idCulteEcodim = ? AND idUtilisateur = ?", [idCulteEcodim, donnees.idUtilisateur]);
    if (!Array.isArray(culte) || !culte.length) {
        throw new Error("Cette séance est introuvable.");
    }
    yield (0, db_1._executeSql)("DELETE FROM ecodim_presence WHERE idCulteEcodim = ? AND idUtilisateur = ?", [
        idCulteEcodim,
        donnees.idUtilisateur,
    ]);
    const lignes = Array.isArray(donnees.presences) ? donnees.presences : [];
    let enregistrees = 0;
    for (const ligne of lignes) {
        const idEnfantEcodim = nombre(ligne === null || ligne === void 0 ? void 0 : ligne.idEnfantEcodim);
        const statut = texte(ligne === null || ligne === void 0 ? void 0 : ligne.statutPresence) || "present";
        if (!idEnfantEcodim || !STATUTS_PRESENCE.includes(statut)) {
            continue;
        }
        yield (0, db_1._executeSql)(`INSERT INTO ecodim_presence
         (idCulteEcodim, idEnfantEcodim, statutPresence, motifPresence, idUtilisateur)
       VALUES (?,?,?,?,?)`, [idCulteEcodim, idEnfantEcodim, statut, texte(ligne === null || ligne === void 0 ? void 0 : ligne.motifPresence), donnees.idUtilisateur]);
        enregistrees += 1;
    }
    yield recalculerEffectifsCulte(idCulteEcodim, donnees.idUtilisateur);
    return enregistrees;
});
exports.enregistrerAppel = enregistrerAppel;
// ------------------------------------- inscription d'un enfant par QR code
/**
 * L'église exige-t-elle une validation avant d'inscrire ?
 *
 * C'est le même réglage que pour les membres : une église qui fait confiance aux
 * fiches remplies par les parents n'a aucune raison de le régler deux fois, et
 * deux réglages voisins finiraient par se contredire sans qu'on sache lequel
 * s'applique.
 */
const doitValiderInscriptionEnfant = (idUtilisateur) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lignes = yield (0, db_1._selectSql)("SELECT validerInscriptionMembre FROM utilisateur WHERE idUtilisateur = ?", [idUtilisateur]);
        const utilisateur = Array.isArray(lignes) ? lignes[0] : null;
        return Number(utilisateur === null || utilisateur === void 0 ? void 0 : utilisateur.validerInscriptionMembre) !== 0;
    }
    catch (_error) {
        // Si le réglage est illisible, on garde le comportement le plus prudent :
        // la demande attend un responsable plutôt que d'entrer en aveugle.
        return true;
    }
});
const normaliserNom = (valeur) => String(valeur !== null && valeur !== void 0 ? valeur : "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
/**
 * Enregistre la fiche envoyée depuis le QR code public.
 *
 * La route est ouverte, sans jeton : c'est un parent sur son téléphone qui la
 * remplit. Tout ce qui arrive est donc traité comme une proposition, jamais
 * comme une donnée de confiance — d'où le périmètre pris dans le lien et non
 * dans la fiche, et le passage obligé par la table des demandes.
 */
const ajouterDemandeEnfant = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _q, _r;
    const idUtilisateur = nombre(data === null || data === void 0 ? void 0 : data.idUtilisateur);
    if (!idUtilisateur) {
        throw new Error("Lien d'inscription incomplet.");
    }
    if (!texte(data === null || data === void 0 ? void 0 : data.nomEnfant)) {
        throw new Error("Le nom de l'enfant est requis.");
    }
    if (!texte(data === null || data === void 0 ? void 0 : data.contactParentEnfant)) {
        throw new Error("Le contact du parent ou tuteur est requis.");
    }
    const nom = normaliserNom(data === null || data === void 0 ? void 0 : data.nomEnfant);
    const prenom = normaliserNom(data === null || data === void 0 ? void 0 : data.prenomEnfant);
    // Un enfant déjà inscrit ne doit pas réapparaître parce qu'un second parent a
    // scanné le même QR code.
    const enfants = yield (0, db_1._selectSql)("SELECT nomEnfant, prenomEnfant FROM ecodim_enfant WHERE idUtilisateur = ?", [idUtilisateur]);
    const dejaInscrit = (Array.isArray(enfants) ? enfants : []).some((enfant) => normaliserNom(enfant.nomEnfant) === nom && normaliserNom(enfant.prenomEnfant) === prenom);
    if (dejaInscrit) {
        throw new Error("Cet enfant est déjà inscrit à l'école du dimanche.");
    }
    const demandes = yield (0, db_1._selectSql)("SELECT nomEnfant, prenomEnfant FROM ecodim_enfant_demande WHERE idUtilisateur = ? AND statutDemande = ?", [idUtilisateur, "en_attente"]);
    const dejaDemande = (Array.isArray(demandes) ? demandes : []).some((demande) => normaliserNom(demande.nomEnfant) === nom && normaliserNom(demande.prenomEnfant) === prenom);
    if (dejaDemande) {
        throw new Error("Une demande d'inscription est déjà en attente pour cet enfant.");
    }
    // Le périmètre vient du lien, jamais de la fiche : sinon n'importe qui
    // pourrait inscrire un enfant dans l'église de son choix.
    const fiche = Object.assign(Object.assign({}, data), { idUtilisateur });
    const validationRequise = yield doitValiderInscriptionEnfant(idUtilisateur);
    const resultat = yield (0, db_1._executeSql)(`INSERT INTO ecodim_enfant_demande
       (idUtilisateur, nomEnfant, prenomEnfant, contactParentEnfant, payloadDemande, statutDemande)
     VALUES (?,?,?,?,?,?)`, [
        idUtilisateur,
        texte(data === null || data === void 0 ? void 0 : data.nomEnfant),
        texte(data === null || data === void 0 ? void 0 : data.prenomEnfant),
        texte(data === null || data === void 0 ? void 0 : data.contactParentEnfant),
        JSON.stringify(fiche),
        validationRequise ? "en_attente" : "validee",
    ]);
    const idDemandeEnfant = (_r = (_q = resultat === null || resultat === void 0 ? void 0 : resultat.insertId) !== null && _q !== void 0 ? _q : resultat === null || resultat === void 0 ? void 0 : resultat.lastID) !== null && _r !== void 0 ? _r : null;
    if (!validationRequise) {
        // L'église a choisi l'inscription directe : on crée l'enfant tout de suite,
        // et la demande garde la trace de ce qui a été envoyé.
        const idEnfantCree = yield (0, exports.ajouterEnfant)(fiche);
        yield (0, db_1._executeSql)(`UPDATE ecodim_enfant_demande
          SET idEnfantCree = ?, dateTraitement = CURRENT_TIMESTAMP
        WHERE idDemandeEnfant = ?`, [idEnfantCree, idDemandeEnfant]);
    }
    return { idDemandeEnfant, validationRequise };
});
exports.ajouterDemandeEnfant = ajouterDemandeEnfant;
/** Demandes d'une église, les plus récentes d'abord. */
const recupDemandesEnfant = (idUtilisateur) => (0, db_1._selectSql)(`SELECT * FROM ecodim_enfant_demande
      WHERE idUtilisateur = ?
      ORDER BY dateCreation DESC, idDemandeEnfant DESC`, [idUtilisateur]);
exports.recupDemandesEnfant = recupDemandesEnfant;
/**
 * Accepte une demande : l'enfant est créé à partir de la fiche conservée.
 *
 * Les corrections faites à l'écran avant validation sont prises en compte, mais
 * le périmètre et le statut restent ceux du serveur.
 */
const validerDemandeEnfant = (donnees) => __awaiter(void 0, void 0, void 0, function* () {
    const lignes = yield (0, db_1._selectSql)("SELECT * FROM ecodim_enfant_demande WHERE idDemandeEnfant = ? AND idUtilisateur = ?", [donnees.idDemandeEnfant, donnees.idUtilisateur]);
    const demande = Array.isArray(lignes) ? lignes[0] : null;
    if (!demande) {
        throw new Error("Cette demande est introuvable.");
    }
    if (demande.statutDemande !== "en_attente") {
        throw new Error("Cette demande a déjà été traitée.");
    }
    let fiche = {};
    try {
        fiche = JSON.parse(demande.payloadDemande || "{}");
    }
    catch (_error) {
        fiche = {};
    }
    const idEnfantCree = yield (0, exports.ajouterEnfant)(Object.assign(Object.assign(Object.assign({}, fiche), (donnees.modifications || {})), { idUtilisateur: donnees.idUtilisateur }));
    yield (0, db_1._executeSql)(`UPDATE ecodim_enfant_demande
        SET statutDemande = ?, idEnfantCree = ?, dateTraitement = CURRENT_TIMESTAMP
      WHERE idDemandeEnfant = ? AND idUtilisateur = ?`, ["validee", idEnfantCree, donnees.idDemandeEnfant, donnees.idUtilisateur]);
    return idEnfantCree;
});
exports.validerDemandeEnfant = validerDemandeEnfant;
/** Rejette une demande. La fiche est conservée : on doit pouvoir y revenir. */
const rejeterDemandeEnfant = (donnees) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_1._executeSql)(`UPDATE ecodim_enfant_demande
        SET statutDemande = ?, motifRejet = ?, dateTraitement = CURRENT_TIMESTAMP
      WHERE idDemandeEnfant = ? AND idUtilisateur = ? AND statutDemande = ?`, [
        "rejetee",
        texte(donnees.motifRejet),
        donnees.idDemandeEnfant,
        donnees.idUtilisateur,
        "en_attente",
    ]);
    return true;
});
exports.rejeterDemandeEnfant = rejeterDemandeEnfant;
exports.default = {
    recupClasses: exports.recupClasses,
    ajouterClasse: exports.ajouterClasse,
    modifierClasse: exports.modifierClasse,
    supprimerClasse: exports.supprimerClasse,
    recupMoniteurs: exports.recupMoniteurs,
    ajouterMoniteur: exports.ajouterMoniteur,
    modifierMoniteur: exports.modifierMoniteur,
    supprimerMoniteur: exports.supprimerMoniteur,
    recupEnfants: exports.recupEnfants,
    ajouterEnfant: exports.ajouterEnfant,
    modifierEnfant: exports.modifierEnfant,
    supprimerEnfant: exports.supprimerEnfant,
    recupActivites: exports.recupActivites,
    ajouterActivite: exports.ajouterActivite,
    modifierActivite: exports.modifierActivite,
    supprimerActivite: exports.supprimerActivite,
    enregistrerPhotoEnfant: exports.enregistrerPhotoEnfant,
    recupImagesActivite: exports.recupImagesActivite,
    ajouterImageActivite: exports.ajouterImageActivite,
    supprimerImageActivite: exports.supprimerImageActivite,
    recupCultes: exports.recupCultes,
    ajouterCulte: exports.ajouterCulte,
    modifierCulte: exports.modifierCulte,
    supprimerCulte: exports.supprimerCulte,
    recupEvaluations: exports.recupEvaluations,
    ajouterEvaluation: exports.ajouterEvaluation,
    modifierEvaluation: exports.modifierEvaluation,
    supprimerEvaluation: exports.supprimerEvaluation,
    recupNotes: exports.recupNotes,
    enregistrerNotes: exports.enregistrerNotes,
    recupPresences: exports.recupPresences,
    enregistrerAppel: exports.enregistrerAppel,
    ajouterDemandeEnfant: exports.ajouterDemandeEnfant,
    recupDemandesEnfant: exports.recupDemandesEnfant,
    validerDemandeEnfant: exports.validerDemandeEnfant,
    rejeterDemandeEnfant: exports.rejeterDemandeEnfant,
};
//# sourceMappingURL=functions.js.map