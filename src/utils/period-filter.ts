// ============================================================================
// period-filter.ts
// Logique partagee de filtrage par periode, utilisee par "Suivi pastoral" et
// "Cas sociaux" : calcule une plage de dates [debut, fin] a partir d'un mode
// choisi par l'utilisateur (ce mois-ci, mois dernier, periode personnalisee...),
// et verifie si une date donnee tombe dans cette plage. Centralise ici pour que
// les deux pages se comportent exactement de la meme facon.
// ============================================================================

// Tous les modes de periode geres par l'application. Chaque page n'affiche
// que le sous-ensemble d'options qui lui est utile (voir periodOptions dans
// chaque vue), mais resolvePeriodRange sait tous les traiter.
export type PeriodMode =
  | 'all'
  | 'this-month'
  | 'last-month'
  | 'last-3-months'
  | 'month'
  | 'last-week'
  | 'last-sunday'
  | 'custom';

export type DateRange = { start: Date; end: Date };

// Parametres additionnels necessaires selon le mode choisi :
// - month : 'YYYY-MM' pour le mode "un mois precis"
// - customStart / customEnd : 'YYYY-MM-DD' pour le mode "periode personnalisee"
export type PeriodParams = {
  month?: string;
  customStart?: string;
  customEnd?: string;
};

// Ramène une date à minuit / 23h59 (début et fin de journée), pour ne comparer
// que des jours entiers et pas des heures précises.
export const startOfDay = (date: Date): Date => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

export const endOfDay = (date: Date): Date => {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
};

// Le lundi de la semaine contenant "reference".
const getThisMonday = (reference: Date): Date => {
  const date = startOfDay(reference);
  const dayIndex = date.getDay(); // 0 = dimanche, 1 = lundi, ...
  const diffFromMonday = dayIndex === 0 ? 6 : dayIndex - 1;
  date.setDate(date.getDate() - diffFromMonday);
  return date;
};

// Le dimanche de la semaine contenant "reference" (aujourd'hui inclus si on
// est deja dimanche) : c'est ce qu'on entend par "le dimanche dernier/passe".
const getLastSunday = (reference: Date): Date => {
  const date = startOfDay(reference);
  date.setDate(date.getDate() - date.getDay());
  return date;
};

// Premier et dernier jour d'un mois donne (mois exprime en index 0-11, comme
// Date.getMonth()).
const monthRange = (year: number, monthIndex0: number): DateRange => ({
  start: new Date(year, monthIndex0, 1, 0, 0, 0, 0),
  end: new Date(year, monthIndex0 + 1, 0, 23, 59, 59, 999),
});

// Calcule la plage [debut, fin] correspondant au mode de periode choisi.
// Retourne null pour "all" (= pas de restriction de date).
export const resolvePeriodRange = (
  mode: PeriodMode,
  params: PeriodParams = {},
  reference: Date = new Date()
): DateRange | null => {
  if (mode === 'this-month') {
    return monthRange(reference.getFullYear(), reference.getMonth());
  }

  if (mode === 'last-month') {
    const previousMonthRef = new Date(reference.getFullYear(), reference.getMonth() - 1, 1);
    return monthRange(previousMonthRef.getFullYear(), previousMonthRef.getMonth());
  }

  if (mode === 'last-3-months') {
    const currentMonth = monthRange(reference.getFullYear(), reference.getMonth());
    const threeMonthsAgo = new Date(reference.getFullYear(), reference.getMonth() - 2, 1);
    return { start: startOfDay(threeMonthsAgo), end: currentMonth.end };
  }

  if (mode === 'month') {
    const [year, month] = (params.month || '').split('-').map(Number);
    if (!year || !month) return null;
    return monthRange(year, month - 1);
  }

  if (mode === 'last-week') {
    const thisMonday = getThisMonday(reference);
    const lastMonday = new Date(thisMonday);
    lastMonday.setDate(thisMonday.getDate() - 7);
    const lastSundayOfThatWeek = new Date(thisMonday);
    lastSundayOfThatWeek.setDate(thisMonday.getDate() - 1);
    return { start: startOfDay(lastMonday), end: endOfDay(lastSundayOfThatWeek) };
  }

  if (mode === 'last-sunday') {
    const sunday = getLastSunday(reference);
    return { start: startOfDay(sunday), end: endOfDay(sunday) };
  }

  if (mode === 'custom') {
    if (!params.customStart || !params.customEnd) return null;

    const rawStart = new Date(`${params.customStart}T00:00:00`);
    const rawEnd = new Date(`${params.customEnd}T23:59:59.999`);
    if (Number.isNaN(rawStart.getTime()) || Number.isNaN(rawEnd.getTime())) return null;

    // Si l'utilisateur inverse les deux dates par erreur, on les remet dans
    // l'ordre plutot que de renvoyer une plage vide.
    if (rawStart.getTime() > rawEnd.getTime()) {
      return { start: startOfDay(rawEnd), end: endOfDay(rawStart) };
    }

    return { start: rawStart, end: rawEnd };
  }

  return null; // 'all'
};

// Une date (chaîne ISO/DB) tombe-t-elle dans la plage donnée ? Sans plage
// (mode "all" ou parametres incomplets), tout est considéré comme valide.
export const isDateWithinRange = (value: string | null | undefined, range: DateRange | null): boolean => {
  if (!range) return true;
  if (!value) return false;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return false;

  return parsed.getTime() >= range.start.getTime() && parsed.getTime() <= range.end.getTime();
};

// Libelle lisible de la periode active, repris a l'ecran et dans les documents imprimes.
export const formatPeriodLabel = (mode: PeriodMode, range: DateRange | null): string => {
  if (mode === 'all' || !range) {
    return 'Toute la période';
  }

  const formatShort = (value: Date) => value.toLocaleDateString('fr-FR');

  if (mode === 'last-sunday') {
    return `Dimanche ${formatShort(range.start)}`;
  }

  return `Du ${formatShort(range.start)} au ${formatShort(range.end)}`;
};
