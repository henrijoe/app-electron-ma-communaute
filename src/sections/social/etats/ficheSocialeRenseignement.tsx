import type { BlankOrganisationSection } from 'src/components/print/blank-organisation-form';

import { BlankOrganisationForm } from 'src/components/print/blank-organisation-form';

import type { SocialCaseType } from '../types';

const socialFormConfig: Record<SocialCaseType, { title: string; sections: BlankOrganisationSection[] }> = {
  mariage: {
    title: 'Fiche de renseignement mariage',
    sections: [
      {
        title: 'Futurs mariés',
        fields: [
          {
            label: 'Frère membre de cette assemblée',
            type: 'checks',
            options: ['Oui', 'Non'],
            size: 6,
          },
          { label: 'Nom du frère', size: 6 },
          {
            label: 'Sœur membre de cette assemblée',
            type: 'checks',
            options: ['Oui', 'Non'],
            size: 6,
          },
          { label: 'Nom de la sœur', size: 6 },
          { label: 'Contact', size: 6 },
          { label: 'Lieu de réception', size: 6 },
        ],
      },
      {
        title: 'Cérémonie',
        fields: [
          { label: 'Date du mariage', size: 4 },
          { label: 'Lieu du mariage', size: 8 },
          { label: 'Culte / célébrant', size: 6 },
          { label: 'Témoin 1', size: 3 },
          { label: 'Témoin 2', size: 3 },
          { label: 'Observations', type: 'textarea', size: 12 },
        ],
      },
    ],
  },
  naissance: {
    title: 'Fiche de renseignement naissance',
    sections: [
      {
        title: 'Enfant et parents',
        fields: [
          { label: 'Nom du couple / parents', size: 8 },
          { label: 'Contact famille', size: 4 },
          { label: "Nom de l'enfant", size: 8 },
          { label: 'Sexe', type: 'checks', options: ['M', 'F'], size: 4 },
          { label: 'Date de naissance', size: 4 },
          { label: 'Lieu de naissance', size: 8 },
        ],
      },
      {
        title: 'Présentation',
        fields: [
          { label: 'Date de présentation', size: 4 },
          { label: "Présenté à l'église", type: 'checks', options: ['Oui', 'Non'], size: 4 },
          { label: 'Responsable / déclarant', size: 4 },
          { label: 'Observations', type: 'textarea', size: 12 },
        ],
      },
    ],
  },
  deces: {
    title: 'Fiche de renseignement décès',
    sections: [
      {
        title: 'Personne décédée',
        fields: [
          { label: 'Membre enregistré', type: 'checks', options: ['Oui', 'Non'], size: 4 },
          { label: 'Nom du membre', size: 8 },
          { label: 'Date du décès', size: 4 },
          { label: 'Lieu du décès', size: 8 },
          { label: 'Contact famille', size: 4 },
          { label: 'Famille / proche à contacter', size: 8 },
        ],
      },
      {
        title: 'Suivi pastoral',
        fields: [
          { label: 'Cause / circonstances', type: 'textarea', size: 12 },
          { label: 'Programme funéraire', type: 'textarea', size: 12 },
        ],
      },
    ],
  },
  maladie: {
    title: 'Fiche de renseignement maladie',
    sections: [
      {
        title: 'Personne concernée',
        fields: [
          { label: 'Membre enregistré', type: 'checks', options: ['Oui', 'Non'], size: 4 },
          { label: 'Nom du membre', size: 8 },
          { label: 'Maladie / situation', size: 8 },
          { label: 'Date du signalement', size: 4 },
          { label: 'Lieu / hôpital', size: 8 },
          { label: 'Contact famille', size: 4 },
        ],
      },
      {
        title: 'Suivi',
        fields: [
          { label: 'Visite souhaitée', type: 'checks', options: ['Oui', 'Non'], size: 4 },
          { label: 'Responsable du suivi', size: 8 },
          { label: 'Observations', type: 'textarea', size: 12 },
        ],
      },
    ],
  },
};

export function FicheSocialeRenseignement({ type }: { type: SocialCaseType }) {
  const config = socialFormConfig[type];

  return (
    <BlankOrganisationForm
      title={config.title}
      subtitle="À remplir manuellement avant saisie dans l'application."
      sections={config.sections}
    />
  );
}
