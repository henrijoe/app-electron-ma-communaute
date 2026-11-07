import { forwardRef } from 'react';

import Box from '@mui/material/Box';

// ----------------------------------------------------------------------
// Feuille du programme de direction et d'enseignement des moniteurs.
//
// Elle reprend la feuille papier que les écoles du dimanche affichent déjà :
// l'en-tête de l'église, le thème annuel et son passage, puis un tableau d'une
// ligne par dimanche — qui dirige, qui apporte le message dans chaque classe,
// et le moniteur à joindre — et les consignes en bas.
//
// La même feuille sert à l'aperçu et à l'impression, pour que ce qu'on relit à
// l'écran soit exactement ce qui sort de l'imprimante.

export type PersonneProgramme = { idMoniteur: number | null; nom: string };

export type AffectationProgramme = {
  direction: PersonneProgramme;
  messager: PersonneProgramme;
};

export type LigneProgramme = {
  date: string;
  contact: PersonneProgramme & { telephone: string };
  affectations: Record<string, AffectationProgramme>;
};

export type GrilleProgramme = {
  classes: { idClasseEcodim: number; libelleClasse: string }[];
  lignes: LigneProgramme[];
};

export type Programme = {
  idProgrammeEcodim?: number | null;
  titreProgramme: string;
  dateDebutProgramme: string;
  dateFinProgramme: string;
  enteteProgramme: string;
  themeAnnuel: string;
  passageTheme: string;
  consignesProgramme: string;
  messageFinProgramme: string;
  grille: GrilleProgramme;
};

/** « 2026-11-08 » devient « 08-11-2026 », comme sur la feuille papier. */
export const dateProgramme = (date?: string | null): string => {
  const morceaux = String(date || '').slice(0, 10).split('-');
  return morceaux.length === 3 ? `${morceaux[2]}-${morceaux[1]}-${morceaux[0]}` : '';
};

/** Les lignes d'un texte libre, sans les lignes vides ni les tirets de tête. */
export const lignesDeTexte = (valeur?: string | null): string[] =>
  String(valeur || '')
    .split(/\r?\n/)
    .map((ligne) => ligne.replace(/^\s*[-•]\s*/, '').trim())
    .filter(Boolean);

const bordure = '1px solid #111';

const cellule: React.CSSProperties = {
  border: bordure,
  padding: '1px 6px',
  fontSize: 12.5,
  lineHeight: 1.25,
  verticalAlign: 'middle',
};

const entete: React.CSSProperties = {
  ...cellule,
  fontWeight: 700,
  textAlign: 'center',
  textTransform: 'uppercase',
};

// Chaque dimanche occupe DEUX lignes du tableau : « Direction » puis « Messager ».
// Le trait qui les sépare est plus fin que celui qui sépare deux dimanches.
const separation = '1px solid #9ca3af';
const hautDuDimanche: React.CSSProperties = { ...cellule, borderBottom: separation };
const basDuDimanche: React.CSSProperties = { ...cellule, borderTop: separation };

/**
 * Le nom unique d'une case de classe, ou null s'il y en a deux.
 *
 * Quand le même moniteur dirige et apporte le message — ou qu'un seul nom est
 * prévu — la feuille papier fusionne les deux lignes et écrit le nom une fois,
 * au milieu. Deux noms différents restent chacun sur sa ligne, en face de
 * « Direction » et de « Messager ».
 */
const nomUnique = (affectation?: AffectationProgramme): string | null => {
  const direction = String(affectation?.direction?.nom || '').trim();
  const messager = String(affectation?.messager?.nom || '').trim();

  if (!direction || !messager || direction.toLowerCase() === messager.toLowerCase()) {
    return direction || messager;
  }
  return null;
};

type ProgrammeFeuilleProps = {
  programme: Programme;
};

export const ProgrammeFeuille = forwardRef<HTMLDivElement, ProgrammeFeuilleProps>(
  ({ programme }, ref) => {
    const classes = programme.grille?.classes || [];
    const lignes = programme.grille?.lignes || [];
    const consignes = lignesDeTexte(programme.consignesProgramme);
    const messageFin = lignesDeTexte(programme.messageFinProgramme);

    return (
      <Box
        ref={ref}
        sx={{
          bgcolor: '#fff',
          color: '#111',
          p: 3,
          fontFamily: 'var(--police-etat)',
          '@media print': { p: 0 },
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 1 }}>
          {programme.enteteProgramme ? (
            <Box sx={{ fontWeight: 700, textDecoration: 'underline', fontSize: 16 }}>
              {programme.enteteProgramme}
            </Box>
          ) : null}

          {programme.themeAnnuel ? (
            <Box sx={{ fontWeight: 700, fontSize: 14.5 }}>
              THÈME ANNUEL : «&nbsp;{programme.themeAnnuel}&nbsp;»
            </Box>
          ) : null}

          {programme.passageTheme ? (
            <Box sx={{ fontWeight: 700, textDecoration: 'underline', fontSize: 14 }}>
              {programme.passageTheme}
            </Box>
          ) : null}

          <Box sx={{ fontWeight: 700, fontSize: 18, textTransform: 'uppercase', mt: 0.5 }}>
            {programme.titreProgramme}
          </Box>
        </Box>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={entete} rowSpan={classes.length ? 2 : 1}>
                Dates
              </th>
              <th style={entete} rowSpan={classes.length ? 2 : 1}>
                Natures
              </th>
              {classes.length ? (
                <th style={entete} colSpan={classes.length}>
                  Classes
                </th>
              ) : null}
              <th style={entete} rowSpan={classes.length ? 2 : 1}>
                Contacts moniteurs
              </th>
            </tr>
            {classes.length ? (
              <tr>
                {classes.map((classe) => (
                  <th key={classe.idClasseEcodim} style={entete}>
                    {classe.libelleClasse}
                  </th>
                ))}
              </tr>
            ) : null}
          </thead>

          {/* Un <tbody> par dimanche : ses deux lignes ne se séparent pas d'une page à l'autre. */}
          {lignes.map((ligne, index) => {
            const cases = classes.map((classe) => ({
              cle: classe.idClasseEcodim,
              affectation: ligne.affectations?.[String(classe.idClasseEcodim)],
            }));

            return (
              <tbody key={`${ligne.date}-${index}`} style={{ breakInside: 'avoid' }}>
                <tr>
                  <td
                    rowSpan={2}
                    style={{ ...cellule, textAlign: 'center', whiteSpace: 'nowrap' }}
                  >
                    {dateProgramme(ligne.date)}
                  </td>
                  <td style={{ ...hautDuDimanche, whiteSpace: 'nowrap' }}>Direction</td>
                  {cases.map(({ cle, affectation }) => {
                    const unique = nomUnique(affectation);
                    return unique !== null ? (
                      <td key={cle} rowSpan={2} style={{ ...cellule, textAlign: 'center' }}>
                        {unique}
                      </td>
                    ) : (
                      <td key={cle} style={hautDuDimanche}>
                        {affectation?.direction?.nom}
                      </td>
                    );
                  })}
                  <td style={hautDuDimanche}>{ligne.contact?.nom || ''}</td>
                </tr>
                <tr>
                  <td style={{ ...basDuDimanche, whiteSpace: 'nowrap' }}>Messager</td>
                  {cases.map(({ cle, affectation }) =>
                    nomUnique(affectation) !== null ? null : (
                      <td key={cle} style={basDuDimanche}>
                        {affectation?.messager?.nom}
                      </td>
                    )
                  )}
                  <td style={basDuDimanche}>{ligne.contact?.telephone || ''}</td>
                </tr>
              </tbody>
            );
          })}
        </table>

        {consignes.length > 0 && (
          <Box sx={{ mt: 2, ml: 6, fontFamily: 'var(--police-etat)', fontSize: 13.5 }}>
            <Box sx={{ fontWeight: 700, mb: 0.5 }}>NB :</Box>
            {consignes.map((consigne, index) => (
              <Box key={index} sx={{ ml: 3 }}>
                -&nbsp;&nbsp;{consigne}
              </Box>
            ))}
          </Box>
        )}

        {messageFin.length > 0 && (
          <Box
            sx={{
              mt: 2.5,
              textAlign: 'center',
              fontWeight: 700,
              fontStyle: 'italic',
              fontSize: 16,
              fontFamily: 'var(--police-etat)',
              textTransform: 'uppercase',
            }}
          >
            {messageFin.map((ligne, index) => (
              <Box key={index}>{ligne}</Box>
            ))}
          </Box>
        )}
      </Box>
    );
  }
);

ProgrammeFeuille.displayName = 'ProgrammeFeuille';
