import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { AutorenewRounded, CreditCardRounded } from '@mui/icons-material';

import type { IReduxState } from 'src/store/store';
import { apiClient, getApiErrorMessage } from 'src/utils/apiClient';
import { fDate } from 'src/utils/format-time';
import { SelectRecherche } from 'src/components/select-recherche';

// ----------------------------------------------------------------------

type EtatAbonnement = {
  actif: boolean;
  requis: boolean;
  statut: string;
  plan: string;
  dateFin: string | null;
  joursRestants: number;
  message: string;
  checkoutUrl: string | null;
};

type AbonnementCardProps = {
  showNotification: (message: string, severity?: 'success' | 'info' | 'warning' | 'error') => void;
};

// Clé locale : la référence de la souscription en cours, retrouvée au retour de la
// page de paiement. Le navigateur quitte l'application pendant le règlement, et
// l'état React ne survit pas à cet aller-retour.
const CLE_REFERENCE = 'maCommunauteAbonnementReference';

const ouvrirDansNavigateur = async (url: string): Promise<void> => {
  // Dans l'application desktop, la page de paiement doit s'ouvrir dans le navigateur
  // du système : la fenêtre Electron n'a pas de barre d'adresse, et le client doit
  // pouvoir vérifier qu'il est bien chez SasPay avant de payer.
  if ((window as any)?.desktopShell?.openExternal) {
    const resultat = await (window as any).desktopShell.openExternal(url);

    if (!resultat?.success) {
      throw new Error(resultat?.error || "Impossible d'ouvrir le navigateur");
    }

    return;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
};

export function AbonnementCard({ showNotification }: AbonnementCardProps) {
  const userConnected = useSelector((state: IReduxState) => (state as any).application.userConnected);
  const utilisateurData = useSelector(
    (state: IReduxState) => (state as any).authentification.utilisateurData
  );

  // useMemo : sans lui, l'objet serait recréé à chaque rendu et relancerait en boucle
  // les useCallback qui en dépendent.
  const sessionUser = useMemo(
    () => ({ ...(utilisateurData || {}), ...(userConnected || {}) }),
    [userConnected, utilisateurData]
  );
  const idUtilisateur =
    Number(sessionUser?.idUtilisateurParent || 0) || Number(sessionUser?.idUtilisateur || 0);

  const [etat, setEtat] = useState<EtatAbonnement | null>(null);
  const [plan, setPlan] = useState<'mensuel' | 'annuel'>('mensuel');
  const [enCours, setEnCours] = useState(false);
  const [verification, setVerification] = useState(false);

  const chargerEtat = useCallback(async () => {
    if (!idUtilisateur) {
      return;
    }

    try {
      const reponse = await apiClient.getAbonnementEtat(idUtilisateur);

      if (reponse?.status === 1) {
        setEtat(reponse.data as EtatAbonnement);
      }
    } catch (_error) {
      // Un serveur sans module d'abonnement ne doit pas faire échouer l'écran entier.
      setEtat(null);
    }
  }, [idUtilisateur]);

  useEffect(() => {
    chargerEtat();
  }, [chargerEtat]);

  const verifierPaiement = useCallback(
    async (reference: string, silencieux = false) => {
      try {
        setVerification(true);
        const reponse = await apiClient.verifierAbonnement(reference);
        const resultat = reponse?.data as { traite: boolean; motif: string };

        if (resultat?.traite) {
          localStorage.removeItem(CLE_REFERENCE);
          showNotification('Paiement confirmé : votre abonnement est actif.', 'success');
        } else if (!silencieux) {
          showNotification(resultat?.motif || 'Paiement non confirmé pour le moment.', 'warning');
        }

        await chargerEtat();
      } catch (error) {
        if (!silencieux) {
          showNotification(getApiErrorMessage(error, 'Vérification impossible.'), 'error');
        }
      } finally {
        setVerification(false);
      }
    },
    [chargerEtat, showNotification]
  );

  // Au retour de la page de paiement, on vérifie tout seul : le client n'a pas à
  // comprendre qu'il doit cliquer quelque part pour que son paiement soit pris en compte.
  useEffect(() => {
    const reference = localStorage.getItem(CLE_REFERENCE);

    if (reference) {
      verifierPaiement(reference, true);
    }
  }, [verifierPaiement]);

  const souscrire = useCallback(async () => {
    if (!idUtilisateur) {
      showNotification('Compte introuvable pour la souscription.', 'warning');
      return;
    }

    try {
      setEnCours(true);
      const reponse = await apiClient.souscrireAbonnement({
        idUtilisateur,
        plan,
        emailClient: String(sessionUser?.email || sessionUser?.emailEglise || ''),
        nomClient: String(sessionUser?.nomEgliseCourt || sessionUser?.nomTemple || 'Église'),
        telephoneClient: String(sessionUser?.telephoneUtilisateur || ''),
      });

      const donnees = reponse?.data as { checkoutUrl: string; reference: string };

      if (!donnees?.checkoutUrl) {
        throw new Error("La page de paiement n'a pas pu être créée.");
      }

      localStorage.setItem(CLE_REFERENCE, donnees.reference);
      await ouvrirDansNavigateur(donnees.checkoutUrl);
      showNotification(
        'Page de paiement ouverte. Revenez ici une fois le règlement effectué.',
        'info'
      );
      await chargerEtat();
    } catch (error) {
      showNotification(getApiErrorMessage(error, 'Souscription impossible.'), 'error');
    } finally {
      setEnCours(false);
    }
  }, [chargerEtat, idUtilisateur, plan, sessionUser, showNotification]);

  // Rien à montrer sur un poste où l'accès dépend de la licence desktop et où aucune
  // souscription n'a jamais été ouverte.
  if (!etat || (!etat.requis && etat.statut === 'absent')) {
    return null;
  }

  const referenceEnAttente = localStorage.getItem(CLE_REFERENCE);

  return (
    <Card>
      <CardHeader
        avatar={<CreditCardRounded color="primary" />}
        title="Abonnement"
        subheader="Accès au service en ligne, réglé par Wave, Orange Money, MTN, Moov ou carte."
      />
      <CardContent>
        <Stack spacing={3}>
          <Box>
            <Chip
              color={etat.actif ? 'success' : 'warning'}
              label={etat.actif ? 'Abonnement actif' : 'Abonnement inactif'}
              variant="filled"
            />
          </Box>

          <Typography variant="body2" color="text.secondary">
            Statut : {etat.statut}
            {etat.plan ? ` • formule ${etat.plan}` : ''}
          </Typography>

          {etat.dateFin && (
            <Typography variant="body2" color="text.secondary">
              Valable jusqu&apos;au {fDate(etat.dateFin) || etat.dateFin} ({etat.joursRestants} jour
              {etat.joursRestants > 1 ? 's' : ''} restant{etat.joursRestants > 1 ? 's' : ''})
            </Typography>
          )}

          {etat.message && <Alert severity={etat.actif ? 'info' : 'warning'}>{etat.message}</Alert>}

          <Divider />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <SelectRecherche
              label="Formule"
              value={plan}
              onChange={(event) => setPlan(event.target.value as 'mensuel' | 'annuel')}
              sx={{ maxWidth: 220 }}
            >
              <MenuItem value="mensuel">Mensuelle</MenuItem>
              <MenuItem value="annuel">Annuelle</MenuItem>
            </SelectRecherche>

            <Button variant="contained" onClick={souscrire} disabled={enCours}>
              {enCours ? 'Ouverture...' : etat.actif ? 'Renouveler' : 'Payer mon abonnement'}
            </Button>

            {referenceEnAttente && (
              <Button
                variant="outlined"
                startIcon={<AutorenewRounded />}
                onClick={() => verifierPaiement(referenceEnAttente)}
                disabled={verification}
              >
                {verification ? 'Vérification...' : "J'ai payé, vérifier"}
              </Button>
            )}
          </Stack>

          <Typography variant="caption" color="text.secondary">
            Le paiement s&apos;ouvre sur la page sécurisée de SasPay. De retour ici, la
            confirmation est automatique ; le bouton de vérification ne sert qu&apos;en cas de
            doute.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
