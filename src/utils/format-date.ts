// Dates affichées, au format jj/mm/aaaa.
//
// « 2026-11-07 » se lit comme une donnée technique, pas comme une date. Les
// tableaux et les états montrent donc toujours « 07/11/2026 », quelle que soit
// la forme reçue de la base.
//
// Seul l'AFFICHAGE passe par ici. Les champs de saisie gardent la forme ISO,
// imposée par <input type="date"> : les convertir casserait la saisie.
//
// Une douzaine d'écrans portaient chacun leur propre formateur, avec des sorties
// voisines mais pas identiques. Les nouveaux affichages s'appuient sur celui-ci.

/** Préfixe « AAAA-MM-JJ », qu'il soit suivi d'une heure ou non. */
const JOUR_ISO = /^(\d{4})-(\d{2})-(\d{2})/;

/**
 * Date au format jj/mm/aaaa.
 *
 * La chaîne ISO est découpée telle quelle, sans passer par `new Date` : une
 * date seule y est comprise comme minuit UTC, et un fuseau en retard la
 * ramènerait à la veille. Le 1er du mois deviendrait le dernier du mois
 * précédent, sans qu'aucune erreur ne soit levée.
 *
 * `siVide` est rendu quand il n'y a rien à afficher : chaque écran a sa propre
 * convention — un tiret cadratin, deux traits, une phrase.
 */
export const formaterDate = (
  valeur?: string | number | Date | null,
  siVide = ''
): string => {
  if (valeur === null || valeur === undefined || valeur === '') {
    return siVide;
  }

  const brute = String(valeur).trim();

  if (!brute) {
    return siVide;
  }

  const correspondance = brute.match(JOUR_ISO);

  if (correspondance) {
    const [, annee, mois, jour] = correspondance;
    return `${jour}/${mois}/${annee}`;
  }

  const date = new Date(brute);

  // Valeur illisible : on la rend telle quelle plutôt que d'afficher « Invalid
  // Date », qui n'apprend rien à personne et masque la donnée réelle.
  if (Number.isNaN(date.getTime())) {
    return brute;
  }

  return date.toLocaleDateString('fr-FR');
};

/**
 * Date suivie de son heure : « 07/11/2026 à 09:00 ».
 *
 * L'heure est souvent rangée à part de la date dans le schéma. Quand elle n'est
 * pas connue, seule la date est rendue — plutôt qu'un « à » suivi de rien.
 */
export const formaterDateHeure = (
  valeur?: string | number | Date | null,
  heure?: string | null,
  siVide = ''
): string => {
  const date = formaterDate(valeur, siVide);

  if (date === siVide) {
    return siVide;
  }

  const moment = String(heure || '').trim();

  return moment ? `${date} à ${moment}` : date;
};
