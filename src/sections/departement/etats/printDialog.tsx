import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from '@mui/material';

import { isDesktopAppRuntime } from 'src/utils/access-control';

const PrintDialog = (props:any) => {
    
 const { open, onClose, onPrint } = props

  const [title, setTitle] = useState('');

  const handlePrint = () => {
    onPrint(title);
    onClose();
  };

  if (isDesktopAppRuntime()) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Imprimer</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Titre du document"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={handlePrint}>Imprimer</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrintDialog;
