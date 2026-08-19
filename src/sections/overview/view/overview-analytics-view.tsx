import { useCallback, useEffect, useMemo, useState } from 'react';
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
  normalizeDashboardVerseMode,
  type DashboardVerse,
} from 'src/data/daily-verses';
import { DashboardContent } from 'src/layouts/dashboard';
import { apiClient } from 'src/utils/apiClient';
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

    return getDailyVerse();
  }, [
    sessionUser?.modeVersetDashboard,
    sessionUser?.versetDashboardReference,
    sessionUser?.versetDashboardTexte,
  ]);

  const loadStats = useCallback(async () => {
      try {
        // Toutes les cartes du dashboard restent bornees au compte connecte.
        const [membresRes, cultesRes, departementsRes, cellulesRes, groupesRes] = await Promise.all([
          apiClient.getMembres(),
          currentUserId ? apiClient.getCultesByUtilisateur(currentUserId) : apiClient.getCultes(),
          currentUserId
            ? apiClient.getDepartementsByUtilisateur(currentUserId)
            : apiClient.getDepartements(),
          currentUserId ? apiClient.getCellulesByUtilisateur(currentUserId) : apiClient.getCellules(),
          currentUserId ? apiClient.getGroupesByUtilisateur(currentUserId) : apiClient.getGroupes(),
        ]);

        const allMembres = Array.isArray(membresRes?.data)
          ? membresRes.data
          : listMembre;

        setTotals({
          membres: allMembres.length,
          cultes: Array.isArray(cultesRes?.data) ? cultesRes.data.length : listCulte.length,
          departements: Array.isArray(departementsRes?.data)
            ? departementsRes.data.length
            : listDepartement.length,
          cellules: Array.isArray(cellulesRes?.data) ? cellulesRes.data.length : listCellule.length,
          groupes: Array.isArray(groupesRes?.data) ? groupesRes.data.length : listGroupe.length,
        });
      } catch (error) {
        setTotals({
          membres: listMembre.length,
          cultes: listCulte.length,
          departements: listDepartement.length,
          cellules: listCellule.length,
          groupes: listGroupe.length,
        });
      }
  }, [
    currentUserId,
    listCulte.length,
    listCellule.length,
    listDepartement.length,
    listGroupe.length,
    listMembre,
  ]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (!currentUserId) {
      return undefined;
    }

    const shouldRefreshForUser = (payload: any) => {
      if (!payload?.idUtilisateur) {
        return true;
      }

      return Number(payload.idUtilisateur) === Number(currentUserId);
    };

    const refreshStats = (payload: any) => {
      if (shouldRefreshForUser(payload)) {
        loadStats();
      }
    };

    const unsubscribers = [
      subscribeToCommunauteEvent('ajouterMembre', refreshStats),
      subscribeToCommunauteEvent('modifierMembre', refreshStats),
      subscribeToCommunauteEvent('supprimerMembre', refreshStats),
      subscribeToCommunauteEvent('ajouterDeces', refreshStats),
      subscribeToCommunauteEvent('modifierDeces', refreshStats),
      subscribeToCommunauteEvent('supprimerDeces', refreshStats),
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [currentUserId, loadStats]);

  const totalGeneral = useMemo(
    // On garde un total global unique pour alimenter les sous-titres et la synthese.
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
            title="Departements"
            total={totals.departements}
            percent={0}
            color="warning"
            icon={
              <StatIcon>
                <ApartmentRounded color="warning" />
              </StatIcon>
            }
            chart={{
              categories: ['Departements'],
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
            title="Repartition générale"
            subheader={`Total enregistre : ${totalGeneral}`}
            chart={{
              series: [
                { label: 'Membres', value: totals.membres },
                { label: 'Cultes', value: totals.cultes },
                { label: 'Departements', value: totals.departements },
                { label: 'Cellules', value: totals.cellules },
                { label: 'Groupes', value: totals.groupes },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          {/* Cette serie compare toutes les entites sur une meme echelle. */}
          <AnalyticsWebsiteVisits
            title="Vue globale de la communaute"
            subheader={`Total enregistre : ${totalGeneral}`}
            chart={{
              categories: ['Membres', 'Cultes', 'Departements', 'Cellules', 'Groupes'],
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

