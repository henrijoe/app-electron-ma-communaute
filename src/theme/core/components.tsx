import type { Theme, Components } from '@mui/material/styles';

import SvgIcon from '@mui/material/SvgIcon';

import { varAlpha } from '../styles';

// ----------------------------------------------------------------------

const MuiBackdrop: Components<Theme>['MuiBackdrop'] = {
  styleOverrides: {
 root: ({ theme }) => ({
 backgroundColor: varAlpha(theme.vars.palette.grey['900Channel'], 0.8),
    }), invisible: {
 background: 'transparent',
    },
  },
};

const MuiButton: Components<Theme>['MuiButton'] = {
  defaultProps: {
    disableElevation: true,
  },
  styleOverrides: {
    /**
     * Les boutons pleins en `color="inherit"` suivent la couleur de
     * l'application.
     *
     * Ils étaient figés sur un gris sombre : changer la couleur de
     * l'application laissait donc inchangés les boutons les plus visibles —
     * « Ajouter membre », « Nouvelle écriture » et une quarantaine d'autres.
     *
     * Le texte reprend `contrastText`, calculé par contraste mesuré sur la
     * teinte choisie : il reste lisible aussi bien sur un bleu nuit que sur un
     * orange clair.
     */
    containedInherit: ({ theme }) => ({
      color: theme.vars.palette.primary.contrastText,
      backgroundColor: theme.vars.palette.primary.main,
      '&:hover': {
        backgroundColor: theme.vars.palette.primary.dark,
      },
    }),
    outlinedInherit: ({ theme }) => ({
      color: theme.vars.palette.primary.main,
      borderColor: theme.vars.palette.primary.main,
    }),
    textInherit: ({ theme }) => ({
      color: theme.vars.palette.primary.main,
    }),
    sizeLarge: {
      minHeight: 48,
    },
  },
};

const MuiCard: Components<Theme>['MuiCard'] = {
  styleOverrides: {
 root: ({ theme }) => ({
 zIndex: 0,
 position: 'relative',
 boxShadow: theme.customShadows.card,
 borderRadius: theme.shape.borderRadius * 2,
    }),
  },
};

const MuiCardHeader: Components<Theme>['MuiCardHeader'] = {
  defaultProps: {
 titleTypographyProps: { variant: 'h6' },
 subheaderTypographyProps: { variant: 'body2' },
  }, styleOverrides: {
 root: ({ theme }) => ({
 padding: theme.spacing(3, 3, 0),
    }),
  },
};

const MuiOutlinedInput: Components<Theme>['MuiOutlinedInput'] = {
  styleOverrides: {
 notchedOutline: ({ theme }) => ({
 borderColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.2),
    }),
    // Les champs <input type="date"/"time"/"month"> affichent une icône
    // (calendrier/horloge) dessinee par le navigateur, pas par MUI. Cette
    // icône reste sombre par défaut et devient invisible sur fond sombre :
    // on l'inverse en blanc uniquement quand le thème sombre est actif.
    input: ({ theme }) => ({
      '&::-webkit-calendar-picker-indicator': theme.applyStyles('dark', {
        filter: 'invert(1)',
      }),
    }),
  },
};

const MuiPaper: Components<Theme>['MuiPaper'] = {
  defaultProps: {
 elevation: 0,
  }, styleOverrides: {
 root: { backgroundImage: 'none' },
 outlined: ({ theme }) => ({
 borderColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.16),
    }),
  },
};

const MuiTableCell: Components<Theme>['MuiTableCell'] = {
  styleOverrides: {
 head: ({ theme }) => ({
 fontSize: theme.typography.pxToRem(14),
 color: theme.vars.palette.text.secondary,
 fontWeight: theme.typography.fontWeightSemiBold,
 backgroundColor: theme.vars.palette.background.neutral,
    }),
  },
};

const MuiMenuItem: Components<Theme>['MuiMenuItem'] = {
  styleOverrides: {
 root: ({ theme }) => ({
      ...theme.typography.body2,
    }),
  },
};

const MuiLink: Components<Theme>['MuiLink'] = {
  defaultProps: { underline: 'hover' },
};

const MuiFormControlLabel: Components<Theme>['MuiFormControlLabel'] = {
  styleOverrides: {
 label: ({ theme }) => ({
      ...theme.typography.body2,
    }),
  },
};

const MuiCheckbox: Components<Theme>['MuiCheckbox'] = {
  defaultProps: {
 size: 'small',
 icon: (
      <SvgIcon>
        <path d="M17.9 2.318A5 5 0 0 1 22.895 7.1l.005.217v10a5 5 0 0 1-4.783 4.995l-.217.005h-10a5 5 0 0 1-4.995-4.783l-.005-.217v-10a5 5 0 0 1 4.783-4.996l.217-.004h10Zm-.5 1.5h-9a4 4 0 0 0-4 4v9a4 4 0 0 0 4 4h9a4 4 0 0 0 4-4v-9a4 4 0 0 0-4-4Z" />
      </SvgIcon>
    ), checkedIcon: (
      <SvgIcon>
        <path d="M17 2a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm-1.625 7.255-4.13 4.13-1.75-1.75a.881.881 0 0 0-1.24 0c-.34.34-.34.89 0 1.24l2.38 2.37c.17.17.39.25.61.25.23 0 .45-.08.62-.25l4.75-4.75c.34-.34.34-.89 0-1.24a.881.881 0 0 0-1.24 0Z" />
      </SvgIcon>
    ), indeterminateIcon: (
      <SvgIcon>
        <path d="M17,2 C19.7614,2 22,4.23858 22,7 L22,7 L22,17 C22,19.7614 19.7614,22 17,22 L17,22 L7,22 C4.23858,22 2,19.7614 2,17 L2,17 L2,7 C2,4.23858 4.23858,2 7,2 L7,2 Z M15,11 L9,11 C8.44772,11 8,11.4477 8,12 C8,12.5523 8.44772,13 9,13 L15,13 C15.5523,13 16,12.5523 16,12 C16,11.4477 15.5523,11 15,11 Z" />
      </SvgIcon>
    ),
  },
};

const MuiRadio: Components<Theme>['MuiRadio'] = {
  defaultProps: {
 size: 'small',
 icon: (
      <SvgIcon>
        <path
          d="M12 2C13.9778 2 15.9112 2.58649 17.5557 3.6853C19.2002 4.78412 20.4819 6.3459 21.2388 8.17317C21.9957 10.0004 22.1937 12.0111 21.8079 13.9509C21.422 15.8907 20.4696 17.6725 19.0711 19.0711C17.6725 20.4696 15.8907 21.422 13.9509 21.8079C12.0111 22.1937 10.0004 21.9957 8.17317 21.2388C6.3459 20.4819 4.78412 19.2002 3.6853 17.5557C2.58649 15.9112 2 13.9778 2 12C2 6.477 6.477 2 12 2ZM12 3.5C9.74566 3.5 7.58365 4.39553 5.98959 5.98959C4.39553 7.58365 3.5 9.74566 3.5 12C3.5 14.2543 4.39553 16.4163 5.98959 18.0104C7.58365 19.6045 9.74566 20.5 12 20.5C14.2543 20.5 16.4163 19.6045 18.0104 18.0104C19.6045 16.4163 20.5 14.2543 20.5 12C20.5 9.74566 19.6045 7.58365 18.0104 5.98959C16.4163 4.39553 14.2543 3.5 12 3.5Z"
          fill="currentColor"
        />
      </SvgIcon>
    ), checkedIcon: (
      <SvgIcon>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM12 8C10.9391 8 9.92172 8.42143 9.17157 9.17157C8.42143 9.92172 8 10.9391 8 12C8 13.0609 8.42143 14.0783 9.17157 14.8284C9.92172 15.5786 10.9391 16 12 16C13.0609 16 14.0783 15.5786 14.8284 14.8284C15.5786 14.0783 16 13.0609 16 12C16 10.9391 15.5786 9.92172 14.8284 9.17157C14.0783 8.42143 13.0609 8 12 8Z"
          fill="currentColor"
        />
      </SvgIcon>
    ),
  },
};

// ----------------------------------------------------------------------
// Ouverture des listes déroulantes.
//
// Par défaut, un menu MUI se retourne vers le haut quand la place manque en
// dessous, et un Select s'ouvre par-dessus le champ, l'option choisie alignée
// sur lui. Dans une boîte de dialogue, la liste recouvre alors les champs
// au-dessus et on ne voit plus ce qu'on est en train de remplir.
//
// On impose donc une ouverture vers le bas pour les deux formes de liste de choix,
// `Select` et `Autocomplete`. Les menus d'actions — les « … » des lignes, le menu
// Imprimer — gardent leur ancrage : ce ne sont pas des listes de choix, et les
// déplacer n'avait pas été demandé.

/** Le menu se place sous le champ, sans se retourner. */
const ancrageVersLeBas = {
  anchorOrigin: { vertical: 'bottom', horizontal: 'left' } as const,
  transformOrigin: { vertical: 'top', horizontal: 'left' } as const,
};

const MuiSelect: Components<Theme>['MuiSelect'] = {
  defaultProps: {
    MenuProps: ancrageVersLeBas,
  },
};

const MuiAutocomplete: Components<Theme>['MuiAutocomplete'] = {
  defaultProps: {
    slotProps: {
      popper: {
        placement: 'bottom-start',
        modifiers: [
          // `flip` est ce qui retourne la liste vers le haut : on le coupe.
          { name: 'flip', enabled: false },
          // `preventOverflow` reste actif, mais sans décaler verticalement :
          // sans lui la liste sortirait de l'écran sur les petits écrans.
          { name: 'preventOverflow', options: { altAxis: false } },
        ],
      },
    },
  },
};

// ----------------------------------------------------------------------

export const components = {
  MuiCard,
  MuiLink,
  MuiPaper,
  MuiRadio,
  MuiButton,
  MuiSelect,
  MuiBackdrop,
  MuiMenuItem,
  MuiCheckbox,
  MuiTableCell,
  MuiCardHeader,
  MuiAutocomplete,
  MuiOutlinedInput,
  MuiFormControlLabel,
};
