import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import ReactToPrint from 'react-to-print';
import * as XLSX from 'xlsx';

import {
  Box,
  Card,
  Chip,
  Table,
  Stack,
  Alert,
  Button,
  MenuItem,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  TableContainer,
  TablePagination,
} from '@mui/material';
import {
  SaveRounded,
  TableChartRounded,
  EmojiEventsRounded,
  PictureAsPdfRounded,
} from '@mui/icons-material';

import { apiClient, getApiErrorMessage } from 'src/utils/apiClient';
import { SelectRecherche } from 'src/components/select-recherche';

import { RowActions } from './row-actions';

import { TYPES_EVALUATION } from '../constantes';

// ----------------------------------------------------------------------
// Grille des notes : les enfants d'une classe en lignes, les évaluations en
// colonnes, la moyenne et le rang au bout.
//
// Le but n'est pas d'archiver des notes mais de **comparer** : chaque année,
// l'école récompense les meilleurs de chaque classe. Le classement est donc la
// colonne qui compte, et tout le reste existe pour la produire.

/** Nombre d'enfants mis en avant par classe, pour les récompenses de fin d'année. */
const LAUREATS_PAR_CLASSE = 3;

/**
 * Couleur de la pastille de rang.
 *
 * Or, argent, bronze pour le podium, puis une couleur neutre : la place se lit
 * d'un coup d'œil sur toute une classe, sans avoir à relire le chiffre. Le bronze
 * n'existe pas dans la palette du thème, il est donc donné en clair.
 */
const apparenceDuRang = (rang: number) => {
  if (rang === 1) return { couleur: 'success' as const, sx: undefined };
  if (rang === 2) return { couleur: 'warning' as const, sx: undefined };

  if (rang === 3) {
    return {
      couleur: 'default' as const,
      sx: { bgcolor: '#8D6E63', color: 'common.white', '& .MuiChip-icon': { color: 'inherit' } },
    };
  }

  return { couleur: 'info' as const, sx: undefined };
};

/** Valeur du filtre « toutes les classes ». */
const TOUTES = '';

/**
 * Règle « @page » NOMMÉE, et non anonyme : plusieurs documents imprimables restent
 * montés en même temps dans la page, et une règle générique déclarée par un autre
 * document écraserait la nôtre. Voir sections/user/etats/listeMembrePdf.tsx.
 */
const GRILLE_NOTES_PAGE_STYLE = `
@page grilleNotesPaysage {
  size: A4 landscape;
  margin: 8mm;
}

.grille-notes-print-root {
  page: grilleNotesPaysage;
}
`;

type EvaluationsGrilleProps = {
  classes: any[];
  enfants: any[];
  evaluations: any[];
  notes: any[];
  idUtilisateur: number;
  modifiable: boolean;
  onEnregistre: () => void | Promise<void>;
  /** Le bloc de gestion des évaluations ayant disparu, la colonne le remplace. */
  onModifierEvaluation: (evaluation: any) => void;
  onSupprimerEvaluation: (evaluation: any) => void;
  showNotification: (message: string, severite?: 'success' | 'info' | 'warning' | 'error') => void;
};

/** Clé d'une case de la grille. */
const cle = (idEnfant: number | string, idEvaluation: number | string) =>
  `${idEnfant}:${idEvaluation}`;

/**
 * Note ramenée sur 20.
 *
 * Toutes les évaluations ne sont pas notées sur le même barème : comparer un 8/10
 * et un 12/20 sans les ramener à une échelle commune donnerait un classement faux.
 */
const surVingt = (brute: unknown, noteSur: unknown): number | null => {
  const texte = String(brute ?? '').trim();
  if (!texte) return null;

  // La virgule est la séparation décimale usuelle ici ; `Number` ne la comprend pas.
  const valeur = Number(texte.replace(',', '.'));
  if (Number.isNaN(valeur)) return null;

  const bareme = Number(noteSur) || 20;
  return (valeur / bareme) * 20;
};

export function EvaluationsGrille({
  classes,
  enfants,
  evaluations,
  notes,
  idUtilisateur,
  modifiable,
  onEnregistre,
  onModifierEvaluation,
  onSupprimerEvaluation,
  showNotification,
}: EvaluationsGrilleProps) {
  // « Toutes les classes » d'office : on voit d'emblée l'ensemble de l'école,
  // puis on resserre sur une classe pour saisir.
  const [idClasse, setIdClasse] = useState(TOUTES);
  const [typeRetenu, setTypeRetenu] = useState('');
  const [saisie, setSaisie] = useState<Record<string, string>>({});
  const [enregistrement, setEnregistrement] = useState(false);
  const [page, setPage] = useState(0);
  const [laureatsSeuls, setLaureatsSeuls] = useState(false);
  const [lignesParPage, setLignesParPage] = useState(5);
  const referenceImpression = useRef<HTMLDivElement>(null);

  /** Les notes déjà enregistrées, reprises telles quelles dans la saisie. */
  useEffect(() => {
    const depart: Record<string, string> = {};
    notes.forEach((note) => {
      depart[cle(note.idEnfantEcodim, note.idEvaluation)] = String(note.valeurNote ?? '');
    });
    setSaisie(depart);
  }, [notes]);

  const libelleDeClasse = useCallback(
    (idClasseEcodim: unknown): string =>
      classes.find((classe) => String(classe.idClasseEcodim) === String(idClasseEcodim))
        ?.libelleClasse || '',
    [classes]
  );

  const enfantsDeLaClasse = useMemo(
    () =>
      enfants
        .filter(
          (enfant) => idClasse === TOUTES || String(enfant.idClasseEcodim) === String(idClasse)
        )
        // Sur « toutes les classes », on regroupe par classe : une liste mêlée
        // rendrait le classement illisible.
        .sort((gauche, droite) => {
          const parClasse = libelleDeClasse(gauche.idClasseEcodim).localeCompare(
            libelleDeClasse(droite.idClasseEcodim)
          );
          if (parClasse !== 0) return parClasse;

          return `${gauche.nomEnfant} ${gauche.prenomEnfant}`.localeCompare(
            `${droite.nomEnfant} ${droite.prenomEnfant}`
          );
        }),
    [enfants, idClasse, libelleDeClasse]
  );

  /** On ne garde que les évaluations rattachées à la classe affichée. */
  const evaluationsRetenues = useMemo(
    () =>
      evaluations
        .filter(
          (evaluation) =>
            idClasse === TOUTES ||
            (evaluation.classes || []).some(
              (idClasseEcodim: any) => String(idClasseEcodim) === String(idClasse)
            )
        )
        .filter((evaluation) => !typeRetenu || evaluation.typeEvaluation === typeRetenu)
        .sort((gauche, droite) =>
          String(gauche.dateEvaluation || '').localeCompare(String(droite.dateEvaluation || ''))
        ),
    [evaluations, idClasse, typeRetenu]
  );

  /**
   * Une évaluation ne concerne que les enfants des classes auxquelles elle est
   * rattachée. Une évaluation régionale en compte plusieurs, mais reste une seule
   * épreuve, donc une seule colonne.
   */
  const concerne = useCallback(
    (evaluation: any, enfant: any): boolean =>
      (evaluation.classes || []).some(
        (idClasseEcodim: any) => String(idClasseEcodim) === String(enfant.idClasseEcodim)
      ),
    []
  );

  const moyenneDe = useCallback(
    (enfant: any): number | null => {
      let total = 0;
      let poids = 0;

      evaluationsRetenues.forEach((evaluation) => {
        if (!concerne(evaluation, enfant)) return;

        const note = surVingt(
          saisie[cle(enfant.idEnfantEcodim, evaluation.idEvaluation)],
          evaluation.noteSur
        );
        if (note === null) return;

        const coefficient = Number(evaluation.coefficient) || 1;
        total += note * coefficient;
        poids += coefficient;
      });

      return poids ? total / poids : null;
    },
    [evaluationsRetenues, saisie, concerne]
  );

  /**
   * Classement par moyenne décroissante, **à l'intérieur de chaque classe**.
   *
   * Un enfant de la classe des tout-petits et un adolescent ne passent pas les
   * mêmes évaluations : les classer ensemble n'aurait aucun sens, et les cadeaux
   * se remettent de toute façon classe par classe.
   */
  const rangs = useMemo(() => {
    const resultat: Record<number, number> = {};
    const parClasse = new Map<string, any[]>();

    enfantsDeLaClasse.forEach((enfant) => {
      const groupe = String(enfant.idClasseEcodim ?? '');
      parClasse.set(groupe, [...(parClasse.get(groupe) || []), enfant]);
    });

    parClasse.forEach((groupe) => {
      groupe
        .map((enfant) => ({ idEnfantEcodim: enfant.idEnfantEcodim, moyenne: moyenneDe(enfant) }))
        .filter((ligne) => ligne.moyenne !== null)
        .sort((gauche, droite) => (droite.moyenne as number) - (gauche.moyenne as number))
        .forEach((ligne, index) => {
          resultat[ligne.idEnfantEcodim] = index + 1;
        });
    });

    return resultat;
  }, [enfantsDeLaClasse, moyenneDe]);

  /**
   * Les enfants réellement affichés.
   *
   * Le filtre des lauréats s'applique ici, et non sur la base du classement :
   * les rangs doivent rester ceux de la classe entière, sinon on obtiendrait
   * un podium du podium.
   */
  const enfantsAffiches = useMemo(
    () =>
      laureatsSeuls
        ? enfantsDeLaClasse.filter((enfant) => {
            const rang = rangs[enfant.idEnfantEcodim];
            return Boolean(rang) && rang <= LAUREATS_PAR_CLASSE;
          })
        : enfantsDeLaClasse,
    [enfantsDeLaClasse, laureatsSeuls, rangs]
  );

  const libelleClasse = useMemo(
    () =>
      classes.find((classe) => String(classe.idClasseEcodim) === String(idClasse))
        ?.libelleClasse || '',
    [classes, idClasse]
  );

  /**
   * Les types d'évaluation qui concernent cet enfant.
   *
   * Le type appartient à l'évaluation, donc à la colonne : sur une ligne, il faut
   * réunir ceux des évaluations de sa classe. Avec le filtre de type actif, il n'y
   * en a qu'un.
   */
  const typesDe = useCallback(
    (enfant: any): string => {
      const types = new Set<string>();

      evaluationsRetenues.forEach((evaluation) => {
        if (concerne(evaluation, enfant)) {
          types.add(TYPES_EVALUATION[evaluation.typeEvaluation] || evaluation.typeEvaluation);
        }
      });

      return types.size ? Array.from(types).join(', ') : '—';
    },
    [evaluationsRetenues, concerne]
  );

  /** Les lignes du tableau, telles qu'elles s'affichent. Excel et PDF partent de là. */
  const lignes = useMemo(
    () =>
      enfantsDeLaClasse.map((enfant, index) => {
        const ligne: Record<string, any> = {
          '#': index + 1,
          'Nom et prénoms': `${enfant.nomEnfant || ''} ${enfant.prenomEnfant || ''}`.trim(),
        };

        ligne['Type éval.'] = typesDe(enfant);

        if (idClasse === TOUTES) {
          ligne.Classe = libelleDeClasse(enfant.idClasseEcodim);
        }

        evaluationsRetenues.forEach((evaluation) => {
          // L'en-tête rappelle le barème et le coefficient : sorti du tableau, un
          // 8 sans son « /10 » ne veut plus rien dire.
          const entete = `${evaluation.libelleEvaluation} (/${evaluation.noteSur || 20} coef.${
            evaluation.coefficient || 1
          })`;
          ligne[entete] = concerne(evaluation, enfant)
            ? saisie[cle(enfant.idEnfantEcodim, evaluation.idEvaluation)] || ''
            : '';
        });

        const moyenne = moyenneDe(enfant);
        ligne.Moyenne = moyenne === null ? '' : Number(moyenne.toFixed(2));
        ligne.Rang = rangs[enfant.idEnfantEcodim] || '';

        return ligne;
      }),
    [
      enfantsDeLaClasse,
      evaluationsRetenues,
      saisie,
      moyenneDe,
      rangs,
      idClasse,
      libelleDeClasse,
      concerne,
      typesDe,
    ]
  );

  /** Les colonnes, dans l'ordre. Dérivées des lignes pour ne pas pouvoir diverger. */
  const enTetes = useMemo(() => (lignes.length ? Object.keys(lignes[0]) : []), [lignes]);

  const exporterExcel = () => {
    try {
      const feuille = XLSX.utils.json_to_sheet(lignes);
      const classeur = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(classeur, feuille, 'Notes');

      // Nom de fichier désaccentué : certains systèmes de fichiers et clients de
      // messagerie abîment les accents.
      const nom = `${libelleClasse || 'classe'}`
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      XLSX.writeFile(classeur, `notes-${nom || 'classe'}-${new Date().toISOString().slice(0, 10)}.xlsx`);
      showNotification('Export Excel généré.', 'success');
    } catch (error) {
      showNotification(getApiErrorMessage(error, 'Export impossible.'), 'error');
    }
  };

  const enregistrer = async () => {
    try {
      setEnregistrement(true);

      // On envoie toutes les cases de la grille affichée, y compris les vides :
      // c'est ce qui permet d'effacer une note saisie par erreur.
      const aEnvoyer = enfantsDeLaClasse.flatMap((enfant) =>
        evaluationsRetenues
          // Les cases grisées ne sont pas envoyées : elles effaceraient des notes
          // qu'on n'a jamais eu le droit de saisir ici.
          .filter((evaluation) => concerne(evaluation, enfant))
          .map((evaluation) => ({
            idEvaluation: Number(evaluation.idEvaluation),
            idEnfantEcodim: Number(enfant.idEnfantEcodim),
            valeurNote: saisie[cle(enfant.idEnfantEcodim, evaluation.idEvaluation)] || '',
          }))
      );

      await apiClient.enregistrerNotesEcodim({ idUtilisateur, notes: aEnvoyer });
      showNotification('Notes enregistrées.', 'success');
      await onEnregistre();
    } catch (error) {
      showNotification(getApiErrorMessage(error, 'Enregistrement impossible.'), 'error');
    } finally {
      setEnregistrement(false);
    }
  };

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'center' }}
        sx={{ mb: 2 }}
      >
        <SelectRecherche
          label="Classe"
          value={idClasse}
          onChange={(event) => {
            setIdClasse(event.target.value);
            // Rester en page 4 apres un filtre afficherait un tableau vide.
            setPage(0);
          }}
          sx={{ minWidth: 240 }}
        >
          <MenuItem value={TOUTES}>Toutes les classes</MenuItem>
          {classes.map((classe) => (
            <MenuItem key={classe.idClasseEcodim} value={String(classe.idClasseEcodim)}>
              {classe.libelleClasse}
            </MenuItem>
          ))}
        </SelectRecherche>

        <SelectRecherche
          label="Type d'évaluation"
          value={typeRetenu}
          onChange={(event) => {
            setTypeRetenu(event.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 240 }}
        >
          <MenuItem value="">Toutes</MenuItem>
          {Object.entries(TYPES_EVALUATION).map(([valeur, libelle]) => (
            <MenuItem key={valeur} value={valeur}>
              {libelle}
            </MenuItem>
          ))}
        </SelectRecherche>

        <SelectRecherche
          label="Affichage"
          value={laureatsSeuls ? 'laureats' : 'tous'}
          onChange={(event) => {
            setLaureatsSeuls(event.target.value === 'laureats');
            setPage(0);
          }}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="tous">Tous les enfants</MenuItem>
          <MenuItem value="laureats">Les {LAUREATS_PAR_CLASSE} premiers par classe</MenuItem>
        </SelectRecherche>

        <Box sx={{ flexGrow: 1 }} />

        {modifiable && evaluationsRetenues.length > 0 && enfantsDeLaClasse.length > 0 && (
          <>
            <Button
              variant="outlined"
              color="success"
              startIcon={<TableChartRounded />}
              onClick={exporterExcel}
            >
              Excel
            </Button>

            <ReactToPrint
              documentTitle={`notes-${libelleClasse || 'classe'}`}
              pageStyle={GRILLE_NOTES_PAGE_STYLE}
              trigger={() => (
                <Button variant="outlined" startIcon={<PictureAsPdfRounded />}>
                  PDF
                </Button>
              )}
              content={() => referenceImpression.current}
            />

            <Button
              variant="contained"
              startIcon={<SaveRounded />}
              onClick={enregistrer}
              disabled={enregistrement}
            >
              {enregistrement ? 'Enregistrement...' : 'Enregistrer les notes'}
            </Button>
          </>
        )}
      </Stack>

      {!classes.length && <Alert severity="info">Créez d&apos;abord une classe.</Alert>}

      {Boolean(classes.length) && !enfantsDeLaClasse.length && (
        <Alert severity="info">
          {idClasse === TOUTES
            ? "Aucun enfant inscrit à l'école du dimanche."
            : 'Aucun enfant inscrit dans cette classe.'}
        </Alert>
      )}

      {Boolean(enfantsDeLaClasse.length) && !evaluationsRetenues.length && (
        <Alert severity="info">
          {idClasse === TOUTES
            ? 'Aucune évaluation enregistrée. Créez-en une avec le bouton « Ajouter une évaluation ».'
            : 'Aucune évaluation pour cette classe. Créez-en une avec le bouton « Ajouter une évaluation ».'}
        </Alert>
      )}

      {Boolean(enfantsDeLaClasse.length) && Boolean(evaluationsRetenues.length) && (
        <Card variant="outlined">
          <TableContainer>
            {/* Quadrillage complet, comme un tableur : sans lui, on ne voit pas
                où commence et où finit la case à remplir. */}
            <Table
              size="small"
              sx={{
                '& td, & th': {
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                },
                '& thead th': {
                  bgcolor: 'background.neutral',
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 40 }}>#</TableCell>
                  <TableCell sx={{ minWidth: 220 }}>Nom et prénoms</TableCell>
                  <TableCell sx={{ minWidth: 150 }}>Type éval.</TableCell>
                  {idClasse === TOUTES && <TableCell sx={{ minWidth: 140 }}>Classe</TableCell>}
                  {evaluationsRetenues.map((evaluation) => (
                    <TableCell key={evaluation.idEvaluation} align="center" sx={{ minWidth: 130 }}>
                      <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {evaluation.libelleEvaluation}
                        </Typography>
                        {modifiable && (
                          <RowActions
                            actions={[
                              {
                                libelle: 'Modifier',
                                icone: 'solar:pen-bold',
                                onClick: () => onModifierEvaluation(evaluation),
                              },
                              {
                                libelle: 'Supprimer',
                                icone: 'solar:trash-bin-trash-bold',
                                destructrice: true,
                                onClick: () => onSupprimerEvaluation(evaluation),
                              },
                            ]}
                          />
                        )}
                      </Stack>
                      <Typography variant="caption" color="text.secondary" display="block">
                        /{evaluation.noteSur || 20} · coef. {evaluation.coefficient || 1}
                      </Typography>
                      {idClasse === TOUTES && (
                        <Typography variant="caption" color="primary" display="block">
                          {(evaluation.classes || [])
                            .map((idClasseEcodim: any) => libelleDeClasse(idClasseEcodim))
                            .filter(Boolean)
                            .join(', ')}
                        </Typography>
                      )}
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={{ minWidth: 90 }}>
                    Moyenne
                  </TableCell>
                  <TableCell align="center" sx={{ minWidth: 80 }}>
                    Rang
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {enfantsAffiches
                  .slice(page * lignesParPage, page * lignesParPage + lignesParPage)
                  .map((enfant, position) => {
                  // Le numero suit la liste complete, pas la page.
                  const index = page * lignesParPage + position;
                  const moyenne = moyenneDe(enfant);
                  const rang = rangs[enfant.idEnfantEcodim];
                  const estLaureat = rang && rang <= LAUREATS_PAR_CLASSE;

                  return (
                    <TableRow key={enfant.idEnfantEcodim} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {`${enfant.nomEnfant || ''} ${enfant.prenomEnfant || ''}`.trim()}
                      </TableCell>

                      <TableCell>{typesDe(enfant)}</TableCell>

                      {idClasse === TOUTES && (
                        <TableCell>{libelleDeClasse(enfant.idClasseEcodim) || '—'}</TableCell>
                      )}

                      {evaluationsRetenues.map((evaluation) => (
                        <TableCell
                          key={evaluation.idEvaluation}
                          align="center"
                          // Une case grisée dit tout de suite que cette évaluation
                          // n'est pas celle de la classe de l'enfant.
                          sx={
                            concerne(evaluation, enfant)
                              ? undefined
                              : { bgcolor: 'action.hover' }
                          }
                        >
                          {concerne(evaluation, enfant) && (
                          <TextField
                            size="small"
                            variant="standard"
                            disabled={!modifiable}
                            value={saisie[cle(enfant.idEnfantEcodim, evaluation.idEvaluation)] || ''}
                            onChange={(event) =>
                              setSaisie((precedent) => ({
                                ...precedent,
                                [cle(enfant.idEnfantEcodim, evaluation.idEvaluation)]:
                                  event.target.value,
                              }))
                            }
                            inputProps={{
                              style: { textAlign: 'center' },
                              inputMode: 'decimal',
                            }}
                            sx={{ width: 70 }}
                          />
                          )}
                        </TableCell>
                      ))}

                      <TableCell align="center">
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {moyenne === null ? '—' : moyenne.toFixed(2)}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        {rang ? (
                          <Chip
                            size="small"
                            color={apparenceDuRang(rang).couleur}
                            sx={apparenceDuRang(rang).sx}
                            icon={estLaureat ? <EmojiEventsRounded /> : undefined}
                            label={`${rang}${rang === 1 ? 'er' : 'e'}`}
                          />
                        ) : (
                          '—'
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            page={page}
            count={enfantsAffiches.length}
            rowsPerPage={lignesParPage}
            rowsPerPageOptions={[5, 10, 25]}
            onPageChange={(_, nouvelle) => setPage(nouvelle)}
            onRowsPerPageChange={(evenement) => {
              setLignesParPage(parseInt(evenement.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Lignes par page :"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
          />
        </Card>
      )}

      {/* Document imprimable : les mêmes lignes, en texte. */}
      <Box sx={{ display: 'none' }}>
        <div ref={referenceImpression} className="grille-notes-print-root">
          <div style={{ fontFamily: 'Times New Roman, serif', color: '#000', padding: 8 }}>
            <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 15 }}>
              RELEVÉ DE NOTES — {(libelleClasse || 'TOUTES LES CLASSES').toUpperCase()}
            </div>
            <div style={{ textAlign: 'center', fontSize: 11, marginBottom: 10 }}>
              {typeRetenu ? TYPES_EVALUATION[typeRetenu] : 'Toutes les évaluations'}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
              <thead>
                <tr>
                  {enTetes.map((entete) => (
                    <th
                      key={entete}
                      style={{
                        border: '1px solid #000',
                        padding: '4px 6px',
                        backgroundColor: '#e8e8e8',
                      }}
                    >
                      {entete}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lignes.map((ligne) => (
                  <tr key={String(ligne['Nom et prénoms'])}>
                    {enTetes.map((entete) => (
                      <td
                        key={entete}
                        style={{
                          border: '1px solid #000',
                          padding: '4px 6px',
                          textAlign: entete === 'Nom et prénoms' ? 'left' : 'center',
                        }}
                      >
                        {ligne[entete] === '' || ligne[entete] === undefined ? '' : ligne[entete]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Box>

      {Boolean(Object.keys(rangs).length) && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
          Le podium de chaque classe est mis en avant : 1<sup>er</sup> en vert, 2<sup>e</sup> en
          jaune, 3<sup>e</sup> en bronze, les suivants en bleu. Les notes sont
          ramenées sur 20 avant d&apos;être pondérées par leur coefficient : une évaluation sur
          10 et une sur 20 restent comparables. Le classement se fait à l&apos;intérieur de
          chaque classe.
        </Typography>
      )}
    </Box>
  );
}
