# 08 — Conventions

Les règles de ce projet, avec la raison qui les a produites. La raison compte
autant que la règle : c'est elle qui permet de décider dans un cas voisin.

## Langue

**Tout est en français** : interface, commentaires, noms de variables, messages
de commit. Un commentaire anglais au milieu de code français se repère
immédiatement comme venant d'ailleurs.

## Les valeurs stockées ne sont pas accentuées

```ts
// En base
statutPresence: 'present' | 'absent' | 'deplacement'
statutActivite: 'Planifiee' | 'EnCours' | 'Terminee' | 'Annulee'

// À l'affichage
const LIBELLES_STATUT = { Planifiee: 'Planifiée', EnCours: 'En cours', ... };
```

Accentuer une valeur stockée rompt la correspondance avec les lignes déjà
saisies. Cela vaut aussi pour les alias d'import Excel.

**Renommer une valeur** exige une reprise des données : voir
`SHARED_DATA_MIGRATIONS` dans [02](02-base-de-donnees.md). Renommer seulement le
libellé laisse le code dire longtemps l'inverse de l'écran.

## Un `const` lu avant sa déclaration casse le rendu

Et **TypeScript ne le signale pas** quand la lecture se fait dans un tableau de
dépendances :

```tsx
const handleExport = useCallback(() => { ... }, [sortedData]); // ligne 947
const sortedData = useMemo(() => ..., [dataFiltered]);         // ligne 1088
```

Le tableau est évalué au rendu, ligne 947, avant la déclaration : `ReferenceError`
à l'ouverture de l'écran. Quand une valeur sert à plusieurs endroits, elle se
déclare **en haut** du composant.

Le même piège existe avec une fonction utilisée dans un `useMemo` : si elle est
déclarée après, `tsc` passe et l'écran plante.

## Un filtre doit agir là où il est montré

Et réciproquement : quand un filtre est masqué sur un onglet, **la condition
correspondante doit disparaître du calcul**. Les valeurs persistent d'un onglet
à l'autre, et un filtre invisible qui continue d'agir est introuvable.

→ [03 — Module Ecodim](03-module-ecodim.md)

## Une liste ne propose que du réel

Un select d'années se remplit des années **présentes dans les données**, pas
d'une plage calculée. Proposer une année sans aucune ligne donne un tableau vide
sans que rien n'explique pourquoi.

→ Toute source datée sur laquelle le filtre agit doit figurer dans ce balayage.

## Pagination

5 lignes par défaut, choix 5 / 10 / 25, partout.

**Seules les lignes sont paginées.** Les totaux portent sur l'ensemble : un
total réduit à la page affichée serait faux, et c'est pourtant ce chiffre qu'on
recopie sur un registre.

La page revient à 1 quand un filtre change — sinon on tombe sur un tableau vide
sans comprendre pourquoi.

## Supprimer, c'est souvent archiver

Pour la comptabilité et la caisse Ecodim, une suppression met à la corbeille avec
un motif. Le point financier d'un mois passé doit rester explicable.

Pour un décès, rien n'est supprimé non plus : la personne est masquée partout, et
retirer le décès la fait réapparaître.

## Écrire un commentaire

On explique **pourquoi**, jamais **quoi** :

```ts
// ✗ Filtre les enfants par classe
// ✓ Un mouvement sans classe concerne toute l'école : il reste visible quelle
//   que soit la classe filtrée, sinon le solde d'une classe ignorerait les
//   dépenses communes qui la concernent aussi.
```

Un commentaire qui paraphrase le code vieillit mal et n'apprend rien. Un
commentaire qui donne la raison survit à la réécriture.

## Modifier du code en masse

Les scripts de remplacement automatique ont déjà détruit 700 lignes de ce
projet : une ancre (`label="Intitulé *"`) existait dans deux formulaires, et tout
ce qui se trouvait entre les deux a été écrasé. `tsc` est passé, le fichier
n'était pas suivi par Git, `git diff` ne montrait rien.

**Tout script de modification doit vérifier un nombre d'occurrences attendu et
n'écrire qu'en cas de correspondance exacte.** À défaut, modifier à la main.

## Particularités du poste de développement

- **`node -e` et les heredocs avalent les antislashs.** Les expressions
  régulières et les séquences d'échappement cassent silencieusement. Écrire un
  fichier de script, puis l'exécuter.
- **Node 20.14.0** est requis :
  `PATH="/c/Users/smsag/AppData/Roaming/nvm/v20.14.0:$PATH"`.
- **Le dossier `.codex/`** porte le journal de travail et les conventions de
  collaboration. Ce dossier `doc/` porte la documentation technique.

## Vérifier sur les vraies données

Le SQL n'est vérifié par aucun compilateur : une erreur de syntaxe ou une
jointure fausse ne se voit qu'à l'exécution. Pour une migration ou une requête
délicate, la rejouer sur une **copie** de la base réelle, et compter les lignes
avant et après.

Une migration de données doit toujours être **rejouable sans effet** : au second
passage, elle ne doit plus rien toucher.
