
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface IGalerieSlice {
    allDossier: IGalerie[];
    loadingGalerie: boolean;
}

export interface IGalerie {
    idDossier: number;
    libDossier: string;
    dateCreation: string;
    active: number;
    idImageParDossier: number;
    libImage: string;
    description?: any; 
}

const initialStates: IGalerieSlice = {
    allDossier: [],
    loadingGalerie: true,
}

export const galerieSlice = createSlice({
    name: "galerie",
    initialState: initialStates,
    reducers: {
  
        setAllDossier: (state, action: PayloadAction<IGalerie[]>) => {
            state.allDossier = action.payload;
        },
        setLoadingGalerie: (state, action: PayloadAction<boolean>) => {
            state.loadingGalerie = action.payload;
        },
        updateAllDossier: (state, action: PayloadAction<IGalerie>) => {
            state.allDossier.push(action.payload);
        },
    },
});

export const {
    setAllDossier,
    updateAllDossier,
    setLoadingGalerie
} = galerieSlice.actions

export default galerieSlice.reducer;
