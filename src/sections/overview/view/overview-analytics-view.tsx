import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  ApartmentRounded,
  ChurchRounded,
  Diversity3Rounded,
  GroupsRounded,
  HomeRounded,
} from '@mui/icons-material';

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
  const currentUserId =
    Number(appUserConnected?.idUtilisateur)
    || Number(authUtilisateurData?.idUtilisateur)
    || null;

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

      <Typography sx={{ color: 'text.secondary', mb: { xs: 3, md: 5 } }}>
        Vue synthetique des membres, de la vie d&apos;eglise et de la structure interne.
      </Typography>

      <Grid container spacing={3}>
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
                {/* La cellule represente une maison de priere dans ce contexte. */}
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
            title="Repartition generale"
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

