# Desktop

Ce dossier contient la base du conteneur desktop Electron.

## Objectif
- ouvrir le frontend React dans une application desktop
- preparer le lancement du backend local Node/SQLite
- permettre ensuite le packaging Windows en executable installable

## Scripts
- `yarn desktop:dev`
- `yarn desktop:dev:backend`
- `yarn desktop:build:backend`
- `yarn desktop:pack`

## Backend embarque
Le backend local est prevu dans `electron/main.cjs`.

Pour l'instant, il ne se lance que si la variable suivante est definie :

```bash
ELECTRON_START_BACKEND=1
```

Le script recommande pour le dev desktop avec backend local est :

```bash
yarn desktop:build:backend
yarn dev
yarn desktop:dev:backend
```

Le script recommande pour generer l'installateur Windows est :

```bash
yarn desktop:pack
```

Ce script :
- build le backend serveur
- copie le backend dans `electron/backend`
- build le front web
- copie le front web dans `electron/backend/views` pour que l'exe serve aussi l'application sur `http://IP_DU_PC:49300`
- genere l'installeur Electron

Cela permet de mettre en place le desktop sans casser le flux actuel du projet.
