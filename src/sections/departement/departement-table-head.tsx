import { useState } from 'react';
import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';

import { visuallyHidden } from './utils';

// ----------------------------------------------------------------------

export interface HeadCell {
  id: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: number | string;
  sortable?: boolean;
}

// ----------------------------------------------------------------------

type DepartementTableHeadProps = {
  order: 'asc' | 'desc';
  orderBy: string;
  rowCount: number;
  numSelected: number;
  onSort: (id: string) => void;
  onSelectAllRows: (checked: boolean, newSelecteds: string[]) => void;
  headLabel: HeadCell[];
};

export function DepartementTableHead({
  order,
  orderBy,
  rowCount,
  numSelected,
  onSort,
  onSelectAllRows,
  headLabel,
}: DepartementTableHeadProps) {
  const [selectedAll, setSelectedAll] = useState(false);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setSelectedAll(checked);
    
    // Passer un tableau vide pour désélectionner ou null pour sélectionner tous
    const newSelecteds = checked 
      ? Array.from({ length: rowCount }, (_, i) => i.toString())
      : [];
    
    onSelectAllRows(checked, newSelecteds);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={handleSelectAll}
          />
        </TableCell>

        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ width: headCell.width, minWidth: headCell.width }}
          >
            <TableSortLabel
              hideSortIcon
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={() => onSort(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box sx={{ ...visuallyHidden }}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}