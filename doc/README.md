# Documentation — Ma Communauté

Documentation de référence du projet, écrite pour quelqu'un qui découvre le code
et doit pouvoir y travailler seul.

Elle décrit ce que le code **fait aujourd'hui**, pas ce qu'on aimerait qu'il
fasse. Quand une règle existe, elle est écrite avec la raison qui l'a motivée :
c'est la raison qui permet de décider quoi faire dans un cas voisin.

## Par où commencer

| Document | Ce qu'on y trouve |
|---|---|
| [01 — Architecture](01-architecture.md) | Les deux dépôts, Electron, le backend, les modes local et en ligne |
| [02 — Base de données](02-base-de-donnees.md) | Schéma partagé, migrations, matricules |
| [03 — Module Ecodim](03-module-ecodim.md) | Les huit onglets de l'école du dimanche |
| [04 — Membres et accès](04-membres-et-acces.md) | Membres, inscription par QR code, comptes secondaires, permissions |
| [05 — États et exports](05-etats-et-exports.md) | Impression, PDF, Excel, et leurs pièges |
| [06 — Licence desktop](06-licence-desktop.md) | Essai, blocage, déblocage, forfaits |
| [07 — Build et publication](07-build-et-publication.md) | Développer, packager, publier, mettre à jour |
| [08 — Conventions](08-conventions.md) | Les règles de code à respecter |

## Les trois choses à savoir avant de toucher au code

**1. Le vrai backend est le dépôt voisin.** `frond/electron/backend/` n'est
qu'une **copie** régénérée au packaging. Toute modification serveur se fait dans
`../server/src/`, jamais dans `electron/backend/`. Voir
[01 — Architecture](01-architecture.md).

**2. Les valeurs stockées ne sont pas accentuées.** `present`, `deplacement`,
`Planifiee`... L'accent est ajouté à l'affichage par un dictionnaire. Accentuer
une valeur stockée rompt la correspondance avec les lignes déjà saisies. Voir
[08 — Conventions](08-conventions.md).

**3. Les dépôts sont publics.** Aucun mot de passe, aucune clé, aucune donnée
d'église ne doit entrer dans un fichier versionné — documentation comprise.

## Ce qui n'est pas ici

- **L'analyse de sécurité** et le plan de correction : ils citent des fichiers et
  des lignes précises, et n'ont pas leur place dans un dépôt public. Le document
  vit à côté des dépôts, dans `communaute/plan-securite.md`.
- **Le journal de travail** et les conventions de collaboration : dossier
  `.codex/` à la racine de `frond`.
- **Le déploiement du serveur en ligne** : `../server/DEPLOIEMENT.md`.
