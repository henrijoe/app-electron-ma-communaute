import { buildPhotoUrl } from 'src/utils/apiClient';
import { resolveStaticAssetUrl } from 'src/utils/asset-url';
import { ICulte } from 'src/store/culteSlice';
import type { IDataChoice, IMembre } from '../../store/membreSlice';

// Fonction pour obtenir l'URL de la photo
export const getPhotoUrl = (photoMembre: string) => {
  if (!photoMembre || photoMembre === '') {
    return null;
  }

  // Les data URLs et URLs externes sont deja exploitables telles quelles.
  if (photoMembre.startsWith('data:image/') || photoMembre.startsWith('http')) {
    return photoMembre;
  }

  // Les assets du front doivent pointer vers le bundle Vite/Electron.
  if (photoMembre.startsWith('/assets/')) {
    return resolveStaticAssetUrl(photoMembre);
  }

  // Certains enregistrements stockent deja le prefixe /photos.
  if (photoMembre.startsWith('/photos/')) {
    return buildPhotoUrl(photoMembre.replace(/^\/photos\//, ''));
  }

  // Les fichiers uploades restent servis par le backend local/online.
  return buildPhotoUrl(photoMembre);
};

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
  inputData: IMembre[];
  // inputData: UserProps[];
  filterName: string;
  comparator: (a: any, b: any) => number;
};


// fonction amelioree pour appliquer les filtres avec gestion des valeurs nulles ou indefinies

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
    
    inputData = inputData.filter((user) => {
      // Creez une fonction utilitaire pour convertir en chaine et verifier
      const safeToString = (value: any): string => {
        if (value === null || value === undefined) return '';
        return String(value)?.toLowerCase();
      };

      // Verifiez chaque champ de maniere securisee
      return (
        safeToString(user.nomMembre)?.includes(searchTerm) ||
        safeToString(user.prenomMembre)?.includes(searchTerm) ||
        safeToString(user.lieuNaissMembre)?.includes(searchTerm) ||
        safeToString(user.emailMembre)?.includes(searchTerm) ||
        safeToString(user.nationaliteMembre)?.includes(searchTerm) ||
        safeToString(user.fonctionMembre)?.includes(searchTerm) ||
        safeToString(user.contactMembre)?.includes(searchTerm) ||
        safeToString(user.residenceMembre)?.includes(searchTerm) ||
        safeToString(user.civiliteMembre)?.includes(searchTerm) ||
        safeToString(user.nouvelleAmeMembre)?.includes(searchTerm) ||
        safeToString(user.baptemeEauMembre)?.includes(searchTerm) ||
        safeToString(user.capaciteSpirituelleMembre)?.includes(searchTerm) ||
        safeToString(user.situationMatrimonialeMembre)?.includes(searchTerm) ||
        safeToString(user.nomFiance)?.includes(searchTerm) ||
        safeToString(user.lieuBaptemeEauMembre)?.includes(searchTerm) ||
        safeToString(user.contactParentMembre)?.includes(searchTerm) ||
        safeToString(user.baptemeSaintEspritMembre)?.includes(searchTerm) ||
        safeToString(user.egliseOrigineMembre)?.includes(searchTerm) ||
        safeToString(user.nomPrenomParentMembre)?.includes(searchTerm) ||
        safeToString(user.lieuTravailMembre)?.includes(searchTerm) ||
        safeToString(user.nomAmiEglise)?.includes(searchTerm) ||
        safeToString(user.visiteMembre)?.includes(searchTerm) ||
        safeToString(user.raisonNonVisiteMembre)?.includes(searchTerm) ||
        safeToString(user.dateDecisionMembre)?.includes(searchTerm) ||
        safeToString(user.idNiveauEtude)?.includes(searchTerm) ||
        safeToString(user.idEglise)?.includes(searchTerm) ||
        safeToString(user.idCellule)?.includes(searchTerm) ||
        safeToString(user.idDepartement)?.includes(searchTerm) ||
        safeToString(user.idGroupe)?.includes(searchTerm) ||
        safeToString(user.idResponsabilite)?.includes(searchTerm) ||
        safeToString(user.idDomaineActivite)?.includes(searchTerm) ||
        safeToString(user.idUtilisateur)?.includes(searchTerm)
      );
    });
  }

  return inputData;
}

export const formatMembreForDisplay = (membre: IMembre) => {
  // Convertir en un nouvel objet avec les types corrects
  const formattedMembre: IMembre = {
    ...membre,
    // Conversion basee sur la valeur string
    baptemeEauMembre: convertBooleanField(membre.baptemeEauMembre),
    baptemeSaintEspritMembre: convertBooleanField(membre.baptemeSaintEspritMembre),
    nouvelleAmeMembre: convertBooleanField(membre.nouvelleAmeMembre),
    sexeMembre: convertGenreField(membre.sexeMembre),
    situationMatrimonialeMembre: convertSituationMatrimonialeField(membre.situationMatrimonialeMembre),
    capaciteSpirituelleMembre: convertCapaciteSpirituelleField(membre.capaciteSpirituelleMembre),
    visiteMembre: convertBooleanField(membre.visiteMembre),
  };
  
  return formattedMembre;
};

// Fonctions auxiliaires avec gestion de null/undefined
const convertBooleanField = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === '') {
    return 'Non'; // Valeur par defaut
  }
  
  const stringValue = String(value);
  
  if (stringValue === '1') return 'Oui';
  if (stringValue === '2') return 'Non';
  if (stringValue === 'Oui' || stringValue === 'Non') return stringValue;
  
  return 'Non'; // Valeur par defaut
};

const convertGenreField = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === '') {
    return '-'; // Valeur par defaut
  }
  
  const stringValue = String(value);
  
  if (stringValue === '1' || stringValue === 'M') return 'M';
  if (stringValue === '2' || stringValue === 'F') return 'F';
  
  return stringValue || '-';
};

const convertSituationMatrimonialeField = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === '') {
    return 'Non renseigne'; // Valeur par defaut
  }
  
  const stringValue = String(value);
  
  const map: Record<string, string> = {
    '1': 'Celibataire',
    '2': 'Celibataire sans enfant',
    '3': 'Fiance(e)',
    '4': 'Concubinage',
    '5': 'Marie(e)',
    '6': 'Divorce(e)',
    '7': 'Veuve',
    '8': 'Veuf',
    '9': 'Copain/Copine',
    '10': 'Polygame',
  };
  
  return map[stringValue] || stringValue || 'Non renseigne';
};

const convertCapaciteSpirituelleField = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === '') {
    return 'Non renseignee'; // Valeur par defaut
  }
  
  const stringValue = String(value);
  
  if (stringValue === '1') return 'Bonne';
  if (stringValue === '2') return 'Moyenne';
  if (stringValue === '3') return 'Nouvellement convertie';
  
  return stringValue || 'Non renseignee';
};

// Optionnel : fonction pour formater les champs numeriques optionnels (departement, cellule, groupe)
export const formatOptionalField = (value: number | string | null | undefined, options: IDataChoice[]): string => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  
  const stringValue = String(value);
  const option = options.find(opt => String(opt.value) === stringValue);
  
  return option?.label || stringValue || '-';
};


