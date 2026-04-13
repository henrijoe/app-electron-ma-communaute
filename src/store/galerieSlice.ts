import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface IGalerieImage {
  idGalerieImage?: number;
  idGalerie: number;
  nomFichier: string;
  cheminImage: string;
  tailleImage?: number | null;
  typeMime: string;
  legendeImage?: string;
  dateAjout?: string | null;
  idUtilisateur: number;
}

export interface IGalerieEvenement {
  idGalerie?: number;
  titreGalerie: string;
  typeEvenement: string;
  dateEvenement: string | null;
  lieuEvenement: string;
  descriptionGalerie: string;
  couvertureGalerie: string;
  dossierGalerie: string;
  dateCreation?: string | null;
  idUtilisateur: number;
  nombreImages?: number;
}

export interface IGalerieSlice {
  currentGalerieImages: IGalerieImage[];
  listGalerie: IGalerieEvenement[];
  loadingGalerie: boolean;
}

const initialState: IGalerieSlice = {
  currentGalerieImages: [],
  listGalerie: [],
  loadingGalerie: true,
};

export const galerieSlice = createSlice({
  name: 'galerie',
  initialState,
  reducers: {
    setListGalerie: (state, action: PayloadAction<IGalerieEvenement[]>) => {
      state.listGalerie = action.payload;
    },
    setCurrentGalerieImages: (state, action: PayloadAction<IGalerieImage[]>) => {
      state.currentGalerieImages = action.payload;
    },
    setLoadingGalerie: (state, action: PayloadAction<boolean>) => {
      state.loadingGalerie = action.payload;
    },
    upsertGalerie: (state, action: PayloadAction<IGalerieEvenement>) => {
      const index = state.listGalerie.findIndex((item) => item.idGalerie === action.payload.idGalerie);
      if (index >= 0) {
        state.listGalerie[index] = action.payload;
      } else {
        state.listGalerie.unshift(action.payload);
      }
    },
    removeGalerie: (state, action: PayloadAction<number>) => {
      state.listGalerie = state.listGalerie.filter((item) => item.idGalerie !== action.payload);
      state.currentGalerieImages = state.currentGalerieImages.filter((item) => item.idGalerie !== action.payload);
    },
    setGalerieImagesForCurrentEvent: (state, action: PayloadAction<{ idGalerie: number; images: IGalerieImage[] }>) => {
      state.currentGalerieImages = action.payload.images;
      const eventIndex = state.listGalerie.findIndex((item) => item.idGalerie === action.payload.idGalerie);
      if (eventIndex >= 0) {
        state.listGalerie[eventIndex].nombreImages = action.payload.images.length;
        if (!state.listGalerie[eventIndex].couvertureGalerie && action.payload.images[0]) {
          state.listGalerie[eventIndex].couvertureGalerie = action.payload.images[0].cheminImage;
        }
      }
    },
  },
});

export const {
  setListGalerie,
  setCurrentGalerieImages,
  setLoadingGalerie,
  upsertGalerie,
  removeGalerie,
  setGalerieImagesForCurrentEvent,
} = galerieSlice.actions;

export default galerieSlice.reducer;
