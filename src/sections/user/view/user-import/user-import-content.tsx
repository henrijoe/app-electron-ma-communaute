import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import * as XLSX from 'xlsx';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import SaveRounded from '@mui/icons-material/SaveRounded';

import { useNotificationSnackbar } from 'src/components/alert/notificationSnackbar';
import { apiClient } from 'src/utils/apiClient';
import {
  dataBapteme,
  dataCapaciteSpirituelle,
  dataCivilite,
  dataGenre,
  dataNouvelAme,
  dataResponsabilite,
  dataSituationMembre,
  type IDataChoice,
  type IMembre,
} from 'src/store/membreSlice';
import type { IReduxState } from 'src/store/store';

type RawExcelRow = Record<string, unknown>;

type PreviewRow = {
  index: number;
  source: RawExcelRow;
  payload: IMembre | null;
  errors: string[];
};

type ReferenceItem = {
  id: number;
  label: string;
};

type UserImportContentProps = {
  onClose: () => void;
  onImported?: () => void | Promise<void>;
  pendingFile?: File | null;
  pendingFileToken?: number;
};

const TEMPLATE_HEADERS = [
  'nomMembre',
  'contactMembre',
  'sexeMembre',
  'dateNaissMembre',
  'residenceMembre',
  'fonctionMembre',
  'prenomMembre',
  'civiliteMembre',
  'lieuNaissMembre',
  'nationaliteMembre',
  'emailMembre',
  'ethnieMembre',
  'situationMatrimonialeMembre',
  'nomFiance',
  'dateMariageMembre',
  'egliseOrigineMembre',
  'dateConversionMembre',
  'nouvelleAmeMembre',
  'baptemeEauMembre',
  'lieuBaptemeEauMembre',
  'baptemeSaintEspritMembre',
  'capaciteSpirituelleMembre',
  'departement',
  'cellule',
  'groupe',
  'responsabilite',
];

const TEMPLATE_ROWS = [
  {
    nomMembre: '',
    prenomMembre: '',
    contactMembre: '',
    sexeMembre: '',
    civiliteMembre: '',
    dateNaissMembre: '',
    lieuNaissMembre: '',
    nationaliteMembre: '',
    emailMembre: '',
    ethnieMembre: '',
    residenceMembre: '',
    fonctionMembre: '',
    situationMatrimonialeMembre: '',
    nomFiance: '',
    dateMariageMembre: '',
    egliseOrigineMembre: '',
    dateConversionMembre: '',
    nouvelleAmeMembre: '',
    baptemeEauMembre: '',
    lieuBaptemeEauMembre: '',
    baptemeSaintEspritMembre: '',
    capaciteSpirituelleMembre: '',
    departement: '',
    cellule: '',
    groupe: '',
    responsabilite: '',
  },
];

const normalizeText = (value: unknown): string => String(value ?? '').trim();

const buildTemplateSheet = () => {
  const worksheet = XLSX.utils.json_to_sheet(TEMPLATE_ROWS, { header: TEMPLATE_HEADERS });
  worksheet['!cols'] = TEMPLATE_HEADERS.map((header) => ({
    wch: Math.max(header.length + 2, 18),
  }));

  const contactColumnIndex = TEMPLATE_HEADERS.indexOf('contactMembre');
  const dateColumnIndex = TEMPLATE_HEADERS.indexOf('dateNaissMembre');
  const contactCell = XLSX.utils.encode_cell({ c: contactColumnIndex, r: 1 });
  const dateCell = XLSX.utils.encode_cell({ c: dateColumnIndex, r: 1 });

  if (worksheet[contactCell]) {
    worksheet[contactCell].t = 's';
    worksheet[contactCell].z = '@';
    worksheet[contactCell].v = String(worksheet[contactCell].v ?? '');
  }

  if (worksheet[dateCell]) {
    worksheet[dateCell].t = 's';
    worksheet[dateCell].z = '@';
    worksheet[dateCell].v = String(worksheet[dateCell].v ?? '');
  }

  return worksheet;
};

const buildInstructionsSheet = () => {
  const instructions = [
    { champ: 'nomMembre', regle: 'Obligatoire' },
    { champ: 'contactMembre', regle: 'Obligatoire - colonne a conserver en texte pour garder le 0 initial' },
    { champ: 'sexeMembre', regle: 'Obligatoire - valeurs conseillees: M, Masculin, F, Feminin' },
    { champ: 'dateNaissMembre', regle: 'Obligatoire - format recommande: JJ-MM-AAAA' },
    { champ: 'residenceMembre', regle: 'Obligatoire - quartier ou lieu d habitation' },
    { champ: 'fonctionMembre', regle: 'Obligatoire' },
    { champ: 'prenomMembre', regle: 'Optionnel' },
    { champ: 'civiliteMembre', regle: 'Optionnel - exemples: Monsieur, Madame, Mademoiselle' },
    { champ: 'departement', regle: 'Doit correspondre a un departement existant' },
    { champ: 'cellule', regle: 'Doit correspondre a une cellule existante' },
    { champ: 'groupe', regle: 'Doit correspondre a un groupe existant' },
    { champ: 'responsabilite', regle: 'Doit correspondre a une responsabilite existante' },
  ];

  const worksheet = XLSX.utils.json_to_sheet(instructions);
  worksheet['!cols'] = [
    { wch: 28 },
    { wch: 70 },
  ];
  return worksheet;
};

const buildReferenceSheet = (
  departements: ReferenceItem[],
  cellules: ReferenceItem[],
  groupes: ReferenceItem[]
) => {
  const maxLength = Math.max(
    dataCivilite.length,
    dataGenre.length,
    dataSituationMembre.length,
    dataNouvelAme.length,
    dataBapteme.length,
    dataCapaciteSpirituelle.length,
    dataResponsabilite.length,
    departements.length,
    cellules.length,
    groupes.length,
    1
  );

  const rows = Array.from({ length: maxLength }, (_, index) => ({
    civilite: dataCivilite[index]?.label || '',
    sexe: dataGenre[index]?.label || '',
    situationMatrimoniale: dataSituationMembre[index]?.label || '',
    nouvelleAme: dataNouvelAme[index]?.label || '',
    bapteme: dataBapteme[index]?.label || '',
    capaciteSpirituelle: dataCapaciteSpirituelle[index]?.label || '',
    responsabilite: dataResponsabilite[index]?.label || '',
    departement: departements[index]?.label || '',
    cellule: cellules[index]?.label || '',
    groupe: groupes[index]?.label || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 22 },
    { wch: 18 },
    { wch: 24 },
    { wch: 18 },
    { wch: 18 },
    { wch: 22 },
    { wch: 24 },
    { wch: 28 },
    { wch: 28 },
    { wch: 28 },
  ];
  return worksheet;
};

export const downloadMembreImportTemplate = (
  departements: ReferenceItem[],
  cellules: ReferenceItem[],
  groupes: ReferenceItem[]
) => {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, buildTemplateSheet(), 'Modele');
  XLSX.utils.book_append_sheet(workbook, buildInstructionsSheet(), 'Instructions');
  XLSX.utils.book_append_sheet(workbook, buildReferenceSheet(departements, cellules, groupes), 'References');
  XLSX.writeFile(workbook, 'template-import-membres.xlsx');
};

const normalizeKey = (value: string): string =>
  value
    .normalize('NFD')
.replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const formatExcelDate = (value: unknown): string | null => {
  const raw = normalizeText(value);

  if (!raw) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const frenchMatch = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (frenchMatch) {
    return `${frenchMatch[3]}-${frenchMatch[2]}-${frenchMatch[1]}`;
  }

  const slashMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slashMatch) {
    return `${slashMatch[3]}-${slashMatch[2]}-${slashMatch[1]}`;
  }

  const numeric = Number(raw);
  if (!Number.isNaN(numeric) && raw !== '') {
    const parsed = XLSX.SSF.parse_date_code(numeric);
    if (parsed) {
      const month = String(parsed.m).padStart(2, '0');
      const day = String(parsed.d).padStart(2, '0');
      return `${parsed.y}-${month}-${day}`;
    }
  }

  const directDate = new Date(raw);
  if (!Number.isNaN(directDate.getTime())) {
    return directDate.toISOString().slice(0, 10);
  }

  return null;
};

const buildChoiceResolver = (choices: IDataChoice[]) => {
  const byLabel = new Map(choices.map((choice) => [normalizeKey(choice.label), choice.value]));
  const byValue = new Map(choices.map((choice) => [String(choice.value), choice.value]));

  return (value: unknown, fallback = 0): number => {
    const raw = normalizeText(value);
    if (!raw) return fallback;
    return byValue.get(raw) ?? byLabel.get(normalizeKey(raw)) ?? fallback;
  };
};

const buildReferenceResolver = (items: ReferenceItem[]) => {
  const byLabel = new Map(items.map((item) => [normalizeKey(item.label), item.id]));
  const byValue = new Map(items.map((item) => [String(item.id), item.id]));

  return (value: unknown): number | null => {
    const raw = normalizeText(value);
    if (!raw) return null;
    return byValue.get(raw) ?? byLabel.get(normalizeKey(raw)) ?? null;
  };
};

const getRowValue = (row: RawExcelRow, aliases: string[]): unknown => {
  const entries = Object.entries(row);
  const aliasKeys = aliases.map(normalizeKey);
  const match = entries.find(([key]) => aliasKeys.includes(normalizeKey(key)));
  return match?.[1] ?? '';
};

export function UserImportContent({
  onClose,
  onImported,
  pendingFile,
  pendingFileToken,
}: UserImportContentProps) {
  const { showNotification, NotificationComponent } = useNotificationSnackbar();
  const connectedUser = useSelector((state: IReduxState) => state.application.userConnected);
  const authenticatedUser = useSelector((state: IReduxState) => state.authentification.utilisateurData);
  const currentUserId = Number(connectedUser?.idUtilisateur || authenticatedUser?.idUtilisateur || 0) || null;

  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingReferences, setIsLoadingReferences] = useState(true);
  const [departements, setDepartements] = useState<ReferenceItem[]>([]);
  const [cellules, setCellules] = useState<ReferenceItem[]>([]);
  const [groupes, setGroupes] = useState<ReferenceItem[]>([]);

  useEffect(() => {
    let active = true;

    const loadReferences = async () => {
      if (!currentUserId) {
        setIsLoadingReferences(false);
        return;
      }

      try {
        const [departementsResponse, cellulesResponse, groupesResponse] = await Promise.all([
          apiClient.getDepartementsByUtilisateur(currentUserId),
          apiClient.getCellulesByUtilisateur(currentUserId),
          apiClient.getGroupesByUtilisateur(currentUserId),
        ]);

        if (!active) return;

        setDepartements(
          Array.isArray(departementsResponse.data)
            ? departementsResponse.data.map((item: any) => ({ id: Number(item.idDepartement), label: item.libelleLongDepartement || '' }))
            : []
        );
        setCellules(
          Array.isArray(cellulesResponse.data)
            ? cellulesResponse.data.map((item: any) => ({ id: Number(item.idCellule), label: item.nomCellule || '' }))
            : []
        );
        setGroupes(
          Array.isArray(groupesResponse.data)
            ? groupesResponse.data.map((item: any) => ({ id: Number(item.idGroupe), label: item.libelleGroupe || '' }))
            : []
        );
      } catch (error) {
        console.error('Erreur chargement references import membres:', error);
      } finally {
        if (active) setIsLoadingReferences(false);
      }
    };

    loadReferences();
    return () => {
      active = false;
    };
  }, [currentUserId]);

  const sexeResolver = useMemo(() => buildChoiceResolver(dataGenre), []);
  const civiliteResolver = useMemo(() => buildChoiceResolver(dataCivilite), []);
  const nouvelleAmeResolver = useMemo(() => buildChoiceResolver(dataNouvelAme), []);
  const baptemeResolver = useMemo(() => buildChoiceResolver(dataBapteme), []);
  const situationResolver = useMemo(() => buildChoiceResolver(dataSituationMembre), []);
  const capaciteResolver = useMemo(() => buildChoiceResolver(dataCapaciteSpirituelle), []);
  const responsabiliteResolver = useMemo(
    () => buildReferenceResolver(dataResponsabilite.map((item) => ({ id: item.value, label: item.label }))),
    []
  );
  const departementResolver = useMemo(() => buildReferenceResolver(departements), [departements]);
  const celluleResolver = useMemo(() => buildReferenceResolver(cellules), [cellules]);
  const groupeResolver = useMemo(() => buildReferenceResolver(groupes), [groupes]);

  const buildPreviewRow = useCallback((row: RawExcelRow, index: number): PreviewRow => {
    const errors: string[] = [];
    const nomMembre = normalizeText(getRowValue(row, ['nomMembre', 'nom', 'nom membre']));
    const prenomMembre = normalizeText(getRowValue(row, ['prenomMembre', 'prenom', 'prenoms', 'prenom membre']));
    const contactMembre = normalizeText(getRowValue(row, ['contactMembre', 'contact', 'telephone', 'telephoneMembre']));
    const sexeValue = getRowValue(row, ['sexeMembre', 'sexe', 'genre']);
    const residenceMembre = normalizeText(getRowValue(row, ['residenceMembre', 'residence', 'lieu habitation', 'quartier']));
    const fonctionMembre = normalizeText(getRowValue(row, ['fonctionMembre', 'fonction']));
    const departementValue = getRowValue(row, ['idDepartement', 'departement', 'comite']);
    const celluleValue = getRowValue(row, ['idCellule', 'cellule']);
    const groupeValue = getRowValue(row, ['idGroupe', 'groupe']);
    const responsabiliteValue = getRowValue(row, ['idResponsabilite', 'responsabilite', 'fonction spirituelle']);
    const rawDateNaissance = getRowValue(row, ['dateNaissMembre', 'date naissance', 'date de naissance']);
    const rawDateMariage = getRowValue(row, ['dateMariageMembre', 'date mariage']);
    const rawDateConversion = getRowValue(row, ['dateConversionMembre', 'date conversion']);

    if (!nomMembre) errors.push('Nom manquant');
    if (!contactMembre) errors.push('Contact manquant');
    if (!normalizeText(sexeValue)) errors.push('Sexe manquant');
    if (!normalizeText(rawDateNaissance)) errors.push('Date de naissance manquante');
    if (!residenceMembre) errors.push('Residence manquante');
    if (!fonctionMembre) errors.push('Fonction manquante');

    const dateNaissMembre = formatExcelDate(rawDateNaissance);
    const dateMariageMembre = formatExcelDate(rawDateMariage);
    const dateConversionMembre = formatExcelDate(rawDateConversion);

    const payload: IMembre = {
      idMembre: 0,
      nomMembre,
      prenomMembre,
      dateNaissMembre,
      lieuNaissMembre: normalizeText(getRowValue(row, ['lieuNaissMembre', 'lieu naissance', 'lieu de naissance'])),
      sexeMembre: String(sexeResolver(sexeValue)),
      emailMembre: normalizeText(getRowValue(row, ['emailMembre', 'email'])),
      nationaliteMembre: normalizeText(getRowValue(row, ['nationaliteMembre', 'nationalite'])),
      fonctionMembre,
      contactMembre,
      ethnieMembre: normalizeText(getRowValue(row, ['ethnieMembre', 'ethnie'])),
      residenceMembre,
      civiliteMembre: String(civiliteResolver(getRowValue(row, ['civiliteMembre', 'civilite']))),
      nouvelleAmeMembre: String(nouvelleAmeResolver(getRowValue(row, ['nouvelleAmeMembre', 'nouvelle ame']))),
      dateConversionMembre,
      baptemeEauMembre: String(baptemeResolver(getRowValue(row, ['baptemeEauMembre', 'bapteme eau', 'baptise(e)']))),
      dateBaptemeMembre: null,
      dateMariageMembre,
      capaciteSpirituelleMembre: String(capaciteResolver(getRowValue(row, ['capaciteSpirituelleMembre', 'capacite spirituelle']))),
      situationMatrimonialeMembre: String(situationResolver(getRowValue(row, ['situationMatrimonialeMembre', 'situation matrimoniale']))),
      nomFiance: normalizeText(getRowValue(row, ['nomFiance', 'nom fiance', 'fiance'])),
      nombreEnfantMembre: Number(normalizeText(getRowValue(row, ['nombreEnfantMembre', 'nombre enfant'])) || 0),
      photoMembre: '',
      lieuBaptemeEauMembre: normalizeText(getRowValue(row, ['lieuBaptemeEauMembre', 'lieu bapteme', 'lieu du bapteme'])),
      contactParentMembre: '',
      baptemeSaintEspritMembre: String(baptemeResolver(getRowValue(row, ['baptemeSaintEspritMembre', 'bapteme saint esprit']))),
      dateBaptemeSaintEspritMembre: null,
      egliseOrigineMembre: normalizeText(getRowValue(row, ['egliseOrigineMembre', 'eglise origine'])),
      nomPrenomParentMembre: '',
      lieuTravailMembre: normalizeText(getRowValue(row, ['lieuTravailMembre', 'lieu travail'])),
      nomAmiEglise: '',
      visiteMembre: '0',
      heureVisiteMembre: '',
      raisonNonVisiteMembre: '',
      dateDecisionMembre: null,
      idNiveauEtude: null,
      idEglise: 1,
      idCellule: celluleResolver(celluleValue),
      idDepartement: departementResolver(departementValue),
      idGroupe: groupeResolver(groupeValue),
      idResponsabilite: responsabiliteResolver(responsabiliteValue),
      idDomaineActivite: null,
      estDecede: 0,
      dateDecesMembre: null,
      idUtilisateur: currentUserId || 0,
    };

    if (!payload.idUtilisateur) {
      errors.push('Utilisateur non connecte');
    }

    if (normalizeText(rawDateNaissance) && !dateNaissMembre) {
      errors.push('Date de naissance invalide');
    }

    if (normalizeText(rawDateMariage) && !dateMariageMembre) {
      errors.push('Date de mariage invalide');
    }

    if (normalizeText(rawDateConversion) && !dateConversionMembre) {
      errors.push('Date de conversion invalide');
    }

    if (normalizeText(departementValue) && !payload.idDepartement) {
      errors.push(`Departement introuvable: ${normalizeText(departementValue)}`);
    }

    if (normalizeText(celluleValue) && !payload.idCellule) {
      errors.push(`Cellule introuvable: ${normalizeText(celluleValue)}`);
    }

    if (normalizeText(groupeValue) && !payload.idGroupe) {
      errors.push(`Groupe introuvable: ${normalizeText(groupeValue)}`);
    }

    if (normalizeText(responsabiliteValue) && !payload.idResponsabilite) {
      errors.push(`Responsabilite introuvable: ${normalizeText(responsabiliteValue)}`);
    }

    return {
      index,
      source: row,
      payload: errors.length ? null : payload,
      errors,
    };
  }, [
    baptemeResolver,
    capaciteResolver,
    celluleResolver,
    civiliteResolver,
    currentUserId,
    departementResolver,
    groupeResolver,
    nouvelleAmeResolver,
    responsabiliteResolver,
    sexeResolver,
    situationResolver,
  ]);

  const processFile = useCallback(async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json<RawExcelRow>(worksheet, { defval: '' });

      if (!rows.length) {
        showNotification('Le fichier Excel est vide', 'warning');
        setPreviewRows([]);
        setFileName(file.name);
        return;
      }

      setFileName(file.name);
      setPreviewRows(rows.map((row, index) => buildPreviewRow(row, index + 1)));
    } catch (error) {
      console.error('Erreur lecture Excel membres:', error);
      showNotification('Impossible de lire ce fichier Excel', 'error');
    }
  }, [buildPreviewRow, showNotification]);

  useEffect(() => {
    if (pendingFile) {
      processFile(pendingFile);
    }
  }, [pendingFile, pendingFileToken, processFile]);

  const validRows = useMemo(() => previewRows.filter((row) => row.payload), [previewRows]);
  const invalidRows = useMemo(() => previewRows.filter((row) => row.errors.length > 0), [previewRows]);

  const handleImport = useCallback(async () => {
    if (!validRows.length) {
      showNotification('Aucune ligne valide a importer', 'warning');
      return;
    }

    setIsSubmitting(true);

    const results = await Promise.all(
      validRows.map(async (row) => {
        try {
          await apiClient.createMembre(row.payload);
          return { success: true, index: row.index };
        } catch (error) {
          console.error('Erreur import membre ligne', row.index, error);
          return { success: false, index: row.index };
        }
      })
    );

    setIsSubmitting(false);

    const successCount = results.filter((result) => result.success).length;
    const failureCount = results.length - successCount;

    if (failureCount === 0) {
      showNotification(`${successCount} membre(s) importe(s) avec succes`, 'success');
      await onImported?.();
      return;
    }

    showNotification(
      `${successCount} importe(s), ${failureCount} erreur(s)`,
      failureCount === validRows.length ? 'error' : 'warning'
    );
  }, [onImported, showNotification, validRows]);

  return (
    <Stack spacing={3}>
      <Alert severity="info">
        Utilise d&apos;abord le template, fais remplir les lignes, puis charge le fichier ici pour verifier avant import.
      </Alert>

      <Card>
        <CardHeader title="Etat du fichier" subheader={fileName ? `Fichier charge : ${fileName}` : 'Aucun fichier charge'} />
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Chip color="success" label={`${validRows.length} ligne(s) valide(s)`} />
            <Chip color={invalidRows.length ? 'warning' : 'default'} label={`${invalidRows.length} ligne(s) a corriger`} />
            <Chip color={isLoadingReferences ? 'warning' : 'default'} label={isLoadingReferences ? 'Chargement references...' : 'References pretes'} />
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Previsualisation avant validation" subheader="Seules les lignes valides seront importees." />
        <CardContent>
          {!previewRows.length ? (
            <Alert severity="warning">Charge un fichier Excel pour afficher le tableau de previsualisation.</Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Ligne</TableCell>
                    <TableCell>Nom</TableCell>
                    <TableCell>Prenoms</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Departement</TableCell>
                    <TableCell>Cellule</TableCell>
                    <TableCell>Groupe</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewRows.map((row) => (
                    <TableRow key={row.index} hover>
                      <TableCell>{row.index}</TableCell>
                      <TableCell>{normalizeText(getRowValue(row.source, ['nomMembre', 'nom', 'nom membre']))}</TableCell>
                      <TableCell>{normalizeText(getRowValue(row.source, ['prenomMembre', 'prenom', 'prenoms']))}</TableCell>
                      <TableCell>{normalizeText(getRowValue(row.source, ['contactMembre', 'contact', 'telephone']))}</TableCell>
                      <TableCell>{normalizeText(getRowValue(row.source, ['idDepartement', 'departement', 'comite'])) || '-'}</TableCell>
                      <TableCell>{normalizeText(getRowValue(row.source, ['idCellule', 'cellule'])) || '-'}</TableCell>
                      <TableCell>{normalizeText(getRowValue(row.source, ['idGroupe', 'groupe'])) || '-'}</TableCell>
                      <TableCell>
                        <Chip size="small" color={row.errors.length ? 'warning' : 'success'} label={row.errors.length ? 'A corriger' : 'Valide'} />
                      </TableCell>
                      <TableCell>
                        {row.errors.length ? row.errors.join(', ') : 'Pret pour import'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
        <Button variant="outlined" onClick={onClose}>
          Annuler
        </Button>
        <Button
          variant="contained"
          startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <SaveRounded />}
          disabled={!validRows.length || isSubmitting || isLoadingReferences}
          onClick={handleImport}
        >
          {isSubmitting ? 'Import en cours...' : 'Valider et importer'}
        </Button>
      </Stack>

      <NotificationComponent />
    </Stack>
  );
}

