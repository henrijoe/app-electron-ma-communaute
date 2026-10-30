// ----------------------------------------------------------------------
// Libellés partagés par l'écran Ecodim, l'impression et l'export Excel.
//
// Règle du projet : la clé est la valeur stockée en base, volontairement sans
// accent ; la valeur est le libellé affiché. Accentuer la clé romprait la
// correspondance avec les lignes déjà enregistrées.

/** Fonctions au bureau de l'école du dimanche. La chaîne vide signifie « Aucun ». */
export const FONCTIONS_MONITEUR: Record<string, string> = {
  Directeur: 'Directeur',
  Directrice: 'Directrice',
  DirecteurAdjoint: 'Directeur adjoint',
  DirectriceAdjointe: 'Directrice adjointe',
  Secretaire: 'Secrétaire',
  SecretaireAdjoint: 'Secrétaire adjoint',
  SecretaireAdjointe: 'Secrétaire adjointe',
  Tresorier: 'Trésorier',
  Tresoriere: 'Trésorière',
  TresorierAdjoint: 'Trésorier adjoint',
  TresoriereAdjointe: 'Trésorière adjointe',
  SecretaireOrganisation: "Secrétaire à l'organisation",
  SecretaireOrganisationAdjoint: "Secrétaire à l'organisation adjoint",
  SecretaireOrganisationAdjointe: "Secrétaire à l'organisation adjointe",
  Membre: 'Membre',
  Aumonier: 'Aumônier',
  Autres: 'Autres',
};

/**
 * Libellé de la fonction d'un moniteur. Un moniteur sans fonction au bureau reste
 * affiché « Moniteur » : c'est ce qu'il est, et une cellule vide se lirait comme
 * une donnée manquante.
 */
export const libelleFonction = (fonction?: string | null): string =>
  FONCTIONS_MONITEUR[fonction || ''] || 'Moniteur';

/** Sexe de l'enfant. « M » et « F » sont les valeurs stockées, invariables. */
export const libelleSexe = (sexe?: string | null): string => {
  if (sexe === 'M') return 'Masculin';
  if (sexe === 'F') return 'Féminin';
  return '';
};

// ----------------------------------------------------------------------
// Champs à choix du dossier enfant. Comme partout ailleurs, la clé est la valeur
// stockée — sans accent — et la valeur le libellé affiché.

/** Avec qui l'enfant vit au quotidien. */
export const PERSONNES_REFERENTES: Record<string, string> = {
  Pere: 'Le père',
  Mere: 'La mère',
  Tuteur: 'Un tuteur',
};

/** Réponse à « Sont-ils convertis ? » sur le formulaire papier. */
export const REPONSES_CONVERSION: Record<string, string> = {
  Oui: 'Oui',
  Non: 'Non',
};

/** « Que fais-tu dans la vie sociale ? » — 1, 2 ou 3 sur le formulaire papier. */
export const SITUATIONS_SOCIALES: Record<string, string> = {
  Eleve: 'Élève',
  Etudiant: 'Étudiant',
  Autres: 'Autres',
};

/** Les cases à cocher qui accompagnent le motif de sortie. */
export const CATEGORIES_SORTIE: Record<string, string> = {
  BaptemeEau: "Baptême d'eau",
  Demenagement: 'Déménagement des parents',
  RaisonsEtude: "Raisons d'étude",
  Autres: 'Autres',
};

/**
 * Nom de celui qui a dirigé ou enseigné un culte.
 *
 * Le serveur joint le nom du moniteur quand il y en a un ; sinon le cahier porte
 * un nom saisi librement, pour un invité, un parent ou un pasteur qui n'est pas
 * moniteur. L'affichage ne doit pas avoir à savoir lequel des deux cas s'applique.
 */
export const nomIntervenant = (
  nom?: string | null,
  prenom?: string | null,
  nomLibre?: string | null
): string => {
  const joint = `${nom || ''} ${prenom || ''}`.trim();
  return joint || String(nomLibre || '').trim() || '—';
};

/** Les trois niveaux d'évaluation de l'école du dimanche. */
export const TYPES_EVALUATION: Record<string, string> = {
  Locale: 'Évaluation locale',
  Regionale: 'Évaluation régionale',
  Nationale: 'Évaluation nationale',
};

/**
 * L'enfant est-il inscrit à l'Ecodim ?
 *
 * La case arrive en booléen du formulaire, et en 0 ou 1 d'une ligne relue du
 * serveur : un test `=== true` seul rangerait tous les enfants enregistrés
 * parmi les non-inscrits.
 */
export const estInscrit = (enfant: any): boolean =>
  enfant?.inscritEcodim === true || Number(enfant?.inscritEcodim) === 1;
