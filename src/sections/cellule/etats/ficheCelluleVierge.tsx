import { BlankOrganisationForm } from 'src/components/print/blank-organisation-form';

export function FicheCelluleVierge() {
  return (
    <BlankOrganisationForm
      title="Fiche d'enregistrement cellule"
      subtitle="À remplir manuellement avant saisie dans l'application."
      sections={[
        {
          title: 'Identification de la cellule',
          fields: [
            { label: 'Nom de la cellule', size: 7 },
            { label: 'Lieu / quartier', size: 5 },
            { label: 'Adresse précise du lieu de réunion', size: 8 },
            { label: 'Nombre de membres', size: 4 },
            { label: 'Type de cellule', type: 'checks', options: ['Maison', 'Jeunesse', 'Famille', 'Autre'], size: 8 },
            { label: 'Cellule active', type: 'checks', options: ['Oui', 'Non'], size: 4 },
          ],
        },
        {
          title: 'Responsables',
          fields: [
            { label: 'Responsable de cellule', size: 8 },
            { label: 'Contact responsable cellule', size: 4 },
            { label: 'Responsable de visite', size: 8 },
            { label: 'Contact responsable visite', size: 4 },
            { label: 'Adjoint / hote de cellule', size: 8 },
            { label: 'Contact adjoint / hote', size: 4 },
          ],
        },
        {
          title: 'Fonctionnement',
          fields: [
            { label: 'Jour de réunion', size: 4 },
            { label: 'Heure de début', size: 4 },
            { label: 'Heure de fin', size: 4 },
            { label: 'Fréquence', type: 'checks', options: ['Chaque semaine', 'Deux fois/mois', 'Mensuelle'], size: 8 },
            { label: 'Visite pastorale souhaitée', type: 'checks', options: ['Oui', 'Non'], size: 4 },
            { label: 'Observations', type: 'textarea', size: 12 },
          ],
        },
      ]}
    />
  );
}
