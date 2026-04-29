import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export type ComptabiliteType = 'entree' | 'sortie';

export interface IComptabiliteItem {
  idComptabilite?: number;
  idUtilisateur: number | null;
  nomComptabilite: string;
  entreeComptabilite: number;
  sortieComptabilite: number;
  montantComptabilite: number;
  typeComptabilite: ComptabiliteType;
  dateComptabilite: string;
  observationComptabilite: string;
  estSupprimeComptabilite?: number;
  dateSuppressionComptabilite?: string | null;
  motifSuppressionComptabilite?: string | null;
  supprimeParUtilisateur?: number | null;
  nomUtilisateurSuppression?: string;
}

export interface IComptabiliteSlice {
  listComptabilite: IComptabiliteItem[];
  loadingComptabilite: boolean;
}

const initialState: IComptabiliteSlice = {
  listComptabilite: [],
  loadingComptabilite: false,
};

const comptabiliteSlice = createSlice({
  name: 'comptabilite',
  initialState,
  reducers: {
    setListComptabilite: (state, action: PayloadAction<IComptabiliteItem[]>) => {
      state.listComptabilite = Array.isArray(action.payload) ? action.payload : [];
    },
    setLoadingComptabilite: (state, action: PayloadAction<boolean>) => {
      state.loadingComptabilite = action.payload;
    },
    upsertComptabilite: (state, action: PayloadAction<IComptabiliteItem>) => {
      const index = state.listComptabilite.findIndex((item) => item.idComptabilite === action.payload.idComptabilite);
      if (index >= 0) {
        state.listComptabilite[index] = action.payload;
      } else {
        state.listComptabilite.unshift(action.payload);
      }
    },
    removeComptabilite: (state, action: PayloadAction<number>) => {
      state.listComptabilite = state.listComptabilite.filter((item) => item.idComptabilite !== action.payload);
    },
  },
});

export const {
  removeComptabilite,
  setListComptabilite,
  setLoadingComptabilite,
  upsertComptabilite,
} = comptabiliteSlice.actions;

export default comptabiliteSlice.reducer;
