// src/sections/departement/view/departement-edit/departement-edit.tsx
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
  Alert,
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
  IDepartement,
  setDataModifiesDepartement,
} from '../../../../store/departementSlice';
import {isLibelleLongUnique, isLibelleCourtUnique } from '../../utils';

// ------------------------------ 

export function DepartementEditView() {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showNotification } = useNotificationSnackbar();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [departement, setDepartement] = useState<IDepartement | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const listDepartement = useSelector((state: any) => state.departement.listDepartement);

  // Charger le departement depuis le store
  useEffect(() => {
    let isMounted = true;

    const loadDepartement = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const departementId = parseInt(id, 10);
        let foundDepartement = listDepartement.find((d: IDepartement) => d.idDepartement === departementId);

        if (!foundDepartement) {
          const response = await apiClient.getDepartements();
          if (response.status === 1 && Array.isArray(response.data)) {
            foundDepartement = response.data.find((d: IDepartement) => d.idDepartement === departementId);
          }
        }

        if (!isMounted) return;

        if (foundDepartement) {
          setDepartement(foundDepartement);
          setFormData({
            libelleLongDepartement: foundDepartement.libelleLongDepartement || '',
            libelleCourtDepartement: foundDepartement.libelleCourtDepartement || '',
            sloganDepartement: foundDepartement.sloganDepartement || '',
            responsableDepartement: foundDepartement.responsableDepartement || '',
            idUtilisateur: foundDepartement.idUtilisateur || null,
          });
          return;
        }

        showNotification('Departement non trouve', 'error');
        navigate('/departement');
      } catch (error: any) {
        if (!isMounted) return;
        showNotification(error?.message || 'Erreur lors du chargement du departement', 'error');
        navigate('/departement');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDepartement();

    return () => {
      isMounted = false;
    };
  }, [id, listDepartement, navigate, showNotification]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
    
    // Effacer l'erreur du champ modifiÃƒÂ©
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    // Validation de base
    if (!formData.libelleLongDepartement?.trim()) {
      newErrors.libelleLongDepartement = 'Le libellÃƒÂ© long est requis';
    } else if (formData.libelleLongDepartement.length > 100) {
      // eslint-disable-next-line react/no-unescaped-entities
      newErrors.libelleLongDepartement = "Le libellÃƒÂ© long ne doit pas dÃƒÂ©passer 100 caractÃƒÂ¨res";
    } else if (!isLibelleLongUnique(listDepartement, formData.libelleLongDepartement, departement?.idDepartement)) {
      newErrors.libelleLongDepartement = 'Ce libellÃƒÂ© long est dÃƒÂ©jÃƒ  utilisÃƒÂ©';
    }

    if (!formData.libelleCourtDepartement?.trim()) {
      newErrors.libelleCourtDepartement = 'Le libellÃƒÂ© court est requis';
    } else if (formData.libelleCourtDepartement.length > 20) {
      // eslint-disable-next-line react/no-unescaped-entities
      newErrors.libelleCourtDepartement = "Le libellÃƒÂ© court ne doit pas dÃƒÂ©passer 20 caractÃƒÂ¨res";
    } else if (!isLibelleCourtUnique(listDepartement, formData.libelleCourtDepartement, departement?.idDepartement)) {
      newErrors.libelleCourtDepartement = 'Ce libellÃƒÂ© court est dÃƒÂ©jÃƒ  utilisÃƒÂ©';
    }

    if (formData.sloganDepartement && formData.sloganDepartement.length > 200) {
      newErrors.sloganDepartement = 'Le slogan ne doit pas dÃƒÂ©passer 200 caractÃƒÂ¨res';
    }

    if (formData.responsableDepartement && formData.responsableDepartement.length > 100) {
      newErrors.responsableDepartement = 'Le nom du responsable ne doit pas dÃƒÂ©passer 100 caractÃƒÂ¨res';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!departement || !departement.idDepartement) return;

    // Validation du formulaire
    if (!validateForm()) {
      showNotification('Veuillez corriger les erreurs dans le formulaire', 'warning');
      return;
    }

    try {
      setSaving(true);

      // PrÃƒÂ©parer les donnÃƒÂ©es pour l'API
      const cleanedData = {
        ...formData,
        idDepartement: departement.idDepartement,
      };

      console.log('DonnÃƒÂ©es Ãƒ  envoyer:', cleanedData);

      const response = await apiClient.updateDepartement(cleanedData);

      if (response.status === 1) {
        // Mettre a jour le store
        const updatedDepartement = response.data || cleanedData;
        dispatch(setDataModifiesDepartement(updatedDepartement));

        showNotification('DÃƒÂ©partement modifiÃƒÂ© avec succÃƒÂ¨s', 'success');

        // Retourner a la page de detail
        navigate(`/detaildepartement/${id}`);
      } else {
        showNotification(response.error?.message || 'Erreur lors de la modification du dÃƒÂ©partement', 'error');
      }
    } catch (error: any) {
      console.error('Error updating dÃƒÂ©partement:', error);
      showNotification(`Erreur: ${error.message || 'Erreur lors de la modification'}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/detaildepartement/${id}`);
  };

  const handleBack = () => {
    navigate('/departement');
  };

  const handleReset = () => {
    if (departement) {
      const initialData = {
        libelleLongDepartement: departement.libelleLongDepartement || '',
        libelleCourtDepartement: departement.libelleCourtDepartement || '',
        sloganDepartement: departement.sloganDepartement || '',
        responsableDepartement: departement.responsableDepartement || '',
      };
      setFormData(initialData);
      setErrors({});
    }
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

  if (!departement) {
    return (
      <DashboardContent>
        <Container maxWidth="lg">
          <Box textAlign="center" py={10}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Departement non trouvÃ©
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
            >
              Retour a la liste
            </Button>
          </Box>
        </Container>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Container maxWidth="lg">
        {/* En-tÃƒÂªte avec boutons */}
        <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Retour a la liste
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
          Modifier le departement
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Modifiez les informations du departement &quot;{departement.libelleLongDepartement}&quot;
        </Typography>

        {/* Affichage des erreurs globales */}
        {Object.keys(errors).length > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Veuillez corriger les erreurs ci-dessous avant de sauvegarder.
          </Alert>
        )}

        {/* Formulaire d'ÃƒÂ©dition */}
        <Card sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            {/* Informations principales */}
            <Grid item xs={12}>
              <Divider sx={{ mb: 3 }}>
                <Typography variant="h6">Informations gÃ©nÃ©rales</Typography>
              </Divider>
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="LibellÃƒÂ© long *"
                name="libelleLongDepartement"
                value={formData.libelleLongDepartement || ''}
                onChange={handleChange}
                required
                error={!!errors.libelleLongDepartement}
                helperText={errors.libelleLongDepartement || 'Nom complet du dÃƒÂ©partement (max. 100 caractÃƒÂ¨res)'}
                placeholder="Ex: DÃƒÂ©partement de la Jeunesse et des Sports"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="LibellÃƒÂ© court *"
                name="libelleCourtDepartement"
                value={formData.libelleCourtDepartement || ''}
                onChange={handleChange}
                required
                error={!!errors.libelleCourtDepartement}
                helperText={errors.libelleCourtDepartement || 'AbrÃƒÂ©viation (max. 20 caractÃƒÂ¨res)'}
                placeholder="Ex: DJS"
              />
            </Grid>

            {/* Slogan */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Slogan"
                name="sloganDepartement"
                value={formData.sloganDepartement || ''}
                onChange={handleChange}
                error={!!errors.sloganDepartement}
                helperText={errors.sloganDepartement || 'Slogan ou devise du dÃƒÂ©partement (max. 200 caractÃƒÂ¨res)'}
                placeholder="Ex: Servir avec excellence et intÃƒÂ©gritÃƒÂ©"
                multiline
                rows={2}
              />
            </Grid>

            {/* Responsable */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Responsable"
                name="responsableDepartement"
                value={formData.responsableDepartement || ''}
                onChange={handleChange}
                error={!!errors.responsableDepartement}
                helperText={errors.responsableDepartement || 'Nom du responsable (max. 100 caractÃƒÂ¨res)'}
                placeholder="Ex: Pasteur Jean Dupont"
              />
            </Grid>

            {/* Informations systÃƒÂ¨me */}
            <Grid item xs={12}>
              <Divider sx={{ my: 3 }}>
                <Typography variant="h6">Informations systÃªme</Typography>
              </Divider>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ID DÃƒÂ©partement"
                value={departement.idDepartement || ''}
                InputProps={{
                  readOnly: true,
                }}
                variant="outlined"
                disabled
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ID Utilisateur"
                value={departement.idUtilisateur || 'Non defini'}
                InputProps={{
                  readOnly: true,
                }}
                variant="outlined"
                disabled
              />
            </Grid>

            {/* Indicateurs */}
            <Grid item xs={12}>
              <Divider sx={{ my: 3 }}>
                <Typography variant="h6">stat du departement</Typography>
              </Divider>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Departement
                </Typography>
                <Typography variant="h6" color={formData.libelleLongDepartement ? 'success.main' : 'error.main'}>
                  {formData.libelleLongDepartement ? 'Ã¢Å“â€œ Rempli' : 'Ã¢Å“â€” Manquant'}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  LibellÃ© court
                </Typography>
                <Typography variant="h6" color={formData.libelleCourtDepartement ? 'success.main' : 'error.main'}>
                  {formData.libelleCourtDepartement ? 'Ã¢Å“â€œ Rempli' : 'Ã¢Å“â€” Manquant'}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Responsable
                </Typography>
                <Typography variant="h6" color={formData.responsableDepartement ? 'success.main' : 'warning.main'}>
                  {formData.responsableDepartement ? 'Ã¢Å“â€œ DÃƒÂ©fini' : 'Ã¢Å¡  Optionnel'}
                </Typography>
              </Box>
            </Grid>

            {/* Boutons d'action */}
            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Button
                  variant="text"
                  onClick={handleReset}
                  disabled={saving}
                >
                  RÃƒÂ©initialiser les modifications
                </Button>
                
                <Box display="flex" gap={2}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    disabled={saving}
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
              </Box>
            </Grid>
          </Grid>
        </Card>

        {/* Instructions */}
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Instructions
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            Ã¢â‚¬Â¢ Les champs marquÃƒÂ©s d'un astÃƒÂ©risque (*) sont obligatoires.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Ã¢â‚¬Â¢ Le libellÃƒÂ© court est utilisÃƒÂ© comme rÃƒÂ©fÃƒÂ©rence et abrÃƒÂ©viation.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Ã¢â‚¬Â¢ Le slogan est facultatif mais recommandÃƒÂ© pour identifier le dÃƒÂ©partement.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ã¢â‚¬Â¢ Assurez-vous que les libellÃƒÂ©s sont uniques pour ÃƒÂ©viter les confusions.
          </Typography>
        </Card>
      </Container>
    </DashboardContent>
  );
}

export default DepartementEditView;

