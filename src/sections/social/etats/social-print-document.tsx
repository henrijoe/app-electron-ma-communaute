import React from 'react';
import { Typography } from '@mui/material';

import {
  PrintDocumentLayout,
  PrintEmptyState,
  PrintTable,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
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
};

const titles: Record<SocialCaseType, { empty: string; fileTitle: string }> = {
  mariage: { empty: 'Aucun mariage trouve', fileTitle: 'Liste des mariages' },
  naissance: { empty: 'Aucune naissance trouvee', fileTitle: 'Liste des naissances' },
  deces: { empty: 'Aucun deces trouve', fileTitle: 'Liste des deces' },
  maladie: { empty: 'Aucune maladie trouvee', fileTitle: 'Liste des maladies' },
};

const formatDate = (value?: string | null) => {
  if (!value) return 'Non specifié';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Non specifié';
  return parsed.toLocaleDateString('fr-FR');
};

export function SocialPrintDocument({ identity, rows, type }: SocialPrintDocumentProps) {
  const config = titles[type];
  const normalizedRows = Array.isArray(rows) ? rows : [];

  return (
    <PrintDocumentLayout
      identity={identity}
      title={config.fileTitle}
    >
      {normalizedRows.length === 0 ? (
        <PrintEmptyState
          title={config.empty}
          message="Aucun enregistrement n'est encore disponible pour cette categorie."
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
            <TableCell>Soeur</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Lieu</TableCell>
            <TableCell>Culte</TableCell>
            <TableCell>Temoins</TableCell>
            <TableCell>Reception</TableCell>
            <TableCell>Contact</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((item: IMariage, index) => (
            <TableRow key={item.idMariage || index}>
              <TableCell align="center"><Typography fontWeight={700}>{index + 1}</Typography></TableCell>
              <TableCell><Typography fontWeight={700}>{item.nomFrereMariage || 'Non specifié'}</Typography></TableCell>
              <TableCell>{item.nomSoeurMariage || 'Non specifié'}</TableCell>
              <TableCell>{formatDate(item.dateMariage)}</TableCell>
              <TableCell>{item.lieuMariage || 'Non specifié'}</TableCell>
              <TableCell>{item.culteMariage || 'Non specifié'}</TableCell>
              <TableCell>{[item.temoin1Mariage, item.temoin2Mariage].filter(Boolean).join(' / ') || 'Non specifié'}</TableCell>
              <TableCell>{item.lieuReception || 'Non specifié'}</TableCell>
              <TableCell>{item.contactMariage || 'Non specifié'}</TableCell>
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
            <TableCell>Presentation</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((item: INaissance, index) => (
            <TableRow key={item.idNaissance || index}>
              <TableCell align="center"><Typography fontWeight={700}>{index + 1}</Typography></TableCell>
              <TableCell><Typography fontWeight={700}>{item.nomCoupleNaissance || 'Non specifié'}</Typography></TableCell>
              <TableCell>{item.nomEnfantNaissance || 'Non specifié'}</TableCell>
              <TableCell>{formatDate(item.dateNaissance)}</TableCell>
              <TableCell>{item.lieuNaissance || 'Non specifié'}</TableCell>
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
              <TableCell align="center"><Typography fontWeight={700}>{index + 1}</Typography></TableCell>
              <TableCell><Typography fontWeight={700}>{item.nomMembreDeces || 'Non specifié'}</Typography></TableCell>
              <TableCell>{formatDate(item.dateDeces)}</TableCell>
              <TableCell>{item.lieuDeces || 'Non specifié'}</TableCell>
              <TableCell>{item.causeDeces || 'Non specifiée'}</TableCell>
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
            <TableCell align="center"><Typography fontWeight={700}>{index + 1}</Typography></TableCell>
            <TableCell><Typography fontWeight={700}>{item.nomMembreMaladie || 'Non specifié'}</Typography></TableCell>
            <TableCell>{item.typeMaladie || 'Non specifié'}</TableCell>
            <TableCell>{formatDate(item.dateMaladie)}</TableCell>
            <TableCell>{item.lieuHospitalisation || 'Non specifié'}</TableCell>
            <TableCell>{item.observationMaladie || 'Non specifiée'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </PrintTable>
  );
}

export default SocialPrintDocument;
