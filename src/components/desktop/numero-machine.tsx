import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { apiClient } from 'src/utils/apiClient';

// Le numéro à envoyer pour recevoir un code d'activation.
//
// Il est relu ici plutôt que dans le store : sur l'écran de connexion, personne
// n'est encore connecté et l'état de licence n'a pas été chargé. La route est
// publique pour cette raison.

const WHATSAPP_ACTIVATION = '05 74 31 34 10';

export type StatutMachine = { numeroMachine: string; licenceActivee: boolean };

export function useStatutMachine(actif = true): StatutMachine {
  const [statut, setStatut] = useState<StatutMachine>({ numeroMachine: '', licenceActivee: false });

  useEffect(() => {
    if (!actif) return undefined;

    let monte = true;

    apiClient
      .getDesktopSecurityStatus('')
      .then((reponse) => {
        const donnees: any = reponse?.data;
        if (monte && donnees?.numeroMachine) {
          setStatut({
            numeroMachine: String(donnees.numeroMachine),
            licenceActivee: Boolean(donnees.licenceActivee),
          });
        }
      })
      // Sans le numéro, le champ du code reste utilisable : on ne bloque pas l'écran. 
      .catch(() => undefined);

    return () => {
      monte = false;
    };
  }, [actif]);

  return statut;
}

export function NumeroMachine({ numero }: { numero: string }) {
  const [etatCopie, setEtatCopie] = useState<'' | 'ok' | 'erreur'>('');

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(numero);
      setEtatCopie('ok');
    } catch {
      setEtatCopie('erreur');
    }
    setTimeout(() => setEtatCopie(''), 2000);
  };

  if (!numero) return null;

  return (
    <Stack spacing={1} sx={{ textAlign: 'left' }}>
      <Typography variant="body2" color="text.secondary">
        Numéro de cet ordinateur
      </Typography>
      <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
        <Typography
          variant="h5"
          component="p"
          sx={{ fontFamily: 'monospace', letterSpacing: 1, userSelect: 'all' }}
        >
          {numero}
        </Typography>
        <Button size="small" variant="outlined" onClick={copier}>
          {etatCopie === 'ok' && 'Copié'}
          {etatCopie === 'erreur' && 'Copie impossible'}
          {etatCopie === '' && 'Copier'}
        </Button>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Pour continuer, envoyez ce numéro par WhatsApp au {WHATSAPP_ACTIVATION}. Vous recevrez un
        code d&apos;activation à coller ci-dessous.
      </Typography>
    </Stack>
  );
}
