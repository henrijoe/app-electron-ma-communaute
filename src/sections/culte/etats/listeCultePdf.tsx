import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Divider,
  Paper,
} from '@mui/material';
import { HeaderPageComponents } from './HeaderPageComponent';
import { IReduxState } from '../../../store/store';
import "../../../global.css";

export const ListeDesCultes = () => {
  const listCulte = useSelector((state: IReduxState) => state.culte.listCulte);
  const utilisateurData = useSelector((state: IReduxState) => state.authentification.utilisateurData);

  // Fonction pour obtenir la couleur du type de culte
  const getTypeCulteColor = (type: string) => {
    const colors: Record<string, string> = {
      'Dimanche': 'primary',
      'Mardi': 'secondary',
      'Jeudi': 'info',
      'Samedi': 'warning',
      'Spécial': 'error',
      'dimanche': 'primary',
      'mardi': 'secondary',
      'jeudi': 'info',
      'samedi': 'warning',
      'spécial': 'error',
      'special': 'error',
    };
    return colors[type] || 'default';
  };


  // Fonction pour obtenir le total des participants avec formatage
  // const formatTotalParticipants = (culte: any) => {
  //   const total = getTotalParticipants(culte);
  //   return total > 0 ? total.toString() : '0';
  // };

  // Fonction pour obtenir la couleur du total participants
  // const getTotalParticipantsColor = (culte: any) => {
  //   const total = getTotalParticipants(culte);
  //   if (total > 100) return 'success';
  //   if (total > 50) return 'info';
  //   if (total > 20) return 'warning';
  //   return 'default';
  // };

  // Trier les cultes par date (du plus récent au plus ancien)
  const sortedCultes = [...(listCulte || [])].sort((a, b) => {
    const dateA = new Date(a.dateCulte).getTime();
    const dateB = new Date(b.dateCulte).getTime();
    return dateB - dateA;
  });

  // Calculer les statistiques

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1400,
        mx: 'auto',
        p: 3,
        backgroundColor: '#f9fafb',
        minHeight: '100vh'
      }}
    >
      <HeaderPageComponents paramEtab={utilisateurData} />
      
    </Box>
  );
};