import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { IDataChoice } from './membreSlice'

export interface ICulteSlice {
  dataCulte: ICulte[]
  dataFilterCulte: ICulte[]
  detailItem: ICulte[]
  listCulte: ICulte[]
  filterCulte: ICulte[]
  culteItem: ICulte
}

export interface ICulte {
  idCulte: number
  typeCulte: string
  dateCulte: string
  dirigeant: string
  predication: string
  passageBiblique: string
  themePredication: string
  nombreHommeCulte: string
  nombreFemmeCulte: string
    offrandeCulte: string;
  ecodim: string
  filleEcodim: string
    offrandeEcodim: string;
  resumePredication: string
  idUtilisateur: number
}

// Données pour les sélections (à adapter selon vos données réelles)
export const typeCulteOptions: IDataChoice[] = [
  { value: 1, label: 'Culte du dimanche' },
  { value: 2, label: 'Reunion de mardi' },
  { value: 3, label: 'Reunion de jeudi' },
  { value: 4, label: 'Reunion de jeunesse' },
  { value: 5, label: 'Culte spécial' },
];


export const culte: any = {
  typeCulte: "",
  dateCulte: null,
  dirigeant: "",
  predication: "",
  passageBiblique: "",
  themePredication: "",
  nombreHommeCulte: "",
  nombreFemmeCulte: "",
  offrandeCulte: "",
  ecodim: "",
  filleEcodim: "",
  offrandeEcodim: "",
  resumePredication: "",
  idUtilisateur: null,
}

const initialStates: ICulteSlice = {
  dataCulte: [],
  dataFilterCulte: [],
  detailItem: [],
  listCulte: [],
  filterCulte: [],
  culteItem: culte,
}

export const CulteSlice = createSlice({
  name: 'culte',
  initialState: initialStates,
  reducers: {
    addCulte: (state, action: PayloadAction<ICulte>) => {
      state.dataCulte.unshift(action.payload)
      state.dataFilterCulte.unshift(action.payload);
      state.listCulte.unshift(action.payload);
    },

    setCulteItem: (state, action) => {
      state.culteItem = action.payload
    },

    setListCulte: (state, action) => {
      state.listCulte = action.payload
    },

    deleteCulte: (state, action: PayloadAction<number>) => {
      state.dataCulte = state.dataCulte.filter(
        (item) => item.idCulte !== action.payload
      )
      state.dataFilterCulte = state.dataFilterCulte.filter(
        (item) => item.idCulte !== action.payload
      )
      state.listCulte = state.listCulte.filter( // AJOUTÉ
        (item) => item.idCulte !== action.payload
      );
    },

    setListFilterCulte: (state, action) => {
      state.dataFilterCulte = action.payload
    },

    setDetailItem: (state, action) => {
      state.detailItem = action.payload
    },

    setDataModifiesCulte: (state, action) => {
      const updatedCulte = action.payload;
      state.dataCulte = state.dataCulte.map((item) =>
        item.idCulte === updatedCulte.idCulte ? updatedCulte : item
      );
      state.dataFilterCulte = state.dataFilterCulte.map((item) =>
        item.idCulte === updatedCulte.idCulte ? updatedCulte : item
      );
      state.listCulte = state.listCulte.map((item) => // AJOUTÉ
        item.idCulte === updatedCulte.idCulte ? updatedCulte : item
      );
    },

    setFilterCulte: (state, action) => {
      state.filterCulte = action.payload
    },
  },
})

export const {
  addCulte,
  setDataModifiesCulte,
  deleteCulte,
  setDetailItem,
  setCulteItem,
  setListFilterCulte,
  setListCulte,
  setFilterCulte,
} = CulteSlice.actions

export default CulteSlice.reducer
