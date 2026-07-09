import { BlankOrganisationForm } from 'src/components/print/blank-organisation-form';

export function FicheGroupeVierge() {
  return (
    <BlankOrganisationForm
      title="Fiche d'enregistrement groupe"
      subtitle="À remplir manuellement avant saisie dans l'application."
      sections={[
        {
          title: 'Identification du groupe',
          fields: [
            { label: 'Libellé du groupe', size: 8 },
            { label: 'Catégorie', size: 4 },
            { label: 'Objectif du groupe', type: 'textarea', size: 12 },
            { label: 'Groupe actif', type: 'checks', options: ['Oui', 'Non'], size: 4 },
            { label: 'Date de création', size: 4 },
            { label: 'Nombre de membres', size: 4 },
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
            { label: 'Adjoint / secrétaire', size: 8 },
            { label: 'Contact adjoint', size: 4 },
          ],
        },
        {
          title: 'Fonctionnement',
          fields: [
            { label: 'Jour de rencontre', size: 4 },
            { label: 'Heure', size: 3 },
            { label: 'Lieu de rencontre', size: 5 },
            { label: 'Fréquence', type: 'checks', options: ['Hebdomadaire', 'Mensuelle', 'Ponctuelle'], size: 8 },
            { label: 'Public concerné', size: 4 },
            { label: 'Description / observations', type: 'textarea', size: 12 },
          ],
        },
      ]}
    />
  );
}
