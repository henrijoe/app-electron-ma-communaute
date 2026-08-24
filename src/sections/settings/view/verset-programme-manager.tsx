// ============================================================================
// verset-programme-manager.tsx
// Ecran de gestion du calendrier de versets programmes (Parametres > Verset
// du jour > mode "Programme sur plusieurs mois"). Affiche la liste des
// versets deja programmes, groupes par mois, et permet d'en ajouter, modifier
// ou retirer via une boite de dialogue.
// ============================================================================

import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import AddRounded from '@mui/icons-material/AddRounded';
import TodayRounded from '@mui/icons-material/TodayRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import EventNoteRounded from '@mui/icons-material/EventNoteRounded';

import { Scrollbar } from 'src/components/scrollbar';
import ConfirmDialog from 'src/components/alert/confirmDialog';
import { formatIsoDate, type ScheduledVerse } from 'src/data/daily-verses';
import { apiClient, getApiErrorMessage } from 'src/utils/apiClient';
import { useNotificationSnackbar } from 'src/components/alert/notificationSnackbar';

type VersetProgrammeManagerProps = {
  idUtilisateur: number;
};

type VerseFormState = {
  idVersetProgramme: number | null;
  dateAffichage: string;
  reference: string;
  texte: string;
};

const emptyForm: VerseFormState = {
  idVersetProgramme: null,
  dateAffichage: '',
  reference: '',
  texte: '',
};

// Regroupe les versets par mois pour que la liste reste lisible meme
// quand elle couvre 6 mois de programmation.
const groupByMonth = (verses: ScheduledVerse[]) => {
  const groups = new Map<string, ScheduledVerse[]>();

  verses.forEach((verse) => {
    const monthLabel = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(
      new Date(`${verse.dateAffichage}T00:00:00`)
    );
    const capitalized = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
    const bucket = groups.get(capitalized) || [];
    bucket.push(verse);
    groups.set(capitalized, bucket);
  });

  return Array.from(groups.entries());
};

const formatShortDate = (isoDate: string) =>
  new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' }).format(
    new Date(`${isoDate}T00:00:00`)
  );

export function VersetProgrammeManager({ idUtilisateur }: VersetProgrammeManagerProps) {
  const [verses, setVerses] = useState<ScheduledVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<VerseFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ScheduledVerse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { showNotification, NotificationComponent } = useNotificationSnackbar();

  const fetchVerses = useCallback(async () => {
    if (!idUtilisateur) return;

    try {
      setLoading(true);
      const response = await apiClient.getVersetsProgramme(idUtilisateur);
      setVerses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      showNotification(getApiErrorMessage(error, 'Impossible de charger les versets programmés.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [idUtilisateur, showNotification]);

  useEffect(() => {
    fetchVerses();
  }, [fetchVerses]);

  const groupedVerses = useMemo(() => groupByMonth(verses), [verses]);
  const todayIso = useMemo(() => formatIsoDate(new Date()), []);

  const openAddDialog = () => {
    // On propose par defaut le lendemain du dernier verset programme, pour
    // enchainer facilement plusieurs jours d'affilee sans ressaisir la date.
    const lastDate = verses.length ? verses[verses.length - 1].dateAffichage : null;
    const base = lastDate ? new Date(`${lastDate}T00:00:00`) : new Date();
    if (lastDate) {
      base.setDate(base.getDate() + 1);
    }

    setForm({ ...emptyForm, dateAffichage: formatIsoDate(base) });
    setDialogOpen(true);
  };

  const openEditDialog = (verse: ScheduledVerse) => {
    setForm({
      idVersetProgramme: verse.idVersetProgramme,
      dateAffichage: verse.dateAffichage,
      reference: verse.reference || '',
      texte: verse.texte,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.dateAffichage) {
      showNotification('La date est requise', 'warning');
      return;
    }
    if (!form.texte.trim()) {
      showNotification('Le texte du verset est requis', 'warning');
      return;
    }

    try {
      setSaving(true);

      if (form.idVersetProgramme) {
        await apiClient.updateVersetProgramme({
          idVersetProgramme: form.idVersetProgramme,
          idUtilisateur,
          dateAffichage: form.dateAffichage,
          reference: form.reference.trim(),
          texte: form.texte.trim(),
        });
        showNotification('Verset modifié', 'success');
      } else {
        await apiClient.createVersetProgramme({
          idUtilisateur,
          dateAffichage: form.dateAffichage,
          reference: form.reference.trim(),
          texte: form.texte.trim(),
        });
        showNotification('Verset programmé', 'success');
      }

      closeDialog();
      await fetchVerses();
    } catch (error) {
      showNotification(getApiErrorMessage(error, "Impossible d'enregistrer ce verset."), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await apiClient.deleteVersetProgramme(deleteTarget.idVersetProgramme, idUtilisateur);
      showNotification('Verset retiré du programme', 'success');
      setDeleteTarget(null);
      await fetchVerses();
    } catch (error) {
      showNotification(getApiErrorMessage(error, 'Impossible de retirer ce verset.'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {verses.length > 0
            ? `${verses.length} verset(s) programmé(s), du ${formatShortDate(verses[0].dateAffichage)} au ${formatShortDate(verses[verses.length - 1].dateAffichage)}.`
            : 'Aucun verset programmé pour le moment.'}
        </Typography>
        <Button variant="contained" startIcon={<AddRounded />} onClick={openAddDialog} sx={{ flexShrink: 0 }}>
          Programmer un verset
        </Button>
      </Stack>

      {loading ? (
        <Stack alignItems="center" py={3}>
          <CircularProgress size={28} />
        </Stack>
      ) : verses.length === 0 ? (
        <Alert severity="info" icon={<EventNoteRounded fontSize="inherit" />}>
          Programmez ici les versets qui s&apos;afficheront automatiquement sur le tableau de bord,
          jour après jour. Vous pouvez planifier 1, 2 ou même 6 mois à l&apos;avance : ajoutez un
          verset pour chaque date de votre choix.
        </Alert>
      ) : (
        <Scrollbar sx={{ maxHeight: 420 }}>
          <Stack spacing={2.5} sx={{ pr: 1 }}>
            {groupedVerses.map(([month, monthVerses]) => (
              <Box key={month}>
                <Typography variant="overline" color="text.secondary">
                  {month}
                </Typography>
                <Stack spacing={1} sx={{ mt: 0.5 }}>
                  {monthVerses.map((verse) => {
                    const isToday = verse.dateAffichage === todayIso;

                    return (
                      <Card
                        key={verse.idVersetProgramme}
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          borderRadius: 1.5,
                          boxShadow: 'none',
                          borderColor: isToday ? 'primary.main' : 'divider',
                          bgcolor: isToday ? 'primary.lighter' : 'transparent',
                        }}
                      >
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ xs: 'stretch', sm: 'center' }}>
                          <Chip
                            size="small"
                            icon={<TodayRounded fontSize="small" />}
                            label={formatShortDate(verse.dateAffichage)}
                            color={isToday ? 'primary' : 'default'}
                            variant={isToday ? 'filled' : 'outlined'}
                            sx={{ flexShrink: 0, alignSelf: { xs: 'flex-start', sm: 'center' } }}
                          />
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }} noWrap>
                              {verse.texte}
                            </Typography>
                            {verse.reference && (
                              <Typography variant="caption" color="primary.main">
                                {verse.reference}
                              </Typography>
                            )}
                          </Box>
                          <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                            <Tooltip title="Modifier">
                              <IconButton size="small" onClick={() => openEditDialog(verse)}>
                                <EditRounded fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Retirer">
                              <IconButton size="small" color="error" onClick={() => setDeleteTarget(verse)}>
                                <DeleteRounded fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>
                      </Card>
                    );
                  })}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Scrollbar>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{form.idVersetProgramme ? 'Modifier le verset' : 'Programmer un verset'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField
              fullWidth
              type="date"
              label="Date d'affichage"
              InputLabelProps={{ shrink: true }}
              value={form.dateAffichage}
              onChange={(event) => setForm((prev) => ({ ...prev, dateAffichage: event.target.value }))}
            />
            <TextField
              fullWidth
              label="Référence biblique"
              placeholder="Ex: Jean 3:16"
              value={form.reference}
              onChange={(event) => setForm((prev) => ({ ...prev, reference: event.target.value }))}
            />
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Texte du verset"
              placeholder="Ex: Car Dieu a tant aimé le monde..."
              value={form.texte}
              onChange={(event) => setForm((prev) => ({ ...prev, texte: event.target.value }))}
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
        title="Retirer ce verset"
        message={`Voulez-vous vraiment retirer le verset programmé pour le ${deleteTarget ? formatShortDate(deleteTarget.dateAffichage) : ''} ?`}
        confirmText="Retirer"
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <NotificationComponent />
    </Stack>
  );
}
