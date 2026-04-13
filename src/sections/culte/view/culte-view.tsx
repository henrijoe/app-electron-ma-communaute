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

import { TableNoData } from '../table-no-data';
import { CulteTableRow } from '../culte-table-row';
import { TableEmptyRows } from '../table-empty-rows';
import { UserTableToolbar } from '../culte-table-toolbar';
import { DashboardContent } from '../../../layouts/dashboard';
import { Iconify } from '../../../components/iconify/iconify';
import { emptyRows, applyFilter, getComparator } from '../utils';
import { Scrollbar } from '../../../components/scrollbar/scrollbar';
import {
  culte,
  setDataModifiesCulte,
  deleteCulte,
  ICulte,
  setListCulte,
  addCulte,
  setListFilterCulte,
  typeCulteOptions
} from '../../../store/culteSlice';
import PrintEtatGlobal from '../etats/printEtats';
import { CulteTableHead } from '../culte-table-head';
import { IDataChoice } from '../../../store/membreSlice';




export function CulteView() {
  const dispatch = useDispatch();
  const listCulte = useSelector((state: any) => state.culte.listCulte);
  const appUserConnected = useSelector((state: any) => state.application?.userConnected);
  const authUtilisateurData = useSelector((state: any) => state.authentification?.utilisateurData);
  const currentUserId =
    Number(appUserConnected?.idUtilisateur)
    || Number(authUtilisateurData?.idUtilisateur)
    || null;

  const [loading, setLoading] = useState(true);
  const table = useCulteTable();

  // Destructurer les valeurs néccessaire de useCulteTable
  const { selected, onSelectAllRows } = table;

  const [filterName, setFilterName] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState({
    typeCulte: '',
    dirigeant: '',
    dateCulte: '',
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [maxWidth] = useState<any>('lg');
  const [data, setData] = useState({ ...culte});
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const {
    showNotification,
    NotificationComponent
  } = useNotificationSnackbar();

  const { setFocus, register, handleSubmit: formHandleSubmit, formState: { errors } } = useForm<ICulte>();

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setIsEditMode(false);
    setData({ ...culte });
  }, []);

  const handleOpenDialog = useCallback(() => setOpenDialog(true), []);


  const fetchCultes = useCallback(async () => {
    try {
      setLoading(true);
      // On recharge les cultes du compte connecté pour éviter de mélanger plusieurs communautés.
      const response = currentUserId
        ? await apiClient.getCultesByUtilisateur(currentUserId)
        : await apiClient.getCultes();
      if (response.status === 1) {
        dispatch(setListCulte(response.data));
      }
    } catch (error) {
      console.error('Error fetching cellule:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, dispatch]);


  // Fonction pour supprimer un culte
  const handleDeleteCulte = useCallback(async (idCulte: number) => {
    if (!currentUserId) {
      showNotification('Session expiree: reconnectez-vous pour supprimer un culte', 'warning');
      return;
    }

    try {
      setDeleteLoading(true);
      // Le backend exige idUtilisateur pour sécuriser la suppression.
      const response = await apiClient.deleteCulte(idCulte, currentUserId);
      if (response.status === 1) {
        dispatch(deleteCulte(idCulte));
        showNotification('Culte supprimé avec succès', 'success');
      } else {
        showNotification(`Erreur: ${response.error?.message || 'Erreur inconnue'}`, 'error');
      }
    } catch (error: any) {
      console.error('Error deleting culte:', error);
      showNotification(`Erreur: ${error.message || 'Erreur lors de la suppression'}`, 'error');
    } finally {
      setDeleteLoading(false);
    }
  }, [currentUserId, dispatch, showNotification]);

  // Fonction pour éditer un culte
  const handleEditCulte = useCallback((culteData: ICulte) => {
    setIsEditMode(true);

    // Formatage des données pour le formulaire
    const formData: any = { ...culteData };

    // Normaliser les dates
    if (formData.dateCulte && typeof formData.dateCulte === 'string') {
      formData.dateCulte = formData.dateCulte.split('T')[0];
    }

    console.log("Données pour édition:", formData);
    setData(formData);
    setOpenDialog(true);
  }, []);

  // Fonction pour mettre à jour un culte
  const handleUpdateCulte = useCallback(async (formData: ICulte) => {
    try {
      setUpdateLoading(true);

      const currentCulte = listCulte.find((c: ICulte) => c.idCulte === data.idCulte)

      const mergedData = {
        ...currentCulte,
        ...formData,
        idCulte: data.idCulte
      }

      const cleanedData: any = {
        ...mergedData,
        // Le backend filtre aussi l'update par idUtilisateur.
        idUtilisateur: currentUserId || currentCulte?.idUtilisateur || null,
      };

      console.log('Données envoyées à l\'API:', cleanedData);

      const response = await apiClient.updateCulte(cleanedData);
      if (response.status === 1) {
        dispatch(setDataModifiesCulte(cleanedData));
        handleCloseDialog();
        // Afficher notification de succès
        fetchCultes();
        showNotification('Culte modifié avec succès', 'success');
      } else {
        showNotification('Erreur lors de la modification du culte', 'error');
      }
    } catch (error) {
      console.error('Error updating culte:', error);
      showNotification('Erreur lors de la modification', 'error');
    } finally {
      setUpdateLoading(false);
    }
  }, [currentUserId, data.idCulte, listCulte, dispatch, handleCloseDialog, showNotification, fetchCultes]);


  // Fonction pour créer un culte
  const handleCreateOrUpdateCulte = useCallback(async (culteData: ICulte) => {

    if (isEditMode) {
      await handleUpdateCulte(culteData)
    } else {
      try {
        setUpdateLoading(true);

        const cleanedData = {
          ...culteData,
          nombreHommeCulte: Number(culteData.nombreHommeCulte) || 0,
          nombreFemmeCulte: Number(culteData.nombreFemmeCulte) || 0,
          idUtilisateur: currentUserId || null
        };

        const response = await apiClient.createCulte(cleanedData);
        if (response.status === 1) {
          dispatch(addCulte(response.data));
          dispatch(setListCulte(response.data));
          dispatch(setListFilterCulte(response.data));

          fetchCultes();
          handleCloseDialog();
          showNotification('Culte créé avec succès', 'success');
        } else {
          showNotification('Erreur lors de la création du culte', 'error');
        }
      } catch (error) {
        console.error('Error creating culte:', error);
        showNotification('Erreur lors de la création du culte', 'error');
      } finally {
        setUpdateLoading(false);
      }
    }
  }, [currentUserId, isEditMode, handleUpdateCulte, dispatch, fetchCultes, handleCloseDialog, showNotification]);



  // Fonction pour gérer la soumission
  const onFormSubmit = useCallback((formData: ICulte) => {
    // Validation
    if (!formData.typeCulte) {
      showNotification('Le type de culte est requis', 'warning');
      return;
    }

    if (!formData.dateCulte) {
      showNotification('La date du culte est requise', 'warning');
      return;
    }

    const culteData: ICulte = {
      ...formData,
      ...(isEditMode && data.idCulte && { idCulte: data.idCulte }),
    };

    handleCreateOrUpdateCulte(culteData);
  }, [isEditMode, data.idCulte, handleCreateOrUpdateCulte, showNotification]);

  useEffect(() => {
    fetchCultes();
  }, [fetchCultes]);


  // On combine la recherche texte avec des crit�res m�tier plus pr�cis.
  const baseFilteredData: any[] = useMemo(() => {
    const dataToFilter = Array.isArray(listCulte) ? listCulte : [];
    return applyFilter({
      inputData: dataToFilter,
      comparator: getComparator(table?.order, table?.orderBy),
      filterName,
    });
  }, [listCulte, table.order, table.orderBy, filterName]);

  const dataFiltered: any[] = useMemo(
    () =>
      baseFilteredData.filter((item) => {
        if (advancedFilters.typeCulte && String(item.typeCulte || '') !== advancedFilters.typeCulte) {
          return false;
        }

        if (
          advancedFilters.dirigeant
          && !normalizeForSearch(item.dirigeant ).includes(normalizeForSearch(advancedFilters.dirigeant))
        ) {
          return false;
        }

        if (advancedFilters.dateCulte && String(item.dateCulte || '').split('T')[0] !== advancedFilters.dateCulte) {
          return false;
        }

        return true;
      }),
    [advancedFilters, baseFilteredData]
  );

  const notFound = !dataFiltered?.length && (!!filterName || Object.values(advancedFilters).some(Boolean));
  // Trier les données
  const sortedData = useMemo(() => dataFiltered.sort((a, b) => {
    const typeA = a.typeCulte?.toLowerCase();
    const typeB = b.typeCulte?.toLowerCase();
    return table.order === 'asc'
      ? typeA?.localeCompare(typeB)
      : typeB?.localeCompare(typeA);
  }),
    [dataFiltered, table.order]
  );


  // Fonction pour gérer les changements dans les champs
  const handleChange = useCallback((event: any) => {
    const { name, value } = event.target;
    setData((prevData: any) => ({ ...prevData, [name]: value }));
  }, []);

  // Fonction pour supprimer plusieurs cultes
  const handleDeleteSelected = useCallback(async () => {
    if (selected.length === 0) return;
    if (!currentUserId) {
      showNotification('Session expiree: reconnectez-vous pour supprimer des cultes', 'warning');
      return;
    }

    try {
      setDeleteLoading(true);

      const deletePromises = selected?.map((idCulteStr: any) => {
        const idCulte = parseInt(idCulteStr, 10);
        return apiClient.deleteCulte(idCulte, currentUserId)
          .then(() => {
            dispatch(deleteCulte(idCulte));
            return { success: true, id: idCulte };
          })
          .catch((error) => {
            console.error(`Erreur suppression culte ${idCulte}:`, error);
            return { success: false, id: idCulte, error };
          });
      });

      const results = await Promise.all(deletePromises);
      const successes = results.filter(r => r.success).length;
      const failures = results.length - successes;

      onSelectAllRows(false, []);

      if (failures === 0) {
        showNotification(`${successes} culte(s) supprimé(s) avec succès`, 'success');
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
        setData({ ...culte });
        setIsEditMode(false);
      }, 100)
    }
  }, [openDialog]);

  // Nettoyage des données quand on change de membre à éditer
  useEffect(() => {
    // Réinitialiser quand isEditMode change
    if (!isEditMode) {
      setData({ ...culte });
    }
  }, [isEditMode]);
  const dialogTitle = isEditMode ? 'Modifier un culte' : 'Ajouter un culte';


  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Liste des cultes
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
            {loading ? 'Chargement...' : 'Ajouter culte'}
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
          advancedFilters={
            <AdvancedFilterMenu
              buttonLabel="Filtres"
              fields={[
                {
                  key: 'typeCulte',
                  label: 'Type de culte',
                  type: 'select',
                  options: typeCulteOptions.map((option) => ({
                    value: String(option.value),
                    label: option.label,
                  })),
                },
                { key: 'dirigeant', label: 'Dirigeant' },
                { key: 'dateCulte', label: 'Date du culte', type: 'date' },
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
                  typeCulte: '',
                  dirigeant: '',
                  dateCulte: '',
                });
                table.onResetPage();
              }}
            />
          }
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <CulteTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={sortedData?.length}
                numSelected={table.selected?.length}
                onSort={table?.onSort}
                onSelectAllRows={(checked: any) =>
                  table?.onSelectAllRows(
                    checked,
                    sortedData?.map((x) => x.idCulte?.toString() || '')
                  )
                }
                headLabel={[
                  { id: 'typeCulte', label: 'Type de culte' },
                  { id: 'dateCulte', label: 'Date' },
                  { id: 'dirigeant', label: 'Dirigeant' },
                  { id: 'themePredication', label: 'Thème' },
                  { id: 'passageBiblique', label: 'Passage biblique' },
                  { id: 'nombreHommeCulte', label: 'Hommes' },
                  { id: 'nombreFemmeCulte', label: 'Femmes' },
                  { id: 'offrandeCulte', label: 'Offrandes' },
                  { id: 'ecodim', label: 'Ecodim (Moni & Enf.)' },
                  { id: 'Action', label: 'Actions' },
                ]}
              />
              <TableBody>
                {sortedData
                  ?.slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  ?.map((row, index) => {
                    console.log(`🚀 ~ Ligne ${index}:`, row);
                    console.log(`🚀 ~ Ligne ${index} idCulte:`, row?.idCulte);

                    return (
                      <CulteTableRow
                        key={row.idCulte}
                        row={row}
                        selected={table.selected?.includes(row.idCulte?.toString() || '')}
                        onSelectRow={() => table?.onSelectRow(row.idCulte?.toString() || '')}
                        onEdit={handleEditCulte}
                        onDelete={handleDeleteCulte}
                        isDeleting={deleteLoading}
                      />
                    )
                  })}

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
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <form onSubmit={formHandleSubmit(onFormSubmit)}>
            <Grid container spacing={2}>
              {/* Type de culte */}
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  select
                  label="Type de culte *"
                  variant="outlined"
                  value={data.typeCulte}
                  {...register('typeCulte', { required: 'Le type de culte est requis' })}
                  onChange={handleChange}
                  error={!!errors.typeCulte}
                  helperText={errors.typeCulte?.message}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setFocus('dateCulte');
                    }
                  }}
                >
                  {typeCulteOptions?.map((option: IDataChoice) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Date du culte */}
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  type="date"
                  label="Date du culte *"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={data.dateCulte}
                  {...register('dateCulte', { required: 'La date est requise' })}
                  onChange={handleChange}
                  error={!!errors.dateCulte}
                  helperText={errors.dateCulte?.message}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setFocus('dirigeant');
                    }
                  }}
                />
              </Grid>

              {/* Dirigeant */}
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  label="Dirigeant"
                  variant="outlined"
                  value={data.dirigeant}
                  {...register('dirigeant')}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setFocus('predication');
                    }
                  }}
                />
              </Grid>

              {/* Prédication */}
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  label="Prédicateur"
                  variant="outlined"
                  value={data.predication}
                  {...register('predication')}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setFocus('passageBiblique');
                    }
                  }}
                />
              </Grid>

              {/* Passage biblique */}
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  label="Passage biblique"
                  variant="outlined"
                  value={data.passageBiblique}
                  {...register('passageBiblique')}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setFocus('themePredication');
                    }
                  }}
                />
              </Grid>

              {/* Thème de la prédication */}
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  label="Thème de la prédication"
                  variant="outlined"
                  value={data.themePredication}
                  {...register('themePredication')}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setFocus('nombreHommeCulte');
                    }
                  }}
                />
              </Grid>

              {/* Nombre d'hommes */}
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  type="number"
                  label="Nombre d'hommes"
                  variant="outlined"
                  value={data.nombreHommeCulte}
                  {...register('nombreHommeCulte')}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setFocus('nombreFemmeCulte');
                    }
                  }}
                />
              </Grid>

              {/* Nombre de femmes */}
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  type="number"
                  label="Nombre de femmes"
                  variant="outlined"
                  value={data.nombreFemmeCulte}
                  {...register('nombreFemmeCulte')}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setFocus('ecodim');
                    }
                  }}
                />
              </Grid>

              {/* Offrandes du culte */}
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  type="number"
                  label="Offrande du culte"
                  variant="outlined"
                  value={data.offrandeCulte}
                  {...register('offrandeCulte')}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setFocus('ecodim');
                    }
                  }}
                />
              </Grid>

              {/* Nombre Ecodim */}
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  type="number"
                  label="Nombre Ecodim"
                  variant="outlined"
                  value={data.ecodim}
                  {...register('ecodim')}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setFocus('filleEcodim');
                    }
                  }}
                />

              </Grid>

              {/* Fille Ecodim */}

                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    margin="dense"
                    type="number"
                    label="Fille Ecodim"
                    variant="outlined"
                    value={data.filleEcodim}
                    {...register('filleEcodim')}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        setFocus('offrandeEcodim');
                      }
                    }}
                  />
                </Grid>

        {/* Offrandes Ecodim */}
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  type="number"
                  label="Offrande ecodim"
                  variant="outlined"
                  value={data.offrandeEcodim}
                  {...register('offrandeEcodim')}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setFocus('resumePredication');
                    }
                  }}
                />
              </Grid>

              {/* Résumé de la prédication */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  label="Résumé de la prédication"
                  variant="outlined"
                  multiline
                  rows={4}
                  value={data.resumePredication}
                  {...register('resumePredication')}
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

export function useCulteTable() {
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





