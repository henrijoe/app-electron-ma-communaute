const fs = require('fs');
const path = 'src/sections/agenda/view/agenda-view.tsx';
let lines = fs.readFileSync(path, 'utf8').split(/\r?\n/);

const insertAfter = (match, newLines) => {
  const idx = lines.indexOf(match);
  if (idx >= 0 && !newLines.every((line) => lines.includes(line))) {
    lines.splice(idx + 1, 0, ...newLines);
  }
};

const replaceLine = (match, newLine) => {
  const idx = lines.indexOf(match);
  if (idx >= 0) lines[idx] = newLine;
};

const insertBefore = (match, newLines) => {
  const idx = lines.indexOf(match);
  if (idx >= 0 && !newLines.every((line) => lines.includes(line))) {
    lines.splice(idx, 0, ...newLines);
  }
};

replaceLine("        borderLeft: `4px solid ${event.couleurAgenda || '#0ea5e9'}`,", "        borderLeft: `4px solid ${getAgendaTypeColor(event.typeAgenda, event.couleurAgenda)}`,");
replaceLine("            <Chip size=\"small\" label={event.typeAgenda || 'Evenement'} />", "            <Chip size=\"small\" label={event.typeAgenda || 'Evenement'} sx={{ bgcolor: alpha(getAgendaTypeColor(event.typeAgenda, event.couleurAgenda), 0.14), color: getAgendaTypeColor(event.typeAgenda, event.couleurAgenda) }} />");

insertAfter("  const monthEvents = useMemo(", [
"    () => sortAgendaItems(allEvents.filter((event: IAgendaEvent) => weekDays.some((day) => toDateKey(day) === event.dateAgenda))),",
"    [allEvents, weekDays]",
"  );",
"",
"  const weekEvents = useMemo(",
]);
// remove malformed insertion if any, then ensure proper block after monthEvents block
lines = lines.filter((line, idx) => !(line === "  const weekEvents = useMemo(" && lines[idx - 1] === "  const weekEvents = useMemo("));
const monthEventsEnd = lines.findIndex((line, idx) => idx > lines.indexOf("  const monthEvents = useMemo(") && line === "  );");
if (monthEventsEnd >= 0 && !lines.includes("  const weekEvents = useMemo(")) {
  lines.splice(monthEventsEnd + 1, 0,
    '',
    '  const weekEvents = useMemo(',
    '    () => sortAgendaItems(allEvents.filter((event: IAgendaEvent) => weekDays.some((day) => toDateKey(day) === event.dateAgenda))),',
    '    [allEvents, weekDays]',
    '  );'
  );
}

insertAfter("  const selectedDateEvents = useMemo(", [
"    () => sortAgendaItems(eventsByDate[selectedDate] || []),",
"    [eventsByDate, selectedDate]",
"  );",
"",
"  const listViewEvents = useMemo(() => {",
"    if (viewMode === 'week') return weekEvents;",
"    if (viewMode === 'day') return selectedDateEvents;",
"    return monthEvents;",
"  }, [monthEvents, selectedDateEvents, viewMode, weekEvents]);",
]);

const selectedBlockStart = lines.indexOf('  const selectedDateEvents = useMemo(');
if (selectedBlockStart >= 0) {
  const duplicateIdx = lines.indexOf('  const listViewEvents = useMemo(() => {');
  if (duplicateIdx < 0) {
    const endIdx = lines.findIndex((line, idx) => idx > selectedBlockStart && line === '  );');
    lines.splice(endIdx + 1, 0,
      '',
      '  const listViewEvents = useMemo(() => {',
      "    if (viewMode === 'week') return weekEvents;",
      "    if (viewMode === 'day') return selectedDateEvents;",
      '    return monthEvents;',
      '  }, [monthEvents, selectedDateEvents, viewMode, weekEvents]);'
    );
  }
}

const upcomingStart = lines.indexOf('  const upcomingEvents = useMemo(');
if (upcomingStart >= 0 && !lines.includes('  const reminderEvents = useMemo(() => {')) {
  const endIdx = lines.findIndex((line, idx) => idx > upcomingStart && line === '  );');
  lines.splice(endIdx + 1, 0,
    '',
    '  const reminderEvents = useMemo(() => {',
    '    const now = new Date();',
    '',
    '    return sortAgendaItems(allEvents).reduce((acc: ReminderEvent[], event: IAgendaEvent) => {',
    '      const eventDate = buildEventDateTime(event);',
    '      if (!eventDate) return acc;',
    '',
    '      const diffMinutes = Math.round((eventDate.getTime() - now.getTime()) / (1000 * 60));',
    "      if (diffMinutes >= 0 && diffMinutes <= 60) {",
    "        acc.push({ event, level: 'next-hour' });",
    '        return acc;',
    '      }',
    '',
    "      if (event.dateAgenda && isToday(event.dateAgenda)) {",
    "        acc.push({ event, level: 'today' });",
    '      }',
    '',
    '      return acc;',
    '    }, []);',
    '  }, [allEvents]);'
  );
}

const fetchEffectEnd = lines.indexOf('  }, [fetchAgenda]);');
if (fetchEffectEnd >= 0 && !lines.includes('  }, [reminderEvents, showNotification]);')) {
  lines.splice(fetchEffectEnd + 1, 0,
    '',
    '  useEffect(() => {',
    '    const nextReminder = reminderEvents.find(({ event, level }) => !notifiedReminderKeys.current.has(`${level}-${event.idAgenda || event.titreAgenda}-${event.dateAgenda}-${event.heureDebutAgenda}`));',
    '    if (!nextReminder) return;',
    '',
    '    const reminderKey = `${nextReminder.level}-${nextReminder.event.idAgenda || nextReminder.event.titreAgenda}-${nextReminder.event.dateAgenda}-${nextReminder.event.heureDebutAgenda}`;',
    '    notifiedReminderKeys.current.add(reminderKey);',
    '',
    "    const reminderMessage = nextReminder.level === 'next-hour'",
    "      ? `${nextReminder.event.titreAgenda} commence dans moins d'une heure.`",
    "      : `${nextReminder.event.titreAgenda} est programme aujourd'hui.`;",
    '',
    "    showNotification(reminderMessage, nextReminder.level === 'next-hour' ? 'warning' : 'info');",
    '',
    "    if (typeof window !== 'undefined' && 'Notification' in window) {",
    "      if (window.Notification.permission === 'granted') {",
    "        new window.Notification('Agenda - rappel', { body: reminderMessage });",
    "      } else if (window.Notification.permission === 'default') {",
    '        window.Notification.requestPermission().then((permission) => {',
    "          if (permission === 'granted') {",
    "            new window.Notification('Agenda - rappel', { body: reminderMessage });",
    '          }',
    '        }).catch(() => undefined);',
    '      }',
    '    }',
    '  }, [reminderEvents, showNotification]);'
  );
}

replaceLine('      const payload = { ...agendaForm, idUtilisateur: currentUserId };', '      const payload = {');
insertAfter('      const payload = {', [
'        ...agendaForm,',
'        idUtilisateur: currentUserId,',
'        couleurAgenda: getAgendaTypeColor(agendaForm.typeAgenda, agendaForm.couleurAgenda),',
'      };'
]);
lines = lines.filter((line, idx) => !(idx > lines.indexOf('      const payload = {') && idx <= lines.indexOf('      };') && line === '      const payload = { ...agendaForm, idUtilisateur: currentUserId };'));

replaceLine('            <TextField select label="Type" value={agendaForm.typeAgenda} onChange={(event) => setAgendaForm((previous) => ({ ...previous, typeAgenda: event.target.value }))} fullWidth>', '            <TextField select label="Type" value={agendaForm.typeAgenda} onChange={(event) => setAgendaForm((previous) => ({ ...previous, typeAgenda: event.target.value, couleurAgenda: getAgendaTypeColor(event.target.value) }))} fullWidth>');
replaceLine('                    <Card key={item.idAgenda} sx={{ p: 2, borderRadius: 3, bgcolor: alpha(item.couleurAgenda || \'#0ea5e9\', 0.12), color: \'common.white\' }}>', '                    <Card key={item.idAgenda} sx={{ p: 2, borderRadius: 3, bgcolor: alpha(getAgendaTypeColor(item.typeAgenda, item.couleurAgenda), 0.12), color: \'common.white\' }}>');

insertAfter("                            {getReminderLabel(item.dateAgenda || '') && (", [
"                              <Chip size=\"small\" color={getReminderLabel(item.dateAgenda || '') === 'Aujourd\'hui' ? 'warning' : 'info'} label={getReminderLabel(item.dateAgenda || '')} />",
"                            )}",
"                            <Chip size=\"small\" label={item.typeAgenda || 'Evenement'} sx={{ bgcolor: alpha(getAgendaTypeColor(item.typeAgenda, item.couleurAgenda), 0.18), color: getAgendaTypeColor(item.typeAgenda, item.couleurAgenda) }} />",
]);
// clean duplicate chip if repeated
lines = lines.filter((line, idx) => !(line.includes("<Chip size=\"small\" label={item.typeAgenda") && idx > lines.findIndex((x) => x.includes("<Chip size=\"small\" label={item.typeAgenda"))));

insertBefore('        <Grid container spacing={3}>', [
'        {reminderEvents.length > 0 && (',
'          <Stack spacing={1.5}>',
'            {reminderEvents.slice(0, 3).map(({ event, level }) => (',
'              <Alert',
'                key={`${level}-${event.idAgenda || event.titreAgenda}`}',
"                severity={level === 'next-hour' ? 'warning' : 'info'}",
'                sx={{ borderRadius: 3 }}',
'              >',
"                {level === 'next-hour'",
"                  ? `${event.titreAgenda} commence dans moins d'une heure.`",
"                  : `${event.titreAgenda} est programme aujourd'hui.`}",
'              </Alert>',
'            ))}',
'          </Stack>',
'        )}',
'']
);

insertAfter('                    <ToggleButton value="day"><ViewAgendaRounded fontSize="small" sx={{ mr: 1 }} />Jour</ToggleButton>', [
'                    <ToggleButton value="list"><ViewListRounded fontSize="small" sx={{ mr: 1 }} />Liste</ToggleButton>'
]);
insertAfter("              {viewMode === 'day' && renderDayView()}", [
"              {viewMode === 'list' && renderListView()}"
]);

const returnIdx = lines.indexOf('  return (');
const renderDayIdx = lines.indexOf('  const renderDayView = () => (');
if (renderDayIdx >= 0 && !lines.includes('  const renderListView = () => (')) {
  const insertIdx = returnIdx;
  lines.splice(insertIdx, 0,
    '',
    '  const renderListView = () => (',
    "    <Card sx={{ p: 3, borderRadius: 4, bgcolor: '#1f2940', color: 'common.white' }}>",
    '      <Stack direction={{ xs: \"column\", md: \"row\" }} justifyContent=\"space-between\" spacing={2} sx={{ mb: 3 }}>',
    '        <Box>',
    '          <Typography variant="h5">Vue liste</Typography>',
    '          <Typography variant="body2" sx={{ color: alpha(\'#ffffff\', 0.72) }}>',
    '            Tous les evenements de la periode selectionnee, classes par ordre chronologique.',
    '          </Typography>',
    '        </Box>',
    '        <Chip label={`${listViewEvents.length} evenement(s)`} sx={{ bgcolor: alpha(\'#ffffff\', 0.12), color: \"common.white\" }} />',
    '      </Stack>',
    '',
    '      <Stack spacing={2}>',
    '        {listViewEvents.map((event: IAgendaEvent) => (',
    '          <EventCard key={event.idAgenda} event={event} onEdit={openEditDialog} onDelete={setConfirmDelete} />',
    '        ))}',
    '        {listViewEvents.length === 0 && (',
    '          <Typography variant="body2" sx={{ color: alpha(\'#ffffff\', 0.72) }}>',
    '            Aucun evenement a afficher dans cette periode.',
    '          </Typography>',
    '        )}',
    '      </Stack>',
    '    </Card>',
    '  );'
  );
}

fs.writeFileSync(path, lines.join('\n'), 'utf8');
