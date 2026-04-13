import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

// creer interface pour designer les differents fonction  du Departement du state
export interface IResponsabiliteSlice {
  dataResponsabilite: IResponsable[]
  dataFilterResponsabilite: IResponsable[]
  detailItem: IResponsable[]
  listResponsabilite: IResponsable[]
  ResponsabiliteItem: IResponsable
}

// creer interface comportant des differents entités  du Departement
  export interface IResponsable {
    idResponsabilite:number;
    idUtilisateur:number;
    libelleResponsabilite:string;
    descriptionResponsabilite:string;
  }
  
export const responsabilite:any = {
  idResponsabilite:null,
  idUtilisateur:null,
  libelleResponsabilite:"",
  descriptionResponsabilite:"",
}

// initialiation des states
const initialStates: IResponsabiliteSlice = {
  dataResponsabilite: [],
  dataFilterResponsabilite: [],
  detailItem: [],
  listResponsabilite: [],
  ResponsabiliteItem: responsabilite,
}


export const ResponsableSlice = createSlice({
  name: 'parametre',
  initialState: initialStates,
  reducers: {
    // fonction pour ajouter un Departement
    addResponsabilite: (state, action: PayloadAction<IResponsable>) => {
      state.dataResponsabilite.unshift(action.payload)
    },

    setResponsabiliteItem: (state, action) => {
      state.ResponsabiliteItem = action.payload
    },

    // fonction pour ajouter le dernier enregistrement au dessus
    setListResponsabilite: (state, action) => {
      state.listResponsabilite = action.payload
    },

    // fonction pour suprimer un Departement
    deleteResponsabilite: (state, action) => {
      state.dataResponsabilite = state.dataResponsabilite.filter(
        (item) => item.idResponsabilite !== action.payload
      );
    
      state.dataFilterResponsabilite = state.dataFilterResponsabilite.filter(
        (item) => item.idResponsabilite !== action.payload
      );
    },
    
    // fonction pour rechecher un Departement dans le tableau
    setListFilterResponsabilite: (state, action) => {
      state.dataFilterResponsabilite = action.payload
    },
    // fonction pour voir les detail de chaque Departement enregister
    setDetailItem: (state, action) => {
      state.detailItem = action.payload
    },

    // fonction pour modifier chaque Departement enregister
    setDataModifiesResponsabilite: (state, action) => {
      state.dataResponsabilite = state.dataResponsabilite?.map((item: any) =>
        item.idResponsabilite === action.payload.idResponsabilite ? action.payload : item
      )
      state.dataFilterResponsabilite = state.dataFilterResponsabilite?.map((item: any) =>
        item.idResponsabilite === action.payload.idResponsabilite ? action.payload : item
      )
    },
  },
})

export const {
  addResponsabilite,
  setDataModifiesResponsabilite,
  deleteResponsabilite,
  setDetailItem,
  setResponsabiliteItem,
  setListFilterResponsabilite,
  setListResponsabilite
} = ResponsableSlice.actions

export default ResponsableSlice.reducer
