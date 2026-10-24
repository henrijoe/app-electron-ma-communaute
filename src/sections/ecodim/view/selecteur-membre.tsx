import { useMemo } from 'react';

import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';

import { normalizeText } from 'src/utils/text';

/**
 * Minuscules et sans accents, pour comparer.
 *
 * `normalizeText` corrige les textes mal encodés mais conserve les accents : il ne
 * suffit pas ici. Personne ne tape « Aké » avec son accent en cherchant dans une
 * liste, et « Ake » doit trouver « Aké ».
 */
const sansAccents = (valeur: unknown): string =>
  normalizeText(valeur)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

// ----------------------------------------------------------------------
// Choisir un parent parmi les membres de l'église.
//
// Les parents des enfants de l'école du dimanche sont très souvent membres : les
// retaper serait une double saisie, avec les écarts d'orthographe qui vont avec.
// Ce sélecteur remplit les champs d'un coup ; ils restent ensuite librement
// modifiables, et un parent qui n'est pas membre se saisit simplement à la main.

export type MembreChoisi = {
  nom: string;
  prenom: string;
  contact: string;
  lieuHabitation: string;
  profession: string;
};

type SelecteurMembreProps = {
  membres: any[];
  libelle: string;
  onChoisir: (membre: MembreChoisi) => void;
};

type Option = {
  idMembre: number;
  etiquette: string;
  recherche: string;
  membre: any;
};

export function SelecteurMembre({ membres, libelle, onChoisir }: SelecteurMembreProps) {
  const options = useMemo<Option[]>(
    () =>
      (membres || [])
        .map((membre) => {
          const nomComplet = `${membre.nomMembre || ''} ${membre.prenomMembre || ''}`.trim();
          const etiquette = [nomComplet, membre.contactMembre]
            .map((valeur) => String(valeur || '').trim())
            .filter(Boolean)
            .join(' — ');

          return {
            idMembre: Number(membre.idMembre),
            etiquette: etiquette || `Membre ${membre.idMembre}`,
            recherche: sansAccents(etiquette),
            membre,
          };
        })
        .sort((gauche, droite) => gauche.etiquette.localeCompare(droite.etiquette)),
    [membres]
  );

  if (!options.length) {
    return null;
  }

  return (
    <Stack spacing={0.5}>
      <Autocomplete
        options={options}
        value={null}
        // Le champ se vide après chaque choix : il sert à remplir les champs
        // en dessous, pas à retenir une sélection.
        blurOnSelect
        clearOnBlur
        handleHomeEndKeys
        getOptionLabel={(option) => option.etiquette}
        isOptionEqualToValue={(option, valeur) => option.idMembre === valeur.idMembre}
        filterOptions={(liste, etat) => {
          const terme = sansAccents(etat.inputValue).trim();
          if (!terme) return liste;
          return liste.filter((option) => option.recherche.includes(terme));
        }}
        onChange={(_, option) => {
          if (!option) return;

          onChoisir({
            nom: option.membre.nomMembre || '',
            prenom: option.membre.prenomMembre || '',
            contact: option.membre.contactMembre || '',
            lieuHabitation: option.membre.residenceMembre || '',
            profession: option.membre.fonctionMembre || '',
          });
        }}
        renderInput={(params) => (
          <TextField {...params} label={libelle} placeholder="Rechercher un membre..." />
        )}
        fullWidth
      />
      <Typography variant="caption" color="text.secondary">
        Facultatif. Remplit les champs ci-dessous, qui restent modifiables.
      </Typography>
    </Stack>
  );
}
