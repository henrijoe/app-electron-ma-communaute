import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export interface IAgendaEvent {
  idAgenda?: number;
  titreAgenda: string;
  typeAgenda: string;
  dateAgenda: string | null;
  heureDebutAgenda: string;
  heureFinAgenda: string;
  lieuAgenda: string;
  descriptionAgenda: string;
  couleurAgenda: string;
  statutAgenda: string;
  idUtilisateur: number | null;
  dateCreation?: string | null;
}

export interface IAgendaSlice {
  listAgenda: IAgendaEvent[];
  loadingAgenda: boolean;
}

const initialState: IAgendaSlice = {
  listAgenda: [],
  loadingAgenda: false,
};

const agendaSlice = createSlice({
  name: 'agenda',
  initialState,
  reducers: {
    setListAgenda: (state, action: PayloadAction<IAgendaEvent[]>) => {
      state.listAgenda = Array.isArray(action.payload) ? action.payload : [];
    },
    setLoadingAgenda: (state, action: PayloadAction<boolean>) => {
      state.loadingAgenda = action.payload;
    },
    upsertAgenda: (state, action: PayloadAction<IAgendaEvent>) => {
      const index = state.listAgenda.findIndex((item) => item.idAgenda === action.payload.idAgenda);
      if (index >= 0) {
        state.listAgenda[index] = action.payload;
      } else {
        state.listAgenda.unshift(action.payload);
      }
    },
    removeAgenda: (state, action: PayloadAction<number>) => {
      state.listAgenda = state.listAgenda.filter((item) => item.idAgenda !== action.payload);
    },
  },
});

export const { removeAgenda, setListAgenda, setLoadingAgenda, upsertAgenda } = agendaSlice.actions;

export default agendaSlice.reducer;
