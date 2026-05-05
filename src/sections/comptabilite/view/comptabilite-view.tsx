import { useDispatch, useSelector } from 'react-redux';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  AddRounded,
  EditRounded,
  DeleteRounded,
  RestoreRounded,
  ArrowUpwardRounded,
  ReceiptLongRounded,
  ArrowDownwardRounded,
  DeleteForeverRounded,
  AccountBalanceWalletRounded,
} from '@mui/icons-material';
import {
  Box,
  Card,
  Chip,
  Grid,
  alpha,
  Stack,
  Table,
  Button,
  Dialog,
  MenuItem,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  IconButton,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { apiClient } from 'src/utils/apiClient';
import { subscribeToCommunauteEvent } from 'src/utils/socket-client';

import { DashboardContent } from 'src/layouts/dashboard';
import {
  removeComptabilite,
  upsertComptabilite,
  setListComptabilite,
  type ComptabiliteType,
  setLoadingComptabilite,
  type IComptabiliteItem,
} from 'src/store/comptabiliteSlice';

import ConfirmDialog from 'src/components/alert/confirmDialog';
import { useNotificationSnackbar } from 'src/components/alert/notificationSnackbar';

import { PrintEtatComptabilite } from 'src/sections/comptabilite/etats';

const formatDateForStorage = (value?: string | null): string => {
  const normalized = String(value || '').trim();
  if (!normalized) {
    return new Date().toISOString().slice(0, 10);
  }

  const slashMatch = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    return `${year}-${month}-${day}`;
  }

  const isoMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return normalized;
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return parsed.toISOString().slice(0, 10);
};

const formatDateForDisplay = (value?: string | null): string => {
  const normalized = String(value || '').trim();
  if (!normalized) {
    return '';
  }

  const slashMatch = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slashMatch) {
    return normalized;
  }

  const isoMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day}/${month}/${year}`;
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return normalized;
  }

  return parsed.toLocaleDateString('fr-FR');
};

const emptyComptabilite: IComptabiliteItem = {
  idUtilisateur: null,
  nomComptabilite: '',
  entreeComptabilite: 0,
  sortieComptabilite: 0,
  montantComptabilite: 0,
  typeComptabilite: 'entree',
  dateComptabilite: formatDateForDisplay(new Date().toISOString().slice(0, 10)),
  observationComptabilite: '',
};

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'XOF',
  maximumFractionDigits: 0,
});

const primaryActionButtonSx = {
  minWidth: 'auto',
  px: 1.75,
  height: 42,
  borderRadius: 2,
  bgcolor: 'grey.900',
  color: 'common.white',
  '&:hover': {
    bgcolor: 'grey.800',
  },
};

const parseNumber = (value: string | number) => {
  const normalized = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  return Number.isFinite(normalized) ? normalized : 0;
};

const normalizeComptabilite = (item: any): IComptabiliteItem => {
  const entreeComptabilite = parseNumber(item?.entreeComptabilite);
  const sortieComptabilite = parseNumber(item?.sortieComptabilite);
  const typeComptabilite: ComptabiliteType = entreeComptabilite > 0 ? 'entree' : 'sortie';
  const montantComptabilite = typeComptabilite === 'entree' ? entreeComptabilite : sortieComptabilite;

  return {
    idComptabilite: Number(item?.idComptabilite) || undefined,
    idUtilisateur: Number(item?.idUtilisateur) || null,
    nomComptabilite: String(item?.nomComptabilite || ''),
    entreeComptabilite,
    sortieComptabilite,
    montantComptabilite,
    typeComptabilite,
    dateComptabilite: formatDateForDisplay(String(item?.dateComptabilite || '').slice(0, 10)),
    observationComptabilite: String(item?.observationComptabilite || ''),
    estSupprimeComptabilite: Number(item?.estSupprimeComptabilite || 0),
    dateSuppressionComptabilite: item?.dateSuppressionComptabilite
      ? formatDateForDisplay(String(item.dateSuppressionComptabilite).slice(0, 10))
      : '',
    motifSuppressionComptabilite: String(item?.motifSuppressionComptabilite || ''),
    supprimeParUtilisateur: Number(item?.supprimeParUtilisateur || 0) || null,
    nomUtilisateurSuppression: String(item?.nomUtilisateurSuppression || ''),
  };
};

const buildPayload = (item: IComptabiliteItem, idUtilisateur: number) => {
  const montant = parseNumber(item.montantComptabilite);
  const isEntree = item.typeComptabilite === 'entree';

  return {
    idComptabilite: item.idComptabilite,
    idUtilisateur,
    nomComptabilite: item.nomComptabilite,
    entreeComptabilite: isEntree ? montant : 0,
    sortieComptabilite: isEntree ? 0 : montant,
    dateComptabilite: formatDateForStorage(item.dateComptabilite),
    observationComptabilite: item.observationComptabilite,
  };
};

export function ComptabiliteView() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { listComptabilite, loadingComptabilite } = useSelector((state: any) => state.comptabilite);
  const desktopSecurityIsSuperAdmin = useSelector((state: any) => state.application?.desktopSecurityIsSuperAdmin);
  const appUserConnected = useSelector((state: any) => state.application?.userConnected);
  const authUtilisateurData = useSelector((state: any) => state.authentification?.utilisateurData);
  const currentUserId =
    Number(appUserConnected?.idUtilisateurParent || appUserConnected?.idUtilisateur)
    || Number(authUtilisateurData?.idUtilisateurParent || authUtilisateurData?.idUtilisateur)
    || null;
  const currentUsername = String(appUserConnected?.nomUtilisateur || authUtilisateurData?.nomUtilisateur || '');

  const {
    showNotification,
    NotificationComponent,
  } = useNotificationSnackbar();
  const showNotificationRef = useRef(showNotification);

  useEffect(() => {
    showNotificationRef.current = showNotification;
  }, [showNotification]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<IComptabiliteItem>(emptyComptabilite);
  const [itemToDelete, setItemToDelete] = useState<IComptabiliteItem | null>(null);
  const [itemToRestore, setItemToRestore] = useState<IComptabiliteItem | null>(null);
  const [itemToDeletePermanently, setItemToDeletePermanently] = useState<IComptabiliteItem | null>(null);
  const [deletedItems, setDeletedItems] = useState<IComptabiliteItem[]>([]);
  const [loadingDeletedComptabilite, setLoadingDeletedComptabilite] = useState(false);
  const [filterType, setFilterType] = useState<'all' | ComptabiliteType>('all');
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComptabilite = useCallback(async () => {
    if (!currentUserId) {
      dispatch(setListComptabilite([]));
      return;
    }

    dispatch(setLoadingComptabilite(true));
    try {
      const response = await apiClient.getComptabilitesByUtilisateur(currentUserId);
      const data = Array.isArray(response?.data) ? response.data.map(normalizeComptabilite) : [];
      dispatch(setListComptabilite(data));
    } catch (error: any) {
      showNotificationRef.current(error?.message || 'Impossible de charger la comptabilite', 'error');
    } finally {
      dispatch(setLoadingComptabilite(false));
    }
  }, [currentUserId, dispatch]);

  const fetchDeletedComptabilite = useCallback(async () => {
    if (!currentUserId || !desktopSecurityIsSuperAdmin) {
      setDeletedItems([]);
      return;
    }

    setLoadingDeletedComptabilite(true);
    try {
      const response = await apiClient.getComptabilitesSupprimeesByUtilisateur(currentUserId);
      const data = Array.isArray(response?.data) ? response.data.map(normalizeComptabilite) : [];
      setDeletedItems(data);
    } catch (error: any) {
      showNotificationRef.current(error?.message || 'Impossible de charger les ecritures supprimees', 'error');
    } finally {
      setLoadingDeletedComptabilite(false);
    }
  }, [currentUserId, desktopSecurityIsSuperAdmin]);

  useEffect(() => {
    fetchComptabilite();
  }, [fetchComptabilite]);

  useEffect(() => {
    fetchDeletedComptabilite();
  }, [fetchDeletedComptabilite]);

  useEffect(() => {
    if (!currentUserId) {
      return undefined;
    }

    const refreshActiveOnly = () => {
      fetchComptabilite();
    };

    const refreshAll = () => {
      fetchComptabilite();
      if (desktopSecurityIsSuperAdmin) {
        fetchDeletedComptabilite();
      }
    };

    const unsubscribers = [
      subscribeToCommunauteEvent('ajouterComptabilite', (payload) => {
        if (Number(payload?.idUtilisateur) !== currentUserId) {
          return;
        }
        refreshActiveOnly();
        showNotificationRef.current('Une nouvelle ecriture a ete synchronisee.', 'info');
      }),
      subscribeToCommunauteEvent('modifierComptabilite', (payload) => {
        if (Number(payload?.idUtilisateur) !== currentUserId) {
          return;
        }
        refreshActiveOnly();
        showNotificationRef.current('Une ecriture comptable a ete mise a jour.', 'info');
      }),
      subscribeToCommunauteEvent('supprimerComptabilite', (payload) => {
        if (Number(payload?.idUtilisateur) !== currentUserId) {
          return;
        }
        refreshAll();
        showNotificationRef.current('Une ecriture a ete archivee.', 'info');
      }),
      subscribeToCommunauteEvent('restaurerComptabilite', (payload) => {
        if (Number(payload?.idUtilisateur) !== currentUserId) {
          return;
        }
        refreshAll();
        showNotificationRef.current('Une ecriture archivee a ete restauree.', 'info');
      }),
      subscribeToCommunauteEvent('supprimerComptabiliteDefinitivement', (payload) => {
        if (Number(payload?.idUtilisateur) !== currentUserId) {
          return;
        }
        refreshAll();
        showNotificationRef.current('Une ecriture archivee a ete supprimee definitivement.', 'info');
      }),
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [currentUserId, desktopSecurityIsSuperAdmin, fetchComptabilite, fetchDeletedComptabilite]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return listComptabilite.filter((item: IComptabiliteItem) => {
      const matchesSearch = !query
        || item.nomComptabilite.toLowerCase().includes(query)
        || item.observationComptabilite.toLowerCase().includes(query)
        || item.dateComptabilite.toLowerCase().includes(query);

      const matchesType = filterType === 'all' || item.typeComptabilite === filterType;

      return matchesSearch && matchesType;
    });
  }, [filterType, listComptabilite, search]);

  const activeFilterLabel = filterType === 'all' ? 'Toutes les ecritures' : filterType === 'entree' ? 'Entrees seulement' : 'Sorties seulement';

  const totals = useMemo(() => {
    const entree = filteredItems.reduce((sum: number, item: IComptabiliteItem) => sum + parseNumber(item.entreeComptabilite), 0);
    const sortie = filteredItems.reduce((sum: number, item: IComptabiliteItem) => sum + parseNumber(item.sortieComptabilite), 0);
    return {
      entree,
      sortie,
      solde: entree - sortie,
    };
  }, [filteredItems]);

  const openCreateDialog = () => {
    setCurrentItem({ ...emptyComptabilite, idUtilisateur: currentUserId });
    setDialogOpen(true);
  };

  const openEditDialog = (item: IComptabiliteItem) => {
    setCurrentItem({ ...item });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentItem({ ...emptyComptabilite, idUtilisateur: currentUserId });
  };

  const handleChange = (field: keyof IComptabiliteItem, value: string) => {
    setCurrentItem((prev) => ({
      ...prev,
      [field]: field === 'montantComptabilite' || field === 'entreeComptabilite' || field === 'sortieComptabilite'
        ? parseNumber(value)
        : value,
    }));
  };

  const handleSubmit = async () => {
    if (!currentUserId) {
      showNotificationRef.current('Utilisateur non trouve', 'warning');
      return;
    }

    if (!currentItem.nomComptabilite.trim()) {
      showNotificationRef.current('Le libelle est obligatoire', 'warning');
      return;
    }

    if (!currentItem.dateComptabilite.trim()) {
      showNotificationRef.current('La date est obligatoire', 'warning');
      return;
    }

    const payload = buildPayload(currentItem, currentUserId);
    if (parseNumber(currentItem.montantComptabilite) <= 0) {
      showNotificationRef.current(currentItem.typeComptabilite === 'entree' ? 'Renseigne le montant de l\'entree' : 'Renseigne le montant de la sortie', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const response = currentItem.idComptabilite
        ? await apiClient.updateComptabilite(payload)
        : await apiClient.createComptabilite(payload);

      const normalized = normalizeComptabilite(Array.isArray(response?.data) ? response.data[0] : response?.data);
      dispatch(upsertComptabilite(normalized));
      showNotificationRef.current(currentItem.idComptabilite ? 'Ecriture mise a jour' : 'Ecriture enregistree', 'success');
      handleCloseDialog();
      fetchComptabilite();
    } catch (error: any) {
      showNotificationRef.current(error?.message || 'Impossible d\'enregistrer cette ecriture', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const askDelete = (item: IComptabiliteItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete?.idComptabilite) return;

    try {
      await apiClient.deleteComptabilite(
        itemToDelete.idComptabilite,
        itemToDelete.idUtilisateur || currentUserId || undefined,
        'Archivee depuis la comptabilite'
      );
      dispatch(removeComptabilite(itemToDelete.idComptabilite));
      showNotificationRef.current('Ecriture archivee. Elle reste consultable par le superadmin.', 'success');
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchComptabilite();
      if (desktopSecurityIsSuperAdmin) {
        fetchDeletedComptabilite();
      }
    } catch (error: any) {
      showNotificationRef.current(error?.message || 'Impossible d\'archiver cette ecriture', 'error');
    }
  };

  const handleRestore = async () => {
    if (!itemToRestore?.idComptabilite) return;

    try {
      await apiClient.restoreComptabilite(itemToRestore.idComptabilite);
      showNotificationRef.current('Ecriture restauree avec succes.', 'success');
      setRestoreDialogOpen(false);
      setItemToRestore(null);
      fetchComptabilite();
      fetchDeletedComptabilite();
    } catch (error: any) {
      showNotificationRef.current(error?.message || 'Impossible de restaurer cette ecriture', 'error');
    }
  };

  const handlePermanentDelete = async () => {
    if (!itemToDeletePermanently?.idComptabilite) return;

    try {
      await apiClient.deleteComptabilitePermanently(itemToDeletePermanently.idComptabilite, currentUsername);
      showNotificationRef.current('Ecriture supprimee definitivement.', 'success');
      setPermanentDeleteDialogOpen(false);
      setItemToDeletePermanently(null);
      fetchDeletedComptabilite();
      fetchComptabilite();
    } catch (error: any) {
      showNotificationRef.current(error?.message || 'Impossible de supprimer definitivement cette ecriture', 'error');
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <NotificationComponent />

      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }}>
          <Box>
            <Typography variant="h4">Comptabilite</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Suis les recettes, les depenses et le solde de l&apos;eglise dans un espace simple a exploiter.
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ width: { xs: '100%', md: 'auto' } }}>
            <PrintEtatComptabilite items={filteredItems} deletedItems={deletedItems} search={search} filterLabel={activeFilterLabel} isSuperAdmin={desktopSecurityIsSuperAdmin} />
            <Button
              startIcon={<AddRounded />}
              onClick={openCreateDialog}
              sx={{ ...primaryActionButtonSx, width: { xs: '100%', sm: 'auto' } }}
            >
              Nouvelle ecriture
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={2}>
          {[
            {
              title: 'Entrees',
              value: currencyFormatter.format(totals.entree),
              icon: <ArrowDownwardRounded />,
              color: theme.palette.success.main,
            },
            {
              title: 'Sorties',
              value: currencyFormatter.format(totals.sortie),
              icon: <ArrowUpwardRounded />,
              color: theme.palette.error.main,
            },
            {
              title: 'Solde',
              value: currencyFormatter.format(totals.solde),
              icon: <AccountBalanceWalletRounded />,
              color: theme.palette.primary.main,
            },
          ].map((item) => (
            <Grid item xs={12} md={4} key={item.title}>
              <Card sx={{ p: 3, borderRadius: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="overline" sx={{ color: 'text.secondary' }}>{item.title}</Typography>
                    <Typography variant="h4" sx={{ mt: 1 }}>{item.value}</Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      color: item.color,
                      bgcolor: alpha(item.color, 0.12),
                    }}
                  >
                    {item.icon}
                  </Box>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card sx={{ p: 2, borderRadius: 4, background: (muiTheme) => `linear-gradient(135deg, ${alpha(muiTheme.palette.primary.main, 0.12)}, ${alpha(muiTheme.palette.info.main, 0.06)})` }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
            <TextField
              fullWidth
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher un libelle, une note ou une date..."
            />
            <TextField
              select
              label="Type"
              value={filterType}
              onChange={(event) => setFilterType(event.target.value as 'all' | ComptabiliteType)}
              sx={{ minWidth: { xs: '100%', md: 220 } }}
            >
              <MenuItem value="all">Toutes les ecritures</MenuItem>
              <MenuItem value="entree">Entrees seulement</MenuItem>
              <MenuItem value="sortie">Sorties seulement</MenuItem>
            </TextField>
          </Stack>
        </Card>

        <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 860 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Libelle</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Entree</TableCell>
                  <TableCell align="right">Sortie</TableCell>
                  <TableCell>Observation</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.map((item: IComptabiliteItem) => {
                  const isEntree = item.typeComptabilite === 'entree';
                  return (
                    <TableRow hover key={item.idComptabilite || `${item.nomComptabilite}-${item.dateComptabilite}`}>
                      <TableCell>{item.dateComptabilite || '--'}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1.25} alignItems="center">
                          <Box
                            sx={{
                              width: 38,
                              height: 38,
                              borderRadius: 2,
                              display: 'grid',
                              placeItems: 'center',
                              bgcolor: alpha(isEntree ? theme.palette.success.main : theme.palette.error.main, 0.12),
                              color: isEntree ? 'success.main' : 'error.main',
                            }}
                          >
                            <ReceiptLongRounded fontSize="small" />
                          </Box>
                          <Typography variant="subtitle2">{item.nomComptabilite}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={isEntree ? 'Entree' : 'Sortie'} />
                      </TableCell>
                      <TableCell align="right">{item.entreeComptabilite > 0 ? currencyFormatter.format(item.entreeComptabilite) : '--'}</TableCell>
                      <TableCell align="right">{item.sortieComptabilite > 0 ? currencyFormatter.format(item.sortieComptabilite) : '--'}</TableCell>
                      <TableCell>{item.observationComptabilite || '--'}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" justifyContent="flex-end">
                          <IconButton onClick={() => openEditDialog(item)}>
                            <EditRounded fontSize="small" />
                          </IconButton>
                          <IconButton color="error" onClick={() => askDelete(item)}>
                            <DeleteRounded fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {!loadingComptabilite && filteredItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Stack spacing={1} alignItems="center" sx={{ py: 6 }}>
                        <Typography variant="h6">Aucune ecriture pour le moment</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Commence avec une recette, une depense ou une note de tresorerie.
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </Card>

        {desktopSecurityIsSuperAdmin && (
          <Card sx={{ p: 2.5, borderRadius: 4 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6">Ecritures supprimees</Typography>
                <Typography variant="body2" color="text.secondary">
                  Archive comptable reservee au superadmin. Les lignes supprimees restent consultables ici avec leur trace.
                </Typography>
              </Box>

              <Box sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 980 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Libelle</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Montant</TableCell>
                      <TableCell>Supprime le</TableCell>
                      <TableCell>Supprime par</TableCell>
                      <TableCell>Motif</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deletedItems.map((item) => (
                      <TableRow hover key={`deleted-${item.idComptabilite}`}>
                        <TableCell>{item.dateComptabilite || '--'}</TableCell>
                        <TableCell>{item.nomComptabilite}</TableCell>
                        <TableCell>
                          <Chip size="small" color={item.typeComptabilite === 'entree' ? 'success' : 'error'} label={item.typeComptabilite === 'entree' ? 'Entree' : 'Sortie'} />
                        </TableCell>
                        <TableCell align="right">{currencyFormatter.format(item.montantComptabilite || 0)}</TableCell>
                        <TableCell>{item.dateSuppressionComptabilite || '--'}</TableCell>
                        <TableCell>{item.nomUtilisateurSuppression || '--'}</TableCell>
                        <TableCell>{item.motifSuppressionComptabilite || '--'}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" justifyContent="flex-end">
                            <IconButton
                              color="primary"
                              onClick={() => {
                                setItemToRestore(item);
                                setRestoreDialogOpen(true);
                              }}
                            >
                              <RestoreRounded fontSize="small" />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => {
                                setItemToDeletePermanently(item);
                                setPermanentDeleteDialogOpen(true);
                              }}
                            >
                              <DeleteForeverRounded fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}

                    {!loadingDeletedComptabilite && deletedItems.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8}>
                          <Stack spacing={1} alignItems="center" sx={{ py: 4 }}>
                            <Typography variant="subtitle1">Aucune ecriture archivee</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Rien a controler pour le moment dans la corbeille comptable.
                            </Typography>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Stack>
          </Card>
        )}
      </Stack>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullScreen={isMobile} fullWidth maxWidth="md">
        <DialogTitle>{currentItem.idComptabilite ? 'Modifier une ecriture' : 'Nouvelle ecriture'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Libelle"
                value={currentItem.nomComptabilite}
                onChange={(event) => handleChange('nomComptabilite', event.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Type"
                value={currentItem.typeComptabilite}
                onChange={(event) => handleChange('typeComptabilite', event.target.value)}
              >
                <MenuItem value="entree">Entree</MenuItem>
                <MenuItem value="sortie">Sortie</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Date"
                placeholder="jj/mm/aaaa"
                value={currentItem.dateComptabilite}
                onChange={(event) => handleChange('dateComptabilite', event.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label={currentItem.typeComptabilite === 'entree' ? 'Montant de l\'entree' : 'Montant de la sortie'}
                value={currentItem.montantComptabilite || ''}
                onChange={(event) => handleChange('montantComptabilite', event.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={4}
                label="Observation"
                value={currentItem.observationComptabilite}
                onChange={(event) => handleChange('observationComptabilite', event.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
          <Button onClick={handleCloseDialog} fullWidth={isMobile}>Annuler</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting} fullWidth={isMobile}>Enregistrer</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Archiver cette ecriture"
        message="Cette ecriture disparaitra de la liste active, mais restera conservee dans l'archive comptable visible par le superadmin."
        confirmText="Archiver"
      />

      <ConfirmDialog
        open={restoreDialogOpen}
        onClose={() => {
          setRestoreDialogOpen(false);
          setItemToRestore(null);
        }}
        onConfirm={handleRestore}
        title="Restaurer cette ecriture"
        message="Cette ecriture va revenir dans la liste active de la comptabilite."
        confirmText="Restaurer"
      />

      <ConfirmDialog
        open={permanentDeleteDialogOpen}
        onClose={() => {
          setPermanentDeleteDialogOpen(false);
          setItemToDeletePermanently(null);
        }}
        onConfirm={handlePermanentDelete}
        title="Supprimer definitivement cette ecriture"
        message="Cette suppression est irreversible. L'ecriture sera retiree meme de l'archive comptable."
        confirmText="Supprimer definitivement"
      />
    </DashboardContent>
  );
}


