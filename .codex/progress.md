# Progression

## 2026-03-13
- Correction de la navigation `login -> sign-up` pour rendre l'inscription accessible depuis l'ecran de connexion.
- Ajustement du routeur pour ne pas afficher le layout dashboard au demarrage sans session valide.
- Uniformisation des libelles `login/register` en francais.
- Correction d'une erreur ESLint sur l'apostrophe dans le layout d'authentification.
- Ajout d'un appel front non bloquant vers `communaute/creer-base-sqlite` apres creation de compte.
- Ajout de commentaires explicatifs dans [apiClient.ts](/d:/Mes_projets/Ma-communaute/communaute-encours/frond/src/utils/apiClient.ts).
- Implementation backend initiale du mode `DB_MODE=sqlite|mysql`.
- Ajout d'une couche SQLite partagee pour reutiliser les endpoints existants via [index.ts](/d:/Mes_projets/Ma-communaute/communaute-encours/server/src/db/index.ts).
- Ajout de la creation/activation automatique de base SQLite locale pendant l'inscription et selection automatique de la base locale au login.
- Ajout de l'endpoint backend `POST /communaute/creer-base-sqlite` et verification du build serveur.
- Preparation du front pour un mode `local/online` avec nouvel etat `connectionMode`.
- Ajout de helpers d'URL API/photo pour eviter les dependances directes a `BASE_URL_DEV`.
- Remplacement des URLs photo directes dans les vues membre par un helper base sur l'URL API resolue.
- Verification TypeScript du front avec succes via `npm run type-check`.
- Ajout d'une migration automatique du schema SQLite pour completer les bases locales deja creees avec les tables manquantes.
- Verification que les tables `culte`, `deces`, `mariage` et `naissance` existent maintenant dans [ma-communaute-local.db](/c:/base-communaute/ma-communaute-local.db) et [temple-test-local-13.db](/c:/base-communaute/temple-test-local-13.db).
- Preparation du mode desktop avec Electron dans le front.
- Ajout d'un dossier [electron](/d:/Mes_projets/Ma-communaute/communaute-encours/frond/electron) avec [main.cjs](/d:/Mes_projets/Ma-communaute/communaute-encours/frond/electron/main.cjs), [preload.cjs](/d:/Mes_projets/Ma-communaute/communaute-encours/frond/electron/preload.cjs) et [README.md](/d:/Mes_projets/Ma-communaute/communaute-encours/frond/electron/README.md).
- Ajout des scripts desktop dans [package.json](/d:/Mes_projets/Ma-communaute/communaute-encours/frond/package.json) pour ouvrir le front en application desktop puis preparer un futur executable Windows.
- Preparation d'un point de branchement pour lancer plus tard le backend local embarque en SQLite depuis le conteneur desktop.
- Installation des dependances `electron` et `electron-builder` dans le front.
- Verification du scaffold desktop avec succes via Electron et verification TypeScript via `tsc --noEmit`.
- Ajout d'un script dedie [run-desktop.cjs](/d:/Mes_projets/Ma-communaute/communaute-encours/frond/electron/run-desktop.cjs) pour lancer Electron avec ou sans backend local sans casser le mode web.
- Ajout des scripts [package.json](/d:/Mes_projets/Ma-communaute/communaute-encours/frond/package.json) : `desktop:dev:backend` et `desktop:build:backend`.
- Correction du lancement du backend embarque dans [main.cjs](/d:/Mes_projets/Ma-communaute/communaute-encours/frond/electron/main.cjs) pour utiliser `node dist/app.js` dans le dossier serveur au lieu du binaire Electron.
- Ajout de [prepare-backend.cjs](/d:/Mes_projets/Ma-communaute/communaute-encours/frond/electron/prepare-backend.cjs) pour copier le backend build, les templates SQL et les ressources serveur dans `electron/backend`.
- Adaptation du packaging Electron dans [package.json](/d:/Mes_projets/Ma-communaute/communaute-encours/frond/package.json) pour embarquer `electron/backend` dans `extraResources`.
- Adaptation de [main.cjs](/d:/Mes_projets/Ma-communaute/communaute-encours/frond/electron/main.cjs) pour lancer le backend embarque aussi apres packaging, soit via un exe backend, soit via `ELECTRON_RUN_AS_NODE` sur le build JS du serveur.
- Verification de la preparation backend via `node electron/prepare-backend.cjs` et verification TypeScript du front avec succes.
- Correction du mode desktop package pour demarrer automatiquement le backend local au lieu de laisser cette action uniquement a un flag de dev.
- Ajout d'un log desktop principal dans `%APPDATA%\\Ma Communaute\\desktop.log` et de raccourcis `F12` / `Ctrl+Shift+I` pour ouvrir les DevTools dans Electron.
- Ajustement du login desktop avec suppression de `Besoin d'aide ?`, fond visuel plus present dans [layout.tsx](/d:/Mes_projets/Ma-communaute/communaute-encours/frond/src/layouts/auth/layout.tsx), et nettoyage des actions sociales inutilisees dans [sign-in-view.tsx](/d:/Mes_projets/Ma-communaute/communaute-encours/frond/src/sections/auth/sign-in-view.tsx).
- Ajout de logs de requetes desktop dans [apiClient.ts](/d:/Mes_projets/Ma-communaute/communaute-encours/frond/src/utils/apiClient.ts) pour mieux diagnostiquer les erreurs reseau du mode installe.

## 2026-03-17 - Assets desktop Electron
- Ajout de src/utils/asset-url.ts pour resoudre les assets statiques en mode web et Electron packagé.
- Correction des chemins desktop pour le logo, le fond de login, les icones du dashboard et les SvgColor.
- Correction de getPhotoUrl pour distinguer les assets frontend (/assets/...) et les photos servies par le backend (/photos/... ou nom de fichier simple).
- Validation TypeScript: 
ode .\\node_modules\\typescript\\bin\\tsc --noEmit.


## 2026-03-18 - Auth + departement delete
- Refonte du layout auth en plein ecran avec panneau visuel dedie login/register et icones grandes format desktop.
- Ajout d'icones explicites dans sign-in (personne + cle) et sign-up (eglise + maison).
- Correction de la suppression departement: envoi de idUtilisateur courant au backend pour suppression simple et multiple, et suppression du idUtilisateur: 1 code en dur a la creation.
- Validation TypeScript: 
ode .\\node_modules\\typescript\\bin\\tsc --noEmit.


## 2026-03-18 - Impression Electron
- Ajout d'une API Electron d'impression via IPC dans electron/main.cjs et electron/preload.cjs.
- Ajout de src/utils/desktop-print.ts pour capturer un document HTML imprimable avec ses styles courants.
- Premiere integration reelle sur l'etat departement: apercu avant impression Electron + export PDF via menu Imprimer.
- Refonte de listeDepartementPdf.tsx pour fournir une fiche imprimable utile (entete, tableau, total).
- Validation TypeScript: 
ode .\\node_modules\\typescript\\bin\\tsc --noEmit.



## 2026-03-18 - Documentation blocage desktop
- Ajout de .codex/desktop-blocking-flow.md pour expliquer pas a pas le mecanisme de blocage desktop local.
- Documentation du fichier de licence local chiffre, du delai de 40 jours, du superadmin Henri et du debloquage via la page Parametres.
- Ajout de la reference du nouveau document dans .codex/README.md.
