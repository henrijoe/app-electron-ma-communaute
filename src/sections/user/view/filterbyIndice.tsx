import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  TextField,
  Typography,
  Box
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { IReduxState } from 'src/store/store'; // Import absolu en premier
import {
  IDataChoice,
  dataBapteme,
  dataNouvelAme,
  setFilterMembre,
  setTitreDocument
} from '../../../store/membreSlice'; // Import relatif après

// Fonction simplifiée avec retour implicite
export const formaterValueLabels = (tableauOriginal: any, idKey: string, labelKey: string) =>
  (Array.isArray(tableauOriginal) ? tableauOriginal : []).map((item: any) => ({
    value: item[idKey],
    label: item[labelKey]
  }));

const FilterDropdown = () => {
  const dispatch = useDispatch();

  const dataFilterMembre = useSelector((state: IReduxState) => state.membre.dataFilterMembre);

  const dataFilterDepartement = useSelector((state: IReduxState) => state.departement.dataFilterDepartement);
  const listResponsabilite = useSelector((state: IReduxState) => state.membre.listResponsabilite);
  const dataFilterGroupe = useSelector((state: IReduxState) => state.groupe.dataFilterGroupe);
  const dataFilterCellule = useSelector((state: IReduxState) => state.cellule.dataFilterCellule);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filters, setFilters] = useState({
    baptemeEauMembre: '',
    nouvelleAmeMembre: '',
    idDepartement: '',
    idResponsabilite: '',
    idCellule: '',
    idGroupe: ''
  });

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // Utilisez des noms de variables différents pour éviter les redéclarations
  const dataDepartementFormatted = formaterValueLabels(dataFilterDepartement, "idDepartement", "libelleCourtDepartement");
  const dataResponsablesFormatted = formaterValueLabels(listResponsabilite, 'idResponsabilite', 'libelleResponsabilite');
  const dataCelluleFormatted = formaterValueLabels(dataFilterCellule, 'idCellule', 'nomCellule');
  const dataGroupeFormatted = formaterValueLabels(dataFilterGroupe, 'idGroupe', 'libelleGroupe');

  const handleSearch = () => {
    let filteredData = [...(Array.isArray(dataFilterMembre) ? dataFilterMembre : [])];
    let selectedFilterValue = '';

    if (filters.baptemeEauMembre) {
      filteredData = filteredData.filter(item => item.baptemeEauMembre === filters.baptemeEauMembre);
      selectedFilterValue = filters.baptemeEauMembre;
    }
    if (filters.nouvelleAmeMembre) {
      filteredData = filteredData.filter(item => item.nouvelleAmeMembre === filters.nouvelleAmeMembre);
      selectedFilterValue = filters.nouvelleAmeMembre;
    }
    if (filters.idDepartement) {
      filteredData = filteredData.filter(item => {
        const departement = dataDepartementFormatted.find((dept: any) => dept.value === item.idDepartement);
        return departement && departement.label === filters.idDepartement;
      });
      selectedFilterValue = filters.idDepartement;
    }
    if (filters.idResponsabilite) {
      filteredData = filteredData.filter(item => {
        const responsabilite = dataResponsablesFormatted.find((res: any) => res.value === item.idResponsabilite);
        return responsabilite && responsabilite.label === filters.idResponsabilite;
      });
      selectedFilterValue = filters.idResponsabilite;
    }
    if (filters.idCellule) {
      filteredData = filteredData.filter(item => {
        const cellule = dataCelluleFormatted.find((cell: any) => cell.value === item.idCellule);
        return cellule && cellule.label === filters.idCellule;
      });
      selectedFilterValue = filters.idCellule;
    }
    if (filters.idGroupe) {
      filteredData = filteredData.filter(item => {
        const groupe = dataGroupeFormatted.find((group: any) => group.value === item.idGroupe);
        return groupe && groupe.label === filters.idGroupe;
      });
      selectedFilterValue = filters.idGroupe;
    }

    dispatch(setFilterMembre(filteredData));
    handleClose();

    // Mettre à jour le filtre appliqué
    dispatch(setTitreDocument(selectedFilterValue));

    // Réinitialiser les filtres
    setFilters({
      baptemeEauMembre: '',
      nouvelleAmeMembre: '',
      idDepartement: '',
      idResponsabilite: '',
      idCellule: '',
      idGroupe: ''
    });
  };

  return (
    <div style={{ marginTop: 0 }}>
      <Button
        aria-controls="filter-menu"
        variant="contained"
        color="inherit"
        size="small"
        aria-haspopup="true"
        onClick={handleClick}
        endIcon={<FilterAltIcon />}
        // color="primary"
        sx={{
          justifyContent: 'center',
          textAlign: 'center',
          fontSize: '12px',
        }}
      >
        Filtrer
      </Button>
      <Menu
        id="filter-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <Box sx={{ p: 2, width: 250 }}>
          <Typography variant="h6" gutterBottom>
            Filtrer
          </Typography>

          <TextField
            fullWidth
            size="small"
            margin="dense"
            select
            type="text"
            name="baptemeEauMembre"
            label="Baptisé(e)s"
            variant="outlined"
            value={filters.baptemeEauMembre}
            onChange={handleChange}
          >
            {dataBapteme?.map((option: IDataChoice) => (
              <MenuItem key={option.value} value={option.label}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            size="small"
            margin="dense"
            select
            type="text"
            name="nouvelleAmeMembre"
            label="Nouvelle âmes"
            variant="outlined"
            value={filters.nouvelleAmeMembre}
            onChange={handleChange}
          >
            {dataNouvelAme?.map((option: IDataChoice) => (
              <MenuItem key={option.value} value={option.label}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            size="small"
            margin="dense"
            select
            type="text"
            name="idDepartement"
            label="Départements"
            variant="outlined"
            value={filters.idDepartement}
            onChange={handleChange}
          >
            {dataDepartementFormatted?.map((option: IDataChoice) => (
              <MenuItem key={option.value} value={option.label}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            size="small"
            margin="dense"
            select
            type="text"
            name="idResponsabilite"
            label="Responsabilités"
            variant="outlined"
            value={filters.idResponsabilite}
            onChange={handleChange}
          >
            {dataResponsablesFormatted?.map((option: IDataChoice) => (
              <MenuItem key={option.value} value={option.label}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            size="small"
            margin="dense"
            select
            type="text"
            name="idCellule"
            label="Cellules"
            variant="outlined"
            value={filters.idCellule}
            onChange={handleChange}
          >
            {dataCelluleFormatted?.map((option: IDataChoice) => (
              <MenuItem key={option.value} value={option.label}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            size="small"
            margin="dense"
            select
            type="text"
            name="idGroupe"
            label="Groupes ethnies"
            variant="outlined"
            value={filters.idGroupe}
            onChange={handleChange}
          >
            {dataGroupeFormatted?.map((option: IDataChoice) => (
              <MenuItem key={option.value} value={option.label}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button variant="outlined" onClick={handleClose}>
              Fermer
            </Button>
            <Button variant="contained" color="primary" onClick={handleSearch}>
              Filtrer
            </Button>
          </Box>
        </Box>
      </Menu>
    </div>
  );
};

export default FilterDropdown;
