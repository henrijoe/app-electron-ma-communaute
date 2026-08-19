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

// Valeurs possibles pour l'onglet de filtre affiché en haut de la liste pastorale.
// 'all' et 'priority' sont des filtres transverses, les autres correspondent à une catégorie précise.
type PastoralFilter =
  | 'all'
  | 'priority'
  | 'nouvelle-ame'
  | 'visite'
  | 'bapteme'
  | 'maladie'
  | 'deces';

// Couleurs MUI utilisées pour les Chip/SummaryCard selon la catégorie de l'élément pastoral.
type PastoralStatusColor = 'default' | 'error' | 'info' | 'primary' | 'success' | 'warning';

// Une situation pastorale précise (ex: "pas encore baptisé d'eau") détectée pour une
// personne. Une même personne peut cumuler plusieurs situations : elles sont regroupées
// dans une seule PastoralItem plutôt que de générer une carte par situation.
type PastoralSituation = {
  category: Exclude<PastoralFilter, 'all' | 'priority'>;
  categoryLabel: string;
  color: PastoralStatusColor;
  priority: 'haute' | 'normale' | 'suivi';
  description: string;
  date?: string | null;
};

// Représente UNE carte de suivi pastoral par personne, affichée à l'écran. Elle peut
// regrouper plusieurs situations (nouvelle âme, visite, baptême manquant, maladie,
// décès). Ces éléments sont reconstruits à partir des membres, maladies et décès
// existants : il n'y a pas de table "pastoral" dédiée en base.
type PastoralItem = {
  id: string;
  memberId?: number | null;
  name: string;
  contact?: string;
  residence?: string;
  // Priorité globale de la carte = la situation la plus urgente qu'elle contient.
  priority: 'haute' | 'normale' | 'suivi';
  situations: PastoralSituation[];
  source: 'membre' | 'maladie' | 'deces';
};

// Ordre d'urgence utilisé pour déterminer la priorité globale d'une carte
// à partir de ses situations (0 = le plus urgent).
const PRIORITY_RANK: Record<'haute' | 'normale' | 'suivi', number> = {
  haute: 0,
  normale: 1,
  suivi: 2,
};

const worstPriority = (situations: PastoralSituation[]): 'haute' | 'normale' | 'suivi' =>
  situations.reduce<'haute' | 'normale' | 'suivi'>(
    (worst, situation) => (PRIORITY_RANK[situation.priority] < PRIORITY_RANK[worst] ? situation.priority : worst),
    'suivi'
  );

// Options affichées dans les onglets (Tabs) de filtrage.
const filterOptions: Array<{ value: PastoralFilter; label: string }> = [
  { value: 'all', label: 'Tout' },
  { value: 'priority', label: 'Priorités' },
  { value: 'nouvelle-ame', label: 'Nouveaux convertis' },
  { value: 'visite', label: 'Visites' },
  { value: 'bapteme', label: 'Pas encore baptisés' },
  { value: 'maladie', label: 'Malades' },
  { value: 'deces', label: 'Décès' },
];

// Récupère l'identifiant de l'utilisateur connecté (ou de la portée qui lui est assignée)
// afin de ne charger que les données pastorales qui le concernent.
const getCurrentUserId = (state: IReduxState): number => {
  const sessionUser = state.application.userConnected || state.authentification.utilisateurData;
  return Number(getScopeUserIdFromUser(sessionUser) || sessionUser?.idUtilisateur || 0);
};

// Les champs booléens des membres sont stockés sous des formats hétérogènes
// (0/1, 'oui'/'non', 'true'/'false') selon leur origine. isYes/isNo normalisent
// cette valeur pour l'interpréter de façon fiable.
const isYes = (value: unknown): boolean => {
  const normalized = normalizeText(String(value ?? ''));
  return normalized === '1' || normalized === 'oui' || normalized === 'true';
};

const isNo = (value: unknown): boolean => {
  const normalized = normalizeText(String(value ?? ''));
  return normalized === '2' || normalized === 'non' || normalized === 'false';
};

// Concatène nom et prénom du membre, avec un libellé de repli si les deux sont vides.
const memberName = (membre: Partial<IMembre>): string =>
  [membre.nomMembre, membre.prenomMembre].filter(Boolean).join(' ').trim() || 'Membre sans nom';

// Formate une date ISO/DB en date lisible française (jj/mm/aaaa).
// Retourne la valeur brute si elle n'est pas parsable, et une chaîne vide si absente.
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

// À partir de la liste des membres, génère UNE PastoralItem par membre ayant au moins
// une situation à suivre (nouvelle âme, visite manquante, baptême d'eau ou du
// Saint-Esprit non fait). Toutes les situations d'un même membre sont regroupées
// dans le tableau `situations` de sa carte, au lieu de générer une carte par situation.
const buildMemberItems = (membres: IMembre[]): PastoralItem[] => {
  const items: PastoralItem[] = [];

  membres.forEach((membre) => {
    const name = memberName(membre);
    const situations: PastoralSituation[] = [];

    // Cas 1 : le membre est marqué comme nouvelle âme (conversion récente à accompagner).
    if (isYes(membre.nouvelleAmeMembre)) {
      situations.push({
        category: 'nouvelle-ame',
        categoryLabel: 'Nouvelle âme',
        color: 'success',
        priority: isYes(membre.baptemeEauMembre) ? 'suivi' : 'normale',
        description: membre.dateConversionMembre
          ? `Conversion déclarée le ${formatDate(membre.dateConversionMembre)}.`
          : 'Conversion à accompagner et consolider.',
        date: membre.dateConversionMembre,
      });
    }

    // Cas 2 : la visite pastorale est marquée comme non faite, ou une raison de non-visite est renseignée.
    if (isNo(membre.visiteMembre) || membre.raisonNonVisiteMembre) {
      situations.push({
        category: 'visite',
        categoryLabel: 'Visite',
        color: 'warning',
        priority: 'haute',
        description:
          membre.raisonNonVisiteMembre ||
          "Le membre n'a pas encore reçu de visite ou la visite est indiquée comme non faite.",
      });
    }

    // Cas 3 : le membre n'est pas encore marqué comme baptisé d'eau.
    if (!isYes(membre.baptemeEauMembre)) {
      situations.push({
        category: 'bapteme',
        categoryLabel: "Pas encore baptisé d'eau",
        color: 'info',
        priority: isYes(membre.nouvelleAmeMembre) ? 'normale' : 'suivi',
        description: 'Ce membre n’est pas encore marqué comme baptisé d’eau.',
      });
    }

    // Cas 4 : le membre n'est pas encore marqué comme baptisé du Saint-Esprit.
    if (!isYes(membre.baptemeSaintEspritMembre)) {
      situations.push({
        category: 'bapteme',
        categoryLabel: 'Pas encore baptisé Saint-Esprit',
        color: 'primary',
        priority: 'suivi',
        description: 'Ce membre n’est pas encore marqué comme baptisé du Saint-Esprit.',
      });
    }

    // On ne crée une carte que si le membre a au moins une situation à suivre.
    if (situations.length > 0) {
      items.push({
        id: `membre-${membre.idMembre}`,
        memberId: Number(membre.idMembre),
        name,
        contact: membre.contactMembre,
        residence: membre.residenceMembre,
        source: 'membre',
        priority: worstPriority(situations),
        situations,
      });
    }
  });

  return items;
};

// Transforme chaque cas de maladie (module "cas sociaux") en carte pastorale.
// Si la maladie est liée à un membre existant, on récupère son contact et sa résidence.
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
      source: 'maladie',
      priority: 'haute',
      situations: [
        {
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
        },
      ],
    };
  });

// Transforme chaque décès (module "cas sociaux") en carte d'accompagnement de deuil.
// Même logique de rattachement au membre que buildMaladieItems.
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
      source: 'deces',
      priority: 'haute',
      situations: [
        {
          category: 'deces',
          categoryLabel: 'Décès',
          color: 'default',
          priority: 'haute',
          title: 'Accompagnement deuil',
          description: item.causeDeces || item.lieuDeces || 'Famille à accompagner après le décès.',
          date: item.dateDeces,
        },
      ],
    };
  });

// Petite carte de statistique affichée dans la rangée de résumé en haut de page
// (ex: nombre de priorités, nombre de nouvelles âmes, etc.).
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

// Carte pastorale d'UNE personne : nom, priorité globale, puis la liste de toutes
// ses situations à suivre (une ligne par situation, pas une carte par situation),
// contact/résidence si disponibles, et un bouton pour ouvrir la fiche liée.
function PastoralItemCard({ item, onOpen }: { item: PastoralItem; onOpen: (item: PastoralItem) => void }) {
  return (
    <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack spacing={1.25}>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1">{item.name}</Typography>
          <Chip
            size="small"
            variant={item.priority === 'haute' ? 'filled' : 'outlined'}
            color={item.priority === 'haute' ? 'warning' : 'default'}
            label={item.priority === 'haute' ? 'Priorité' : 'Suivi'}
          />
        </Stack>

        {/* Un chip de catégorie par situation, pour voir d'un coup d'œil tout ce qui concerne cette personne. */}
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {item.situations.map((situation, index) => (
            <Chip
              key={`${item.id}-chip-${index}`}
              size="small"
              color={situation.color}
              label={situation.categoryLabel}
            />
          ))}
        </Stack>

        {/* Détail de chaque situation, séparées par un trait pour rester lisibles dans une seule carte. */}
        <Stack spacing={1.25} divider={<Divider flexItem />}>
          {item.situations.map((situation, index) => (
            <Box key={`${item.id}-situation-${index}`}>
              <Typography variant="body2" color="text.secondary">
                {situation.description}
              </Typography>
              {situation.date && (
                <Chip size="small" variant="outlined" sx={{ mt: 0.75 }} label={formatDate(situation.date)} />
              )}
            </Box>
          ))}
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
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

// Page principale "Suivi pastoral" : agrège membres, maladies et décès déjà saisis
// ailleurs dans l'application pour en tirer une liste d'actions pastorales à mener
// (visites, baptêmes manquants, accompagnement de deuil/maladie, nouveaux convertis).
export function PastoralView() {
  const navigate = useNavigate();
  // Portée de l'utilisateur connecté : détermine quelles données pastorales charger.
  const currentUserId = useSelector((state: IReduxState) => getCurrentUserId(state));

  // Données brutes récupérées depuis l'API.
  const [membres, setMembres] = useState<IMembre[]>([]);
  const [maladies, setMaladies] = useState<IMaladieDraft[]>([]);
  const [deces, setDeces] = useState<IDeces[]>([]);

  // État des filtres pilotés par l'utilisateur (onglet de catégorie, priorité, recherche texte).
  const [filter, setFilter] = useState<PastoralFilter>('all');
  const [priority, setPriority] = useState('all');
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Charge en parallèle membres, maladies et décès pour l'utilisateur courant.
  // Chaque appel est protégé individuellement (safeLoad) pour qu'un échec sur une
  // source de données n'empêche pas d'afficher les autres.
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

  // Chargement initial (et rechargement si l'utilisateur courant change).
  useEffect(() => {
    fetchPastoralData();
  }, [fetchPastoralData]);

  // Fusionne les trois sources en une seule liste de cartes pastorales.
  // Recalculé uniquement quand une des sources de données change.
  const pastoralItems = useMemo(
    () => [
      ...buildMaladieItems(maladies, membres),
      ...buildMemberItems(membres),
      ...buildDecesItems(deces, membres),
    ],
    [deces, maladies, membres]
  );

  // Applique le filtre de catégorie (onglet), le filtre de priorité et la recherche
  // texte libre (nom, titre, description, contact, résidence, libellé de catégorie).
  const filteredItems = useMemo(() => {
    const normalizedSearch = normalizeText(search);

    return pastoralItems.filter((item) => {
      // Une carte correspond au filtre de catégorie si au moins une de ses situations correspond.
      const matchesFilter =
        filter === 'all' ||
        (filter === 'priority' && item.priority === 'haute') ||
        item.situations.some((situation) => situation.category === filter);
      const matchesPriority = priority === 'all' || item.priority === priority;
      const haystack = normalizeText(
        [
          item.name,
          item.contact,
          item.residence,
          ...item.situations.flatMap((situation) => [
            situation.description,
            situation.categoryLabel,
          ]),
        ]
          .filter(Boolean)
          .join(' ')
      );

      return matchesFilter && matchesPriority && (!normalizedSearch || haystack.includes(normalizedSearch));
    });
  }, [filter, pastoralItems, priority, search]);

  // Compteurs affichés dans les SummaryCard, calculés sur l'ensemble des situations
  // (pas des cartes) pour rester cohérents avec l'ancien comptage : un membre avec
  // 2 baptêmes manquants compte pour 2 dans "Pas encore baptisés".
  const summary = useMemo(() => {
    const situationCount = (category: PastoralSituation['category']) =>
      pastoralItems.reduce(
        (count, item) => count + item.situations.filter((situation) => situation.category === category).length,
        0
      );

    return {
      priority: pastoralItems.filter((item) => item.priority === 'haute').length,
      nouvelleAme: situationCount('nouvelle-ame'),
      visite: situationCount('visite'),
      bapteme: situationCount('bapteme'),
      maladie: situationCount('maladie'),
      deces: situationCount('deces'),
    };
  }, [pastoralItems]);

  // Navigue vers la fiche membre si l'élément est rattaché à un membre,
  // sinon vers le module "cas sociaux" (cas maladie/décès sans membre lié).
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

        {/* Rangée de compteurs (résumé global, non affecté par les filtres). */}
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
              label="Nouvelle âmes"
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

        {/* Bloc principal : onglets de catégorie, recherche/priorité, puis liste des cartes filtrées. */}
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


            <Grid container spacing={2}>
              {filteredItems.map((item) => (
                <Grid key={item.id} item xs={12} md={6} xl={4}>
                  <PastoralItemCard item={item} onOpen={handleOpenItem} />
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Card>

        {/* Bandeau explicatif : rappelle que cette page ne fait que dériver des données
            existantes (membres/cas sociaux) et n'a pas encore de module de présence dédié. */}
      
      </Stack>
    </DashboardContent>
  );
}
