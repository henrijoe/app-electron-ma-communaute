import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AddRounded,
  CalendarMonthRounded,
  ChevronLeftRounded,
  ChevronRightRounded,
  DeleteRounded,
  EditRounded,
  PlaceRounded,
  ScheduleRounded,
  ViewAgendaRounded,
  ViewListRounded,
  ViewWeekRounded,
} from '@mui/icons-material';
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import ConfirmDialog from 'src/components/alert/confirmDialog';
import { useNotificationSnackbar } from 'src/components/alert/notificationSnackbar';
import { DashboardContent } from 'src/layouts/dashboard';
import { PrintEtatAgenda } from 'src/sections/agenda/etats';
import {
  removeAgenda,
  setListAgenda,
  setLoadingAgenda,
  type IAgendaEvent,
  upsertAgenda,
} from 'src/store/agendaSlice';
import { apiClient } from 'src/utils/apiClient';
import { canManageModule } from 'src/utils/access-control';

type AgendaViewMode = 'month' | 'week' | 'day' | 'list';
type ReminderLevel = 'today' | 'next-hour';

type ReminderEvent = {
  event: IAgendaEvent;
  level: ReminderLevel;
};

const weekdayLabels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const monthFormatter = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });
const longDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});
const shortDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
});
const shortDateWithYearFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const eventTypes = ['Culte', 'Rendez-vous', 'Mariage', 'Bapteme', 'Seminaire', 'Repetition', 'Visite', 'Autre'];
const eventStatus = ['Programme', 'Confirme', 'Reporte', 'Annule'];
const typeColorMap: Record<string, string> = {
  Culte: '#0ea5e9',
  'Rendez-vous': '#8b5cf6',
  Mariage: '#ec4899',
  Bapteme: '#10b981',
  Seminaire: '#f97316',
  Repetition: '#eab308',
  Visite: '#6366f1',
  Autre: '#64748b',
};
const colorOptions = [
  { label: 'Bleu ciel', value: '#0ea5e9' },
  { label: 'Violet', value: '#8b5cf6' },
  { label: 'Rose', value: '#ec4899' },
  { label: 'Vert', value: '#10b981' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Jaune', value: '#eab308' },
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Gris', value: '#64748b' },
  { label: 'Rouge', value: '#ef4444' },
  { label: 'Bleu fonce', value: '#2563eb' },
];
const primaryActionButtonSx = {
  minWidth: 'auto',
  px: 1.75,
  height: 42,
  borderRadius: 2,
  bgcolor: 'grey.900',
  color: 'common.white',
  '&:hover': {
    bgcolor: 'grey.800',
  },
};

const themedPanelSx = {
  bgcolor: 'background.paper',
  color: 'text.primary',
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: 'none',
};

const emptyAgendaEvent: IAgendaEvent = {
  titreAgenda: '',
  typeAgenda: 'Rendez-vous',
  dateAgenda: null,
  heureDebutAgenda: '',
  heureFinAgenda: '',
  lieuAgenda: '',
  descriptionAgenda: '',
  couleurAgenda: typeColorMap['Rendez-vous'],
  statutAgenda: 'Programme',
  idUtilisateur: null,
};

const buildMonthDays = (currentMonth: Date) => {
  const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const firstVisible = new Date(start);
  firstVisible.setDate(start.getDate() - start.getDay());

  const lastVisible = new Date(end);
  lastVisible.setDate(end.getDate() + (6 - end.getDay()));

  const days: Date[] = [];
  const cursor = new Date(firstVisible);

  while (cursor <= lastVisible) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
};

const toDateKey = (date: Date) => date.toISOString().slice(0, 10);

const formatDisplayDate = (value?: string | null): string => {
  if (!value) return '';

  const [datePart] = String(value).split('T');
  const parts = datePart.split('-');

  if (parts.length === 3) {
    const [year, month, day] = parts;

    if (year.length === 4 && month && day) {
      return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
    }
  }

  return String(value);
};

const buildWeekDays = (selectedDate: string) => {
  const base = new Date(selectedDate);
  const start = new Date(base);
  start.setDate(base.getDate() - base.getDay());

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
};

const isToday = (dateKey: string) => dateKey === toDateKey(new Date());

const isTomorrow = (dateKey: string) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return dateKey === toDateKey(tomorrow);
};

const getReminderLabel = (dateKey: string) => {
  if (isToday(dateKey)) return 'Aujourd\'hui';
  if (isTomorrow(dateKey)) return 'Demain';
  return '';
};

const getAgendaTypeColor = (typeAgenda?: string, couleurAgenda?: string) =>
  couleurAgenda || typeColorMap[typeAgenda || 'Autre'] || typeColorMap.Autre;

const buildEventDateTime = (event: IAgendaEvent) => {
  if (!event.dateAgenda) return null;

  const timeValue = event.heureDebutAgenda || '00:00';
  const [hours, minutes] = timeValue.split(':').map(Number);
  const date = new Date(`${event.dateAgenda}T00:00:00`);
  date.setHours(Number.isNaN(hours) ? 0 : hours, Number.isNaN(minutes) ? 0 : minutes, 0, 0);
  return date;
};

const sortAgendaItems = (items: IAgendaEvent[]) =>
  [...items].sort((a: IAgendaEvent, b: IAgendaEvent) => `${a.dateAgenda || ''} ${a.heureDebutAgenda || ''}`.localeCompare(`${b.dateAgenda || ''} ${b.heureDebutAgenda || ''}`));

const EventCard = ({ event, compact = false, canManage = true, onDelete, onEdit }: {
  canManage?: boolean;
  compact?: boolean;
  event: IAgendaEvent;
  onDelete: (event: IAgendaEvent) => void;
  onEdit: (event: IAgendaEvent) => void;
}) => {
  const reminderLabel = getReminderLabel(event.dateAgenda || '');
  const eventColor = getAgendaTypeColor(event.typeAgenda, event.couleurAgenda);

  return (
    <Card
      sx={{
        p: compact ? 1.5 : 2,
        borderRadius: 3,
        borderLeft: `4px solid ${eventColor}`,
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={1}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography variant="subtitle2">{event.titreAgenda}</Typography>
            {reminderLabel && <Chip size="small" color={reminderLabel === "Aujourd'hui" ? 'warning' : 'info'} label={reminderLabel} />}
            <Chip size="small" label={event.typeAgenda || 'Evenement'} sx={{ bgcolor: alpha(eventColor, 0.14), color: eventColor }} />
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
            <Chip size="small" icon={<ScheduleRounded />} label={`${event.heureDebutAgenda || '--:--'}${event.heureFinAgenda ? ` - ${event.heureFinAgenda}` : ''}`} />
            <Chip size="small" icon={<PlaceRounded />} label={event.lieuAgenda || 'Lieu non precise'} />
            <Chip size="small" label={event.statutAgenda || 'Programme'} />
          </Stack>
          {!compact && event.descriptionAgenda && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              {event.descriptionAgenda}
            </Typography>
          )}
        </Box>
        {canManage && (
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" onClick={() => onEdit(event)}>
              <EditRounded fontSize="small" />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => onDelete(event)}>
              <DeleteRounded fontSize="small" />
            </IconButton>
          </Stack>
        )}
      </Stack>
    </Card>
  );
};

export function AgendaView() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { listAgenda, loadingAgenda } = useSelector((state: any) => state.agenda);
  const appUserConnected = useSelector((state: any) => state.application?.userConnected);
  const authUtilisateurData = useSelector((state: any) => state.authentification?.utilisateurData);
  const currentUserId =
    Number(appUserConnected?.idUtilisateurParent || appUserConnected?.idUtilisateur)
    || Number(authUtilisateurData?.idUtilisateurParent || authUtilisateurData?.idUtilisateur)
    || null;
  const identity = appUserConnected || authUtilisateurData || {};
  const canManageAgenda = canManageModule(identity, 'agenda');
  const notifiedReminderKeys = useRef<Set<string>>(new Set());

  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<AgendaViewMode>('month');
  const [agendaDialogOpen, setAgendaDialogOpen] = useState(false);
  const [agendaForm, setAgendaForm] = useState<IAgendaEvent>(emptyAgendaEvent);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(toDateKey(new Date()));
  const [confirmDelete, setConfirmDelete] = useState<IAgendaEvent | null>(null);

  const { showNotification, NotificationComponent } = useNotificationSnackbar();
  const showNotificationRef = useRef(showNotification);

  useEffect(() => {
    showNotificationRef.current = showNotification;
  }, [showNotification]);

  useEffect(() => {
    if (isMobile && (viewMode === 'month' || viewMode === 'week')) {
      setViewMode('list');
    }
  }, [isMobile, viewMode]);

  const monthDays = useMemo(() => buildMonthDays(currentMonth), [currentMonth]);
  const weekDays = useMemo(() => buildWeekDays(selectedDate), [selectedDate]);
  const selectedMonthLabel = useMemo(() => monthFormatter.format(currentMonth), [currentMonth]);
  const selectedDateLabel = useMemo(() => longDateFormatter.format(new Date(selectedDate)), [selectedDate]);
  const currentWeekLabel = useMemo(() => {
    const firstDay = weekDays[0];
    const lastDay = weekDays[weekDays.length - 1];

    if (!firstDay || !lastDay) return selectedMonthLabel;

    return `${shortDateFormatter.format(firstDay)} - ${shortDateWithYearFormatter.format(lastDay)}`;
  }, [selectedMonthLabel, weekDays]);
  const currentPeriodLabel = useMemo(() => {
    if (viewMode === 'week') return currentWeekLabel;
    if (viewMode === 'day') return selectedDateLabel;
    return selectedMonthLabel;
  }, [currentWeekLabel, selectedDateLabel, selectedMonthLabel, viewMode]);

  const allEvents = useMemo(() => (Array.isArray(listAgenda) ? listAgenda : []), [listAgenda]);
  const monthEvents = useMemo(
    () => sortAgendaItems(allEvents.filter((event: IAgendaEvent) => {
      if (!event.dateAgenda) return false;
      const date = new Date(event.dateAgenda);
      return date.getFullYear() === currentMonth.getFullYear() && date.getMonth() === currentMonth.getMonth();
    })),
    [allEvents, currentMonth]
  );
  const weekEvents = useMemo(
    () => sortAgendaItems(allEvents.filter((event: IAgendaEvent) => weekDays.some((day) => toDateKey(day) === event.dateAgenda))),
    [allEvents, weekDays]
  );
  const eventsByDate = useMemo(
    () => allEvents.reduce((acc: Record<string, IAgendaEvent[]>, event: IAgendaEvent) => {
      const key = event.dateAgenda || '';
      if (!key) return acc;
      if (!acc[key]) acc[key] = [];
      acc[key].push(event);
      return acc;
    }, {}),
    [allEvents]
  );
  const selectedDateEvents = useMemo(() => sortAgendaItems(eventsByDate[selectedDate] || []), [eventsByDate, selectedDate]);
  const listViewEvents = useMemo(() => {
    if (viewMode === 'week') return weekEvents;
    if (viewMode === 'day') return selectedDateEvents;
    return monthEvents;
  }, [monthEvents, selectedDateEvents, viewMode, weekEvents]);
  const upcomingEvents = useMemo(() => sortAgendaItems(allEvents).filter((event: IAgendaEvent) => event.dateAgenda).slice(0, 6), [allEvents]);
  const reminderEvents = useMemo(() => {
    const now = new Date();

    return sortAgendaItems(allEvents).reduce((acc: ReminderEvent[], event: IAgendaEvent) => {
      const eventDate = buildEventDateTime(event);
      if (!eventDate) return acc;

      const diffMinutes = Math.round((eventDate.getTime() - now.getTime()) / (1000 * 60));
      if (diffMinutes >= 0 && diffMinutes <= 60) {
        acc.push({ event, level: 'next-hour' });
        return acc;
      }

      if (event.dateAgenda && isToday(event.dateAgenda)) {
        acc.push({ event, level: 'today' });
      }

      return acc;
    }, []);
  }, [allEvents]);

  const fetchAgenda = useCallback(async (notifyOnError = true) => {
    if (!currentUserId) return;

    try {
      dispatch(setLoadingAgenda(true));
      const response = await apiClient.getAgendaByUtilisateur(currentUserId);
      dispatch(setListAgenda(Array.isArray(response.data) ? response.data : []));
    } catch (error: any) {
      console.error('Erreur chargement agenda:', error);
      if (notifyOnError) {
        showNotificationRef.current(error.message || "Impossible de charger l'agenda", 'error');
      }
      dispatch(setListAgenda([]));
    } finally {
      dispatch(setLoadingAgenda(false));
    }
  }, [currentUserId, dispatch]);

  useEffect(() => {
    fetchAgenda(false);
  }, [fetchAgenda]);

  useEffect(() => {
    const nextReminder = reminderEvents.find(({ event, level }) => !notifiedReminderKeys.current.has(`${level}-${event.idAgenda || event.titreAgenda}-${event.dateAgenda}-${event.heureDebutAgenda}`));
    if (!nextReminder) return;

    const reminderKey = `${nextReminder.level}-${nextReminder.event.idAgenda || nextReminder.event.titreAgenda}-${nextReminder.event.dateAgenda}-${nextReminder.event.heureDebutAgenda}`;
    notifiedReminderKeys.current.add(reminderKey);

    const reminderMessage = nextReminder.level === 'next-hour'
      ? `${nextReminder.event.titreAgenda} commence dans moins d'une heure.`
      : `${nextReminder.event.titreAgenda} est programme aujourd'hui.`;

    showNotificationRef.current(reminderMessage, nextReminder.level === 'next-hour' ? 'warning' : 'info');

    const sendBrowserNotification = () => new window.Notification('Agenda - rappel', { body: reminderMessage });

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (window.Notification.permission === 'granted') {
        sendBrowserNotification();
      } else if (window.Notification.permission === 'default') {
        window.Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            sendBrowserNotification();
          }
        }).catch(() => undefined);
      }
    }
  }, [reminderEvents]);

  const openCreateDialog = (dateValue?: string) => {
    if (!canManageAgenda) return;

    setAgendaForm({
      ...emptyAgendaEvent,
      dateAgenda: dateValue || selectedDate,
      idUtilisateur: currentUserId,
    });
    setAgendaDialogOpen(true);
  };

  const openEditDialog = (item: IAgendaEvent) => {
    if (!canManageAgenda) return;

    setAgendaForm({ ...item });
    setAgendaDialogOpen(true);
  };

  const handleSaveAgenda = async () => {
    if (!canManageAgenda) return;

    if (!currentUserId) {
      showNotificationRef.current('Session indisponible. Reconnecte-toi.', 'warning');
      return;
    }

    if (!agendaForm.titreAgenda.trim() || !agendaForm.dateAgenda) {
      showNotificationRef.current('Le titre et la date sont requis.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...agendaForm,
        idUtilisateur: currentUserId,
        couleurAgenda: getAgendaTypeColor(agendaForm.typeAgenda, agendaForm.couleurAgenda),
      };
      const response = agendaForm.idAgenda ? await apiClient.updateAgenda(payload) : await apiClient.createAgenda(payload);

      if (response.status === 1) {
        dispatch(upsertAgenda(response.data));
        showNotificationRef.current(agendaForm.idAgenda ? 'Evenement mis a jour.' : 'Evenement programme avec succes.', 'success');
        setAgendaDialogOpen(false);
        await fetchAgenda();
      }
    } catch (error: any) {
      console.error('Erreur sauvegarde agenda:', error);
      showNotificationRef.current(error.message || "Impossible d'enregistrer cet evenement", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAgenda = async () => {
    if (!canManageAgenda) return;

    if (!confirmDelete?.idAgenda || !currentUserId) return;

    try {
      await apiClient.deleteAgenda(confirmDelete.idAgenda, currentUserId);
      dispatch(removeAgenda(confirmDelete.idAgenda));
      showNotificationRef.current('Evenement supprime.', 'success');
      await fetchAgenda();
    } catch (error: any) {
      console.error('Erreur suppression agenda:', error);
      showNotificationRef.current(error.message || "Impossible de supprimer cet evenement", 'error');
    } finally {
      setConfirmDelete(null);
    }
  };

  const navigateAgenda = (direction: 'previous' | 'next') => {
    const step = direction === 'next' ? 1 : -1;

    if (viewMode === 'day') {
      const nextDate = new Date(selectedDate);
      nextDate.setDate(nextDate.getDate() + step);
      setSelectedDate(toDateKey(nextDate));
      setCurrentMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
      return;
    }

    if (viewMode === 'week') {
      const nextDate = new Date(selectedDate);
      nextDate.setDate(nextDate.getDate() + (step * 7));
      setSelectedDate(toDateKey(nextDate));
      setCurrentMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
      return;
    }

    setCurrentMonth((previous) => new Date(previous.getFullYear(), previous.getMonth() + step, 1));
  };
  const renderMonthView = () => (
    <>
      <Grid container spacing={1}>
        {weekdayLabels.map((label) => (
          <Grid item xs key={label}>
            <Box sx={{ p: 0.75, textAlign: 'center', color: 'text.secondary', fontWeight: 700 }}>{label}</Box>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={1}>
        {monthDays.map((day) => {
          const dayKey = toDateKey(day);
          const dayEvents = sortAgendaItems(eventsByDate[dayKey] || []);
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          const isSelected = selectedDate === dayKey;
          const reminderLabel = getReminderLabel(dayKey);

          return (
            <Grid item xs key={dayKey}>
              <Card onClick={() => setSelectedDate(dayKey)} sx={{ minHeight: 94, borderRadius: 3, p: 1, cursor: 'pointer', bgcolor: isSelected ? alpha('#0ea5e9', 0.10) : 'background.paper', border: '1px solid', borderColor: isSelected ? alpha('#0ea5e9', 0.55) : 'divider', color: isCurrentMonth ? 'text.primary' : 'text.secondary', boxShadow: 'none' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">{day.getDate()}</Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {reminderLabel && <Chip size="small" color={reminderLabel === "Aujourd'hui" ? 'warning' : 'info'} label={reminderLabel} />}
                    {dayEvents.length > 0 && <Chip size="small" label={dayEvents.length} sx={{ bgcolor: alpha('#0f172a', 0.08), color: 'text.primary' }} />}
                  </Stack>
                </Stack>
                <Stack spacing={0.75}>
                  {dayEvents.slice(0, 2).map((event: IAgendaEvent) => {
                    const eventColor = getAgendaTypeColor(event.typeAgenda, event.couleurAgenda);
                    return (
                      <Box key={event.idAgenda} sx={{ px: 0.85, py: 0.45, borderRadius: 1.5, bgcolor: alpha(eventColor, 0.14), color: eventColor, overflow: 'hidden' }}>
                        <Typography variant="caption" noWrap>{event.titreAgenda}</Typography>
                      </Box>
                    );
                  })}
                  {dayEvents.length > 2 && <Typography variant="caption" color="text.secondary">+{dayEvents.length - 2} autre(s)</Typography>}
                </Stack>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </>
  );

  const renderWeekView = () => (
    <Grid container spacing={2}>
      {weekDays.map((day) => {
        const dayKey = toDateKey(day);
        const dayEvents = sortAgendaItems(eventsByDate[dayKey] || []);
        const reminderLabel = getReminderLabel(dayKey);

        return (
          <Grid item xs={12} md key={dayKey}>
            <Card sx={{ p: 2, borderRadius: 3, minHeight: 220, ...themedPanelSx }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>{longDateFormatter.format(day)}</Typography>
                {reminderLabel && <Chip size="small" color={reminderLabel === "Aujourd'hui" ? 'warning' : 'info'} label={reminderLabel} />}
              </Stack>
              <Stack spacing={1.5}>
                {dayEvents.map((event: IAgendaEvent) => <EventCard key={event.idAgenda} event={event} compact canManage={canManageAgenda} onEdit={openEditDialog} onDelete={setConfirmDelete} />)}
                {dayEvents.length === 0 && <Typography variant="body2" color="text.secondary">Aucun evenement programme.</Typography>}
              </Stack>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );

  const renderDayView = () => (
    <Card sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 4, ...themedPanelSx }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ textTransform: 'capitalize' }}>{selectedDateLabel}</Typography>
          <Typography variant="body2" color="text.secondary">{getReminderLabel(selectedDate) || 'Jour selectionne'}</Typography>
        </Box>
        {canManageAgenda && (
          <>
            <Tooltip title="Ajouter ce jour">
              <IconButton onClick={() => openCreateDialog(selectedDate)} sx={{ display: { xs: 'inline-flex', sm: 'none' }, ...primaryActionButtonSx }}>
                <AddRounded />
              </IconButton>
            </Tooltip>
            <Button variant="contained" sx={{ ...primaryActionButtonSx, display: { xs: 'none', sm: 'inline-flex' } }} startIcon={<AddRounded />} onClick={() => openCreateDialog(selectedDate)}>Ajouter ce jour</Button>
          </>
        )}
      </Stack>
      <Stack spacing={2}>
        {selectedDateEvents.map((event: IAgendaEvent) => <EventCard key={event.idAgenda} event={event} canManage={canManageAgenda} onEdit={openEditDialog} onDelete={setConfirmDelete} />)}
        {selectedDateEvents.length === 0 && <Typography variant="body2" color="text.secondary">Aucun evenement programme pour cette journee.</Typography>}
      </Stack>
    </Card>
  );

  const renderListView = () => (
    <Card sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 4, ...themedPanelSx }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Vue liste</Typography>
          <Typography variant="body2" color="text.secondary">Tous les evenements de la periode selectionnee, classes par ordre chronologique.</Typography>
        </Box>
        <Chip label={`${listViewEvents.length} evenement(s)`} sx={{ bgcolor: alpha('#0f172a', 0.08), color: 'text.primary' }} />
      </Stack>
      <Stack spacing={2}>
        {listViewEvents.map((event: IAgendaEvent) => <EventCard key={event.idAgenda} event={event} canManage={canManageAgenda} onEdit={openEditDialog} onDelete={setConfirmDelete} />)}
        {listViewEvents.length === 0 && <Typography variant="body2" color="text.secondary">Aucun evenement a afficher dans cette periode.</Typography>}
      </Stack>
    </Card>
  );

  return (
    <DashboardContent maxWidth="xl">
      <NotificationComponent />
      <Stack spacing={3} sx={{ width: 1, maxWidth: { xs: 330, sm: 560, lg: 1180 }, mx: 'auto' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h3" sx={{ mb: 0.5 }}>Agenda</Typography>
            <Typography color="text.secondary">Programme les cultes, rendez-vous et evenements importants de la communaute.</Typography>
          </Box>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              width: { xs: '100%', md: 'auto' },
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
              flexWrap: 'wrap',
            }}
          >
            <PrintEtatAgenda events={monthEvents} identity={identity} monthLabel={selectedMonthLabel} />
            {canManageAgenda && (
              <>
                <Tooltip title="Ajouter un evenement">
                  <IconButton onClick={() => openCreateDialog()} sx={{ display: { xs: 'inline-flex', sm: 'none' }, ...primaryActionButtonSx }}>
                    <AddRounded />
                  </IconButton>
                </Tooltip>
                <Button variant="contained" sx={{ ...primaryActionButtonSx, display: { xs: 'none', sm: 'inline-flex' } }} startIcon={<AddRounded />} onClick={() => openCreateDialog()}>Ajouter un evenement</Button>
              </>
            )}
          </Stack>
        </Stack>

        {reminderEvents.length > 0 && (
          <Stack spacing={1.5}>
            {reminderEvents.slice(0, 3).map(({ event, level }) => (
              <Alert key={`${level}-${event.idAgenda || event.titreAgenda}`} severity={level === 'next-hour' ? 'warning' : 'info'} sx={{ borderRadius: 3 }}>
                {level === 'next-hour' ? `${event.titreAgenda} commence dans moins d'une heure.` : `${event.titreAgenda} est programme aujourd'hui.`}
              </Alert>
            ))}
          </Stack>
        )}

        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ m: 0, width: 1 }}>
          <Grid item xs={12} lg={3}>
            <Stack spacing={3}>
              <Card sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 4, ...themedPanelSx }}>
                {canManageAgenda && (
                  <>
                    <Tooltip title="Ajouter a cette date">
                      <IconButton onClick={() => openCreateDialog(selectedDate)} sx={{ display: { xs: 'inline-flex', sm: 'none' }, mb: 3, ...primaryActionButtonSx }}>
                        <AddRounded />
                      </IconButton>
                    </Tooltip>
                    <Button variant="contained" sx={{ ...primaryActionButtonSx, mb: 3, display: { xs: 'none', sm: 'inline-flex' }, width: { lg: 'fit-content' } }} startIcon={<AddRounded />} onClick={() => openCreateDialog(selectedDate)}>Ajouter a cette date</Button>
                  </>
                )}
                <Typography variant="h6" sx={{ mb: 2 }}>Prochains rendez-vous</Typography>
                <Stack spacing={2}>
                  {upcomingEvents.map((item: IAgendaEvent) => {
                    const itemColor = getAgendaTypeColor(item.typeAgenda, item.couleurAgenda);
                    return (
                      <Card key={item.idAgenda} sx={{ p: 2, borderRadius: 3, ...themedPanelSx, borderColor: alpha(itemColor, 0.28) }}>
                        <Stack direction="row" justifyContent="space-between" spacing={1}>
                          <Box>
                            <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                              <Typography variant="subtitle2">{item.titreAgenda}</Typography>
                              {getReminderLabel(item.dateAgenda || '') && <Chip size="small" color={getReminderLabel(item.dateAgenda || '') === "Aujourd'hui" ? 'warning' : 'info'} label={getReminderLabel(item.dateAgenda || '')} />}
                              <Chip size="small" label={item.typeAgenda || 'Evenement'} sx={{ bgcolor: alpha(itemColor, 0.18), color: itemColor }} />
                            </Stack>
                            <Typography variant="caption" color="text.secondary">{formatDisplayDate(item.dateAgenda)} {item.heureDebutAgenda ? `- ${item.heureDebutAgenda}` : ''}</Typography>
                          </Box>
                          {canManageAgenda && <IconButton size="small" onClick={() => openEditDialog(item)}><EditRounded fontSize="small" /></IconButton>}
                        </Stack>
                      </Card>
                    );
                  })}
                  {upcomingEvents.length === 0 && <Typography variant="body2" color="text.secondary">Aucun evenement programme pour le moment.</Typography>}
                </Stack>
              </Card>

              <Card sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 4 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Jour selectionne</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{selectedDateLabel}</Typography>
                <Stack spacing={2}>
                  {selectedDateEvents.map((item: IAgendaEvent) => <EventCard key={item.idAgenda} event={item} compact canManage={canManageAgenda} onEdit={openEditDialog} onDelete={setConfirmDelete} />)}
                  {selectedDateEvents.length === 0 && <Typography variant="body2" color="text.secondary">Aucun evenement a cette date.</Typography>}
                </Stack>
              </Card>
            </Stack>
          </Grid>

          <Grid item xs={12} lg={9}>
            <Card sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 4, ...themedPanelSx }}>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
                <Stack spacing={1}>
                  <Typography variant="h4" sx={{ textTransform: 'capitalize' }}>{currentPeriodLabel}</Typography>
                  <ToggleButtonGroup exclusive value={viewMode} onChange={(_, nextValue: AgendaViewMode | null) => { if (nextValue) setViewMode(nextValue); }} size="small" sx={{ flexWrap: 'wrap', '& .MuiToggleButton-root': { color: 'text.primary', borderColor: 'divider', px: 1.25 }, '& .Mui-selected': { bgcolor: alpha('#0ea5e9', 0.12), color: '#0369a1' } }}>
                    {!isMobile && <ToggleButton value="month"><CalendarMonthRounded fontSize="small" sx={{ mr: 1 }} />Mois</ToggleButton>}
                    {!isMobile && <ToggleButton value="week"><ViewWeekRounded fontSize="small" sx={{ mr: 1 }} />Semaine</ToggleButton>}
                    <ToggleButton value="day"><ViewAgendaRounded fontSize="small" sx={{ mr: 1 }} />Jour</ToggleButton>
                    <ToggleButton value="list"><ViewListRounded fontSize="small" sx={{ mr: 1 }} />Liste</ToggleButton>
                  </ToggleButtonGroup>
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-end' } }}>
                  <IconButton size="small" onClick={() => navigateAgenda('previous')}><ChevronLeftRounded fontSize="small" /></IconButton>
                  <Button variant="outlined" size="small" onClick={() => { const now = new Date(); setCurrentMonth(now); setSelectedDate(toDateKey(now)); }}>Aujourd&apos;hui</Button>
                  <IconButton size="small" onClick={() => navigateAgenda('next')}><ChevronRightRounded fontSize="small" /></IconButton>
                </Stack>
              </Stack>

              {viewMode === 'month' && renderMonthView()}
              {viewMode === 'week' && renderWeekView()}
              {viewMode === 'day' && renderDayView()}
              {viewMode === 'list' && renderListView()}

              {loadingAgenda && <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">Chargement de l&apos;agenda...</Typography>}
            </Card>
          </Grid>
        </Grid>
      </Stack>

      <Dialog open={agendaDialogOpen} onClose={() => setAgendaDialogOpen(false)} fullScreen={isMobile} fullWidth maxWidth="sm" PaperProps={{ sx: { m: { xs: 0, sm: 2 }, borderRadius: { xs: 0, sm: 3 } } }}> 
        <DialogTitle>{agendaForm.idAgenda ? 'Modifier un evenement' : 'Programmer un evenement'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Titre" value={agendaForm.titreAgenda} onChange={(event) => setAgendaForm((previous) => ({ ...previous, titreAgenda: event.target.value }))} fullWidth />
            <TextField select label="Type" value={agendaForm.typeAgenda} onChange={(event) => setAgendaForm((previous) => ({ ...previous, typeAgenda: event.target.value, couleurAgenda: getAgendaTypeColor(event.target.value) }))} fullWidth>
              {eventTypes.map((option: string) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
            </TextField>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Date" type="date" value={agendaForm.dateAgenda || ''} onChange={(event) => setAgendaForm((previous) => ({ ...previous, dateAgenda: event.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
              <TextField label="Heure debut" type="time" value={agendaForm.heureDebutAgenda} onChange={(event) => setAgendaForm((previous) => ({ ...previous, heureDebutAgenda: event.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
              <TextField label="Heure fin" type="time" value={agendaForm.heureFinAgenda} onChange={(event) => setAgendaForm((previous) => ({ ...previous, heureFinAgenda: event.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
            </Stack>
            <TextField label="Lieu" value={agendaForm.lieuAgenda} onChange={(event) => setAgendaForm((previous) => ({ ...previous, lieuAgenda: event.target.value }))} fullWidth />
            <TextField select label="Statut" value={agendaForm.statutAgenda} onChange={(event) => setAgendaForm((previous) => ({ ...previous, statutAgenda: event.target.value }))} fullWidth>
              {eventStatus.map((option: string) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
            </TextField>
            <TextField select label="Couleur" value={agendaForm.couleurAgenda} onChange={(event) => setAgendaForm((previous) => ({ ...previous, couleurAgenda: event.target.value }))} fullWidth>
              {agendaForm.couleurAgenda
                && !colorOptions.some((option) => option.value === agendaForm.couleurAgenda) && (
                  <MenuItem value={agendaForm.couleurAgenda}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: agendaForm.couleurAgenda, border: '1px solid', borderColor: 'divider' }} />
                      <Typography variant="body2">Couleur actuelle</Typography>
                    </Stack>
                  </MenuItem>
                )}
              {colorOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: option.value, border: '1px solid', borderColor: 'divider' }} />
                    <Typography variant="body2">{option.label}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Description" value={agendaForm.descriptionAgenda} onChange={(event) => setAgendaForm((previous) => ({ ...previous, descriptionAgenda: event.target.value }))} fullWidth multiline minRows={3} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 1, px: 3, py: 2 }}>
          <Button fullWidth={isMobile} onClick={() => setAgendaDialogOpen(false)}>Annuler</Button>
          <Button fullWidth={isMobile} variant="contained" sx={primaryActionButtonSx} onClick={handleSaveAgenda} disabled={submitting}>{submitting ? 'Enregistrement...' : 'Enregistrer'}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={Boolean(confirmDelete)} title="Supprimer cet evenement" message={`L'evenement "${confirmDelete?.titreAgenda || ''}" sera retire de l'agenda.`} confirmText="Supprimer" onConfirm={handleDeleteAgenda} onClose={() => setConfirmDelete(null)} />
    </DashboardContent>
  );
}

