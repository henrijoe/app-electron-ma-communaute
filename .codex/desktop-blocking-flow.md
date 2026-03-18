# Flow De Blocage Desktop

Ce document explique, de maniere simple, comment fonctionne le blocage automatique de l'application desktop Electron.

## Objectif

Le but est de :

- laisser l'application fonctionner normalement pendant `40 jours`
- bloquer les comptes classiques apres expiration
- laisser le `superadmin` se connecter pour debloquer l'application
- conserver cette logique localement sur la machine du client

## Informations fixes actuellement en code

Les valeurs importantes configurees en dur sont :

- superadmin desktop :
  - nom utilisateur : `Henri`
  - mot de passe : `dihj060195`
- secret de reference local :
  - `com2026!`
- duree avant blocage automatique :
  - `40 jours`

Le fichier qui contient ces references est :

- [sqliteSecurity.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/db/sqliteSecurity.ts)

## Ou est stockee la licence desktop

Le fichier de licence n'est plus en clair.

Il est stocke localement ici :

- `C:\base-communaute\.desktop-license.secure`

Le dossier SQLite local est determine depuis :

- [sqliteDB.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/db/sqliteDB.ts)

Le chiffrement et la lecture/ecriture de ce fichier sont geres ici :

- [services.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/communaute/desktop-control/services.ts)

## Role du fichier .active-db.json

Ce fichier ne sert pas au blocage desktop.

Il sert a memoriser quelle base SQLite locale est actuellement active.

Il est stocke ici :

- `C:\base-communaute\.active-db.json`

La logique qui le gere se trouve ici :

- [sqliteDB.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/db/sqliteDB.ts)

Son role concret est le suivant :

- quand plusieurs fichiers `.db` existent localement, le backend doit savoir lequel utiliser
- apres une selection ou une detection reussie, le chemin de cette base est ecrit dans `.active-db.json`
- au prochain lancement, le backend relit ce fichier pour rouvrir directement la bonne base

En resume :

- `.active-db.json` = pointeur vers la base SQLite active
- `.desktop-license.secure` = etat chiffre de la licence desktop

## Sequence complete du blocage

### 1. Creation du compte

Quand un utilisateur cree un compte, le backend initialise la licence desktop locale.

Point d'entree principal :

- [services.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/communaute/utlisateur/services.ts)

Fonction concernee :

- `ajouterUtilisateur`

Ce qui se passe :

- la fonction appelle `desktopControlServices.ensureDesktopLicenseInitialized(data.nomUtilisateur)`
- si aucun fichier de licence n'existe encore, le backend cree `.desktop-license.secure`
- la date `createdAt` est definie
- la date `expiresAt` est calculee a `maintenant + 40 jours`

En pratique, c'est a partir de cette initialisation locale que le compteur des `40 jours` demarre.

### 2. Construction de la licence locale

La licence contient notamment :

- `createdAt`
- `expiresAt`
- `manuallyBlocked`
- `blockMessage`
- `superAdminUsers`
- `lastUnlockedAt`
- `lastUnlockedBy`

Cette structure est definie dans :

- [services.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/communaute/desktop-control/services.ts)

Type concerne :

- `DesktopLicenseConfig`

### 3. Verification au login

Quand quelqu'un essaie de se connecter, le backend controle d'abord la logique de blocage desktop.

Fichier :

- [services.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/communaute/utlisateur/services.ts)

Fonction concernee :

- `login`

Ordre reel de verification :

1. le backend regarde si l'utilisateur correspond au superadmin fixe
2. sinon il charge l'etat de licence desktop
3. si la licence est bloquee ou expiree, l'utilisateur normal est refuse
4. si la licence est valide, la connexion continue normalement

### 4. Cas special du superadmin

Le superadmin fixe est teste ici :

- [services.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/communaute/desktop-control/services.ts)

Fonction concernee :

- `isFixedDesktopSuperAdminCredentials`

Ce controle compare :

- `Henri`
- `dihj060195`

Si ces identifiants sont corrects :

- le superadmin peut entrer meme si la licence est expiree
- cela permet de debloquer le desktop depuis l'application

### 5. Comment le backend decide qu'il faut bloquer

Le calcul est fait ici :

- [services.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/communaute/desktop-control/services.ts)

Fonction concernee :

- `getDesktopLicenseStatus`

La logique est :

- on lit la licence locale
- on verifie si `expiresAt` est depassee
- on verifie aussi si `manuallyBlocked` est active
- si l'utilisateur est un superadmin, il n'est pas bloque
- sinon il est bloque si :
  - la licence est expiree
  - ou `manuallyBlocked` vaut `true`

Resultat renvoye au front :

- `isBlocked`
- `isSuperAdmin`
- `expiresAt`
- `manuallyBlocked`
- `blockMessage`
- `daysRemaining`

## Comment le front reagit

### 1. Verification apres connexion

Le front recharge l'etat de securite desktop ici :

- [desktop-security-bootstrap.tsx](D:/Mes_projets/Ma-communaute/communaute-encours/frond/src/components/desktop/desktop-security-bootstrap.tsx)

Ce composant :

- verifie si on est bien dans Electron
- verifie si un utilisateur est connecte
- appelle l'API `communaute/desktop-control/status`
- stocke le resultat dans Redux

### 2. Stockage Redux

L'etat de blocage desktop est stocke dans :

- [appSlice.ts](D:/Mes_projets/Ma-communaute/communaute-encours/frond/src/store/appSlice.ts)

Champs importants :

- `desktopSecurityChecked`
- `desktopSecurityBlocked`
- `desktopSecurityMessage`
- `desktopSecurityExpiresAt`
- `desktopSecurityIsSuperAdmin`

### 3. Redirection automatique

Le routeur principal utilise cet etat ici :

- [sections.tsx](D:/Mes_projets/Ma-communaute/communaute-encours/frond/src/routes/sections.tsx)

Ce qui se passe :

- si on est en desktop
- et connecte
- et que le controle de securite est termine
- et que `desktopSecurityBlocked = true`

alors le front redirige vers :

- `/desktop-locked`

### 4. Ecran de blocage

La page de blocage est :

- [desktop-locked.tsx](D:/Mes_projets/Ma-communaute/communaute-encours/frond/src/pages/desktop-locked.tsx)

Son role :

- afficher le message de blocage
- afficher la date d'expiration courante
- proposer une deconnexion

La deconnexion permet ensuite de se reconnecter avec le compte superadmin.

## Comment le superadmin debloque l'application

Le debloquage se fait depuis la page :

- [settings-view.tsx](D:/Mes_projets/Ma-communaute/communaute-encours/frond/src/sections/settings/view/settings-view.tsx)

La logique est :

1. le superadmin se connecte
2. il ouvre `Parametres`
3. il voit la section `Blocage desktop`
4. il choisit le nombre de jours a ajouter
5. il clique sur `Debloquer le desktop`

Le front appelle alors :

- `apiClient.unlockDesktopAccess(...)`

Cette methode est definie ici :

- [apiClient.ts](D:/Mes_projets/Ma-communaute/communaute-encours/frond/src/utils/apiClient.ts)

et elle appelle l'endpoint backend :

- `POST /communaute/desktop-control/unlock`

## Ce que fait le backend pendant le debloquage

Le endpoint arrive ici :

- [controllers.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/communaute/desktop-control/controllers.ts)

puis ici :

- [routes.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/communaute/desktop-control/routes.ts)

et enfin dans la logique metier ici :

- [services.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/communaute/desktop-control/services.ts)

Fonction concernee :

- `unlockDesktopLicense`

Cette fonction :

- verifie que l'utilisateur est bien superadmin
- remet `manuallyBlocked` a `false`
- recalcule `expiresAt`
- enregistre `lastUnlockedAt`
- enregistre `lastUnlockedBy`
- reecrit le fichier `.desktop-license.secure`

## API backend impliquees

Routes principales :

- `GET /communaute/desktop-control/status`
- `POST /communaute/desktop-control/unlock`
- `GET /communaute/server-info`

Fichiers :

- [routes.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/communaute/desktop-control/routes.ts)
- [controllers.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/communaute/desktop-control/controllers.ts)
- [services.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/communaute/desktop-control/services.ts)

## Resume tres simple

Le comportement global est le suivant :

1. creation du compte
2. creation de la licence locale chiffree
3. expiration fixee a `40 jours`
4. utilisateur normal :
   - acces autorise tant que la licence est valide
   - acces bloque apres expiration
5. superadmin `Henri` :
   - peut toujours se connecter
   - peut debloquer depuis `Parametres`

## Limites actuelles a connaitre

Ce systeme est volontairement simple.

Il faut donc retenir :

- la licence desktop est chiffree localement
- mais la base SQLite elle-meme n'est pas chiffree nativement
- le blocage est local a la machine
- un vrai systeme de licence distante serait plus solide a long terme

## Fichiers a relire en priorite

Si tu veux comprendre le mecanisme sans tout relire, commence par ces fichiers dans cet ordre :

1. [services.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/communaute/desktop-control/services.ts)
2. [services.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/communaute/utlisateur/services.ts)
3. [desktop-security-bootstrap.tsx](D:/Mes_projets/Ma-communaute/communaute-encours/frond/src/components/desktop/desktop-security-bootstrap.tsx)
4. [sections.tsx](D:/Mes_projets/Ma-communaute/communaute-encours/frond/src/routes/sections.tsx)
5. [settings-view.tsx](D:/Mes_projets/Ma-communaute/communaute-encours/frond/src/sections/settings/view/settings-view.tsx)
