import React from 'react';
import { Checkbox, FormControlLabel, Typography, Box } from '@mui/material';

export const FicheDecisionPDf = () => (
  <Box sx={{ justifyContent: "center", width: "100%" }}>
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Box sx={{
        alignItems: "center",
        alignContent: "center",
        alignSelf: "center",
        textAlign: "center",
        fontWeight: "bold",
        color: "#42A5F5",
        border: "5px solid #42A5F5",
        fontSize: 14,
        width: 500,
        borderRadius: 5,
        boxShadow: "0 4px 8px rgba(0, 1, 0, 0.5)",
        borderWidth: "3px 3px 8px 3px",
        height: 80,
        p: 1.25
      }}>
        <Typography variant="body2" sx={{ fontWeight: "bold", mb: 0.5 }}>
          ÉGLISE ÉVANGÉLIQUE DES ASSEMBLÉES DE DIEU DE CÔTE D&apos;IVOIRE
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold", mb: 0.5 }}>
          ÉGLISE LOCALE DE YOPOUGON-ANDOKOI TEMPLE PÉNIEL
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          21 BP 2131 ABIDJAN 21 / 07 32 34 99 / 08 51 02 22 / 46 60 66 69
        </Typography>
      </Box>
    </Box>

    <Box sx={{
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
      textAlign: "center",
      fontWeight: "bold",
      fontSize: 17,
      color: "#42A5F5",
      border: "4px solid #42A5F5",
      width: 260,
      borderRadius: 5,
      margin: "0 auto",
      padding: 1.25,
      mt: 1.25,
    }}>
      <Typography variant="h5" sx={{ fontWeight: "bold", m: 0 }}>
        FICHE DE DÉCISION
      </Typography>
    </Box>

    <Box sx={{ color: '#42A5F5', ml: -1.25 }}>
      <Box sx={{ mt: 2.5, display: "flex", fontSize: 14 }}>
        <Typography variant="body2">Nom:</Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold", ml: 0.375 }}>....................................</Typography>
        <Typography variant="body2" sx={{ ml: 2.5 }}>Prénoms:</Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold", ml: 0.375 }}>.............................................................................</Typography>
      </Box>

      <Box sx={{ display: "flex", mt: 1.25, fontSize: 14 }}>
        <Typography variant="body2">Ethnie:</Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold", ml: 0.375 }}>......................................................................</Typography>
        <Typography variant="body2" sx={{ ml: 2.5 }}>Age:</Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold", ml: 0.375 }}>.................................................</Typography>
      </Box>

      <Box sx={{ display: "flex", mt: 1.25, fontSize: 14 }}>
        <Typography variant="body2">Profession:</Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold", ml: 0.375 }}>.......................................</Typography>
        <Typography variant="body2" sx={{ ml: 1.875 }}>Lieu de travail:</Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold", ml: 0.375 }}>........................................................</Typography>
      </Box>

      <Box sx={{ display: "flex", mt: 1.25, fontSize: 14 }}>
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", fontSize: 14 }}>
          <Typography variant="body2" sx={{ mr: 1.25 }}>Statut matrimonial:</Typography>
          
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                sx={{
                  color: '#42A5F5',
                  padding: 0.5,
                  '& .MuiSvgIcon-root': { fontSize: '1.2rem' }
                }}
              />
            }
            label="Marié(e)"
            sx={{ mr: 1.25, '& .MuiTypography-root': { fontSize: '0.875rem' } }}
          />
          
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                sx={{
                  color: '#42A5F5',
                  padding: 0.5,
                  '& .MuiSvgIcon-root': { fontSize: '1.2rem' }
                }}
              />
            }
            label="Concubinage"
            sx={{ mr: 1.25, '& .MuiTypography-root': { fontSize: '0.875rem' } }}
          />
          
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                sx={{
                  color: '#42A5F5',
                  padding: 0.5,
                  '& .MuiSvgIcon-root': { fontSize: '1.2rem' }
                }}
              />
            }
            label="Célibataire"
            sx={{ mr: 1.25, '& .MuiTypography-root': { fontSize: '0.875rem' } }}
          />
          
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                sx={{
                  color: '#42A5F5',
                  padding: 0.5,
                  '& .MuiSvgIcon-root': { fontSize: '1.2rem' }
                }}
              />
            }
            label="Copain"
            sx={{ '& .MuiTypography-root': { fontSize: '0.875rem' } }}
          />
        </Box>
      </Box>

      <Box sx={{ display: "flex", mt: 1.25, fontSize: 14 }}>
        <Typography variant="body2">Cel:</Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold", ml: 0.375 }}>................................................................................................................................</Typography>
      </Box>

      <Box sx={{ display: "flex", mt: 1.25, fontSize: 14 }}>
        <Typography variant="body2">Quartier de résidence:</Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold", ml: 0.375 }}>...................................................................................................</Typography>
      </Box>

      <Box sx={{ display: "flex", mt: 1.25, fontSize: 14, alignItems: "center" }}>
        <Typography variant="body2" sx={{ mr: 1.25 }}>Savez-vous lire et écrire?</Typography>
        
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              sx={{
                color: '#42A5F5',
                padding: 0.5,
                '& .MuiSvgIcon-root': { fontSize: '1.2rem' }
              }}
            />
          }
          label="Oui"
          sx={{ mr: 2.5, '& .MuiTypography-root': { fontSize: '0.875rem' } }}
        />
        
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              sx={{
                color: '#42A5F5',
                padding: 0.5,
                '& .MuiSvgIcon-root': { fontSize: '1.2rem' }
              }}
            />
          }
          label="Non"
          sx={{ '& .MuiTypography-root': { fontSize: '0.875rem' } }}
        />
      </Box>

      <Box sx={{ display: "flex", mt: 1.25, fontSize: 14, alignItems: "center" }}>
        <Typography variant="body2" sx={{ mr: 1.25 }}>Parlez-vous couramment français?</Typography>
        
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              sx={{
                color: '#42A5F5',
                padding: 0.5,
                '& .MuiSvgIcon-root': { fontSize: '1.2rem' }
              }}
            />
          }
          label="Oui"
          sx={{ mr: 2.5, '& .MuiTypography-root': { fontSize: '0.875rem' } }}
        />
        
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              sx={{
                color: '#42A5F5',
                padding: 0.5,
                '& .MuiSvgIcon-root': { fontSize: '1.2rem' }
              }}
            />
          }
          label="Non"
          sx={{ '& .MuiTypography-root': { fontSize: '0.875rem' } }}
        />
      </Box>

      <Box sx={{ display: "flex", mt: 1.25, fontSize: 14 }}>
        <Typography variant="body2">Nom d&apos;un ami dans l&apos;église:</Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold", ml: 0.375 }}>............................................................................................</Typography>
      </Box>

      <Box sx={{ display: "flex", mt: 1.25, fontSize: 14, alignItems: "center" }}>
        <Typography variant="body2" sx={{ mr: 1.25 }}>Pouvez-vous recevoir de la visite?</Typography>
        
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              sx={{
                color: '#42A5F5',
                padding: 0.5,
                '& .MuiSvgIcon-root': { fontSize: '1.2rem' }
              }}
            />
          }
          label="Oui"
          sx={{ mr: 2.5, '& .MuiTypography-root': { fontSize: '0.875rem' } }}
        />
        
        <Typography variant="body2" sx={{ mr: 1.25 }}>Heure:</Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold", ml: 0.375 }}>.....................................................</Typography>
      </Box>

      <Box sx={{ display: "flex", mt: 1.25, fontSize: 14 }}>
        <Typography variant="body2">Si non, pourquoi?</Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold", ml: 0.375 }}>............................................................................................................</Typography>
      </Box>

      <Box sx={{ mt: 1.25, fontSize: 14 }}>
        <Box sx={{ fontSize: 14, mt: 1.25, ml: 10 }}>
          <Typography variant="body2">NB : À remplir et à ramener à la prochaine réunion</Typography>
        </Box>

        <Box sx={{ display: 'flex', mt: 1.25 }}>
          <Typography variant="body2" sx={{ textDecoration: 'underline', mt: 0 }}>Décision</Typography>
          <Typography variant="body2" sx={{ fontSize: "0.8125rem", mt: "0.3125rem", fontStyle: 'italic', fontWeight: "bold", ml: 0.375 }}>
            :« Me reconnaissant(e) pécheur et perdu, je décide d&apos;accepter JESUS comme Seigneur et Sauveur personnel »
          </Typography>
        </Box>

        <Box sx={{ display: "flex", fontSize: 12, mt: 1.875 }}>
          <Typography variant="body2">Date:</Typography>
          <Typography variant="body2" sx={{ fontWeight: "bold", ml: 0.375 }}>...........................................................................................................................................</Typography>
        </Box>
      </Box>

      <Box sx={{ fontWeight: 'bold', fontSize: 13, textAlign: 'center', mt: 2.5, fontStyle: 'italic' }}>
        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
          Les cours de base ont lieu tous les dimanches après le culte à l&apos;église.
        </Typography>
      </Box>
    </Box>
  </Box>
);