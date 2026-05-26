import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface IFamilleJeunesse {
  idFamilleJeunesse: number;
  idUtilisateur: number;
  nomFamilleJeunesse: string;
  sloganFamille: string;
  conseillerFamille: string;
  nomAnimateur: string;
  nomViceAnimateur: string;
  nomSecretaire: string;
  nomSecretaireAdjoint: string;
  nomTresorier: string;
  nomTresorierAdjoint: string;
  nomSecretaireOrganisation1: string;
  nomSecretaireOrganisation2: string;
  nomSecretaireOrganisation3: string;
  nomCommissaireAuCompte: string;
  nomCommissaireAuCompteAdjoint: string;
  nombreMembreTotal: number | string;
  nombreMembreActuel: number | string;
  remarque: string;
}

export interface IFamilleJeunesseSlice {
  listFamilleJeunesse: IFamilleJeunesse[];
}

export const familleJeunesse: IFamilleJeunesse = {
  idFamilleJeunesse: 0,
  idUtilisateur: 0,
  nomFamilleJeunesse: '',
  sloganFamille: '',
  conseillerFamille: '',
  nomAnimateur: '',
  nomViceAnimateur: '',
  nomSecretaire: '',
  nomSecretaireAdjoint: '',
  nomTresorier: '',
  nomTresorierAdjoint: '',
  nomSecretaireOrganisation1: '',
  nomSecretaireOrganisation2: '',
  nomSecretaireOrganisation3: '',
  nomCommissaireAuCompte: '',
  nomCommissaireAuCompteAdjoint: '',
  nombreMembreTotal: '',
  nombreMembreActuel: '',
  remarque: '',
};

const initialState: IFamilleJeunesseSlice = {
  listFamilleJeunesse: [],
};

export const familleJeunesseSlice = createSlice({
  name: 'familleJeunesse',
  initialState,
  reducers: {
    setListFamilleJeunesse: (state, action: PayloadAction<IFamilleJeunesse[]>) => {
      state.listFamilleJeunesse = Array.isArray(action.payload) ? action.payload : [];
    },
    addFamilleJeunesse: (state, action: PayloadAction<IFamilleJeunesse>) => {
      state.listFamilleJeunesse.unshift(action.payload);
    },
    setDataModifiesFamilleJeunesse: (state, action: PayloadAction<IFamilleJeunesse>) => {
      state.listFamilleJeunesse = state.listFamilleJeunesse.map((item) =>
        item.idFamilleJeunesse === action.payload.idFamilleJeunesse ? action.payload : item
      );
    },
    deleteFamilleJeunesse: (state, action: PayloadAction<number>) => {
      state.listFamilleJeunesse = state.listFamilleJeunesse.filter(
        (item) => item.idFamilleJeunesse !== action.payload
      );
    },
  },
});

export const {
  addFamilleJeunesse,
  deleteFamilleJeunesse,
  setDataModifiesFamilleJeunesse,
  setListFamilleJeunesse,
} = familleJeunesseSlice.actions;

export default familleJeunesseSlice.reducer;
