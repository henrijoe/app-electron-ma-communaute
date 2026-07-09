import { BlankOrganisationForm } from 'src/components/print/blank-organisation-form';

export function FicheComptabiliteRenseignement() {
  return (
    <BlankOrganisationForm
      title="Fiche de renseignement comptabilité"
      subtitle="À remplir manuellement avant saisie de l'écriture."
      sections={[
        {
          title: 'Écriture comptable',
          fields: [
            { label: 'Libellé', size: 8 },
            { label: 'Date', size: 4 },
            { label: 'Type', type: 'checks', options: ['Entrée', 'Sortie'], size: 4 },
            { label: 'Montant', size: 4 },
            { label: 'Mode', type: 'checks', options: ['Espèces', 'Mobile money', 'Banque', 'Autre'], size: 4 },
          ],
        },
        {
          title: 'Justification',
          fields: [
            { label: 'Personne ayant remis / reçu', size: 6 },
            { label: 'Contact', size: 6 },
            { label: 'Pièce justificative', type: 'checks', options: ['Oui', 'Non'], size: 4 },
            { label: 'Numéro pièce / référence', size: 8 },
            { label: 'Observation', type: 'textarea', size: 12 },
          ],
        },
      ]}
    />
  );
}
