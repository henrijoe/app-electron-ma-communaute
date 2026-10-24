import type { ReactNode, ReactElement } from 'react';
import type { TextFieldProps } from '@mui/material/TextField';

import { useMemo, Children, isValidElement } from 'react';

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

// ----------------------------------------------------------------------
// Liste déroulante avec recherche, en remplacement direct d'un
// `<TextField select>`.
//
// Une liste de vingt fonctions ou de cent membres se parcourt mal à la souris.
// Ce composant garde exactement la même écriture — des `<MenuItem value=...>`
// en enfants, un `value` et un `onChange` — et n'ajoute qu'un champ de saisie
// pour filtrer. La migration d'un select existant est donc le seul changement
// de son nom de balise.

/** Minuscules et sans accents : « Tresoriere » doit trouver « Trésorière ». */
const sansAccents = (valeur: unknown): string =>
  String(valeur ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

type Option = {
  valeur: string;
  etiquette: string;
  recherche: string;
};

export type SelectRechercheProps = Omit<TextFieldProps, 'select' | 'onChange' | 'value'> & {
  value?: unknown;
  /**
   * Reçoit un évènement de la même forme que celui d'un `<TextField select>`.
   *
   * Le type reste volontairement large : les gestionnaires existants sont typés
   * `React.ChangeEvent<HTMLInputElement>`, alors que l'évènement fabriqué ici n'en
   * porte que la partie utile — `target.value` et `target.name`. Les contraindre
   * obligerait à réécrire chaque appelant sans rien apporter.
   */
  onChange?: (event: any) => void;
  children?: ReactNode;
  /** Texte du champ de recherche. */
  placeholderRecherche?: string;
  /** En dessous de ce nombre d'options, la recherche n'apporte rien. */
  seuilRecherche?: number;
};

/**
 * Texte lisible d'un contenu de `<MenuItem>`.
 *
 * Le contenu est rarement une simple chaîne : c'est souvent plusieurs morceaux
 * juxtaposés, comme un nom suivi d'une fonction. Un `String()` direct sur ce
 * tableau les collerait avec des virgules.
 */
const texteDesEnfants = (contenu: ReactNode): string => {
  if (contenu === null || contenu === undefined || typeof contenu === 'boolean') {
    return '';
  }

  if (typeof contenu === 'string' || typeof contenu === 'number') {
    return String(contenu);
  }

  if (Array.isArray(contenu)) {
    return contenu.map(texteDesEnfants).join('');
  }

  if (isValidElement(contenu)) {
    return texteDesEnfants((contenu as ReactElement<any>).props?.children);
  }

  return '';
};

/** Transforme les `<MenuItem>` enfants en options exploitables. */
const lireOptions = (children: ReactNode): Option[] =>
  Children.toArray(children)
    .filter(isValidElement)
    .map((enfant) => {
      const props = (enfant as ReactElement<any>).props || {};
      const valeur = props.value === undefined || props.value === null ? '' : String(props.value);
      const etiquette = texteDesEnfants(props.children) || valeur;

      return { valeur, etiquette, recherche: sansAccents(etiquette) };
    });

export function SelectRecherche({
  value,
  onChange,
  children,
  name,
  placeholderRecherche = 'Rechercher...',
  seuilRecherche = 6,
  disabled,
  // La mise en forme va sur la racine, pas sur le champ interne.
  //
  // Sur un `<TextField select>`, `sx` et `fullWidth` s'appliquent à l'élément
  // extérieur — celui que la mise en page dispose. Ici l'élément extérieur est
  // la racine de l'Autocomplete, et tout partait dans le TextField qu'elle
  // contient : la racine gardait une largeur libre, que rien ne pouvait régler
  // depuis l'appelant.
  //
  // Dans une colonne, un bloc occupe toute la largeur : le défaut ne se voyait
  // pas. Dans une rangée, la racine devient un élément flex qui ne sait pas se
  // réduire, et trois listes côte à côte débordent de leur conteneur.
  sx,
  fullWidth,
  ...autres
}: SelectRechercheProps) {
  const options = useMemo(() => lireOptions(children), [children]);

  const valeurCourante = value === undefined || value === null ? '' : String(value);
  const optionCourante = options.find((option) => option.valeur === valeurCourante) || null;

  return (
    <Autocomplete
      sx={sx}
      fullWidth={fullWidth}
      options={options}
      value={optionCourante}
      disabled={disabled}
      // Au-delà d'une poignée de lignes, taper est plus rapide que faire défiler ;
      // en dessous, un champ de recherche encombre plus qu'il n'aide.
      disableClearable={false}
      openOnFocus
      autoHighlight
      forcePopupIcon
      getOptionLabel={(option) => option.etiquette}
      isOptionEqualToValue={(option, choisie) => option.valeur === choisie.valeur}
      filterOptions={(liste, etat) => {
        if (options.length < seuilRecherche) {
          return liste;
        }

        const terme = sansAccents(etat.inputValue).trim();
        if (!terme) return liste;

        return liste.filter((option) => option.recherche.includes(terme));
      }}
      onChange={(_, option) =>
        onChange?.({ target: { value: option ? option.valeur : '', name: name as string } })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          {...(autres as any)}
          name={name}
          placeholder={options.length >= seuilRecherche ? placeholderRecherche : autres.placeholder}
        />
      )}
    />
  );
}
