import type { IReduxState } from 'src/store/store';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

import { Box, Card, Chip, Stack, Button, Divider, Typography, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import {
  GroupsRounded,
  SchoolRounded,
  ChildCareRounded,
  MenuBookRounded,
  ArrowBackRounded,
  DescriptionRounded,
} from '@mui/icons-material';

import { DashboardContent } from 'src/layouts/dashboard';
import { apiClient, getApiErrorMessage } from 'src/utils/apiClient';
import { getSessionUser, getScopeUserIdFromUser } from 'src/utils/access-control';
import { useNotificationSnackbar } from 'src/components/alert/notificationSnackbar';

import { libelleFonction, nomIntervenant } from '../../constantes';
import { Fait, CarteFiche, formaterDate, BanniereFiche } from '../fiche-elements';

// ----------------------------------------------------------------------
// Fiche d'une classe : ce qu'elle regroupe.
//
// Une classe n'a presque pas d'informations propres — un nom, une tranche d'âge.
// Son intérêt est ailleurs : qui l'encadre, quels enfants y sont inscrits, quels
// cultes y ont été tenus. C'est ce que cette page rassemble.

const libelleTrancheAge = (classe: any): string => {
  const min = classe?.ageMin;
  const max = classe?.ageMax;

  if (min !== null && min !== undefined && max !== null && max !== undefined) {
    return `${min} à ${max} ans`;
  }
  if (min !== null && min !== undefined) return `${min} ans et plus`;
  if (max !== null && max !== undefined) return `Jusqu'à ${max} ans`;

  return classe?.trancheAge || '';
};

export default function ClasseDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showNotification, NotificationComponent } = useNotificationSnackbar();
  const sessionUser = useSelector((state: IReduxState) => getSessionUser(state));
  const idUtilisateur = getScopeUserIdFromUser(sessionUser) || 0;

  const [chargement, setChargement] = useState(true);
  const [classe, setClasse] = useState<any | null>(null);
  const [moniteurs, setMoniteurs] = useState<any[]>([]);
  const [enfants, setEnfants] = useState<any[]>([]);
  const [cultes, setCultes] = useState<any[]>([]);

  const charger = useCallback(async () => {
    if (!id || !idUtilisateur) {
      setChargement(false);
      return;
    }

    try {
      setChargement(true);
      // allSettled : un volet vide ne doit pas vider les autres.
      const [classesRes, moniteursRes, enfantsRes, cultesRes] = await Promise.allSettled([
        apiClient.getClassesEcodim(idUtilisateur),
        apiClient.getMoniteursEcodim(idUtilisateur),
        apiClient.getEnfantsEcodim(idUtilisateur),
        apiClient.getCultesEcodim(idUtilisateur),
      ]);

      const extraire = (resultat: PromiseSettledResult<any>): any[] =>
        resultat.status === 'fulfilled' && Array.isArray(resultat.value?.data)
          ? resultat.value.data
          : [];

      setClasse(
        extraire(classesRes).find((element) => String(element.idClasseEcodim) === String(id)) || null
      );
      setMoniteurs(extraire(moniteursRes));
      setEnfants(extraire(enfantsRes));
      setCultes(extraire(cultesRes));
    } catch (error) {
      showNotification(getApiErrorMessage(error, 'Chargement impossible.'), 'error');
    } finally {
      setChargement(false);
    }
  }, [id, idUtilisateur, showNotification]);

  useEffect(() => {
    charger();
  }, [charger]);

  const moniteursDeLaClasse = useMemo(
    () =>
      moniteurs.filter((moniteur) =>
        (moniteur.classes || []).some((lien: any) => String(lien.idClasseEcodim) === String(id))
      ),
    [moniteurs, id]
  );

  const enfantsDeLaClasse = useMemo(
    () => enfants.filter((enfant) => String(enfant.idClasseEcodim) === String(id)),
    [enfants, id]
  );

  const cultesDeLaClasse = useMemo(
    () => cultes.filter((culte) => String(culte.idClasseEcodim) === String(id)),
    [cultes, id]
  );

  /** Le moniteur est-il responsable de CETTE classe, et pas d'une autre ? */
  const estResponsableIci = (moniteur: any): boolean =>
    (moniteur.classes || []).some(
      (lien: any) => String(lien.idClasseEcodim) === String(id) && Number(lien.estPrincipal) === 1
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

  if (!classe) {
    return (
      <DashboardContent>
        <Stack spacing={2} alignItems="flex-start" sx={{ py: 6 }}>
          <Typography variant="h5">Classe introuvable</Typography>
          <Typography variant="body2" color="text.secondary">
            Cette classe a peut-être été supprimée depuis l&apos;ouverture du lien.
          </Typography>
          <Button startIcon={<ArrowBackRounded />} onClick={() => navigate('/ecodim')}>
            Revenir à l&apos;Ecodim
          </Button>
        </Stack>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Stack direction="row" sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackRounded />} onClick={() => navigate('/ecodim')}>
          Retour
        </Button>
      </Stack>

      <Card sx={{ overflow: 'hidden', mb: 3 }}>
        <BanniereFiche surtitre="Classe de l'école du dimanche" titre={classe.libelleClasse}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="center">
            <Chip color="primary" variant="outlined" label={libelleTrancheAge(classe) || 'Âge non précisé'} />
            <Chip
              color="secondary"
              variant="outlined"
              label={`${moniteursDeLaClasse.length} moniteur${moniteursDeLaClasse.length > 1 ? 's' : ''}`}
            />
            <Chip
              color="success"
              variant="outlined"
              label={`${enfantsDeLaClasse.length} enfant${enfantsDeLaClasse.length > 1 ? 's' : ''}`}
            />
          </Stack>
        </BanniereFiche>

        <Box sx={{ px: { xs: 2, md: 4 }, pb: 4, pt: 2 }}>
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <CarteFiche titre="La classe">
                <Fait
                  icone={<SchoolRounded />}
                  libelle="Tranche d'âge"
                  valeur={libelleTrancheAge(classe)}
                />
                <Fait
                  icone={<GroupsRounded />}
                  libelle="Responsable"
                  valeur={classe.nomResponsable}
                />
                <Fait
                  icone={<DescriptionRounded />}
                  libelle="Description"
                  valeur={classe.descriptionClasse}
                />
              </CarteFiche>
            </Grid>

            <Grid xs={12} md={6}>
              <CarteFiche titre="Moniteurs">
                {moniteursDeLaClasse.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Aucun moniteur n&apos;encadre cette classe.
                  </Typography>
                ) : (
                  moniteursDeLaClasse.map((moniteur) => (
                    <Stack
                      key={moniteur.idMoniteur}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/ecodim/moniteur/${moniteur.idMoniteur}`)}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {`${moniteur.nomMembre || ''} ${moniteur.prenomMembre || ''}`.trim()}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip size="small" label={libelleFonction(moniteur.fonctionMoniteur)} />
                        {estResponsableIci(moniteur) && (
                          <Chip size="small" color="primary" label="Responsable" />
                        )}
                      </Stack>
                    </Stack>
                  ))
                )}
              </CarteFiche>
            </Grid>

            <Grid xs={12} md={6}>
              <CarteFiche titre={`Enfants (${enfantsDeLaClasse.length})`}>
                {enfantsDeLaClasse.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Aucun enfant inscrit dans cette classe.
                  </Typography>
                ) : (
                  enfantsDeLaClasse.map((enfant) => (
                    <Stack
                      key={enfant.idEnfantEcodim}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/ecodim/enfant/${enfant.idEnfantEcodim}`)}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <ChildCareRounded color="primary" fontSize="small" />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {`${enfant.nomEnfant || ''} ${enfant.prenomEnfant || ''}`.trim()}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {enfant.nomParentEnfant || ''}
                      </Typography>
                    </Stack>
                  ))
                )}
              </CarteFiche>
            </Grid>

            <Grid xs={12} md={6}>
              <CarteFiche titre={`Cultes (${cultesDeLaClasse.length})`}>
                {cultesDeLaClasse.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Aucun culte saisi pour cette classe.
                  </Typography>
                ) : (
                  // Les derniers dimanches d'abord : on consulte le cahier pour
                  // revoir le culte passé, pas celui de l'année dernière.
                  cultesDeLaClasse.slice(0, 10).map((culte) => (
                    <Box key={culte.idCulteEcodim}>
                      <Stack direction="row" spacing={1} justifyContent="space-between">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <MenuBookRounded color="primary" fontSize="small" />
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {formaterDate(culte.dateCulte)}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {nomIntervenant(
                            culte.nomEnseignant,
                            culte.prenomEnseignant,
                            culte.nomEnseignantExterne
                          )}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
                        {culte.passageBiblique || culte.leconDuJour || ''}
                      </Typography>
                      <Divider sx={{ mt: 1 }} />
                    </Box>
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
