// src/sections/culte/utils.ts
import type { ICulte } from '../../store/culteSlice';

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
  inputData: ICulte[];
  filterName: string;
  comparator: (a: any, b: any) => number;
};

// Fonction améliorée pour appliquer les filtres pour les cultes
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
    
    inputData = inputData.filter((culte) => {
      // Créez une fonction utilitaire pour convertir en chaîne et vérifier
      const safeToString = (value: any): string => {
        if (value === null || value === undefined) return '';
        return String(value)?.toLowerCase();
      };

      // Vérifiez chaque champ de culte de manière sécurisée
      return (
        safeToString(culte.typeCulte)?.includes(searchTerm) ||
        safeToString(culte.dateCulte)?.includes(searchTerm) ||
        safeToString(culte.dirigeant)?.includes(searchTerm) ||
        safeToString(culte.predication)?.includes(searchTerm) ||
        safeToString(culte.passageBiblique)?.includes(searchTerm) ||
        safeToString(culte.themePredication)?.includes(searchTerm) ||
        safeToString(culte.nombreHommeCulte)?.includes(searchTerm) ||
        safeToString(culte.nombreFemmeCulte)?.includes(searchTerm) ||
        safeToString(culte.ecodim)?.includes(searchTerm) ||
        safeToString(culte.filleEcodim)?.includes(searchTerm) ||
        safeToString(culte.resumePredication)?.includes(searchTerm) ||
        // Chercher dans les valeurs formatées aussi
        safeToString(formatDateForDisplay(culte.dateCulte))?.includes(searchTerm) ||
        safeToString(getEcodimLabel(culte.ecodim))?.includes(searchTerm)
      );
    });
  }

  return inputData;
}

// ----------------------------------------------------------------------

// Fonction pour vérifier si une date est valide
// Fonction pour vérifier si une date est valide
const isValidDate = (date: Date): boolean => !Number.isNaN(date.getTime());
// Fonction pour formater la date
export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Vérifier si la date est valide
    if (!isValidDate(date)) {
      return dateString;
    }
    
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

// Fonction pour formater la date en format court (pour les tableaux)
export const formatDateShort = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    if (!isValidDate(date)) {
      return dateString;
    }
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

// Fonction pour obtenir le label du type de culte
export const getTypeCulteLabel = (type: string): string => {
  if (!type) return '';
  
  const types: Record<string, string> = {
    Dimanche: 'Culte du dimanche',
    Mardi: 'Culte de mardi',
    Jeudi: 'Culte de jeudi',
    Vendredi: 'Reunion de jeunesse',
    Samedi: 'Culte du samedi',
    Spécial: 'Culte spécial',
  };
  
  return types[type] || type;
};

// Fonction pour obtenir le label de l'ecodim
export const getEcodimLabel = (ecodim: string): string => {
  if (!ecodim) return '';
  
  const ecodims: Record<string, string> = {
    '1': 'Oui',
    '2': 'Non',
    oui: 'Oui',
    non: 'Non',
  };
  
  return ecodims[ecodim] || ecodim;
};

// Fonction pour formater un culte pour l'affichage
export const formatCulteForDisplay = (culte: ICulte) => {
  if (!culte) return null;
  
  return {
    ...culte,
    // Formater les dates
    dateCulte: formatDateForDisplay(culte.dateCulte),
    
    // Formater les labels
    typeCulteLabel: getTypeCulteLabel(culte.typeCulte),
    
    // Formater les nombres
    nombreHommeCulteFormatted: culte.nombreHommeCulte || '0',
    nombreFemmeCulteFormatted: culte.nombreFemmeCulte || '0',
    
    // Formater les champs de texte longs
    resumePredicationTruncated: culte.resumePredication 
      ? culte.resumePredication.length > 100 
        ? `${culte.resumePredication.substring(0, 100)}...`
        : culte.resumePredication
      : '',
    
    themePredicationTruncated: culte.themePredication 
      ? culte.themePredication.length > 50 
        ? `${culte.themePredication.substring(0, 50)}...`
        : culte.themePredication
      : '',
  };
};



// Fonction pour obtenir le total des participants
export const getTotalParticipants = (culte: ICulte): number => 
  (Number(culte.nombreHommeCulte) || 0) + (Number(culte.nombreFemmeCulte) || 0);


// Fonction pour valider un culte avant enregistrement
export const validateCulte = (culte: Partial<ICulte>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!culte.typeCulte || culte.typeCulte.trim() === '') {
    errors.push('Le type de culte est requis');
  }

  if (!culte.dateCulte || culte.dateCulte.trim() === '') {
    errors.push('La date du culte est requise');
  } else {
    try {
      const date = new Date(culte.dateCulte);
      if (Number.isNaN(date.getTime())) {
        errors.push('La date du culte n\'est pas valide');
      }
    } catch (error) {
      errors.push('La date du culte n\'est pas valide');
    }
  }

  // Validation des nombres
  if (culte.nombreHommeCulte) {
    const hommes = Number(culte.nombreHommeCulte);
    if (Number.isNaN(hommes) || hommes < 0) {
      errors.push('Le nombre d\'hommes doit être un nombre positif');
    }
  }

  if (culte.nombreFemmeCulte) {
    const femmes = Number(culte.nombreFemmeCulte);
    if (Number.isNaN(femmes) || femmes < 0) {
      errors.push('Le nombre de femmes doit être un nombre positif');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Fonction pour trier les cultes par date (du plus récent au plus ancien)
export const sortCultesByDate = (cultes: ICulte[], ascending = false): ICulte[] => 
  [...cultes].sort((a, b) => {
    const dateA = new Date(a.dateCulte).getTime();
    const dateB = new Date(b.dateCulte).getTime();
    
    return ascending ? dateA - dateB : dateB - dateA;
  });

// Fonction pour filtrer les cultes par type
export const filterCultesByType = (cultes: ICulte[], type: string): ICulte[] => {
  if (!type || type === 'Tous') return cultes;
  
  return cultes.filter((culte) => 
    culte.typeCulte?.toLowerCase() === type.toLowerCase() ||
    getTypeCulteLabel(culte.typeCulte)?.toLowerCase() === type.toLowerCase()
  );
};

// Fonction pour filtrer les cultes par période
export const filterCultesByPeriod = (cultes: ICulte[], startDate: string, endDate: string): ICulte[] => {
  if (!startDate || !endDate) return cultes;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    console.error('Dates de période invalides');
    return cultes;
  }
  
  return cultes.filter((culte) => {
    try {
      const culteDate = new Date(culte.dateCulte);
      return !Number.isNaN(culteDate.getTime()) && culteDate >= start && culteDate <= end;
    } catch (error) {
      return false;
    }
  });
};

// Fonction pour obtenir les statistiques des cultes
export const getCulteStats = (cultes: ICulte[]) => {
  const stats = {
    totalCultes: cultes.length,
    totalParticipants: 0,
    totalHommes: 0,
    totalFemmes: 0,
    byType: {} as Record<string, { count: number; participants: number }>,
    byMonth: {} as Record<string, { count: number; participants: number }>,
  };

  cultes.forEach((culte) => {
    const hommes = Number(culte.nombreHommeCulte) || 0;
    const femmes = Number(culte.nombreFemmeCulte) || 0;
    const total = hommes + femmes;
    
    stats.totalParticipants += total;
    stats.totalHommes += hommes;
    stats.totalFemmes += femmes;

    // Statistiques par type
    const type = culte.typeCulte || 'Inconnu';
    if (!stats.byType[type]) {
      stats.byType[type] = { count: 0, participants: 0 };
    }
    stats.byType[type].count += 1;
    stats.byType[type].participants += total;

    // Statistiques par mois
    try {
      const date = new Date(culte.dateCulte);
      if (!Number.isNaN(date.getTime())) {
        const monthYear = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        if (!stats.byMonth[monthYear]) {
          stats.byMonth[monthYear] = { count: 0, participants: 0 };
        }
        stats.byMonth[monthYear].count += 1;
        stats.byMonth[monthYear].participants += total;
      }
    } catch (error) {
      // Ignorer les dates invalides
    }
  });

  return stats;
};

// Fonction pour exporter les cultes au format CSV
export const exportCultesToCSV = (cultes: ICulte[]): string => {
  const headers = [
    'Type de culte',
    'Date',
    'Dirigeant',
    'Thème',
    'Passage biblique',
    'Hommes',
    'Femmes',
    'Total participants',
    'Ecodim',
    'Fille Ecodim',
    'Prédication',
    'Résumé',
  ];

  const rows = cultes.map((culte) => [
    getTypeCulteLabel(culte.typeCulte),
    // formatDateShort(culte.dateCulte),
    culte.dirigeant || '',
    culte.themePredication || '',
    culte.passageBiblique || '',
    culte.nombreHommeCulte || '0',
    culte.nombreFemmeCulte || '0',
    getTotalParticipants(culte).toString(),
    getEcodimLabel(culte.ecodim),
    culte.predication || '',
    culte.resumePredication || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
};

// Fonction utilitaire pour convertir les valeurs booléennes
export const convertBooleanValue = (value: string | number | undefined): string => {
  if (value === undefined || value === null) return 'Non';
  
  const stringValue = String(value);
  if (stringValue === '1' || stringValue.toLowerCase() === 'oui' || stringValue.toLowerCase() === 'true') {
    return 'Oui';
  }
  if (stringValue === '2' || stringValue.toLowerCase() === 'non' || stringValue.toLowerCase() === 'false') {
    return 'Non';
  }
  
  return 'Non';
};

// Fonction pour obtenir les options de type de culte pour les sélections
export const getTypeCulteOptions = (): Array<{ value: string; label: string }> => [
  { value: 'Dimanche', label: 'Culte du dimanche' },
  { value: 'Mardi', label: 'Culte de mardi' },
  { value: 'Jeudi', label: 'Culte de jeudi' },
  { value: 'Samedi', label: 'Culte du samedi' },
  { value: 'Spécial', label: 'Culte spécial' },
];

