import type { IReduxState } from 'src/store/store';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

import {
  Box,
  Card,
  Chip,
  Stack,
  Avatar,
  Button,
  Divider,
  Typography,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import {
  PhoneRounded,
  SchoolRounded,
  PersonRounded,
  MenuBookRounded,
  CalendarTodayRounded,
  ArrowBackRounded,
  WorkspacePremiumRounded,
} from '@mui/icons-material';

import { DashboardContent } from 'src/layouts/dashboard';
import { buildPhotoUrl, apiClient, getApiErrorMessage } from 'src/utils/apiClient';
import { getSessionUser, getScopeUserIdFromUser } from 'src/utils/access-control';
import { useNotificationSnackbar } from 'src/components/alert/notificationSnackbar';

import { libelleFonction } from '../../constantes';
import { Fait, CarteFiche, formaterDate, BanniereFiche } from '../fiche-elements';

// ----------------------------------------------------------------------
// Fiche d'un moniteur : ses classes et ce qu'il a tenu.
//
// Le moniteur n'est pas une personne en soi — c'est un membre de l'église dans un
// rôle. Sa fiche montre donc son rattachement à l'école du dimanche, et renvoie à
// sa fiche membre pour l'état civil.

export default function MoniteurDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showNotification, NotificationComponent } = useNotificationSnackbar();
  const sessionUser = useSelector((state: IReduxState) => getSessionUser(state));
  const idUtilisateur = getScopeUserIdFromUser(sessionUser) || 0;

  const [chargement, setChargement] = useState(true);
  const [moniteur, setMoniteur] = useState<any | null>(null);
  const [cultes, setCultes] = useState<any[]>([]);
  const [activites, setActivites] = useState<any[]>([]);

  const charger = useCallback(async () => {
    if (!id || !idUtilisateur) {
      setChargement(false);
      return;
    }

    try {
      setChargement(true);
      const [moniteursRes, cultesRes, activitesRes] = await Promise.allSettled([
        apiClient.getMoniteursEcodim(idUtilisateur),
        apiClient.getCultesEcodim(idUtilisateur),
        apiClient.getActivitesEcodim(idUtilisateur),
      ]);

      const extraire = (resultat: PromiseSettledResult<any>): any[] =>
        resultat.status === 'fulfilled' && Array.isArray(resultat.value?.data)
          ? resultat.value.data
          : [];

      setMoniteur(
        extraire(moniteursRes).find((element) => String(element.idMoniteur) === String(id)) || null
      );
      setCultes(extraire(cultesRes));
      setActivites(extraire(activitesRes));
    } catch (error) {
      showNotification(getApiErrorMessage(error, 'Chargement impossible.'), 'error');
    } finally {
      setChargement(false);
    }
  }, [id, idUtilisateur, showNotification]);

  useEffect(() => {
    charger();
  }, [charger]);

  const nomComplet = `${moniteur?.nomMembre || ''} ${moniteur?.prenomMembre || ''}`.trim();
  const classes = useMemo(() => moniteur?.classes || [], [moniteur]);

  /** Cultes où il a dirigé ou enseigné. */
  const sesCultes = useMemo(
    () =>
      cultes.filter(
        (culte) =>
          String(culte.idMoniteurDirigeant) === String(id) ||
          String(culte.idMoniteurEnseignant) === String(id)
      ),
    [cultes, id]
  );

  const sesActivites = useMemo(
    () =>
      activites.filter(
        (activite) =>
          String(activite.idMoniteurDirigeant) === String(id) ||
          String(activite.idMoniteurEnseignant) === String(id)
      ),
    [activites, id]
  );

  if (chargement) {
    return (
      <DashboardContent>
        <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
          <CircularProgress />
        </Stack>
      </DashboardContent>
    );
  }

  if (!moniteur) {
    return (
      <DashboardContent>
        <Stack spacing={2} alignItems="flex-start" sx={{ py: 6 }}>
          <Typography variant="h5">Moniteur introuvable</Typography>
          <Typography variant="body2" color="text.secondary">
            Ce moniteur a peut-être été retiré depuis l&apos;ouverture du lien.
          </Typography>
          <Button startIcon={<ArrowBackRounded />} onClick={() => navigate('/ecodim')}>
            Revenir à l&apos;Ecodim
          </Button>
        </Stack>
      </DashboardContent>
    );
  }

  const photo = moniteur.photoMembre ? buildPhotoUrl(moniteur.photoMembre) : '';

  return (
    <DashboardContent>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackRounded />} onClick={() => navigate('/ecodim')}>
          Retour
        </Button>
        <Button
          startIcon={<PersonRounded />}
          onClick={() => navigate(`/details/${moniteur.idMembre}`)}
        >
          Voir sa fiche membre
        </Button>
      </Stack>

      <Card sx={{ overflow: 'hidden', mb: 3 }}>
        <Box sx={{ position: 'relative' }}>
          <BanniereFiche surtitre="Moniteur de l'école du dimanche" titre={nomComplet || 'Moniteur'}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="center">
              <Chip color="primary" variant="outlined" label={libelleFonction(moniteur.fonctionMoniteur)} />
              <Chip
                color="secondary"
                variant="outlined"
                label={`${classes.length} classe${classes.length > 1 ? 's' : ''}`}
              />
              {Boolean(moniteur.estResponsable) && (
                <Chip color="success" variant="outlined" label="Responsable de classe" />
              )}
            </Stack>
          </BanniereFiche>

          {/* La photo vient de la fiche membre : un moniteur n'en a pas en propre. */}
          <Avatar
            src={photo || undefined}
            alt={nomComplet}
            sx={{
              position: 'absolute',
              top: { xs: 60, md: 85 },
              left: '50%',
              transform: 'translateX(-50%)',
              width: { xs: 110, md: 150 },
              height: { xs: 110, md: 150 },
              border: (theme) => `6px solid ${theme.palette.background.paper}`,
            }}
          >
            {!photo && <PersonRounded sx={{ fontSize: 64 }} />}
          </Avatar>
        </Box>

        <Box sx={{ px: { xs: 2, md: 4 }, pb: 4, pt: { xs: 7, md: 9 } }}>
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <CarteFiche titre="Le moniteur">
                <Fait icone={<PersonRounded />} libelle="Nom et prénoms" valeur={nomComplet} />
                <Fait icone={<PhoneRounded />} libelle="Contact" valeur={moniteur.contactMembre} />
                <Fait
                  icone={<WorkspacePremiumRounded />}
                  libelle="Fonction au bureau"
                  valeur={libelleFonction(moniteur.fonctionMoniteur)}
                />
                <Fait
                  icone={<CalendarTodayRounded />}
                  libelle="Affecté le"
                  valeur={formaterDate(moniteur.dateAffectation)}
                />
              </CarteFiche>
            </Grid>

            <Grid xs={12} md={6}>
              <CarteFiche titre="Classes encadrées">
                {classes.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Ce moniteur n&apos;est rattaché à aucune classe.
                  </Typography>
                ) : (
                  classes.map((lien: any) => (
                    <Stack
                      key={lien.idClasseEcodim}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/ecodim/classe/${lien.idClasseEcodim}`)}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <SchoolRounded color="primary" fontSize="small" />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {lien.libelleClasse}
                        </Typography>
                      </Stack>
                      {Number(lien.estPrincipal) === 1 && (
                        <Chip size="small" color="primary" label="Responsable" />
                      )}
                    </Stack>
                  ))
                )}
              </CarteFiche>
            </Grid>

            <Grid xs={12} md={6}>
              <CarteFiche titre={`Cultes tenus (${sesCultes.length})`}>
                {sesCultes.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Aucun culte à son nom pour le moment.
                  </Typography>
                ) : (
                  sesCultes.slice(0, 10).map((culte) => (
                    <Box key={culte.idCulteEcodim}>
                      <Stack direction="row" spacing={1} justifyContent="space-between">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <MenuBookRounded color="primary" fontSize="small" />
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {formaterDate(culte.dateCulte)}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {String(culte.idMoniteurEnseignant) === String(id)
                            ? 'Enseignement'
                            : 'Direction'}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
                        {culte.libelleClasse || ''}
                      </Typography>
                      <Divider sx={{ mt: 1 }} />
                    </Box>
                  ))
                )}
              </CarteFiche>
            </Grid>

            <Grid xs={12} md={6}>
              <CarteFiche titre={`Activités (${sesActivites.length})`}>
                {sesActivites.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Aucune activité à son nom pour le moment.
                  </Typography>
                ) : (
                  sesActivites.slice(0, 10).map((activite) => (
                    <Stack
                      key={activite.idActiviteEcodim}
                      direction="row"
                      spacing={1}
                      justifyContent="space-between"
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {activite.titreActivite}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formaterDate(activite.dateDebutActivite)}
                      </Typography>
                    </Stack>
                  ))
                )}
              </CarteFiche>
            </Grid>
          </Grid>
        </Box>
      </Card>

      <NotificationComponent />
    </DashboardContent>
  );
}
