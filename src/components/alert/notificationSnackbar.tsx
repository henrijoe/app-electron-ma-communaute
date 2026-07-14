import React from 'react';

import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import type { SnackbarCloseReason } from '@mui/material/Snackbar';

const normalizeNotificationMessage = (message: string): string => {
  const rawMessage = String(message || '').trim();

  if (!rawMessage) {
    return 'Une erreur est survenue. Reessayez dans quelques instants.';
  }

  const cleanedMessage = rawMessage
    .replace(/^Erreur\s*:\s*/i, '')
    .replace(/^Error\s*:\s*/i, '')
    .trim();

  if (/failed to fetch|networkerror|load failed/i.test(cleanedMessage)) {
    return "Impossible de joindre le serveur. Verifiez que l'application serveur est lancee, que vous etes sur le meme reseau et que le pare-feu autorise le port 49300.";
  }

  const httpStatusMatch = cleanedMessage.match(/HTTP error!\s*status:\s*(\d+)/i);

  if (httpStatusMatch) {
    const status = Number(httpStatusMatch[1]);

    if (status === 404) {
      return "Le service demande est introuvable. Verifiez que l'adresse serveur pointe vers le port 49300.";
    }

    if (status === 401) {
      return 'Votre session a expire ou vos identifiants sont incorrects. Reconnectez-vous pour continuer.';
    }

    if (status === 403) {
      return "Vous n'avez pas l'autorisation d'effectuer cette action.";
    }

    if (status >= 500) {
      return 'Le serveur a rencontre une erreur. Reessayez dans quelques instants.';
    }

    return "La demande n'a pas pu etre traitee. Verifiez les informations puis reessayez.";
  }

  if (/identifiants invalides|invalid credentials|mot de passe incorrect|utilisateur introuvable/i.test(cleanedMessage)) {
    return "Nom utilisateur ou mot de passe incorrect. Verifiez vos informations puis reessayez.";
  }

  if (/session expiree|session expirée/i.test(cleanedMessage)) {
    return 'Votre session a expire. Reconnectez-vous pour continuer.';
  }

  return cleanedMessage;
};

// Types pour les props
export interface NotificationSnackbarProps {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
  autoHideDuration?: number;
  onClose: () => void;
  anchorOrigin?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
}

export const NotificationSnackbar: React.FC<NotificationSnackbarProps> = ({
  open,
  message,
  severity,
  autoHideDuration = 3000,
  onClose,
  anchorOrigin = { vertical: 'bottom', horizontal: 'left' }
}) => {
  // Gérer la fermeture
  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    onClose();
  };

  // Gérer la fermeture de l'Alert
  const handleAlertClose = (event?: React.SyntheticEvent | Event) => {
    onClose();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={anchorOrigin}
    >
      <Alert
        onClose={handleAlertClose}
        severity={severity}
        sx={{ width: '100%', textDecorationColor: 'white' }}
        variant="filled"
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

// Version avec hook personnalisé pour une utilisation simplifiée
export const useNotificationSnackbar = () => {
  const [notification, setNotification] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  const showNotification = React.useCallback((
    message: string, 
    severity: 'success' | 'error' | 'info' | 'warning' = 'success'
  ) => {
    setNotification({
      open: true,
      message: normalizeNotificationMessage(message),
      severity,
    });
  }, []);

  const hideNotification = React.useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  return {
    notification,
    showNotification,
    hideNotification,
    NotificationComponent: React.useCallback(() => (
      <NotificationSnackbar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={hideNotification}
      />
    ), [hideNotification, notification.message, notification.open, notification.severity]),
  };
};

export default NotificationSnackbar;
