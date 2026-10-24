import { useMemo, useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';

import {
  Box,
  Chip,
  Card,
  Stack,
  Alert,
  Badge,
  Button,
  Dialog,
  Divider,
  Tooltip,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  CardContent,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  CloseRounded,
  QrCode2Rounded,
  ContentCopyRounded,
  InboxRounded,
} from '@mui/icons-material';

import { apiClient, getApiErrorMessage } from 'src/utils/apiClient';
import { SelectRecherche } from 'src/components/select-recherche';
import { formaterDate } from 'src/utils/format-date';

// ----------------------------------------------------------------------
// Inscription d'un enfant par QR code.
//
// Le poste affiche un code ; les parents présents le scannent et remplissent la
// fiche sur leur téléphone. Les demandes arrivent ici, où un responsable les
// relit avant de créer l'enfant — ou directement, si l'église a désactivé la
// validation dans les paramètres.
//
// Le bouton reste visible en application desktop, contrairement aux autres
// boutons d'ajout : c'est justement ce poste qui héberge le backend, et donc le
// seul à pouvoir afficher un code que les téléphones du réseau sauront joindre.

type InscriptionQrEnfantProps = {
  idUtilisateur: number;
  nomEglise: string;
  classes: any[];
  /** Rappelé après une validation : la liste des enfants doit se recharger. */
  onEnfantCree: () => void;
  showNotification: (message: string, severite?: 'success' | 'info' | 'warning' | 'error') => void;
};

const nomDemande = (demande: any) =>
  `${String(demande?.nomEnfant || '').trim()} ${String(demande?.prenomEnfant || '').trim()}`.trim();

/** La fiche d'origine, conservée en JSON par le serveur. */
const ficheDe = (demande: any): any => {
  try {
    return JSON.parse(demande?.payloadDemande || '{}');
  } catch (_error) {
    return {};
  }
};

export function InscriptionQrEnfant({
  idUtilisateur,
  nomEglise,
  classes,
  onEnfantCree,
  showNotification,
}: InscriptionQrEnfantProps) {
  const [qrOuvert, setQrOuvert] = useState(false);
  const [demandesOuvertes, setDemandesOuvertes] = useState(false);
  const [adresseReseau, setAdresseReseau] = useState('');
  const [demandes, setDemandes] = useState<any[]>([]);
  const [chargement, setChargement] = useState(false);
  const [traitement, setTraitement] = useState(0);
  /** Classe choisie au moment de valider, par demande. */
  const [classeParDemande, setClasseParDemande] = useState<Record<number, string>>({});

  const lienInscription = useMemo(() => {
    if (typeof window === 'undefined' || !idUtilisateur) {
      return '';
    }

    // L'adresse du poste sur le réseau local, et non celle du navigateur : un
    // téléphone qui lirait « localhost » se joindrait lui-même.
    const base = adresseReseau || window.location.origin;
    const url = new URL('/inscription-enfant', base);

    url.searchParams.set('user', String(idUtilisateur));
    if (nomEglise) {
      url.searchParams.set('church', nomEglise);
    }

    return url.toString();
  }, [idUtilisateur, nomEglise, adresseReseau]);

  const chargerDemandes = useCallback(async () => {
    if (!idUtilisateur) return;

    try {
      setChargement(true);
      const reponse: any = await apiClient.getDemandesInscriptionEnfant(idUtilisateur);
      setDemandes(Array.isArray(reponse?.data) ? reponse.data : []);
    } catch (_error) {
      // Une liste de demandes vide n'empêche pas de travailler : inutile
      // d'alerter sur un écran que l'utilisateur n'a peut-être pas ouvert.
      setDemandes([]);
    } finally {
      setChargement(false);
    }
  }, [idUtilisateur]);

  useEffect(() => {
    chargerDemandes();
  }, [chargerDemandes]);

  const enAttente = demandes.filter((demande) => demande.statutDemande === 'en_attente');

  const ouvrirQr = async () => {
    setQrOuvert(true);

    try {
      const reponse: any = await apiClient.getServerInfo();
      const adresse = String(reponse?.data?.browserUrl || '').trim();

      if (reponse?.status === 1 && adresse) {
        setAdresseReseau(adresse);
      }
    } catch (_error) {
      // Sans adresse réseau, le lien retombe sur celle du navigateur : utilisable
      // depuis le poste lui-même, et c'est mieux que pas de code du tout.
    }
  };

  const valider = async (demande: any) => {
    setTraitement(demande.idDemandeEnfant);

    try {
      const classeChoisie = classeParDemande[demande.idDemandeEnfant];

      await apiClient.validerDemandeInscriptionEnfant({
        idDemandeEnfant: Number(demande.idDemandeEnfant),
        idUtilisateur,
        modifications: classeChoisie ? { idClasseEcodim: Number(classeChoisie) } : undefined,
      });

      showNotification(`${nomDemande(demande)} a été inscrit.`, 'success');
      await chargerDemandes();
      onEnfantCree();
    } catch (error) {
      showNotification(getApiErrorMessage(error, "L'inscription a échoué."), 'error');
    } finally {
      setTraitement(0);
    }
  };

  const rejeter = async (demande: any) => {
    setTraitement(demande.idDemandeEnfant);

    try {
      await apiClient.rejeterDemandeInscriptionEnfant({
        idDemandeEnfant: Number(demande.idDemandeEnfant),
        idUtilisateur,
      });

      showNotification('Demande rejetée.', 'info');
      await chargerDemandes();
    } catch (error) {
      showNotification(getApiErrorMessage(error, 'Le rejet a échoué.'), 'error');
    } finally {
      setTraitement(0);
    }
  };

  const copierLien = async () => {
    try {
      await navigator.clipboard.writeText(lienInscription);
      showNotification('Lien copié.', 'success');
    } catch (_error) {
      showNotification("Le lien n'a pas pu être copié.", 'warning');
    }
  };

  return (
    <>
      <Tooltip title="Inscription par QR code">
        <span>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<QrCode2Rounded fontSize="small" />}
            onClick={ouvrirQr}
            disabled={!idUtilisateur}
          >
            QR code
          </Button>
        </span>
      </Tooltip>

      <Tooltip title="Demandes d'inscription reçues">
        <span>
          <Badge badgeContent={enAttente.length} color="error">
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<InboxRounded fontSize="small" />}
              onClick={() => {
                chargerDemandes();
                setDemandesOuvertes(true);
              }}
              disabled={!idUtilisateur}
            >
              Demandes
            </Button>
          </Badge>
        </span>
      </Tooltip>

      {/* ------------------------------------------------------- le QR code */}
      <Dialog open={qrOuvert} onClose={() => setQrOuvert(false)} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}
        >
          <Box component="span">Inscription d&apos;un enfant par QR code</Box>
          <IconButton onClick={() => setQrOuvert(false)}>
            <CloseRounded />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Typography
              color="text.primary"
              sx={{ textAlign: 'center', fontWeight: 500, fontSize: { xs: '0.95rem', sm: '1rem' } }}
            >
              LES PARENTS SCANNENT CE CODE POUR INSCRIRE LEUR ENFANT. LE TÉLÉPHONE DOIT ÊTRE
              CONNECTÉ AU MÊME RÉSEAU QUE LE POSTE PRINCIPAL.
            </Typography>

            <Box
              sx={{
                p: 2,
                // Centré par « alignSelf » : le Stack pose « margin: 0 » sur ses
                // enfants, ce qui effacerait une marge automatique.
                alignSelf: 'center',
                width: 'fit-content',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1,
                bgcolor: 'common.white',
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              {lienInscription ? <QRCodeSVG value={lienInscription} size={280} level="M" /> : null}
            </Box>

            <TextField
              fullWidth
              label="Lien d'inscription"
              value={lienInscription}
              InputProps={{ readOnly: true }}
              helperText="Le téléphone doit être sur le même réseau Wi-Fi que le poste principal."
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setQrOuvert(false)} color="inherit">
            Fermer
          </Button>
          <Button
            variant="contained"
            startIcon={<ContentCopyRounded />}
            onClick={copierLien}
            disabled={!lienInscription}
          >
            Copier le lien
          </Button>
        </DialogActions>
      </Dialog>

      {/* ------------------------------------------------- les demandes reçues */}
      <Dialog
        open={demandesOuvertes}
        onClose={() => setDemandesOuvertes(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}
        >
          <Box component="span">Demandes d&apos;inscription</Box>
          <IconButton onClick={() => setDemandesOuvertes(false)}>
            <CloseRounded />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {chargement && (
            <Stack alignItems="center" sx={{ py: 4 }}>
              <CircularProgress />
            </Stack>
          )}

          {!chargement && !demandes.length && (
            <Alert severity="info">
              Aucune demande pour le moment. Affiche le QR code pour que les parents inscrivent
              leurs enfants.
            </Alert>
          )}

          <Stack spacing={2}>
            {demandes.map((demande) => {
              const fiche = ficheDe(demande);
              const traitee = demande.statutDemande !== 'en_attente';

              return (
                <Card key={demande.idDemandeEnfant} variant="outlined">
                  <CardContent>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1}
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      sx={{ mb: 1.5 }}
                    >
                      <Typography variant="subtitle1" sx={{ flex: 1 }}>
                        {nomDemande(demande) || 'Enfant sans nom'}
                      </Typography>

                      <Chip
                        size="small"
                        label={
                          {
                            en_attente: 'En attente',
                            validee: 'Inscrit',
                            rejetee: 'Rejetée',
                          }[demande.statutDemande as string] || demande.statutDemande
                        }
                        color={
                          // eslint-disable-next-line no-nested-ternary
                          demande.statutDemande === 'validee'
                            ? 'success'
                            : demande.statutDemande === 'rejetee'
                              ? 'default'
                              : 'warning'
                        }
                      />
                    </Stack>

                    <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Né(e) le : {formaterDate(fiche.dateNaissEnfant, '—')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Habitation : {fiche.lieuHabitationEnfant || '—'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Parent : {fiche.nomParentEnfant || '—'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Contact : {demande.contactParentEnfant || '—'}
                      </Typography>
                    </Stack>

                    {!traitee && (
                      <>
                        <Divider sx={{ my: 1.5 }} />

                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          spacing={1.5}
                          alignItems={{ xs: 'stretch', sm: 'center' }}
                        >
                          {/* Le parent ne choisit pas la classe : elle dépend de
                              l'âge et de l'organisation, que seule l'école connaît. */}
                          <SelectRecherche
                            label="Classe"
                            value={classeParDemande[demande.idDemandeEnfant] || ''}
                            onChange={(event) =>
                              setClasseParDemande((precedent) => ({
                                ...precedent,
                                [demande.idDemandeEnfant]: event.target.value,
                              }))
                            }
                            size="small"
                            sx={{ minWidth: 220 }}
                          >
                            <MenuItem value="">À affecter plus tard</MenuItem>
                            {classes.map((classe) => (
                              <MenuItem
                                key={classe.idClasseEcodim}
                                value={String(classe.idClasseEcodim)}
                              >
                                {classe.libelleClasse}
                              </MenuItem>
                            ))}
                          </SelectRecherche>

                          <Box sx={{ flex: 1 }} />

                          <Button
                            color="inherit"
                            onClick={() => rejeter(demande)}
                            disabled={traitement === demande.idDemandeEnfant}
                          >
                            Rejeter
                          </Button>
                          <Button
                            variant="contained"
                            onClick={() => valider(demande)}
                            disabled={traitement === demande.idDemandeEnfant}
                          >
                            Valider et inscrire
                          </Button>
                        </Stack>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDemandesOuvertes(false)} color="inherit">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
