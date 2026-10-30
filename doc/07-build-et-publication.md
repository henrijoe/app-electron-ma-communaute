# 07 — Build et publication

## Développer

Node **20.x** est exigé (`engines`). Une version plus récente fait refuser
l'installation par Yarn.

```bash
# Serveur — port 49300
cd server && npm run dev

# Front seul — port 3039
cd frond && yarn dev

# L'application telle que le client l'a
cd frond && yarn desktop

# Electron + front + backend embarqué
cd frond && yarn desktop:dev:backend
```

Avant de livrer : `yarn type-check` (ou `npx tsc --noEmit`) des **deux** côtés,
puis `yarn lint`.

> `yarn build` enchaîne `tsc --noEmit` et `vite build`. Attention à ne pas
> écrire `yarn build desktop:pack:win` : le second nom est alors pris pour un
> point d'entrée Vite, et le message d'erreur ne le dit pas.

## Packager

```bash
cd frond && yarn desktop:pack:win
```

Trois étapes s'enchaînent :

1. `desktop:build:backend` — compile `../server`, puis `prepare-backend.cjs`
   copie le résultat dans `electron/backend/`.
2. `desktop:build:web` — compile le front et le pose dans
   `electron/backend/views/` **et** `server/views/`.
3. `electron-builder` — produit l'installateur NSIS dans `release/windows/`.

### Pourquoi `prepare-backend.cjs` est écrit ainsi

Il recopiait 772 Mo de `node_modules` à chaque packaging. Deux changements :

- **Un filtre à la copie** écarte ce qui n'a rien à faire dans un installateur :
  `@types`, `typescript`, `ts-node`, `nodemon`, `.cache`.
- **Une empreinte** (`backend-node-modules.empreinte.json`) permet de sauter
  entièrement l'étape quand les dépendances n'ont pas bougé.

Résultat : 772 Mo → 89 Mo, et 12 s → 1 s quand rien n'a changé.

## Publier

`.github/workflows/desktop-release.yml`, sur `windows-latest`. Il compile,
produit l'installateur, crée une **release brouillon**, vérifie que les fichiers
attendus y sont, puis la publie.

`electron-builder` publie vers `henrijoe/app-electron-ma-communaute`. Le
`latest.yml` déposé dans la release est ce que `electron-updater` consulte.

### Le piège qui a bloqué les releases trois mois

```yaml
# ✗ Depuis la racine, npm installe le paquet racine DANS le backend
npm --prefix electron/backend install --omit=dev

# ✓ Se placer dans le dossier
(cd electron/backend && npm install --omit=dev && npm prune --omit=dev)
```

La première forme installait `Ma-communaute` à l'intérieur de son propre
backend, créant une récursion infinie. L'archivage mourait sur un code 255, après
environ cinquante minutes, avec un message qui ne pointait rien. Un garde-fou
supprime désormais explicitement les dossiers fautifs après installation.

## Mises à jour automatiques

`electron-updater`, dans l'application **installée** uniquement
(`app.isPackaged`). Rien de tout cela ne fonctionne avec `yarn desktop`.

- Une vérification **8 secondes après l'ouverture**, puis **toutes les 4 heures**.
  Beaucoup de postes d'église restent allumés toute la semaine sans fermer
  l'application : une seule vérification au lancement signifierait qu'une version
  publiée le mardi ne serait vue qu'au prochain redémarrage.
- Le téléchargement est automatique, **l'installation ne l'est pas** : elle reste
  un geste volontaire depuis Paramètres, pour qu'une mise à jour ne redémarre
  jamais l'application en pleine saisie.
- Dès qu'une version est trouvée, une boîte **« NOUVELLE MISE À JOUR »** s'ouvre
  avec le numéro de version et renvoie vers Paramètres
  (`components/desktop/desktop-update-dialog.tsx`). Avant, le résultat n'était
  visible que dans Paramètres — personne n'y allait, donc personne ne savait.
- « Plus tard » retient la version dans le stockage local : la boîte ne revient
  pas à chaque navigation, mais la version **suivante** la rouvre.

## Publier une nouvelle version

1. Monter `version` dans `frond/package.json`.
2. Commiter, pousser sur `main`.
3. Le workflow fait le reste.
4. Vérifier que `releases/latest/download/latest.yml` répond bien.
