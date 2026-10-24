import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import FormControlLabel from '@mui/material/FormControlLabel';

// ----------------------------------------------------------------------
// Classes encadrées par un moniteur.
//
// Un moniteur intervient souvent dans plusieurs classes, et peut être
// responsable de l'une sans l'être de l'autre : la responsabilité se coche donc
// par classe, et non sur le moniteur.

export type RattachementClasse = {
  idClasseEcodim: number;
  estPrincipal?: number;
};

type ClassesDuMoniteurProps = {
  classes: any[];
  valeur: RattachementClasse[];
  onChange: (rattachements: RattachementClasse[]) => void;
};

export function ClassesDuMoniteur({ classes, valeur, onChange }: ClassesDuMoniteurProps) {
  const rattachements = Array.isArray(valeur) ? valeur : [];

  const choisies = rattachements
    .map((lien) =>
      classes.find((classe) => Number(classe.idClasseEcodim) === Number(lien.idClasseEcodim))
    )
    .filter(Boolean);

  const estResponsable = (idClasseEcodim: number): boolean =>
    rattachements.some(
      (lien) => Number(lien.idClasseEcodim) === Number(idClasseEcodim) && Number(lien.estPrincipal) === 1
    );

  const basculerResponsable = (idClasseEcodim: number, actif: boolean) =>
    onChange(
      rattachements.map((lien) =>
        Number(lien.idClasseEcodim) === Number(idClasseEcodim)
          ? { ...lien, estPrincipal: actif ? 1 : 0 }
          : lien
      )
    );

  return (
    <Box>
      <Autocomplete
        multiple
        options={classes}
        value={choisies}
        getOptionLabel={(option: any) => option?.libelleClasse || ''}
        isOptionEqualToValue={(option: any, choisie: any) =>
          Number(option.idClasseEcodim) === Number(choisie.idClasseEcodim)
        }
        onChange={(_, selection: any[]) =>
          onChange(
            selection.map((classe) => {
              const existant = rattachements.find(
                (lien) => Number(lien.idClasseEcodim) === Number(classe.idClasseEcodim)
              );

              // Une classe déjà cochée responsable le reste si on en ajoute une autre.
              return {
                idClasseEcodim: Number(classe.idClasseEcodim),
                estPrincipal: existant?.estPrincipal ? 1 : 0,
              };
            })
          )
        }
        renderTags={(valeurs: any[], getTagProps) =>
          valeurs.map((classe: any, index: number) => (
            <Chip
              {...getTagProps({ index })}
              key={classe.idClasseEcodim}
              label={classe.libelleClasse}
              size="small"
              color={estResponsable(classe.idClasseEcodim) ? 'primary' : 'default'}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Classes encadrées"
            placeholder={choisies.length ? '' : 'Choisir une ou plusieurs classes'}
          />
        )}
        fullWidth
      />

      {choisies.length > 0 && (
        <Stack spacing={0.5} sx={{ mt: 1.5 }}>
          <Typography variant="caption" color="text.secondary">
            Responsable de la classe
          </Typography>

          {choisies.map((classe: any) => (
            <FormControlLabel
              key={classe.idClasseEcodim}
              control={
                <Switch
                  size="small"
                  checked={estResponsable(classe.idClasseEcodim)}
                  onChange={(event) =>
                    basculerResponsable(classe.idClasseEcodim, event.target.checked)
                  }
                />
              }
              label={classe.libelleClasse}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
