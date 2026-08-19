// ============================================================================
// user-view.tsx
// C'est la page principale "Membre" : tableau des membres, formulaire
// d'ajout/modification, boîte de dialogue du QR code d'auto-inscription,
// et la liste des demandes d'inscription envoyées par ce QR code.
// ============================================================================

// --- Bibliothèques externes ---
import * as XLSX from 'xlsx';                 // Génère le fichier Excel pour "Exporter les membres"
import ReactToPrint from 'react-to-print';     // Ouvre la boîte d'impression du navigateur (mode web, hors desktop)
import { QRCodeSVG } from 'qrcode.react';      // Dessine le QR code affiché/imprimé dans la boîte de dialogue
import { useForm } from 'react-hook-form';     // Gère le formulaire d'ajout/modification d'un membre
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

// --- Composants d'interface (MUI) ---
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Grid, Dialog, Divider, MenuItem, TextField, DialogTitle, DialogActions,
  Alert, Avatar, IconButton, Stack, DialogContent, Tooltip

} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Close as CloseIcon,
  PrintRounded,
  ContentCopyRounded,
  Person as PersonIcon,
  PhotoCamera as PhotoCameraIcon,
  QrCode2Rounded,
} from '@mui/icons-material';

// --- Utilitaires et helpers de l'application ---
import { ApiError, apiClient, buildPhotoUrl } from 'src/utils/apiClient';
import { canManageModule, isDesktopAppRuntime } from 'src/utils/access-control';
import { subscribeToCommunauteEvent } from 'src/utils/socket-client';
import { DUPLICATE_MEMBER_MESSAGE, findDuplicateMember } from 'src/utils/member-duplicates';
import { ContactPhoneLink } from 'src/components/contact-phone-link';
import ConfirmDialog from 'src/components/alert/confirmDialog';
import { useNotificationSnackbar } from 'src/components/alert/notificationSnackbar';
import { PRINT_PORTRAIT_PAGE_STYLE } from 'src/components/print/print-document';
import { exportDesktopPdf, canUseDesktopPrint } from 'src/utils/desktop-print'; // Impression PDF native quand on est dans l'app desktop (Electron)

// --- Sous-composants propres à la page Membre (tableau, en-têtes, etc.) ---
import { TableNoData } from '../table-no-data';
import { UserTableRow } from '../user-table-row';
import { UserTableHead } from '../user-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { UserTableToolbar } from '../user-table-toolbar';
import { DashboardContent } from '../../../layouts/dashboard';
import { Iconify } from '../../../components/iconify/iconify';
import { emptyRows, applyFilter, getComparator, getPhotoUrl } from '../utils';
import { Scrollbar } from '../../../components/scrollbar/scrollbar';
import { membre, dataGenre, setDataModifiesMembre, deleteMembre, IMembre, IDataChoice, dataBapteme, dataNouvelAme, ensureMembreArrays, setFilterMembre, setListFilterMembre, setListMembre, setTitreDocument, visiteMembres, dataNiveauEtude, dataSituationMembre , dataCapaciteSpirituelle, dataCivilite, setListResponsabilite } from '../../../store/membreSlice';
import { setListDepartement } from '../../../store/departementSlice';
import { setListCellule } from '../../../store/celluleSlice';
import { setListGroupe } from '../../../store/groupeSlice';
import PrintEtatGlobal from '../etats/printEtats';
import { QrRegistrationPoster } from '../etats/qrRegistrationPoster'; // L'affiche A4 imprimable avec le QR code en grand

// ----------------------------------------------------------------------
// Petites fonctions utilitaires (hors composant, pas besoin de les
// recréer à chaque rendu) : elles transforment une valeur brute stockée
// en base de données en texte lisible pour l'utilisateur.
// ----------------------------------------------------------------------

// Cherche le libellé correspondant à une valeur dans une liste de choix
// (ex: "1" -> "Oui"). Retourne une chaîne vide si rien n'est renseigné.
const resolveChoiceLabel = (choices: IDataChoice[], value: unknown): string => {
  const rawValue = String(value ?? '').trim();
  if (!rawValue || rawValue === '0') return '';

  const match = choices.find((choice) => String(choice.value) === rawValue);
  return match?.label || rawValue;
};

// Comme resolveChoiceLabel, mais affiche "Non renseigne" plutôt qu'une
// chaîne vide quand la valeur est absente (utilisé dans la vue mobile).
const resolveOptionalChoiceLabel = (choices: IDataChoice[], value: unknown): string => {
  const rawValue = String(value ?? '').trim();
  if (!rawValue || rawValue === '0') return 'Non renseigne';

  const match = choices.find((choice) => String(choice.value) === rawValue);
  return match?.label || 'Non renseigne';
};

// Même principe, mais pour les listes de référence (Cellule, Département,
// Groupe, Responsabilité...) où l'identifiant est un idXxx et le libellé
// vient d'une autre table (utilisé pour l'export Excel).
const resolveReferenceLabel = (
  items: Array<{ value: number | string; label: string }>,
  value: unknown
): string => {
  const rawValue = String(value ?? '').trim();
  if (!rawValue) return '';

  const match = items.find((item) => String(item.value) === rawValue);
  return match?.label || rawValue;
};

// Les champs Oui/Non de la fiche membre (baptême, nouvelle âme...) sont
// stockés en base sous forme de code "1" (Oui) / "2" (Non).
const isYesValue = (value: unknown): boolean => String(value ?? '').trim() === '1';

// Forme d'une demande d'inscription envoyée via le QR code : elle est en
// attente de validation par un responsable avant de devenir un vrai membre.
// "payloadDemande" contient la fiche complète remplie par le futur membre.
type MemberRegistrationRequest = {
  idDemandeInscription: number;
  idUtilisateur: number;
  nomMembre?: string;
  prenomMembre?: string;
  contactMembre?: string;
  payloadDemande?: Partial<IMembre>;
  dateCreation?: string;
};


export function UserView() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // ---- Données lues dans le store Redux ----
  // "membre" contient la liste des membres déjà enregistrés (rechargée
  // depuis le backend, voir fetchMembres plus bas). Les autres listes
  // (département, cellule, groupe, responsabilité) sont les listes de
  // référence préparées à l'avance dans Paramètres/pages dédiées : elles
  // servent à remplir les menus déroulants du formulaire membre.
  const { listMembre, filterMembre, titreDocument, listResponsabilite } = useSelector((state: any) => state.membre);
  const listDepartement = useSelector((state: any) => state.departement.listDepartement);
  const listCellule = useSelector((state: any) => state.cellule.listCellule);
  const listGroupe = useSelector((state: any) => state.groupe.listGroupe);
  const appUserConnected = useSelector((state: any) => state.application?.userConnected);
  const authUtilisateurData = useSelector((state: any) => state.authentification?.utilisateurData);
  // Identifiant de l'église/compte connecté : toutes les requêtes API sur les
  // membres (liste, ajout, QR code...) sont scopées à cet identifiant.
  const currentUserId =
    Number(appUserConnected?.idUtilisateurParent || appUserConnected?.idUtilisateur)
    || Number(authUtilisateurData?.idUtilisateurParent || authUtilisateurData?.idUtilisateur)
    || null;
  // true si le rôle connecté a le droit de créer/modifier/supprimer des membres
  // (un simple "lecteur" verra la liste mais pas les boutons d'action).
  const canManageUsers = canManageModule(appUserConnected || authUtilisateurData, 'user');
  // true si on est dans l'app desktop (Electron) plutôt que dans un navigateur :
  // certains boutons (impression web, export Excel...) sont adaptés en conséquence.
  const isDesktopApp = isDesktopAppRuntime();
  // Transforme chaque liste de référence en paires {value, label} exploitables
  // directement par les <TextField select> du formulaire membre.
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
      : []
  ), [listResponsabilite]);
  const exportableMembres = useMemo(() => (Array.isArray(listMembre) ? listMembre : []), [listMembre]);
  // Nom de l'église affiché sur le QR code / l'affiche imprimable, avec
  // repli sur "Ma Communaute" si rien n'est renseigné dans le profil.
  const registrationChurchName = useMemo(() => (
    String(
      appUserConnected?.nomEgliseCourt ||
      appUserConnected?.nomTemple ||
      appUserConnected?.nomEglise ||
      authUtilisateurData?.nomEgliseCourt ||
      authUtilisateurData?.nomTemple ||
      authUtilisateurData?.nomEglise ||
      'Ma Communaute'
    ).trim()
  ), [appUserConnected, authUtilisateurData]);

  const [loading, setLoading] = useState(true);
  const table = useTable(); // Tri, pagination et sélection multiple du tableau (voir le hook en bas du fichier)


  const { selected, onSelectAllRows } = table;

  // ---- États du composant ----
  const [filterName, setFilterName] = useState('');           // Texte tapé dans la barre de recherche du tableau
  const [openDialog, setOpenDialog] = useState(false);         // Ouverture de la boîte de dialogue "Ajouter/Modifier un membre"
  const [data, setData] = useState({ ...membre });             // Contenu du formulaire membre en cours d'édition
  const [photoPreview, setPhotoPreview] = useState<string | null>(null); // Aperçu de la photo affichée dans le formulaire
  const [photoFile, setPhotoFile] = useState<File | null>(null);        // Fichier image sélectionné, avant conversion en base64
  const [isEditMode, setIsEditMode] = useState(false); // true = on modifie un membre existant, false = on en crée un nouveau
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDeleteSelectedOpen, setConfirmDeleteSelectedOpen] = useState(false); // Boîte de confirmation avant suppression multiple
  const [updateLoading, setUpdateLoading] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);     // Ouverture de la boîte de dialogue du QR code d'inscription
  const [qrBrowserUrl, setQrBrowserUrl] = useState('');        // Adresse réseau (LAN) du poste, récupérée pour construire le lien du QR code
  // Demandes d'inscription envoyées via le QR code, en attente de validation.
  const [pendingRegistrations, setPendingRegistrations] = useState<MemberRegistrationRequest[]>([]);
  const [pendingRegistrationsLoading, setPendingRegistrationsLoading] = useState(false);
  const [selectedRegistrationRequest, setSelectedRegistrationRequest] = // Demande actuellement ouverte dans la boîte "Voir et valider"
    useState<MemberRegistrationRequest | null>(null);
  const [registrationActionLoading, setRegistrationActionLoading] = useState(false); // Chargement pendant Valider/Rejeter

  // Construit le lien complet du QR code : adresse réseau du poste +
  // route publique "/inscription-membre" + l'identifiant de l'église (user)
  // et son nom (church), pour que le formulaire scanné par le téléphone
  // sache à quelle église rattacher la demande.
  const qrRegistrationUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return '';
    }

    const baseUrl = qrBrowserUrl || window.location.origin;
    const url = new URL('/inscription-membre', baseUrl);

    if (currentUserId) {
      url.searchParams.set('user', String(currentUserId));
    }
    if (registrationChurchName) {
      url.searchParams.set('church', registrationChurchName);
    }

    return url.toString();
  }, [currentUserId, qrBrowserUrl, registrationChurchName]);

  const {
    showNotification,
    hideNotification,
    NotificationComponent
  } = useNotificationSnackbar();

  const {
    setFocus,
    register,
    reset,
    setValue,
    clearErrors,
    handleSubmit: formHandleSubmit,
    formState: { errors },
  } = useForm<IMembre>({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  // Ferme la boîte de dialogue "Ajouter/Modifier" et remet le formulaire à zéro.
  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setIsEditMode(false);
    setData({ ...membre });
    reset({ ...membre });
    clearErrors();
    setPhotoPreview(null);
    setPhotoFile(null);
  }, [clearErrors, reset]);


  // Ouvre la boîte de dialogue en mode "création" (formulaire vide).
  const handleOpenDialog = useCallback(() => {
    if (!canManageUsers) return;

    reset({ ...membre });
    clearErrors();
    setOpenDialog(true);
  }, [canManageUsers, clearErrors, reset]);

  // Ouvre la boîte de dialogue du QR code et récupère au passage l'adresse
  // réseau (LAN) du poste auprès du backend, pour que le lien fonctionne
  // une fois scanné par un téléphone connecté au même Wi-Fi.
  const handleOpenQrDialog = useCallback(async () => {
    if (!canManageUsers) return;

    setQrDialogOpen(true);

    try {
      const response = await apiClient.getServerInfo();
      const browserUrl = String(response.data?.browserUrl || '').trim();
      if (response.status === 1 && browserUrl) {
        setQrBrowserUrl(browserUrl);
      }
    } catch (error) {
      console.warn('Impossible de recuperer l URL reseau pour le QR code:', error);
    }
  }, [canManageUsers]);

  // Référence vers l'affiche imprimable (composant caché, voir le JSX plus
  // bas) : c'est ce noeud HTML qui est envoyé à Electron ou au navigateur
  // pour être transformé en PDF/impression.
  const qrPosterRef = useRef<HTMLDivElement>(null);
  // true si on est dans l'app desktop avec l'impression Electron disponible ;
  // sinon on retombe sur l'impression navigateur (ReactToPrint) dans le JSX.
  const isDesktopPrint = canUseDesktopPrint();

  // Exporte directement l'affiche QR code en PDF via Electron (mode desktop).
  const handleExportQrPosterPdf = useCallback(async () => {
    try {
      await exportDesktopPdf(qrPosterRef.current, {
        title: `Affiche inscription - ${registrationChurchName}`,
        fileName: 'affiche-inscription-qr',
        orientation: 'portrait',
      });
    } catch (error) {
      showNotification("Impossible d'exporter l'affiche en PDF", 'error');
    }
  }, [registrationChurchName, showNotification]);

  // Copie le lien d'inscription dans le presse-papier (bouton "Copier le lien").
  const handleCopyQrRegistrationUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(qrRegistrationUrl);
      showNotification('Lien inscription copie', 'success');
    } catch (error) {
      showNotification('Impossible de copier le lien automatiquement', 'warning');
    }
  }, [qrRegistrationUrl, showNotification]);

  // Recharge la liste complète des membres depuis le backend et la stocke
  // dans Redux. Appelée au chargement de la page, après un ajout/modification/
  // suppression, et quand un autre poste notifie un changement (voir les
  // écouteurs socket.io plus bas).
  const fetchMembres = useCallback(async () => {
    const clearMembres = () => {
      dispatch(setListMembre([]));
      dispatch(setListFilterMembre([]));
      dispatch(setFilterMembre([]));
      dispatch(setTitreDocument(''));
    };

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
      const message = error instanceof ApiError ? error.message : (error as Error)?.message;
      const noMemberFound =
        /aucun membre/i.test(String(message || '')) ||
        (error instanceof ApiError && [404, 204].includes(Number(error.status)));

      clearMembres();

      if (noMemberFound) {
        return;
      }

      console.error('Error fetching membres:', error);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // Recharge la liste des demandes d'inscription "en_attente" envoyées via
  // le QR code pour cette église. Vide si l'utilisateur n'a pas le droit
  // de gérer les membres (pas de responsabilité de validation dans ce cas).
  const fetchPendingRegistrations = useCallback(async () => {
    if (!currentUserId || !canManageUsers) {
      setPendingRegistrations([]);
      return;
    }

    try {
      setPendingRegistrationsLoading(true);
      const response = await apiClient.getMemberRegistrationRequests(currentUserId);
      setPendingRegistrations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Impossible de recuperer les demandes inscription membre:', error);
      setPendingRegistrations([]);
    } finally {
      setPendingRegistrationsLoading(false);
    }
  }, [canManageUsers, currentUserId]);

  // Valide la demande sélectionnée : le backend crée le membre à partir
  // des infos envoyées par le futur membre (avec la vérification anti-
  // doublon), puis on rafraîchit la liste des demandes et celle des membres.
  const handleApproveRegistrationRequest = useCallback(async () => {
    if (!selectedRegistrationRequest || !currentUserId) return;

    try {
      setRegistrationActionLoading(true);
      const response = await apiClient.approveMemberRegistrationRequest(
        selectedRegistrationRequest.idDemandeInscription,
        currentUserId
      );

      if (response.status !== 1) {
        throw new Error(response.message || "La demande n'a pas pu etre validee.");
      }

      showNotification('Demande validee. Le membre a ete ajoute a la liste.', 'success');
      setSelectedRegistrationRequest(null);
      await Promise.all([fetchPendingRegistrations(), fetchMembres()]);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : (error as Error)?.message || "La demande n'a pas pu etre validee.";
      showNotification(message, 'error');
    } finally {
      setRegistrationActionLoading(false);
    }
  }, [currentUserId, fetchMembres, fetchPendingRegistrations, selectedRegistrationRequest, showNotification]);

  // Rejette la demande sélectionnée : elle passe au statut "rejetee" côté
  // backend (la ligne reste en base pour historique) mais aucun membre n'est créé.
  const handleRejectRegistrationRequest = useCallback(async () => {
    if (!selectedRegistrationRequest || !currentUserId) return;

    try {
      setRegistrationActionLoading(true);
      const response = await apiClient.rejectMemberRegistrationRequest(
        selectedRegistrationRequest.idDemandeInscription,
        currentUserId
      );

      if (response.status !== 1) {
        throw new Error(response.message || "La demande n'a pas pu etre rejetee.");
      }

      showNotification('Demande rejetee.', 'info');
      setSelectedRegistrationRequest(null);
      await fetchPendingRegistrations();
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : (error as Error)?.message || "La demande n'a pas pu etre rejetee.";
      showNotification(message, 'error');
    } finally {
      setRegistrationActionLoading(false);
    }
  }, [currentUserId, fetchPendingRegistrations, selectedRegistrationRequest, showNotification]);


  // Écoute en temps réel (socket.io) les événements envoyés par le backend
  // quand un membre est ajouté/modifié/supprimé ou déclaré décédé — y compris
  // depuis un AUTRE poste connecté à la même église. Permet à cette page de
  // se rafraîchir automatiquement sans que l'utilisateur ait à recharger.
  useEffect(() => {
    if (!currentUserId) {
      return undefined;
    }

    // Un événement sans idUtilisateur (ancien format) est traité comme
    // "concerne tout le monde" ; sinon on ne réagit que si ça concerne
    // bien l'église actuellement connectée.
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

  // Charge les demandes d'inscription en attente dès que la page s'affiche
  // (ou que l'église connectée change).
  useEffect(() => {
    fetchPendingRegistrations();
  }, [fetchPendingRegistrations]);

  // Même principe que l'écoute socket.io ci-dessus, mais spécifique aux
  // demandes d'inscription QR code : "demandeInscriptionMembre" est émis
  // quand un futur membre envoie son formulaire depuis son téléphone,
  // "demandeInscriptionMembreTraitee" quand un responsable valide/rejette.
  useEffect(() => {
    if (!currentUserId || !canManageUsers) {
      return undefined;
    }

    const shouldRefreshForUser = (payload: any) => (
      !payload?.idUtilisateur || Number(payload.idUtilisateur) === Number(currentUserId)
    );

    const refreshPendingRegistrations = (payload: any) => {
      if (shouldRefreshForUser(payload)) {
        fetchPendingRegistrations();
      }
    };

    const unsubscribers = [
      subscribeToCommunauteEvent('demandeInscriptionMembre', refreshPendingRegistrations),
      subscribeToCommunauteEvent('demandeInscriptionMembreTraitee', refreshPendingRegistrations),
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [canManageUsers, currentUserId, fetchPendingRegistrations]);

  // Charge les listes de référence (département, cellule, groupe,
  // responsabilité) utilisées par les menus déroulants du formulaire membre.
  const loadReferenceData = useCallback(async () => {
    if (!currentUserId) return;

    try {
      const [departementsResponse, cellulesResponse, groupesResponse, responsabilitesResponse] = await Promise.all([
        apiClient.getDepartementsByUtilisateur(currentUserId),
        apiClient.getCellulesByUtilisateur(currentUserId),
        apiClient.getGroupesByUtilisateur(currentUserId),
        apiClient.getResponsabilites(),
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
      if (responsabilitesResponse.status === 1) {
        const responsabilites = Array.isArray(responsabilitesResponse.data)
          ? responsabilitesResponse.data.filter((item: any) => Number(item.idUtilisateur) === Number(currentUserId))
          : [];
        dispatch(setListResponsabilite(responsabilites));
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
      reset({ ...membre });
      clearErrors();
      setPhotoPreview(null);
      setPhotoFile(null);
      setIsEditMode(false);
    }
  }, [clearErrors, openDialog, reset]);

  // Supprime un membre après confirmation (voir le bouton "corbeille" dans
  // le tableau et la fiche mobile). La requête est envoyée avec l'identifiant
  // de l'église propriétaire du membre pour respecter les droits d'accès.
  const handleDeleteMembre = useCallback(async (idMembre: number) => {
  if (!canManageUsers) return;

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
}, [canManageUsers, currentUserId, dispatch, listMembre, showNotification]);

  // Ouvre la boîte de dialogue en mode "modification", pré-remplie avec les
  // données du membre cliqué. Beaucoup de champs viennent de la base sous
  // forme de null/undefined ou de nombres : on les uniformise en chaînes
  // de caractères ("") pour que les <TextField> et <select> du formulaire
  // les affichent correctement.
  const handleEditMembre = useCallback((membreData: IMembre) => {
    if (!canManageUsers) return;

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
    reset(formData);
    clearErrors();

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
  }, [canManageUsers, clearErrors, reset]);

  // Coeur de l'enregistrement d'un membre : selon isEditMode, on appelle
  // soit la modification (PUT-like), soit la création. Dans les deux cas,
  // les champs texte "Oui/Non" et les identifiants de listes (cellule,
  // département...) sont convertis en nombres avant l'envoi au backend,
  // et on vérifie côté client qu'il n'existe pas déjà un doublon
  // (même nom + téléphone) avant d'appeler l'API.
  const handleCreateOrUpdateMembre = useCallback(async (membreData: IMembre) => {
    if (!canManageUsers) return;

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
        const updateUserId =
          Number(currentMembre?.idUtilisateur || membreData.idUtilisateur || data.idUtilisateur || 0)
          || currentUserId;

        const cleanedData: any = {
          ...currentMembre,
          ...membreData,
          idMembre: data.idMembre,
          idUtilisateur: updateUserId,
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

        if (findDuplicateMember(listMembre, cleanedData, data.idMembre)) {
          showNotification(DUPLICATE_MEMBER_MESSAGE, 'warning');
          return;
        }

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

      if (findDuplicateMember(listMembre, cleanedData)) {
        showNotification(DUPLICATE_MEMBER_MESSAGE, 'warning');
        return;
      }

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
    data.idUtilisateur,
    dispatch,
    fetchMembres,
    handleCloseDialog,
    canManageUsers,
    isEditMode,
    listMembre,
    showNotification,
  ]);

  // Génère un fichier Excel (.xlsx) avec tous les membres, en remplaçant
  // les codes bruts (ex: "1") par leurs libellés lisibles (ex: "Oui").
  // Désactivé dans l'app desktop : le téléchargement de fichier n'y est
  // pas géré, on redirige l'utilisateur vers le navigateur.
  const handleExportMembres = useCallback(() => {
    if (isDesktopApp) {
      showNotification("L'export des membres est disponible uniquement dans le navigateur.", 'warning');
      return;
    }

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
    isDesktopApp,
    responsabiliteOptions,
    showNotification,
  ]);

  // Appelé quand on clique "Enregistrer/Modifier" dans le formulaire.
  // Vérifie les règles métier qui ne sont pas de simples champs obligatoires
  // (ex : si "Baptême d'eau" = Oui, la date du baptême devient obligatoire),
  // puis délègue la sauvegarde à handleCreateOrUpdateMembre ci-dessus.
  const onFormSubmit = useCallback((formData: IMembre) => {
    if (!formData.nomMembre.trim()) {
      showNotification('Le nom est requis', 'warning'); // Remplacer alert
      return;
    }

    if (!formData.contactMembre.trim()) {
      showNotification('Le contact est requis', 'warning'); // Remplacer alert
      return;
    }

    if (
      isYesValue(data.baptemeEauMembre || formData.baptemeEauMembre)
      && !String(data.dateBaptemeMembre || formData.dateBaptemeMembre || '').trim()
    ) {
      showNotification("La date du bapteme d'eau est requise", 'warning');
      setFocus('dateBaptemeMembre');
      return;
    }

    if (
      isYesValue(data.baptemeSaintEspritMembre || formData.baptemeSaintEspritMembre)
      && !String(data.dateBaptemeSaintEspritMembre || formData.dateBaptemeSaintEspritMembre || '').trim()
    ) {
      showNotification('La date du bapteme du Saint-Esprit est requise', 'warning');
      setFocus('dateBaptemeSaintEspritMembre');
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
  }, [
    data.baptemeEauMembre,
    data.baptemeSaintEspritMembre,
    data.dateBaptemeMembre,
    data.dateBaptemeSaintEspritMembre,
    data.idMembre,
    data.photoMembre,
    handleCreateOrUpdateMembre,
    isEditMode,
    setFocus,
    showNotification,
  ]); // Ajouter showNotification

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

  const currentPageMembres = useMemo(
    () =>
      sortedData?.slice(
        table.page * table.rowsPerPage,
        table.page * table.rowsPerPage + table.rowsPerPage
      ) || [],
    [sortedData, table.page, table.rowsPerPage]
  );

  const handleChange = useCallback((event: any) => {
    const { name, value } = event.target;
    let sanitizedValue = value;

    if (name === 'contactMembre' && !/^\d*\.?\d*$/.test(value)) {
      sanitizedValue = '';
    }

    const nextData: Record<string, any> = { [name]: sanitizedValue };

    if (name === 'civiliteMembre') {
      const civiliteValue = String(sanitizedValue);
      if (civiliteValue === '1') {
        nextData.sexeMembre = '1';
        setValue('sexeMembre', '1', {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
        clearErrors('sexeMembre');
      } else if (civiliteValue === '2' || civiliteValue === '3') {
        nextData.sexeMembre = '2';
        setValue('sexeMembre', '2', {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
        clearErrors('sexeMembre');
      }
    }

    setData((prevData: any) => ({ ...prevData, ...nextData }));
    setValue(name, sanitizedValue, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    if (String(sanitizedValue ?? '').trim()) {
      clearErrors(name);
    }

    if (name === 'baptemeEauMembre' && !isYesValue(sanitizedValue)) {
      clearErrors('dateBaptemeMembre');
    }

    if (name === 'baptemeSaintEspritMembre' && !isYesValue(sanitizedValue)) {
      clearErrors('dateBaptemeSaintEspritMembre');
    }

  }, [clearErrors, setValue]);

  // Supprime en une fois tous les membres cochés dans le tableau (case à
  // cocher). Compte les succès/échecs pour afficher un message récapitulatif.
  const handleDeleteSelected = useCallback(async () => {
    if (!canManageUsers) return;

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
  }, [canManageUsers, currentUserId, selected, onSelectAllRows, dispatch, listMembre, showNotification, fetchMembres]);


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
  const isWaterBaptismSelected = isYesValue(data.baptemeEauMembre);
  const isSpiritBaptismSelected = isYesValue(data.baptemeSaintEspritMembre);


  return (
    <DashboardContent>
      {/* ---- En-tête de page : titre + barre de boutons d'action ---- */}
      <Box
        display="flex"
        alignItems={{ xs: 'stretch', md: 'center' }}
        flexDirection={{ xs: 'column', md: 'row' }}
        gap={2}
        mb={{ xs: 3, md: 5 }}
      >

        <Typography variant="h4" flexGrow={1} sx={{ fontSize: { xs: '1.45rem', md: '2rem' } }}>
          Liste des membres
        </Typography>

        <Stack
          direction="row"
          spacing={1.25}
          alignItems="center"
          sx={{ width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'flex-start', md: 'flex-end' }, flexWrap: 'wrap' }}
        >
          {/* Menu Imprimer, uniquement dans le navigateur (voir printEtats.tsx) */}
          {!isDesktopApp && <PrintEtatGlobal />}

          {!isDesktopApp && canManageUsers && (
            <>
              <Tooltip title="Importer membre">
                <span>
                  <IconButton
                    color="primary"
                    onClick={() => navigate('/user/import')}
                    disabled={loading}
                    sx={{ display: { xs: 'inline-flex', sm: 'none' }, border: 1, borderColor: 'divider', borderRadius: 1 }}
                  >
                    <Iconify icon="solar:import-linear" />
                  </IconButton>
                </span>
              </Tooltip>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<Iconify icon="solar:import-linear" />}
                onClick={() => navigate('/user/import')}
                disabled={loading}
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              >
                Importer membre
              </Button>
            </>
          )}

          {!isDesktopApp && (
            <>
              <Tooltip title="Exporter les membres">
                <span>
                  <IconButton
                    color="primary"
                    onClick={handleExportMembres}
                    disabled={loading || !exportableMembres.length}
                    sx={{ display: { xs: 'inline-flex', sm: 'none' }, border: 1, borderColor: 'divider', borderRadius: 1 }}
                  >
                    <Iconify icon="solar:export-linear" />
                  </IconButton>
                </span>
              </Tooltip>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<Iconify icon="solar:export-linear" />}
                onClick={handleExportMembres}
                disabled={loading || !exportableMembres.length}
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              >
                Exporter les membres
              </Button>
            </>
          )}

          {/* Bouton QR code : visible aussi en desktop, car c'est justement le
              poste desktop qui héberge le backend et doit pouvoir générer/imprimer
              le QR code. */}
          {canManageUsers && (
            <>
              <Tooltip title="Inscription par QR code">
                <span>
                  <IconButton
                    color="primary"
                    onClick={handleOpenQrDialog}
                    disabled={loading || !currentUserId}
                    sx={{ display: { xs: 'inline-flex', sm: 'none' }, border: 1, borderColor: 'divider', borderRadius: 1 }}
                  >
                    <QrCode2Rounded fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<QrCode2Rounded fontSize="small" />}
                onClick={handleOpenQrDialog}
                disabled={loading || !currentUserId}
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              >
                QR code
              </Button>
            </>
          )}

          {!isDesktopApp && canManageUsers && (
            <>
              <Tooltip title="Ajouter membre">
                <span>
                  <IconButton
                    color="primary"
                    onClick={handleOpenDialog}
                    disabled={loading}
                    sx={{ display: { xs: 'inline-flex', sm: 'none' }, bgcolor: 'action.selected', borderRadius: 1 }}
                  >
                    <Iconify icon="mingcute:add-line" />
                  </IconButton>
                </span>
              </Tooltip>
              <Button
                variant="contained"
                color="inherit"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={handleOpenDialog}
                disabled={loading}
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              >
                Ajouter membre
              </Button>
            </>
          )}
        </Stack>
      </Box>

      {/* ---- Carte "Demandes d'inscription QR code" ----
          Liste des fiches envoyées par les futurs membres via le QR code
          (voir handleOpenQrDialog et fetchPendingRegistrations plus haut) :
          rien n'est encore ajouté à la liste des membres tant qu'un
          responsable n'a pas cliqué "Voir et valider". */}
      {canManageUsers && (
        <Card sx={{ mb: 2.5, p: { xs: 2, md: 2.5 }, borderRadius: 2 }}>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <Box>
                <Typography variant="h6">Demandes d&apos;inscription QR code</Typography>
                <Typography variant="body2" color="text.secondary">
                  Validez les enregistrements envoyés avant de les ajouter aux membres.
                </Typography>
              </Box>
              <Button
                size="small"
                color="inherit"
                onClick={fetchPendingRegistrations}
                disabled={pendingRegistrationsLoading}
              >
                Actualiser
              </Button>
            </Stack>

            {pendingRegistrations.length === 0 ? (
              <Alert severity="info">
                {pendingRegistrationsLoading
                  ? 'Chargement des demandes...'
                  : "Aucune demande d'inscription en attente pour le moment."}
              </Alert>
            ) : (
              <Stack spacing={1.25}>
                {pendingRegistrations.map((request) => {
                  const fullName = `${request.nomMembre || ''} ${request.prenomMembre || ''}`.trim();

                  return (
                    <Card
                      key={request.idDemandeInscription}
                      variant="outlined"
                      sx={{ p: 1.5, borderRadius: 1.5, boxShadow: 'none' }}
                    >
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.25}
                        justifyContent="space-between"
                        alignItems={{ xs: 'stretch', sm: 'center' }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                            {fullName || 'Nom non renseigne'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {request.contactMembre || 'Contact non renseigne'}
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setSelectedRegistrationRequest(request)}
                        >
                          Voir et valider
                        </Button>
                      </Stack>
                    </Card>
                  );
                })}
              </Stack>
            )}
          </Stack>
        </Card>
      )}

      {/* ---- Tableau des membres ----
          Deux rendus différents selon la taille d'écran : des cartes
          empilées sur mobile (plus lisible qu'un tableau étroit), un
          vrai <Table> avec tri/pagination sur desktop. Les deux lisent
          les mêmes données (currentPageMembres). */}
      <Card>
        <UserTableToolbar
          numSelected={canManageUsers ? selected.length : 0} // Utilisez 'selected' au lieu de 'table.selected'
          filterName={filterName}
          onFilterName={(event) => {
            setFilterName(event.target.value);
            table.onResetPage();
          }}
          onDelete={() => setConfirmDeleteSelectedOpen(true)}
          deleteLoading={deleteLoading}
        />

        {/* --- Vue mobile : une carte par membre --- */}
        {isMobile && (
          <Stack spacing={1.5} sx={{ px: 2, pb: 2 }}>
            {currentPageMembres.map((row: IMembre) => {
              const photoUrl = getPhotoUrl(row.photoMembre);
              const isSelected = table.selected?.includes(row.idMembre?.toString());

              return (
                <Card key={row.idMembre} variant="outlined" sx={{ p: 1.75, borderRadius: 2, boxShadow: 'none' }}>
                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      {canManageUsers && (
                        <Checkbox
                          checked={isSelected}
                          onChange={() => table?.onSelectRow(row.idMembre?.toString())}
                          sx={{ p: 0.25 }}
                        />
                      )}
                      <Avatar
                        src={photoUrl || undefined}
                        alt={`${row.nomMembre || ''} ${row.prenomMembre || ''}`}
                        sx={{ width: 46, height: 46 }}
                      >
                        {!photoUrl && `${row.nomMembre?.charAt(0) || ''}${row.prenomMembre?.charAt(0) || ''}`}
                      </Avatar>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                          {row.nomMembre} {row.prenomMembre}
                        </Typography>
                        <ContactPhoneLink fallback="Contact non renseigne" value={row.contactMembre} />
                      </Box>
                    </Stack>

                    <Divider />

                    <Grid container spacing={1.25}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Residence</Typography>
                        <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{row.residenceMembre || '-'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Baptisé(e)</Typography>
                        <Typography variant="body2">{resolveChoiceLabel(dataBapteme, row.baptemeEauMembre) || '-'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Fonction</Typography>
                        <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{row.fonctionMembre || '-'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Situation</Typography>
                        <Typography variant="body2">{resolveOptionalChoiceLabel(dataSituationMembre, row.situationMatrimonialeMembre)}</Typography>
                      </Grid>
                    </Grid>

                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton size="small" onClick={() => navigate(`/details/${row.idMembre}`)}>
                        <Iconify icon="solar:eye-bold" />
                      </IconButton>
                      {canManageUsers && (
                        <>
                          <IconButton size="small" onClick={() => handleEditMembre(row)}>
                            <Iconify icon="solar:pen-bold" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={deleteLoading}
                            onClick={() => handleDeleteMembre(row.idMembre)}
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </>
                      )}
                    </Stack>
                  </Stack>
                </Card>
              );
            })}

            {notFound && (
              <Card variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 2, boxShadow: 'none' }}>
                <Typography variant="subtitle2">Aucun résultat</Typography>
                <Typography variant="body2" color="text.secondary">
                  Aucun membre ne correspond a &quot;{filterName}&quot;.
                </Typography>
              </Card>
            )}
          </Stack>
        )}

        {/* --- Vue desktop : tableau classique avec tri/sélection --- */}
        {!isMobile && (
          <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={sortedData?.length}
                numSelected={canManageUsers ? table.selected?.length : 0}
                onSort={table?.onSort}
                onSelectAllRows={(checked) =>
                  canManageUsers
                    ? table?.onSelectAllRows(
                        checked,
                        sortedData?.map((x) => x.idMembre?.toString())
                      )
                    : undefined
                }
                headLabel={[
                  { id: 'photoMembre', label: 'Photo' },
                  { id: 'nomMembre', label: 'Nom et prénoms' },
                  { id: 'residenceMembre', label: "Lieu d'habitation" },
                  { id: 'baptemeEauMembre', label: 'Baptisé(e)' },
                  { id: 'lieuBaptemeEauMembre', label: 'Lieu du bapteme' },
                  { id: 'fonctionMembre', label: 'Fonction' },
                  { id: 'situationMatrimonialeMembre', label: 'Situation matrimoniale' },
                  { id: 'contactMembre', label: 'Contact' },
                  { id: 'Action', label: 'Actions' },
                ]}
              />
              <TableBody>
                {currentPageMembres?.map((row) => (
                    <UserTableRow
                      key={row.idMembre}
                      row={row}
                      selected={table.selected?.includes(row.idMembre?.toString())}
                      onSelectRow={() => table?.onSelectRow(row.idMembre?.toString())}
                      onEdit={handleEditMembre}
                      onDelete={handleDeleteMembre}
                      isDeleting={deleteLoading}
                      canManage={canManageUsers}
                    />
                  ))}

                <TableEmptyRows height={68} emptyRows={emptyRows(table.page, table.rowsPerPage, sortedData.length)} />
                {notFound && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
          </Scrollbar>
        )}

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

      {/* ---- Boîte de dialogue "Validation inscription QR code" ----
          S'ouvre quand on clique "Voir et valider" sur une demande. Affiche
          les infos envoyées par le futur membre et propose Valider (crée le
          membre) ou Rejeter (voir handleApproveRegistrationRequest /
          handleRejectRegistrationRequest plus haut). */}
      <Dialog
        open={Boolean(selectedRegistrationRequest)}
        onClose={() => !registrationActionLoading && setSelectedRegistrationRequest(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Validation inscription QR code</DialogTitle>
        <DialogContent dividers>
          {selectedRegistrationRequest && (
            <Stack spacing={2}>
              <Alert severity="warning">
                Ce membre n&apos;est pas encore dans la liste des membres. Validez les infos avant de l&apos;ajouter.
              </Alert>

              <Grid container spacing={2}>
                {[
                  ['Nom', selectedRegistrationRequest.payloadDemande?.nomMembre || selectedRegistrationRequest.nomMembre],
                  ['Prenoms', selectedRegistrationRequest.payloadDemande?.prenomMembre || selectedRegistrationRequest.prenomMembre],
                  ['Telephone', selectedRegistrationRequest.payloadDemande?.contactMembre || selectedRegistrationRequest.contactMembre],
                  ['Email', selectedRegistrationRequest.payloadDemande?.emailMembre],
                  ['Residence', selectedRegistrationRequest.payloadDemande?.residenceMembre],
                  ['Date de naissance', selectedRegistrationRequest.payloadDemande?.dateNaissMembre],
                  ['Lieu de naissance', selectedRegistrationRequest.payloadDemande?.lieuNaissMembre],
                  ['Fonction', selectedRegistrationRequest.payloadDemande?.fonctionMembre],
                  ["Eglise d'origine", selectedRegistrationRequest.payloadDemande?.egliseOrigineMembre],
                  ['Envoyee le', selectedRegistrationRequest.dateCreation],
                ].map(([label, value]) => (
                  <Grid key={label} item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                      {value || '-'}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            color="error"
            disabled={registrationActionLoading}
            onClick={handleRejectRegistrationRequest}
          >
            Rejeter
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            color="inherit"
            disabled={registrationActionLoading}
            onClick={() => setSelectedRegistrationRequest(null)}
          >
            Fermer
          </Button>
          <Button
            variant="contained"
            disabled={registrationActionLoading}
            onClick={handleApproveRegistrationRequest}
          >
            Valider et ajouter
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---- Boîte de dialogue "QR code d'inscription" ----
          Affiche le QR code à scanner (lien construit dans qrRegistrationUrl)
          et propose d'imprimer une affiche A4 (QrRegistrationPoster, caché
          plus bas) ou de copier le lien. */}
      <Dialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Box component="span">Inscription membre par QR code</Box>
          {/* Icône imprimante en haut à droite du titre : export PDF direct en
              desktop (Electron), sinon impression navigateur via ReactToPrint. */}
          {isDesktopPrint ? (
            <Tooltip title="Imprimer / PDF">
              <span>
                <IconButton color="primary" onClick={handleExportQrPosterPdf} disabled={!qrRegistrationUrl}>
                  <PrintRounded />
                </IconButton>
              </span>
            </Tooltip>
          ) : (
            <ReactToPrint
              trigger={() => (
                <Tooltip title="Imprimer / PDF">
                  <span>
                    <IconButton color="primary" disabled={!qrRegistrationUrl}>
                      <PrintRounded />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
              content={() => qrPosterRef.current}
              pageStyle={PRINT_PORTRAIT_PAGE_STYLE}
              documentTitle="affiche-inscription-qr"
            />
          )}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            
            <Typography color="text.primary"  sx={{ textAlign: 'center', fontWeight: 500, fontSize: { xs: '0.95rem', sm: '1rem' } }}>
              SCANNEZ CE QRCODE POUR VOUS ENREGISTRER. LE TELEPHONE DOIT ETRE CONNECTE SUR LE MEME RESEAU QUE LE POSTE PRINCIPAL.
            </Typography>

            <Box
              sx={{
                p: 2,
                mx: 'auto',
                width: 'fit-content',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1,
                bgcolor: 'common.white',
                border: (currentTheme) => `1px solid ${currentTheme.palette.divider}`,
              }}
            >
              {qrRegistrationUrl && <QRCodeSVG value={qrRegistrationUrl} size={280} level="M" />}
            </Box>

            <TextField
              fullWidth
              label="Lien inscription"
              value={qrRegistrationUrl}
              InputProps={{ readOnly: true }}
              helperText="Le téléphone doit être connecté au même réseau WI-FI que le poste principal."
            />

            {!currentUserId && (
              <Typography color="error" variant="body2">
                Session introuvable. Reconnectez-vous avant de partager un QR code.
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)} color="inherit">
            Fermer
          </Button>
          <Button
            variant="contained"
            startIcon={<ContentCopyRounded fontSize="small" />}
            onClick={handleCopyQrRegistrationUrl}
            disabled={!qrRegistrationUrl}
          >
            Copier le lien
          </Button>
        </DialogActions>

        {/* Composant caché : jamais affiché à l'écran, il n'existe que pour être
            capturé et transformé en PDF/impression (voir qrPosterRef ci-dessus). */}
        <Box sx={{ display: 'none' }}>
          <QrRegistrationPoster ref={qrPosterRef} churchName={registrationChurchName} qrValue={qrRegistrationUrl} />
        </Box>
      </Dialog>

      {/* ---- Boîte de dialogue "Ajouter/Modifier un membre" ----
          Le gros formulaire avec tous les champs de la fiche membre.
          dialogTitle et isEditMode déterminent si on crée ou on modifie. */}
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
                  label="Prénoms"
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
                  label="Nationalité"
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
                  value={data.baptemeEauMembre || ''}
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
              {isWaterBaptismSelected && (

                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <TextField
                    fullWidth
                    size="small"
                    margin="dense"
                    type="date"
                    variant="outlined"
                    label="Date du bapteme d'eau *"
                    InputLabelProps={{ shrink: true }}
                    helperText={errors.dateBaptemeMembre?.message || 'Date de bapteme'}
                    value={data.dateBaptemeMembre || ''}
                    {...register('dateBaptemeMembre', {
                      required: isWaterBaptismSelected ? "La date du bapteme d'eau est requise" : false,
                    })}
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

              {isWaterBaptismSelected && (

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



              {isSpiritBaptismSelected && (

                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <TextField
                    fullWidth
                    size="small"
                    margin="dense"
                    type="date"
                    variant="outlined"
                    label="Date de bapteme du Saint-Esprit *"
                    InputLabelProps={{ shrink: true }}
                    value={data.dateBaptemeSaintEspritMembre ||''}
                    {...register('dateBaptemeSaintEspritMembre', {
                      required: isSpiritBaptismSelected ? 'La date du bapteme du Saint-Esprit est requise' : false,
                    })}
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

              {isWaterBaptismSelected && (

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
            <DialogActions sx={{ flexDirection: 'row', justifyContent: { xs: 'space-between', sm: 'flex-end' }, gap: 1, px: 0, pt: 2 }}>
              <Tooltip title="Annuler">
                <IconButton
                  color="primary"
                  onClick={handleCloseDialog}
                  sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
                >
                  <Iconify icon="solar:close-circle-bold" />
                </IconButton>
              </Tooltip>
              <Button sx={{ display: { xs: 'none', sm: 'inline-flex' } }} onClick={handleCloseDialog} color="primary">Annuler</Button>

              <Tooltip title={(loading || updateLoading) ? 'Enregistrement...' : (isEditMode ? 'Modifier' : 'Enregistrer')}>
                <span>
                  <IconButton
                    color="primary"
                    type="submit"
                    disabled={loading || updateLoading}
                    sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
                  >
                    <Iconify icon={isEditMode ? 'solar:pen-bold' : 'mingcute:check-line'} />
                  </IconButton>
                </span>
              </Tooltip>
              <Button sx={{ display: { xs: 'none', sm: 'inline-flex' } }} type="submit" color="primary" disabled={loading || updateLoading}>
                {(loading || updateLoading) ? 'Enregistrement...' : (isEditMode ? 'Modifier' : 'Enregistrer')}
              </Button>

            </DialogActions>
          </form>

        </DialogContent>
      </Dialog>
      {/* Confirmation avant suppression multiple (bouton corbeille de la barre d'outils) */}
      <ConfirmDialog
        open={confirmDeleteSelectedOpen}
        title="Supprimer les membres selectionnes"
        message={`Voulez-vous vraiment supprimer ${selected.length} membre(s) selectionné(s) ?`}
        confirmText="Supprimer"
        loading={deleteLoading}
        onClose={() => setConfirmDeleteSelectedOpen(false)}
        onConfirm={async () => {
          setConfirmDeleteSelectedOpen(false);
          await handleDeleteSelected();
        }}
      />

      {/* Petites notifications ("toast") affichées via showNotification(...) */}
      <NotificationComponent />
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------
// Petit hook réutilisable qui gère le tri, la pagination et la sélection
// multiple du tableau des membres (indépendant des données elles-mêmes).
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






