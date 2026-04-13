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

import { ICellule, setDataModifiesCellule } from '../../../../store/celluleSlice';

export default function CelluleEditView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showNotification } = useNotificationSnackbar();
  const listCellule = useSelector((state: any) => state.cellule.listCellule || []);
  const appUserConnected = useSelector((state: any) => state.application?.userConnected);
  const authUtilisateurData = useSelector((state: any) => state.authentification?.utilisateurData);
  const currentUserId = Number(appUserConnected?.idUtilisateur) || Number(authUtilisateurData?.idUtilisateur) || null;
  const [formData, setFormData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // On réhydrate le formulaire depuis le store pour éviter une requête inutile.
    const celluleId = Number(id);
    const found = listCellule.find((item: ICellule) => item.idCellule === celluleId);
    setFormData(found || null);
  }, [id, listCellule]);

  const handleSave = useCallback(async () => {
    if (!formData || !currentUserId) return;

    try {
      setSaving(true);
      const payload = { ...formData, idUtilisateur: currentUserId };
      const response = await apiClient.updateCellule(payload);
      if (response.status === 1) {
        dispatch(setDataModifiesCellule(payload));
        showNotification('Cellule modifiée avec succès', 'success');
        navigate(`/detailcellule/${id}`);
      }
    } catch (error: any) {
      showNotification(error?.message || 'Erreur lors de la modification de la cellule', 'error');
    } finally {
      setSaving(false);
    }
  }, [currentUserId, dispatch, formData, id, navigate, showNotification]);

  if (!formData) return <DashboardContent><Container maxWidth="lg"><Typography variant="h5">Cellule non trouvée</Typography></Container></DashboardContent>;

  return (
    <DashboardContent>
      <Container maxWidth="lg">
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
          <Button onClick={() => navigate(`/detailcellule/${id}`)}>Annuler</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
        </Stack>
        <Card sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ mb: 3 }}>Modifier la cellule</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}><TextField fullWidth label="Nom de la cellule" value={formData.nomCellule || ''} onChange={(event) => setFormData((prev: any) => ({ ...prev, nomCellule: event.target.value }))} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Lieu" value={formData.lieuCellule || ''} onChange={(event) => setFormData((prev: any) => ({ ...prev, lieuCellule: event.target.value }))} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth type="number" label="Nombre de membres" value={formData.nombreMembreCellule || ''} onChange={(event) => setFormData((prev: any) => ({ ...prev, nombreMembreCellule: event.target.value }))} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Responsable" value={formData.responsableCellule || ''} onChange={(event) => setFormData((prev: any) => ({ ...prev, responsableCellule: event.target.value }))} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Responsable visite" value={formData.responsableVisiteCellule || ''} onChange={(event) => setFormData((prev: any) => ({ ...prev, responsableVisiteCellule: event.target.value }))} /></Grid>
          </Grid>
        </Card>
      </Container>
    </DashboardContent>
  );
}
