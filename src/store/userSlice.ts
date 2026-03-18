import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

// creer interface pour designer les differents fonction  d'authentification du state
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

// creer interface comportant des differents entités  d'authentification
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
  logoUtilisateur: string;
  nomTemple: string;
  nomUtilisateur: string;
  prenomUtilisateur: string;
  telephoneUtilisateur: string;
  password: string;
  confirmPassword: string;
  email: string;
}

export const utilisateur: any = {
  logoUtilisateur:'',
  nomTemple: '',
  nomUtilisateur: '',
  prenomUtilisateur: '',
  telephoneUtilisateur: '',
  password: '',
  confirmPassword: '',
  email: ''
}

// fonction pour initialiser les differents types des fonction
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
    // fonction pour ajouter un authentification
    addUtilisateur: (state, action: PayloadAction<IUtilisateur>) => {
      state.dataUtilisateur.unshift(action.payload)
    },
    // fonction pour rechecher d'authentification dans le tableau
    setListFilterUtilisateur: (state, action) => {
      state.dataFilterUtilisateur = action.payload
    },
    setListUtilisateur: (state, action) => {
      state.listUtilisateur = action.payload
    },
    setUtilisateurData: (state, action) => {
      state.dataUtilisateurFilter = action.payload;
      state.utilisateurData = action.payload;
    },

    // fonction pour suprimer une ligne d'authentification enregister
    deleteUtilisateur: (state, action) => {
      state.dataUtilisateur = state.dataUtilisateur.filter(
        (item) => item.idUtilisateur !== action.payload
      )
      state.dataFilterUtilisateur = state.dataFilterUtilisateur.filter(
        (item) => item.idUtilisateur !== action.payload
      )
    },
    // fonction pour se connecter
    setConnecter: (state, action) => {
      state.connecter = action.payload
    },
    // fonction pour connaitre un authentification
    setUser: (state, action) => {
      state.user = action.payload
    },
    setUtilisateur: (state, action) => {
      state.utilisateurItem = action.payload
    },

    setDataModifiesUtilisateur: (state, action) => {
      state.dataUtilisateur = state.dataUtilisateur.map((item: any) =>
        item.idUtilisateur === action.payload.idUtilisateur ? action.payload : item
      )
      state.dataFilterUtilisateur = state.dataFilterUtilisateur.map((item: any) =>
        item.idUtilisateur === action.payload.idUtilisateur ? action.payload : item
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
