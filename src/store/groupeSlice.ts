import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

// créer interface pour designer les différents fonction  du Groupe du state
export interface IGroupeSlice {
  dataGroupe: IGroupe[]
  dataFilterGroupe: IGroupe[]
  detailItem: IGroupe[]
  listGroupe: IGroupe[]
  filterGroupe: IGroupe[]
  GroupeItem: IGroupe
}

export interface IGroupe {
  idGroupe: number;
  libelleGroupe: string;
  descriptionGroupe: string;
  responsableGroupe: string;
  idUtilisateur: number;
}  
export const groupe:any = {
  idGroupe:null,
  idUtilisateur:null,
  libelleGroupe:"",
  descriptionGroupe:"",
  responsableGroupe:"",
}

// initialisation des states
const initialStates: IGroupeSlice = {
  dataGroupe: [],
  dataFilterGroupe: [],
  detailItem: [],
  listGroupe: [],
  filterGroupe: [],
  GroupeItem: groupe,
}

export const GroupeSlice = createSlice({
  name: 'groupe',
  initialState: initialStates,
  reducers: {
    ensureArray: (state) => {
      state.dataGroupe = Array.isArray(state.dataGroupe) ? state.dataGroupe : []
      state.dataFilterGroupe = Array.isArray(state.dataFilterGroupe) ? state.dataFilterGroupe : []
      state.listGroupe = Array.isArray(state.listGroupe) ? state.listGroupe : []
      state.filterGroupe = Array.isArray(state.filterGroupe) ? state.filterGroupe : []
    },
    // fonction pour ajouter un Groupe
    addGroupe: (state, action: PayloadAction<IGroupe>) => {
      state.dataGroupe.unshift(action.payload)
      state.dataFilterGroupe.unshift(action.payload)
      state.listGroupe.unshift(action.payload)
    },

    setGroupeItem: (state, action) => {
      state.GroupeItem = action.payload
    },

    // fonction pour ajouter le dernier enregistrement au dessus
    setListGroupe: (state, action) => {
      state.listGroupe = Array.isArray(action.payload) ? action.payload : []
    },

    // fonction pour supprimer un Groupe
    deleteGroupe: (state, action) => {
      state.dataGroupe = state.dataGroupe.filter(
        (item) => item.idGroupe !== action.payload
      );
    
      state.dataFilterGroupe = state.dataFilterGroupe.filter(
        (item) => item.idGroupe !== action.payload
      );
      state.listGroupe = state.listGroupe.filter(
        (item) => item.idGroupe !== action.payload
      );
    },
    
    // fonction pour rechercher un Groupe dans le tableau
    setListFilterGroupe: (state, action) => {
      state.dataFilterGroupe = action.payload
    },
    // fonction pour voir les détail de chaque Groupe enregistrer
    setDetailItem: (state, action) => {
      state.detailItem = action.payload
    },
    
    // fonction pour modifier chaque Groupe enregistrer
    setDataModifiesGroupe: (state, action) => {
      state.dataGroupe = state.dataGroupe?.map((item: any) =>
      item.idGroupe === action.payload.idGroupe ? action.payload : item
      )
      state.dataFilterGroupe = state.dataFilterGroupe?.map((item: any) =>
      item.idGroupe === action.payload.idGroupe ? action.payload : item
      )
      state.listGroupe = state.listGroupe?.map((item: any) =>
      item.idGroupe === action.payload.idGroupe ? action.payload : item
      )
    },
    setFilterGroupe: (state, action) => {
      state.filterGroupe = action.payload
    },
  },
})

export const {
  ensureArray,
  addGroupe,
  setDataModifiesGroupe,
  deleteGroupe,
  setDetailItem,
  setGroupeItem,
  setListFilterGroupe,
  setListGroupe,
  setFilterGroupe
} = GroupeSlice.actions

export default GroupeSlice.reducer
