// Export Excel des listes de l'école du dimanche.
//
// Le bouton exporte le volet affiché, et lui seul. Il produisait auparavant un
// classeur de cinq feuilles quel que soit l'onglet ouvert : on cliquait depuis
// les enfants et on recevait un fichier qui s'ouvrait sur les classes, ce qui se
// lit comme un export des seules classes.
//
// Le nom du fichier porte le volet, pour qu'un dossier de plusieurs exports
// reste lisible sans avoir à les ouvrir.
//
// Les évaluations et l'assiduité ne sont pas ici : leurs grilles ont leur propre
// export, qui suit les filtres de classe et de période affichés à l'écran. Les
// exporter d'ici produirait des chiffres différents de ceux qu'on a sous les yeux.

import * as XLSX from 'xlsx';
import {
  CATEGORIES_SORTIE,
  PERSONNES_REFERENTES,
  SITUATIONS_SOCIALES,
  estInscrit,
  libelleSexe,
  libelleFonction,
  nomIntervenant,
} from '../constantes';

const LIBELLES_STATUT: Record<string, string> = {
  Planifiee: 'Planifiée',
  EnCours: 'En cours',
  Terminee: 'Terminée',
  Annulee: 'Annulée',
};

const ageDepuisNaissance = (date?: string | null): string | number => {
  if (!date) return '';

  const naissance = new Date(date);
  if (Number.isNaN(naissance.getTime())) return '';

  const maintenant = new Date();
  let age = maintenant.getFullYear() - naissance.getFullYear();
  const mois = maintenant.getMonth() - naissance.getMonth();

  if (mois < 0 || (mois === 0 && maintenant.getDate() < naissance.getDate())) {
    age -= 1;
  }

  return age >= 0 ? age : '';
};

const largeurs = (feuille: XLSX.WorkSheet, tailles: number[]) => {
  // Sans cette largeur, toutes les colonnes sortent à la taille par défaut et le
  // fichier est illisible sans ajustement manuel.
  feuille['!cols'] = tailles.map((wch) => ({ wch }));
  return feuille;
};

/** Les volets exportables, dans l'ordre des onglets de l'écran. */
export type VoletEcodim =
  | 'classes'
  | 'moniteurs'
  | 'enfants'
  | 'cultes'
  | 'activites'
  | 'finances';

export type DonneesEcodimExcel = {
  classes: any[];
  moniteurs: any[];
  enfants: any[];
  activites: any[];
  cultes?: any[];
  finances?: any[];
  nomEglise?: string;
};

const feuilleClasses = (donnees: DonneesEcodimExcel) =>
  largeurs(
    XLSX.utils.json_to_sheet(
      donnees.classes.map((classe) => ({
        Classe: classe.libelleClasse || '',
        "Tranche d'âge": classe.trancheAge || '',
        'Âge minimum': classe.ageMin ?? '',
        'Âge maximum': classe.ageMax ?? '',
        Moniteurs: classe.nombreMoniteurs ?? 0,
        Enfants: classe.nombreEnfants ?? 0,
        Description: classe.descriptionClasse || '',
      }))
    ),
    [24, 16, 12, 12, 11, 10, 40]
  );

const feuilleMoniteurs = (donnees: DonneesEcodimExcel) =>
  largeurs(
    XLSX.utils.json_to_sheet(
      donnees.moniteurs.map((moniteur) => ({
        Nom: moniteur.nomMembre || '',
        Prénoms: moniteur.prenomMembre || '',
        Contact: moniteur.contactMembre || '',
        Classe: moniteur.libelleClasse || 'Non affecté',
        Rôle: libelleFonction(moniteur.fonctionMoniteur),
        'Responsable de la classe': moniteur.estPrincipal ? 'Oui' : 'Non',
        "Date d'affectation": moniteur.dateAffectation || '',
      }))
    ),
    [20, 24, 16, 20, 32, 22, 18]
  );

const feuilleEnfants = (donnees: DonneesEcodimExcel) =>
  largeurs(
    XLSX.utils.json_to_sheet(
      donnees.enfants.map((enfant) => ({
        // Le matricule ouvre la feuille : c'est la clé qui permet de
        // rapprocher ce fichier d'un autre sans risque d'homonymie.
        Matricule: enfant.matriculeEnfant || '',
        Nom: enfant.nomEnfant || '',
        Prénoms: enfant.prenomEnfant || '',
        // Juste après le nom : c'est la colonne qu'on filtre ou qu'on trie pour
        // séparer les inscrits des autres.
        Inscrit: estInscrit(enfant) ? 'Oui' : 'Non',
        "Date d'inscription": estInscrit(enfant) ? enfant.dateInscriptionEcodim || '' : '',
        // « M » et « F » sont les valeurs stockées ; une feuille se lit à l'œil.
        Sexe: libelleSexe(enfant.sexeEnfant),
        'Date de naissance': enfant.dateNaissEnfant || '',
        Âge: ageDepuisNaissance(enfant.dateNaissEnfant),
        'Lieu de naissance': enfant.lieuNaissEnfant || '',
        "Lieu d'habitation": enfant.lieuHabitationEnfant || '',
        "N° appartement": enfant.numeroAppartement || '',
        'Contact enfant': enfant.contactEnfant || '',
        Classe: enfant.libelleClasse || 'Non affecté',
        'Groupe Ecodim': enfant.groupeEcodimEnfant || '',
        'Niveau scolaire': enfant.niveauScolaireEnfant || '',
        École: enfant.ecoleEnfant || '',
        'Parent ou tuteur': enfant.nomParentEnfant || '',
        'Contact parent': enfant.contactParentEnfant || '',
        'Email parent': enfant.emailParentEnfant || '',
        Adresse: enfant.adresseParentEnfant || '',
        'Église des parents': enfant.religionParents || '',
        'Tuteur converti': enfant.tuteurConverti || '',
        'Responsabilité du tuteur': enfant.responsabiliteTuteurEglise || '',
        'Profession du tuteur': enfant.professionTuteur || '',
        'Vit avec': PERSONNES_REFERENTES[enfant.vitAvec || ''] || '',
        "Vient à l'église avec": enfant.avecQuiVientEglise || '',

        'Nom du père': `${enfant.nomPere || ''} ${enfant.prenomPere || ''}`.trim(),
        'Habitation du père': enfant.lieuHabitationPere || '',
        'Profession du père': enfant.professionPere || '',
        'Contact du père': enfant.contactPere || '',
        'Père converti': enfant.pereConverti || '',
        'Religion du père': enfant.religionPere || '',

        'Nom de la mère': `${enfant.nomMere || ''} ${enfant.prenomMere || ''}`.trim(),
        'Habitation de la mère': enfant.lieuHabitationMere || '',
        'Profession de la mère': enfant.professionMere || '',
        'Contact de la mère': enfant.contactMere || '',
        'Mère convertie': enfant.mereConverti || '',
        'Religion de la mère': enfant.religionMere || '',

        "Date d'entrée": enfant.dateEntreeEcodim || '',
        "Niveau à l'entrée": enfant.niveauEntreeEcodim || '',
        'Niveau actuel': enfant.niveauActuelEcodim || '',
        'Date baptême Saint-Esprit': enfant.dateBaptemeEsprit || '',
        'Lieu baptême Saint-Esprit': enfant.lieuBaptemeEsprit || '',
        'Date de sortie': enfant.dateSortieEcodim || '',
        'Motif de sortie': CATEGORIES_SORTIE[enfant.categorieSortieEcodim || ''] || '',
        'Précision du motif': enfant.motifSortieEcodim || '',

        'Situation sociale': SITUATIONS_SOCIALES[enfant.situationSociale || ''] || '',
        'Précision situation': enfant.precisionSituationSociale || '',
        'Date de départ': enfant.dateDepart || '',
        'Motifs du départ': enfant.motifDepart || '',
      }))
    ),
    [
      14,
      20, 24, 9, 16, 10, 18, 7, 20, 24, 14, 16, 18, 16, 18, 22, 22, 16, 24, 30, 22, 14, 24, 20, 14, 24,
      22, 22, 20, 16, 12, 18,
      22, 22, 20, 16, 14, 18,
      14, 18, 18, 20, 22, 14, 22, 24, 18, 22, 14, 24,
    ]
  );

const feuilleActivites = (donnees: DonneesEcodimExcel) =>
  largeurs(
    XLSX.utils.json_to_sheet(
      donnees.activites.map((activite) => ({
        Activité: activite.titreActivite || '',
        Type: activite.typeActivite || '',
        Date: activite.dateDebutActivite || '',
        Début: activite.heureDebutActivite || '',
        Fin: activite.heureFinActivite || '',
        Lieu: activite.lieuActivite || '',
        Classe: activite.libelleClasse || 'Toutes les classes',
        Dirigeant: `${activite.nomDirigeant || ''} ${activite.prenomDirigeant || ''}`.trim(),
        Enseignant: `${activite.nomEnseignant || ''} ${activite.prenomEnseignant || ''}`.trim(),
        'Textes bibliques': activite.textesBibliques || '',
        Filles: Number(activite.nombreFilles) || 0,
        'Garçons': Number(activite.nombreGarcons) || 0,
        Total: (Number(activite.nombreFilles) || 0) + (Number(activite.nombreGarcons) || 0),
        // Les moniteurs encadrent : ils sont comptés à part du total des enfants.
        Moniteurs: Number(activite.nombreMoniteurs) || 0,
        Statut: LIBELLES_STATUT[activite.statutActivite] || activite.statutActivite || '',
        Description: activite.descriptionActivite || '',
      }))
    ),
    [28, 16, 12, 9, 9, 20, 20, 22, 22, 30, 8, 9, 8, 14, 14, 40]
  );

/** Cahier de texte : une ligne par culte, sujets et chants regroupés en une cellule. */
const feuilleCultes = (donnees: DonneesEcodimExcel) =>
  largeurs(
    XLSX.utils.json_to_sheet(
      (donnees.cultes || []).map((culte) => ({
        Date: culte.dateCulte || '',
        Classe: culte.libelleClasse || '',
        Dirigeant: nomIntervenant(
          culte.nomDirigeant,
          culte.prenomDirigeant,
          culte.nomDirigeantExterne
        ),
        Enseignant: nomIntervenant(
          culte.nomEnseignant,
          culte.prenomEnseignant,
          culte.nomEnseignantExterne
        ),
        'Leçon du jour': culte.leconDuJour || '',
        'Passage biblique': culte.passageBiblique || '',
        // Les listes sont stockées une entrée par ligne ; une cellule de tableur se lit
        // mal sur plusieurs lignes, on les met bout à bout.
        'Sujets de prière': String(culte.sujetsPriere || '').split('\n').join(' ; '),
        Chants: String(culte.chantsCulte || '').split('\n').join(' ; '),
        "Verset d'or": culte.versetOr || '',
        Filles: Number(culte.nombreFilles) || 0,
        Garçons: Number(culte.nombreGarcons) || 0,
        Total: (Number(culte.nombreFilles) || 0) + (Number(culte.nombreGarcons) || 0),
        Offrande: Number(culte.montantOffrande) || 0,
        Observations: culte.observationsCulte || '',
      }))
    ),
    [12, 20, 22, 22, 26, 20, 40, 40, 30, 8, 9, 8, 12, 30]
  );

/**
 * Caisse du département : une ligne par mouvement, puis le total.
 *
 * Recette et dépense occupent deux colonnes distinctes plutôt qu'un montant
 * signé : c'est la forme d'un livre de caisse, et elle se totalise d'un coup
 * d'œil sans avoir à trier les signes.
 */
const feuilleFinances = (donnees: DonneesEcodimExcel) => {
  const lignes = (donnees.finances || []).map((finance) => ({
    Date: finance.dateFinance || '',
    Libellé: finance.libelleFinance || '',
    Catégorie: finance.categorieFinance || '',
    Classe: finance.libelleClasse || '',
    Recette: Number(finance.entreeFinance) || 0,
    Dépense: Number(finance.sortieFinance) || 0,
    Observation: finance.observationFinance || '',
  }));

  const totalRecettes = lignes.reduce((somme, ligne) => somme + ligne.Recette, 0);
  const totalDepenses = lignes.reduce((somme, ligne) => somme + ligne.Dépense, 0);

  // Deux lignes de pied : les totaux, puis le solde. Sans elles, le point
  // financier reste à refaire à la main dans le tableur.
  const pied = [
    {
      Date: '',
      Libellé: 'TOTAL',
      Catégorie: '',
      Classe: '',
      Recette: totalRecettes,
      Dépense: totalDepenses,
      Observation: '',
    },
    {
      Date: '',
      Libellé: 'SOLDE',
      Catégorie: '',
      Classe: '',
      Recette: totalRecettes - totalDepenses,
      Dépense: 0,
      Observation: '',
    },
  ];

  return largeurs(
    XLSX.utils.json_to_sheet([...lignes, ...pied]),
    [12, 34, 22, 18, 14, 14, 40]
  );
};

/**
 * Les enfants inscrits, ou les autres, en liste courte.
 *
 * La feuille Enfants porte déjà la colonne Inscrit, mais ses quarante colonnes
 * se lisent mal à l'écran : ces deux feuilles répondent d'un coup d'œil à la
 * question « qui est inscrit, qui ne l'est pas ». Elles partent des mêmes lignes
 * que la feuille principale, donc des mêmes filtres.
 */
const feuilleInscription = (donnees: DonneesEcodimExcel, inscrits: boolean) =>
  largeurs(
    XLSX.utils.json_to_sheet(
      donnees.enfants
        .filter((enfant) => estInscrit(enfant) === inscrits)
        .map((enfant, index) => ({
          'N°': index + 1,
          Matricule: enfant.matriculeEnfant || '',
          Nom: enfant.nomEnfant || '',
          Prénoms: enfant.prenomEnfant || '',
          Classe: enfant.libelleClasse || 'Non affecté',
          Sexe: libelleSexe(enfant.sexeEnfant),
          Âge: ageDepuisNaissance(enfant.dateNaissEnfant),
          ...(inscrits ? { "Date d'inscription": enfant.dateInscriptionEcodim || '' } : {}),
          'Parent ou tuteur': enfant.nomParentEnfant || '',
          'Contact parent': enfant.contactParentEnfant || '',
        })),
      // Les en-têtes restent écrits même sans ligne : une feuille vide qui dit
      // « Non inscrits » se lit comme « aucun », pas comme une erreur.
      {
        header: [
          'N°',
          'Matricule',
          'Nom',
          'Prénoms',
          'Classe',
          'Sexe',
          'Âge',
          ...(inscrits ? ["Date d'inscription"] : []),
          'Parent ou tuteur',
          'Contact parent',
        ],
      }
    ),
    inscrits ? [5, 14, 20, 24, 18, 10, 6, 16, 24, 16] : [5, 14, 20, 24, 18, 10, 6, 24, 16]
  );

/**
 * Un volet, son nom d'onglet dans le classeur et sa construction.
 *
 * Le nom sert aussi au fichier : une seule source, donc aucune chance que
 * l'onglet du classeur annonce autre chose que ce qu'il contient.
 */
const VOLETS: Record<
  VoletEcodim,
  {
    nom: string;
    construire: (donnees: DonneesEcodimExcel) => XLSX.WorkSheet;
    /** Feuilles ajoutées après la principale, tirées des mêmes lignes. */
    annexes?: { nom: string; construire: (donnees: DonneesEcodimExcel) => XLSX.WorkSheet }[];
  }
> = {
  classes: { nom: 'Classes', construire: feuilleClasses },
  moniteurs: { nom: 'Moniteurs', construire: feuilleMoniteurs },
  enfants: {
    nom: 'Enfants',
    construire: feuilleEnfants,
    annexes: [
      { nom: 'Inscrits', construire: (donnees) => feuilleInscription(donnees, true) },
      { nom: 'Non inscrits', construire: (donnees) => feuilleInscription(donnees, false) },
    ],
  },
  cultes: { nom: 'Cultes', construire: feuilleCultes },
  activites: { nom: 'Activités', construire: feuilleActivites },
  finances: { nom: 'Finances', construire: feuilleFinances },
};

const partieDeNomDeFichier = (valeur: string): string =>
  String(valeur || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const exporterEcodimExcel = (
  donnees: DonneesEcodimExcel & { volet: VoletEcodim }
): void => {
  const feuille = VOLETS[donnees.volet];
  const classeur = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(classeur, feuille.construire(donnees), feuille.nom);
  (feuille.annexes || []).forEach((annexe) =>
    XLSX.utils.book_append_sheet(classeur, annexe.construire(donnees), annexe.nom)
  );

  const eglise = partieDeNomDeFichier(donnees.nomEglise || '') || 'eglise';
  const date = new Date().toISOString().slice(0, 10);

  XLSX.writeFile(classeur, `ecodim-${partieDeNomDeFichier(feuille.nom)}-${eglise}-${date}.xlsx`);
};
