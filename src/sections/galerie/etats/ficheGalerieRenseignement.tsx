import { BlankOrganisationForm } from 'src/components/print/blank-organisation-form';

export function FicheGalerieRenseignement() {
  return (
    <BlankOrganisationForm
      title="Fiche de renseignement galerie"
      subtitle="À remplir manuellement avant création du dossier photo."
      sections={[
        {
          title: 'Événement',
          fields: [
            { label: "Type d'événement", size: 4 },
            { label: "Titre de l'événement", size: 8 },
            { label: 'Date', size: 4 },
            { label: 'Lieu', size: 8 },
            { label: 'Dossier / nom du répertoire', size: 6 },
            { label: 'Nombre de photos prévues', size: 6 },
          ],
        },
        {
          title: 'Photos et classement',
          fields: [
            {
              label: 'Source des photos',
              type: 'checks',
              options: ['Téléphone', 'Appareil photo', 'WhatsApp', 'Autre'],
              size: 8,
            },
            { label: 'Photo de couverture choisie', type: 'checks', options: ['Oui', 'Non'], size: 4 },
            { label: 'Responsable du dépôt', size: 6 },
            { label: 'Contact responsable', size: 6 },
            { label: 'Description / observations', type: 'textarea', size: 12 },
          ],
        },
      ]}
    />
  );
}
