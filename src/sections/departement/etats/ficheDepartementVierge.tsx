import { BlankOrganisationForm } from 'src/components/print/blank-organisation-form';

export function FicheDepartementVierge() {
  return (
    <BlankOrganisationForm
      title="Fiche d'enregistrement département"
      subtitle="À remplir manuellement avant saisie dans l'application."
      sections={[
        {
          title: 'Identification du département',
          fields: [
            { label: 'Nom complet du département', size: 8 },
            { label: 'Sigle', size: 4 },
            { label: 'Slogan / devise', size: 12 },
            { label: 'Domaine principal', size: 6 },
            { label: 'Date de création', size: 3 },
            { label: 'Actif', type: 'checks', options: ['Oui', 'Non'], size: 3 },
          ],
        },
        {
          title: 'Responsable',
          fields: [
            { label: 'Nom et prénoms du responsable', size: 8 },
            { label: 'Responsable membre de l’église', type: 'checks', options: ['Oui', 'Non'], size: 4 },
            { label: 'Contact du responsable', size: 4 },
            { label: 'Email', size: 4 },
            { label: 'Résidence', size: 4 },
            { label: 'Adjoint / personne relais', size: 8 },
            { label: 'Contact adjoint', size: 4 },
          ],
        },
        {
          title: 'Organisation',
          fields: [
            { label: 'Jour habituel de réunion', size: 4 },
            { label: 'Heure', size: 3 },
            { label: 'Lieu de réunion', size: 5 },
            { label: 'Fréquence', type: 'checks', options: ['Hebdomadaire', 'Mensuelle', 'Autre'], size: 6 },
            { label: 'Nombre approximatif de membres', size: 6 },
            { label: 'Description / observations', type: 'textarea', size: 12 },
          ],
        },
      ]}
    />
  );
}
