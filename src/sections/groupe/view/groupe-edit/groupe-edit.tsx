import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { apiClient } from 'src/utils/apiClient';
import { useNotificationSnackbar } from 'src/components/alert/notificationSnackbar';

import { IGroupe, setDataModifiesGroupe } from '../../../../store/groupeSlice';

export default function GroupeEditView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showNotification } = useNotificationSnackbar();
  const listGroupe = useSelector((state: any) => state.groupe.listGroupe || []);
  const appUserConnected = useSelector((state: any) => state.application?.userConnected);
  const authUtilisateurData = useSelector((state: any) => state.authentification?.utilisateurData);
  const currentUserId = Number(appUserConnected?.idUtilisateur) || Number(authUtilisateurData?.idUtilisateur) || null;
  const [formData, setFormData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // On réhydrate le formulaire depuis le store pour éviter une requête inutile.
    const groupeId = Number(id);
    const found = listGroupe.find((item: IGroupe) => item.idGroupe === groupeId);
    setFormData(found || null);
  }, [id, listGroupe]);

  const handleSave = useCallback(async () => {
    if (!formData || !currentUserId) return;

    try {
      setSaving(true);
      const payload = { ...formData, idUtilisateur: currentUserId };
      const response = await apiClient.updateGroupe(payload);
      if (response.status === 1) {
        dispatch(setDataModifiesGroupe(payload));
        showNotification('Groupe modifié avec succès', 'success');
        navigate(`/detailgroupe/${id}`);
      }
    } catch (error: any) {
      showNotification(error?.message || 'Erreur lors de la modification du groupe', 'error');
    } finally {
      setSaving(false);
    }
  }, [currentUserId, dispatch, formData, id, navigate, showNotification]);

  if (!formData) return <DashboardContent><Container maxWidth="lg"><Typography variant="h5">Groupe non trouvé</Typography></Container></DashboardContent>;

  return (
    <DashboardContent>
      <Container maxWidth="lg">
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
          <Button onClick={() => navigate(`/detailgroupe/${id}`)}>Annuler</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
        </Stack>
        <Card sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ mb: 3 }}>Modifier le groupe</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}><TextField fullWidth label="Libellé du groupe" value={formData.libelleGroupe || ''} onChange={(event) => setFormData((prev: any) => ({ ...prev, libelleGroupe: event.target.value }))} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Responsable" value={formData.responsableGroupe || ''} onChange={(event) => setFormData((prev: any) => ({ ...prev, responsableGroupe: event.target.value }))} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline minRows={4} label="Description" value={formData.descriptionGroupe || ''} onChange={(event) => setFormData((prev: any) => ({ ...prev, descriptionGroupe: event.target.value }))} /></Grid>
          </Grid>
        </Card>
      </Container>
    </DashboardContent>
  );
}
