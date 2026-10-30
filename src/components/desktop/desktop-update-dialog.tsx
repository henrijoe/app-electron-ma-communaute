import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';
import { SystemUpdateAltRounded } from '@mui/icons-material';

import type { IReduxState } from 'src/store/store';

// ----------------------------------------------------------------------
// Annonce d'une nouvelle version.
//
// L'application vérifie déjà les mises à jour au démarrage (voir
// electron/main.cjs), mais le résultat ne s'affichait que dans Paramètres :
// personne n'y allait, donc personne ne savait qu'une version l'attendait. Ce
// composant est monté une fois pour toute l'application et ouvre une boîte de
// dialogue dès qu'une version est disponible.
//
// Il n'installe rien : l'installation reste un geste volontaire, fait depuis
// Paramètres, pour qu'une mise à jour ne redémarre jamais l'application en
// pleine saisie.

type DesktopUpdateStatus = {
  supported?: boolean;
  checking?: boolean;
  available?: boolean;
  downloaded?: boolean;
  currentVersion?: string;
  latestVersion?: string;
  progress?: { percent?: number } | null;
};

/**
 * Versions déjà annoncées, pour ne pas rouvrir la boîte à chaque navigation.
 *
 * La clé porte le numéro de version : une version suivante rouvre donc la
 * boîte, même si celle d'avant avait été repoussée.
 */
const CLE_VERSION_REPOUSSEE = 'ma-communaute:maj-repoussee';

const lireVersionRepoussee = (): string => {
  try {
    return window.localStorage.getItem(CLE_VERSION_REPOUSSEE) || '';
  } catch (error) {
    // Navigation privée ou stockage bloqué : la boîte se rouvrira, ce qui est
    // le comportement le moins grave des deux.
    return '';
  }
};

const retenirVersionRepoussee = (version: string): void => {
  try {
    window.localStorage.setItem(CLE_VERSION_REPOUSSEE, version);
  } catch (error) {
    // Sans stockage, on accepte simplement que la boîte revienne.
  }
};

export function DesktopUpdateDialog() {
  const navigate = useNavigate();
  // Rien ne s'annonce avant la connexion : « Aller dans Paramètres » n'aurait
  // nulle part où mener, et l'écran de connexion n'est pas le moment.
  const estConnecte = useSelector(
    (state: IReduxState) =>
      Boolean(state.application?.userLoggedIn) && Boolean(state.authentification?.connecter)
  );
  const [statut, setStatut] = useState<DesktopUpdateStatus | null>(null);
  const [estOuverte, setEstOuverte] = useState(false);
  const [versionRepoussee, setVersionRepoussee] = useState<string>(() => lireVersionRepoussee());

  useEffect(() => {
    const updater = (window as any)?.desktopUpdater;

    if (!(window as any)?.desktopApp?.isDesktop || !updater) {
      return undefined;
    }

    let estMonte = true;

    updater
      .getStatus?.()
      .then((valeur: DesktopUpdateStatus) => {
        if (estMonte) setStatut(valeur);
      })
      .catch(() => {
        // Un statut illisible ne doit rien annoncer du tout.
      });

    const seDesabonner = updater.onStatus?.((valeur: DesktopUpdateStatus) => {
      if (estMonte) setStatut(valeur);
    });

    return () => {
      estMonte = false;
      if (typeof seDesabonner === 'function') seDesabonner();
    };
  }, []);

  // La version proposée : `latestVersion` quand electron-updater la connaît,
  // sinon rien — on n'annonce pas un numéro qu'on n'a pas.
  const versionProposee = String(statut?.latestVersion || '').trim();
  const estDisponible = estConnecte && Boolean(statut?.available || statut?.downloaded);

  useEffect(() => {
    if (!estDisponible) {
      setEstOuverte(false);
      return;
    }

    // Une version déjà repoussée ne rouvre pas la boîte tant qu'il n'y en a pas
    // une plus récente.
    if (versionProposee && versionProposee === versionRepoussee) {
      return;
    }

    setEstOuverte(true);
  }, [estDisponible, versionProposee, versionRepoussee]);

  const fermerEtRetenir = useCallback(() => {
    if (versionProposee) {
      retenirVersionRepoussee(versionProposee);
      setVersionRepoussee(versionProposee);
    }

    setEstOuverte(false);
  }, [versionProposee]);

  const allerDansParametres = useCallback(() => {
    fermerEtRetenir();
    navigate('/settings');
  }, [fermerEtRetenir, navigate]);

  if (!estDisponible) {
    return null;
  }

  const pourcentage = Math.round(Number(statut?.progress?.percent || 0));
  const estTelechargee = Boolean(statut?.downloaded);

  return (
    <Dialog open={estOuverte} onClose={fermerEtRetenir} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <SystemUpdateAltRounded color="primary" />
        <Typography component="span" variant="h6" fontWeight={800} letterSpacing={0.5}>
          NOUVELLE MISE À JOUR
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          {versionProposee ? (
            <Typography variant="body1">
              La version <strong>{versionProposee}</strong> est disponible.
              {statut?.currentVersion ? (
                <Typography component="span" variant="body2" color="text.secondary">
                  {' '}
                  (installée : {statut.currentVersion})
                </Typography>
              ) : null}
            </Typography>
          ) : (
            <Typography variant="body1">Une nouvelle version est disponible.</Typography>
          )}
        </Box>

        {estTelechargee ? (
          <Alert severity="success">
            Elle est déjà téléchargée. Ouvre <strong>Paramètres</strong> pour l&apos;installer : la
            mise à jour se termine au redémarrage de l&apos;application.
          </Alert>
        ) : (
          <>
            <Alert severity="info" sx={{ mb: pourcentage > 0 ? 2 : 0 }}>
              Le téléchargement est en cours. Rends-toi dans <strong>Paramètres</strong> pour suivre
              la progression et lancer l&apos;installation.
            </Alert>
            {pourcentage > 0 && (
              <Box>
                <LinearProgress variant="determinate" value={pourcentage} />
                <Typography variant="caption" color="text.secondary">
                  {pourcentage} %
                </Typography>
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={fermerEtRetenir} color="inherit">
          Plus tard
        </Button>
        <Button variant="contained" onClick={allerDansParametres}>
          Aller dans Paramètres
        </Button>
      </DialogActions>
    </Dialog>
  );
}
