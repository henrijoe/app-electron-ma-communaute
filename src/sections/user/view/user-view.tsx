import * as XLSX from 'xlsx';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
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
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Grid, Dialog, Divider, MenuItem, TextField, DialogTitle, DialogActions,
  Avatar, IconButton, Stack, DialogContent

} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';

import { ApiError, apiClient, buildPhotoUrl } from 'src/utils/apiClient';
import { subscribeToCommunauteEvent } from 'src/utils/socket-client';
import ConfirmDialog from 'src/components/alert/confirmDialog';
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
import { membre, dataGenre, setDataModifiesMembre, deleteMembre, IMembre, IDataChoice, dataBapteme, dataNouvelAme, ensureMembreArrays, setFilterMembre, setListFilterMembre, setListMembre, setTitreDocument, visiteMembres, dataNiveauEtude, dataResponsabilite, dataSituationMembre , dataCapaciteSpirituelle, dataCivilite } from '../../../store/membreSlice';
import { setListDepartement } from '../../../store/departementSlice';
import { setListCellule } from '../../../store/celluleSlice';
import { setListGroupe } from '../../../store/groupeSlice';
import PrintEtatGlobal from '../etats/printEtats';



const resolveChoiceLabel = (choices: IDataChoice[], value: unknown): string => {
  const rawValue = String(value ?? '').trim();
  if (!rawValue) return '';

  const match = choices.find((choice) => String(choice.value) === rawValue);
  return match?.label || rawValue;
};

const resolveReferenceLabel = (
  items: Array<{ value: number | string; label: string }>,
  value: unknown
): string => {
  const rawValue = String(value ?? '').trim();
  if (!rawValue) return '';

  const match = items.find((item) => String(item.value) === rawValue);
  return match?.label || rawValue;
};


export function UserView() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { listMembre, filterMembre, titreDocument, listResponsabilite } = useSelector((state: any) => state.membre);
  const listDepartement = useSelector((state: any) => state.departement.listDepartement);
  const listCellule = useSelector((state: any) => state.cellule.listCellule);
  const listGroupe = useSelector((state: any) => state.groupe.listGroupe);
  const appUserConnected = useSelector((state: any) => state.application?.userConnected);
  const authUtilisateurData = useSelector((state: any) => state.authentification?.utilisateurData);
  const currentUserId =
    Number(appUserConnected?.idUtilisateur)
    || Number(authUtilisateurData?.idUtilisateur)
    || null;
  const departementOptions = useMemo(() => (
    Array.isArray(listDepartement) && listDepartement.length > 0
      ? listDepartement.map((item: any) => ({ value: item.idDepartement, label: item.libelleLongDepartement }))
      : []
  ), [listDepartement]);
  const celluleOptions = useMemo(() => (
    Array.isArray(listCellule) && listCellule.length > 0
      ? listCellule.map((item: any) => ({ value: item.idCellule, label: item.nomCellule }))
      : []
  ), [listCellule]);
  const groupeOptions = useMemo(() => (
    Array.isArray(listGroupe) && listGroupe.length > 0
      ? listGroupe.map((item: any) => ({ value: item.idGroupe, label: item.libelleGroupe }))
      : []
  ), [listGroupe]);
  const responsabiliteOptions = useMemo(() => (
    Array.isArray(listResponsabilite) && listResponsabilite.length > 0
      ? listResponsabilite.map((item: any) => ({ value: item.idResponsabilite, label: item.libelleResponsabilite }))
      : dataResponsabilite
  ), [listResponsabilite]);
  const exportableMembres = useMemo(() => (Array.isArray(listMembre) ? listMembre : []), [listMembre]);

  const [loading, setLoading] = useState(true);
  const table = useTable();


  const { selected, onSelectAllRows } = table;

  const [filterName, setFilterName] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [data, setData] = useState({ ...membre });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isEditMode, setIsEditMode] = useState(false); // Ajoutez ce state
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDeleteSelectedOpen, setConfirmDeleteSelectedOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const {
    showNotification,
    hideNotification,
    NotificationComponent
  } = useNotificationSnackbar();

  const { setFocus, register, handleSubmit: formHandleSubmit, formState: { errors } } = useForm<IMembre>();

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setIsEditMode(false);
    setData({ ...membre });
    setPhotoPreview(null);
    setPhotoFile(null);
  }, []);


  const handleOpenDialog = useCallback(() => setOpenDialog(true), []);

  const fetchMembres = useCallback(async () => {
    try {
      setLoading(true);
      dispatch(ensureMembreArrays());
      const response = await apiClient.getMembres();
      if (response.status === 1) {
        const membres = Array.isArray(response.data) ? response.data : [];
        dispatch(setListMembre(membres));
        dispatch(setListFilterMembre(membres));
        dispatch(setFilterMembre([]));
        dispatch(setTitreDocument(''));
      }
    } catch (error) {
      console.error('Error fetching membres:', error);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);


  useEffect(() => {
    if (!currentUserId) {
      return undefined;
    }

    const shouldRefreshForUser = (payload: any) => {
      if (!payload?.idUtilisateur) {
        return true;
      }

      return Number(payload.idUtilisateur) === Number(currentUserId);
    };

    const refreshMembres = (payload: any) => {
      if (shouldRefreshForUser(payload)) {
        fetchMembres();
      }
    };

    const handleAjoutDeces = (payload: any) => {
      if (!shouldRefreshForUser(payload)) {
        return;
      }

      fetchMembres();
      const memberName = String(payload?.nomMembreDeces || '').trim();
      showNotification(
        memberName
          ? `Le membre ${memberName} a ete retire des listes actives.`
          : 'Un membre a ete retire des listes actives.',
        'info'
      );
    };

    const handleModificationDeces = (payload: any) => {
      if (!shouldRefreshForUser(payload)) {
        return;
      }

      fetchMembres();
      const memberName = String(payload?.nomMembreDeces || '').trim();
      showNotification(
        memberName
          ? `Le deces de ${memberName} a ete mis a jour et les listes actives ont ete synchronisees.`
          : "Les listes actives ont ete synchronisees apres mise a jour d'un deces.",
        'info'
      );
    };

    const handleSuppressionDeces = (payload: any) => {
      if (!shouldRefreshForUser(payload)) {
        return;
      }

      fetchMembres();
      const memberName = String(payload?.nomMembreDeces || '').trim();
      showNotification(
        memberName
          ? `${memberName} est de nouveau visible dans les listes actives.`
          : 'Le membre concerne est de nouveau visible dans les listes actives.',
        'success'
      );
    };

    const unsubscribers = [
      subscribeToCommunauteEvent('ajouterMembre', refreshMembres),
      subscribeToCommunauteEvent('modifierMembre', refreshMembres),
      subscribeToCommunauteEvent('supprimerMembre', refreshMembres),
      subscribeToCommunauteEvent('ajouterDeces', handleAjoutDeces),
      subscribeToCommunauteEvent('modifierDeces', handleModificationDeces),
      subscribeToCommunauteEvent('supprimerDeces', handleSuppressionDeces),
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [currentUserId, fetchMembres, showNotification]);
  const loadReferenceData = useCallback(async () => {
    if (!currentUserId) return;

    try {
      const [departementsResponse, cellulesResponse, groupesResponse] = await Promise.all([
        apiClient.getDepartementsByUtilisateur(currentUserId),
        apiClient.getCellulesByUtilisateur(currentUserId),
        apiClient.getGroupesByUtilisateur(currentUserId),
      ]);

      if (departementsResponse.status === 1) {
        dispatch(setListDepartement(Array.isArray(departementsResponse.data) ? departementsResponse.data : []));
      }
      if (cellulesResponse.status === 1) {
        dispatch(setListCellule(Array.isArray(cellulesResponse.data) ? cellulesResponse.data : []));
      }
      if (groupesResponse.status === 1) {
        dispatch(setListGroupe(Array.isArray(groupesResponse.data) ? groupesResponse.data : []));
      }
    } catch (error) {
      console.error('Error fetching reference data for membres:', error);
    }
  }, [currentUserId, dispatch]);

  const convertFileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file); // Ceci produit le format data:image/...;base64,...
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });


  const handlePhotoChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification('La photo ne doit pas depasser 5MB', 'warning'); // Remplacer alert
        return;
      }

      if (!file.type.startsWith('image/')) {
        showNotification('Veuillez selectionner une image valide', 'warning'); // Remplacer alert
        return;
      }

      setPhotoFile(file);

      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);

      try {
        const base64 = await convertFileToBase64(file);
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
  }, [showNotification]);

  const handleRemovePhoto = useCallback(() => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setData((prev: any) => ({ ...prev, photoMembre: '' }));
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
  }, [photoPreview]);


  useEffect(() =>
    () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    },
    [photoPreview]);

  useEffect(() => {
    loadReferenceData();
  }, [loadReferenceData]);

  useEffect(() => {
    if (!openDialog) {
      setData({ ...membre });
      setPhotoPreview(null);
      setPhotoFile(null);
      setIsEditMode(false);
    }
  }, [openDialog]);

  const handleDeleteMembre = useCallback(async (idMembre: number) => {
  const membreToDelete = Array.isArray(listMembre)
    ? listMembre.find((item: IMembre) => item.idMembre === idMembre)
    : null;
  const requestUserId = membreToDelete?.idUtilisateur || currentUserId;

  if (!requestUserId) {
    showNotification('Session expiree: reconnectez-vous', 'warning');
    return;
  }

  try {
    setDeleteLoading(true);
    const response = await apiClient.deleteMembre(idMembre, requestUserId);
    if (response.status === 1) {
      dispatch(deleteMembre(idMembre));
      showNotification('Membre supprime avec succes', 'success');
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
}, [currentUserId, dispatch, listMembre, showNotification]);

  const handleEditMembre = useCallback((membreData: IMembre) => {
    setIsEditMode(true);

    const formData: any = { ...membreData };

    const normalizeValue = (value: any): string => {
      if (value === null || value === undefined || value === '') {
        return '';
      }
      return String(value);
    };

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

    const optionalNumberFields = [
      'idNiveauEtude', 'idCellule', 'idDepartement', 'idGroupe', 'idResponsabilite'
    ];

    optionalNumberFields.forEach(field => {
      formData[field] = formData[field] === null || formData[field] === undefined ? '' : String(formData[field]);
    });

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

    console.log("Donnees pour edition apres nettoyage:", formData);

    setData(formData);

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

  const handleCreateOrUpdateMembre = useCallback(async (membreData: IMembre) => {
    if (!currentUserId) {
      showNotification('Session expiree: reconnectez-vous', 'warning');
      return;
    }

    try {
      setUpdateLoading(true);

      if (isEditMode && data.idMembre) {
        const currentMembre = Array.isArray(listMembre)
          ? listMembre.find((item: IMembre) => item.idMembre === data.idMembre)
          : null;

        const cleanedData: any = {
          ...currentMembre,
          ...membreData,
          idMembre: data.idMembre,
          idUtilisateur: currentUserId || currentMembre?.idUtilisateur || null,
          idNiveauEtude: membreData.idNiveauEtude ? Number(membreData.idNiveauEtude) : currentMembre?.idNiveauEtude ?? null,
          idCellule: membreData.idCellule ? Number(membreData.idCellule) : currentMembre?.idCellule ?? null,
          idDepartement: membreData.idDepartement ? Number(membreData.idDepartement) : currentMembre?.idDepartement ?? null,
          idGroupe: membreData.idGroupe ? Number(membreData.idGroupe) : currentMembre?.idGroupe ?? null,
          idResponsabilite: membreData.idResponsabilite ? Number(membreData.idResponsabilite) : currentMembre?.idResponsabilite ?? null,
          sexeMembre: membreData.sexeMembre !== '' ? Number(membreData.sexeMembre) : Number(currentMembre?.sexeMembre) || 0,
          nouvelleAmeMembre: membreData.nouvelleAmeMembre !== '' ? Number(membreData.nouvelleAmeMembre) : Number(currentMembre?.nouvelleAmeMembre) || 0,
          baptemeEauMembre: membreData.baptemeEauMembre !== '' ? Number(membreData.baptemeEauMembre) : Number(currentMembre?.baptemeEauMembre) || 0,
          baptemeSaintEspritMembre: membreData.baptemeSaintEspritMembre !== '' ? Number(membreData.baptemeSaintEspritMembre) : Number(currentMembre?.baptemeSaintEspritMembre) || 0,
          situationMatrimonialeMembre: membreData.situationMatrimonialeMembre !== '' ? Number(membreData.situationMatrimonialeMembre) : Number(currentMembre?.situationMatrimonialeMembre) || 0,
          visiteMembre: membreData.visiteMembre !== '' ? Number(membreData.visiteMembre) : Number(currentMembre?.visiteMembre) || 0,
          capaciteSpirituelleMembre: membreData.capaciteSpirituelleMembre !== '' ? Number(membreData.capaciteSpirituelleMembre) : Number(currentMembre?.capaciteSpirituelleMembre) || 0,
          photoMembre: data.photoMembre || membreData.photoMembre || currentMembre?.photoMembre || '',
        };

        console.log('Donnees preparees :', cleanedData);

        const response = await apiClient.updateMembre(cleanedData);

        if (response.status === 1) {
          dispatch(setDataModifiesMembre({ ...membreData, idMembre: data.idMembre }));
          await fetchMembres();
          handleCloseDialog();
          showNotification('Membre modifie avec succes', 'success');
        } else {
          showNotification('Erreur lors de la modification du membre', 'error');
        }

        return;
      }

      const cleanedData = {
        ...membreData,
        residenceMembre: membreData.residenceMembre || '',
        civiliteMembre: membreData.civiliteMembre || '',
        nomFiance: membreData.nomFiance || '',
        lieuBaptemeEauMembre: membreData.lieuBaptemeEauMembre || '',
        dateBaptemeMembre: membreData.dateBaptemeMembre || null,
        dateMariageMembre: membreData.dateMariageMembre || null,
        dateBaptemeSaintEspritMembre: membreData.dateBaptemeSaintEspritMembre || null,
        dateDecisionMembre: membreData.dateDecisionMembre || null,
        dateConversionMembre: membreData.dateConversionMembre || null,
        nouvelleAmeMembre: Number(membreData.nouvelleAmeMembre) || 0,
        baptemeEauMembre: Number(membreData.baptemeEauMembre) || 0,
        baptemeSaintEspritMembre: Number(membreData.baptemeSaintEspritMembre) || 0,
        visiteMembre: Number(membreData.visiteMembre) || 0,
        idNiveauEtude: membreData.idNiveauEtude ? Number(membreData.idNiveauEtude) : null,
        idCellule: membreData.idCellule ? Number(membreData.idCellule) : null,
        idDepartement: membreData.idDepartement ? Number(membreData.idDepartement) : null,
        idGroupe: membreData.idGroupe ? Number(membreData.idGroupe) : null,
        idResponsabilite: membreData.idResponsabilite ? Number(membreData.idResponsabilite) : null,
        sexeMembre: Number(membreData.sexeMembre) || 0,
        situationMatrimonialeMembre: Number(membreData.situationMatrimonialeMembre) || 0,
        capaciteSpirituelleMembre: Number(membreData.capaciteSpirituelleMembre) || 0,
        photoMembre: data.photoMembre || membreData.photoMembre || '',
        contactMembre: membreData.contactMembre || '',
        emailMembre: membreData.emailMembre || '',
        nomMembre: membreData.nomMembre || '',
        prenomMembre: membreData.prenomMembre || '',
        idUtilisateur: currentUserId,
      };

      console.log('Donnees preparees :', cleanedData);

      const response = await apiClient.createMembre(cleanedData);

      if (response.status === 1) {
        await fetchMembres();
        handleCloseDialog();
        showNotification('Membre cree avec succes', 'success');
      } else {
        showNotification('Erreur lors de la creation du membre', 'error');
      }
    } catch (error) {
      console.error('Erreur lors de lenregistrement du membre:', error);
      const errorMessage = error instanceof ApiError
        ? error.message
        : 'Erreur lors de lenregistrement du membre';
      showNotification(errorMessage, 'error');
    } finally {
      setUpdateLoading(false);
    }
  }, [
    currentUserId,
    data.idMembre,
    data.photoMembre,
    dispatch,
    fetchMembres,
    handleCloseDialog,
    isEditMode,
    listMembre,
    showNotification,
  ]);

  const handleExportMembres = useCallback(() => {
    if (!exportableMembres.length) {
      showNotification('Aucun membre a exporter', 'warning');
      return;
    }

    const rows = exportableMembres.map((item: IMembre) => ({
      nomMembre: item.nomMembre || '',
      prenomMembre: item.prenomMembre || '',
      contactMembre: item.contactMembre || '',
      emailMembre: item.emailMembre || '',
      sexeMembre: resolveChoiceLabel(dataGenre, item.sexeMembre),
      civiliteMembre: resolveChoiceLabel(dataCivilite, item.civiliteMembre),
      dateNaissMembre: item.dateNaissMembre || '',
      lieuNaissMembre: item.lieuNaissMembre || '',
      nationaliteMembre: item.nationaliteMembre || '',
      ethnieMembre: item.ethnieMembre || '',
      residenceMembre: item.residenceMembre || '',
      fonctionMembre: item.fonctionMembre || '',
      situationMatrimonialeMembre: resolveChoiceLabel(dataSituationMembre, item.situationMatrimonialeMembre),
      nomFiance: item.nomFiance || '',
      dateMariageMembre: item.dateMariageMembre || '',
      egliseOrigineMembre: item.egliseOrigineMembre || '',
      dateConversionMembre: item.dateConversionMembre || '',
      nouvelleAmeMembre: resolveChoiceLabel(dataNouvelAme, item.nouvelleAmeMembre),
      baptemeEauMembre: resolveChoiceLabel(dataBapteme, item.baptemeEauMembre),
      lieuBaptemeEauMembre: item.lieuBaptemeEauMembre || '',
      baptemeSaintEspritMembre: resolveChoiceLabel(dataBapteme, item.baptemeSaintEspritMembre),
      capaciteSpirituelleMembre: resolveChoiceLabel(dataCapaciteSpirituelle, item.capaciteSpirituelleMembre),
      departement: resolveReferenceLabel(departementOptions, item.idDepartement),
      cellule: resolveReferenceLabel(celluleOptions, item.idCellule),
      groupe: resolveReferenceLabel(groupeOptions, item.idGroupe),
      responsabilite: resolveReferenceLabel(responsabiliteOptions, item.idResponsabilite),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = Object.keys(rows[0]).map((key) => ({
      wch: Math.max(key.length + 2, 18),
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Membres');
    XLSX.writeFile(workbook, 'export-membres.xlsx');
    showNotification(`${rows.length} membre(s) exporte(s)`, 'success');
  }, [
    celluleOptions,
    departementOptions,
    exportableMembres,
    groupeOptions,
    responsabiliteOptions,
    showNotification,
  ]);

  const onFormSubmit = useCallback((formData: IMembre) => {
    if (!formData.nomMembre.trim()) {
      showNotification('Le nom est requis', 'warning'); // Remplacer alert
      return;
    }

    if (!formData.contactMembre.trim()) {
      showNotification('Le contact est requis', 'warning'); // Remplacer alert
      return;
    }

    console.log(isEditMode ? 'Membre a modifier :' : 'Membre a creer :', formData);

    const membreData: IMembre = {
      ...formData,
      photoMembre: data.photoMembre || formData.photoMembre || '',

      ...(isEditMode && data.idMembre && { idMembre: data.idMembre }),
    };

    console.log('Donnees preparees :', membreData);
    handleCreateOrUpdateMembre(membreData);
  }, [isEditMode, data.photoMembre, data.idMembre, handleCreateOrUpdateMembre, showNotification]); // Ajouter showNotification

  useEffect(() => {
    fetchMembres();
  }, [fetchMembres]);

  const dataFiltered: IMembre[] = useMemo(() => {
    const hasStructuredFilter = Boolean(String(titreDocument || '').trim());
    const dataToFilter = hasStructuredFilter
      ? (Array.isArray(filterMembre) ? filterMembre : [])
      : (Array.isArray(listMembre) ? listMembre : []);

    return applyFilter({
      inputData: dataToFilter,
      comparator: getComparator(table?.order, table?.orderBy),
      filterName,
    });
  }, [filterMembre, filterName, listMembre, table.order, table.orderBy, titreDocument]);

  const notFound = !dataFiltered?.length && (!!filterName || Boolean(String(titreDocument || '').trim()));

  const sortedData = useMemo(() => dataFiltered.sort((a, b) => {
    const nameA = a.nomMembre?.toLowerCase();
    const nameB = b.nomMembre?.toLowerCase();
    return table.order === 'asc'
      ? nameA?.localeCompare(nameB)
      : nameB?.localeCompare(nameA);
  }), [dataFiltered, table.order]);

  const handleChange = useCallback((event: any) => {
    const { name, value } = event.target;
    let sanitizedValue = value;

    if (name === 'contactMembre' && !/^\d*\.?\d*$/.test(value)) {
      sanitizedValue = '';
    }

    setData((prevData: any) => ({ ...prevData, [name]: sanitizedValue }));

  }, []);

  const handleDeleteSelected = useCallback(async () => {
    if (selected.length === 0) return;

    try {
      setDeleteLoading(true);

      const summary = await selected.reduce(
        (promise, idMembreStr) => promise.then(async ({ successes, failures }) => {
          const idMembre = parseInt(idMembreStr, 10);
          const membreToDelete = Array.isArray(listMembre)
            ? listMembre.find((item: IMembre) => item.idMembre === idMembre)
            : null;
          const requestUserId = membreToDelete?.idUtilisateur || currentUserId;

          if (!requestUserId) {
            return { failures: failures + 1, successes };
          }

          try {
            const response = await apiClient.deleteMembre(idMembre, requestUserId);

            if (response.status === 1) {
              dispatch(deleteMembre(idMembre));
              return { failures, successes: successes + 1 };
            }

            console.error(`Erreur lors de la suppression du membre ${idMembre}:`, response.error);
            return { failures: failures + 1, successes };
          } catch (error) {
            console.error(`Erreur suppression membre ${idMembre}:`, error);
            return { failures: failures + 1, successes };
          }
        }),
        Promise.resolve({ failures: 0, successes: 0 })
      );

      onSelectAllRows(false, []);

      if (summary.successes > 0) {
        await fetchMembres();
      }

      if (summary.failures === 0) {
        showNotification(`${summary.successes} membre(s) supprimes avec succes`, 'success');
      } else {
        showNotification(
          `${summary.successes} supprimes, ${summary.failures} erreur(s)`,
          summary.failures === selected.length ? 'error' : 'warning'
        );
      }
    } catch (error: any) {
      console.error('Erreur generale lors de la suppression multiple:', error);
      showNotification(`Erreur: ${error.message || 'Erreur lors de la suppression'}`, 'error');
    } finally {
      setDeleteLoading(false);
    }
  }, [currentUserId, selected, onSelectAllRows, dispatch, listMembre, showNotification, fetchMembres]);


  useEffect(() => {
    if (!openDialog) {
      setTimeout(() => {
        setData({ ...membre });
        setPhotoPreview(null);
        setPhotoFile(null);
        setIsEditMode(false);
      }, 100);
    }
  }, [openDialog]);

  useEffect(() => {
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

        <Stack direction="row" spacing={2} alignItems="center">
          <PrintEtatGlobal />

          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon="solar:import-linear" />}
            onClick={() => navigate('/user/import')}
            disabled={loading}
          >
            Importer membre
          </Button>

          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon="solar:export-linear" />}
            onClick={handleExportMembres}
            disabled={loading || !exportableMembres.length}
          >
            Exporter les membres
          </Button>

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
          onDelete={() => setConfirmDeleteSelectedOpen(true)}
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
                  { id: 'nomMembre', label: 'Nom et prenoms' },
                  { id: 'residenceMembre', label: "Lieu d'habitation" },
                  { id: 'baptemeEauMembre', label: 'Baptise(e)' },
                  { id: 'lieuBaptemeEauMembre', label: 'Lieu du bapteme' },
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
        open={openDialog}
        onClose={handleCloseDialog}
        fullScreen={isMobile}
        fullWidth
        maxWidth="lg"
        aria-labelledby="responsive-dialog-title"
        PaperProps={{
          sx: {
            m: { xs: 0, md: 2 },
            borderRadius: { xs: 0, md: 3 },
            maxHeight: { xs: '100%', md: 'calc(100vh - 32px)' },
          },
        }}
      >
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: 2, overflowX: 'hidden' }}>

          <form onSubmit={formHandleSubmit(onFormSubmit)}>
            <Grid container spacing={{ xs: 1.5, sm: 2 }}>


              <Grid item xs={12}>
                <Stack alignItems="center" spacing={2}>
                  <Box position="relative">
                    <Avatar
                      src={photoPreview || undefined}
                      sx={{
                        width: { xs: 92, sm: 120 },
                        height: { xs: 92, sm: 120 },
                        border: '2px solid #ccc',
                        backgroundColor: '#f5f5f5'
                      }}
                    >
                      {!photoPreview && <PersonIcon sx={{ fontSize: { xs: 44, sm: 60 } }} />}
                    </Avatar>
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
                    Cliquez sur l&apos;icone appareil photo pour ajouter une photo
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  type="text"
                  variant="outlined"
                  label="Nom *"
                  value={data.nomMembre}
                  {...register('nomMembre', { required: 'Le nom est requis' })}
                  onChange={handleChange}
                  error={!!errors.nomMembre}
                  helperText={errors.nomMembre?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  type="text"
                  variant="outlined"
                  label="Prenoms"
                  value={data.prenomMembre}
                  {...register('prenomMembre')}
                  onChange={handleChange}
                  error={!!errors.prenomMembre}
                  helperText={errors.prenomMembre?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  select
                  label="Civilite"
                  variant="outlined"
                  value={data.civiliteMembre || ''}
                  {...register('civiliteMembre')}
                  onChange={handleChange}
                  error={!!errors.civiliteMembre}
                  helperText={errors.civiliteMembre?.message}
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
                  select
                  label="Genre"
                  variant="outlined"
                  value={data.sexeMembre || ''}
                  {...register('sexeMembre')}
                  onChange={handleChange}
                  error={!!errors.sexeMembre}
                  helperText={errors.sexeMembre?.message}
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
                  type="date"
                  variant="outlined"
                  label="Date de naissance"
                  InputLabelProps={{ shrink: true }}
                  value={data.dateNaissMembre || ''}
                  {...register('dateNaissMembre')}
                  onChange={handleChange}
                  error={!!errors.dateNaissMembre}
                  helperText={errors.dateNaissMembre?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  type="text"
                  variant="outlined"
                  label="Lieu de naissance"
                  value={data.lieuNaissMembre}
                  {...register('lieuNaissMembre')}
                  onChange={handleChange}
                  error={!!errors.lieuNaissMembre}
                  helperText={errors.lieuNaissMembre?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  type="text"
                  variant="outlined"
                  label="Nationalite"
                  value={data.nationaliteMembre}
                  {...register('nationaliteMembre')}
                  onChange={handleChange}
                  error={!!errors.nationaliteMembre}
                  helperText={errors.nationaliteMembre?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  type="text"
                  variant="outlined"
                  label="Ethnie"
                  value={data.ethnieMembre}
                  {...register('ethnieMembre')}
                  onChange={handleChange}
                  error={!!errors.ethnieMembre}
                  helperText={errors.ethnieMembre?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  select
                  label="Niveau d'etude"
                  variant="outlined"
                  value={data.idNiveauEtude || ''}
                  {...register('idNiveauEtude')}
                  onChange={handleChange}
                  error={!!errors.idNiveauEtude}
                  helperText={errors.idNiveauEtude?.message}
                >
                  <MenuItem value="">
                    <em>Aucun</em>
                  </MenuItem>
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
                  variant="outlined"
                  label="Residence"
                  value={data.residenceMembre}
                  {...register('residenceMembre')}
                  onChange={handleChange}
                  error={!!errors.residenceMembre}
                  helperText={errors.residenceMembre?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  type="text"
                  variant="outlined"
                  label="Fonction"
                  value={data.fonctionMembre}
                  {...register('fonctionMembre')}
                  onChange={handleChange}
                  error={!!errors.fonctionMembre}
                  helperText={errors.fonctionMembre?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  type="text"
                  variant="outlined"
                  label="Lieu de travail"
                  value={data.lieuTravailMembre}
                  {...register('lieuTravailMembre')}
                  onChange={handleChange}
                  error={!!errors.lieuTravailMembre}
                  helperText={errors.lieuTravailMembre?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  select
                  label="Situation matrimoniale"
                  variant="outlined"
                  value={data.situationMatrimonialeMembre || ''}
                  {...register('situationMatrimonialeMembre')}
                  onChange={handleChange}
                  error={!!errors.situationMatrimonialeMembre}
                  helperText={errors.situationMatrimonialeMembre?.message}
                >
                  {dataSituationMembre?.map((option: IDataChoice) => (
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
                  label="Nom fiance(e)"
                  value={data.nomFiance}
                  {...register('nomFiance')}
                  onChange={handleChange}
                  error={!!errors.nomFiance}
                  helperText={errors.nomFiance?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  type="date"
                  variant="outlined"
                  label="Date de mariage"
                  InputLabelProps={{ shrink: true }}
                  value={data.dateMariageMembre || ''}
                  {...register('dateMariageMembre')}
                  onChange={handleChange}
                  error={!!errors.dateMariageMembre}
                  helperText={errors.dateMariageMembre?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  type="text"
                  variant="outlined"
                  label="Eglise d'origine"
                  value={data.egliseOrigineMembre}
                  {...register('egliseOrigineMembre')}
                  onChange={handleChange}
                  error={!!errors.egliseOrigineMembre}
                  helperText={errors.egliseOrigineMembre?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  type="date"
                  variant="outlined"
                  label="Date de conversion"
                  InputLabelProps={{ shrink: true }}
                  value={data.dateConversionMembre || ''}
                  {...register('dateConversionMembre')}
                  onChange={handleChange}
                  error={!!errors.dateConversionMembre}
                  helperText={errors.dateConversionMembre?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  select
                  label="Nouvelle ame"
                  variant="outlined"
                  value={data.nouvelleAmeMembre || ''}
                  {...register('nouvelleAmeMembre')}
                  onChange={handleChange}
                  error={!!errors.nouvelleAmeMembre}
                  helperText={errors.nouvelleAmeMembre?.message}
                >
                  {dataNouvelAme?.map((option: IDataChoice) => (
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
                  label="Bapteme d'eau"
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
                    helperText="Date de bapteme"
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
                    label="Lieu du bapteme d'eau"
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
                  label="Bapteme du Saint-Esprit"
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
                    label="Date de bapteme du Saint-Esprit"
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
                  label="Capacite spirituelle"
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
                    label="Responsabilite dans l'eglise"
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
                    {responsabiliteOptions.map((option: IDataChoice) => (
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
                  label="Departement/Comite"
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
                  {departementOptions.map((option: IDataChoice) => (
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
                  {celluleOptions.map((option: IDataChoice) => (
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
                  <MenuItem value="">
                    <em>Aucun</em>
                  </MenuItem>
                  {groupeOptions.map((option: IDataChoice) => (
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
                  label="Telephone *"
                  value={data.contactMembre}
                  {...register('contactMembre', { required: 'Le telephone est requis' })}
                  onChange={handleChange}
                  error={!!errors.contactMembre}
                  helperText={errors.contactMembre?.message}

                />
              </Grid>
            </Grid>
            <Divider />
            <DialogActions sx={{ flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 1, px: 0, pt: 2 }}>
              <Button fullWidth={isMobile} onClick={handleCloseDialog} color="primary">Annuler</Button>

              <Button fullWidth={isMobile} type="submit" color="primary" disabled={loading || updateLoading}>
                {(loading || updateLoading) ? 'Enregistrement...' : (isEditMode ? 'Modifier' : 'Enregistrer')}
              </Button>

            </DialogActions>
          </form>

        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirmDeleteSelectedOpen}
        title="Supprimer les membres selectionnes"
        message={`Voulez-vous vraiment supprimer ${selected.length} membre(s) selectionne(s) ?`}
        confirmText="Supprimer"
        loading={deleteLoading}
        onClose={() => setConfirmDeleteSelectedOpen(false)}
        onConfirm={async () => {
          setConfirmDeleteSelectedOpen(false);
          await handleDeleteSelected();
        }}
      />

      <NotificationComponent />
    </DashboardContent>
  );
}


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






