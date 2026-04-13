const fs = require('fs');
const path = 'src/sections/agenda/view/agenda-view.tsx';
let content = fs.readFileSync(path, 'utf8');

const ensure = (from, to) => {
  if (content.includes(to)) return;
  content = content.replace(from, to);
};

ensure("  const identity = appUserConnected || authUtilisateurData || {};", "  const identity = appUserConnected || authUtilisateurData || {};\n  const notifiedReminderKeys = useRef<Set<string>>(new Set());");
ensure("        borderLeft: `4px solid ${event.couleurAgenda || '#0ea5e9'}`,,", "        borderLeft: `4px solid ${getAgendaTypeColor(event.typeAgenda, event.couleurAgenda)}`,,");
content = content.replace("        borderLeft: `4px solid ${event.couleurAgenda || '#0ea5e9'}`,,", "        borderLeft: `4px solid ${getAgendaTypeColor(event.typeAgenda, event.couleurAgenda)}`,,");
content = content.replace("        borderLeft: `4px solid ${event.couleurAgenda || '#0ea5e9'}`,", "        borderLeft: `4px solid ${getAgendaTypeColor(event.typeAgenda, event.couleurAgenda)}`," );
ensure("            <Chip size=\"small\" label={event.typeAgenda || 'Evenement'} />", "            <Chip size=\"small\" label={event.typeAgenda || 'Evenement'} sx={{ bgcolor: alpha(getAgendaTypeColor(event.typeAgenda, event.couleurAgenda), 0.14), color: getAgendaTypeColor(event.typeAgenda, event.couleurAgenda) }} />");

ensure(
`  const eventsByDate = useMemo(
    () => allEvents.reduce((acc: Record<string, IAgendaEvent[]>, event: IAgendaEvent) => {
      const key = event.dateAgenda || '';
      if (!key) return acc;
      if (!acc[key]) acc[key] = [];
      acc[key].push(event);
      return acc;
    }, {}),
    [allEvents]
  );`,
`  const weekEvents = useMemo(
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
  );`
);

ensure(
`  const selectedDateEvents = useMemo(
    () => sortAgendaItems(eventsByDate[selectedDate] || []),
    [eventsByDate, selectedDate]
  );`,
`  const selectedDateEvents = useMemo(
    () => sortAgendaItems(eventsByDate[selectedDate] || []),
    [eventsByDate, selectedDate]
  );

  const listViewEvents = useMemo(() => {
    if (viewMode === 'week') return weekEvents;
    if (viewMode === 'day') return selectedDateEvents;
    return monthEvents;
  }, [monthEvents, selectedDateEvents, viewMode, weekEvents]);`
);

ensure(
`  const upcomingEvents = useMemo(
    () => sortAgendaItems(allEvents)
      .filter((event: IAgendaEvent) => event.dateAgenda)
      .slice(0, 6),
    [allEvents]
  );`,
`  const upcomingEvents = useMemo(
    () => sortAgendaItems(allEvents)
      .filter((event: IAgendaEvent) => event.dateAgenda)
      .slice(0, 6),
    [allEvents]
  );

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
  }, [allEvents]);`
);

ensure(
`  useEffect(() => {
    fetchAgenda();
  }, [fetchAgenda]);`,
`  useEffect(() => {
    fetchAgenda();
  }, [fetchAgenda]);

  useEffect(() => {
    const nextReminder = reminderEvents.find(({ event, level }) => !notifiedReminderKeys.current.has(
      \
`${level}-${event.idAgenda || event.titreAgenda}-${event.dateAgenda}-${event.heureDebutAgenda}`
    ));
    if (!nextReminder) return;

    const reminderKey = `${nextReminder.level}-${nextReminder.event.idAgenda || nextReminder.event.titreAgenda}-${nextReminder.event.dateAgenda}-${nextReminder.event.heureDebutAgenda}`;
    notifiedReminderKeys.current.add(reminderKey);

    const reminderMessage = nextReminder.level === 'next-hour'
      ? `${nextReminder.event.titreAgenda} commence dans moins d'une heure.`
      : `${nextReminder.event.titreAgenda} est programme aujourd'hui.`;

    showNotification(reminderMessage, nextReminder.level === 'next-hour' ? 'warning' : 'info');

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (window.Notification.permission === 'granted') {
        new window.Notification('Agenda - rappel', { body: reminderMessage });
      } else if (window.Notification.permission === 'default') {
        window.Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new window.Notification('Agenda - rappel', { body: reminderMessage });
          }
        }).catch(() => undefined);
      }
    }
  }, [reminderEvents, showNotification]);`
);

content = content.replace(
"      const payload = { ...agendaForm, idUtilisateur: currentUserId };",
`      const payload = {
        ...agendaForm,
        idUtilisateur: currentUserId,
        couleurAgenda: getAgendaTypeColor(agendaForm.typeAgenda, agendaForm.couleurAgenda),
      };`
);

ensure(
`  const renderDayView = () => (
    <Card sx={{ p: 3, borderRadius: 4, bgcolor: '#1f2940', color: 'common.white' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ textTransform: 'capitalize' }}>{selectedDateLabel}</Typography>
          <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.72) }}>
            {getReminderLabel(selectedDate) || 'Jour selectionne'}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRounded />} onClick={() => openCreateDialog(selectedDate)}>
          Ajouter ce jour
        </Button>
      </Stack>

      <Stack spacing={2}>
        {selectedDateEvents.map((event: IAgendaEvent) => (
          <EventCard key={event.idAgenda} event={event} onEdit={openEditDialog} onDelete={setConfirmDelete} />
        ))}
        {selectedDateEvents.length === 0 && (
          <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.72) }}>
            Aucun evenement programme pour cette journee.
          </Typography>
        )}
      </Stack>
    </Card>
  );`,
`  const renderDayView = () => (
    <Card sx={{ p: 3, borderRadius: 4, bgcolor: '#1f2940', color: 'common.white' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ textTransform: 'capitalize' }}>{selectedDateLabel}</Typography>
          <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.72) }}>
            {getReminderLabel(selectedDate) || 'Jour selectionne'}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRounded />} onClick={() => openCreateDialog(selectedDate)}>
          Ajouter ce jour
        </Button>
      </Stack>

      <Stack spacing={2}>
        {selectedDateEvents.map((event: IAgendaEvent) => (
          <EventCard key={event.idAgenda} event={event} onEdit={openEditDialog} onDelete={setConfirmDelete} />
        ))}
        {selectedDateEvents.length === 0 && (
          <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.72) }}>
            Aucun evenement programme pour cette journee.
          </Typography>
        )}
      </Stack>
    </Card>
  );

  const renderListView = () => (
    <Card sx={{ p: 3, borderRadius: 4, bgcolor: '#1f2940', color: 'common.white' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Vue liste</Typography>
          <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.72) }}>
            Tous les evenements de la periode selectionnee, classes par ordre chronologique.
          </Typography>
        </Box>
        <Chip label={`${listViewEvents.length} evenement(s)`} sx={{ bgcolor: alpha('#ffffff', 0.12), color: 'common.white' }} />
      </Stack>

      <Stack spacing={2}>
        {listViewEvents.map((event: IAgendaEvent) => (
          <EventCard key={event.idAgenda} event={event} onEdit={openEditDialog} onDelete={setConfirmDelete} />
        ))}
        {listViewEvents.length === 0 && (
          <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.72) }}>
            Aucun evenement a afficher dans cette periode.
          </Typography>
        )}
      </Stack>
    </Card>
  );`
);

content = content.replace(
`        <Grid container spacing={3}>`,
`        {reminderEvents.length > 0 && (
          <Stack spacing={1.5}>
            {reminderEvents.slice(0, 3).map(({ event, level }) => (
              <Alert
                key={`${level}-${event.idAgenda || event.titreAgenda}`}
                severity={level === 'next-hour' ? 'warning' : 'info'}
                sx={{ borderRadius: 3 }}
              >
                {level === 'next-hour'
                  ? `${event.titreAgenda} commence dans moins d'une heure.`
                  : `${event.titreAgenda} est programme aujourd'hui.`}
              </Alert>
            ))}
          </Stack>
        )}

        <Grid container spacing={3}>`
);

content = content.replace(
`                    <ToggleButton value="day"><ViewAgendaRounded fontSize="small" sx={{ mr: 1 }} />Jour</ToggleButton>`,
`                    <ToggleButton value="day"><ViewAgendaRounded fontSize="small" sx={{ mr: 1 }} />Jour</ToggleButton>
                    <ToggleButton value="list"><ViewListRounded fontSize="small" sx={{ mr: 1 }} />Liste</ToggleButton>`
);
content = content.replace(
`              {viewMode === 'month' && renderMonthView()}
              {viewMode === 'week' && renderWeekView()}
              {viewMode === 'day' && renderDayView()}`,
`              {viewMode === 'month' && renderMonthView()}
              {viewMode === 'week' && renderWeekView()}
              {viewMode === 'day' && renderDayView()}
              {viewMode === 'list' && renderListView()}`
);
content = content.replace(
`                    <Card key={item.idAgenda} sx={{ p: 2, borderRadius: 3, bgcolor: alpha(item.couleurAgenda || '#0ea5e9', 0.12), color: 'common.white' }}>`,
`                    <Card key={item.idAgenda} sx={{ p: 2, borderRadius: 3, bgcolor: alpha(getAgendaTypeColor(item.typeAgenda, item.couleurAgenda), 0.12), color: 'common.white' }}>`
);
content = content.replace(
`                            )}
                          </Stack>`,
`                            )}
                            <Chip size="small" label={item.typeAgenda || 'Evenement'} sx={{ bgcolor: alpha(getAgendaTypeColor(item.typeAgenda, item.couleurAgenda), 0.18), color: getAgendaTypeColor(item.typeAgenda, item.couleurAgenda) }} />
                          </Stack>`
);
content = content.replace(
`            <TextField select label="Type" value={agendaForm.typeAgenda} onChange={(event) => setAgendaForm((previous) => ({ ...previous, typeAgenda: event.target.value }))} fullWidth>`,
`            <TextField select label="Type" value={agendaForm.typeAgenda} onChange={(event) => setAgendaForm((previous) => ({ ...previous, typeAgenda: event.target.value, couleurAgenda: getAgendaTypeColor(event.target.value) }))} fullWidth>`
);

fs.writeFileSync(path, content, 'utf8');
