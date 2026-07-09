import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

// creer interface pour designer les differents fonction  du Departement du state
export interface ICelluleSlice {
  dataCellule: ICellule[]
  dataFilterCellule: ICellule[]
  detailItem: ICellule[]
  listCellule: ICellule[]
  filterCellule: ICellule[]
  dataRespoCellule: IResponsable[]
  CelluleItem: ICellule
}

  export interface ICellule {
    idCellule: number;
    idUtilisateur: number;
    nomCellule: string;
    responsableVisiteCellule:string;
    lieuCellule: string;
    nombreMembreCellule: string;
    responsableCellule: string;
  }
  
export const cellule:any = {
  idCellule:null,
  idUtilisateur:null,
  nomCellule:"",
  responsableVisiteCellule:"",
  lieuCellule:"",
  nombreMembreCellule:"",
  responsableCellule:"",
}

export interface IResponsable {
  idResponsabilite:number;
  libelleResponsabilite:string;
  descriptionResponsabilite:string;
  idUtilisateur:number;
  }
  
// initialiation des states
const initialStates: ICelluleSlice = {
  dataCellule: [],
  dataFilterCellule: [],
  detailItem: [],
  listCellule: [],
  filterCellule: [],
  dataRespoCellule: [],
  CelluleItem: cellule,
}

export const CelluleSlice = createSlice({
  name: 'cellule',
  initialState: initialStates,
  reducers: {
    ensureArray: (state) => {
      state.dataCellule = Array.isArray(state.dataCellule) ? state.dataCellule : []
      state.dataFilterCellule = Array.isArray(state.dataFilterCellule) ? state.dataFilterCellule : []
      state.listCellule = Array.isArray(state.listCellule) ? state.listCellule : []
      state.filterCellule = Array.isArray(state.filterCellule) ? state.filterCellule : []
    },
    // fonction pour ajouter un Departement
    addCellule: (state, action: PayloadAction<ICellule>) => {
      state.dataCellule.unshift(action.payload)
      state.dataFilterCellule.unshift(action.payload)
      state.listCellule.unshift(action.payload)
    },

    setCelluleItem: (state, action) => {
      state.CelluleItem = action.payload
    },

    // fonction pour ajouter le dernier enregistrement au dessus
    setListCellule: (state, action) => {
      state.listCellule = Array.isArray(action.payload) ? action.payload : []
    },

    // fonction pour suprimer un Departement
    deleteCellule: (state, action) => {
      state.dataCellule = state.dataCellule.filter(
        (item) => item.idCellule !== action.payload
      );    
      state.dataFilterCellule = state.dataFilterCellule.filter(
        (item) => item.idCellule !== action.payload
      );
      state.listCellule = state.listCellule.filter(
        (item) => item.idCellule !== action.payload
      );
    },
    
    // fonction pour rechecher un Departement dans le tableau
    setListFilterCellule: (state, action) => {
      state.dataFilterCellule = action.payload
    },
    // fonction pour voir les detail de chaque Departement enregister
    setDetailItem: (state, action) => {
      state.detailItem = action.payload
    },
    
    // fonction pour modifier chaque Departement enregister
    setDataModifiesCellule: (state, action) => {
      state.dataCellule = state.dataCellule?.map((item: any) =>
      item.idCellule === action.payload.idCellule ? action.payload : item
      )
      state.dataFilterCellule = state.dataFilterCellule?.map((item: any) =>
      item.idCellule === action.payload.idCellule ? action.payload : item
      )
      state.listCellule = state.listCellule?.map((item: any) =>
      item.idCellule === action.payload.idCellule ? action.payload : item
      )
    },
    setFilterCellule: (state, action) => {
      state.filterCellule = action.payload
    },
    setDataRespoCellule: (state, action) => {
      state.dataRespoCellule = action.payload
    },
  },
})

export const {
  ensureArray,
  addCellule,
  setDataModifiesCellule,
  deleteCellule,
  setDetailItem,
  setCelluleItem,
  setListFilterCellule,
  setListCellule,
  setFilterCellule,
  setDataRespoCellule
} = CelluleSlice.actions

export default CelluleSlice.reducer
