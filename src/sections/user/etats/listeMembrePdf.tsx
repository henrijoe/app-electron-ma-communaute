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
  Avatar,
  Chip,
  Divider
} from '@mui/material';
import { HeaderPageComponents } from './HeaderPageComponent';
import { IReduxState } from '../../../store/store';
import { dataResponsabilite } from '../../../store/membreSlice';
import "../../../global.css"
import { formaterValueLabels } from '../view/filterbyIndice';
import { formatMembreForDisplay } from '../utils';

export const ListeDesMembres = () => {
  const listMembre = useSelector((state: IReduxState) => state.membre.listMembre);
  const dataFilterDepartement = useSelector((state: IReduxState) => state.departement.dataFilterDepartement);
  const utilisateurData = useSelector((state: IReduxState) => state.authentification.utilisateurData);
  const dataFilterCellule = useSelector((state: IReduxState) => state.cellule.dataFilterCellule);

  const getMembreResponsabilite = (id: number) => {
    const representant = dataResponsabilite?.find((e) => e.value === id);
    return representant?.label || 'Non spécifié';
  };

  const dataDepartement = formaterValueLabels(dataFilterDepartement, "idDepartement", "libelleCourtDepartement");
  const dataCellule = formaterValueLabels(dataFilterCellule, "idCellule", "nomCellule");

  const getMembreDepartement = (id: number) => {
    const representant = dataDepartement?.find((e: any) => e.value === id);
    return representant?.label || 'Non spécifié';
  };

  const getMembreCellule = (id: number) => {
    const representant = dataCellule?.find((e: any) => e.value === id);
    return representant?.label || 'Non spécifié';
  };

  // Fonction pour obtenir l'URL de la photo
  const getPhotoUrl = (photoMembre: string) => {
    if (!photoMembre || photoMembre === '') {
      return null;
    }

    if (photoMembre.startsWith('data:image/') || photoMembre.startsWith('http') || photoMembre.startsWith('/')) {
      return photoMembre;
    }

    const baseUrl = window.location.origin;
    return `${baseUrl}/photos/${photoMembre}`;
  };

  // Fonction pour obtenir la couleur du badge selon le baptême
  const getBaptemeColor = (baptemeValue: string) => {
    const formatted = formatMembreForDisplay({ baptemeEauMembre: baptemeValue } as any);
    return formatted.baptemeEauMembre === 'Oui' ? 'success' : 'default';
  };

  // Fonction pour styliser le contact
  const formatContact = (contact: string) => {
    if (!contact) return 'Non spécifié';
    // Formater le numéro de téléphone si c'est un numéro
    const phoneRegex = /^[0-9+\s-]+$/;
    if (phoneRegex.test(contact.replace(/\s/g, ''))) {
      // Format français : 01 23 45 67 89
      const cleaned = contact.replace(/\D/g, '');
      if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
      }
    }
    return contact;
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1200,
        mx: 'auto',
        p: 3,
        backgroundColor: '#f9fafb',
        minHeight: '100vh'
      }}
    >
      <HeaderPageComponents paramEtab={utilisateurData} />
      
      <Box 
        sx={{
          p: 3,
          mb: 4,
          backgroundColor: 'white',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: 'primary.main',
              textTransform: 'uppercase',
              letterSpacing: 1,
              mb: 1
            }}
          >
            Liste des membres
          </Typography>
          <Divider sx={{ width: '80%', my: 2 }} />
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              textAlign: 'center',
              maxWidth: 600
            }}
          >
            Liste complète des membres de l&apos;église avec leurs informations détaillées
          </Typography>
        </Box>

        <Box 
          sx={{
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: 'white'
          }}
        >
          <Box sx={{ overflowX: 'auto' }}>
            <Table 
              sx={{
                minWidth: 1000,
                '& .MuiTableCell-root': {
                  py: 1.5,
                  borderRight: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': {
                    borderRight: 'none'
                  }
                },
                '& .MuiTableHead-root': {
                  backgroundColor: 'primary.lighter',
                  '& .MuiTableCell-root': {
                    color: 'primary.dark',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    borderBottom: '2px solid',
                    borderColor: 'primary.main'
                  }
                },
                '& .MuiTableBody-root': {
                  '& .MuiTableRow-root': {
                    '&:nth-of-type(even)': {
                      backgroundColor: 'action.hover'
                    },
                    '&:hover': {
                      backgroundColor: 'action.selected'
                    }
                  }
                }
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ width: 60 }}>N°</TableCell>
                  <TableCell align="center" sx={{ width: 80 }}>Photo</TableCell>
                  <TableCell align="left">Nom et Prénoms</TableCell>
                  <TableCell align="left">Lieu d&apos;habitation</TableCell>
                  <TableCell align="left">Responsabilité</TableCell>
                  <TableCell align="center">Baptisé(e)</TableCell>
                  <TableCell align="left">Département</TableCell>
                  <TableCell align="left">Cellule</TableCell>
                  <TableCell align="center">Contact</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {listMembre?.map((item: any, index: number) => {
                  const formattedMembre = formatMembreForDisplay(item);
                  const photoUrl = getPhotoUrl(item.photoMembre);
                  
                  return (
                    <TableRow key={item.idMembre || index}>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="medium">
                          {index + 1}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Avatar
                          src={photoUrl || undefined}
                          alt={`${item.nomMembre} ${item.prenomMembre}`}
                          sx={{ 
                            width: 48, 
                            height: 48,
                            mx: 'auto',
                            border: '2px solid',
                            borderColor: 'primary.light'
                          }}
                        >
                          {!photoUrl && (
                            <Typography variant="h6" color="primary.main">
                              {`${item.nomMembre?.charAt(0) || ''}${item.prenomMembre?.charAt(0) || ''}`}
                            </Typography>
                          )}
                        </Avatar>
                      </TableCell>

                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {`${item.nomMembre || ''} ${item.prenomMembre || ''}`}
                          </Typography>
                          {item.emailMembre && (
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ display: 'block', mt: 0.5 }}
                            >
                              {item.emailMembre}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {item.residenceMembre || 'Non spécifié'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={getMembreResponsabilite(item.idResponsabilite)}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          label={formattedMembre.baptemeEauMembre}
                          size="small"
                          color={getBaptemeColor(item.baptemeEauMembre)}
                          sx={{ 
                            fontWeight: 500,
                            minWidth: 60
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {getMembreDepartement(item.idDepartement)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={getMembreCellule(item.idCellule)}
                          size="small"
                          color="secondary"
                          variant="outlined"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'monospace',
                            fontWeight: 500 
                          }}
                        >
                          {formatContact(item.contactMembre)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>

          {listMembre?.length === 0 && (
            <Box
              sx={{
                py: 8,
                textAlign: 'center',
                color: 'text.secondary'
              }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                Aucun membre trouvé
              </Typography>
              <Typography variant="body2">
                Aucun membre n&apos;est actuellement enregistré dans le système.
              </Typography>
            </Box>
          )}
        </Box>

        <Box
          sx={{
            mt: 3,
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Document généré le {new Date().toLocaleDateString('fr-FR')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total : {listMembre?.length || 0} membre(s)
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};