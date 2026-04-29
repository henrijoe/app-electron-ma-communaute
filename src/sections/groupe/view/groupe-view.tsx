import { useMemo, useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { apiClient } from 'src/utils/apiClient';
import { normalizeForSearch } from 'src/utils/text';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify/iconify';
import { Scrollbar } from 'src/components/scrollbar/scrollbar';
import { useNotificationSnackbar } from 'src/components/alert/notificationSnackbar';
import ConfirmDialog from 'src/components/alert/confirmDialog';
import { AdvancedFilterMenu } from 'src/components/filters/advanced-filter-menu';

import { applyFilter, emptyRows, getComparator } from '../utils';
import { TableNoData } from '../table-no-data';
import { PrintEtatGlobal } from '../etats/printEtats';
import { TableEmptyRows } from '../table-empty-rows';
import { GroupeTableHead } from '../groupe-table-head';
import { GroupeTableRow } from '../groupe-table-row';
import { UserTableToolbar } from '../groupe-table-toolbar';
import {
  groupe,
  addGroupe,
  deleteGroupe,
  ensureArray,
  IGroupe,
  setDataModifiesGroupe,
  setListGroupe,
  setListFilterGroupe,
} from '../../../store/groupeSlice';

export function GroupeView() {
  const dispatch = useDispatch();
  const listGroupe = useSelector((state: any) => state.groupe.listGroupe);
  const appUserConnected = useSelector((state: any) => state.application?.userConnected);
  const authUtilisateurData = useSelector((state: any) => state.authentification?.utilisateurData);
  const currentUserId = Number(appUserConnected?.idUtilisateur) || Number(authUtilisateurData?.idUtilisateur) || null;

  const [loading, setLoading] = useState(true);
  const [filterName, setFilterName] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState({
    responsableGroupe: '',
    descriptionGroupe: '',
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [data, setData] = useState({ ...groupe });
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDeleteSelectedOpen, setConfirmDeleteSelectedOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const table = useGroupeTable();

  const { showNotification, NotificationComponent } = useNotificationSnackbar();

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setIsEditMode(false);
    setData({ ...groupe });
  }, []);

  const fetchGroupes = useCallback(async () => {
    // On charge uniquement les groupes rattaches l'utilisateur courant.
    try {
      setLoading(true);
      dispatch(ensureArray());
      const response = currentUserId
        ? await apiClient.getGroupesByUtilisateur(currentUserId)
        : await apiClient.getGroupes();
      if (response.status === 1) {
        const groupes = Array.isArray(response.data) ? response.data : [];
        dispatch(setListGroupe(groupes));
        dispatch(setListFilterGroupe(groupes));
      }
    } catch (error) {
      console.error('Error fetching groupes:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, dispatch]);

  useEffect(() => {
    fetchGroupes();
  }, [fetchGroupes]);

  const handleEditGroupe = useCallback((groupeData: IGroupe) => {
    setData({ ...groupeData });
    setIsEditMode(true);
    setOpenDialog(true);
  }, []);

  const handleDeleteGroupe = useCallback(async (idGroupe: number) => {
    if (!currentUserId) {
      showNotification('Session expirée : reconnectez-vous', 'warning');
      return;
    }

    try {
      setDeleteLoading(true);
      const response = await apiClient.deleteGroupe(idGroupe, currentUserId);
      if (response.status === 1) {
        dispatch(deleteGroupe(idGroupe));
        showNotification('Groupe supprimé avec succès', 'success');
      }
    } catch (error: any) {
      showNotification(error?.message || 'Erreur lors de la suppression du groupe', 'error');
    } finally {
      setDeleteLoading(false);
    }
  }, [currentUserId, dispatch, showNotification]);

  const handleDeleteSelected = useCallback(async () => {
    if (!currentUserId || table.selected.length === 0) return;

    try {
      setDeleteLoading(true);

      const summary = await table.selected.reduce(
        (promise, idGroupe) => promise.then(async ({ successes, failures }) => {
          const numericId = Number(idGroupe);

          try {
            const response = await apiClient.deleteGroupe(numericId, currentUserId);

            if (response.status === 1) {
              dispatch(deleteGroupe(numericId));
              return { failures, successes: successes + 1 };
            }

            return { failures: failures + 1, successes };
          } catch (error) {
            console.error(`Erreur suppression groupe ${numericId}:`, error);
            return { failures: failures + 1, successes };
          }
        }),
        Promise.resolve({ failures: 0, successes: 0 })
      );

      table.onSelectAllRows(false, []);

      if (summary.successes > 0) {
        await fetchGroupes();
      }

      if (summary.failures === 0) {
        showNotification(`${summary.successes} groupe(s) supprime(s) avec succes`, 'success');
      } else {
        showNotification(
          `${summary.successes} supprime(s), ${summary.failures} erreur(s)`,
          summary.failures === table.selected.length ? 'error' : 'warning'
        );
      }
    } catch (error: any) {
      showNotification(error?.message || 'Erreur lors de la suppression multiple', 'error');
    } finally {
      setDeleteLoading(false);
    }
  }, [currentUserId, dispatch, fetchGroupes, showNotification, table]);

  const handleSubmit = useCallback(async () => {
    if (!data.libelleGroupe?.trim()) {
      showNotification('Le libellé du groupe est requis', 'warning');
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
      };

      if (isEditMode && data.idGroupe) {
        const response = await apiClient.updateGroupe(payload);
        if (response.status === 1) {
          dispatch(setDataModifiesGroupe(payload));
          showNotification('Groupe modifié avec succés', 'success');
        }
      } else {
        const response = await apiClient.createGroupe(payload);
        if (response.status === 1) {
          const created = Array.isArray(response.data) ? response.data[0] : response.data;
          if (created) dispatch(addGroupe(created));
          showNotification('Groupe créé avec succés', 'success');
        }
      }

      handleCloseDialog();
      fetchGroupes();
    } catch (error: any) {
      showNotification(error?.message || 'Erreur lors de l\'enregistrement du groupe', 'error');
    } finally {
      setUpdateLoading(false);
    }
  }, [currentUserId, data, dispatch, fetchGroupes, handleCloseDialog, isEditMode, showNotification]);

  const baseFilteredData = useMemo(() => applyFilter({
    inputData: Array.isArray(listGroupe) ? listGroupe : [],
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  }), [filterName, listGroupe, table.order, table.orderBy]);

  const dataFiltered = useMemo(
    () =>
      baseFilteredData.filter((item) => {
        if (
          advancedFilters.responsableGroupe
          && !normalizeForSearch(item.responsableGroupe ).includes(normalizeForSearch(advancedFilters.responsableGroupe))
        ) {
          return false;
        }

        if (
          advancedFilters.descriptionGroupe
          && !normalizeForSearch(item.descriptionGroupe ).includes(normalizeForSearch(advancedFilters.descriptionGroupe))
        ) {
          return false;
        }

        return true;
      }),
    [advancedFilters, baseFilteredData]
  );

  const sortedData = useMemo(() => [...dataFiltered], [dataFiltered]);
  const notFound = !sortedData.length && (!!filterName || Object.values(advancedFilters).some(Boolean));

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>Liste des groupes</Typography>
        <Box display="flex" gap={2}>
          <PrintEtatGlobal />
          <Button variant="contained" color="inherit" startIcon={<Iconify icon="mingcute:add-line" />} onClick={() => setOpenDialog(true)}>
            Ajouter groupe
          </Button>
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
                { key: 'responsableGroupe', label: 'Responsable' },
                { key: 'descriptionGroupe', label: 'Description' },
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
                  responsableGroupe: '',
                  descriptionGroupe: '',
                });
                table.onResetPage();
              }}
            />
          }
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 900 }}>
              <GroupeTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={sortedData.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked, _newSelecteds) => table.onSelectAllRows(checked, sortedData.map((item) => String(item.idGroupe)))}
                headLabel={[
                  { id: 'libelleGroupe', label: 'Groupe' },
                  { id: 'descriptionGroupe', label: 'Description' },
                  { id: 'responsableGroupe', label: 'Responsable' },
                  { id: 'actions', label: 'Actions', align: 'center', width: 100 },
                ]}
              />
              <TableBody>
                {sortedData.slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage).map((row) => (
                  <GroupeTableRow
                    key={row.idGroupe}
                    row={row}
                    selected={table.selected.includes(String(row.idGroupe))}
                    onSelectRow={() => table.onSelectRow(String(row.idGroupe))}
                    onEdit={handleEditGroupe}
                    onDelete={handleDeleteGroupe}
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{isEditMode ? 'Modifier un groupe' : 'Ajouter un groupe'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Libellé du groupe" name="libelleGroupe" value={data.libelleGroupe || ''} onChange={(event) => setData((prev: any) => ({ ...prev, libelleGroupe: event.target.value }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Responsable du groupe" name="responsableGroupe" value={data.responsableGroupe || ''} onChange={(event) => setData((prev: any) => ({ ...prev, responsableGroupe: event.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline minRows={4} label="Description" name="descriptionGroupe" value={data.descriptionGroupe || ''} onChange={(event) => setData((prev: any) => ({ ...prev, descriptionGroupe: event.target.value }))} />
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
        title="Supprimer les groupes selectionnes"
        message={`Voulez-vous vraiment supprimer ${table.selected.length} groupe(s) selectionne(s) ?`}
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

export function useGroupeTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('libelleGroupe');
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


