import ReactToPrint from 'react-to-print';
import { useSelector } from 'react-redux';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
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
  CloseRounded,
  PrintRounded,
  DeleteRounded,
  VisibilityRounded,
} from '@mui/icons-material';

import { apiClient, getApiErrorMessage } from 'src/utils/apiClient';

import ConfirmDialog from 'src/components/alert/confirmDialog';
import {
  getPrintableLogoUrl,
  PRINT_LANDSCAPE_PAGE_STYLE,
} from 'src/components/print/print-document';

import {
  nomDuMois,
  lireDateLocale,
  type LigneActivite,
  type ProgrammeActivite,
  ProgrammeActiviteFeuille,
} from '../etats/programme-activite-feuille';

// ----------------------------------------------------------------------
// Programme d'activités de la jeunesse.
//
// Une feuille par période (un trimestre, les vacances...) : une ligne par
// rencontre, avec qui dirige, qui parle, l'activité, ses thèmes et le lieu. Les
// noms se choisissent parmi les membres mais restent libres ; les activités et
// les lieux déjà utilisés sont proposés à la saisie suivante.

const ACTIVITES_PROPOSEES = [
  "Prière d'ensemble",
  'Jeûne et prière',
  'Réunion',
  "Réunion d'ensemble",
  'Causerie',
  'Évangélisation',
  'Jeux bibliques',
  'Chant imposé',
  'Sport',
  'Préparatifs des fêtes',
  'Sortie',
];

const ecrireDate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

const titrePropose = (debut: string, fin: string): string => {
  const depart = lireDateLocale(debut);
  const arrivee = lireDateLocale(fin);
  if (!depart || !arrivee) return '';
  const a = nomDuMois(depart.getMonth());
  const b = nomDuMois(arrivee.getMonth());
  let periode = `${a} ${depart.getFullYear()} à ${b} ${arrivee.getFullYear()}`;
  if (depart.getFullYear() === arrivee.getFullYear()) {
    periode = depart.getMonth() === arrivee.getMonth() ? `${a} ${depart.getFullYear()}` : `${a} à ${b} ${arrivee.getFullYear()}`;
  }
  return `Programme d'activités de la jeunesse — ${periode}`;
};

const ligneVide = (date: string): LigneActivite => ({
  date,
  direction: '',
  orateur: '',
  activite: '',
  themes: '',
  lieu: '',
});

const programmeVide = (entete: string): ProgrammeActivite => ({
  idProgrammeActivite: null,
  titreProgramme: '',
  dateDebutProgramme: '',
  dateFinProgramme: '',
  enteteProgramme: entete,
  themeAnnuel: '',
  passageTheme: '',
  afficherOrateurs: true,
  lignes: [],
});

const depuisServeur = (ligne: any): ProgrammeActivite => ({
  idProgrammeActivite: Number(ligne.idProgrammeActivite) || null,
  titreProgramme: String(ligne.titreProgramme || ''),
  dateDebutProgramme: String(ligne.dateDebutProgramme || '').slice(0, 10),
  dateFinProgramme: String(ligne.dateFinProgramme || '').slice(0, 10),
  enteteProgramme: String(ligne.enteteProgramme || ''),
  themeAnnuel: String(ligne.themeAnnuel || ''),
  passageTheme: String(ligne.passageTheme || ''),
  afficherOrateurs: Number(ligne.afficherOrateurs ?? 1) !== 0,
  lignes: (Array.isArray(ligne.lignes) ? ligne.lignes : []).map((l: any) => ({
    ...ligneVide(''),
    ...l,
  })),
});

/** La colonne des orateurs ne s'imprime que si au moins une rencontre en a un. */
const avecOrateurs = (programme: ProgrammeActivite): boolean =>
  programme.lignes.some((ligne) => String(ligne.orateur || '').trim() !== '');

const dateCourte = (valeur: string): string => {
  const date = lireDateLocale(valeur);
  return date
    ? `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
    : '';
};

/** Un texte pris dans une liste de propositions, ou écrit librement. */
function ChampLibre({
  valeur,
  options,
  placeholder,
  onChange,
}: {
  valeur: string;
  options: string[];
  placeholder: string;
  onChange: (valeur: string) => void;
}) {
  return (
    <Autocomplete
      freeSolo
      size="small"
      options={options}
      value={valeur}
      inputValue={valeur}
      onInputChange={(_, texte) => onChange(texte)}
      onChange={(_, choisi) => onChange(String(choisi || ''))}
      renderInput={(params) => <TextField {...params} placeholder={placeholder} />}
      sx={{ minWidth: 140 }}
    />
  );
}

// ----------------------------------------------------------------------

type ProgrammeActiviteManagerProps = {
  idUtilisateur: number;
  /** Membres de l'église : leurs noms sont proposés pour la direction et les orateurs. */
  membres: any[];
  /** Faux dans la fenêtre Windows : on y relit, la saisie se fait au navigateur. */
  modifiable: boolean;
  onNotifier: (message: string, severite: 'success' | 'error' | 'info' | 'warning') => void;
};

export function ProgrammeActiviteManager({
  idUtilisateur,
  membres,
  modifiable,
  onNotifier,
}: ProgrammeActiviteManagerProps) {
  const [programmes, setProgrammes] = useState<ProgrammeActivite[]>([]);
  const [chargement, setChargement] = useState(false);
  const [formulaire, setFormulaire] = useState<ProgrammeActivite | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);
  const [apercu, setApercu] = useState<ProgrammeActivite | null>(null);
  const [aSupprimer, setASupprimer] = useState<ProgrammeActivite | null>(null);
  const referenceFeuille = useRef<HTMLDivElement>(null);

  const appUser = useSelector((state: any) => state.application?.userConnected);
  const authUser = useSelector((state: any) => state.authentification?.utilisateurData);
  const identite = useMemo(() => ({ ...(authUser || {}), ...(appUser || {}) }), [appUser, authUser]);
  const logoUrl = useMemo(() => getPrintableLogoUrl(identite as any), [identite]);

  const charger = useCallback(async () => {
    if (!idUtilisateur) return;
    try {
      setChargement(true);
      const reponse = await apiClient.getProgrammesActivite(idUtilisateur, 'jeunesse');
      setProgrammes((Array.isArray(reponse?.data) ? reponse.data : []).map(depuisServeur));
    } catch (erreur) {
      onNotifier(getApiErrorMessage(erreur, 'Impossible de charger les programmes.'), 'error');
    } finally {
      setChargement(false);
    }
  }, [idUtilisateur, onNotifier]);

  useEffect(() => {
    charger();
  }, [charger]);

  const nomsMembres = useMemo(
    () =>
      Array.from(
        new Set(
          (Array.isArray(membres) ? membres : [])
            .map((m: any) => `${m.prenomMembre || ''} ${m.nomMembre || ''}`.trim())
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b, 'fr')),
    [membres]
  );

  // Ce qui a déjà servi revient en tête des propositions.
  const activitesConnues = useMemo(() => {
    const deja = programmes.flatMap((p) => p.lignes.map((l) => l.activite)).filter(Boolean);
    return Array.from(new Set([...deja, ...ACTIVITES_PROPOSEES]));
  }, [programmes]);

  const lieuxConnus = useMemo(
    () =>
      Array.from(new Set(programmes.flatMap((p) => p.lignes.map((l) => l.lieu)).filter(Boolean))),
    [programmes]
  );

  const ouvrirAjout = () => {
    const nomEglise = String(identite?.nomTemple || identite?.nomEgliseCourt || '').toUpperCase();
    setFormulaire(programmeVide(nomEglise));
  };

  const changer = (champ: keyof ProgrammeActivite, valeur: any) => {
    setFormulaire((precedent) => {
      if (!precedent) return precedent;
      const suivant = { ...precedent, [champ]: valeur };
      if (champ === 'dateDebutProgramme' || champ === 'dateFinProgramme') {
        const ancien = titrePropose(precedent.dateDebutProgramme, precedent.dateFinProgramme);
        if (!precedent.titreProgramme || precedent.titreProgramme === ancien) {
          suivant.titreProgramme = titrePropose(suivant.dateDebutProgramme, suivant.dateFinProgramme);
        }
      }
      return suivant;
    });
  };

  const changerLigne = (index: number, champ: keyof LigneActivite, valeur: string) => {
    setFormulaire((precedent) =>
      precedent
        ? {
            ...precedent,
            lignes: precedent.lignes.map((ligne, position) =>
              position === index ? { ...ligne, [champ]: valeur } : ligne
            ),
          }
        : precedent
    );
  };

  /** Nouvelle rencontre une semaine après la dernière, le même jour de la semaine. */
  const ajouterLigne = () => {
    setFormulaire((precedent) => {
      if (!precedent) return precedent;
      const derniere = precedent.lignes.length
        ? lireDateLocale(precedent.lignes[precedent.lignes.length - 1].date)
        : null;
      let date = precedent.dateDebutProgramme;
      if (derniere) {
        derniere.setDate(derniere.getDate() + 7);
        date = ecrireDate(derniere);
      }
      return { ...precedent, lignes: [...precedent.lignes, ligneVide(date)] };
    });
  };

  const enregistrer = async () => {
    if (!formulaire) return;
    if (!formulaire.titreProgramme.trim()) {
      onNotifier('Donnez un titre au programme.', 'warning');
      return;
    }
    if (
      formulaire.dateDebutProgramme &&
      formulaire.dateFinProgramme &&
      formulaire.dateFinProgramme < formulaire.dateDebutProgramme
    ) {
      onNotifier('La date de fin est avant la date de début. Vérifiez l’année.', 'warning');
      return;
    }

    const donnees = {
      ...formulaire,
      afficherOrateurs: avecOrateurs(formulaire),
      sectionProgramme: 'jeunesse',
      titreProgramme: formulaire.titreProgramme.trim(),
      // Les rencontres sont rangées par date : la feuille les relit dans cet ordre.
      lignesProgramme: [...formulaire.lignes]
        .filter((ligne) => ligne.date || ligne.activite || ligne.direction)
        .sort((a, b) => String(a.date).localeCompare(String(b.date))),
      idUtilisateur,
    };

    try {
      setEnregistrement(true);
      if (formulaire.idProgrammeActivite) {
        await apiClient.updateProgrammeActivite(donnees);
      } else {
        await apiClient.createProgrammeActivite(donnees);
      }
      onNotifier(
        formulaire.idProgrammeActivite ? 'Programme modifié.' : 'Programme enregistré.',
        'success'
      );
      setFormulaire(null);
      charger();
    } catch (erreur) {
      onNotifier(getApiErrorMessage(erreur), 'error');
    } finally {
      setEnregistrement(false);
    }
  };

  const supprimer = async () => {
    if (!aSupprimer?.idProgrammeActivite) return;
    try {
      await apiClient.deleteProgrammeActivite({
        idProgrammeActivite: Number(aSupprimer.idProgrammeActivite),
        idUtilisateur,
      });
      onNotifier('Programme supprimé.', 'success');
      charger();
    } catch (erreur) {
      onNotifier(getApiErrorMessage(erreur), 'error');
    } finally {
      setASupprimer(null);
    }
  };


  return (
    <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ sm: 'center' }}
        >
          <Typography variant="h6">Programme d&apos;activités</Typography>
          {modifiable && (
            <Button variant="contained" startIcon={<AddRounded />} onClick={ouvrirAjout}>
              Nouveau programme
            </Button>
          )}
        </Stack>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Programme</TableCell>
                <TableCell>Période</TableCell>
                <TableCell align="center">Rencontres</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {programmes.map((programme) => (
                <TableRow key={programme.idProgrammeActivite} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}>
                      {programme.titreProgramme}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {programme.dateDebutProgramme
                      ? `du ${dateCourte(programme.dateDebutProgramme)} au ${dateCourte(programme.dateFinProgramme)}`
                      : '—'}
                  </TableCell>
                  <TableCell align="center">{programme.lignes.length}</TableCell>
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
                          <IconButton size="small" color="error" onClick={() => setASupprimer(programme)}>
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
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <CircularProgress size={26} />
          </Box>
        )}
        {!chargement && programmes.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            Aucun programme pour le moment.
          </Typography>
        )}
      </Stack>

      {/* ---------------------------------------------------------- saisie */}
      <Dialog open={Boolean(formulaire)} onClose={() => !enregistrement && setFormulaire(null)} fullScreen>
        {formulaire && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ flex: 1 }}>
                {formulaire.idProgrammeActivite ? 'Modifier le programme' : "Nouveau programme d'activités"}
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
                        label="Du"
                        InputLabelProps={{ shrink: true }}
                        value={formulaire.dateDebutProgramme}
                        onChange={(e) => changer('dateDebutProgramme', e.target.value)}
                      />
                      <TextField
                        size="small"
                        type="date"
                        label="Au"
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
                        placeholder="Programme d'activités de la jeunesse d'Andokoi Oct-Nov-Déc 2025"
                        value={formulaire.titreProgramme}
                        onChange={(e) => changer('titreProgramme', e.target.value)}
                      />
                    </Stack>

                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      label="En-tête de la feuille (une ligne par ligne imprimée)"
                      placeholder={
                        "JEUNESSE DES ASSEMBLÉES DE DIEU DE CÔTE D'IVOIRE\nSiège social : Centre des Ministères EEAD-CI Marcory-Zone 4 c\n10 BP 2331 ABIDJAN 10"
                      }
                      value={formulaire.enteteProgramme}
                      onChange={(e) => changer('enteteProgramme', e.target.value)}
                    />

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Thème de l'année"
                        placeholder="JADCI, en ces temps de la fin vivons la vie du Royaume de Dieu"
                        value={formulaire.themeAnnuel}
                        onChange={(e) => changer('themeAnnuel', e.target.value)}
                      />
                      <TextField
                        size="small"
                        label="Passage"
                        placeholder="Matthieu 5 - 7"
                        value={formulaire.passageTheme}
                        onChange={(e) => changer('passageTheme', e.target.value)}
                        sx={{ minWidth: { md: 220 } }}
                      />
                    </Stack>
                  </Stack>
                </Card>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2">
                    {formulaire.lignes.length} rencontre{formulaire.lignes.length > 1 ? 's' : ''}
                  </Typography>
                  <Button variant="outlined" startIcon={<AddRounded />} onClick={ajouterLigne}>
                    Ajouter une rencontre
                  </Button>
                </Stack>

                {formulaire.lignes.length === 0 ? (
                  <Alert severity="info">
                    Cliquez sur « Ajouter une rencontre » pour chaque activité du programme. La date
                    donne le mois et le jour (Dim, Ven…) imprimés sur la feuille. Plusieurs thèmes
                    s&apos;écrivent un par ligne : ils s&apos;impriment avec une puce chacun.
                  </Alert>
                ) : (
                  <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Table size="small" sx={{ '& td, & th': { px: 1, py: 0.75, verticalAlign: 'top' } }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ minWidth: 150 }}>Date</TableCell>
                          <TableCell sx={{ minWidth: 170 }}>Direction</TableCell>
                          <TableCell sx={{ minWidth: 170 }}>Enseignant / Orateur</TableCell>
                          <TableCell sx={{ minWidth: 180 }}>Activité</TableCell>
                          <TableCell sx={{ minWidth: 260 }}>Thèmes (un par ligne)</TableCell>
                          <TableCell sx={{ minWidth: 140 }}>Lieu</TableCell>
                          <TableCell />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formulaire.lignes.map((ligne, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <TextField
                                size="small"
                                type="date"
                                value={ligne.date}
                                onChange={(e) => changerLigne(index, 'date', e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <ChampLibre
                                valeur={ligne.direction}
                                options={nomsMembres}
                                placeholder="Direction"
                                onChange={(v) => changerLigne(index, 'direction', v)}
                              />
                            </TableCell>
                            <TableCell>
                              <ChampLibre
                                valeur={ligne.orateur}
                                options={nomsMembres}
                                placeholder="Enseignant / Orateur"
                                onChange={(v) => changerLigne(index, 'orateur', v)}
                              />
                            </TableCell>
                            <TableCell>
                              <ChampLibre
                                valeur={ligne.activite}
                                options={activitesConnues}
                                placeholder="Activité"
                                onChange={(v) => changerLigne(index, 'activite', v)}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                multiline
                                size="small"
                                placeholder="Thème"
                                value={ligne.themes}
                                onChange={(e) => changerLigne(index, 'themes', e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <ChampLibre
                                valeur={ligne.lieu}
                                options={lieuxConnus}
                                placeholder="Lieu"
                                onChange={(v) => changerLigne(index, 'lieu', v)}
                              />
                            </TableCell>
                            <TableCell>
                              <Tooltip title="Retirer cette rencontre">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() =>
                                    setFormulaire((p) =>
                                      p ? { ...p, lignes: p.lignes.filter((_, pos) => pos !== index) } : p
                                    )
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
              </Stack>
            </DialogContent>

            <DialogActions>
              <Button startIcon={<VisibilityRounded />} onClick={() => setApercu(formulaire)} sx={{ mr: 'auto' }}>
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
                <ProgrammeActiviteFeuille
                  ref={referenceFeuille}
                  programme={{
                    ...apercu,
                    afficherOrateurs: avecOrateurs(apercu),
                    lignes: [...apercu.lignes].sort((a, b) => String(a.date).localeCompare(String(b.date))),
                  }}
                  logoUrl={logoUrl}
                />
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
    </Card>
  );
}
