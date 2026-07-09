import { BlankOrganisationForm } from 'src/components/print/blank-organisation-form';

export function FicheCulteRenseignement() {
  return (
    <BlankOrganisationForm
      title="Fiche de renseignement culte"
      subtitle="À remplir manuellement avant saisie dans l'application."
      sections={[
        {
          title: 'Informations du culte',
          fields: [
            { label: 'Type de culte', size: 4 },
            { label: 'Date du culte', size: 4 },
            { label: 'Heure', size: 4 },
            { label: 'Dirigeant', size: 6 },
            { label: 'Prédicateur', size: 6 },
            { label: 'Thème de prédication', size: 8 },
            { label: 'Passage biblique', size: 4 },
          ],
        },
        {
          title: 'Présence et participation',
          fields: [
            { label: 'Nombre hommes', size: 4 },
            { label: 'Nombre femmes', size: 4 },
            { label: 'Total participants', size: 4 },
            { label: 'ECODIM', size: 4 },
            { label: 'Filles ECODIM', size: 4 },
            { label: 'Visiteurs', size: 4 },
          ],
        },
        {
          title: 'Finances et notes',
          fields: [
            { label: 'Offrande du culte', size: 6 },
            { label: 'Offrande ECODIM', size: 6 },
            { label: 'Résumé / observations', type: 'textarea', size: 12 },
          ],
        },
      ]}
    />
  );
}
