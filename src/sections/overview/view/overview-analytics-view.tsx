import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import {
  ApartmentRounded,
  ChurchRounded,
  Diversity3Rounded,
  FormatQuoteRounded,
  GroupsRounded,
  HomeRounded,
} from '@mui/icons-material';

import {
  getDailyVerse,
  formatIsoDate,
  normalizeDashboardVerseMode,
  type DashboardVerse,
  type ScheduledVerse,
} from 'src/data/daily-verses';
import { DashboardContent } from 'src/layouts/dashboard';
import { ApiError, apiClient, type IServerResponse } from 'src/utils/apiClient';
import { subscribeToCommunauteEvent } from 'src/utils/socket-client';

import { AnalyticsCurrentVisits } from '../analytics-current-visits';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';

// ----------------------------------------------------------------------

const StatIcon = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      width: 48,
      height: 48,
      borderRadius: 2,
      display: 'grid',
      placeItems: 'center',
      bgcolor: 'common.white',
      boxShadow: (theme) => theme.customShadows.z8,
    }}
  >
    {children}
  </Box>
);

// Événements serveur qui rendent les totaux du tableau de bord obsolètes.
const DASHBOARD_REFRESH_EVENTS = [
  'ajouterMembre',
  'modifierMembre',
  'supprimerMembre',
  'ajouterDeces',
  'modifierDeces',
  'supprimerDeces',
  'ajouterCulte',
  'modifierCulte',
  'supprimerCulte',
  'ajouterDepartement',
  'modifierDepartement',
  'supprimerDepartement',
  'ajouterCellule',
  'modifierCellule',
  'supprimerCellule',
  'ajouterGroupe',
  'modifierGroupe',
  'supprimerGroupe',
  'demandeInscriptionMembreTraitee',
];

// Un module encore vide répond 400 avec "Aucun X trouvé" : c'est un compteur à zéro,
// pas une panne réseau. On le distingue pour ne pas afficher un repli trompeur.
const isEmptyListError = (error: unknown): boolean =>
  error instanceof ApiError && (error.status === 404 || /^aucun/i.test(String(error.message).trim()));

const countFromSettled = (
  result: PromiseSettledResult<IServerResponse>,
  fallbackCount: number
): number => {
  if (result.status === 'fulfilled') {
    return Array.isArray(result.value?.data) ? result.value.data.length : fallbackCount;
  }

  // Seule une vraie erreur (serveur injoignable, 500...) justifie de garder
  // la dernière valeur connue plutôt que d'annoncer zéro.
  return isEmptyListError(result.reason) ? 0 : fallbackCount;
};

const formatDashboardDate = (date: Date) => {
  const dayName = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(date);
  const monthName = new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(date);
  const day = String(date.getDate()).padStart(2, '0');
  const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

  return `${capitalize(dayName)} le ${day} ${capitalize(monthName)} ${date.getFullYear()}`;
};

export function OverviewAnalyticsView() {
  const [totals, setTotals] = useState({
    membres: 0,
    cultes: 0,
    departements: 0,
    cellules: 0,
    groupes: 0,
  });

  const listMembre = useSelector((state: any) => state.membre?.listMembre || []);
  const listCulte = useSelector((state: any) => state.culte?.listCulte || []);
  const listDepartement = useSelector((state: any) => state.departement?.listDepartement || []);
  const listCellule = useSelector((state: any) => state.cellule?.listCellule || []);
  const listGroupe = useSelector((state: any) => state.groupe?.listGroupe || []);
  const appUserConnected = useSelector((state: any) => state.application?.userConnected);
  const authUtilisateurData = useSelector((state: any) => state.authentification?.utilisateurData);
  const sessionUser = useMemo(
    () => ({ ...authUtilisateurData, ...appUserConnected }),
    [appUserConnected, authUtilisateurData]
  );
  const currentUserId =
    Number(appUserConnected?.idUtilisateurParent || appUserConnected?.idUtilisateur)
    || Number(authUtilisateurData?.idUtilisateurParent || authUtilisateurData?.idUtilisateur)
    || null;
  const dashboardDateLabel = useMemo(() => formatDashboardDate(new Date()), []);

  // Liste des versets programmes par l'administrateur (mode "scheduled").
  // Chargee une fois que l'église connectée est connue.
  const [scheduledVerses, setScheduledVerses] = useState<ScheduledVerse[]>([]);

  useEffect(() => {
    // "cancelled" évite d'écrire le résultat d'une requête devenue périmée
    // (ex: l'utilisateur change de compte pendant que la requête précédente
    // est encore en cours) : on ignore alors sa réponse quand elle arrive.
    let cancelled = false;

    if (!currentUserId) {
      setScheduledVerses([]);
      return undefined;
    }

    apiClient.getVersetsProgramme(currentUserId)
      .then((response) => {
        if (!cancelled && response.status === 1) {
          setScheduledVerses(Array.isArray(response.data) ? response.data : []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setScheduledVerses([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  const dashboardVerse = useMemo<DashboardVerse | null>(() => {
    const mode = normalizeDashboardVerseMode(sessionUser?.modeVersetDashboard);

    if (mode === 'disabled') {
      return null;
    }

    if (mode === 'custom') {
      const text = String(sessionUser?.versetDashboardTexte || '').trim();
      const reference = String(sessionUser?.versetDashboardReference || '').trim();

      if (!text) {
        return null;
      }

      return { text, reference };
    }

    if (mode === 'scheduled') {
      const today = formatIsoDate(new Date());
      const todaysVerse = scheduledVerses.find((verse) => verse.dateAffichage === today);

      // Si rien n'est programme pour aujourd'hui, on retombe sur le verset
      // automatique plutôt que de laisser le tableau de bord vide.
      if (todaysVerse) {
        return { text: todaysVerse.texte, reference: todaysVerse.reference };
      }

      return getDailyVerse();
    }

    return getDailyVerse();
  }, [
    scheduledVerses,
    sessionUser?.modeVersetDashboard,
    sessionUser?.versetDashboardReference,
    sessionUser?.versetDashboardTexte,
  ]);

  // Les compteurs du store ne servent que de repli : on les garde dans une ref pour
  // que loadStats ne soit pas recréé à chaque changement de liste (et ne relance pas
  // une rafale de requêtes).
  const storeCountsRef = useRef({
    membres: 0,
    cultes: 0,
    departements: 0,
    cellules: 0,
    groupes: 0,
  });

  useEffect(() => {
    storeCountsRef.current = {
      membres: listMembre.length,
      cultes: listCulte.length,
      departements: listDepartement.length,
      cellules: listCellule.length,
      groupes: listGroupe.length,
    };
  }, [
    listCellule.length,
    listCulte.length,
    listDepartement.length,
    listGroupe.length,
    listMembre.length,
  ]);

  const loadStats = useCallback(async () => {
    // allSettled et non all : un module vide répond 400 "Aucun X trouvé", et un seul
    // rejet suffisait à faire retomber TOUTES les cartes sur le store, vide tant qu'un
    // autre onglet n'avait pas été ouvert. D'où le tableau de bord à 00 au démarrage.
    const [membresRes, cultesRes, departementsRes, cellulesRes, groupesRes] =
      await Promise.allSettled([
        // Toutes les cartes du dashboard restent bornées au compte connecté.
        currentUserId ? apiClient.getMembresByUtilisateur(currentUserId) : apiClient.getMembres(),
        currentUserId ? apiClient.getCultesByUtilisateur(currentUserId) : apiClient.getCultes(),
        currentUserId
          ? apiClient.getDepartementsByUtilisateur(currentUserId)
          : apiClient.getDepartements(),
        currentUserId ? apiClient.getCellulesByUtilisateur(currentUserId) : apiClient.getCellules(),
        currentUserId ? apiClient.getGroupesByUtilisateur(currentUserId) : apiClient.getGroupes(),
      ]);

    const fallback = storeCountsRef.current;

    setTotals({
      membres: countFromSettled(membresRes, fallback.membres),
      cultes: countFromSettled(cultesRes, fallback.cultes),
      departements: countFromSettled(departementsRes, fallback.departements),
      cellules: countFromSettled(cellulesRes, fallback.cellules),
      groupes: countFromSettled(groupesRes, fallback.groupes),
    });
  }, [currentUserId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    // Sans utilisateur courant (superadmin fixe), on écoute tout : les compteurs
    // affichés ne sont eux non plus bornés à un compte.
    const shouldRefreshForUser = (payload: any) => {
      if (!currentUserId || !payload?.idUtilisateur) {
        return true;
      }

      return Number(payload.idUtilisateur) === Number(currentUserId);
    };

    // Une suppression multiple émet un événement par ligne : on regroupe les
    // rafales pour ne recalculer les totaux qu'une fois.
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    const refreshStats = (payload: any) => {
      if (!shouldRefreshForUser(payload)) {
        return;
      }

      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }

      refreshTimer = setTimeout(() => {
        refreshTimer = null;
        loadStats();
      }, 300);
    };

    const unsubscribers = DASHBOARD_REFRESH_EVENTS.map((eventName) =>
      subscribeToCommunauteEvent(eventName, refreshStats)
    );

    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [currentUserId, loadStats]);

  const totalGeneral = useMemo(
    // On garde un total global unique pour alimenter les sous-titres et la synthèse.
    () => totals.membres + totals.cultes + totals.departements + totals.cellules + totals.groupes,
    [totals]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 1 }}>
        Tableau de bord communautaire
      </Typography>



      <Grid container spacing={3}>
         {/* Cette carte affiche le verset du jour ou le verset personnalise, selon la configuration de l'utilisateur. */}

        {dashboardVerse && (
          <Grid xs={12}>
            <Card
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #111827 0%, #172554 100%)'
                    : 'linear-gradient(135deg, #f8fbff 0%, #eef6ff 100%)',
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  gap: 2,
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  flexDirection: { xs: 'column', sm: 'row' },
                  p: { xs: 2.5, md: 3 },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'grid',
                    flexShrink: 0,
                    placeItems: 'center',
                    color: 'primary.main',
                    bgcolor: 'background.paper',
                  }}
                >
                  <FormatQuoteRounded />
                </Box>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      mb: 0.5,
                      width: '100%',
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontStyle: 'italic', textAlign: 'right' }}
                    >
                      {dashboardDateLabel}
                    </Typography>
                  </Box>
                  <Typography variant="overline" color="text.secondary">
                    Verset du jour
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>
                    {dashboardVerse.text}
                  </Typography>
                  {dashboardVerse.reference && (
                    <Typography variant="subtitle2" color="primary.main" sx={{ mt: 1 }}>
                      {dashboardVerse.reference}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}


        {/* Ces cartes resument les volumes principaux de la communaute. */}
        <Grid xs={12} sm={6} md={4} lg={2.4}>
          <AnalyticsWidgetSummary
            title="Membres"
            total={totals.membres}
            percent={0}
            icon={
              <StatIcon>
                <GroupsRounded color="primary" />
              </StatIcon>
            }
            chart={{
              categories: ['Membres'],
              series: [totals.membres],
            }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={4} lg={2.4}>
          <AnalyticsWidgetSummary
            title="Cultes"
            total={totals.cultes}
            percent={0}
            color="secondary"
            icon={
              <StatIcon>
                <ChurchRounded color="secondary" />
              </StatIcon>
            }
            chart={{
              categories: ['Cultes'],
              series: [totals.cultes],
            }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={4} lg={2.4}>
          <AnalyticsWidgetSummary
            title="Départements"
            total={totals.departements}
            percent={0}
            color="warning"
            icon={
              <StatIcon>
                <ApartmentRounded color="warning" />
              </StatIcon>
            }
            chart={{
              categories: ['Départements'],
              series: [totals.departements],
            }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={4} lg={2.4}>
          <AnalyticsWidgetSummary
            title="Cellules"
            total={totals.cellules}
            percent={0}
            color="success"
            icon={
              <StatIcon>
                <HomeRounded color="success" />
              </StatIcon>
            }
            chart={{
              categories: ['Cellules'],
              series: [totals.cellules],
            }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={4} lg={2.4}>
          <AnalyticsWidgetSummary
            title="Groupes"
            total={totals.groupes}
            percent={0}
            color="error"
            icon={
              <StatIcon>
                <Diversity3Rounded color="error" />
              </StatIcon>
            }
            chart={{
              categories: ['Groupes'],
              series: [totals.groupes],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          {/* Cette vue sert a lire d'un coup d'oeil la repartition entre modules. */}
          <AnalyticsCurrentVisits
            title="Répartition générale"
            subheader={`Total enregistré : ${totalGeneral}`}
            chart={{
              series: [
                { label: 'Membres', value: totals.membres },
                { label: 'Cultes', value: totals.cultes },
                { label: 'Départements', value: totals.departements },
                { label: 'Cellules', value: totals.cellules },
                { label: 'Groupes', value: totals.groupes },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          {/* Cette serie compare toutes les entites sur une meme echelle. */}
          <AnalyticsWebsiteVisits
            title="Vue globale de la communauté"
            subheader={`Total enregistré : ${totalGeneral}`}
            chart={{
              categories: ['Membres', 'Cultes', 'Départements', 'Cellules', 'Groupes'],
              series: [
                {
                  name: 'Total',
                  data: [
                    totals.membres,
                    totals.cultes,
                    totals.departements,
                    totals.cellules,
                    totals.groupes,
                  ],
                },
              ],
            }}
          />
        </Grid>


      </Grid>
    </DashboardContent>
  );
}

