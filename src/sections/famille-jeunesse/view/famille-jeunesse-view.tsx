import type { IMembre } from 'src/store/membreSlice';

import * as XLSX from 'xlsx';
import { useDispatch, useSelector } from 'react-redux';
import ReactToPrint, { useReactToPrint } from 'react-to-print';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  AddRounded,
  EditRounded,
  PrintRounded,
  GroupsRounded,
  DeleteRounded,
  SearchRounded,
  VisibilityRounded,
  FileDownloadRounded,
  DescriptionOutlined,
  KeyboardArrowDownRounded,
} from '@mui/icons-material';
import {
  Box,
  Tab,
  Menu,
  Card,
  Chip,
  Grid,
  Tabs,
  Alert,
  Stack,
  Table,
  Button,
  Dialog,
  Tooltip,
  MenuItem,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  IconButton,
  Typography,
  DialogTitle,
  Autocomplete,
  ListSubheader,
  DialogActions,
  DialogContent,
  InputAdornment,
  TableContainer,
  TablePagination,
} from '@mui/material';

import { apiClient } from 'src/utils/apiClient';
import { normalizeForSearch } from 'src/utils/text';
import { canManageModule, isDesktopAppRuntime } from 'src/utils/access-control';

import { DashboardContent } from 'src/layouts/dashboard';
import {
  familleJeunesse,
  addFamilleJeunesse,
  deleteFamilleJeunesse,
  type IFamilleJeunesse,
  setListFamilleJeunesse,
  setDataModifiesFamilleJeunesse,
} from 'src/store/familleJeunesseSlice';

import ConfirmDialog from 'src/components/alert/confirmDialog';
import { ContactPhoneLink } from 'src/components/contact-phone-link';
import { useNotificationSnackbar } from 'src/components/alert/notificationSnackbar';
import {
  PrintTable,
  PrintEmptyState,
  PrintDocumentLayout,
  getPrintableLogoUrl,
  PRINT_PORTRAIT_PAGE_STYLE,
  PRINT_LANDSCAPE_PAGE_STYLE,
} from 'src/components/print/print-document';

import { MembresFamilleDialog } from './membres-famille-dialog';
import { ProgrammeActiviteManager } from './programme-activite-manager';
import { FeuilleFamilleJeunesse } from '../etats/feuille-famille-jeunesse';
import { FicheFamilleJeunesseRenseignement } from '../ficheFamilleJeunesseRenseignement';

type MemberOption = {
  id: number;
  label: string;
  contact: string;
};

type RoleField = {
  key: keyof IFamilleJeunesse;
  label: string;
};

const roleFields: RoleField[] = [
  { key: 'conseillerFamille', label: 'Conseiller famille' },
  { key: 'nomAnimateur', label: 'Animateur' },
  { key: 'nomViceAnimateur', label: 'Vice-animateur' },
  { key: 'nomSecretaire', label: 'Secrétaire' },
  { key: 'nomSecretaireAdjoint', label: 'Secrétaire adjoint' },
  { key: 'nomTresorier', label: 'Trésorier' },
  { key: 'nomTresorierAdjoint', label: 'Trésorier adjoint' },
  { key: 'nomSecretaireOrganisation1', label: 'Secrétaire à l’organisation 1' },
  { key: 'nomSecretaireOrganisation2', label: 'Secrétaire à l’organisation 2' },
  { key: 'nomSecretaireOrganisation3', label: 'Secrétaire à l’organisation 3' },
  { key: 'nomCommissaireAuCompte', label: 'Commissaire au compte' },
  { key: 'nomCommissaireAuCompteAdjoint', label: 'Commissaire au compte adjoint' },
];

const buildMemberName = (membre: Partial<IMembre>): string =>
  `${membre.nomMembre || ''} ${membre.prenomMembre || ''}`.trim();

const toNumberOrZero = (value: unknown): number => Number(value || 0) || 0;

const cleanName = (value: unknown): string => normalizeForSearch(String(value || '').trim());

function MobileResponsibleLine({
  contact,
  label,
  name,
}: {
  contact: string;
  label: string;
  name: string;
}) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="body2" color="text.secondary">
        {label} : {name || 'Non renseigné'}
      </Typography>
      <ContactPhoneLink fallback="-" value={contact} />
    </Stack>
  );
}

export function FamilleJeunesseView() {
  const dispatch = useDispatch();
  const theme = useTheme();
  // L'impression navigateur n'a pas cours dans l'application desktop.
  const isDesktopApp = isDesktopAppRuntime();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const ficheRenseignementRef = useRef<HTMLDivElement>(null);
  const printListRef = useRef<HTMLDivElement>(null);
  const printDetailRef = useRef<HTMLDivElement>(null);
  const { showNotification, NotificationComponent } = useNotificationSnackbar();

  const familles = useSelector((state: any) => state.familleJeunesse.listFamilleJeunesse);
  const appUserConnected = useSelector((state: any) => state.application?.userConnected);
  const authUtilisateurData = useSelector((state: any) => state.authentification?.utilisateurData);
  const currentUserId =
    Number(appUserConnected?.idUtilisateurParent || appUserConnected?.idUtilisateur)
    || Number(authUtilisateurData?.idUtilisateurParent || authUtilisateurData?.idUtilisateur)
    || null;
  const canManageFamille = canManageModule(appUserConnected || authUtilisateurData, 'familleJeunesse');

  const [onglet, setOnglet] = useState(0);
  // Famille dont on gère les membres (et imprime la feuille).
  const [familleMembres, setFamilleMembres] = useState<IFamilleJeunesse | null>(null);
  const feuilleViergeRef = useRef<HTMLDivElement>(null);
  const [menuImpression, setMenuImpression] = useState<HTMLElement | null>(null);
  const [menuModeles, setMenuModeles] = useState<HTMLElement | null>(null);
  // Famille de la fiche de renseignement à imprimer : null pour la fiche vierge.
  const [familleFiche, setFamilleFiche] = useState<IFamilleJeunesse | null>(null);
  const [demandeFiche, setDemandeFiche] = useState(0);
  // Membres rattachés à chaque famille, pour la feuille remplie.
  const [liensFamilles, setLiensFamilles] = useState<any[]>([]);
  // Famille de la feuille à imprimer : null pour la feuille vierge.
  const [familleFeuille, setFamilleFeuille] = useState<IFamilleJeunesse | null>(null);
  const [demandeFeuille, setDemandeFeuille] = useState(0);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<IMembre[]>([]);
  const [filterName, setFilterName] = useState('');
  const [filterResponsable, setFilterResponsable] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [detailItem, setDetailItem] = useState<IFamilleJeunesse | null>(null);
  const [deleteItem, setDeleteItem] = useState<IFamilleJeunesse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<IFamilleJeunesse>({ ...familleJeunesse });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const memberOptions = useMemo<MemberOption[]>(
    () =>
      (Array.isArray(members) ? members : [])
        .map((membre) => ({
          id: Number(membre.idMembre || 0),
          label: buildMemberName(membre),
          contact: membre.contactMembre || '',
        }))
        .filter((item) => item.id > 0 && item.label)
        .sort((left, right) => left.label.localeCompare(right.label, 'fr', { sensitivity: 'base' })),
    [members]
  );

  const contactByMemberName = useMemo(() => {
    const contacts = new Map<string, string>();
    memberOptions.forEach((option) => {
      contacts.set(cleanName(option.label), option.contact);
    });
    return contacts;
  }, [memberOptions]);

  const getMemberContact = useCallback(
    (name: unknown): string => contactByMemberName.get(cleanName(name)) || '',
    [contactByMemberName]
  );

  const formatMemberWithContact = useCallback(
    (name: unknown): string => {
      const memberName = String(name || '').trim();
      if (!memberName) return 'Non renseigné';

      const contact = getMemberContact(memberName);
      return contact ? `${memberName} (${contact})` : memberName;
    },
    [getMemberContact]
  );

  const loadFamilles = useCallback(async () => {
    if (!currentUserId) {
      dispatch(setListFamilleJeunesse([]));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.getFamillesJeunesseByUtilisateur(currentUserId);
      dispatch(setListFamilleJeunesse(Array.isArray(response.data) ? response.data : []));
    } catch (error: any) {
      dispatch(setListFamilleJeunesse([]));
      if (error?.status !== 400) {
        showNotification(error?.message || 'Impossible de charger les familles de jeunesse.', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [currentUserId, dispatch, showNotification]);

  const loadMembers = useCallback(async () => {
    if (!currentUserId) {
      setMembers([]);
      return;
    }

    try {
      const response = await apiClient.getMembresByUtilisateur(currentUserId);
      setMembers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setMembers([]);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadFamilles();
    loadMembers();
  }, [loadFamilles, loadMembers]);

  const filteredData = useMemo(() => {
    const search = normalizeForSearch(filterName);
    const responsableSearch = normalizeForSearch(filterResponsable);

    return (Array.isArray(familles) ? familles : []).filter((item: IFamilleJeunesse) => {
      const searchable = [
        item.nomFamilleJeunesse,
        item.sloganFamille,
        ...roleFields.map((field) => String(item[field.key] || '')),
        item.nombreMembreTotal,
        item.nombreMembreActuel,
        item.remarque,
      ]
        .join(' ')
        .toLowerCase();

      if (search && !normalizeForSearch(searchable).includes(search)) {
        return false;
      }

      if (
        responsableSearch
        && !roleFields.some((field) => normalizeForSearch(String(item[field.key] || '')).includes(responsableSearch))
      ) {
        return false;
      }

      return true;
    });
  }, [familles, filterName, filterResponsable]);

  const paginatedData = useMemo(
    () => filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredData, page, rowsPerPage]
  );

  const resetForm = useCallback(() => {
    setFormData({ ...familleJeunesse, idUtilisateur: currentUserId || 0 });
  }, [currentUserId]);

  const openCreateDialog = useCallback(() => {
    resetForm();
    setOpenDialog(true);
  }, [resetForm]);

  const openEditDialog = useCallback((item: IFamilleJeunesse) => {
    if (!canManageFamille) return;
    setFormData({ ...item });
    setOpenDialog(true);
  }, [canManageFamille]);

  const closeDialog = useCallback(() => {
    setOpenDialog(false);
    resetForm();
  }, [resetForm]);

  const handleChange = (field: keyof IFamilleJeunesse, value: string | number) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = useCallback(async () => {
    if (!canManageFamille) return;

    if (!currentUserId) {
      showNotification('Session expirée : reconnectez-vous.', 'warning');
      return;
    }

    if (!String(formData.nomFamilleJeunesse || '').trim()) {
      showNotification('Le nom de la famille de jeunesse est requis.', 'warning');
      return;
    }

    if (!formData.nomAnimateur) {
      showNotification("L'animateur est requis.", 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        idUtilisateur: currentUserId,
        nombreMembreTotal: toNumberOrZero(formData.nombreMembreTotal),
        nombreMembreActuel: toNumberOrZero(formData.nombreMembreActuel),
      };

      if (formData.idFamilleJeunesse) {
        const response = await apiClient.updateFamilleJeunesse(payload);
        if (response.status === 1) {
          dispatch(setDataModifiesFamilleJeunesse(response.data || payload));
          showNotification('Famille de jeunesse modifiée avec succès.', 'success');
        }
      } else {
        const response = await apiClient.createFamilleJeunesse(payload);
        if (response.status === 1) {
          const created = Array.isArray(response.data) ? response.data[0] : response.data;
          if (created) dispatch(addFamilleJeunesse(created));
          showNotification('Famille de jeunesse créée avec succès.', 'success');
        }
      }

      closeDialog();
      await loadFamilles();
    } catch (error: any) {
      showNotification(error?.message || "Impossible d'enregistrer cette famille de jeunesse.", 'error');
    } finally {
      setSubmitting(false);
    }
  }, [canManageFamille, closeDialog, currentUserId, dispatch, formData, loadFamilles, showNotification]);

  const handleDelete = useCallback(async () => {
    if (!deleteItem || !canManageFamille) return;

    try {
      setSubmitting(true);
      const response = await apiClient.deleteFamilleJeunesse(deleteItem.idFamilleJeunesse, currentUserId);
      if (response.status === 1) {
        dispatch(deleteFamilleJeunesse(deleteItem.idFamilleJeunesse));
        showNotification('Famille de jeunesse supprimée avec succès.', 'success');
      }
      setDeleteItem(null);
    } catch (error: any) {
      showNotification(error?.message || 'Impossible de supprimer cette famille de jeunesse.', 'error');
    } finally {
      setSubmitting(false);
    }
  }, [canManageFamille, currentUserId, deleteItem, dispatch, showNotification]);

  const handleExportFamilles = useCallback(() => {
    if (typeof window === 'undefined') {
      showNotification("L'export est disponible uniquement dans le navigateur.", 'warning');
      return;
    }

    if (!filteredData.length) {
      showNotification('Aucune famille de jeunesse à exporter.', 'warning');
      return;
    }

    const rows = filteredData.map((item: IFamilleJeunesse) => ({
      'Famille de jeunesse': item.nomFamilleJeunesse || '',
      Slogan: item.sloganFamille || '',
      'Conseiller famille': formatMemberWithContact(item.conseillerFamille),
      Animateur: formatMemberWithContact(item.nomAnimateur),
      'Vice-animateur': formatMemberWithContact(item.nomViceAnimateur),
      Secrétaire: formatMemberWithContact(item.nomSecretaire),
      'Secrétaire adjoint': formatMemberWithContact(item.nomSecretaireAdjoint),
      Trésorier: formatMemberWithContact(item.nomTresorier),
      'Trésorier adjoint': formatMemberWithContact(item.nomTresorierAdjoint),
      "Secrétaire à l'organisation 1": formatMemberWithContact(item.nomSecretaireOrganisation1),
      "Secrétaire à l'organisation 2": formatMemberWithContact(item.nomSecretaireOrganisation2),
      "Secrétaire à l'organisation 3": formatMemberWithContact(item.nomSecretaireOrganisation3),
      'Commissaire au compte': formatMemberWithContact(item.nomCommissaireAuCompte),
      'Commissaire au compte adjoint': formatMemberWithContact(item.nomCommissaireAuCompteAdjoint),
      'Nombre total': item.nombreMembreTotal || 0,
      'Nombre actuel': item.nombreMembreActuel || 0,
      Remarque: item.remarque || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Familles jeunesse');
    XLSX.writeFile(workbook, 'familles-de-jeunesse.xlsx');
    showNotification(`${rows.length} famille(s) exportée(s).`, 'success');
  }, [filteredData, formatMemberWithContact, showNotification]);


  const chargerLiensFamilles = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const reponse = await apiClient.getMembresFamillesJeunesse(currentUserId);
      setLiensFamilles(Array.isArray(reponse?.data) ? reponse.data : []);
    } catch {
      setLiensFamilles([]);
    }
  }, [currentUserId]);

  useEffect(() => {
    chargerLiensFamilles();
  }, [chargerLiensFamilles]);

  const membresDeLaFamille = (famille: IFamilleJeunesse) =>
    liensFamilles.filter((lien) => Number(lien.idFamilleJeunesse) === Number(famille.idFamilleJeunesse));

  const imprimerListe = useReactToPrint({
    content: () => printListRef.current,
    pageStyle: PRINT_LANDSCAPE_PAGE_STYLE,
    documentTitle: 'familles-de-jeunesse',
  });
  const imprimerFiche = useReactToPrint({
    content: () => ficheRenseignementRef.current,
    pageStyle: PRINT_PORTRAIT_PAGE_STYLE,
    documentTitle: familleFiche
      ? `fiche-famille-${familleFiche.nomFamilleJeunesse}`
      : 'fiche-renseignement-famille-jeunesse',
  });
  // États remplis : une page par famille affichée (la recherche réduit la liste).
  const fichesRempliesRef = useRef<HTMLDivElement>(null);
  const feuillesRempliesRef = useRef<HTMLDivElement>(null);
  const imprimerFichesRemplies = useReactToPrint({
    content: () => fichesRempliesRef.current,
    pageStyle: PRINT_PORTRAIT_PAGE_STYLE,
    documentTitle: 'fiches-renseignement-familles-jeunesse',
  });
  const imprimerFeuillesRemplies = useReactToPrint({
    content: () => feuillesRempliesRef.current,
    pageStyle: PRINT_LANDSCAPE_PAGE_STYLE,
    documentTitle: 'feuilles-membres-familles-jeunesse',
  });

  const imprimerFeuille = useReactToPrint({
    content: () => feuilleViergeRef.current,
    pageStyle: PRINT_LANDSCAPE_PAGE_STYLE,
    documentTitle: familleFeuille ? `famille-${familleFeuille.nomFamilleJeunesse}` : 'feuille-famille-jeunesse',
  });

  // La feuille doit être redessinée avec la famille choisie AVANT l'impression :
  // on pose la famille, puis on imprime au rendu suivant.
  const demanderFeuille = (famille: IFamilleJeunesse | null) => {
    setMenuImpression(null);
    setMenuModeles(null);
    setFamilleFeuille(famille);
    setDemandeFeuille((n) => n + 1);
  };

  const demanderFiche = (famille: IFamilleJeunesse | null) => {
    setMenuImpression(null);
    setMenuModeles(null);
    setFamilleFiche(famille);
    setDemandeFiche((n) => n + 1);
  };

  useEffect(() => {
    if (demandeFiche > 0) imprimerFiche();
    // Seul le compteur déclenche l'impression.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demandeFiche]);

  useEffect(() => {
    if (demandeFeuille > 0) imprimerFeuille();
    // Seul le compteur déclenche l'impression.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demandeFeuille]);

  return (
    <DashboardContent>
      <NotificationComponent />

      {/* Deux volets : l'organisation des familles, et le programme d'activités
          de la jeunesse sur une période. */}
      <Tabs value={onglet} onChange={(_, valeur) => setOnglet(valeur)} sx={{ mb: 3 }}>
        <Tab label="Familles" />
        <Tab label="Programme d'activités" />
      </Tabs>

      {onglet === 1 && (
        <ProgrammeActiviteManager
          idUtilisateur={Number(currentUserId) || 0}
          membres={members}
          modifiable={!isDesktopApp}
          onNotifier={showNotification}
        />
      )}

      {onglet === 0 && (
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
          <Box>
            <Typography variant="h4" flexGrow={1}>Famille de jeunesse</Typography>

          </Box>

          <Stack
            direction="row"
            spacing={1.25}
            alignItems="center"
            sx={{
              width: { xs: '100%', md: 'auto' },
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
              flexWrap: 'wrap',
            }}
          >
            {/* Deux boutons : « Imprimer » sort les états remplis avec les données de
                l'application, « Modèles vierges » les mêmes feuilles à remplir à la main. */}
            {!isDesktopApp && (
              <>
                <Tooltip title="Imprimer">
                  <IconButton
                    color="primary"
                    onClick={(event) => setMenuImpression(event.currentTarget)}
                    sx={{ display: { xs: 'inline-flex', sm: 'none' }, border: 1, borderColor: 'divider', borderRadius: 1 }}
                  >
                    <PrintRounded />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<PrintRounded />}
                  endIcon={<KeyboardArrowDownRounded />}
                  onClick={(event) => setMenuImpression(event.currentTarget)}
                  sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                >
                  Imprimer
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<DescriptionOutlined />}
                  endIcon={<KeyboardArrowDownRounded />}
                  onClick={(event) => setMenuModeles(event.currentTarget)}
                >
                  Modèles vierges
                </Button>

                <Menu
                  anchorEl={menuImpression}
                  open={Boolean(menuImpression)}
                  onClose={() => setMenuImpression(null)}
                >
                  <MenuItem
                    onClick={() => {
                      setMenuImpression(null);
                      imprimerListe();
                    }}
                  >
                    Liste des familles
                  </MenuItem>
                  <MenuItem
                    disabled={!filteredData.length}
                    onClick={() => {
                      setMenuImpression(null);
                      imprimerFichesRemplies();
                    }}
                  >
                    Fiche de renseignement
                  </MenuItem>
                  <MenuItem
                    disabled={!filteredData.length}
                    onClick={() => {
                      setMenuImpression(null);
                      imprimerFeuillesRemplies();
                    }}
                  >
                    Feuille des membres
                  </MenuItem>
                  <ListSubheader sx={{ lineHeight: 1.6, py: 1, fontSize: 12, maxWidth: 300, whiteSpace: 'normal' }}>
                    {filteredData.length
                      ? `Une page par famille affichée (${filteredData.length}). Pour une seule famille, recherchez-la d'abord.`
                      : "Aucune famille à imprimer : ajoutez-en une, ou utilisez les modèles vierges."}
                  </ListSubheader>
                </Menu>

                <Menu anchorEl={menuModeles} open={Boolean(menuModeles)} onClose={() => setMenuModeles(null)}>
                  <MenuItem onClick={() => demanderFiche(null)}>Fiche de renseignement (vierge)</MenuItem>
                  <MenuItem onClick={() => demanderFeuille(null)}>Feuille des membres (vierge)</MenuItem>
                </Menu>
              </>
            )}
            <Tooltip title="Exporter vers Excel">
              <span>
                <IconButton
                  color="primary"
                  onClick={handleExportFamilles}
                  disabled={loading || !filteredData.length}
                  sx={{ display: { xs: 'inline-flex', sm: 'none' }, border: 1, borderColor: 'divider', borderRadius: 1 }}
                >
                  <FileDownloadRounded />
                </IconButton>
              </span>
            </Tooltip>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<FileDownloadRounded />}
              onClick={handleExportFamilles}
              disabled={loading || !filteredData.length}
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              Exporter Excel
            </Button>
            {canManageFamille && (
              <>
                <Tooltip title="Ajouter">
                  <IconButton
                    color="primary"
                    onClick={openCreateDialog}
                    sx={{ display: { xs: 'inline-flex', sm: 'none' }, bgcolor: 'action.selected', borderRadius: 1 }}
                  >
                    <AddRounded />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  color="inherit"
                  startIcon={<AddRounded />}
                  onClick={openCreateDialog}
                  sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                >
                  Ajouter
                </Button>
              </>
            )}
          </Stack>
        </Stack>

        <Card sx={{ p: 2.5, borderRadius: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                value={filterName}
                placeholder="Rechercher une famille, un responsable, une remarque..."
                onChange={(event) => {
                  setFilterName(event.target.value);
                  setPage(0);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={memberOptions}
                value={memberOptions.find((option) => option.label === filterResponsable) || null}
                onChange={(_, value) => {
                  setFilterResponsable(value?.label || '');
                  setPage(0);
                }}
                getOptionLabel={(option) => option.label}
                renderInput={(params) => <TextField {...params} label="Filtrer par responsable" />}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Chip
                label={`${filteredData.length} résultat(s)`}
                color="primary"
                variant="outlined"
                sx={{ width: 1, height: 40 }}
              />
            </Grid>
          </Grid>
        </Card>

        {isMobile ? (
          <Stack spacing={2}>
            {paginatedData.map((item) => (
              <Card key={item.idFamilleJeunesse} sx={{ p: 2.25, borderRadius: 3 }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" spacing={1}>
                    <Box>
                      <Typography variant="subtitle1">
                        {item.nomFamilleJeunesse || 'Famille de jeunesse'}
                      </Typography>
                      <MobileResponsibleLine
                        label="Conseiller"
                        name={item.conseillerFamille}
                        contact={getMemberContact(item.conseillerFamille)}
                      />
                      <MobileResponsibleLine
                        label="Animateur"
                        name={item.nomAnimateur}
                        contact={getMemberContact(item.nomAnimateur)}
                      />
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" onClick={() => setDetailItem(item)}>
                        <VisibilityRounded fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => setFamilleMembres(item)}>
                        <GroupsRounded fontSize="small" />
                      </IconButton>
                      {canManageFamille && (
                        <>
                          <IconButton size="small" color="primary" onClick={() => openEditDialog(item)}>
                            <EditRounded fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => setDeleteItem(item)}>
                            <DeleteRounded fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </Stack>
                  </Stack>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip size="small" label={`Actuels : ${item.nombreMembreActuel || 0}`} />
                    <Chip size="small" label={`Total : ${item.nombreMembreTotal || 0}`} />
                  </Stack>
                  <MobileResponsibleLine
                    label="Secrétaire"
                    name={item.nomSecretaire}
                    contact={getMemberContact(item.nomSecretaire)}
                  />
                  <MobileResponsibleLine
                    label="Trésorier"
                    name={item.nomTresorier}
                    contact={getMemberContact(item.nomTresorier)}
                  />
                  {item.sloganFamille && (
                    <Typography variant="body2" color="text.secondary">
                      Slogan : {item.sloganFamille}
                    </Typography>
                  )}
                </Stack>
              </Card>
            ))}
          </Stack>
        ) : (
          <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <TableContainer>
              <Table
                sx={{
                  tableLayout: 'fixed',
                  '& .MuiTableCell-root': {
                    py: 2,
                    px: 2,
                    verticalAlign: 'top',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                  },
                  '& .MuiTableHead-root .MuiTableCell-root': {
                    verticalAlign: 'middle',
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: '11%' }}>Famille</TableCell>
                    <TableCell sx={{ width: '15%' }}>Conseiller</TableCell>
                    <TableCell sx={{ width: '16%' }}>Animateur</TableCell>
                    <TableCell sx={{ width: '16%' }}>Vice-animateur</TableCell>
                    <TableCell sx={{ width: '13%' }}>Secrétaire</TableCell>
                    <TableCell sx={{ width: '13%' }}>Trésorier</TableCell>
                    <TableCell align="center" sx={{ width: 96 }}>Membres actuels</TableCell>
                    <TableCell align="center" sx={{ width: 72 }}>Total</TableCell>
                    <TableCell align="center" sx={{ width: 116 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.map((item) => (
                    <TableRow key={item.idFamilleJeunesse} hover>
                      <TableCell>
                        <Stack spacing={0.25}>
                          <Typography variant="subtitle2">{item.nomFamilleJeunesse || 'Non renseigné'}</Typography>
                          {item.sloganFamille && (
                            <Typography variant="caption" color="text.secondary">
                              {item.sloganFamille}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ lineHeight: 1.45 }}>
                          {formatMemberWithContact(item.conseillerFamille)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{lineHeight: 1.45 }}>
                          {formatMemberWithContact(item.nomAnimateur)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ lineHeight: 1.45 }}>
                          {formatMemberWithContact(item.nomViceAnimateur)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{lineHeight: 1.45 }}>
                          {formatMemberWithContact(item.nomSecretaire)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ lineHeight: 1.45 }}>
                          {formatMemberWithContact(item.nomTresorier)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{item.nombreMembreActuel || 0}</TableCell>
                      <TableCell align="center">{item.nombreMembreTotal || 0}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center" flexWrap="nowrap">
                          <Tooltip title="Détail">
                            <IconButton size="small" onClick={() => setDetailItem(item)}>
                              <VisibilityRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Membres de la famille">
                            <IconButton size="small" onClick={() => setFamilleMembres(item)}>
                              <GroupsRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {canManageFamille && (
                            <>
                              <Tooltip title="Modifier">
                                <IconButton size="small" color="primary" onClick={() => openEditDialog(item)}>
                                  <EditRounded fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Supprimer">
                                <IconButton size="small" color="error" onClick={() => setDeleteItem(item)}>
                                  <DeleteRounded fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              page={page}
              count={filteredData.length}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              onPageChange={(_, nextPage) => setPage(nextPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
            />
          </Card>
        )}

      </Stack>
      )}

      <Dialog open={openDialog} onClose={closeDialog} fullScreen={isMobile} fullWidth maxWidth="md">
        <DialogTitle>{formData.idFamilleJeunesse ? 'Modifier une famille de jeunesse' : 'Ajouter une famille de jeunesse'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Alert severity="info">
              Les responsables doivent être choisis parmi les membres déjà enregistrés. Aucune saisie libre n’est autorisée.
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Nom de la famille de jeunesse"
                  value={formData.nomFamilleJeunesse}
                  onChange={(event) => handleChange('nomFamilleJeunesse', event.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Slogan de la famille"
                  value={formData.sloganFamille}
                  onChange={(event) => handleChange('sloganFamille', event.target.value)}
                />
              </Grid>
              {roleFields.map((field) => (
                <Grid key={field.key} item xs={12} md={6}>
                  <Autocomplete
                    options={memberOptions}
                    value={memberOptions.find((option) => option.label === formData[field.key]) || null}
                    onChange={(_, value) => handleChange(field.key, value?.label || '')}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Box>
                          <Typography variant="body2">{option.label}</Typography>
                          {option.contact && <Typography variant="caption" color="text.secondary">{option.contact}</Typography>}
                        </Box>
                      </Box>
                    )}
                    renderInput={(params) => (
                      <TextField {...params} label={field.key === 'nomAnimateur' ? `${field.label} *` : field.label} />
                    )}
                  />
                </Grid>
              ))}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Nombre total de membres"
                  value={formData.nombreMembreTotal}
                  onChange={(event) => handleChange('nombreMembreTotal', event.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Nombre actuel de membres"
                  value={formData.nombreMembreActuel}
                  onChange={(event) => handleChange('nombreMembreActuel', event.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  label="Remarque"
                  value={formData.remarque}
                  onChange={(event) => handleChange('remarque', event.target.value)}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Annuler</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(detailItem)} onClose={() => setDetailItem(null)} fullWidth maxWidth="md">
        <DialogTitle>Détail famille de jeunesse</DialogTitle>
        <DialogContent dividers>
          {detailItem && (
            <Box ref={printDetailRef}>
              <PrintableFamilleJeunesse
                title="Fiche famille de jeunesse"
                items={[detailItem]}
                contactByMemberName={contactByMemberName}
                variant="detail"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <ReactToPrint
            documentTitle="fiche-famille-jeunesse"
            pageStyle={PRINT_PORTRAIT_PAGE_STYLE}
            trigger={() => (
              <Button startIcon={<PrintRounded />}>
                Imprimer
              </Button>
            )}
            content={() => printDetailRef.current}
          />
          <Button onClick={() => setDetailItem(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ display: 'none' }}>
        <Box ref={printListRef}>
          <PrintableFamilleJeunesse
            title="Liste des familles de jeunesse"
            items={filteredData}
            contactByMemberName={contactByMemberName}
            variant="list"
          />
        </Box>
        <Box ref={ficheRenseignementRef}>
          <FicheFamilleJeunesseRenseignement
            famille={familleFiche}
            nombreMembresRattaches={familleFiche ? membresDeLaFamille(familleFiche).length : undefined}
            contactDe={(nom) => getMemberContact(nom)}
          />
        </Box>
        <Box ref={fichesRempliesRef}>
          {filteredData.map((famille: IFamilleJeunesse, index: number) => (
            <Box
              key={famille.idFamilleJeunesse}
              sx={{ breakAfter: index < filteredData.length - 1 ? 'page' : 'auto' }}
            >
              <FicheFamilleJeunesseRenseignement
                famille={famille}
                nombreMembresRattaches={membresDeLaFamille(famille).length}
                contactDe={(nom) => getMemberContact(nom)}
              />
            </Box>
          ))}
        </Box>
        <Box ref={feuillesRempliesRef}>
          {filteredData.map((famille: IFamilleJeunesse, index: number) => (
            <Box
              key={famille.idFamilleJeunesse}
              sx={{ breakAfter: index < filteredData.length - 1 ? 'page' : 'auto' }}
            >
              <FeuilleFamilleJeunesse
                nomEglise={String(
                  appUserConnected?.nomTemple || authUtilisateurData?.nomTemple || appUserConnected?.nomEgliseCourt || ''
                )}
                logoUrl={getPrintableLogoUrl({ ...(authUtilisateurData || {}), ...(appUserConnected || {}) })}
                nomFamille={famille.nomFamilleJeunesse}
                membres={membresDeLaFamille(famille)}
              />
            </Box>
          ))}
        </Box>
        <FeuilleFamilleJeunesse
          ref={feuilleViergeRef}
          nomFamille={familleFeuille?.nomFamilleJeunesse || ''}
          membres={familleFeuille ? membresDeLaFamille(familleFeuille) : []}
          nomEglise={String(
            appUserConnected?.nomTemple || authUtilisateurData?.nomTemple || appUserConnected?.nomEgliseCourt || ''
          )}
          logoUrl={getPrintableLogoUrl({ ...(authUtilisateurData || {}), ...(appUserConnected || {}) })}
        />
      </Box>

      <MembresFamilleDialog
        famille={familleMembres}
        familles={Array.isArray(familles) ? familles : []}
        membresEglise={members}
        idUtilisateur={Number(currentUserId) || 0}
        modifiable={canManageFamille}
        imprimable={!isDesktopApp}
        onClose={() => {
          setFamilleMembres(null);
          chargerLiensFamilles();
        }}
        onNotifier={showNotification}
      />

      <ConfirmDialog
        open={Boolean(deleteItem)}
        title="Supprimer cette famille de jeunesse"
        message="Cette action supprimera l’organisation enregistrée pour cette famille de jeunesse."
        confirmText="Supprimer"
        loading={submitting}
        onConfirm={handleDelete}
        onClose={() => setDeleteItem(null)}
      />
    </DashboardContent>
  );
}

function PrintableFamilleJeunesse({
  title,
  items,
  contactByMemberName,
  variant,
}: {
  title: string;
  items: IFamilleJeunesse[];
  contactByMemberName: Map<string, string>;
  variant: 'list' | 'detail';
}) {
  const getPrintableContact = (name: unknown): string => contactByMemberName.get(cleanName(name)) || '';
  const printableName = (name: unknown): string => {
    const memberName = String(name || '').trim();
    if (!memberName) return 'Non renseigné';
    const contact = getPrintableContact(memberName);
    return contact ? `${memberName} (${contact})` : memberName;
  };
  return (
    <PrintDocumentLayout
      title={title}
      showPagination
    >
      {!items.length && (
        <PrintEmptyState
          title="Aucune famille de jeunesse"
          message="Aucune famille de jeunesse n'est encore enregistrée dans la base locale."
        />
      )}

      {variant === 'list' && items.length > 0 && (
        <PrintTable minWidth={1120}>
          <TableHead>
            <TableRow>
              <TableCell>Famille</TableCell>
              <TableCell>Conseiller</TableCell>
              <TableCell>Animateur</TableCell>
              <TableCell>Vice-animateur</TableCell>
              <TableCell>Secrétaire</TableCell>
              <TableCell>Trésorier</TableCell>
              <TableCell align="center">Actuels</TableCell>
              <TableCell align="center">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.idFamilleJeunesse}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {item.nomFamilleJeunesse || 'Non renseigné'}
                  </Typography>
                  {item.sloganFamille && (
                    <Typography variant="caption" sx={{ color: '#667085' }}>
                      {item.sloganFamille}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{printableName(item.conseillerFamille)}</TableCell>
                <TableCell>{printableName(item.nomAnimateur)}</TableCell>
                <TableCell>{printableName(item.nomViceAnimateur)}</TableCell>
                <TableCell>{printableName(item.nomSecretaire)}</TableCell>
                <TableCell>{printableName(item.nomTresorier)}</TableCell>
                <TableCell align="center">{item.nombreMembreActuel || 0}</TableCell>
                <TableCell align="center">{item.nombreMembreTotal || 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </PrintTable>
      )}

      {variant === 'detail' && items.length > 0 && (
      <Stack spacing={3}>
        {items.map((item) => (
          <Box
            key={item.idFamilleJeunesse}
            sx={{
              p: 2,
              border: '1px solid #d0d5dd',
              borderRadius: 2,
              breakInside: 'avoid',
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5 }}>
              {item.nomFamilleJeunesse || 'Famille de jeunesse'}
            </Typography>
            {item.sloganFamille && (
              <Typography variant="body2" sx={{ color: '#667085', mb: 2 }}>
                {item.sloganFamille}
              </Typography>
            )}
            <Grid container spacing={1.5}>
              {roleFields.map((field) => (
                <Grid key={field.key} item xs={6}>
                  <Typography variant="caption" sx={{ color: '#667085', fontWeight: 700 }}>
                    {field.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {String(item[field.key] || 'Non renseigné')}
                  </Typography>
                  {getPrintableContact(item[field.key]) && (
                    <Typography variant="caption" sx={{ color: '#667085' }}>
                      {getPrintableContact(item[field.key])}
                    </Typography>
                  )}
                </Grid>
              ))}
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: '#667085', fontWeight: 700 }}>Nombre total</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>{item.nombreMembreTotal || 0}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: '#667085', fontWeight: 700 }}>Nombre actuel</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>{item.nombreMembreActuel || 0}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: '#667085', fontWeight: 700 }}>Remarque</Typography>
                <Typography variant="body2">{item.remarque || 'Aucune remarque'}</Typography>
              </Grid>
            </Grid>
          </Box>
        ))}
      </Stack>
      )}
    </PrintDocumentLayout>
  );
}

export default FamilleJeunesseView;
