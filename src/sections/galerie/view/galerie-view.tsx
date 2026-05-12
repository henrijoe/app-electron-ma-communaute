import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type InputHTMLAttributes } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AddPhotoAlternateRounded,
  ArrowBackRounded,
  CalendarMonthRounded,
  ChevronLeftRounded,
  ChevronRightRounded,
  CloseRounded,
  DeleteRounded,
  DownloadRounded,
  EditRounded,
  EventRounded,
  FolderRounded,
  FullscreenRounded,
  ImageRounded,
  LocationOnRounded,
  MoreVertRounded,
  PhotoLibraryRounded,
  SearchRounded,
  SlideshowRounded,
  StarRounded,
  VisibilityRounded,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import ConfirmDialog from 'src/components/alert/confirmDialog';
import { useNotificationSnackbar } from 'src/components/alert/notificationSnackbar';
import { DashboardContent } from 'src/layouts/dashboard';
import { PrintEtatGalerie } from 'src/sections/galerie/etats';
import {
  removeGalerie,
  setGalerieImagesForCurrentEvent,
  setListGalerie,
  setLoadingGalerie,
  upsertGalerie,
  type IGalerieEvenement,
  type IGalerieImage,
} from 'src/store/galerieSlice';
import { apiClient, buildGalerieDownloadUrl, buildGalerieMediaUrl } from 'src/utils/apiClient';

type EventFormState = {
  dateEvenement: string;
  descriptionGalerie: string;
  idGalerie?: number;
  lieuEvenement: string;
  titreGalerie: string;
  typeEvenement: string;
};

type EventSortOption = 'date-desc' | 'date-asc' | 'type-asc' | 'type-desc' | 'title-asc';
type EventTypeFilterOption = 'all' | string;

const eventTypeOptions = [
  'Mariage',
  'Action de grace',
  'Bapteme',
  'Seminaire',
  'Convention',
  'Culte special',
  'Jeunesse',
  'Anniversaire',
];

const emptyEventForm: EventFormState = {
  dateEvenement: '',
  descriptionGalerie: '',
  lieuEvenement: '',
  titreGalerie: '',
  typeEvenement: 'Mariage',
};

const sortOptions: Array<{ label: string; value: EventSortOption }> = [
  { label: 'Date recente', value: 'date-desc' },
  { label: 'Date ancienne', value: 'date-asc' },
  { label: 'Type A-Z', value: 'type-asc' },
  { label: 'Type Z-A', value: 'type-desc' },
  { label: 'Titre A-Z', value: 'title-asc' },
];

const IMAGE_UPLOAD_BATCH_COUNT = 8;
const IMAGE_UPLOAD_BATCH_MAX_SIZE = 45 * 1024 * 1024;

const primaryActionButtonSx = {
  minWidth: 'auto',
  px: 1.6,
  height: 40,
  borderRadius: 2,
  bgcolor: 'grey.900',
  color: 'common.white',
  '&:hover': {
    bgcolor: 'grey.800',
  },
};

const secondaryActionButtonSx = {
  minWidth: 'auto',
  px: 1.4,
  height: 40,
  borderRadius: 2,
};

const buildEventSubtitle = (event: IGalerieEvenement): string => {
  const parts = [event.typeEvenement, event.dateEvenement, event.lieuEvenement].filter(Boolean);
  return parts.join(' - ');
};

const convertFileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const isImageFile = (file: File): boolean =>
  file.type.startsWith('image/') || /\.(bmp|gif|heic|heif|jpe?g|png|webp)$/i.test(file.name);

const splitFilesIntoUploadBatches = (files: File[]): File[][] => {
  const batches: File[][] = [];
  let currentBatch: File[] = [];
  let currentBatchSize = 0;

  files.forEach((file) => {
    const shouldStartNewBatch =
      currentBatch.length > 0
      && (
        currentBatch.length >= IMAGE_UPLOAD_BATCH_COUNT
        || currentBatchSize + file.size > IMAGE_UPLOAD_BATCH_MAX_SIZE
      );

    if (shouldStartNewBatch) {
      batches.push(currentBatch);
      currentBatch = [];
      currentBatchSize = 0;
    }

    currentBatch.push(file);
    currentBatchSize += file.size;
  });

  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
};

const toSortableDate = (value?: string | null): number => {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

export function GalerieView() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { listGalerie, currentGalerieImages, loadingGalerie } = useSelector((state: any) => state.galerie);
  const appUserConnected = useSelector((state: any) => state.application?.userConnected);
  const authUtilisateurData = useSelector((state: any) => state.authentification?.utilisateurData);
  const currentUserId =
    Number(appUserConnected?.idUtilisateurParent || appUserConnected?.idUtilisateur)
    || Number(authUtilisateurData?.idUtilisateurParent || authUtilisateurData?.idUtilisateur)
    || null;

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<EventSortOption>('date-desc');
  const [typeFilter, setTypeFilter] = useState<EventTypeFilterOption>('all');
  const [selectedEvent, setSelectedEvent] = useState<IGalerieEvenement | null>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [eventForm, setEventForm] = useState<EventFormState>(emptyEventForm);
  const [submittingEvent, setSubmittingEvent] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [confirmDeleteEvent, setConfirmDeleteEvent] = useState<IGalerieEvenement | null>(null);
  const [confirmDeleteImage, setConfirmDeleteImage] = useState<IGalerieImage | null>(null);
  const [previewImage, setPreviewImage] = useState<IGalerieImage | null>(null);
  const [captionDialogImage, setCaptionDialogImage] = useState<IGalerieImage | null>(null);
  const [captionValue, setCaptionValue] = useState('');
  const [savingCaption, setSavingCaption] = useState(false);
  const [slideshowOpen, setSlideshowOpen] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);

  const {
    showNotification,
    NotificationComponent,
  } = useNotificationSnackbar();
  const showNotificationRef = useRef(showNotification);

  useEffect(() => {
    showNotificationRef.current = showNotification;
  }, [showNotification]);

  const galerieEvents = useMemo(() => (Array.isArray(listGalerie) ? listGalerie : []), [listGalerie]);
  const galerieImages = useMemo(() => (Array.isArray(currentGalerieImages) ? currentGalerieImages : []), [currentGalerieImages]);
  const previewIndex = useMemo(() => {
    if (!previewImage?.idGalerieImage) return -1;
    return galerieImages.findIndex((image: IGalerieImage) => image.idGalerieImage === previewImage.idGalerieImage);
  }, [galerieImages, previewImage]);

  const availableEventTypes = useMemo(() => {
    const dynamicTypes = galerieEvents
      .map((item: IGalerieEvenement) => item.typeEvenement)
      .filter(Boolean);

    return Array.from(new Set([...eventTypeOptions, ...dynamicTypes]));
  }, [galerieEvents]);

  const loadGaleries = useCallback(async (notifyOnError = true) => {
    if (!currentUserId) return;

    try {
      dispatch(setLoadingGalerie(true));
      const response = await apiClient.getGaleriesByUtilisateur(currentUserId);
      dispatch(setListGalerie(Array.isArray(response.data) ? response.data : []));
    } catch (error: any) {
      console.error('Erreur chargement galerie:', error);
      if (notifyOnError) {
        showNotificationRef.current(error.message || 'Impossible de charger la galerie', 'error');
      }
      dispatch(setListGalerie([]));
    } finally {
      dispatch(setLoadingGalerie(false));
    }
  }, [currentUserId, dispatch]);

  const loadImagesForEvent = useCallback(async (event: IGalerieEvenement) => {
    if (!event.idGalerie) return;

    try {
      const response = await apiClient.getGalerieImages(event.idGalerie);
      const images = Array.isArray(response.data) ? response.data : [];
      dispatch(setGalerieImagesForCurrentEvent({ idGalerie: event.idGalerie, images }));
      setSelectedEvent({
        ...event,
        nombreImages: images.length,
        couvertureGalerie: event.couvertureGalerie || images[0]?.cheminImage || '',
      });
    } catch (error: any) {
      console.error('Erreur chargement images galerie:', error);
      showNotificationRef.current(error.message || 'Impossible de charger les images', 'error');
    }
  }, [dispatch]);

  useEffect(() => {
    loadGaleries(false);
  }, [loadGaleries]);

  // Le tri passe apres le filtre texte pour garder une liste previsible pour l'utilisateur.
  const filteredEvents = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const byType = typeFilter === 'all'
      ? [...galerieEvents]
      : galerieEvents.filter((item: IGalerieEvenement) => item.typeEvenement === typeFilter);

    const filtered = !normalizedSearch
      ? byType
      : byType.filter((item: IGalerieEvenement) =>
          [item.titreGalerie, item.typeEvenement, item.lieuEvenement, item.dateEvenement, item.descriptionGalerie]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(normalizedSearch))
        );

    return filtered.sort((left: IGalerieEvenement, right: IGalerieEvenement) => {
      switch (sortBy) {
        case 'date-asc':
          return toSortableDate(left.dateEvenement) - toSortableDate(right.dateEvenement);
        case 'date-desc':
          return toSortableDate(right.dateEvenement) - toSortableDate(left.dateEvenement);
        case 'type-asc':
          return String(left.typeEvenement || '').localeCompare(String(right.typeEvenement || ''), 'fr', { sensitivity: 'base' });
        case 'type-desc':
          return String(right.typeEvenement || '').localeCompare(String(left.typeEvenement || ''), 'fr', { sensitivity: 'base' });
        case 'title-asc':
        default:
          return String(left.titreGalerie || '').localeCompare(String(right.titreGalerie || ''), 'fr', { sensitivity: 'base' });
      }
    });
  }, [galerieEvents, searchTerm, sortBy, typeFilter]);

  const submitImageFiles = useCallback(async (files: File[]) => {
    if (!currentUserId || !selectedEvent?.idGalerie) {
      showNotificationRef.current('Selectionne un evenement avant de charger des images.', 'warning');
      return;
    }

    const imageFiles = files.filter(isImageFile);

    if (imageFiles.length === 0) {
      showNotificationRef.current('Aucune image valide trouvee dans la selection.', 'warning');
      return;
    }

    try {
      setUploadingImages(true);
      const batches = splitFilesIntoUploadBatches(imageFiles);
      const uploadedCount = await batches.reduce<Promise<number>>(async (previousUpload, batch) => {
        const previousCount = await previousUpload;
        const images = await Promise.all(
          batch.map(async (file) => ({
            base64: await convertFileToBase64(file),
            nomOriginal: file.name,
            typeMime: file.type || 'image/jpeg',
          }))
        );

        await apiClient.addGalerieImages({
          idGalerie: selectedEvent.idGalerie,
          idUtilisateur: currentUserId,
          images,
        });

        return previousCount + batch.length;
      }, Promise.resolve(0));

      await loadImagesForEvent(selectedEvent);
      await loadGaleries();
      showNotificationRef.current(`${uploadedCount} image(s) ajoutee(s) a la galerie.`, 'success');
    } catch (error: any) {
      console.error('Erreur upload galerie:', error);
      showNotificationRef.current(error.message || "Impossible d'ajouter ces images", 'error');
    } finally {
      setUploadingImages(false);
      setIsDragOver(false);
    }
  }, [currentUserId, loadGaleries, loadImagesForEvent, selectedEvent]);

  const handleImageInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    submitImageFiles(files);
  }, [submitImageFiles]);

  const folderInputProps: InputHTMLAttributes<HTMLInputElement> & {
    directory?: string;
    webkitdirectory?: string;
  } = {
    accept: 'image/*',
    directory: '',
    hidden: true,
    multiple: true,
    type: 'file',
    webkitdirectory: '',
    onChange: handleImageInputChange,
  };

  const handleOpenCreateDialog = () => {
    setEventForm(emptyEventForm);
    setEventDialogOpen(true);
  };

  const handleOpenEditDialog = (event: IGalerieEvenement) => {
    setEventForm({
      idGalerie: event.idGalerie,
      titreGalerie: event.titreGalerie,
      typeEvenement: event.typeEvenement,
      dateEvenement: event.dateEvenement || '',
      lieuEvenement: event.lieuEvenement || '',
      descriptionGalerie: event.descriptionGalerie || '',
    });
    setEventDialogOpen(true);
  };

  const handleSubmitEvent = async () => {
    if (!currentUserId) {
      showNotificationRef.current('Session indisponible. Reconnecte-toi.', 'warning');
      return;
    }

    if (!eventForm.titreGalerie.trim()) {
      showNotificationRef.current("Le titre de l'evenement est requis.", 'warning');
      return;
    }

    try {
      setSubmittingEvent(true);
      const payload = {
        ...eventForm,
        couvertureGalerie: selectedEvent?.couvertureGalerie || '',
        dossierGalerie: selectedEvent?.dossierGalerie || '',
        dateEvenement: eventForm.dateEvenement || null,
        idUtilisateur: currentUserId,
      };

      const response = eventForm.idGalerie
        ? await apiClient.updateGalerie(payload)
        : await apiClient.createGalerie(payload);

      if (response.status === 1) {
        if (eventForm.idGalerie) {
          const refreshed = {
            ...(selectedEvent || {}),
            ...payload,
            idGalerie: eventForm.idGalerie,
          } as IGalerieEvenement;
          dispatch(upsertGalerie(refreshed));
          if (selectedEvent?.idGalerie === eventForm.idGalerie) {
            setSelectedEvent(refreshed);
          }
          showNotificationRef.current('Evenement mis a jour avec succes.', 'success');
        } else {
          dispatch(upsertGalerie(response.data));
          showNotificationRef.current('Evenement ajoute avec succes.', 'success');
        }

        setEventDialogOpen(false);
        setEventForm(emptyEventForm);
        await loadGaleries();
      }
    } catch (error: any) {
      console.error('Erreur sauvegarde evenement galerie:', error);
      showNotificationRef.current(error.message || 'Impossible de sauvegarder cet evenement', 'error');
    } finally {
      setSubmittingEvent(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!confirmDeleteEvent?.idGalerie || !currentUserId) return;

    try {
      await apiClient.deleteGalerie(confirmDeleteEvent.idGalerie, currentUserId);
      dispatch(removeGalerie(confirmDeleteEvent.idGalerie));
      if (selectedEvent?.idGalerie === confirmDeleteEvent.idGalerie) {
        setSelectedEvent(null);
      }
      showNotificationRef.current('Evenement supprime avec succes.', 'success');
    } catch (error: any) {
      console.error('Erreur suppression evenement galerie:', error);
      showNotificationRef.current(error.message || "Impossible de supprimer cet evenement", 'error');
    } finally {
      setConfirmDeleteEvent(null);
    }
  };

  const handleDeleteImage = async () => {
    if (!confirmDeleteImage?.idGalerieImage || !currentUserId || !selectedEvent) return;

    try {
      await apiClient.deleteGalerieImage(confirmDeleteImage.idGalerieImage, currentUserId);
      await loadImagesForEvent(selectedEvent);
      await loadGaleries();
      showNotificationRef.current('Image supprimee avec succes.', 'success');
      setPreviewImage(null);
      setSlideshowOpen(false);
    } catch (error: any) {
      console.error('Erreur suppression image galerie:', error);
      showNotificationRef.current(error.message || "Impossible de supprimer cette image", 'error');
    } finally {
      setConfirmDeleteImage(null);
    }
  };

  const handleOpenCaptionDialog = (image: IGalerieImage) => {
    setCaptionDialogImage(image);
    setCaptionValue(image.legendeImage || '');
  };

  const handleSaveCaption = async () => {
    if (!captionDialogImage?.idGalerieImage || !currentUserId || !selectedEvent) return;

    try {
      setSavingCaption(true);
      await apiClient.updateGalerieImage({
        idGalerieImage: captionDialogImage.idGalerieImage,
        legendeImage: captionValue,
        idUtilisateur: currentUserId,
      });
      await loadImagesForEvent(selectedEvent);
      showNotificationRef.current('Legende mise a jour avec succes.', 'success');
      setCaptionDialogImage(null);
      setCaptionValue('');
    } catch (error: any) {
      console.error('Erreur modification legende galerie:', error);
      showNotificationRef.current(error.message || 'Impossible de modifier cette legende', 'error');
    } finally {
      setSavingCaption(false);
    }
  };

  const handleSetCover = async (image: IGalerieImage) => {
    if (!selectedEvent?.idGalerie || !image.idGalerieImage || !currentUserId) return;

    try {
      await apiClient.setGalerieCover({
        idGalerie: selectedEvent.idGalerie,
        idGalerieImage: image.idGalerieImage,
        idUtilisateur: currentUserId,
      });
      const nextEvent = { ...selectedEvent, couvertureGalerie: image.cheminImage };
      setSelectedEvent(nextEvent);
      dispatch(upsertGalerie(nextEvent));
      await loadGaleries();
      showNotificationRef.current('Couverture mise a jour avec succes.', 'success');
    } catch (error: any) {
      console.error('Erreur definition couverture galerie:', error);
      showNotificationRef.current(error.message || 'Impossible de definir cette image comme couverture', 'error');
    }
  };

  // La navigation est partagee entre l'apercu simple et le mode slideshow plein ecran.
  const openPreviewAtIndex = useCallback((index: number) => {
    if (index >= 0 && index < galerieImages.length) {
      setPreviewImage(galerieImages[index]);
    }
  }, [galerieImages]);

  const openSlideshow = (image: IGalerieImage) => {
    setPreviewImage(image);
    setSlideshowOpen(true);
  };

  const selectedEventCoverUrl = selectedEvent?.couvertureGalerie ? buildGalerieMediaUrl(selectedEvent.couvertureGalerie) : '';
  const currentPreviewImage = previewIndex >= 0 ? galerieImages[previewIndex] : previewImage;
  useEffect(() => {
    if (!slideshowOpen) {
      setAutoPlay(false);
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSlideshowOpen(false);
        return;
      }

      if (event.key === 'ArrowLeft' && previewIndex > 0) {
        openPreviewAtIndex(previewIndex - 1);
      }

      if (event.key === 'ArrowRight' && previewIndex < galerieImages.length - 1) {
        openPreviewAtIndex(previewIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [galerieImages.length, openPreviewAtIndex, previewIndex, slideshowOpen]);

  useEffect(() => {
    if (!slideshowOpen || !autoPlay || galerieImages.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      if (previewIndex < 0) return;
      const nextIndex = previewIndex >= galerieImages.length - 1 ? 0 : previewIndex + 1;
      openPreviewAtIndex(nextIndex);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [autoPlay, galerieImages.length, openPreviewAtIndex, previewIndex, slideshowOpen]);

  return (
    <DashboardContent maxWidth="xl">
      <NotificationComponent />

      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h3" sx={{ mb: 0.5 }}>
              Galerie des evenements
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Organise les photos par evenement avec dossier, date, lieu et navigation type explorateur.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ width: { xs: '100%', md: 'auto' } }}>
            {selectedEvent && (
              <Button fullWidth={isMobile} variant="outlined" sx={{ ...secondaryActionButtonSx, width: { xs: '100%', sm: 'auto' } }} startIcon={<ArrowBackRounded />} onClick={() => setSelectedEvent(null)}>
                Retour aux dossiers
              </Button>
            )}
            <Button fullWidth={isMobile} variant="contained" sx={{ ...primaryActionButtonSx, width: { xs: '100%', sm: 'auto' } }} startIcon={<EventRounded />} onClick={handleOpenCreateDialog}>
              Nouvel evenement
            </Button>
          </Stack>
        </Stack>

        {!selectedEvent ? (
          <>
            <Card sx={{ p: 2, borderRadius: 4, background: (muiTheme) => `linear-gradient(135deg, ${alpha(muiTheme.palette.primary.main, 0.16)}, ${alpha(muiTheme.palette.info.main, 0.08)})` }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
                <TextField
                  fullWidth
                  placeholder="Rechercher un evenement, un lieu ou une date..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRounded color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  select
                  label="Trier"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as EventSortOption)}
                  sx={{ minWidth: { xs: '100%', md: 220 } }}
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Type"
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  sx={{ minWidth: { xs: '100%', md: 220 } }}
                >
                  <MenuItem value="all">Tous les types</MenuItem>
                  {availableEventTypes.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
                <Chip color="primary" variant="outlined" icon={<PhotoLibraryRounded />} label={`${filteredEvents.length} dossier(s)`} />
              </Stack>
            </Card>

            <Grid container spacing={3}>
              {filteredEvents.map((event: IGalerieEvenement) => {
                const coverUrl = event.couvertureGalerie ? buildGalerieMediaUrl(event.couvertureGalerie) : '';

                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={event.idGalerie}>
                    <Card sx={{ width: '100%', borderRadius: 4, overflow: 'hidden', bgcolor: 'var(--mui-palette-grey-900, #1f2940)', color: 'common.white' }}>
                      <CardActionArea onClick={() => loadImagesForEvent(event)}>
                        <Box sx={{ p: 2, pb: 1 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Avatar variant="rounded" sx={{ width: 58, height: 58, borderRadius: 3, bgcolor: alpha('#ffffff', 0.14), color: 'common.white' }}>
                              {coverUrl ? <Box component="img" src={coverUrl} alt={event.titreGalerie} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FolderRounded sx={{ fontSize: 34 }} />}
                            </Avatar>

                            <Stack direction="row" spacing={0.5}>
                              <Tooltip title="Modifier">
                                <IconButton size="small" sx={{ color: 'common.white' }} onClick={(clickEvent) => { clickEvent.stopPropagation(); handleOpenEditDialog(event); }}>
                                  <EditRounded fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Supprimer">
                                <IconButton size="small" sx={{ color: 'common.white' }} onClick={(clickEvent) => { clickEvent.stopPropagation(); setConfirmDeleteEvent(event); }}>
                                  <DeleteRounded fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Stack>
                        </Box>

                        <CardContent sx={{ pt: 0 }}>
                          <Typography variant="h6" sx={{ mb: 0.75, fontSize: '1.05rem' }}>{event.titreGalerie}</Typography>
                          <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7), minHeight: 34, fontSize: '0.88rem' }}>
                            {buildEventSubtitle(event) || 'Evenement sans details complementaires.'}
                          </Typography>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5 }}>
                            <Chip size="small" label={event.typeEvenement || 'Evenement'} sx={{ bgcolor: alpha('#ffffff', 0.12), color: 'common.white' }} />
                            <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.64) }}>{event.nombreImages || 0} image(s)</Typography>
                          </Stack>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {!loadingGalerie && filteredEvents.length === 0 && (
              <Card sx={{ p: 6, borderRadius: 4, textAlign: 'center' }}>
                <PhotoLibraryRounded sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
                <Typography variant="h5" sx={{ mb: 1 }}>Aucun evenement trouve</Typography>
                <Typography color="text.secondary">Cree un premier dossier evenement pour commencer a archiver tes photos.</Typography>
              </Card>
            )}
          </>
        ) : (
          <Stack spacing={3}>
            <Card sx={{ borderRadius: 4, overflow: 'hidden', background: (muiTheme) => `linear-gradient(135deg, ${alpha(muiTheme.palette.primary.main, 0.12)}, ${alpha(muiTheme.palette.info.main, 0.06)})` }}>
              <Grid container>
                <Grid item xs={12} md={4}>
                  <Box sx={{ minHeight: 240, bgcolor: 'grey.900', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedEventCoverUrl ? (
                      <Box component="img" src={selectedEventCoverUrl} alt={selectedEvent.titreGalerie} sx={{ width: '100%', height: '100%', minHeight: 240, objectFit: 'cover' }} />
                    ) : (
                      <FolderRounded sx={{ fontSize: 92, color: 'common.white' }} />
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Stack spacing={2.5} sx={{ p: 3 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                      <Box>
                        <Typography variant="h4">{selectedEvent.titreGalerie}</Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>
                          {selectedEvent.descriptionGalerie || 'Album evenementiel de la communaute.'}
                        </Typography>
                      </Box>

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap" sx={{ width: { xs: '100%', md: 'auto' } }}>
                        <Button fullWidth={isMobile} variant="outlined" sx={secondaryActionButtonSx} startIcon={<EditRounded />} onClick={() => handleOpenEditDialog(selectedEvent)}>Modifier</Button>
                        <Button fullWidth={isMobile} color="error" variant="outlined" sx={secondaryActionButtonSx} startIcon={<DeleteRounded />} onClick={() => setConfirmDeleteEvent(selectedEvent)}>Supprimer</Button>
                      </Stack>
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap">
                      <Chip icon={<ImageRounded />} label={`${galerieImages.length} image(s)`} />
                      <Chip icon={<CalendarMonthRounded />} label={selectedEvent.dateEvenement || 'Date non precisee'} />
                      <Chip icon={<LocationOnRounded />} label={selectedEvent.lieuEvenement || 'Lieu non precise'} />
                      <Chip icon={<MoreVertRounded />} label={selectedEvent.typeEvenement || 'Evenement'} />
                    </Stack>

                    <Box
                      onDragOver={(event) => {
                        event.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={(event) => {
                        event.preventDefault();
                        const files = Array.from(event.dataTransfer.files || []).filter((file) => file.type.startsWith('image/'));
                        submitImageFiles(files);
                      }}
                      sx={{
                        border: '2px dashed',
                        borderColor: isDragOver ? 'primary.main' : 'divider',
                        borderRadius: 3,
                        p: 2,
                        bgcolor: isDragOver ? (muiTheme) => alpha(muiTheme.palette.primary.main, 0.08) : 'background.paper',
                      }}
                    >
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }} flexWrap="wrap">
                        <Button fullWidth={isMobile} component="label" variant="contained" sx={{ ...primaryActionButtonSx, px: 1.4, width: { xs: '100%', md: 'auto' } }} startIcon={<AddPhotoAlternateRounded />} disabled={uploadingImages}>
                          {uploadingImages ? 'Ajout en cours...' : 'Ajouter des photos'}
                          <input hidden accept="image/*" multiple type="file" onChange={handleImageInputChange} />
                        </Button>
                        <Button fullWidth={isMobile} component="label" variant="outlined" sx={{ ...secondaryActionButtonSx, width: { xs: '100%', md: 'auto' } }} startIcon={<FolderRounded />} disabled={uploadingImages}>
                          Ajouter un dossier
                          <input {...folderInputProps} />
                        </Button>
                        <Button fullWidth={isMobile} component="a" href={buildGalerieDownloadUrl(selectedEvent.idGalerie || 0, currentUserId)} variant="outlined" sx={{ ...secondaryActionButtonSx, width: { xs: '100%', md: 'auto' } }} startIcon={<DownloadRounded />}>
                          Telecharger le dossier
                        </Button>
                        <PrintEtatGalerie event={selectedEvent} images={galerieImages} />
                        <Typography variant="body2" color="text.secondary">
                          Depose aussi tes images ici par glisser-deposer. Les gros lots sont envoyes progressivement.
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Card>

            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={1.5}>
              <Box>
                <Typography variant="h5">Photos de l&apos;evenement</Typography>
                <Typography variant="body2" color="text.secondary">
                  Ouvre une image pour lancer le slideshow plein ecran et naviguer rapidement.
                </Typography>
              </Box>
              <Button
                variant="outlined"
                fullWidth={isMobile}
                sx={{ ...secondaryActionButtonSx, width: { xs: '100%', sm: 'auto' } }}
                startIcon={<SlideshowRounded />}
                disabled={galerieImages.length === 0}
                onClick={() => openSlideshow(galerieImages[0])}
              >
                Lancer le slideshow
              </Button>
            </Stack>

            <Grid container spacing={2.5}>
              {galerieImages.map((image: IGalerieImage) => {
                const isCover = selectedEvent.couvertureGalerie === image.cheminImage;
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={image.idGalerieImage}>
                    <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
                      <Box component="img" src={buildGalerieMediaUrl(image.cheminImage)} alt={image.nomFichier} sx={{ width: '100%', height: 220, objectFit: 'cover', cursor: 'pointer' }} onClick={() => setPreviewImage(image)} />

                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2 }}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle2" noWrap>{image.legendeImage || image.nomFichier}</Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>{image.dateAjout || 'Ajoutee recemment'}</Typography>
                        </Box>

                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title={isCover ? 'Image de couverture' : 'Definir comme couverture'}>
                            <span>
                              <IconButton color={isCover ? 'warning' : 'default'} disabled={isCover} onClick={() => handleSetCover(image)}>
                                <StarRounded fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Voir">
                            <IconButton onClick={() => setPreviewImage(image)}><VisibilityRounded fontSize="small" /></IconButton>
                          </Tooltip>
                          <Tooltip title="Slideshow plein ecran">
                            <IconButton onClick={() => openSlideshow(image)}><FullscreenRounded fontSize="small" /></IconButton>
                          </Tooltip>
                          <Tooltip title="Modifier la legende">
                            <IconButton onClick={() => handleOpenCaptionDialog(image)}><EditRounded fontSize="small" /></IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton color="error" onClick={() => setConfirmDeleteImage(image)}><DeleteRounded fontSize="small" /></IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {galerieImages.length === 0 && (
              <Card sx={{ p: 6, borderRadius: 4, textAlign: 'center' }}>
                <ImageRounded sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
                <Typography variant="h5" sx={{ mb: 1 }}>Ce dossier ne contient pas encore d&apos;image</Typography>
                <Typography color="text.secondary">Ajoute les photos de cet evenement pour commencer la galerie.</Typography>
              </Card>
            )}
          </Stack>
        )}
      </Stack>

      <Dialog open={eventDialogOpen} onClose={() => setEventDialogOpen(false)} fullScreen={isMobile} fullWidth maxWidth="sm" PaperProps={{ sx: { m: { xs: 0, sm: 2 }, borderRadius: { xs: 0, sm: 3 } } }}>
        <DialogTitle>{eventForm.idGalerie ? "Modifier l'evenement" : 'Nouvel evenement'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Type d'evenement" value={eventForm.typeEvenement} onChange={(event) => setEventForm((previous) => ({ ...previous, typeEvenement: event.target.value }))} select fullWidth>
              {eventTypeOptions.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
            </TextField>
            <TextField label="Titre de l'evenement" value={eventForm.titreGalerie} onChange={(event) => setEventForm((previous) => ({ ...previous, titreGalerie: event.target.value }))} fullWidth />
            <TextField label="Date" type="date" value={eventForm.dateEvenement} onChange={(event) => setEventForm((previous) => ({ ...previous, dateEvenement: event.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="Lieu" value={eventForm.lieuEvenement} onChange={(event) => setEventForm((previous) => ({ ...previous, lieuEvenement: event.target.value }))} fullWidth />
            <TextField label="Description" value={eventForm.descriptionGalerie} onChange={(event) => setEventForm((previous) => ({ ...previous, descriptionGalerie: event.target.value }))} fullWidth minRows={3} multiline />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 1, px: 3, py: 2 }}>
          <Button fullWidth={isMobile} onClick={() => setEventDialogOpen(false)}>Annuler</Button>
          <Button fullWidth={isMobile} variant="contained" sx={primaryActionButtonSx} onClick={handleSubmitEvent} disabled={submittingEvent}>{submittingEvent ? 'Enregistrement...' : 'Enregistrer'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(captionDialogImage)} onClose={() => setCaptionDialogImage(null)} fullWidth maxWidth="sm">
        <DialogTitle>Modifier la legende</DialogTitle>
        <DialogContent>
          <TextField fullWidth autoFocus label="Legende de l'image" value={captionValue} onChange={(event) => setCaptionValue(event.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCaptionDialogImage(null)}>Annuler</Button>
          <Button variant="contained" sx={primaryActionButtonSx} onClick={handleSaveCaption} disabled={savingCaption}>{savingCaption ? 'Enregistrement...' : 'Enregistrer'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(previewImage) && !slideshowOpen} onClose={() => setPreviewImage(null)} maxWidth="lg" fullWidth>
        <DialogTitle>{previewImage?.legendeImage || previewImage?.nomFichier || 'Apercu image'}</DialogTitle>
        <DialogContent>
          {previewImage && (
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton onClick={() => openPreviewAtIndex(previewIndex - 1)} disabled={previewIndex <= 0}>
                <ChevronLeftRounded />
              </IconButton>
              <Box component="img" src={buildGalerieMediaUrl(previewImage.cheminImage)} alt={previewImage.nomFichier} sx={{ width: '100%', maxHeight: '72vh', objectFit: 'contain', borderRadius: 2 }} />
              <IconButton onClick={() => openPreviewAtIndex(previewIndex + 1)} disabled={previewIndex < 0 || previewIndex >= galerieImages.length - 1}>
                <ChevronRightRounded />
              </IconButton>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewImage(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={slideshowOpen}
        onClose={() => setSlideshowOpen(false)}
        fullScreen
        PaperProps={{
          sx: {
            bgcolor: '#060b16',
            backgroundImage: 'radial-gradient(circle at top, rgba(34, 197, 94, 0.12), transparent 28%), radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.16), transparent 24%)',
          },
        }}
      >
        <Box sx={{ position: 'relative', height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2, color: 'common.white' }}>
            <Box>
              <Typography variant="h5">{selectedEvent?.titreGalerie || 'Slideshow galerie'}</Typography>
              <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.72) }}>
                {currentPreviewImage?.legendeImage || currentPreviewImage?.nomFichier || 'Apercu plein ecran'}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant={autoPlay ? 'contained' : 'outlined'}
                color="inherit"
                startIcon={<SlideshowRounded />}
                onClick={() => setAutoPlay((previous) => !previous)}
                sx={{
                  borderColor: alpha('#ffffff', 0.24),
                  color: 'common.white',
                  ...(autoPlay ? { bgcolor: alpha('#ffffff', 0.16) } : {}),
                }}
              >
                {autoPlay ? 'Lecture auto active' : 'Lecture auto'}
              </Button>
              <Chip
                label={previewIndex >= 0 ? `${previewIndex + 1} / ${galerieImages.length}` : `0 / ${galerieImages.length}`}
                sx={{ bgcolor: alpha('#ffffff', 0.12), color: 'common.white' }}
              />
              <IconButton sx={{ color: 'common.white' }} onClick={() => setSlideshowOpen(false)}>
                <CloseRounded />
              </IconButton>
            </Stack>
          </Stack>

          <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: '88px minmax(0, 1fr) 88px', alignItems: 'center', px: { xs: 1, md: 3 }, pb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <IconButton
                onClick={() => openPreviewAtIndex(previewIndex - 1)}
                disabled={previewIndex <= 0}
                sx={{
                  color: 'common.white',
                  bgcolor: alpha('#ffffff', 0.12),
                  '&:hover': { bgcolor: alpha('#ffffff', 0.2) },
                  '&.Mui-disabled': { color: alpha('#ffffff', 0.28) },
                }}
              >
                <ChevronLeftRounded sx={{ fontSize: 34 }} />
              </IconButton>
            </Box>

            <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ minWidth: 0 }}>
              {currentPreviewImage && (
                <>
                  <Box
                    component="img"
                    src={buildGalerieMediaUrl(currentPreviewImage.cheminImage)}
                    alt={currentPreviewImage.nomFichier}
                    sx={{
                      width: '100%',
                      maxWidth: 1320,
                      maxHeight: '72vh',
                      objectFit: 'contain',
                      borderRadius: 4,
                      boxShadow: '0 28px 70px rgba(0, 0, 0, 0.42)',
                    }}
                  />
                  <Stack spacing={0.5} alignItems="center" sx={{ px: 2 }}>
                    <Typography variant="h6" sx={{ color: 'common.white', textAlign: 'center' }}>
                      {currentPreviewImage.legendeImage || currentPreviewImage.nomFichier}
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.68), textAlign: 'center' }}>
                      {selectedEvent?.typeEvenement || 'Evenement'} - {selectedEvent?.dateEvenement || 'Date non precisee'} - {selectedEvent?.lieuEvenement || 'Lieu non precise'}
                    </Typography>
                  </Stack>
                </>
              )}
            </Stack>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <IconButton
                onClick={() => openPreviewAtIndex(previewIndex + 1)}
                disabled={previewIndex < 0 || previewIndex >= galerieImages.length - 1}
                sx={{
                  color: 'common.white',
                  bgcolor: alpha('#ffffff', 0.12),
                  '&:hover': { bgcolor: alpha('#ffffff', 0.2) },
                  '&.Mui-disabled': { color: alpha('#ffffff', 0.28) },
                }}
              >
                <ChevronRightRounded sx={{ fontSize: 34 }} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Dialog>

      <ConfirmDialog open={Boolean(confirmDeleteEvent)} title="Supprimer cet evenement" message={`Les photos du dossier "${confirmDeleteEvent?.titreGalerie || ''}" seront aussi supprimees.`} confirmText="Supprimer" onConfirm={handleDeleteEvent} onClose={() => setConfirmDeleteEvent(null)} />
      <ConfirmDialog open={Boolean(confirmDeleteImage)} title="Supprimer cette image" message="Cette image sera retiree du dossier evenement." confirmText="Supprimer" onConfirm={handleDeleteImage} onClose={() => setConfirmDeleteImage(null)} />
    </DashboardContent>
  );
}














