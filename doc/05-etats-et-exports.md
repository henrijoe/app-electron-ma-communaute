# 05 — États et exports

Chaque module range ses documents imprimables dans `sections/<module>/etats/`.
Deux sorties : l'**impression** (navigateur ou PDF Electron) et l'**export
Excel**.

## La règle qui gouverne tout : l'état suit l'écran

Un état reprend **les lignes que le tableau affiche au moment du clic** — filtres
et recherche compris — et non la liste complète.

C'est le défaut le plus coûteux qu'on ait corrigé : on filtrait sur une cellule,
on imprimait, et on recevait les 240 membres de l'église. Deux conséquences
pratiques :

**Passer les lignes en propriété**, avec le store en repli :

```tsx
const lignes = Array.isArray(membres) ? membres : listMembre;
```

**Porter le filtre sur le document.** Une feuille qui montre 12 membres sur 240
doit dire pourquoi, sinon elle se lit comme la liste entière de l'église. Le
sous-titre reprend le filtre actif et l'effectif.

Quand un filtre est masqué sur un onglet, la condition correspondante doit
disparaître du calcul : voir [03](03-module-ecodim.md).

## Impression : les trois pièges

### 1. La règle `@page` doit être nommée

Plusieurs documents imprimables restent montés en même temps dans la page.
`react-to-print` recopie **toutes** les balises `<style>` dans son iframe : une
règle `@page` générique déclarée par un autre document écrase la nôtre — à
spécificité égale, la dernière l'emporte.

```css
@page ficheSuiviPortrait { size: A4 portrait; margin: 10mm; }
.fiche-suivi-print-root  { page: ficheSuiviPortrait; }
```

### 2. Une référence par document

`react-to-print` lit le contenu **au moment du clic**, avant qu'un changement
d'état n'ait eu le temps d'être appliqué. Partager une seule référence imprime le
document précédemment sélectionné.

### 3. Les largeurs en millimètres, pas en pourcentage

Une unité absolue a une taille fixe ; un pourcentage dépend de la largeur
résolue du conteneur au moment de l'impression. Avec une règle `@page` nommée,
certains moteurs calculent mal cette largeur de référence — d'où un tableau trop
étroit et du texte qui déborde d'une colonne à l'autre.

La largeur reste **identique à l'écran et à l'impression** : pas de `width: 100%`
sous `@media print`.

## Desktop : pas d'impression navigateur

Sur un poste installé, l'impression et les exports de fichiers passent par
Electron. Tous les boutons concernés sont masqués :

```tsx
{!isDesktopApp && <PrintEtatGlobal ... />}
```

`src/utils/desktop-print.ts` fournit l'aperçu natif et l'export PDF. L'orientation
y est envoyée **explicitement**, et non déduite de la règle CSS : tous les
documents du menu sont montés en même temps et n'ont donc pas chacun une règle
`@page` isolée et fiable.

## Excel

`xlsx`, un classeur par volet affiché. Le bouton exporte **le volet ouvert, et
lui seul** : il produisait un classeur de cinq feuilles quel que soit l'onglet,
si bien qu'on cliquait depuis les enfants et qu'on recevait un fichier qui
s'ouvrait sur les classes.

Trois règles de forme :

**Les codes deviennent des libellés.** Une feuille se lit à l'œil : `Oui`, pas
`1` ; `Féminin`, pas `F`.

**Les largeurs sont posées.** Sans `!cols`, toutes les colonnes sortent à la
taille par défaut et le fichier est illisible sans ajustement manuel.

**Les en-têtes sont écrits même sans ligne.** Une feuille vide qui dit « Non
inscrits » se lit comme « aucun », pas comme une erreur.

Pour une feuille de caisse, recette et dépense occupent **deux colonnes
distinctes** plutôt qu'un montant signé : c'est la forme d'un livre de caisse, et
elle se totalise d'un coup d'œil. Deux lignes de pied portent les totaux et le
solde — un état qu'il faut encore additionner à la main n'est pas un état.

## Dates

`src/utils/format-date.ts`, format `jj/mm/aaaa` partout.

La conversion **découpe la chaîne ISO** au lieu de passer par `new Date()` :

```ts
const JOUR_ISO = /^(\d{4})-(\d{2})-(\d{2})/;
```

Une date stockée `2026-03-05` est interprétée par `new Date()` comme minuit
**UTC**. À l'affichage en heure locale, elle recule d'un jour dans tous les
fuseaux situés à l'ouest de Greenwich — Abidjan compris. Le découpage de chaîne
n'a pas ce problème.

Même précaution pour composer la date du jour : on la construit à partir des
composantes locales, jamais avec `toISOString()`.
