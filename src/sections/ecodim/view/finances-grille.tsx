import { useMemo, useState, useEffect, useCallback } from 'react';

import {
  Box,
  Card,
  Chip,
  Stack,
  Table,
  Alert,
  Button,
  Dialog,
  Tooltip,
  MenuItem,
  TableRow,
  TextField,
  TableHead,
  TableBody,
  TableCell,
  Typography,
  IconButton,
  DialogTitle,
  DialogActions,
  DialogContent,
  TableContainer,
  TablePagination,
  CircularProgress,
} from '@mui/material';
import {
  AddRounded,
  EditRounded,
  DeleteRounded,
  SavingsRounded,
  TrendingUpRounded,
  TrendingDownRounded,
} from '@mui/icons-material';

import { formaterDate } from 'src/utils/format-date';
import { apiClient, getApiErrorMessage } from 'src/utils/apiClient';
import { SelectRecherche } from 'src/components/select-recherche';

// ----------------------------------------------------------------------
// Caisse de l'école du dimanche.
//
// Le département encaisse et dépense pour son compte : offrande des enfants,
// cotisation d'une sortie, achat de cahiers, goûter d'une fête, transport.
// Jusqu'ici tout cela se perdait — une seule case « offrande ecodim » dans le
// relevé du culte, et rien du tout pour les dépenses — si bien qu'aucun point
// financier du département n'était possible.
//
// L'écran reprend la forme de la comptabilité de l'église : une ligne par
// mouvement, une recette OU une dépense, un solde, et une corbeille plutôt
// qu'une suppression sèche. Une ligne retirée doit rester explicable, sinon le
// point d'un mois passé ne se refait plus.

/** Les deux sens d'un mouvement. Valeur stockée sans accent, comme ailleurs. */
const TYPES = [
  { valeur: 'recette', libelle: 'Recette' },
  { valeur: 'depense', libelle: 'Dépense' },
];

/**
 * Catégories proposées, tirées de ce qu'une école du dimanche manipule
 * réellement. La liste guide la saisie sans l'enfermer : le champ reste libre,
 * et une église qui a ses propres intitulés peut les écrire.
 */
const CATEGORIES = [
  'Offrande des enfants',
  'Cotisation',
  'Don',
  'Subvention de l’église',
  'Matériel pédagogique',
  'Goûter et collation',
  'Transport',
  'Récompense et prix',
  'Décoration et fête',
  'Autre',
];

const formulaireVide = {
  idFinanceEcodim: null as number | null,
  libelleFinance: '',
  typeFinance: 'depense',
  montantFinance: '',
  dateFinance: '',
  categorieFinance: '',
  idClasseEcodim: '',
  observationFinance: '',
};

/** Montant lisible, en francs CFA, sans décimale : la monnaie n'en a pas. */
const formaterMontant = (valeur: number | string): string =>
  `${Number(valeur || 0).toLocaleString('fr-FR')} FCFA`;

type FinancesGrilleProps = {
  /** Mouvements déjà filtrés par les filtres partagés de l'écran Ecodim. */
  finances: any[];
  classes: any[];
  idUtilisateur: number;
  chargement?: boolean;
  /**
   * Compteur d'ouvertures demandées de l'extérieur, par le « + » de la carte
   * Finances. Chaque incrément ouvre la saisie ; un booléen ne permettrait pas
   * de rouvrir après une fermeture sans être remis à faux par le parent.
   */
  demandeAjout?: number;
  onEnregistre: () => void;
  onNotifier: (message: string, severite: 'success' | 'error' | 'info') => void;
};

export function FinancesGrille({
  finances,
  classes,
  idUtilisateur,
  chargement = false,
  demandeAjout = 0,
  onEnregistre,
  onNotifier,
}: FinancesGrilleProps) {
  const [formulaire, setFormulaire] = useState(formulaireVide);
  const [dialogueOuvert, setDialogueOuvert] = useState(false);
  const [enregistrement, setEnregistrement] = useState(false);
  const [ligneASupprimer, setLigneASupprimer] = useState<any | null>(null);
  const [motifSuppression, setMotifSuppression] = useState('');
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [page, setPage] = useState(0);
  const [lignesParPage, setLignesParPage] = useState(5);

  const lignes = useMemo(() => (Array.isArray(finances) ? finances : []), [finances]);

  /**
   * Recettes, dépenses et solde du jeu de lignes affiché.
   *
   * Calculés sur les lignes filtrées, et non sur la caisse entière : filtrer sur
   * un mois doit donner le solde de ce mois, sinon les cartes contredisent le
   * tableau qu'elles coiffent.
   */
  const totaux = useMemo(() => {
    let recettes = 0;
    let depenses = 0;

    lignes.forEach((ligne) => {
      recettes += Number(ligne.entreeFinance) || 0;
      depenses += Number(ligne.sortieFinance) || 0;
    });

    return { recettes, depenses, solde: recettes - depenses };
  }, [lignes]);

  const pageDeLignes = useMemo(
    () => lignes.slice(page * lignesParPage, page * lignesParPage + lignesParPage),
    [lignes, page, lignesParPage]
  );

  const ouvrirAjout = useCallback(() => {
    setFormulaire({
      ...formulaireVide,
      // Une saisie se fait presque toujours le jour même : la date du jour
      // évite d'avoir à la composer à chaque ligne.
      dateFinance: new Date().toISOString().slice(0, 10),
    });
    setDialogueOuvert(true);
  }, []);

  // Le « + » de la carte Finances ouvre la même saisie que le bouton de la
  // grille. La valeur de départ est ignorée : seuls les incréments comptent,
  // sinon la boîte s'ouvrirait toute seule au premier affichage de l'onglet.
  useEffect(() => {
    if (demandeAjout > 0) {
      ouvrirAjout();
    }
  }, [demandeAjout, ouvrirAjout]);

  const ouvrirModification = useCallback((ligne: any) => {
    setFormulaire({
      idFinanceEcodim: Number(ligne.idFinanceEcodim),
      libelleFinance: String(ligne.libelleFinance || ''),
      typeFinance: String(ligne.typeFinance || 'depense'),
      // Le montant est rangé dans l'une des deux colonnes selon le sens : on
      // reprend celle qui porte la valeur.
      montantFinance: String(
        Number(ligne.entreeFinance) || Number(ligne.sortieFinance) || ''
      ),
      dateFinance: String(ligne.dateFinance || '').slice(0, 10),
      categorieFinance: String(ligne.categorieFinance || ''),
      idClasseEcodim: ligne.idClasseEcodim ? String(ligne.idClasseEcodim) : '',
      observationFinance: String(ligne.observationFinance || ''),
    });
    setDialogueOuvert(true);
  }, []);

  const changer = useCallback((champ: string, valeur: any) => {
    setFormulaire((precedent) => ({ ...precedent, [champ]: valeur }));
  }, []);

  const enregistrer = useCallback(async () => {
    if (!formulaire.libelleFinance.trim()) {
      onNotifier('Donne un libellé à ce mouvement.', 'error');
      return;
    }

    if (!(Number(formulaire.montantFinance) > 0)) {
      onNotifier('Le montant doit être supérieur à zéro.', 'error');
      return;
    }

    if (!formulaire.dateFinance) {
      onNotifier('La date du mouvement est requise.', 'error');
      return;
    }

    const donnees = {
      ...formulaire,
      libelleFinance: formulaire.libelleFinance.trim(),
      montantFinance: Number(formulaire.montantFinance) || 0,
      idClasseEcodim: formulaire.idClasseEcodim ? Number(formulaire.idClasseEcodim) : null,
      idUtilisateur,
    };

    try {
      setEnregistrement(true);

      if (formulaire.idFinanceEcodim) {
        await apiClient.updateFinanceEcodim(donnees);
      } else {
        await apiClient.createFinanceEcodim(donnees);
      }

      onNotifier(
        formulaire.idFinanceEcodim ? 'Mouvement modifié.' : 'Mouvement enregistré.',
        'success'
      );
      setDialogueOuvert(false);
      setFormulaire(formulaireVide);
      onEnregistre();
    } catch (erreur) {
      onNotifier(getApiErrorMessage(erreur), 'error');
    } finally {
      setEnregistrement(false);
    }
  }, [formulaire, idUtilisateur, onEnregistre, onNotifier]);

  const supprimer = useCallback(async () => {
    if (!ligneASupprimer) return;

    try {
      setSuppressionEnCours(true);
      await apiClient.deleteFinanceEcodim({
        idFinanceEcodim: Number(ligneASupprimer.idFinanceEcodim),
        idUtilisateur,
        motifSuppressionFinance: motifSuppression.trim(),
      });

      onNotifier('Mouvement retiré de la caisse.', 'success');
      setLigneASupprimer(null);
      setMotifSuppression('');
      onEnregistre();
    } catch (erreur) {
      onNotifier(getApiErrorMessage(erreur), 'error');
    } finally {
      setSuppressionEnCours(false);
    }
  }, [ligneASupprimer, motifSuppression, idUtilisateur, onEnregistre, onNotifier]);

  return (
    <Stack spacing={2.5}>
      {/* ------------------------------------------------------------ totaux */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Card sx={{ flex: 1, p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <TrendingUpRounded color="success" />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Recettes
              </Typography>
              <Typography variant="h6" fontWeight={800}>
                {formaterMontant(totaux.recettes)}
              </Typography>
            </Box>
          </Stack>
        </Card>

        <Card sx={{ flex: 1, p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <TrendingDownRounded color="error" />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Dépenses
              </Typography>
              <Typography variant="h6" fontWeight={800}>
                {formaterMontant(totaux.depenses)}
              </Typography>
            </Box>
          </Stack>
        </Card>

        <Card sx={{ flex: 1, p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <SavingsRounded color={totaux.solde < 0 ? 'error' : 'primary'} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Solde
              </Typography>
              <Typography
                variant="h6"
                fontWeight={800}
                color={totaux.solde < 0 ? 'error.main' : 'text.primary'}
              >
                {formaterMontant(totaux.solde)}
              </Typography>
            </Box>
          </Stack>
        </Card>
      </Stack>

      {/* Un solde négatif n'est pas une erreur de saisie en soi — la caisse a pu
          avancer de l'argent — mais il ne doit pas passer inaperçu. */}
      {totaux.solde < 0 && (
        <Alert severity="warning">
          La caisse est en négatif sur cette période : les dépenses dépassent les recettes de{' '}
          {formaterMontant(Math.abs(totaux.solde))}.
        </Alert>
      )}

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2" color="text.secondary">
          {lignes.length} mouvement{lignes.length > 1 ? 's' : ''}
        </Typography>

        <Button variant="contained" startIcon={<AddRounded />} onClick={ouvrirAjout}>
          Ajouter un mouvement
        </Button>
      </Stack>

      {/* ----------------------------------------------------------- tableau */}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Libellé</TableCell>
              <TableCell>Catégorie</TableCell>
              <TableCell align="right">Recette</TableCell>
              <TableCell align="right">Dépense</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {pageDeLignes.map((ligne) => (
              <TableRow key={ligne.idFinanceEcodim} hover>
                <TableCell>{formaterDate(ligne.dateFinance)}</TableCell>

                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {ligne.libelleFinance}
                  </Typography>
                  {ligne.observationFinance ? (
                    <Typography variant="caption" color="text.secondary">
                      {ligne.observationFinance}
                    </Typography>
                  ) : null}
                </TableCell>

                <TableCell>
                  {ligne.categorieFinance ? (
                    <Chip size="small" variant="outlined" label={ligne.categorieFinance} />
                  ) : (
                    '—'
                  )}
                </TableCell>

                <TableCell align="right">
                  {Number(ligne.entreeFinance) > 0 ? (
                    <Typography variant="body2" color="success.main" fontWeight={700}>
                      {formaterMontant(ligne.entreeFinance)}
                    </Typography>
                  ) : (
                    '—'
                  )}
                </TableCell>

                <TableCell align="right">
                  {Number(ligne.sortieFinance) > 0 ? (
                    <Typography variant="body2" color="error.main" fontWeight={700}>
                      {formaterMontant(ligne.sortieFinance)}
                    </Typography>
                  ) : (
                    '—'
                  )}
                </TableCell>

                <TableCell align="right">
                  <Tooltip title="Modifier">
                    <IconButton size="small" onClick={() => ouvrirModification(ligne)}>
                      <EditRounded fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Retirer de la caisse">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setLigneASupprimer(ligne);
                        setMotifSuppression('');
                      }}
                    >
                      <DeleteRounded fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {chargement && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {!chargement && lignes.length === 0 && (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="subtitle1">Aucun mouvement</Typography>
          <Typography variant="body2" color="text.secondary">
            Enregistre les offrandes des enfants et les dépenses du département pour tenir le
            point financier de l&apos;école du dimanche.
          </Typography>
        </Box>
      )}

      {lignes.length > 0 && (
        <TablePagination
          component="div"
          page={page}
          count={lignes.length}
          rowsPerPage={lignesParPage}
          rowsPerPageOptions={[5, 10, 25]}
          onPageChange={(_, nouvelle) => setPage(nouvelle)}
          onRowsPerPageChange={(evenement) => {
            setLignesParPage(parseInt(evenement.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Lignes par page :"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
        />
      )}

      {/* ---------------------------------------------------------- saisie */}
      <Dialog
        open={dialogueOuvert}
        onClose={() => !enregistrement && setDialogueOuvert(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {formulaire.idFinanceEcodim ? 'Modifier le mouvement' : 'Nouveau mouvement'}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <SelectRecherche
                fullWidth
                label="Sens *"
                value={formulaire.typeFinance}
                onChange={(evenement: any) => changer('typeFinance', evenement.target.value)}
              >
                {TYPES.map((type) => (
                  <MenuItem key={type.valeur} value={type.valeur}>
                    {type.libelle}
                  </MenuItem>
                ))}
              </SelectRecherche>

              <TextField
                fullWidth
                size="small"
                type="number"
                label="Montant (FCFA) *"
                value={formulaire.montantFinance}
                onChange={(evenement) => changer('montantFinance', evenement.target.value)}
              />
            </Stack>

            <TextField
              fullWidth
              size="small"
              label="Libellé *"
              placeholder="Achat de cahiers, offrande du dimanche..."
              value={formulaire.libelleFinance}
              onChange={(evenement) => changer('libelleFinance', evenement.target.value)}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Date *"
                InputLabelProps={{ shrink: true }}
                value={formulaire.dateFinance}
                onChange={(evenement) => changer('dateFinance', evenement.target.value)}
              />

              <SelectRecherche
                fullWidth
                label="Catégorie"
                value={formulaire.categorieFinance}
                onChange={(evenement: any) => changer('categorieFinance', evenement.target.value)}
              >
                <MenuItem value="">Sans catégorie</MenuItem>
                {CATEGORIES.map((categorie) => (
                  <MenuItem key={categorie} value={categorie}>
                    {categorie}
                  </MenuItem>
                ))}
              </SelectRecherche>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <SelectRecherche
                fullWidth
                label="Classe concernée"
                value={formulaire.idClasseEcodim}
                onChange={(evenement: any) => changer('idClasseEcodim', evenement.target.value)}
              >
                <MenuItem value="">Toute l&apos;école</MenuItem>
                {classes.map((classe: any) => (
                  <MenuItem key={classe.idClasseEcodim} value={String(classe.idClasseEcodim)}>
                    {classe.libelleClasse}
                  </MenuItem>
                ))}
              </SelectRecherche>

            </Stack>

            <TextField
              fullWidth
              multiline
              minRows={2}
              size="small"
              label="Observation"
              value={formulaire.observationFinance}
              onChange={(evenement) => changer('observationFinance', evenement.target.value)}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" onClick={() => setDialogueOuvert(false)} disabled={enregistrement}>
            Annuler
          </Button>
          <Button variant="contained" onClick={enregistrer} disabled={enregistrement}>
            {enregistrement ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ------------------------------------------------------ suppression */}
      <Dialog
        open={Boolean(ligneASupprimer)}
        onClose={() => !suppressionEnCours && setLigneASupprimer(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Retirer ce mouvement ?</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="body2">
              <strong>{ligneASupprimer?.libelleFinance}</strong> —{' '}
              {formaterMontant(
                Number(ligneASupprimer?.entreeFinance) ||
                  Number(ligneASupprimer?.sortieFinance) ||
                  0
              )}
            </Typography>

            <Alert severity="info">
              La ligne est mise à la corbeille, pas effacée : le point financier des mois passés
              doit rester explicable.
            </Alert>

            <TextField
              fullWidth
              size="small"
              label="Motif du retrait"
              placeholder="Doublon, erreur de montant..."
              value={motifSuppression}
              onChange={(evenement) => setMotifSuppression(evenement.target.value)}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            color="inherit"
            onClick={() => setLigneASupprimer(null)}
            disabled={suppressionEnCours}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={supprimer}
            disabled={suppressionEnCours}
          >
            {suppressionEnCours ? 'Retrait...' : 'Retirer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
