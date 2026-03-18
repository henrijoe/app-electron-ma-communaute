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
import { useNotificationSnackbar } from 'src/components/alert/notificationSnackbar';

import { TableNoData } from '../table-no-data';
import { DepartementTableRow } from '../departement-table-row';
import { TableEmptyRows } from '../table-empty-rows';
import { UserTableToolbar } from '../departement-table-toolbar';
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
  const utilisateurData = useSelector((state: any) => state.authentification?.utilisateurData || {});
  const currentUserId = Number(utilisateurData?.idUtilisateur || 0);

  const [loading, setLoading] = useState(true);
  const table = useDepartementTable();

  // Destructurer les valeurs nécessaires de useDepartementTable
  const { selected, onSelectAllRows } = table;

  const [filterName, setFilterName] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [maxWidth] = useState<any>('lg');
  const [data, setData] = useState({ ...departement });
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
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
      const response = await apiClient.getDepartements();
      if (response.status === 1) {
        dispatch(setListDepartement(Array.isArray(response.data) ? response.data : []));
      }
    } catch (error) {
      console.error('Error fetching departements:', error);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // Fonction pour supprimer un département
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

  // Fonction pour éditer un département
  const handleEditDepartement = useCallback((departementData: IDepartement) => {
    setIsEditMode(true);
    console.log('Donnees pour edition:', departementData);
    setData({ ...departementData });
    reset({ ...departementData });
    setOpenDialog(true);
  }, [reset]);

  // Fonction pour mettre à jour un département
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

      console.log('Données envoyées à l\'API:', mergedData);

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

  // Fonction pour créer un département
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
      showNotification('Le libell? long est requis', 'warning');
      return;
    }

    if (!data.libelleCourtDepartement) {
      showNotification('Le libell? court est requis', 'warning');
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

  // Filtrer les données
  const dataFiltered: any[] = useMemo(() => {
    const dataToFilter = Array.isArray(listDepartement) ? listDepartement : [];
    return applyFilter({
      inputData: dataToFilter,
      comparator: getComparator(table?.order, table?.orderBy),
      filterName,
    });
  }, [listDepartement, table.order, table.orderBy, filterName]);

  const notFound = !dataFiltered?.length && !!filterName;

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

      const deletePromises = selected?.map((idDepartementStr: any) => {
        const idDepartement = parseInt(idDepartementStr, 10);
        return apiClient.deleteDepartement(idDepartement, currentUserId)
          .then(() => {
            dispatch(deleteDepartement(idDepartement));
            return { success: true, id: idDepartement };
          })
          .catch((error) => {
            console.error(`Erreur suppression département ${idDepartement}:`, error);
            return { success: false, id: idDepartement, error };
          });
      });

      const results = await Promise.all(deletePromises);
      const successes = results.filter(r => r.success).length;
      const failures = results.length - successes;

      onSelectAllRows(false, []);

      if (failures === 0) {
        showNotification(`${successes} département(s) supprimé(s) avec succès`, 'success');
      } else {
        showNotification(
          `${successes} supprimé(s), ${failures} erreur(s)`,
          failures === selected.length ? 'error' : 'warning'
        );
      }

    } catch (error: any) {
      console.error('Erreur générale lors de la suppression multiple:', error);
      showNotification(`Erreur: ${error.message || 'Erreur lors de la suppression'}`, 'error');
    } finally {
      setDeleteLoading(false);
    }
  }, [currentUserId, selected, onSelectAllRows, dispatch, showNotification]);

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
          onDelete={handleDeleteSelected}
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



