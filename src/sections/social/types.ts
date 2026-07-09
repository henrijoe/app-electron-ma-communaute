export type SocialCaseType = 'mariage' | 'naissance' | 'deces' | 'maladie';

export interface IMaladieDraft {
  dateMaladie: string | null;
  idMaladie?: number | null;
  idMembre?: number | null;
  idUtilisateur: number | null;
  lieuHospitalisation: string;
  nomMembreMaladie: string;
  observationMaladie: string;
  typeMaladie: string;
}
