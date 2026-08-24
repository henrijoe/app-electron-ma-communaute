import React from 'react';

import { Typography } from '@mui/material';

import {
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  PrintTable,
  PrintEmptyState,
  PrintDocumentLayout,
} from 'src/components/print/print-document';

import type { IDeces } from 'src/store/decesSlice';
import type { IMariage } from 'src/store/mariageSlice';
import type { INaissance } from 'src/store/naissanceSlice';

import type { IMaladieDraft, SocialCaseType } from '../types';

type PrintIdentity = {
  email?: string;
  logoUtilisateur?: string;
  nomTemple?: string;
  nomUtilisateur?: string;
  prenomUtilisateur?: string;
  telephoneUtilisateur?: string;
};

type SocialPrintDocumentProps = {
  identity?: PrintIdentity;
  type: SocialCaseType;
  rows: IDeces[] | IMaladieDraft[] | IMariage[] | INaissance[];
  // Rappelle la periode et le nombre d'elements actifs au moment de l'impression
  // (sinon un document imprime plus tard serait indiscernable d'un autre).
  subtitle?: string;
};

const titles: Record<SocialCaseType, { empty: string; fileTitle: string }> = {
  mariage: { empty: 'Aucun mariage trouvé', fileTitle: 'Liste des mariages' },
  naissance: { empty: 'Aucune naissance trouvée', fileTitle: 'Liste des naissances' },
  deces: { empty: 'Aucun décès trouvé', fileTitle: 'Liste des décès' },
  maladie: { empty: 'Aucune maladie trouvée', fileTitle: 'Liste des maladies' },
};

const formatDate = (value?: string | null) => {
  if (!value) return 'Non spécifié';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Non spécifié';
  return parsed.toLocaleDateString('fr-FR');
};

export function SocialPrintDocument({ identity, rows, type, subtitle }: SocialPrintDocumentProps) {
  const config = titles[type];
  const normalizedRows = Array.isArray(rows) ? rows : [];

  return (
    <PrintDocumentLayout identity={identity} title={config.fileTitle}>
      {subtitle && (
        <Typography variant="body2" sx={{ mb: 1.5, color: '#475569' }}>
          {subtitle}
        </Typography>
      )}
      {normalizedRows.length === 0 ? (
        <PrintEmptyState
          title={config.empty}
          message="Aucun enregistrement n'est encore disponible pour cette catégorie."
        />
      ) : (
        <RenderTable type={type} rows={normalizedRows} />
      )}
    </PrintDocumentLayout>
  );
}

function RenderTable({ rows, type }: { rows: any[]; type: SocialCaseType }) {
  if (type === 'mariage') {
    return (
      <PrintTable minWidth={980}>
        <TableHead>
          <TableRow>
            <TableCell align="center">N°</TableCell>
            <TableCell>Frère</TableCell>
            <TableCell>Sœur</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Lieu</TableCell>
            <TableCell>Culte</TableCell>
            <TableCell>Témoins</TableCell>
            <TableCell>Réception</TableCell>
            <TableCell>Contact</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((item: IMariage, index) => (
            <TableRow key={item.idMariage || index}>
              <TableCell align="center">
                <Typography fontWeight={700}>{index + 1}</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={700}>{item.nomFrereMariage || 'Non spécifié'}</Typography>
              </TableCell>
              <TableCell>{item.nomSoeurMariage || 'Non spécifié'}</TableCell>
              <TableCell>{formatDate(item.dateMariage)}</TableCell>
              <TableCell>{item.lieuMariage || 'Non spécifié'}</TableCell>
              <TableCell>{item.culteMariage || 'Non spécifié'}</TableCell>
              <TableCell>{[item.temoin1Mariage, item.temoin2Mariage].filter(Boolean).join(' / ') || 'Non spécifié'}</TableCell>
              <TableCell>{item.lieuReception || 'Non spécifié'}</TableCell>
              <TableCell>{item.contactMariage || 'Non spécifié'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </PrintTable>
    );
  }

  if (type === 'naissance') {
    return (
      <PrintTable minWidth={920}>
        <TableHead>
          <TableRow>
            <TableCell align="center">N°</TableCell>
            <TableCell>Parents</TableCell>
            <TableCell>Enfant</TableCell>
            <TableCell>Date naissance</TableCell>
            <TableCell>Lieu</TableCell>
            <TableCell>Présentation</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((item: INaissance, index) => (
            <TableRow key={item.idNaissance || index}>
              <TableCell align="center">
                <Typography fontWeight={700}>{index + 1}</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={700}>{item.nomCoupleNaissance || 'Non spécifié'}</Typography>
              </TableCell>
              <TableCell>{item.nomEnfantNaissance || 'Non spécifié'}</TableCell>
              <TableCell>{formatDate(item.dateNaissance)}</TableCell>
              <TableCell>{item.lieuNaissance || 'Non spécifié'}</TableCell>
              <TableCell>{formatDate(item.datePresentationNaissance)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </PrintTable>
    );
  }

  if (type === 'deces') {
    return (
      <PrintTable minWidth={900}>
        <TableHead>
          <TableRow>
            <TableCell align="center">N°</TableCell>
            <TableCell>Membre</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Lieu</TableCell>
            <TableCell>Cause</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((item: IDeces, index) => (
            <TableRow key={item.idDeces || index}>
              <TableCell align="center">
                <Typography fontWeight={700}>{index + 1}</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={700}>{item.nomMembreDeces || 'Non spécifié'}</Typography>
              </TableCell>
              <TableCell>{formatDate(item.dateDeces)}</TableCell>
              <TableCell>{item.lieuDeces || 'Non spécifié'}</TableCell>
              <TableCell>{item.causeDeces || 'Non spécifiée'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </PrintTable>
    );
  }

  return (
    <PrintTable minWidth={940}>
      <TableHead>
        <TableRow>
          <TableCell align="center">N°</TableCell>
          <TableCell>Membre</TableCell>
          <TableCell>Type</TableCell>
          <TableCell>Date</TableCell>
          <TableCell>Lieu</TableCell>
          <TableCell>Observation</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((item: IMaladieDraft, index) => (
          <TableRow key={item.idMaladie || index}>
            <TableCell align="center">
              <Typography fontWeight={700}>{index + 1}</Typography>
            </TableCell>
            <TableCell>
              <Typography fontWeight={700}>{item.nomMembreMaladie || 'Non spécifié'}</Typography>
            </TableCell>
            <TableCell>{item.typeMaladie || 'Non spécifié'}</TableCell>
            <TableCell>{formatDate(item.dateMaladie)}</TableCell>
            <TableCell>{item.lieuHospitalisation || 'Non spécifié'}</TableCell>
            <TableCell>{item.observationMaladie || 'Non spécifiée'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </PrintTable>
  );
}

export default SocialPrintDocument;
