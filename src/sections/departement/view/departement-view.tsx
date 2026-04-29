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
  Stack, DialogContent
} from '@mui/material';

import { apiClient } from 'src/utils/apiClient';
import { normalizeForSearch } from 'src/utils/text';
import { useNotificationSnackbar } from 'src/components/alert/notificationSnackbar';
import { AdvancedFilterMenu } from 'src/components/filters/advanced-filter-menu';
import ConfirmDialog from 'src/components/alert/confirmDialog';

import { TableNoData } from '../table-no-data';
import { DepartementTableRow } from '../departement-table-row';
import { TableEmptyRows } from '../table-empty-rows';
import { UserTableToolbar } from '../departement-table-toolbar-clean';
import { DashboardContent } from '../../../layouts/dashboard';
import { Iconify } from '../../../components/iconify/iconify';
import { emptyRows, applyFilter, getComparator } from '../utils';
import { Scrollbar } from '../../../components/scrollbar/scrollbar';
import PrintEtatGlobal from '../etats/printEtats';
import { DepartementTableHead } from '../departement-table-head';
import { IDataChoice } from '../../../store/membreSlice';
import {
  departement,
  addDepartement,
  deleteDepartement,
  ensureArray,
  setDataModifiesDepartement,
  setListDepartement,
  IDepartement
} from '../../../store/departementSlice';


export function DepartementView() {
  const dispatch = useDispatch();
  const listDepartement = useSelector((state: any) => state.departement.listDepartement);
  const appUserConnected = useSelector((state: any) => state.application?.userConnected);
  const authUtilisateurData = useSelector((state: any) => state.authentification?.utilisateurData);
  const currentUserId = Number(appUserConnected?.idUtilisateur) || Number(authUtilisateurData?.idUtilisateur) || 0;

  const [loading, setLoading] = useState(true);
  const table = useDepartementTable();

  // Destructurer les valeurs nÃ©cessaires de useDepartementTable
  const { selected, onSelectAllRows } = table;

  const [filterName, setFilterName] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState({
    libelleCourtDepartement: '',
    responsableDepartement: '',
    sloganDepartement: '',
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [maxWidth] = useState<any>('lg');
  const [data, setData] = useState({ ...departement });
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDeleteSelectedOpen, setConfirmDeleteSelectedOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const {
    showNotification,
    NotificationComponent
  } = useNotificationSnackbar();

  const {
    setFocus,
    register,
    reset,
    handleSubmit: formHandleSubmit,
    formState: { errors }
  } = useForm<IDepartement>();

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setIsEditMode(false);
    setData({ ...departement });
    reset({ ...departement });
  }, [reset]);

  const handleOpenDialog = useCallback(() => setOpenDialog(true), []);

  const fetchDepartements = useCallback(async () => {
    try {
      setLoading(true);
      dispatch(ensureArray());
      const response = currentUserId
        ? await apiClient.getDepartementsByUtilisateur(currentUserId)
        : await apiClient.getDepartements();
      if (response.status === 1) {
        dispatch(setListDepartement(Array.isArray(response.data) ? response.data : []));
      }
    } catch (error) {
      console.error('Error fetching departements:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, dispatch]);

  // Fonction pour supprimer un dÃ©partement
  const handleDeleteDepartement = useCallback(async (idDepartement: number) => {
    try {
      setDeleteLoading(true);
      if (!currentUserId) {
        showNotification('Utilisateur connecte introuvable pour la suppression', 'error');
        return;
      }

      const response = await apiClient.deleteDepartement(idDepartement, currentUserId);
      if (response.status === 1) {
        dispatch(deleteDepartement(idDepartement));
        showNotification('Département supprimé avec succès', 'success');
      } else {
        showNotification(`Erreur: ${response.error?.message || 'Erreur inconnue'}`, 'error');
      }
    } catch (error: any) {
      console.error('Error deleting département:', error);
      showNotification(`Erreur: ${error.message || 'Erreur lors de la suppression'}`, 'error');
    } finally {
      setDeleteLoading(false);
    }
  }, [currentUserId, dispatch, showNotification]);

  // Fonction pour éditer un dÃ©partement
  const handleEditDepartement = useCallback((departementData: IDepartement) => {
    setIsEditMode(true);
    console.log('Donnees pour edition:', departementData);
    setData({ ...departementData });
    reset({ ...departementData });
    setOpenDialog(true);
  }, [reset]);

  // Fonction pour mettre à jour un dÃ©partement
  const handleUpdateDepartement = useCallback(async (formData: IDepartement) => {
    try {
      setUpdateLoading(true);

      const currentDepartement = listDepartement.find((d: IDepartement) => d.idDepartement === data.idDepartement)

      const mergedData = {
        ...currentDepartement,
        ...formData,
        idDepartement: data.idDepartement
      }

      const cleanedData = {
        ...mergedData,
        idUtilisateur: currentUserId || currentDepartement?.idUtilisateur || null,
      };

      console.log('Données envoyÃ©es à l\'API:', mergedData);

      const response = await apiClient.updateDepartement(cleanedData);
      if (response.status === 1) {
        dispatch(setDataModifiesDepartement(cleanedData));
        handleCloseDialog();
        fetchDepartements();
        showNotification('Département modifié avec succès', 'success');
      } else {
        showNotification('Erreur lors de la modification du département', 'error');
      }
    } catch (error) {
      console.error('Error updating département:', error);
      showNotification('Erreur lors de la modification', 'error');
    } finally {
      setUpdateLoading(false);
    }
  }, [currentUserId, data.idDepartement, listDepartement, dispatch, handleCloseDialog, showNotification, fetchDepartements]);

  // Fonction pour créer un dÃ©partement
  const handleCreateOrUpdateDepartement = useCallback(async (departementData: IDepartement) => {
    if (isEditMode) {
      await handleUpdateDepartement(departementData)
    } else {
      try {
        setUpdateLoading(true);

        const cleanedData = {
          ...departementData,
          idUtilisateur: currentUserId || null
        };

        const response = await apiClient.createDepartement(cleanedData);
        if (response.status === 1) {
          dispatch(addDepartement(response.data));

          fetchDepartements();
          handleCloseDialog();
          showNotification('Département créé avec succès', 'success');
        } else {
          showNotification('Erreur lors de la création du département', 'error');
        }
      } catch (error) {
        console.error('Error creating département:', error);
        showNotification('Erreur lors de la création du département', 'error');
      } finally {
        setUpdateLoading(false);
      }
    }
  }, [currentUserId, isEditMode, handleUpdateDepartement, dispatch, fetchDepartements, handleCloseDialog, showNotification]);

  // Fonction pour gérer la soumission
  const onFormSubmit = useCallback(() => {
    // Validation
    if (!data.libelleLongDepartement) {
      showNotification('Le libellé long est requis', 'warning');
      return;
    }

    if (!data.libelleCourtDepartement) {
      showNotification('Le libellé court est requis', 'warning');
      return;
    }

    const departementData: IDepartement = {
      ...data,
      ...(isEditMode && data.idDepartement && { idDepartement: data.idDepartement }),
    };

    handleCreateOrUpdateDepartement(departementData);
  }, [data, isEditMode, handleCreateOrUpdateDepartement, showNotification]);

  useEffect(() => {
    fetchDepartements();
  }, [fetchDepartements]);

  // On combine la recherche libre avec les champs mï¿½tier les plus utiles.
  const baseFilteredData: any[] = useMemo(() => {
    const dataToFilter = Array.isArray(listDepartement) ? listDepartement : [];
    return applyFilter({
      inputData: dataToFilter,
      comparator: getComparator(table?.order, table?.orderBy),
      filterName,
    });
  }, [listDepartement, table.order, table.orderBy, filterName]);

  const dataFiltered: any[] = useMemo(
    () =>
      baseFilteredData.filter((item) => {
        if (
          advancedFilters.libelleCourtDepartement
          && !normalizeForSearch(item.libelleCourtDepartement ).includes(normalizeForSearch(advancedFilters.libelleCourtDepartement))
        ) {
          return false;
        }

        if (
          advancedFilters.responsableDepartement
          && !normalizeForSearch(item.responsableDepartement ).includes(normalizeForSearch(advancedFilters.responsableDepartement))
        ) {
          return false;
        }

        if (
          advancedFilters.sloganDepartement
          && !normalizeForSearch(item.sloganDepartement ).includes(normalizeForSearch(advancedFilters.sloganDepartement))
        ) {
          return false;
        }

        return true;
      }),
    [advancedFilters, baseFilteredData]
  );

  const notFound = !dataFiltered?.length && (!!filterName || Object.values(advancedFilters).some(Boolean));

  // Trier les données
  const sortedData = useMemo(() => dataFiltered.sort((a, b) => {
    const libelleA = a.libelleLongDepartement?.toLowerCase();
    const libelleB = b.libelleLongDepartement?.toLowerCase();
    return table.order === 'asc'
      ? libelleA?.localeCompare(libelleB)
      : libelleB?.localeCompare(libelleA);
  }),
    [dataFiltered, table.order]
  );

  // Fonction pour gérer les changements dans les champs
  const handleChange = useCallback((event: any) => {
    const { name, value } = event.target;
    setData((prevData: any) => ({ ...prevData, [name]: value }));
  }, []);

  // Fonction pour supprimer plusieurs départements
  const handleDeleteSelected = useCallback(async () => {
    if (selected.length === 0) return;

    try {
      setDeleteLoading(true);

      if (!currentUserId) {
        throw new Error('Utilisateur connecte introuvable pour la suppression');
      }

      const summary = await selected.reduce(
        (promise, idDepartementStr) => promise.then(async ({ successes, failures }) => {
          const idDepartement = parseInt(idDepartementStr, 10);

          try {
            const response = await apiClient.deleteDepartement(idDepartement, currentUserId);

            if (response.status === 1) {
              dispatch(deleteDepartement(idDepartement));
              return { failures, successes: successes + 1 };
            }

            return { failures: failures + 1, successes };
          } catch (error) {
            console.error(`Erreur suppression departement ${idDepartement}:`, error);
            return { failures: failures + 1, successes };
          }
        }),
        Promise.resolve({ failures: 0, successes: 0 })
      );

      onSelectAllRows(false, []);

      if (summary.successes > 0) {
        await fetchDepartements();
      }

      if (summary.failures === 0) {
        showNotification(`${summary.successes} departement(s) supprime(s) avec succes`, 'success');
      } else {
        showNotification(
          `${summary.successes} supprime(s), ${summary.failures} erreur(s)`,
          summary.failures === selected.length ? 'error' : 'warning'
        );
      }

    } catch (error: any) {
      console.error('Erreur generale lors de la suppression multiple:', error);
      showNotification(`Erreur: ${error.message || 'Erreur lors de la suppression'}`, 'error');
    } finally {
      setDeleteLoading(false);
    }
  }, [currentUserId, selected, onSelectAllRows, dispatch, showNotification, fetchDepartements]);

  useEffect(() => {
    if (!openDialog) {
      setTimeout(() => {
        setData({ ...departement });
        setIsEditMode(false);
      }, 100)
    }
  }, [openDialog]);

  // Nettoyage des données quand on change de membre à éditer
  useEffect(() => {
    // Réinitialiser quand isEditMode change
    if (!isEditMode) {
      setData({ ...departement });
    }
  }, [isEditMode]);
  const dialogTitle = isEditMode ? 'Modifier un département' : 'Ajouter un département';

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Liste des départements
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <PrintEtatGlobal />

          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleOpenDialog}
            disabled={loading}
          >
            {loading ? 'Chargement...' : 'Ajouter département'}
          </Button>
        </Stack>
      </Box>

      <Card>
        <UserTableToolbar
          numSelected={selected.length}
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
              <DepartementTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={sortedData?.length}
                numSelected={table.selected?.length}
                onSort={table?.onSort}
                onSelectAllRows={(checked: any) =>
                  table?.onSelectAllRows(
                    checked,
                    sortedData?.map((x) => x.idDepartement?.toString() || '')
                  )
                }
                headLabel={[
                  { id: 'libelleLongDepartement', label: 'Departement' },
                  { id: 'libelleCourtDepartement', label: 'Sigle' },
                  { id: 'sloganDepartement', label: 'Slogan' },
                  { id: 'responsableDepartement', label: 'Responsable' },
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
                    <DepartementTableRow
                      key={row.idDepartement}
                      row={row}
                      selected={table.selected?.includes(row.idDepartement?.toString() || '')}
                      onSelectRow={() => table?.onSelectRow(row.idDepartement?.toString() || '')}
                      onEdit={handleEditDepartement}
                      onDelete={handleDeleteDepartement}
                      isDeleting={deleteLoading}
                    />
                  ))}

                <TableEmptyRows
                  height={68}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, sortedData.length)}
                />
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
          rowsPerPageOptions={[5, 10, 25,30]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      <Dialog
        maxWidth={maxWidth}
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <form onSubmit={formHandleSubmit(onFormSubmit)}>
            <Grid container spacing={2}>
              {/* Libellé long */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  label="Département *"
                  variant="outlined"
                  value={data.libelleLongDepartement}
                  {...register('libelleLongDepartement', { required: 'Le departement est requis' })}
                  onChange={handleChange}
                  error={!!errors.libelleLongDepartement}
                  helperText={errors.libelleLongDepartement?.message}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setFocus('libelleCourtDepartement');
                    }
                  }}
                />
              </Grid>

              {/* Libellé court */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  label="Sigle *"
                  variant="outlined"
                  value={data.libelleCourtDepartement}
                  {...register('libelleCourtDepartement', { required: 'Le sigle est requis' })}
                  onChange={handleChange}
                  error={!!errors.libelleCourtDepartement}
                  helperText={errors.libelleCourtDepartement?.message}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setFocus('sloganDepartement');
                    }
                  }}
                />
              </Grid>

              {/* Slogan */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  label="Slogan"
                  variant="outlined"
                  value={data.sloganDepartement}
                  {...register('sloganDepartement')}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setFocus('responsableDepartement');
                    }
                  }}
                />
              </Grid>

              {/* Responsable */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  label="Responsable"
                  variant="outlined"
                  value={data.responsableDepartement}
                  {...register('responsableDepartement')}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                Annuler
              </Button>
              <Button
                type="submit"
                color="primary"
                variant="contained"
                disabled={updateLoading}
              >
                {updateLoading ? 'Enregistrement...' : (isEditMode ? 'Modifier' : 'Enregistrer')}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDeleteSelectedOpen}
        title="Supprimer les departements selectionnes"
        message={`Voulez-vous vraiment supprimer ${selected.length} departement(s) selectionne(s) ?`}
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

// ----------------------------------------------------------------------

export function useDepartementTable() {
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
      // 
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




