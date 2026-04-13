import React from 'react';
import { Box, Grid, Typography } from '@mui/material';

import { PrintDocumentLayout } from 'src/components/print/print-document';
import { buildGalerieMediaUrl } from 'src/utils/apiClient';
import type { IGalerieEvenement, IGalerieImage } from 'src/store/galerieSlice';

type PrintIdentity = {
  email?: string;
  logoUtilisateur?: string;
  nomTemple?: string;
  nomUtilisateur?: string;
  prenomUtilisateur?: string;
  telephoneUtilisateur?: string;
};

type GaleriePrintDocumentProps = {
  event: IGalerieEvenement;
  identity?: PrintIdentity;
  images: IGalerieImage[];
};

export function GaleriePrintDocument({ event, identity, images }: GaleriePrintDocumentProps) {
  return (
    <PrintDocumentLayout
      identity={identity}
      title={`Galerie - ${event.titreGalerie}`}
      subtitle={`${event.typeEvenement || 'Evenement'} • ${event.dateEvenement || 'Date non precisee'} • ${event.lieuEvenement || 'Lieu non precise'}`}
      countLabel="Total images"
      countValue={images.length}
    >
      <Box className="print-block-avoid-break" sx={{ mb: 3 }}>
        <Typography variant="body1" sx={{ color: '#304760', mb: 0.5 }}>
          {event.descriptionGalerie || 'Album evenementiel de la communaute.'}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {images.map((image) => (
          <Grid item xs={3} key={image.idGalerieImage || image.cheminImage} className="print-block-avoid-break">
            <Box
              sx={{
                border: '1px solid rgba(15, 23, 42, 0.12)',
                borderRadius: 3,
                overflow: 'hidden',
                bgcolor: '#fff',
              }}
            >
              <Box
                component="img"
                src={buildGalerieMediaUrl(image.cheminImage)}
                alt={image.nomFichier}
                sx={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
              />
              <Box sx={{ p: 1.5 }}>
                <Typography variant="subtitle2" noWrap>
                  {image.legendeImage || image.nomFichier}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {image.dateAjout || ''}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </PrintDocumentLayout>
  );
}

export default GaleriePrintDocument;
