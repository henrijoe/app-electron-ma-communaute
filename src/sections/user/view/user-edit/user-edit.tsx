// src/sections/user/view/user-edit/user-edit.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Card,
  Grid,
  Stack,
  Avatar,
  Typography,
  Button,
  Container,
  Paper,
  alpha,
  useTheme,
  Skeleton,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { DashboardContent } from 'src/layouts/dashboard';
import { apiClient, buildPhotoUrl } from 'src/utils/apiClient';
import { useNotificationSnackbar } from 'src/components/alert/notificationSnackbar';
import { 
  IMembre, 
  dataNiveauEtude, 
  dataDepartement, 
  dataCellule, 
  dataGroupe, 
  dataResponsabilite,
  dataCivilite,
  dataGenre,
  dataSituationMembre,
  dataNouvelAme,
  dataBapteme,
  dataCapaciteSpirituelle,
  setDataModifiesMembre,
  addMembre
} from '../../../../store/membreSlice';

// ----------------------------------------------------------------------

export function UserEditView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showNotification } = useNotificationSnackbar();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [membre, setMembre] = useState<IMembre | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  
  // On lit directement la vraie liste des membres depuis le slice Redux.
  // Cela évite de manipuler tout l'objet `state.membre`, ce qui casse
  // ensuite les appels a `.length` et `.find(...)`.
  const { listMembre } = useSelector((state: any) => state.membre);

  // Les champs `select` de MUI manipulent ici des valeurs de formulaire sous
  // forme de chaines. Cette fonction normalise donc les donnees venant de
  // l'API/store pour que les comparaisons conditionnelles du rendu restent
  // fiables pendant l'edition.
  const normalizeSelectValue = (value: string | number | null | undefined): string =>
    value === null || value === undefined || value === '' ? '' : String(value);

  // Charger le membre depuis le store
  useEffect(() => {
    if (id && listMembre.length > 0) {
      const memberId = parseInt(id, 10);
      const foundMembre = listMembre.find((m: IMembre) => m.idMembre === memberId);
      
      if (foundMembre) {
        setMembre(foundMembre);
        // Initialiser les données du formulaire
        const initialData = {
          nomMembre: foundMembre.nomMembre || '',
          prenomMembre: foundMembre.prenomMembre || '',
          dateNaissMembre: foundMembre.dateNaissMembre || '',
          lieuNaissMembre: foundMembre.lieuNaissMembre || '',
          sexeMembre: normalizeSelectValue(foundMembre.sexeMembre),
          emailMembre: foundMembre.emailMembre || '',
          nationaliteMembre: foundMembre.nationaliteMembre || '',
          fonctionMembre: foundMembre.fonctionMembre || '',
          contactMembre: foundMembre.contactMembre || '',
          ethnieMembre: foundMembre.ethnieMembre || '',
          residenceMembre: foundMembre.residenceMembre || '',
          civiliteMembre: normalizeSelectValue(foundMembre.civiliteMembre),
          nouvelleAmeMembre: normalizeSelectValue(foundMembre.nouvelleAmeMembre),
          dateConversionMembre: foundMembre.dateConversionMembre || '',
          baptemeEauMembre: normalizeSelectValue(foundMembre.baptemeEauMembre),
          dateBaptemeMembre: foundMembre.dateBaptemeMembre || '',
          dateMariageMembre: foundMembre.dateMariageMembre || '',
          capaciteSpirituelleMembre: normalizeSelectValue(foundMembre.capaciteSpirituelleMembre),
          situationMatrimonialeMembre: normalizeSelectValue(foundMembre.situationMatrimonialeMembre),
          nomFiance: foundMembre.nomFiance || '',
          lieuBaptemeEauMembre: foundMembre.lieuBaptemeEauMembre || '',
          baptemeSaintEspritMembre: normalizeSelectValue(foundMembre.baptemeSaintEspritMembre),
          dateBaptemeSaintEspritMembre: foundMembre.dateBaptemeSaintEspritMembre || '',
          egliseOrigineMembre: foundMembre.egliseOrigineMembre || '',
          nomAmiEglise: foundMembre.nomAmiEglise || '',
          visiteMembre: normalizeSelectValue(foundMembre.visiteMembre),
          raisonNonVisiteMembre: foundMembre.raisonNonVisiteMembre || '',
          heureVisiteMembre: foundMembre.heureVisiteMembre || '',
          dateDecisionMembre: foundMembre.dateDecisionMembre || '',
          lieuTravailMembre: foundMembre.lieuTravailMembre || '',
          idNiveauEtude: normalizeSelectValue(foundMembre.idNiveauEtude),
          idCellule: normalizeSelectValue(foundMembre.idCellule),
          idDepartement: normalizeSelectValue(foundMembre.idDepartement),
          idGroupe: normalizeSelectValue(foundMembre.idGroupe),
          idResponsabilite: normalizeSelectValue(foundMembre.idResponsabilite),
          photoMembre: foundMembre.photoMembre || '',
        };
        setFormData(initialData);
        
        // Charger la photo
        if (foundMembre.photoMembre) {
          const photoUrl = getPhotoUrl(foundMembre.photoMembre);
          setPhotoPreview(photoUrl);
        }
      } else {
        showNotification('Membre non trouvé', 'error');
        navigate('/membres');
      }
    }
  }, [id, listMembre, navigate, showNotification]);

  const getPhotoUrl = (photoMembre: string) => {
    if (!photoMembre || photoMembre === '') {
      return null;
    }
    if (photoMembre.startsWith('data:image/') || photoMembre.startsWith('http')) {
      return photoMembre;
    }
    return buildPhotoUrl(photoMembre);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('La photo ne doit pas dépasser 5MB', 'warning');
        return;
      }

      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        showNotification('Veuillez sélectionner une image valide', 'warning');
        return;
      }

      setPhotoFile(file);

      // Créer une preview
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);

      // Convertir en base64
      const base64 = await convertFileToBase64(file);
      setFormData((prev: any) => ({
        ...prev,
        photoMembre: base64,
      }));
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setFormData((prev: any) => ({ ...prev, photoMembre: '' }));
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
  };

  const handleSave = async () => {
    if (!membre) return;

    // Validation
    if (!formData.nomMembre.trim()) {
      showNotification('Le nom est requis', 'warning');
      return;
    }

    if (!formData.contactMembre.trim()) {
      showNotification('Le contact est requis', 'warning');
      return;
    }

    try {
      setSaving(true);

      // Préparer les données pour l'API
      const cleanedData = {
        ...formData,
        idMembre: membre.idMembre,
        // Convertir les chaînes vides en null pour l'API
        idNiveauEtude: formData.idNiveauEtude ? Number(formData.idNiveauEtude) : null,
        idCellule: formData.idCellule ? Number(formData.idCellule) : null,
        idDepartement: formData.idDepartement ? Number(formData.idDepartement) : null,
        idGroupe: formData.idGroupe ? Number(formData.idGroupe) : null,
        idResponsabilite: formData.idResponsabilite ? Number(formData.idResponsabilite) : null,
        // Convertir en nombres
        sexeMembre: Number(formData.sexeMembre) || null,
        nouvelleAmeMembre: Number(formData.nouvelleAmeMembre) || null,
        baptemeEauMembre: Number(formData.baptemeEauMembre) || null,
        baptemeSaintEspritMembre: Number(formData.baptemeSaintEspritMembre) || null,
        situationMatrimonialeMembre: Number(formData.situationMatrimonialeMembre) || null,
        visiteMembre: Number(formData.visiteMembre) || null,
        capaciteSpirituelleMembre: Number(formData.capaciteSpirituelleMembre) || null,
      };

      console.log('Données à envoyer:', cleanedData);

      const response = await apiClient.updateMembre(cleanedData);
      
      if (response.status === 1) {
        // Mettre à jour le store
        dispatch(setDataModifiesMembre(response.data));
        
        showNotification('Membre modifié avec succès', 'success');
        
        // Retourner à la page de détail
        navigate(`/details/${id}`);
      } else {
        showNotification('Erreur lors de la modification du membre', 'error');
      }
    } catch (error) {
      console.error('Error updating membre:', error);
      showNotification('Erreur lors de la modification', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/details/${id}`);
  };

  const handleBack = () => {
    navigate('/membres');
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

  if (!membre) {
    return (
      <DashboardContent>
        <Container maxWidth="lg">
          <Box textAlign="center" py={10}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Membre non trouvé
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
          Modifier le membre
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Modifiez les informations de {membre.nomMembre} {membre.prenomMembre}
        </Typography>

        {/* Formulaire d'édition */}
        <Card sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            {/* Photo */}
            <Grid item xs={12}>
              <Stack alignItems="center" spacing={2}>
                <Box position="relative">
                  <Avatar
                    src={photoPreview || undefined}
                    sx={{
                      width: 120,
                      height: 120,
                      border: '2px solid #ccc',
                      backgroundColor: '#f5f5f5'
                    }}
                  >
                    {!photoPreview && <PersonIcon fontSize="large" />}
                  </Avatar>

                  {/* Bouton pour modifier la photo */}
                  <IconButton
                    component="label"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    }}
                  >
                    <EditIcon />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                  </IconButton>
                  
                  {/* Bouton pour supprimer la photo si elle existe */}
                  {photoPreview && (
                    <IconButton
                      onClick={handleRemovePhoto}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        backgroundColor: 'error.main',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'error.dark',
                        },
                      }}
                    >
                      <Iconify icon="mdi:close" />
                    </IconButton>
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Cliquez sur l&apos;icône pour modifier la photo
                </Typography>
              </Stack>
            </Grid>

            {/* Informations de base */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Nom *"
                name="nomMembre"
                value={formData.nomMembre || ''}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Prénoms"
                name="prenomMembre"
                value={formData.prenomMembre || ''}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Civilité"
                name="civiliteMembre"
                value={formData.civiliteMembre || ''}
                onChange={handleChange}
              >
                {dataCivilite?.map((option: any) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Genre"
                name="sexeMembre"
                value={formData.sexeMembre || ''}
                onChange={handleChange}
              >
                {dataGenre?.map((option: any) => (
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
                label="Date de naissance"
                name="dateNaissMembre"
                value={formData.dateNaissMembre || ''}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Lieu de naissance"
                name="lieuNaissMembre"
                value={formData.lieuNaissMembre || ''}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Nationalité"
                name="nationaliteMembre"
                value={formData.nationaliteMembre || ''}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Ethnie"
                name="ethnieMembre"
                value={formData.ethnieMembre || ''}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Niveau d&apos;étude"
                name="idNiveauEtude"
                value={formData.idNiveauEtude || ''}
                onChange={handleChange}
              >
                <MenuItem value="">
                  <em>Sélectionner</em>
                </MenuItem>
                {dataNiveauEtude?.map((option: any) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Contact */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="h6">Contact</Typography>
              </Divider>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Téléphone *"
                name="contactMembre"
                value={formData.contactMembre || ''}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Email"
                name="emailMembre"
                type="email"
                value={formData.emailMembre || ''}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Résidence"
                name="residenceMembre"
                value={formData.residenceMembre || ''}
                onChange={handleChange}
              />
            </Grid>

            {/* Vie professionnelle */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="h6">Vie professionnelle</Typography>
              </Divider>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Fonction"
                name="fonctionMembre"
                value={formData.fonctionMembre || ''}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Lieu de travail"
                name="lieuTravailMembre"
                value={formData.lieuTravailMembre || ''}
                onChange={handleChange}
              />
            </Grid>

            {/* Situation familiale */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="h6">Situation familiale</Typography>
              </Divider>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Situation matrimoniale"
                name="situationMatrimonialeMembre"
                value={formData.situationMatrimonialeMembre || ''}
                onChange={handleChange}
              >
                {dataSituationMembre?.map((option: any) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {formData.situationMatrimonialeMembre === "3" && (
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Nom fiancé(e)"
                  name="nomFiance"
                  value={formData.nomFiance || ''}
                  onChange={handleChange}
                />
              </Grid>
            )}

            {formData.situationMatrimonialeMembre === "5" && (
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date de mariage"
                  name="dateMariageMembre"
                  value={formData.dateMariageMembre || ''}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            )}

            {/* Vie spirituelle */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="h6">Vie spirituelle</Typography>
              </Divider>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Église d&apos;origine"
                name="egliseOrigineMembre"
                value={formData.egliseOrigineMembre || ''}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Date de conversion"
                name="dateConversionMembre"
                value={formData.dateConversionMembre || ''}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Nouvelle âme"
                name="nouvelleAmeMembre"
                value={formData.nouvelleAmeMembre || ''}
                onChange={handleChange}
              >
                {dataNouvelAme?.map((option: any) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Baptême d&apos;eau"
                name="baptemeEauMembre"
                value={formData.baptemeEauMembre || ''}
                onChange={handleChange}
              >
                {dataBapteme?.map((option: any) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {formData.baptemeEauMembre === "1" && (
              <>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date du baptême d&apos;eau"
                    name="dateBaptemeMembre"
                    value={formData.dateBaptemeMembre || ''}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Lieu du baptême"
                    name="lieuBaptemeEauMembre"
                    value={formData.lieuBaptemeEauMembre || ''}
                    onChange={handleChange}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Baptême du Saint-Esprit"
                name="baptemeSaintEspritMembre"
                value={formData.baptemeSaintEspritMembre || ''}
                onChange={handleChange}
              >
                {dataBapteme?.map((option: any) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {formData.baptemeSaintEspritMembre === "1" && (
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date du baptême Saint-Esprit"
                  name="dateBaptemeSaintEspritMembre"
                  value={formData.dateBaptemeSaintEspritMembre || ''}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Capacité spirituelle"
                name="capaciteSpirituelleMembre"
                value={formData.capaciteSpirituelleMembre || ''}
                onChange={handleChange}
              >
                {dataCapaciteSpirituelle?.map((option: any) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Engagement dans l'église */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="h6">Engagement dans l&apos;église</Typography>
              </Divider>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Responsabilité"
                name="idResponsabilite"
                value={formData.idResponsabilite || ''}
                onChange={handleChange}
              >
                <MenuItem value="">
                  <em>Sélectionner</em>
                </MenuItem>
                {dataResponsabilite?.map((option: any) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Département/Comité"
                name="idDepartement"
                value={formData.idDepartement || ''}
                onChange={handleChange}
              >
                <MenuItem value="">
                  <em>Sélectionner</em>
                </MenuItem>
                {dataDepartement?.map((option: any) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Cellule"
                name="idCellule"
                value={formData.idCellule || ''}
                onChange={handleChange}
              >
                <MenuItem value="">
                  <em>Sélectionner</em>
                </MenuItem>
                {dataCellule?.map((option: any) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Groupe ethnique"
                name="idGroupe"
                value={formData.idGroupe || ''}
                onChange={handleChange}
              >
                <MenuItem value="">
                  <em>Sélectionner</em>
                </MenuItem>
                {dataGroupe?.map((option: any) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
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

export default UserEditView;
