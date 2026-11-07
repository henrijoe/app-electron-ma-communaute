import ReactToPrint from 'react-to-print';
import { useSelector } from 'react-redux';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { PrintRounded } from '@mui/icons-material';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { apiClient, getApiErrorMessage } from 'src/utils/apiClient';

import { getPrintableLogoUrl, PRINT_LANDSCAPE_PAGE_STYLE } from 'src/components/print/print-document';

import { type MembreFamille, FeuilleFamilleJeunesse } from '../etats/feuille-famille-jeunesse';

// ----------------------------------------------------------------------
// Membres d'une famille de jeunesse : on les choisit parmi les membres de
// l'église, puis on imprime la feuille de la famille, remplie depuis leurs fiches.

type Option = { idMembre: number; libelle: string };

const nomDuMembre = (m: any): string => `${m?.nomMembre || ''} ${m?.prenomMembre || ''}`.trim();

type MembresFamilleDialogProps = {
  famille: any | null;
  familles: any[];
  membresEglise: any[];
  idUtilisateur: number;
  /** Faux dans la fenêtre Windows ou pour un compte en lecture seule. */
  modifiable: boolean;
  /** Faux dans la fenêtre Windows : l'impression se fait au navigateur. */
  imprimable: boolean;
  onClose: () => void;
  onNotifier: (message: string, severite: 'success' | 'error' | 'info' | 'warning') => void;
};

export function MembresFamilleDialog({
  famille,
  familles,
  membresEglise,
  idUtilisateur,
  modifiable,
  imprimable,
  onClose,
  onNotifier,
}: MembresFamilleDialogProps) {
  const [liens, setLiens] = useState<any[]>([]);
  const [selection, setSelection] = useState<number[]>([]);
  const [chargement, setChargement] = useState(false);
  const [enregistrement, setEnregistrement] = useState(false);
  const referenceFeuille = useRef<HTMLDivElement>(null);

  const appUser = useSelector((state: any) => state.application?.userConnected);
  const authUser = useSelector((state: any) => state.authentification?.utilisateurData);
  const identite = useMemo(() => ({ ...(authUser || {}), ...(appUser || {}) }), [appUser, authUser]);
  const logoUrl = useMemo(() => getPrintableLogoUrl(identite as any), [identite]);
  const nomEglise = String(identite?.nomTemple || identite?.nomEgliseCourt || '');

  const idFamille = Number(famille?.idFamilleJeunesse) || 0;

  const charger = useCallback(async () => {
    if (!idUtilisateur || !idFamille) return;
    try {
      setChargement(true);
      const reponse = await apiClient.getMembresFamillesJeunesse(idUtilisateur);
      const tous = Array.isArray(reponse?.data) ? reponse.data : [];
      setLiens(tous);
      setSelection(
        tous.filter((l: any) => Number(l.idFamilleJeunesse) === idFamille).map((l: any) => Number(l.idMembre))
      );
    } catch (erreur) {
      onNotifier(getApiErrorMessage(erreur, 'Impossible de charger les membres de la famille.'), 'error');
    } finally {
      setChargement(false);
    }
  }, [idFamille, idUtilisateur, onNotifier]);

  useEffect(() => {
    if (famille) charger();
  }, [famille, charger]);

  // Famille actuelle de chaque membre, pour signaler qu'un ajout le déplacera.
  const familleDuMembre = useMemo(() => {
    const noms = new Map(familles.map((f: any) => [Number(f.idFamilleJeunesse), f.nomFamilleJeunesse]));
    return new Map(liens.map((l: any) => [Number(l.idMembre), { id: Number(l.idFamilleJeunesse), nom: noms.get(Number(l.idFamilleJeunesse)) || '' }]));
  }, [familles, liens]);

  const options = useMemo<Option[]>(
    () =>
      (Array.isArray(membresEglise) ? membresEglise : [])
        .map((m: any) => ({ idMembre: Number(m.idMembre), libelle: nomDuMembre(m) }))
        .filter((o) => o.idMembre && o.libelle)
        .sort((a, b) => a.libelle.localeCompare(b.libelle, 'fr')),
    [membresEglise]
  );

  const enregistres = useMemo(
    () => liens.filter((l: any) => Number(l.idFamilleJeunesse) === idFamille).map((l: any) => Number(l.idMembre)),
    [liens, idFamille]
  );
  const modifie =
    enregistres.length !== selection.length || enregistres.some((id) => !selection.includes(id));

  // Les membres de la feuille, dans l'ordre alphabétique, avec ce que la fiche contient.
  const membresFeuille = useMemo<MembreFamille[]>(() => {
    const parLien = new Map(liens.map((l: any) => [Number(l.idMembre), l]));
    const parMembre = new Map((membresEglise || []).map((m: any) => [Number(m.idMembre), m]));
    return selection
      .map((id) => parLien.get(id) || parMembre.get(id))
      .filter(Boolean)
      .sort((a: any, b: any) => nomDuMembre(a).localeCompare(nomDuMembre(b), 'fr'));
  }, [selection, liens, membresEglise]);

  const enregistrer = async () => {
    try {
      setEnregistrement(true);
      await apiClient.saveMembresFamilleJeunesse({ idFamilleJeunesse: idFamille, idUtilisateur, membres: selection });
      onNotifier('Membres de la famille enregistrés.', 'success');
      await charger();
    } catch (erreur) {
      onNotifier(getApiErrorMessage(erreur), 'error');
    } finally {
      setEnregistrement(false);
    }
  };

  return (
    <Dialog open={Boolean(famille)} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Membres de la famille {famille?.nomFamilleJeunesse || ''}</DialogTitle>

      <DialogContent dividers>
        {chargement ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Stack spacing={2}>
            <Autocomplete
              multiple
              disabled={!modifiable}
              options={options}
              value={options.filter((o) => selection.includes(o.idMembre))}
              getOptionLabel={(o) => o.libelle}
              isOptionEqualToValue={(a, b) => a.idMembre === b.idMembre}
              onChange={(_, valeur) => setSelection(valeur.map((o) => o.idMembre))}
              renderOption={(props, o) => {
                const actuelle = familleDuMembre.get(o.idMembre);
                return (
                  <li {...props} key={o.idMembre}>
                    <Box sx={{ flex: 1 }}>{o.libelle}</Box>
                    {actuelle && actuelle.id !== idFamille ? (
                      <Typography variant="caption" color="warning.main">
                        déjà dans {actuelle.nom || 'une autre famille'}
                      </Typography>
                    ) : null}
                  </li>
                );
              }}
              renderTags={(valeur, getTagProps) =>
                valeur.map((o, index) => (
                  <Chip {...getTagProps({ index })} key={o.idMembre} size="small" label={o.libelle} />
                ))
              }
              renderInput={(params) => (
                <TextField {...params} label="Membres de la famille" placeholder="Rechercher un membre" />
              )}
            />

            <Typography variant="body2" color="text.secondary">
              {selection.length} membre{selection.length > 1 ? 's' : ''}. Les contacts, le domicile, le
              baptême, le niveau d&apos;étude et la fonction viennent de la fiche de chaque membre.
              Un membre ajouté ici quitte la famille où il était.
            </Typography>

            {imprimable && modifie && (
              <Alert severity="info">Enregistrez avant d&apos;imprimer la feuille.</Alert>
            )}
          </Stack>
        )}

        <Box sx={{ display: 'none' }}>
          <FeuilleFamilleJeunesse
            ref={referenceFeuille}
            nomEglise={nomEglise}
            logoUrl={logoUrl}
            nomFamille={famille?.nomFamilleJeunesse || ''}
            membres={membresFeuille}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        {imprimable && (
          <ReactToPrint
            trigger={() => (
              <Button startIcon={<PrintRounded />} disabled={modifie || chargement} sx={{ mr: 'auto' }}>
                Imprimer la feuille
              </Button>
            )}
            content={() => referenceFeuille.current}
            pageStyle={PRINT_LANDSCAPE_PAGE_STYLE}
            documentTitle={`Famille ${famille?.nomFamilleJeunesse || ''}`}
          />
        )}
        <Button onClick={onClose}>Fermer</Button>
        {modifiable && (
          <Button variant="contained" onClick={enregistrer} disabled={!modifie || enregistrement}>
            {enregistrement ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
