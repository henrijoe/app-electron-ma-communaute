
import { combineReducers } from 'redux';
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { configureStore } from '@reduxjs/toolkit';

import appReducer, { type IAppState } from './appSlice';
import CelluleReducer, { type ICelluleSlice } from './celluleSlice';
import CulteReducer, { type ICulteSlice } from './culteSlice';
import DecesReducer, { type IDecesSlice } from './decesSlice';
import DepartementReducer, { type IDepartementSlice } from './departementSlice';
import GroupeReducer, { type IGroupeSlice } from './groupeSlice';
import MariageReducer, { type IMariageSlice } from './mariageSlice';
import MembreReducer, { type IMembreSlice } from './membreSlice';
import NaissanceReducer, { type INaissanceSlice } from './naissanceSlice';
import ParametreReducer, { type IResponsabiliteSlice } from './parametreSlice';
import UserReducer, { type IAuthentificationState } from './userSlice';


//
export interface IReduxState {
  membre: IMembreSlice;
  cellule: ICelluleSlice;
  departement: IDepartementSlice;
  groupe: IGroupeSlice;
  application: IAppState;
  authentification: IAuthentificationState;
  deces: IDecesSlice;
  naissance: INaissanceSlice;
  mariage: IMariageSlice;
  parametre: IResponsabiliteSlice;
  culte: ICulteSlice;
}

const reducers = combineReducers({
  membre: MembreReducer,
  cellule: CelluleReducer,
  departement: DepartementReducer,
  groupe: GroupeReducer,
  application: appReducer,
  authentification: UserReducer,
  deces: DecesReducer,
  naissance: NaissanceReducer,
  mariage: MariageReducer,
  parametre: ParametreReducer,
  culte: CulteReducer,
});

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['application', 'membre','cellule','departement','groupe',"culte","mariage",'naissance'],
  timeout: 1000,
};

const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({
  reducer: persistedReducer,
  devTools: import.meta.env.MODE !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/REGISTER'
        ],
      },
    }),
});

// Solution pour obtenir le type correct avec Redux Persist
type Store = typeof store;
type StoreState = ReturnType<Store['getState']>;
type StoreDispatch = Store['dispatch'];

export type RootState = StoreState;
export type AppDispatch = StoreDispatch;

export default store;
