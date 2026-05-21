import React from 'react';
import { useSelector } from 'react-redux';
import { Box, GlobalStyles, Typography } from '@mui/material';

import { PrintDocumentLayout, PrintEmptyState } from 'src/components/print/print-document';
import { buildGalerieMediaUrl } from 'src/utils/apiClient';
import type { IReduxState } from 'src/store/store';
import type { IGalerieEvenement, IGalerieImage } from 'src/store/galerieSlice';

type GaleriePrintDocumentProps = {
  event: IGalerieEvenement;
  images: IGalerieImage[];
};

const chunkImages = (items: IGalerieImage[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, index * size + size)
  );

const formatDisplayDate = (value?: string | null): string => {
  if (!value) return '';

  const [datePart] = String(value).split('T');
  const parts = datePart.split('-');

  if (parts.length === 3) {
    const [year, month, day] = parts;

    if (year.length === 4 && month && day) {
      return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
    }
  }

  return String(value);
};

const buildEventSubtitle = (event: IGalerieEvenement): string =>
  [
    event.typeEvenement || 'Evenement',
    formatDisplayDate(event.dateEvenement) || 'Date non precisee',
    event.lieuEvenement || 'Lieu non precise',
  ].join(' - ');

export function GaleriePrintDocument({ event, images }: GaleriePrintDocumentProps) {
  const identity = useSelector((state: IReduxState) => ({
    ...(state.authentification.utilisateurData || {}),
    ...(state.application.userConnected || {}),
  }));

  if (!images.length) {
    return (
      <PrintDocumentLayout
        identity={identity}
        title={`Galerie - ${event.titreGalerie}`}
        subtitle={buildEventSubtitle(event)}
        countLabel="Total images"
        countValue={0}
        variant="plain"
      >
        <PrintEmptyState title="Aucune image" message="Cette galerie ne contient encore aucune photo a imprimer." />
      </PrintDocumentLayout>
    );
  }

  const pages = chunkImages(images, 2);

  return (
    <>
      <GlobalStyles
        styles={{
          '@page': {
            size: 'A4 landscape',
            margin: '10mm',
          },
          '@media print': {
            'html, body': {
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
              background: '#ffffff',
            },
            '.galerie-print-page': {
              breakAfter: 'page',
              pageBreakAfter: 'always',
            },
            '.galerie-print-page:last-of-type': {
              breakAfter: 'auto',
              pageBreakAfter: 'auto',
            },
            '.galerie-print-block': {
              breakInside: 'avoid',
              pageBreakInside: 'avoid',
            },
          },
        }}
      />

      {pages.map((pageImages, pageIndex) => (
        <Box
          key={`page-${pageIndex + 1}`}
          className="galerie-print-page"
          sx={{
            width: '100%',
            minHeight: '100vh',
            px: 0,
            py: 0,
            background: '#ffffff',
          }}
        >
          <PrintDocumentLayout
            identity={identity}
            title={`Galerie - ${event.titreGalerie}`}
            subtitle={buildEventSubtitle(event)}
            countLabel="Page"
            countValue={pageIndex + 1}
            variant="plain"
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 2,
                alignItems: 'start',
              }}
            >
              {pageImages.map((image, imageIndex) => (
                <Box
                key={image.idGalerieImage || image.cheminImage || imageIndex}
                className="galerie-print-block"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <Box
                  component="img"
                  src={buildGalerieMediaUrl(image.cheminImage)}
                  alt={image.nomFichier}
                  sx={{
                    width: '100%',
                    height: '170mm',
                    objectFit: 'contain',
                    display: 'block',
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    border: 'none',
                  }}
                />

                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    color: '#0f172a',
                    textAlign: 'center',
                    lineHeight: 1.3,
                  }}
                >
                  {image.legendeImage || image.nomFichier || `Photo ${pageIndex * 2 + imageIndex + 1}`}
                </Typography>
                </Box>
              ))}

              {pageImages.length === 1 && <Box />}
            </Box>
          </PrintDocumentLayout>
        </Box>
      ))}
    </>
  );
}

export default GaleriePrintDocument;
