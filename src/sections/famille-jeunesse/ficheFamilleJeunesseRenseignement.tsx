import { BlankOrganisationForm } from 'src/components/print/blank-organisation-form';

// Fiche de renseignement d'une famille de jeunesse.
//
// Sans famille, c'est le modèle vierge à remplir à la main. Avec une famille,
// la même fiche s'imprime remplie de ce que l'application connaît déjà ; ce
// qu'elle ne connaît pas (jour, heure, lieu de rencontre) reste à compléter.

type FicheFamilleJeunesseRenseignementProps = {
  famille?: any | null;
  /** Nombre de membres rattachés à la famille dans l'application. */
  nombreMembresRattaches?: number;
  /** Contact d'un responsable à partir de son nom, tel qu'affiché à l'écran. */
  contactDe?: (nom?: string) => string;
};

export function FicheFamilleJeunesseRenseignement({
  famille = null,
  nombreMembresRattaches,
  contactDe = () => '',
}: FicheFamilleJeunesseRenseignementProps) {
  const f = famille || {};
  const v = (valeur: unknown) => (famille ? String(valeur ?? '').trim() : '');

  return (
    <BlankOrganisationForm
      title="Fiche de renseignement famille de jeunesse"
      subtitle={
        famille
          ? `Famille ${f.nomFamilleJeunesse || ''} : informations enregistrées dans l'application.`
          : "À remplir manuellement avant saisie dans l'application."
      }
      sections={[
        {
          title: 'Identification',
          fields: [
            { label: 'Nom de la famille de jeunesse', size: 8, value: v(f.nomFamilleJeunesse) },
            { label: 'Slogan de la famille', size: 4, value: v(f.sloganFamille) },
            { label: 'Nombre total de membres', size: 4, value: v(f.nombreMembreTotal) },
            {
              label: 'Nombre actuel de membres',
              size: 4,
              value: v(nombreMembresRattaches || f.nombreMembreActuel),
            },
            { label: 'Famille active', type: 'checks', options: ['Oui', 'Non'], size: 4 },
          ],
        },
        {
          title: 'Responsables',
          fields: [
            { label: 'Conseiller', size: 6, value: v(f.conseillerFamille) },
            { label: 'Contact conseiller', size: 6, value: v(contactDe(f.conseillerFamille)) },
            { label: 'Animateur', size: 6, value: v(f.nomAnimateur) },
            { label: 'Contact animateur', size: 6, value: v(contactDe(f.nomAnimateur)) },
            { label: 'Secrétaire', size: 6, value: v(f.nomSecretaire) },
            { label: 'Trésorier', size: 6, value: v(f.nomTresorier) },
          ],
        },
        {
          title: 'Organisation',
          fields: [
            { label: 'Jour de rencontre', size: 4 },
            { label: 'Heure', size: 4 },
            { label: 'Lieu', size: 4 },
            { label: 'Remarque', type: 'textarea', size: 12, value: v(f.remarque) },
          ],
        },
      ]}
    />
  );
}
