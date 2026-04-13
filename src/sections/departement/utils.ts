// src/sections/departement/utils.ts
import type { IDepartement } from '../../store/departementSlice';

// ----------------------------------------------------------------------

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

// ----------------------------------------------------------------------

export function emptyRows(page: number, rowsPerPage: number, arrayLength: number) {
  return page ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
}

// ----------------------------------------------------------------------

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

// ----------------------------------------------------------------------

export function getComparator<Key extends keyof any>(
  order: 'asc' | 'desc',
  orderBy: Key
): (
  a: {
    [key in Key]: number | string;
  },
  b: {
    [key in Key]: number | string;
  }
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  inputData: IDepartement[];
  filterName: string;
  comparator: (a: any, b: any) => number;
};

// Fonction pour appliquer les filtres pour les départements
export function applyFilter({ inputData, comparator, filterName }: ApplyFilterProps) {
  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    const searchTerm = filterName?.toLowerCase();
    
    inputData = inputData.filter((departement) => {
      // Fonction utilitaire pour convertir en chaîne de manière sécurisée
      const safeToString = (value: any): string => {
        if (value === null || value === undefined) return '';
        return String(value)?.toLowerCase();
      };

      // Vérifier chaque champ du département
      return (
        safeToString(departement.libelleLongDepartement)?.includes(searchTerm) ||
        safeToString(departement.libelleCourtDepartement)?.includes(searchTerm) ||
        safeToString(departement.sloganDepartement)?.includes(searchTerm) ||
        safeToString(departement.responsableDepartement)?.includes(searchTerm)
      );
    });
  }

  return inputData;
}

// ----------------------------------------------------------------------

// Fonction pour formater un département pour l'affichage
export const formatDepartementForDisplay = (departement: IDepartement) => {
  if (!departement) return null;
  
  return {
    ...departement,
    // Formater les champs longs
    libelleLongTruncated: departement.libelleLongDepartement 
      ? departement.libelleLongDepartement.length > 50 
        ? `${departement.libelleLongDepartement.substring(0, 50)}...`
        : departement.libelleLongDepartement
      : '',
    
    sloganTruncated: departement.sloganDepartement 
      ? departement.sloganDepartement.length > 30 
        ? `${departement.sloganDepartement.substring(0, 30)}...`
        : departement.sloganDepartement
      : '',
    
    // Formater le libellé court (majuscules)
    libelleCourtUpperCase: departement.libelleCourtDepartement 
      ? departement.libelleCourtDepartement.toUpperCase()
      : '',
  };
};

// ----------------------------------------------------------------------

// Fonction pour valider un département avant enregistrement
export const validateDepartement = (departement: Partial<IDepartement>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!departement.libelleLongDepartement || departement.libelleLongDepartement.trim() === '') {
    errors.push('Le libellé long est requis');
  }

  if (!departement.libelleCourtDepartement || departement.libelleCourtDepartement.trim() === '') {
    errors.push('Le libellé court est requis');
  }

  // Validation de la longueur des champs
  if (departement.libelleLongDepartement && departement.libelleLongDepartement.length > 100) {
    errors.push('Le libellé long ne doit pas dépasser 100 caractères');
  }

  if (departement.libelleCourtDepartement && departement.libelleCourtDepartement.length > 20) {
    errors.push('Le libellé court ne doit pas dépasser 20 caractères');
  }

  if (departement.sloganDepartement && departement.sloganDepartement.length > 200) {
    errors.push('Le slogan ne doit pas dépasser 200 caractères');
  }

  if (departement.responsableDepartement && departement.responsableDepartement.length > 100) {
    errors.push('Le nom du responsable ne doit pas dépasser 100 caractères');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ----------------------------------------------------------------------

// Fonction pour trier les départements par libellé
export const sortDepartementsByLibelle = (departements: IDepartement[], ascending = true): IDepartement[] => 
  [...departements].sort((a, b) => {
    const libelleA = a.libelleLongDepartement?.toLowerCase() || '';
    const libelleB = b.libelleLongDepartement?.toLowerCase() || '';
    
    return ascending 
      ? libelleA.localeCompare(libelleB)
      : libelleB.localeCompare(libelleA);
  });

// ----------------------------------------------------------------------

// Fonction pour filtrer les départements par recherche textuelle
export const filterDepartementsBySearch = (departements: IDepartement[], searchTerm: string): IDepartement[] => {
  if (!searchTerm || searchTerm.trim() === '') return departements;
  
  const term = searchTerm.toLowerCase().trim();
  
  return departements.filter((departement) => (
    (departement.libelleLongDepartement?.toLowerCase() || '').includes(term) ||
    (departement.libelleCourtDepartement?.toLowerCase() || '').includes(term) ||
    (departement.sloganDepartement?.toLowerCase() || '').includes(term) ||
    (departement.responsableDepartement?.toLowerCase() || '').includes(term)
  ));
};

// ----------------------------------------------------------------------

// Fonction pour obtenir les statistiques des départements
export const getDepartementStats = (departements: IDepartement[]) => {
  const stats = {
    totalDepartements: departements.length,
    departementsAvecSlogan: 0,
    departementsAvecResponsable: 0,
    departementsParResponsable: {} as Record<string, number>,
  };

  departements.forEach((departement) => {
    // Compter les départements avec slogan
    if (departement.sloganDepartement && departement.sloganDepartement.trim() !== '') {
      stats.departementsAvecSlogan += 1;
    }

    // Compter les départements avec responsable
    if (departement.responsableDepartement && departement.responsableDepartement.trim() !== '') {
      stats.departementsAvecResponsable += 1;
      
      // Statistiques par responsable
      const responsable = departement.responsableDepartement;
      if (!stats.departementsParResponsable[responsable]) {
        stats.departementsParResponsable[responsable] = 0;
      }
      stats.departementsParResponsable[responsable] += 1;
    }
  });

  return stats;
};

// ----------------------------------------------------------------------

// Fonction pour exporter les départements au format CSV
export const exportDepartementsToCSV = (departements: IDepartement[]): string => {
  const headers = [
    'ID',
    'Libellé long',
    'Libellé court',
    'Slogan',
    'Responsable',
  ];

  const rows = departements.map((departement) => [
    departement.idDepartement?.toString() || '',
    departement.libelleLongDepartement || '',
    departement.libelleCourtDepartement || '',
    departement.sloganDepartement || '',
    departement.responsableDepartement || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  return csvContent;
};

// ----------------------------------------------------------------------

// Fonction pour générer un ID court pour un département (utile pour les références)
export const generateDepartementCode = (departement: IDepartement): string => {
  if (!departement.libelleCourtDepartement || !departement.idDepartement) {
    return '';
  }
  
  const code = departement.libelleCourtDepartement
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '') // Garder seulement lettres et chiffres
    .substring(0, 4); // Limiter à 4 caractères
  
  const id = departement.idDepartement.toString().padStart(3, '0');
  
  return `${code}-${id}`;
};

// ----------------------------------------------------------------------

// Fonction pour vérifier si un département est complet (tous les champs requis remplis)
export const isDepartementComplet = (departement: IDepartement): boolean => Boolean(
  departement.libelleLongDepartement &&
  departement.libelleLongDepartement.trim() !== '' &&
  departement.libelleCourtDepartement &&
  departement.libelleCourtDepartement.trim() !== ''
);

// ----------------------------------------------------------------------

// Fonction pour obtenir le pourcentage de complétion d'un département
export const getCompletetionPercentage = (departement: IDepartement): number => {
  const fields = [
    'libelleLongDepartement',
    'libelleCourtDepartement',
    'sloganDepartement',
    'responsableDepartement',
  ] as const;
  
  let completed = 0;
  
  fields.forEach(field => {
    if (departement[field] && departement[field]!.toString().trim() !== '') {
      completed += 1;
    }
  });
  
  return Math.round((completed / fields.length) * 100);
};

// ----------------------------------------------------------------------

// Fonction pour formater les données pour un graphique de statistiques
export const formatStatsForChart = (departements: IDepartement[]) => {
  const stats = getDepartementStats(departements);
  
  return {
    labels: ['Total', 'Avec slogan', 'Avec responsable', 'Complets'],
    datasets: [
      {
        label: 'Statistiques des départements',
        data: [
          stats.totalDepartements,
          stats.departementsAvecSlogan,
          stats.departementsAvecResponsable,
          departements.filter(isDepartementComplet).length,
        ],
        backgroundColor: [
          '#4caf50',
          '#2196f3',
          '#ff9800',
          '#9c27b0',
        ],
      },
    ],
  };
};

// ----------------------------------------------------------------------

// Fonction pour obtenir les responsables uniques
export const getUniqueResponsables = (departements: IDepartement[]): string[] => {
  const responsables = new Set<string>();
  
  departements.forEach((departement) => {
    if (departement.responsableDepartement && departement.responsableDepartement.trim() !== '') {
      responsables.add(departement.responsableDepartement);
    }
  });
  
  return Array.from(responsables).sort();
};

// ----------------------------------------------------------------------

// Fonction pour formater un département pour l'API
export const formatDepartementForAPI = (departement: Partial<IDepartement>): any => ({
  idDepartement: departement.idDepartement,
  idUtilisateur: departement.idUtilisateur || null,
  libelleLongDepartement: departement.libelleLongDepartement?.trim() || '',
  libelleCourtDepartement: departement.libelleCourtDepartement?.trim() || '',
  sloganDepartement: departement.sloganDepartement?.trim() || null,
  responsableDepartement: departement.responsableDepartement?.trim() || null,
});

// ----------------------------------------------------------------------

// Fonction pour valider l'unicité du libellé court
export const isLibelleCourtUnique = (
  departements: IDepartement[], 
  libelleCourt: string, 
  currentId?: number
): boolean => {
  if (!libelleCourt) return true;
  
  const normalizedLibelle = libelleCourt.trim().toLowerCase();
  
  return !departements.some((dep) => {
    // Exclure le département courant en édition
    if (currentId && dep.idDepartement === currentId) return false;
    
    return dep.libelleCourtDepartement?.toLowerCase() === normalizedLibelle;
  });
};

// ----------------------------------------------------------------------

// Fonction pour valider l'unicité du libellé long
export const isLibelleLongUnique = (
  departements: IDepartement[], 
  libelleLong: string, 
  currentId?: number
): boolean => {
  if (!libelleLong) return true;
  
  const normalizedLibelle = libelleLong.trim().toLowerCase();
  
  return !departements.some((dep) => {
    // Exclure le département courant en édition
    if (currentId && dep.idDepartement === currentId) return false;
    
    return dep.libelleLongDepartement?.toLowerCase() === normalizedLibelle;
  });
};