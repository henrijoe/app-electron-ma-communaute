import { brown } from '@mui/material/colors';
import { Box, Avatar, Typography } from '@mui/material';

import type { IMembre } from 'src/store/membreSlice';

import { getPhotoUrl } from '../utils';

// pageStyle a fournir a <ReactToPrint> (impression navigateur, hors application desktop).
// Regle "@page" NOMMEE : voir le commentaire detaille dans listeMembrePdf.tsx
// (MEMBER_LIST_PRINT_PAGE_STYLE) — plusieurs documents imprimables restent montes
// en meme temps (caches) dans cette page, une regle "@page" anonyme serait donc
// ecrasee par celle d'un autre document lors de la copie des styles par react-to-print.
export const MEMBER_CARD_PRINT_PAGE_STYLE = `
@page memberCardPortrait {
  size: A4 portrait;
  margin: 8mm;
}

.member-card-print-root {
  page: memberCardPortrait;
}

@media print {
  html, body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
`;

type PrintIdentity = {
  logoEglise?: string;
  logoUtilisateur?: string;
  nomTemple?: string;
  nomEgliseCourt?: string;
};

export type MemberCardData = {
  membre: IMembre;
  celluleLabel: string;
  departementLabel: string;
  groupeLabel: string;
  responsabiliteLabel: string;
};

// Hauteur d'une carte sur la feuille : A4 portrait (297mm) moins les marges de page
// (8mm x2) et l'espacement entre les 3 cartes, divise par 3 -> ~90mm chacune.
const CARD_HEIGHT_MM = 90;

const chunk = <T,>(items: T[], size: number): T[][] => {
  const groups: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    groups.push(items.slice(index, index + size));
  }
  return groups;
};

const formatDate = (date?: string | null): string => {
  if (!date) return '';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('fr-FR');
};

type MemberCardSheetProps = {
  cards: MemberCardData[];
  identity: PrintIdentity;
  logoUrl: string | null;
};

// Feuille A4 portrait avec 3 cartes de membre empilees, 3 par page (page-break-after
// entre chaque groupe de 3 s'il y a plus de membres a imprimer).
export function MemberCardSheet({ cards, identity, logoUrl }: MemberCardSheetProps) {
  const pages = chunk(cards, 3);

  if (pages.length === 0) {
    return null;
  }

  return (
    <Box className="member-card-print-root">
      {pages.map((pageCards, pageIndex) => (
        <Box
          key={pageIndex}
          sx={{
            width: '194mm',
            mx: 'auto',
            breakAfter: pageIndex < pages.length - 1 ? 'page' : 'auto',
            '@media print': {
              pageBreakAfter: pageIndex < pages.length - 1 ? 'always' : 'auto',
            },
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4mm', py: '4mm' }}>
            {pageCards.map((card) => (
              <MemberCard key={card.membre.idMembre} card={card} identity={identity} logoUrl={logoUrl} />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function MemberCard({
  card,
  identity,
  logoUrl,
}: {
  card: MemberCardData;
  identity: PrintIdentity;
  logoUrl: string | null;
}) {
  const { membre } = card;
  const fullName = `${membre.nomMembre || ''} ${membre.prenomMembre || ''}`.trim() || 'Membre';
  const photoUrl = getPhotoUrl(membre.photoMembre);
  const initials = [membre.nomMembre, membre.prenomMembre]
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
  // A defaut de date d'adhesion dediee, on utilise la conversion ou le bapteme comme
  // repere de "membre depuis" (les deux champs les plus proches de cette notion sur IMembre).
  const memberSinceDate = membre.dateConversionMembre || membre.dateBaptemeMembre || null;

  return (
    <Box
      sx={{
        display: 'flex',
        position: 'relative',
        height: `${CARD_HEIGHT_MM}mm`,
        border: `1px solid ${brown[300]}`,
        borderRadius: '3mm',
        overflow: 'hidden',
        breakInside: 'avoid',
      }}
    >
      {/* Ligne de pli : la carte se plie ici en deux pour former une carte plus petite
          et plus epaisse (recto photo/logo, verso informations), comme une vraie carte
          de membre cartonnee. */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '50%',
          borderLeft: `1px dashed ${brown[400]}`,
        }}
      />

      {/* Recto : identite visuelle de l'eglise, photo et nom du membre. */}
      <Box
        sx={{
          width: '50%',
          bgcolor: brown[700],
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: '4mm',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: '10mm',
            height: '10mm',
            borderRadius: '2mm',
            bgcolor: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            mb: '2mm',
            flexShrink: 0,
          }}
        >
          {logoUrl ? (
            <Box component="img" src={logoUrl} alt="" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <Typography sx={{ color: brown[900], fontWeight: 900, fontSize: '3mm' }}>MC</Typography>
          )}
        </Box>
        <Typography sx={{ fontSize: '2.6mm', letterSpacing: '0.3mm', textTransform: 'uppercase', opacity: 0.85 }}>
          {identity.nomEgliseCourt || identity.nomTemple || 'Ma Communauté'}
        </Typography>
        <Typography sx={{ fontSize: '3.2mm', fontWeight: 900, mt: '1mm', mb: '3mm', letterSpacing: '0.2mm' }}>
          CARTE DE MEMBRE
        </Typography>

        <Avatar
          src={photoUrl || undefined}
          alt={fullName}
          sx={{
            width: '22mm',
            height: '22mm',
            border: '1mm solid #fff',
            bgcolor: brown[100],
            color: brown[900],
            fontSize: '7mm',
            fontWeight: 800,
          }}
        >
          {!photoUrl && initials}
        </Avatar>

        <Typography sx={{ fontSize: '3.4mm', fontWeight: 800, mt: '2mm' }}>{fullName}</Typography>
      </Box>

      {/* Verso : informations pratiques (fonction, contact, appartenance, numero). */}
      <Box
        sx={{
          width: '50%',
          bgcolor: brown[50],
          color: '#3e2723',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '2.2mm',
          p: '5mm',
        }}
      >
        <CardFact label="Fonction" value={card.responsabiliteLabel || membre.fonctionMembre || 'Membre'} />
        <CardFact label="Contact" value={membre.contactMembre || 'Non renseigné'} />
        <CardFact label="Cellule" value={card.celluleLabel} />
        <CardFact label="Département" value={card.departementLabel} />
        <CardFact label="Groupe" value={card.groupeLabel} />

        <Box sx={{ mt: '1mm', pt: '2mm', borderTop: `1px solid ${brown[200]}` }}>
          <Typography sx={{ fontSize: '2.6mm', fontWeight: 800 }}>N° {membre.idMembre}</Typography>
          {memberSinceDate && (
            <Typography sx={{ fontSize: '2.4mm', color: brown[700] }}>
              Membre depuis le {formatDate(memberSinceDate)}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

function CardFact({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography sx={{ fontSize: '2.3mm', color: brown[600], fontWeight: 700, textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '2.9mm', fontWeight: 700 }}>{value || 'Non renseigné'}</Typography>
    </Box>
  );
}

export default MemberCardSheet;
