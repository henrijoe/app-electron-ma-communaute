import { forwardRef } from 'react';

import Box from '@mui/material/Box';

// ----------------------------------------------------------------------
// Feuille du programme d'activités de la jeunesse.
//
// Elle reprend la feuille que les jeunesses impriment déjà : le logo de chaque
// côté de l'en-tête, le titre encadré, puis un tableau où le mois s'écrit à la
// verticale sur toutes ses rencontres, et le thème de l'année en pied de page.
// La même feuille sert à l'aperçu et à l'impression.

export type LigneActivite = {
  date: string;
  direction: string;
  orateur: string;
  activite: string;
  themes: string;
  lieu: string;
};

export type ProgrammeActivite = {
  idProgrammeActivite?: number | null;
  titreProgramme: string;
  dateDebutProgramme: string;
  dateFinProgramme: string;
  enteteProgramme: string;
  themeAnnuel: string;
  passageTheme: string;
  afficherOrateurs: boolean;
  lignes: LigneActivite[];
};

const MOIS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];
const JOURS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

/** « 2025-11-09 » en date locale : `new Date('2025-11-09')` serait lue en UTC. */
export const lireDateLocale = (valeur: string): Date | null => {
  const [annee, mois, jour] = String(valeur || '').slice(0, 10).split('-').map(Number);
  return annee && mois && jour ? new Date(annee, mois - 1, jour) : null;
};

export const nomDuMois = (index: number): string => MOIS[index] || '';

/** Les lignes d'un texte libre, sans lignes vides ni puces de tête. */
const lignesDeTexte = (valeur?: string | null): string[] =>
  String(valeur || '')
    .split(/\r?\n/)
    .map((ligne) => ligne.replace(/^\s*[-•➢>]\s*/, '').trim())
    .filter(Boolean);

const POLICE_TABLEAU = 'var(--police-etat, "Arial Narrow", Arial, sans-serif)';
const POLICE_TITRES = 'var(--police-etat)';
const BLEU_FONCE = '#1f3864';
const bordure = '1px solid #2f5597';

const cellule: React.CSSProperties = {
  border: bordure,
  padding: '3px 6px',
  fontSize: 15,
  lineHeight: 1.2,
  verticalAlign: 'middle',
  color: '#000',
};

const entete: React.CSSProperties = {
  ...cellule,
  fontWeight: 700,
  textAlign: 'left',
  textTransform: 'uppercase',
  backgroundColor: '#5b9bd5',
};

/** Une suite de rencontres du même mois : le mois s'écrit une fois, sur toutes. */
type Groupe = { cle: string; libelle: string; lignes: LigneActivite[] };

const grouperParMois = (lignes: LigneActivite[]): Groupe[] => {
  const groupes: Groupe[] = [];
  [...lignes]
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .forEach((ligne) => {
      const date = lireDateLocale(ligne.date);
      const cle = date ? `${date.getFullYear()}-${date.getMonth()}` : 'sans-date';
      const libelle = date ? `${MOIS[date.getMonth()]} ${date.getFullYear()}` : '';
      const dernier = groupes[groupes.length - 1];
      if (dernier && dernier.cle === cle) {
        dernier.lignes.push(ligne);
      } else {
        groupes.push({ cle, libelle, lignes: [ligne] });
      }
    });
  return groupes;
};

/** Plusieurs thèmes : une puce par thème, comme sur la feuille papier. */
function Themes({ texte }: { texte: string }) {
  const themes = lignesDeTexte(texte);
  if (themes.length <= 1) return <>{themes[0] || ''}</>;
  return (
    <Box component="ul" sx={{ m: 0, pl: 2.5, listStyleType: '"➢  "' }}>
      {themes.map((theme, index) => (
        <li key={index}>{theme}</li>
      ))}
    </Box>
  );
}

type ProgrammeActiviteFeuilleProps = {
  programme: ProgrammeActivite;
  /** Logo de l'église, posé de chaque côté de l'en-tête. */
  logoUrl?: string | null;
};

export const ProgrammeActiviteFeuille = forwardRef<HTMLDivElement, ProgrammeActiviteFeuilleProps>(
  ({ programme, logoUrl }, ref) => {
    const lignesEntete = String(programme.enteteProgramme || '')
      .split(/\r?\n/)
      .map((ligne) => ligne.trim())
      .filter(Boolean);
    const groupes = grouperParMois(programme.lignes || []);
    const orateurs = programme.afficherOrateurs;
    const anneeTheme =
      lireDateLocale(programme.dateDebutProgramme)?.getFullYear() ||
      lireDateLocale(programme.lignes?.[0]?.date || '')?.getFullYear() ||
      '';

    const logo = logoUrl ? (
      <Box
        component="img"
        src={logoUrl}
        alt=""
        sx={{ width: 78, height: 78, objectFit: 'contain', flexShrink: 0 }}
      />
    ) : (
      <Box sx={{ width: 78, flexShrink: 0 }} />
    );

    return (
      <Box
        ref={ref}
        sx={{ bgcolor: '#fff', color: '#000', p: 3, '@media print': { p: 0 } }}
      >
        {/* ------------------------------------------------------- en-tête */}
        {lignesEntete.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
            {logo}
            <Box sx={{ flex: 1, textAlign: 'center', fontFamily: POLICE_TITRES, color: BLEU_FONCE }}>
              {lignesEntete.map((ligne, index) => (
                <Box
                  key={index}
                  sx={
                    index === 0
                      ? { fontWeight: 700, fontSize: 17, textTransform: 'uppercase' }
                      : { fontSize: 14, lineHeight: 1.25 }
                  }
                >
                  {ligne}
                </Box>
              ))}
            </Box>
            {logo}
          </Box>
        )}

        <Box
          sx={{
            mx: 'auto',
            mb: 2,
            px: 3,
            py: 0.75,
            width: 'fit-content',
            maxWidth: '90%',
            border: '2px solid #2f5597',
            borderRadius: 2,
            textAlign: 'center',
            fontFamily: POLICE_TITRES,
            fontWeight: 700,
            fontSize: 19,
            textTransform: 'uppercase',
          }}
        >
          {programme.titreProgramme}
        </Box>

        {/* ------------------------------------------------------ tableau */}
        <table
          style={{ width: '100%', borderCollapse: 'collapse', fontFamily: POLICE_TABLEAU }}
        >
          <thead>
            <tr>
              <th style={{ ...entete, width: 46 }}>Mois</th>
              <th style={{ ...entete, width: 62 }}>Jours</th>
              <th style={{ ...entete, width: 62 }}>Dates</th>
              <th style={entete}>Directions</th>
              {orateurs && <th style={entete}>Orateurs</th>}
              <th style={entete}>Activités</th>
              <th style={{ ...entete, width: '30%' }}>Thèmes</th>
              <th style={entete}>Lieu</th>
            </tr>
          </thead>

          {groupes.map((groupe, indexGroupe) => {
            // Deux bleus en alternance d'un mois à l'autre : on voit d'un coup
            // d'œil où finit un mois.
            const fond = indexGroupe % 2 === 0 ? '#dce6f1' : '#c5d9f1';
            return (
              <tbody key={groupe.cle} style={{ breakInside: 'avoid' }}>
                {groupe.lignes.map((ligne, index) => {
                  const date = lireDateLocale(ligne.date);
                  return (
                    <tr key={`${ligne.date}-${index}`} style={{ backgroundColor: fond }}>
                      {index === 0 && (
                        <td
                          rowSpan={groupe.lignes.length}
                          style={{ ...cellule, backgroundColor: '#8db3e2', padding: '4px 2px' }}
                        >
                          <Box
                            sx={{
                              writingMode: 'vertical-rl',
                              transform: 'rotate(180deg)',
                              mx: 'auto',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              textAlign: 'center',
                              fontSize: 14,
                            }}
                          >
                            {groupe.libelle}
                          </Box>
                        </td>
                      )}
                      <td style={cellule}>{date ? JOURS[date.getDay()] : ''}</td>
                      <td style={cellule}>
                        {date ? String(date.getDate()).padStart(2, '0') : ''}
                      </td>
                      <td style={cellule}>{ligne.direction}</td>
                      {orateurs && <td style={cellule}>{ligne.orateur}</td>}
                      <td style={cellule}>{ligne.activite}</td>
                      <td style={cellule}>
                        <Themes texte={ligne.themes} />
                      </td>
                      <td style={cellule}>{ligne.lieu}</td>
                    </tr>
                  );
                })}
              </tbody>
            );
          })}
        </table>

        {/* ------------------------------------------------- pied de page */}
        {(programme.themeAnnuel || programme.passageTheme) && (
          <Box sx={{ mt: 3, fontFamily: POLICE_TITRES, fontSize: 16 }}>
            {programme.themeAnnuel ? (
              <Box sx={{ textAlign: 'center' }}>
                <Box component="span" sx={{ fontWeight: 700, textDecoration: 'underline' }}>
                  THÈME {anneeTheme}
                </Box>{' '}
                : «&nbsp;{programme.themeAnnuel}&nbsp;»
              </Box>
            ) : null}
            {programme.passageTheme ? (
              <Box sx={{ mt: 1, textAlign: 'right', pr: '15%', fontWeight: 700, fontStyle: 'italic' }}>
                {programme.passageTheme}
              </Box>
            ) : null}
          </Box>
        )}
      </Box>
    );
  }
);

ProgrammeActiviteFeuille.displayName = 'ProgrammeActiviteFeuille';
