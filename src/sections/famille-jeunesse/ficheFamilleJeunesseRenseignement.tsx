import { BlankOrganisationForm } from 'src/components/print/blank-organisation-form';

export function FicheFamilleJeunesseRenseignement() {
  return (
    <BlankOrganisationForm
      title="Fiche de renseignement famille de jeunesse"
      subtitle="À remplir manuellement avant saisie dans l'application."
      sections={[
        {
          title: 'Identification',
          fields: [
            { label: 'Nom de la famille de jeunesse', size: 8 },
            { label: 'Slogan de la famille', size: 4 },
            { label: 'Nombre total de membres', size: 4 },
            { label: 'Nombre actuel de membres', size: 4 },
            { label: 'Famille active', type: 'checks', options: ['Oui', 'Non'], size: 4 },
          ],
        },
        {
          title: 'Responsables',
          fields: [
            { label: 'Conseiller', size: 6 },
            { label: 'Contact conseiller', size: 6 },
            { label: 'Animateur', size: 6 },
            { label: 'Contact animateur', size: 6 },
            { label: 'Secrétaire', size: 6 },
            { label: 'Trésorier', size: 6 },
          ],
        },
        {
          title: 'Organisation',
          fields: [
            { label: 'Jour de rencontre', size: 4 },
            { label: 'Heure', size: 4 },
            { label: 'Lieu', size: 4 },
            { label: 'Remarque', type: 'textarea', size: 12 },
          ],
        },
      ]}
    />
  );
}
