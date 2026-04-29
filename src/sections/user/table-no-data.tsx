import type { TableRowProps } from '@mui/material/TableRow';

import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

type TableNoDataProps = TableRowProps & {
  searchQuery: string;
};

export function TableNoData({ searchQuery, ...other }: TableNoDataProps) {
  const hasSearchQuery = Boolean(searchQuery.trim());

  return (
    <TableRow {...other}>
      <TableCell align="center" colSpan={7}>
        <Box sx={{ py: 15, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Aucun resultat
          </Typography>

          <Typography variant="body2">
            {hasSearchQuery ? (
              <>
                Aucun resultat trouve pour <strong>&quot;{searchQuery}&quot;</strong>.
                <br /> Verifie l&apos;orthographe ou essaie un terme plus complet.
              </>
            ) : (
              <>
                Aucun membre ne correspond aux filtres appliques.
                <br /> Modifie ou reinitialise les filtres pour afficher des resultats.
              </>
            )}
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );
}
