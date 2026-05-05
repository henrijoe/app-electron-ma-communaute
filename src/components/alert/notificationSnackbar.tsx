import React from 'react';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

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
      message,
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
