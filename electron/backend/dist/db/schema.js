"use strict";
// Source unique du schéma des tables partagées entre SQLite (poste local) et MySQL (serveur en ligne).
//
// Pourquoi ce fichier : le dump `templates/ma-communaute.sql` et les bases SQLite réelles
// avaient divergé. `agenda` existait dans les bases locales mais dans aucun script ;
// `nouvelleame` n'existait nulle part alors que le module l'interroge ; `famille_jeunesse`
// se créait à l'exécution avec son DDL écrit deux fois. Résultat : le même code ne pouvait
// pas tourner indifféremment sur les deux moteurs.
//
// Ici le schéma est décrit une seule fois, et le SQL est produit pour chaque moteur.
// Ajouter une colonne = une ligne dans ce fichier, et les deux bases suivent.
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSharedColumnStatements = exports.buildSharedCreateStatements = exports.SHARED_COLUMNS = exports.SHARED_TABLES = exports.buildAddColumnSql = exports.buildCreateTableSql = void 0;
const TYPES = {
    pk: {
        sqlite: "INTEGER PRIMARY KEY AUTOINCREMENT",
        mysql: "INT AUTO_INCREMENT PRIMARY KEY",
    },
    int: { sqlite: "INTEGER", mysql: "INT" },
    text: { sqlite: "TEXT", mysql: "VARCHAR(255)" },
    longtext: { sqlite: "TEXT", mysql: "TEXT" },
    datetime: { sqlite: "DATETIME", mysql: "DATETIME" },
};
const columnSql = (column, dialect) => {
    const parts = [column.name, TYPES[column.type][dialect]];
    if (column.type !== "pk") {
        if (column.notNull) {
            parts.push("NOT NULL");
        }
        // MySQL refuse une valeur par défaut sur une colonne TEXT (avant la 8.0.13),
        // d'où l'exception pour "longtext".
        const supportsDefault = !(dialect === "mysql" && column.type === "longtext");
        if (column.default !== undefined && supportsDefault) {
            parts.push(`DEFAULT ${column.default}`);
        }
    }
    return parts.join(" ");
};
const buildCreateTableSql = (table, dialect) => {
    const columns = table.columns.map((column) => `  ${columnSql(column, dialect)}`).join(",\n");
    return `CREATE TABLE IF NOT EXISTS ${table.name} (\n${columns}\n)`;
};
exports.buildCreateTableSql = buildCreateTableSql;
const buildAddColumnSql = (tableName, column, dialect) => `ALTER TABLE ${tableName} ADD COLUMN ${columnSql(column, dialect)}`;
exports.buildAddColumnSql = buildAddColumnSql;
// ---------------------------------------------------------------- définitions
const agenda = {
    name: "agenda",
    columns: [
        { name: "idAgenda", type: "pk" },
        { name: "titreAgenda", type: "text", notNull: true },
        { name: "typeAgenda", type: "text", notNull: true },
        { name: "dateAgenda", type: "text" },
        { name: "heureDebutAgenda", type: "text" },
        { name: "heureFinAgenda", type: "text" },
        { name: "lieuAgenda", type: "text" },
        { name: "descriptionAgenda", type: "longtext" },
        { name: "couleurAgenda", type: "text", default: "'#0ea5e9'" },
        // Valeur stockée, pas un libellé : le front l'affiche via eventStatusLabels.
        { name: "statutAgenda", type: "text", default: "'Programme'" },
        { name: "idUtilisateur", type: "int", notNull: true },
        { name: "dateCreation", type: "datetime", default: "CURRENT_TIMESTAMP" },
    ],
};
const familleJeunesse = {
    name: "famille_jeunesse",
    columns: [
        { name: "idFamilleJeunesse", type: "pk" },
        { name: "nomFamilleJeunesse", type: "text", default: "''" },
        { name: "sloganFamille", type: "text", default: "''" },
        { name: "conseillerFamille", type: "text", default: "''" },
        { name: "nomAnimateur", type: "text", default: "''" },
        { name: "nomViceAnimateur", type: "text", default: "''" },
        { name: "nomSecretaire", type: "text", default: "''" },
        { name: "nomSecretaireAdjoint", type: "text", default: "''" },
        { name: "nomTresorier", type: "text", default: "''" },
        { name: "nomTresorierAdjoint", type: "text", default: "''" },
        { name: "nomSecretaireOrganisation1", type: "text", default: "''" },
        { name: "nomSecretaireOrganisation2", type: "text", default: "''" },
        { name: "nomSecretaireOrganisation3", type: "text", default: "''" },
        { name: "nomCommissaireAuCompte", type: "text", default: "''" },
        { name: "nomCommissaireAuCompteAdjoint", type: "text", default: "''" },
        { name: "nombreMembreTotal", type: "int", default: "0" },
        { name: "nombreMembreActuel", type: "int", default: "0" },
        { name: "remarque", type: "longtext", default: "''" },
        { name: "idUtilisateur", type: "int", notNull: true },
    ],
};
// Le module interroge bien `nouvelleame` en un seul mot (le dossier, lui, s'appelle
// nouvelle_ame) : la table n'existait ni dans le dump ni dans les bases locales.
const nouvelleAme = {
    name: "nouvelleame",
    columns: [
        { name: "idNouvelleAme", type: "pk" },
        { name: "nomNouvelleAme", type: "text", default: "''" },
        { name: "prenomNouvelleAme", type: "text", default: "''" },
        { name: "dateConversionNouvelleAme", type: "text" },
        { name: "lieuHabitationNouvelleAme", type: "text", default: "''" },
        { name: "fonctionNouvelleAme", type: "text", default: "''" },
        { name: "contactNouvelleAme", type: "text", default: "''" },
        { name: "sexeNouvelleAme", type: "text", default: "''" },
        { name: "emailNouvelleAme", type: "text", default: "''" },
        { name: "idEglise", type: "int" },
        { name: "idCellule", type: "int" },
        { name: "idDepartement", type: "int" },
        { name: "idResponsabilite", type: "int" },
        { name: "idDomaineActivite", type: "int" },
        { name: "idUtilisateur", type: "int", notNull: true },
        { name: "idGroupe", type: "int" },
    ],
};
// ---------------------------------------------------------------- ECODIM
// École du dimanche : classes, moniteurs et enfants.
//
// Un moniteur n'est pas ressaisi : c'est un membre de l'église, déjà créé dans
// l'onglet Membre. La table ne porte donc que le rattachement (idMembre) et
// l'affectation à une classe, jamais une seconde fois l'identité.
const ecodimClasse = {
    name: "ecodim_classe",
    columns: [
        { name: "idClasseEcodim", type: "pk" },
        { name: "libelleClasse", type: "text", notNull: true },
        // Libellé libre ("6 à 8 ans"), doublé de bornes numériques pour les filtres.
        { name: "trancheAge", type: "text", default: "''" },
        { name: "ageMin", type: "int" },
        { name: "ageMax", type: "int" },
        { name: "descriptionClasse", type: "longtext", default: "''" },
        { name: "actifClasse", type: "int", default: "1" },
        { name: "idUtilisateur", type: "int", notNull: true },
        { name: "dateCreation", type: "datetime", default: "CURRENT_TIMESTAMP" },
    ],
};
const ecodimMoniteur = {
    name: "ecodim_moniteur",
    columns: [
        { name: "idMoniteur", type: "pk" },
        // Le moniteur EST un membre : son nom, son contact et sa photo viennent de là.
        { name: "idMembre", type: "int", notNull: true },
        { name: "idClasseEcodim", type: "int" },
        // Responsable de la classe, par opposition aux moniteurs qui l'assistent.
        { name: "estPrincipal", type: "int", default: "0" },
        // Fonction au bureau de l'école du dimanche (directeur, trésorière, aumônier...).
        // Valeur stockée sans accent, affichée via un dictionnaire de libellés : accentuer
        // la valeur casserait la correspondance avec les lignes déjà enregistrées.
        { name: "fonctionMoniteur", type: "text", default: "''" },
        { name: "dateAffectation", type: "text" },
        { name: "actifMoniteur", type: "int", default: "1" },
        { name: "idUtilisateur", type: "int", notNull: true },
        { name: "dateCreation", type: "datetime", default: "CURRENT_TIMESTAMP" },
    ],
};
const ecodimEnfant = {
    name: "ecodim_enfant",
    columns: [
        { name: "idEnfantEcodim", type: "pk" },
        { name: "nomEnfant", type: "text", notNull: true },
        { name: "prenomEnfant", type: "text", default: "''" },
        { name: "sexeEnfant", type: "text", default: "''" },
        { name: "dateNaissEnfant", type: "text" },
        { name: "lieuNaissEnfant", type: "text", default: "''" },
        // Lieu d'habitation de l'enfant : il ne vit pas toujours chez le parent déclaré.
        { name: "lieuHabitationEnfant", type: "text", default: "''" },
        { name: "niveauScolaireEnfant", type: "text", default: "''" },
        { name: "activiteEnfant", type: "text", default: "''" },
        // L'enfant n'est pas un membre : c'est un parent ou tuteur qu'on contacte.
        { name: "nomParentEnfant", type: "text", default: "''" },
        { name: "contactParentEnfant", type: "text", default: "''" },
        { name: "emailParentEnfant", type: "text", default: "''" },
        { name: "adresseParentEnfant", type: "longtext", default: "''" },
        { name: "religionParents", type: "text", default: "''" },
        // Nom du fichier stocké dans le dossier ecodim-medias, servi par /ecodim-medias.
        // Les moniteurs n'ont pas de colonne équivalente : leur photo est celle du membre.
        { name: "photoEnfant", type: "text", default: "''" },
        // ------------------------------------------------------------------
        // Champs du formulaire d'identification du département enfants.
        //
        // Les valeurs à choix sont stockées SANS ACCENT et traduites à l'affichage par
        // un dictionnaire de libellés, comme les statuts d'activité : accentuer la
        // valeur stockée romprait la correspondance avec les lignes déjà saisies.
        { name: "contactEnfant", type: "text", default: "''" },
        { name: "numeroAppartement", type: "text", default: "''" },
        // Le père et la mère, pris séparément. Le tuteur, lui, réutilise les colonnes
        // « parent ou tuteur » existantes : c'est déjà ce qu'elles contiennent, et les
        // dédoubler créerait deux sources pour la même information.
        { name: "nomPere", type: "text", default: "''" },
        { name: "prenomPere", type: "text", default: "''" },
        { name: "lieuHabitationPere", type: "text", default: "''" },
        { name: "professionPere", type: "text", default: "''" },
        { name: "contactPere", type: "text", default: "''" },
        { name: "pereConverti", type: "text", default: "''" },
        { name: "nomMere", type: "text", default: "''" },
        { name: "prenomMere", type: "text", default: "''" },
        { name: "lieuHabitationMere", type: "text", default: "''" },
        { name: "professionMere", type: "text", default: "''" },
        { name: "contactMere", type: "text", default: "''" },
        { name: "mereConverti", type: "text", default: "''" },
        { name: "tuteurConverti", type: "text", default: "''" },
        // Avec qui vit l'enfant : Pere, Mere ou Tuteur.
        { name: "vitAvec", type: "text", default: "''" },
        // ------------------------------------------------------------------
        // Champs propres a la fiche d'inscription du departement enfants.
        //
        // "religionParents" existait deja, mais la fiche demande la religion du pere
        // et celle de la mere separement : elles ne sont pas toujours les memes, et
        // c'est precisement ce que la fiche cherche a savoir. L'ancienne colonne
        // reste en place, le formulaire d'identification s'en sert toujours.
        { name: "groupeEcodimEnfant", type: "text", default: "''" },
        { name: "ecoleEnfant", type: "text", default: "''" },
        { name: "religionPere", type: "text", default: "''" },
        { name: "religionMere", type: "text", default: "''" },
        // Qui accompagne l'enfant au culte : ce n'est pas toujours celui chez qui il
        // vit, et c'est la personne que les moniteurs croisent chaque dimanche.
        { name: "avecQuiVientEglise", type: "text", default: "''" },
        { name: "responsabiliteTuteurEglise", type: "text", default: "''" },
        { name: "professionTuteur", type: "text", default: "''" },
        { name: "dateEntreeEcodim", type: "text" },
        { name: "niveauEntreeEcodim", type: "text", default: "''" },
        { name: "niveauActuelEcodim", type: "text", default: "''" },
        { name: "dateBaptemeEsprit", type: "text" },
        { name: "lieuBaptemeEsprit", type: "text", default: "''" },
        { name: "dateSortieEcodim", type: "text" },
        { name: "motifSortieEcodim", type: "longtext", default: "''" },
        // BaptemeEau, Demenagement, RaisonsEtude ou Autres.
        { name: "categorieSortieEcodim", type: "text", default: "''" },
        // Eleve, Etudiant ou Autres.
        { name: "situationSociale", type: "text", default: "''" },
        { name: "precisionSituationSociale", type: "text", default: "''" },
        { name: "dateDepart", type: "text" },
        { name: "motifDepart", type: "longtext", default: "''" },
        { name: "idClasseEcodim", type: "int" },
        { name: "actifEnfant", type: "int", default: "1" },
        { name: "idUtilisateur", type: "int", notNull: true },
        { name: "dateCreation", type: "datetime", default: "CURRENT_TIMESTAMP" },
    ],
};
// Activités de l'école du dimanche : culte des enfants, sortie, répétition, fête...
// Une activité peut viser une classe précise ou toutes les classes (idClasseEcodim vide).
const ecodimActivite = {
    name: "ecodim_activite",
    columns: [
        { name: "idActiviteEcodim", type: "pk" },
        { name: "titreActivite", type: "text", notNull: true },
        { name: "typeActivite", type: "text", default: "''" },
        { name: "descriptionActivite", type: "longtext", default: "''" },
        { name: "lieuActivite", type: "text", default: "''" },
        { name: "dateDebutActivite", type: "text" },
        { name: "dateFinActivite", type: "text" },
        { name: "heureDebutActivite", type: "text", default: "''" },
        { name: "heureFinActivite", type: "text", default: "''" },
        { name: "idClasseEcodim", type: "int" },
        // Une sortie, une veillée ou une fête des enfants se raconte comme un culte :
        // qui a dirigé, qui a enseigné, sur quels textes, et combien d'enfants étaient là.
        { name: "idMoniteurDirigeant", type: "int" },
        { name: "idMoniteurEnseignant", type: "int" },
        { name: "nomEnseignantExterne", type: "text", default: "''" },
        { name: "textesBibliques", type: "longtext", default: "''" },
        { name: "nombreFilles", type: "int", default: "0" },
        { name: "nombreGarcons", type: "int", default: "0" },
        // Moniteurs presents : ils encadrent la sortie ou la veillee, et ne sont pas
        // comptes parmi les enfants.
        { name: "nombreMoniteurs", type: "int", default: "0" },
        // Valeur stockée, volontairement sans accent : l'affichage passe par un
        // dictionnaire de libellés, comme pour les statuts de l'agenda.
        { name: "statutActivite", type: "text", default: "'Planifiee'" },
        { name: "actifActivite", type: "int", default: "1" },
        { name: "idUtilisateur", type: "int", notNull: true },
        { name: "dateCreation", type: "datetime", default: "CURRENT_TIMESTAMP" },
    ],
};
// Photos d'une activité, sur le modèle de la galerie des évènements : plusieurs
// images par activité, chacune avec une légende facultative.
const ecodimActiviteImage = {
    name: "ecodim_activite_image",
    columns: [
        { name: "idImageActivite", type: "pk" },
        { name: "idActiviteEcodim", type: "int", notNull: true },
        { name: "fichierImage", type: "text", notNull: true },
        { name: "legendeImage", type: "text", default: "''" },
        { name: "idUtilisateur", type: "int", notNull: true },
        { name: "dateCreation", type: "datetime", default: "CURRENT_TIMESTAMP" },
    ],
};
// Abonnement d'une église au service en ligne. Une ligne par compte : la dernière
// souscription fait foi, son historique de paiements vit chez SasPay.
const abonnement = {
    name: "abonnement",
    columns: [
        { name: "idAbonnement", type: "pk" },
        { name: "idUtilisateur", type: "int", notNull: true },
        // "mensuel" | "annuel"
        { name: "plan", type: "text", default: "'mensuel'" },
        // "en_attente" | "actif" | "expire" | "annule"
        { name: "statut", type: "text", default: "'en_attente'" },
        { name: "dateDebut", type: "text" },
        { name: "dateFin", type: "text" },
        { name: "montant", type: "int", default: "0" },
        { name: "devise", type: "text", default: "'XOF'" },
        // Notre référence, transmise à SasPay en metadata et relue au retour du webhook.
        { name: "reference", type: "text" },
        // Identifiant de la session de paiement SasPay : permet d'interroger son statut
        // quand aucun webhook n'est configuré (test en local, ou notification perdue).
        { name: "sessionId", type: "text" },
        // Identifiant SasPay de la transaction : sert de garde d'idempotence, le webhook
        // étant réémis jusqu'à cinq fois.
        { name: "transactionId", type: "text" },
        { name: "moyenPaiement", type: "text" },
        { name: "checkoutUrl", type: "longtext" },
        { name: "dateCreation", type: "datetime", default: "CURRENT_TIMESTAMP" },
        { name: "dateModification", type: "text" },
    ],
};
// Tables absentes du dump MySQL, donc à créer par le code sur les deux moteurs.
/**
 * Cahier de texte de l'école du dimanche : une ligne par culte et par classe.
 *
 * Chaque dimanche, une classe peut réunir plusieurs moniteurs — l'un dirige, l'autre
 * enseigne — et rien n'empêche que ce soit la même personne pour les deux rôles.
 * Le cahier est tenu à la main dans chaque classe, puis saisi ici par le secrétariat.
 */
const ecodimCulte = {
    name: "ecodim_culte",
    columns: [
        { name: "idCulteEcodim", type: "pk" },
        { name: "dateCulte", type: "text", notNull: true },
        { name: "idClasseEcodim", type: "int" },
        // Direction du culte. Un invite, un pasteur ou un parent peut diriger sans
        // etre moniteur : son nom est alors saisi librement, et aucun identifiant ne
        // le rattache a la liste des moniteurs.
        { name: "idMoniteurDirigeant", type: "int" },
        { name: "nomDirigeantExterne", type: "text", default: "''" },
        // Sujets de prière et chants : une entrée par ligne. Ce sont des listes libres
        // qu'on relit telles quelles, jamais des valeurs sur lesquelles on filtre.
        { name: "sujetsPriere", type: "longtext", default: "''" },
        { name: "chantsCulte", type: "longtext", default: "''" },
        // Enseignement.
        { name: "idMoniteurEnseignant", type: "int" },
        { name: "nomEnseignantExterne", type: "text", default: "''" },
        { name: "leconDuJour", type: "text", default: "''" },
        { name: "passageBiblique", type: "text", default: "''" },
        { name: "resumePredication", type: "longtext", default: "''" },
        { name: "versetOr", type: "longtext", default: "''" },
        { name: "montantOffrande", type: "int", default: "0" },
        { name: "nombreFilles", type: "int", default: "0" },
        { name: "nombreGarcons", type: "int", default: "0" },
        // Signatures : on garde le NOM et non l'identifiant du moniteur. Le cahier est
        // un document d'archive ; si la directrice change l'an prochain, les cultes de
        // cette année doivent continuer de porter le nom de celle qui a signé.
        { name: "nomSignatureEnseignant", type: "text", default: "''" },
        { name: "nomSignatureResponsable", type: "text", default: "''" },
        { name: "nomSignatureDirection", type: "text", default: "''" },
        { name: "observationsCulte", type: "longtext", default: "''" },
        { name: "idUtilisateur", type: "int", notNull: true },
        { name: "dateCreation", type: "datetime", default: "CURRENT_TIMESTAMP" },
    ],
};
/**
 * Rattachement d'un moniteur a une classe.
 *
 * Un moniteur encadre souvent plusieurs classes, et peut etre responsable de
 * l'une sans l'etre de l'autre : le lien porte donc `estPrincipal`, et non le
 * moniteur. Les colonnes `idClasseEcodim` et `estPrincipal` de `ecodim_moniteur`
 * restent en base pour les lignes anterieures, mais ne sont plus la reference :
 * tout passe desormais par cette table.
 */
const ecodimMoniteurClasse = {
    name: "ecodim_moniteur_classe",
    columns: [
        { name: "idMoniteurClasse", type: "pk" },
        { name: "idMoniteur", type: "int", notNull: true },
        { name: "idClasseEcodim", type: "int", notNull: true },
        { name: "estPrincipal", type: "int", default: "0" },
        { name: "idUtilisateur", type: "int", notNull: true },
        { name: "dateCreation", type: "datetime", default: "CURRENT_TIMESTAMP" },
    ],
};
/**
 * Une evaluation de l'ecole du dimanche.
 *
 * Trois niveaux : locale, regionale, nationale. Le `coefficient` pondere la
 * moyenne de l'enfant, et `noteSur` retient le bareme : toutes les evaluations
 * ne sont pas notees sur 20, et comparer des notes de baremes differents sans
 * les ramener a une echelle commune donnerait un classement faux.
 *
 * Une evaluation sans classe vaut pour toutes : c'est le cas des evaluations
 * regionales et nationales.
 */
const ecodimEvaluation = {
    name: "ecodim_evaluation",
    columns: [
        { name: "idEvaluation", type: "pk" },
        { name: "libelleEvaluation", type: "text", notNull: true },
        // Valeur stockee sans accent : Locale, Regionale ou Nationale.
        { name: "typeEvaluation", type: "text", default: "'Locale'" },
        { name: "idClasseEcodim", type: "int" },
        { name: "dateEvaluation", type: "text" },
        { name: "coefficient", type: "int", default: "1" },
        { name: "noteSur", type: "int", default: "20" },
        { name: "anneeEcclesiastique", type: "text", default: "''" },
        { name: "idUtilisateur", type: "int", notNull: true },
        { name: "dateCreation", type: "datetime", default: "CURRENT_TIMESTAMP" },
    ],
};
/**
 * Classes concernees par une evaluation.
 *
 * Une evaluation regionale ou nationale est **une seule** epreuve, passee par
 * plusieurs classes : elle doit donc rester une seule ligne, avec autant de
 * rattachements que de classes. La dupliquer par classe donnerait quatre colonnes
 * pour un meme devoir.
 *
 * La colonne `ecodim_evaluation.idClasseEcodim` reste en base pour les lignes
 * anterieures, mais ne fait plus foi : tout passe par cette table.
 */
const ecodimEvaluationClasse = {
    name: "ecodim_evaluation_classe",
    columns: [
        { name: "idEvaluationClasse", type: "pk" },
        { name: "idEvaluation", type: "int", notNull: true },
        { name: "idClasseEcodim", type: "int", notNull: true },
        { name: "idUtilisateur", type: "int", notNull: true },
    ],
};
/** La note d'un enfant a une evaluation. Une ligne par couple enfant/evaluation. */
const ecodimNote = {
    name: "ecodim_note",
    columns: [
        { name: "idNoteEcodim", type: "pk" },
        { name: "idEvaluation", type: "int", notNull: true },
        { name: "idEnfantEcodim", type: "int", notNull: true },
        // Stockee en texte : une note peut valoir 12,5 et les entiers la tronqueraient.
        { name: "valeurNote", type: "text", default: "''" },
        { name: "idUtilisateur", type: "int", notNull: true },
        { name: "dateCreation", type: "datetime", default: "CURRENT_TIMESTAMP" },
    ],
};
/**
 * Appel nominatif d'un dimanche, enfant par enfant.
 *
 * L'appel se rattache au CULTE et non a une date libre : un culte porte deja le
 * dimanche, la classe, le moniteur et la lecon. Creer une seconde notion de
 * "dimanche" ferait deux verites pour la meme seance, qui finiraient par diverger.
 *
 * Les compteurs "nombreFilles" et "nombreGarcons" du culte deviennent de ce fait
 * calculables : ils restent saisissables pour les seances anciennes, ou l'appel
 * n'a jamais ete fait.
 *
 * Le statut est stocke SANS ACCENT, comme les autres valeurs a choix : present,
 * absent ou excuse. Un enfant sans ligne n'a pas ete appele -- ce qui n'est pas
 * la meme chose qu'une absence, et doit le rester.
 */
const ecodimPresence = {
    name: "ecodim_presence",
    columns: [
        { name: "idPresenceEcodim", type: "pk" },
        { name: "idCulteEcodim", type: "int", notNull: true },
        { name: "idEnfantEcodim", type: "int", notNull: true },
        { name: "statutPresence", type: "text", default: "'present'" },
        // Motif d'une absence excusee : maladie, voyage, examen...
        { name: "motifPresence", type: "text", default: "''" },
        { name: "idUtilisateur", type: "int", notNull: true },
        { name: "dateCreation", type: "datetime", default: "CURRENT_TIMESTAMP" },
    ],
};
/**
 * Demande d'inscription d'un enfant, envoyee depuis le QR code public.
 *
 * Meme principe que "membre_inscription_demande" : la fiche remplie par le
 * parent est conservee telle quelle en JSON, et l'enfant n'est cree qu'une fois
 * la demande acceptee. Garder la fiche d'origine permet de retrouver ce qui a
 * ete saisi meme apres correction, et de rejeter sans rien perdre.
 *
 * Les trois colonnes nommees a cote du JSON ne sont pas une duplication : la
 * liste des demandes en attente doit s'afficher et se dedoublonner sans avoir a
 * ouvrir chaque fiche.
 */
const ecodimEnfantDemande = {
    name: "ecodim_enfant_demande",
    columns: [
        { name: "idDemandeEnfant", type: "pk" },
        { name: "idUtilisateur", type: "int", notNull: true },
        { name: "nomEnfant", type: "text", default: "''" },
        { name: "prenomEnfant", type: "text", default: "''" },
        { name: "contactParentEnfant", type: "text", default: "''" },
        { name: "payloadDemande", type: "longtext", default: "''" },
        // en_attente, validee ou rejetee. Sans accent, comme les autres statuts.
        { name: "statutDemande", type: "text", default: "'en_attente'" },
        { name: "idEnfantCree", type: "int" },
        { name: "motifRejet", type: "text", default: "''" },
        { name: "dateCreation", type: "datetime", default: "CURRENT_TIMESTAMP" },
        { name: "dateTraitement", type: "datetime" },
    ],
};
exports.SHARED_TABLES = [
    agenda,
    familleJeunesse,
    nouvelleAme,
    abonnement,
    ecodimClasse,
    ecodimMoniteur,
    ecodimMoniteurClasse,
    ecodimEnfant,
    ecodimActivite,
    ecodimActiviteImage,
    ecodimCulte,
    ecodimEvaluation,
    ecodimEvaluationClasse,
    ecodimNote,
    ecodimPresence,
    ecodimEnfantDemande,
];
// Colonnes ajoutées après coup à des tables qui, elles, existent bien dans le dump.
// Elles n'étaient posées que sur SQLite : en MySQL, les requêtes qui les utilisent
// échouaient avec "Unknown column".
exports.SHARED_COLUMNS = [
    {
        // Corbeille de la comptabilité : archivage, motif et auteur de la suppression.
        table: "comptabilite",
        columns: [
            { name: "estSupprimeComptabilite", type: "int", default: "0" },
            { name: "dateSuppressionComptabilite", type: "text" },
            { name: "motifSuppressionComptabilite", type: "text" },
            { name: "supprimeParUtilisateur", type: "int" },
        ],
    },
];
/** CREATE TABLE IF NOT EXISTS pour chaque table partagée. */
const buildSharedCreateStatements = (dialect) => exports.SHARED_TABLES.map((table) => (0, exports.buildCreateTableSql)(table, dialect));
exports.buildSharedCreateStatements = buildSharedCreateStatements;
/**
 * ALTER TABLE ... ADD COLUMN pour chaque colonne des tables partagées.
 * À exécuter en tolérant les erreurs : une colonne déjà présente en produit une,
 * et c'est le cas normal sur une base à jour. Ni SQLite ni MySQL 5.7 ne proposent
 * de "ADD COLUMN IF NOT EXISTS".
 */
const buildSharedColumnStatements = (dialect) => [
    ...exports.SHARED_TABLES.flatMap((table) => table.columns
        .filter((column) => column.type !== "pk")
        .map((column) => (0, exports.buildAddColumnSql)(table.name, column, dialect))),
    ...exports.SHARED_COLUMNS.flatMap((patch) => patch.columns.map((column) => (0, exports.buildAddColumnSql)(patch.table, column, dialect))),
];
exports.buildSharedColumnStatements = buildSharedColumnStatements;
//# sourceMappingURL=schema.js.map