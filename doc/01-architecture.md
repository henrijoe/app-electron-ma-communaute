# 01 — Architecture

## Deux dépôts, côte à côte

```
communaute/
├── frond/      React 18 + Vite + MUI, et l'enveloppe Electron
└── server/     Express + TypeScript, SQLite ou MySQL
```

Les deux sont des dépôts Git distincts. Ils doivent rester **voisins** : plusieurs
scripts de `frond` appellent `../server` par ce chemin relatif.

## Le piège du backend en double

`frond/electron/backend/` contient un backend. **Ce n'est pas celui qu'on
modifie.** C'est une copie, régénérée à chaque packaging par
`electron/prepare-backend.cjs`, qui compile `../server` et recopie le résultat.

Modifier `electron/backend/` donne l'illusion de fonctionner — jusqu'au prochain
packaging, qui écrase tout sans prévenir. **Le code serveur se modifie toujours
dans `../server/src/`.**

Même logique pour le front : `electron/backend/views/` et `server/views/`
reçoivent le front compilé, posé par `electron/sync-renderer-to-backend.cjs`.

## Les trois façons d'exécuter l'application

| Commande | Ce qui tourne | Pour quoi |
|---|---|---|
| `yarn dev` | Vite seul, port 3039 | Travailler sur l'interface, backend lancé à part |
| `yarn desktop` | Electron + le front | Voir l'application telle que le client l'a |
| `yarn desktop:dev:backend` | Electron + front + backend embarqué | Tester la chaîne complète |

Côté serveur, `npm run dev` lance Express sur le **port 49300**.

Dans Electron, un pont `contextBridge` expose au front trois objets :
`desktopApp` (reconnaître le mode installé), `desktopUpdater` (mises à jour) et
`desktopBackup` (sauvegardes). Le front teste `window.desktopApp?.isDesktop`
pour masquer ce qui n'a pas de sens sur un poste installé — l'impression
navigateur et les exports de fichiers, notamment.

## Local ou en ligne : une église choisit un mode

C'est une décision de produit, pas une option technique. Une église est **soit**
sur un poste local, **soit** sur le service en ligne. Il n'y a pas de
synchronisation entre les deux, seulement un transfert ponctuel si elle change
de mode.

| | Poste local | En ligne |
|---|---|---|
| Base | SQLite, un fichier par église dans `C:\base-communaute` | MySQL partagé |
| `DB_MODE` | `sqlite` | `mysql` |
| Qui ouvre l'accès | La licence desktop ([06](06-licence-desktop.md)) | L'abonnement SasPay |
| Variable | `DESKTOP_LICENSE_ENFORCED` (défaut : actif) | `ABONNEMENT_REQUIS=true` |

En mode SQLite, la connexion cherche le compte dans chaque fichier `.db` du
dossier et retient celui qui le contient comme base active.

## Le front

`src/sections/` porte un dossier par module métier : `user` (membres), `ecodim`,
`culte`, `cellule`, `departement`, `groupe`, `famille-jeunesse`, `social`,
`pastoral`, `galerie`, `agenda`, `comptabilite`, `responsabilites`, `settings`,
`guide`.

Chaque module suit la même forme :

```
sections/<module>/
├── view/          les écrans
├── etats/         les documents imprimables et les exports
└── utils.ts       filtrage, tri, pagination
```

L'état global passe par Redux Toolkit avec `redux-persist`. **Seuls
`application` et `authentification` sont persistés** : les listes métier sont
rechargées depuis le serveur à chaque ouverture, pour qu'un écran n'affiche
jamais des données d'hier.

Les appels réseau passent tous par `src/utils/apiClient.ts`. Il porte le jeton,
et surtout il traite le **401** : une réponse 401 termine la session et renvoie à
l'écran de connexion, au lieu de laisser l'application tourner avec un jeton
périmé.

## Le serveur

```
server/src/
├── app.ts                  démarrage, CORS, Socket.IO, migrations
├── db/
│   ├── index.ts            _executeSql et _selectSql, communs aux deux moteurs
│   ├── schema.ts           le schéma partagé (voir 02)
│   └── sqliteDB.ts         gestion des fichiers SQLite
├── helpers/
│   ├── jetons.ts           JWT
│   └── matricule.ts        matricules des personnes
└── communaute/<module>/    routes → controllers → services → functions
```

Chaque module métier suit la même chaîne : `routes` déclare les URL,
`controllers` lit la requête, `services` porte la règle, `functions` parle à la
base. Les écritures diffusent un évènement Socket.IO, ce qui permet à un second
poste d'actualiser sa liste sans rafraîchir la page.
