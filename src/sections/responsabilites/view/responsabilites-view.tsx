import type { IReduxState } from 'src/store/store';
import type { IResponsable } from 'src/store/membreSlice';

import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import {
  EditRounded,
  SaveRounded,
  DeleteRounded,
  GroupAddRounded,
} from '@mui/icons-material';

import { apiClient } from 'src/utils/apiClient';
import { getSessionUser, getScopeUserIdFromUser } from 'src/utils/access-control';

import { DashboardContent } from 'src/layouts/dashboard';
import { setListResponsabilite as setListMembreResponsabilite } from 'src/store/membreSlice';

import ConfirmDialog from 'src/components/alert/confirmDialog';
import { useNotificationSnackbar } from 'src/components/alert/notificationSnackbar';

type ResponsabiliteFormState = {
  idResponsabilite: number | null;
  libelleResponsabilite: string;
  descriptionResponsabilite: string;
};

const emptyResponsabiliteForm: ResponsabiliteFormState = {
  idResponsabilite: null,
  libelleResponsabilite: '',
  descriptionResponsabilite: '',
};

export function ResponsabilitesView() {
  const dispatch = useDispatch();
  const sessionUser = useSelector((state: IReduxState) => getSessionUser(state));
  const currentAccountId = getScopeUserIdFromUser(sessionUser) || 0;
  const [responsabilites, setResponsabilites] = useState<IResponsable[]>([]);
  const [loadingResponsabilites, setLoadingResponsabilites] = useState(false);
  const [responsabiliteForm, setResponsabiliteForm] = useState<ResponsabiliteFormState>(emptyResponsabiliteForm);
  const [isSavingResponsabilite, setIsSavingResponsabilite] = useState(false);
  const [deletingResponsabilite, setDeletingResponsabilite] = useState<IResponsable | null>(null);
  const [isDeletingResponsabilite, setIsDeletingResponsabilite] = useState(false);
  const { showNotification, NotificationComponent } = useNotificationSnackbar();
  const isEditingResponsabilite = Boolean(responsabiliteForm.idResponsabilite);

  const loadResponsabilites = useCallback(async () => {
    if (!currentAccountId) {
      setResponsabilites([]);
      dispatch(setListMembreResponsabilite([]));
      return;
    }

    try {
      setLoadingResponsabilites(true);
      const response = await apiClient.getResponsabilites();
      const items = Array.isArray(response.data)
        ? response.data.filter((item: IResponsable) => Number(item.idUtilisateur) === Number(currentAccountId))
        : [];

      setResponsabilites(items);
      dispatch(setListMembreResponsabilite(items));
    } catch (error: any) {
      showNotification(error?.message || 'Impossible de charger les responsabilites.', 'error');
    } finally {
      setLoadingResponsabilites(false);
    }
  }, [currentAccountId, dispatch, showNotification]);

  useEffect(() => {
    loadResponsabilites();
  }, [loadResponsabilites]);

  const handleChangeResponsabiliteField = useCallback(
    (field: keyof ResponsabiliteFormState, value: string) => {
      setResponsabiliteForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const handleResetResponsabiliteForm = useCallback(() => {
    setResponsabiliteForm(emptyResponsabiliteForm);
  }, []);

  const handleEditResponsabilite = useCallback((responsabilite: IResponsable) => {
    setResponsabiliteForm({
      idResponsabilite: Number(responsabilite.idResponsabilite || 0),
      libelleResponsabilite: responsabilite.libelleResponsabilite || '',
      descriptionResponsabilite: responsabilite.descriptionResponsabilite || '',
    });
  }, []);

  const handleSaveResponsabilite = useCallback(async () => {
    if (!currentAccountId) {
      showNotification('Utilisateur connecte introuvable.', 'warning');
      return;
    }

    if (!responsabiliteForm.libelleResponsabilite.trim()) {
      showNotification('Le libelle de la responsabilite est requis.', 'warning');
      return;
    }

    const payload = {
      idResponsabilite: responsabiliteForm.idResponsabilite || undefined,
      libelleResponsabilite: responsabiliteForm.libelleResponsabilite.trim(),
      descriptionResponsabilite: responsabiliteForm.descriptionResponsabilite.trim(),
      idUtilisateur: currentAccountId,
    };

    try {
      setIsSavingResponsabilite(true);
      if (responsabiliteForm.idResponsabilite) {
        await apiClient.updateResponsabilite(payload);
        showNotification('Responsabilite mise a jour avec succes.', 'success');
      } else {
        await apiClient.createResponsabilite(payload);
        showNotification('Responsabilite creee avec succes.', 'success');
      }

      handleResetResponsabiliteForm();
      await loadResponsabilites();
    } catch (error: any) {
      showNotification(error?.message || 'Impossible de sauvegarder cette responsabilite.', 'error');
    } finally {
      setIsSavingResponsabilite(false);
    }
  }, [currentAccountId, handleResetResponsabiliteForm, loadResponsabilites, responsabiliteForm, showNotification]);

  const handleConfirmDeleteResponsabilite = useCallback(async () => {
    if (!deletingResponsabilite?.idResponsabilite) {
      return;
    }

    try {
      setIsDeletingResponsabilite(true);
      await apiClient.deleteResponsabilite(deletingResponsabilite.idResponsabilite);
      if (responsabiliteForm.idResponsabilite === deletingResponsabilite.idResponsabilite) {
        handleResetResponsabiliteForm();
      }
      showNotification('Responsabilite supprimee avec succes.', 'success');
      setDeletingResponsabilite(null);
      await loadResponsabilites();
    } catch (error: any) {
      showNotification(
        error?.message || 'Impossible de supprimer cette responsabilite. Elle est peut-etre deja utilisee par un membre.',
        'error'
      );
    } finally {
      setIsDeletingResponsabilite(false);
    }
  }, [
    deletingResponsabilite,
    handleResetResponsabiliteForm,
    loadResponsabilites,
    responsabiliteForm.idResponsabilite,
    showNotification,
  ]);

  return (
    <DashboardContent>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Responsabilites
          </Typography>
          <Typography color="text.secondary">
            Gere les responsabilites utilisees dans la fiche des membres.
          </Typography>
        </Box>

        <Card>
          <CardHeader
            avatar={<GroupAddRounded color="primary" />}
            title="Responsabilites"
            subheader="Ces responsabilites alimentent le select des membres et sont enregistrees dans la base de donnees."
          />
          <CardContent>
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Libelle"
                  value={responsabiliteForm.libelleResponsabilite}
                  onChange={(event) => handleChangeResponsabiliteField('libelleResponsabilite', event.target.value)}
                />
                <TextField
                  fullWidth
                  label="Description"
                  value={responsabiliteForm.descriptionResponsabilite}
                  onChange={(event) => handleChangeResponsabiliteField('descriptionResponsabilite', event.target.value)}
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<SaveRounded />}
                  onClick={handleSaveResponsabilite}
                  disabled={isSavingResponsabilite}
                >
                  {isSavingResponsabilite
                    ? 'Enregistrement...'
                    : isEditingResponsabilite
                      ? 'Modifier la responsabilite'
                      : 'Ajouter la responsabilite'}
                </Button>
                <Button variant="outlined" onClick={handleResetResponsabiliteForm} disabled={isSavingResponsabilite}>
                  Reinitialiser
                </Button>
              </Stack>

              {loadingResponsabilites ? (
                <Alert severity="info">Chargement des responsabilites...</Alert>
              ) : responsabilites.length === 0 ? (
                <Alert severity="info">Aucune responsabilite n&apos;a encore ete creee pour cette eglise.</Alert>
              ) : (
                <Stack spacing={1.5}>
                  {responsabilites.map((responsabilite) => (
                    <Card key={responsabilite.idResponsabilite} variant="outlined" sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
                          <Box>
                            <Typography variant="subtitle1" fontWeight={700}>
                              {responsabilite.libelleResponsabilite}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {responsabilite.descriptionResponsabilite || 'Aucune description'}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<EditRounded />}
                              onClick={() => handleEditResponsabilite(responsabilite)}
                            >
                              Modifier
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              startIcon={<DeleteRounded />}
                              onClick={() => setDeletingResponsabilite(responsabilite)}
                            >
                              Supprimer
                            </Button>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>

        <ConfirmDialog
          open={Boolean(deletingResponsabilite)}
          title="Supprimer cette responsabilite"
          message={`La responsabilite ${deletingResponsabilite?.libelleResponsabilite || ''} sera supprimee si elle n'est pas utilisee.`}
          confirmText="Supprimer"
          loading={isDeletingResponsabilite}
          onConfirm={handleConfirmDeleteResponsabilite}
          onClose={() => setDeletingResponsabilite(null)}
        />

        <NotificationComponent />
      </Stack>
    </DashboardContent>
  );
}
