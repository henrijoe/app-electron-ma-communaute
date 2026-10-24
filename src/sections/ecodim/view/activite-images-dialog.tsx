import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { DeleteRounded, AddPhotoAlternateRounded } from '@mui/icons-material';

import { apiClient, getApiErrorMessage, buildEcodimMediaUrl } from 'src/utils/apiClient';

// ----------------------------------------------------------------------
// Photos d'une activité, dans l'esprit de « Nos évènements » : plusieurs images par
// activité, toutes facultatives.

const TAILLE_MAXI_MO = 5;

type GalerieActiviteProps = {
  activite: any | null;
  idUtilisateur: number;
  modifiable: boolean;
  showNotification: (message: string, severite?: 'success' | 'info' | 'warning' | 'error') => void;
};

type ActiviteImagesDialogProps = GalerieActiviteProps & {
  onClose: () => void;
};

/**
 * Galerie d'une activité, sans cadre : utilisée telle quelle dans le formulaire de
 * l'activité, et enveloppée dans une fenêtre depuis la liste.
 */
export function GalerieActivite({
  activite,
  idUtilisateur,
  modifiable,
  showNotification,
}: GalerieActiviteProps) {
  const champFichier = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<any[]>([]);
  const [envoi, setEnvoi] = useState(false);

  // On ne dépend que de l'identifiant, jamais de l'objet : la galerie est montée
  // dans le formulaire de l'activité, dont l'objet est recréé à chaque frappe. Avec
  // l'objet en dépendance, les images seraient rechargées à chaque caractère tapé.
  const idActiviteEcodim = activite?.idActiviteEcodim ?? null;

  const charger = useCallback(async () => {
    if (!idActiviteEcodim) {
      setImages([]);
      return;
    }

    try {
      const reponse = await apiClient.getImagesActiviteEcodim(idActiviteEcodim, idUtilisateur);
      setImages(Array.isArray(reponse?.data) ? reponse.data : []);
    } catch (_error) {
      // Une activité sans photo n'est pas une erreur à signaler.
      setImages([]);
    }
  }, [idActiviteEcodim, idUtilisateur]);

  useEffect(() => {
    charger();
  }, [charger]);

  const ajouter = async (fichiers?: FileList | null) => {
    if (!fichiers?.length || !activite) {
      return;
    }

    // On écarte d'abord ce qui ne passera pas, en le disant à l'utilisateur, pour
    // n'envoyer ensuite que des fichiers valables.
    const retenus = Array.from(fichiers).filter((fichier) => {
      if (!fichier.type.startsWith('image/')) {
        showNotification(`« ${fichier.name} » n'est pas une image.`, 'warning');
        return false;
      }

      if (fichier.size > TAILLE_MAXI_MO * 1024 * 1024) {
        showNotification(`« ${fichier.name} » dépasse ${TAILLE_MAXI_MO} Mo.`, 'warning');
        return false;
      }

      return true;
    });

    if (!retenus.length) {
      if (champFichier.current) {
        champFichier.current.value = '';
      }
      return;
    }

    let envoyees = 0;

    try {
      setEnvoi(true);

      // Envoi séquentiel : un lot de photos de téléphone dépasse vite les limites
      // de charge utile si on les envoie toutes en même temps.
      await retenus.reduce(
        (precedent, fichier) =>
          precedent.then(async () => {
            const base64 = await new Promise<string>((resolve, reject) => {
              const lecteur = new FileReader();
              lecteur.onload = () => resolve(String(lecteur.result || ''));
              lecteur.onerror = () =>
                reject(new Error(`« ${fichier.name} » n'a pas pu être lu.`));
              lecteur.readAsDataURL(fichier);
            });

            try {
              await apiClient.ajouterImageActiviteEcodim({
                idActiviteEcodim: activite.idActiviteEcodim,
                idUtilisateur,
                image: base64,
                legende: fichier.name,
              });
            } catch (erreur) {
              // Sans le nom du fichier, l'utilisateur ne sait pas laquelle de ses
              // photos reprendre : on le nomme avant de laisser l'erreur remonter.
              throw new Error(
                `« ${fichier.name} » : ${getApiErrorMessage(erreur, 'envoi refusé.')}`
              );
            }

            envoyees += 1;
          }),
        Promise.resolve()
      );

      showNotification(
        envoyees > 1 ? `${envoyees} photos ajoutées.` : 'Photo ajoutée.',
        'success'
      );
      await charger();
    } catch (error) {
      // Un lot peut échouer en cours de route : on dit ce qui est déjà en place
      // pour que l'utilisateur ne renvoie pas tout depuis le début.
      const detail = getApiErrorMessage(error, 'Envoi impossible.');
      showNotification(
        envoyees > 0
          ? `${detail} ${envoyees} photo${envoyees > 1 ? 's' : ''} sur ${retenus.length} déjà enregistrée${envoyees > 1 ? 's' : ''}.`
          : detail,
        'error'
      );

      if (envoyees > 0) {
        // Les photos déjà passées doivent apparaître malgré l'échec du lot.
        await charger();
      }
    } finally {
      setEnvoi(false);

      if (champFichier.current) {
        // Sans cette remise à zéro, choisir deux fois le même fichier ne déclenche rien.
        champFichier.current.value = '';
      }
    }
  };

  const supprimer = async (idImageActivite: number) => {
    try {
      await apiClient.supprimerImageActiviteEcodim({ idImageActivite, idUtilisateur });
      showNotification('Photo supprimée.', 'success');
      await charger();
    } catch (error) {
      showNotification(getApiErrorMessage(error, 'Suppression impossible.'), 'error');
    }
  };

  return (
    <Box>
      {modifiable && (
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <input
              ref={champFichier}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(event) => ajouter(event.target.files)}
            />
            <Button
              variant="contained"
              startIcon={<AddPhotoAlternateRounded />}
              onClick={() => champFichier.current?.click()}
              disabled={envoi}
            >
              {envoi ? 'Envoi en cours...' : 'Ajouter des photos'}
            </Button>
            <Typography variant="caption" color="text.secondary">
              JPG ou PNG, {TAILLE_MAXI_MO} Mo maximum par image.
            </Typography>
          </Stack>
        )}

        {images.length === 0 ? (
          <Alert severity="info">
            Aucune photo pour cette activité. Les photos sont facultatives.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {images.map((image) => (
              <Grid key={image.idImageActivite} xs={6} sm={4} md={3}>
                <Card sx={{ position: 'relative' }}>
                  <Box
                    component="img"
                    src={buildEcodimMediaUrl(image.fichierImage)}
                    alt={image.legendeImage || 'Photo'}
                    sx={{ width: 1, height: 150, objectFit: 'cover', display: 'block' }}
                  />
                  {modifiable && (
                    <Tooltip title="Supprimer">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => supprimer(image.idImageActivite)}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'background.paper',
                        }}
                      >
                        <DeleteRounded fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
    </Box>
  );
}

/** La même galerie, présentée en fenêtre depuis la liste des activités. */
export function ActiviteImagesDialog({
  activite,
  idUtilisateur,
  modifiable,
  onClose,
  showNotification,
}: ActiviteImagesDialogProps) {
  return (
    <Dialog open={Boolean(activite)} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Photos — {activite?.titreActivite}</DialogTitle>
      <DialogContent>
        <GalerieActivite
          activite={activite}
          idUtilisateur={idUtilisateur}
          modifiable={modifiable}
          showNotification={showNotification}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}
