import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  ArrowForwardRounded,
  AutorenewRounded,
  ChurchRounded,
  FavoriteRounded,
  HealingRounded,
  PersonAddAlt1Rounded,
  SearchRounded,
  VolunteerActivismRounded,
  WaterDropRounded,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';
import type { IDeces } from 'src/store/decesSlice';
import type { IMembre } from 'src/store/membreSlice';
import type { IReduxState } from 'src/store/store';
import { apiClient } from 'src/utils/apiClient';
import { getScopeUserIdFromUser } from 'src/utils/access-control';
import { normalizeText } from 'src/utils/text';
import type { IMaladieDraft } from 'src/sections/social/types';

type PastoralFilter =
  | 'all'
  | 'priority'
  | 'nouvelle-ame'
  | 'visite'
  | 'bapteme'
  | 'maladie'
  | 'deces';

type PastoralStatusColor = 'default' | 'error' | 'info' | 'primary' | 'success' | 'warning';

type PastoralItem = {
  id: string;
  memberId?: number | null;
  name: string;
  contact?: string;
  residence?: string;
  category: PastoralFilter;
  categoryLabel: string;
  priority: 'haute' | 'normale' | 'suivi';
  color: PastoralStatusColor;
  title: string;
  description: string;
  date?: string | null;
  source: 'membre' | 'maladie' | 'deces';
};

const filterOptions: Array<{ value: PastoralFilter; label: string }> = [
  { value: 'all', label: 'Tout' },
  { value: 'priority', label: 'Priorités' },
  { value: 'nouvelle-ame', label: 'Nouveaux convertis' },
  { value: 'visite', label: 'Visites' },
  { value: 'bapteme', label: 'Pas encore baptisés' },
  { value: 'maladie', label: 'Malades' },
  { value: 'deces', label: 'Décès' },
];

const getCurrentUserId = (state: IReduxState): number => {
  const sessionUser = state.application.userConnected || state.authentification.utilisateurData;
  return Number(getScopeUserIdFromUser(sessionUser) || sessionUser?.idUtilisateur || 0);
};

const isYes = (value: unknown): boolean => {
  const normalized = normalizeText(String(value ?? ''));
  return normalized === '1' || normalized === 'oui' || normalized === 'true';
};

const isNo = (value: unknown): boolean => {
  const normalized = normalizeText(String(value ?? ''));
  return normalized === '2' || normalized === 'non' || normalized === 'false';
};

const memberName = (membre: Partial<IMembre>): string =>
  [membre.nomMembre, membre.prenomMembre].filter(Boolean).join(' ').trim() || 'Membre sans nom';

const formatDate = (date?: string | null): string => {
  if (!date) {
    return '';
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString('fr-FR');
};

const buildMemberItems = (membres: IMembre[]): PastoralItem[] => {
  const items: PastoralItem[] = [];

  membres.forEach((membre) => {
    const name = memberName(membre);
    const base = {
      memberId: Number(membre.idMembre),
      name,
      contact: membre.contactMembre,
      residence: membre.residenceMembre,
      source: 'membre' as const,
    };

    if (isYes(membre.nouvelleAmeMembre)) {
      items.push({
        ...base,
        id: `nouvelle-ame-${membre.idMembre}`,
        category: 'nouvelle-ame',
        categoryLabel: 'Nouvelle âme',
        color: 'success',
        priority: isYes(membre.baptemeEauMembre) ? 'suivi' : 'normale',
        title: 'Accompagnement nouveau converti',
        description: membre.dateConversionMembre
          ? `Conversion déclarée le ${formatDate(membre.dateConversionMembre)}.`
          : 'Conversion à accompagner et consolider.',
        date: membre.dateConversionMembre,
      });
    }

    if (isNo(membre.visiteMembre) || membre.raisonNonVisiteMembre) {
      items.push({
        ...base,
        id: `visite-${membre.idMembre}`,
        category: 'visite',
        categoryLabel: 'Visite',
        color: 'warning',
        priority: 'haute',
        title: 'Visite pastorale à suivre',
        description:
          membre.raisonNonVisiteMembre ||
          "Le membre n'a pas encore reçu de visite ou la visite est indiquée comme non faite.",
      });
    }

    if (!isYes(membre.baptemeEauMembre)) {
      items.push({
        ...base,
        id: `bapteme-eau-${membre.idMembre}`,
        category: 'bapteme',
        categoryLabel: "Pas encore baptisé d'eau",
        color: 'info',
        priority: isYes(membre.nouvelleAmeMembre) ? 'normale' : 'suivi',
        title: "Pas encore baptisé d'eau",
        description: 'Ce membre n’est pas encore marqué comme baptisé d’eau.',
      });
    }

    if (!isYes(membre.baptemeSaintEspritMembre)) {
      items.push({
        ...base,
        id: `bapteme-esprit-${membre.idMembre}`,
        category: 'bapteme',
        categoryLabel: 'Pas encore baptisé Saint-Esprit',
        color: 'primary',
        priority: 'suivi',
        title: 'Pas encore baptisé du Saint-Esprit',
        description: 'Ce membre n’est pas encore marqué comme baptisé du Saint-Esprit.',
      });
    }
  });

  return items;
};

const buildMaladieItems = (maladies: IMaladieDraft[], membres: IMembre[]): PastoralItem[] =>
  maladies.map((maladie) => {
    const linkedMember = maladie.idMembre
      ? membres.find((membre) => Number(membre.idMembre) === Number(maladie.idMembre))
      : null;

    return {
      id: `maladie-${maladie.idMaladie || maladie.idMembre || maladie.nomMembreMaladie}`,
      memberId: maladie.idMembre,
      name: maladie.nomMembreMaladie || (linkedMember ? memberName(linkedMember) : 'Personne malade'),
      contact: linkedMember?.contactMembre,
      residence: linkedMember?.residenceMembre,
      category: 'maladie',
      categoryLabel: 'Maladie',
      color: 'error',
      priority: 'haute',
      title: maladie.typeMaladie || 'Suivi maladie',
      description:
        maladie.observationMaladie ||
        maladie.lieuHospitalisation ||
        'Cas de maladie à suivre pastoralement.',
      date: maladie.dateMaladie,
      source: 'maladie',
    };
  });

const buildDecesItems = (deces: IDeces[], membres: IMembre[]): PastoralItem[] =>
  deces.map((item) => {
    const linkedMember = item.idMembre
      ? membres.find((membre) => Number(membre.idMembre) === Number(item.idMembre))
      : null;

    return {
      id: `deces-${item.idDeces || item.idMembre || item.nomMembreDeces}`,
      memberId: item.idMembre,
      name: item.nomMembreDeces || (linkedMember ? memberName(linkedMember) : 'Personne décédée'),
      contact: linkedMember?.contactMembre,
      residence: linkedMember?.residenceMembre,
      category: 'deces',
      categoryLabel: 'Décès',
      color: 'default',
      priority: 'haute',
      title: 'Accompagnement deuil',
      description: item.causeDeces || item.lieuDeces || 'Famille à accompagner après le décès.',
      date: item.dateDeces,
      source: 'deces',
    };
  });

function SummaryCard({
  color,
  icon,
  label,
  value,
}: {
  color: PastoralStatusColor;
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  const theme = useTheme();
  const paletteColor = color === 'default' ? theme.palette.text.primary : theme.palette[color].main;

  return (
    <Card
      sx={{
        p: 2,
        height: 1,
        borderRadius: 2,
        border: `1px solid ${alpha(paletteColor, 0.18)}`,
        bgcolor: alpha(paletteColor, theme.palette.mode === 'dark' ? 0.12 : 0.06),
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 42,
            height: 42,
            display: 'grid',
            borderRadius: 1.5,
            placeItems: 'center',
            color: paletteColor,
            bgcolor: alpha(paletteColor, theme.palette.mode === 'dark' ? 0.18 : 0.12),
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5">{value}</Typography>
        </Box>
      </Stack>
    </Card>
  );
}

function PastoralItemCard({ item, onOpen }: { item: PastoralItem; onOpen: (item: PastoralItem) => void }) {
  return (
    <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack spacing={1.25}>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          <Chip size="small" color={item.color} label={item.categoryLabel} />
          <Chip
            size="small"
            variant={item.priority === 'haute' ? 'filled' : 'outlined'}
            color={item.priority === 'haute' ? 'warning' : 'default'}
            label={item.priority === 'haute' ? 'Priorité' : 'Suivi'}
          />
        </Stack>

        <Box>
          <Typography variant="subtitle1">{item.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {item.title}
          </Typography>
        </Box>

        <Typography variant="body2">{item.description}</Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {item.date && <Chip size="small" variant="outlined" label={formatDate(item.date)} />}
          {item.contact && <Chip size="small" variant="outlined" label={item.contact} />}
          {item.residence && <Chip size="small" variant="outlined" label={item.residence} />}
        </Stack>

        <Button
          size="small"
          endIcon={<ArrowForwardRounded />}
          onClick={() => onOpen(item)}
          sx={{ alignSelf: 'flex-start' }}
        >
          Ouvrir
        </Button>
      </Stack>
    </Card>
  );
}

export function PastoralView() {
  const navigate = useNavigate();
  const currentUserId = useSelector((state: IReduxState) => getCurrentUserId(state));
  const [membres, setMembres] = useState<IMembre[]>([]);
  const [maladies, setMaladies] = useState<IMaladieDraft[]>([]);
  const [deces, setDeces] = useState<IDeces[]>([]);
  const [filter, setFilter] = useState<PastoralFilter>('all');
  const [priority, setPriority] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchPastoralData = useCallback(async () => {
    if (!currentUserId) {
      setMembres([]);
      setMaladies([]);
      setDeces([]);
      setLoading(false);
      return;
    }

    const safeLoad = async <T,>(loader: () => Promise<{ data?: T[] }>): Promise<T[]> => {
      try {
        const response = await loader();
        return Array.isArray(response?.data) ? response.data : [];
      } catch (_error) {
        return [];
      }
    };

    try {
      setLoading(true);
      setErrorMessage('');
      const [loadedMembres, loadedMaladies, loadedDeces] = await Promise.all([
        safeLoad<IMembre>(() => apiClient.getMembresByUtilisateur(currentUserId)),
        safeLoad<IMaladieDraft>(() => apiClient.getMaladiesByUtilisateur(currentUserId)),
        safeLoad<IDeces>(() => apiClient.getDecesByUtilisateur(currentUserId)),
      ]);

      setMembres(loadedMembres);
      setMaladies(loadedMaladies);
      setDeces(loadedDeces);
    } catch (error: any) {
      setErrorMessage(error?.message || 'Impossible de charger le suivi pastoral.');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchPastoralData();
  }, [fetchPastoralData]);

  const pastoralItems = useMemo(
    () => [
      ...buildMaladieItems(maladies, membres),
      ...buildMemberItems(membres),
      ...buildDecesItems(deces, membres),
    ],
    [deces, maladies, membres]
  );

  const filteredItems = useMemo(() => {
    const normalizedSearch = normalizeText(search);

    return pastoralItems.filter((item) => {
      const matchesFilter =
        filter === 'all' ||
        item.category === filter ||
        (filter === 'priority' && item.priority === 'haute');
      const matchesPriority = priority === 'all' || item.priority === priority;
      const haystack = normalizeText(
        [item.name, item.title, item.description, item.contact, item.residence, item.categoryLabel]
          .filter(Boolean)
          .join(' ')
      );

      return matchesFilter && matchesPriority && (!normalizedSearch || haystack.includes(normalizedSearch));
    });
  }, [filter, pastoralItems, priority, search]);

  const summary = useMemo(
    () => ({
      priority: pastoralItems.filter((item) => item.priority === 'haute').length,
      nouvelleAme: pastoralItems.filter((item) => item.category === 'nouvelle-ame').length,
      visite: pastoralItems.filter((item) => item.category === 'visite').length,
      bapteme: pastoralItems.filter((item) => item.category === 'bapteme').length,
      maladie: pastoralItems.filter((item) => item.category === 'maladie').length,
      deces: pastoralItems.filter((item) => item.category === 'deces').length,
    }),
    [pastoralItems]
  );

  const handleOpenItem = useCallback(
    (item: PastoralItem) => {
      if (item.source === 'membre' && item.memberId) {
        navigate(`/details/${item.memberId}`);
        return;
      }

      navigate('/cas-sociaux');
    },
    [navigate]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h4">Suivi pastoral</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              Nouveaux convertis, visites, pas encore baptisés, malades et accompagnement social.
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<AutorenewRounded />}
              onClick={fetchPastoralData}
              disabled={loading}
            >
              Actualiser
            </Button>
            <Button variant="contained" onClick={() => navigate('/cas-sociaux')}>
              Cas sociaux
            </Button>
          </Stack>
        </Stack>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <SummaryCard
              color="warning"
              icon={<VolunteerActivismRounded />}
              label="Priorités"
              value={summary.priority}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <SummaryCard
              color="success"
              icon={<PersonAddAlt1Rounded />}
              label="Nouveaux convertis"
              value={summary.nouvelleAme}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <SummaryCard color="warning" icon={<ChurchRounded />} label="Visites" value={summary.visite} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <SummaryCard color="info" icon={<WaterDropRounded />} label="Pas encore baptisés" value={summary.bapteme} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <SummaryCard color="error" icon={<HealingRounded />} label="Malades" value={summary.maladie} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <SummaryCard color="default" icon={<FavoriteRounded />} label="Décès" value={summary.deces} />
          </Grid>
        </Grid>

        <Card sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2 }}>
          <Stack spacing={2.5}>
            <Tabs
              value={filter}
              onChange={(_event, nextValue) => setFilter(nextValue)}
              variant="scrollable"
              allowScrollButtonsMobile
            >
              {filterOptions.map((option) => (
                <Tab key={option.value} value={option.value} label={option.label} />
              ))}
            </Tabs>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                fullWidth
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher un nom, contact, résidence ou observation..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                select
                label="Priorité"
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                sx={{ minWidth: { xs: 1, md: 220 } }}
              >
                <MenuItem value="all">Toutes les priorités</MenuItem>
                <MenuItem value="haute">Priorité haute</MenuItem>
                <MenuItem value="normale">Suivi normal</MenuItem>
                <MenuItem value="suivi">À surveiller</MenuItem>
              </TextField>
            </Stack>

            {loading && <LinearProgress />}

            {!loading && filteredItems.length === 0 && (
              <Alert severity="info">
                Aucun élément pastoral ne correspond aux filtres sélectionnés.
              </Alert>
            )}

            <Grid container spacing={2}>
              {filteredItems.map((item) => (
                <Grid key={item.id} item xs={12} md={6} xl={4}>
                  <PastoralItemCard item={item} onOpen={handleOpenItem} />
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Card>

        <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
            <CircularProgress variant="determinate" value={100} size={34} thickness={5} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2">Lecture pastorale automatique</Typography>
              <Typography variant="body2" color="text.secondary">
                Cette page exploite les informations déjà saisies dans les membres et les cas sociaux.
                Les absences précises nécessiteront plus tard un module de présence par culte ou par
                cellule.
              </Typography>
            </Box>
            <Divider flexItem orientation="vertical" sx={{ display: { xs: 'none', md: 'block' } }} />
            <Tooltip title="Les corrections se font dans la fiche membre ou dans Cas sociaux.">
              <Chip label={`${filteredItems.length} élément(s) affiché(s)`} />
            </Tooltip>
          </Stack>
        </Card>
      </Stack>
    </DashboardContent>
  );
}
