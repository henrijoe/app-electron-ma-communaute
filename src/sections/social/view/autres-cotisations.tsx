import type { IMembre } from 'src/store/membreSlice';

import * as XLSX from 'xlsx';
import ReactToPrint from 'react-to-print';
import { useRef, useMemo, useState, useEffect, forwardRef, useCallback } from 'react';

import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Box,
  Card,
  Stack,
  Table,
  Button,
  Dialog,
  Tooltip,
  MenuItem,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  IconButton,
  Typography,
  DialogTitle,
  TableFooter,
  Autocomplete,
  DialogActions,
  DialogContent,
  TablePagination,
} from '@mui/material';
import {
  EditRounded as EditRoundedIcon,
  PrintRounded as PrintRoundedIcon,
  DeleteRounded as DeleteRoundedIcon,
  SearchRounded as SearchRoundedIcon,
  EventNoteRounded as EventNoteRoundedIcon,
  FileDownloadRounded as FileDownloadRoundedIcon,
  VolunteerActivismRounded as VolunteerActivismRoundedIcon,
} from '@mui/icons-material';

import { isDesktopAppRuntime } from 'src/utils/access-control';
import { apiClient, getApiErrorMessage } from 'src/utils/apiClient';
import {
  type PeriodMode,
  isDateWithinRange,
  formatPeriodLabel,
  resolvePeriodRange,
} from 'src/utils/period-filter';

import ConfirmDialog from 'src/components/alert/confirmDialog';
import { SelectRecherche } from 'src/components/select-recherche';
import {
  PrintTable,
  PrintEmptyState,
  PrintDocumentLayout,
  TableRow as PrintTableRow,
  PRINT_LANDSCAPE_PAGE_STYLE,
  TableBody as PrintTableBody,
  TableCell as PrintTableCell,
  TableHead as PrintTableHead,
} from 'src/components/print/print-document';

type Versement = {
  idCotisation: number;
  nomCotisation: string;
  idMembre: number | null;
  nomMembreVersement: string;
  montantVersement: number;
  dateVersement: string;
  observationVersement?: string;
};

type AutresCotisationsProps = {
  canManage: boolean;
  demandeAjout: number;
  identity?: any;
  idUtilisateur: number;
  membres: IMembre[];
  onChange: () => void;
  showNotification: (message: string, severity?: 'success' | 'info' | 'warning' | 'error') => void;
};

const PERIODES: Array<{ value: PeriodMode; label: string }> = [
  { value: 'all', label: 'Toute la période' },
  { value: 'this-month', label: 'Ce mois-ci' },
  { value: 'last-month', label: 'Le mois dernier' },
  { value: 'last-3-months', label: 'Ces 3 derniers mois' },
  { value: 'custom', label: 'Période personnalisée' },
];

const aujourdhui = () => {
  const date = new Date();
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  const jour = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mois}-${jour}`;
};

const formaterMontant = (valeur: number) => `${Number(valeur || 0).toLocaleString('fr-FR')} F CFA`;

// Lecture directe de AAAA-MM-JJ : passer par new Date() décalerait la date selon le fuseau.
const formaterDate = (valeur?: string) => {
  const morceaux = String(valeur || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return morceaux ? `${morceaux[3]}/${morceaux[2]}/${morceaux[1]}` : 'Non spécifiée';
};

const normaliser = (valeur: unknown) =>
  String(valeur ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

const nomMembre = (membre: IMembre) => `${membre.nomMembre || ''} ${membre.prenomMembre || ''}`.trim();

type DocumentProps = {
  identity?: any;
  lignes: Versement[];
  sousTitre: string;
  total: number;
};

const DocumentCotisations = forwardRef<HTMLDivElement, DocumentProps>(
  ({ identity, lignes, sousTitre, total }, ref) => (
    <div ref={ref}>
      <PrintDocumentLayout identity={identity} title="Autres cotisations">
        <Typography variant="body2" sx={{ mb: 1.5, color: '#475569' }}>
          {sousTitre}
        </Typography>
        {lignes.length === 0 ? (
          <PrintEmptyState title="Aucune cotisation" message="Aucune cotisation n'est enregistrée pour ce choix." />
        ) : (
          <PrintTable minWidth={620}>
            <PrintTableHead>
              <PrintTableRow>
                <PrintTableCell align="center">N°</PrintTableCell>
                <PrintTableCell>Cotisation</PrintTableCell>
                <PrintTableCell>Membre</PrintTableCell>
                <PrintTableCell>Date</PrintTableCell>
                <PrintTableCell align="right">Montant</PrintTableCell>
              </PrintTableRow>
            </PrintTableHead>
            <PrintTableBody>
              {lignes.map((ligne, index) => (
                <PrintTableRow key={ligne.idCotisation}>
                  <PrintTableCell align="center">{index + 1}</PrintTableCell>
                  <PrintTableCell>{ligne.nomCotisation}</PrintTableCell>
                  <PrintTableCell>{ligne.nomMembreVersement}</PrintTableCell>
                  <PrintTableCell>{formaterDate(ligne.dateVersement)}</PrintTableCell>
                  <PrintTableCell align="right">{formaterMontant(ligne.montantVersement)}</PrintTableCell>
                </PrintTableRow>
              ))}
              <PrintTableRow>
                <PrintTableCell colSpan={4}>
                  <Typography fontWeight={800}>Montant total</Typography>
                </PrintTableCell>
                <PrintTableCell align="right">
                  <Typography fontWeight={800}>{formaterMontant(total)}</Typography>
                </PrintTableCell>
              </PrintTableRow>
            </PrintTableBody>
          </PrintTable>
        )}
      </PrintDocumentLayout>
    </div>
  )
);

export function AutresCotisations({
  canManage,
  demandeAjout,
  identity,
  idUtilisateur,
  membres,
  onChange,
  showNotification,
}: AutresCotisationsProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const imprimable = useRef<HTMLDivElement>(null);

  const [versements, setVersements] = useState<Versement[]>([]);
  const [recherche, setRecherche] = useState('');
  const [periode, setPeriode] = useState<PeriodMode>('all');
  const [debut, setDebut] = useState('');
  const [fin, setFin] = useState('');
  const [page, setPage] = useState(0);
  const [parPage, setParPage] = useState(10);
  const [enCours, setEnCours] = useState(false);
  const [formulaire, setFormulaire] = useState<any | null>(null);
  const [aSupprimer, setASupprimer] = useState<Versement | null>(null);

  const charger = useCallback(async () => {
    if (!idUtilisateur) return;

    try {
      const reponse = await apiClient.getAutresCotisations(idUtilisateur);
      setVersements(Array.isArray(reponse?.data) ? reponse.data : []);
    } catch (error) {
      showNotification(getApiErrorMessage(error, 'Chargement des cotisations impossible.'), 'error');
    }
  }, [idUtilisateur, showNotification]);

  useEffect(() => {
    charger();
  }, [charger]);

  const ouvrirFormulaire = useCallback((versement?: Versement) => {
    setFormulaire(
      versement
        ? { ...versement }
        : {
            nomCotisation: '',
            idMembre: '',
            montantVersement: '',
            dateVersement: aujourdhui(),
            observationVersement: '',
          }
    );
  }, []);

  // Le clic sur la carte passe par ici : il ouvre seulement la boîte de saisie.
  useEffect(() => {
    if (demandeAjout) ouvrirFormulaire();
  }, [demandeAjout, ouvrirFormulaire]);

  // Le nom reste libre. Les noms déjà utilisés sont seulement proposés, pour que
  // « Caisse de Noël » ne devienne pas « caisse noel » au versement suivant.
  const nomsConnus = useMemo(
    () => [...new Set(versements.map((item) => item.nomCotisation))].sort((a, b) => a.localeCompare(b)),
    [versements]
  );

  const plage = useMemo(
    () => resolvePeriodRange(periode, { customStart: debut, customEnd: fin }, new Date()),
    [periode, debut, fin]
  );
  const libellePeriode = useMemo(() => formatPeriodLabel(periode, plage), [periode, plage]);

  const lignes = useMemo(() => {
    const termes = normaliser(recherche).split(/\s+/).filter(Boolean);

    return versements.filter((item) => {
      if (!isDateWithinRange(item.dateVersement, plage)) return false;
      const contenu = normaliser(`${item.nomCotisation} ${item.nomMembreVersement} ${item.observationVersement}`);
      return termes.every((terme) => contenu.includes(terme));
    });
  }, [versements, plage, recherche]);

  const total = useMemo(
    () => lignes.reduce((somme, item) => somme + Number(item.montantVersement || 0), 0),
    [lignes]
  );
  const donateurs = useMemo(
    () => new Set(lignes.map((item) => item.idMembre || item.nomMembreVersement)).size,
    [lignes]
  );

  useEffect(() => {
    setPage(0);
  }, [recherche, periode, debut, fin]);

  const sousTitre = [
    `Période : ${libellePeriode}`,
    recherche.trim() ? `Recherche : ${recherche.trim()}` : '',
    `${donateurs} membre(s), ${lignes.length} versement(s)`,
  ]
    .filter(Boolean)
    .join(' — ');

  const exporterExcel = () => {
    const feuille = XLSX.utils.json_to_sheet(
      [
        ...lignes.map((ligne) => ({
          Cotisation: ligne.nomCotisation,
          Membre: ligne.nomMembreVersement,
          Date: formaterDate(ligne.dateVersement),
          'Montant (F CFA)': Number(ligne.montantVersement || 0) as number | string,
          Observation: ligne.observationVersement || '',
        })),
        { Cotisation: 'Montant total', Membre: '', Date: '', 'Montant (F CFA)': total, Observation: '' },
      ]
    );
    feuille['!cols'] = [{ wch: 36 }, { wch: 34 }, { wch: 12 }, { wch: 16 }, { wch: 34 }];

    const classeur = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(classeur, feuille, 'Autres cotisations');
    XLSX.writeFile(classeur, `autres-cotisations-${aujourdhui()}.xlsx`);
  };

  const enregistrer = async () => {
    if (!formulaire) return;

    try {
      setEnCours(true);
      const donnees = {
        ...formulaire,
        idMembre: Number(formulaire.idMembre),
        montantVersement: Number(formulaire.montantVersement),
        idUtilisateur,
      };

      if (formulaire.idCotisation) await apiClient.updateAutreCotisation(donnees);
      else await apiClient.createAutreCotisation(donnees);

      setFormulaire(null);
      await charger();
      onChange();
      showNotification('Cotisation enregistrée.', 'success');
    } catch (error) {
      showNotification(getApiErrorMessage(error, 'Enregistrement impossible.'), 'error');
    } finally {
      setEnCours(false);
    }
  };

  const confirmerSuppression = async () => {
    if (!aSupprimer) return;

    try {
      await apiClient.deleteAutreCotisation({ idCotisation: aSupprimer.idCotisation, idUtilisateur });
      await charger();
      onChange();
      showNotification('Suppression effectuée.', 'success');
    } catch (error) {
      showNotification(getApiErrorMessage(error, 'Suppression impossible.'), 'error');
    } finally {
      setASupprimer(null);
    }
  };

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
        <TextField
          value={recherche}
          onChange={(event) => setRecherche(event.target.value)}
          placeholder="Rechercher une cotisation, un membre..."
          InputProps={{ startAdornment: <SearchRoundedIcon sx={{ color: 'text.disabled', mr: 1 }} /> }}
          sx={{ flexGrow: 1 }}
        />
        <SelectRecherche
          label="Période"
          value={periode}
          onChange={(event) => setPeriode(event.target.value as PeriodMode)}
          InputProps={{ startAdornment: <EventNoteRoundedIcon sx={{ color: 'text.disabled', mr: 1 }} fontSize="small" /> }}
          sx={{ minWidth: { xs: 1, md: 220 } }}
        >
          {PERIODES.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </SelectRecherche>
        {periode === 'custom' && (
          <>
            <TextField
              type="date"
              label="Du"
              value={debut}
              onChange={(event) => setDebut(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="date"
              label="Au"
              value={fin}
              onChange={(event) => setFin(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </>
        )}
        {/* Comme les autres états : l'export et l'impression se font depuis le navigateur. */}
        {!isDesktopAppRuntime() && (
          <>
            <Button
              variant="outlined"
              startIcon={<FileDownloadRoundedIcon />}
              disabled={lignes.length === 0}
              onClick={exporterExcel}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Excel
            </Button>
            <ReactToPrint
              trigger={() => (
                <Button variant="contained" color="inherit" startIcon={<PrintRoundedIcon />} sx={{ whiteSpace: 'nowrap' }}>
                  Imprimer
                </Button>
              )}
              content={() => imprimable.current}
              pageStyle={PRINT_LANDSCAPE_PAGE_STYLE}
            />
          </>
        )}
      </Stack>

      {lignes.length === 0 ? (
        <Card variant="outlined" sx={{ p: 5, borderStyle: 'dashed', textAlign: 'center', borderRadius: 3 }}>
          <VolunteerActivismRoundedIcon sx={{ fontSize: 44, color: 'text.disabled', mb: 1 }} />
          <Typography variant="h6">
            {versements.length ? 'Aucune cotisation pour ce choix.' : 'Aucune cotisation pour le moment.'}
          </Typography>
        </Card>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow>
                <TableCell>Cotisation</TableCell>
                <TableCell>Membre</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Montant</TableCell>
                <TableCell>Observation</TableCell>
                {canManage && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {lignes.slice(page * parPage, page * parPage + parPage).map((ligne) => (
                <TableRow hover key={ligne.idCotisation}>
                  <TableCell sx={{ fontWeight: 700 }}>{ligne.nomCotisation}</TableCell>
                  <TableCell>{ligne.nomMembreVersement}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{formaterDate(ligne.dateVersement)}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formaterMontant(ligne.montantVersement)}</TableCell>
                  <TableCell>{ligne.observationVersement || '--'}</TableCell>
                  {canManage && (
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Tooltip title="Modifier">
                        <IconButton aria-label="Modifier cette cotisation" size="small" onClick={() => ouvrirFormulaire(ligne)}>
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          aria-label="Supprimer cette cotisation"
                          size="small"
                          color="error"
                          onClick={() => setASupprimer(ligne)}
                        >
                          <DeleteRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.95rem' }}>
                  Montant total ({donateurs} membre(s), {lignes.length} versement(s))
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                  {formaterMontant(total)}
                </TableCell>
                <TableCell colSpan={canManage ? 2 : 1} />
              </TableRow>
            </TableFooter>
          </Table>

          <TablePagination
            component="div"
            page={page}
            count={lignes.length}
            rowsPerPage={parPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            onPageChange={(_, nouvelle) => setPage(nouvelle)}
            onRowsPerPageChange={(event) => {
              setParPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Lignes par page :"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
          />
        </Box>
      )}

      <Dialog open={Boolean(formulaire)} onClose={() => setFormulaire(null)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle>Autres cotisations</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <Autocomplete
              freeSolo
              options={nomsConnus}
              inputValue={formulaire?.nomCotisation || ''}
              onInputChange={(_, valeur) => setFormulaire((prev: any) => ({ ...prev, nomCotisation: valeur }))}
              renderInput={(params) => <TextField {...params} required label="Cotisation" />}
            />
            <SelectRecherche
              fullWidth
              required
              label="Membre qui a donné"
              value={formulaire?.idMembre ? String(formulaire.idMembre) : ''}
              onChange={(event) => setFormulaire((prev: any) => ({ ...prev, idMembre: event.target.value }))}
            >
              {membres.map((membre) => (
                <MenuItem key={membre.idMembre} value={String(membre.idMembre)}>
                  {nomMembre(membre)}
                </MenuItem>
              ))}
            </SelectRecherche>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                required
                type="number"
                label="Montant (F CFA)"
                inputProps={{ min: 1, step: 1 }}
                value={formulaire?.montantVersement ?? ''}
                onChange={(event) => setFormulaire((prev: any) => ({ ...prev, montantVersement: event.target.value }))}
              />
              <TextField
                fullWidth
                required
                type="date"
                label="Date du versement"
                InputLabelProps={{ shrink: true }}
                value={formulaire?.dateVersement || ''}
                onChange={(event) => setFormulaire((prev: any) => ({ ...prev, dateVersement: event.target.value }))}
              />
            </Stack>
            <TextField
              fullWidth
              label="Observation"
              helperText="Optionnelle"
              value={formulaire?.observationVersement || ''}
              onChange={(event) => setFormulaire((prev: any) => ({ ...prev, observationVersement: event.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setFormulaire(null)}>Annuler</Button>
          <Button variant="contained" disabled={enCours} onClick={enregistrer}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(aSupprimer)}
        title="Suppression de la cotisation"
        message={
          aSupprimer
            ? `Voulez-vous vraiment supprimer : "${aSupprimer.nomCotisation}, ${aSupprimer.nomMembreVersement}, ${formaterMontant(aSupprimer.montantVersement)}" ?`
            : ''
        }
        onClose={() => setASupprimer(null)}
        onConfirm={confirmerSuppression}
      />

      <div style={{ display: 'none' }}>
        <DocumentCotisations ref={imprimable} identity={identity} lignes={lignes} sousTitre={sousTitre} total={total} />
      </div>
    </Stack>
  );
}
