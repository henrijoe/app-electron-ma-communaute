import { useMemo, useState, useCallback } from 'react';
import * as XLSX from 'xlsx';

import {
  Box,
  Card,
  Chip,
  Table,
  Stack,
  Alert,
  Button,
  Tooltip,
  MenuItem,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  ToggleButton,
  TableContainer,
  TablePagination,
  ToggleButtonGroup,
} from '@mui/material';
import { SaveRounded, DoneAllRounded, TableChartRounded } from '@mui/icons-material';

import { apiClient, getApiErrorMessage } from 'src/utils/apiClient';
import { SelectRecherche } from 'src/components/select-recherche';

// ----------------------------------------------------------------------
// Assiduité : l'appel du dimanche, et ce qu'on en tire.
//
// L'appel se fait sur papier en classe, puis se reporte ici. Deux usages, deux
// écrans :
//
//  - l'APPEL, une grille enfants × dimanches d'un mois. C'est la forme de la
//    fiche papier, et elle permet de rattraper un mois entier d'un coup ;
//  - la SYNTHÈSE, qui répond à la question posée : qui vient fidèlement ?
//    Certains enfants ne sont pas scolarisés et n'auront jamais de notes ; leur
//    assiduité est la seule chose qui les distingue, et c'est elle qu'on
//    récompense.
//
// Une présence est rattachée à une SÉANCE, pas à une date libre : la séance
// porte déjà le dimanche, la classe et la leçon. Un dimanche sans séance
// enregistrée en fait naître une à la sauvegarde — si des enfants étaient là,
// c'est bien qu'il y a eu classe.

/** Statuts d'appel. La valeur stockée est sans accent, comme ailleurs. */
const STATUTS = [
  { valeur: 'present', libelle: 'Présent', lettre: 'P', couleur: 'success' as const },
  { valeur: 'absent', libelle: 'Absent', lettre: 'A', couleur: 'error' as const },
  { valeur: 'excuse', libelle: 'Excusé', lettre: 'E', couleur: 'warning' as const },
];

/** Un clic fait défiler les statuts, puis revient à la case vide. */
const STATUT_SUIVANT: Record<string, string> = {
  '': 'present',
  present: 'absent',
  absent: 'excuse',
  excuse: '',
};

const MOIS_LIBELLES = [
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

const pad2 = (valeur: number) => String(valeur).padStart(2, '0');

/**
 * Tous les dimanches d'un mois, en « AAAA-MM-JJ ».
 *
 * Un mois en compte quatre ou cinq : la fiche papier prévoit cinq lignes pour
 * cette raison, et la grille suit le calendrier réel plutôt qu'un nombre fixe.
 */
const dimanchesDuMois = (annee: number, mois: number): string[] => {
  const dimanches: string[] = [];
  const curseur = new Date(annee, mois, 1);

  // Premier dimanche du mois, puis de sept en sept.
  curseur.setDate(1 + ((7 - curseur.getDay()) % 7));

  while (curseur.getMonth() === mois) {
    dimanches.push(`${curseur.getFullYear()}-${pad2(mois + 1)}-${pad2(curseur.getDate())}`);
    curseur.setDate(curseur.getDate() + 7);
  }

  return dimanches;
};

/** La date d'une séance, ramenée à « AAAA-MM-JJ » quelle que soit sa forme. */
const jourDe = (valeur?: string | null): string => String(valeur || '').slice(0, 10);

/**
 * Année ecclésiastique en cours : de septembre à août.
 *
 * C'est la période sur laquelle on récompense, donc celle que la synthèse
 * propose d'emblée.
 */
const anneeEcclesiastiqueCourante = () => {
  const aujourdhui = new Date();
  const debut = aujourdhui.getMonth() >= 8 ? aujourdhui.getFullYear() : aujourdhui.getFullYear() - 1;

  return { debut: `${debut}-09-01`, fin: `${debut + 1}-08-31` };
};

const nomComplet = (enfant: any) =>
  `${String(enfant?.nomEnfant || '').trim()} ${String(enfant?.prenomEnfant || '').trim()}`.trim();

type AssiduiteGrilleProps = {
  classes: any[];
  enfants: any[];
  cultes: any[];
  presences: any[];
  idUtilisateur: number;
  modifiable: boolean;
  onEnregistre: () => void;
  onNotifier: (message: string, severite: 'success' | 'error' | 'info') => void;
};

export function AssiduiteGrille({
  classes,
  enfants,
  cultes,
  presences,
  idUtilisateur,
  modifiable,
  onEnregistre,
  onNotifier,
}: AssiduiteGrilleProps) {
  const periodeInitiale = anneeEcclesiastiqueCourante();
  const maintenant = new Date();

  const [vue, setVue] = useState<'appel' | 'synthese'>('appel');
  const [idClasse, setIdClasse] = useState<string>('');
  const [annee, setAnnee] = useState<number>(maintenant.getFullYear());
  const [mois, setMois] = useState<number>(maintenant.getMonth());
  const [dateDebut, setDateDebut] = useState(periodeInitiale.debut);
  const [dateFin, setDateFin] = useState(periodeInitiale.fin);
  const [classeSynthese, setClasseSynthese] = useState<string>('');
  // Pagination du classement : le tableau depasse vite l'ecran, et le rang
  // affiche reste celui du classement entier, pas celui de la page.
  const [pageSynthese, setPageSynthese] = useState(0);
  const [lignesParPage, setLignesParPage] = useState(5);
  /** Saisie en cours, par « idEnfant|date ». Vide tant que rien n'est touché. */
  const [brouillon, setBrouillon] = useState<Record<string, string>>({});
  const [enregistrement, setEnregistrement] = useState(false);

  // La première classe sert de choix par défaut : l'appel se fait toujours pour
  // une classe précise, « toutes les classes » n'aurait pas de sens ici.
  const classeCourante = idClasse || String(classes[0]?.idClasseEcodim || '');

  const dimanches = useMemo(() => dimanchesDuMois(annee, mois), [annee, mois]);

  const enfantsDeLaClasse = useMemo(
    () =>
      enfants
        .filter(
          (enfant) =>
            String(enfant.idClasseEcodim || '') === String(classeCourante) &&
            enfant.actifEnfant !== 0
        )
        .sort((a, b) => nomComplet(a).localeCompare(nomComplet(b), 'fr')),
    [enfants, classeCourante]
  );

  /** La séance d'un dimanche pour la classe affichée, si elle existe déjà. */
  const culteDuJour = useCallback(
    (jour: string) =>
      cultes.find(
        (culte) =>
          jourDe(culte.dateCulte) === jour &&
          String(culte.idClasseEcodim || '') === String(classeCourante)
      ) || null,
    [cultes, classeCourante]
  );

  /** Statuts déjà enregistrés, indexés par « idEnfant|date ». */
  const statutsEnregistres = useMemo(() => {
    const index: Record<string, string> = {};

    presences.forEach((presence) => {
      index[`${presence.idEnfantEcodim}|${jourDe(presence.dateCulte)}`] = String(
        presence.statutPresence || ''
      );
    });

    return index;
  }, [presences]);

  const statutAffiche = (idEnfantEcodim: number, jour: string): string => {
    const cle = `${idEnfantEcodim}|${jour}`;
    return cle in brouillon ? brouillon[cle] : statutsEnregistres[cle] || '';
  };

  const basculerCase = (idEnfantEcodim: number, jour: string) => {
    if (!modifiable) return;

    const cle = `${idEnfantEcodim}|${jour}`;
    setBrouillon((precedent) => ({
      ...precedent,
      [cle]: STATUT_SUIVANT[statutAffiche(idEnfantEcodim, jour)],
    }));
  };

  /** Marque tout le monde présent sur un dimanche : le cas de loin le plus courant. */
  const toutPresent = (jour: string) => {
    if (!modifiable) return;

    setBrouillon((precedent) => {
      const suivant = { ...precedent };
      enfantsDeLaClasse.forEach((enfant) => {
        suivant[`${enfant.idEnfantEcodim}|${jour}`] = 'present';
      });
      return suivant;
    });
  };

  const presentsDuJour = (jour: string) =>
    enfantsDeLaClasse.filter((enfant) => statutAffiche(enfant.idEnfantEcodim, jour) === 'present')
      .length;

  /** Dimanches réellement touchés : inutile de réécrire les autres séances. */
  const joursModifies = useMemo(() => {
    const jours = new Set<string>();
    Object.keys(brouillon).forEach((cle) => jours.add(cle.split('|')[1]));
    return Array.from(jours);
  }, [brouillon]);

  const enregistrer = async () => {
    if (!joursModifies.length) return;

    setEnregistrement(true);

    try {
      // Les séances sont traitées l'une après l'autre : la création d'un culte
      // manquant doit être terminée avant qu'on y rattache son appel.
      await joursModifies.reduce(
        (chaine, jour) =>
          chaine.then(async () => {
            let culte = culteDuJour(jour);

            if (!culte) {
              const creation: any = await apiClient.createCulteEcodim({
                dateCulte: jour,
                idClasseEcodim: Number(classeCourante),
                idUtilisateur,
              });
              culte = { idCulteEcodim: creation?.data };
            }

            // L'appel remplace celui de la séance en entier. On repart donc des
            // enfants déjà pointés ce jour-là, même s'ils ont changé de classe
            // depuis : les retirer effacerait une présence réellement constatée.
            const dejaPointes = presences
              .filter(
                (presence) =>
                  Number(presence.idCulteEcodim) === Number(culte?.idCulteEcodim) &&
                  !enfantsDeLaClasse.some(
                    (enfant) =>
                      Number(enfant.idEnfantEcodim) === Number(presence.idEnfantEcodim)
                  )
              )
              .map((presence) => ({
                idEnfantEcodim: Number(presence.idEnfantEcodim),
                statutPresence: String(presence.statutPresence || 'present'),
              }));

            const pointesMaintenant = enfantsDeLaClasse
              .map((enfant) => ({
                idEnfantEcodim: Number(enfant.idEnfantEcodim),
                statutPresence: statutAffiche(enfant.idEnfantEcodim, jour),
              }))
              // Une case vide n'est pas une absence : l'enfant n'a pas été
              // appelé, et la fiche de suivi doit rester vide pour lui.
              .filter((ligne) => ligne.statutPresence !== '');

            await apiClient.enregistrerAppelEcodim({
              idUtilisateur,
              idCulteEcodim: Number(culte?.idCulteEcodim),
              presences: [...dejaPointes, ...pointesMaintenant],
            });
          }),
        Promise.resolve()
      );

      setBrouillon({});
      onNotifier(
        `Appel enregistré pour ${joursModifies.length} dimanche(s).`,
        'success'
      );
      onEnregistre();
    } catch (error) {
      onNotifier(getApiErrorMessage(error, "L'appel n'a pas pu être enregistré."), 'error');
    } finally {
      setEnregistrement(false);
    }
  };

  // ------------------------------------------------------------- synthèse

  /** Séances de la période, par classe : le dénominateur du taux d'assiduité. */
  const seancesDeLaPeriode = useMemo(
    () =>
      cultes.filter((culte) => {
        const jour = jourDe(culte.dateCulte);
        return jour >= dateDebut && jour <= dateFin;
      }),
    [cultes, dateDebut, dateFin]
  );

  const lignesSynthese = useMemo(() => {
    const presencesPeriode = presences.filter((presence) => {
      const jour = jourDe(presence.dateCulte);
      return jour >= dateDebut && jour <= dateFin;
    });

    return enfants
      .filter(
        (enfant) =>
          enfant.actifEnfant !== 0 &&
          (!classeSynthese || String(enfant.idClasseEcodim || '') === String(classeSynthese))
      )
      .map((enfant) => {
        const siennes = presencesPeriode.filter(
          (presence) => Number(presence.idEnfantEcodim) === Number(enfant.idEnfantEcodim)
        );

        const presents = siennes.filter((p) => p.statutPresence === 'present').length;
        const absents = siennes.filter((p) => p.statutPresence === 'absent').length;
        const excuses = siennes.filter((p) => p.statutPresence === 'excuse').length;

        // Le dénominateur est le nombre de séances de SA classe sur la période,
        // pas le nombre d'appels où il figure : un enfant jamais pointé a un
        // taux de zéro, ce qui est l'information recherchée.
        const seances = seancesDeLaPeriode.filter(
          (culte) => String(culte.idClasseEcodim || '') === String(enfant.idClasseEcodim || '')
        ).length;

        return {
          enfant,
          classe: classes.find(
            (classe) => String(classe.idClasseEcodim) === String(enfant.idClasseEcodim)
          ),
          seances,
          presents,
          absents,
          excuses,
          taux: seances ? Math.round((presents / seances) * 100) : 0,
        };
      })
      .sort((a, b) => b.taux - a.taux || b.presents - a.presents);
  }, [enfants, presences, classes, classeSynthese, dateDebut, dateFin, seancesDeLaPeriode]);

  /** Effectif inscrit par classe, borné aux enfants entrés avant la fin de période. */
  const effectifsParClasse = useMemo(
    () =>
      classes.map((classe) => {
        const inscrits = enfants.filter(
          (enfant) => String(enfant.idClasseEcodim || '') === String(classe.idClasseEcodim)
        );

        const entresDansLaPeriode = inscrits.filter((enfant) => {
          const entree = jourDe(enfant.dateEntreeEcodim);
          return entree && entree >= dateDebut && entree <= dateFin;
        });

        const seances = seancesDeLaPeriode.filter(
          (culte) => String(culte.idClasseEcodim || '') === String(classe.idClasseEcodim)
        ).length;

        const lignes = lignesSynthese.filter(
          (ligne) => String(ligne.enfant.idClasseEcodim || '') === String(classe.idClasseEcodim)
        );

        const tauxMoyen = lignes.length
          ? Math.round(lignes.reduce((total, ligne) => total + ligne.taux, 0) / lignes.length)
          : 0;

        return {
          classe,
          inscrits: inscrits.filter((enfant) => enfant.actifEnfant !== 0).length,
          nouveaux: entresDansLaPeriode.length,
          seances,
          tauxMoyen,
        };
      }),
    [classes, enfants, dateDebut, dateFin, seancesDeLaPeriode, lignesSynthese]
  );

  const exporterExcel = () => {
    const feuilleEnfants = XLSX.utils.json_to_sheet(
      lignesSynthese.map((ligne) => ({
        Nom: ligne.enfant.nomEnfant || '',
        Prénoms: ligne.enfant.prenomEnfant || '',
        Classe: ligne.classe?.libelleClasse || '',
        Séances: ligne.seances,
        Présences: ligne.presents,
        Absences: ligne.absents,
        Excusés: ligne.excuses,
        'Taux (%)': ligne.taux,
      }))
    );

    const feuilleClasses = XLSX.utils.json_to_sheet(
      effectifsParClasse.map((ligne) => ({
        Classe: ligne.classe.libelleClasse || '',
        Inscrits: ligne.inscrits,
        'Nouveaux sur la période': ligne.nouveaux,
        Séances: ligne.seances,
        'Taux moyen (%)': ligne.tauxMoyen,
      }))
    );

    const classeur = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(classeur, feuilleEnfants, 'Assiduité');
    XLSX.utils.book_append_sheet(classeur, feuilleClasses, 'Par classe');
    XLSX.writeFile(classeur, `assiduite-${dateDebut}-${dateFin}.xlsx`);
  };

  if (!classes.length) {
    return (
      <Alert severity="info">
        Crée d&apos;abord une classe : l&apos;appel se fait classe par classe.
      </Alert>
    );
  }

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        alignItems={{ xs: 'stretch', md: 'center' }}
        sx={{ mb: 2 }}
      >
        <ToggleButtonGroup
          exclusive
          size="small"
          value={vue}
          onChange={(_, valeur) => valeur && setVue(valeur)}
        >
          <ToggleButton value="appel">Appel</ToggleButton>
          <ToggleButton value="synthese">Synthèse</ToggleButton>
        </ToggleButtonGroup>

        <Box sx={{ flex: 1 }} />

        {vue === 'synthese' && (
          <Button
            variant="outlined"
            startIcon={<TableChartRounded />}
            onClick={exporterExcel}
            disabled={!lignesSynthese.length}
          >
            Excel
          </Button>
        )}

        {vue === 'appel' && modifiable && (
          <Button
            variant="contained"
            startIcon={<SaveRounded />}
            onClick={enregistrer}
            disabled={!joursModifies.length || enregistrement}
          >
            Enregistrer l&apos;appel
          </Button>
        )}
      </Stack>

      {vue === 'appel' ? (
        <>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
            <SelectRecherche
              label="Classe"
              value={classeCourante}
              onChange={(event) => {
                setIdClasse(event.target.value);
                setBrouillon({});
              }}
              sx={{ minWidth: 220 }}
            >
              {classes.map((classe) => (
                <MenuItem key={classe.idClasseEcodim} value={String(classe.idClasseEcodim)}>
                  {classe.libelleClasse}
                </MenuItem>
              ))}
            </SelectRecherche>

            <SelectRecherche
              label="Mois"
              value={String(mois)}
              onChange={(event) => {
                setMois(Number(event.target.value));
                setBrouillon({});
              }}
              sx={{ minWidth: 160 }}
            >
              {MOIS_LIBELLES.map((libelle, index) => (
                <MenuItem key={libelle} value={String(index)}>
                  {libelle}
                </MenuItem>
              ))}
            </SelectRecherche>

            <TextField
              label="Année"
              type="number"
              value={annee}
              onChange={(event) => {
                setAnnee(Number(event.target.value));
                setBrouillon({});
              }}
              sx={{ width: 120 }}
            />
          </Stack>

          <Alert severity="info" sx={{ mb: 2 }}>
            Un clic sur une case fait défiler <strong>Présent</strong>,{' '}
            <strong>Absent</strong>, <strong>Excusé</strong>, puis vide. Une case laissée
            vide signifie que l&apos;enfant n&apos;a pas été appelé — ce n&apos;est pas une
            absence, et sa fiche de suivi restera vide pour ce dimanche.
          </Alert>

          {!enfantsDeLaClasse.length ? (
            <Alert severity="warning">Aucun enfant actif dans cette classe.</Alert>
          ) : (
            <Card variant="outlined">
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ minWidth: 220 }}>Nom et prénoms</TableCell>
                      {dimanches.map((jour) => (
                        <TableCell key={jour} align="center" sx={{ minWidth: 72 }}>
                          <Stack alignItems="center" spacing={0.5}>
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>
                              {jour.slice(8)}
                            </Typography>
                            {modifiable && (
                              <Tooltip title="Marquer tout le monde présent">
                                <Button
                                  size="small"
                                  onClick={() => toutPresent(jour)}
                                  sx={{ minWidth: 0, px: 0.5 }}
                                >
                                  <DoneAllRounded fontSize="small" />
                                </Button>
                              </Tooltip>
                            )}
                            {!culteDuJour(jour) && (
                              <Tooltip title="Aucune séance enregistrée ce dimanche : elle sera créée à l'enregistrement.">
                                <Typography variant="caption" color="text.disabled">
                                  nouv.
                                </Typography>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      ))}
                      <TableCell align="center">Taux</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {enfantsDeLaClasse.map((enfant) => {
                      const pointes = dimanches.filter(
                        (jour) => statutAffiche(enfant.idEnfantEcodim, jour) !== ''
                      );
                      const presentsMois = dimanches.filter(
                        (jour) => statutAffiche(enfant.idEnfantEcodim, jour) === 'present'
                      ).length;

                      return (
                        <TableRow key={enfant.idEnfantEcodim} hover>
                          <TableCell>{nomComplet(enfant)}</TableCell>

                          {dimanches.map((jour) => {
                            const statut = statutAffiche(enfant.idEnfantEcodim, jour);
                            const apparence = STATUTS.find((item) => item.valeur === statut);

                            return (
                              <TableCell key={jour} align="center" sx={{ p: 0.5 }}>
                                <Button
                                  size="small"
                                  onClick={() => basculerCase(enfant.idEnfantEcodim, jour)}
                                  disabled={!modifiable}
                                  sx={{
                                    minWidth: 34,
                                    px: 0,
                                    color: apparence ? `${apparence.couleur}.main` : 'text.disabled',
                                    fontWeight: 700,
                                  }}
                                >
                                  {apparence ? apparence.lettre : '–'}
                                </Button>
                              </TableCell>
                            );
                          })}

                          <TableCell align="center">
                            {pointes.length
                              ? `${Math.round((presentsMois / pointes.length) * 100)} %`
                              : '—'}
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Présents</TableCell>
                      {dimanches.map((jour) => (
                        <TableCell key={jour} align="center" sx={{ fontWeight: 700 }}>
                          {presentsDuJour(jour)}
                        </TableCell>
                      ))}
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}
        </>
      ) : (
        <>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
            <SelectRecherche
              label="Classe"
              value={classeSynthese}
              onChange={(event) => {
                setClasseSynthese(event.target.value);
                // Changer de filtre raccourcit la liste : rester en page 4
                // afficherait un tableau vide.
                setPageSynthese(0);
              }}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="">Toutes les classes</MenuItem>
              {classes.map((classe) => (
                <MenuItem key={classe.idClasseEcodim} value={String(classe.idClasseEcodim)}>
                  {classe.libelleClasse}
                </MenuItem>
              ))}
            </SelectRecherche>

            <TextField
              label="Du"
              type="date"
              value={dateDebut}
              onChange={(event) => {
                setDateDebut(event.target.value);
                setPageSynthese(0);
              }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Au"
              type="date"
              value={dateFin}
              onChange={(event) => {
                setDateFin(event.target.value);
                setPageSynthese(0);
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Le point par classe
          </Typography>

          <Card variant="outlined" sx={{ mb: 3 }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Classe</TableCell>
                    <TableCell align="center">Inscrits</TableCell>
                    <TableCell align="center">Nouveaux sur la période</TableCell>
                    <TableCell align="center">Séances</TableCell>
                    <TableCell align="center">Assiduité moyenne</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {effectifsParClasse.map((ligne) => (
                    <TableRow key={ligne.classe.idClasseEcodim} hover>
                      <TableCell>{ligne.classe.libelleClasse}</TableCell>
                      <TableCell align="center">{ligne.inscrits}</TableCell>
                      <TableCell align="center">{ligne.nouveaux}</TableCell>
                      <TableCell align="center">{ligne.seances}</TableCell>
                      <TableCell align="center">{ligne.tauxMoyen} %</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Les enfants, du plus assidu au moins assidu
          </Typography>

          <Card variant="outlined">
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">#</TableCell>
                    <TableCell>Nom et prénoms</TableCell>
                    <TableCell>Classe</TableCell>
                    <TableCell align="center">Séances</TableCell>
                    <TableCell align="center">Présences</TableCell>
                    <TableCell align="center">Absences</TableCell>
                    <TableCell align="center">Excusés</TableCell>
                    <TableCell align="center">Taux</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lignesSynthese
                    .slice(
                      pageSynthese * lignesParPage,
                      pageSynthese * lignesParPage + lignesParPage
                    )
                    .map((ligne, position) => {
                      // Le rang vient du classement complet : repartir de zero a
                      // chaque page ferait trois premiers par page.
                      const index = pageSynthese * lignesParPage + position;

                      return (
                    <TableRow key={ligne.enfant.idEnfantEcodim} hover>
                      <TableCell align="center">{index + 1}</TableCell>
                      <TableCell>{nomComplet(ligne.enfant)}</TableCell>
                      <TableCell>{ligne.classe?.libelleClasse || '—'}</TableCell>
                      <TableCell align="center">{ligne.seances}</TableCell>
                      <TableCell align="center">{ligne.presents}</TableCell>
                      <TableCell align="center">{ligne.absents}</TableCell>
                      <TableCell align="center">{ligne.excuses}</TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={`${ligne.taux} %`}
                          color={
                            // Seuils de lecture, pas de décision : ils servent à
                            // repérer d'un coup d'œil qui décroche.
                            // eslint-disable-next-line no-nested-ternary
                            ligne.taux >= 75 ? 'success' : ligne.taux >= 50 ? 'warning' : 'default'
                          }
                        />
                      </TableCell>
                    </TableRow>
                      );
                    })}

                  {!lignesSynthese.length && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          Aucun appel enregistré sur cette période.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              page={pageSynthese}
              count={lignesSynthese.length}
              rowsPerPage={lignesParPage}
              rowsPerPageOptions={[5, 10, 25]}
              onPageChange={(_, nouvelle) => setPageSynthese(nouvelle)}
              onRowsPerPageChange={(event) => {
                setLignesParPage(parseInt(event.target.value, 10));
                setPageSynthese(0);
              }}
              labelRowsPerPage="Lignes par page :"
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
            />
          </Card>
        </>
      )}
    </Box>
  );
}
