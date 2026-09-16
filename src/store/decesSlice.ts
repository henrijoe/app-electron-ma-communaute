import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface IDecesSlice {
  dataDeces: IDeces[]
  dataFilterDeces: IDeces[]
  detailItem: IDeces[]
  listDeces: IDeces[]
  filterDeces: IDeces[]
  DecesItem: IDeces
}
  export interface IDeces {
    idDeces: number|null;
    idMembre: number|null;
    idUtilisateur: number|null;
    nomMembreDeces: string;
    dateDeces: string|null;
    lieuDeces: string;
    causeDeces: string;
  }

export const Deces:any = {
  idDeces:null,
  idMembre:null,
  idUtilisateur:null,
  nomMembreDeces:"",
  dateDeces: null,
  lieuDeces: "",
  causeDeces:"",
}

// initialisation des states
const initialStates: any = {
  dataDeces: [],
  dataFilterDeces: [],
  detailItem: [],
  listDeces: [],
  filterDeces: [],
  DecesItem: Deces,
}


export const DecesSlice = createSlice({
  name: 'deces',
  initialState: initialStates,
  reducers: {
    // fonction pour ajouter un Département
    addDeces: (state, action: PayloadAction<IDeces>) => {
      state.dataDeces.unshift(action.payload)
    },

    setDecesItem: (state, action) => {
      state.DecesItem = action.payload
    },

    // fonction pour ajouter le dernier enregistrement au dessus
    setListDeces: (state, action) => {
      state.listDeces.unshift(action.payload)
    },

    // fonction pour supprimer un Département
    deleteDeces: (state, action) => {
      state.dataNaissance = state.dataNaissance.filter(
        (item:any) => item.idNaissance !== action.payload
      );    
      state.dataFilterNaissance = state.dataFilterNaissance.filter(
        (item:any) => item.idNaissance !== action.payload
      );
    },
    
    // fonction pour rechercher un Département dans le tableau
    setListFilterDeces: (state, action) => {
      state.dataFilterDeces = action.payload
    },
    // fonction pour voir les détail de chaque Département enregistrer
    setDetailItem: (state, action) => {
      state.detailItem = action.payload
    },
    
    // fonction pour modifier chaque Département enregistrer
    setDataModifiesDeces: (state, action) => {
      state.dataDeces = state.dataDeces?.map((item: any) =>
      item.idDeces === action.payload.idDeces ? action.payload : item
      )
      state.dataFilterDeces = state.dataFilterDeces?.map((item: any) =>
      item.idDeces === action.payload.idDeces ? action.payload : item
      )
    },
    setFilterDeces: (state, action) => {
      state.filterDeces = action.payload
    },
  },
})

export const {
  addDeces,
  setDataModifiesDeces,
  deleteDeces,
  setDetailItem,
  setDecesItem,
  setListFilterDeces,
  setListDeces,
  setFilterDeces
} = DecesSlice.actions

export default DecesSlice.reducer
