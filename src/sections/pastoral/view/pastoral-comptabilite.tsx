import type { DateRange } from 'src/utils/period-filter';

import { useMemo, useState, useEffect, useCallback } from 'react';

import {
  Box,
  Card,
  Chip,
  Table,
  Stack,
  Alert,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  LinearProgress,
  TableContainer,
  TablePagination,
} from '@mui/material';
import {
  TrendingUpRounded,
  AccountBalanceRounded,
  TrendingDownRounded,
} from '@mui/icons-material';

import { apiClient } from 'src/utils/apiClient';
import { isDateWithinRange } from 'src/utils/period-filter';

// ----------------------------------------------------------------------
// Point de la comptabilité, vu depuis le suivi pastoral.
//
// Accompagner une famille coûte souvent de l'argent : une aide, des frais
// médicaux, une participation aux obsèques. Cet onglet donne les entrées et les
// sorties de la période choisie, sans quitter l'écran de suivi.
//
// Il ne remplace pas le module Comptabilité : on consulte ici, on saisit là-bas.

type PastoralComptabiliteProps = {
  idUtilisateur: number;
  /** La même période que le reste du suivi pastoral. */
  range: DateRange | null;
  periodLabel: string;
};

const enNombre = (valeur: unknown): number => {
  const normalise =
    typeof valeur === 'number' ? valeur : Number(String(valeur ?? '').replace(',', '.'));

  return Number.isFinite(normalise) ? normalise : 0;
};

const enFrancs = (montant: number): string => `${Math.round(montant).toLocaleString('fr-FR')} F CFA`;

const formaterDate = (date?: string | null): string => {
  const brute = String(date || '').slice(0, 10);
  if (!brute) return '—';

  const valeur = new Date(brute);
  if (Number.isNaN(valeur.getTime())) return brute;

  return valeur.toLocaleDateString('fr-FR');
};

export function PastoralComptabilite({
  idUtilisateur,
  range,
  periodLabel,
}: PastoralComptabiliteProps) {
  const [chargement, setChargement] = useState(true);
  const [ecritures, setEcritures] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [lignesParPage, setLignesParPage] = useState(5);

  const charger = useCallback(async () => {
    if (!idUtilisateur) {
      setEcritures([]);
      setChargement(false);
      return;
    }

    try {
      setChargement(true);
      const reponse = await apiClient.getComptabilitesByUtilisateur(idUtilisateur);
      setEcritures(Array.isArray(reponse?.data) ? reponse.data : []);
    } catch (_error) {
      // Une comptabilité vide ou inaccessible ne doit pas casser l'écran de suivi.
      setEcritures([]);
    } finally {
      setChargement(false);
    }
  }, [idUtilisateur]);

  useEffect(() => {
    charger();
  }, [charger]);

  /** Les écritures de la période, de la plus récente à la plus ancienne. */
  const lignes = useMemo(
    () =>
      ecritures
        .filter((ecriture) => !Number(ecriture?.estSupprimeComptabilite))
        .filter((ecriture) =>
          isDateWithinRange(String(ecriture?.dateComptabilite || '').slice(0, 10), range)
        )
        .sort((gauche, droite) =>
          String(droite?.dateComptabilite || '').localeCompare(String(gauche?.dateComptabilite || ''))
        ),
    [ecritures, range]
  );

  const totaux = useMemo(() => {
    const entrees = lignes.reduce((somme, ligne) => somme + enNombre(ligne?.entreeComptabilite), 0);
    const sorties = lignes.reduce((somme, ligne) => somme + enNombre(ligne?.sortieComptabilite), 0);

    return { entrees, sorties, solde: entrees - sorties };
  }, [lignes]);

  // Un changement de période remet en première page : rester en page 3 d'une
  // liste qui n'en compte plus qu'une afficherait un tableau vide.
  useEffect(() => {
    setPage(0);
  }, [range]);

  const page_ = lignes.slice(page * lignesParPage, page * lignesParPage + lignesParPage);

  if (chargement) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        {[
          { libelle: 'Entrées', valeur: totaux.entrees, icone: <TrendingUpRounded />, couleur: 'success.main' },
          { libelle: 'Sorties', valeur: totaux.sorties, icone: <TrendingDownRounded />, couleur: 'error.main' },
          { libelle: 'Solde', valeur: totaux.solde, icone: <AccountBalanceRounded />, couleur: 'info.main' },
        ].map((carte) => (
          <Card key={carte.libelle} variant="outlined" sx={{ p: 2, flex: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ color: carte.couleur, display: 'flex' }}>{carte.icone}</Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {carte.libelle}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {enFrancs(carte.valeur)}
                </Typography>
              </Box>
            </Stack>
          </Card>
        ))}
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
        Période : {periodLabel} — {lignes.length} écriture{lignes.length > 1 ? 's' : ''}. La saisie
        se fait dans le module Comptabilité.
      </Typography>

      {lignes.length === 0 ? (
        <Alert severity="info">Aucune écriture sur cette période.</Alert>
      ) : (
        <Card variant="outlined">
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Libellé</TableCell>
                  <TableCell align="right">Entrée</TableCell>
                  <TableCell align="right">Sortie</TableCell>
                  <TableCell>Observation</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {page_.map((ligne, index) => {
                  const entree = enNombre(ligne?.entreeComptabilite);
                  const sortie = enNombre(ligne?.sortieComptabilite);

                  return (
                    <TableRow key={ligne?.idComptabilite ?? `ligne-${index}`} hover>
                      <TableCell>{formaterDate(ligne?.dateComptabilite)}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2">{ligne?.nomComptabilite || '—'}</Typography>
                          <Chip
                            size="small"
                            color={entree > 0 ? 'success' : 'error'}
                            label={entree > 0 ? 'Entrée' : 'Sortie'}
                          />
                        </Stack>
                      </TableCell>
                      <TableCell align="right">{entree > 0 ? enFrancs(entree) : '—'}</TableCell>
                      <TableCell align="right">{sortie > 0 ? enFrancs(sortie) : '—'}</TableCell>
                      <TableCell>{ligne?.observationComptabilite || '—'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            page={page}
            count={lignes.length}
            rowsPerPage={lignesParPage}
            rowsPerPageOptions={[5, 10, 25]}
            onPageChange={(_, nouvelle) => setPage(nouvelle)}
            onRowsPerPageChange={(event) => {
              setLignesParPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Lignes par page :"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
          />
        </Card>
      )}
    </Box>
  );
}
