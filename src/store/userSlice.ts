import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { sanitizeSensitiveData } from 'src/utils/sensitive-data'

export type UserRole = 'admin' | 'gestionnaire' | 'lecteur'
export type ModulePermissionKey =
  | 'dashboard'
  | 'user'
  | 'culte'
  | 'departement'
  | 'familleJeunesse'
  | 'cellule'
  | 'groupe'
  | 'social'
  | 'galerie'
  | 'agenda'
  | 'comptabilite'
  | 'settings'

export interface IAuthentificationState {
  dataUtilisateur: IUtilisateur[];
  dataFilterUtilisateur: IUtilisateur[];
  listUtilisateur: IUtilisateur[];
  connecter: boolean;
  user: IUser | null;
  utilisateurItem: IUtilisateur | null;
  utilisateurData: IUtilisateur
  dataUtilisateurFilter: IUtilisateur[]
  filterUtilisateur: IUtilisateur[]
}

export interface IAuthentification {
  idUtilisateur: number;
  idMembre: number;
  userName: string;
  role: string;
}

export interface IUser {
  idUtilisateur: number;
  nomUtilisateur: number;
  password: string;
}

export interface IUtilisateur {
  idUtilisateur: number;
  idUtilisateurParent: number | null;
  roleUtilisateur: UserRole;
  permissionsUtilisateur: string;
  actifUtilisateur: number;
  logoUtilisateur: string;
  logoEglise: string;
  nomTemple: string;
  nomEgliseCourt: string;
  lieuEglise: string;
  nomUtilisateur: string;
  prenomUtilisateur: string;
  telephoneUtilisateur: string;
  telephoneSecretariatEglise: string;
  pasteurPrincipal: string;
  pasteurSecondaire: string;
  pasteurTroisieme: string;
  telephonePasteurPrincipal: string;
  telephonePasteurSecondaire: string;
  telephonePasteurTroisieme: string;
  capaciteAccueilEglise: string;
  nombreCultesDimanche: string;
  emailEglise: string;
  boitePostaleEglise: string;
  dateCreationEglise: string;
  nombrePasteursEglise: string;
  nombreAnciensEglise: string;
  nombreDiacresEglise: string;
  password: string;
  confirmPassword: string;
  email: string;
}

export const utilisateur: IUtilisateur = {
  idUtilisateur: 0,
  idUtilisateurParent: null,
  roleUtilisateur: 'admin',
  permissionsUtilisateur: '',
  actifUtilisateur: 1,
  logoUtilisateur: '',
  logoEglise: '',
  nomTemple: '',
  nomEgliseCourt: '',
  lieuEglise: '',
  nomUtilisateur: '',
  prenomUtilisateur: '',
  telephoneUtilisateur: '',
  telephoneSecretariatEglise: '',
  pasteurPrincipal: '',
  pasteurSecondaire: '',
  pasteurTroisieme: '',
  telephonePasteurPrincipal: '',
  telephonePasteurSecondaire: '',
  telephonePasteurTroisieme: '',
  capaciteAccueilEglise: '',
  nombreCultesDimanche: '',
  emailEglise: '',
  boitePostaleEglise: '',
  dateCreationEglise: '',
  nombrePasteursEglise: '',
  nombreAnciensEglise: '',
  nombreDiacresEglise: '',
  password: '',
  confirmPassword: '',
  email: ''
}

const initialStates: IAuthentificationState = {
  dataUtilisateur: [],
  dataFilterUtilisateur: [],
  listUtilisateur: [],
  connecter: false,
  user: null,
  utilisateurItem: null,
  utilisateurData: utilisateur,
  dataUtilisateurFilter: [],
  filterUtilisateur: [],
};

export const userSlice = createSlice({
  name: 'authentification',
  initialState: initialStates,

  reducers: {
    addUtilisateur: (state, action: PayloadAction<IUtilisateur>) => {
      state.dataUtilisateur.unshift(sanitizeSensitiveData(action.payload))
    },
    setListFilterUtilisateur: (state, action) => {
      state.dataFilterUtilisateur = action.payload
    },
    setListUtilisateur: (state, action) => {
      state.listUtilisateur = sanitizeSensitiveData(action.payload)
    },
    setUtilisateurData: (state, action: PayloadAction<IUtilisateur>) => {
      state.utilisateurData = sanitizeSensitiveData(action.payload)
    },
    deleteUtilisateur: (state, action) => {
      state.dataUtilisateur = state.dataUtilisateur.filter(
        (item) => item.idUtilisateur !== action.payload
      )
      state.dataFilterUtilisateur = state.dataFilterUtilisateur.filter(
        (item) => item.idUtilisateur !== action.payload
      )
      state.listUtilisateur = state.listUtilisateur.filter(
        (item) => item.idUtilisateur !== action.payload
      )
    },
    setConnecter: (state, action) => {
      state.connecter = action.payload
    },
    setUser: (state, action) => {
      state.user = sanitizeSensitiveData(action.payload)
    },
    setUtilisateur: (state, action) => {
      state.utilisateurItem = sanitizeSensitiveData(action.payload)
    },
    setDataModifiesUtilisateur: (state, action) => {
      const updatedUtilisateur = sanitizeSensitiveData(action.payload)
      state.dataUtilisateur = state.dataUtilisateur.map((item: any) =>
        item.idUtilisateur === action.payload.idUtilisateur ? updatedUtilisateur : item
      )
      state.dataFilterUtilisateur = state.dataFilterUtilisateur.map((item: any) =>
        item.idUtilisateur === action.payload.idUtilisateur ? updatedUtilisateur : item
      )
      state.listUtilisateur = state.listUtilisateur.map((item: any) =>
        item.idUtilisateur === action.payload.idUtilisateur ? updatedUtilisateur : item
      )
    },
    setFilterUtilisateur: (state, action) => {
      state.filterUtilisateur = action.payload
    },
  },
})

export const {
  addUtilisateur,
  deleteUtilisateur,
  setListFilterUtilisateur,
  setListUtilisateur,
  setConnecter,
  setUser,
  setDataModifiesUtilisateur,
  setUtilisateur,
  setUtilisateurData,
  setFilterUtilisateur,
} = userSlice.actions

export default userSlice.reducer
