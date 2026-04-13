import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  AddRounded as AddRoundedIcon,
  CakeRounded as CakeRoundedIcon,
  DeleteRounded as DeleteRoundedIcon,
  EditRounded as EditRoundedIcon,
  FavoriteBorderRounded as FavoriteBorderRoundedIcon,
  FavoriteRounded as FavoriteRoundedIcon,
  SearchRounded as SearchRoundedIcon,
  SentimentDissatisfiedRounded as SentimentDissatisfiedRoundedIcon,
  VolunteerActivismRounded as VolunteerActivismRoundedIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  alpha,
} from '@mui/material';

import ConfirmDialog from 'src/components/alert/confirmDialog';
import { useNotificationSnackbar } from 'src/components/alert/notificationSnackbar';
import { DashboardContent } from 'src/layouts/dashboard';
import { PrintEtatSociaux } from 'src/sections/social/etats';
import type { IDeces } from 'src/store/decesSlice';
import type { IMariage } from 'src/store/mariageSlice';
import type { IMembre } from 'src/store/membreSlice';
import type { INaissance } from 'src/store/naissanceSlice';
import { apiClient } from 'src/utils/apiClient';

type SocialCaseType = 'mariage' | 'naissance' | 'deces' | 'maladie';

type SocialCaseState = {
  deces: IDeces[];
  maladie: IMaladieDraft[];
  mariage: IMariage[];
  naissance: INaissance[];
};

type SocialCaseFormState = {
  deces: IDeces;
  maladie: IMaladieDraft;
  mariage: IMariage;
  naissance: INaissance;
};

type FieldType = 'date' | 'text' | 'textarea';

type SocialField = {
  label: string;
  minRows?: number;
  name: string;
  required?: boolean;
  type?: FieldType;
};

type SocialConfig = {
  color: 'error' | 'info' | 'secondary' | 'success';
  columns: Array<{ key: string; label: string }>;
  emptyMessage: string;
  fields: SocialField[];
  helperText: string;
  icon: React.ReactNode;
  label: string;
};

interface IMaladieDraft {
  dateMaladie: string | null;
  idMaladie?: number | null;
  idUtilisateur: number | null;
  lieuHospitalisation: string;
  nomMembreMaladie: string;
  observationMaladie: string;
  typeMaladie: string;
}

const emptyMariage: IMariage = {
  contactMariage: '',
  culteMariage: '',
  dateMariage: null,
  idMariage: 0,
  idUtilisateur: 0,
  lieuMariage: '',
  lieuReception: '',
  nomFrereMariage: '',
  nomSoeurMariage: '',
  temoin1Mariage: '',
  temoin2Mariage: '',
};

const emptyNaissance: INaissance = {
  dateNaissance: null,
  datePresentationNaissance: null,
  idNaissance: 0,
  idUtilisateur: 0,
  lieuNaissance: '',
  nomCoupleNaissance: '',
  nomEnfantNaissance: '',
};

const emptyDeces: IDeces = {
  causeDeces: '',
  dateDeces: null,
  idDeces: 0,
  idMembre: null,
  idUtilisateur: 0,
  lieuDeces: '',
  nomMembreDeces: '',
};

const emptyMaladie: IMaladieDraft = {
  dateMaladie: null,
  idMaladie: 0,
  idUtilisateur: 0,
  lieuHospitalisation: '',
  nomMembreMaladie: '',
  observationMaladie: '',
  typeMaladie: '',
};

const socialConfig: Record<SocialCaseType, SocialConfig> = {
  mariage: {
    label: 'Mariages',
    color: 'secondary',
    icon: <FavoriteRoundedIcon />,
    helperText: 'Ceremonies de mariage, reception et temoins de la communaute.',
    emptyMessage: 'Aucun mariage enregistre pour le moment.',
    columns: [
      { key: 'nomFrereMariage', label: 'Frere' },
      { key: 'nomSoeurMariage', label: 'Soeur' },
      { key: 'dateMariage', label: 'Date' },
      { key: 'lieuMariage', label: 'Lieu' },
      { key: 'culteMariage', label: 'Culte' },
      { key: 'contactMariage', label: 'Contact' },
    ],
    fields: [
      { name: 'nomFrereMariage', label: 'Nom du frere', required: true },
      { name: 'nomSoeurMariage', label: 'Nom de la soeur', required: true },
      { name: 'dateMariage', label: 'Date du mariage', type: 'date', required: true },
      { name: 'lieuMariage', label: 'Lieu du mariage', required: true },
      { name: 'culteMariage', label: 'Culte / celebrant' },
      { name: 'temoin1Mariage', label: 'Temoin 1' },
      { name: 'temoin2Mariage', label: 'Temoin 2' },
      { name: 'lieuReception', label: 'Lieu de reception' },
      { name: 'contactMariage', label: 'Contact' },
    ],
  },
  naissance: {
    label: 'Naissances',
    color: 'success',
    icon: <CakeRoundedIcon />,
    helperText: 'Naissances, presentation des enfants et suivi des familles.',
    emptyMessage: 'Aucune naissance enregistree pour le moment.',
    columns: [
      { key: 'nomEnfantNaissance', label: 'Enfant' },
      { key: 'nomCoupleNaissance', label: 'Parents' },
      { key: 'dateNaissance', label: 'Date de naissance' },
      { key: 'lieuNaissance', label: 'Lieu' },
      { key: 'datePresentationNaissance', label: 'Presentation' },
    ],
    fields: [
      { name: 'nomCoupleNaissance', label: 'Nom du couple', required: true },
      { name: 'nomEnfantNaissance', label: "Nom de l'enfant", required: true },
      { name: 'dateNaissance', label: 'Date de naissance', type: 'date', required: true },
      { name: 'lieuNaissance', label: 'Lieu de naissance', required: true },
      { name: 'datePresentationNaissance', label: 'Date de presentation', type: 'date' },
    ],
  },
  deces: {
    label: 'Deces',
    color: 'error',
    icon: <SentimentDissatisfiedRoundedIcon />,
    helperText: 'Deces, lieux, dates et causes pour le suivi pastoral.',
    emptyMessage: 'Aucun deces enregistre pour le moment.',
    columns: [
      { key: 'nomMembreDeces', label: 'Membre' },
      { key: 'dateDeces', label: 'Date' },
      { key: 'lieuDeces', label: 'Lieu' },
      { key: 'causeDeces', label: 'Cause' },
    ],
    fields: [
      { name: 'nomMembreDeces', label: 'Nom du membre', required: true },
      { name: 'dateDeces', label: 'Date du deces', type: 'date', required: true },
      { name: 'lieuDeces', label: 'Lieu du deces', required: true },
      { name: 'causeDeces', label: 'Cause / circonstances', type: 'textarea', minRows: 3 },
    ],
  },
  maladie: {
    label: 'Maladies',
    color: 'info',
    icon: <FavoriteBorderRoundedIcon />,
    helperText: 'Signalements de maladie, hospitalisation et suivi pastoral.',
    emptyMessage: 'Aucun cas de maladie enregistre pour le moment.',
    columns: [
      { key: 'nomMembreMaladie', label: 'Membre' },
      { key: 'typeMaladie', label: 'Type' },
      { key: 'dateMaladie', label: 'Date' },
      { key: 'lieuHospitalisation', label: 'Lieu' },
    ],
    fields: [
      { name: 'nomMembreMaladie', label: 'Nom du membre', required: true },
      { name: 'typeMaladie', label: 'Maladie / situation', required: true },
      { name: 'dateMaladie', label: 'Date du signalement', type: 'date' },
      { name: 'lieuHospitalisation', label: 'Lieu / hopital' },
      { name: 'observationMaladie', label: 'Observations', type: 'textarea', minRows: 3 },
    ],
  },
};

const emptyStateByType: SocialCaseState = {
  deces: [],
  maladie: [],
  mariage: [],
  naissance: [],
};

const emptyFormState: SocialCaseFormState = {
  deces: emptyDeces,
  maladie: emptyMaladie,
  mariage: emptyMariage,
  naissance: emptyNaissance,
};

const formatDisplayDate = (value?: string | null) => {
  if (!value) return 'Non specifie';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Non specifie';
  return parsed.toLocaleDateString('fr-FR');
};

const normalizeText = (value: unknown) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const buildMembreLabel = (membre: IMembre) => `${membre.nomMembre || ''} ${membre.prenomMembre || ''}`.trim();

export function SocialView() {
  const userConnected = useSelector((state: any) => state.application?.userConnected);
  const utilisateurData = useSelector((state: any) => state.authentification?.utilisateurData);
  const currentUserId = Number(userConnected?.idUtilisateur || utilisateurData?.idUtilisateur || 0);

  const [activeType, setActiveType] = useState<SocialCaseType>('mariage');
  const [searchTerm, setSearchTerm] = useState('');
  const [records, setRecords] = useState<SocialCaseState>(emptyStateByType);
  const [openDialog, setOpenDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formState, setFormState] = useState<SocialCaseFormState>(emptyFormState);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null);
  const [availableMembres, setAvailableMembres] = useState<IMembre[]>([]);
  const { showNotification, NotificationComponent } = useNotificationSnackbar();

  // Charge toutes les categories sociales rattachees au compte courant.
  const fetchSocialCases = useCallback(async () => {
    if (!currentUserId) {
      setRecords(emptyStateByType);
      setAvailableMembres([]);
      return;
    }

    const safeLoad = async <T,>(loader: () => Promise<{ data?: T[] }>): Promise<T[]> => {
      try {
        const response = await loader();
        return Array.isArray(response?.data) ? response.data : [];
      } catch (error) {
        return [];
      }
    };

    const [mariages, naissances, deces, maladies, membres] = await Promise.all([
      safeLoad<IMariage>(() => apiClient.getMariagesByUtilisateur(currentUserId)),
      safeLoad<INaissance>(() => apiClient.getNaissancesByUtilisateur(currentUserId)),
      safeLoad<IDeces>(() => apiClient.getDecesByUtilisateur(currentUserId)),
      safeLoad<IMaladieDraft>(() => apiClient.getMaladiesByUtilisateur(currentUserId)),
      safeLoad<IMembre>(() => apiClient.getMembresByUtilisateur(currentUserId)),
    ]);

    setRecords({
      mariage: mariages,
      naissance: naissances,
      deces,
      maladie: maladies,
    });
    setAvailableMembres(membres);
  }, [currentUserId]);

  useEffect(() => {
    fetchSocialCases();
  }, [fetchSocialCases]);

  const currentConfig = socialConfig[activeType];
  const currentRows = records[activeType];

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return currentRows;

    const normalizedSearch = normalizeText(searchTerm);
    const searchableFields = currentConfig.columns.map((column) => column.key);

    return currentRows.filter((row: any) =>
      searchableFields.some((field) => normalizeText(row?.[field]).includes(normalizedSearch))
    );
  }, [currentConfig.columns, currentRows, searchTerm]);

  const openCreateDialog = () => {
    setEditingId(null);
    setFormState((prev) => ({ ...prev, [activeType]: emptyFormState[activeType] as any }));
    setOpenDialog(true);
  };

  const openEditDialog = (row: any) => {
    setEditingId(getRowId(activeType, row));
    setFormState((prev) => ({ ...prev, [activeType]: { ...row, idMembre: row?.idMembre ?? null } }));
    setOpenDialog(true);
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [activeType]: {
        ...prev[activeType],
        [fieldName]: value,
      },
    }));
  };

  const handleDecesMemberChange = (value: string) => {
    const nextIdMembre = value ? Number(value) : null;
    const selectedMembre = availableMembres.find((item) => Number(item.idMembre) === nextIdMembre);

    setFormState((prev) => ({
      ...prev,
      deces: {
        ...prev.deces,
        idMembre: nextIdMembre,
        nomMembreDeces: selectedMembre ? buildMembreLabel(selectedMembre) : prev.deces.nomMembreDeces,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!currentUserId) {
      showNotification('Utilisateur non reconnu. Reconnectez-vous pour continuer.', 'warning');
      return;
    }

    const payload = {
      ...formState[activeType],
      idUtilisateur: currentUserId,
    } as any;

    try {
      setIsSaving(true);

      if (activeType === 'mariage') await saveMariage(payload, editingId);
      if (activeType === 'naissance') await saveNaissance(payload, editingId);
      if (activeType === 'deces') await saveDeces(payload, editingId);
      if (activeType === 'maladie') await saveMaladie(payload, editingId);

      await fetchSocialCases();
      closeDialog();
      showNotification('Enregistrement effectue avec succes.', 'success');
    } catch (error: any) {
      showNotification(error?.message || "Une erreur s'est produite pendant l'enregistrement.", 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (activeType === 'mariage') await apiClient.deleteMariage(deleteTarget.id);
      if (activeType === 'naissance') await apiClient.deleteNaissance(deleteTarget.id, currentUserId);
      if (activeType === 'deces') await apiClient.deleteDeces(deleteTarget.id);
      if (activeType === 'maladie') await apiClient.deleteMaladie(deleteTarget.id);

      await fetchSocialCases();
      showNotification('Element supprime avec succes.', 'success');
    } catch (error: any) {
      showNotification(error?.message || 'Suppression impossible pour le moment.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Cas sociaux
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>
              Mariages, naissances, deces et maladies au meme endroit.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <PrintEtatSociaux activeType={activeType} identity={utilisateurData} rows={currentRows} />
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreateDialog}>
              Ajouter
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={2}>
          {(Object.keys(socialConfig) as SocialCaseType[]).map((type) => (
            <Grid item xs={12} sm={6} lg={3} key={type}>
              <Card
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: (theme) =>
                    `1px solid ${alpha(theme.palette[socialConfig[type].color].main, activeType === type ? 0.35 : 0.12)}`,
                  bgcolor: (theme) =>
                    activeType === type
                      ? alpha(theme.palette[socialConfig[type].color].main, 0.08)
                      : theme.palette.background.paper,
                  cursor: 'pointer',
                }}
                onClick={() => setActiveType(type)}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box sx={{ color: `${socialConfig[type].color}.main` }}>{socialConfig[type].icon}</Box>
                  <Chip
                    size="small"
                    color={socialConfig[type].color}
                    label={records[type].length}
                    variant={activeType === type ? 'filled' : 'outlined'}
                  />
                </Stack>
                <Typography variant="h6" sx={{ mt: 2, fontWeight: 700 }}>
                  {socialConfig[type].label}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {socialConfig[type].helperText}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <Tabs
            value={activeType}
            onChange={(_, value: SocialCaseType) => setActiveType(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ px: 2, pt: 1.5 }}
          >
            {(Object.keys(socialConfig) as SocialCaseType[]).map((type) => (
              <Tab key={type} value={type} label={socialConfig[type].label} />
            ))}
          </Tabs>

          <Box sx={{ px: 3, py: 2.5 }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              spacing={2}
              sx={{ mb: 3 }}
            >
              <TextField
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={`Rechercher dans ${currentConfig.label.toLowerCase()}...`}
                InputProps={{ startAdornment: <SearchRoundedIcon sx={{ color: 'text.disabled', mr: 1 }} /> }}
                sx={{ minWidth: { xs: '100%', md: 360 } }}
              />

              <Chip color={currentConfig.color} label={`${filteredRows.length} resultat(s)`} />
            </Stack>

            {filteredRows.length === 0 ? (
              <Card
                variant="outlined"
                sx={{
                  p: 5,
                  borderStyle: 'dashed',
                  textAlign: 'center',
                  borderRadius: 3,
                }}
              >
                <VolunteerActivismRoundedIcon sx={{ fontSize: 44, color: 'text.disabled', mb: 1 }} />
                <Typography variant="h6" sx={{ mb: 0.75 }}>
                  {currentConfig.emptyMessage}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ajoute un premier enregistrement pour commencer le suivi de cette categorie.
                </Typography>
              </Card>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      {currentConfig.columns.map((column) => (
                        <TableCell key={column.key} sx={{ fontWeight: 700 }}>
                          {column.label}
                        </TableCell>
                      ))}
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRows.map((row: any) => (
                      <TableRow key={`${activeType}-${getRowId(activeType, row)}`} hover>
                        {currentConfig.columns.map((column) => (
                          <TableCell key={column.key}>
                            {column.key.toLowerCase().includes('date')
                              ? formatDisplayDate(row[column.key])
                              : row[column.key] || 'Non specifie'}
                          </TableCell>
                        ))}
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              size="small"
                              color="primary"
                              startIcon={<EditRoundedIcon />}
                              onClick={() => openEditDialog(row)}
                            >
                              Modifier
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              startIcon={<DeleteRoundedIcon />}
                              onClick={() =>
                                setDeleteTarget({
                                  id: getRowId(activeType, row),
                                  label: buildDeleteLabel(activeType, row),
                                })
                              }
                            >
                              Supprimer
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Box>
        </Card>
      </Stack>

      <Dialog open={openDialog} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingId ? 'Modifier' : 'Ajouter'} {currentConfig.label.slice(0, -1).toLowerCase()}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {activeType === 'deces' && (
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Membre deja enregistre"
                  value={formState.deces.idMembre || ''}
                  onChange={(event) => handleDecesMemberChange(event.target.value)}
                  helperText="Optionnel. Si tu choisis un membre, il quittera automatiquement la liste active."
                >
                  <MenuItem value="">Selectionner un membre</MenuItem>
                  {availableMembres.map((membre) => (
                    <MenuItem key={membre.idMembre} value={membre.idMembre}>
                      {buildMembreLabel(membre)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
            {currentConfig.fields.map((field) => (
              <Grid item xs={12} md={field.type === 'textarea' ? 12 : 6} key={field.name}>
                <TextField
                  fullWidth
                  required={field.required}
                  multiline={field.type === 'textarea'}
                  minRows={field.minRows}
                  type={field.type === 'date' ? 'date' : 'text'}
                  label={field.label}
                  value={(formState[activeType] as any)?.[field.name] || ''}
                  onChange={(event) => {
                    if (activeType === 'deces' && field.name === 'nomMembreDeces') {
                      setFormState((prev) => ({
                        ...prev,
                        deces: {
                          ...prev.deces,
                          idMembre: null,
                          nomMembreDeces: event.target.value,
                        },
                      }));
                      return;
                    }

                    handleFieldChange(field.name, event.target.value);
                  }}
                  InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
                  helperText={field.required ? 'Champ requis' : 'Champ optionnel'}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Annuler</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={isSaving}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Suppression du cas social"
        message={
          deleteTarget
            ? `Voulez-vous vraiment supprimer cet enregistrement : "${deleteTarget.label}" ?`
            : ''
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <NotificationComponent />
    </DashboardContent>
  );
}

async function saveMariage(payload: IMariage, editingId: number | null) {
  if (editingId) {
    await apiClient.updateMariage({ ...payload, idMariage: editingId });
    return;
  }

  await apiClient.createMariage(payload);
}

async function saveNaissance(payload: INaissance, editingId: number | null) {
  if (editingId) {
    await apiClient.updateNaissance({ ...payload, idNaissance: editingId });
    return;
  }

  await apiClient.createNaissance(payload);
}

async function saveDeces(payload: IDeces, editingId: number | null) {
  if (editingId) {
    await apiClient.updateDeces({ ...payload, idDeces: editingId });
    return;
  }

  await apiClient.createDeces(payload);
}

async function saveMaladie(payload: IMaladieDraft, editingId: number | null) {
  if (editingId) {
    await apiClient.updateMaladie({ ...payload, idMaladie: editingId });
    return;
  }

  await apiClient.createMaladie(payload);
}

function getRowId(type: SocialCaseType, row: any) {
  if (type === 'mariage') return Number(row.idMariage || 0);
  if (type === 'naissance') return Number(row.idNaissance || 0);
  if (type === 'deces') return Number(row.idDeces || 0);
  return Number(row.idMaladie || 0);
}

function buildDeleteLabel(type: SocialCaseType, row: any) {
  if (type === 'mariage') return `${row.nomFrereMariage || ''} - ${row.nomSoeurMariage || ''}`.trim();
  if (type === 'naissance') return `${row.nomEnfantNaissance || ''} - ${row.nomCoupleNaissance || ''}`.trim();
  if (type === 'deces') return row.nomMembreDeces || 'Deces';
  return row.nomMembreMaladie || 'Maladie';
}

export default SocialView;
