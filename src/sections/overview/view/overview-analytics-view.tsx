import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { apiClient } from 'src/utils/apiClient';
import { resolveStaticAssetUrl } from 'src/utils/asset-url';

import { AnalyticsCurrentVisits } from '../analytics-current-visits';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';

// ----------------------------------------------------------------------

export function OverviewAnalyticsView() {
  const membersIconUrl = resolveStaticAssetUrl('/assets/icons/glass/ic-glass-users.svg');
  const cultesIconUrl = resolveStaticAssetUrl('/assets/icons/glass/ic-glass-buy.svg');
  const departementsIconUrl = resolveStaticAssetUrl('/assets/icons/glass/ic-glass-bag.svg');

  const [totals, setTotals] = useState({
    membres: 0,
    cultes: 0,
    departements: 0,
  });

  const listMembre = useSelector((state: any) => state.membre?.listMembre || []);
  const listCulte = useSelector((state: any) => state.culte?.listCulte || []);
  const listDepartement = useSelector((state: any) => state.departement?.listDepartement || []);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [membresRes, cultesRes, departementsRes] = await Promise.all([
          apiClient.getMembres(),
          apiClient.getCultes(),
          apiClient.getDepartements(),
        ]);

        setTotals({
          membres: Array.isArray(membresRes?.data) ? membresRes.data.length : listMembre.length,
          cultes: Array.isArray(cultesRes?.data) ? cultesRes.data.length : listCulte.length,
          departements: Array.isArray(departementsRes?.data)
            ? departementsRes.data.length
            : listDepartement.length,
        });
      } catch (error) {
        setTotals({
          membres: listMembre.length,
          cultes: listCulte.length,
          departements: listDepartement.length,
        });
      }
    };

    loadStats();
  }, [listCulte.length, listDepartement.length, listMembre.length]);

  const totalGeneral = useMemo(
    () => totals.membres + totals.cultes + totals.departements,
    [totals]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        TABLEAU DE BORD
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={4}>
          <AnalyticsWidgetSummary
            title="Membres"
            total={totals.membres}
            percent={0}
            icon={<img alt="Membres" src={membersIconUrl} />}
            chart={{
              categories: ['Total'],
              series: [totals.membres],
            }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <AnalyticsWidgetSummary
            title="Cultes"
            total={totals.cultes}
            percent={0}
            color="secondary"
            icon={<img alt="Cultes" src={cultesIconUrl} />}
            chart={{
              categories: ['Total'],
              series: [totals.cultes],
            }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <AnalyticsWidgetSummary
            title="Départements"
            total={totals.departements}
            percent={0}
            color="warning"
            icon={<img alt="Départements" src={departementsIconUrl} />}
            chart={{
              categories: ['Total'],
              series: [totals.departements],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsCurrentVisits
            title="Répartition"
            chart={{
              series: [
                { label: 'Membres', value: totals.membres },
                { label: 'Cultes', value: totals.cultes },
                { label: 'Départements', value: totals.departements },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AnalyticsWebsiteVisits
            title="Vue globale"
            subheader={`Total enregistré: ${totalGeneral}`}
            chart={{
              categories: ['Membres', 'Cultes', 'Départements'],
              series: [
                {
                  name: 'Total',
                  data: [totals.membres, totals.cultes, totals.departements],
                },
              ],
            }}
          />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}

