import type { IGroupe } from '../../store/groupeSlice';

export const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
} as const;

export function emptyRows(page: number, rowsPerPage: number, arrayLength: number) {
  return page ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

export function getComparator<Key extends keyof any>(
  order: 'asc' | 'desc',
  orderBy: Key
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

type ApplyFilterProps = {
  inputData: IGroupe[];
  filterName: string;
  comparator: (a: any, b: any) => number;
};

export function applyFilter({ inputData, comparator, filterName }: ApplyFilterProps) {
  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  let filtered = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    const searchTerm = filterName.toLowerCase();
    const safeToString = (value: unknown): string => {
      if (value === null || value === undefined) return '';
      return String(value).toLowerCase();
    };

    filtered = filtered.filter((groupe) => (
      safeToString(groupe.libelleGroupe).includes(searchTerm)
      || safeToString(groupe.descriptionGroupe).includes(searchTerm)
      || safeToString(groupe.responsableGroupe).includes(searchTerm)
    ));
  }

  return filtered;
}

export const formatGroupeForDisplay = (groupe: IGroupe) => ({
  ...groupe,
  libelleGroupe: groupe.libelleGroupe || '',
  descriptionGroupe: groupe.descriptionGroupe || '',
  responsableGroupe: groupe.responsableGroupe || '',
});
