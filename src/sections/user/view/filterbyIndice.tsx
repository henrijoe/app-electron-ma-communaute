import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { Box, Button, Menu, MenuItem, TextField, Typography } from '@mui/material';

import { IReduxState } from 'src/store/store';
import { normalizeForSearch, normalizeText } from 'src/utils/text';
import { dataBapteme, dataNouvelAme, setFilterMembre, setTitreDocument } from '../../../store/membreSlice';

export const formaterValueLabels = (items: any[], idKey: string, labelKey: string) =>
  (Array.isArray(items) ? items : []).map((item: any) => ({
    value: String(item[idKey]),
    label: normalizeText(item[labelKey]),
  }));

const normalizeBinaryValue = (value: unknown): '1' | '2' | '' => {
  const normalized = normalizeForSearch(value);

  if (!normalized) return '';
  if (['1', 'oui', 'true', 'vrai', 'yes'].includes(normalized)) return '1';
  if (['0', '2', 'non', 'false', 'faux', 'no'].includes(normalized)) return '2';

  return '';
};

const FilterDropdown = () => {
  const dispatch = useDispatch();
  const baseMembres = useSelector((state: IReduxState) => state.membre.dataFilterMembre);
  const listDepartement = useSelector((state: IReduxState) => state.departement.listDepartement);
  const listResponsabilite = useSelector((state: IReduxState) => state.membre.listResponsabilite);
  const listGroupe = useSelector((state: IReduxState) => state.groupe.listGroupe);
  const listCellule = useSelector((state: IReduxState) => state.cellule.listCellule);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filters, setFilters] = useState({
    baptemeEauMembre: '',
    nouvelleAmeMembre: '',
    idDepartement: '',
    idResponsabilite: '',
    idCellule: '',
    idGroupe: '',
    fonctionMembre: '',
  });

  const departementOptions = formaterValueLabels(listDepartement as any[], 'idDepartement', 'libelleLongDepartement');
  const responsabiliteOptions = formaterValueLabels(listResponsabilite as any[], 'idResponsabilite', 'libelleResponsabilite');
  const celluleOptions = formaterValueLabels(listCellule as any[], 'idCellule', 'nomCellule');
  const groupeOptions = formaterValueLabels(listGroupe as any[], 'idGroupe', 'libelleGroupe');
  const fonctionOptions = useMemo(
    () =>
      Array.from(
        new Map(
          (Array.isArray(baseMembres) ? baseMembres : [])
            .map((item: any) => String(item?.fonctionMembre || '').trim())
            .filter(Boolean)
            .map((fonction) => [normalizeForSearch(fonction), { value: fonction, label: normalizeText(fonction) }])
        ).values()
      ),
    [baseMembres]
  );

  const handleSearch = () => {
    let filteredData = [...(Array.isArray(baseMembres) ? baseMembres : [])];

    if (filters.baptemeEauMembre) {
      filteredData = filteredData.filter((item) => normalizeBinaryValue(item.baptemeEauMembre) === normalizeBinaryValue(filters.baptemeEauMembre));
    }
    if (filters.nouvelleAmeMembre) {
      filteredData = filteredData.filter((item) => normalizeBinaryValue(item.nouvelleAmeMembre) === normalizeBinaryValue(filters.nouvelleAmeMembre));
    }
    if (filters.idDepartement) {
      filteredData = filteredData.filter((item) => String(item.idDepartement || '') === filters.idDepartement);
    }
    if (filters.idResponsabilite) {
      filteredData = filteredData.filter((item) => String(item.idResponsabilite || '') === filters.idResponsabilite);
    }
    if (filters.idCellule) {
      filteredData = filteredData.filter((item) => String(item.idCellule || '') === filters.idCellule);
    }
    if (filters.idGroupe) {
      filteredData = filteredData.filter((item) => String(item.idGroupe || '') === filters.idGroupe);
    }
    if (filters.fonctionMembre) {
      filteredData = filteredData.filter(
        (item) => normalizeForSearch(item.fonctionMembre) === normalizeForSearch(filters.fonctionMembre)
      );
    }

    const activeLabel = departementOptions.find((item) => item.value === filters.idDepartement)?.label
      || responsabiliteOptions.find((item) => item.value === filters.idResponsabilite)?.label
      || celluleOptions.find((item) => item.value === filters.idCellule)?.label
      || groupeOptions.find((item) => item.value === filters.idGroupe)?.label
      || fonctionOptions.find((item) => item.value === filters.fonctionMembre)?.label
      || normalizeText(dataBapteme.find((item) => String(item.value) === filters.baptemeEauMembre)?.label)
      || normalizeText(dataNouvelAme.find((item) => String(item.value) === filters.nouvelleAmeMembre)?.label)
      || '';

    dispatch(setFilterMembre(filteredData));
    dispatch(setTitreDocument(activeLabel));
    setAnchorEl(null);
  };

  const handleReset = () => {
    dispatch(setFilterMembre([]));
    dispatch(setTitreDocument(''));
    setFilters({
      baptemeEauMembre: '',
      nouvelleAmeMembre: '',
      idDepartement: '',
      idResponsabilite: '',
      idCellule: '',
      idGroupe: '',
      fonctionMembre: '',
    });
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        aria-controls="filter-menu"
        variant="contained"
        color="inherit"
        size="small"
        aria-haspopup="true"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        endIcon={<FilterAltIcon />}
        sx={{ justifyContent: 'center', textAlign: 'center', fontSize: '12px' }}
      >
        Filtrer
      </Button>

      <Menu id="filter-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <Box sx={{ p: 2, width: 280 }}>
          <Typography variant="h6" gutterBottom>Filtrer</Typography>

          <TextField fullWidth size="small" margin="dense" select name="baptemeEauMembre" label="Bapteme d'eau" value={filters.baptemeEauMembre} onChange={(e) => setFilters({ ...filters, baptemeEauMembre: e.target.value })}>
            {dataBapteme.map((option) => <MenuItem key={option.value} value={String(option.value)}>{normalizeText(option.label)}</MenuItem>)}
          </TextField>

          <TextField fullWidth size="small" margin="dense" select name="nouvelleAmeMembre" label="Nouvelle ame" value={filters.nouvelleAmeMembre} onChange={(e) => setFilters({ ...filters, nouvelleAmeMembre: e.target.value })}>
            {dataNouvelAme.map((option) => <MenuItem key={option.value} value={String(option.value)}>{normalizeText(option.label)}</MenuItem>)}
          </TextField>

          <TextField fullWidth size="small" margin="dense" select name="idDepartement" label="Departement" value={filters.idDepartement} onChange={(e) => setFilters({ ...filters, idDepartement: e.target.value })}>
            {departementOptions.map((option) => <MenuItem key={option.value} value={option.value}>{normalizeText(option.label)}</MenuItem>)}
          </TextField>

          <TextField fullWidth size="small" margin="dense" select name="idResponsabilite" label="Responsabilite" value={filters.idResponsabilite} onChange={(e) => setFilters({ ...filters, idResponsabilite: e.target.value })}>
            {responsabiliteOptions.map((option) => <MenuItem key={option.value} value={option.value}>{normalizeText(option.label)}</MenuItem>)}
          </TextField>

          <TextField fullWidth size="small" margin="dense" select name="idCellule" label="Cellule" value={filters.idCellule} onChange={(e) => setFilters({ ...filters, idCellule: e.target.value })}>
            {celluleOptions.map((option) => <MenuItem key={option.value} value={option.value}>{normalizeText(option.label)}</MenuItem>)}
          </TextField>

          <TextField fullWidth size="small" margin="dense" select name="idGroupe" label="Groupe ethnique" value={filters.idGroupe} onChange={(e) => setFilters({ ...filters, idGroupe: e.target.value })}>
            {groupeOptions.map((option) => <MenuItem key={option.value} value={option.value}>{normalizeText(option.label)}</MenuItem>)}
          </TextField>

          <TextField fullWidth size="small" margin="dense" select name="fonctionMembre" label="Fonction" value={filters.fonctionMembre} onChange={(e) => setFilters({ ...filters, fonctionMembre: e.target.value })}>
            {fonctionOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
          </TextField>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button variant="outlined" onClick={handleReset}>Reinitialiser</Button>
            <Button variant="contained" onClick={handleSearch}>Appliquer</Button>
          </Box>
        </Box>
      </Menu>
    </div>
  );
};

export default FilterDropdown;

