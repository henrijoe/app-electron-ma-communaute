import type { PayloadAction } from '@reduxjs/toolkit';

import { createSlice } from '@reduxjs/toolkit';

// Interface pour les entités du département
export interface IDepartement {
  idDepartement: number ;
  idUtilisateur: number | null;
  libelleLongDepartement: string;
  libelleCourtDepartement: string;
  sloganDepartement: string;
  responsableDepartement: string;
}

// Interface pour l'état du slice
export interface IDepartementSlice {
  dataDepartement: IDepartement[];
  dataFilterDepartement: IDepartement[];
  detailItem: IDepartement[];
  listDepartement: IDepartement[];
  filterDepartement: IDepartement[];
  DepartementItem: IDepartement;
}

// Valeur par défaut pour un département
export const departement: any = {
  idUtilisateur: null,
  libelleLongDepartement: "",
  libelleCourtDepartement: "",
  sloganDepartement: "",
  responsableDepartement: "",
};

// Initialisation des states
const initialState: IDepartementSlice = {
  dataDepartement: [],
  dataFilterDepartement: [],
  detailItem: [],
  listDepartement: [],
  filterDepartement: [],
  DepartementItem: departement,
};

export const DepartementSlice = createSlice({
  name: 'departement',
  initialState,
  reducers: {
    // Le backend renvoie parfois des structures inattendues; on protège le store.
    ensureArray: (state) => {
      state.dataDepartement = Array.isArray(state.dataDepartement) ? state.dataDepartement : [];
      state.dataFilterDepartement = Array.isArray(state.dataFilterDepartement)
        ? state.dataFilterDepartement
        : [];
      state.listDepartement = Array.isArray(state.listDepartement) ? state.listDepartement : [];
      state.filterDepartement = Array.isArray(state.filterDepartement) ? state.filterDepartement : [];
    },

    // Fonction pour ajouter un département
    addDepartement: (state, action: PayloadAction<IDepartement>) => {
      state.dataDepartement = Array.isArray(state.dataDepartement) ? state.dataDepartement : [];
      state.listDepartement = Array.isArray(state.listDepartement) ? state.listDepartement : [];
      state.dataFilterDepartement = Array.isArray(state.dataFilterDepartement)
        ? state.dataFilterDepartement
        : [];

      state.dataDepartement.unshift(action.payload);
      // Ajouter également à listDepartement
      state.listDepartement.unshift(action.payload);
      state.dataFilterDepartement.unshift(action.payload);
    },

    setDepartementItem: (state, action: PayloadAction<IDepartement>) => {
      state.DepartementItem = action.payload;
    },

    // Fonction pour mettre à jour la liste complète
    setListDepartement: (state, action: PayloadAction<IDepartement[]>) => {
      const nextDepartements = Array.isArray(action.payload) ? action.payload : [];
      state.listDepartement = nextDepartements;
      // Synchroniser avec dataDepartement si nécessaire
      state.dataDepartement = nextDepartements;
      state.dataFilterDepartement = nextDepartements;
    },

    // Fonction pour supprimer un département
    deleteDepartement: (state, action: PayloadAction<number>) => {
      state.dataDepartement = Array.isArray(state.dataDepartement) ? state.dataDepartement : [];
      state.dataFilterDepartement = Array.isArray(state.dataFilterDepartement)
        ? state.dataFilterDepartement
        : [];
      state.listDepartement = Array.isArray(state.listDepartement) ? state.listDepartement : [];

      state.dataDepartement = state.dataDepartement.filter(
        (item) => item.idDepartement !== action.payload
      );
      
      state.dataFilterDepartement = state.dataFilterDepartement.filter(
        (item) => item.idDepartement !== action.payload
      );
      
      // Mettre à jour listDepartement également
      state.listDepartement = state.listDepartement.filter(
        (item) => item.idDepartement !== action.payload
      );
    },
    
    setListFilterDepartement: (state, action: PayloadAction<IDepartement[]>) => {
      state.dataFilterDepartement = Array.isArray(action.payload) ? action.payload : [];
    },
    
    setDetailItem: (state, action: PayloadAction<IDepartement[]>) => {
      state.detailItem = action.payload;
    },

    // Fonction pour modifier un département existant - CORRIGÉE
    setDataModifiesDepartement: (state, action: PayloadAction<IDepartement>) => {
      const updatedDepartement = action.payload;
      state.dataDepartement = Array.isArray(state.dataDepartement) ? state.dataDepartement : [];
      state.dataFilterDepartement = Array.isArray(state.dataFilterDepartement)
        ? state.dataFilterDepartement
        : [];
      state.listDepartement = Array.isArray(state.listDepartement) ? state.listDepartement : [];
      
      // Mettre à jour dans dataDepartement
      state.dataDepartement = state.dataDepartement.map((item) =>
        item.idDepartement === updatedDepartement.idDepartement ? updatedDepartement : item
      );
      
      // Mettre à jour dans dataFilterDepartement
      state.dataFilterDepartement = state.dataFilterDepartement.map((item) =>
        item.idDepartement === updatedDepartement.idDepartement ? updatedDepartement : item
      );
      
      // Mettre à jour dans listDepartement (important pour l'affichage)
      state.listDepartement = state.listDepartement.map((item) =>
        item.idDepartement === updatedDepartement.idDepartement ? updatedDepartement : item
      );
 
    },
    
    setFilterDepartement: (state, action: PayloadAction<IDepartement[]>) => {
      state.filterDepartement = action.payload;
    },

    // Nouvelles fonctions utiles
    resetDepartementItem: (state) => {
      state.DepartementItem = departement;
    },
    
    clearDepartementData: (state) => {
      state.dataDepartement = [];
      state.dataFilterDepartement = [];
      state.detailItem = [];
      state.listDepartement = [];
      state.filterDepartement = [];
      state.DepartementItem = departement;
    },
  },
});

export const {
  addDepartement,
  ensureArray,
  setDataModifiesDepartement,
  deleteDepartement,
  setDetailItem,
  setDepartementItem,
  setListFilterDepartement,
  setListDepartement,
  setFilterDepartement,
  resetDepartementItem,
  clearDepartementData,
} = DepartementSlice.actions;

export default DepartementSlice.reducer;
