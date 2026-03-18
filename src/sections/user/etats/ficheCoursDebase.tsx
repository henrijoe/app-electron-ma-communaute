import React from 'react';
import { Checkbox, FormControlLabel, Typography, Box } from '@mui/material';
import "./Portrait.css";

const CoursDeBaseForm = () => (
  <Box sx={{ justifyContent: "center", width: "100%" }}>
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Box sx={{
        alignItems: "center",
        textAlign: "center",
        fontWeight: "bold",
        color: "#42A5F5",
        border: "5px solid #42A5F5",
        fontSize: 14,
        width: 500,
        borderRadius: 5,
        boxShadow: "0 4px 8px rgba(0, 1, 0, 0.5)",
        borderWidth: "3px 3px 8px 3px",
        height: 100,
        padding: 2.5
      }}>
        <Typography variant="body2" sx={{ fontWeight: "bold", mb: 0.5 }}>
          ÉGLISE ÉVANGÉLIQUE DES ASSEMBLÉES DE DIEU
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold", mb: 0.5 }}>
          YOPOUGON-ANDOKOI TEMPLE PÉNIEL
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          21 BP 2131 ABIDJAN 21 / 07 32 34 90 / 08 51 02 22 / 46 36 60 69
        </Typography>
      </Box>
    </Box>

    <Box sx={{
      justifyContent: "center",
      textAlign: "center",
      fontWeight: "bold",
      fontSize: 17,
      color: "#42A5F5",
      border: "4px solid #42A5F5",
      width: 260,
      borderRadius: 5,
      margin: "20px auto",
      padding: 1.25,
    }}>
      <Typography variant="h5" sx={{ fontWeight: "bold", m: 0 }}>
        COURS DE BASE
      </Typography>
    </Box>

    <Box sx={{ color: '#42A5F5', ml: -1.25 }}>
      <Box sx={{ mt: 2.5, display: "flex", fontSize: 14 }}>
        <Typography variant="body2">No Matricule:</Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold", ml: 0.375 }}>....................................</Typography>
      </Box>
      
      <Box sx={{ display: "flex", mt: 1.25, fontSize: 14 }}>
        <Typography variant="body2">Ethnie:</Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold", ml: 0.375 }}>....................................</Typography>
      </Box>
      
      <Box sx={{ display: "flex", mt: 1.25, fontSize: 14 }}>
        <Typography variant="body2">Conseiller et Témoin:</Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold", ml: 0.375 }}>....................................</Typography>
      </Box>
      
      <Box sx={{ display: "flex", mt: 1.25, fontSize: 14 }}>
        <Typography variant="body2">Cellule d&apos;Accueil:</Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold", ml: 0.375 }}>....................................</Typography>
        <Typography variant="body2" sx={{ ml: 1.25 }}>Responsable:</Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold", ml: 0.375 }}>....................................</Typography>
      </Box>
      
      <Box sx={{ display: "flex", mt: 1.25, fontSize: 14 }}>
        <Typography variant="body2">Nom et Prénoms:</Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold", ml: 0.375 }}>....................................</Typography>
      </Box>
      
      <Box sx={{ display: "flex", mt: 1.25, fontSize: 14 }}>
        <Typography variant="body2">Profession:</Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold", ml: 0.375 }}>....................................</Typography>
        <Typography variant="body2" sx={{ ml: 1.25 }}>Contact:</Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold", ml: 0.375 }}>....................................</Typography>
      </Box>
      
      <Box sx={{ display: "flex", mt: 1.25, fontSize: 14 }}>
        <Typography variant="body2">Lieu de Résidence:</Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold", ml: 0.375 }}>....................................</Typography>
        <Typography variant="body2" sx={{ ml: 1.25 }}>Secteur:</Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold", ml: 0.375 }}>....................................</Typography>
      </Box>
      
      <Box sx={{ display: "flex", mt: 1.25, fontSize: 14 }}>
        <Typography variant="body2">Provenance Religieuse:</Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold", ml: 0.375 }}>....................................</Typography>
      </Box>
      
      <Box sx={{ mt: 1.25, fontSize: 14 }}>
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", fontSize: 14 }}>
          <Typography variant="body2" sx={{ mr: 1.25 }}>Situation Matrimoniale:</Typography>
          
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
            sx={{ mr: 1.875, '& .MuiTypography-root': { fontSize: '0.875rem' } }}
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
            label="Marié(e)"
            sx={{ mr: 1.875, '& .MuiTypography-root': { fontSize: '0.875rem' } }}
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
            label="Fiancé(e)"
            sx={{ mr: 1.875, '& .MuiTypography-root': { fontSize: '0.875rem' } }}
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
            label="En concubinage"
            sx={{ mr: 1.875, '& .MuiTypography-root': { fontSize: '0.875rem' } }}
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
            label="Veuf(ve)"
            sx={{ mr: 1.875, '& .MuiTypography-root': { fontSize: '0.875rem' } }}
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
            label="Polygame"
            sx={{ '& .MuiTypography-root': { fontSize: '0.875rem' } }}
          />
        </Box>
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
    </Box>

    <Box sx={{ mt: 2.5, textAlign: 'center', fontWeight: 'bold', color: '#42A5F5' }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
        A REMPLIR ET A RAMENER A CHAQUE COURS
      </Typography>
    </Box>

    <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2.5, fontSize: 14, color: '#42A5F5', textAlign: 'center' }}>
      <Box>
        <Typography variant="body2">Le Salut &amp;</Typography>
        <Typography variant="body2">L&apos;assurance du salut</Typography>
      </Box>
      <Box>
        <Typography variant="body2">La prière</Typography>
      </Box>
      <Box>
        <Typography variant="body2">L&apos;importance &amp;</Typography>
        <Typography variant="body2">comment méditer la parole de Dieu</Typography>
      </Box>
    </Box>
    
    <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2.5, fontSize: 14, color: '#42A5F5', textAlign: 'center' }}>
      <Box>
        <Typography variant="body2">Le baptême d&apos;eau et</Typography>
        <Typography variant="body2">le baptême dans le Saint-Esprit</Typography>
      </Box>
      <Box>
        <Typography variant="body2">Le chrétien et le monde</Typography>
      </Box>
      <Box>
        <Typography variant="body2">La déclaration de foi</Typography>
      </Box>
    </Box>

    <Box sx={{ mt: 2.5, textAlign: 'center', fontWeight: 'bold', color: '#42A5F5' }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
        PROGRAMMES DES CULTES
      </Typography>
    </Box>

    <Box sx={{ color: '#42A5F5', ml: 1.25, mt: 1.25, fontSize: 14 }}>
      <Typography variant="body2">Dimanche : De 7h00 à 10h00 : Culte de Louange et d&apos;Adoration</Typography>
      <Typography variant="body2">Lundi : De 18h30 à 20h15 : Prière de délivrance et d&apos;intercession</Typography>
      <Typography variant="body2">Mardi : De 18h30 à 20h15 : Culte d&apos;évangélisation et de prière pour les malades</Typography>
      <Typography variant="body2">Mercredi : De 19h00 à 20h30 : Cellule dans les secteurs du quartier</Typography>
      <Typography variant="body2">Jeudi : De 18h30 à 20h15 : Culte de prière, d&apos;édification, ou d&apos;étude biblique</Typography>
    </Box>
  </Box>
);

export default CoursDeBaseForm;