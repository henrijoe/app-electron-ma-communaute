import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import {
  Grid, Dialog, Divider, MenuItem, TextField, DialogTitle, DialogActions,
  Avatar, IconButton, Stack, DialogContent

} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';

import { apiClient, buildPhotoUrl } from 'src/utils/apiClient';
import { useNotificationSnackbar } from 'src/components/alert/notificationSnackbar';

import { TableNoData } from '../table-no-data';
import { UserTableRow } from '../user-table-row';
import { UserTableHead } from '../user-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { UserTableToolbar } from '../user-table-toolbar';
import { DashboardContent } from '../../../layouts/dashboard';
import { Iconify } from '../../../components/iconify/iconify';
import { emptyRows, applyFilter, getComparator } from '../utils';
import { Scrollbar } from '../../../components/scrollbar/scrollbar';
import { membre, dataGenre, setDataModifiesMembre, deleteMembre, IMembre, IDataChoice, dataGroupe, dataBapteme, dataCellule, dataNouvelAme, ensureMembreArrays, setListFilterMembre, setListMembre, visiteMembres, dataDepartement, dataNiveauEtude, dataResponsabilite, dataSituationMembre , dataCapaciteSpirituelle, dataCivilite } from '../../../store/membreSlice';
import PrintEtatGlobal from '../etats/printEtats';

// ----------------------------------------------------------------------

// Notification state

export function UserView() {
  const dispatch = useDispatch();

  // Utilisez useSelector pour obtenir les données du store
  const { listMembre } = useSelector((state: any) => state.membre);
  const appUserConnected = useSelector((state: any) => state.application?.userConnected);
  const authUtilisateurData = useSelector((state: any) => state.authentification?.utilisateurData);
  const currentUserId =
    Number(appUserConnected?.idUtilisateur)
    || Number(authUtilisateurData?.idUtilisateur)
    || null;

  const [loading, setLoading] = useState(true);
  const table = useTable();


  // Destructurer les valeurs nécessaires de useTable
  const { selected, onSelectAllRows } = table;

  const [filterName, setFilterName] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [maxWidth] = useState<any>('lg');
  const [data, setData] = useState({ ...membre });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isEditMode, setIsEditMode] = useState(false); // Ajoutez ce state
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const {
    showNotification,
    hideNotification,
    NotificationComponent
  } = useNotificationSnackbar();

  // Déclarez useForm avec IMembre comme type
  const { setFocus, register, handleSubmit: formHandleSubmit, formState: { errors } } = useForm<IMembre>();

  // Définissez handleCloseDialog avant de l'utiliser
  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setIsEditMode(false);
    setData({ ...membre });
    setPhotoPreview(null);
    setPhotoFile(null);
  }, []);


  const handleOpenDialog = useCallback(() => setOpenDialog(true), []);

  // Définissez fetchMembres avec useCallback
  const fetchMembres = useCallback(async () => {
    try {
      setLoading(true);
      dispatch(ensureMembreArrays());
      const response = currentUserId
        ? await apiClient.getMembresByUtilisateur(currentUserId)
        : await apiClient.getMembres();
      if (response.status === 1) {
        const membres = Array.isArray(response.data) ? response.data : [];
        dispatch(setListMembre(membres));
        dispatch(setListFilterMembre(membres));
      }
    } catch (error) {
      console.error('Error fetching membres:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, dispatch]);

  // Fonction pour convertir un fichier en base64 (version simplifiée)
  const convertFileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file); // Ceci produit le format data:image/...;base64,...
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });


  // Dans handlePhotoChange - NE PAS extraire seulement la partie base64
  const handlePhotoChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('La photo ne doit pas dépasser 5MB', 'warning'); // Remplacer alert
        return;
      }

      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        showNotification('Veuillez sélectionner une image valide', 'warning'); // Remplacer alert
        return;
      }

      setPhotoFile(file);

      // Créer une preview
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);

      // Convertir en base64 complet (AVEC le préfixe data:image/...)
      try {
        const base64 = await convertFileToBase64(file);
        // NE PAS extraire seulement la partie base64 - Garder le format complet
        setData((prev: any) => ({
          ...prev,
          photoMembre: base64 // Envoyer le format complet au backend
        }));

      } catch (error) {
        console.error('Erreur de conversion de la photo:', error);
        showNotification('Erreur lors de la conversion de la photo', 'error'); // Remplacer alert
      }
    } else {
      setPhotoFile(null);
    }
  }, [showNotification]); // Ajouter showNotification aux dépendances

  // Fonction pour supprimer la photo
  const handleRemovePhoto = useCallback(() => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setData((prev: any) => ({ ...prev, photoMembre: '' }));
    // Nettoyer l'URL de preview
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
  }, [photoPreview]);


  // Nettoyer les URLs de preview lors du démontage (version simplifiée)
  useEffect(() =>
    () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    },
    [photoPreview]);

  useEffect(() => {
    // Lorsque le dialogue se ferme, réinitialiser complètement
    if (!openDialog) {
      setData({ ...membre });
      setPhotoPreview(null);
      setPhotoFile(null);
      setIsEditMode(false);
    }
  }, [openDialog]);

  const handleDeleteMembre = useCallback(async (idMembre: number) => {
    if (!currentUserId) {
      showNotification('Session expirée: reconnectez-vous', 'warning');
      return;
    }

    try {
      setDeleteLoading(true);
      const response = await apiClient.deleteMembre(idMembre, currentUserId);
      if (response.status === 1) {
        dispatch(deleteMembre(idMembre));
        showNotification('Membre supprimé avec succès', 'success'); // Utiliser showNotification
      } else {
        console.error('Erreur lors de la suppression:', response.error);
        showNotification(
          `Erreur lors de la suppression: ${response.error?.message || 'Erreur inconnue'}`,
          'error'
        );
      }
    } catch (error: any) {
      console.error('Error deleting membre:', error);
      showNotification(
        `Erreur: ${error.message || 'Erreur lors de la suppression'}`,
        'error'
      );
    } finally {
      setDeleteLoading(false);
    }
  }, [currentUserId, dispatch, showNotification]); // Ajouter showNotification aux dépendances

  // Fonction pour gérer la modification
  const handleEditMembre = useCallback((membreData: IMembre) => {
    setIsEditMode(true);

    // Créer une copie profonde des données
    const formData: any = { ...membreData };

    // Normaliser les valeurs null/undefined
    const normalizeValue = (value: any): string => {
      if (value === null || value === undefined || value === '') {
        return '';
      }
      return String(value);
    };

    // Normaliser tous les champs
    const allFields = [
      'sexeMembre', 'nouvelleAmeMembre', 'baptemeEauMembre',
      'baptemeSaintEspritMembre', 'visiteMembre',
      'situationMatrimonialeMembre', 'capaciteSpirituelleMembre',
      'nomMembre', 'prenomMembre', 'lieuNaissMembre', 'nationaliteMembre',
      'emailMembre', 'fonctionMembre', 'contactMembre', 'ethnieMembre',
      'residenceMembre', 'egliseOrigineMembre', 'lieuBaptemeEauMembre',
      'nomAmiEglise', 'raisonNonVisiteMembre', 'heureVisiteMembre',
      'lieuTravailMembre', 'nomFiance'
    ];

    allFields.forEach(field => {
      formData[field] = normalizeValue(formData[field]);
    });

    // Normaliser les champs numériques optionnels
    const optionalNumberFields = [
      'idNiveauEtude', 'idCellule', 'idDepartement', 'idGroupe', 'idResponsabilite'
    ];

    optionalNumberFields.forEach(field => {
      formData[field] = formData[field] === null || formData[field] === undefined ? '' : String(formData[field]);
    });

    // Formater les dates
    const dateFields = [
      'dateNaissMembre', 'dateConversionMembre', 'dateBaptemeMembre',
      'dateMariageMembre', 'dateBaptemeSaintEspritMembre', 'dateDecisionMembre'
    ];

    dateFields.forEach(field => {
      if (formData[field] && typeof formData[field] === 'string') {
        formData[field] = formData[field].split('T')[0];
      } else {
        formData[field] = '';
      }
    });

    console.log("Données pour édition après nettoyage:", formData);

    // Mettre à jour l'état
    setData(formData);

    // Gestion de la photo
    if (formData.photoMembre && formData.photoMembre !== '') {
      if (formData.photoMembre.startsWith('membre_') ||
        (!formData.photoMembre.startsWith('data:image/') &&
          !formData.photoMembre.startsWith('http'))) {
        const photoUrl = buildPhotoUrl(formData.photoMembre);
        setPhotoPreview(photoUrl);
      } else if (formData.photoMembre.startsWith('data:image/') || formData.photoMembre.startsWith('http')) {
        setPhotoPreview(formData.photoMembre);
      }
    } else {
      setPhotoPreview(null);
    }

    setOpenDialog(true);
  }, []);

  // Fonction pour mettre à jour un membre
  const handleUpdateMembre = useCallback(async (formData: IMembre) => {
    if (!currentUserId) {
      showNotification('Session expirée: reconnectez-vous', 'warning');
      return;
    }

    try {
      setUpdateLoading(true);

      // Obtenir le membre actuel depuis le store pour avoir toutes les données
      const currentMembre = listMembre.find((m: IMembre) => m.idMembre === data.idMembre);

      // Fusionner les nouvelles données avec les anciennes pour ne pas perdre les champs non modifiés
      const mergedData = {
        ...currentMembre,  // Les anciennes données
        ...formData,       // Les nouvelles données du formulaire
        idMembre: data.idMembre, // Garder l'ID
      };

      // Préparer les données pour l'API
      const cleanedData: any = {
        ...mergedData,
        idUtilisateur: currentUserId || currentMembre?.idUtilisateur || null,
        // Convertir les string vides en null pour l'API
        idNiveauEtude: formData.idNiveauEtude ? Number(formData.idNiveauEtude) : currentMembre?.idNiveauEtude,
        idCellule: formData.idCellule ? Number(formData.idCellule) : currentMembre?.idCellule,
        idDepartement: formData.idDepartement && formData.idDepartement !== null ? Number(formData.idDepartement) : currentMembre?.idDepartement,
        idGroupe: formData.idGroupe && formData.idGroupe !== null ? Number(formData.idGroupe) : currentMembre?.idGroupe,
        idResponsabilite: formData.idResponsabilite && formData.idResponsabilite !== null ? Number(formData.idResponsabilite) : currentMembre?.idResponsabilite,

        // Convertir les select en nombres
        sexeMembre: formData.sexeMembre && formData.sexeMembre !== '' ? Number(formData.sexeMembre) : Number(currentMembre?.sexeMembre) || null,
        nouvelleAmeMembre: formData.nouvelleAmeMembre && formData.nouvelleAmeMembre !== '' ? Number(formData.nouvelleAmeMembre) : Number(currentMembre?.nouvelleAmeMembre) || null,
        baptemeEauMembre: formData.baptemeEauMembre && formData.baptemeEauMembre !== '' ? Number(formData.baptemeEauMembre) : Number(currentMembre?.baptemeEauMembre) || null,
        baptemeSaintEspritMembre: formData.baptemeSaintEspritMembre && formData.baptemeSaintEspritMembre !== '' ? Number(formData.baptemeSaintEspritMembre) : Number(currentMembre?.baptemeSaintEspritMembre) || null,
        situationMatrimonialeMembre: formData.situationMatrimonialeMembre && formData.situationMatrimonialeMembre !== '' ? Number(formData.situationMatrimonialeMembre) : Number(currentMembre?.situationMatrimonialeMembre) || null,
        visiteMembre: formData.visiteMembre && formData.visiteMembre !== '' ? Number(formData.visiteMembre) : Number(currentMembre?.visiteMembre) || null,
        capaciteSpirituelleMembre: formData.capaciteSpirituelleMembre && formData.capaciteSpirituelleMembre !== '' ? Number(formData.capaciteSpirituelleMembre) : Number(currentMembre?.capaciteSpirituelleMembre) || null,

        // Garder la photo
        photoMembre: data.photoMembre || formData.photoMembre || currentMembre?.photoMembre || '',
      };

      console.log('Données envoyées à l\'API:', cleanedData);

      const response = await apiClient.updateMembre(cleanedData);

      if (response.status === 1) {
        // Préparer les données pour le store
        const updatedMembre = {
          ...cleanedData,
          // Reconvertir en string pour le store
          sexeMembre: cleanedData.sexeMembre ? String(cleanedData.sexeMembre) : currentMembre?.sexeMembre || '',
          nouvelleAmeMembre: cleanedData.nouvelleAmeMembre ? String(cleanedData.nouvelleAmeMembre) : currentMembre?.nouvelleAmeMembre || '',
          baptemeEauMembre: cleanedData.baptemeEauMembre ? String(cleanedData.baptemeEauMembre) : currentMembre?.baptemeEauMembre || '',
          baptemeSaintEspritMembre: cleanedData.baptemeSaintEspritMembre ? String(cleanedData.baptemeSaintEspritMembre) : currentMembre?.baptemeSaintEspritMembre || '',
          visiteMembre: cleanedData.visiteMembre ? String(cleanedData.visiteMembre) : currentMembre?.visiteMembre || '',
          situationMatrimonialeMembre: cleanedData.situationMatrimonialeMembre ? String(cleanedData.situationMatrimonialeMembre) : currentMembre?.situationMatrimonialeMembre || '',
          capaciteSpirituelleMembre: cleanedData.capaciteSpirituelleMembre ? String(cleanedData.capaciteSpirituelleMembre) : currentMembre?.capaciteSpirituelleMembre || '',
        };

        console.log('Données pour le store:', updatedMembre);

        // Mettre à jour le store Redux
        dispatch(setDataModifiesMembre(updatedMembre));

        // Fermer le dialogue
        handleCloseDialog();

        // Afficher notification de succès
        showNotification('Membre modifié avec succès', 'success');

      } else {
        showNotification('Erreur lors de la modification du membre', 'error'); // Remplacer alert
      }
    } catch (error) {
      console.error('Error updating membre:', error);
      showNotification('Erreur lors de la modification', 'error'); // Remplacer alert
    } finally {
      setUpdateLoading(false);
    }
  }, [currentUserId, data.idMembre, data.photoMembre, listMembre, dispatch, handleCloseDialog, showNotification]); // Ajouter showNotification

  // Fonction pour créer ou mettre à jour un membre
  const handleCreateOrUpdateMembre = useCallback(async (membreData: IMembre) => {
    if (isEditMode) {
      await handleUpdateMembre(membreData);
    } else {
      if (!currentUserId) {
        showNotification('Session expirée: reconnectez-vous', 'warning');
        return;
      }

      try {
        setUpdateLoading(true);

        const cleanedData = {
          ...membreData,

          // Ajoutez les champs manquants avec des valeurs par défaut
          residenceMembre: membreData.residenceMembre || '',
          civiliteMembre: membreData.civiliteMembre || '',
          nomFiance: membreData.nomFiance || '',
          lieuBaptemeEauMembre: membreData.lieuBaptemeEauMembre || '',
          dateBaptemeMembre: membreData.dateBaptemeMembre || null,
          dateMariageMembre: membreData.dateMariageMembre || null,
          dateBaptemeSaintEspritMembre: membreData.dateBaptemeSaintEspritMembre || null,
          dateDecisionMembre: membreData.dateDecisionMembre || null,
          dateConversionMembre: membreData.dateConversionMembre || null,

          // Champs avec valeurs par défaut explicites
          nouvelleAmeMembre: Number(membreData.nouvelleAmeMembre) || 0, // Pas 1 ou 2, mais 0 par défaut
          baptemeEauMembre: Number(membreData.baptemeEauMembre) || 0,
          baptemeSaintEspritMembre: Number(membreData.baptemeSaintEspritMembre) || 0,
          visiteMembre: Number(membreData.visiteMembre) || 0,

          // Convertir les chaînes vides en null pour l'API
          idNiveauEtude: membreData.idNiveauEtude ? Number(membreData.idNiveauEtude) : null,
          idCellule: membreData.idCellule ? Number(membreData.idCellule) : null,
          idDepartement: membreData.idDepartement ? Number(membreData.idDepartement) : null,
          idGroupe: membreData.idGroupe ? Number(membreData.idGroupe) : null,
          idResponsabilite: membreData.idResponsabilite ? Number(membreData.idResponsabilite) : null,

          // Convertir en nombres
          sexeMembre: Number(membreData.sexeMembre) || 0,
          situationMatrimonialeMembre: Number(membreData.situationMatrimonialeMembre) || 0,
          capaciteSpirituelleMembre: Number(membreData.capaciteSpirituelleMembre) || 0,

          // La photo est déjà en base64
          photoMembre: data.photoMembre || membreData.photoMembre || '',

          // Champs obligatoires qui doivent toujours avoir une valeur
          contactMembre: membreData.contactMembre || '',
          emailMembre: membreData.emailMembre || '',
          nomMembre: membreData.nomMembre || '',
          prenomMembre: membreData.prenomMembre || '',

          // Valeur pour idUtilisateur (obligatoire côté API)
          idUtilisateur: currentUserId
        };

        const response = await apiClient.createMembre(cleanedData);
        if (response.status === 1) {
          fetchMembres();
          handleCloseDialog();

          // Afficher notification de succès
          showNotification('Membre créé avec succès', 'success');

        } else {
          showNotification('Erreur lors de la création du membre', 'error');
        }
      } catch (error) {
        console.error('Error creating membre:', error);
        showNotification('Erreur lors de la création du membre', 'error'); // Remplacer alert
      } finally {
        setUpdateLoading(false);
      }
    }
  }, [currentUserId, isEditMode, handleUpdateMembre, fetchMembres, handleCloseDialog, data.photoMembre, showNotification]); // Ajouter showNotification

  // Fonction pour gérer la soumission du formulaire
  const onFormSubmit = useCallback((formData: IMembre) => {
    // Validation de base
    if (!formData.nomMembre.trim()) {
      showNotification('Le nom est requis', 'warning'); // Remplacer alert
      return;
    }

    if (!formData.contactMembre.trim()) {
      showNotification('Le contact est requis', 'warning'); // Remplacer alert
      return;
    }

    console.log(isEditMode ? 'Membre à modifier :' : 'Membre à créer :', formData);

    // Préparer les données en fonction du mode
    const membreData: IMembre = {
      ...formData,
      photoMembre: data.photoMembre || formData.photoMembre || '',

      // Si en mode édition, garder l'ID
      ...(isEditMode && data.idMembre && { idMembre: data.idMembre }),
    };

    console.log('Données préparées :', membreData);
    handleCreateOrUpdateMembre(membreData);
  }, [isEditMode, data.photoMembre, data.idMembre, handleCreateOrUpdateMembre, showNotification]); // Ajouter showNotification

  // Utilisez useEffect avec fetchMembres dans les dépendances
  useEffect(() => {
    fetchMembres();
  }, [fetchMembres]);

  // Refactorez pour utiliser les données du store
  const dataFiltered: IMembre[] = useMemo(() => {
    const dataToFilter = Array.isArray(listMembre) ? listMembre : [];
    return applyFilter({
      inputData: dataToFilter,
      comparator: getComparator(table?.order, table?.orderBy),
      filterName,
    });
  }, [listMembre, table.order, table.orderBy, filterName]);

  const notFound = !dataFiltered?.length && !!filterName;

  // Triez les données filtrées par nom
  const sortedData = useMemo(() => dataFiltered.sort((a, b) => {
    const nameA = a.nomMembre?.toLowerCase();
    const nameB = b.nomMembre?.toLowerCase();
    return table.order === 'asc'
      ? nameA?.localeCompare(nameB)
      : nameB?.localeCompare(nameA);
  }), [dataFiltered, table.order]);

  // Remplacez votre fonction handleChange par celle-ci :
  const handleChange = useCallback((event: any) => {
    const { name, value } = event.target;
    let sanitizedValue = value;

    if (name === 'contactMembre' && !/^\d*\.?\d*$/.test(value)) {
      sanitizedValue = '';
    }

    setData((prevData: any) => ({ ...prevData, [name]: sanitizedValue }));

    // Ne passez PAS au champ suivant ici, laissez le onKeyDown s'en occuper
  }, []);

  // Fonction pour gérer la suppression multiple
  const handleDeleteSelected = useCallback(async () => {
    if (selected.length === 0) return;

    try {
      setDeleteLoading(true);

      const deletePromises = selected?.map((idMembreStr) => {
        const idMembre = parseInt(idMembreStr, 10);
        return apiClient.deleteMembre(idMembre, currentUserId)
          .then(() => {
            dispatch(deleteMembre(idMembre));
            return { success: true, id: idMembre };
          })
          .catch((error) => {
            console.error(`Erreur suppression membre ${idMembre}:`, error);
            return { success: false, id: idMembre, error };
          });
      });

      const results = await Promise.all(deletePromises);
      const successes = results.filter(r => r.success).length;
      const failures = results.length - successes;

      onSelectAllRows(false, []);

      if (failures === 0) {
        showNotification(
          `${successes} membre(s) supprimé(s) avec succès`,
          'success'
        );
      } else {
        showNotification(
          `${successes} supprimé(s), ${failures} erreur(s)`,
          failures === selected.length ? 'error' : 'warning'
        );
      }

    } catch (error: any) {
      console.error('Erreur générale lors de la suppression multiple:', error);
      showNotification(
        `Erreur: ${error.message || 'Erreur lors de la suppression'}`,
        'error'
      );
    } finally {
      setDeleteLoading(false);
    }
  }, [currentUserId, selected, onSelectAllRows, dispatch, showNotification]);


  useEffect(() => {
    // Réinitialiser le formulaire quand on passe d'un mode à l'autre
    if (!openDialog) {
      // Court délai pour éviter les conflits
      setTimeout(() => {
        setData({ ...membre });
        setPhotoPreview(null);
        setPhotoFile(null);
        setIsEditMode(false);
      }, 100);
    }
  }, [openDialog]);

  // Nettoyage des données quand on change de membre à éditer
  useEffect(() => {
    // Réinitialiser quand isEditMode change
    if (!isEditMode) {
      setData({ ...membre });
      setPhotoPreview(null);
      setPhotoFile(null);
    }
  }, [isEditMode]);

  const dialogTitle = isEditMode ? 'Modifier un membre' : 'Ajouter un membre';


  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>

        <Typography variant="h4" flexGrow={1}>
          Liste des membres
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center"> {/* Utiliser Stack pour gérer l'espacement */}
          <PrintEtatGlobal />

          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleOpenDialog}
            disabled={loading}
          >
            {loading ? 'Chargement...' : 'Ajouter membre'}
          </Button>
        </Stack>
      </Box>

      <Card>
        <UserTableToolbar
          numSelected={selected.length} // Utilisez 'selected' au lieu de 'table.selected'
          filterName={filterName}
          onFilterName={(event) => {
            setFilterName(event.target.value);
            table.onResetPage();
          }}
          onDelete={handleDeleteSelected}
          deleteLoading={deleteLoading}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={sortedData?.length}
                numSelected={table.selected?.length}
                onSort={table?.onSort}
                onSelectAllRows={(checked) =>
                  table?.onSelectAllRows(
                    checked,
                    sortedData?.map((x) => x.idMembre?.toString())
                  )
                }
                headLabel={[
                  { id: 'photoMembre', label: 'Photo' },
                  { id: 'nomMembre', label: 'Nom et prénoms' },
                  { id: 'residenceMembre', label: "Lieu d'habitation" },
                  { id: 'baptemeEauMembre', label: 'Baptisé(e)' },
                  { id: 'lieuBaptemeEauMembre', label: 'Lieu du baptême' },
                  { id: 'fonctionMembre', label: 'Fonction' },
                  { id: 'situationMatrimonialeMembre', label: 'Situation matrimoniale' },
                  { id: 'contactMembre', label: 'Contact' },
                  { id: 'Action', label: 'Actions' },
                ]}
              />
              <TableBody>
                {sortedData
                  ?.slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  ?.map((row) => (
                    <UserTableRow
                      key={row.idMembre}
                      row={row}
                      selected={table.selected?.includes(row.idMembre?.toString())}
                      onSelectRow={() => table?.onSelectRow(row.idMembre?.toString())}
                      onEdit={handleEditMembre}
                      onDelete={handleDeleteMembre}
                      isDeleting={deleteLoading}
                    />
                  ))}

                <TableEmptyRows height={68} emptyRows={emptyRows(table.page, table.rowsPerPage, sortedData.length)} />
                {notFound && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={table.page}
          count={sortedData.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      <Dialog
        maxWidth={maxWidth}
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="responsive-dialog-title"
      >

        {/* <DialogTitle>Ajouter un membre</DialogTitle> */}
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>

          <form onSubmit={formHandleSubmit(onFormSubmit)}>
            <Grid container spacing={2}>


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
                      {!photoPreview && <PersonIcon sx={{ fontSize: 60 }} />}
                    </Avatar>

                    {/* Bouton pour ajouter une photo */}
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
                      <PhotoCameraIcon />
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
                        <CloseIcon />
                      </IconButton>
                    )}
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    Cliquez sur l&apos;icône appareil photo pour ajouter une photo
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  label="Nom *"
                  variant="outlined"
                  value={data.nomMembre}
                  {...register('nomMembre', { required: 'Le nom est requis' })}
                  onChange={handleChange}
                  error={!!errors.nomMembre}
                  helperText={errors.nomMembre?.message}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setFocus('prenomMembre');
                    }
                  }}
                />
              </Grid>


              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  type="text"
                  label="Prénoms"
                  variant="outlined"
                  value={data.prenomMembre}
                  {...register('prenomMembre')}
                  onChange={handleChange}
                  error={!!errors.prenomMembre}
                  helperText={errors.prenomMembre?.message}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setFocus('lieuNaissMembre');
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  type="text"
                  label="Lieu d'habitation"
                  variant="outlined"
                  value={data.residenceMembre}
                  {...register('residenceMembre')}
                  onChange={handleChange}
                  error={!!errors.residenceMembre}
                  helperText={errors.residenceMembre?.message}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setFocus('dateNaissMembre');
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  type="text"
                  label="Lieu Naissance"
                  variant="outlined"
                  value={data.lieuNaissMembre}
                  {...register('lieuNaissMembre')}
                  onChange={handleChange}
                  error={!!errors.lieuNaissMembre}
                  helperText={errors.lieuNaissMembre?.message}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setFocus('residenceMembre');
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  type="date"
                  variant="outlined"
                  helperText="Date de naissance"
                  value={data.dateNaissMembre}
                  {...register('dateNaissMembre')}
                  onChange={handleChange}
                  error={!!errors.dateNaissMembre}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setFocus('civiliteMembre');
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  type="text"
                  label="Civilité"
                  select
                  variant="outlined"
                  value={data.civiliteMembre}
                  {...register('civiliteMembre')}
                  onChange={handleChange}
                  error={!!errors.civiliteMembre}
                  helperText={errors.civiliteMembre?.message}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setFocus('nationaliteMembre');
                    }
                  }}
                >
                  {dataCivilite?.map((option: IDataChoice) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  type="texte"
                  label="Nationalite"
                  variant="outlined"
                  value={data.nationaliteMembre}
                  {...register('nationaliteMembre')}
                  onChange={handleChange}
                  error={!!errors.nationaliteMembre}
                  helperText={errors.nationaliteMembre?.message}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setFocus('idNiveauEtude');
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  type="text"
                  select
                  label="Niveau d'étude"
                  variant="outlined"
                  value={data.idNiveauEtude || ''}
                  {...register('idNiveauEtude')}
                  onChange={handleChange}
                  error={!!errors.idNiveauEtude}
                  helperText={errors.idNiveauEtude?.message}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      setFocus('sexeMembre');
                    }
                  }}
                >
                  {dataNiveauEtude?.map((option: IDataChoice) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  type="text"
                  select
                  label="Genre"
                  variant="outlined"
                  value={data.sexeMembre}
                  {...register('sexeMembre')}
                  onChange={handleChange}
                  error={!!errors.sexeMembre}
                  helperText={errors.sexeMembre?.message}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      setFocus('ethnieMembre');
                    }
                  }}
                >
                  {dataGenre?.map((option: IDataChoice) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>


              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  type="texte"
                  label="Ethnie"
                  variant="outlined"
                  value={data.ethnieMembre}
                  {...register('ethnieMembre')}
                  onChange={handleChange}
                  error={!!errors.ethnieMembre}
                  helperText={errors.ethnieMembre?.message}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      setFocus('situationMatrimonialeMembre');
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  select
                  type="texte"
                  label="Situation matrimoniale"
                  variant="outlined"
                  value={data.situationMatrimonialeMembre}
                  {...register('situationMatrimonialeMembre')}
                  onChange={handleChange}
                  error={!!errors.situationMatrimonialeMembre}
                  helperText={errors.situationMatrimonialeMembre?.message}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      setFocus('nomFiance');
                    }
                  }}
                >
                  {dataSituationMembre?.map((option: IDataChoice) => (
                    // recuperer le service dans le store
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {data?.situationMatrimonialeMembre === "3" && (
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <TextField
                    fullWidth
                    size="small"
                    margin="dense"
                    type="text"
                    label="Nom fiancé(e)"
                    variant="outlined"
                    value={data.nomFiance}
                    {...register('nomFiance')}
                    onChange={handleChange}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        setFocus('dateMariageMembre');
                      }
                    }}
                  />
                </Grid>
              )}

              {data.situationMatrimonialeMembre === "5" && (
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <TextField
                    fullWidth
                    size="small"
                    margin="dense"
                    type="date"
                    variant="outlined"
                    {...register('dateMariageMembre')}
                    onChange={handleChange}
                    value={data.dateMariageMembre}
                    error={!!errors.dateMariageMembre}
                    helperText={errors.dateMariageMembre?.message as React.ReactNode}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        setFocus('fonctionMembre');
                      }
                    }}
                  />
                </Grid>
              )}


              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  type="texte"
                  label="Fonction"
                  variant="outlined"
                  value={data.fonctionMembre}
                  {...register('fonctionMembre')}
                  onChange={handleChange}
                  error={!!errors.fonctionMembre}
                  helperText={errors.fonctionMembre?.message as React.ReactNode}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      setFocus('lieuTravailMembre');
                    }
                  }}
                />
              </Grid>


              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  type="texte"
                  label="Lieu de travail"
                  variant="outlined"
                  value={data.lieuTravailMembre}
                  {...register('lieuTravailMembre')}
                  onChange={handleChange}
                  error={!!errors.lieuTravailMembre}
                  helperText={errors.lieuTravailMembre?.message as React.ReactNode}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      setFocus('nouvelleAmeMembre');
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  select
                  type="texte"
                  label="Nouvelle âme"
                  variant="outlined"
                  value={data.nouvelleAmeMembre}
                  {...register('nouvelleAmeMembre')}
                  onChange={handleChange}
                  error={!!errors.nouvelleAmeMembre}
                  helperText={errors.nouvelleAmeMembre?.message}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      setFocus('nomAmiEglise');
                    }
                  }}
                >
                  {dataNouvelAme?.map((option: IDataChoice) => (
                    // recuperer le service dans le store
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>


              {data.nouvelleAmeMembre === 1 && (

                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <TextField
                    fullWidth
                    size="small"
                    margin="dense"
                    type="texte"
                    label="Connaissance église"
                    variant="outlined"
                    value={data.nomAmiEglise}
                    {...register('nomAmiEglise')}
                    onChange={handleChange}
                    error={!!errors.nomAmiEglise}
                    helperText={errors.nomAmiEglise?.message}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        setFocus('visiteMembre');
                      }
                    }}
                  />
                </Grid>
              )}


              {data?.nouvelleAmeMembre === 1 && (
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <TextField
                    fullWidth
                    size="small"
                    margin="dense"
                    select
                    type="texte"
                    helperText="Visite membre"
                    variant="outlined"
                    value={data?.visiteMembre}
                    {...register('visiteMembre')}
                    onChange={handleChange}
                    error={!!errors.visiteMembre}
                    // helperText={errors.visiteMembre?.message}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        setFocus('raisonNonVisiteMembre');
                      }
                    }}>
                    {visiteMembres?.map((option: IDataChoice) => (
                      // recuperer le service dans le store
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}


              {data?.visiteMembre === 2 && (

                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <TextField
                    fullWidth
                    size="small"
                    margin="dense"
                    type="text"
                    helperText="Raison de la non visite"
                    variant="outlined"
                    value={data.raisonNonVisiteMembre}
                    {...register('raisonNonVisiteMembre')}
                    onChange={handleChange}
                    error={!!errors.raisonNonVisiteMembre}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        setFocus('heureVisiteMembre');
                      }
                    }}
                  />
                </Grid>

              )}

              {data.nouvelleAmeMembre === 1 && (

                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <TextField
                    fullWidth
                    size="small"
                    margin="dense"
                    type="time"
                    helperText="Raison de la non visite"
                    variant="outlined"
                    value={data.heureVisiteMembre}
                    {...register('heureVisiteMembre')}
                    onChange={handleChange}
                    error={!!errors.raisonNonVisiteMembre}
                    // helperText={errors.raisonNonVisiteMembre?.message}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        setFocus('dateDecisionMembre');
                      }
                    }}
                  />
                </Grid>
              )}

              {data.nouvelleAmeMembre === "1" && (

                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <TextField
                    fullWidth
                    size="small"
                    margin="dense"
                    type="date"
                    variant="outlined"
                    helperText="Date de décision"
                    value={data.dateDecisionMembre}
                    {...register('dateDecisionMembre')}
                    onChange={handleChange}
                    error={!!errors.dateDecisionMembre}
                    // helperText={errors.dateDecisionMembre?.message}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        setFocus('egliseOrigineMembre');
                      }
                    }}
                  />
                </Grid>
              )}

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  type="text"
                  label="Eglise d'origine"
                  variant="outlined"
                  value={data.egliseOrigineMembre}
                  {...register('egliseOrigineMembre')}
                  onChange={handleChange}
                  error={!!errors.egliseOrigineMembre}
                  helperText={errors.egliseOrigineMembre?.message}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      setFocus('dateConversionMembre');
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  type="date"
                  helperText="Date de conversion"
                  variant="outlined"
                  value={data.dateConversionMembre}
                  {...register('dateConversionMembre')}
                  onChange={handleChange}
                  error={!!errors.dateConversionMembre}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      setFocus('dateBaptemeMembre');
                    }
                  }}
                />
              </Grid>


              <Grid item xs={12} sm={6} md={4} lg={3}>

                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  select
                  type="text"
                  label="Baptême d'eau"
                  variant="outlined"
                  value={data.baptemeEauMembre}
                  {...register('baptemeEauMembre')}
                  onChange={handleChange}
                  error={!!errors.baptemeEauMembre}
                  helperText={errors.baptemeEauMembre?.message as React.ReactNode}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      setFocus('dateBaptemeMembre');
                    }
                  }}
                >
                  {dataBapteme?.map((option: IDataChoice) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              {data.baptemeEauMembre === 1 && (

                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <TextField
                    fullWidth
                    size="small"
                    margin="dense"
                    type="date"
                    variant="outlined"
                    helperText="Date de baptême"
                    value={data.dateBaptemeMembre}
                    {...register('dateBaptemeMembre')}
                    onChange={handleChange}
                    error={!!errors.dateBaptemeMembre}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        setFocus('lieuBaptemeEauMembre');
                      }
                    }}
                  />
                </Grid>
              )}

              {data.baptemeEauMembre === 1 && (

                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <TextField
                    fullWidth
                    size="small"
                    margin="dense"
                    type="text"
                    variant="outlined"
                    label="Lieu du baptème d'eau"
                    value={data.lieuBaptemeEauMembre}
                    {...register('lieuBaptemeEauMembre')}
                    onChange={handleChange}
                    error={!!errors.lieuBaptemeEauMembre}
                    helperText={errors.lieuBaptemeEauMembre?.message as React.ReactNode}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        setFocus('baptemeSaintEspritMembre');
                      }
                    }}
                  />
                </Grid>
              )}


              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  select
                  type="text"
                  label="Baptême du Saint-Esprit"
                  variant="outlined"
                  value={data.baptemeSaintEspritMembre || ''}
                  {...register('baptemeSaintEspritMembre')}
                  onChange={handleChange}
                  error={!!errors.baptemeSaintEspritMembre}
                  helperText={errors.baptemeSaintEspritMembre?.message as React.ReactNode}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      setFocus('dateBaptemeSaintEspritMembre');
                    }
                  }}
                >
                  {dataBapteme?.map((option: IDataChoice) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>



              {data.baptemeSaintEspritMembre === 1 && (

                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <TextField
                    fullWidth
                    size="small"
                    margin="dense"
                    type="date"
                    variant="outlined"
                    label="Date de baptème du Saint-Esprit"
                    value={data.dateBaptemeSaintEspritMembre}
                    {...register('dateBaptemeSaintEspritMembre')}
                    onChange={handleChange}
                    error={!!errors.dateBaptemeSaintEspritMembre}
                    helperText={errors.dateBaptemeSaintEspritMembre?.message}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        setFocus('capaciteSpirituelleMembre');
                      }
                    }}
                  />
                </Grid>
              )}

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  select
                  type="text"
                  label="Capacité spirituelle"
                  variant="outlined"
                  value={data.capaciteSpirituelleMembre}
                  {...register('capaciteSpirituelleMembre')}
                  onChange={handleChange}
                  error={!!errors.capaciteSpirituelleMembre}
                  helperText={errors.capaciteSpirituelleMembre?.message}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      setFocus('idResponsabilite');
                    }
                  }}
                >
                  {dataCapaciteSpirituelle?.map((option: IDataChoice) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {data.baptemeEauMembre === 1 && (

                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <TextField
                    fullWidth
                    size="small"
                    margin="dense"
                    select
                    type="text"
                    label="Responsabilité dans l'église"
                    variant="outlined"
                    value={data.idResponsabilite || ''}
                    {...register('idResponsabilite')}
                    onChange={handleChange}
                    error={!!errors.idResponsabilite}
                    helperText={errors.idResponsabilite?.message}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        setFocus('idDepartement');
                      }
                    }}
                  >
                    {dataResponsabilite?.map((option: IDataChoice) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

              )}

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  select
                  type="text"
                  label="Département/Comité"
                  variant="outlined"
                  value={data.idDepartement || ''}
                  {...register('idDepartement')}
                  onChange={handleChange}
                  error={!!errors.idDepartement}
                  helperText={errors.idDepartement?.message}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      setFocus('idCellule');
                    }
                  }}
                >
                  {dataDepartement?.map((option: IDataChoice) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  select
                  type="text"
                  label="Cellule"
                  variant="outlined"
                  value={data.idCellule || ''}
                  {...register('idCellule')}
                  onChange={handleChange}
                  error={!!errors.idCellule}
                  helperText={errors.idCellule?.message}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      setFocus('idGroupe');
                    }
                  }}
                >
                  {dataCellule?.map((option: IDataChoice) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  select
                  type="text"
                  label="Groupe ethnie"
                  variant="outlined"
                  value={data.idGroupe || ''}
                  {...register('idGroupe')}
                  onChange={handleChange}
                  error={!!errors.idGroupe}
                  helperText={errors.idGroupe?.message}
                >
                  {/* Option vide */}
                  <MenuItem value="">
                    <em>Aucun</em>
                  </MenuItem>
                  {dataGroupe?.map((option: IDataChoice) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  type="text"
                  variant="outlined"
                  label="Email"
                  value={data.emailMembre}
                  {...register('emailMembre')}
                  onChange={handleChange}
                  error={!!errors.emailMembre}
                  helperText={errors.emailMembre?.message}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      setFocus('contactMembre');
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  type="number"
                  variant="outlined"
                  label="Téléphone *"
                  value={data.contactMembre}
                  {...register('contactMembre', { required: 'Le téléphone est requis' })}
                  onChange={handleChange}
                  error={!!errors.contactMembre}
                  helperText={errors.contactMembre?.message}

                />
              </Grid>
            </Grid>
            <Divider />
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">Annuler</Button>

              <Button type="submit" color="primary" disabled={loading || updateLoading}>
                {(loading || updateLoading) ? 'Enregistrement...' : (isEditMode ? 'Modifier' : 'Enregistrer')}
              </Button>

            </DialogActions>
          </form>

        </DialogContent>
      </Dialog>
      <NotificationComponent />
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback(
    (inputValue: string) => {
      const newSelected = selected?.includes(inputValue)
        ? selected?.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}
