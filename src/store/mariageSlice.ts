import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface IMariageSlice {
  dataMariage: IMariage[]
  dataFilterMariage: IMariage[]
  detailItem: IMariage[]
  listMariage: IMariage[]
  filterMariage: IMariage[]
  MariageItem: IMariage
}

  export interface IMariage {
    idMariage: number;
    idUtilisateur: number;
    idFrereMembre?: number | null;
    idSoeurMembre?: number | null;
    nomFrereMariage: string;
    nomSoeurMariage: string;
    dateMariage: string|null;
    lieuMariage: string;
    culteMariage: string;
    temoin1Mariage: string;
    temoin2Mariage: string;
    lieuReception: string;
    contactMariage: string;
  }
  
export const Mariage:any = {
  idMariage:null,
  idUtilisateur:null,
  idFrereMembre:null,
  idSoeurMembre:null,
  nomFrereMariage:"",
  nomSoeurMariage: "",
  dateMariage: null,
  lieuMariage:"",
  culteMariage: "",
  temoin1Mariage: "",
  temoin2Mariage:"",
  lieuReception: "",
  contactMariage: ""
}

// initialiation des states
const initialStates: IMariageSlice = {
  dataMariage: [],
  dataFilterMariage: [],
  detailItem: [],
  listMariage: [],
  filterMariage: [],
  MariageItem: Mariage,
}

export const MariageSlice = createSlice({
  name: 'mariage',
  initialState: initialStates,
  reducers: {
    // fonction pour ajouter un Departement
    addMariage: (state, action: PayloadAction<IMariage>) => {
      state.dataMariage.unshift(action.payload)
    },

    setMariageItem: (state, action) => {
      state.MariageItem = action.payload
    },

    // fonction pour ajouter le dernier enregistrement au dessus
    setListMariage: (state, action) => {
      state.listMariage.unshift(action.payload)
    },

    // fonction pour suprimer un Departement
    deleteMariage: (state, action) => {
      state.dataMariage = state.dataMariage.filter(
        (item) => item.idMariage !== action.payload
      );    
      state.dataFilterMariage = state.dataFilterMariage.filter(
        (item) => item.idMariage !== action.payload
      );
    },
    
    // fonction pour rechecher un Departement dans le tableau
    setListFilterMariage: (state, action) => {
      state.dataFilterMariage = action.payload
    },
    // fonction pour voir les detail de chaque Departement enregister
    setDetailItem: (state, action) => {
      state.detailItem = action.payload
    },
    
    // fonction pour modifier chaque Departement enregister
    setDataModifiesMariage: (state, action) => {
      state.dataMariage = state.dataMariage?.map((item: any) =>
      item.idMariage === action.payload.idMariage ? action.payload : item
      )
      state.dataFilterMariage = state.dataFilterMariage?.map((item: any) =>
      item.idMariage === action.payload.idMariage ? action.payload : item
      )
    },
    setFilterMariage: (state, action) => {
      state.filterMariage = action.payload
    },
  },
})

export const {
  addMariage,
  setDataModifiesMariage,
  deleteMariage,
  setDetailItem,
  setMariageItem,
  setListFilterMariage,
  setListMariage,
  setFilterMariage
} = MariageSlice.actions

export default MariageSlice.reducer
