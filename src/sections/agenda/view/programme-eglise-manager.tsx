// ============================================================================
// programme-eglise-manager.tsx
// Onglet "Programme église" de l'Agenda : planifie qui dirige, fait la sainte
// cène, prêche, s'occupe des offrandes/annonces à chaque culte, sur plusieurs
// semaines — l'équivalent numérique du tableau papier utilisé par certaines
// assemblées (direction/prédication/annonces par date, regroupé par mois).
// ============================================================================

import ReactToPrint from 'react-to-print';
import { useRef, useMemo, useState, useEffect, forwardRef, useCallback } from 'react';

import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import PrintRounded from '@mui/icons-material/Print';
import TableContainer from '@mui/material/TableContainer';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddRounded from '@mui/icons-material/AddRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CircularProgress from '@mui/material/CircularProgress';
import EventNoteRounded from '@mui/icons-material/EventNoteRounded';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { Scrollbar } from 'src/components/scrollbar';
import ConfirmDialog from 'src/components/alert/confirmDialog';
import { apiClient, getApiErrorMessage } from 'src/utils/apiClient';
import {
  exportDesktopPdf,
  canUseDesktopPrint,
  openDesktopPrintPreview,
} from 'src/utils/desktop-print';
import { PRINT_PORTRAIT_PAGE_STYLE } from 'src/components/print/print-document';
import { useNotificationSnackbar } from 'src/components/alert/notificationSnackbar';

import { ProgrammePrintDocument } from '../etats/programme-print-document';

export type ProgrammeEglise = {
  idProgramme: number;
  idUtilisateur: number;
  dateProgramme: string;
  direction: string;
  saintCene: string;
  predication: string;
  offrandes: string;
  annonces: string;
  thematique: string;
};

type ProgrammeFormState = {
  idProgramme: number | null;
  dateProgramme: string;
  direction: string;
  saintCene: string;
  predication: string;
  offrandes: string;
  annonces: string;
  thematique: string;
};

const emptyForm: ProgrammeFormState = {
  idProgramme: null,
  dateProgramme: '',
  direction: '',
  saintCene: '',
  predication: '',
  offrandes: '',
  annonces: '',
  thematique: '',
};

// Regroupe les lignes par mois pour retrouver la mise en page du document papier
// (une section "FEVRIER 2026", une section "MARS 2026", etc.).
const groupByMonth = (programmes: ProgrammeEglise[]) => {
  const groups = new Map<string, ProgrammeEglise[]>();

  programmes.forEach((programme) => {
    const monthLabel = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(
      new Date(`${programme.dateProgramme}T00:00:00`)
    );
    const capitalized = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
    const bucket = groups.get(capitalized) || [];
    bucket.push(programme);
    groups.set(capitalized, bucket);
  });

  return Array.from(groups.entries());
};

const formatJour = (isoDate: string) =>
  new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(new Date(`${isoDate}T00:00:00`));

const formatDate = (isoDate: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(new Date(`${isoDate}T00:00:00`));

type ProgrammeEgliseManagerProps = {
  idUtilisateur: number;
};

const ComponentToPrint = forwardRef<
  HTMLDivElement,
  { programmes: ProgrammeEglise[]; horaires?: string; themeAnnee?: string }
>(({ programmes, horaires, themeAnnee }, ref) => (
  <div ref={ref}>
    <ProgrammePrintDocument programmes={programmes} horaires={horaires} themeAnnee={themeAnnee} />
  </div>
));

export function ProgrammeEgliseManager({ idUtilisateur }: ProgrammeEgliseManagerProps) {
  const [programmes, setProgrammes] = useState<ProgrammeEglise[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<ProgrammeFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProgrammeEglise | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { showNotification, NotificationComponent } = useNotificationSnackbar();

  const printRef = useRef<HTMLDivElement>(null);
  const [printMenuAnchor, setPrintMenuAnchor] = useState<null | HTMLElement>(null);
  const isDesktopPrint = canUseDesktopPrint();

  // "Horaires" et "Thème de l'année" ne sont pas une donnee metier partagee entre
  // postes (juste un rappel affiche en tete du document imprime) : on les garde
  // en local plutot que d'alourdir le schema pour deux champs de texte libre.
  const horairesKey = `programme-eglise-horaires-${idUtilisateur}`;
  const themeKey = `programme-eglise-theme-${idUtilisateur}`;
  const [horaires, setHoraires] = useState('');
  const [themeAnnee, setThemeAnnee] = useState('');

  useEffect(() => {
    try {
      setHoraires(window.localStorage.getItem(horairesKey) || '');
      setThemeAnnee(window.localStorage.getItem(themeKey) || '');
    } catch {
      // localStorage indisponible (navigation privee, etc.) : on garde les champs vides.
    }
  }, [horairesKey, themeKey]);

  const handleHorairesChange = (value: string) => {
    setHoraires(value);
    try {
      window.localStorage.setItem(horairesKey, value);
    } catch {
      // Pas grave si la sauvegarde locale echoue : c'est juste un rappel d'affichage.
    }
  };

  const handleThemeChange = (value: string) => {
    setThemeAnnee(value);
    try {
      window.localStorage.setItem(themeKey, value);
    } catch {
      // idem
    }
  };

  const fetchProgrammes = useCallback(async () => {
    if (!idUtilisateur) return;

    try {
      setLoading(true);
      const response = await apiClient.getProgrammesEglise(idUtilisateur);
      setProgrammes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      showNotification(getApiErrorMessage(error, 'Impossible de charger le programme église.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [idUtilisateur, showNotification]);

  useEffect(() => {
    fetchProgrammes();
  }, [fetchProgrammes]);

  const groupedProgrammes = useMemo(() => groupByMonth(programmes), [programmes]);

  const openAddDialog = () => {
    // On propose par defaut le dimanche suivant la derniere ligne programmee,
    // pour enchainer facilement plusieurs cultes d'affilee.
    const lastDate = programmes.length ? programmes[programmes.length - 1].dateProgramme : null;
    const base = lastDate ? new Date(`${lastDate}T00:00:00`) : new Date();
    if (lastDate) {
      base.setDate(base.getDate() + 7);
    }

    setForm({ ...emptyForm, dateProgramme: base.toISOString().slice(0, 10) });
    setDialogOpen(true);
  };

  const openEditDialog = (programme: ProgrammeEglise) => {
    setForm({
      idProgramme: programme.idProgramme,
      dateProgramme: programme.dateProgramme,
      direction: programme.direction || '',
      saintCene: programme.saintCene || '',
      predication: programme.predication || '',
      offrandes: programme.offrandes || '',
      annonces: programme.annonces || '',
      thematique: programme.thematique || '',
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.dateProgramme) {
      showNotification('La date est requise', 'warning');
      return;
    }
    if (!form.direction.trim()) {
      showNotification('La direction est requise', 'warning');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        idUtilisateur,
        dateProgramme: form.dateProgramme,
        direction: form.direction.trim(),
        saintCene: form.saintCene.trim(),
        predication: form.predication.trim(),
        offrandes: form.offrandes.trim(),
        annonces: form.annonces.trim(),
        thematique: form.thematique.trim(),
      };

      if (form.idProgramme) {
        await apiClient.updateProgrammeEglise({ ...payload, idProgramme: form.idProgramme });
        showNotification('Programme modifié', 'success');
      } else {
        await apiClient.createProgrammeEglise(payload);
        showNotification('Programme ajouté', 'success');
      }

      closeDialog();
      await fetchProgrammes();
    } catch (error) {
      showNotification(getApiErrorMessage(error, "Impossible d'enregistrer ce programme."), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await apiClient.deleteProgrammeEglise(deleteTarget.idProgramme, idUtilisateur);
      showNotification('Programme retiré', 'success');
      setDeleteTarget(null);
      await fetchProgrammes();
    } catch (error) {
      showNotification(getApiErrorMessage(error, 'Impossible de retirer ce programme.'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          fullWidth
          size="small"
          label="Horaires"
          placeholder="Ex : Mardi & Jeudi 18h30-20h30, Dimanche 07h00-10h30"
          value={horaires}
          onChange={(event) => handleHorairesChange(event.target.value)}
        />
        <TextField
          fullWidth
          size="small"
          label="Thème de l'année"
          placeholder="Ex : Par le Saint-Esprit, marchons dans les pas de Jésus-Christ"
          value={themeAnnee}
          onChange={(event) => handleThemeChange(event.target.value)}
        />
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {programmes.length > 0
            ? `${programmes.length} culte(s) programmé(s).`
            : 'Aucun culte programmé pour le moment.'}
        </Typography>
        <Stack direction="row" spacing={1.5} sx={{ flexShrink: 0 }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<PrintRounded fontSize="small" />}
            endIcon={<KeyboardArrowDownIcon fontSize="small" />}
            disabled={programmes.length === 0}
            onClick={(event) => setPrintMenuAnchor(event.currentTarget)}
          >
            Imprimer
          </Button>
          <Button variant="contained" startIcon={<AddRounded />} onClick={openAddDialog}>
            Ajouter un programme
          </Button>
        </Stack>
      </Stack>

      <Menu anchorEl={printMenuAnchor} open={Boolean(printMenuAnchor)} onClose={() => setPrintMenuAnchor(null)}>
        {isDesktopPrint ? (
          [
            <MenuItem
              key="preview"
              onClick={async () => {
                setPrintMenuAnchor(null);
                await openDesktopPrintPreview(printRef.current, {
                  title: 'Aperçu - Programme de service',
                  fileName: 'programme-eglise',
                  orientation: 'portrait',
                });
              }}
            >
              <VisibilityIcon fontSize="small" sx={{ mr: 1 }} /> Aperçu
            </MenuItem>,
            <MenuItem
              key="pdf"
              onClick={async () => {
                setPrintMenuAnchor(null);
                await exportDesktopPdf(printRef.current, {
                  title: 'Programme de service',
                  fileName: 'programme-eglise',
                  orientation: 'portrait',
                });
              }}
            >
              <PictureAsPdfIcon fontSize="small" sx={{ mr: 1 }} /> Exporter en PDF
            </MenuItem>,
          ]
        ) : (
          <MenuItem onClick={() => setPrintMenuAnchor(null)}>
            <ReactToPrint
              trigger={() => <div>Imprimer</div>}
              content={() => printRef.current}
              pageStyle={PRINT_PORTRAIT_PAGE_STYLE}
            />
          </MenuItem>
        )}
      </Menu>

      <div style={{ display: 'none' }}>
        <ComponentToPrint ref={printRef} programmes={programmes} horaires={horaires} themeAnnee={themeAnnee} />
      </div>

      {loading ? (
        <Stack alignItems="center" py={3}>
          <CircularProgress size={28} />
        </Stack>
      ) : programmes.length === 0 ? (
        <Alert severity="info" icon={<EventNoteRounded fontSize="inherit" />}>
          Programmez ici qui dirige, prêche, fait la sainte cène ou les annonces à chaque
          culte, pour plusieurs semaines à l&apos;avance — comme un planning de service.
        </Alert>
      ) : (
        <Scrollbar sx={{ maxHeight: 520 }}>
          <Stack spacing={2.5} sx={{ pr: 1 }}>
            {groupedProgrammes.map(([month, monthProgrammes]) => (
              <Box key={month}>
                <Typography variant="overline" color="text.secondary">
                  {month}
                </Typography>
                <TableContainer sx={{ mt: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
                  <Table size="small" sx={{ minWidth: 780 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Jour</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Direction</TableCell>
                        <TableCell>Sainte Cène</TableCell>
                        <TableCell>Prédication</TableCell>
                        <TableCell>Offrandes</TableCell>
                        <TableCell>Annonces</TableCell>
                        <TableCell>Thématiques / Observations</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {monthProgrammes.map((programme) => (
                        <TableRow key={programme.idProgramme} hover>
                          <TableCell sx={{ textTransform: 'capitalize' }}>{formatJour(programme.dateProgramme)}</TableCell>
                          <TableCell>{formatDate(programme.dateProgramme)}</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>{programme.direction || '-'}</TableCell>
                          <TableCell>{programme.saintCene || '-'}</TableCell>
                          <TableCell>{programme.predication || '-'}</TableCell>
                          <TableCell>{programme.offrandes || '-'}</TableCell>
                          <TableCell>{programme.annonces || '-'}</TableCell>
                          <TableCell>{programme.thematique || '-'}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Modifier">
                              <IconButton size="small" onClick={() => openEditDialog(programme)}>
                                <EditRounded fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Retirer">
                              <IconButton size="small" color="error" onClick={() => setDeleteTarget(programme)}>
                                <DeleteRounded fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}
          </Stack>
        </Scrollbar>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{form.idProgramme ? 'Modifier le programme' : 'Ajouter un programme'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField
              fullWidth
              type="date"
              label="Date du culte"
              required
              InputLabelProps={{ shrink: true }}
              value={form.dateProgramme}
              onChange={(event) => setForm((prev) => ({ ...prev, dateProgramme: event.target.value }))}
            />
            <TextField
              fullWidth
              label="Direction"
              required
              placeholder="Ex : Assi Nestor"
              value={form.direction}
              onChange={(event) => setForm((prev) => ({ ...prev, direction: event.target.value }))}
            />
            <TextField
              fullWidth
              label="Sainte Cène"
              placeholder="Ex : Ancien DIBI"
              value={form.saintCene}
              onChange={(event) => setForm((prev) => ({ ...prev, saintCene: event.target.value }))}
            />
            <TextField
              fullWidth
              label="Prédication"
              placeholder="Ex : Pasteur DAGO"
              value={form.predication}
              onChange={(event) => setForm((prev) => ({ ...prev, predication: event.target.value }))}
            />
            <TextField
              fullWidth
              label="Offrandes"
              value={form.offrandes}
              onChange={(event) => setForm((prev) => ({ ...prev, offrandes: event.target.value }))}
            />
            <TextField
              fullWidth
              label="Annonces"
              placeholder="Ex : Gervais"
              value={form.annonces}
              onChange={(event) => setForm((prev) => ({ ...prev, annonces: event.target.value }))}
            />
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Thématiques / Observations"
              placeholder="Ex : Offrande BN et Télé. Jeûne et prière."
              value={form.thematique}
              onChange={(event) => setForm((prev) => ({ ...prev, thematique: event.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="inherit" disabled={saving}>
            Annuler
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Retirer ce programme"
        message={`Voulez-vous vraiment retirer le programme du ${deleteTarget ? formatDate(deleteTarget.dateProgramme) : ''} ?`}
        confirmText="Retirer"
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <NotificationComponent />
    </Stack>
  );
}

export default ProgrammeEgliseManager;
