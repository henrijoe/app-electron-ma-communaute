import React from 'react';

import { Box, GlobalStyles } from '@mui/material';

import { buildEcodimMediaUrl } from 'src/utils/apiClient';

import {
  LigneChamp,
  Pointilles,
  POLICE_FICHE,
  BLEU_OFFICIEL,
  EnTeteOfficiel,
  styleCellule,
  styleTableau,
  useIdentiteEglise,
  dateEtLieuNaissance,
} from './fiche-commune';

// ----------------------------------------------------------------------
// Fiche de suivi de l'enfant — reprise du formulaire officiel du département
// enfants, en deux usages :
//
// - vierge, à remplir à la main (impression en lot pour une classe) ;
// - pré-remplie pour un enfant donné, depuis sa ligne dans la liste.
//
// Le tableau de notes reste vide : ces évaluations se portent au stylo. Celui
// de l'ASSIDUITÉ, lui, se remplit tout seul dès que l'appel du dimanche est
// saisi — c'est précisément ce que la fiche papier servait à tenir à la main.

// Règle "@page" NOMMÉE, et non anonyme : plusieurs documents imprimables restent
// montés en même temps dans cette page. react-to-print recopie toutes les balises
// <style> dans son iframe, et une règle "@page" générique déclarée par un autre
// document écraserait la nôtre (à spécificité égale, la dernière l'emporte).
// Voir le commentaire détaillé dans sections/user/etats/listeMembrePdf.tsx.
export const FICHE_SUIVI_PAGE_STYLE = `
@page ficheSuiviPortrait {
  size: A4 portrait;
  margin: 10mm;
}

.fiche-suivi-print-root {
  page: ficheSuiviPortrait;
}
`;

const MOIS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

/** Un mois compte au plus cinq dimanches : la fiche d'origine prévoit cinq lignes. */
const LIGNES_ASSIDUITE = 5;
const LIGNES_OBSERVATIONS = 5;

/** Abréviation portée dans la case d'assiduité. */
const LETTRE_STATUT: Record<string, string> = {
  present: 'P',
  absent: 'A',
  excuse: 'E',
};

const styleBandeauOfficiel: React.CSSProperties = {
  backgroundColor: '#EFEFEF',
  border: '1px solid #000',
  borderBottom: 'none',
  fontWeight: 700,
  fontSize: 11.5,
  padding: '3px 6px',
  marginTop: 12,
};

const styleEnteteOfficiel: React.CSSProperties = {
  border: '1px solid #000',
  padding: '3px 2px',
  textAlign: 'center',
  fontWeight: 700,
  fontSize: 11,
  backgroundColor: '#FFF',
};

type FicheSuiviEnfantProps = {
  /** Omis pour une fiche vierge. */
  enfant?: any | null;
  /**
   * Appels de l'enfant sur l'année, avec leur date. Omis pour une fiche vierge :
   * le tableau d'assiduité reste alors à remplir au stylo.
   */
  presences?: any[];
};

export function FicheSuiviEnfant({ enfant, presences = [] }: FicheSuiviEnfantProps) {
  const identite = useIdentiteEglise();
  const photoUrl = enfant?.photoEnfant ? buildEcodimMediaUrl(enfant.photoEnfant) : '';

  // L'année ecclésiastique court sur deux années civiles : de septembre à août.
  const maintenant = new Date();
  const anneeDebut = maintenant.getMonth() >= 8 ? maintenant.getFullYear() : maintenant.getFullYear() - 1;

  /**
   * Appels de l'enfant, rangés par mois et par ordre de date.
   *
   * Un mois sans appel reste vide : la case blanche signifie « non renseigné »,
   * et c'est bien ce qu'elle veut dire ici.
   */
  const assiduiteParMois = React.useMemo(() => {
    const parMois: string[][] = MOIS.map(() => []);

    presences
      .filter((presence) => presence?.idEnfantEcodim === enfant?.idEnfantEcodim)
      .map((presence) => ({
        jour: String(presence.dateCulte || '').slice(0, 10),
        statut: String(presence.statutPresence || ''),
      }))
      .filter((ligne) => ligne.jour)
      .sort((a, b) => a.jour.localeCompare(b.jour))
      .forEach((ligne) => {
        const mois = Number(ligne.jour.slice(5, 7)) - 1;
        if (mois < 0 || mois > 11) return;

        const lettre = LETTRE_STATUT[ligne.statut] || '';
        parMois[mois].push(`${ligne.jour.slice(8)} ${lettre}`.trim());
      });

    return parMois;
  }, [presences, enfant]);

  return (
    <>
      <GlobalStyles styles={FICHE_SUIVI_PAGE_STYLE} />

      <Box
        className="fiche-suivi-print-root"
        sx={{
          width: '190mm',
          margin: '0 auto',
          color: '#000',
          backgroundColor: '#fff',
          fontFamily: POLICE_FICHE,
        }}
      >
        <EnTeteOfficiel identite={identite} />

        {/* ------------------------------------------------------- titre + photo */}
        <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: 12 }}>
          <div style={{ flex: 1, textAlign: 'center', paddingTop: 4 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 17,
                textDecoration: 'underline',
                color: BLEU_OFFICIEL,
              }}
            >
              FICHE DE SUIVI DE L&apos;ENFANT
            </div>
            <div style={{ fontSize: 12.5, marginTop: 6 }}>
              ANNÉE ECCLÉSIASTIQUE {anneeDebut} / {anneeDebut + 1}
            </div>
          </div>

          {/* Emplacement photo : rempli si l'enfant en a une, vide sinon. */}
          <div
            style={{
              width: 88,
              height: 98,
              border: '1px solid #000',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : null}
          </div>
        </div>

        {/* ------------------------------------------------- identité de l'enfant */}
        <div style={{ marginTop: 14 }}>
          <LigneChamp libelle="RÉGION" valeur={identite.region} />
          <LigneChamp libelle="ÉGLISE" valeur={identite.nom} />

          <div style={{ height: 8 }} />

          <LigneChamp libelle="NOM" valeur={enfant?.nomEnfant} />
          <LigneChamp libelle="PRÉNOMS" valeur={enfant?.prenomEnfant} />
          <LigneChamp libelle="DATE ET LIEU DE NAISSANCE" valeur={dateEtLieuNaissance(enfant)} />

          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ flex: 1 }}>
              <LigneChamp libelle="CLASSE ECODIM" valeur={enfant?.libelleClasse} />
            </div>
            <div style={{ flex: 1 }}>
              <LigneChamp libelle="GROUPE ECODIM" valeur={enfant?.groupeEcodimEnfant} />
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------ notes & assiduité */}
        <div style={styleBandeauOfficiel}>NOTES DE L&apos;ENFANT &amp; ASSIDUITÉ</div>

        <table style={styleTableau}>
          <thead>
            <tr>
              <th style={styleEnteteOfficiel} colSpan={2}>
                Évaluations locales
              </th>
              <th style={styleEnteteOfficiel} rowSpan={2}>
                Évaluation
                <br />
                régionale
              </th>
              <th style={styleEnteteOfficiel} rowSpan={2}>
                Évaluation
                <br />
                nationale
              </th>
              <th style={styleEnteteOfficiel} rowSpan={2}>
                Participation
                <br />
                en classe
              </th>
              <th style={styleEnteteOfficiel} rowSpan={2}>
                Note de
                <br />
                conduite
              </th>
            </tr>
            <tr>
              <th style={styleEnteteOfficiel}>Note 1</th>
              <th style={styleEnteteOfficiel}>Note 2</th>
            </tr>
          </thead>
          <tbody>
            {/* Deux lignes, comme sur l'original : la note, puis l'appréciation. */}
            {[24, 14].map((hauteur) => (
              <tr key={`notes-${hauteur}`}>
                {Array.from({ length: 6 }).map((_, colonne) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <td key={colonne} style={{ ...styleCellule, height: hauteur }} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* ----------------------------------------------------------- assiduité */}
        <div style={styleBandeauOfficiel}>ASSIDUITÉ DE L&apos;ENFANT</div>

        <table style={styleTableau}>
          <thead>
            <tr>
              {MOIS.map((mois) => (
                <th key={mois} style={{ ...styleEnteteOfficiel, fontSize: 9.5, padding: '3px 1px' }}>
                  {mois}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: LIGNES_ASSIDUITE }).map((_, ligne) => (
              // eslint-disable-next-line react/no-array-index-key
              <tr key={`assiduite-${ligne}`}>
                {MOIS.map((mois, indexMois) => (
                  <td
                    key={`${mois}-${ligne}`}
                    style={{ ...styleCellule, fontSize: 9.5, padding: '3px 1px', height: 17 }}
                  >
                    {assiduiteParMois[indexMois][ligne] || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {presences.length ? (
          <div style={{ fontSize: 9.5, marginTop: 3, fontStyle: 'italic' }}>
            P : présent · A : absent · E : excusé · case vide : appel non fait
          </div>
        ) : null}

        {/* ------------------------------------------------------- observations */}
        <div style={{ ...styleBandeauOfficiel, borderBottom: '1px solid #000', marginTop: 14 }}>
          Autres Observations des Moniteurs
        </div>

        <div style={{ marginTop: 8 }}>
          {Array.from({ length: LIGNES_OBSERVATIONS }).map((_, ligne) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={`observation-${ligne}`} style={{ marginBottom: 11 }}>
              <Pointilles />
            </div>
          ))}
        </div>

        {/* --------------------------------------------------------- signatures */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 18,
            fontWeight: 700,
            fontSize: 12.5,
          }}
        >
          <span>Le Moniteur responsable de classe</span>
          <span>Le Directeur</span>
        </div>
      </Box>
    </>
  );
}
