import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import DownloadRounded from '@mui/icons-material/DownloadRounded';
import FileUploadRounded from '@mui/icons-material/FileUploadRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import type { IReduxState } from 'src/store/store';

import { UserImportContent, downloadMembreImportTemplate } from './user-import-content';

export function UserImportView() {
  const navigate = useNavigate();
  const listDepartement = useSelector((state: IReduxState) => state.departement.listDepartement);
  const listCellule = useSelector((state: IReduxState) => state.cellule.listCellule);
  const listGroupe = useSelector((state: IReduxState) => state.groupe.listGroupe);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const [pendingImportFileToken, setPendingImportFileToken] = useState(0);

  const departementReferences = useMemo(
    () => (Array.isArray(listDepartement)
      ? listDepartement.map((item: any) => ({ id: Number(item.idDepartement), label: item.libelleLongDepartement || '' }))
      : []),
    [listDepartement]
  );
  const celluleReferences = useMemo(
    () => (Array.isArray(listCellule)
      ? listCellule.map((item: any) => ({ id: Number(item.idCellule), label: item.nomCellule || '' }))
      : []),
    [listCellule]
  );
  const groupeReferences = useMemo(
    () => (Array.isArray(listGroupe)
      ? listGroupe.map((item: any) => ({ id: Number(item.idGroupe), label: item.libelleGroupe || '' }))
      : []),
    [listGroupe]
  );

  const handleDownloadTemplate = useCallback(() => {
    downloadMembreImportTemplate(departementReferences, celluleReferences, groupeReferences);
  }, [celluleReferences, departementReferences, groupeReferences]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPendingImportFile(file);
    setPendingImportFileToken((current) => current + 1);
    event.target.value = '';
  }, []);

  return (
    <DashboardContent>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" sx={{ mb: 1 }}>
              Importer les membres depuis Excel
            </Typography>
            <Typography color="text.secondary">
              Charge un fichier Excel, verifie les lignes puis valide l&apos;import dans la base.
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button variant="outlined" startIcon={<ArrowBackRounded />} onClick={() => navigate('/user')}>
              Retour aux membres
            </Button>
            <Button variant="outlined" startIcon={<DownloadRounded />} onClick={handleDownloadTemplate}>
              Telecharger le template
            </Button>
            <Button component="label" variant="contained" startIcon={<FileUploadRounded />}>
              Charger un fichier Excel
              <input hidden type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
            </Button>
          </Stack>
        </Stack>

        <UserImportContent
          onClose={() => navigate('/user')}
          onImported={() => navigate('/user')}
          pendingFile={pendingImportFile}
          pendingFileToken={pendingImportFileToken}
        />
      </Stack>
    </DashboardContent>
  );
}

export default UserImportView;
