import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AccountBalanceWalletRounded,
  AddRounded,
  ArrowDownwardRounded,
  ArrowUpwardRounded,
  DeleteRounded,
  EditRounded,
  ReceiptLongRounded,
} from '@mui/icons-material';
import {
  alpha,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import ConfirmDialog from 'src/components/alert/confirmDialog';
import { useNotificationSnackbar } from 'src/components/alert/notificationSnackbar';
import { DashboardContent } from 'src/layouts/dashboard';
import {
  removeComptabilite,
  setListComptabilite,
  setLoadingComptabilite,
  type IComptabiliteItem,
  upsertComptabilite,
} from 'src/store/comptabiliteSlice';
import { apiClient } from 'src/utils/apiClient';

const emptyComptabilite: IComptabiliteItem = {
  idUtilisateur: null,
  nomComptabilite: '',
  entreeComptabilite: 0,
  sortieComptabilite: 0,
  dateComptabilite: new Date().toISOString().slice(0, 10),
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

const normalizeComptabilite = (item: any): IComptabiliteItem => ({
  idComptabilite: Number(item?.idComptabilite) || undefined,
  idUtilisateur: Number(item?.idUtilisateur) || null,
  nomComptabilite: String(item?.nomComptabilite || ''),
  entreeComptabilite: parseNumber(item?.entreeComptabilite),
  sortieComptabilite: parseNumber(item?.sortieComptabilite),
  dateComptabilite: String(item?.dateComptabilite || '').slice(0, 10),
  observationComptabilite: String(item?.observationComptabilite || ''),
});

const buildPayload = (item: IComptabiliteItem, idUtilisateur: number) => ({
  ...item,
  idUtilisateur,
  entreeComptabilite: parseNumber(item.entreeComptabilite),
  sortieComptabilite: parseNumber(item.sortieComptabilite),
});

export function ComptabiliteView() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { listComptabilite, loadingComptabilite } = useSelector((state: any) => state.comptabilite);
  const appUserConnected = useSelector((state: any) => state.application?.userConnected);
  const authUtilisateurData = useSelector((state: any) => state.authentification?.utilisateurData);
  const currentUserId = Number(appUserConnected?.idUtilisateur) || Number(authUtilisateurData?.idUtilisateur) || null;

  const { showNotification } = useNotificationSnackbar();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<IComptabiliteItem>(emptyComptabilite);
  const [itemToDelete, setItemToDelete] = useState<IComptabiliteItem | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'entree' | 'sortie'>('all');
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
      showNotification(error?.message || 'Impossible de charger la comptabilite', 'error');
    } finally {
      dispatch(setLoadingComptabilite(false));
    }
  }, [currentUserId, dispatch, showNotification]);

  useEffect(() => {
    fetchComptabilite();
  }, [fetchComptabilite]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return listComptabilite.filter((item: IComptabiliteItem) => {
      const matchesSearch = !query
        || item.nomComptabilite.toLowerCase().includes(query)
        || item.observationComptabilite.toLowerCase().includes(query)
        || item.dateComptabilite.includes(query);

      const matchesType = filterType === 'all'
        || (filterType === 'entree' && item.entreeComptabilite > 0)
        || (filterType === 'sortie' && item.sortieComptabilite > 0);

      return matchesSearch && matchesType;
    });
  }, [filterType, listComptabilite, search]);

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
      [field]: field === 'entreeComptabilite' || field === 'sortieComptabilite' ? parseNumber(value) : value,
    }));
  };

  const handleSubmit = async () => {
    if (!currentUserId) {
      showNotification('Utilisateur non trouve', 'warning');
      return;
    }

    if (!currentItem.nomComptabilite.trim()) {
      showNotification('Le libelle est obligatoire', 'warning');
      return;
    }

    const payload = buildPayload(currentItem, currentUserId);
    if (payload.entreeComptabilite <= 0 && payload.sortieComptabilite <= 0) {
      showNotification('Renseigne au moins une entree ou une sortie', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const response = currentItem.idComptabilite
        ? await apiClient.updateComptabilite(payload)
        : await apiClient.createComptabilite(payload);

      const normalized = normalizeComptabilite(Array.isArray(response?.data) ? response.data[0] : response?.data);
      dispatch(upsertComptabilite(normalized));
      showNotification(currentItem.idComptabilite ? 'Ecriture mise a jour' : 'Ecriture enregistree', 'success');
      handleCloseDialog();
      fetchComptabilite();
    } catch (error: any) {
      showNotification(error?.message || 'Impossible denregistrer cette ecriture', 'error');
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
      await apiClient.deleteComptabilite(itemToDelete.idComptabilite);
      dispatch(removeComptabilite(itemToDelete.idComptabilite));
      showNotification('Ecriture supprimee', 'success');
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchComptabilite();
    } catch (error: any) {
      showNotification(error?.message || 'Impossible de supprimer cette ecriture', 'error');
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }}>
          <Box>
            <Typography variant="h4">Comptabilite</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Suis les recettes, les depenses et le solde de l&apos;eglise dans un espace simple a exploiter.
            </Typography>
          </Box>

          <Button
            startIcon={<AddRounded />}
            onClick={openCreateDialog}
            sx={{ ...primaryActionButtonSx, width: { xs: '100%', sm: 'auto' } }}
          >
            Nouvelle ecriture
          </Button>
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
              onChange={(event) => setFilterType(event.target.value as 'all' | 'entree' | 'sortie')}
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
                  const isEntree = item.entreeComptabilite > 0;
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
                        <Chip
                          size="small"
                          label={isEntree ? 'Entree' : 'Sortie'}
                          />
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
      </Stack>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullScreen={isMobile} fullWidth maxWidth="md">
        <DialogTitle>{currentItem.idComptabilite ? 'Modifier une ecriture' : 'Nouvelle ecriture'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 0.5 }}>
            <Grid item xs={12} md={7}>
              <TextField
                fullWidth
                label="Libelle"
                value={currentItem.nomComptabilite}
                onChange={(event) => handleChange('nomComptabilite', event.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                value={currentItem.dateComptabilite}
                onChange={(event) => handleChange('dateComptabilite', event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Entree"
                value={currentItem.entreeComptabilite || ''}
                onChange={(event) => handleChange('entreeComptabilite', event.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Sortie"
                value={currentItem.sortieComptabilite || ''}
                onChange={(event) => handleChange('sortieComptabilite', event.target.value)}
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
        title="Supprimer cette ecriture"
        message="Cette action retirera la ligne de comptabilite de la liste actuelle."
        confirmText="Supprimer"
      />
    </DashboardContent>
  );
}