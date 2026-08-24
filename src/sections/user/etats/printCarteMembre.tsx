import ReactToPrint from 'react-to-print';
import { useSelector } from 'react-redux';
import { useRef, useMemo, useState, forwardRef } from 'react';

import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { alpha, styled } from '@mui/material/styles';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

import { buildChurchLogoUrl } from 'src/utils/apiClient';
import { resolveStaticAssetUrl } from 'src/utils/asset-url';
import {
  exportDesktopPdf,
  canUseDesktopPrint,
  openDesktopPrintPreview,
} from 'src/utils/desktop-print';
import type { IReduxState } from 'src/store/store';
import { dataResponsabilite } from 'src/store/membreSlice';
import type { IMembre } from 'src/store/membreSlice';

import { formaterValueLabels } from '../view/filterbyIndice';
import { MemberCardSheet, MEMBER_CARD_PRINT_PAGE_STYLE } from './member-card-print';

import type { MemberCardData } from './member-card-print';

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 10,
    marginTop: theme.spacing(1),
    minWidth: 220,
    boxShadow:
      'rgb(255, 255, 255) 0 0 0 0, rgba(15, 23, 42, 0.06) 0 0 0 1px, rgba(15, 23, 42, 0.14) 0 18px 40px -12px',
    '& .MuiMenu-list': { padding: '6px' },
    '& .MuiMenuItem-root': {
      borderRadius: 8,
      gap: 10,
      '&:active': {
        backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
      },
    },
  },
}));

type PrintIdentity = {
  logoEglise?: string;
  logoUtilisateur?: string;
  nomTemple?: string;
  nomEgliseCourt?: string;
};

// Meme logique de resolution de logo que les autres documents imprimables membres
// (listeMembrePdf.tsx / member-profile-print.tsx), pour un rendu identique partout.
const getLogoUrl = (identity: PrintIdentity): string | null => {
  const logoPath = identity.logoEglise || identity.logoUtilisateur;

  if (!logoPath) return null;
  if (/^(https?:|data:|blob:|file:)/i.test(logoPath)) return logoPath;
  if (identity.logoEglise && logoPath === identity.logoEglise) return buildChurchLogoUrl(logoPath);

  return resolveStaticAssetUrl(logoPath);
};

const ComponentToPrint = forwardRef<
  HTMLDivElement,
  { cards: MemberCardData[]; identity: PrintIdentity; logoUrl: string | null }
>(({ cards, identity, logoUrl }, ref) => (
  <div ref={ref}>
    <MemberCardSheet cards={cards} identity={identity} logoUrl={logoUrl} />
  </div>
));

type PrintCartesMembreProps = {
  membres: IMembre[];
  // Libelle du bouton : personnalisable pour distinguer "Cartes de membre" (liste,
  // plusieurs membres selectionnes) de "Imprimer sa carte" (fiche d'un seul membre).
  label?: string;
};

// Bouton + menu d'impression des cartes de membre (photo + infos), 3 par feuille A4
// portrait. Reutilisable depuis la liste des membres (selection multiple) ou depuis
// la fiche d'un membre (carte unique) — voir PrintCartesMembreProps.membres.
export function PrintCartesMembre({ membres, label = 'Cartes de membre' }: PrintCartesMembreProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isDesktopPrint = canUseDesktopPrint();
  const open = Boolean(anchorEl);

  const userConnected = useSelector((state: IReduxState) => (state as any).application.userConnected);
  const utilisateurData = useSelector((state: IReduxState) => (state as any).authentification.utilisateurData);
  const listDepartement = useSelector((state: IReduxState) => (state as any).departement.listDepartement);
  const listCellule = useSelector((state: IReduxState) => (state as any).cellule.listCellule);
  const listGroupe = useSelector((state: IReduxState) => (state as any).groupe.listGroupe);

  const identity: PrintIdentity = { ...(utilisateurData || {}), ...(userConnected || {}) };
  const logoUrl = getLogoUrl(identity);

  const departementOptions = useMemo(
    () => formaterValueLabels(listDepartement, 'idDepartement', 'libelleLongDepartement'),
    [listDepartement]
  );
  const celluleOptions = useMemo(
    () => formaterValueLabels(listCellule, 'idCellule', 'nomCellule'),
    [listCellule]
  );
  const groupeOptions = useMemo(() => formaterValueLabels(listGroupe, 'idGroupe', 'libelleGroupe'), [listGroupe]);

  const cards: MemberCardData[] = useMemo(
    () =>
      membres.map((membre) => ({
        membre,
        celluleLabel: celluleOptions.find((option) => option.value === String(membre.idCellule))?.label || 'Non renseignée',
        departementLabel:
          departementOptions.find((option) => option.value === String(membre.idDepartement))?.label || 'Non renseigné',
        groupeLabel: groupeOptions.find((option) => option.value === String(membre.idGroupe))?.label || 'Non renseigné',
        responsabiliteLabel:
          dataResponsabilite.find((option) => option.value === Number(membre.idResponsabilite))?.label || '',
      })),
    [membres, celluleOptions, departementOptions, groupeOptions]
  );

  const disabled = membres.length === 0;
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <Button
        variant="contained"
        color="inherit"
        size="small"
        disabled={disabled}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        startIcon={<BadgeRoundedIcon fontSize="small" />}
      >
        {label}
      </Button>

      <StyledMenu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {isDesktopPrint ? (
          [
            <MenuItem
              key="preview"
              onClick={async () => {
                handleClose();
                await openDesktopPrintPreview(printRef.current, {
                  title: 'Aperçu - Cartes de membre',
                  fileName: 'cartes-membre',
                  orientation: 'portrait',
                });
              }}
            >
              <VisibilityIcon fontSize="small" />
              Aperçu
            </MenuItem>,
            <MenuItem
              key="pdf"
              onClick={async () => {
                handleClose();
                await exportDesktopPdf(printRef.current, {
                  title: 'Cartes de membre',
                  fileName: 'cartes-membre',
                  orientation: 'portrait',
                });
              }}
            >
              <PictureAsPdfIcon fontSize="small" />
              Exporter en PDF
            </MenuItem>,
          ]
        ) : (
          <MenuItem onClick={handleClose}>
            <ReactToPrint
              trigger={() => <div>Imprimer</div>}
              content={() => printRef.current}
              pageStyle={MEMBER_CARD_PRINT_PAGE_STYLE}
            />
          </MenuItem>
        )}
      </StyledMenu>

      <div style={{ display: 'none' }}>
        <ComponentToPrint ref={printRef} cards={cards} identity={identity} logoUrl={logoUrl} />
      </div>
    </>
  );
}

export default PrintCartesMembre;
