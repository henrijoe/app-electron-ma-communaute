import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmDialog = ({
  open,
  title = 'Confirmation',
  message,
  confirmText = 'Supprimer',
  cancelText = 'Annuler',
  loading = false,
  onConfirm,
  onClose
}: ConfirmDialogProps) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>{title}</DialogTitle>

    <DialogContent>
      <Typography>{message}</Typography>
    </DialogContent>

    <DialogActions>
      <Button onClick={onClose} disabled={loading}>
        {cancelText}
      </Button>

      <Button
        onClick={onConfirm}
        color="error"
        variant="contained"
        disabled={loading}
      >
        {confirmText}
      </Button>
    </DialogActions>
  </Dialog>
);


export default ConfirmDialog;
