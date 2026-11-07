import { forwardRef } from 'react';

import Box from '@mui/material/Box';

// ----------------------------------------------------------------------
// Feuille d'une famille de jeunesse, sur le modèle papier du département :
// le nom de l'église et son logo, « DÉPARTEMENT DE JEUNESSE », le nom de la
// famille, puis un tableau N°, nom et prénoms, contacts, domicile, baptisé,
// niveau d'étude, fonction.
//
// Remplie avec les membres rattachés à la famille, et complétée de lignes vides
// jusqu'à 18 pour les nouveaux venus. Sans membre ni nom de famille, c'est la
// feuille vierge qu'on remplit à la main.

export type MembreFamille = {
  idMembre?: number;
  nomMembre?: string;
  prenomMembre?: string;
  contactMembre?: string;
  residenceMembre?: string;
  baptemeEauMembre?: string | number | null;
  libelleNiveauEtude?: string;
  fonctionMembre?: string;
};

export const LIGNES_MINIMUM = 18;

/** Baptême d'eau : la fiche le range en 1 / 0, ou en Oui / Non selon l'ancienneté. */
const baptise = (valeur: unknown): string => {
  const texte = String(valeur ?? '').trim().toLowerCase();
  if (texte === '1' || texte === 'oui') return 'Oui';
  if (texte === '0' || texte === '2' || texte === 'non') return 'Non';
  return '';
};

const bordure = '1px solid #000';
const POLICE = 'var(--police-etat, "Arial Narrow", Arial, sans-serif)';

const cellule: React.CSSProperties = {
  border: bordure,
  padding: '2px 5px',
  height: '7.2mm',
  fontSize: 13,
  verticalAlign: 'middle',
  color: '#000',
};

const entete: React.CSSProperties = {
  ...cellule,
  height: 'auto',
  padding: '6px 4px',
  fontWeight: 700,
  textAlign: 'center',
  textTransform: 'uppercase',
};

type FeuilleFamilleJeunesseProps = {
  nomEglise: string;
  logoUrl?: string | null;
  nomFamille?: string;
  membres?: MembreFamille[];
};

export const FeuilleFamilleJeunesse = forwardRef<HTMLDivElement, FeuilleFamilleJeunesseProps>(
  ({ nomEglise, logoUrl, nomFamille, membres = [] }, ref) => {
    const nombreLignes = Math.max(LIGNES_MINIMUM, membres.length);
    const lignes = Array.from({ length: nombreLignes }, (_, index) => membres[index] || null);

    return (
      <Box ref={ref} sx={{ bgcolor: '#fff', color: '#000', p: 3, fontFamily: POLICE, '@media print': { p: 0 } }}>
        {/* ---------------------------------------------------------- en-tête */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, borderBottom: '2px solid #000', pb: 0.5 }}>
          <Box
            sx={{
              flex: 1,
              textAlign: 'center',
              fontWeight: 700,
              fontStyle: 'italic',
              textTransform: 'uppercase',
              fontSize: 17,
            }}
          >
            {nomEglise}
          </Box>
          {logoUrl ? (
            <Box component="img" src={logoUrl} alt="" sx={{ width: 52, height: 52, objectFit: 'contain' }} />
          ) : null}
        </Box>
        <Box sx={{ textAlign: 'center', fontWeight: 700, fontSize: 15, mt: 0.5 }}>
          DÉPARTEMENT DE JEUNESSE
        </Box>

        {/* ---------------------------------------------------------- tableau */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: POLICE, marginTop: 4 }}>
          <thead>
            <tr>
              <th colSpan={7} style={{ ...entete, textTransform: 'none', fontSize: 14 }}>
                FAMILLE{' '}
                {nomFamille ? (
                  <span style={{ textTransform: 'uppercase' }}>{nomFamille}</span>
                ) : (
                  '.....................................................'
                )}
              </th>
            </tr>
            <tr>
              <th style={{ ...entete, width: '4%' }}>N°</th>
              <th style={{ ...entete, width: '27%' }}>Nom &amp; prénom(s)</th>
              <th style={{ ...entete, width: '14%' }}>Contacts</th>
              <th style={{ ...entete, width: '15%' }}>Domicile</th>
              <th style={{ ...entete, width: '9%' }}>
                Baptisé
                <br />
                <span style={{ textTransform: 'none', fontWeight: 700 }}>(oui/non)</span>
              </th>
              <th style={{ ...entete, width: '13%' }}>
                Niveau
                <br />
                d&apos;étude
              </th>
              <th style={{ ...entete, width: '18%' }}>Fonction</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((membre, index) => (
              <tr key={index} style={{ breakInside: 'avoid' }}>
                <td style={{ ...cellule, textAlign: 'center' }}>{index + 1}</td>
                <td style={{ ...cellule, fontWeight: 700 }}>
                  {membre ? `${membre.nomMembre || ''} ${membre.prenomMembre || ''}`.trim() : ''}
                </td>
                <td style={cellule}>{membre?.contactMembre || ''}</td>
                <td style={cellule}>{membre?.residenceMembre || ''}</td>
                <td style={{ ...cellule, textAlign: 'center' }}>{membre ? baptise(membre.baptemeEauMembre) : ''}</td>
                <td style={cellule}>{membre?.libelleNiveauEtude || ''}</td>
                <td style={cellule}>{membre?.fonctionMembre || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    );
  }
);

FeuilleFamilleJeunesse.displayName = 'FeuilleFamilleJeunesse';
