import { useMemo, useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { apiClient } from 'src/utils/apiClient';
import { canManageModule } from 'src/utils/access-control';
import { normalizeForSearch } from 'src/utils/text';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify/iconify';
import { Scrollbar } from 'src/components/scrollbar/scrollbar';
import { useNotificationSnackbar } from 'src/components/alert/notificationSnackbar';
import ConfirmDialog from 'src/components/alert/confirmDialog';
import { AdvancedFilterMenu } from 'src/components/filters/advanced-filter-menu';
import { buildResponsableMemberOptions, findResponsableContact } from 'src/utils/responsable-members';

import { applyFilter, emptyRows, getComparator } from '../utils';
import type { IMembre } from '../../../store/membreSlice';
import { TableNoData } from '../table-no-data';
import { PrintEtatGlobal } from '../etats/printEtats';
import { TableEmptyRows } from '../table-empty-rows';
import { CelluleTableHead } from '../cellule-table-head';
import { CelluleTableRow } from '../cellule-table-row';
import { UserTableToolbar } from '../cellule-table-toolbar';
import {
  cellule,
  addCellule,
  deleteCellule,
  ensureArray,
  ICellule,
  setDataModifiesCellule,
  setListCellule,
  setListFilterCellule,
} from '../../../store/celluleSlice';

export function CelluleView() {
  const dispatch = useDispatch();
  const listCellule = useSelector((state: any) => state.cellule.listCellule);
  const appUserConnected = useSelector((state: any) => state.application?.userConnected);
  const authUtilisateurData = useSelector((state: any) => state.authentification?.utilisateurData);
  const currentUserId =
    Number(appUserConnected?.idUtilisateurParent || appUserConnected?.idUtilisateur)
    || Number(authUtilisateurData?.idUtilisateurParent || authUtilisateurData?.idUtilisateur)
    || null;
  const canManageCellule = canManageModule(appUserConnected || authUtilisateurData, 'cellule');

  const [loading, setLoading] = useState(true);
  const [membres, setMembres] = useState<IMembre[]>([]);
  const [filterName, setFilterName] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState({
    lieuCellule: '',
    responsableCellule: '',
    responsableVisiteCellule: '',
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [data, setData] = useState({ ...cellule });
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDeleteSelectedOpen, setConfirmDeleteSelectedOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const table = useCelluleTable();

  const { showNotification, NotificationComponent } = useNotificationSnackbar();

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setIsEditMode(false);
    setData({ ...cellule });
  }, []);

  const fetchCellules = useCallback(async () => {
    try {
      // On charge uniquement les cellules rattachees  l'utilisateur courant.
      setLoading(true);
      dispatch(ensureArray());
      const response = currentUserId
        ? await apiClient.getCellulesByUtilisateur(currentUserId)
        : await apiClient.getCellules();
      if (response.status === 1) {
        const cellules = Array.isArray(response.data) ? response.data : [];
        dispatch(setListCellule(cellules));
        dispatch(setListFilterCellule(cellules));
      }
    } catch (error) {
      console.error('Error fetching cellules:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, dispatch]);

  const fetchResponsableMembers = useCallback(async () => {
    if (!currentUserId) {
      setMembres([]);
      return;
    }

    try {
      const response = await apiClient.getMembresByUtilisateur(currentUserId);
      setMembres(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching responsables:', error);
      setMembres([]);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchCellules();
  }, [fetchCellules]);

  useEffect(() => {
    fetchResponsableMembers();
  }, [fetchResponsableMembers]);

  const responsableCelluleOptions = useMemo(() => buildResponsableMemberOptions(membres, [7]), [membres]);
  const responsableVisiteOptions = useMemo(() => buildResponsableMemberOptions(membres), [membres]);
  const responsableContactByName = useMemo(() => {
    const contacts = new Map<string, string>();
    (Array.isArray(listCellule) ? listCellule : []).forEach((item: ICellule) => {
      if (item.responsableCellule) {
        contacts.set(item.responsableCellule, findResponsableContact(membres, item.responsableCellule));
      }
      if (item.responsableVisiteCellule) {
        contacts.set(item.responsableVisiteCellule, findResponsableContact(membres, item.responsableVisiteCellule));
      }
    });
    return contacts;
  }, [listCellule, membres]);
  const selectedResponsableCelluleContact = useMemo(
    () => findResponsableContact(membres, data.responsableCellule),
    [data.responsableCellule, membres]
  );
  const selectedResponsableVisiteContact = useMemo(
    () => findResponsableContact(membres, data.responsableVisiteCellule),
    [data.responsableVisiteCellule, membres]
  );

  const handleEditCellule = useCallback((celluleData: ICellule) => {
    if (!canManageCellule) return;

    // On prepare le formulaire avec les donnees completes de la cellule selectionnee.
    setData({ ...celluleData });
    setIsEditMode(true);
    setOpenDialog(true);
  }, [canManageCellule]);

  const handleDeleteCellule = useCallback(async (idCellule: number) => {
    if (!canManageCellule) return;

    if (!currentUserId) {
      showNotification('Session expirée : reconnectez-vous', 'warning');
      return;
    }

    try {
      setDeleteLoading(true);
      const response = await apiClient.deleteCellule(idCellule, currentUserId);
      if (response.status === 1) {
        dispatch(deleteCellule(idCellule));
        showNotification('Cellule supprimée avec succés', 'success');
      }
    } catch (error: any) {
      showNotification(error?.message || 'Erreur lors de la suppression de la cellule', 'error');
    } finally {
      setDeleteLoading(false);
    }
  }, [canManageCellule, currentUserId, dispatch, showNotification]);

  const handleDeleteSelected = useCallback(async () => {
    if (!canManageCellule) return;

    if (!currentUserId || table.selected.length === 0) return;

    try {
      setDeleteLoading(true);

      const summary = await table.selected.reduce(
        (promise, idCellule) => promise.then(async ({ successes, failures }) => {
          const numericId = Number(idCellule);

          try {
            const response = await apiClient.deleteCellule(numericId, currentUserId);

            if (response.status === 1) {
              dispatch(deleteCellule(numericId));
              return { failures, successes: successes + 1 };
            }

            return { failures: failures + 1, successes };
          } catch (error) {
            console.error(`Erreur suppression cellule ${numericId}:`, error);
            return { failures: failures + 1, successes };
          }
        }),
        Promise.resolve({ failures: 0, successes: 0 })
      );

      table.onSelectAllRows(false, []);

      if (summary.successes > 0) {
        await fetchCellules();
      }

      if (summary.failures === 0) {
        showNotification(`${summary.successes} cellule(s) supprimee(s) avec succes`, 'success');
      } else {
        showNotification(
          `${summary.successes} supprimee(s), ${summary.failures} erreur(s)`,
          summary.failures === table.selected.length ? 'error' : 'warning'
        );
      }
    } catch (error: any) {
      showNotification(error?.message || 'Erreur lors de la suppression multiple', 'error');
    } finally {
      setDeleteLoading(false);
    }
  }, [canManageCellule, currentUserId, dispatch, fetchCellules, showNotification, table]);

  const handleSubmit = useCallback(async () => {
    if (!canManageCellule) return;

    if (!data.nomCellule?.trim()) {
      showNotification('Le nom de la cellule est requis', 'warning');
      return;
    }

    if (!currentUserId) {
      showNotification('Session expirée : reconnectez-vous', 'warning');
      return;
    }

    try {
      setUpdateLoading(true);
      const payload = {
        ...data,
        idUtilisateur: currentUserId,
        nombreMembreCellule: String(data.nombreMembreCellule || '0'),
      };

      if (isEditMode && data.idCellule) {
        const response = await apiClient.updateCellule(payload);
        if (response.status === 1) {
          dispatch(setDataModifiesCellule(payload));
          showNotification('Cellule modifiée avec succés', 'success');
        }
      } else {
        const response = await apiClient.createCellule(payload);
        if (response.status === 1) {
          const created = Array.isArray(response.data) ? response.data[0] : response.data;
          if (created) dispatch(addCellule(created));
          showNotification('Cellule créée avec succés', 'success');
        }
      }

      handleCloseDialog();
      fetchCellules();
    } catch (error: any) {
      showNotification(error?.message || 'Erreur lors de l\'enregistrement de la cellule', 'error');
    } finally {
      setUpdateLoading(false);
    }
  }, [canManageCellule, currentUserId, data, dispatch, fetchCellules, handleCloseDialog, isEditMode, showNotification]);

  const baseFilteredData = useMemo(() => applyFilter({
    inputData: Array.isArray(listCellule) ? listCellule : [],
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  }), [filterName, listCellule, table.order, table.orderBy]);

  const dataFiltered = useMemo(
    () =>
      baseFilteredData.filter((item) => {
        if (
          advancedFilters.lieuCellule
          && !normalizeForSearch(item.lieuCellule).includes(normalizeForSearch(advancedFilters.lieuCellule))
        ) {
          return false;
        }

        if (
          advancedFilters.responsableCellule
          && !normalizeForSearch(item.responsableCellule).includes(normalizeForSearch(advancedFilters.responsableCellule))
        ) {
          return false;
        }

        if (
          advancedFilters.responsableVisiteCellule
          && !normalizeForSearch(item.responsableVisiteCellule).includes(normalizeForSearch(advancedFilters.responsableVisiteCellule))
        ) {
          return false;
        }

        return true;
      }),
    [advancedFilters, baseFilteredData]
  );

  const sortedData = useMemo(() => [...dataFiltered], [dataFiltered]);
  const notFound = !sortedData.length && (!!filterName || Object.values(advancedFilters).some(Boolean));
  const currentPageCellules = useMemo(
    () => sortedData.slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage),
    [sortedData, table.page, table.rowsPerPage]
  );

  return (
    <DashboardContent>
      <Box
        display="flex"
        alignItems={{ xs: 'stretch', md: 'center' }}
        flexDirection={{ xs: 'column', md: 'row' }}
        gap={2}
        mb={{ xs: 3, md: 5 }}
      >
        <Typography variant="h4" flexGrow={1}>Liste des cellules</Typography>
        <Box display="flex" gap={1.25} flexDirection={{ xs: 'column', sm: 'row' }} sx={{ width: { xs: '100%', md: 'auto' } }}>
          <PrintEtatGlobal />
          {canManageCellule && (
            <Button variant="contained" color="inherit" startIcon={<Iconify icon="mingcute:add-line" />} onClick={() => setOpenDialog(true)} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              Ajouter cellule
            </Button>
          )}
        </Box>
      </Box>

      <Card>
        <UserTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(event) => {
            setFilterName(event.target.value);
            table.onResetPage();
          }}
          onDelete={() => setConfirmDeleteSelectedOpen(true)}
          deleteLoading={deleteLoading}
          advancedFilters={
            <AdvancedFilterMenu
              buttonLabel="Filtres"
              fields={[
                { key: 'lieuCellule', label: 'Lieu' },
                { key: 'responsableCellule', label: 'Responsable de cellule' },
                { key: 'responsableVisiteCellule', label: 'Responsable de visite' },
              ]}
              values={advancedFilters}
              onChange={(key, value) =>
                setAdvancedFilters((prev) => ({
                  ...prev,
                  [key]: value,
                }))
              }
              onApply={() => table.onResetPage()}
              onReset={() => {
                setAdvancedFilters({
                  lieuCellule: '',
                  responsableCellule: '',
                  responsableVisiteCellule: '',
                });
                table.onResetPage();
              }}
            />
          }
        />

        <Box sx={{ display: { xs: 'block', md: 'none' }, px: 2, pb: 2 }}>
          <Box display="flex" flexDirection="column" gap={1.5}>
            {currentPageCellules.map((row) => (
              <Card key={row.idCellule} variant="outlined" sx={{ p: 1.75, borderRadius: 2, boxShadow: 'none' }}>
                <Box display="flex" gap={1.25} alignItems="flex-start">
                  <Checkbox
                    checked={table.selected.includes(String(row.idCellule))}
                    onChange={() => table.onSelectRow(String(row.idCellule))}
                    sx={{ p: 0.25 }}
                  />
                  <Box minWidth={0} flex={1}>
                    <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>{row.nomCellule || 'Cellule sans nom'}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflowWrap: 'anywhere' }}>
                      {row.lieuCellule || 'Lieu non renseigne'}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 1.25 }} />

                <Grid container spacing={1.25}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Effectif</Typography>
                    <Typography variant="body2">{row.nombreMembreCellule || '0'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Responsable</Typography>
                    <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{row.responsableCellule || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Contact responsable</Typography>
                    <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{responsableContactByName.get(row.responsableCellule) || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Visite</Typography>
                    <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{row.responsableVisiteCellule || '-'}</Typography>
                  </Grid>
                </Grid>

                {canManageCellule && (
                  <Box display="flex" justifyContent="flex-end" gap={1} mt={1.5}>
                    <Button size="small" onClick={() => handleEditCellule(row)}>Modifier</Button>
                    <Button size="small" color="error" disabled={deleteLoading} onClick={() => handleDeleteCellule(row.idCellule)}>Supprimer</Button>
                  </Box>
                )}
              </Card>
            ))}

            {notFound && (
              <Card variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 2, boxShadow: 'none' }}>
                <Typography variant="subtitle2">Aucun resultat</Typography>
                <Typography variant="body2" color="text.secondary">Aucune cellule ne correspond aux filtres.</Typography>
              </Card>
            )}
          </Box>
        </Box>

        <Scrollbar sx={{ display: { xs: 'none', md: 'flex' } }}>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 1100 }}>
              <CelluleTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={sortedData.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked, _newSelecteds) => table.onSelectAllRows(checked, sortedData.map((item) => String(item.idCellule)))}
                headLabel={[
                  { id: 'nomCellule', label: 'Cellule' },
                  { id: 'lieuCellule', label: 'Lieu' },
                  { id: 'nombreMembreCellule', label: 'Effectif' },
                  { id: 'responsableCellule', label: 'Responsable' },
                  { id: 'contactResponsableCellule', label: 'Numero responsable' },
                  { id: 'responsableVisiteCellule', label: 'Responsable visite' },
                  { id: 'contactResponsableVisiteCellule', label: 'Numero visite' },
                  { id: 'actions', label: 'Actions', align: 'center', width: 100 },
                ]}
              />
              <TableBody>
                {currentPageCellules.map((row) => (
                  <CelluleTableRow
                    key={row.idCellule}
                    row={row}
                    selected={table.selected.includes(String(row.idCellule))}
                    onSelectRow={() => table.onSelectRow(String(row.idCellule))}
                    onEdit={handleEditCellule}
                    onDelete={handleDeleteCellule}
                    isDeleting={deleteLoading}
                    canManage={canManageCellule}
                    responsableContact={responsableContactByName.get(row.responsableCellule) || ''}
                    responsableVisiteContact={responsableContactByName.get(row.responsableVisiteCellule) || ''}
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{isEditMode ? 'Modifier une cellule' : 'Ajouter une cellule'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Nom de la cellule" name="nomCellule" value={data.nomCellule || ''} onChange={(event) => setData((prev: any) => ({ ...prev, nomCellule: event.target.value }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Lieu" name="lieuCellule" value={data.lieuCellule || ''} onChange={(event) => setData((prev: any) => ({ ...prev, lieuCellule: event.target.value }))} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Nombre de membres" name="nombreMembreCellule" value={data.nombreMembreCellule || ''} onChange={(event) => setData((prev: any) => ({ ...prev, nombreMembreCellule: event.target.value }))} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField select fullWidth label="Responsable de cellule" name="responsableCellule" value={data.responsableCellule || ''} onChange={(event) => setData((prev: any) => ({ ...prev, responsableCellule: event.target.value }))}>
                <MenuItem value="">Aucun responsable</MenuItem>
                {data.responsableCellule
                  && !responsableCelluleOptions.some((option) => option.value === data.responsableCellule) && (
                    <MenuItem value={data.responsableCellule}>{data.responsableCellule}</MenuItem>
                  )}
                {responsableCelluleOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Contact responsable cellule"
                value={selectedResponsableCelluleContact || ''}
                InputProps={{ readOnly: true }}
                helperText={selectedResponsableCelluleContact ? 'Contact deja saisi sur la fiche membre' : 'Aucun contact trouve pour ce responsable'}
              />
            </Grid>
            <Grid item xs={12} md={4}>

              <TextField fullWidth label="Responsable de visite" name="responsableVisiteCellule" value={data.responsableVisiteCellule || ''} onChange={(event) => setData((prev: any) => ({ ...prev, responsableVisiteCellule: event.target.value }))} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Contact responsable visite"
                value={selectedResponsableVisiteContact || ''}
                InputProps={{ readOnly: true }}
                helperText={selectedResponsableVisiteContact ? 'Contact deja saisi sur la fiche membre' : 'Aucun contact trouve pour ce responsable'}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={updateLoading}>Enregistrer</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmDeleteSelectedOpen}
        title="Supprimer les cellules selectionnees"
        message={`Voulez-vous vraiment supprimer ${table.selected.length} cellule(s) selectionnee(s) ?`}
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

export function useCelluleTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('nomCellule');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback((id: string) => {
    const isAsc = orderBy === id && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(id);
  }, [order, orderBy]);

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    setSelected(checked ? newSelecteds : []);
  }, []);

  const onSelectRow = useCallback((inputValue: string) => {
    setSelected((prev) => (prev.includes(inputValue) ? prev.filter((value) => value !== inputValue) : [...prev, inputValue]));
  }, []);

  const onResetPage = useCallback(() => setPage(0), []);
  const onChangePage = useCallback((_: unknown, newPage: number) => setPage(newPage), []);
  const onChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    onResetPage();
  }, [onResetPage]);

  return { page, order, onSort, orderBy, selected, rowsPerPage, onSelectRow, onResetPage, onChangePage, onSelectAllRows, onChangeRowsPerPage };
}


