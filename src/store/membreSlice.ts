import type { PayloadAction } from '@reduxjs/toolkit';

import { createSlice } from '@reduxjs/toolkit';

// Interfaces pour les types de donnÃ©es
export interface IDataChoice {
  value: number;
  label: string;
}

export interface IResponsable {
  idResponsabilite: number;
  idUtilisateur: number;
  libelleResponsabilite: string;
  descriptionResponsabilite: string;
}

export interface IMembre {
  idMembre: number;
  nomMembre: string;
  prenomMembre: string;
  dateNaissMembre: string | null;
  lieuNaissMembre: string;
  sexeMembre: string;
  emailMembre: string;
  nationaliteMembre: string;
  fonctionMembre: string;
  contactMembre: string;
  ethnieMembre: string;
  residenceMembre: string;
  civiliteMembre: string;
  nouvelleAmeMembre: string;
  dateConversionMembre: string | null;
  baptemeEauMembre: string;
  dateBaptemeMembre: string | null;
  dateMariageMembre: string | null;
  capaciteSpirituelleMembre: string;
  situationMatrimonialeMembre: string;
  nomFiance: string;
  photoMembre: string;
  lieuBaptemeEauMembre: string;
  contactParentMembre: string;
  baptemeSaintEspritMembre: string;
  dateBaptemeSaintEspritMembre: string | null;
  egliseOrigineMembre: string;
  nomPrenomParentMembre: string;
  lieuTravailMembre: string;
  nomAmiEglise: string;
  visiteMembre: string;
  heureVisiteMembre: string;
  raisonNonVisiteMembre: string;
  dateDecisionMembre: string | null;
  idNiveauEtude: number | null;
  idEglise: number;
  idCellule: number | null;
  idDepartement: number | null;
  idGroupe: number | null;
  idResponsabilite: number | null;
  idDomaineActivite: number | null;
  estDecede?: number | null;
  dateDecesMembre?: string | null;
  idUtilisateur: number;
}

export interface IMembreSlice {
  dataMembre: IMembre[];
  dataNouvelleAme: IMembre[];
  dataAncien: IMembre[];
  filterAncien: IMembre[];
  filterDiacre: IMembre[];
  filterResponsable: IMembre[];
  filterNouvelleAme: IMembre[];
  dataDiacre: IMembre[];
  dataResponsable: IMembre[];
  dataFilterMembre: IMembre[];
  filterMembre: IMembre[];
  listResponsabilite: IResponsable[];
  detailItem: IMembre; // Changer en IMembre
  listMembre: IMembre[];
  membreItem: IMembre;
  titreDocument: string;
}

// Données statiques
export const dataBapteme: IDataChoice[] = [
  { value: 1, label: 'Oui' },
  { value: 2, label: 'Non' },
];

export const dataBaptemeSaintEsprit: IDataChoice[] = [
  { value: 1, label: 'Oui' },
  { value: 2, label: 'Non' },
];

export const capaciteSpirituelle: IDataChoice[] = [
  { value: 1, label: 'Bonne' },
  { value: 2, label: 'Moyenne' },
  { value: 3, label: 'Instable' },
];

export const visiteMembres: IDataChoice[] = [
  { value: 1, label: 'Oui' },
  { value: 2, label: 'Non' },
];

export const dataGenre: IDataChoice[] = [
  { value: 1, label: 'M' },
  { value: 2, label: 'F' },
];

export const dataSituationMembre: IDataChoice[] = [
  { value: 1, label: 'Célibataire' },
  { value: 2, label: 'Célibataire sans enfant' },
  { value: 3, label: 'Fiancé(e)' },
  { value: 4, label: 'Concubinage' },
  { value: 5, label: 'Marié(e)' },
  { value: 6, label: 'Divorcé(e)' },
  { value: 7, label: 'Veuve' },
  { value: 8, label: 'Veuf' },
  { value: 9, label: 'Copain/Copine' },
  { value: 10, label: 'Polygame' },
];
export const dataCivilite: IDataChoice[] = [
  { value: 1, label: 'Monsieur' },
  { value: 2, label: 'Madame' },
  { value: 3, label: 'Mademoiselle' },
];

export const dataNiveauEtude: IDataChoice[] = [
  { value: 1, label: 'Primaire' },
  { value: 2, label: 'Collège' },
  { value: 3, label: 'BEPC' },
  { value: 4, label: 'Lycée' },
  { value: 5, label: 'BAC' },
  { value: 6, label: 'Bac+1' },
  { value: 7, label: 'Bac+2' },
  { value: 8, label: 'Licence 3' },
  { value: 9, label: 'Master 1' },
  { value: 10, label: 'Master 2' },
  { value: 13, label: 'Doctorat' },
  { value: 14, label: 'Aucun' },
];

export const dataCapaciteSpirituelle: IDataChoice[] = [
  { value: 1, label: 'Bonne' },
  { value: 2, label: 'Moyenne' },
  { value: 3, label: 'Nouvellement convertie' },
];

export const dataResponsabilite: IDataChoice[] = [
  { value: 1, label: 'Pasteur principal' },
  { value: 2, label: 'Pasteur second' },
  { value: 3, label: 'Pasteur' },
  { value: 4, label: 'Ancien' },
  { value: 5, label: 'Diacre' },
  { value: 6, label: 'Diaconesse' },
  { value: 7, label: 'Responsable de cellule' },
  { value: 8, label: 'Responsable de departement' },
  { value: 9, label: 'Responsable de groupe de prière' },
  { value: 10, label: 'Responsable AOC' },
  { value: 11, label: "Directeur/Directrice de l'ECODIM" },
  { value: 12, label: 'Président de Jeunesse' },
  { value: 13, label: 'Responsable service d\'ordre' },
  { value: 14, label: 'Responsable nettoyage du temple' },
  { value: 15, label: 'Responsable Scoot' },
  { value: 16, label: 'Responsable Témoin conseiller' },
  { value: 17, label: 'Secretaire église' },
];

export const dataDepartement: IDataChoice[] = [
  { value: 1, label: 'CHORALE' },
  { value: 2, label: 'ECODIM' },
  { value: 3, label: 'SERVICE ACCUEIL' },
  { value: 4, label: 'CESAM' },
  { value: 5, label: 'SERVICE INFORMATION' },
  { value: 6, label: 'AOC' },
  { value: 7, label: 'JEUNESSE' },
  { value: 8, label: 'HAC' },
];
export const dataCellule: IDataChoice[] = [
  { value: 1, label: 'EL KANA' },
  { value: 2, label: 'MORIJAH' },
  { value: 3, label: 'NAOMIE' },
  { value: 4, label: 'RUTH' },
  { value: 5, label: 'BETHEL' },
  { value: 6, label: 'SINAI' },

];
export const dataGroupe: IDataChoice[] = [
  { value: 1, label: 'AGNI' },
  { value: 2, label: 'BETE' },
  { value: 3, label: 'BAOULE' },
  { value: 4, label: 'ATTIE' },
  { value: 5, label: 'GOURO' },
  { value: 6, label: 'DIDA' },
];

export const dataNouvelAme: IDataChoice[] = [
  { value: 1, label: 'Oui' },
  { value: 2, label: 'Non' },
];

export const membre: any = {
  nomMembre: "",
  prenomMembre: "",
  dateNaissMembre: null,
  lieuNaissMembre: "",
  sexeMembre: "",
  emailMembre: "",
  nationaliteMembre: "",
  fonctionMembre: "",
  contactMembre: "",
  ethnieMembre: "",
  residenceMembre: "",
  civiliteMembre: "",
  nouvelleAmeMembre: "",
  dateConversionMembre: null,
  baptemeEauMembre: "",
  dateBaptemeMembre: null,
  dateMariageMembre: null,
  capaciteSpirituelleMembre: "",
  situationMatrimonialeMembre: "",
  nomFiance: "",
  photoMembre: "",
  lieuBaptemeEauMembre: "",
  baptemeSaintEspritMembre: "",
  dateBaptemeSaintEspritMembre: null,
  egliseOrigineMembre: "",
  nomAmiEglise: '',
  visiteMembre: '',
  heureVisiteMembre: '',
  raisonNonVisiteMembre: '',
  dateDecisionMembre: null,
  lieuTravailMembre: '',
  idNiveauEtude: null,
  idCellule: null,
  idDepartement: null,
  idGroupe: null,
  idResponsabilite: null,
  estDecede: 0,
  dateDecesMembre: null,
  idUtilisateur: null
};

// Initialisation de l'Ãtat
const initialState: IMembreSlice = {
  dataMembre: [],
  dataFilterMembre: [],
  detailItem: membre,
  listMembre: [],
  dataNouvelleAme: [],
  dataAncien: [],
  filterAncien: [],
  filterDiacre: [],
  filterMembre: [],
  filterResponsable: [],
  filterNouvelleAme: [],
  dataDiacre: [],
  dataResponsable: [],
  listResponsabilite: [],
  membreItem: membre,
  titreDocument: '',
};

// Reducers du module membre

// Creation du slice
export const MembreSlice = createSlice({
  name: 'membre',
  initialState,
  reducers: {
    ensureMembreArrays: (state) => {
      state.dataMembre = Array.isArray(state.dataMembre) ? state.dataMembre : [];
      state.dataNouvelleAme = Array.isArray(state.dataNouvelleAme) ? state.dataNouvelleAme : [];
      state.dataAncien = Array.isArray(state.dataAncien) ? state.dataAncien : [];
      state.filterAncien = Array.isArray(state.filterAncien) ? state.filterAncien : [];
      state.filterDiacre = Array.isArray(state.filterDiacre) ? state.filterDiacre : [];
      state.filterResponsable = Array.isArray(state.filterResponsable) ? state.filterResponsable : [];
      state.filterNouvelleAme = Array.isArray(state.filterNouvelleAme) ? state.filterNouvelleAme : [];
      state.dataDiacre = Array.isArray(state.dataDiacre) ? state.dataDiacre : [];
      state.dataResponsable = Array.isArray(state.dataResponsable) ? state.dataResponsable : [];
      state.dataFilterMembre = Array.isArray(state.dataFilterMembre) ? state.dataFilterMembre : [];
      state.filterMembre = Array.isArray(state.filterMembre) ? state.filterMembre : [];
      state.listMembre = Array.isArray(state.listMembre) ? state.listMembre : [];
      state.listResponsabilite = Array.isArray(state.listResponsabilite) ? state.listResponsabilite : [];
    },

    // fonction pour ajouter un membre
    addMembre: (state, action: PayloadAction<IMembre>) => {
      state.dataMembre = Array.isArray(state.dataMembre) ? state.dataMembre : [];
      state.listMembre = Array.isArray(state.listMembre) ? state.listMembre : [];
      state.dataFilterMembre = Array.isArray(state.dataFilterMembre) ? state.dataFilterMembre : [];

      state.dataMembre.unshift(action.payload);
      state.listMembre.unshift(action.payload);
      state.dataFilterMembre.unshift(action.payload);
    },

    setMembreItem: (state, action: PayloadAction<IMembre>) => {
      state.membreItem = action.payload;
    },

    setListMembre: (state, action: PayloadAction<IMembre[]>) => {
      state.listMembre = Array.isArray(action.payload) ? action.payload : [];
    },

    // Dans votre slice Redux (membreSlice.ts)
    deleteMembre: (state, action: PayloadAction<number>) => {
      state.listMembre = Array.isArray(state.listMembre) ? state.listMembre : [];
      state.dataFilterMembre = Array.isArray(state.dataFilterMembre) ? state.dataFilterMembre : [];
      state.dataNouvelleAme = Array.isArray(state.dataNouvelleAme) ? state.dataNouvelleAme : [];
      state.dataAncien = Array.isArray(state.dataAncien) ? state.dataAncien : [];
      state.dataDiacre = Array.isArray(state.dataDiacre) ? state.dataDiacre : [];
      state.dataResponsable = Array.isArray(state.dataResponsable) ? state.dataResponsable : [];

      // Mettre a jour listMembre
      state.listMembre = state.listMembre.filter((item) => item.idMembre !== action.payload);

      // Mettre a jour dataFilterMembre
      state.dataFilterMembre = state.dataFilterMembre.filter((item) => item.idMembre !== action.payload);

      // Mettre a jour les autres listes si necessaire
      state.dataNouvelleAme = state.dataNouvelleAme.filter((item) => item.idMembre !== action.payload);
      state.dataAncien = state.dataAncien.filter((item) => item.idMembre !== action.payload);
      state.dataDiacre = state.dataDiacre.filter((item) => item.idMembre !== action.payload);
      state.dataResponsable = state.dataResponsable.filter((item) => item.idMembre !== action.payload);
    },

    setListFilterMembre: (state, action: PayloadAction<IMembre[]>) => {
      state.dataFilterMembre = Array.isArray(action.payload) ? action.payload : [];
    },

    setDetailItem: (state, action: PayloadAction<IMembre>) => {
      state.detailItem = action.payload;
    },

    setDataModifiesMembre: (state, action: PayloadAction<IMembre>) => {
      const updatedMembre = action.payload;

      console.log("Mise Ã  jour du membre:", updatedMembre);
      console.log("ID du membre:", updatedMembre.idMembre);

      // Creer une copie profonde pour forcer le re-render
      const updateMembreInArray = (array: IMembre[]) => {
        if (!Array.isArray(array)) {
          return [];
        }
        return array.map((item) => {
        if (item.idMembre === updatedMembre.idMembre) {
          // Fusionner proprement les donnees
          return {
            ...item,
            ...updatedMembre,
            // Assurer que tous les champs sont presents
            idNiveauEtude: updatedMembre.idNiveauEtude !== undefined ? updatedMembre.idNiveauEtude : item.idNiveauEtude,
            idCellule: updatedMembre.idCellule !== undefined ? updatedMembre.idCellule : item.idCellule,
            idDepartement: updatedMembre.idDepartement !== undefined ? updatedMembre.idDepartement : item.idDepartement,
            idGroupe: updatedMembre.idGroupe !== undefined ? updatedMembre.idGroupe : item.idGroupe,
            idResponsabilite: updatedMembre.idResponsabilite !== undefined ? updatedMembre.idResponsabilite : item.idResponsabilite,
            sexeMembre: updatedMembre.sexeMembre !== undefined ? updatedMembre.sexeMembre : item.sexeMembre,
            nouvelleAmeMembre: updatedMembre.nouvelleAmeMembre !== undefined ? updatedMembre.nouvelleAmeMembre : item.nouvelleAmeMembre,
            baptemeEauMembre: updatedMembre.baptemeEauMembre !== undefined ? updatedMembre.baptemeEauMembre : item.baptemeEauMembre,
            baptemeSaintEspritMembre: updatedMembre.baptemeSaintEspritMembre !== undefined ? updatedMembre.baptemeSaintEspritMembre : item.baptemeSaintEspritMembre,
            situationMatrimonialeMembre: updatedMembre.situationMatrimonialeMembre !== undefined ? updatedMembre.situationMatrimonialeMembre : item.situationMatrimonialeMembre,
            visiteMembre: updatedMembre.visiteMembre !== undefined ? updatedMembre.visiteMembre : item.visiteMembre,
            capaciteSpirituelleMembre: updatedMembre.capaciteSpirituelleMembre !== undefined ? updatedMembre.capaciteSpirituelleMembre : item.capaciteSpirituelleMembre,
          };
        }
        return item;
      });
      };

      // Mettre a jour toutes les listes avec la nouvelle copie
      state.listMembre = updateMembreInArray(state.listMembre);
      state.dataFilterMembre = updateMembreInArray(state.dataFilterMembre);
      state.dataNouvelleAme = updateMembreInArray(state.dataNouvelleAme);
      state.dataAncien = updateMembreInArray(state.dataAncien);
      state.dataDiacre = updateMembreInArray(state.dataDiacre);
      state.dataResponsable = updateMembreInArray(state.dataResponsable);

      console.log("Liste mise Ã  jour:", state.listMembre);
    },

    setDataNouvelleAme: (state, action: PayloadAction<IMembre[]>) => {
      state.dataNouvelleAme = action.payload;
    },

    setFilterNouvelleAme: (state, action: PayloadAction<IMembre[]>) => {
      state.filterNouvelleAme = action.payload;
    },

    setDataAncien: (state, action: PayloadAction<IMembre[]>) => {
      state.dataAncien = action.payload;
    },

    setFilterAncien: (state, action: PayloadAction<IMembre[]>) => {
      state.filterAncien = action.payload;
    },

    setDataDiacre: (state, action: PayloadAction<IMembre[]>) => {
      state.dataDiacre = action.payload;
    },

    setFilterDiacre: (state, action: PayloadAction<IMembre[]>) => {
      state.filterDiacre = action.payload;
    },

    setDataResponsable: (state, action: PayloadAction<IMembre[]>) => {
      state.dataResponsable = action.payload;
    },

    setFilterResponsable: (state, action: PayloadAction<IMembre[]>) => {
      state.filterResponsable = action.payload;
    },

    setFilterMembre: (state, action: PayloadAction<IMembre[]>) => {
      state.filterMembre = action.payload;
    },

    setListResponsabilite: (state, action: PayloadAction<IResponsable[]>) => {
      state.listResponsabilite = action.payload;
    },

    setTitreDocument: (state, action: PayloadAction<string>) => {
      state.titreDocument = action.payload;
    },
  },
});

export const {
  addMembre,
  ensureMembreArrays,
  setDataModifiesMembre,
  deleteMembre,
  setDetailItem,
  setMembreItem,
  setListFilterMembre,
  setListMembre,
  setDataNouvelleAme,
  setDataAncien,
  setDataDiacre,
  setFilterAncien,
  setFilterDiacre,
  setFilterNouvelleAme,
  setFilterMembre,
  setDataResponsable,
  setFilterResponsable,
  setListResponsabilite,
  setTitreDocument,
} = MembreSlice.actions;

export default MembreSlice.reducer;

