import ReactToPrint from 'react-to-print';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import {
  AddRounded,
  EditRounded,
  PrintRounded,
  CloseRounded,
  DeleteRounded,
  VisibilityRounded,
  EventRepeatRounded,
} from '@mui/icons-material';

import { apiClient, getApiErrorMessage } from 'src/utils/apiClient';

import ConfirmDialog from 'src/components/alert/confirmDialog';
import { PRINT_LANDSCAPE_PAGE_STYLE } from 'src/components/print/print-document';

import {
  dateProgramme,
  type Programme,
  ProgrammeFeuille,
  type LigneProgramme,
  type GrilleProgramme,
  type PersonneProgramme,
} from '../etats/programme-feuille';

// ----------------------------------------------------------------------
// Programme de direction et d'enseignement des moniteurs.
//
// Pour une période — un mois, deux, trois — on prévoit, dimanche par dimanche,
// qui dirige et qui apporte le message dans chaque classe, et quel moniteur
// joindre. Les noms se choisissent parmi les moniteurs déjà enregistrés, mais
// restent libres : « Mme OPETE », un invité ou un pasteur s'écrivent tels quels.

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

const personneVide = (): PersonneProgramme => ({ idMoniteur: null, nom: '' });

/** « 2026-11-08 » en date locale : `new Date('2026-11-08')` serait lue en UTC. */
const lireDate = (valeur: string): Date | null => {
  const [annee, mois, jour] = String(valeur || '').split('-').map(Number);
  return annee && mois && jour ? new Date(annee, mois - 1, jour) : null;
};

const ecrireDate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

/** Les dimanches compris entre deux dates, bornes incluses. */
const dimanchesEntre = (debut: string, fin: string): string[] => {
  const depart = lireDate(debut);
  const arrivee = lireDate(fin);
  if (!depart || !arrivee || depart > arrivee) return [];

  const jour = new Date(depart);
  jour.setDate(jour.getDate() + ((7 - jour.getDay()) % 7));

  const dates: string[] = [];
  while (jour <= arrivee && dates.length < 60) {
    dates.push(ecrireDate(jour));
    jour.setDate(jour.getDate() + 7);
  }
  return dates;
};

/**
 * Titre proposé à partir de la période : « Programme de novembre 2026 –
 * janvier 2027 », ou « Programme de novembre – décembre 2026 » dans une même
 * année.
 */
const titrePropose = (debut: string, fin: string): string => {
  const depart = lireDate(debut);
  const arrivee = lireDate(fin);
  if (!depart || !arrivee) return '';

  const moisDepart = MOIS[depart.getMonth()];
  const moisArrivee = MOIS[arrivee.getMonth()];

  if (depart.getFullYear() !== arrivee.getFullYear()) {
    return `Programme de ${moisDepart} ${depart.getFullYear()} – ${moisArrivee} ${arrivee.getFullYear()}`;
  }
  if (depart.getMonth() === arrivee.getMonth()) {
    return `Programme de ${moisDepart} ${depart.getFullYear()}`;
  }
  return `Programme de ${moisDepart} – ${moisArrivee} ${arrivee.getFullYear()}`;
};

const ligneVide = (date: string): LigneProgramme => ({
  date,
  contact: { ...personneVide(), telephone: '' },
  affectations: {},
});

const programmeVide = (enteteParDefaut: string): Programme => ({
  idProgrammeEcodim: null,
  titreProgramme: '',
  dateDebutProgramme: '',
  dateFinProgramme: '',
  enteteProgramme: enteteParDefaut,
  themeAnnuel: '',
  passageTheme: '',
  consignesProgramme: '',
  messageFinProgramme: '',
  grille: { classes: [], lignes: [] },
});

/** Une ligne relue du serveur, ramenée à la forme attendue par l'écran. */
const depuisServeur = (ligne: any): Programme => {
  const grille: GrilleProgramme = ligne?.grille && typeof ligne.grille === 'object'
    ? {
        classes: Array.isArray(ligne.grille.classes) ? ligne.grille.classes : [],
        lignes: Array.isArray(ligne.grille.lignes) ? ligne.grille.lignes : [],
      }
    : { classes: [], lignes: [] };

  return {
    idProgrammeEcodim: Number(ligne.idProgrammeEcodim) || null,
    titreProgramme: String(ligne.titreProgramme || ''),
    dateDebutProgramme: String(ligne.dateDebutProgramme || '').slice(0, 10),
    dateFinProgramme: String(ligne.dateFinProgramme || '').slice(0, 10),
    enteteProgramme: String(ligne.enteteProgramme || ''),
    themeAnnuel: String(ligne.themeAnnuel || ''),
    passageTheme: String(ligne.passageTheme || ''),
    consignesProgramme: String(ligne.consignesProgramme || ''),
    messageFinProgramme: String(ligne.messageFinProgramme || ''),
    grille,
  };
};

type OptionMoniteur = { idMoniteur: number; nom: string; telephone: string };

// ----------------------------------------------------------------------

type ChoixPersonneProps = {
  valeur: PersonneProgramme;
  options: OptionMoniteur[];
  placeholder: string;
  onChange: (personne: PersonneProgramme, option: OptionMoniteur | null) => void;
};

/**
 * Un nom pris dans la liste des moniteurs, ou écrit librement.
 */
const ChoixPersonne = ({ valeur, options, placeholder, onChange }: ChoixPersonneProps) => (
  <Autocomplete
    freeSolo
    size="small"
    options={options}
    value={valeur.nom}
    inputValue={valeur.nom}
    getOptionLabel={(option) => (typeof option === 'string' ? option : option.nom)}
    isOptionEqualToValue={(option, choisi) =>
      typeof choisi === 'string' ? option.nom === choisi : option.idMoniteur === choisi.idMoniteur
    }
    onInputChange={(_, texte, raison) => {
      if (raison === 'input' || raison === 'clear') {
        onChange({ idMoniteur: null, nom: texte }, null);
      }
    }}
    onChange={(_, choisi) => {
      if (choisi && typeof choisi === 'object') {
        onChange({ idMoniteur: choisi.idMoniteur, nom: choisi.nom }, choisi);
      } else {
        onChange({ idMoniteur: null, nom: String(choisi || '') }, null);
      }
    }}
    renderInput={(params) => <TextField {...params} placeholder={placeholder} />}
    sx={{ minWidth: 150 }}
  />
);

// ----------------------------------------------------------------------

type ProgrammesGrilleProps = {
  programmes: any[];
  classes: any[];
  moniteurs: any[];
  idUtilisateur: number;
  /** Proposé comme en-tête d'un nouveau programme : le nom de l'église. */
  nomEglise: string;
  /** Faux dans la fenêtre Windows : on y relit, la saisie se fait au navigateur. */
  modifiable: boolean;
  chargement?: boolean;
  /** Compteur d'ouvertures demandées par le « + » de la carte. */
  demandeAjout?: number;
  onEnregistre: () => void;
  onNotifier: (message: string, severite: 'success' | 'error' | 'info' | 'warning') => void;
};

export function ProgrammesGrille({
  programmes,
  classes,
  moniteurs,
  idUtilisateur,
  nomEglise,
  modifiable,
  chargement = false,
  demandeAjout = 0,
  onEnregistre,
  onNotifier,
}: ProgrammesGrilleProps) {
  const [formulaire, setFormulaire] = useState<Programme | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);
  const [apercu, setApercu] = useState<Programme | null>(null);
  const [aSupprimer, setASupprimer] = useState<Programme | null>(null);
  const referenceFeuille = useRef<HTMLDivElement>(null);

  const liste = useMemo(
    () => (Array.isArray(programmes) ? programmes.map(depuisServeur) : []),
    [programmes]
  );

  const optionsMoniteurs = useMemo<OptionMoniteur[]>(
    () =>
      (Array.isArray(moniteurs) ? moniteurs : [])
        .map((moniteur: any) => ({
          idMoniteur: Number(moniteur.idMoniteur),
          nom: `${moniteur.nomMembre || ''} ${moniteur.prenomMembre || ''}`.trim(),
          telephone: String(moniteur.contactMembre || ''),
        }))
        .filter((option) => option.nom),
    [moniteurs]
  );

  const classesActives = useMemo(
    () =>
      (Array.isArray(classes) ? classes : [])
        .filter((classe: any) => Number(classe.actifClasse ?? 1) !== 0)
        // Des plus petits aux plus grands, comme sur la feuille papier : par âge
        // quand la tranche est renseignée, sinon dans l'ordre de création. Le
        // serveur les renvoie par nom, ce qui mettait les Cadets en premier.
        .sort((a: any, b: any) => {
          const ageA = a.ageMin === null || a.ageMin === undefined || a.ageMin === '' ? 999 : Number(a.ageMin);
          const ageB = b.ageMin === null || b.ageMin === undefined || b.ageMin === '' ? 999 : Number(b.ageMin);
          return ageA - ageB || Number(a.idClasseEcodim) - Number(b.idClasseEcodim);
        })
        .map((classe: any) => ({
          idClasseEcodim: Number(classe.idClasseEcodim),
          libelleClasse: String(classe.libelleClasse || ''),
        })),
    [classes]
  );

  const ouvrirAjout = useCallback(() => {
    const nouveau = programmeVide(nomEglise);
    nouveau.grille.classes = classesActives;
    setFormulaire(nouveau);
  }, [classesActives, nomEglise]);

  useEffect(() => {
    if (demandeAjout > 0 && modifiable) {
      ouvrirAjout();
    }
    // Seul l'incrément du compteur doit rouvrir la saisie.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demandeAjout]);

  const changer = useCallback((champ: keyof Programme, valeur: any) => {
    setFormulaire((precedent) => {
      if (!precedent) return precedent;
      const suivant = { ...precedent, [champ]: valeur };

      // Le titre suit la période tant qu'on ne l'a pas réécrit à la main.
      if (champ === 'dateDebutProgramme' || champ === 'dateFinProgramme') {
        const ancien = titrePropose(precedent.dateDebutProgramme, precedent.dateFinProgramme);
        if (!precedent.titreProgramme || precedent.titreProgramme === ancien) {
          suivant.titreProgramme = titrePropose(
            suivant.dateDebutProgramme,
            suivant.dateFinProgramme
          );
        }
      }
      return suivant;
    });
  }, []);

  const changerLignes = useCallback(
    (transformer: (lignes: LigneProgramme[]) => LigneProgramme[]) => {
      setFormulaire((precedent) =>
        precedent
          ? { ...precedent, grille: { ...precedent.grille, lignes: transformer(precedent.grille.lignes) } }
          : precedent
      );
    },
    []
  );

  /** Remplit le tableau avec les dimanches de la période, sans perdre ce qui est déjà saisi. */
  const genererDimanches = useCallback(() => {
    if (!formulaire) return;
    const dates = dimanchesEntre(formulaire.dateDebutProgramme, formulaire.dateFinProgramme);

    if (!dates.length) {
      const debut = lireDate(formulaire.dateDebutProgramme);
      const fin = lireDate(formulaire.dateFinProgramme);
      let message = 'Choisissez la date de début (Du) et la date de fin (Au).';
      if (debut && fin && fin < debut) {
        message = `La date de fin (${dateProgramme(formulaire.dateFinProgramme).replace(/-/g, '/')}) est avant la date de début (${dateProgramme(formulaire.dateDebutProgramme).replace(/-/g, '/')}). Vérifiez l'année.`;
      } else if (debut && fin) {
        message = "Il n'y a aucun dimanche entre ces deux dates.";
      }
      onNotifier(message, 'warning');
      return;
    }

    changerLignes((lignes) => {
      const existantes = new Map(lignes.map((ligne) => [ligne.date, ligne]));
      const autres = lignes.filter((ligne) => !dates.includes(ligne.date) && ligne.date);
      return [...dates.map((date) => existantes.get(date) || ligneVide(date)), ...autres].sort(
        (a, b) => a.date.localeCompare(b.date)
      );
    });
  }, [changerLignes, formulaire, onNotifier]);

  const ajouterLigne = useCallback(() => {
    changerLignes((lignes) => {
      const derniere = lignes.length ? lireDate(lignes[lignes.length - 1].date) : null;
      if (derniere) derniere.setDate(derniere.getDate() + 7);
      return [...lignes, ligneVide(derniere ? ecrireDate(derniere) : '')];
    });
  }, [changerLignes]);

  const changerLigne = useCallback(
    (index: number, transformer: (ligne: LigneProgramme) => LigneProgramme) => {
      changerLignes((lignes) =>
        lignes.map((ligne, position) => (position === index ? transformer(ligne) : ligne))
      );
    },
    [changerLignes]
  );

  const basculerClasse = useCallback(
    (classe: { idClasseEcodim: number; libelleClasse: string }) => {
      setFormulaire((precedent) => {
        if (!precedent) return precedent;
        const presente = precedent.grille.classes.some(
          (item) => item.idClasseEcodim === classe.idClasseEcodim
        );
        // L'ordre des colonnes suit celui des classes, pas l'ordre des clics.
        const classesRetenues = presente
          ? precedent.grille.classes.filter((item) => item.idClasseEcodim !== classe.idClasseEcodim)
          : classesActives.filter(
              (item) =>
                item.idClasseEcodim === classe.idClasseEcodim ||
                precedent.grille.classes.some((deja) => deja.idClasseEcodim === item.idClasseEcodim)
            );
        return { ...precedent, grille: { ...precedent.grille, classes: classesRetenues } };
      });
    },
    [classesActives]
  );

  const enregistrer = useCallback(async () => {
    if (!formulaire) return;

    if (!formulaire.titreProgramme.trim()) {
      onNotifier('Donnez un titre au programme.', 'warning');
      return;
    }

    const donnees = {
      ...formulaire,
      titreProgramme: formulaire.titreProgramme.trim(),
      grilleProgramme: {
        ...formulaire.grille,
        lignes: formulaire.grille.lignes.filter((ligne) => ligne.date),
      },
      idUtilisateur,
    };

    try {
      setEnregistrement(true);
      if (formulaire.idProgrammeEcodim) {
        await apiClient.updateProgrammeEcodim(donnees);
      } else {
        await apiClient.createProgrammeEcodim(donnees);
      }
      onNotifier(
        formulaire.idProgrammeEcodim ? 'Programme modifié.' : 'Programme enregistré.',
        'success'
      );
      setFormulaire(null);
      onEnregistre();
    } catch (erreur) {
      onNotifier(getApiErrorMessage(erreur), 'error');
    } finally {
      setEnregistrement(false);
    }
  }, [formulaire, idUtilisateur, onEnregistre, onNotifier]);

  const supprimer = useCallback(async () => {
    if (!aSupprimer?.idProgrammeEcodim) return;
    try {
      await apiClient.deleteProgrammeEcodim({
        idProgrammeEcodim: Number(aSupprimer.idProgrammeEcodim),
        idUtilisateur,
      });
      onNotifier('Programme supprimé.', 'success');
      onEnregistre();
    } catch (erreur) {
      onNotifier(getApiErrorMessage(erreur), 'error');
    } finally {
      setASupprimer(null);
    }
  }, [aSupprimer, idUtilisateur, onEnregistre, onNotifier]);

  const classesDuFormulaire = formulaire?.grille.classes || [];

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2" color="text.secondary">
          {liste.length} programme{liste.length > 1 ? 's' : ''}
        </Typography>

        {modifiable && (
          <Button variant="contained" startIcon={<AddRounded />} onClick={ouvrirAjout}>
            Nouveau programme
          </Button>
        )}
      </Stack>

      {/* ------------------------------------------------------------ liste */}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Programme</TableCell>
              <TableCell>Période</TableCell>
              <TableCell align="center">Dimanches</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {liste.map((programme) => (
              <TableRow key={programme.idProgrammeEcodim} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={700}>
                    {programme.titreProgramme}
                  </Typography>
                  {programme.themeAnnuel ? (
                    <Typography variant="caption" color="text.secondary">
                      {programme.themeAnnuel}
                    </Typography>
                  ) : null}
                </TableCell>
                <TableCell>
                  {programme.dateDebutProgramme || programme.dateFinProgramme
                    ? `du ${dateProgramme(programme.dateDebutProgramme).replace(/-/g, '/')} au ${dateProgramme(
                        programme.dateFinProgramme
                      ).replace(/-/g, '/')}`
                    : '—'}
                </TableCell>
                <TableCell align="center">{programme.grille.lignes.length}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title="Voir la feuille">
                    <IconButton size="small" onClick={() => setApercu(programme)}>
                      <VisibilityRounded fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {modifiable && (
                    <>
                      <Tooltip title="Modifier">
                        <IconButton size="small" onClick={() => setFormulaire(programme)}>
                          <EditRounded fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setASupprimer(programme)}
                        >
                          <DeleteRounded fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {chargement && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {!chargement && liste.length === 0 && (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="subtitle1">Aucun programme</Typography>
          <Typography variant="body2" color="text.secondary">
            Prévoyez, dimanche par dimanche, qui dirige et qui apporte le message dans chaque
            classe, puis imprimez la feuille pour les moniteurs.
          </Typography>
        </Box>
      )}

      {/* ---------------------------------------------------------- saisie */}
      <Dialog
        open={Boolean(formulaire)}
        onClose={() => !enregistrement && setFormulaire(null)}
        fullScreen
      >
        {formulaire && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ flex: 1 }}>
                {formulaire.idProgrammeEcodim ? 'Modifier le programme' : 'Nouveau programme'}
              </Box>
              <IconButton onClick={() => !enregistrement && setFormulaire(null)}>
                <CloseRounded />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers>
              <Stack spacing={2.5}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={2}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <TextField
                        size="small"
                        type="date"
                        label="Du *"
                        InputLabelProps={{ shrink: true }}
                        value={formulaire.dateDebutProgramme}
                        onChange={(e) => changer('dateDebutProgramme', e.target.value)}
                      />
                      <TextField
                        size="small"
                        type="date"
                        label="Au *"
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: formulaire.dateDebutProgramme || undefined }}
                        error={Boolean(
                          formulaire.dateDebutProgramme &&
                            formulaire.dateFinProgramme &&
                            formulaire.dateFinProgramme < formulaire.dateDebutProgramme
                        )}
                        value={formulaire.dateFinProgramme}
                        onChange={(e) => changer('dateFinProgramme', e.target.value)}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Titre *"
                        placeholder="Programme de novembre – janvier 2027"
                        value={formulaire.titreProgramme}
                        onChange={(e) => changer('titreProgramme', e.target.value)}
                      />
                    </Stack>

                    <TextField
                      fullWidth
                      size="small"
                      label="En-tête de la feuille"
                      placeholder="DEEADCI : ANDOKOI TEMPLE PENIEL"
                      value={formulaire.enteteProgramme}
                      onChange={(e) => changer('enteteProgramme', e.target.value)}
                    />

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Thème annuel"
                        placeholder="Par le Saint-Esprit retournons à nos fondamentaux…"
                        value={formulaire.themeAnnuel}
                        onChange={(e) => changer('themeAnnuel', e.target.value)}
                      />
                      <TextField
                        size="small"
                        label="Passage"
                        placeholder="Actes 2 : 42 à 47"
                        value={formulaire.passageTheme}
                        onChange={(e) => changer('passageTheme', e.target.value)}
                        sx={{ minWidth: { md: 260 } }}
                      />
                    </Stack>
                  </Stack>
                </Card>

                {/* -------------------------------------------- classes et dimanches */}
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={1.5}
                  alignItems={{ md: 'center' }}
                  justifyContent="space-between"
                >
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Classes :
                    </Typography>
                    {classesActives.length === 0 && (
                      <Typography variant="body2" color="warning.main">
                        aucune classe enregistrée : créez d&apos;abord vos classes dans
                        l&apos;onglet Classes, elles deviennent les colonnes Direction /
                        Messager du tableau.
                      </Typography>
                    )}
                    {classesActives.map((classe) => {
                      const retenue = classesDuFormulaire.some(
                        (item) => item.idClasseEcodim === classe.idClasseEcodim
                      );
                      return (
                        <Chip
                          key={classe.idClasseEcodim}
                          label={classe.libelleClasse}
                          color={retenue ? 'primary' : 'default'}
                          variant={retenue ? 'filled' : 'outlined'}
                          onClick={() => basculerClasse(classe)}
                        />
                      );
                    })}
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<EventRepeatRounded />}
                      onClick={genererDimanches}
                    >
                      Remplir les dimanches
                    </Button>
                    <Button variant="outlined" startIcon={<AddRounded />} onClick={ajouterLigne}>
                      Ajouter une date
                    </Button>
                  </Stack>
                </Stack>

                {formulaire.grille.lignes.length === 0 ? (
                  <Alert severity="info">
                    Choisissez la période, puis cliquez sur « Remplir les dimanches » : une ligne
                    s&apos;ajoute pour chaque dimanche. Pour chaque classe, indiquez qui dirige et qui
                    apporte le message ; si c&apos;est la même personne, écrivez seulement la direction.
                  </Alert>
                ) : (
                  <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Table size="small" sx={{ '& td, & th': { px: 1, py: 0.75 } }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ minWidth: 150 }}>Date</TableCell>
                          {classesDuFormulaire.map((classe) => (
                            <TableCell key={classe.idClasseEcodim} sx={{ minWidth: 190 }}>
                              {classe.libelleClasse}
                            </TableCell>
                          ))}
                          <TableCell sx={{ minWidth: 200 }}>Contact moniteur</TableCell>
                          <TableCell />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formulaire.grille.lignes.map((ligne, index) => (
                          <TableRow key={index} sx={{ verticalAlign: 'top' }}>
                            <TableCell>
                              <TextField
                                size="small"
                                type="date"
                                value={ligne.date}
                                onChange={(e) =>
                                  changerLigne(index, (l) => ({ ...l, date: e.target.value }))
                                }
                              />
                            </TableCell>

                            {classesDuFormulaire.map((classe) => {
                              const cle = String(classe.idClasseEcodim);
                              const affectation = ligne.affectations?.[cle] || {
                                direction: personneVide(),
                                messager: personneVide(),
                              };
                              const poser = (role: 'direction' | 'messager', personne: PersonneProgramme) =>
                                changerLigne(index, (l) => ({
                                  ...l,
                                  affectations: {
                                    ...l.affectations,
                                    [cle]: { ...affectation, ...l.affectations?.[cle], [role]: personne },
                                  },
                                }));
                              return (
                                <TableCell key={cle}>
                                  <Stack spacing={0.75}>
                                    <ChoixPersonne
                                      valeur={affectation.direction}
                                      options={optionsMoniteurs}
                                      placeholder="Direction"
                                      onChange={(personne) => poser('direction', personne)}
                                    />
                                    <ChoixPersonne
                                      valeur={affectation.messager}
                                      options={optionsMoniteurs}
                                      placeholder="Messager"
                                      onChange={(personne) => poser('messager', personne)}
                                    />
                                  </Stack>
                                </TableCell>
                              );
                            })}

                            <TableCell>
                              <Stack spacing={0.75}>
                                <ChoixPersonne
                                  valeur={ligne.contact}
                                  options={optionsMoniteurs}
                                  placeholder="Moniteur"
                                  onChange={(personne, option) =>
                                    changerLigne(index, (l) => ({
                                      ...l,
                                      contact: {
                                        ...personne,
                                        // Le numéro vient de la fiche du moniteur choisi,
                                        // et reste modifiable.
                                        telephone: option ? option.telephone : l.contact.telephone,
                                      },
                                    }))
                                  }
                                />
                                <TextField
                                  size="small"
                                  placeholder="Téléphone"
                                  value={ligne.contact.telephone}
                                  onChange={(e) =>
                                    changerLigne(index, (l) => ({
                                      ...l,
                                      contact: { ...l.contact, telephone: e.target.value },
                                    }))
                                  }
                                />
                              </Stack>
                            </TableCell>

                            <TableCell>
                              <Tooltip title="Retirer cette date">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() =>
                                    changerLignes((lignes) => lignes.filter((_, p) => p !== index))
                                  }
                                >
                                  <DeleteRounded fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="NB : consignes (une par ligne)"
                    placeholder={
                      'Jeûne et prière des enfants le 06/12/2026\nJeûne et prière des moniteurs le 13/12/2026'
                    }
                    value={formulaire.consignesProgramme}
                    onChange={(e) => changer('consignesProgramme', e.target.value)}
                  />
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="Message en bas de la feuille (en gras)"
                    placeholder={
                      'Utilisons les progressions pour les messages.\nRépétitions avec les enfants pour le 24 décembre.'
                    }
                    value={formulaire.messageFinProgramme}
                    onChange={(e) => changer('messageFinProgramme', e.target.value)}
                  />
                </Stack>
              </Stack>
            </DialogContent>

            <DialogActions>
              <Button
                startIcon={<VisibilityRounded />}
                onClick={() => setApercu(formulaire)}
                sx={{ mr: 'auto' }}
              >
                Aperçu
              </Button>
              <Button onClick={() => setFormulaire(null)} disabled={enregistrement}>
                Annuler
              </Button>
              <Button variant="contained" onClick={enregistrer} disabled={enregistrement}>
                {enregistrement ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ---------------------------------------------------------- aperçu */}
      <Dialog open={Boolean(apercu)} onClose={() => setApercu(null)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ flex: 1 }}>{apercu?.titreProgramme || 'Programme'}</Box>
          <IconButton onClick={() => setApercu(null)}>
            <CloseRounded />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: '#e5e7eb', p: { xs: 1, md: 2 } }}>
          {apercu && (
            <Box sx={{ overflowX: 'auto' }}>
              <Box sx={{ minWidth: 900 }}>
                <ProgrammeFeuille ref={referenceFeuille} programme={apercu} />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApercu(null)}>Fermer</Button>
          {/* Impression réservée au navigateur, comme partout ailleurs dans le projet. */}
          {modifiable && (
            <ReactToPrint
              trigger={() => (
                <Button variant="contained" startIcon={<PrintRounded />}>
                  Imprimer
                </Button>
              )}
              content={() => referenceFeuille.current}
              pageStyle={PRINT_LANDSCAPE_PAGE_STYLE}
              documentTitle={apercu?.titreProgramme || 'Programme'}
            />
          )}
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(aSupprimer)}
        title="Supprimer le programme"
        message={`Voulez-vous vraiment supprimer « ${aSupprimer?.titreProgramme || ''} » ?`}
        onClose={() => setASupprimer(null)}
        onConfirm={supprimer}
      />
    </Stack>
  );
}
