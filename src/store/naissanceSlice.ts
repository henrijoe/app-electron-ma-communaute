import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface INaissanceSlice {
  dataNaissance: INaissance[]
  dataFilterNaissance: INaissance[]
  detailItem: INaissance[]
  listNaissance: INaissance[]
  filterNaissance: INaissance[]
  NaissanceItem: INaissance
}

  export interface INaissance {
    idNaissance: number;
    idUtilisateur: number;
    nomCoupleNaissance: string;
    dateNaissance: string|null;
    lieuNaissance: string;
    nomEnfantNaissance: string;
    datePresentationNaissance: string|null;
  }
  
export const naissance:any = {
  idNaissance:null,
  idUtilisateur:null,
  nomCoupleNaissance:"",
  dateNaissance: null,
  lieuNaissance: "",
  nomEnfantNaissance:"",
  datePresentationNaissance: "",
}

// initialiation des states
const initialStates: INaissanceSlice = {
  dataNaissance: [],
  dataFilterNaissance: [],
  detailItem: [],
  listNaissance: [],
  filterNaissance: [],
  NaissanceItem: naissance,
}

export const NaissanceSlice = createSlice({
  name: 'naissance',
  initialState: initialStates,
  reducers: {
    // fonction pour ajouter un Departement
    addNaissance: (state, action: PayloadAction<INaissance>) => {
      state.dataNaissance.unshift(action.payload)
    },

    setNaissanceItem: (state, action) => {
      state.NaissanceItem = action.payload
    },

    // fonction pour ajouter le dernier enregistrement au dessus
    setListNaissance: (state, action) => {
      state.listNaissance.unshift(action.payload)
    },

    // fonction pour suprimer un Departement
    deleteNaissance: (state, action) => {
      state.dataNaissance = state.dataNaissance.filter(
        (item) => item.idNaissance !== action.payload
      );    
      state.dataFilterNaissance = state.dataFilterNaissance.filter(
        (item) => item.idNaissance !== action.payload
      );
    },
    
    // fonction pour rechecher un Departement dans le tableau
    setListFilterNaissance: (state, action) => {
      state.dataFilterNaissance = action.payload
    },
    // fonction pour voir les detail de chaque Departement enregister
    setDetailItem: (state, action) => {
      state.detailItem = action.payload
    },
    
    // fonction pour modifier chaque Departement enregister
    setDataModifiesNaissance: (state, action) => {
      state.dataNaissance = state.dataNaissance?.map((item: any) =>
      item.idNaissance === action.payload.idNaissance ? action.payload : item
      )
      state.dataFilterNaissance = state.dataFilterNaissance?.map((item: any) =>
      item.idNaissance === action.payload.idNaissance ? action.payload : item
      )
    },
    setFilterNaissance: (state, action) => {
      state.filterNaissance = action.payload
    },
  },
})

export const {
  addNaissance,
  setDataModifiesNaissance,
  deleteNaissance,
  setDetailItem,
  setNaissanceItem,
  setListFilterNaissance,
  setListNaissance,
  setFilterNaissance
} = NaissanceSlice.actions

export default NaissanceSlice.reducer
