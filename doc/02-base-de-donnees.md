# 02 — Base de données

## Un schéma, deux moteurs

`server/src/db/schema.ts` décrit les tables **une seule fois** et produit le SQL
pour SQLite et pour MySQL. Avant, chaque table était écrite deux fois : les deux
versions divergeaient, et une colonne posée côté SQLite manquait en MySQL avec un
`Unknown column` à l'exécution.

Trois exports, trois usages :

| Export | Produit | Quand |
|---|---|---|
| `buildSharedCreateStatements(dialecte)` | `CREATE TABLE IF NOT EXISTS` | Tables absentes du dump d'origine |
| `buildSharedColumnStatements(dialecte)` | `ALTER TABLE ... ADD COLUMN` | Colonnes ajoutées après coup |
| `SHARED_DATA_MIGRATIONS` | `UPDATE` | Une valeur à choix renommée |

Les trois tournent au démarrage, sur les deux moteurs :
`sqliteDB.ts → ensureSharedSchemaTables` et `app.ts → ensureSharedSchemaForMysql`.

**Les erreurs sont volontairement ignorées** sur les deux dernières. Une colonne
déjà présente fait échouer l'`ALTER`, et c'est le cas normal sur une base à jour :
ni SQLite ni MySQL 5.7 ne connaissent `ADD COLUMN IF NOT EXISTS`.

### Ajouter une colonne

- **Table du schéma partagé** (`SHARED_TABLES`) : ajouter la colonne à sa
  définition. Le `CREATE` et l'`ALTER` suivent tout seuls.
- **Table du dump d'origine** (`membre`, `culte`, `comptabilite`...) : ajouter une
  entrée dans `SHARED_COLUMNS`, qui ne produit que l'`ALTER`.

### Renommer une valeur à choix

Ajouter l'`UPDATE` dans `SHARED_DATA_MIGRATIONS`. Il doit pouvoir **se rejouer
sans effet** : au second passage, la condition ne retrouve plus aucune ligne.

```ts
"UPDATE ecodim_presence SET statutPresence = 'deplacement' WHERE statutPresence = 'excuse'"
```

Le SQL y est volontairement commun aux deux moteurs : pas de fonction ni de
syntaxe propre à l'un d'eux.

## Les listes de colonnes à source unique

Plusieurs modules construisent leurs requêtes à partir d'une seule liste —
`CHAMPS_ENFANT`, `CHAMPS_CULTE`, `CHAMPS_ACTIVITE`, `CHAMPS_FINANCE` :

```ts
const CHAMPS_FINANCE = [
  { nom: "libelleFinance", valeur: (d) => texte(d.libelleFinance) },
  ...
];

const COLONNES_FINANCE     = CHAMPS_FINANCE.map((c) => c.nom).join(", ");
const PLACEHOLDERS_FINANCE = CHAMPS_FINANCE.map(() => "?").join(",");
const AFFECTATIONS_FINANCE = CHAMPS_FINANCE.map((c) => `${c.nom} = ?`).join(", ");
```

Les noms de colonnes, les points d'interrogation et les valeurs dérivent tous de
la même liste. Tenus séparément, ils se décalent d'un cran au premier champ
ajouté — et la requête écrit alors chaque donnée dans la colonne voisine **sans
qu'aucune erreur ne soit levée**.

> L'insertion d'un membre (`membre/functions.ts`) n'a pas encore été reprise sur
> ce modèle : elle aligne trente-neuf valeurs positionnelles à la main. C'est
> pour cette raison que le matricule y est posé par un `UPDATE` après insertion.

## Les matricules

Chaque personne reçoit, à son enregistrement, un numéro qui ne change plus :

```
M2026-000001   un membre, enregistré en 2026
E2026-000001   un enfant, enregistré en 2026
```

Un nom n'identifie personne : deux « Kouassi Yao » dans une même paroisse, c'est
la règle. Et `idMembre` ne joue pas ce rôle — il ne se dicte pas au téléphone et
ne veut rien dire sur une fiche papier.

- **La lettre** dit de quel registre il s'agit. Les deux séries sont
  indépendantes ; sans elle, un membre et un enfant porteraient le même numéro.
- **L'année** donne l'ancienneté à la lecture, sans aller chercher une fiche.
- **Les six chiffres** couvrent 999 999 enregistrements par an et par registre.
- **L'unicité se joue par église** (`idUtilisateur`) : en mode serveur partagé,
  chaque église numérote de son côté.

Tout est dans `server/src/helpers/matricule.ts` :

| Fonction | Rôle |
|---|---|
| `prochainMatricule` | Le prochain numéro libre, relu en base |
| `attribuerMatricule` | Le pose sur une ligne qui vient d'être créée |
| `reprendreMatricules` | Donne un numéro aux lignes antérieures |

Deux points de conception :

**Le numéro est relu en base, pas tenu dans un compteur.** Un compteur
désynchronisé réattribuerait un matricule déjà donné — précisément ce que ce
numéro doit rendre impossible.

**La reprise se fait au premier affichage de la liste**, pas par une migration à
lancer à la main — sur le modèle de `reprendreRattachementsAnciens`, qui existait
déjà dans le module Ecodim. L'écriture exige que la colonne soit vide, ce qui
rend l'opération rejouable : un matricule attribué ne change jamais.

> `membre` ne porte **aucune date de création**, seulement des dates
> d'évènements. Les membres repris prennent donc l'année courante, dans leur
> ordre d'enregistrement. Les enfants, eux, ont une `dateCreation` exploitable,
> et l'année retenue est celle de leur inscription puis de leur entrée.

**Pas d'index unique en base pour l'instant.** La génération vérifie qu'un numéro
n'est pas pris et recommence une fois si besoin, ce qui suffit sur un poste local
où une seule personne saisit. En mode en ligne avec des saisies simultanées, un
index unique sur `(idUtilisateur, matricule)` sera la vraie garantie.

## Les décès

Un membre marqué décédé disparaît de **toutes** les listes. Le filtre est posé en
SQL, pas dans l'interface :

```sql
SELECT * FROM membre WHERE idUtilisateur = ? AND COALESCE(estDecede, 0) <> 1
```

Ce filtre doit suivre partout où la personne apparaît sous un autre rôle. Pour
les moniteurs de l'Ecodim, `MONITEUR_VIVANT` l'applique à quatre endroits : la
liste, le nombre de moniteurs par classe, le nom du responsable de classe, et le
garde-fou qui empêche de supprimer une classe encore occupée.

Rien n'est supprimé : retirer le décès fait tout réapparaître.

## Où vivent les bases

| Plateforme | Dossier |
|---|---|
| Windows | `C:\base-communaute` |
| macOS | `~/Library/Application Support/Ma Communauté/base-communaute` |
| Partout | `SQLITE_DB_DIR` si la variable est posée |

On y trouve un fichier `.db` par église, `.active-db.json` (la base courante),
`.desktop-license.secure` (la licence chiffrée), `ecodim-medias/`,
`photo-membre/` et `sauvegardes/`.
