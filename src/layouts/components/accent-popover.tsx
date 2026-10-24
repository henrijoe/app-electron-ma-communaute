import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { CheckRounded, PaletteRounded, RestartAltRounded } from '@mui/icons-material';

import {
  useAccent,
  COULEUR_PAR_DEFAUT,
  COULEURS_PROPOSEES,
} from 'src/theme/theme-provider';

// ----------------------------------------------------------------------
// Choix de la couleur de l'application.
//
// L'accent remplace la couleur « primary » du thème : boutons, icônes, liens,
// onglet actif et pastilles suivent, dans toute l'application. Le réglage est
// propre à chaque personne et à son navigateur.
//
// Le clair et le sombre restent gouvernés par le bouton voisin : ce sont deux
// réglages différents, et les confondre priverait du sombre en couleur.

export function AccentPopover() {
  const { accent, changerAccent, retablirAccent } = useAccent();
  const [ancre, setAncre] = useState<HTMLButtonElement | null>(null);

  const estParDefaut = accent.toUpperCase() === COULEUR_PAR_DEFAUT.toUpperCase();

  return (
    <>
      <Tooltip title="Couleur de l'application">
        <IconButton color="inherit" onClick={(event) => setAncre(event.currentTarget)}>
          <PaletteRounded />
        </IconButton>
      </Tooltip>

      <Popover
        open={Boolean(ancre)}
        anchorEl={ancre}
        onClose={() => setAncre(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ p: 2, width: 300 }}>
          <Typography variant="subtitle2">Couleur de l&apos;application</Typography>
          <Typography variant="caption" color="text.secondary">
            Elle s&apos;applique aux boutons, aux icônes et aux liens, partout.
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
            {COULEURS_PROPOSEES.map((couleur) => {
              const choisie = couleur.hex.toUpperCase() === accent.toUpperCase();

              return (
                <Tooltip key={couleur.hex} title={couleur.libelle}>
                  <ButtonBase
                    onClick={() => changerAccent(couleur.hex)}
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: couleur.hex,
                      color: 'common.white',
                      outline: (theme) =>
                        choisie ? `2px solid ${theme.palette.text.primary}` : 'none',
                      outlineOffset: 2,
                    }}
                  >
                    {choisie && <CheckRounded sx={{ fontSize: 16 }} />}
                  </ButtonBase>
                </Tooltip>
              );
            })}
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
              Autre couleur
            </Typography>

            {/* Le sélecteur natif du système : il évite d'embarquer une
                bibliothèque de choix de couleur pour un réglage secondaire. */}
            <Box
              component="input"
              type="color"
              value={accent}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                changerAccent(event.target.value)
              }
              sx={{
                width: 44,
                height: 30,
                p: 0,
                border: 'none',
                borderRadius: 1,
                cursor: 'pointer',
                bgcolor: 'transparent',
              }}
            />

            <Typography
              variant="body2"
              sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
            >
              {accent.toUpperCase()}
            </Typography>
          </Stack>

          <Button
            size="small"
            startIcon={<RestartAltRounded />}
            onClick={retablirAccent}
            disabled={estParDefaut}
            sx={{ mt: 1.5 }}
          >
            Rétablir le bleu
          </Button>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Ce choix ne vaut que sur cet appareil. La couleur du texte posé sur la
            teinte s&apos;ajuste pour rester lisible.
          </Typography>
        </Box>
      </Popover>
    </>
  );
}
