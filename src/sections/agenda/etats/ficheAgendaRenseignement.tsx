import { BlankOrganisationForm } from 'src/components/print/blank-organisation-form';

export function FicheAgendaRenseignement() {
  return (
    <BlankOrganisationForm
      title="Fiche de renseignement événement"
      subtitle="À remplir manuellement avant saisie dans l'agenda."
      sections={[
        {
          title: 'Identification',
          fields: [
            { label: "Titre de l'événement", size: 8 },
            { label: 'Type', size: 4 },
            { label: 'Date', size: 4 },
            { label: 'Heure début', size: 4 },
            { label: 'Heure fin', size: 4 },
            { label: 'Lieu', size: 8 },
            {
              label: 'Statut',
              type: 'checks',
              options: ['Prévu', 'Confirmé', 'Reporté', 'Annulé'],
              size: 4,
            },
          ],
        },
        {
          title: 'Organisation',
          fields: [
            { label: 'Responsable / organisateur', size: 6 },
            { label: 'Contact', size: 6 },
            { label: 'Public concerné', size: 6 },
            { label: 'Besoin logistique', size: 6 },
            { label: 'Description / observations', type: 'textarea', size: 12 },
          ],
        },
      ]}
    />
  );
}
