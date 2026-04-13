// src/sections/culte/view/culte-edit/culte-edit.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Card,
  Grid,
  Stack,
  Typography,
  Button,
  Container,
  TextField,
  MenuItem,
  Divider,
  IconButton,
  Skeleton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { DashboardContent } from 'src/layouts/dashboard';
import { apiClient } from 'src/utils/apiClient';
import { useNotificationSnackbar } from 'src/components/alert/notificationSnackbar';
import {
  ICulte,
  setDataModifiesCulte,
  typeCulteOptions,
} from '../../../../store/culteSlice';

// ------------------------------

export function CulteEditView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showNotification } = useNotificationSnackbar();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [culte, setCulte] = useState<ICulte | null>(null);
  const [formData, setFormData] = useState<any>({});

  const listCulte = useSelector((state: any) => state.culte?.listCulte || []);
  const appUserConnected = useSelector((state: any) => state.application?.userConnected);
  const authUtilisateurData = useSelector((state: any) => state.authentification?.utilisateurData);
  const currentUserId =
    Number(appUserConnected?.idUtilisateur)
    || Number(authUtilisateurData?.idUtilisateur)
    || null;


  // Charger le membre depuis le store
  useEffect(() => {
    // On lit directement la liste des cultes du store Redux.
    if (id && listCulte.length > 0) {
      const culteId = parseInt(id, 10);
      const FoundCulte = listCulte.find((m: ICulte) => m.idCulte === culteId);

      if (FoundCulte) {
        setCulte(FoundCulte);
        // Initialiser les données du formulaire
        const initialData = {
          ...FoundCulte
          // typeCulte: FoundCulte.typeCulte || '',
          // dateCulte: FoundCulte.dateCulte || '',
          // dirigeant: FoundCulte.dirigeant || '',
          // predication: FoundCulte.passageBiblique || '',
          // themePredication: FoundCulte.themePredication || '',
          // nombreHommeCulte: FoundCulte.nombreHommeCulte || '',
          // nombreFemmeCulte: FoundCulte.nombreFemmeCulte || '',
          // ecodim: FoundCulte.ecodim || '',
          // filleEcodim: FoundCulte.filleEcodim || '',
          // resumePredication: FoundCulte.resumePredication || '',
        };
        setFormData(initialData);

      } else {
        showNotification('culte non trouvé', 'error');
        navigate('/cultes');
      }
    }
  }, [id, listCulte, navigate, showNotification]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleSave = async () => {
    if (!culte || !culte.idCulte) return;

    // Validation
    if (!formData.typeCulte?.trim()) {
      showNotification('Le type de culte est requis', 'warning');
      return;
    }

    if (!formData.dateCulte?.trim()) {
      showNotification('La date du culte est requise', 'warning');
      return;
    }

    try {
      setSaving(true);

      // Préparer les données pour l'API
      const cleanedData = {
        ...formData,
        idCulte: culte.idCulte,
        // Le backend exige aussi idUtilisateur sur la modification.
        idUtilisateur: currentUserId || culte.idUtilisateur || null,
      };

      console.log('Données à envoyer:', cleanedData);

      const response = await apiClient.updateCulte(cleanedData);

      if (response.status === 1) {
        // Mettre à jour le store
        dispatch(setDataModifiesCulte(response.data));

        showNotification('Culte modifié avec succès', 'success');

        // Retourner à la page de détail
        navigate(`/detailculte/${id}`);
      } else {
        showNotification('Erreur lors de la modification du culte', 'error');
      }
    } catch (error) {
      console.error('Error updating culte:', error);
      showNotification('Erreur lors de la modification', 'error');
    } finally {
      setSaving(false);
    }
  };

  
  const handleCancel = () => {
    navigate(`/detailculte/${id}`);
  };

  const handleBack = () => {
    navigate('/culte');
  };


  if (loading) {
    return (
      <DashboardContent>
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <Skeleton variant="rectangular" height={56} />
            <Skeleton variant="rectangular" height={400} />
          </Stack>
        </Container>
      </DashboardContent>
    );
  }

  if (!culte) {
    return (
      <DashboardContent>
        <Container maxWidth="lg">
          <Box textAlign="center" py={10}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Culte non trouvé
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
            >
              Retour à la liste
            </Button>
          </Box>
        </Container>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Container maxWidth="lg">
        {/* En-tête avec boutons */}
        <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Retour à la liste
          </Button>

          <Box>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              sx={{ mr: 2 }}
            >
              Annuler
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </Box>
        </Box>

        <Typography variant="h4" gutterBottom>
          Modifier le culte
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Modifiez les informations du culte du {culte?.dateCulte} ({culte.typeCulte})
        </Typography>

        {/* Formulaire d'édition */}
        <Card sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            {/* Informations principales */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Type de culte *"
                name="typeCulte"
                value={formData.typeCulte || ''}
                onChange={handleChange}
                required
              >
                {typeCulteOptions?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Date du culte *"
                name="dateCulte"
                value={formData.dateCulte || ''}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Dirigeant"
                name="dirigeant"
                value={formData.dirigeant || ''}
                onChange={handleChange}
              />
            </Grid>

            {/* Prédication */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="h6">Prédication</Typography>
              </Divider>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Thème de la prédication"
                name="themePredication"
                value={formData.themePredication || ''}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Passage biblique"
                name="passageBiblique"
                value={formData.passageBiblique || ''}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Prédication"
                name="predication"
                value={formData.predication || ''}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>

            {/* Participants */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="h6">Participants</Typography>
              </Divider>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Nombre d'hommes"
                name="nombreHommeCulte"
                value={formData.nombreHommeCulte || ''}
                onChange={handleChange}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Nombre de femmes"
                name="nombreFemmeCulte"
                value={formData.nombreFemmeCulte || ''}
                onChange={handleChange}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total participants
                </Typography>
                <Typography variant="h5" color="primary">
                  {(Number(formData.nombreHommeCulte) || 0) + (Number(formData.nombreFemmeCulte) || 0)}
                </Typography>
              </Box>
            </Grid>

            {/* Ecodim */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="h6">Ecodim</Typography>
              </Divider>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type='number'
                label="Ecodim"
                name="ecodim"
                value={formData.ecodim || ''}
                onChange={handleChange}
              />
            </Grid>

            {formData.ecodim === '1' && (
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                   type='number'
                  label="Fille Ecodim"
                  name="filleEcodim"
                  value={formData.filleEcodim || ''}
                  onChange={handleChange}
                />
              </Grid>
            )}

            {/* Résumé de la prédication */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="h6">Résumé de la prédication</Typography>
              </Divider>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Résumé de la prédication"
                name="resumePredication"
                value={formData.resumePredication || ''}
                onChange={handleChange}
                multiline
                rows={6}
                placeholder="Résumez les points principaux de la prédication..."
              />
            </Grid>

            {/* Boutons d'action */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                >
                  Annuler
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Container>
    </DashboardContent>
  );
}

export default CulteEditView;
